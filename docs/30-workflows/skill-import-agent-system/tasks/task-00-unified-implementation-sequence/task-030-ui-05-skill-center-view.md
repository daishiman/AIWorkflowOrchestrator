# TASK-UI-05-SKILL-CENTER-VIEW: ツールを探す

## 1. メタ情報

| 項目         | 値                                                                               |
| ------------ | -------------------------------------------------------------------------------- |
| タスク ID    | TASK-UI-05-SKILL-CENTER-VIEW                                                     |
| ステータス   | 未着手                                                                           |
| 依存タスク   | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-02（ナビコア） |
| 複雑度       | medium                                                                           |
| 対象ビュー   | SkillCenterView（新規作成）                                                      |
| 関連スライス | `agentSlice`（既存利用）                                                         |
| 設計哲学     | 「タップ＆ディスカバー」-- アプリストア型の探索体験                              |

## 2. 目的

ユーザーが **直感的にツールを探し、ワンタップで追加できる** アプリストア型の体験を提供する。画面最上部の「おすすめ」セクションで目を引き、カテゴリ横スクロールで絞り込み、大きなカード内の「追加する」ボタンで即座に操作を完了できる。AgentView はスキル「選択・実行」に専念させ、SkillCenterView はツールの「発見・管理」に特化する。

## 3. Why（なぜ必要か）

- **発見体験**: アプリストアのように「眺めて見つける」体験を提供し、ツール発見のハードルを下げる
- **責務分離**: AgentView に管理 UI と実行 UI が混在しており、画面が複雑化している。SkillCenter に管理機能を分離することで各画面の複雑度を下げる
- **即時フィードバック**: 「追加する」ボタンがカード内に直接配置され、タップ → チェックマークモーフィングで操作完了が一目瞭然
- **管理操作の集約**: 追加・削除・詳細確認をワンストップで行える

### UX言語マッピング（5D準拠）

| 旧表現（技術用語） | 新表現（ユーザー言語） | 理由                               |
| ------------------ | ---------------------- | ---------------------------------- |
| 「スキルセンター」 | 「ツールを探す」       | 目的指向の表現で迷わない           |
| 「スキル」         | 「ツール」             | 日常的に馴染みのある語彙           |
| 「インポート」     | 「追加する」           | 操作が直感的に理解できる           |
| 「パーミッション」 | 「AIにできること」     | 技術的恐怖を和らげる平易な表現     |
| 「バリデーション」 | 「確認」               | 専門用語を排除                     |
| 「有効/無効」      | （削除）               | 追加/未追加の2状態のみでシンプルに |

### ツール管理の責務境界

| 画面            | 責務                 | 操作                                 |
| --------------- | -------------------- | ------------------------------------ |
| **SkillCenter** | ツール探索・管理     | 追加、削除、詳細閲覧                 |
| **AgentView**   | スキル選択（実行用） | スキル選択、実行開始、ストリーム表示 |

## 4. 画面構成図（ASCII）

### デザイン哲学: 3レベルの情報開示

| Level | 見えるもの                    | 要素数の上限 | 操作   |
| ----- | ----------------------------- | ------------ | ------ |
| 1     | おすすめカード + カテゴリタブ | 4個以下      | 眺める |
| 2     | ツールカード一覧              | 1画面6〜9枚  | タップ |
| 3     | 詳細パネル                    | 1枚          | 読む   |

### デスクトップレイアウト（>= 1024px）

```
+------------------------------------------------------------------+
| "ツールを探す"                                                    |
+------------------------------------------------------------------+
| +--------------------------------------------------------------+ |
| | SearchBar (00参照)                              [+ 追加する] | |
| +--------------------------------------------------------------+ |
|                                                                   |
| ---- おすすめ ---- (最大3枚、未追加ツールのみ)                    |
| +--------------------+ +--------------------+ +----------------+ |
| | [icon 56px]        | | [icon 56px]        | | [icon 56px]    | |
| | コードレビュー     | | スライド作成       | | データ分析     | |
| | コードの品質を     | | 美しいプレゼンを   | | データから     | |
| | AIがチェック       | | 自動生成           | | 洞察を発見     | |
| |       [追加する]   | |       [追加する]   | |    [追加する]  | |
| | (h=160px,gradient) | |                    | |                | |
| +--------------------+ +--------------------+ +----------------+ |
|   ^ stagger出現: opacity 0->1 + translateY(8px->0), 200ms間隔    |
|                                                                   |
| +--------------------------------------------------------------+ |
| | [すべて] [開発ツール] [文書作成] [データ分析] [その他] ->     | |
| |  <- 横スクロール可能タブ、選択時に下線スライドアニメーション  | |
| +--------------------------------------------------------------+ |
|                                                                   |
| 12件のツール                                                      |
| +------------------+ +------------------+ +------------------+    |
| | [icon 48px]      | | [icon 48px]      | | [icon 48px]      |   |
| | コードレビュー   | | 翻訳アシスト     | | テスト生成       |   |
| | コードの品質を   | | 多言語翻訳を     | | テストコードを   |   |
| | AIがチェック     | | 素早く実行       | | 自動生成         |   |
| |     [追加する]   | |    [追加済み!]   | |     [追加する]   |   |
| | (h>=120px)       | |                  | |                  |   |
| +------------------+ +------------------+ +------------------+    |
| +------------------+ +------------------+ +------------------+    |
| | [icon 48px]      | | [icon 48px]      | | ...              |   |
| | データ分析       | | リファクタリング | |                  |   |
| +------------------+ +------------------+ +------------------+    |
|                                                                   |
|                                             +--------------------+|
|                                             | SkillDetail         ||
|         (カード選択時にスライドイン)        | Panel (450px)       ||
|                                             |                     ||
|                                             | このツールで         ||
|                                             | できること:          ||
|                                             | - コードを分析       ||
|                                             | - 改善点を提案       ||
|                                             | - レポート生成       ||
|                                             |                     ||
|                                             | AIにできること:      ||
|                                             | [ファイルを読む]     ||
|                                             | [コマンドを実行]     ||
|                                             |                     ||
|                                             | > 詳しい説明を見る   ||
|                                             |                     ||
|                                             | [このツールを削除]   ||
|                                             +--------------------+|
+-------------------------------------------------------------------+
```

### モバイル / タブレットレイアウト（< 1024px）

```
+------------------------------------------+
| ツールを探す                             |
+------------------------------------------+
| [SearchBar]                  [+ 追加]    |
|                                          |
| ---- おすすめ ---- (横スクロール)        |
| +-------------------------------------+ |
| | [icon 56px] コードレビュー          | |
| | コードの品質をAIがチェック          | |
| |                     [追加する]      | |
| +-------------------------------------+ |
| (横スクロールで2枚目・3枚目)            |
|                                          |
| [すべて] [開発ツール] [文書作成] ->     |  <- 横スクロール
+------------------------------------------+
| CardGrid (2列 / 768px未満は1列)          |
| +-----------+ +-----------+              |
| | [48px]    | | [48px]    |              |
| | コード    | | 翻訳      |              |
| |  レビュー |  | アシスト |              |
| | [追加する]| |[追加済み!]|              |
| +-----------+ +-----------+              |
| ...                                      |
+------------------------------------------+

※ カード選択時 -> ボトムシートとして詳細パネルが下からスライドアップ
```

## 5. コンポーネント構成

> 共通コンポーネント（SearchBar, CardGrid, TabSwitcher, SlideInPanel, CodeViewer）は **TASK-UI-00 参照**。

### 5.1 画面固有コンポーネントツリー

```
SkillCenterView/
├── index.tsx                              # メインレイアウト
├── components/
│   ├── FeaturedSection/
│   │   ├── FeaturedSection.tsx            # おすすめセクション（最大3枚）
│   │   └── FeaturedCard.tsx              # おすすめ用大カード（h=160px）
│   ├── SkillCard.tsx                      # カードグリッド内のツールカード（h>=120px）
│   ├── AddButton.tsx                      # 「追加する」->「追加済み!」モーフィングボタン
│   ├── CategoryTabs.tsx                   # 横スクロール可能カテゴリタブ
│   ├── SkillDetailPanel/
│   │   ├── SkillDetailPanel.tsx           # スライドイン（デスクトップ）/ ボトムシート（モバイル）
│   │   ├── SkillCapabilities.tsx          # 「このツールでできること」箇条書き
│   │   ├── SkillPermissions.tsx           # 「AIにできること」バッジ表示
│   │   ├── SkillMarkdownCollapse.tsx      # 「詳しい説明を見る」折りたたみ
│   │   └── SkillDangerZone.tsx           # 「このツールを削除」ボタン
│   ├── SkillImportSection.tsx             # 追加トリガー（既存SkillImportDialog連携）
│   └── SkillEmptyState.tsx               # ゼロステート表示
└── hooks/
    ├── useSkillCenter.ts                  # フィルタリング・検索・選択ロジック
    └── useFeaturedSkills.ts              # おすすめスキル選定ロジック
```

### 5.2 FeaturedSection（おすすめセクション）

最上部に配置される「おすすめツール」セクション。未追加のツールの中から最大3枚を大きめカードで表示し、ユーザーの発見体験を促す。

#### FeaturedCard コンポーネント

```typescript
interface FeaturedCardProps {
  skill: Skill;
  isAdded: boolean;
  onAdd: (skillName: string) => void;
  onSelect: (skillName: string) => void;
  /** stagger アニメーション用のインデックス（0, 1, 2） */
  staggerIndex: number;
}
```

| 属性               | 値                                                                      |
| ------------------ | ----------------------------------------------------------------------- |
| カード高さ         | 160px                                                                   |
| 最大表示数         | 3枚                                                                     |
| 背景               | アクセントカラー 5% グラデーション（左下から右上）                      |
| アイコンサイズ     | 56px（通常カードより大きめ）                                            |
| 出現アニメーション | stagger: `opacity 0->1` + `translateY(8px->0)`, 各カード200ms間隔で遅延 |

**出現アニメーション詳細**:

```css
@keyframes featured-appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.featured-card {
  animation: featured-appear 300ms ease-out forwards;
  opacity: 0; /* 初期状態は非表示 */
}
.featured-card:nth-child(1) {
  animation-delay: 0ms;
}
.featured-card:nth-child(2) {
  animation-delay: 200ms;
}
.featured-card:nth-child(3) {
  animation-delay: 400ms;
}
```

#### おすすめ選定ロジック（useFeaturedSkills）

```typescript
function useFeaturedSkills(skills: Skill[], importedSkills: string[]): Skill[] {
  return useMemo(() => {
    // 1. 未追加のスキルのみ抽出
    const notAdded = skills.filter((s) => !importedSkills.includes(s.name));
    // 2. 人気度順（将来: レコメンドエンジン）でソート
    const sorted = notAdded.sort(
      (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0),
    );
    // 3. カテゴリの多様性を確保（同カテゴリ最大2件）
    const diversified = ensureCategoryDiversity(sorted, 2);
    // 4. 最大3件を返却（0件なら空配列 -> セクション非表示）
    return diversified.slice(0, 3);
  }, [skills, importedSkills]);
}
```

**選定基準（初期リリース）**:

| 優先度 | 条件                                | 理由                           |
| ------ | ----------------------------------- | ------------------------------ |
| 1      | 未追加であること                    | 既に追加済みのツールは推薦不要 |
| 2      | `skill.popularity` 降順             | 人気度の高いツールを優先表示   |
| 3      | カテゴリの多様性（同カテゴリ最大2） | 偏りのない推薦のため           |

### 5.3 SkillCard コンポーネント

カードグリッド内に配置される標準サイズのツールカード。大アイコン（48px）+ ツール名 + 一言説明 + 「追加する」ボタンをカード内に直接配置する。

```typescript
interface SkillCardProps {
  skill: Skill;
  isAdded: boolean;
  onAdd: (skillName: string) => void;
  onSelect: (skillName: string) => void;
}
```

| 表示項目           | ソース                                  | 配置                     |
| ------------------ | --------------------------------------- | ------------------------ |
| アイコン           | `skill.category` からアイコンマッピング | 左上、48x48px            |
| ツール名           | `skill.name`                            | アイコン右、太字         |
| 一言説明           | `skill.description`（1行切り捨て）      | ツール名下、セカンダリ色 |
| 「追加する」ボタン | `isAdded` 状態で切替                    | カード右下、44x44px      |

| 属性                   | 値                        |
| ---------------------- | ------------------------- |
| カード最低高さ         | 120px                     |
| ボタンタッチターゲット | 44x44px（Apple HIG 準拠） |

**マイクロインタラクション**:

| トリガー                       | アニメーション                                                   | 時間           |
| ------------------------------ | ---------------------------------------------------------------- | -------------- |
| hover                          | `transform: scale(1.02)` + `box-shadow: var(--shadow-md)`        | 200ms ease-out |
| active（タップ/クリック中）    | `transform: scale(0.97)`                                         | 100ms ease-out |
| フォーカス                     | `outline: 2px solid var(--color-accent)` + `outline-offset: 2px` | 即時           |
| クリック（カード本体）         | `SkillDetailPanel` を表示                                        | --             |
| クリック（「追加する」ボタン） | チェックマークモーフィング（後述）                               | --             |

### 5.4 AddButton（追加ボタン）モーフィングアニメーション

「追加する」ボタンはカード内に直接配置される。タップすると処理中スピナー -> チェックマーク -> 「追加済み!」とモーフィングする success-bounce アニメーションを実行する。

```typescript
interface AddButtonProps {
  isAdded: boolean;
  isProcessing: boolean;
  onAdd: () => void;
  size?: "default" | "featured"; // featured = おすすめカード用（やや大きめ）
}
```

**状態遷移**:

```
[追加する] --タップ--> (スピナー 300ms) --成功--> [追加済み! ✓]
                                          |
                                          +--失敗--> [追加する] + エラーToast
```

**アニメーション詳細**:

| フェーズ       | 内容                                        | 時間      |
| -------------- | ------------------------------------------- | --------- |
| タップ直後     | ボタン幅を維持しつつテキスト fadeOut        | 100ms     |
| 処理中         | 中央にスピナー表示                          | 最大300ms |
| 成功           | スピナー -> チェックマーク（✓）モーフィング | 200ms     |
| success-bounce | `scale(1.0 -> 1.15 -> 1.0)` + 色変化        | 300ms     |
| 最終状態       | 「追加済み!」テキスト fadeIn                | 150ms     |

**合計アニメーション時間**: 約750ms

**色変化**:

| 状態   | 背景色                         | 文字色                  |
| ------ | ------------------------------ | ----------------------- |
| 未追加 | `var(--status-primary)`        | `white`                 |
| 追加済 | `var(--status-success-subtle)` | `var(--status-success)` |

**success-bounce CSS**:

```css
@keyframes success-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.add-button--success {
  animation: success-bounce 300ms ease-out;
  will-change: transform; /* パフォーマンス最適化 */
}
```

### 5.5 CategoryTabs（カテゴリ横スクロールタブ）

**旧**: FilterChips（静的横並び）
**新**: 横スクロール可能なタブ。タップで下線がスライドするアニメーション付き。

```typescript
const categories = [
  { id: "all", label: "すべて" },
  { id: "dev", label: "開発ツール" },
  { id: "writing", label: "文書作成" },
  { id: "analysis", label: "データ分析" },
  { id: "automation", label: "自動化" },
  { id: "other", label: "その他" },
] as const;
```

**インタラクション**:

| トリガー       | アニメーション                           | 時間           |
| -------------- | ---------------------------------------- | -------------- |
| タブ切替       | 選択下線インジケータがスライド移動       | 200ms ease-out |
| カテゴリ変更時 | カードグリッドが crossFade で切り替わる  | 150ms          |
| 横スクロール   | スクロールバー非表示、タッチスワイプ対応 | --             |

**下線スライドアニメーション**:

```css
.category-tab-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--color-accent);
  transition:
    left 200ms ease-out,
    width 200ms ease-out;
}
```

**横スクロール CSS**:

```css
.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}
.category-tabs::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
```

### 5.6 SkillDetailPanel

カードをタップするとLevel 3の詳細情報を表示する。デスクトップではスライドインパネル、モバイルではボトムシートとして表示する。

| 属性             | デスクトップ（>= 1024px）         | モバイル（< 1024px）                 |
| ---------------- | --------------------------------- | ------------------------------------ |
| 表示形式         | 右からスライドインパネル          | 下からスライドアップ（ボトムシート） |
| 幅 / 高さ        | 450px                             | フル幅 / 最大 85vh                   |
| アニメーション   | 右からスライドイン 250ms ease-out | 下からスライドアップ 300ms ease-out  |
| ドラッグで閉じる | 非対応                            | 下方向スワイプで閉じる（閾値50px）   |
| オーバーレイ     | なし（メインコンテンツ横に表示）  | 半透明オーバーレイ表示               |

#### パネル内セクション構成

```
+----------------------------------+
| [x] ツール名                     |  <- ヘッダー（閉じるボタン付き）
+----------------------------------+
| [icon 56px]                      |
| コードレビュー                   |  <- ツール名（大きめ）
| コードの品質をAIがチェックし...  |  <- 説明文
|                                  |
| -- このツールでできること --     |  <- SkillCapabilities
| - ソースコードの静的分析         |
| - コーディング規約のチェック     |
| - 改善提案レポートの生成         |
|                                  |
| -- AIにできること --             |  <- SkillPermissions
| [ファイルを読む] [コマンドを実行]|  <- バッジ表示
| [ファイルに書き込む]             |
|                                  |
| > 詳しい説明を見る               |  <- SkillMarkdownCollapse
|  (折りたたみ内: SKILL.md全文)    |
|                                  |
| -- メタ情報 --                   |
| 作成者: xxx                      |
| カテゴリ: 開発ツール             |
| 追加日: 2026-02-15               |
|                                  |
+----------------------------------+
| [このツールを削除]               |  <- SkillDangerZone（赤テキスト）
+----------------------------------+
```

#### SkillCapabilities（このツールでできること）

- SKILL.md の `## Capabilities` セクションから自動抽出（3〜5項目）
- 箇条書き（`-`）で表示
- 項目がない場合は `skill.description` をフォールバック表示

#### SkillPermissions（AIにできること）

技術的な権限名を平易なユーザー向け表現に変換してバッジとして表示する。

| 技術的権限名 | ユーザー向け表現     | バッジ色                  |
| ------------ | -------------------- | ------------------------- |
| `Bash`       | コマンドを実行       | `--status-warning-subtle` |
| `Read`       | ファイルを読む       | `--status-info-subtle`    |
| `Write`      | ファイルに書き込む   | `--status-warning-subtle` |
| `Edit`       | ファイルを編集する   | `--status-warning-subtle` |
| `WebSearch`  | ウェブを検索する     | `--status-info-subtle`    |
| `WebFetch`   | ウェブから情報を取得 | `--status-info-subtle`    |

#### SkillMarkdownCollapse（詳しい説明を見る）

- 初期状態: 折りたたみ（閉じた状態）
- 展開時: SKILL.md の全文を `CodeViewer`（00参照）で Markdown レンダリング
- トグルアニメーション: `max-height` トランジション 300ms ease-out
- 折りたたみ見出し: `「詳しい説明を見る ▼」` / 展開時: `「詳しい説明を閉じる ▲」`

### 5.7 ツール操作フロー

#### 追加フロー（カード内「追加する」ボタンから）

```
SkillCard > [追加する] タップ
  -> AddButton: スピナー表示（最大300ms）
  -> useImportSkill(skillName) アクション実行
  -> 成功時:
     -> チェックマーク(✓)モーフィング
     -> success-bounce アニメーション（scale 1.0->1.15->1.0）
     -> ボタンテキスト「追加済み!」に変化
     -> おすすめセクション: 追加済みカードをフェードアウト（次のおすすめが繰り上がる）
  -> 失敗時:
     -> ボタンを「追加する」に戻す
     -> エラー Toast 表示
```

#### 追加フロー（ヘッダーの「+ 追加する」ボタンから）

```
[+ 追加する] ボタン（ヘッダー右）クリック
  -> 既存 SkillImportDialog (organisms/) を表示
  -> useImportSkill() アクション実行
  -> 成功時: カード一覧を更新 + 該当カードのボタンを「追加済み!」に + Toast 表示
  -> 失敗時: エラー Toast 表示
```

#### 削除フロー

```
SkillDetailPanel > [このツールを削除] タップ
  -> 確認ダイアログ:「"コードレビュー" を削除しますか？この操作は取り消せません」
  -> useRemoveSkill(skillName) アクション実行
  -> 成功時: DetailPanel 閉じる + カードのボタンを「追加する」に戻す + Toast 表示
  -> 失敗時: エラー Toast 表示
```

## 6. 状態管理

> Zustand スライスの設計原則は **TASK-UI-01 参照**。

### 6.1 既存スライスの利用（agentSlice）

SkillCenter は **新規スライスを作成しない**。既存 `agentSlice` のスキル管理機能をそのまま利用する。

| agentSlice の状態/アクション | SkillCenter での用途           |
| ---------------------------- | ------------------------------ |
| `skills`                     | ツール一覧表示・おすすめ選定   |
| `availableSkillsMetadata`    | カードの詳細情報表示           |
| `importedSkills`             | 追加済み判定（ボタン状態制御） |
| `isLoadingSkills`            | ローディングスケルトン表示     |
| `skillFilter`                | 検索キーワード                 |
| `skillCategory`              | カテゴリフィルター             |
| `isImportDialogOpen`         | 追加ダイアログ表示状態         |
| `fetchSkills()`              | 初期読み込み・リフレッシュ     |
| `importSkill()`              | ツール追加実行                 |
| `removeSkill()`              | ツール削除実行                 |
| `selectSkillByName()`        | DetailPanel 表示対象の選択     |
| `setSkillFilter()`           | 検索入力                       |
| `setSkillCategory()`         | カテゴリ切替                   |

### 6.2 画面固有の状態（コンポーネントローカル）

```typescript
interface SkillCenterLocalState {
  // DetailPanel（スライドイン / ボトムシート）
  isDetailOpen: boolean;
  detailSkillName: string | null;

  // 削除確認ダイアログ
  isDeleteConfirmOpen: boolean;
  deleteTargetSkillName: string | null;

  // 追加ボタンの処理中状態（skillName -> boolean）
  addingSkills: Map<string, boolean>;
}
```

## 7. レスポンシブ仕様

| ブレークポイント | CardGrid 列数 | おすすめセクション | DetailPanel 表示         | カテゴリタブ |
| ---------------- | ------------- | ------------------ | ------------------------ | ------------ |
| >= 1440px        | 4列           | 3枚横並び          | スライドインパネル 450px | 横並び       |
| 1024px〜1439px   | 3列           | 3枚横並び          | スライドインパネル 450px | 横並び       |
| 768px〜1023px    | 2列           | 横スクロール       | ボトムシート（85vh）     | 横スクロール |
| < 768px          | 1列           | 横スクロール       | ボトムシート（85vh）     | 横スクロール |

### CardGrid レスポンシブ

```css
/* 00のCardGridコンポーネントに準拠 */
.skill-card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.skill-card {
  min-height: 120px;
}
```

### おすすめセクション レスポンシブ

```css
/* デスクトップ: 横並びグリッド */
@media (min-width: 1024px) {
  .featured-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

/* モバイル: 横スクロール */
@media (max-width: 1023px) {
  .featured-section {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .featured-card {
    min-width: 280px;
    scroll-snap-align: start;
  }
}
```

## 8. ゼロステート

### 8.1 ツールが 0 件の場合（EmptyState mood="welcoming"）

```
+------------------------------------------+
|                                          |
|           (welcoming icon)               |
|                                          |
|   ツールを探してみよう                    |
|                                          |
|   ツールを追加すると、AIエージェントが     |
|   もっと多くのことをできるようになります   |
|                                          |
|   [ツールを探してみる]  (Primary Button)  |
|                                          |
+------------------------------------------+
```

- **トリガー**: `skills.length === 0 && !isLoadingSkills`
- **EmptyState mood**: `"welcoming"`（フレンドリーなトーン）
- **メッセージ**: 「ツールを探してみよう」（命令形ではなく提案形）
- **アクション**: `openImportDialog()` で既存 `SkillImportDialog` を表示

### 8.2 検索結果が 0 件の場合

```
+------------------------------------------+
|                                          |
|           (search icon)                  |
|                                          |
|   「{searchKeyword}」に一致する           |
|   ツールが見つかりませんでした            |
|                                          |
|   [フィルターをクリア]  (Ghost Button)    |
|                                          |
+------------------------------------------+
```

### 8.3 ローディング中

- おすすめセクション: スケルトンカード 3 枚（h=160px、グラデーション風 shimmer）
- CardGrid エリア: スケルトンカード 6 枚（h=120px）
- スケルトンカード: `animate-pulse` + グレー背景の矩形

## 9. マイクロインタラクション一覧

| 対象                        | トリガー     | アニメーション                                                   | 時間        |
| --------------------------- | ------------ | ---------------------------------------------------------------- | ----------- |
| おすすめカード              | 初期表示     | stagger `opacity 0->1` + `translateY(8px->0)`, 各カード200ms間隔 | 300-700ms   |
| SkillCard                   | hover        | `scale(1.02)` + `box-shadow: var(--shadow-md)`                   | 200ms       |
| SkillCard                   | active       | `scale(0.97)`                                                    | 100ms       |
| 「追加する」ボタン          | タップ->成功 | スピナー -> ✓ モーフィング -> success-bounce                     | 750ms total |
| 「追加する」ボタン          | 成功後       | 色変化: primary -> success                                       | 200ms       |
| カテゴリタブ                | 切替         | 下線インジケータ スライド                                        | 200ms       |
| カードグリッド              | カテゴリ変更 | crossFade                                                        | 150ms       |
| DetailPanel（デスクトップ） | 表示         | 右からスライドイン                                               | 250ms       |
| DetailPanel（モバイル）     | 表示         | 下からスライドアップ                                             | 300ms       |
| 「詳しい説明を見る」        | トグル       | `max-height` トランジション                                      | 300ms       |
| おすすめカード              | 追加済み時   | fadeOut -> 次カード繰り上がり                                    | 300ms       |

**全操作にフィードバック原則**: 上記以外のインタラクティブ要素（ボタン、リンク）にも最低限 hover / active / focus 状態を定義する。

## 10. 既存画面との差別化

| 観点           | SkillCenterView（新規）                          | AgentView（既存・変更なし）               |
| -------------- | ------------------------------------------------ | ----------------------------------------- |
| **主目的**     | ツール探索・管理（アプリストア体験）             | スキル選択 + 実行                         |
| **レイアウト** | おすすめ + カテゴリタブ + CardGrid + DetailPanel | SkillList + SkillDetail + ExecutionStream |
| **操作**       | 追加、削除、詳細閲覧                             | スキル選択、実行開始、権限応答            |
| **表示形式**   | アプリストア型カード（探索型）                   | リスト（選択型）                          |
| **状態モデル** | 追加 / 未追加の2状態                             | 有効 / 無効 / 選択 / 未選択               |
| **遷移関係**   | カード -> DetailPanel -> 追加 or 削除            | スキル選択 -> 実行画面へ遷移              |

### 既存 AgentView への影響

AgentView は **一切変更しない**。SkillCenter は同じ `agentSlice` のデータを参照するため、データの整合性は自動的に保たれる。

## 11. IPC連携

SkillCenterView は既存の IPC チャネルを利用する。TASK-9F（スキル共有・インポート機能）で追加されるチャネルも含む。

| 操作                 | IPCチャネル              | 引数                                              | 備考                                            |
| -------------------- | ------------------------ | ------------------------------------------------- | ----------------------------------------------- |
| ツール一覧取得       | `skill:list`             | なし                                              | 初期読み込み・リフレッシュ時                    |
| ツール追加           | `skill:import`           | `skillName: string`                               | P44解決済み: string を直接渡す（ローカル用）    |
| ツール削除           | `skill:remove`           | `skillName: string`                               | P44/P45解決済み: skillName に統一済み           |
| ツール詳細取得       | `skill:get-detail`       | `{ skillId: string }`                             | DetailPanel 表示用（実装契約に準拠）            |
| SKILL.md取得         | `skill:readFile`         | `{ skillName: string, relativePath: "SKILL.md" }` | SkillMarkdownCollapse 表示用（TASK-9A契約準拠） |
| 外部ソースインポート | `skill:importFromSource` | `ShareTarget`                                     | 外部ソースからのスキルインポート（TASK-9F追加） |
| インポート元検証     | `skill:validateSource`   | `ShareTarget`                                     | インポート元の検証（TASK-9F追加）               |
| スキルエクスポート   | `skill:export`           | `{ skillName: string, destination: ShareTarget }` | スキルのエクスポート（TASK-9F追加）             |

## 12. テスト計画

### テストファイル構成

```
apps/desktop/src/renderer/
└── views/SkillCenterView/__tests__/
    ├── SkillCenterView.test.tsx
    ├── FeaturedSection.test.tsx
    ├── SkillCard.test.tsx
    ├── AddButton.test.tsx
    ├── CategoryTabs.test.tsx
    ├── SkillDetailPanel.test.tsx
    ├── useSkillCenter.test.ts
    └── useFeaturedSkills.test.ts
```

### テスト方針

| テスト区分       | 対象                               | 方針                                         |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| ユニットテスト   | AddButton, SkillCard, CategoryTabs | 状態遷移、Props反映、アクセシビリティ        |
| フックテスト     | useSkillCenter, useFeaturedSkills  | フィルタリングロジック、おすすめ選定ロジック |
| 統合テスト       | SkillCenterView                    | 追加/削除フロー、検索、カテゴリ切替          |
| スナップショット | FeaturedSection, SkillDetailPanel  | レイアウト回帰検出                           |

### P31/P39/P40 対策

| Pitfall | 対策                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| **P31** | agentSlice からは個別セレクタ使用（`useImportedSkills()`, `useSkillFilter()` 等） |
| **P39** | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止                             |
| **P40** | テスト実行は `cd apps/desktop` から実行                                           |

## 13. 成果物（ファイルパス）

```
apps/desktop/src/renderer/
├── views/SkillCenterView/
│   ├── index.tsx
│   └── components/
│       ├── FeaturedSection/
│       │   ├── FeaturedSection.tsx
│       │   └── FeaturedCard.tsx
│       ├── SkillCard.tsx
│       ├── AddButton.tsx
│       ├── CategoryTabs.tsx
│       ├── SkillDetailPanel/
│       │   ├── SkillDetailPanel.tsx
│       │   ├── SkillCapabilities.tsx
│       │   ├── SkillPermissions.tsx
│       │   ├── SkillMarkdownCollapse.tsx
│       │   └── SkillDangerZone.tsx
│       ├── SkillImportSection.tsx
│       └── SkillEmptyState.tsx
├── views/SkillCenterView/hooks/
│   ├── useSkillCenter.ts
│   └── useFeaturedSkills.ts
└── store/slices/
    └── (agentSlice を既存利用、新規スライス不要)
```

### テストファイル

```
apps/desktop/src/renderer/
└── views/SkillCenterView/__tests__/
    ├── SkillCenterView.test.tsx
    ├── FeaturedSection.test.tsx
    ├── SkillCard.test.tsx
    ├── AddButton.test.tsx
    ├── CategoryTabs.test.tsx
    ├── SkillDetailPanel.test.tsx
    ├── useSkillCenter.test.ts
    └── useFeaturedSkills.test.ts
```

## 14. 完了条件

### 必須: おすすめセクション

- [ ] おすすめセクションが画面最上部に表示される
- [ ] 未追加ツールのみが最大3枚表示される
- [ ] おすすめカードにアクセントカラー 5% グラデーション背景が適用される
- [ ] おすすめカードのアイコンが56pxで表示される
- [ ] stagger出現アニメーション（opacity 0->1 + translateY(8px->0)、200ms間隔）が動作する
- [ ] ツール追加後、おすすめカードがフェードアウトし次のおすすめが繰り上がる
- [ ] 未追加ツールが0件の場合、おすすめセクションが非表示になる

### 必須: ツールカード

- [ ] CardGrid でツール一覧がカード形式（h>=120px、48pxアイコン）で表示される
- [ ] カード内に「追加する」ボタン（44x44pxタッチターゲット）が直接配置される
- [ ] カードhover時に `scale(1.02)` + `shadow-md` が適用される
- [ ] カードactive時に `scale(0.97)` が適用される
- [ ] カードクリックで SkillDetailPanel が表示される
- [ ] 追加済みカードのボタンが「追加済み!」状態で表示される
- [ ] 件数表示（「XX件のツール」）が正確に表示される

### 必須: 追加ボタンモーフィング

- [ ] 「追加する」タップ -> スピナー -> チェックマーク(✓)モーフィング が動作する
- [ ] success-bounce（scale 1.0->1.15->1.0）が動作する
- [ ] ボタンテキストが「追加する」->「追加済み!」に変化する
- [ ] ボタン色が primary -> success に変化する
- [ ] 失敗時にボタンが「追加する」に戻り、エラーToastが表示される

### 必須: カテゴリタブ

- [ ] 横スクロール可能なカテゴリタブが表示される
- [ ] タブ切替時に下線がスライドするアニメーションが動作する
- [ ] カテゴリ変更時にカードグリッドが crossFade で切り替わる
- [ ] SearchBar でのリアルタイム検索フィルタリングが動作する

### 必須: 詳細パネル

- [ ] デスクトップ: 右からスライドインパネル（450px）が表示される
- [ ] モバイル: 下からボトムシート（最大85vh）が表示される
- [ ] モバイル: 下方向スワイプ（閾値50px）で閉じる
- [ ] 「このツールでできること」箇条書き（3〜5項目）が表示される
- [ ] 「AIにできること」が平易な表現のバッジで表示される
- [ ] 「詳しい説明を見る」折りたたみ内に SKILL.md 全文が表示される
- [ ] 「このツールを削除」が確認ダイアログ付きで動作する

### 必須: レスポンシブ

- [ ] > = 1440px: 4列グリッド + おすすめ3枚横並び
- [ ] 1024px〜1439px: 3列グリッド + おすすめ3枚横並び
- [ ] 768px〜1023px: 2列グリッド + おすすめ横スクロール + ボトムシート
- [ ] < 768px: 1列グリッド + おすすめ横スクロール + ボトムシート

### 必須: ゼロステート

- [ ] ツール0件時に EmptyState mood="welcoming" + 「ツールを探してみよう」が表示される
- [ ] 検索結果0件時に「見つかりませんでした」+ フィルタークリアボタンが表示される

### 必須: UX言語

- [ ] 画面タイトルが「ツールを探す」になっている
- [ ] 全表示テキストで「スキル」->「ツール」に統一されている
- [ ] 「インポート」->「追加する」に統一されている
- [ ] 権限表示が「AIにできること」として平易な表現になっている
- [ ] 有効/無効トグルが存在しない（追加/未追加の2状態のみ）

### 必須: 品質

- [ ] AgentView に変更がないこと
- [ ] 全コンポーネントテストが PASS する
- [ ] キーボードでの全操作が可能（WCAG 2.1 AA）
- [ ] 全操作にフィードバック（hover, active, focus状態）が定義されている

## 15. 既知の落とし穴・教訓

| Pitfall | 該当箇所                  | 対策                                                             |
| ------- | ------------------------- | ---------------------------------------------------------------- |
| **P31** | agentSlice セレクタ       | 個別セレクタ使用（`useImportedSkills()`, `useSkillFilter()` 等） |
| **P39** | テスト環境                | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止            |
| **P40** | テスト実行ディレクトリ    | `cd apps/desktop` から実行                                       |
| **P44** | skill:import IPC 不整合   | 解決済み。現在は `string`（スキル名）を直接渡すパターン          |
| **P45** | skillId vs skillName 命名 | 解決済み。全レイヤーで `skillName` に統一済み                    |

### 追加注意事項

| 観点                            | 注意点                                                                   |
| ------------------------------- | ------------------------------------------------------------------------ |
| ボトムシートのスワイプ判定      | 下方向スワイプの閾値を 50px 以上に設定し、誤操作を防ぐ                   |
| success-bounce のパフォーマンス | `transform` と `opacity` のみ使用し、`will-change: transform` を事前設定 |
| おすすめセクションの再計算      | `importedSkills` 変更時のみ再計算（useMemo で最適化）                    |
| stagger アニメーションの SSR    | サーバーサイドでは stagger を無効化し、クライアントのみで実行            |
| カテゴリタブ下線の位置計算      | タブ要素の `offsetLeft` と `offsetWidth` から動的に計算                  |

## 15B. サブダイアログ定義（task-9 UI移管）

> 以下のダイアログは task-9e / task-9f / task-9i から UI 仕様を移管したもの。
> バックエンドサービス・IPC 契約は各 task-9 ファイルを参照。

### 15B.1 ForkSkillDialog（task-9e 移管）

> バックエンド仕様: [task-023f-task-9e-skill-fork.md](./task-023f-task-9e-skill-fork.md)

SkillDetailPanel の「このツールをフォーク」アクションから起動するダイアログ。既存スキルを複製し、新しい名前でカスタマイズ可能にする。

#### コンポーネント配置

```
SkillDetailPanel
  └── SkillDangerZone
        ├── [このツールを削除]      ← 既存
        └── [このツールをフォーク]  ← 新規追加
              └── ForkSkillDialog（モーダル）
```

#### ForkSkillDialog コンポーネント

```typescript
interface ForkSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSkillName: string;
  onForkComplete: (newSkillName: string) => void;
}

interface ForkFormState {
  newName: string;
  description: string;
  copyAgents: boolean;
  copyReferences: boolean;
  copyScripts: boolean;
  copyAssets: boolean;
}
```

| 表示項目                   | 配置                     | 説明                                   |
| -------------------------- | ------------------------ | -------------------------------------- |
| ダイアログタイトル         | ヘッダー                 | 「{sourceSkillName} をフォーク」       |
| 新しいツール名             | テキスト入力             | 必須、バリデーション（重複チェック）   |
| 説明文                     | テキストエリア           | 任意、2行以上                          |
| コピー対象チェックボックス | チェックボックスグループ | agents / references / scripts / assets |
| フォーク実行ボタン         | フッター右               | Primary ボタン、処理中はスピナー       |
| キャンセルボタン           | フッター左               | Ghost ボタン                           |

#### インタラクション

```
[このツールをフォーク] タップ
  -> ForkSkillDialog オープン（フェードイン 200ms）
  -> 新しい名前入力 + コピー対象選択
  -> [フォークを作成] タップ
     -> スピナー表示
     -> IPC: skill:fork（バックエンド: task-9e 参照）
     -> 成功時: ダイアログ閉じる + Toast「{newName} を作成しました」+ カード一覧更新
     -> 失敗時: エラーメッセージ表示（ダイアログ内インライン）
```

#### バリデーション

| フィールド | ルール                          | エラーメッセージ                       |
| ---------- | ------------------------------- | -------------------------------------- |
| newName    | 必須、1-50文字、英数字+ハイフン | 「ツール名を入力してください」         |
| newName    | 既存スキル名と重複不可          | 「このツール名は既に使用されています」 |
| コピー対象 | 最低1つ選択                     | 「コピー対象を選択してください」       |

### 15B.2 ImportSkillDialog / ExportSkillDialog 拡張（task-9f 移管）

> バックエンド仕様: [task-022-task-9f-skill-share.md](./task-022-task-9f-skill-share.md)

既存の SkillImportSection（セクション 5.1 のコンポーネントツリー参照）を拡張し、複数ソースからのインポートとエクスポート機能を追加する。

#### ImportSkillDialog 拡張

既存の `SkillImportDialog`（organisms/）を拡張して、4つのインポートソースタブを追加。

```typescript
interface ImportSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (skillName: string) => void;
}

type ImportSourceType = "github" | "gist" | "url" | "local";

interface ImportFormState {
  sourceType: ImportSourceType;
  // GitHub
  repoUrl: string;
  branch: string;
  path: string;
  // Gist
  gistId: string;
  // URL
  skillUrl: string;
  // Local
  localPath: string;
}
```

| タブ     | 入力フォーム                       | IPC チャネル             |
| -------- | ---------------------------------- | ------------------------ |
| GitHub   | リポジトリURL + ブランチ + パス    | `skill:importFromSource` |
| Gist     | Gist ID                            | `skill:importFromSource` |
| URL      | SKILL.md の URL                    | `skill:importFromSource` |
| ローカル | ディレクトリパス（ファイル選択UI） | `skill:importFromSource` |

**共通フロー**:

```
ソースタイプ選択（タブ切替）
  -> 入力フォーム表示
  -> [検証] ボタン -> IPC: skill:validateSource -> プレビュー表示
  -> [インポート] ボタン -> IPC: skill:importFromSource -> 完了Toast
```

#### ExportSkillDialog

```typescript
interface ExportSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  onExportComplete: (shareUrl?: string) => void;
}

type ExportDestType = "gist" | "local";

interface ExportFormState {
  destType: ExportDestType;
  isPublic: boolean; // Gist の場合
  localPath: string; // Local の場合
  description: string;
}
```

| 表示項目           | 配置         | 説明                                       |
| ------------------ | ------------ | ------------------------------------------ |
| エクスポート先選択 | ラジオボタン | Gist / ローカル                            |
| 公開設定           | トグル       | Gist の場合のみ表示、デフォルト: 非公開    |
| 保存先パス         | ファイル選択 | ローカルの場合のみ表示                     |
| 説明文             | テキスト入力 | Gist の description                        |
| 共有URL表示        | 読み取り専用 | エクスポート成功後に表示、コピーボタン付き |

#### コンポーネント配置

```
SkillDetailPanel
  └── メタ情報セクション（既存）
        └── [このツールをエクスポート]  ← 新規追加
              └── ExportSkillDialog（モーダル）
```

### 15B.3 GenerateDocsDialog / DocPreview（task-9i 移管）

> バックエンド仕様: [task-023c-task-9i-skill-docs.md](./task-023c-task-9i-skill-docs.md)

SkillDetailPanel から起動するドキュメント自動生成ダイアログ。LLM を使ってスキルの構造からドキュメントを生成し、プレビュー・エクスポートする。

#### GenerateDocsDialog

```typescript
interface GenerateDocsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
}

interface DocGenerationFormState {
  outputFormat: "markdown" | "html" | "pdf";
  language: "ja" | "en";
  includeExamples: boolean;
  includeApiReference: boolean;
  selectedSections: string[];
  templateId: string;
}
```

| 表示項目                 | 配置                   | 説明                                          |
| ------------------------ | ---------------------- | --------------------------------------------- |
| 出力フォーマット         | ラジオボタン           | Markdown / HTML / PDF                         |
| 言語選択                 | セグメントコントロール | 日本語 / English                              |
| セクション選択           | チェックボックスリスト | 概要 / インストール / 使い方 / コマンド一覧等 |
| テンプレート選択         | ドロップダウン         | Standard / Minimal / Detailed                 |
| 例を含める               | トグル                 | デフォルト: ON                                |
| API リファレンスを含める | トグル                 | デフォルト: OFF                               |
| 生成ボタン               | フッター右             | Primary、処理中はプログレスバー               |

#### DocPreview

```typescript
interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  /** docId ベースのエクスポート — Main 側で docId からドキュメントを取得して出力する */
  onExport: (docId: string, format: ExportFormat, outputPath: string) => void;
  onCopy: () => void;
  onClose: () => void;
}

/** エクスポート形式の型安全な定義 */
type ExportFormat = "markdown" | "html" | "pdf";
```

#### DocPreview エクスポートのデータフロー

1. **Renderer（DocPreview）**: ユーザーがエクスポートボタンをクリック
   - `onExport(doc.id, selectedFormat, outputPath)` を呼び出す
   - `doc` オブジェクト全体ではなく `doc.id`（docId）のみを渡す

2. **Preload（contextBridge）**: IPC チャネルに変換
   - `safeInvoke(IPC_CHANNELS.SKILL_DOCS_EXPORT, { docId, format, outputPath })`

3. **Main（IPC ハンドラ）**: ドキュメント取得＋エクスポート実行
   - `docId` から `GeneratedDoc` を取得（SkillDocsService 経由）
   - `exportToFile(doc, outputPath)` を実行
   - 結果を `ExportResult` として返す

4. **Preload → Renderer**: 結果を返す
   - `ExportResult` をそのまま返す（Date 型フィールドがある場合は ISO 8601 文字列）

**理由**: Renderer から Main へ `GeneratedDoc` オブジェクト全体を渡すのではなく、`docId` のみを渡す。これにより:

1. IPC 経由で大きなオブジェクトを転送するコストを回避
2. Main 側で最新のドキュメント状態を使用可能
3. Renderer 側のキャッシュ不整合リスクを排除

#### ExportResult → UI コールバック変換ロジック

`skill:export` IPC ハンドラの戻り値 `ExportResult`（task-9f 定義）を ExportSkillDialog の UI 表示に変換するロジック:

##### 成功時（`ExportResult.success === true`）

- `shareUrl` が存在する場合: 共有 URL をダイアログに表示し、クリップボードコピーボタンを有効化
- `shareUrl` が `undefined` の場合（ローカルエクスポート）: 「エクスポート完了」メッセージと出力先パスを表示
- `exportedFiles` の件数を「N 件のファイルをエクスポートしました」として表示

##### 失敗時（`ExportResult.success === false`）

- エラーメッセージを表示（`ExportResult` に `error?: string` フィールドを追加検討）
- リトライボタンを有効化
- 連続失敗時（3回以上）は「手動エクスポートを試してください」の案内を表示

```typescript
// ExportResult → UI 変換の型定義
interface ExportDialogState {
  isExporting: boolean;
  result: ExportResult | null;
  errorMessage: string | null;
  retryCount: number;
}

// 変換関数の概要
function handleExportResult(
  result: ExportResult,
  prev: ExportDialogState,
): ExportDialogState {
  if (result.success) {
    return {
      isExporting: false,
      result,
      errorMessage: null,
      retryCount: 0,
    };
  }
  return {
    isExporting: false,
    result,
    errorMessage: "エクスポートに失敗しました。再試行してください。",
    retryCount: prev.retryCount + 1,
  };
}
```

| 表示項目       | 配置         | 説明                                       |
| -------------- | ------------ | ------------------------------------------ |
| プレビュー領域 | メインエリア | Markdown レンダリング（CodeViewer 00参照） |
| セクション目次 | 左サイドバー | クリックでスクロール                       |
| エクスポート   | ツールバー右 | ファイル保存ダイアログ                     |
| コピー         | ツールバー右 | クリップボードにコピー + Toast             |
| 閉じる         | ヘッダー右   | プレビューを閉じてダイアログに戻る         |

#### インタラクションフロー

```
SkillDetailPanel > [ドキュメントを生成] タップ
  -> GenerateDocsDialog オープン
  -> 設定選択
  -> [生成する] タップ
     -> プログレスバー表示（LLM ストリーミング中）
     -> IPC: skill:docs:generate（バックエンド: task-9i 参照）
     -> 完了時: DocPreview に遷移
  -> DocPreview:
     -> Markdown プレビュー表示
     -> [エクスポート] -> IPC: skill:docs:export -> ファイル保存
     -> [コピー] -> クリップボードコピー + Toast「コピーしました」
```

#### コンポーネント配置

```
SkillDetailPanel
  └── SkillMarkdownCollapse（既存「詳しい説明を見る」の下）
        └── [ドキュメントを生成]  ← 新規追加
              └── GenerateDocsDialog（モーダル）
                    └── DocPreview（ダイアログ内遷移）
```

## 16. 参照資料

| 資料                          | パス / タスク ID                          |
| ----------------------------- | ----------------------------------------- |
| デザイン基盤                  | TASK-UI-00 `00-design-foundation.md`      |
| UI アーキテクチャ             | TASK-UI-01 `01-architecture.md`           |
| ナビゲーションコア            | TASK-UI-02 `02-navigation-core.md`        |
| エージェントビュー            | TASK-UI-03 `03-agent-view.md`             |
| 既存 AgentView                | `views/AgentView/index.tsx`               |
| 既存 SkillImportDialog        | `components/organisms/SkillImportDialog/` |
| 既存 SkillDetailPanel         | `components/organisms/SkillDetailPanel/`  |
| 既存 agentSlice               | `store/slices/agentSlice.ts`              |
| IPC チャネル定義              | `preload/channels.ts`                     |
| P44: IPC 不整合（解決済み）   | `.claude/rules/06-known-pitfalls.md#P44`  |
| P45: 命名ドリフト（解決済み） | `.claude/rules/06-known-pitfalls.md#P45`  |
