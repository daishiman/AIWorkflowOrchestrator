export const metadata = {
  title: "AI Workflow Orchestrator API",
  description: "Backend API for AI Workflow Orchestrator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
