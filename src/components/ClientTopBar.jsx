import React from "react";
import { Search, Bell, Bookmark } from "lucide-react";

/**
 * Barra superior usada em telas de cliente que precisam de busca (ex:
 * listagem de restaurantes) — busca + notificações + favoritos/salvos.
 */
export default function ClientTopBar({ searchValue, onSearchChange, placeholder, notifCount = 0 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div className="ef-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", width: 340 }}>
        <Search size={15} color="var(--muted)" />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="ef-input"
          style={{ border: "none", padding: 0, flex: 1, background: "transparent" }}
        />
      </div>
      <div style={{ position: "relative" }}>
        <Bell size={18} color="var(--accent)" />
        {notifCount > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -6, background: "var(--accent)", color: "#0D0D0D",
            fontSize: 9, fontWeight: 700, borderRadius: 10, minWidth: 15, height: 15, display: "flex",
            alignItems: "center", justifyContent: "center", fontFamily: "'Exo 2', sans-serif",
          }}>
            {notifCount}
          </span>
        )}
      </div>
      <div className="ef-icon-btn" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
        <Bookmark size={15} />
      </div>
    </div>
  );
}
