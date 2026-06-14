type AdminCardProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function AdminCard({ title, description, children }: AdminCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
      <h2 className="text-xl font-black text-white">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
