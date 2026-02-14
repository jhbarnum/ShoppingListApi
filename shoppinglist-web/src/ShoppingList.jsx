import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ShoppingList() {
  const RAW_API_BASE = import.meta.env.VITE_API_BASE || "";
  const API_BASE = RAW_API_BASE && (RAW_API_BASE.includes('<') || RAW_API_BASE.includes('your-api') || RAW_API_BASE.includes('>'))
    ? ''
    : RAW_API_BASE;

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getOwnerId = () => {
    const key = "shoppinglist.ownerId";
    let id = localStorage.getItem(key);
    if (!id) {
      id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
      localStorage.setItem(key, id);
    }
    return id;
  };

  async function loadItems() {
    setError("");
    const owner = getOwnerId();
    const res = await fetch(`${API_BASE}/api/items`, { headers: { "X-User-Id": owner } });
    if (!res.ok) throw new Error("Failed to load items");
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    if (RAW_API_BASE && API_BASE === '') {
      setError('VITE_API_BASE appears to be a placeholder. Set VITE_API_BASE to your API origin (no angle brackets).');
      return;
    }

    loadItems().catch((e) => setError(e.message));
  }, []);

  async function addItem(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const owner = getOwnerId();
      const res = await fetch(`${API_BASE}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": owner },
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
    const owner = getOwnerId();
    const res = await fetch(`${API_BASE}/api/items/${id}`, { method: "DELETE", headers: { "X-User-Id": owner } });
    if (!res.ok) {
      setError("Failed to delete item");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <Link to="/" className="home-link">? Home</Link>
          <h1>Shopping List</h1>
        </div>
        <p className="subtitle">A simple, elegant way to manage your groceries</p>
      </header>

      <form className="add-form" onSubmit={addItem}>
        <input
          className="input input-text"
          id="item_input"
          data-testid="item-input"
          placeholder="Input Item"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="controls-row">
          <input
            className="input input-number"
            id="item_number_input"
            data-testid="item_number_input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <button className="btn primary" id="add_button" data-testid="add_button" disabled={loading || !name.trim()}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className={`item-card ${item.isChecked ? 'checked' : ''}`}>
            <div className="item-info">
              <label className="checkbox-label">
                <input
                  className="checkbox-input"
                  id={`item_${item.name}`}
                  data-testid={`checkbox-${item.name}`}
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={async (e) => {
                    const newVal = e.target.checked;
                    try {
                      setItems((prev) => prev.map(x => x.id === item.id ? {...x, isChecked: newVal} : x));
                      const owner = getOwnerId();
                      const res = await fetch(`${API_BASE}/api/items/${item.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'X-User-Id': owner },
                        body: JSON.stringify({ isChecked: newVal }),
                      });
                      if (!res.ok) throw new Error('Failed to update item');
                    } catch (err) {
                      setItems((prev) => prev.map(x => x.id === item.id ? {...x, isChecked: item.isChecked} : x));
                      setError(err.message || 'Update failed');
                    }
                  }}
                />
                <span className="checkbox-ui" aria-hidden="true" />
                <div>
                  <div className="item-name" data-testid={`name-${item.name}`}>{item.name}</div>
                  <div className="item-qty" data-testid={`item_count-${item.name}`}>Qty: {item.quantity}</div>
                </div>
              </label>
            </div>
            <div className="item-actions">
              <button className="btn danger" data-testid={`delete-${item.name}`} onClick={() => deleteItem(item.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
