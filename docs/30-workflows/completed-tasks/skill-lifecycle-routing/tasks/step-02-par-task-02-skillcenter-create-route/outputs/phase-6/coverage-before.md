# Phase 6: テスト拡充前カバレッジ（Phase 5 完了時点）

## 計測対象

Phase 5 実装完了直後（Phase 6 テスト追加前）のカバレッジ状態。

## テスト数（Phase 5 完了時）

| フェーズ       | テスト数 | テストファイル数 |
| -------------- | -------- | ---------------- |
| Phase 5 完了時 | 50       | 3                |

対象テストファイル:

- `skillLifecycleJourney.test.ts`: 20 テスト（既存5 + Phase 4/5 追加15）
- `useSkillCenter.navigation.test.ts`: 4 テスト（Phase 4/5 で作成）
- `SkillCenterView.cta.test.tsx`: 26 テスト（Phase 5 で作成）

_注記: Phase 4 テスト設計に基づき、Phase 5 実装時に全テストファイルを作成済み。Phase 6 ではカバレッジ観点の補完確認を実施。_

## カバレッジ状態（Phase 5 完了時）

Phase 5 で実装した CTA 機能（ヘッダー CTA・JourneyPanel CTA・useSkillCenter 3 アクション）に対して、Phase 4 の基本テスト（skillLifecycleJourney.test.ts）が対応。

| カバレッジ観点        | Phase 5 完了時の状態                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| アクセシビリティ      | aria-label / aria-hidden / キーボードフォーカスのテストが未追加         |
| 異常系                | `navigateToSkillCreate` が undefined の場合のテストが未追加             |
| JourneyPanel 条件分岐 | `ctaLabel` のみ / `onAction` のみ / 両方 undefined のパターンが未カバー |
| スナップショット      | ヘッダー CTA・JourneyPanel CTA のスナップショットが未追加               |
| useSkillCenter 統合   | ナビゲーション関数の呼び出し検証テストが未追加                          |

## Phase 6 追加テストの方針

上記の不足観点に対して、以下のテストカテゴリを追加する：

- アクセシビリティ（4テスト）
- 条件分岐（5テスト）
- インタラクション・統合（8テスト）
- レンダリング・レイアウト（9テスト）
- 型安全・データ整合（4テスト）
