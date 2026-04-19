# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 6                  |
| 機能名     | UNASSIGNED-EMB-005 |
| タスク名   | Late Chunking実装  |
| 前提Phase  | Phase 5            |
| 後続Phase  | Phase 7            |
| 作成日     | 2026-04-19         |
| ステータス | pending            |

## 目的

回帰経路を拡張して境界欠陥を捕捉し、Late Chunkingの異常系・耐久性を担保する。

## 背景

Phase 5でGreenに移行したテストは最小実装に対応するものに限られる。実運用では大規模テキスト処理時のメモリ枯渇、ネットワーク断絶によるタイムアウト、不正なトークン境界入力など多様な失敗経路が存在する。またEmbeddingService既存コードパスの回帰を防ぐためのガードテストも必要である。

## SubAgentチーム編成

| SubAgent   | 関心ごと                   | 主担当                                      |
| ---------- | -------------------------- | ------------------------------------------- |
| SubAgent-A | 異常系テスト               | OOMシミュレーション・タイムアウト・不正境界 |
| SubAgent-B | 回帰テスト                 | 既存EmbeddingService動作確認                |
| SubAgent-C | 補助コマンド・テストツール | テストヘルパー・モック整備                  |
| SubAgent-D | 統合監査                   | 矛盾・漏れ・整合・依存判定                  |

## 実行タスク

- fail pathの追加: 異常系ケースを網羅する
- 回帰guardの追加: 既存EmbeddingService動作が変わらないことを保証する
- 補助commandの追加: テスト支援スクリプトとモックを整備する

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| Red結果          | `outputs/phase-4/red-test-result.md`        | Phase 4 成果物 |
| 統合テスト計画   | `outputs/phase-4/integration-test-plan.md`  | Phase 4 成果物 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | Phase 5 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-6/` に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 異常系テストケース詳細

### OOMシミュレーション

- `LateChunkingService` に極端に大きな入力（100万トークン相当）を渡し、メモリエラーを確認する
- `Float32Array` のアロケーション失敗時に `OutOfMemoryError` が上位に伝播することを確認する
- バッチサイズを `batchSize: 1` に設定し、逐次処理でもOOM状況を再現する

### タイムアウト

- エンコーダのモックに人工的な遅延（5000ms超）を注入し、タイムアウトエラーが返ることを確認する
- `AbortSignal` を使ったキャンセル伝播が正常に動作することを確認する

### 不正トークン境界

- `ChunkBoundary.startToken > endToken` となる不正な入力に対して `InvalidBoundaryError` がスローされることを確認する
- `startChar` / `endChar` がテキスト長を超える場合に `RangeError` がスローされることを確認する
- 空文字列（`""`）を入力した場合に空配列が返り、エラーにならないことを確認する

## 回帰テストケース詳細

### 既存EmbeddingService動作確認

- `useLateChunking: false`（デフォルト）の場合、従来の埋め込み生成フローが変わらないことを確認する
- `LateChunkingService` モジュールがインポートされていても、従来フローのパフォーマンスに劣化がないことを確認する
- `useLateChunking: true` で生成されたベクトルの次元数が従来フローと一致することを確認する

## 補助コマンド・テストツール整備

- `createMockHiddenStates(tokenCount: number): HiddenState[]` ヘルパー関数を実装する
- `createTestChunkBoundaries(text: string, chunkSize: number): ChunkBoundary[]` ヘルパー関数を実装する
- エンコーダのモックファクトリを整備し、任意の遅延・エラーを注入可能にする

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test

# 異常系テストのみ実行
pnpm --filter @repo/shared test -- --testPathPattern="late-chunking.*edge"

# 回帰テストのみ実行
pnpm --filter @repo/shared test -- --testPathPattern="embedding-service.*regression"
```

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- `LateChunkingService` と `EmbeddingService（useLateChunking=true/false）` を統合対象に固定する。
- 異常系でスローされるエラーの型とメッセージが仕様と一致することをログで突合する。
- 統合ログは `outputs/phase-6/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                     |
| -------- | ------------------------------------------------------------ |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                           |
| 漏れ     | 要件から成果物への未反映項目がないか確認する                 |
| 整合性   | 異常系エラー型がインターフェース定義と一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する                |

## 成果物

| 成果物           | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加テスト一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 回帰結果       |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | 異常系検証結果 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] OOMシミュレーションテストがGreenになる
- [ ] タイムアウトテストがGreenになる
- [ ] 不正トークン境界テストがGreenになる
- [ ] 既存EmbeddingService回帰テストがGreenになる
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. テスト実行・結果確認
5. 成果物出力
6. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UNASSIGNED-EMB-005-late-chunking
```

## 次のPhase

Phase 7: テストカバレッジ確認
