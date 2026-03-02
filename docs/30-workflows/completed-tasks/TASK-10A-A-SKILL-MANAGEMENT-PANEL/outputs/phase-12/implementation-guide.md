# TASK-10A-A SkillManagementPanel 実装ガイド

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスクID       | TASK-10A-A                                                                           |
| コンポーネント | SkillManagementPanel                                                                 |
| Phase          | 12 - ドキュメント                                                                    |
| 作成日         | 2026-03-02                                                                           |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |

---

## Part 1: 概念的説明（中学生向け）

### スキル管理パネルって何？

**「本棚の整理アプリ」** だと思ってください。

あなたの部屋に本棚があるとします。その本棚には、これまでに買った本（＝スキル）がたくさん並んでいます。スキル管理パネルは、その本棚を画面上で見ながら、本を整理できるアプリです。

### 本棚でできること

#### 一覧で見る（リストビュー）

本棚を開くと、持っている本が全部カードのように並んで表示されます。それぞれのカードには **本のタイトル**（スキル名）と **本の紹介文**（説明文）が書かれています。

#### 検索する

図書館の検索端末を想像してください。検索ボックスにタイトルの一部を入力すると、探している本がすぐに見つかります。「alpha」と入力すれば、名前や説明文に「alpha」を含む本だけが表示されます。大文字・小文字は関係なく検索できます。

#### 編集する（エディタービュー）

本を1冊選んで「編集」ボタンを押すと、本を開いて中身を書き直すことができます。書き終わったら「閉じる」ボタンで本棚の一覧画面に戻れます。

#### 分析する（分析ビュー）

「この本はどれくらい使われているかな？」を調べるボタンです。押すと分析画面に移動します（現在は準備中です）。「戻る」ボタンで本棚に戻れます。

#### 削除する（確認ダイアログ付き）

いらなくなった本を棚から処分できます。ただし、間違って捨てないように **「本当に捨てていい？」** と確認の画面が出ます。「削除する」を押すと本当に消え、「キャンセル」を押すと何も起きずに元に戻ります。

#### 新規作成する（作成ビュー）

白紙のノートを用意して、新しい本を書き始める機能です。「新規作成」ボタンを押すと作成画面に移動します（現在は準備中です）。

#### 読み込み中の表示（ローディング）

本棚の中身を整理している間は「読み込み中...」というメッセージが表示されます。準備が終わると本の一覧が表示されます。

#### 本棚が空の時（空状態）

本棚に1冊も本がない場合、「インポート済みのスキルはありません」というメッセージが表示されます。「新規作成」ボタンから本を追加できます。

### まとめ

| やりたいこと | 本棚に例えると                       |
| ------------ | ------------------------------------ |
| リスト表示   | 本棚を開いて本を眺める               |
| 検索         | 図書館の検索端末で本を探す           |
| 編集         | 本を開いて中身を書き直す             |
| 分析         | 本の使われ方を調べる                 |
| 削除         | いらない本を処分する（確認付き）     |
| 新規作成     | 白紙のノートで新しい本を書く         |
| ローディング | 本棚を整理中の「お待ちください」     |
| 空状態       | 本棚が空で「本を追加してみましょう」 |

---

## Part 2: 開発者向け技術詳細

### コンポーネント構成

```
SkillManagementPanel (organisms)
├── ヘッダー（タイトル + 新規作成ボタン）
├── 検索入力フィールド
├── ローディング表示（条件付き）
├── スキルリスト（条件付き）
│   └── SkillCard × N（内部コンポーネント）
│       ├── スキル名（h3）
│       ├── 説明文（p）
│       └── 操作ボタン（編集 / 分析 / 削除）
├── 空状態メッセージ（条件付き）
├── 削除確認ダイアログ（条件付き）
└── ビュー切替
    ├── SkillEditor（editor ビュー）
    ├── 分析ビュー（準備中プレースホルダ）
    └── 作成ビュー（準備中プレースホルダ）
```

#### SkillManagementPanel

- **分類**: organisms
- **責務**: スキル一覧表示、検索フィルタリング、ビュー切替ルーティング、削除確認フロー
- **Props**: なし
- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

#### SkillCard

- **分類**: 内部コンポーネント（export なし）
- **責務**: 個別スキルの表示と操作ボタンの提供
- **Props**: `SkillCardProps`（後述）
- **定義場所**: 同ファイル内

### 状態管理

#### ローカル状態（useState）

| 状態            | 型                                                      | 初期値   | 用途           |
| --------------- | ------------------------------------------------------- | -------- | -------------- |
| `currentView`   | `View` (`"list" \| "editor" \| "analysis" \| "create"`) | `"list"` | 現在のビュー   |
| `selectedSkill` | `ImportedSkill \| null`                                 | `null`   | 選択中のスキル |
| `searchQuery`   | `string`                                                | `""`     | 検索クエリ     |
| `skillToDelete` | `ImportedSkill \| null`                                 | `null`   | 削除対象スキル |

#### Store 連携（個別セレクタ — P31 対策）

| セレクタ               | 戻り値                    | 用途                     |
| ---------------------- | ------------------------- | ------------------------ |
| `useImportedSkills()`  | `ImportedSkill[]`         | インポート済みスキル一覧 |
| `useIsLoadingSkills()` | `boolean`                 | ローディング状態         |
| `useFetchSkills()`     | `() => Promise<void>`     | スキル取得アクション     |
| `useRemoveSkill()`     | `(name) => Promise<void>` | スキル削除アクション     |

個別セレクタを使用することで、Zustand Store の合成 Hook が毎回新しいオブジェクトを返す問題（P31）を回避している。

#### 派生値（useMemo）

```typescript
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

- 依存配列: `[importedSkills, searchQuery]`
- `String(skill.name)` による branded 型の安全な文字列変換

### IPC 連携

| IPC チャンネル | トリガー                 | 対応するセレクタ             |
| -------------- | ------------------------ | ---------------------------- |
| `skill:list`   | マウント時 (`useEffect`) | `useFetchSkills()`           |
| `skill:remove` | 削除確認時               | `useRemoveSkill(skill.name)` |

- P44/P45 対策: `skill.name`（スキル名）を使用。`skill.id`（ハッシュ値）は使用しない
- P42 対策: Store 側で 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）を実施

### データフロー

```
1. 初期化フロー:
   mount → useEffect → fetchSkills() → [IPC: skill:list] → importedSkills 更新 → filteredSkills 再計算

2. 検索フロー:
   input onChange → setSearchQuery(value) → filteredSkills 再計算（useMemo）→ 表示更新

3. 編集フロー:
   「編集」click → handleEdit(skill) → setSelectedSkill(skill) + setCurrentView("editor")
   → SkillEditor 表示 → onClose → handleBackToList → setCurrentView("list") + setSelectedSkill(null)

4. 分析フロー:
   「分析」click → handleAnalyze(skill) → setSelectedSkill(skill) + setCurrentView("analysis")
   → 分析ビュー表示 → 「戻る」click → handleBackToList

5. 削除フロー:
   「削除」click → handleRequestDelete(skill) → setSkillToDelete(skill) → 確認ダイアログ表示
   → 「削除する」click → handleConfirmDelete → removeSkill(String(skillToDelete.name)) + setSkillToDelete(null)
   → 「キャンセル」click → handleCancelDelete → setSkillToDelete(null)

6. 新規作成フロー:
   「新規作成」click → setCurrentView("create") → 作成ビュー表示 → 「戻る」click → handleBackToList
```

### スタイリング

#### CSS 変数ベースのデザイントークン

ダークモード対応を自動化するため、Tailwind arbitrary values で CSS 変数を使用:

```typescript
// 使用例
"bg-[var(--bg-primary)]"; // 背景
"text-[var(--text-primary)]"; // テキスト
"border-[var(--border-primary)]"; // ボーダー
"text-[var(--status-error)]"; // エラー色
```

#### buttonStyles 定数（P47 対策）

テストの可読性とメンテナンス性のため、ボタンスタイルを `Record` 型でモジュールスコープに export:

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

### テスト設計

#### テストサマリ

| 指標           | 値                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| テスト総数     | 38                                                                                                                    |
| テストカテゴリ | 9（レンダリング、検索、ビュー遷移、操作、ローディング、アクセシビリティ、エッジケース、エラー、統合、パフォーマンス） |
| テスト環境     | happy-dom（`@vitest-environment happy-dom`）                                                                          |
| イベント操作   | `fireEvent`（P39: userEvent は happy-dom 非互換）                                                                     |

#### テストカテゴリ別

| カテゴリ             | テスト数 | テストID        |
| -------------------- | -------- | --------------- |
| レンダリング         | 6        | TC-001 ~ TC-006 |
| 検索機能             | 4        | TC-007 ~ TC-010 |
| ビュー遷移           | 5        | TC-011 ~ TC-015 |
| スキル操作           | 3        | TC-016 ~ TC-018 |
| ローディング状態     | 2        | TC-019 ~ TC-020 |
| アクセシビリティ     | 3        | TC-021 ~ TC-023 |
| エッジケース         | 5        | TC-024 ~ TC-028 |
| エラー状態           | 3        | TC-029 ~ TC-031 |
| 統合テスト           | 3        | TC-032 ~ TC-034 |
| アクセシビリティ拡充 | 3        | TC-035 ~ TC-037 |
| パフォーマンス       | 1        | TC-038          |

#### テストモック戦略

```typescript
// P31 対策: 個別セレクタをモック
vi.mock("../../../store", () => ({
  useImportedSkills: () => currentStoreState.importedSkills,
  useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
  useFetchSkills: () => currentStoreState.fetchSkills,
  useRemoveSkill: () => currentStoreState.removeSkill,
}));

// P9 対策: テスト間の状態リーク防止
beforeEach(() => {
  vi.clearAllMocks();
  currentStoreState = { ...defaultStoreState, ... };
});
```

### Pitfall 対策サマリ

| Pitfall | 内容                                | 対策                                              | 実装箇所                               |
| ------- | ----------------------------------- | ------------------------------------------------- | -------------------------------------- |
| P31     | Zustand 合成 Hook 無限ループ        | 個別セレクタ使用                                  | Store 連携（`useImportedSkills()` 等） |
| P39     | happy-dom で userEvent 非互換       | `fireEvent` 使用                                  | テスト全体                             |
| P40     | テスト実行ディレクトリ依存          | `apps/desktop/` から実行                          | テスト実行                             |
| P44/P45 | skill:remove インターフェース不整合 | `skill.name` 使用（`skill.id` ではない）          | 削除処理 `handleConfirmDelete`         |
| P46     | HTMLAttributes Props 型衝突         | 衝突なし（カスタム Props に HTML 標準属性名なし） | Props 設計                             |
| P47     | CSS 変数ベースのスタイルテスト      | `buttonStyles` 定数を export                      | スタイリング                           |
