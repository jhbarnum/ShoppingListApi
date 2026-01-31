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
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Shopping List</h1>

      <form onSubmit={addItem} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ width: 100, padding: 10 }}
        />
        <button disabled={loading || !name.trim()} style={{ padding: "10px 14px" }}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ opacity: 0.7 }}>Qty: {item.quantity}</div>
            </div>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
