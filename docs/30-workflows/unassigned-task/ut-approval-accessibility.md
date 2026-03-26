# UT-5: Approval Sheet キーボードアクセシビリティ仕様定義

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ID         | UT-5                                            |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 由来       | Phase 11 DI-5                                   |
| 優先度     | MEDIUM                                          |
| ステータス | 未着手                                          |
| 検出日     | 2026-03-24                                      |

---

## 概要

Approval Sheet の WCAG 2.1 AA 準拠キーバインド仕様を定義し、テストで検証する。アクセシビリティ未対応は WCAG 準拠要件違反になる。

## 定義すべき項目

| 項目               | 仕様案                           |
| ------------------ | -------------------------------- |
| Tab 順序           | 承認ボタン → 拒否ボタンの順      |
| Enter キー         | フォーカス中のボタンを実行       |
| Escape キー        | 拒否（dismiss）                  |
| フォーカストラップ | Sheet 内でフォーカスを閉じ込める |
| ARIA ラベル        | role="dialog" + aria-label 付与  |

## 対象ファイル

| ファイル                                                                                  | 変更種別 |
| ----------------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`                        | 修正     |
| `apps/desktop/src/renderer/components/execution/__tests__/ApprovalSheet.test.tsx`（新規） | 追加     |

## 受入基準

- [ ] WCAG 2.1 AA 準拠のキーバインド仕様が定義されている
- [ ] Tab 順序・Enter・Escape が仕様通りに動作する
- [ ] フォーカストラップが実装されている
- [ ] ARIA ラベルが適切に設定されている
- [ ] アクセシビリティテストが PASS する
