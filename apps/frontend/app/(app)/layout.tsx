export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col pt-20">
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16">{children}</div>
    </div>
  );
}
