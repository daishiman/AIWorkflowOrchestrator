---
task_id: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001
task_name: Late Chunking 責務分離・専用サービス層抽出
task_type: NON_VISUAL
category: refactoring
status: completed
current_phase: 12
created_date: 2026-04-20
issue_number: 2314
---

# TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001

## ユーザー要求の要約

GitHub Issue #2314（closed 状態、仕様参照用）に記載された内容を task-specification-creator skill に準拠した Phase 1-13 の実行可能仕様書へ落とし込む。`packages/shared/src/services/chunking/chunking-service.ts` に混在している Late Chunking 処理を `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts` へ抽出し、責務分離によるテスト観測性向上と将来拡張への耐性を確保する。commit / push / PR は実施しない。

> current fact: 起票時は `LateChunkingService` / 9 メソッド前提だったが、実装は既存 token-level `LateChunkingService` との衝突回避のため `ChunkingLateChunkingAdapter` / 4 メソッド相当の分離として完了した。差分は `outputs/phase-5/implementation-diff-check.md` を正とする。

## 現状整理

- `packages/shared/src/services/chunking/chunking-service.ts` は 638 行に肥大化しており、以下 3 系統の責務を単一クラスに抱えている。
  1. チャンキング戦略ファサード（`FixedChunkingStrategy` / `SentenceChunkingStrategy` 統合）
  2. Contextual Embeddings 処理（LLM を使ったコンテキスト生成とチャンク拡張）
  3. Late Chunking 処理（トークン境界変換・セグメントプーリング・フォールバック）
- Late Chunking 固有の 9 メソッド（`applyLateChunking` / `getTokenEmbeddings` / `determineChunkBoundaries` / `charPositionToTokenIndex` / `poolTokenEmbeddings` / `hasTokenOverlap` / `calculateOverlapTokens` / `findNearestSegment` / `averageEmbeddings`）が `ChunkingService` の private メソッドに埋没している。
- UNASSIGNED-EMB-005 review wave（2026-04-19）Phase 10 final review で「Late Chunking の観測可能性が低く mock では困難」と明記され、責務分離の必要性が確定した。
- TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001（先行タスク）が完了済みで `IEmbeddingClient.getTokenEmbeddings?()` が定義済みである前提。

## 真の論点

1. **SRP 違反**: `ChunkingService` が「戦略統合」本来の責務を超えて Late Chunking アルゴリズムの具体ロジックを保持している。
2. **テスト観測性**: Late Chunking の中間ステップ（境界変換・プーリング重み計算）が private に閉じており、`ChunkingService` 経由では入出力しか検証できない。
3. **将来拡張**: token-level hidden states を使う真の Late Chunking（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001）や `EmbeddingPipeline` 統合（TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001）を重ねると、責務混在が悪化する。

## 価値とコスト

- 価値
  - Late Chunking アルゴリズムを単独テスト可能にし、回帰バグの早期検出を実現する。
  - `chunking-service.ts` の肥大化を解消し、後続タスクの影響範囲特定を容易にする。
  - `poolTokenEmbeddings` 等のアルゴリズム部品を他コンテキストで再利用できる基盤を作る。
- コスト
  - 9 メソッドの抽出と委譲配線が必要。
  - `ChunkingService` コンストラクタに 4 番目のオプショナル引数を追加する後方互換配慮が必要。
  - 新規単体テスト（SEP-01〜SEP-09）の設計・実装が必要。

## 4条件の初期評価

| 条件   | 初期判定 | 主因                                                                           |
| ------ | -------- | ------------------------------------------------------------------------------ |
| 価値性 | PASS     | テスト観測性の向上と後続タスクの影響範囲特定容易化で価値が明確                 |
| 実現性 | PASS     | 既存 9 メソッドのコピー移動と委譲配線で完結。新規アルゴリズムは導入しない      |
| 整合性 | PASS     | 依存方向は `chunking → embedding/late-chunking` の一方向で循環参照を回避できる |
| 運用性 | PASS     | 既存コンストラクタ呼び出しを破壊しない（新引数はオプショナル）                 |

## 最終ゴール

- `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts` が存在し、`applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings` を public メソッドとして持つ。
- `ChunkingService.applyLateChunking()` が `LateChunkingService` に委譲する薄いファサードになる。
- Late Chunking 固有ロジックを `ChunkingService` のモックなしで単体テストできる。
- `ChunkingService.chunk()` の入出力シグネチャを変更せず、既存呼び出し元への影響をゼロにする。

## スコープ

### 含む

- `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts` 新設
- `packages/shared/src/services/embedding/late-chunking/index.ts` 新設（パッケージエクスポート）
- `packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` 新設
- `ChunkingService` からの 9 メソッド移動（ロジック変更なし）
- `ChunkingService` コンストラクタへの `lateChunkingService?: LateChunkingService` 追加
- `chunking-service.integration.test.ts` の委譲動作確認

### 含まない

- `LateChunkingOptions` 型定義の移動（`chunking/types.ts` に残し、`embedding/late-chunking` は chunking/types を参照する一方向のみ）
- `IEmbeddingClient.getTokenEmbeddings()` の新規追加（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 が担当済み）
- `EmbeddingPipeline` との統合（TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 の責務）
- Contextual Embeddings 処理の分離（別タスク候補）
- commit / push / PR 実行

## Phase 一覧

| Phase | 名称             | 仕様書                                               | 目的                                                               | ステータス |
| ----- | ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)   | 移動対象 9 メソッドの一覧化と public/private 分類を固定する        | pending    |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)               | コンストラクタシグネチャ・組み込み方法・ディレクトリ構造を設計する | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md) | 4 条件・30 思考法で設計妥当性を監査する                            | pending    |
| 4     | テスト作成       | phase-4-test-creation.md                             | SEP-01〜SEP-09 を TDD Red フェーズで作成する                       | pending    |
| 5     | 実装             | phase-5-implementation.md                            | 9 メソッドを移動し `ChunkingService` を委譲形に書き換える          | pending    |
| 6     | テスト拡充       | phase-6-test-expansion.md                            | 委譲確認テスト・自動生成フォールバックテストを追加する             | pending    |
| 7     | カバレッジ確認   | phase-7-coverage.md                                  | 移動したメソッドと委譲ロジックのカバレッジを可視化する             | pending    |
| 8     | リファクタリング | phase-8-refactoring.md                               | JSDoc 付与・import 整理・モックの `beforeEach` 集約を行う          | pending    |
| 9     | 品質保証         | phase-9-quality.md                                   | typecheck / lint / targeted test を通す                            | pending    |
| 10    | 最終レビュー     | phase-10-final-review.md                             | 設計事項 1〜4 の実装反映と SEP-01〜SEP-09 PASS を確認する          | pending    |
| 11    | 手動テスト       | phase-11-manual-test.md                              | NON_VISUAL code task として自動テスト結果を代替証跡にする          | pending    |
| 12    | ドキュメント更新 | phase-12-documentation.md                            | Phase 12 mandatory 6 tasks を完了させる                            | pending    |
| 13    | PR作成           | phase-13-pr-creation.md                              | user 承認後にのみ実施する                                          | pending    |

## Canonical Artifacts

| Phase | 成果物                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/method-inventory.md`, `outputs/phase-1/artifact-canonical-list.md`                                                                                                                                                                   |
| 2     | `outputs/phase-2/solution-design.md`, `outputs/phase-2/constructor-signature.md`, `outputs/phase-2/validation-path.md`                                                                                                                                                                              |
| 3     | `outputs/phase-3/design-review-result.md`, `outputs/phase-3/solution-elegance-review.md`, `outputs/phase-3/review-prompt.txt`                                                                                                                                                                       |
| 4     | `outputs/phase-4/test-scenarios.md`, `outputs/phase-4/command-expectations.md`                                                                                                                                                                                                                      |
| 5     | `outputs/phase-5/implementation-diff-check.md`, `outputs/phase-5/patch-plan.md`                                                                                                                                                                                                                     |
| 6     | `outputs/phase-6/regression-expansion-plan.md`                                                                                                                                                                                                                                                      |
| 7     | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                |
| 8     | `outputs/phase-8/refactor-decision-log.md`                                                                                                                                                                                                                                                          |
| 9     | `outputs/phase-9/quality-gate-report.md`                                                                                                                                                                                                                                                            |
| 10    | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                           |
| 11    | `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/discovered-issues.md`                                                                                                                                                                      |
| 12    | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 13    | `outputs/phase-13/local-check-result.md`, `outputs/phase-13/change-summary.md`, `outputs/phase-13/pr-info.md`, `outputs/phase-13/pr-creation-result.md`                                                                                                                                             |

## SubAgent 編成

| Lane   | 役割                                                                 | 実行形態 |
| ------ | -------------------------------------------------------------------- | -------- |
| Lane A | 既存コードの 9 メソッド監査（責務境界・依存先マッピング）            | 並列     |
| Lane B | public/private 分類と テスト観測性設計（SEP-01〜SEP-09 設計）        | 並列     |
| Lane C | ディレクトリ構造整備・`chunking/types.ts` 参照方向固定・委譲配線設計 | 直列     |

## ゲート条件

- Phase 1 → Phase 2: 9 メソッドの移動先判定（public/private）と AC-1〜AC-5 が固定されていること。
- Phase 2 → Phase 3: コンストラクタシグネチャ・組み込み方法（オプションA）・ディレクトリ構造・SEP-01〜SEP-09 が明記されていること。
- Phase 3 → Phase 4: 4 条件 PASS、逆方向参照ゼロ、`LateChunkingOptions` が `chunking/types.ts` に残る方針が確定していること。
- Phase 10 → Phase 11: SEP-01〜SEP-09 全件 PASS、`chunking-service.integration.test.ts` 全件 PASS、`chunking-service.ts` から 9 メソッドが完全に除去されていること。
- Phase 12 → Phase 13: mandatory 6 tasks 完了、`artifacts.json` parity 完了、`phase12-task-spec-compliance-check.md` 作成済み。
- Phase 13: user の明示承認があるまで blocked。

## 参照根拠

### 関連コードパス

- `packages/shared/src/services/chunking/chunking-service.ts`（L358-L586 が対象範囲）
- `packages/shared/src/services/chunking/types.ts`（`LateChunkingOptions` 型定義。移動せず参照のみ）
- `packages/shared/src/services/chunking/interfaces.ts`（`ITokenizer` / `IEmbeddingClient`）
- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`（既存回帰テスト）
- `packages/shared/src/services/embedding/`（`pipeline/` / `providers/` と同階層に `late-chunking/` を新設）

### 関連 skill パス

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-template-core.md`
- `.claude/skills/task-specification-creator/references/review-gate-criteria.md`
- `.claude/skills/task-specification-creator/assets/phase-spec-template.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`

### 関連タスク

| タスクID                                        | 関係               | 理由                                                                         |
| ----------------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001       | 先行タスク（必須） | `IEmbeddingClient.getTokenEmbeddings?()` が定義済みであることが前提          |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | 後続タスク         | 本タスクで作成した `LateChunkingService` を `EmbeddingPipeline` から利用する |
| UNASSIGNED-EMB-005                              | 発見元             | review wave Phase 10 で観測可能性の低さが指摘され本タスクが分離された        |

### GitHub Issue

- daishiman/AIWorkflowOrchestrator Issue #2314（CLOSED、仕様参照用）
