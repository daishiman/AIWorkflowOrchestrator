# 変更対象ファイル一覧

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 5                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 新規作成ファイル

| ファイルパス                                                                               | 内容                                                     |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/trackEvent.ts`                                            | 型安全な計装スタブ（`SkillWizardEvents` 定義込み）       |
| `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`                             | TC-07/08/08b/09 スタブ単体テスト                         |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx` | TC-01/E01/02/04/E02/10 + resolveSkippedAtQuestion テスト |

---

## 変更ファイル

| ファイルパス                                                       | 変更種別 | 変更内容                                                  |
| ------------------------------------------------------------------ | -------- | --------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 追加     | 5 計装ポイントの `trackEvent` 呼び出しを追加              |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 追加     | `resolveSkippedAtQuestion` ヘルパー関数をエクスポート追加 |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 追加     | `generationMethod` state の追加（`"complete" \| "skip"`） |

---

## 変更なしファイル

| ファイルパス                                                         | 理由                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | presentational のまま。計装は SkillCreateWizard 側で行う設計 |
| `packages/shared/src/types/skill.ts`                                 | `SkillCategory` を参照のみ。変更不要                         |
| `apps/desktop/src/renderer/store/skillAnalytics.ts`（または類似）    | execution-centric 基盤。W3 の UI 計装と分離                  |

---

## 変更の影響範囲

| 影響対象                           | 影響内容                                                    | 評価     |
| ---------------------------------- | ----------------------------------------------------------- | -------- |
| `SkillCreateWizard.tsx` の振る舞い | `trackEvent` 呼び出しが追加されるが UI 動作は変わらない     | 影響なし |
| レンダリングパフォーマンス         | `trackEvent` は dev で `console.info` のみ。prod では no-op | 影響なし |
| 既存テスト                         | `SkillCreateWizard` の既存テストに影響なし（spy 追加不要）  | 影響なし |
| `CompleteStep.tsx` の既存テスト    | 変更なしのため影響なし                                      | 影響なし |

---

## 完了条件チェックリスト

- [x] 新規作成ファイルが全件記載されていること
- [x] 変更ファイルの変更内容が具体的に記載されていること
- [x] `CompleteStep.tsx` が変更なしであることが記録されていること
- [x] 影響範囲の評価が完了していること
