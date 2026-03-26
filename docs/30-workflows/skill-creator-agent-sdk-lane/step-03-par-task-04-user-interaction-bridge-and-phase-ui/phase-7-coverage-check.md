# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 7                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

question kind、state owner、bridge surface、phase UI block、handoff visible 化の 5 観点が揃っているか確認する。

## 実行タスク

- coverage 観点を owner / bridge / question / UI / regression に分解する
- 抜け漏れを downstream task 境界と照合する
- store owner 化や provenance 再計算の anti-pattern を coverage 観点へ入れる

## 参照資料

| 資料名         | パス                             | 説明           |
| -------------- | -------------------------------- | -------------- |
| Phase 5 実装   | `phase-5-implementation.md`      | 実装対象       |
| Phase 4 テスト | `phase-4-test-creation.md`       | 基本観点       |
| Phase 6 拡充   | `phase-6-test-expansion.md`      | edge case 追加 |
| test matrix    | `outputs/phase-4/test-matrix.md` | ケース一覧     |

## カバレッジ観点

| 観点                | 確認内容                                                             |
| ------------------- | -------------------------------------------------------------------- |
| owner coverage      | engine owner / store cache / local draft の責務分離                  |
| bridge coverage     | getter / submit / event の 3 経路                                    |
| question coverage   | `single_select` / `free_text` / `secret` / `confirm`                 |
| UI block coverage   | phase badge / question host / provenance summary / handoff card      |
| regression coverage | 既存 `planSkill` / `executePlan` / `improveSkillWithFeedback` 互換性 |

## 成果物

| 成果物         | パス                        | 説明       |
| -------------- | --------------------------- | ---------- |
| coverage check | `phase-7-coverage-check.md` | 観点棚卸し |

## 統合テスト連携

- coverage 漏れは Phase 6 の追加ケースへ戻す
- downstream task が detail UI を増やしても Task04 contract を壊さない観点を残す
- owner coverage を store / renderer テストへ反映する

## 完了条件

- [ ] interaction contract の主要観点が揃っている
- [ ] renderer owner 化を防ぐ coverage 観点がある
- [ ] handoff visible 化と provenance summary の観点が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
