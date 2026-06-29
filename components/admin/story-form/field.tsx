export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[var(--color-foreground)]/80">{label}</span>
      {children}
    </label>
  );
}
