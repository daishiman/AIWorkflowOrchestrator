# セキュリティルール

> 正本: `aiworkflow-requirements/references/security-principles.md`, `security-electron-ipc.md`

## セキュリティ設計原則

- **最小権限 (Least Privilege)**: 各プロセスに必要最小限の権限のみ
- **多層防御 (Defense in Depth)**: 複数の防御層で保護
- **フェイルセキュア (Fail-Secure)**: 障害時は安全側に倒す
- **完全仲介 (Complete Mediation)**: すべてのアクセスを毎回検証

## Electron 3プロセスモデル

| プロセス | 権限                 | 役割                                  |
| -------- | -------------------- | ------------------------------------- |
| Main     | Node.js フルアクセス | システム操作, IPC, セキュアストレージ |
| Preload  | contextBridge のみ   | 安全な API ブリッジ                   |
| Renderer | DOM のみ             | React UI, ユーザー操作                |

### BrowserWindow 必須設定

- `contextIsolation: true` — V8 コンテキスト分離
- `nodeIntegration: false` — Renderer から Node.js 遮断
- `sandbox: true` — Chromium サンドボックス
- DON'T: これらの設定を開発時も含めて変更しない

## IPC セキュリティ原則

- DO: チャンネル名はホワイトリストで管理し、定数で参照
- DO: 全ハンドラで送信元ウィンドウを検証
- DO: 引数は Main 側でバリデーション（パストラバーサル攻撃を含む）
- DO: エラーはサニタイズしてから Renderer に送る — 内部情報を漏洩しない
- DON'T: ハードコード文字列でチャンネル名を指定しない

### IPC 契約ドリフト防止

- DO: IPC ハンドラの引数形式と Preload 側の呼び出し形式が一致していることを検証
- DO: 新規ハンドラ作成時は [ipc-contract-checklist.md](../skills/aiworkflow-requirements/references/ipc-contract-checklist.md) の Phase 1-6 を実施
- DON'T: ハンドラの引数名と実際に渡される値のセマンティクスが乖離したまま放置しない
  → 失敗事例: [06-known-pitfalls.md#P44](./06-known-pitfalls.md)、[06-known-pitfalls.md#P45](./06-known-pitfalls.md)

## Content Security Policy (CSP)

- DO: 本番: `script-src 'self'`（eval 禁止）、`object-src 'none'`、`frame-src 'none'`
- DO: 開発: HMR 用に `'unsafe-eval'` のみ追加許可

## 認証セキュリティ

- DO: Authorization Code Flow + PKCE（RFC 7636）を使用
- DO: State parameter で CSRF を防止
- DO: トークンは暗号化して安全に保存
- DO: 機密データは Main Process に留め、Renderer には必要最小限の情報のみ
- DON'T: トークン・パスワード・API キーを平文保存しない
- DON'T: Renderer にトークンを直接送信しない

## ナビゲーション保護

- DO: 未許可 URL へのナビゲーションをブロック
- DO: 外部リンクはシステムブラウザに委譲
- DO: 新ウィンドウ生成を拒否
- DO: アプリの多重起動を防止
