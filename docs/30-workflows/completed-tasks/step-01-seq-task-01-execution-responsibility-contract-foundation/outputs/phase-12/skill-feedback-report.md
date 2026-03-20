# Phase 12: スキルフィードバックレポート

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 12                                                        |
| 作成日   | 2026-03-20                                                |

## 改善提案

### 提案 1: 設計タスクにおける Phase 4-7 の軽量化

- **現状**: 設計タスク（プロダクションコードなし）でも Phase 4-7（テスト作成・実装・テスト拡充・カバレッジ確認）の全ステップを文書として実行する
- **課題**: 実際にテストコードを書かない設計タスクでは、テストマトリクスや coverage gate が「将来の実装者への handoff 文書」として機能するが、Phase 6-7 の成果物は Phase 4 の拡張にとどまり冗長になりやすい
- **提案**: 設計タスクでは Phase 4-7 を「テスト設計 + カバレッジ目標」の 1 フェーズに統合する variant を検討する
- **リスク**: 統合すると Phase 間のゲート（coverage 未達 -> Phase 6 戻り）が失われる

### 提案 2: P50 チェックの自動化

- **現状**: Phase 1 で手動 grep による現状棚卸し（gap-capability / gap-state / gap-prohibition）を行っている
- **提案**: `scripts/` に P50 チェック用スクリプトを追加し、capability 語彙・state 語彙・禁止ガードの存在を自動検出する
- **期待効果**: Phase 1 の棚卸し時間を短縮し、drift 検出の再現性を高める

### 提案 3: Phase 10 MINOR 指摘の即時 scope-definition 反映ルール

- **現状**: Phase 10 で「新規ファイルが canonical doc set に未記載」という MINOR 指摘が出た場合、Phase 12 の未タスク検出（Task 4）で formalization するまで scope-definition.md が不完全なまま残る
- **課題**: 下流 Task（Task02 着手前）のタイミングで scope-definition.md に未記載のファイルが存在すると、Task02 の実装者が contract の全体像を把握できないリスクがある
- **提案**: Phase 10 MINOR 指摘で「canonical doc set 未記載」が出た場合は、Phase 12 Task 4 を待たず Phase 11 開始前に scope-definition.md を即時更新するルールを task-specification-creator に追加する
- **リスク**: Phase 10 → Phase 11 の切り替えに追加作業が入り、フローが増える。ただし影響範囲は 1 ファイル 1 行の追記のみ

## 改善点なしの項目

- task-specification-creator のフェーズ構造: 設計タスクにも適用可能な粒度で、Phase 1-3 の順次依存構造が有効に機能した
- 3 concern 分解（A/B/C）: capability / state / CTA の分離は自然であり、各 concern の ownership が明確
- simpler alternative の棄却プロセス: Phase 2 で棄却 -> Phase 3 で再確認 -> Phase 8 で再評価の 3 段階が有効に drift を防いだ
- pure function 分離パターン: `execution-capability.ts` を packages/shared に配置することで Renderer / Main 両プロセスから参照可能になり、ownership が一元化された。re-export による consumer 接続も明確
- テスト 278件全 PASS の確認: Concern A/B/C + 統合シナリオ + エッジケースの全組み合わせが contract-matrix と 1:1 対応しており、仕様書とコードの整合性が高い
