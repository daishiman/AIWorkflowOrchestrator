# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| 機能名     | UNASSIGNED-EMB-005                      |
| タスク名   | Late Chunking実装（検索品質10-30%向上） |
| 前提Phase  | -                                       |
| 後続Phase  | Phase 2                                 |
| 作成日     | 2026-04-19                              |
| ステータス | pending                                 |

## 目的

Late Chunkingは全文エンコード後にチャンク化する手法で、従来の先行チャンク化と比較して検索品質を10-30%向上させる。本Phaseでは実装スコープ・受入条件・既存資産のinventoryを固定し、後続Phaseへの入力を確定する。

## 背景

従来のEmbedding生成パイプラインは、テキストをチャンク化してから各チャンクを個別にエンコードする方式（Early Chunking）を採用している。この方式ではチャンク境界をまたぐ文脈情報が失われるため、長文ドキュメントの意味検索品質が低下する問題がある。

Late Chunkingは以下の手順で動作する:

1. 全文を一括でTransformerモデルに入力し、各トークンのHidden Stateを取得する
2. Hidden Stateに対してチャンク境界を後付けで適用し、プーリング（平均・最大・CLSなど）を行ってチャンクごとのEmbeddingを生成する

これにより、各チャンクが全文の文脈を保持したEmbeddingを持つことができ、検索品質が向上する。

Issue #2272（CLOSED）にて要件が提起されており、`packages/shared/` 配下のembedding-generation-pipelineとして実装する。

## SubAgentチーム編成

| SubAgent   | 関心ごと                     | 主担当                                        |
| ---------- | ---------------------------- | --------------------------------------------- |
| SubAgent-A | 型定義・インターフェース設計 | ChunkBoundary/HiddenState型・サービス契約定義 |
| SubAgent-B | アルゴリズム・コア実装       | Late Chunkingアルゴリズム・プーリング戦略     |
| SubAgent-C | 統合・既存APIとの互換性      | 既存EmbeddingServiceとの結合点・後方互換設計  |
| SubAgent-D | テスト・品質・ベンチマーク   | 品質比較基準・メモリ計測・受入条件判定        |

## 実行タスク

- 要件抽出: Issue #2272とブランチ差分から機能要件・非機能要件を抽出する
- 差分カバレッジ作成: 本ブランチ差分が requirements / design / test / docs へどう反映されるかを明示する
- P50チェック: 現ブランチに `LateChunking` または `late_chunk` 関連の実装が既に存在しないか確認する
- キャリーオーバー確認: 前タスクの成果物のうち本タスクで流用できるものを棚卸しする（既存EmbeddingService, Transformerモデル統合コード等）
- 命名規則分析: 既存コードベースの命名規則（camelCase/PascalCase）・ファイル配置規則を分析する
- 受入条件化: 矛盾なし・漏れなし・整合あり・依存整合の判定基準を定義する

## 参照資料

### 実装・コード

| 資料名                | パス                                                          | 用途                                   |
| --------------------- | ------------------------------------------------------------- | -------------------------------------- |
| 既存EmbeddingService  | `packages/shared/src/services/embedding/embedding-service.ts` | 統合先サービスの現状APIを確認          |
| Embeddingパイプライン | `packages/shared/src/services/embedding/pipeline/`            | パイプライン構成を確認                 |
| Provider実装群        | `packages/shared/src/services/embedding/providers/`           | モデル呼び出し境界と既存責務を確認     |
| 共有型定義            | `packages/shared/src/services/embedding/types/`               | 既存型定義・命名規則を確認             |
| Embeddingテスト       | `packages/shared/src/services/embedding/__tests__/`           | 既存テストのパターン・構造を確認       |
| shared package.json   | `packages/shared/package.json`                                | 依存パッケージ（transformers等）を確認 |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                                        | 用途                     |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------ |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート基準           |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | サービス実装パターン参照 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗契約                 |
| タスク運用         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期ルール           |
| 教訓               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止知見             |
| リソースマップ     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止             |
| 検索スクリプト     | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                             | 仕様抽出コマンド         |

## 実行手順

1. resource-map.md を起点に embedding / shared / transformer カテゴリの対象仕様を確定する。
2. search-spec.js でキーワード（UNASSIGNED-EMB-005, LateChunking, embedding, chunking, HiddenState, pooling）を検索する。
3. P50チェック: `grep -r "lateChunking\|LateChunking\|late_chunk" packages/shared/src/` で既存実装の有無を確認する。
4. キャリーオーバー確認: 既存EmbeddingServiceのAPI・型定義・テスト資産を棚卸しし再利用可能なものを識別する。
5. 命名規則分析: `packages/shared/src/` の既存サービスクラス・型・ファイル名の命名規則を確認する。
6. 抽出した仕様をAPI/Interface/Algorithm/Memory/Quality/Workflowに分類する。
7. 要件と受入条件を矛盾なし・漏れなしの状態で固定する。

## 一次結論として固定する5項目

| 項目                 | 本workflowで固定する内容                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| 真の論点             | 既存Embeddingパイプラインへ Late Chunking を後方互換を壊さず追加できるか   |
| 依存関係・責務境界   | `embedding-service.ts` を façade に保ち、late-chunking配下へ責務を分離する |
| 価値とコストの不均衡 | 検索品質向上は高価値だが、長文時のメモリ増加と境界変換の複雑性が高コスト   |
| 改善優先順位         | 契約定義 → 境界計算 → プーリング → 統合 → 性能検証 → 文書同期              |
| 4条件評価方針        | 価値性 / 実現性 / 整合性 / 運用性を Phase 3/9/10/12 で再判定する           |

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- 品質比較テスト（Late Chunking vs Early Chunking の MRR/NDCG 差分）を統合対象に固定する。
- メモリ計測テストはFull-text入力時のピーク使用量を基準値として記録する。
- 統合ログは `outputs/phase-1/` に保存する。

## 多角的チェック観点（30思考法）

| カテゴリ     | 思考法               | 確認内容                                               |
| ------------ | -------------------- | ------------------------------------------------------ |
| 論理分析系   | 批判的思考           | Late Chunking導入根拠に飛躍がないか確認する            |
| 論理分析系   | 演繹思考             | 仕様前提から必要な契約と制約を導く                     |
| 論理分析系   | 帰納的思考           | 既存embedding系実装の共通パターンを抽出する            |
| 論理分析系   | アブダクション       | 品質低下やOOMの真因仮説を最短で立てる                  |
| 論理分析系   | 垂直思考             | 文脈喪失という主問題へ直線的に掘り下げる               |
| 構造分解系   | 要素分解             | API/Interface/Algorithm/Memory/Workflowへ分解する      |
| 構造分解系   | MECE                 | 要件・成果物・テスト観点の重複漏れを防ぐ               |
| 構造分解系   | 2軸思考              | 実装コスト×品質向上度で優先順位を決める                |
| 構造分解系   | プロセス思考         | 全文入力→境界計算→Pooling→統合の流れを固定する         |
| メタ・抽象系 | メタ思考             | このtaskが実装か仕様先行かの前提を明確化する           |
| メタ・抽象系 | 抽象化思考           | offset/character/token差異を抽象契約へ持ち上げる       |
| メタ・抽象系 | ダブル・ループ思考   | テスト方針と設計前提の両方を見直す                     |
| 発想・拡張系 | ブレインストーミング | 代替Poolingや分割戦略の候補を広く出す                  |
| 発想・拡張系 | 水平思考             | Late Chunking以外の品質向上策と比較する                |
| 発想・拡張系 | 逆説思考             | 全文入力が逆に品質や速度を悪化させる条件を洗う         |
| 発想・拡張系 | 類推思考             | 既存WindowSplitterやpipeline構成との類似を使う         |
| 発想・拡張系 | if思考               | CJK/絵文字/超長文/空文書の分岐を先に洗う               |
| 発想・拡張系 | 素人思考             | 初見開発者が誤る設定項目やAPI誤用点を洗う              |
| システム系   | システム思考         | provider/pipeline/service/testの相互作用を確認する     |
| システム系   | 因果関係分析         | メモリ増加・速度低下・品質向上の因果を整理する         |
| システム系   | 因果ループ           | 分割幅や重み付けが品質へ再帰的に与える影響を監査する   |
| 戦略・価値系 | トレードオン思考     | 品質向上と計算コストの交換条件を定量化する             |
| 戦略・価値系 | プラスサム思考       | 既存EmbeddingServiceを壊さず価値だけを増やす設計を選ぶ |
| 戦略・価値系 | 価値提案思考         | 検索品質改善が利用者体験にどう効くかを明文化する       |
| 戦略・価値系 | 戦略的思考           | 段階導入と後方互換維持の移行順序を設計する             |
| 問題解決系   | why思考              | Early Chunkingで品質が落ちる理由を掘る                 |
| 問題解決系   | 改善思考             | 再発防止策を仕様へ先回りで織り込む                     |
| 問題解決系   | 仮説思考             | overlapやpooling差異の性能仮説を定義する               |
| 問題解決系   | 論点思考             | 品質・速度・メモリ・互換性の論点を分離する             |
| 問題解決系   | KJ法                 | 発見事項を契約/設計/テスト/運用に再クラスタリングする  |

## 成果物

| 成果物               | パス                                                         | 説明                           |
| -------------------- | ------------------------------------------------------------ | ------------------------------ |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | 機能要件と非機能要件           |
| 受入条件             | `outputs/phase-1/acceptance-criteria.md`                     | 検証可能なAC一覧               |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`                        | 既存実装有無の確認結果         |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | 本ブランチ差分の反映範囲       |
| キャリーオーバー棚卸 | `outputs/phase-1/carryover-inventory.md`                     | 前タスク成果物の再利用可否一覧 |
| 命名規則分析         | `outputs/phase-1/naming-convention-analysis.md`              | コードベース命名規則の分析結果 |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | aiworkflow仕様抽出結果         |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | 要件と仕様の対応表             |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] P50チェックを実施し現ブランチの実装有無を記録した
- [ ] キャリーオーバー棚卸しを実施し再利用資産を識別した
- [ ] 命名規則を分析し後続Phaseで使用する規則を固定した
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. P50チェック・キャリーオーバー棚卸し
3. SubAgent-A/B/C の並列作業
4. SubAgent-D の統合判定
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

Phase 2: 設計
