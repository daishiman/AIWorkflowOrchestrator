# TASK-10A-F 受け入れ基準

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| タスクID | TASK-10A-F                    |
| 機能名   | Store駆動ライフサイクルUI統合 |
| Phase    | 1 - 要件定義                  |
| 作成日   | 2026-03-07                    |

## 受け入れ基準一覧

### AC-1: SkillCreateWizard の直接IPC排除

- **Given**: SkillCreateWizard が表示され、スキル説明が入力済みである
- **When**: 「生成」ボタンをクリックする
- **Then**: `useCreateSkill()` から取得した `createSkill` 関数が呼び出され、`window.electronAPI.skill.create()` は呼び出されない

### AC-2: useSkillAnalysis の分析呼び出し排除

- **Given**: SkillAnalysisView が `skillName="test-skill"` でマウントされる
- **When**: `useSkillAnalysis` フックが初期化される（マウント時の `useEffect` が実行される）
- **Then**: `useAnalyzeSkill()` から取得した `analyzeSkill` 関数が `skillName` を引数として呼び出され、`window.electronAPI.skill.analyze()` は呼び出されない

### AC-3: useSkillAnalysis の改善適用排除

- **Given**: 分析結果が表示され、1件以上の提案が選択されている
- **When**: 「選択した改善を適用」ボタンをクリックする
- **Then**: `useApplySkillImprovements()` から取得した `applySkillImprovements` 関数が `skillName` と選択された `Suggestion[]` を引数として呼び出され、`window.electronAPI.skill.applyImprovements()` は呼び出されない

### AC-4: useSkillAnalysis の全自動改善排除

- **Given**: 分析結果が表示されている
- **When**: 「全自動改善」ボタンをクリックし、確認ダイアログで「OK」を選択する
- **Then**: `useAutoImproveSkill()` から取得した `autoImproveSkill` 関数が `skillName` を引数として呼び出され、`window.electronAPI.skill.autoImprove()` は呼び出されない

### AC-5: 直接IPC呼び出しゼロ

- **Given**: 全ての修正が完了している
- **When**: 以下のコマンドを実行する:
  ```bash
  grep -rn "window\.electronAPI" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
  grep -rn "window\.electronAPI" apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts
  ```
- **Then**: 両コマンドの出力が0行である

### AC-6: 既存テスト全PASS

- **Given**: テストファイルのモック対象が store action に変更されている
- **When**: 以下のコマンドを実行する:
  ```bash
  cd apps/desktop && pnpm vitest run src/renderer/components/skill/
  ```
- **Then**: 全テストが PASS する（テスト件数は変更前と同数以上）

### AC-7: 後方互換性維持

- **Given**: SkillManagementPanel から SkillAnalysisView と SkillCreateWizard が呼び出されている
- **When**: SkillManagementPanel のコードを変更せずにビルドする:
  ```bash
  cd apps/desktop && pnpm typecheck
  ```
- **Then**: TypeScript コンパイルエラーが発生しない。以下のインターフェースが変更されていないことを検証する:
  - `UseSkillAnalysisReturn` の全プロパティ型
  - `SkillCreateWizardProps` の全プロパティ型
  - `SkillAnalysisView` の Props インターフェース

## 受け入れ基準と機能要件の対応表

| AC   | 対応する機能要件 | 対応する非機能要件 |
| ---- | ---------------- | ------------------ |
| AC-1 | FR-1             | NFR-1 (P31対策)    |
| AC-2 | FR-2             | NFR-1 (P31対策)    |
| AC-3 | FR-3             | NFR-1 (P31対策)    |
| AC-4 | FR-4             | NFR-1 (P31対策)    |
| AC-5 | FR-6             | -                  |
| AC-6 | FR-5             | NFR-5 (テスト品質) |
| AC-7 | -                | NFR-3 (後方互換性) |
