# 実装ガイド: SkillCenterView（ツールを探す）

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| タスクID   | TASK-UI-05-SKILL-CENTER-VIEW |
| 作成日     | 2026-03-01                   |
| Phase      | 12                           |
| バージョン | 1.0                          |

---

## Part 1: 概念的説明（中学生レベル）

### SkillCenterView とは

SkillCenterView は **スマホのアプリストアのような画面** です。

スマホのアプリストアでは、欲しいアプリを探して「インストール」ボタンを押すと、自分のスマホにアプリが入ります。SkillCenterView もそれと同じで、AIワークフローを強化する「ツール」を探して、「追加する」ボタンを押すだけで追加できます。

### おすすめセクション

お店に入ると、一番目立つ場所に「今週のおすすめ」が並んでいます。

SkillCenterView でも、画面の一番上に **おすすめツール** が最大3つ表示されます。これは「まだ追加していないツール」の中から、ファイル数が多い（＝充実度が高い）ものを自動で選んでくれます。さらに、同じジャンルのツールばかりにならないように、カテゴリの偏りをなくす工夫もしています。

### カテゴリタブ

アプリストアでは「ゲーム」「仕事」「写真」のようなカテゴリでアプリを絞り込めます。

SkillCenterView にも同じ仕組みがあります。「すべて」「開発ツール」「文書作成」「データ分析」「自動化」「その他」の6つのカテゴリから選べます。横にスクロールできるタブになっていて、選んだカテゴリの下に青い線がスッと動きます。

### 追加ボタン（AddButton）

「追加する」ボタンを押すと、次の3段階で変化します。

1. **「追加する」**（青いボタン）→ ボタンをタップ
2. **「追加中...」**（くるくる回るスピナー）→ AIが処理しています
3. **「追加済み!」**（緑のチェックマーク）→ 完了！

ゲームでレベルをクリアしたときの演出みたいに、状態が切り替わるアニメーションが入っています。

### 詳細パネル

アプリストアでアプリをタップすると、説明ページが開きます。「何ができるか」「どんな権限が必要か」が書いてあります。

SkillCenterView でもツールカードをクリックすると **詳細パネル** が右からスライドして開きます。モバイルの場合は画面の下からシートが出てきます。パネルには次の情報が表示されます:

- ツールの名前と説明
- 使用する権限（「コマンドを実行」「ファイルを読む」など、わかりやすい言葉で表示）
- 含まれるファイル一覧
- 追加済みなら「削除」ボタン

不要になったツールは、詳細パネル内の「危険な操作」エリアから削除できます。

### 検索バー

画面上部にある検索バーにキーワードを入力すると、ツール名や説明文からリアルタイムで絞り込みができます。検索結果が0件の場合は「一致するツールが見つかりませんでした」と表示され、「フィルタをクリア」ボタンで元に戻せます。

---

## Part 2: 開発者向け技術詳細

### 1. コンポーネントツリー構成

```
SkillCenterView (index.tsx)
├── Header (title + subtitle)
├── SearchBar (input + Icon)
├── FeaturedSection                    ← おすすめセクション
│   └── FeaturedCard (x3)              ← stagger animation
│       └── AddButton (size="featured")
├── CategoryTabs                       ← 6カテゴリ + キーボードナビ
├── SkillEmptyState                    ← ゼロステート (no-skills / no-results)
├── CardGrid                           ← レスポンシブグリッド
│   └── SkillCard (xN)
│       └── AddButton (size="default")
└── SkillDetailPanel                   ← 詳細パネル
    ├── PanelContent                   ← 共通コンテンツ（デスクトップ/モバイル共用）
    │   ├── Header (name + badge + close)
    │   ├── Description
    │   ├── Permissions (PERMISSION_LABELS)
    │   ├── ResourceList (agents / references / indexes / scripts)
    │   ├── OtherFiles
    │   └── DangerZone (delete button)
    └── Overlay
```

### 2. Atomic Design 分類

| 分類     | コンポーネント                                         | 役割                   |
| -------- | ------------------------------------------------------ | ---------------------- |
| atom     | AddButton                                              | モーフィング追加ボタン |
| molecule | SkillCard, CategoryTabs, SkillEmptyState, FeaturedCard | 複合UIパーツ           |
| organism | FeaturedSection, SkillDetailPanel                      | 機能完結したセクション |
| template | SkillCenterView (index.tsx)                            | ページ全体のレイアウト |

### 3. 状態管理設計

#### Zustand Store（agentSlice 既存利用、P31 対策）

個別セレクタを使用して Store から状態を取得する（合成 Hook `useAgentStore()` の戻り値関数を `useEffect` 依存配列に含めない）。

```typescript
// 使用する個別セレクタ一覧（13個）
useAvailableSkillsMetadata(); // SkillMetadata[]
useImportedSkills(); // ImportedSkill[]
useIsLoadingSkills(); // boolean
useSkillError(); // string | null
useSkillFilter(); // string
useSkillCategory(); // SkillCategory | null
useFetchSkills(); // () => Promise<void>
useImportSkill(); // (name: string) => Promise<void>
useRemoveSkill(); // (name: string) => Promise<void>
useSetSkillFilter(); // (filter: string) => void
useSetSkillCategory(); // (category: SkillCategory | null) => void
```

#### ローカル状態（useState）

| 状態                  | 型                     | 目的                       |
| --------------------- | ---------------------- | -------------------------- |
| isDetailOpen          | boolean                | 詳細パネル開閉             |
| detailSkillName       | string \| null         | 詳細表示中のスキル名       |
| isDeleteConfirmOpen   | boolean                | 削除確認ダイアログ開閉     |
| deleteTargetSkillName | string \| null         | 削除対象のスキル名         |
| addingSkills          | Map\<string, boolean\> | 追加処理中のスキル名マップ |

#### 計算値（useMemo）

| 計算値               | 依存                                            | 処理                          |
| -------------------- | ----------------------------------------------- | ----------------------------- |
| importedSkillNames   | importedSkills                                  | string[] に変換               |
| importedSkillNameSet | importedSkillNames                              | Set\<string\> に変換          |
| filteredSkills       | availableSkills, category, filter               | カテゴリ + キーワードフィルタ |
| featuredSkills       | allSkills, importedSkillNames                   | useFeaturedSkills による選定  |
| detailSkill          | detailSkillName, importedSkills, filteredSkills | インポート済み優先検索        |

### 4. カスタムフック

#### useSkillCenter

メインロジックフック。Store 接続、フィルタリング、DetailPanel 開閉、ツール追加/削除の非同期操作を一元管理する。

**キーポイント**:

- `handleAddSkill`: `importSkill` 呼び出し後、1500ms 後に addingSkills マップからエントリを削除（成功アニメーション用ディレイ）
- `handleSetCategory`: `CategoryId` と `SkillCategory` の型変換。`"all"` は `null`（フィルタなし）に変換
- `matchesCategory`: string ベースのキーワードマッチングで UI 側カテゴリと Store 側カテゴリの両方に対応

#### useFeaturedSkills

おすすめスキル選定フック。

**アルゴリズム**:

1. インポート済みスキルを除外
2. `computePopularity(skill)` = agents + references + indexes の総数でスコア計算
3. スコア降順ソート
4. `ensureCategoryDiversity`: 同カテゴリ最大2件の制約下で最大3件を選定
   - パス1: カテゴリ上限を守って選定
   - パス2: まだ maxCount 未達ならスキップされたスキルで補充

### 5. IPC 連携

SkillCenterView は Store のアクション経由で間接的に IPC チャネルを利用する。直接 IPC 呼び出しは行わない。

| Store アクション  | IPC チャネル | 用途                          |
| ----------------- | ------------ | ----------------------------- |
| fetchSkills()     | skill:list   | 利用可能スキル一覧取得        |
| importSkill(name) | skill:import | スキル追加（P44/P45対策済み） |
| removeSkill(name) | skill:remove | スキル削除（P44/P45対策済み） |

### 6. アニメーション実装

#### FeaturedCard: stagger 出現アニメーション

```css
/* @keyframes fade-in (Tailwind animate-fade-in) */
.animate-fade-in {
  animation: fade-in 300ms ease-out;
}

/* stagger delay */
style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
```

各カードに `opacity-0` を初期値として設定し、`animation-fill-mode: forwards` で最終状態を維持。index \* 100ms のディレイで順次出現する。

#### AddButton: モーフィングアニメーション

3状態（idle/processing/success）の遷移。CSS `transition-all duration-200 ease-out` で背景色とテキストがスムーズに切り替わる。

```
[追加する] ─(click)→ [追加中... (spinner)] ─(complete)→ [追加済み! (check)]
  (blue)                 (blue + spin)              (green)
```

#### SkillDetailPanel: スライドイン/ボトムシート

- デスクトップ: `translate-x-full` → `translate-x-0` (250ms ease-out)
- モバイル: `translate-y-full` → `translate-y-0` (300ms ease-out)
- オーバーレイ: `opacity-0` → `opacity-1` (250ms ease-out) + `backdrop-blur-sm`

#### SkillCard / FeaturedCard: インタラクション

```
hover:  scale(1.02) + shadow-md + border-color(accent/30)
active: scale(0.97)
transition: all 200ms ease-out
will-change: transform
```

### 7. レスポンシブ設計

4ブレークポイントによるグリッドレイアウト。Tailwind CSS のレスポンシブプレフィックスを使用。

| ブレークポイント | 幅        | カードグリッド列数 | おすすめ列数 | パネル形式         |
| ---------------- | --------- | ------------------ | ------------ | ------------------ |
| デフォルト       | < 640px   | 1列                | 1列          | ボトムシート(85vh) |
| sm               | >= 640px  | 2列                | 2列          | ボトムシート       |
| md               | >= 768px  | 2列                | 2列          | 右スライドイン     |
| lg               | >= 1024px | 3列                | 3列          | 右スライドイン     |
| xl               | >= 1280px | 4列                | 3列          | 右スライドイン     |

**CSS Grid / Flexbox 使い分け**:

- CardGrid: CSS Grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
- FeaturedSection: CSS Grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- CategoryTabs: Flexbox (`flex gap-1 overflow-x-auto`)
- PanelContent: Flexbox (縦方向スタック)

### 8. テスト設計

#### テスト構成（125テスト、9ファイル）

| テストファイル            | テスト数 | 対象                          |
| ------------------------- | -------- | ----------------------------- |
| SkillCenterView.test.tsx  | 11       | メインビューの統合テスト      |
| FeaturedSection.test.tsx  | 13       | おすすめセクション            |
| SkillCard.test.tsx        | 12       | ツールカード                  |
| AddButton.test.tsx        | 17       | モーフィング追加ボタン        |
| CategoryTabs.test.tsx     | 6        | カテゴリタブ + キーボードナビ |
| SkillDetailPanel.test.tsx | 37       | 詳細パネル（最大テスト数）    |
| SkillEmptyState.test.tsx  | 4        | ゼロステート                  |
| useFeaturedSkills.test.ts | 15       | おすすめ選定フック            |
| useSkillCenter.test.ts    | 10       | メインロジックフック          |

#### Pitfall 対策

| Pitfall | テストでの対策                                                           |
| ------- | ------------------------------------------------------------------------ |
| P31     | 個別セレクタをモック化。合成Hook未使用                                   |
| P39     | `fireEvent` のみ使用。`userEvent` import なし                            |
| P40     | `apps/desktop` ディレクトリから実行                                      |
| P47     | `addButtonStyles`, `PERMISSION_LABELS` 等の Record 定数をテストで import |
| P9      | `beforeEach` で全モックをリセット                                        |

#### カバレッジ結果

| ファイル             | Line   | Branch | Function |
| -------------------- | ------ | ------ | -------- |
| index.tsx            | 94.5%  | 82.35% | 100%     |
| AddButton.tsx        | 100%   | 93.33% | 100%     |
| CategoryTabs.tsx     | 93.39% | 85.71% | 100%     |
| SkillCard.tsx        | 100%   | 92.3%  | 100%     |
| SkillEmptyState.tsx  | 97.05% | 83.33% | 100%     |
| FeaturedCard.tsx     | 100%   | 100%   | 100%     |
| FeaturedSection.tsx  | 100%   | 100%   | 100%     |
| SkillDetailPanel.tsx | 100%   | 92.5%  | 100%     |
| useFeaturedSkills.ts | 100%   | 100%   | 100%     |
| useSkillCenter.ts    | 91.87% | 87.5%  | 100%     |

### 9. ファイル構成

```
apps/desktop/src/renderer/views/SkillCenterView/
├── index.tsx                          # メインビュー (template)
├── hooks/
│   ├── useSkillCenter.ts              # メインロジックフック
│   └── useFeaturedSkills.ts           # おすすめスキル選定フック
├── components/
│   ├── AddButton.tsx                  # モーフィング追加ボタン (atom)
│   ├── CategoryTabs.tsx               # カテゴリタブ (molecule)
│   ├── SkillCard.tsx                  # ツールカード (molecule)
│   ├── SkillEmptyState.tsx            # ゼロステート (molecule)
│   ├── FeaturedSection/
│   │   ├── FeaturedSection.tsx        # おすすめセクション (organism)
│   │   └── FeaturedCard.tsx           # おすすめカード (molecule)
│   └── SkillDetailPanel/
│       └── SkillDetailPanel.tsx       # 詳細パネル (organism)
└── __tests__/
    ├── SkillCenterView.test.tsx
    ├── FeaturedSection.test.tsx
    ├── SkillCard.test.tsx
    ├── AddButton.test.tsx
    ├── CategoryTabs.test.tsx
    ├── SkillDetailPanel.test.tsx
    ├── SkillEmptyState.test.tsx
    ├── useFeaturedSkills.test.ts
    └── useSkillCenter.test.ts
```
