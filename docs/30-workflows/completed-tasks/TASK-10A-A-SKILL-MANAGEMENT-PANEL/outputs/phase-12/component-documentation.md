# TASK-10A-A SkillManagementPanel コンポーネントドキュメント

## メタ情報

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | TASK-10A-A                                                            |
| Phase        | 12 - ドキュメント                                                     |
| 作成日       | 2026-03-02                                                            |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` |

---

## コンポーネント一覧

| コンポーネント         | 分類               | Props            | 主要動作                               |
| ---------------------- | ------------------ | ---------------- | -------------------------------------- |
| `SkillManagementPanel` | organisms (export) | なし             | スキル一覧表示、検索、ビュー遷移、削除 |
| `SkillCard`            | 内部コンポーネント | `SkillCardProps` | 個別スキル表示 + 操作ボタン            |

---

## SkillManagementPanel

### 概要

スキル管理の中心コンポーネント。スキル一覧の表示、検索フィルタリング、ビュー切替ルーティング、削除確認フローを担う。

### Props

Props なし。Store から個別セレクタ経由でデータを取得する。

### 状態管理

```typescript
// ローカル状態
const [currentView, setCurrentView] = useState<View>("list");
const [selectedSkill, setSelectedSkill] = useState<ImportedSkill | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [skillToDelete, setSkillToDelete] = useState<ImportedSkill | null>(null);

// Store 連携（個別セレクタ）
const importedSkills = useImportedSkills(); // ImportedSkill[]
const isLoadingSkills = useIsLoadingSkills(); // boolean
const fetchSkills = useFetchSkills(); // () => Promise<void>
const removeSkill = useRemoveSkill(); // (name) => Promise<void>

// 派生値
const filteredSkills = useMemo(() => {
  if (!searchQuery.trim()) return importedSkills;
  const query = searchQuery.toLowerCase();
  return importedSkills.filter(
    (skill) =>
      String(skill.name).toLowerCase().includes(query) ||
      skill.description.toLowerCase().includes(query),
  );
}, [importedSkills, searchQuery]);
```

### イベントハンドラ

| ハンドラ                     | トリガー                     | 動作                                                                 |
| ---------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `handleEdit(skill)`          | 編集ボタンクリック           | `setSelectedSkill(skill)` + `setCurrentView("editor")`               |
| `handleAnalyze(skill)`       | 分析ボタンクリック           | `setSelectedSkill(skill)` + `setCurrentView("analysis")`             |
| `handleRequestDelete(skill)` | 削除ボタンクリック           | `setSkillToDelete(skill)` — 確認ダイアログ表示                       |
| `handleConfirmDelete()`      | 確認ダイアログ「削除する」   | `removeSkill(String(skillToDelete.name))` + `setSkillToDelete(null)` |
| `handleCancelDelete()`       | 確認ダイアログ「キャンセル」 | `setSkillToDelete(null)`                                             |
| `handleBackToList()`         | 各ビューの戻る/閉じるボタン  | `setCurrentView("list")` + `setSelectedSkill(null)`                  |

### ビュー切替ロジック

```
currentView === "editor" && selectedSkill → <SkillEditor />
currentView === "analysis"               → 分析ビュー（準備中）
currentView === "create"                 → 作成ビュー（準備中）
上記以外（"list"）                       → リストビュー
```

### アクセシビリティ

| 要素                 | 属性          | 値                     |
| -------------------- | ------------- | ---------------------- |
| スキルリストコンテナ | `role`        | `"list"`               |
| 各 SkillCard         | `role`        | `"listitem"`           |
| 検索入力             | `type`        | `"text"`               |
| 検索入力             | `aria-label`  | `"スキルを検索"`       |
| 検索入力             | `placeholder` | `"スキルを検索..."`    |
| 削除確認ダイアログ   | `role`        | `"dialog"`             |
| 削除確認ダイアログ   | `aria-label`  | `"削除確認ダイアログ"` |

### 条件付きレンダリング

| 条件                                                 | 表示内容                                 |
| ---------------------------------------------------- | ---------------------------------------- |
| `isLoadingSkills === true`                           | 「読み込み中...」メッセージ              |
| `filteredSkills.length === 0 && searchQuery.trim()`  | 「検索条件に一致するスキルはありません」 |
| `filteredSkills.length === 0 && !searchQuery.trim()` | 「インポート済みのスキルはありません」   |
| `filteredSkills.length > 0`                          | SkillCard のリスト                       |
| `skillToDelete !== null`                             | 削除確認ダイアログ（オーバーレイ）       |

---

## SkillCard

### 概要

個別スキルの表示カード。スキル名、説明文、操作ボタン（編集・分析・削除）を表示する。

### Props インターフェース

```typescript
interface SkillCardProps {
  /** 表示するスキル */
  skill: ImportedSkill;
  /** 編集ボタンのクリックハンドラ */
  onEdit: () => void;
  /** 分析ボタンのクリックハンドラ */
  onAnalyze: () => void;
  /** 削除ボタンのクリックハンドラ */
  onRemove: () => void;
}
```

### イベントハンドラ

| ハンドラ    | トリガー               | 呼び出し元への伝播           |
| ----------- | ---------------------- | ---------------------------- |
| `onEdit`    | 「編集」ボタンクリック | `handleEdit(skill)`          |
| `onAnalyze` | 「分析」ボタンクリック | `handleAnalyze(skill)`       |
| `onRemove`  | 「削除」ボタンクリック | `handleRequestDelete(skill)` |

### アクセシビリティ

| 要素           | 属性         | 値パターン               |
| -------------- | ------------ | ------------------------ |
| カードコンテナ | `role`       | `"listitem"`             |
| 編集ボタン     | `aria-label` | `"${skill.name} を編集"` |
| 分析ボタン     | `aria-label` | `"${skill.name} を分析"` |
| 削除ボタン     | `aria-label` | `"${skill.name} を削除"` |

### Branded 型の扱い

`ImportedSkill.name` は branded 型（`SkillName`）のため、テンプレートリテラルや文字列操作には `String()` 変換が必要:

```typescript
<h3>{String(skill.name)}</h3>
<button aria-label={`${String(skill.name)} を編集`}>
```

---

## buttonStyles 定数

### 概要

P47 対策として、ボタンスタイルをモジュールスコープの定数として export。テスト側からも import して期待値に使用できる。

### 型定義

```typescript
export const buttonStyles = {
  primary:
    "rounded-md bg-[var(--status-primary)] px-3 py-1 text-sm text-[var(--text-inverse)]",
  secondary:
    "rounded-md border border-[var(--border-primary)] px-3 py-1 text-sm text-[var(--text-primary)]",
  danger:
    "rounded-md px-3 py-1 text-sm text-[var(--status-error)] hover:bg-[var(--bg-tertiary)]",
  dangerConfirm:
    "rounded-md bg-[var(--status-error)] px-3 py-1 text-sm text-[var(--text-inverse)]",
} as const;
```

### 使用箇所

| キー            | 使用箇所                                         |
| --------------- | ------------------------------------------------ |
| `primary`       | 新規作成ボタン、編集ボタン                       |
| `secondary`     | 各ビューの戻るボタン、削除確認のキャンセルボタン |
| `danger`        | 削除ボタン                                       |
| `dangerConfirm` | 削除確認ダイアログの「削除する」ボタン           |

---

## CSS 変数マッピング

| CSS 変数           | 用途                                   | ライトモード例          |
| ------------------ | -------------------------------------- | ----------------------- |
| `--bg-primary`     | カード背景、ダイアログ背景             | `#FFFFFF`               |
| `--bg-tertiary`    | ホバー背景                             | `#E5E5EA`               |
| `--text-primary`   | タイトル、見出し                       | `#000000`               |
| `--text-secondary` | 説明文、ローディング                   | `rgba(60, 60, 67, 0.6)` |
| `--text-inverse`   | ボタンテキスト（プライマリ上）         | `#FFFFFF`               |
| `--border-primary` | カードボーダー、入力フィールドボーダー | `#C6C6C8`               |
| `--status-primary` | プライマリボタン背景                   | `#007AFF`               |
| `--status-error`   | 削除ボタンテキスト、確認ボタン背景     | `#FF3B30`               |

---

## 依存関係

### 外部依存

| パッケージ     | import                                             | 用途                         |
| -------------- | -------------------------------------------------- | ---------------------------- |
| `react`        | `React, useCallback, useEffect, useMemo, useState` | コンポーネントフレームワーク |
| `@repo/shared` | `ImportedSkill` (type)                             | スキル型定義                 |

### 内部依存

| モジュール      | import                                                                  | 用途                     |
| --------------- | ----------------------------------------------------------------------- | ------------------------ |
| `../../store`   | `useImportedSkills, useIsLoadingSkills, useFetchSkills, useRemoveSkill` | Store 個別セレクタ       |
| `./SkillEditor` | `SkillEditor`                                                           | 編集ビューコンポーネント |
