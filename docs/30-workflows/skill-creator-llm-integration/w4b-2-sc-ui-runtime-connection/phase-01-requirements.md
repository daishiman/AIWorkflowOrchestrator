# Phase 1: 要件定義

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 1                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

SkillLifecyclePanel / SkillCreateWizard から RuntimeSkillCreatorFacade の plan→execute→improve フローを呼び出す要件を定義する。現行の `skill:create` への直結フローを調査し、UI 変更要件（「何を自動化したいですか？」入力）を明確化する。

## 実行タスク

1. 現行フロー調査
   - `SkillLifecyclePanel.handleCreate()` の実装を読み取り、`skill:create` への直結フローを確認する
   - `SkillCreateWizard.tsx` の現行ウィザードステップを確認する
   - `DescribeStep.tsx` の現行 UI 入力フォームを確認する
   - `GenerateStep.tsx` の現行動作を確認する
2. IPC API 確認
   - `window.electronAPI.skillCreator.*` の利用可能メソッドを確認する（preload/types.ts）
   - `planSkill`, `executePlan`, `improveSkill` の IPC チャンネル名を確認する
3. UI 変更要件の策定
   - DescribeStep に「何を自動化したいですか？（自然言語入力）」フィールドを追加
   - 既存テンプレート選択フローとの共存設計
   - TerminalHandoff 表示要件（plan→execute 実行中の UI）
4. 受入基準の確認
   - AC-1: SkillLifecyclePanel から LLM 生成フローが開始できる
   - AC-3: TerminalHandoff 時の UI 状態表示
   - AC-4: execute 完了後にスキルが利用可能になる
   - AC-7: 既存 skill:create フローが非破壊（後方互換性）
5. Zustand 状態追加要件の策定（isGenerating, generationProgress, generationError）

## 参照資料

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`
- `apps/desktop/src/preload/types.ts`（window.electronAPI 型定義）
- 関連FR: FR-4
- 関連AC: AC-1, AC-3, AC-4, AC-7

## 成果物

- 要件定義書（本ファイル）
- 現行フロー調査メモ
- UI 変更要件リスト
- AC-1, AC-3, AC-4, AC-7 の達成条件明文化

## 完了条件

- [ ] `SkillLifecyclePanel.handleCreate()` の現行フローを確認した
- [ ] `window.electronAPI.skillCreator.*` の利用可能メソッドを確認した
- [ ] DescribeStep の UI 変更要件を定義した（自然言語入力フィールド）
- [ ] TerminalHandoff 表示要件を定義した
- [ ] Zustand 状態追加要件を定義した
- [ ] AC-1, AC-3, AC-4, AC-7 の達成条件を明文化した
- [ ] 既存 skill:create フローとの後方互換性要件を確認した

## 次のPhase

Phase 2: 設計
