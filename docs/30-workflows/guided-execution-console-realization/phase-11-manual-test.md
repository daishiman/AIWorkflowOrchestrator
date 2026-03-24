# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 11                                   |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 1、Phase 2、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10 の成果を人手レビュー観点へ変換する。

## 実行タスク

- walkthrough plan 作成: 一般ユーザー目線での閲覧順を定義する
- screenshot plan 作成: どの画面状態を残すかを固定する
- issue capture 定義: 手動レビューで見つけた不明瞭表現を記録する方法を決める

## 参照資料

| 資料名     | パス                           | 説明           |
| ---------- | ------------------------------ | -------------- |
| Phase 1    | `phase-1-requirements.md`      | root 要件      |
| Phase 2    | `phase-2-design.md`            | task 分割      |
| Phase 5    | `phase-5-implementation.md`    | 実装順         |
| Phase 6    | `phase-6-test-expansion.md`    | edge case      |
| Phase 7    | `phase-7-coverage-check.md`    | coverage       |
| Phase 8    | `phase-8-refactoring.md`       | 用語整理       |
| Phase 9    | `phase-9-quality-assurance.md` | blocker        |
| Phase 10   | `phase-10-final-review.md`     | final gate     |
| UI/UX 正本 | `ui-ux-realization.md`         | 画面説明の正本 |

## 実行手順

### ステップ1: 一般ユーザーの閲覧順を決める

index、ui-ux-realization、Task01、Task02、Task03 の順で理解できるかを手動確認順とする。

### ステップ2: screenshot 観点を固定する

実行前、実行中、成果物表示、高度な表示、approval sheet の 5 状態を残す。

### ステップ3: issue capture を準備する

用語の分かりづらさ、責務の重複、規約説明の欠落を issue として残せるようにする。

## 統合テスト連携

manual review は自動テストが拾いにくい情報設計の明瞭さを確認するために使う。

## 成果物

| 成果物             | パス                                     | 説明                   |
| ------------------ | ---------------------------------------- | ---------------------- |
| manual review plan | `outputs/phase-11/manual-review-plan.md` | 人手レビュー手順       |
| screenshot plan    | `outputs/phase-11/screenshot-plan.json`  | 画面状態一覧           |
| discovered issues  | `outputs/phase-11/discovered-issues.md`  | 見つかった問題の記録先 |

## 完了条件

- [ ] 一般ユーザー向けの閲覧順が定義されている
- [ ] screenshot 対象が 5 状態以上列挙されている
- [ ] issue capture の分類軸が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 12（ドキュメント更新）](./phase-12-documentation.md)
