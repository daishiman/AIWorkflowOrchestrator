---
task_id: UNASSIGNED-EMB-005-A
task_name: XenovaTransformerEncoder 実装
category: 機能追加
target_feature: Late Chunking - IEncoder 具体実装クラス（@xenova/transformers 連携）
priority: 中
scale: 中規模
status: completed
issue_number: 2312
created_date: 2026-04-20
dependencies:
  - UNASSIGNED-EMB-005
---

# UNASSIGNED-EMB-005-A: XenovaTransformerEncoder 実装

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UNASSIGNED-EMB-005-A                                           |
| タスク名     | XenovaTransformerEncoder 実装                                  |
| 分類         | 機能追加                                                       |
| 対象機能     | Late Chunking - IEncoder 具体実装（@xenova/transformers 連携） |
| 優先度       | 中                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | completed                                                      |
| GitHub Issue | #2312（CLOSED。reopen 不要・本仕様書ベースで実装）             |
| 依存タスク   | UNASSIGNED-EMB-005（完了済み）                                 |
| タスク種別   | NON_VISUAL（UI 変更なし）                                      |
| 作成日       | 2026-04-20                                                     |
| 発見元       | UNASSIGNED-EMB-005 Phase 12 未タスク検出                       |

## 背景・課題

`UNASSIGNED-EMB-005` で Late Chunking 機能を実装した結果、コアとして `IEncoder` インターフェースによる抽象化を導入した。

```typescript
// packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts
export interface EncoderOutput {
  hiddenStates: Float32Array[];
  offsetMapping: [number, number][];
}

export interface IEncoder {
  encode(text: string): Promise<EncoderOutput>;
}
```

`LateChunkingService` は DI（依存性注入）で `IEncoder` を受け取る設計になっているが、**具体実装クラスが存在しない**ため「インターフェース定義のみで動かない」状態が継続している。利用者は `@xenova/transformers` の `AutoTokenizer` / `AutoModel` 呼び出しやテンソル変換、エラーハンドリングを毎回自前で書く必要があり、参入障壁が高い。

## 目的・ゴール

`@xenova/transformers` の `AutoTokenizer` と `AutoModel` を利用して `IEncoder` を実装した `XenovaTransformerEncoder` クラスを提供し、`LateChunkingService` をそのまま使える状態にする。

具体的には次の性質を満たす：

- `IEncoder` を完全に implements
- コンストラクタでモデル名を指定可能（デフォルト: `Xenova/all-MiniLM-L6-v2`）
- モデル読み込み失敗・OOM・エンコード失敗を `EmbeddingError` / `OutOfMemoryError` に適切に変換
- ユニットテスト・統合テスト・型チェック・Lint 全件 PASS

## スコープ

### 対象

- `XenovaTransformerEncoder` クラス実装（`packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`）
- `encode()` メソッドのトークナイズ・推論・`hiddenStates`/`offsetMapping` 抽出ロジック
- モデル遅延ロードと二重ロード防止
- エラーハンドリング（モデル読み込み失敗 / OOM / エンコード失敗）
- ユニットテスト（`@xenova/transformers` モック）
- `LateChunkingService` との統合テスト
- `index.ts` へのエクスポート追加

### 対象外

- `LateChunkingService` 本体の変更（UNASSIGNED-EMB-005 完了済み）
- `@xenova/transformers` 以外のバックエンド対応（OpenAI API / ONNX ほか）
- Electron 環境での E2E 動作確認（別タスクで扱う）
- fine-tuning・カスタムモデル配布
- UI コンポーネント変更（NON_VISUAL タスク）

## 受入基準

| ID   | 基準                                                                                       | 検証方法              |
| ---- | ------------------------------------------------------------------------------------------ | --------------------- |
| AC-1 | `XenovaTransformerEncoder` が `IEncoder` インターフェースを完全実装している                | TypeScript コンパイル |
| AC-2 | `encode()` が `hiddenStates: Float32Array[]` と `offsetMapping: [number, number][]` を返す | ユニットテスト        |
| AC-3 | モデル読み込み失敗時に `EmbeddingError` がスローされる                                     | ユニットテスト        |
| AC-4 | OOM 発生時に `OutOfMemoryError` がスローされる                                             | ユニットテスト        |
| AC-5 | コンストラクタでカスタムモデル名を指定できる                                               | ユニットテスト        |
| AC-6 | `LateChunkingService` に渡して `generateChunkEmbeddings()` が動作する                      | 統合テスト            |
| AC-7 | `index.ts` から `XenovaTransformerEncoder` がエクスポートされている                        | コードレビュー        |
| AC-8 | 全テスト PASS・`pnpm typecheck` PASS・`pnpm lint` PASS                                     | CI                    |

## 実装対象ファイル

- 新規: `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`
- 新規: `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-transformer-encoder.test.ts`
- 新規: `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-encoder-integration.test.ts`
- 変更: `packages/shared/src/services/embedding/late-chunking/index.ts`（export 追加のみ）
- 追加依存（未導入の場合のみ）: `pnpm --filter @repo/shared add @xenova/transformers`

## Phase 一覧

| Phase    | 名称                              | 仕様書                                                 | ステータス |
| -------- | --------------------------------- | ------------------------------------------------------ | ---------- |
| Phase 1  | 要件定義                          | [phase-1-requirements.md](phase-1-requirements.md)     | 完了       |
| Phase 2  | 設計                              | [phase-2-design.md](phase-2-design.md)                 | 完了       |
| Phase 3  | 設計レビュー                      | [phase-3-design-review.md](phase-3-design-review.md)   | 完了       |
| Phase 4  | テスト作成（Red・TDD）            | [phase-4-test-creation.md](phase-4-test-creation.md)   | 完了       |
| Phase 5  | 実装（Green）                     | [phase-5-implementation.md](phase-5-implementation.md) | 完了       |
| Phase 6  | テスト拡張（統合・境界）          | [phase-6-test-expansion.md](phase-6-test-expansion.md) | 完了       |
| Phase 7  | カバレッジ確認                    | [phase-7-coverage.md](phase-7-coverage.md)             | 完了       |
| Phase 8  | リファクタリング                  | [phase-8-refactoring.md](phase-8-refactoring.md)       | 完了       |
| Phase 9  | 品質保証                          | [phase-9-quality.md](phase-9-quality.md)               | 完了       |
| Phase 10 | 最終レビュー                      | [phase-10-final-review.md](phase-10-final-review.md)   | 完了       |
| Phase 11 | 手動テスト                        | [phase-11-manual-test.md](phase-11-manual-test.md)     | 完了       |
| Phase 12 | ドキュメント・概念説明・skill反映 | [phase-12-documentation.md](phase-12-documentation.md) | 完了       |
| Phase 13 | PR 作成                           | [phase-13-pr.md](phase-13-pr.md)                       | 未着手     |

## 実行順序と並列可能性

- **Phase 1 → 2 → 3**（設計フェーズ）: 直列実行。前 Phase 完了後に次へ
- **Phase 4 → 5**: TDD に従い直列（Red → Green）
- **Phase 6 〜 Phase 9**: 実装完了後、観点が独立するため並列可能（テスト拡張/カバレッジ/リファクタ/品質）
- **Phase 10 〜 13**: 直列実行（最終レビュー → 手動テスト → ドキュメント → PR）

## 成果物配置

- 仕様書: 本ディレクトリ直下 `phase-1-*.md` 〜 `phase-13-*.md`
- 実装成果物・レポート: `outputs/phase-<N>/` 配下
  - 例: `outputs/phase-7/coverage-report.md`, `outputs/phase-10/final-review-result.md`, `outputs/phase-11/manual-test-result.md`, `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`

## 関連リンク

- 親タスク: [UNASSIGNED-EMB-005 Late Chunking Review Wave](../UNASSIGNED-EMB-005-late-chunking/index.md)
- 元仕様書: [UNASSIGNED-EMB-005-A.md](../unassigned-task/UNASSIGNED-EMB-005-A.md)
- 元仕様書（拡張版）: [UNASSIGNED-EMB-005-A-iencoder-implementation.md](../unassigned-task/UNASSIGNED-EMB-005-A-iencoder-implementation.md)
- 既存 IEncoder 定義: [late-chunking-types.ts](../../../packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts)
- 既存 LateChunkingService: [late-chunking-service.ts](../../../packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts)
- 既存エクスポート: [index.ts](../../../packages/shared/src/services/embedding/late-chunking/index.ts)
- GitHub Issue: [#2312](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2312)（CLOSED）
- 外部ライブラリ: [@xenova/transformers](https://github.com/xenova/transformers.js)

## 注意事項

- Issue #2312 は **CLOSED のまま** 本仕様書をベースに実装する（reopen 不要）
- Phase 13 の PR ブランチ名は `feat/UNASSIGNED-EMB-005-A-xenova-encoder` を推奨
- 本仕様書ブランチは `docs/task-spec-UNASSIGNED-EMB-005-A`
- 実装・検証・Phase 12 close-out は本ワークツリーで完了済み。コミット・PR は未実施
