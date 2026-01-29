# TASK-7A SkillSelector コンポーネント設計書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 2          |
| 作成日 | 2026-01-30 |

## コンポーネント階層

```
SkillSelector (メイン)
├── トリガーボタン
│   ├── スキルアイコン（📦）
│   ├── 選択中スキル名 or "なし"
│   └── 開閉インジケータ（▴/▾）
└── ドロップダウンパネル
    ├── SkillOption (name=null, label="なし（スキルを使用しない）")
    ├── セクションヘッダー "インポート済み (N)"
    ├── SkillOption[] (importedSkills)
    ├── セクションヘッダー "利用可能なスキル (N)"
    ├── SkillOptionUnimported[] (unimportedSkills)
    └── フッター
        └── 再スキャンボタン
```

## Props・State設計

### SkillSelector Props

```typescript
export interface SkillSelectorProps {
  className?: string;
}
```

### 内部State

```typescript
const [isOpen, setIsOpen] = useState(false);
const [focusedIndex, setFocusedIndex] = useState(-1);
const containerRef = useRef<HTMLDivElement>(null);
```

### Zustand Store（useSkillStore）

```typescript
const {
  availableSkills, // SkillMetadata[] (利用可能スキル)
  importedSkills, // ImportedSkill[] (インポート済み)
  selectedSkillName, // string | null (選択中スキル名)
  isLoadingSkills, // boolean (ローディング中)
  isScanning, // boolean (スキャン中)
  selectSkill, // (name: string | null) => void
  rescanSkills, // () => Promise<void>
} = useSkillStore();
```

### SkillOption Props

```typescript
interface SkillOptionProps {
  name: string | null;
  label?: string;
  description?: string;
  agentCount?: number;
  referenceCount?: number;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
}
```

### SkillOptionUnimported Props

```typescript
interface SkillOptionUnimportedProps {
  skill: SkillMetadata;
}
```

## ディレクトリ構成

```
apps/desktop/src/renderer/components/skill/
├── SkillSelector.tsx         # メインコンポーネント（SkillOption, SkillOptionUnimported含む）
├── index.ts                  # barrel export
└── __tests__/
    └── SkillSelector.test.tsx  # コンポーネントテスト
```

## キーボードナビゲーション設計

| キー      | ドロップダウン閉じ時 | ドロップダウン開き時             |
| --------- | -------------------- | -------------------------------- |
| Enter     | ドロップダウンを開く | フォーカス中オプションを選択     |
| Space     | ドロップダウンを開く | フォーカス中オプションを選択     |
| Escape    | なし                 | ドロップダウンを閉じる           |
| ArrowDown | ドロップダウンを開く | 次のオプションにフォーカス移動   |
| ArrowUp   | なし                 | 前のオプションにフォーカス移動   |
| Home      | なし                 | 最初のオプションにフォーカス移動 |
| End       | なし                 | 最後のオプションにフォーカス移動 |
| Tab       | 通常タブ移動         | ドロップダウンを閉じる           |

## フォーカスインデックス管理

```typescript
const allSelectableOptions = [
  { type: "none", name: null }, // 「なし」
  ...importedSkills.map((s) => ({ type: "imported", name: s.name })),
  ...unimportedSkills.map((s) => ({ type: "available", name: s.name })),
];
```

## スタイリング設計（Tailwind CSS）

| 要素                 | ライトモード                         | ダークモード                            |
| -------------------- | ------------------------------------ | --------------------------------------- |
| トリガーボタン       | `border-gray-300 bg-white`           | `dark:border-gray-600 dark:bg-gray-800` |
| ドロップダウン       | `bg-white border-gray-200 shadow-lg` | `dark:bg-gray-800 dark:border-gray-600` |
| 選択中オプション     | `bg-blue-50`                         | `dark:bg-blue-900`                      |
| フォーカスオプション | `bg-gray-100`                        | `dark:bg-gray-700`                      |
| ホバー               | `hover:bg-gray-50`                   | `dark:hover:bg-gray-700`                |
| セクションヘッダー   | `text-gray-500 text-xs`              | `dark:text-gray-400`                    |
| 説明テキスト         | `text-gray-500 text-xs truncate`     | `dark:text-gray-400`                    |
| 再スキャンボタン     | `text-blue-600 text-sm`              | `dark:text-blue-400`                    |
