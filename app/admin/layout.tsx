// app/(admin)/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // aqui você pode colocar menu lateral, header, etc.
  return <>{children}</>;
}
