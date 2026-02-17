import { useEffect, useState } from 'react'

function App() {
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : prev))
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

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
          <div className="ingredients-grid">
            <button className="ingredient-card" data-ingredient="tomato" type="button">
              <span className="ingredient-icon">🍅</span>
              <span className="ingredient-label">Tomato Sauce</span>
            </button>
            <button className="ingredient-card" data-ingredient="cheese" type="button">
              <span className="ingredient-icon">🧀</span>
              <span className="ingredient-label">Cheese</span>
            </button>
            <button className="ingredient-card" data-ingredient="pepperoni" type="button">
              <span className="ingredient-icon">🍖</span>
              <span className="ingredient-label">Pepperoni</span>
            </button>
            <button className="ingredient-card" data-ingredient="mushroom" type="button">
              <span className="ingredient-icon">🍄</span>
              <span className="ingredient-label">Mushroom</span>
            </button>
            <button className="ingredient-card" data-ingredient="olive" type="button">
              <span className="ingredient-icon">🫒</span>
              <span className="ingredient-label">Olives</span>
            </button>
            <button className="ingredient-card" data-ingredient="basil" type="button">
              <span className="ingredient-icon">🌿</span>
              <span className="ingredient-label">Basil</span>
            </button>
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
                <div className="pizza-highlight" />
              </div>
            </div>
          </div>
          <div className="play-actions">
            <button className="btn btn-secondary" type="button">
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

      <footer className="game-footer">
        <span className="footer-pill">Scene only – logic to come.</span>
      </footer>
    </div>
  )
}

export default App
