import { useEffect, useMemo, useState } from 'react'

const INGREDIENT_GROUPS = [
  {
    title: 'Sauces',
    type: 'sauce',
    items: [
      { id: 'tomato-sauce', label: 'Tomato Sauce', icon: '🍅' },
      { id: 'marinara', label: 'Marinara', icon: '🥫' },
      { id: 'bbq-sauce', label: 'BBQ Sauce', icon: '🍖' },
      { id: 'chimichurri', label: 'Chimichurri', icon: '🌿' },
    ],
  },
  {
    title: 'Cheese',
    type: 'cheese',
    items: [
      { id: 'mozzarella', label: 'Mozzarella', icon: '🧀' },
      { id: 'cheddar', label: 'Cheddar', icon: '🧀' },
      { id: 'parmesan', label: 'Parmesan', icon: '🧀' },
      { id: 'ricotta', label: 'Ricotta', icon: '🧀' },
    ],
  },
  {
    title: 'Proteins',
    type: 'protein',
    items: [
      { id: 'chicken', label: 'Chicken', icon: '🍗' },
      { id: 'bacon', label: 'Bacon', icon: '🥓' },
      { id: 'ham', label: 'Ham', icon: '🍖' },
      { id: 'shrimp', label: 'Shrimp', icon: '🍤' },
    ],
  },
  {
    title: 'Vegetables',
    type: 'vegetable',
    items: [
      { id: 'mushrooms', label: 'Mushrooms', icon: '🍄' },
      { id: 'onions', label: 'Onions', icon: '🧅' },
      { id: 'tomatoes', label: 'Tomatoes', icon: '🍅' },
      { id: 'olives', label: 'Olives', icon: '🫒' },
    ],
  },
]

const ALL_INGREDIENTS = INGREDIENT_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, type: group.type })),
)

const SAUCE_GRADIENTS = {
  'tomato-sauce':
    'radial-gradient(circle at 30% 0, rgba(248, 113, 113, 0.95) 0, rgba(220, 38, 38, 0.9) 35%, rgba(127, 29, 29, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  marinara:
    'radial-gradient(circle at 30% 0, rgba(248, 150, 108, 0.95) 0, rgba(185, 60, 39, 0.9) 35%, rgba(120, 35, 20, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  'bbq-sauce':
    'radial-gradient(circle at 30% 0, rgba(248, 171, 120, 0.95) 0, rgba(180, 83, 9, 0.9) 35%, rgba(124, 45, 18, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  chimichurri:
    'radial-gradient(circle at 30% 0, rgba(190, 242, 100, 0.95) 0, rgba(101, 163, 13, 0.9) 35%, rgba(54, 83, 20, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
}

const TOPPING_POSITIONS = [
  { top: '22%', left: '32%' },
  { top: '28%', left: '60%' },
  { top: '50%', left: '28%' },
  { top: '48%', left: '60%' },
  { top: '36%', left: '44%' },
  { top: '60%', left: '46%' },
  { top: '40%', left: '20%' },
  { top: '64%', left: '32%' },
]

function App() {
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : prev))
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  const { selectedSauceId, selectedToppings } = useMemo(() => {
    const selected = ALL_INGREDIENTS.filter((item) => selectedIds.includes(item.id))
    const sauces = selected.filter((item) => item.type === 'sauce')
    const others = selected.filter((item) => item.type !== 'sauce')

    return {
      selectedSauceId: sauces[0]?.id,
      selectedToppings: others,
    }
  }, [selectedIds])

  const toggleIngredient = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    )
  }

  const handleResetPizza = () => {
    setSelectedIds([])
    setTimeLeft(30)
  }

  return (
    <div className="game-shell">
      <header className="game-header">
        <h1 className="game-title">Monad Pizza Forge</h1>
        <p className="game-subtitle">Build the perfect pizza from on-chain ingredients.</p>
      </header>

      <main className="game-stage">
        <div className="oven-backdrop">
          <div className="oven-arch">
            <div className="oven-inner-glow" />
          </div>
          <div className="oven-shelf" />
        </div>

        <section className="panel panel-ingredients">
          <h2 className="panel-title">Ingredients</h2>
          <div className="ingredients-section">
            {INGREDIENT_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="ingredients-group-title">{group.title}</h3>
                <div className="ingredients-group-grid">
                  {group.items.map((item) => {
                    const isSelected = selectedIds.includes(item.id)

                    return (
                      <button
                        key={item.id}
                        className={`ingredient-card${
                          isSelected ? ' ingredient-card--active' : ''
                        }`}
                        data-ingredient={item.id}
                        type="button"
                        onClick={() => toggleIngredient(item.id)}
                      >
                        <span className="ingredient-icon">{item.icon}</span>
                        <span className="ingredient-label">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel-play-area">
          <div className="play-top-row">
            <div className="timer-chip">
              <span className="timer-label">Time</span>
              <span className="timer-value">
                {mm}:{ss}
              </span>
            </div>
          </div>
          <div className="pizza-station">
            <div className="pizza-board-shadow" />
            <div className="pizza-board">
              <div className="pizza-dough">
                <div className="pizza-base" />
                {selectedSauceId && (
                  <div
                    className="pizza-sauce"
                    style={{
                      background:
                        SAUCE_GRADIENTS[selectedSauceId] ?? SAUCE_GRADIENTS['tomato-sauce'],
                    }}
                  />
                )}
                <div className="pizza-highlight" />
                <div className="pizza-toppings">
                  {selectedToppings.map((item, index) => {
                    const position = TOPPING_POSITIONS[index % TOPPING_POSITIONS.length]
                    return (
                      <div
                        key={item.id}
                        className="pizza-topping"
                        style={position}
                        aria-hidden="true"
                      >
                        <span>{item.icon}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="play-actions">
            <button className="btn btn-secondary" type="button" onClick={handleResetPizza}>
              Reset Pizza
            </button>
            <button className="btn btn-primary" type="button">
              Send to Oven
            </button>
          </div>
        </section>

        <section className="panel panel-orders">
          <h2 className="panel-title">Order Ticket</h2>
          <div className="order-card">
            <div className="order-header">
              <span className="order-label">Block Order</span>
              <span className="order-id">#123456</span>
            </div>
            <ul className="order-list">
              <li className="order-item">
                <span className="order-badge">1</span>
                <span className="order-text">Tomato Sauce</span>
              </li>
              <li className="order-item">
                <span className="order-badge">2</span>
                <span className="order-text">Cheese</span>
              </li>
              <li className="order-item">
                <span className="order-badge">3</span>
                <span className="order-text">Pepperoni</span>
              </li>
              <li className="order-item">
                <span className="order-badge">4</span>
                <span className="order-text">Basil</span>
              </li>
            </ul>
            <p className="order-note">Later, these will come from Monad block transactions.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
