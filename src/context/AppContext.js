import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "../hooks/supabase";
import { DEFAULT_SETTINGS } from "../hooks/defaults";
import { fmtPhone } from "../hooks/utils";
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
    link:        row.link       || "",
  };
}

function dbSettingsToApp(row) {
  return {
    groomName:       row.groom_name        || DEFAULT_SETTINGS.groomName,
    brideName:       row.bride_name        || DEFAULT_SETTINGS.brideName,
    weddingDate:     row.wedding_date      || DEFAULT_SETTINGS.weddingDate,
    deliveryAddress: row.delivery_address  || DEFAULT_SETTINGS.deliveryAddress,
    thankYouMessage: row.thank_you_message || DEFAULT_SETTINGS.thankYouMessage,
    pixKey:          row.pix_key           || DEFAULT_SETTINGS.pixKey,
    pixVoucher1:     row.pix_voucher1      || DEFAULT_SETTINGS.pixVoucher1,
    pixVoucher2:     row.pix_voucher2      || DEFAULT_SETTINGS.pixVoucher2,
    pixVoucher3:     row.pix_voucher3      || DEFAULT_SETTINGS.pixVoucher3,
    pixVoucher4:     row.pix_voucher4      || DEFAULT_SETTINGS.pixVoucher4,
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [guestNome,     setGuestNome]     = useState("");
  const [guestSobrenome,setGuestSobrenome]= useState("");
  const [guestNomeError,setGuestNomeError]= useState("");
  const [convidados,    setConvidados]    = useState([]);
  const [currentGuest,  setCurrentGuest]  = useState(null);
  const [filterCat,     setFilterCat]     = useState("Todos");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [priceMin,      setPriceMin]      = useState("");
  const [priceMax,      setPriceMax]      = useState("");
  const [cancelConfirm,    setCancelConfirm]    = useState(null);

  // ── Presença ──────────────────────────────────────────────────────────────────
  const [presencas,        setPresencas]        = useState([]);
  const [contribuicoes,    setContribuicoes]    = useState([]);
  const [pixModal,         setPixModal]         = useState(null);  // valor selecionado
  const [pixName,          setPixName]          = useState("");
  const [pixError,         setPixError]         = useState("");
  const [pixDelete,        setPixDelete]        = useState(null);
  const [presencaName,     setPresencaName]      = useState("");
  const [presencaPhone,    setPresencaPhone]     = useState("");
  const [presencaError,    setPresencaError]     = useState("");
  const [presencaConfirm,  setPresencaConfirm]   = useState(false); // modal aberto
  const [showPresencaStatus, setShowPresencaStatus] = useState(false);  // modal ver/cancelar status
  const [presencaDelete,   setPresencaDelete]    = useState(null);

  const [reserveItem,  setReserveItem]  = useState(null);
  const [reserveQty,   setReserveQty]   = useState(1);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "convidados" }, () => {
        supabase.from("convidados").select("*").order("created_at")
          .then(({ data }) => data && setConvidados(data));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "contribuicoes" }, () => {
        supabase.from("contribuicoes").select("*").order("created_at")
          .then(({ data }) => data && setContribuicoes(data));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "presencas" }, () => {
        supabase.from("presencas").select("*").order("created_at")
          .then(({ data }) => data && setPresencas(data));
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
        { data: itemRows,     error: e1 },
        { data: resRows,      error: e2 },
        { data: settingsRow,  error: e3 },
        { data: presencaData, error: e4 },
        { data: contribData,  error: e5 },
        { data: convData,      error: e6 },
      ] = await Promise.all([
        supabase.from("itens").select("*").order("id"),
        supabase.from("reservations").select("*"),
        supabase.from("settings").select("*").eq("id", 1).single(),
        supabase.from("presencas").select("*").order("created_at"),
        supabase.from("contribuicoes").select("*").order("created_at"),
        supabase.from("convidados").select("*").order("created_at"),
      ]);

      if (e1) throw new Error(e1.message);
      if (e2) throw new Error(e2.message);
      if (e3 && e3.code !== "PGRST116") throw new Error(e3.message); // PGRST116 = row not found (settings ainda vazio)
      if (e4) throw new Error(e4.message);
      if (e5) throw new Error(e5.message);
      if (e6) throw new Error(e6.message);

      const loadedItems    = (itemRows || []).map(dbItemToApp);
      const loadedResMap   = dbReservationsToMap(resRows);
      const loadedSettings = settingsRow ? dbSettingsToApp(settingsRow) : DEFAULT_SETTINGS;
      if (presencaData) setPresencas(presencaData);
      if (contribData) setContribuicoes(contribData);
      if (convData)    setConvidados(convData);

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
  async function guestLogin() {
    const email = guestEmail.trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) { showToast("Informe um e-mail válido.", "err"); return; }
    if (!guestNome.trim())      { setGuestNomeError("Informe seu nome.");      return; }
    if (!guestSobrenome.trim()) { setGuestNomeError("Informe seu sobrenome."); return; }
    setGuestNomeError("");

    const nomeCompleto = `${guestNome.trim()} ${guestSobrenome.trim()}`;

    // Busca registro existente para preservar o phone e decidir insert vs update
    const { data: existente } = await supabase
      .from("convidados").select("*").eq("email", email).single();

    const payload = { email, nome: guestNome.trim(), sobrenome: guestSobrenome.trim() };
    const query = existente
      ? supabase.from("convidados").update(payload).eq("email", email)
      : supabase.from("convidados").insert({ ...payload, phone: "" });
    const { data: convRow, error: convErr } = await query.select().single();
    if (convErr) { showToast("Erro ao salvar dados. Tente novamente.", "err"); return; }

    // Para update, convRow não inclui phone — usa o existente
    const phone = existente ? (existente.phone || "") : "";

    // Optimistic update na lista local — merge para preservar phone no estado
    const convAtualizado = existente ? { ...existente, ...convRow } : convRow;
    setConvidados((prev) => {
      const idx = prev.findIndex((c) => c.email === email);
      if (idx >= 0) { const next = [...prev]; next[idx] = convAtualizado; return next; }
      return [...prev, convAtualizado];
    });

    // Pré-preenche nome e phone nas ações futuras (phone salvo de visita anterior)
    lastGuestInfo.current = { name: nomeCompleto, phone };

    setCurrentGuest({ email, nome: guestNome.trim(), sobrenome: guestSobrenome.trim() });
    // Pré-preenche presença com nome e phone do convidado
    setPresencaName(nomeCompleto);
    setPresencaPhone(phone ? fmtPhone(phone) : "");
    setPage("list");
    const jaRespondeu = presencas.some((p) => p.email === email);
    if (!jaRespondeu) setPresencaConfirm(true);
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
    setGuestNome("");
    setGuestSobrenome("");
    setPresencaName("");
    setPresencaPhone("");
    lastGuestInfo.current = { name: "", phone: "" };
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
    // Bloqueia dupla reserva — convidado já reservou algum slot deste item
    if (currentGuest?.email) {
      const jaReservou = getSlots(item).some((s) => s.res?.email === currentGuest.email);
      if (jaReservou) { showToast("Você já reservou este presente. 🎁", "info"); return; }
    }
    setReserveQty(1);
    setReserveItem(item);
    const fallback = currentGuest ? currentGuest.email.split("@")[0] : "admin";
    setReserveName(lastGuestInfo.current.name || fallback);
    setReservePhone(fmtPhone(lastGuestInfo.current.phone));
    setReserveMsg(""); setReserveError("");
  }

  function closeReserveModal() { setReserveItem(null); }

  async function confirmReservation() {
    if (!reserveName.trim())  { setReserveError("Informe seu nome.");     return; }
    if (!reservePhone.trim()) { setReserveError("Informe seu telefone."); return; }
    const freeSlots = getSlots(reserveItem).filter((s) => !s.res);
    if (!freeSlots.length) { setReserveError("Sem vagas disponíveis."); return; }
    if (reserveQty > freeSlots.length) {
      setReserveError(`Apenas ${freeSlots.length} unidade(s) disponível(is).`);
      return;
    }

    const slotsToReserve = freeSlots.slice(0, reserveQty);
    const date = new Date().toLocaleString("pt-BR");
    const rows = slotsToReserve.map((slot) => ({
      key:     slot.key,
      item_id: reserveItem.id,
      name:    reserveName.trim(),
      email:   currentGuest?.email ?? "admin",
      phone:   reservePhone.trim(),
      message: reserveMsg.trim(),
      date,
    }));

    const { error } = await supabase.from("reservations").insert(rows);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }

    // Captura os dados necessários antes de zerar o estado
    const confirmedName  = reserveName.trim();
    const confirmedPhone = reservePhone.trim().replace(/\D/g, "");
    const confirmedItem  = reserveItem.name;

    lastGuestInfo.current = { name: confirmedName, phone: confirmedPhone };
    // Persiste phone no cadastro do convidado para próximas visitas
    if (currentGuest?.email && confirmedPhone) {
      await supabase.from("convidados").update({ phone: confirmedPhone }).eq("email", currentGuest.email);
    }
    setReserveItem(null);
    showToast(`🎉 "${confirmedItem}" reservado!`);

    // Abre WhatsApp com mensagem personalizada — exige mínimo 10 dígitos (DDD + número)
    if (confirmedPhone.length >= 10) {
      const thanks  = settings.thankYouMessage?.trim() || DEFAULT_SETTINGS.thankYouMessage;
      const address = settings.deliveryAddress?.trim();
      const addressLine = address
        ? `\n\nCaso queira enviar o presente, pode enviar para o endereço:\n${address}`
        : "";
      const qtyLine = reserveQty > 1 ? ` (${reserveQty} unidades)` : "";
      const msg   = `${thanks}\n\n${confirmedName}, sua reserva de *${confirmedItem}*${qtyLine} foi confirmada! 🎁${addressLine}`;
      const waUrl = `https://wa.me/55${confirmedPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  }

  // ── Funções de presença ──────────────────────────────────────────────────────
  async function confirmarPresenca() {
    if (!presencaName.trim())  { setPresencaError("Informe seu nome.");     return; }
    if (!presencaPhone.trim()) { setPresencaError("Informe seu telefone."); return; }

    const cleanPhone = presencaPhone.trim().replace(/\D/g, "");
    const novaPresenca = {
      name:   presencaName.trim(),
      phone:  cleanPhone,
      email:  currentGuest?.email ?? "",
      date:   new Date().toLocaleString("pt-BR"),
      status: "confirmado",
    };
    const { data, error } = await supabase.from("presencas").insert(novaPresenca).select().single();
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }

    // Optimistic update — reflete imediatamente sem esperar Realtime
    if (data) setPresencas((prev) => [...prev, data]);

    // Persiste phone no cadastro do convidado
    if (cleanPhone) lastGuestInfo.current = { ...lastGuestInfo.current, phone: cleanPhone };
    if (currentGuest?.email && cleanPhone) {
      await supabase.from("convidados").update({ phone: cleanPhone }).eq("email", currentGuest.email);
    }

    setPresencaConfirm(false);
    setPresencaName(nomeCompletoGuest);
    setPresencaPhone(fmtPhone(lastGuestInfo.current.phone));
    setPresencaError("");
    showToast("🎉 Presença confirmada! Até lá!");
  }

  async function registrarAusencia() {
    if (!presencaName.trim()) { setPresencaError("Informe seu nome."); return; }

    const cleanPhone = presencaPhone.trim().replace(/\D/g, "");
    const novaAusencia = {
      name:   presencaName.trim(),
      phone:  cleanPhone,
      email:  currentGuest?.email ?? "",
      date:   new Date().toLocaleString("pt-BR"),
      status: "ausente",
    };
    const { data, error } = await supabase.from("presencas").insert(novaAusencia).select().single();
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }

    // Optimistic update
    if (data) setPresencas((prev) => [...prev, data]);

    // Persiste phone no cadastro do convidado
    if (cleanPhone) lastGuestInfo.current = { ...lastGuestInfo.current, phone: cleanPhone };
    if (currentGuest?.email && cleanPhone) {
      await supabase.from("convidados").update({ phone: cleanPhone }).eq("email", currentGuest.email);
    }

    setPresencaConfirm(false);
    setPresencaName(nomeCompletoGuest);
    setPresencaPhone(fmtPhone(lastGuestInfo.current.phone));
    setPresencaError("");
    showToast("Recebemos sua resposta. Sentiremos sua falta! 💙", "info");
  }

  async function registrarContribuicao() {
    if (!pixName.trim()) { setPixError("Informe seu nome."); return; }
    if (!pixModal)       { setPixError("Selecione um valor."); return; }

    const nova = {
      name:  pixName.trim(),
      email: currentGuest?.email ?? "",
      valor: pixModal,
    };
    const { data, error } = await supabase.from("contribuicoes").insert(nova).select().single();
    if (error) { setPixError(`Erro: ${error.message}`); return; }

    if (data) setContribuicoes((prev) => [...prev, data]);
    lastGuestInfo.current = { ...lastGuestInfo.current, name: pixName.trim() };
    setPixModal(null);
    setPixName("");
    setPixError("");
    showToast("💚 Contribuição registrada! Obrigado!", "ok");
  }

  async function deletarContribuicao(id) {
    const { error } = await supabase.from("contribuicoes").delete().eq("id", id);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    setContribuicoes((prev) => prev.filter((c) => c.id !== id));
    setPixDelete(null);
    showToast("Contribuição removida.", "info");
  }

  async function cancelarPresenca(id) {
    const { error } = await supabase.from("presencas").delete().eq("id", id);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    // Optimistic update
    setPresencas((prev) => prev.filter((p) => p.id !== id));
    setPresencaDelete(null);
    showToast("Presença cancelada.", "info");
  }

  // Verifica se o convidado atual já confirmou presença
  const nomeCompletoGuest = currentGuest
    ? `${currentGuest.nome || ""} ${currentGuest.sobrenome || ""}`.trim()
    : "";

  const minhaPresenca = presencas.find(
    (p) => p.email === (currentGuest?.email ?? "")
  ) || null;

  async function cancelarMinhaPresenca() {
    if (!minhaPresenca) return;
    const { error } = await supabase.from("presencas").delete().eq("id", minhaPresenca.id);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    // Optimistic update
    setPresencas((prev) => prev.filter((p) => p.id !== minhaPresenca.id));
    showToast("Sua presença foi cancelada.", "info");
  }

  function removeReservation(key) {
    setReservations((prev) => { const next = { ...prev }; delete next[key]; return next; });
  }

  async function cancelReservation(key) {
    const { error } = await supabase.from("reservations").delete().eq("key", key);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    removeReservation(key);
    setDeleteConfirm(null);
    showToast("Reserva cancelada.", "info");
  }

  async function cancelOwnReservation(key) {
    const { error } = await supabase.from("reservations").delete().eq("key", key);
    if (error) { showToast(`Erro: ${error.message}`, "err"); return; }
    removeReservation(key);
    showToast("Sua reserva foi cancelada.", "info");
  }

  // ── CRUD itens ────────────────────────────────────────────────────────────────
  function openNewItem(category = "") {
    setEditItem({ id: null, name: "", category, price: "", emoji: "🎁", imageUrl: "", description: "", link: "", qty: 1 });
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
      imagem_url: editItem.imageUrl, descricao: editItem.description, link: editItem.link || "",
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
      groom_name:        settingsForm.groomName,
      bride_name:        settingsForm.brideName,
      wedding_date:      settingsForm.weddingDate,
      delivery_address:  settingsForm.deliveryAddress,
      thank_you_message: settingsForm.thankYouMessage,
      pix_key:           settingsForm.pixKey          ?? "",
      pix_voucher1:      Number(settingsForm.pixVoucher1) || 25,
      pix_voucher2:      Number(settingsForm.pixVoucher2) || 50,
      pix_voucher3:      Number(settingsForm.pixVoucher3) || 75,
      pix_voucher4:      Number(settingsForm.pixVoucher4) || 100,
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

  // Range real de preços — usado para mostrar referência ao convidado
  const priceRange = useMemo(() => {
    if (!items.length) return { min: 0, max: 0 };
    const prices = items.map((i) => i.price).filter((p) => p > 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [items]);

  const filteredItems = useMemo(() => {
    // Filtro 1: categoria
    const byCategory = filterCat === "Todos" ? items : items.filter((i) => i.category === filterCat);
    // Filtro 2: busca por nome/descrição
    const q = searchQuery.trim().toLowerCase();
    const bySearch = q
      ? byCategory.filter((i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
        )
      : byCategory;
    // Filtro 3: faixa de preço
    const min = priceMin !== "" ? parseFloat(priceMin) : null;
    const max = priceMax !== "" ? parseFloat(priceMax) : null;
    return bySearch.filter((i) =>
      (min === null || i.price >= min) &&
      (max === null || i.price <= max)
    );
  }, [items, filterCat, searchQuery, priceMin, priceMax]);

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
    guestEmail, setGuestEmail, guestNome, setGuestNome, guestSobrenome, setGuestSobrenome,
    guestNomeError, setGuestNomeError, convidados,
    currentGuest, filterCat, setFilterCat, searchQuery, setSearchQuery,
    contribuicoes, pixModal, setPixModal, pixName, setPixName, pixError, setPixError,
    lastGuestInfo,
    pixDelete, setPixDelete, registrarContribuicao, deletarContribuicao,
    nomeCompletoGuest,
    presencas, presencaName, setPresencaName, presencaPhone, setPresencaPhone,
    presencaError, setPresencaError, presencaConfirm, setPresencaConfirm,
    showPresencaStatus, setShowPresencaStatus,
    presencaDelete, setPresencaDelete, confirmarPresenca, registrarAusencia, cancelarPresenca,
    minhaPresenca, cancelarMinhaPresenca,
    priceMin, setPriceMin, priceMax, setPriceMax, priceRange,
    cancelConfirm, setCancelConfirm,
    reserveItem, reserveQty, setReserveQty, reserveName, setReserveName, reservePhone, setReservePhone,
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
