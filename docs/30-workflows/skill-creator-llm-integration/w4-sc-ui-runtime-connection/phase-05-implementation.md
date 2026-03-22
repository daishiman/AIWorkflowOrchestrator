# Phase 5: 実装

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 5                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

Phase 4 のテストを Green にする実装を行う。DescribeStep 変更、SkillCreateWizard/SkillLifecyclePanel 改修、Zustand 状態追加、Preload API 呼び出し統合を実装する。

## 実行タスク

1. `DescribeStep.tsx` の変更
   - 「何を自動化したいですか？」テキストエリアを追加
   - 「LLM で生成」ボタンを追加（空入力時は無効化）
   - 既存の「テンプレートから作成」ボタンを維持（後方互換）
2. Zustand 状態追加
   - `agentSlice`（または新規 `skillCreationSlice`）に以下を追加:
     - `isGenerating: boolean`
     - `generationProgress: string | null`
     - `generationError: string | null`
     - `currentPlanId: string | null`
   - 個別セレクタを追加（P31対策）:
     - `useIsSkillGenerating()`
     - `useGenerationProgress()`
     - `useGenerationError()`
     - `useSetIsSkillGenerating()`
3. `SkillCreateWizard.tsx` の改修
   - `handleCreate()` を拡張: LLM 生成フローと従来フローの条件分岐
   - `window.electronAPI.skillCreator.planSkill(description)` 呼び出し実装
   - planSkill 成功後に GenerateStep へ遷移
   - planSkill 失敗時にエラー状態を Zustand に保存
4. `SkillLifecyclePanel.tsx` の改修
   - TerminalHandoff 表示コンポーネントを統合
   - `isGenerating` 状態に基づく UI ロック
5. `GenerateStep.tsx` の更新
   - plan 結果の表示
   - 「実行する」ボタン → `executePlan(planId)` 呼び出し
6. IPC 呼び出しのバリデーション（P42対策）
   - description の空文字・trim 検証

## 参照資料

- Phase 4 テストファイル（Red 状態）
- Phase 2 設計書
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`（既存 Slice）
- `.claude/rules/03-state-management.md`（Zustand 設計原則）
- `.claude/rules/06-known-pitfalls.md`（P31, P42, P48）

## 成果物

- 更新済み `DescribeStep.tsx`
- 更新済み `SkillCreateWizard.tsx`
- 更新済み `SkillLifecyclePanel.tsx`
- 更新済み `GenerateStep.tsx`
- 更新済み Zustand Slice（個別セレクタ追加）

## 完了条件

- [ ] DescribeStep に自然言語入力フィールドを追加した
- [ ] 「LLM で生成」ボタンを追加した（空入力時無効化）
- [ ] 既存「テンプレートから作成」ボタンを維持した（後方互換）
- [ ] Zustand 状態（isGenerating, generationProgress, generationError, currentPlanId）を追加した
- [ ] 個別セレクタを追加した（P31対策）
- [ ] handleCreate から planSkill を呼び出す実装を完了した
- [ ] planSkill エラー時に Zustand にエラー状態を保存する実装を完了した
- [ ] TerminalHandoff 表示を実装した
- [ ] 既存 skill:create フローが非破壊であることを確認した（AC-7）
- [ ] Phase 4 のテストが全て Green になった

## 次のPhase

Phase 6: テスト拡充
