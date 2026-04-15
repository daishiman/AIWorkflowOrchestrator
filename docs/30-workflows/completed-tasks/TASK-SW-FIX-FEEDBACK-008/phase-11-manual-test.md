# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 10                                      |
| 後続Phase  | Phase 12                                      |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

`NON_VISUAL` タスクとして、手動操作時も選択継続が成立することを確認する。

## タスク種別

| 項目         | 値                                                                        |
| ------------ | ------------------------------------------------------------------------- |
| タスク種別   | `NON_VISUAL`                                                              |
| 証跡方針     | `manual-test-result.md` を一次ソースとする                                |
| capture 方針 | `phase11-capture-metadata.json` に `captureMode: "NON_VISUAL"` を記録する |

## 手動テストシナリオ

| ID    | シナリオ                                                                     | 期待結果                       |
| ----- | ---------------------------------------------------------------------------- | ------------------------------ |
| MT-01 | スキル生成成功後、`fetchSkills` 成功時に対象スキルが選択状態になる           | 成功系の継続動作が確認できる   |
| MT-02 | `fetchSkills` を失敗させても対象スキルが選択状態になる                       | 失敗系でも選択継続が確認できる |
| MT-03 | エラーログが `console.warn` へ記録され、`generationError` が主導表示されない | AC-3 と一致する                |

## 実行タスク

- [ ] Phase 10 の判定結果を確認する
- [ ] `manual-test-checklist.md` に実施手順を固定する
- [ ] `manual-test-result.md` に結果を記録する
- [ ] `discovered-issues.md` に blocker / note を整理する
- [ ] `phase11-capture-metadata.json` に `NON_VISUAL` 証跡を記録する

## 統合テスト連携

| 接続点   | 確認内容                                         |
| -------- | ------------------------------------------------ |
| Phase 1  | AC-1 から AC-3 の手動確認版を実施する            |
| Phase 2  | 設計どおり選択継続が働くことを確認する           |
| Phase 5  | 実装した 2 箇所が操作時に機能することを確認する  |
| Phase 6  | `skillName` ガード条件が期待どおりか補助確認する |
| Phase 7  | 分岐網羅のうち手動確認が必要な部分を拾う         |
| Phase 8  | リファクタで挙動が変わっていないことを確認する   |
| Phase 9  | 品質ゲート通過済みの build を手動確認対象とする  |
| Phase 10 | 最終レビューの判定と手動所見を接続する           |

## 完了条件

- [ ] `manual-test-checklist.md` が存在する
- [ ] `manual-test-result.md` に実施結果が記録されている
- [ ] `discovered-issues.md` に blocker / note / none が記録されている
- [ ] `phase11-capture-metadata.json` に `captureMode: "NON_VISUAL"` が記録されている

## 成果物

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/phase11-capture-metadata.json`

## 参照資料

| 資料名          | パス                                         |
| --------------- | -------------------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/requirements-definition.md` |
| Phase 2 成果物  | `outputs/phase-2/design-document.md`         |
| Phase 5 成果物  | `outputs/phase-5/implementation-record.md`   |
| Phase 6 成果物  | `outputs/phase-6/extended-test-record.md`    |
| Phase 7 成果物  | `outputs/phase-7/coverage-report.md`         |
| Phase 8 成果物  | `outputs/phase-8/refactoring-record.md`      |
| Phase 9 成果物  | `outputs/phase-9/quality-report.md`          |
| Phase 10 成果物 | `outputs/phase-10/final-review-result.md`    |
