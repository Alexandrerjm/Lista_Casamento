import { useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { Field } from "../../components/Field";
import { supabase } from "../../hooks/supabase";

// Limite de 5MB — Storage suporta bem, sem overhead de base64
const MAX_IMAGE_MB = 5;

export function ItemFormModal() {
  const { items, showForm, setShowForm, editItem, setEditItem, saveItem, showToast } = useApp();

  const imgRef        = useRef();
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_MB) {
      showToast(`Imagem muito grande (${sizeMB.toFixed(1)}MB). Limite: ${MAX_IMAGE_MB}MB.`, "err");
      e.target.value = "";
      return;
    }

    setUploading(true);

    // Nome único para evitar colisões: timestamp + nome original
    const ext      = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagens")
      .upload(fileName, file, { upsert: false });

    if (error) {
      showToast(`Erro no upload: ${error.message}`, "err");
      setUploading(false);
      e.target.value = "";
      return;
    }

    // Gera URL pública permanente
    const { data } = supabase.storage.from("imagens").getPublicUrl(fileName);
    setEditItem((prev) => ({ ...prev, imageUrl: data.publicUrl }));
    setUploading(false);
  }

  async function handleRemoveImage() {
    // Remove do Storage se for uma URL do Supabase
    if (editItem.imageUrl?.includes("supabase")) {
      const fileName = editItem.imageUrl.split("/").pop();
      await supabase.storage.from("imagens").remove([fileName]);
    }
    setEditItem((prev) => ({ ...prev, imageUrl: "" }));
  }

  if (!showForm || !editItem) return null;

  const isEditing = items.some((i) => i.id === editItem.id);

  return (
    <div className="overlay">
      <div className="modal modal-wide">
        <div className="modal-header admin">
          <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>
            {editItem.imageUrl ? "🖼️" : (editItem.emoji || "🎁")}
          </span>
          <h2 className="modal-title">{isEditing ? "Editar Item" : "Novo Item"}</h2>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <Field label="Nome do Item *">
              <input className="input" value={editItem.name} placeholder="Ex: Jogo de Panelas"
                onChange={(e) => setEditItem((prev) => ({ ...prev, name: e.target.value }))} />
            </Field>
            <Field label="Categoria">
              <input className="input" value={editItem.category} placeholder="Ex: Cozinha"
                onChange={(e) => setEditItem((prev) => ({ ...prev, category: e.target.value }))} />
            </Field>
          </div>

          <div className="form-row">
            <Field label="Preço (R$)">
              <input className="input" value={editItem.price} placeholder="0,00"
                onChange={(e) => setEditItem((prev) => ({ ...prev, price: e.target.value }))} />
            </Field>
            <Field label="Quantidade">
              <input className="input" type="number" min="1" value={editItem.qty}
                onChange={(e) => setEditItem((prev) => ({ ...prev, qty: parseInt(e.target.value) || 1 }))} />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              className="input textarea"
              rows={3}
              placeholder="Breve descrição do item"
              value={editItem.description}
              onChange={(e) => setEditItem((prev) => ({ ...prev, description: e.target.value }))}
            />
          </Field>

          <Field label="Link (opcional)">
            <input className="input" value={editItem.link ?? ""} placeholder="https://..."
              onChange={(e) => setEditItem((prev) => ({ ...prev, link: e.target.value }))} />
          </Field>

          <div className="form-row">
            <Field label="Emoji (sem foto)">
              <input className="input" value={editItem.emoji} placeholder="🎁" maxLength={2}
                onChange={(e) => setEditItem((prev) => ({ ...prev, emoji: e.target.value }))} />
            </Field>
            <Field label="Imagem do Item">
              <div className="img-upload-row">
                <button
                  className="btn-edit"
                  style={{ flex: 1 }}
                  disabled={uploading}
                  onClick={() => imgRef.current?.click()}>
                  {uploading ? "⏳ Enviando..." : "📷 Enviar Foto"}
                </button>
                {editItem.imageUrl && (
                  <>
                    <img src={editItem.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                    <button className="btn-delete" onClick={handleRemoveImage}>✕</button>
                  </>
                )}
              </div>
              <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </Field>
          </div>

          {editItem.imageUrl && (
            <div className="img-preview">
              <img src={editItem.imageUrl} alt="preview" />
              <p>Pré-visualização da imagem</p>
            </div>
          )}

          <div className="modal-buttons">
            <button className="btn-cancel"  onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-confirm" onClick={saveItem} disabled={uploading}>
              {uploading ? "Aguarde..." : "Salvar Item ✅"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
