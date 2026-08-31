export function LabPageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="lab-header">
      <div className="lab-eyebrow fit-filter-display">{eyebrow}</div>
      <h1 className="lab-title fit-filter-display">{title}</h1>
      <p className="lab-lede">{lede}</p>
    </header>
  );
}

export function LabFooter({ children }: { children: React.ReactNode }) {
  return <footer className="lab-footer">{children}</footer>;
}
