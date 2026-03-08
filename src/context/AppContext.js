import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../hooks/supabase";
import { DEFAULT_SETTINGS } from "../hooks/defaults";
// uid não é mais necessário — IDs são gerados pelo banco

// ─── Mapeamento banco → app ───────────────────────────────────────────────────
function dbItemToApp(row) {
  return {
    id:          row.id,
    name:        row.nome,
    category:    row.category   || "",
    price:       parseFloat(row.valor) || 0,
    qty:         row.qty        || 1,
    emoji:       row.emoji      || "🎁",
    imageUrl:    row.imagem_url || "",
    description: row.descricao  || "",
  };
}

function dbSettingsToApp(row) {
  return {
    groomName:   row.groom_name   || DEFAULT_SETTINGS.groomName,
    brideName:   row.bride_name   || DEFAULT_SETTINGS.brideName,
    weddingDate: row.wedding_date || DEFAULT_SETTINGS.weddingDate,
  };
}

function dbReservationsToMap(rows) {
  return Object.fromEntries((rows || []).map((r) => [r.key, {
    name:    r.name,
    email:   r.email,
    phone:   r.phone,
    message: r.message || "",
    date:    r.date    || "",
  }]));
}

const AppContext = createContext(null);

export function AppProvider({ children }) {

  const [page,         setPage]         = useState("splash");
  const [items,        setItems]        = useState([]);
  const [reservations, setReservations] = useState({});
  const [settings,     setSettings]     = useState(DEFAULT_SETTINGS);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [toast,        setToast]        = useState(null);

  const [guestEmail,    setGuestEmail]    = useState("");
  const [currentGuest,  setCurrentGuest]  = useState(null);
  const [filterCat,     setFilterCat]     = useState("Todos");
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const [reserveItem,  setReserveItem]  = useState(null);
  const [reserveName,  setReserveName]  = useState("");
  const [reservePhone, setReservePhone] = useState("");
  const [reserveMsg,   setReserveMsg]   = useState("");
  const [reserveError, setReserveError] = useState("");

  // ── Admin: agora usa email + senha do Supabase Auth ───────────────────────────
  const [adminEmail,    setAdminEmail]    = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError,    setAdminError]    = useState("");
  const [isAdmin,       setIsAdmin]       = useState(false);
  const [adminTab,      setAdminTab]      = useState("reservas");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const lastGuestInfo = useRef({ name: "", phone: "" });

  const [editItem,     setEditItem]     = useState(null);
  const [showForm,     setShowForm]     = useState(false);
  const [settingsForm, setSettingsForm] = useState(null);

  // ── Boot + tempo real ─────────────────────────────────────────────────────────
  useEffect(() => {
    boot();
    const channel = supabase
      .channel("lista-casamento")
      .on("postgres_changes", { event: "*", schema: "public", table: "itens" }, () => {
        supabase.from("itens").select("*").order("id")
          .then(({ data }) => data && setItems(data.map(dbItemToApp)));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        supabase.from("reservations").select("*")
          .then(({ data }) => data && setReservations(dbReservationsToMap(data)));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => {
        supabase.from("settings").select("*").eq("id", 1).single()
          .then(({ data }) => { if (data) { const s = dbSettingsToApp(data); setSettings(s); setSettingsForm(s); } });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function boot() {
    try {
      // Restaura sessão Supabase Auth se existir (admin recarregou a página)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAdmin(true);

      const [
        { data: itemRows,    error: e1 },
        { data: resRows,     error: e2 },
        { data: settingsRow, error: e3 },
      ] = await Promise.all([
        supabase.from("itens").select("*").order("id"),
        supabase.from("reservations").select("*"),
        supabase.from("settings").select("*").eq("id", 1).single(),
      ]);

      if (e1) throw new Error(e1.message);
      if (e2) throw new Error(e2.message);

      const loadedItems    = (itemRows || []).map(dbItemToApp);
      const loadedResMap   = dbReservationsToMap(resRows);
      const loadedSettings = settingsRow ? dbSettingsToApp(settingsRow) : DEFAULT_SETTINGS;

      setItems(loadedItems);
      setReservations(loadedResMap);
      setSettings(loadedSettings);
      setSettingsForm(loadedSettings);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Não foi possível carregar os dados. Verifique sua conexão e tente novamente.");
    }
    setLoading(false);
  }

  function retry() { setError(null); setLoading(true); boot(); }

  const showToast = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const navigate = useCallback((targetPage, tab) => {
    if (tab) setAdminTab(tab);
    setPage(targetPage);
  }, []);

  // ── Auth: convidado ───────────────────────────────────────────────────────────
  function guestLogin() {
    const email = guestEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) { showToast("Informe um e-mail válido.", "err"); return; }
    setCurrentGuest({ email });
    setPage("list");
  }

  // ── Auth: admin via Supabase Auth ─────────────────────────────────────────────
  async function adminLogin() {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminError("Preencha e-mail e senha.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email:    adminEmail.trim().toLowerCase(),
      password: adminPassword.trim(),
    });
    if (error) {
      setAdminError("E-mail ou senha incorretos.");
      return;
    }
    setIsAdmin(true);
    setAdminError("");
    setAdminTab("reservas");
    setPage("list");
  }

  function logout() {
    setPage("splash");
    setCurrentGuest(null);
    setGuestEmail("");
    setIsAdmin(false);
  }

  async function adminLogout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAdminEmail("");
    setAdminPassword("");
    setPage("splash");
  }

  // ── Slots ─────────────────────────────────────────────────────────────────────
  const getSlots = useCallback((item) =>
    Array.from({ length: item.qty }, (_, i) => ({
      key: `${item.id}:${i + 1}`,
      res: reservations[`${item.id}:${i + 1}`] || null,
    })), [reservations]);

  const isFull = useCallback((item) => getSlots(item).every((s) => s.res), [getSlots]);

  // ── Reservas ──────────────────────────────────────────────────────────────────
  function openReserveModal(item) {
    if (isFull(item)) return;
    setReserveItem(item);
    const fallback = currentGuest ? currentGuest.email.split("@")[0] : "admin";
    setReserveName(lastGuestInfo.current.name || fallback);
    setReservePhone(lastGuestInfo.current.phone);
    setReserveMsg(""); setReserveError("");
  }

  function closeReserveModal() { setReserveItem(null); }

  async function confirmReservation() {
    if (!reserveName.trim())  { setReserveError("Informe seu nome.");     return; }
    if (!reservePhone.trim()) { setReserveError("Informe seu telefone."); return; }
    const freeSlot = getSlots(reserveItem).find((s) => !s.res);
    if (!freeSlot) { setReserveError("Sem vagas disponíveis."); return; }

    const { error } = await supabase.from("reservations").insert({
      key:     freeSlot.key,
      item_id: reserveItem.id,
      name:    reserveName.trim(),
      email:   currentGuest?.email ?? "admin",
      phone:   reservePhone.trim(),
      message: reserveMsg.trim(),
      date:    new Date().toLocaleString("pt-BR"),
    });
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }

    lastGuestInfo.current = { name: reserveName.trim(), phone: reservePhone.trim() };
    setReserveItem(null);
    showToast(`🎉 "${reserveItem.name}" reservado!`);
  }

  async function cancelReservation(key) {
    const { error } = await supabase.from("reservations").delete().eq("key", key);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    setDeleteConfirm(null);
    showToast("Reserva cancelada.", "info");
  }

  async function cancelOwnReservation(key) {
    const { error } = await supabase.from("reservations").delete().eq("key", key);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    showToast("Sua reserva foi cancelada.", "info");
  }

  // ── CRUD itens ────────────────────────────────────────────────────────────────
  function openNewItem(category = "") {
    setEditItem({ id: null, name: "", category, price: "", emoji: "🎁", imageUrl: "", description: "", qty: 1 });
    setShowForm(true);
  }

  function openEditItem(item) { setEditItem({ ...item }); setShowForm(true); }

  async function saveItem() {
    if (!editItem.name.trim()) { showToast("Nome obrigatório.", "err"); return; }
    const price = parseFloat(String(editItem.price).replace(",", "."));
    if (isNaN(price) || price < 0) { showToast("Preço inválido.", "err"); return; }
    const qty = parseInt(editItem.qty) || 1;
    const row = {
      nome: editItem.name.trim(), category: editItem.category,
      valor: price, qty, emoji: editItem.emoji,
      imagem_url: editItem.imageUrl, descricao: editItem.description,
    };
    // id null = novo item — banco gera o bigint automaticamente via bigserial
    const isExisting = editItem.id !== null && items.some((i) => i.id === editItem.id);
    const { error } = isExisting
      ? await supabase.from("itens").update(row).eq("id", editItem.id)
      : await supabase.from("itens").insert(row);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    setShowForm(false);
    showToast("Item salvo! ✅");
  }

  async function deleteItem(id) {
    const { error } = await supabase.from("itens").delete().eq("id", id);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    setDeleteConfirm(null);
    showToast("Item removido.");
  }

  // ── Configurações: sem senhas — auth é do Supabase ────────────────────────────
  async function submitSettings() {
    if (!settingsForm.groomName || !settingsForm.brideName) {
      showToast("Nomes obrigatórios.", "err"); return;
    }
    const payload = {
      id:           1,
      groom_name:   settingsForm.groomName,
      bride_name:   settingsForm.brideName,
      wedding_date: settingsForm.weddingDate,
    };
    const { data: existing } = await supabase.from("settings").select("id").eq("id", 1).single();
    const { error } = existing
      ? await supabase.from("settings").update(payload).eq("id", 1)
      : await supabase.from("settings").insert(payload);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    showToast("Configurações salvas! ✅");
  }

  // ── Dados derivados ───────────────────────────────────────────────────────────
  const categories = useMemo(
    () => ["Todos", ...new Set(items.map((i) => i.category).filter(Boolean))], [items]);

  const filteredItems = useMemo(
    () => filterCat === "Todos" ? items : items.filter((i) => i.category === filterCat),
    [items, filterCat]);

  const allReservations = useMemo(
    () => Object.entries(reservations).map(([key, res]) => {
      const [id] = key.split(":");
      const item = items.find((i) => String(i.id) === String(id));
      return item ? { key, item, res } : null;
    }).filter(Boolean), [reservations, items]);

  const totalReservedValue = useMemo(
    () => allReservations.reduce((sum, e) => sum + (e.item.price || 0), 0), [allReservations]);

  const totalSlots = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  const value = {
    page, navigate, items, settings, loading, error, retry, toast,
    guestEmail, setGuestEmail, currentGuest, filterCat, setFilterCat,
    cancelConfirm, setCancelConfirm,
    reserveItem, reserveName, setReserveName, reservePhone, setReservePhone,
    reserveMsg, setReserveMsg, reserveError,
    openReserveModal, closeReserveModal, confirmReservation, cancelOwnReservation,
    adminEmail, setAdminEmail, adminPassword, setAdminPassword,
    adminError, isAdmin, adminTab,
    deleteConfirm, setDeleteConfirm,
    editItem, setEditItem, showForm, setShowForm, settingsForm, setSettingsForm,
    guestLogin, adminLogin, logout, adminLogout,
    getSlots, isFull,
    cancelReservation, openNewItem, openEditItem, saveItem, deleteItem, submitSettings,
    categories, filteredItems, allReservations, totalReservedValue, totalSlots,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
