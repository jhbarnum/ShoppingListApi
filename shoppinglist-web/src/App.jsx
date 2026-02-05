import { useEffect, useState } from "react";

export default function App() {
  // Use Vite env `VITE_API_BASE` to allow a configurable API origin.
  // Default to a relative path (empty string) so the app works when
  // served from the same origin (production/Azure). Only use a
  // non-empty `VITE_API_BASE` when explicitly provided (e.g. during
  // local development if you run the API on a different port).
  const RAW_API_BASE = import.meta.env.VITE_API_BASE || "";
  // guard against the placeholder value like "https://<your-api>.azurewebsites.net"
  const API_BASE = RAW_API_BASE && (RAW_API_BASE.includes('<') || RAW_API_BASE.includes('your-api') || RAW_API_BASE.includes('>'))
    ? ''
    : RAW_API_BASE;
  
  // Helper to build a safe URL for API calls. This avoids duplicate-hostname
  // issues when deployment env vars contain an accidental full domain in the
  // path. If API_BASE is empty we return a relative path.
  function buildApiUrl(path) {
    // ensure path starts with '/'
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!API_BASE) return cleanPath;

    try {
      // If API_BASE is absolute, parse it. Otherwise treat it as a path under current origin.
      const baseCandidate = API_BASE.startsWith('http') ? API_BASE : window.location.origin + (API_BASE.startsWith('/') ? API_BASE : `/${API_BASE}`);
      const parsed = new URL(baseCandidate);

      // Remove accidental occurrences of the hostname embedded in the pathname
      const cleanedPathname = parsed.pathname.replace(new RegExp(parsed.hostname, 'g'), '').replace(/\/+/g, '/');
      const cleanedBase = parsed.origin + (cleanedPathname === '/' ? '' : cleanedPathname.replace(/\/$/, ''));

      return new URL(cleanPath.replace(/^\/+/, ''), cleanedBase + '/').toString();
    } catch (e) {
      // Fall back to simple concatenation
      return (API_BASE.replace(/\/+$/, '') || '') + cleanPath;
    }
  }
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Persist a client-side owner id so the backend receives X-User-Id on requests
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
        <h1>Shopping List</h1>
        <p className="subtitle">A simple, elegant way to manage your groceries</p>
      </header>

      <form className="add-form" onSubmit={addItem}>
        <input
          className="input input-text"
          placeholder="Input Item"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="controls-row">
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
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={async (e) => {
                    const newVal = e.target.checked;
                    try {
                      // optimistic UI
                      setItems((prev) => prev.map(x => x.id === item.id ? {...x, isChecked: newVal} : x));
                      const owner = getOwnerId();
                      const res = await fetch(`${API_BASE}/api/items/${item.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'X-User-Id': owner },
                        body: JSON.stringify({ isChecked: newVal }),
                      });
                      if (!res.ok) throw new Error('Failed to update item');
                    } catch (err) {
                      // revert on error
                      setItems((prev) => prev.map(x => x.id === item.id ? {...x, isChecked: item.isChecked} : x));
                      setError(err.message || 'Update failed');
                    }
                  }}
                />
                <span className="checkbox-ui" aria-hidden="true" />
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-qty">Qty: {item.quantity}</div>
                </div>
              </label>
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
