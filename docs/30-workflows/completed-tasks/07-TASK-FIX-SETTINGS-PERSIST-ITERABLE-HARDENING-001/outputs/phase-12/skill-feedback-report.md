# Phase 12: Skill Feedback Report

## 改善対象

- `task-specification-creator` の Phase 11 ガイド

## 観測した課題

- UI差分が小さいタスクでも、ユーザーが明示的に「スクリーンショット検証」を要求するケースがある。
- `manual-test-plan.md` が「スクリーンショット不要」のままだと、再監査時に証跡不足になる。

## 改善提案

1. Phase 11 テンプレートに「ユーザー要求で screenshot 必須化」のチェックボックスを追加する。
2. `manual-test-result.md` を常に生成対象にする（UI差分の有無に関係なく）。
3. TC-ID と png ファイルの紐付けを必須項目にする。

## 今回の適用結果

- TC-11-01 / TC-11-02 を撮影し、`manual-test-result.md` に反映済み。
