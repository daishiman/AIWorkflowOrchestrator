# Phase 2: 設計 - TASK-10A-F Store駆動ライフサイクルUI統合

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| タスクID | TASK-10A-F                                        |
| Phase    | 2 (設計)                                          |
| 作成日   | 2026-03-09                                        |
| モード   | P50検証モード（既存実装の検証・補完）             |
| 前提     | Phase 1 要件定義完了。全FR/NFR/ACが実装済みと確認 |

## 1. Direct IPC → Store Action 対応表

### ライフサイクル系API（本タスクスコープ）

| 旧: Direct IPC 呼び出し                                              | 新: Store Action                                 | 呼び出し元                             | 移行状態 |
| -------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- | -------- |
| `window.electronAPI.skill.analyze(skillName)`                        | `analyzeSkill(skillName)`                        | `useSkillAnalysis.handleAnalyze`       | 完了     |
| `window.electronAPI.skill.applyImprovements(skillName, suggestions)` | `applySkillImprovements(skillName, suggestions)` | `useSkillAnalysis.handleApplySelected` | 完了     |
| `window.electronAPI.skill.autoImprove(skillName)`                    | `autoImproveSkill(skillName)`                    | `useSkillAnalysis.handleAutoImprove`   | 完了     |
| `window.electronAPI.skill.create({description, options})`            | `createSkill(description, options)`              | `SkillCreateWizard.handleGenerate`     | 完了     |

### IPC呼び出し委譲の流れ

```
[Renderer UI]
  SkillAnalysisView / SkillCreateWizard
    ↓ 個別セレクタ (useAnalyzeSkill 等)
  [Zustand Store - agentSlice]
    analyzeSkill / applySkillImprovements / autoImproveSkill / createSkill
      ↓ IPC呼び出し (Store action 内部)
    window.electronAPI.skill.analyze / applyImprovements / autoImprove / create
      ↓ contextBridge
  [Main Process]
    IPC Handler
```

## 2. Store State / Local State 境界

### Store State（agentSlice 管理）

| State             | 型                      | 用途                 | 初期値  |
| ----------------- | ----------------------- | -------------------- | ------- |
| `currentAnalysis` | `SkillAnalysis \| null` | 最新の分析結果       | `null`  |
| `isAnalyzing`     | `boolean`               | 分析処理中フラグ     | `false` |
| `isImproving`     | `boolean`               | 改善適用処理中フラグ | `false` |
| `skillError`      | `string \| null`        | スキルエラー情報     | `null`  |

### Local State（useSkillAnalysis hook 管理）

| State                 | 型                          | 用途                         | 理由                                         |
| --------------------- | --------------------------- | ---------------------------- | -------------------------------------------- |
| `selectedSuggestions` | `Set<number>`               | 選択された提案のインデックス | UIインタラクション固有。複数ビュー間共有不要 |
| `improvementResult`   | `ImprovementResult \| null` | 改善適用結果                 | 一時的な表示用データ。永続化不要             |

### Local State（SkillCreateWizard 管理）

| State          | 型               | 用途                 | 理由                               |
| -------------- | ---------------- | -------------------- | ---------------------------------- |
| `description`  | `string`         | スキル説明入力       | フォーム入力。ウィザード固有       |
| `options`      | `WizardOptions`  | ウィザード設定       | ウィザード固有の設定値             |
| `isGenerating` | `boolean`        | 生成中フラグ         | ウィザードUIフロー専用             |
| `error`        | `Error \| null`  | ウィザードエラー     | ウィザード固有のエラーハンドリング |
| `skillPath`    | `string \| null` | 生成されたスキルパス | 完了ステップ表示用                 |

### 境界判定基準

| 判定基準                                      | Store State | Local State |
| --------------------------------------------- | ----------- | ----------- |
| 複数コンポーネント間で共有が必要              | YES         | NO          |
| IPC通信の結果を保持                           | YES         | NO          |
| UIインタラクション固有（トグル/フォーム入力） | NO          | YES         |
| 一時的な表示用データ                          | NO          | YES         |

## 3. テスト観点（4系統）

### 系統1: Hook テスト（useSkillAnalysis）

| テスト観点         | 内容                                                          |
| ------------------ | ------------------------------------------------------------- |
| Store action 委譲  | `handleAnalyze` → `analyzeSkill` 呼び出し確認                 |
| Store action 委譲  | `handleApplySelected` → `applySkillImprovements` 呼び出し確認 |
| Store action 委譲  | `handleAutoImprove` → `autoImproveSkill` 呼び出し確認         |
| ローカルstate管理  | `handleToggleSuggestion` でSet操作が正しく動作                |
| ローカルstate管理  | `handleSelectAutoFixable` で auto-fixable のみ選択            |
| 初期化             | マウント時に `handleAnalyze` が自動実行                       |
| エラーハンドリング | Store actionのthrowがUIクラッシュを起こさない                 |

### 系統2: View テスト（SkillAnalysisView）

| テスト観点       | 内容                                               |
| ---------------- | -------------------------------------------------- |
| レンダリング     | 分析結果表示 / ローディング / エラー状態の切り替え |
| ユーザー操作     | ボタンクリックでhookハンドラが呼ばれる             |
| アクセシビリティ | aria-label / role="alert" の付与                   |
| 無効化制御       | `isImproving` / `isAnalyzing` 時のボタン無効化     |

### 系統3: Wizard テスト（SkillCreateWizard）

| テスト観点         | 内容                                          |
| ------------------ | --------------------------------------------- |
| ステップ遷移       | 4ステップ（説明入力→設定→生成→完了）のフロー  |
| Store action 委譲  | `handleGenerate` → `createSkill` 呼び出し確認 |
| エラーハンドリング | 生成失敗時のエラー表示                        |

### 系統4: Grep監査テスト（Store統合テスト）

| テスト観点                | 内容                                                          |
| ------------------------- | ------------------------------------------------------------- |
| Direct IPC 非呼び出し     | `window.electronAPI.skill.analyze` が直接呼ばれないことを保証 |
| Direct IPC 非呼び出し     | `window.electronAPI.skill.create` が直接呼ばれないことを保証  |
| Store action 呼び出し確認 | Store mock経由で action が呼ばれることを検証                  |

## 4. 責務境界

### コンポーネント責務マトリクス

| コンポーネント               | IPC通信 | State管理        | ビジネスロジック         | レイアウト/UI |
| ---------------------------- | ------- | ---------------- | ------------------------ | ------------- |
| `agentSlice` (Store)         | YES     | YES (グローバル) | YES (バリデーション含む) | NO            |
| `useSkillAnalysis` (Hook)    | NO      | YES (ローカル)   | YES (提案選択ロジック)   | NO            |
| `SkillAnalysisView` (View)   | NO      | NO               | NO                       | YES           |
| `SkillCreateWizard` (Wizard) | NO      | YES (ローカル)   | YES (ウィザードフロー)   | YES           |
| 個別セレクタ (Store)         | NO      | YES (参照のみ)   | NO                       | NO            |

### 依存方向

```
SkillAnalysisView → useSkillAnalysis → Store個別セレクタ → agentSlice → IPC
SkillCreateWizard → useCreateSkill (Store個別セレクタ) → agentSlice → IPC
```

- UIコンポーネントはStoreの具体的な実装に依存しない（個別セレクタ経由のインターフェース分離）
- IPC通信の詳細はagentSlice内に封じ込められている
- P31対策として合成Hook (`useXxxStore()`) は使用せず、個別セレクタのみを使用

## 5. スコープ外の残存Direct IPC

以下のファイルは本タスクのスコープ外であり、変更しない:

| ファイル                | 残存API                                                                             | 系統           |
| ----------------------- | ----------------------------------------------------------------------------------- | -------------- |
| `SkillEditor.tsx`       | `readFile`, `writeFile`, `listBackups`, `createFile`, `deleteFile`, `restoreBackup` | ファイル操作系 |
| `SkillImportDialog.tsx` | (未調査)                                                                            | インポート系   |

これらは別タスクで対応する。
