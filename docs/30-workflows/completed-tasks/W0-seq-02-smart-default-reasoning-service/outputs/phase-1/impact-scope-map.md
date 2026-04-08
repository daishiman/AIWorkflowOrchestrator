# 影響範囲マップ

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 1                                              |

## 新規作成対象

| ファイル                                                                                   | 種別 | 内容                              |
| ------------------------------------------------------------------------------------------ | ---- | --------------------------------- |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                | 新規 | 推論サービス本体                  |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 新規 | ユニットテスト                    |
| `packages/shared/src/services/skillCreator/index.ts`                                       | 新規 | barrel（skillCreator サービス用） |

## 変更対象（既存ファイル）

| ファイル                   | 変更内容                                 |
| -------------------------- | ---------------------------------------- |
| `packages/shared/index.ts` | `inferSmartDefaults` の root barrel 追加 |

## 型定義確認のみ（変更不要）

| ファイル                                    | 確認内容                                                  |
| ------------------------------------------- | --------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts` | `SkillInfoFormData` / `SmartDefaultResult` 型整合確認済み |

## 影響を受けるコンポーネント（将来の依存先）

| コンポーネント/タスク   | 依存内容                                                   |
| ----------------------- | ---------------------------------------------------------- |
| `SkillCreateWizard.tsx` | W2-seq-03a で本サービスをインポートして利用する            |
| W2-seq-03a              | 本タスク完了後、インライン実装を本サービスに置き換えられる |

## ディレクトリ現状確認

- `packages/shared/src/services/skillCreator/` ディレクトリ: **未存在**（本タスクで新規作成）
- `packages/shared/src/types/skillCreator.ts`: **存在**（W0-seq-01 成果物）
- `packages/shared/index.ts`: **存在**（barrel 追加が必要）
