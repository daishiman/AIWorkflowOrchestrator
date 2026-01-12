# APIセキュリティ・Electronセキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [security-implementation.md](./security-implementation.md)

## API セキュリティ

### 認証・認可フロー

**APIエンドポイント分類**:

| 分類     | 認証要件     | 例                             |
| -------- | ------------ | ------------------------------ |
| 公開     | 不要         | ヘルスチェック、公開情報取得   |
| 認証必須 | ログイン済み | ユーザー情報、ワークフロー操作 |
| 管理者   | 管理者権限   | システム設定、ユーザー管理     |
| 内部     | Agent認証    | Local Agent通信                |

**認証チェックの実装場所**:

- Next.js Middlewareでルート全体の認証チェック
- API Routeハンドラーでの詳細な認可チェック
- データアクセス層でのオーナーシップ検証

### レート制限

| エンドポイント種別   | 制限値        | 単位           |
| -------------------- | ------------- | -------------- |
| 一般API              | 100リクエスト | 1分間/IP       |
| 認証API              | 10リクエスト  | 1分間/IP       |
| AI処理API            | 10リクエスト  | 1分間/ユーザー |
| ファイルアップロード | 5リクエスト   | 1分間/ユーザー |

**実装方針**:

- メモリベースのレート制限（Redis不要で開始可能）
- 429ステータスコードと Retry-After ヘッダーの返却
- レート超過のログ記録

### CORS設定

| 環境 | 許可オリジン                   |
| ---- | ------------------------------ |
| 開発 | localhost:3000, localhost:3001 |
| 本番 | 本番ドメインのみ               |

---

## 依存関係セキュリティ

### 脆弱性管理

| ツール     | 用途                 | 実行タイミング     |
| ---------- | -------------------- | ------------------ |
| pnpm audit | 依存関係の脆弱性検出 | CI/CD、週次        |
| Dependabot | 自動PR作成           | 常時（GitHub設定） |
| Snyk       | 詳細な脆弱性分析     | 任意（無料枠あり） |

**対応フロー**:

1. 脆弱性検出時は重大度を確認する
2. Critical/Highは即時対応（24時間以内）
3. Mediumは次回リリースまでに対応
4. Lowは定期メンテナンスで対応

### lock ファイルの管理

- pnpm-lock.yamlは必ずコミットする
- lock ファイルの手動編集は禁止
- CI/CDでは`pnpm install --frozen-lockfile`を使用

---

## Electron セキュリティ

### セキュリティ設定

**BrowserWindow設定の必須項目**:

| 設定                        | 推奨値 | 理由                               |
| --------------------------- | ------ | ---------------------------------- |
| nodeIntegration             | false  | Rendererからのシステムアクセス防止 |
| contextIsolation            | true   | preloadスクリプトの分離            |
| sandbox                     | true   | Chromiumサンドボックスの有効化     |
| webSecurity                 | true   | Same-Originポリシーの強制          |
| allowRunningInsecureContent | false  | HTTP上のコンテンツ実行防止         |

### Content Security Policy (CSP)

**実装場所**: `apps/desktop/src/main/infrastructure/security/csp.ts`

| 環境 | script-src                           | unsafe-eval | 用途               |
| ---- | ------------------------------------ | ----------- | ------------------ |
| 本番 | 'self'                               | 禁止        | 厳格なセキュリティ |
| 開発 | 'self' 'unsafe-inline' 'unsafe-eval' | 許可        | HMR対応            |

**共通設定**:

- `object-src 'none'`: プラグイン無効化
- `frame-ancestors 'none'`: クリックジャッキング対策
- `upgrade-insecure-requests`: HTTP→HTTPS自動変換

### IPC通信のセキュリティ

**preloadスクリプトでのAPI公開**:

- contextBridgeを使用して限定的なAPIのみ公開する
- チャンネル名はホワイトリストで管理する
- 引数のバリデーションをMain側で実施する
- センシティブな操作にはユーザー確認ダイアログを表示する

**IPC sender検証**:

**実装場所**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**禁止事項**:

- ipcRenderer全体の公開
- nodeモジュールの直接公開
- ファイルシステムへの無制限アクセス
- シェルコマンドの無制限実行

### スキル管理セキュリティ

**実装場所**: `apps/desktop/src/main/services/skill/SkillScanner.ts`

スキル管理機能では、ファイルシステムアクセスに関する追加のセキュリティ対策を実装する。

**パストラバーサル防止**:

| チェック項目         | 実装                           | エラーコード              |
| -------------------- | ------------------------------ | ------------------------- |
| パス正規化           | `path.normalize()` + `path.resolve()` | -                         |
| ベースパス検証       | `startsWith(basePath)`         | PATH_TRAVERSAL_DETECTED   |
| `../` パターン検出   | 相対パスの上位参照を拒否       | PATH_TRAVERSAL_DETECTED   |

```typescript
// 実装パターン
private validatePath(targetPath: string): void {
  const normalized = path.normalize(targetPath);
  const resolved = path.resolve(this.basePath, normalized);

  if (!resolved.startsWith(this.basePath)) {
    throw new Error("PATH_TRAVERSAL_DETECTED");
  }
}
```

**シンボリックリンク検証**:

| チェック項目         | 実装                           | 対応                     |
| -------------------- | ------------------------------ | ------------------------ |
| リンク検出           | `fs.lstat().isSymbolicLink()`  | リンク先を検証           |
| リンク先解決         | `fs.realpath()`                | ベースパス外なら除外     |
| 循環リンク           | 検出時は除外                   | エラーログを出力         |

**IPCチャネル検証**:

全てのスキル管理IPCハンドラは`validateIpcSender`を使用して呼び出し元を検証する。

| チャネル              | 検証項目                       |
| --------------------- | ------------------------------ |
| `skill:list-available`| sender検証 + パストラバーサル検証 |
| `skill:list-imported` | sender検証                     |
| `skill:import`        | sender検証 + skillIds検証      |
| `skill:remove`        | sender検証 + skillId検証       |
| `skill:get-detail`    | sender検証 + skillId検証       |

### 自動更新のセキュリティ

| 項目         | 要件                         |
| ------------ | ---------------------------- |
| 更新ソース   | HTTPS経由のみ                |
| 署名検証     | コード署名の検証必須         |
| ロールバック | 失敗時の自動ロールバック機能 |
| 通知         | 更新内容のユーザーへの明示   |

---

## 関連ドキュメント

- [セキュリティ実装概要](./security-implementation.md)
- [入力バリデーション](./security-input-validation.md)
- [デプロイメント](./deployment.md)
