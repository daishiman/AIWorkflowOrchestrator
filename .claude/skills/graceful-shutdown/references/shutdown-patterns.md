# Shutdown Patterns

## 1. Simple Shutdown

最もシンプルなパターン。CLI/バッチ処理向け。

```typescript
async function simpleShutdown() {
  await cleanup();
  process.exit(0);
}
```

---

## 2. Graceful Drain

Webサーバー向け。既存リクエスト完了を待つ。

```typescript
async function gracefulDrain() {
  server.close(); // 新規拒否
  await waitForConnections(30000); // 完了待機
  await cleanup();
  process.exit(0);
}
```

---

## 3. Resource Cascade

複数リソースを依存順に解放。

```typescript
async function resourceCascade() {
  await stopAccepting();
  await drainRequests();
  await closeCache();
  await closeDatabase(); // 最後
  process.exit(0);
}
```

---

## 4. Timeout Fallback

タイムアウト時のフォールバック付き。

```typescript
async function timeoutFallback() {
  const timeout = setTimeout(() => {
    console.error("Timeout, forcing exit");
    process.exit(1);
  }, 30000);

  await cleanup();
  clearTimeout(timeout);
  process.exit(0);
}
```
