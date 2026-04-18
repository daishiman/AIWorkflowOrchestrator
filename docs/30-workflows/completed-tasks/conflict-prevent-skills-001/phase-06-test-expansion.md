# Phase 6: テスト拡充

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 6 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

Phase 4 / 5 で定義した merge、generator、parity、consumer audit に対し、境界条件と回帰ケースを追加する。

## 実行タスク

1. merge simulation の異常系を追加する
2. generator の差分なし再実行ケースを追加する
3. `LOGS.md` archive の境界条件を追加する
4. EVALS schema drift の negative case を追加する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| phase execution template | `.agents/skills/task-specification-creator/references/phase-template-execution.md` | Phase 6 骨格 |
| Phase 4 spec | `docs/30-workflows/conflict-prevent-skills-001/phase-04-test-creation.md` | 追加対象 |

## 実行手順

### ステップ1: edge case 追加

- custom driver 未登録時の fail-fast
- regenerate 後に差分が残るケース
- `LOGS.md` が archive しきい値未満のケース
- EVALS を参照する consumer が見つかったケース

### ステップ2: 回帰テスト整理

- `.claude` 正本更新後に `.agents` mirror parity が崩れていないか
- `topic-map.md` 以外の index を壊していないか

## 統合テスト連携

- Phase 7 の coverage matrix に edge case を反映する

## 多角的チェック観点（AIが判断）

- 帰納的思考: 実行例から抜けている境界条件を補えているか
- if思考: driver 未設定、hook 未実行、regen 忘れのときどうなるか
- 問題解決系: 再発しやすい failure mode が test へ落ちているか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-16 | edge case matrix 追加 | Lane C |

## 成果物

- `outputs/phase-6/expanded-test-matrix.md`
- `outputs/phase-6/regression-checks.md`
- `outputs/phase-6/failure-mode-catalog.md`

## 完了条件

- [ ] edge case が定義されている
- [ ] regression case が列挙されている
- [ ] consumer audit negative case がある

## タスク100%実行確認【必須】

- [ ] 境界条件を追加した
- [ ] 回帰観点を追加した
- [ ] failure mode を記録した

## 次Phase

Phase 7 では acceptance criteria と test coverage の対応を可視化する。
