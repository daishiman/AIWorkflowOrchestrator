# Phase 2: 設計

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 2                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

SkillSelector コンポーネントの詳細設計を行い、Props/State/Hooks/サブコンポーネント構成を決定する。

## 実行タスク

- コンポーネント設計: SkillSelector / SkillOption / SkillOptionUnimported の構造設計
- Props・State設計: インターフェース定義、内部状態設計
- アクセシビリティ設計: ARIA属性・キーボードハンドラー設計
- スタイリング設計: Tailwind CSS クラス設計、ダークモード対応

## 参照資料

| 資料名             | パス                                                         | 説明          |
| ------------------ | ------------------------------------------------------------ | ------------- |
| Phase 1 要件定義書 | `outputs/phase-1/requirements-definition.md`                 | Phase 1成果物 |
| ModelSelector      | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx` | 参考パターン  |
| SkillSlice         | `apps/desktop/src/renderer/store/slices/skillSlice.ts`       | 状態管理定義  |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容                 |
| --------------------- | --------------------------------------------------------------------------------- | -------------------- |
| UI/UXデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | デザイントークン     |
| LLMセレクター仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`         | セレクターUIパターン |
| 状態管理              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Zustandパターン      |
| Skill型定義           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型インターフェース   |

## 実行手順

### ステップ1: コンポーネント階層設計

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
    ├── SkillOptionUnimported[] (availableSkills - importedSkills)
    └── フッター
        └── 再スキャンボタン
```

### ステップ2: Props・State設計

#### SkillSelector Props

```typescript
interface SkillSelectorProps {
  className?: string;
}
```

#### 内部State

```typescript
// useState
const [isOpen, setIsOpen] = useState(false);
const [focusedIndex, setFocusedIndex] = useState(-1);

// useRef
const containerRef = useRef<HTMLDivElement>(null);

// useAppStore (Zustand)
const {
  availableSkills, // SkillMetadata[]
  importedSkills, // ImportedSkill[]
  selectedSkillName, // string | null
  isLoadingSkills, // boolean
  isScanning, // boolean
  selectSkill, // (name: string | null) => void
  rescanSkills, // () => Promise<void>
} = useAppStore();
```

#### SkillOption Props

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

#### SkillOptionUnimported Props

```typescript
interface SkillOptionUnimportedProps {
  skill: SkillMetadata;
  onImport: () => void;
}
```

### ステップ3: キーボードナビゲーション設計

ModelSelector.tsx のキーボードハンドラーに準拠し、以下のキーマッピングを実装:

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

**フォーカスインデックス管理**:

```typescript
// オプションリストの構築（フォーカス管理用）
const allOptions = [
  { type: "none", name: null }, // 「なし」
  ...importedSkills.map((s) => ({ type: "imported", name: s.name })),
  ...unimportedSkills.map((s) => ({ type: "available", name: s.name })),
];
```

### ステップ4: ARIA属性設計

```typescript
// トリガーボタン
<button
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="skill-listbox"
  aria-activedescendant={focusedIndex >= 0 ? `skill-option-${focusedIndex}` : undefined}
  aria-label="スキルを選択"
/>

// ドロップダウン
<div
  id="skill-listbox"
  role="listbox"
  aria-label="スキル一覧"
/>

// 各オプション
<div
  id={`skill-option-${index}`}
  role="option"
  aria-selected={isSelected}
/>
```

### ステップ5: スタイリング設計

**デザイントークン適用**:

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

### ステップ6: ディレクトリ構成設計

```
apps/desktop/src/renderer/components/skill/
├── SkillSelector.tsx         # メインコンポーネント（SkillOption, SkillOptionUnimported含む）
├── index.ts                  # barrel export
└── __tests__/
    └── SkillSelector.test.tsx  # コンポーネントテスト
```

## 統合テスト連携【必須】

統合ポイント/契約を設計に反映する:

| 統合ポイント  | 契約定義                                                   |
| ------------- | ---------------------------------------------------------- |
| Zustand Store | `useAppStore()` で skillSlice の状態・アクションを取得     |
| selectSkill   | `(name: string \| null) => void` で即座に状態が更新される  |
| rescanSkills  | `() => Promise<void>` で `isScanning` が true→false に遷移 |
| TASK-7D統合   | `SkillSelector` をインポートしてチャットツールバーに配置   |

## アーキテクチャ層別設計（AIが判断）

本タスクはフロントエンド（Renderer Process）のUI実装:

| 層                         | 設計観点                                     | 仕様参照先                                        |
| -------------------------- | -------------------------------------------- | ------------------------------------------------- |
| フロントエンド（Renderer） | Reactコンポーネント設計、Hooks、Tailwind CSS | `aiworkflow-requirements: ui-ux-design-system.md` |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止    | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用       | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認       | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時のエラー状態設計 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止           | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物               | パス                                      | 説明                      |
| -------------------- | ----------------------------------------- | ------------------------- |
| コンポーネント設計   | `outputs/phase-2/component-design.md`     | コンポーネント構造・Props |
| アクセシビリティ設計 | `outputs/phase-2/accessibility-design.md` | ARIA・キーボード設計      |

## 完了条件

- [ ] コンポーネント階層が定義されている
- [ ] Props / State インターフェースが設計されている
- [ ] キーボードナビゲーションのキーマッピングが定義されている
- [ ] ARIA属性の設計が完了している
- [ ] スタイリング設計（ライト/ダークモード）が完了している
- [ ] ディレクトリ構成が決定されている
- [ ] ModelSelectorパターンとの一貫性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（ModelSelector, SkillSlice, デザインシステム）
2. コンポーネント階層設計の実施
3. Props・State設計の実施
4. キーボードナビゲーション設計の実施
5. ARIA属性設計の実施
6. スタイリング設計の実施
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
