# クイックリファレンス

> 最重要情報への即時アクセス
> 詳細は resource-map.md → 該当ファイル を参照

---

## よく使うパターン

> **検索パターン集・コードパターン早見は [quick-reference-search-patterns.md](quick-reference-search-patterns.md) に分離**
> 機能・タスク別のキーワード分割、読む順番、IPC/Zustand/Result 等のコードスニペットを収録

### AI Chat / LLM Integration Fix 即時導線（2026-03-20）

| 目的 | 最初に開くファイル |
| --- | --- |
| 4タスクの全体像 | `references/workflow-ai-chat-llm-integration-fix.md` |
| parent workflow | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` |
| same-wave artifact inventory | `references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` |
| Task 01 canonical root | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` |
| ChatView error transport 契約 | `references/llm-ipc-types.md`, `references/error-handling-core.md` |
| LLM selector / persistence | `references/ui-ux-llm-selector.md`, `references/arch-state-management-core.md` |
| Workspace stream error | `references/llm-streaming.md`, `references/ui-ux-feature-components-details.md` |
| legacy path 逆引き | `references/legacy-ordinal-family-register.md` |

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
| ViewType拡張       | `ViewType` (`skillAnalysis` / `skillCreate`) | ui-ux-navigation.md |
| Agent改善導線      | `currentSkillName`, `selectedSkillName`, `skillExecutionStatus`, `viewHistory` | workflow-skill-lifecycle-routing-render-view-foundation.md, arch-state-management-core.md, arch-state-management-reference.md |
| SkillCenter analyze handoff | `handleAnalyzeSkill`, `setCurrentSkillName`, `setCurrentView("skillAnalysis")` | workflow-skill-lifecycle-created-skill-usage-journey.md, arch-state-management-reference-permissions-import-lifecycle.md |
| SkillAnalysis close 契約 | `onClose`, `currentSkillName ?? "demo-skill"`, `viewHistory`, `goBack()` | ui-ux-navigation.md, workflow-skill-lifecycle-routing-render-view-foundation.md |
| 権限フォールバック | `AbortReason`, `PermissionFlowContext`, `PermissionFlowResult` | interfaces-agent-sdk-executor-core.md |
| 権限リトライ上限   | `PERMISSION_MAX_RETRIES`      | interfaces-agent-sdk-executor-core.md |
| SafetyGate評価     | `SafetyGatePort`, `DefaultSafetyGate`, `evaluateSafety` | api-ipc-agent-safety.md, security-skill-execution.md |
| Permission Fallback Hook | `processPermissionFallback`, `revokeSessionEntries` | interfaces-agent-sdk-executor-details.md |
| スキル公開レベル   | `SkillVisibility`             | interfaces-agent-sdk-skill.md |
| 公開メタデータ     | `SkillPublishingMetadata`     | interfaces-agent-sdk-skill.md |
| 互換性チェック結果 | `CompatibilityCheckResult`    | interfaces-agent-sdk-skill.md |
| 公開準備状態       | `PublishReadiness`            | interfaces-agent-sdk-skill.md |
| スキルレジストリ   | `SkillRegistryService`        | interfaces-agent-sdk-skill.md |
| スキル配布         | `SkillDistributionService`    | interfaces-agent-sdk-skill.md |
| LLMヘルスチェック結果 | `HealthCheckResult` | llm-ipc-types.md |
| LLM設定同期 | `SetSelectedConfigParams` | llm-ipc-types.md |

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

### スキル公開・配布

| チャンネル                   | 用途           |
| ---------------------------- | -------------- |
| `skill:publishing:register`  | スキル登録     |
| `skill:publishing:update`    | メタデータ更新 |
| `skill:publishing:check-compatibility` | 互換性チェック |
| `skill:publishing:check-readiness` | 公開準備確認 |
| `skill:publishing:publish`   | スキル公開     |
| `skill:publishing:unpublish` | スキル非公開化 |
| `skill:publishing:get-status` | 公開状態取得  |
| `skill:distribution:import`  | スキルインポート |
| `skill:distribution:export`  | スキルエクスポート |
| `skill:distribution:fork`    | スキルフォーク |
| `skill:distribution:share`   | 共有リンク生成 |

### チャット

| チャンネル       | 用途           |
| ---------------- | -------------- |
| `chat:send`      | メッセージ送信 |
| `chat:stream`    | ストリーミング |
| `conversation:*` | 会話履歴管理   |
| `llm:check-health` | LLMヘルスチェック（primary） |
| `llm:set-selected-config` | Renderer→Main 選択同期 |
| `AI_CHECK_CONNECTION` | legacy接続確認（新規利用禁止） |

**詳細**: api-endpoints.md L126-736

---

### IPC契約ドリフト自動検出（UT-TASK06-007）

| 項目 | 値 |
| --- | --- |
| スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts` |
| テスト | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` |
| 実行 | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` |
| ルール | R-01(孤児), R-02(引数不一致/P44), R-03(ハードコード/P27), R-04(未登録) |
| 仕様 | `ipc-contract-checklist.md` / `quality-requirements.md` / `architecture-implementation-patterns-reference-ipc-drift-detection.md` |
| 導線 | `task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed-ipc-contract-preload-alignment.md` / `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/` |
| 未タスク | EXT-001(タプル配列), EXT-002(alias/再export/動的定数), EXT-003(ipcMain.on/safeOn), EXT-004(モジュール分割), EXT-005(R-02精度向上) |
| テスト | 44件（Line 94.94% / Branch 89.92% / Function 100%） |
| 実行時間 | 約2.1秒（NFR-01: 10秒以内） |
| 実測値 | Main 216 handlers / Preload 147 entries / Drifts 169 |

#### CLI コマンド早見表

| コマンド | 用途 |
| --- | --- |
| `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` | Phase 9 品質ゲート（常に exit 0） |
| `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --format json --report-only` | CI/CD 統合（JSON出力） |
| `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict` | error + warning で exit 1 |

#### 検出ルール早見表

| ルール | 名称 | 重大度 | 検出パターン |
| --- | --- | --- | --- |
| R-01 | チャンネル孤児 | warning | Main/Preload の片方のみに存在 |
| R-02 | 引数形式不一致 | error | Main=object, Preload=primitive（P44対応） |
| R-03 | ハードコード文字列 | warning | IPC_CHANNELS 定数でなく文字列リテラル（P27対応） |
| R-04 | 未登録チャンネル | error | Preload にあるが Main にない |

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
| 2026-03-19 | UT-TASK06-007: discovery 導線を completed canonical set に再同期し、implementation pattern detail / completed ledger / EXT-001〜005 を早見表へ反映 |
| 2026-03-18 | UT-TASK06-007: IPC契約ドリフト自動検出セクション（check-ipc-contracts.ts / R-01~R-04 / EXT-001~003）をIPCチャンネル早見表直後に追加 |
| 2026-03-17 | `renderView` 基盤拡張（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）向けに ViewType クイック行を追加 |
| 2026-03-17 | TASK-SKILL-LIFECYCLE-08: SkillVisibility/PublishReadiness/CompatibilityCheckResult 型定義と skill:publishing:*/skill:distribution:* 11チャンネルを追加 |
| 2026-03-16 | 「Skill Docs Runtime Integration（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001）を探すとき」セクションを追加 |
