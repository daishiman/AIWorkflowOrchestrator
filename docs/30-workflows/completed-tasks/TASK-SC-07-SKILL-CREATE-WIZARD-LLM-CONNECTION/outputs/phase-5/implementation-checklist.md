# Phase 5: Implementation Checklist

## 実行日時

2026-03-25

## 変更ファイル一覧

### 1. wizard/index.ts

- [x] `GenerationMode` 型を export

### 2. wizard/DescribeStep.tsx

- [x] `generationMode?` / `onGenerationModeChange?` optional props 追加
- [x] ラジオボタン fieldset（条件付きレンダリング）
- [x] 後方互換性維持（props 未指定時も動作）

### 3. wizard/GenerateStep.tsx

- [x] `generationMode?`, `generationProgress?`, `planResult?` props 追加
- [x] `onExecutePlan?`, `onCancelPlan?` コールバック props 追加
- [x] PlanResult 表示セクション（integrated_api / terminal_handoff）
- [x] generationProgress テキスト表示
- [x] 実行/キャンセルボタン（LLM モード + planResult 時のみ表示）
- [x] 実行ボタン disabled 制御（isGenerating 時）

### 4. SkillCreateWizard.tsx

- [x] `SkillCreatorRuntimeApi` ローカル型定義
- [x] `getSkillCreatorApi()` ヘルパー（window.electronAPI.skillCreator）
- [x] `generationMode` state（useState）
- [x] `localPlanResult` state（useState）← Hybrid State Pattern
- [x] 11 個の store hooks import/使用
- [x] `handleLlmGenerate` (planSkill 呼び出し、AC-2)
- [x] `handleExecutePlan` (executePlan 呼び出し、AC-4/AC-10)
- [x] `handleCancelPlan` (対称クリア、AC-5/AC-10)
- [x] `handleDescribeNext` (モード分岐ルーティング、AC-2/AC-8)
- [x] JSX: DescribeStep/GenerateStep に新 props 接続

### 5. SkillCreateWizard.test.tsx (既存テストモック拡張)

- [x] store mock に 11 個の LLM hooks 追加

### 6. SkillCreateWizard.store-integration.test.tsx (既存テストモック拡張)

- [x] store mock に 11 個の LLM hooks 追加

## TASK-SC-06 苦戦箇所回避確認

| 苦戦箇所                        | 回避状況                                            |
| ------------------------------- | --------------------------------------------------- |
| C-1: executePlan skillSpec 必須 | skillSpec に description を渡している               |
| C-2: generationProgress 未表示  | JSX で表示済み                                      |
| C-4: PlanResult 二重定義        | agentSlice から import のみ                         |
| 非対称クリア                    | handleExecutePlan/handleCancelPlan 両方で対称クリア |

## Green Phase 結果

- 全 128 テスト PASS
- TypeScript 型チェック PASS
- ESLint PASS
