import { useState } from "react";
import { useApp } from "../context/AppContext";
import { fmtPrice } from "../hooks/utils";
import { NavBar } from "../components/NavBar";
import { GiftCard } from "../components/GiftCard";
import { ReserveModal } from "../components/ReserveModal";
import { PresencaModal } from "../components/PresencaModal";
import { PixModal } from "../components/PixModal";
import { ProgressBar } from "../components/ProgressBar";

export function ListPage() {
  const {
    settings, currentGuest,
    categories, filterCat, setFilterCat, filteredItems,
    searchQuery, setSearchQuery,
    priceMin, setPriceMin, priceMax, setPriceMax, priceRange,
    allReservations, reserveItem,
    minhaPresenca,
    setPixModal, setPixName, setPixError, lastGuestInfo,
  } = useApp();

  const [showMyReservations, setShowMyReservations] = useState(false);

  // Itens reservados pelo convidado atual — deduplicados por id (qty > 1)
  const myEmail = currentGuest?.email;
  const myItems = allReservations
    .filter((r) => r.res.email === myEmail)
    .map((r) => r.item)
    .filter((item, idx, arr) => arr.findIndex((i) => i.id === item.id) === idx);

  // Lista final: modo "meus presentes" ignora os outros filtros
  const displayItems = showMyReservations ? myItems : filteredItems;

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-floral">✦</span>
            <div>
              <h1 className="header-title">{settings.groomName} & {settings.brideName}</h1>
              <p className="header-sub">{settings.weddingDate}</p>
            </div>
            <span className="header-floral">✦</span>
          </div>
          <NavBar />
        </div>
        <p className="header-welcome">
          Olá, <strong>{currentGuest?.email}</strong> 👋 — Escolha um presente para os noivos!
        </p>
      </header>

      <ProgressBar />

      <div className="list-main">
        {!showMyReservations && (
          <div className="search-row">
            <input
              className="input search-input"
              type="text"
              placeholder="🔍 Buscar presente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn-search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        )}

        {!showMyReservations && (
          <div className="filter-row">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn${filterCat === cat ? " active" : ""}`}
                onClick={() => { setFilterCat(cat); setSearchQuery(""); setPriceMin(""); setPriceMax(""); }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="my-reservations-row">
          <button
            className={`btn-my-reservations${showMyReservations ? " active" : ""}`}
            onClick={() => setShowMyReservations((v) => !v)}>
            {showMyReservations
              ? "← Voltar para a lista"
              : <>👀 Meus presentes reservados{myItems.length > 0 && <span className="my-res-badge">{myItems.length}</span>}</>
            }
          </button>
        </div>

        {!showMyReservations && (priceMin !== "" || priceMax !== "") && (
          <div className="price-active-badge">
            💰 Preço: {priceMin !== "" ? `R$ ${fmtPrice(priceMin)}` : "qualquer"} até {priceMax !== "" ? `R$ ${fmtPrice(priceMax)}` : "qualquer"}
            <button className="btn-search-clear" style={{ position: "static", marginLeft: 8 }}
              onClick={() => { setPriceMin(""); setPriceMax(""); }}>✕</button>
          </div>
        )}

        {!showMyReservations && (
          <div className="price-filter-row">
            <span className="price-filter-label">💰 Faixa de preço:</span>
            <div className="price-inputs">
              <input
                className="input price-input"
                type="number"
                min="0"
                placeholder={`Mín (R$ ${fmtPrice(priceRange.min)})`}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <span className="price-sep">até</span>
              <input
                className="input price-input"
                type="number"
                min="0"
                placeholder={`Máx (R$ ${fmtPrice(priceRange.max)})`}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="gift-grid">
          {displayItems.length === 0 ? (
            <p className="empty-search">
              {showMyReservations
                ? <>Você ainda não reservou nenhum presente. 🎁</>
                : searchQuery
                  ? <>Nenhum presente encontrado para <strong>"{searchQuery}"</strong>.</>
                  : (priceMin !== "" || priceMax !== "")
                    ? <>Nenhum presente encontrado nessa faixa de preço.</>
                    : <>Nenhum presente disponível nessa categoria.</>
              }
            </p>
          ) : (
            displayItems.map((item) => <GiftCard key={item.id} item={item} />)
          )}
        </div>
      </div>

      {/* ── Seção Pix ────────────────────────────────────────────────── */}
      {!showMyReservations && (
        <div className="pix-section">
          <div className="pix-section-header">
            <div>
              <h3 className="pix-section-title">Contribuição via Pix</h3>
              <p className="pix-section-desc">
                Não encontrou o presente ideal? Contribua com o valor que quiser para os noivos!
              </p>
            </div>
          </div>
          <div className="pix-vouchers">
            {[settings.pixVoucher1, settings.pixVoucher2, settings.pixVoucher3, settings.pixVoucher4]
              .filter(Boolean).map((valor) => (
              <button
                key={valor}
                className="pix-voucher-btn"
                onClick={() => {
                  setPixName(lastGuestInfo.current.name || "");
                  setPixError("");
                  setPixModal(valor);
                }}
              >
                <span className="pix-voucher-emoji">💚</span>
                <span className="pix-voucher-value">R$ {Number(valor).toFixed(2).replace(".", ",")}</span>
                <span className="pix-voucher-label">Presentear</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {reserveItem && <ReserveModal />}
      <PixModal />
      <PresencaModal />


    </>
  );
}
