import { useEffect, useState } from "react";

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadItems() {
    setError("");
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to load items");
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    loadItems().catch((e) => setError(e.message));
  }, []);

  async function addItem(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity: Number(quantity), isChecked: false }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to add item");
      }

      setName("");
      setQuantity(1);
      await loadItems();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    setError("");
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete item");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Shopping List</h1>
        <p className="subtitle">A simple, elegant way to manage your groceries</p>
      </header>

      <form className="add-form" onSubmit={addItem}>
        <input
          className="input input-text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input input-number"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button className="btn primary" disabled={loading || !name.trim()}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item-card">
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-qty">Qty: {item.quantity}</div>
            </div>
            <div className="item-actions">
              <button className="btn danger" onClick={() => deleteItem(item.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
