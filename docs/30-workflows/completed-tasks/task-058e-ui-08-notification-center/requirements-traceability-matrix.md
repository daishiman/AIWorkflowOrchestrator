# requirements traceability matrix

## 目的

元タスク `task-058e-ui-08-notification-center.md` の要求が、058e workflow の各 Phase にどう分配されたかを固定する。これにより「元タスクのどこが Phase に落ちているか」を逆引きできる。

## トレース表

| 元タスク要求                                     | 主な内容                                                            | workflow 反映先                                                                                                                   | 補足                                               |
| ------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Bell アイコンから開くお知らせポップオーバー      | GlobalNavStrip の Bell から開閉する                                 | `index.md`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-11-manual-test.md`                                             | Bell 導線は `ui-ux-navigation.md` を補助正本にした |
| タイトルは「お知らせ」                           | 文言統一                                                            | `index.md`, `phase-1-requirements.md`, `phase-3-design-review.md`, `phase-5-implementation.md`                                    | 現行の「通知履歴」を是正対象として固定             |
| シンプルな時系列リスト                           | filter / grouping を持たない                                        | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`                                                        | 一覧 UI の責務を限定                               |
| 未読管理                                         | バッジ、未読ドット、既読化                                          | `phase-1-requirements.md`, `phase-2-design.md`, `phase-6-test-expansion.md`                                                       | `notificationSlice` 再利用前提                     |
| 左スワイプ削除のみを提供                         | 個別削除 gesture                                                    | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-11-manual-test.md`                            | `notification:delete` 追加設計へ接続               |
| すべて既読                                       | ヘッダー右上ボタン                                                  | `phase-1-requirements.md`, `phase-2-design.md`, `phase-6-test-expansion.md`                                                       | 一括削除ではなく一括既読に寄せる                   |
| フィルター・グルーピングを設けない               | 認知負荷を上げる UI を追加しない                                    | `phase-1-requirements.md`, `phase-3-design-review.md`, `phase-8-refactoring.md`                                                   | scope creep 防止観点                               |
| タップして発見する体験                           | collapsed state では詳細を見せず、押下時のみ展開                    | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`                                                        | 常時詳細表示は採用しない                           |
| 同時に 1 件のみ展開                              | アコーディオン動作                                                  | `phase-1-requirements.md`, `phase-2-design.md`, `phase-6-test-expansion.md`                                                       | expanded id を単一管理する                         |
| Bell / 展開 / 既読 / 削除の animation            | micro interaction                                                   | `phase-1-requirements.md`, `phase-2-design.md`, `phase-11-manual-test.md`                                                         | theme / reduced motion は Phase 11 で確認          |
| Atomic Design 分割                               | Popover / Header / List / Item / Badge / EmptyState                 | `phase-2-design.md`, `phase-5-implementation.md`, `phase-8-refactoring.md`                                                        | 単一 component 集約を是正対象にした                |
| IPC / Store 連携                                 | `get-history`, `new`, `mark-read`, `mark-all-read`、必要なら delete | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-9-quality-assurance.md`                       | delete は 058e 補完要求として追加                  |
| Phase 1-12 を実装・検証し、Phase 13 は実施しない | 要件定義、設計、TDD、実装、Phase 11 視覚検証、Phase 12 同期を完了   | `index.md`, `phase-5-implementation.md`, `phase-11-manual-test.md`, `phase-12-documentation.md`, `outputs/verification-report.md` | commit / PR はユーザー制約により未実施             |

## 結論

| 観点         | 判定 | 理由                                                                            |
| ------------ | ---- | ------------------------------------------------------------------------------- |
| 元タスク網羅 | 適合 | UX、UI構成、状態、IPC、motion、Phase 11 視覚検証、Phase 12 仕様同期まで完了した |
| 漏れ         | なし | gesture / relative time / delete IPC / a11y を成果物と実装の両方へ反映した      |
