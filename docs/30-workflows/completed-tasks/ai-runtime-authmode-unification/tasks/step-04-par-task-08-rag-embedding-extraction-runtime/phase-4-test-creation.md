# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001              |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 更新日     | 2026-03-19                                                    |
| 機能名     | rag-embedding-extraction-runtime                              |

## 目的

index / embedding / extraction / graph summary の回帰テスト仕様を作る。TDD の Red フェーズとして、実装前にテストケースを設計し、capability matrix 全体をカバーするテストマトリクスを構築する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                                                                          |
| ------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | API key がテストコードにハードコードされていないこと。mock で代替する                               |
| アーキテクチャ     | 適用     | RAG pipeline の各層（Main / shared / IPC）ごとにテストを分離する                                    |
| API設計            | 適用     | IPC handler のレスポンス形式（`{ success, data }` / `{ success, error }`）を事前合意する（P60対策） |
| エラーハンドリング | 適用     | fail-fast パターンと guidance エラーの区別をテストケースに含める                                    |
| パフォーマンス     | 適用     | long-running job のタイムアウト・キャンセルシナリオをケースに含める                                 |

## 事前確認【必須】

### 既存ユーティリティ重複検出（P50対策）

テスト対象機能で使用するユーティリティが既存にないかを確認する。

```bash
# RAG/embedding 関連の既存テストユーティリティを検索
grep -rn "mock.*[Ee]mbedding\|mock.*[Rr]ag\|mock.*[Ii]ndex\|mock.*[Gg]raph" \
  apps/desktop/src/**/*.test.ts \
  packages/shared/src/**/*.test.ts

# 既存の test helper / fixture を確認
find apps/desktop/src packages/shared/src -name "*.test-helper.*" -o -name "*.fixture.*" -o -name "__mocks__" -type d
```

重複がある場合は新規作成せず、既存ユーティリティを再利用する。

### IPCレスポンス形式の事前合意（P60対策）

Phase 5 実装との齟齬を防ぐため、IPC レスポンスの wrapper 形式を Phase 4 時点で確定する。

```bash
# 既存 IPC handler のレスポンス形式を確認
grep -rn "success:" apps/desktop/src/main/ipc/aiHandlers.ts | head -20
```

- 成功時: `{ success: true, data: T }`
- 失敗時: `{ success: false, error: { code: string, message: string } }`

テストのアサーションはこの形式に合わせて記述する。

### テスト対象ファイルの import 副作用チェック

```bash
# トップレベル副作用（即時実行、グローバル変数変更）がないか確認
head -50 apps/desktop/src/main/ipc/aiHandlers.ts
head -50 packages/shared/src/services/search/hybrid-rag-engine.ts
head -50 packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts
```

副作用がある場合は `vi.mock()` で分離するか、dynamic import を使用する。

## 実行タスク

- テスト観点整理: capability matrix、guidance、job 状態、mock 排除、rate limit / timeout を test matrix の列へ落とし込む
- ケース作成: Main / shared service / IPC の各層で command と expected result を明示した Red ケースを定義する
- command suite 作成: dry-run / grep / vitest コマンドを `red-state-command-suite.md` に固定し、期待 Red 状態を記録する

### Task 1: テスト観点整理

以下の観点でテストケースを体系的に整理する:

- **capability matrix**: 各 provider（OpenAI / Anthropic / Google 等）の embedding / index / extraction 対応状況をテストパラメータ化する
- **guidance**: AI runtime から返される guidance メッセージの検証（unsupported capability 時の代替案提示）
- **job 状態**: index / embedding ジョブの状態遷移（pending -> running -> completed / failed / cancelled）
- **mock 排除**: 外部 AI サービスの mock を最小限にし、integration test では実際のレスポンス構造を検証する
- **rate limit / timeout**: provider の rate limit 到達時の retry / backoff、long-running job のタイムアウト処理

### Task 2: ケース作成

Main / shared service / IPC の層ごとにケースを定義する:

| 層             | テスト対象                                                                                                                   | 主要ケース                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Main           | `AI_CHECK_CONNECTION` / `AI_INDEX` handler                                                                                   | 正常系、provider 未設定、capability 未対応、connection failure   |
| shared service | embedding-pipeline / llm-query-classifier / entity-extractor / relation-extractor / hybrid-rag-engine / community-summarizer | pipeline 正常系、provider failure、partial failure、fallback     |
| IPC            | handler 登録 / レスポンス形式                                                                                                | wrapper 形式検証、バリデーションエラー、P42準拠3段バリデーション |

### Task 3: テストファイル作成

```bash
# テスト実行ディレクトリの確認（P40対策）
pnpm --dir apps/desktop exec vitest run src/main/ipc/aiHandlers.test.ts --dry-run
pnpm --dir packages/shared exec vitest run src/services/search/hybrid-rag-engine.test.ts --dry-run
```

## 実行手順

### ステップ1: 事前確認を実施する

既存ユーティリティ重複、IPC レスポンス形式、import 副作用を先に確認し、Red フェーズの前提を固定する。

### ステップ2: aiworkflow 正本を確認する

IPC 契約、embedding pipeline、RAG pipeline、error-handling の正本を参照し、テスト観点の取りこぼしを防ぐ。

### ステップ3: test matrix を作成する

Main / shared service / IPC の各層で、`command` `expected red state` `expected green state` を含むテストマトリクスを作成する。

### ステップ4: Red command suite を作成する

実行コマンドと期待結果を `red-state-command-suite.md` に固定し、Phase 5 の Green 実装前に失敗条件を明文化する。

### ステップ5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 参照資料

| 参照資料                         | パス                                                                                    | 内容                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Phase 1（要件定義）              | `phase-1-requirements.md`                                                               | capability 前提を確認する                                     |
| Phase 2（設計）                  | `phase-2-design.md`                                                                     | テスト対象の責務境界を確認する                                |
| Phase 3（設計レビュー）          | `phase-3-design-review.md`                                                              | レビューで確定した観点を確認する                              |
| aiHandlers                       | `apps/desktop/src/main/ipc/aiHandlers.ts`                                               | `AI_CHECK_CONNECTION` / `AI_INDEX` の主要ケースを確認する     |
| llm-query-classifier             | `packages/shared/src/services/search/llm-query-classifier.ts`                           | query classifier の主要ケースを確認する                       |
| entity-extractor                 | `packages/shared/src/services/extraction/entity-extractor.ts`                           | entity extraction の主要ケースを確認する                      |
| relation-extractor               | `packages/shared/src/services/extraction/relation-extractor.ts`                         | relation extraction の主要ケースを確認する                    |
| community-summarizer             | `packages/shared/src/services/graph/community-summarizer.ts`                            | community / graph summary の主要ケースを確認する              |
| hybrid-rag-engine                | `packages/shared/src/services/search/hybrid-rag-engine.ts`                              | backend AI pipeline の主要ケースを確認する                    |
| api-ipc-system-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`              | `AI_CHECK_CONNECTION` / `AI_INDEX` の現行契約を確認する       |
| interfaces-rag                   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                   | entity / relation extraction と GraphRAG の上位契約を確認する |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | `IEntityExtractor` と fallback 抽出器の契約を確認する         |
| api-internal-embedding           | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`           | embedding API の request / response を確認する                |
| llm-embedding                    | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                    | embedding provider / pipeline 契約を確認する                  |
| architecture-rag                 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | RAG アーキテクチャ責務境界を確認する                          |
| rag-search-hybrid                | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                | HybridRAG 4 stage pipeline を確認する                         |
| rag-search-crag                  | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`                  | CRAG evaluation / correction action を確認する                |
| rag-query-pipeline               | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`               | GraphRAG / HybridRAG / CRAG の接続点を確認する                |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | fail-fast / guidance エラーの扱いを確認する                   |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC 引数検証、秘密情報非露出、guidance-only 契約を確認する    |
| コード品質ルール                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | TDD 原則・テスト設計の注意を確認する                          |
| 既知の落とし穴                   | `.claude/rules/06-known-pitfalls.md`                                                    | P9, P39, P40, P41, P60 を事前確認する                         |

## 統合テスト連携

AI_INDEX、AI_CHECK_CONNECTION、embedding、query classifier、entity / relation extraction、graph summary、GraphRAG、HybridRAG、CRAG、reranking を 1 つの test matrix にまとめる。

## サブタスク管理

Phase 4 実行開始時に以下のサブタスクを作成する:

- [ ] ST-4-1: テスト観点整理（capability matrix / guidance / job 状態 / mock 排除 / rate limit）
- [ ] ST-4-2: Main 層テストケース定義（aiHandlers）
- [ ] ST-4-3: shared service 層テストケース定義（embedding / RAG / extraction）
- [ ] ST-4-4: IPC 層テストケース定義（レスポンス形式 / バリデーション）
- [ ] ST-4-5: テストマトリクス文書作成

## 成果物

| 成果物            | パス                                         | 内容                                 |
| ----------------- | -------------------------------------------- | ------------------------------------ |
| テストマトリクス  | `outputs/phase-4/test-matrix.md`             | 主要ケースと責務境界を整理する       |
| Red command suite | `outputs/phase-4/red-state-command-suite.md` | 実行コマンドと期待失敗結果を整理する |

## 完了条件

- [ ] 主要ケースが index / embedding / extraction / graph summary / guidance を含んでいる
- [ ] IPCレスポンス形式が事前合意されている（P60対策）
- [ ] 既存ユーティリティの重複検出が完了している（P50対策）
- [ ] テスト対象ファイルの import 副作用チェックが完了している
- [ ] capability matrix の全 provider に対するテストパラメータが定義されている
- [ ] test matrix に `command` `expected red state` `expected green state` が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 4
```

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
