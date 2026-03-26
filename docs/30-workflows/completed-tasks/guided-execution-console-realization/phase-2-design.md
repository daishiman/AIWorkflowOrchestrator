# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

root 要件を 3 task に分解し、実行順、責務境界、validation path を設計する。

## 実行タスク

- concern 分解: foundation / session / safety の 3 lane に分ける
- 実行順設計: task 間の直列順と handoff 条件を決める
- validation 設計: Phase 3 以降で確認すべき drift を一覧化する

## 参照資料

| 資料名             | パス                                                                                                            | 説明                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1            | `phase-1-requirements.md`                                                                                       | root 要件                           |
| UI/UX 正本         | `ui-ux-realization.md`                                                                                          | component / state / CTA 契約        |
| 監査マトリクス     | `design-audit-matrix.md`                                                                                        | 多角的判断の根拠                    |
| 実行順マップ       | `execution-topology.md`                                                                                         | 親Phase / 子task / 外部 task の順序 |
| 整合マトリクス     | `system-alignment-matrix.md`                                                                                    | 現行実装と外部 task の関係          |
| canonical workflow | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | upstream 整合                       |

## 実行手順

### ステップ1: task 分割を確定する

Task01 を `入口と shell の正規化`、Task02 を `session と結果の橋渡し`、Task03 を `安全と高度表示` に固定する。

### ステップ2: 実行順を確定する

Task01 の route / label / shared action が閉じてから、Task02 の dock / transcript / artifact を扱い、最後に Task03 で approval / disclosure / advanced console を閉じる。

### ステップ3: review 論点を残す

用語 drift、route drift、manual boundary 破り、consumer auth 誤利用の 4 論点を Phase 3 へ渡す。

### ステップ4: external wave との接続位置を固定する

Skill Creator lane の `w3b` `w4` `w5a` `w5b`、provider modernization lane、governance lane をどこで受けるかを定義し、親パックを「閉じた設計」にしない。

## 統合テスト連携

Task01 は routing と CTA、Task02 は session と share、Task03 は approval と disclosure を統合テスト中心とする。

## 成果物

| 成果物         | パス                                   | 説明                            |
| -------------- | -------------------------------------- | ------------------------------- |
| 設計サマリー   | `outputs/phase-2/design-summary.md`    | task 分割の結論                 |
| task 分割表    | `outputs/phase-2/task-splitting.md`    | lane / ownership / sequence     |
| 検証マトリクス | `outputs/phase-2/validation-matrix.md` | review / test / screenshot 観点 |

## 完了条件

- [ ] task 数が 3 つに固定されている
- [ ] 実行順が直列で定義されている
- [ ] Phase 3 review で確認すべき論点が列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)
