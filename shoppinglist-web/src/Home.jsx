import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome</h1>
        <p className="subtitle">Organize your shopping with ease</p>
      </header>

      <div className="home-content">
        <div className="home-card">
          <h2>Shopping Lists</h2>
          <p>Create and manage your personal shopping lists.</p>
          <Link to="/shopping-lists" className="btn primary home-btn">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
