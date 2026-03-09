# Phase 1: 要件定義 - TASK-10A-F Store駆動ライフサイクルUI統合

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-10A-F                            |
| Phase    | 1 (要件定義)                          |
| 作成日   | 2026-03-09                            |
| モード   | P50検証モード（既存実装の検証・補完） |

## 目的

SkillAnalysisView / SkillCreateWizard から `window.electronAPI.skill.*` 直接呼び出しを排除し、Zustand Store action 経由に統一する。UIコンポーネントはStore個別セレクタのみを参照し、IPC通信の詳細から完全に切り離す。

## P50チェック結果（既存実装状態の調査）

### grep監査

```bash
rg -n 'window\.electronAPI\.skill\.(analyze|applyImprovements|autoImprove|create)' \
  apps/desktop/src/renderer/components/skill/ --glob '*.ts' --glob '*.tsx'
```

**結果: 対象4 APIの直接呼び出しは0件**

| ファイル                | `window.electronAPI` 直接呼び出し | Store経由                                                             |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `useSkillAnalysis.ts`   | なし                              | `useAnalyzeSkill`, `useApplySkillImprovements`, `useAutoImproveSkill` |
| `SkillAnalysisView.tsx` | なし                              | `useSkillAnalysis` hook経由                                           |
| `SkillCreateWizard.tsx` | なし                              | `useCreateSkill`                                                      |

### Store action/selector 確認

`agentSlice.ts` に以下が全て定義済み:

| Store Action             | 行番号   | IPC呼び出し先                                            |
| ------------------------ | -------- | -------------------------------------------------------- |
| `analyzeSkill`           | L851-870 | `window.electronAPI.skill.analyze`                       |
| `applySkillImprovements` | L872-903 | `window.electronAPI.skill.applyImprovements` + `analyze` |
| `autoImproveSkill`       | L905-926 | `window.electronAPI.skill.autoImprove` + `analyze`       |
| `createSkill`            | L928-959 | `window.electronAPI.skill.create`                        |

`store/index.ts` に以下の個別セレクタが定義済み:

| セレクタ                    | 種別   | 行番号 |
| --------------------------- | ------ | ------ |
| `useCurrentAnalysis`        | state  | L647   |
| `useIsAnalyzingSkill`       | state  | L650   |
| `useIsImprovingSkill`       | state  | L653   |
| `useSkillError`             | state  | L599   |
| `useAnalyzeSkill`           | action | L658   |
| `useApplySkillImprovements` | action | L660   |
| `useAutoImproveSkill`       | action | L663   |
| `useCreateSkill`            | action | L666   |

### 既存テスト

| テストファイル                                 | 種別               |
| ---------------------------------------------- | ------------------ |
| `SkillAnalysisView.store-integration.test.tsx` | Store統合テスト    |
| `SkillCreateWizard.store-integration.test.tsx` | Store統合テスト    |
| `agentSlice.skill-lifecycle-selectors.test.ts` | セレクタ単体テスト |

## P50結論

**TASK-10A-F の主要実装は完了済み。** 対象3ファイルから `window.electronAPI.skill.{analyze,applyImprovements,autoImprove,create}` の直接呼び出しは排除されており、全てStore action経由に移行されている。

## スコープ定義

### 対象コンポーネント

| コンポーネント      | パス                                         | 状態          |
| ------------------- | -------------------------------------------- | ------------- |
| `useSkillAnalysis`  | `components/skill/hooks/useSkillAnalysis.ts` | Store移行完了 |
| `SkillAnalysisView` | `components/skill/SkillAnalysisView.tsx`     | Store移行完了 |
| `SkillCreateWizard` | `components/skill/SkillCreateWizard.tsx`     | Store移行完了 |

### 対象外コンポーネント（スコープ外）

| コンポーネント      | パス                                     | 理由                                                |
| ------------------- | ---------------------------------------- | --------------------------------------------------- |
| `SkillImportDialog` | `components/skill/SkillImportDialog.tsx` | 別タスクのスコープ                                  |
| `SkillEditor`       | `components/skill/SkillEditor.tsx`       | readFile/writeFile等の別系統API使用。別タスクで対応 |

### 注記: SkillEditor の window.electronAPI 残存

`SkillEditor.tsx` には `window.electronAPI.skill.{readFile,writeFile,listBackups,createFile,deleteFile,restoreBackup}` の直接呼び出しが残存している（L233, L271, L298, L412, L440, L482）。これらはファイル操作系APIであり、本タスクのライフサイクル系API（analyze/apply/autoImprove/create）とは別系統である。

## 機能要件 (FR)

| ID   | 要件                                                                                         | 実装状態 |
| ---- | -------------------------------------------------------------------------------------------- | -------- |
| FR-1 | useSkillAnalysis は Store action (`analyzeSkill`) 経由でスキル分析を実行する                 | 実装済み |
| FR-2 | useSkillAnalysis は Store action (`applySkillImprovements`) 経由で選択提案を適用する         | 実装済み |
| FR-3 | useSkillAnalysis は Store action (`autoImproveSkill`) 経由で全自動改善を実行する             | 実装済み |
| FR-4 | SkillCreateWizard は Store action (`createSkill`) 経由でスキルを作成する                     | 実装済み |
| FR-5 | 提案選択トグル (`selectedSuggestions`) はローカルstate (`useState`) で管理する               | 実装済み |
| FR-6 | 改善適用結果 (`improvementResult`) はローカルstateで管理する                                 | 実装済み |
| FR-7 | SkillAnalysisView はレイアウト責務のみを持ち、ビジネスロジックは useSkillAnalysis に委譲する | 実装済み |

## 非機能要件 (NFR)

| ID    | 要件                                                                                     | 実装状態 |
| ----- | ---------------------------------------------------------------------------------------- | -------- |
| NFR-1 | P31対策: 個別セレクタで Store state/action を取得し、無限ループを回避する                | 実装済み |
| NFR-2 | Store actionのエラーは `skillError` stateに格納され、UIクラッシュを防止する              | 実装済み |
| NFR-3 | P42準拠: Store actionで3段バリデーション（型チェック/空文字列/トリム空文字列）を実施する | 実装済み |
| NFR-4 | コンポーネントの責務分離: Hook (ロジック) / View (レイアウト) / Wizard (フロー)          | 実装済み |

## 受入基準 (AC)

| ID   | 基準                                                                     | 検証方法     | 状態 |
| ---- | ------------------------------------------------------------------------ | ------------ | ---- |
| AC-1 | `useSkillAnalysis.ts` に `window.electronAPI` 直接呼び出しが存在しない   | grep監査     | PASS |
| AC-2 | `SkillAnalysisView.tsx` に `window.electronAPI` 直接呼び出しが存在しない | grep監査     | PASS |
| AC-3 | `SkillCreateWizard.tsx` に `window.electronAPI` 直接呼び出しが存在しない | grep監査     | PASS |
| AC-4 | Store統合テストで direct IPC 非呼び出しが保証されている                  | テスト確認   | PASS |
| AC-5 | 全個別セレクタが `store/index.ts` にエクスポートされている               | grep確認     | PASS |
| AC-6 | `SkillImportDialog` と `SkillEditor` が変更されていない                  | スコープ確認 | PASS |
