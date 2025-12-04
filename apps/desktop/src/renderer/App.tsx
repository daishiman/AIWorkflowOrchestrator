function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold">AI Workflow Orchestrator</h1>
      </header>
      <main className="p-6">
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-medium">Dashboard</h2>
          <p className="text-gray-400">
            Welcome to AI Workflow Orchestrator. Development environment is ready.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Platform: {window.electronAPI?.platform || 'unknown'}
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
