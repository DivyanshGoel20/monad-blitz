export const pizzaAbi = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "toppingTxnHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "sauceTxnHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "cheeseTxnHash",
				"type": "bytes32"
			}
		],
		"name": "buildOrder",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BuildSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "toppingTxnHashes",
				"type": "bytes32[]"
			},
			{
				"internalType": "uint256[]",
				"name": "toppingFees",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "sauceTxnHashes",
				"type": "bytes32[]"
			},
			{
				"internalType": "uint256[]",
				"name": "sauceFees",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "cheeseTxnHashes",
				"type": "bytes32[]"
			},
			{
				"internalType": "uint256[]",
				"name": "cheeseFees",
				"type": "uint256[]"
			}
		],
		"name": "createCustomerOrder",
		"outputs": [
			{
				"components": [
					{
						"internalType": "enum MonadPizzeria.Topping",
						"name": "topping",
						"type": "uint8"
					},
					{
						"internalType": "enum MonadPizzeria.Sauce",
						"name": "sauce",
						"type": "uint8"
					},
					{
						"internalType": "enum MonadPizzeria.Cheese",
						"name": "cheese",
						"type": "uint8"
					}
				],
				"internalType": "struct MonadPizzeria.PizzaOrder",
				"name": "order",
				"type": "tuple"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "finalizeRound",
		"outputs": [
			{
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timeTaken",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winnerTotalFee",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timeTaken",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "winnerTotalFee",
				"type": "uint256"
			}
		],
		"name": "RoundFinalized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum MonadPizzeria.Topping",
				"name": "topping",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "enum MonadPizzeria.Sauce",
				"name": "sauce",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "enum MonadPizzeria.Cheese",
				"name": "cheese",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "roundFee",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			}
		],
		"name": "RoundStarted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundCheeseFees",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundCheeseHashes",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundCheeses",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Cheese",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentRoundFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentRoundId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentRoundOrder",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Topping",
				"name": "topping",
				"type": "uint8"
			},
			{
				"internalType": "enum MonadPizzeria.Sauce",
				"name": "sauce",
				"type": "uint8"
			},
			{
				"internalType": "enum MonadPizzeria.Cheese",
				"name": "cheese",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundSauceFees",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundSauceHashes",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundSauces",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Sauce",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundToppingFees",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundToppingHashes",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentRoundToppings",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Topping",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "feeCreditedRound",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRoundOptionLengths",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "toppingLen",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sauceLen",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "cheeseLen",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "txnHash",
				"type": "bytes32"
			}
		],
		"name": "hashToCheese",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Cheese",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "txnHash",
				"type": "bytes32"
			}
		],
		"name": "hashToSauce",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Sauce",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "txnHash",
				"type": "bytes32"
			}
		],
		"name": "hashToTopping",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Topping",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastBuildTimestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastFinalizedRoundId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastWinner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastWinnerTimeTaken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastWinnerTotalFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "playerBuildFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "playerBuildRound",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "playerBuilds",
		"outputs": [
			{
				"internalType": "enum MonadPizzeria.Topping",
				"name": "topping",
				"type": "uint8"
			},
			{
				"internalType": "enum MonadPizzeria.Sauce",
				"name": "sauce",
				"type": "uint8"
			},
			{
				"internalType": "enum MonadPizzeria.Cheese",
				"name": "cheese",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "roundDeadline",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "roundStartTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "submitters",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "totalFeeAccrued",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]