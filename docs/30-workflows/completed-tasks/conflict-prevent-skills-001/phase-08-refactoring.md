# Phase 8: リファクタリング

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 8 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

競合防止仕様に残った重複、過剰手順、誤解を招く wording を削り、運用上の最小セットへ圧縮する。

## 実行タスク

1. merge policy の重複記述を削る
2. built-in と custom の説明を一本化する
3. EVALS など条件付き項目の表現を「断定」から「判定条件付き」に揃える

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| Phase 2 design | `docs/30-workflows/conflict-prevent-skills-001/phase-02-design.md` | 重複削減対象 |
| Phase 5 implementation | `docs/30-workflows/conflict-prevent-skills-001/phase-05-implementation.md` | wording 整理対象 |

## 実行手順

### ステップ1: 重複削除

- merge policy table は Phase 2 を正本にする
- 実装フェーズは「何を変えるか」に限定する

### ステップ2: wording 正規化

- built-in: `union`
- custom: `keep-ours`
- conditional: `consumer audit PASS 時のみ`

## 統合テスト連携

- リファクタ後も Phase 4-7 の参照名が変わらないことを確認する

## 多角的チェック観点（AIが判断）

- 抽象化思考: 概念名を増やさずに説明できているか
- 素人思考: 初見でも built-in / custom の違いが分かるか
- 改善思考: 文章量ではなく判断負荷を減らせているか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-18 | wording / duplication 整理 | Lane C |

## 成果物

- `outputs/phase-8/duplication-audit.md`
- `outputs/phase-8/navigation-refactor-summary.md`

## 完了条件

- [ ] merge policy の重複が減っている
- [ ] built-in / custom / conditional の表現が統一されている
- [ ] 参照名 drift がない

## タスク100%実行確認【必須】

- [ ] 重複削除方針を記載した
- [ ] wording 統一を記載した
- [ ] 再参照時の正本を定義した

## 次Phase

Phase 9 では validator と command suite で品質ゲートを確認する。
