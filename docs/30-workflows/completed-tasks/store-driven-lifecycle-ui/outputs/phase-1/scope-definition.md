# TASK-10A-F スコープ定義

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| タスクID | TASK-10A-F                    |
| 機能名   | Store駆動ライフサイクルUI統合 |
| Phase    | 1 - 要件定義                  |
| 作成日   | 2026-03-07                    |

## スコープに含む

### 変更対象ファイル

| #   | ファイル                                                                          | 変更種別 | 変更概要                                                                                |
| --- | --------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| 1   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | 修正     | `window.electronAPI.skill.create()` を `useCreateSkill()` 経由に置換                    |
| 2   | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`            | 修正     | 3箇所の直接IPC呼び出しを store action に置換、ローカル useState を store セレクタに移行 |
| 3   | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 修正     | モック対象を `window.electronAPI` から store セレクタに変更                             |
| 4   | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` | 修正     | モック対象を `window.electronAPI` から store セレクタに変更                             |

### 変更内容の詳細

1. **直接IPC呼び出しの排除（4箇所）**
   - SkillCreateWizard.tsx:46 - `window.electronAPI.skill.create()` を `createSkill` store action に置換
   - useSkillAnalysis.ts:94 - `window.electronAPI.skill.analyze()` を `analyzeSkill` store action に置換
   - useSkillAnalysis.ts:140 - `window.electronAPI.skill.applyImprovements()` を `applySkillImprovements` store action に置換
   - useSkillAnalysis.ts:171 - `window.electronAPI.skill.autoImprove()` を `autoImproveSkill` store action に置換

2. **useSkillAnalysis の状態管理移行**
   - `analysis` ローカル useState → `useCurrentAnalysis()` store セレクタ参照
   - `isAnalyzing` ローカル useState → `useIsAnalyzingSkill()` store セレクタ参照
   - `isImproving` ローカル useState → `useIsImprovingSkill()` store セレクタ参照
   - `error` ローカル useState → `useSkillError()` store セレクタ参照

3. **テストモック対象の変更**
   - `window.electronAPI` モック → store セレクタモック（`vi.mock`）

## スコープに含まない

| #   | 除外対象                                 | 除外理由                                                    |
| --- | ---------------------------------------- | ----------------------------------------------------------- |
| 1   | agentSlice への新規アクション追加        | TASK-10A-D で追加済み。本タスクでの新規追加は不要           |
| 2   | store/index.ts への新規セレクタ追加      | TASK-10A-D で追加済み。本タスクでの新規追加は不要           |
| 3   | IPC ハンドラの変更                       | agentSlice 内の既存実装がIPC呼び出しを行う。IPC層は変更なし |
| 4   | Preload API の変更                       | store action が内部で既存 Preload API を呼び出す構造を維持  |
| 5   | SkillManagementPanel の変更              | 後方互換性維持により呼び出し元の変更は不要                  |
| 6   | ChatPanel の変更                         | 本タスクのスコープ外                                        |
| 7   | 新規 IPC チャンネルの追加                | 既存チャンネルを使用するため不要                            |
| 8   | `@repo/shared` パッケージの変更          | 型定義の変更は不要                                          |
| 9   | SkillImportDialog / SkillListView の変更 | TASK-10A-D / TASK-10A-E で対応済み                          |
| 10  | agentSlice のテストファイルの変更        | store action 自体のテストは TASK-10A-D で実装済み           |

## 前提条件

| #   | 前提条件                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TASK-10A-D が完了し、agentSlice に `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` アクションが実装済みである                                                                                       |
| 2   | store/index.ts に `useAnalyzeSkill`, `useApplySkillImprovements`, `useAutoImproveSkill`, `useCreateSkill`, `useCurrentAnalysis`, `useIsAnalyzingSkill`, `useIsImprovingSkill`, `useSkillError` セレクタがエクスポート済みである |
| 3   | 既存の `SkillCreateWizard.test.tsx` と `SkillAnalysisView.test.tsx` が存在し、PASS している                                                                                                                                     |

## リスク

| #   | リスク                                                       | 影響度 | 軽減策                                                        |
| --- | ------------------------------------------------------------ | ------ | ------------------------------------------------------------- |
| 1   | store action の戻り値型と既存コードの期待する型が不一致      | 中     | Phase 2 設計で型の整合性を検証する                            |
| 2   | `improvementResult` が store action の void 戻り値で取得不可 | 低     | ローカル useState で管理し、改善成功時は null として扱う      |
| 3   | テストモック方式の変更による既存テストの大量修正             | 中     | `vi.mock` パターンで store セレクタをモジュールレベルでモック |
