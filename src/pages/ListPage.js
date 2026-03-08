import { useApp } from "../context/AppContext";
import { NavBar } from "../components/NavBar";
import { GiftCard } from "../components/GiftCard";
import { ReserveModal } from "../components/ReserveModal";
import { ProgressBar } from "../components/ProgressBar";

export function ListPage() {
  const {
    settings, currentGuest,
    categories, filterCat, setFilterCat, filteredItems,
    reserveItem,
  } = useApp();

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
        <div className="filter-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${filterCat === cat ? " active" : ""}`}
              onClick={() => setFilterCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="gift-grid">
          {filteredItems.map((item) => (
            <GiftCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {reserveItem && <ReserveModal />}
    </>
  );
}
