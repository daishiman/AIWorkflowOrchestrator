# Phase 3: Design Review

## メタ情報

| 項目         | 内容               |
| ------------ | ------------------ |
| Phase        | 3                  |
| Phase名      | 設計レビューゲート |
| ステータス   | completed          |
| 作成日       | 2026-03-13         |
| 担当SubAgent | SubAgent-C         |

## 目的

Phase 2 の設計が current shell 契約、state 契約、theme 契約、UI 再利用方針を満たしているか判定し、Phase 4 以降の着手条件を確定する。

## 実行タスク

- shell 境界確認: onboarding overlay が公開シェルや AuthGuard 例外と衝突しないか確認する
- state 境界確認: persisted key と local state の分担が破綻しないか確認する
- UI 再利用確認: `SuggestionBubble` と theme preview の再利用方法を確認する
- 実装ゲート判定: blocking issue の有無と補正事項を記録する

## 参照資料

| 参照資料               | パス                                         | 用途             |
| ---------------------- | -------------------------------------------- | ---------------- |
| Phase 1 要件           | `outputs/phase-1/requirements-definition.md` | 要件の再確認     |
| Phase 2 アーキテクチャ | `outputs/phase-2/architecture-design.md`     | shell 統合確認   |
| レビュー結果           | `outputs/phase-3/design-review-result.md`    | 評価の正本       |
| ギャップ解消一覧       | `outputs/phase-3/gap-resolution-list.md`     | blocking 予防    |
| ゲート判定             | `outputs/phase-3/review-gate.md`             | Phase 4 着手条件 |

## 統合テスト連携

| 観点                  | 後続Phase      | 連携内容                                   |
| --------------------- | -------------- | ------------------------------------------ |
| display name fallback | Phase 4, 5, 11 | Dashboard 表示名反映テストへ接続する       |
| starter tool 保存     | Phase 4, 5     | `selectedStarterTool` 保存テストへ接続する |
| Settings 再表示       | Phase 4, 5, 11 | force-open の導線と close 条件へ接続する   |

## 成果物

- `outputs/phase-3/design-review-result.md`
- `outputs/phase-3/gap-resolution-list.md`
- `outputs/phase-3/review-gate.md`

## 完了条件

- [x] blocking issue が 0 件である
- [x] 補正事項が Phase 4 と Phase 5 の具体的な作業へ落ちている
- [x] Phase 4 着手条件がテスト観点の優先順まで含めて固定されている
