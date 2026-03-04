# TASK-10A-D コンポーネントドキュメント

## 統合コンポーネント仕様

### SkillManagementPanel

| 項目     | 値                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| パス     | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                                              |
| Props    | なし（ルートパネル）                                                                                               |
| 内部状態 | `currentView: View`, `selectedSkill: ImportedSkill \| null`, `searchQuery: string`, `skillToDelete`, `deleteError` |

#### ビュー構成

| ビュー     | 条件                     | 表示コンポーネント                 |
| ---------- | ------------------------ | ---------------------------------- |
| `list`     | デフォルト               | スキル一覧 + 検索 + 新規作成ボタン |
| `editor`   | `selectedSkill !== null` | `SkillEditor`                      |
| `analysis` | `selectedSkill !== null` | `SkillAnalysisView`                |
| `create`   | 条件なし                 | `SkillCreateWizard`                |

#### 公開エクスポート

- `SkillManagementPanel` — メインコンポーネント
- `buttonStyles` — ボタンスタイル定数（primary/secondary/danger/dangerConfirm）

---

### SkillAnalysisView（統合対象）

| 項目   | 値                                                                 |
| ------ | ------------------------------------------------------------------ |
| パス   | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` |
| 統合元 | TASK-10A-B                                                         |

#### Props

| Prop        | 型           | 必須 | 説明                                   |
| ----------- | ------------ | ---- | -------------------------------------- |
| `skillName` | `string`     | Yes  | 分析対象スキル名                       |
| `onClose`   | `() => void` | Yes  | 閉じるコールバック（listビューに戻る） |

#### 使用するStoreアクション

- `analyzeSkill(skillName)` — 分析実行
- `applySkillImprovements(skillName, suggestions)` — 改善提案適用
- `autoImproveSkill(skillName)` — 全自動改善

#### 使用するStoreセレクタ

- `useCurrentAnalysis()` — 分析結果
- `useIsAnalyzingSkill()` — 分析中フラグ
- `useIsImprovingSkill()` — 改善中フラグ

---

### SkillCreateWizard（統合対象）

| 項目   | 値                                                                 |
| ------ | ------------------------------------------------------------------ |
| パス   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| 統合元 | TASK-10A-C                                                         |

#### Props

| Prop      | 型           | 必須 | 説明                                   |
| --------- | ------------ | ---- | -------------------------------------- |
| `onClose` | `() => void` | Yes  | 閉じるコールバック（listビューに戻る） |

#### 4ステップウィザード

| Step | 名称      | 説明                                                            |
| ---- | --------- | --------------------------------------------------------------- |
| 1    | Describe  | スキルの名前と説明を入力                                        |
| 2    | Configure | 生成オプションを設定（generateTasks, addAgents, addReferences） |
| 3    | Generate  | スキル生成処理の実行                                            |
| 4    | Complete  | 完了画面の表示                                                  |

#### 使用するStoreアクション

- `createSkill(description, options)` — スキル作成

---

### ChatPanel（統合先）

| 項目     | 値                                                        |
| -------- | --------------------------------------------------------- |
| パス     | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` |
| 変更内容 | スキル管理パネルへのアクセスポイント追加                  |

#### 追加された要素

| 要素                        | 説明                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `showSkillManagement` state | `useState(false)` でパネル表示/非表示を管理                                        |
| トグルボタン                | `data-testid="skill-management-toggle"`, `aria-expanded`, `disabled={isExecuting}` |
| 条件付きレンダリング        | `showSkillManagement ? <SkillManagementPanel /> : <通常のチャット>`                |

---

## 個別セレクタ一覧（store/index.ts）

| セレクタ                      | 種別   | 返却型                                                             |
| ----------------------------- | ------ | ------------------------------------------------------------------ |
| `useCurrentAnalysis()`        | State  | `SkillAnalysis \| null`                                            |
| `useIsAnalyzingSkill()`       | State  | `boolean`                                                          |
| `useIsImprovingSkill()`       | State  | `boolean`                                                          |
| `useAnalyzeSkill()`           | Action | `(skillName: string) => Promise<void>`                             |
| `useApplySkillImprovements()` | Action | `(skillName: string, suggestions: Suggestion[]) => Promise<void>`  |
| `useAutoImproveSkill()`       | Action | `(skillName: string) => Promise<void>`                             |
| `useCreateSkill()`            | Action | `(description: string, options: CreateOptions) => Promise<string>` |
| `useClearAnalysis()`          | Action | `() => void`                                                       |
