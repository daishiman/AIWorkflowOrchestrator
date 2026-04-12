# Phase 1 成果物: 要件定義書

## タスク分類

NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし）

## 既存 trackEvent.ts 分析

### 現在定義されているイベント一覧

| イベント名                          | ペイロード型                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `skill_wizard_started`              | `Record<string, never>`                                                                            |
| `skill_wizard_step1_completed`      | `{ method: "complete" \| "skip"; skippedAtQuestion: number \| null }`                              |
| `skill_wizard_generation_completed` | `{ method: "complete" \| "skip"; category: WizardSkillCategory; hasExternalIntegration: boolean }` |
| `skill_skeleton_quality_feedback`   | `{ satisfied: boolean; generationMethod: "complete" \| "skip" }`                                   |
| `skill_wizard_next_action`          | `{ action: "execute" \| "open_editor" \| "create_another" }` ← **変更対象**                        |

### 分岐構造

- `process.env.NODE_ENV !== "production"` の場合: `console.info("[trackEvent]", eventName, payload)` を出力
- production 環境: no-op

### 既存 skill_wizard_next_action との差分

|           | Before                                           | After                            |
| --------- | ------------------------------------------------ | -------------------------------- |
| action 型 | `"execute" \| "open_editor" \| "create_another"` | `'edit' \| 'execute' \| 'close'` |

## 計装ポイント一覧（P-1〜P-6）

| 計装ポイント | イベント名                   | 発火場所                                        | ペイロード                                   |
| ------------ | ---------------------------- | ----------------------------------------------- | -------------------------------------------- |
| P-1          | `skill_wizard_open`          | SkillCreateWizard: マウント時 useEffect         | `{ source: 'lifecycle_panel' \| 'direct' }`  |
| P-2          | `skill_wizard_step_complete` | SkillCreateWizard: Step 0 完了ハンドラ          | `{ step: 0, stepName: 'スキル情報入力' }`    |
| P-3          | `skill_wizard_step_complete` | SkillCreateWizard: Step 1 完了ハンドラ          | `{ step: 1, stepName: '詳細設定' }`          |
| P-4          | `skill_wizard_step_complete` | SkillCreateWizard: Step 2 完了ハンドラ          | `{ step: 2, stepName: '生成' }`              |
| P-5          | `skill_wizard_abandon`       | SkillCreateWizard: アンマウント時クリーンアップ | `{ lastStep: number }`                       |
| P-6          | `skill_wizard_next_action`   | CompleteStep: ネクストアクション選択時          | `{ action: 'edit' \| 'execute' \| 'close' }` |

## 受入条件（AC-1〜AC-9）

| AC   | 内容                                                                        | 検証方法                                        |
| ---- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| AC-1 | `trackEvent` に `skill_wizard_open` が型安全に定義・呼び出しできる          | TypeScript コンパイルエラーなし + テスト成功    |
| AC-2 | `trackEvent` に `skill_wizard_step_complete` が型安全に定義・呼び出しできる | TypeScript コンパイルエラーなし + テスト成功    |
| AC-3 | `trackEvent` に `skill_wizard_next_action` が型安全に定義・呼び出しできる   | TypeScript コンパイルエラーなし + テスト成功    |
| AC-4 | `trackEvent` に `skill_wizard_abandon` が型安全に定義・呼び出しできる       | TypeScript コンパイルエラーなし + テスト成功    |
| AC-5 | `SkillCreateWizard.tsx` の 5 つの計装ポイントでイベントが正しく発火する     | Vitest: trackEvent mock の toHaveBeenCalledWith |
| AC-6 | `CompleteStep.tsx` で `skill_wizard_next_action` が選択時に発火する         | Vitest: trackEvent mock の toHaveBeenCalledWith |
| AC-7 | `trackEvent.ts` のスタブの全分岐でカバレッジ 100% を達成する                | vitest coverage branches: 100%                  |
| AC-8 | `SkillCreateWizard.tsx` のカバレッジが 90% 以上を維持する                   | vitest coverage lines/branches: 90%+            |
| AC-9 | `CompleteStep.tsx` のカバレッジが 90% 以上を維持する                        | vitest coverage lines/branches: 90%+            |

## カバレッジ目標

| 対象ファイル            | 目標           |
| ----------------------- | -------------- |
| `trackEvent.ts`         | 100%（全分岐） |
| `SkillCreateWizard.tsx` | 90% 以上       |
| `CompleteStep.tsx`      | 90% 以上       |

## NON_VISUAL 証跡取得方針

Phase 11 では screenshot を取得せず、`vitest --reporter=verbose` の出力テキストを証跡とする。
