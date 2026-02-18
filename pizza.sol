// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MonadPizzeria {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    enum Topping {
        Pepperoni,
        Mushrooms,
        Onions,
        Sausage,
        Bacon,
        Olives,
        Peppers,
        Pineapple
    }

    enum Sauce {
        Tomato,
        Alfredo,
        Pesto,
        BBQ,
        Buffalo,
        Garlic,
        White,
        Marinara
    }

    enum Cheese {
        Mozzarella,
        Cheddar,
        Parmesan,
        Ricotta
    }

    // Struct to represent a complete pizza order
    struct PizzaOrder {
        Topping topping;
        Sauce sauce;
        Cheese cheese;
    }

    // Current round: single order everyone builds against
    PizzaOrder public currentRoundOrder;
    uint256 public roundStartTime;
    uint256 public roundDeadline;   // timestamp after which buildOrder is closed
    uint256 public currentRoundId;  // incremented each time owner starts a new round
    uint256 public currentRoundFee;

    // Current round: options and fees by index; hashes so buildOrder can submit by txn hash
    Topping[] public currentRoundToppings;
    uint256[] public currentRoundToppingFees;
    bytes32[] public currentRoundToppingHashes;
    Sauce[] public currentRoundSauces;
    uint256[] public currentRoundSauceFees;
    bytes32[] public currentRoundSauceHashes;
    Cheese[] public currentRoundCheeses;
    uint256[] public currentRoundCheeseFees;
    bytes32[] public currentRoundCheeseHashes;

    // Per-player
    mapping(address => PizzaOrder) public playerBuilds;
    mapping(address => uint256) public playerBuildRound;
    mapping(address => uint256) public playerBuildFee;
    mapping(address => uint256) public lastBuildTimestamp;

    // Score tracking
    mapping(address => uint256) public totalFeeAccrued;     // only increases when build is verified correct
    mapping(address => uint256) public feeCreditedRound;    // prevents double-crediting in same round

    // Addresses that submitted this round (so owner can call verifyOrder on each)
    address[] public submitters;

    // Last finalized round winner info
    uint256 public lastFinalizedRoundId;
    address public lastWinner;
    uint256 public lastWinnerTimeTaken; // seconds from roundStartTime to lastBuildTimestamp
    uint256 public lastWinnerTotalFee;

    event RoundStarted(
        uint256 indexed roundId,
        Topping topping,
        Sauce sauce,
        Cheese cheese,
        uint256 roundFee,
        uint256 startTime,
        uint256 deadline
    );

    event BuildSubmitted(address indexed player, uint256 indexed roundId, uint256 timestamp);
    event RoundFinalized(uint256 indexed roundId, address indexed winner, uint256 timeTaken, uint256 winnerTotalFee);

    /**
     * @dev Generates a pseudo-random number based on block data and sender
     * @param seed Additional seed value for randomness
     * @param max Maximum value (exclusive)
     * @return Random number between 0 and max-1
     */
    function _random(uint256 seed, uint256 max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, seed))) % max;
    }

    function _hashToTopping(bytes32 txnHash) private pure returns (Topping) {
        return Topping(uint256(txnHash) % (uint256(type(Topping).max) + 1));
    }

    function _hashToSauce(bytes32 txnHash) private pure returns (Sauce) {
        return Sauce(uint256(txnHash) % (uint256(type(Sauce).max) + 1));
    }

    function _hashToCheese(bytes32 txnHash) private pure returns (Cheese) {
        return Cheese(uint256(txnHash) % (uint256(type(Cheese).max) + 1));
    }

    /** Public view helpers for frontend legend: txn hash → ingredient enum index */
    function hashToTopping(bytes32 txnHash) public pure returns (Topping) {
        return _hashToTopping(txnHash);
    }

    function hashToSauce(bytes32 txnHash) public pure returns (Sauce) {
        return _hashToSauce(txnHash);
    }

    function hashToCheese(bytes32 txnHash) public pure returns (Cheese) {
        return _hashToCheese(txnHash);
    }

    function getRoundOptionLengths() public view returns (uint256 toppingLen, uint256 sauceLen, uint256 cheeseLen) {
        return (currentRoundToppingHashes.length, currentRoundSauceHashes.length, currentRoundCheeseHashes.length);
    }

    // Correct if the submitter chose the same ingredients as the round (any index for that ingredient is fine)
    // Fee credited is based on which indices they chose (higher-fee option = more money, better tie-break)
    function _isCorrect(address player) private view returns (bool) {
        if (playerBuildRound[player] != currentRoundId) return false;
        PizzaOrder memory order = currentRoundOrder;
        PizzaOrder memory build = playerBuilds[player];
        return (
            order.topping == build.topping &&
            order.sauce == build.sauce &&
            order.cheese == build.cheese
        );
    }

    function _replaceRoundToppingsFromHashes(bytes32[] memory txnHashes, uint256[] memory fees) private {
        require(txnHashes.length == fees.length, "Topping hashes and fees length mismatch");
        while (currentRoundToppings.length > 0) currentRoundToppings.pop();
        while (currentRoundToppingFees.length > 0) currentRoundToppingFees.pop();
        while (currentRoundToppingHashes.length > 0) currentRoundToppingHashes.pop();
        for (uint256 i = 0; i < txnHashes.length; i++) {
            currentRoundToppings.push(_hashToTopping(txnHashes[i]));
            currentRoundToppingFees.push(fees[i]);
            currentRoundToppingHashes.push(txnHashes[i]);
        }
    }

    function _replaceRoundSaucesFromHashes(bytes32[] memory txnHashes, uint256[] memory fees) private {
        require(txnHashes.length == fees.length, "Sauce hashes and fees length mismatch");
        while (currentRoundSauces.length > 0) currentRoundSauces.pop();
        while (currentRoundSauceFees.length > 0) currentRoundSauceFees.pop();
        while (currentRoundSauceHashes.length > 0) currentRoundSauceHashes.pop();
        for (uint256 i = 0; i < txnHashes.length; i++) {
            currentRoundSauces.push(_hashToSauce(txnHashes[i]));
            currentRoundSauceFees.push(fees[i]);
            currentRoundSauceHashes.push(txnHashes[i]);
        }
    }

    function _replaceRoundCheesesFromHashes(bytes32[] memory txnHashes, uint256[] memory fees) private {
        require(txnHashes.length == fees.length, "Cheese hashes and fees length mismatch");
        while (currentRoundCheeses.length > 0) currentRoundCheeses.pop();
        while (currentRoundCheeseFees.length > 0) currentRoundCheeseFees.pop();
        while (currentRoundCheeseHashes.length > 0) currentRoundCheeseHashes.pop();
        for (uint256 i = 0; i < txnHashes.length; i++) {
            currentRoundCheeses.push(_hashToCheese(txnHashes[i]));
            currentRoundCheeseFees.push(fees[i]);
            currentRoundCheeseHashes.push(txnHashes[i]);
        }
    }

    function _indexOf(bytes32[] storage arr, bytes32 h) private view returns (uint256 index) {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == h) return i;
        }
        revert("Hash not in round options");
    }

    /**
     * @dev Starts a new round: creates a random customer order everyone must build.
     *      Owner passes txn hashes and fees; each hash is converted to a Topping/Sauce/Cheese via modulo.
     *      Players have 30 seconds to submit via buildOrder.
     * @param toppingTxnHashes Transaction hashes (converted to Topping enum)
     * @param toppingFees Fee for each hash at same index
     * @param sauceTxnHashes Transaction hashes (converted to Sauce enum)
     * @param sauceFees Fee for each hash at same index
     * @param cheeseTxnHashes Transaction hashes (converted to Cheese enum)
     * @param cheeseFees Fee for each hash at same index
     * @return order The randomly generated pizza order for this round
     */
    function createCustomerOrder(
        bytes32[] memory toppingTxnHashes,
        uint256[] memory toppingFees,
        bytes32[] memory sauceTxnHashes,
        uint256[] memory sauceFees,
        bytes32[] memory cheeseTxnHashes,
        uint256[] memory cheeseFees
    ) public onlyOwner returns (PizzaOrder memory order) {
        require(toppingTxnHashes.length > 0, "Must provide at least one topping txn hash");
        require(sauceTxnHashes.length > 0, "Must provide at least one sauce txn hash");
        require(cheeseTxnHashes.length > 0, "Must provide at least one cheese txn hash");

        _replaceRoundToppingsFromHashes(toppingTxnHashes, toppingFees);
        _replaceRoundSaucesFromHashes(sauceTxnHashes, sauceFees);
        _replaceRoundCheesesFromHashes(cheeseTxnHashes, cheeseFees);

        uint256 toppingIndex = _random(0, toppingTxnHashes.length);
        uint256 sauceIndex = _random(10, sauceTxnHashes.length);
        uint256 cheeseIndex = _random(20, cheeseTxnHashes.length);

        PizzaOrder memory newOrder;
        newOrder.topping = currentRoundToppings[toppingIndex];
        newOrder.sauce = currentRoundSauces[sauceIndex];
        newOrder.cheese = currentRoundCheeses[cheeseIndex];

        currentRoundOrder = newOrder;
        currentRoundId++;
        roundStartTime = block.timestamp;
        roundDeadline = block.timestamp + 30;
        currentRoundFee = currentRoundToppingFees[toppingIndex] + currentRoundSauceFees[sauceIndex] + currentRoundCheeseFees[cheeseIndex];
        
        // Clear submitters from previous round
        while (submitters.length > 0) {
            submitters.pop();
        }
        
        emit RoundStarted(
            currentRoundId,
            newOrder.topping,
            newOrder.sauce,
            newOrder.cheese,
            currentRoundFee,
            roundStartTime,
            roundDeadline
        );

        return newOrder;
    }

    /**
     * @dev Players call this to submit their pizza build for the current round.
     *      Any address can call buildOrder (not restricted to owner). Submit txn hashes that match the round's options.
     *      Each hash must be one of the round's option hashes (from createCustomerOrder); fee credited on correctness.
     *      Only accepted within 30 seconds of createCustomerOrder.
     * @param toppingTxnHash Txn hash for topping (must be in this round's topping hashes)
     * @param sauceTxnHash Txn hash for sauce
     * @param cheeseTxnHash Txn hash for cheese
     */
    function buildOrder(
        bytes32 toppingTxnHash,
        bytes32 sauceTxnHash,
        bytes32 cheeseTxnHash
    ) public {
        require(currentRoundId > 0, "No round started");
        require(block.timestamp <= roundDeadline, "Submission period has ended");

        uint256 toppingIndex = _indexOf(currentRoundToppingHashes, toppingTxnHash);
        uint256 sauceIndex = _indexOf(currentRoundSauceHashes, sauceTxnHash);
        uint256 cheeseIndex = _indexOf(currentRoundCheeseHashes, cheeseTxnHash);

        PizzaOrder memory build;
        build.topping = currentRoundToppings[toppingIndex];
        build.sauce = currentRoundSauces[sauceIndex];
        build.cheese = currentRoundCheeses[cheeseIndex];

        uint256 buildFee = currentRoundToppingFees[toppingIndex]
            + currentRoundSauceFees[sauceIndex]
            + currentRoundCheeseFees[cheeseIndex];
        
        if (playerBuildRound[msg.sender] != currentRoundId) {
            submitters.push(msg.sender);
        }
        playerBuildRound[msg.sender] = currentRoundId;
        playerBuilds[msg.sender] = build;
        playerBuildFee[msg.sender] = buildFee;
        lastBuildTimestamp[msg.sender] = block.timestamp;

        emit BuildSubmitted(msg.sender, currentRoundId, block.timestamp);
    }

    /**
     * @dev Finalize the round and pick a winner among correct submissions.
     *      Winner selection: highest totalFeeAccrued, tie-breaker: lowest time taken.
     */
    function finalizeRound() external onlyOwner returns (address winner, uint256 timeTaken, uint256 winnerTotalFee) {
        require(currentRoundId > 0, "No round started");
        require(block.timestamp > roundDeadline, "Round still active");
        require(lastFinalizedRoundId != currentRoundId, "Round already finalized");

        address bestWinner = address(0);
        uint256 bestTime = type(uint256).max;
        uint256 bestFee = 0;

        for (uint256 i = 0; i < submitters.length; i++) {
            address player = submitters[i];
            if (!_isCorrect(player)) continue;

            // Ensure fee is credited for correct builds (uses fee from player's chosen indices)
            if (feeCreditedRound[player] != currentRoundId) {
                totalFeeAccrued[player] += playerBuildFee[player];
                feeCreditedRound[player] = currentRoundId;
            }

            uint256 t = lastBuildTimestamp[player] - roundStartTime;
            uint256 f = totalFeeAccrued[player];

            if (f > bestFee || (f == bestFee && t < bestTime)) {
                bestWinner = player;
                bestTime = t;
                bestFee = f;
            }
        }

        lastFinalizedRoundId = currentRoundId;
        lastWinner = bestWinner;
        lastWinnerTimeTaken = bestTime == type(uint256).max ? 0 : bestTime;
        lastWinnerTotalFee = bestFee;

        emit RoundFinalized(currentRoundId, bestWinner, lastWinnerTimeTaken, bestFee);

        return (bestWinner, lastWinnerTimeTaken, bestFee);
    }
}