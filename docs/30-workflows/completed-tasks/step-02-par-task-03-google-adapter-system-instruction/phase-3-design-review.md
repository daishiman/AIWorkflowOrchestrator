# Phase 3: 設計レビュー - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 3                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-2-design.md                 |

## 目的

Phase 2 の設計が Phase 1 の要件を満たしているかを検証し、PASS/MINOR/MAJOR の判定を行う。

## 実行タスク

### Task 3-1: 要件カバレッジ検証

| FR番号   | 要件内容                                         | 設計での対応箇所                         | カバレッジ |
| -------- | ------------------------------------------------ | ---------------------------------------- | ---------- |
| FR-03-01 | `formatContents` から systemPrompt を分離        | Task 2-2: 変更後の `formatContents` 実装 | OK         |
| FR-03-02 | `buildRequestBody` ヘルパーメソッド追加          | Task 2-3: `buildRequestBody` 設計        | OK         |
| FR-03-03 | `sendChat` / `streamChat` のリクエストボディ更新 | Task 2-4: 変更差分                       | OK         |
| FR-03-04 | APIバージョン判断                                | Task 2-5: `v1beta` 採用決定              | OK         |

### Task 3-2: 受け入れ基準との照合

| AC番号   | AC内容                                                          | 設計での充足方法                                        | 判定 |
| -------- | --------------------------------------------------------------- | ------------------------------------------------------- | ---- |
| AC-05    | systemPrompt を `system_instruction` フィールドで送信           | `buildRequestBody` で `body.system_instruction` を設定  | OK   |
| AC-06    | systemPrompt なしの場合 `system_instruction` を省略             | `if (request.systemPrompt)` で条件付き追加              | OK   |
| AC-03-01 | `formatContents` が `contents` に systemPrompt を含めない       | systemPrompt 挿入ロジック削除                           | OK   |
| AC-03-02 | `buildRequestBody` がsystemPromptありの場合に正しいボディを返す | `buildRequestBody` 実装コードで対応                     | OK   |
| AC-03-03 | `buildRequestBody` がsystemPromptなしの場合に正しいボディを返す | `if (request.systemPrompt)` の条件分岐                  | OK   |
| AC-03-04 | `sendChat` が `buildRequestBody` を使用                         | `JSON.stringify(this.buildRequestBody(request))` に変更 | OK   |
| AC-03-05 | `streamChat` が `buildRequestBody` を使用                       | `JSON.stringify(this.buildRequestBody(request))` に変更 | OK   |
| AC-07    | `pnpm typecheck` が PASS                                        | `Record<string, unknown>` で型安全                      | OK   |

### Task 3-3: アーキテクチャ整合性チェック

| チェック項目                                                                            | 評価                                                                                            |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| レイヤー依存方向（Renderer → Preload → Main → External）の違反がないか                  | 問題なし。`GoogleAdapter` は Main プロセス内のアダプター層で完結している                        |
| DIP 原則: IPC ハンドラ登録関数の引数型が具象クラスではなくインターフェースか（P61対策） | `sendChat`/`streamChat` のシグネチャ変更なし。`buildRequestBody` は `private` のため DIP 対象外 |
| `system_instruction` フィールドへの型アサーション（`as`）使用がないか（P19対策）        | `Record<string, unknown>` へのプロパティ追加は型アサーション不要                                |
| non-null assertion（`!`）が追加されていないか（P48対策）                                | 追加なし                                                                                        |

### Task 3-4: 既存テストへの影響分析

既存テスト `GoogleAdapter.test.ts` の `ADP-012: リクエスト形式変換` セクションに以下の影響がある:

| テストケース                                       | 影響                                                        | 対応                      |
| -------------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `"should prepend systemPrompt as user message"`    | **Red になる**（設計変更で動作が変わる）                    | Phase 4 で修正・置換      |
| `"should convert LLMChatRequest to Gemini format"` | 影響なし（systemPrompt なし）                               | 修正不要                  |
| `"should convert temperature and maxTokens"`       | 影響なし                                                    | 修正不要                  |
| `ADP-011: sendChat正常` シリーズ                   | 影響なし（`v1beta` への URL 変更でモック URL の更新が必要） | Phase 4 でモック URL 更新 |
| `streamChat` テスト                                | `v1beta` への URL 変更でモック URL の更新が必要             | Phase 4 でモック URL 更新 |
| `checkHealth` テスト                               | `v1beta` への URL 変更でモック URL の更新が必要             | Phase 4 でモック URL 更新 |

**重要**: `baseUrl` を `v1beta` に変更するため、既存テストの MSW モックの URL を `v1` から `v1beta` に更新する必要がある。

### Task 3-5: 設計リスク評価

| リスク                                                                | 深刻度 | 対策                                                     |
| --------------------------------------------------------------------- | ------ | -------------------------------------------------------- |
| `v1beta` への変更が既存テスト全体を破壊するリスク                     | 中     | Phase 4 でモック URL を `v1beta` に一括更新              |
| `system_instruction` フィールドが Gemini API 仕様で非推奨になるリスク | 低     | GA 仕様であり短期では影響なし                            |
| `baseUrl` をカスタム設定したユーザーへの影響                          | 低     | `config?.baseUrl` 優先のため既存カスタム設定は維持される |

## 判定

**PASS**

全要件がカバーされており、重大な設計問題はない。`v1beta` への変更による既存テストの URL 更新は Phase 4 で対処可能な範囲。

### MINOR 指摘事項（Phase 4 で対処）

1. **既存テストの MSW モック URL 更新**: `v1beta` 変更により `v1/models/*` のパターンを `v1beta/models/*` に更新する必要がある（`ADP-011`、`ADP-012`、`streamChat`、`checkHealth`、`Error Mapping` のモック URL 全件）
2. **`system_instruction` 対応の新規テストケース追加**: AC-05、AC-06、AC-03-01〜AC-03-03 を検証するテストを追加する

## 参照資料

| 資料名     | パス                      | 内容            |
| ---------- | ------------------------- | --------------- |
| 要件定義書 | `phase-1-requirements.md` | FR・NFR・AC定義 |
| 設計書     | `phase-2-design.md`       | 変更前後の設計  |

## 統合テスト連携

本レビューの MINOR 指摘事項（既存テスト URL 更新・新規テスト追加）は Phase 4 で対処する。Task02（AnthropicAdapter更新）との並列実行に影響はない。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

## 成果物

| 成果物       | パス                                     | 説明                 |
| ------------ | ---------------------------------------- | -------------------- |
| 設計レビュー | `phase-3-design-review.md`（本ファイル） | PASS/MINOR/MAJOR判定 |

## 完了条件

- [x] 全 FR に対するカバレッジが確認されている
- [x] 全 AC に対する充足方法が確認されている
- [x] アーキテクチャ整合性チェックが完了している
- [x] 既存テストへの影響が分析されている
- [x] PASS/MINOR/MAJOR 判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 4: テスト作成（TDD: Red）
