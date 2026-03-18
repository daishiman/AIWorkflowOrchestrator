# クイックリファレンス

> 最重要情報への即時アクセス
> 詳細は resource-map.md → 該当ファイル を参照

---

## よく使うパターン

> **検索パターン集・コードパターン早見は [quick-reference-search-patterns.md](quick-reference-search-patterns.md) に分離**
> 機能・タスク別のキーワード分割、読む順番、IPC/Zustand/Result 等のコードスニペットを収録

---

## 型定義クイックアクセス

| 用途               | 型名                          | ファイル                   |
| ------------------ | ----------------------------- | -------------------------- |
| API結果            | `OperationResult<T>`          | interfaces-core.md         |
| IPC transport      | `IPCResponse<T>`              | interfaces-auth.md         |
| 認証方式状態       | `AuthModeStatus`              | interfaces-auth.md         |
| スキル情報         | `Skill`, `SkillMetadata`      | interfaces-agent-sdk.md    |
| チャットメッセージ | `ChatMessage`                 | interfaces-llm.md          |
| 会話セッション     | `ChatSession`                 | interfaces-chat-history.md |
| RAG検索結果        | `SearchResult`                | interfaces-rag-search.md   |
| エラー             | `AppError`, `ValidationError` | error-handling.md          |
| CTA制御            | `CTAVisibility`, `CTAState`   | workflow-skill-lifecycle-created-skill-usage-journey.md |
| 権限フォールバック | `AbortReason`, `PermissionFlowContext`, `PermissionFlowResult` | interfaces-agent-sdk-executor-core.md |
| 権限リトライ上限   | `PERMISSION_MAX_RETRIES`      | interfaces-agent-sdk-executor-core.md |
| SafetyGate評価     | `SafetyGatePort`, `DefaultSafetyGate`, `evaluateSafety` | api-ipc-agent-safety.md, security-skill-execution.md |
| Permission Fallback Hook | `processPermissionFallback`, `revokeSessionEntries` | interfaces-agent-sdk-executor-details.md |
| PreToolUse Hook統合 | `handlePermissionCheck`, `sendPermissionRequestWithTimeout`, `PermissionTimeoutError` | interfaces-agent-sdk-executor-core.md |
| タイムアウトパターン | S32: `Promise.race` + settled フラグ + `clearTimeout` | architecture-implementation-patterns-reference-ipc-fallback-validation.md |

---

## IPCチャンネル早見表

### 認証・ユーザー

| チャンネル         | 用途           |
| ------------------ | -------------- |
| `auth:get-session` | セッション取得 |
| `auth:sign-out`    | ログアウト     |
| `auth-mode:get`    | 現在の認証方式取得 |
| `auth-mode:set`    | 認証方式の切替 |
| `auth-mode:status` | 現在 mode の資格情報状態取得 |
| `auth-mode:validate` | 対象 mode の有効性検証 |
| `auth-mode:changed` | Main→Renderer の認証方式変更通知 |

### スキル管理

| チャンネル             | 用途           |
| ---------------------- | -------------- |
| `skill:list-available` | スキルスキャン |
| `skill:list-imported`  | インポート済み |
| `skill:execute`        | スキル実行     |
| `skill:permission`     | 権限確認       |

### チャット

| チャンネル       | 用途           |
| ---------------- | -------------- |
| `chat:send`      | メッセージ送信 |
| `chat:stream`    | ストリーミング |
| `conversation:*` | 会話履歴管理   |

**詳細**: api-endpoints.md L126-736

---

## ディレクトリ構成早見表

```
apps/
  desktop/
    src/
      main/           # Electron Main Process
        services/     # ビジネスロジック
        ipc/          # IPCハンドラ
        settings/     # 設定管理
      renderer/       # React UI
        store/        # Zustand
        views/        # ページ
        components/   # 共通コンポーネント
      preload/        # Preload API
  web/                # Next.js (将来)
packages/
  shared/             # 共通型・ユーティリティ
    src/types/        # 型定義
  ui/                 # UIコンポーネント
```

**詳細**: directory-structure.md

---

## エラーコード早見表

| プレフィックス | 種別             | 例                     |
| -------------- | ---------------- | ---------------------- |
| ERR_1xxx       | システムエラー   | ERR_1001 INTERNAL      |
| ERR_2xxx       | 認証・認可       | ERR_2006 UNAUTHORIZED  |
| ERR_3xxx       | バリデーション   | ERR_3001 INVALID_INPUT |
| ERR_4xxx       | ビジネスロジック | ERR_4001 NOT_FOUND     |

**詳細**: error-handling.md L8-230

---

## テスト基準早見表

| メトリクス        | 必須 | 推奨 |
| ----------------- | ---- | ---- |
| Line Coverage     | 80%  | 90%+ |
| Branch Coverage   | 75%  | 85%+ |
| Function Coverage | 90%  | 100% |

**詳細**: quality-requirements.md L94-256

---

## セキュリティチェックリスト

- [ ] 入力バリデーション（Zod）
- [ ] IPCチャンネルホワイトリスト
- [ ] XSS対策（DOMPurify）
- [ ] パストラバーサル防止
- [ ] 機密情報ログ出力禁止

**詳細**: security-implementation.md, security-api-electron.md

---

## 新機能追加フロー

1. **型定義**: `packages/shared/src/types/`
2. **サービス**: `apps/desktop/src/main/services/`
3. **IPCハンドラ**: `apps/desktop/src/main/ipc/`
4. **Preload API**: `apps/desktop/src/preload/`
5. **React Hook**: `apps/desktop/src/renderer/hooks/`
6. **UIコンポーネント**: `apps/desktop/src/renderer/components/`
7. **テスト**: 各ディレクトリの`__tests__/`

**詳細**: architecture-patterns.md L8-74

---

## 仕様書テンプレート選択

| 作成対象                  | テンプレート               |
| ------------------------- | -------------------------- |
| インターフェース/型定義   | interfaces-template.md     |
| アーキテクチャ/パターン   | architecture-template.md   |
| API/エンドポイント        | api-template.md            |
| Electron IPC              | ipc-channel-template.md    |
| React Hook                | react-hook-template.md     |
| サービス/ビジネスロジック | service-template.md        |
| UIコンポーネント          | ui-ux-template.md          |
| テスト仕様                | testing-template.md        |
| エラーハンドリング        | error-handling-template.md |
| セキュリティ              | security-template.md       |
| データベース              | database-template.md       |
| デプロイ/CI/CD            | deployment-template.md     |
| 技術スタック              | technology-template.md     |
| Claude Code               | claude-code-template.md    |
| ワークフロー              | workflow-template.md       |
| 汎用                      | spec-template.md           |

---

## 関連ドキュメント

| ドキュメント                 | 用途                      |
| ---------------------------- | ------------------------- |
| resource-map.md              | タスク種別→ファイル逆引き |
| topic-map.md                 | セクション・行番号詳細    |
| spec-guidelines.md           | 仕様書作成ルール          |
| spec-splitting-guidelines.md | ファイル分割ルール        |

---

## 変更履歴

| 日付       | 変更内容                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 2026-03-17 | UT-06-005-A: `handlePermissionCheck` / `sendPermissionRequestWithTimeout` / `PermissionTimeoutError` を型定義クイックアクセスに追加。S32 タイムアウトパターン参照を登録 |
| 2026-03-16 | 「Skill Docs Runtime Integration（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001）を探すとき」セクションを追加 |
