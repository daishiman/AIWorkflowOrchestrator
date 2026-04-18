# Phase 7: カバレッジ確認

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 7 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

acceptance criteria、競合分類、テストケースの対応を可視化し、未到達の論点を残さない。

## 実行タスク

1. AC-1〜AC-7 と TC 群の対応表を作成する
2. generated / mirror / log / metadata の coverage を比較する
3. 未到達の論点を follow-up か本 wave 継続かに分類する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| Phase 1 AC | `docs/30-workflows/conflict-prevent-skills-001/phase-01-requirements.md` | coverage 基準 |
| Phase 4/6 spec | `docs/30-workflows/conflict-prevent-skills-001/phase-04-test-creation.md` | TC 参照 |

## 実行手順

### ステップ1: coverage matrix 作成

| 軸 | 内容 |
| --- | --- |
| AC 軸 | AC-1〜AC-7 |
| conflict class 軸 | generated / mirror / log / metadata |
| command 軸 | verify / grep / merge simulation / regenerate |

### ステップ2: gap 判定

- command が存在しない gap
- output path が未定義の gap
- consumer audit が未完了なために確定できない gap

## 統合テスト連携

- Phase 9 品質保証の command suite へ coverage 結果を渡す

## 多角的チェック観点（AIが判断）

- MECE: coverage の切り口が重複・欠落なく整理されているか
- 論点思考: 未到達 gap が曖昧な TODO になっていないか
- プラスサム思考: 本 wave で潰す価値と follow-up に送る価値を分けられるか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-17 | coverage matrix 作成 | Lane C |

## 成果物

- `outputs/phase-7/coverage-matrix.md`
- `outputs/phase-7/gap-list.md`
- `outputs/phase-7/traceability-report.md`

## 完了条件

- [ ] AC と TC の対応が見える
- [ ] 未到達 gap の扱いが決まっている
- [ ] metadata 領域の扱いが schema 不変として明記されている

## タスク100%実行確認【必須】

- [ ] coverage 軸を定義した
- [ ] gap を分類した
- [ ] Phase 9 へ接続した

## 次Phase

Phase 8 では重複した方針や過剰な補助手順を削って文書を簡潔化する。
