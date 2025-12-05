export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>AI Workflow Orchestrator API</h1>
      <p>Backend API is running.</p>
      <h2>Available Endpoints</h2>
      <ul>
        <li>
          <code>GET /api/health</code> - Health check endpoint
        </li>
      </ul>
    </main>
  );
}
