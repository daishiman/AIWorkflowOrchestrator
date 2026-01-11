# コンポーネントドキュメント - スキル管理UI

## 概要

本ドキュメントは、スキル管理UIを構成する各コンポーネントの仕様・Props・使用例を記載します。

---

## SkillCard

### 概要

スキル情報をカード形式で表示するコンポーネント。

### 配置

`apps/desktop/src/renderer/components/molecules/SkillCard/index.tsx`

### Props

| Prop       | Type       | Required | Default | Description              |
| ---------- | ---------- | -------- | ------- | ------------------------ |
| skill      | Skill      | Yes      | -       | 表示するスキル情報       |
| isSelected | boolean    | Yes      | -       | 選択状態                 |
| onClick    | () => void | Yes      | -       | クリック時のコールバック |
| className  | string     | No       | ""      | 追加CSSクラス            |

### 使用例

```tsx
import { SkillCard } from "@/components/molecules/SkillCard";

<SkillCard
  skill={skill}
  isSelected={selectedSkillId === skill.id}
  onClick={() => handleSkillSelect(skill)}
/>;
```

### 特徴

- Glass Panel UI（backdrop-blur-sm）
- ホバー時のスケール効果（hover:scale-[1.02]）
- キーボード操作対応（Enter/Space）
- カテゴリバッジ表示
- Trigger表示（最大3件 + 残数）

---

## SkillList

### 概要

スキル一覧をグリッドレイアウトで表示するコンポーネント。

### 配置

`apps/desktop/src/renderer/components/organisms/SkillList/index.tsx`

### Props

| Prop            | Type                   | Required | Default | Description              |
| --------------- | ---------------------- | -------- | ------- | ------------------------ |
| skills          | Skill[]                | Yes      | -       | スキル一覧               |
| selectedSkillId | string \| null         | Yes      | -       | 選択中のスキルID         |
| onSkillSelect   | (skill: Skill) => void | Yes      | -       | スキル選択ハンドラ       |
| isLoading       | boolean                | Yes      | -       | ローディング状態         |
| filter          | string                 | Yes      | -       | 検索フィルター文字列     |
| category        | SkillCategory \| null  | Yes      | -       | カテゴリフィルター       |
| onImportClick   | () => void             | No       | -       | インポートボタンハンドラ |
| className       | string                 | No       | ""      | 追加CSSクラス            |

### 使用例

```tsx
import { SkillList } from "@/components/organisms/SkillList";

<SkillList
  skills={skills}
  selectedSkillId={selectedSkill?.id ?? null}
  onSkillSelect={handleSkillSelect}
  isLoading={isLoading}
  filter={skillFilter}
  category={skillCategory}
  onImportClick={() => setImportDialogOpen(true)}
/>;
```

### 特徴

- レスポンシブグリッド（1/2/3列）
- 内蔵フィルタリング（useMemo）
- ローディング状態表示
- 空状態表示
- フィルター後の空状態表示

---

## SkillDetailPanel

### 概要

選択されたスキルの詳細情報を表示するサイドパネル。

### 配置

`apps/desktop/src/renderer/components/organisms/SkillDetailPanel/index.tsx`

### Props

| Prop      | Type                   | Required | Default | Description    |
| --------- | ---------------------- | -------- | ------- | -------------- |
| skill     | Skill \| null          | Yes      | -       | 表示するスキル |
| onExecute | (skill: Skill) => void | Yes      | -       | 実行ハンドラ   |
| onDelete  | (skill: Skill) => void | Yes      | -       | 削除ハンドラ   |
| onClose   | () => void             | Yes      | -       | 閉じるハンドラ |
| className | string                 | No       | ""      | 追加CSSクラス  |

### 使用例

```tsx
import { SkillDetailPanel } from "@/components/organisms/SkillDetailPanel";

<SkillDetailPanel
  skill={selectedSkill}
  onExecute={handleExecuteSkill}
  onDelete={handleDeleteSkill}
  onClose={() => setSelectedSkill(null)}
/>;
```

### 特徴

- Escapeキーで閉じる
- 削除確認ダイアログ内蔵
- Anchor情報の詳細表示
- 実行・削除アクションボタン

---

## SkillImportDialog

### 概要

利用可能なスキルからインポートするためのモーダルダイアログ。

### 配置

`apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`

### Props

| Prop             | Type                         | Required | Default | Description            |
| ---------------- | ---------------------------- | -------- | ------- | ---------------------- |
| isOpen           | boolean                      | Yes      | -       | 開閉状態               |
| onClose          | () => void                   | Yes      | -       | 閉じるハンドラ         |
| availableSkills  | Skill[]                      | Yes      | -       | 利用可能なスキル一覧   |
| importedSkillIds | string[]                     | Yes      | -       | インポート済みスキルID |
| onImport         | (skillIds: string[]) => void | Yes      | -       | インポートハンドラ     |
| className        | string                       | No       | ""      | 追加CSSクラス          |

### 使用例

```tsx
import { SkillImportDialog } from "@/components/organisms/SkillImportDialog";

<SkillImportDialog
  isOpen={isImportDialogOpen}
  onClose={() => setImportDialogOpen(false)}
  availableSkills={availableSkills}
  importedSkillIds={importedSkillIds}
  onImport={handleImportSkills}
/>;
```

### 特徴

- オーバーレイ背景（bg-black/60）
- 内蔵検索バー
- チェックボックスによる複数選択
- インポート済みスキルは選択不可
- Escapeキーで閉じる

---

## SkillSearchBar

### 概要

デバウンス付きの検索入力フィールド。

### 配置

`apps/desktop/src/renderer/components/molecules/SkillSearchBar/index.tsx`

### Props

| Prop        | Type                    | Required | Default           | Description      |
| ----------- | ----------------------- | -------- | ----------------- | ---------------- |
| value       | string                  | Yes      | -                 | 検索値           |
| onChange    | (value: string) => void | Yes      | -                 | 値変更ハンドラ   |
| placeholder | string                  | No       | "スキルを検索..." | プレースホルダー |
| className   | string                  | No       | ""                | 追加CSSクラス    |

### 使用例

```tsx
import { SkillSearchBar } from "@/components/molecules/SkillSearchBar";

<SkillSearchBar
  value={skillFilter}
  onChange={setSkillFilter}
  placeholder="スキル名で検索..."
/>;
```

### 特徴

- 200msデバウンス
- クリアボタン（X）
- Escapeキーでクリア
- 検索アイコン

---

## SkillCategoryFilter

### 概要

スキルカテゴリで絞り込むドロップダウン。

### 配置

`apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/index.tsx`

### Props

| Prop       | Type                                      | Required | Default | Description          |
| ---------- | ----------------------------------------- | -------- | ------- | -------------------- |
| value      | SkillCategory \| null                     | Yes      | -       | 選択中のカテゴリ     |
| onChange   | (category: SkillCategory \| null) => void | Yes      | -       | カテゴリ変更ハンドラ |
| categories | SkillCategory[]                           | Yes      | -       | 利用可能カテゴリ     |
| className  | string                                    | No       | ""      | 追加CSSクラス        |

### 使用例

```tsx
import { SkillCategoryFilter } from "@/components/molecules/SkillCategoryFilter";

<SkillCategoryFilter
  value={skillCategory}
  onChange={setSkillCategory}
  categories={["development", "testing", "documentation"]}
/>;
```

### 特徴

- 「全て」オプションでリセット
- SKILL_CATEGORIESから日本語ラベル表示
- select要素によるネイティブドロップダウン

---

## 確認チェックリスト

| コンポーネント      | ドキュメント | 確認    |
| ------------------- | ------------ | ------- |
| SkillCard           | ✅           | ✅ 完了 |
| SkillList           | ✅           | ✅ 完了 |
| SkillDetailPanel    | ✅           | ✅ 完了 |
| SkillImportDialog   | ✅           | ✅ 完了 |
| SkillSearchBar      | ✅           | ✅ 完了 |
| SkillCategoryFilter | ✅           | ✅ 完了 |
