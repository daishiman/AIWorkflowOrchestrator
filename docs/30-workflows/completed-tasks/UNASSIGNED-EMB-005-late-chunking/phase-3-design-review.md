# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 3                                       |
| 機能名     | UNASSIGNED-EMB-005                      |
| タスク名   | Late Chunking実装（検索品質10-30%向上） |
| 前提Phase  | Phase 2                                 |
| 後続Phase  | Phase 4                                 |
| 作成日     | 2026-04-19                              |
| ステータス | pending                                 |

## 目的

Phase 2で設計したアーキテクチャ・サービス層API・統合設計・メモリ設計の矛盾・漏れ・整合・依存をゲート判定し、Phase 4（テスト作成）へ進めるか否かを確定する。

## 背景

Late Chunkingのコンポーネント設計は技術的に複雑であり、実装着手前に設計品質を検証することが重要である。特に以下の観点でリスクが高い:

- バイトオフセットとトークンインデックスのマッピング（offset_mapping依存）
- ウィンドウ分割後の加重平均マージによる品質保証
- 既存EmbeddingServiceの後方互換性維持

## SubAgentチーム編成

| SubAgent   | 関心ごと                     | 主担当                                     |
| ---------- | ---------------------------- | ------------------------------------------ |
| SubAgent-A | 型定義・インターフェース設計 | 型矛盾・API契約整合性レビュー              |
| SubAgent-B | アルゴリズム・コア実装       | アルゴリズム設計の正確性・エッジケース検証 |
| SubAgent-C | 統合・既存APIとの互換性      | 既存EmbeddingService後方互換性レビュー     |
| SubAgent-D | テスト・品質・ベンチマーク   | 設計の検証可能性・テスト戦略整合性判定     |

## 実行タスク

- 矛盾レビュー: 型定義・データフロー・API契約間の矛盾を検査する
- 漏れレビュー: Phase 1受入条件から Phase 2設計への未反映項目を検査する
- 後方互換レビュー: 既存EmbeddingServiceのAPIが設計変更で破壊されないか検査する
- アルゴリズム検証: offset_mapping依存・ウィンドウ分割・加重平均マージの正確性を検査する
- ゲート判定: PASS / MAJOR（差し戻し）/ MINOR（条件付き通過）を判定し、是正タスクを明示する

## 参照資料

| 参照資料             | パス                                                         | 説明           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受入条件             | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`                        | Phase 1 成果物 |
| キャリーオーバー棚卸 | `outputs/phase-1/carryover-inventory.md`                     | Phase 1 成果物 |
| 命名規則分析         | `outputs/phase-1/naming-convention-analysis.md`              | Phase 1 成果物 |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物 |
| サービス層API設計書  | `outputs/phase-2/service-api-design.md`                      | Phase 2 成果物 |
| 既存統合設計書       | `outputs/phase-2/existing-integration-design.md`             | Phase 2 成果物 |
| メモリ設計書         | `outputs/phase-2/memory-design.md`                           | Phase 2 成果物 |
| テスト戦略書         | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物 |

## 実行手順

1. Phase 1・Phase 2 の全成果物を入力として確認する。
2. SubAgent-A が型定義・API契約の矛盾を検査する。
3. SubAgent-B がアルゴリズム設計の正確性とエッジケースを検査する。
4. SubAgent-C が既存EmbeddingServiceとの後方互換性を検査する。
5. SubAgent-D が設計の検証可能性とテスト戦略の整合性を検査する。
6. SubAgent-D が全検査結果を統合しゲート判定（PASS/MAJOR/MINOR）を下す。
7. 成果物を `outputs/phase-3/` に保存する。
8. MAJOR判定の場合は Phase 2 に差し戻し、是正内容を明示する。

## 矛盾チェック表（設計レビュー観点）

| チェック項目                       | 確認内容                                                               | 判定基準                            |
| ---------------------------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| 型矛盾: ChunkBoundary              | `startOffset/endOffset` がバイト単位かコードポイント単位か統一         | 両箇所で単位が一致すること          |
| 型矛盾: HiddenState                | `Float32Array / Float16Array` の使い分けが設計全体で一貫しているか     | 型定義とPooler実装が一致            |
| API矛盾: LateChunkingService       | 入力 `ChunkBoundary[]` と出力 `ChunkEmbeddingResult[]` の対応数        | 入力数 = 出力数が保証されること     |
| データフロー漏れ: offset_mapping   | offset_mappingの取得タイミングと利用箇所が設計に明記されているか       | TokenBoundaryCalculatorに記載       |
| アルゴリズム: ウィンドウ分割境界   | 境界チャンクが複数ウィンドウにまたがる場合の加重平均マージが定義済みか | WeightedMerge戦略が明記されること   |
| アルゴリズム: Pooling戦略          | Mean/Max/CLS の各Poolingが数学的に正確に定義されているか               | 各Poolingの算式が明記されること     |
| 後方互換: EmbeddingService         | 既存の `EmbeddingService.generate()` シグネチャが変更されないか        | 既存APIシグネチャの不変性確認       |
| 後方互換: StrategyパターンのDI     | ChunkingStrategy注入が既存コードのデフォルト動作を変えないか           | デフォルト=EarlyChunkingであること  |
| メモリ設計: Float16精度劣化        | Float16採用による精度劣化がEmbeddingの品質閾値内に収まるか             | 品質差 < 1% が明記されること        |
| メモリ設計: ストリーミング解放     | Pooling後にHidden State配列を解放するタイミングが明記されているか      | 明示的なGC対応が設計に含まれること  |
| CJK/絵文字: offset_mappingの正確性 | マルチバイト文字・サロゲートペアでoffset_mappingが正確に機能するか     | CJKテストケースが設計に含まれること |
| エラー契約: トークン長超過         | 最大トークン長超過時の例外型と回復経路が定義されているか               | エラー型が型定義に含まれること      |

## ゲート判定基準

| 判定  | 条件                                                             | 後続アクション             |
| ----- | ---------------------------------------------------------------- | -------------------------- |
| PASS  | 矛盾チェック表の全項目が「問題なし」                             | Phase 4 へ進む             |
| MINOR | 軽微な未記載項目があるが実装で対処可能（1-2項目）                | Phase 4 開始と並行して是正 |
| MAJOR | 設計の根幹に関わる矛盾・漏れが存在する（型矛盾・後方互換破壊等） | Phase 2 に差し戻し         |

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- 設計段階でテスト困難な観点（offset_mapping精度・Float16精度劣化）を識別し Phase 4 テスト設計へ引き継ぐ。
- 統合ログは `outputs/phase-3/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                                    |
| -------- | --------------------------------------------------------------------------- |
| 矛盾     | 型定義・データフロー・API契約・メモリ設計間の矛盾がないか確認する           |
| 漏れ     | Phase 1受入条件（CJK/絵文字・品質10-30%向上・メモリ計測）が設計に含まれるか |
| 整合性   | 4コンポーネント間のデータフローがPhase 2設計書と一致しているか確認する      |
| 依存関係 | offset_mapping取得に必要なパッケージAPIが確実に利用可能か確認する           |

## 成果物

| 成果物           | パス                                         | 説明                             |
| ---------------- | -------------------------------------------- | -------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | 全チェック項目の結果記録         |
| ゲート判定書     | `outputs/phase-3/gate-decision.md`           | PASS/MAJOR/MINOR判定と是正タスク |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾検査結果（12項目）           |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾チェック表の全12項目を検査した
- [ ] ゲート判定（PASS/MAJOR/MINOR）が確定した
- [ ] MAJOR判定の場合は Phase 2 差し戻し内容が明示されている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列検査
3. SubAgent-D の統合ゲート判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UNASSIGNED-EMB-005-late-chunking
```

## 次のPhase

Phase 4: テスト作成
