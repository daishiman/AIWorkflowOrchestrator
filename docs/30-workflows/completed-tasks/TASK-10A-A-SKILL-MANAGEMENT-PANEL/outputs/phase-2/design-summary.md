# Phase 2 設計 成果物サマリ

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| タスクID | TASK-10A-A                          |
| 機能名   | SkillManagementPanel                |
| Phase    | 2                                   |
| 完了日   | 2026-03-02                          |
| 判定     | PASS                                |
| 正本     | `phase-2-design.md`（本ファイル外） |

## コンポーネント設計サマリ

### コンポーネントツリー（Atomic Design）

| レベル    | コンポーネント          | 責務                                  |
| --------- | ----------------------- | ------------------------------------- |
| organisms | SkillManagementPanel    | ビュー切り替えルーター                |
| molecules | SkillManagementHeader   | タイトル+件数+新規作成ボタン          |
| molecules | SkillSearchBar          | 検索テキスト入力+デバウンス+クリア    |
| molecules | SkillCategoryFilter     | カテゴリタブ群（横スクロール）        |
| molecules | SkillManagementCard     | スキル情報+操作ボタン                 |
| molecules | SkillCardActions        | 編集/分析/削除アイコンボタン群        |
| molecules | SkillDeleteDialog       | 削除確認ダイアログ（alertdialog）     |
| molecules | SkillManagementEmpty    | 空状態UI                              |
| molecules | SkillManagementError    | エラー状態UI+リトライ                 |
| molecules | SkillManagementSkeleton | スケルトンUI（shimmerアニメーション） |

### 状態管理設計

| 状態変数         | 型                                             | 配置先   |
| ---------------- | ---------------------------------------------- | -------- |
| currentView      | `"list" \| "editor" \| "analysis" \| "create"` | useState |
| selectedSkill    | `ImportedSkill \| null`                        | useState |
| searchQuery      | `string`                                       | useState |
| debouncedQuery   | `string`                                       | useState |
| selectedCategory | `SkillCategory \| null`                        | useState |
| deleteTarget     | `ImportedSkill \| null`                        | useState |
| isDeleting       | `boolean`                                      | useState |
| importedSkills   | `ImportedSkill[]`                              | Store    |
| isLoadingSkills  | `boolean`                                      | Store    |
| skillError       | `string \| null`                               | Store    |

### Store連携（P31対策 — 個別セレクタのみ）

- `useImportedSkills()`
- `useIsLoadingSkills()`
- `useSkillError()`
- `useFetchSkills()`
- `useRemoveSkill()`

### データフロー

1. **初期化**: mount → fetchSkills() → isLoadingSkills → importedSkills更新
2. **検索**: 入力 → searchQuery → 300msデバウンス → debouncedQuery → filteredSkills再計算
3. **編集**: 編集ボタン → setSelectedSkill + setCurrentView("editor")
4. **分析**: 分析ボタン → setSelectedSkill + setCurrentView("analysis")
5. **削除**: 削除ボタン → setDeleteTarget → 確認 → removeSkill(skill.name) → トースト
6. **新規作成**: ボタン → setCurrentView("create")

### スタイリング方針

- カラー: Apple HIG System Colors（CSS変数経由）
- スペーシング: 8pxグリッド
- 角丸: カード12px、ボタン8px
- 影: カード `0 1px 3px rgba(0,0,0,0.04)`
- レスポンシブ: 3列(≥1024px) / 2列(768-1023px) / 1列(<768px)

### アクセシビリティ設計

- 検索: `role="searchbox"`, `aria-label="ツールを検索"`
- カテゴリ: `role="tablist"` + `role="tab"` + `aria-selected`
- カード群: `role="list"` + `role="listitem"`
- 操作ボタン: `aria-label="${skillName} を編集/分析/削除"`
- 削除ダイアログ: `role="alertdialog"`, `aria-modal="true"`, フォーカストラップ
- 動的通知: `aria-live="polite"`

## 完了条件チェック

- [x] コンポーネントツリーがAtomic Designレベルで定義されている
- [x] 全コンポーネントのProps型が定義されている
- [x] ローカル状態とStore連携の境界が明確
- [x] 個別セレクタのみを使用する設計（P31対策）
- [x] データフローが全て定義されている
- [x] WAI-ARIA属性とキーボードナビゲーションが設計されている
- [x] Apple HIG準拠のカラー/スペーシング/角丸が定義されている
- [x] data-testid命名規則が定義されている
- [x] エラーハンドリング方針が定義されている
