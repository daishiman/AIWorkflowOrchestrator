# Phase 8: Refactoring

## メタ情報

| 項目         | 内容             |
| ------------ | ---------------- |
| Phase        | 8                |
| Phase名      | リファクタリング |
| ステータス   | completed        |
| 作成日       | 2026-03-13       |
| 担当SubAgent | SubAgent-B       |

## 目的

テストを保持したまま wizard 実装の責務境界を整え、generic name 判定、theme preview、responsive 調整を読みやすく保つ。

## 実行タスク

- helper 抽出: generic name 判定と focusable element 取得を component 内 helper に閉じる
- 定数整理: step、theme option、starter tool を定数化する
- responsive 調整: mobile step indicator を 2 列化して視認性を上げる
- component 境界確認: view-local のまま持つ要素と shared 再利用要素を切り分ける

## 参照資料

| 参照資料                   | パス                                            | 用途                |
| -------------------------- | ----------------------------------------------- | ------------------- |
| Phase 1 要件               | `outputs/phase-1/requirements-definition.md`    | 維持すべき要件      |
| Phase 2 コンポーネント設計 | `outputs/phase-2/component-design.md`           | 分割境界の根拠      |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md`     | 現在のコード差分    |
| Phase 6 回帰マトリクス     | `outputs/phase-6/regression-matrix.md`          | 回帰リスクの確認    |
| リファクタリング方針       | `outputs/phase-8/refactoring-plan.md`           | 実施内容            |
| 抽出判定                   | `outputs/phase-8/component-extraction-check.md` | local / shared 判定 |
| カバレッジ結果             | `outputs/phase-7/coverage-gate-result.md`       | 安全性の根拠        |

## 統合テスト連携

| 観点           | 根拠                        | 連携内容                                        |
| -------------- | --------------------------- | ----------------------------------------------- |
| local helper   | `OnboardingWizard.test.tsx` | helper 抽出後も completion payload が維持される |
| mobile layout  | Phase 11 screenshot         | step indicator の可視性を再確認する             |
| fallback logic | `DashboardView.test.tsx`    | generic name 判定の回帰を防ぐ                   |

## 成果物

- `outputs/phase-8/refactoring-plan.md`
- `outputs/phase-8/component-extraction-check.md`

## 完了条件

- [x] 定数と helper が責務単位で整理されている
- [x] mobile 表示調整が screenshot 再確認まで完了している
- [x] shared 化しない理由が文書で説明されている
