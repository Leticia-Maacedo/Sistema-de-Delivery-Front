import { Star } from "lucide-react";

export default function Stars({ n }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} color="var(--accent)" fill={i <= n ? "var(--accent)" : "none"} />
      ))}
    </div>
  );
}
