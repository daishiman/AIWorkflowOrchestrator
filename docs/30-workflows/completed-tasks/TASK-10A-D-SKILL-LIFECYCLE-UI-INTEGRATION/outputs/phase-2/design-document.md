# Phase 2: 設計書 — 完了報告

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | TASK-10A-D スキルライフサイクルUI統合 |
| 状態   | 完了                                  |

## 設計方針

1. **プレースホルダー差し替え方式**: 既存条件分岐構造を維持し、プレースホルダー部分のみ差し替え
2. **agentSlice 拡張方式**: 新規 Slice 不要、既存 agentSlice に状態・アクション追加
3. **ローカルステート方式**: ChatPanel の `showSkillManagement` は `useState` で管理
4. **既存 Hook 活用方式**: SkillAnalysisView は `useSkillAnalysis` を内部で使用

## コンポーネント設計

### SkillManagementPanel ビュー切替

- analysis: `SkillAnalysisView` (props: `skillName`, `onClose`)
- create: `SkillCreateWizard` (props: `onClose`)
- `selectedSkill` null チェック追加（analysis ビュー）

### ChatPanel 統合

- `showSkillManagement` ローカルステート
- ヘッダーにトグルボタン（aria-label, aria-expanded）
- メッセージエリアの条件レンダリング

## 型設計

### AgentState 追加フィールド

| フィールド      | 型                    | 初期値 |
| --------------- | --------------------- | ------ |
| currentAnalysis | SkillAnalysis \| null | null   |
| isAnalyzing     | boolean               | false  |
| isImproving     | boolean               | false  |

### AgentActions 追加メソッド

| メソッド               | シグネチャ                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| analyzeSkill           | (skillName: string) => Promise\<void\>                            |
| applySkillImprovements | (skillName: string, suggestions: Suggestion[]) => Promise\<void\> |
| autoImproveSkill       | (skillName: string) => Promise\<void\>                            |
| createSkill            | (description: string, options: {...}) => Promise\<string\>        |

### 個別セレクタ 7件

useCurrentAnalysis, useIsAnalyzingSkill, useIsImprovingSkill,
useAnalyzeSkill, useApplySkillImprovements, useAutoImproveSkill, useCreateSkill

## 完了条件チェック

- [x] SkillManagementPanel のビュー切替設計（変更前・変更後コード差分）
- [x] ChatPanel 統合設計（ローカルステート・トグルボタン・条件レンダリング）
- [x] agentSlice 追加型（AgentState 3フィールド、AgentActions 4メソッド）
- [x] 各アクションの実装コード（P42準拠3段バリデーション含む）
- [x] 個別セレクタ7件の定義
- [x] 状態フロー図（全ビュー遷移パス網羅）
- [x] テスト戦略（テストファイル構成・テスト数推定・モック方針）
- [x] アーキテクチャ層別の変更一覧（全ファイル変更行数推定）
