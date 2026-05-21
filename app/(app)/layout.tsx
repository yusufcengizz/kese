export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — Faz 3'te tamamlanacak */}
      <aside className="hidden md:flex w-64 border-r border-border bg-sidebar" />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
