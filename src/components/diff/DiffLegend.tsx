export function DiffLegend() {
  const items = [
    { cls: "token-add", label: "Added in B" },
    { cls: "token-del", label: "Removed from A" },
    { cls: "token-rep", label: "Replaced" },
  ];
  return (
    <div className="flex items-center gap-3 text-2xs text-ink-subtle">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className={`${i.cls} px-1.5`}>abc</span>
          <span>{i.label}</span>
        </span>
      ))}
    </div>
  );
}
