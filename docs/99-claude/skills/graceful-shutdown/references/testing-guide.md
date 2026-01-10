# Testing Guide

## 1. シグナル送信テスト

```bash
# プロセス起動
node server.js &
PID=$!

# SIGTERM送信
kill -TERM $PID

# ログ確認
# Expected: "Shutting down gracefully..."
```

## 2. タイムアウトテスト

```typescript
// 意図的に長時間処理を入れる
async function slowCleanup() {
  await new Promise((r) => setTimeout(r, 60000)); // 60秒
}

// タイムアウト（30秒）で強制終了されることを確認
```

## 3. リソースリークテスト

```bash
# 起動前の接続数
netstat -an | grep ESTABLISHED | wc -l

# シャットダウン後の接続数（同じであるべき）
netstat -an | grep ESTABLISHED | wc -l
```

## 4. 負荷テスト中のシャットダウン

```bash
# 負荷をかける
ab -n 10000 -c 100 http://localhost:3000/ &

# 5秒後にシャットダウン
sleep 5 && kill -TERM $PID

# リクエストの失敗率を確認（<1%が目標）
```

## 5. Kubernetes でのテスト

```bash
# Pod削除時の挙動確認
kubectl delete pod app-xxx --grace-period=60

# ログ確認
kubectl logs app-xxx --follow
```
