# TASK-7A SkillSelector 実装ガイド

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 12         |
| 作成日 | 2026-01-30 |

---

# Part 1: 概念的説明（中学生でもわかる版）

## なぜスキルを選ぶ必要があるの？

AIに何か頼むとき、「どんな得意技を使ってほしいか」を指定できると便利です。たとえば、料理を頼むときに「和食が得意なシェフ」「イタリアンが得意なシェフ」を選べるのと同じです。

SkillSelector（スキルセレクター）は、AIが使う「得意技（スキル）」を選ぶためのパーツです。

## SkillSelector ってどんなもの？

スマホでアプリを選ぶとき、ホーム画面のアイコンをタップして使いたいアプリを選びますよね。SkillSelectorも同じ仕組みです。

1. **ボタンを押す** → 選択肢の一覧が下に表示される（ドロップダウン = 「下に広がるメニュー」のこと）
2. **使いたいスキルを選ぶ** → メニューが閉じて、選んだスキル名が表示される
3. **「なし」を選ぶ** → スキルを使わない状態に戻せる

## メニューの中身

メニューには3つのグループがあります:

| グループ         | 説明                                         |
| ---------------- | -------------------------------------------- |
| なし             | スキルを使わない（デフォルト）               |
| インポート済み   | すでに取り込んだスキル。すぐに使える         |
| 利用可能なスキル | パソコンにあるけどまだ取り込んでいないスキル |

## キーボードでも操作できる

マウスが使えないときでも、キーボードだけで操作できます:

- **Enter / Space** → メニューを開く・スキルを選ぶ
- **矢印キー（↑↓）** → スキル間を移動
- **Escape** → メニューを閉じる
- **Home / End** → 最初・最後のスキルに移動

---

# Part 2: 技術的詳細（開発者向け）

## コンポーネント構成

| コンポーネント        | 分類      | 説明                           |
| --------------------- | --------- | ------------------------------ |
| SkillSelector         | molecules | メインコンポーネント           |
| SkillOption           | atoms     | インポート済みスキルオプション |
| SkillOptionUnimported | atoms     | 未インポートスキルオプション   |

## SkillSelectorProps インターフェース

| Prop      | 型     | 必須 | デフォルト | 説明            |
| --------- | ------ | ---- | ---------- | --------------- |
| className | string | No   | ""         | 追加CSSクラス名 |

## useSkillStore 経由の状態取得パターン

SkillSelector は `useSkillStore()` Hook からストアにアクセスします。

| プロパティ        | 型                  | 説明                 |
| ----------------- | ------------------- | -------------------- |
| availableSkills   | SkillMetadata[]     | 利用可能な全スキル   |
| importedSkills    | ImportedSkill[]     | インポート済みスキル |
| selectedSkillName | string \| null      | 選択中のスキル名     |
| isScanning        | boolean             | スキャン中フラグ     |
| selectSkill       | (name) => void      | スキル選択アクション |
| rescanSkills      | () => Promise<void> | 再スキャンアクション |

**ストアアクセスパターン**:

```
useSkillStore() → useAppStore() → skillSlice
```

注意: `skillSlice` の内部名（`selectSkillByName`, `availableSkillsMetadata`）は `useSkillStore()` で公開名（`selectSkill`, `availableSkills`）にマッピングされます。

## キーボードナビゲーション キーマッピング表

| キー      | 閉じ状態の動作       | 開き状態の動作                   |
| --------- | -------------------- | -------------------------------- |
| Enter     | ドロップダウンを開く | フォーカス中オプションを選択     |
| Space     | ドロップダウンを開く | フォーカス中オプションを選択     |
| Escape    | -                    | ドロップダウンを閉じる           |
| ArrowDown | ドロップダウンを開く | 次のオプションにフォーカス移動   |
| ArrowUp   | -                    | 前のオプションにフォーカス移動   |
| Home      | -                    | 最初のオプションにフォーカス移動 |
| End       | -                    | 最後のオプションにフォーカス移動 |
| Tab       | 通常のタブ移動       | ドロップダウンを閉じてタブ移動   |

## ARIA属性一覧

### トリガーボタン

| 属性                  | 値                                  |
| --------------------- | ----------------------------------- |
| role                  | combobox                            |
| aria-labelledby       | skill-selector-label                |
| aria-expanded         | true / false                        |
| aria-haspopup         | listbox                             |
| aria-controls         | skill-listbox                       |
| aria-activedescendant | skill-option-{index} (開き状態のみ) |

### ドロップダウンリスト

| 属性            | 値                   |
| --------------- | -------------------- |
| id              | skill-listbox        |
| role            | listbox              |
| aria-labelledby | skill-selector-label |

### 各オプション

| 属性          | 値                   |
| ------------- | -------------------- |
| id            | skill-option-{index} |
| role          | option               |
| aria-selected | true / false         |

## Tailwind CSS スタイリングパターン

| 要素             | ライトモード                         | ダークモード                             |
| ---------------- | ------------------------------------ | ---------------------------------------- |
| トリガーボタン   | bg-white, border-gray-300            | dark:bg-gray-800, dark:border-gray-600   |
| ドロップダウン   | bg-white, border-gray-200, shadow-lg | dark:bg-gray-800, dark:border-gray-600   |
| ホバー           | hover:bg-gray-50                     | dark:hover:bg-gray-700                   |
| 選択中           | bg-blue-50                           | dark:bg-blue-900                         |
| フォーカス中     | bg-gray-100                          | dark:bg-gray-700                         |
| セクションヘッダ | text-gray-500, border-gray-100       | dark:text-gray-400, dark:border-gray-700 |
| 再スキャンリンク | text-blue-600                        | dark:text-blue-400                       |

## テストのモック方法

```tsx
// Store mock setup
const mockSelectSkill = vi.fn();
const mockRescanSkills = vi.fn().mockResolvedValue(undefined);

const defaultStoreState = {
  availableSkills: [{ name: "skill-a", description: "..." }],
  importedSkills: [
    {
      name: "skill-a",
      description: "...",
      status: "active",
      importedAt: new Date(),
    },
  ],
  selectedSkillName: null,
  isScanning: false,
  selectSkill: mockSelectSkill,
  rescanSkills: mockRescanSkills,
};

let currentStoreState = { ...defaultStoreState };

vi.mock("../../../store", () => ({
  useSkillStore: () => currentStoreState,
}));

// In beforeEach
beforeEach(() => {
  vi.clearAllMocks();
  currentStoreState = { ...defaultStoreState };
});

// To override state for specific test
currentStoreState = { ...defaultStoreState, selectedSkillName: "skill-a" };
```

## ファイル構成

| ファイル                                                                      | 内容                     |
| ----------------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                | メインコンポーネント実装 |
| `apps/desktop/src/renderer/components/skill/index.ts`                         | barrel export            |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` | テスト（28ケース）       |

## 品質メトリクス

| 指標              | 値     |
| ----------------- | ------ |
| テスト数          | 28     |
| Line Coverage     | 100%   |
| Branch Coverage   | 93.15% |
| Function Coverage | 87.5%  |
| ESLint エラー     | 0件    |
| TypeScript エラー | 0件    |
