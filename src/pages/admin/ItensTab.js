import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ConfirmAction } from "../../components/ConfirmAction";
import { fmtPrice } from "../../hooks/utils";

export function ItensTab() {
  const {
    items, categories, getSlots,
    deleteConfirm, setDeleteConfirm,
    openNewItem, openEditItem, deleteItem,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState("Todos");
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCatName,   setNewCatName]   = useState("");

  const visibleItems = activeFilter === "Todos"
    ? items
    : items.filter((i) => i.category === activeFilter);

  function confirmNewCategory() {
    const name = newCatName.trim();
    if (!name) return;
    if (categories.includes(name)) {
      showToast(`Categoria "${name}" já existe.`, "err");
      return;
    }
    // Categoria é derivada dos itens — abre formulário de novo item já com a categoria preenchida
    setShowCatInput(false);
    setNewCatName("");
    openNewItem(name);
    showToast(`Adicione um item para criar a categoria "${name}".`, "info");
  }

  function cancelCatInput() {
    setShowCatInput(false);
    setNewCatName("");
  }

  return (
    <>
      <div className="tab-header">
        <h3 className="section-title">Itens da Lista ({items.length})</h3>
        <div className="tab-header-actions">
          {showCatInput ? (
            <>
              <input
                className="input cat-input"
                placeholder="Nome da categoria"
                value={newCatName}
                autoFocus
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")  confirmNewCategory();
                  if (e.key === "Escape") cancelCatInput();
                }}
              />
              <button className="btn-cat-confirm" onClick={confirmNewCategory}>✓</button>
              <button className="btn-cat-cancel"  onClick={cancelCatInput}>✕</button>
            </>
          ) : (
            <button className="btn-cat" onClick={() => setShowCatInput(true)}>+ Categoria</button>
          )}
          <button className="btn-add" onClick={() => openNewItem()}>+ Adicionar Item</button>
        </div>
      </div>

      <div className="filter-row" style={{ marginBottom: 20 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${activeFilter === cat ? " active" : ""}`}
            onClick={() => setActiveFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 && (
        <p className="empty-msg">Nenhum item nesta categoria.</p>
      )}

      <div className="items-grid">
        {visibleItems.map((item) => {
          const resCount = getSlots(item).filter((s) => s.res).length;
          return (
            <div key={item.id} className="item-card">
              <div className="item-thumb">
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : item.emoji || "🎁"}
              </div>
              <div className="item-body">
                <p className="item-name">{item.name}</p>
                <p className="item-meta">{item.category} · R$ {fmtPrice(item.price)}</p>
                <p className="item-meta">Qtd: {item.qty} · Reservados: {resCount}</p>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => openEditItem(item)}>✏️ Editar</button>
                <ConfirmAction
                  id={`i${item.id}`}
                  activeId={deleteConfirm}
                  onConfirm={() => deleteItem(item.id)}
                  onCancel={() => setDeleteConfirm(null)}
                  onRequest={() => setDeleteConfirm(`i${item.id}`)}
                  label="🗑️ Excluir"
                  buttonClass="btn-delete"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
