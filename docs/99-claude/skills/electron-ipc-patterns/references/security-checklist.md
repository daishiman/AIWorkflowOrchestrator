# IPC Security Checklist

## 必須項目（CRITICAL）

### 1. BrowserWindow設定

- [ ] `contextIsolation: true` が設定されている
- [ ] `nodeIntegration: false` が設定されている
- [ ] `sandbox: true` が設定されている（推奨）
- [ ] `preload` スクリプトが指定されている

### 2. Preloadスクリプト

- [ ] `contextBridge.exposeInMainWorld` を使用している
- [ ] `ipcRenderer` を直接公開していない
- [ ] `require` を公開していない
- [ ] Node.js APIを直接公開していない

### 3. Mainプロセスハンドラ

- [ ] すべてのハンドラで入力検証を実施している
- [ ] バリデーションライブラリ（Zod等）を使用している
- [ ] エラーハンドリングが実装されている
- [ ] 機密情報をログに出力していない

### 4. チャネル管理

- [ ] チャネル名が一貫した命名規則に従っている
- [ ] チャネルホワイトリストが定義されている
- [ ] 動的チャネル名を使用していない

## 推奨項目（BEST PRACTICE）

### 5. 認証・認可

- [ ] ユーザー権限に基づくアクセス制御を実装している
- [ ] セッション管理が適切に行われている
- [ ] タイムアウト処理が実装されている

### 6. レート制限

- [ ] IPC呼び出しにレート制限を実装している
- [ ] DoS攻撃対策が施されている

### 7. データ検証

- [ ] SQLインジェクション対策を実施している
- [ ] XSS対策を実施している
- [ ] パストラバーサル対策を実施している

### 8. エラーハンドリング

- [ ] エラーメッセージに機密情報を含めていない
- [ ] 適切なエラーコードを返している
- [ ] クライアント側でエラーを適切に処理している

### 9. ロギング・監査

- [ ] IPC通信をロギングしている
- [ ] 異常なアクセスパターンを検出している
- [ ] 監査ログを保存している

### 10. コンテンツセキュリティポリシー

- [ ] CSPヘッダーが設定されている
- [ ] インラインスクリプトを避けている
- [ ] eval()の使用を避けている

## 脅威モデル

### シナリオ1: XSS攻撃によるIPC乱用

**脅威**: Rendererプロセスに注入されたスクリプトがIPCを使用してMainプロセスを操作

**対策**:

- contextBridge使用（ipcRenderer直接公開禁止）
- 入力検証（Mainプロセス側）
- CSP設定

### シナリオ2: プロセス間通信の盗聴

**脅威**: IPC通信内容の傍受

**対策**:

- 機密情報の暗号化
- セキュアな通信チャネル使用
- メモリスクレイピング対策

### シナリオ3: DoS攻撃

**脅威**: 大量のIPC呼び出しによるリソース枯渇

**対策**:

- レート制限実装
- タイムアウト設定
- リソース監視

### シナリオ4: 権限昇格

**脅威**: 一般ユーザーが管理者権限操作を実行

**対策**:

- 権限ベースアクセス制御
- チャネルホワイトリスト
- 認証トークン検証

## 検証コマンド

```bash
# セキュリティ分析スクリプト実行
node .claude/skills/electron-ipc-patterns/scripts/analyze-security.mjs

# 期待される出力:
# ✓ context isolation enabled
# ✓ nodeIntegration disabled
# ✓ All handlers have validation
# ✗ Rate limiting not implemented (WARNING)
```

## 参考資料

- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Electron Security](https://owasp.org/www-community/vulnerabilities/Electron_Security)
