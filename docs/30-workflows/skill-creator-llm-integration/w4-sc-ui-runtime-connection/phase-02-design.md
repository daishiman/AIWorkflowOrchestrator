# Phase 2: 設計

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 2                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

DescribeStep UI 変更設計、handleCreate→planSkill→executePlan フロー設計、Zustand 状態追加設計、TerminalHandoff 時の UI 表示設計、既存 skill:create フローの後方互換設計を行う。

## 実行タスク

1. DescribeStep UI 変更設計
   - 「何を自動化したいですか？」テキストエリアの追加（自然言語入力）
   - 既存のスキル名入力フィールドとの関係（LLM 生成時はスキル名を自動生成するか手入力か）
   - 「LLM で生成」ボタン vs 「テンプレートから作成」の選択 UI 設計
2. フロー設計: handleCreate → planSkill → executePlan
   ```
   ユーザー入力（自然言語）
     → handleCreate() 呼び出し
     → window.electronAPI.skillCreator.planSkill(description) 呼び出し
     → plan 結果を UI に表示（GenerateStep で確認）
     → ユーザー承認
     → window.electronAPI.skillCreator.executePlan(planId) 呼び出し
     → TerminalHandoff 状態表示
     → 完了通知
   ```
3. Zustand 状態設計
   - `agentSlice` または新規 `skillCreationSlice` への追加
   - 追加フィールド: `isGenerating: boolean`, `generationProgress: string | null`, `generationError: string | null`, `currentPlanId: string | null`
   - P31/P48 対策: 個別セレクタ（`useIsGenerating()`, `useGenerationProgress()` 等）を設計
4. TerminalHandoff 表示 UI 設計
   - executePlan 実行中のプログレス表示（スピナー + テキスト）
   - TerminalHandoff 状態（Claude Code が引き継ぐ）の表示デザイン
5. 後方互換設計
   - 既存の `skill:create` フローを維持する条件分岐
   - 「LLM 生成」を選択しない場合は従来フローを使用
6. IPC レスポンス wrapper 形式の明示（P60対策）
   - `{ success: boolean, data?: T, error?: { code: string, message: string } }`

## 参照資料

- Phase 1 成果物（要件定義書）
- `apps/desktop/src/renderer/store/` 配下の既存 Zustand Slice
- `apps/desktop/src/preload/types.ts`
- `.claude/rules/03-state-management.md`（Zustand 設計原則、P31/P48対策）
- `.claude/rules/01-architecture.md`（Apple HIG デザイン原則）
- `.claude/rules/06-known-pitfalls.md`（P31, P48, P60）

## 成果物

- UI フロー設計書（DescribeStep 変更仕様）
- SkillCreateWizard フロー設計書
- Zustand 状態追加設計（個別セレクタ一覧）
- TerminalHandoff 表示設計書
- 後方互換設計書

## 完了条件

- [ ] DescribeStep の UI 変更を設計した（自然言語入力フィールド、選択 UI）
- [ ] handleCreate→planSkill→executePlan のフローを設計した
- [ ] Zustand 状態（isGenerating, generationProgress, generationError, currentPlanId）を設計した
- [ ] 個別セレクタを設計した（P31/P48対策）
- [ ] TerminalHandoff 表示 UI を設計した
- [ ] 既存 skill:create フローとの後方互換を設計した
- [ ] IPC レスポンス wrapper 形式を明示した（P60対策）

## 次のPhase

Phase 3: 設計レビュー
