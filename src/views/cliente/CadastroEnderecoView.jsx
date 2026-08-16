import { useState } from "react";
import { MapPin } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";

export default function CadastroEnderecoView({ onGo }) {
  const [tipo, setTipo] = useState("Casa");
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <PageHeader Icon={MapPin} title="ENDEREÇO" subtitle="Cadastro e seleção do endereço de entrega" />
      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="CEP" placeholder="05435-000" />
          <Field label="NÚMERO" placeholder="123" />
        </div>
        <Field label="RUA" placeholder="Rua das Flores" />
        <Field label="COMPLEMENTO (OPCIONAL)" placeholder="Apto, bloco..." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="BAIRRO" placeholder="Vila Madalena" />
          <Field label="CIDADE / UF" placeholder="São Paulo - SP" />
        </div>
        <div>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>TIPO DE ENDEREÇO</span>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {["Casa", "Trabalho", "Outro"].map((t) => (
              <button key={t} onClick={() => setTipo(t)} style={{
                padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", fontSize: 12,
                border: `1px solid ${tipo === t ? "var(--accent)" : "var(--border)"}`,
                background: tipo === t ? "var(--hover)" : "transparent", color: tipo === t ? "var(--accent)" : "#d8d8d8",
              }}>{t}</button>
            ))}
          </div>
        </div>
        <button className="ef-btn-solid" onClick={() => onGo("pagina-principal")}>SALVAR ENDEREÇO E CONTINUAR</button>
      </div>
    </div>
  );
}
