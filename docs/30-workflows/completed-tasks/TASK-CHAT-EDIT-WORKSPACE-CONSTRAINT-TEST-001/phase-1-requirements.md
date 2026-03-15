# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 1                                            |
| 機能名 | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日 | 2026-03-14                                   |

## 目的

`chatEditHandlers.ts`（IPC版）の workspacePath セキュリティ検証ロジックに対するテスト要件を定義し、検証可能な受入基準を確立する。

## 実行タスク

- 要件抽出: タスク指示書（TC-WS-01〜06）から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各テストケースに対して検証可能な受け入れ基準を定義
- P50チェック: 既実装状態の調査（既存テストの網羅範囲を確認）

## 参照資料

| 資料名           | パス                                                                                | 説明                           |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| タスク指示書     | `docs/30-workflows/completed-tasks/task-chat-edit-workspace-constraint-test-001.md` | 元のタスク指示書               |
| IPC セキュリティ | `.claude/rules/04-electron-security.md`                                             | IPC セキュリティ原則           |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                  | テスト駆動開発・カバレッジ基準 |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                | P39, P40, P42, P57, P58 等     |

### システム仕様（aiworkflow-requirements）

> `indexes/resource-map.md` の「Workspace Chat Edit AI Runtime 実装」カテゴリと
> `indexes/quick-reference.md` の RuntimeResolver 導線から抽出した必須仕様セット。

| 参照資料                 | パス                                                                                                          | 内容                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Workspace Chat Edit 仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                | workspacePath 境界仕様・`PERMISSION_DENIED`    |
| LLM インターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                         | `SendWithContextRequest.workspacePath?` 型     |
| IPC 契約                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                                     | `chat-edit:send-with-context` request/response |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                             | sender 検証 / workspace 境界 / contextBridge   |
| 教訓                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                | payload 契約ドリフト防止                       |
| 親タスク台帳             | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-workspace-chat-lifecycle-tests.md` | UT-CHAT-EDIT との関連付け                      |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在のテスト状態を確認する。

```bash
# 既存テストファイルの一覧確認
find apps/desktop/src -name "*chatEditHandlers*test*" -o -name "*chatEditHandlers*spec*"

# ipc/chatEditHandlers.ts のテストファイル確認
ls -la apps/desktop/src/main/ipc/__tests__/chatEditHandlers*

# handlers/chatEditHandlers.ts のテストファイル確認
ls -la apps/desktop/src/main/handlers/__tests__/chatEditHandlers*

# 既存テストで workspacePath 関連テストの有無を確認
grep -rn "workspacePath\|workspace\|isAllowedPath" apps/desktop/src/main/ipc/__tests__/chatEditHandlers*
```

| 判定         | 条件                                                  | 対応                                       |
| ------------ | ----------------------------------------------------- | ------------------------------------------ |
| 未実装       | IPC 版の workspacePath テストが存在しない             | Phase 4-5 で新規テスト作成                 |
| 一部実装済み | IPC 版に一部の workspacePath テストが存在する         | Phase 4-5 を「検証・補完」モードに切り替え |
| 完全実装済み | TC-WS-01〜06 相当のテストが IPC 版に全て存在し全 PASS | Phase 4-5 を「確認」モードに切り替え       |

**注意**: `handlers/__tests__/chatEditHandlers.workspace.test.ts` は `handlers/chatEditHandlers.ts` 用のテスト（別ファイル・別責務）であり、IPC 版のテスト代替にはならない（P58 対策）。

### ステップ1: 要件抽出

タスク指示書から以下の要件を抽出する。

#### 機能要件（FR）

| FR ID  | 要件                                                                     | 対応 TC  | 優先度 |
| ------ | ------------------------------------------------------------------------ | -------- | ------ |
| FR-001 | workspacePath 指定時、workspace 内ファイルは正常処理される               | TC-WS-01 | 高     |
| FR-002 | workspacePath 指定時、workspace 外ファイルは PERMISSION_DENIED を返す    | TC-WS-02 | 高     |
| FR-003 | workspacePath 未指定時、isAllowedPath が呼ばれずに処理が続行する         | TC-WS-03 | 高     |
| FR-004 | パストラバーサル攻撃パターンに対して PERMISSION_DENIED を返す            | TC-WS-04 | 高     |
| FR-005 | 複数コンテキストのうち 1 つでも workspace 外なら全体が PERMISSION_DENIED | TC-WS-05 | 高     |
| FR-006 | 空コンテキスト配列で isAllowedPath が呼ばれずに正常処理される            | TC-WS-06 | 中     |

#### 非機能要件（NFR）

| NFR ID  | 要件                                                     | 基準                |
| ------- | -------------------------------------------------------- | ------------------- |
| NFR-001 | workspacePath 検証ブランチの Branch Coverage が 70% 以上 | 70%+                |
| NFR-002 | 既存テストへの影響がない                                 | 全 PASS 維持        |
| NFR-003 | テスト実行時間が既存テストの実行時間を大幅に超えない     | 追加 2 秒以内       |
| NFR-004 | テスト間で状態を共有しない（P9 対策）                    | beforeEach リセット |

### ステップ2: 受け入れ基準作成

各テストケースの検証基準を具体化する。

**AC-001（TC-WS-01）**: `chat-edit:send-with-context` ハンドラに `workspacePath: "/home/user/project"` と `contexts: [{filePath: "/home/user/project/src/index.ts"}]` を渡した場合、`success: true` のレスポンスを返す。

**AC-002（TC-WS-02）**: `chat-edit:send-with-context` ハンドラに `workspacePath: "/home/user/project"` と `contexts: [{filePath: "/etc/passwd"}]` を渡した場合、`{success: false, error: {code: "PERMISSION_DENIED"}}` を返す。

**AC-003（TC-WS-03）**: `chat-edit:send-with-context` ハンドラに `workspacePath` を指定せず `contexts: [{filePath: "/etc/passwd"}]` を渡した場合、`isAllowedPath` が呼ばれずに後続の処理（RuntimeResolver.resolve()）に進む。

**AC-004（TC-WS-04）**: `chat-edit:send-with-context` ハンドラに `workspacePath: "/home/user/project"` と `contexts: [{filePath: "/home/user/project/../../etc/passwd"}]` を渡した場合、`{success: false, error: {code: "PERMISSION_DENIED"}}` を返す。

**AC-005（TC-WS-05）**: `chat-edit:send-with-context` ハンドラに `workspacePath: "/home/user/project"` と `contexts: [{filePath: "/home/user/project/src/index.ts"}, {filePath: "/etc/passwd"}]` を渡した場合、`{success: false, error: {code: "PERMISSION_DENIED"}}` を返す。

**AC-006（TC-WS-06）**: `chat-edit:send-with-context` ハンドラに `workspacePath: "/home/user/project"` と `contexts: []` を渡した場合、`isAllowedPath` が呼ばれずに後続の処理に進む。

## 統合テスト連携（Phase 1）

- 既存テスト実行: `cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers` で既存テストの PASS を確認
- テスト環境: happy-dom 環境（P39: `fireEvent` 使用、`userEvent` 禁止）
- テスト実行ディレクトリ: `apps/desktop` から実行（P40 対策）

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                       | 仕様参照先                                          |
| ------------ | ------------------------------ | --------------------------------------------------- |
| セキュリティ | パストラバーサル攻撃防止の検証 | `aiworkflow-requirements: security-electron-ipc.md` |
| IPC通信      | IPC ハンドラのセキュリティ検証 | `aiworkflow-requirements: api-ipc-agent.md`         |

## 成果物

| 成果物     | パス                                                     | 説明                 |
| ---------- | -------------------------------------------------------- | -------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md`                        | FR/NFR 一覧          |
| 抽出追跡表 | `outputs/phase-1/spec-extraction-traceability-matrix.md` | 仕様抽出網羅性の証跡 |

## 完了条件

- [ ] P50チェック完了: 既存テストの網羅範囲を確認済み
- [ ] FR-001〜FR-006 の機能要件が定義されている
- [ ] NFR-001〜NFR-004 の非機能要件が定義されている
- [ ] AC-001〜AC-006 の受け入れ基準が具体的に記述されている
- [ ] テスト対象ファイルが正本（`ipc/chatEditHandlers.ts`）として特定されている（P58 対策）
- [ ] AuthMode の型定義正本が確認されている（P57 対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. P50チェック: 既実装状態の調査
3. 機能要件の抽出（FR-001〜FR-006）
4. 非機能要件の抽出（NFR-001〜NFR-004）
5. 受け入れ基準の作成（AC-001〜AC-006）
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 2: 設計
