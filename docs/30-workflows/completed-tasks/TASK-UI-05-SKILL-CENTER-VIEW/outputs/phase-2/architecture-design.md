# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 2                            |
| 機能名   | TASK-UI-05-SKILL-CENTER-VIEW |
| タスクID | TASK-UI-05-SKILL-CENTER-VIEW |
| 作成日   | 2026-03-01                   |
| 参照     | phase-2-design.md            |

---

## 1. コンポーネント設計

### 1.1 コンポーネントツリー（ディレクトリ構成）

```
apps/desktop/src/renderer/views/SkillCenterView/
├── index.tsx                              # メインレイアウト（template層）
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
│   │   └── SkillDangerZone.tsx           # 「このツールを削除」+「フォーク」ボタン
│   ├── SkillImportSection.tsx             # 追加トリガー（既存SkillImportDialog連携）
│   └── SkillEmptyState.tsx               # ゼロステート表示
├── hooks/
│   ├── useSkillCenter.ts                  # フィルタリング・検索・選択ロジック
│   └── useFeaturedSkills.ts              # おすすめスキル選定ロジック
└── __tests__/
    ├── SkillCenterView.test.tsx
    ├── FeaturedSection.test.tsx
    ├── SkillCard.test.tsx
    ├── AddButton.test.tsx
    ├── CategoryTabs.test.tsx
    ├── SkillDetailPanel.test.tsx
    ├── useSkillCenter.test.ts
    └── useFeaturedSkills.test.ts
```

### 1.2 コンポーネント間の依存関係図

```
SkillCenterView (index.tsx) ─────────────────────────────────────
  │
  ├── FeaturedSection ─────────────────────────────────────────
  │   ├── FeaturedCard × 3（最大） ────────────────────────────
  │   │   └── AddButton (size="featured")
  │   └── useFeaturedSkills (hook)
  │
  ├── CategoryTabs ─────────────────────────────────────────────
  │
  ├── SearchBar (TASK-UI-00共通) ──────────────────────────────
  │
  ├── CardGrid (TASK-UI-00共通) ───────────────────────────────
  │   └── SkillCard × N ──────────────────────────────────────
  │       └── AddButton (size="default")
  │
  ├── SkillDetailPanel ─────────────────────────────────────────
  │   ├── SkillCapabilities
  │   ├── SkillPermissions
  │   ├── SkillMarkdownCollapse ───────────────────────────────
  │   │   ├── CodeViewer (TASK-UI-00共通)
  │   │   └── GenerateDocsDialog (サブダイアログ) ─────────────
  │   │       └── DocPreview
  │   └── SkillDangerZone ─────────────────────────────────────
  │       ├── ForkSkillDialog (サブダイアログ)
  │       └── ExportSkillDialog (サブダイアログ)
  │
  ├── SkillImportSection ──────────────────────────────────────
  │   └── SkillImportDialog (既存organisms/) ──────────────────
  │       └── ImportSkillDialog拡張 (サブダイアログ)
  │
  ├── SkillEmptyState ─────────────────────────────────────────
  │
  └── useSkillCenter (hook) ───────────────────────────────────
      └── agentSlice (Zustand Store: 個別セレクタ経由)
```

### 1.3 Atomic Design分類テーブル

| 分類      | コンポーネント                                                                                                                      | 責務                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| atoms     | AddButton                                                                                                                           | 追加/追加済みの2状態ボタン + モーフィング      |
| molecules | SkillCard, FeaturedCard, CategoryTabs, SkillCapabilities, SkillPermissions, SkillMarkdownCollapse, SkillDangerZone, SkillEmptyState | 複数atomsの組み合わせによる機能単位            |
| organisms | FeaturedSection, SkillDetailPanel, SkillImportSection                                                                               | 複数moleculesを束ねたセクション単位            |
| templates | SkillCenterView (index.tsx)                                                                                                         | 全organisms/共通コンポーネントを統合したビュー |

### 1.4 共通コンポーネント利用テーブル（TASK-UI-00参照）

| 共通コンポーネント | 利用箇所                         | 用途                              | Props カスタマイズ                                |
| ------------------ | -------------------------------- | --------------------------------- | ------------------------------------------------- |
| SearchBar          | SkillCenterView ヘッダー         | ツール検索（デバウンス150-300ms） | `placeholder="ツールを検索"`, `onSearch`          |
| CardGrid           | SkillCenterView メインエリア     | SkillCard のグリッド配置          | `columns="auto-fill"`, `minWidth="260px"`         |
| SlideInPanel       | SkillDetailPanel（デスクトップ） | 右からスライドイン表示（450px）   | `width={450}`, `position="right"`                 |
| CodeViewer         | SkillMarkdownCollapse            | SKILL.md の Markdown レンダリング | `language="markdown"`, `content={skillMdContent}` |

---

## 2. 状態管理設計

### 2.1 既存スライスの利用（agentSlice）

SkillCenter は**新規スライスを作成しない**。既存 `agentSlice` のスキル管理機能をそのまま利用する。

**重要（P31対策）**: 合成Store Hook（`useAgentStore()`）の関数を `useEffect` 依存配列に含めない。以下の個別セレクタを使用すること。

| agentSlice の状態/アクション | SkillCenter での用途           | 個別セレクタ名（P31対策）      | 型                                     |
| ---------------------------- | ------------------------------ | ------------------------------ | -------------------------------------- |
| `skills`                     | ツール一覧表示・おすすめ選定   | `useSkills()`                  | `Skill[]`                              |
| `availableSkillsMetadata`    | カードの詳細情報表示           | `useAvailableSkillsMetadata()` | `SkillMetadata[]`                      |
| `importedSkills`             | 追加済み判定（ボタン状態制御） | `useImportedSkills()`          | `string[]`                             |
| `isLoadingSkills`            | ローディングスケルトン表示     | `useIsLoadingSkills()`         | `boolean`                              |
| `skillFilter`                | 検索キーワード                 | `useSkillFilter()`             | `string`                               |
| `skillCategory`              | カテゴリフィルター             | `useSkillCategory()`           | `string`                               |
| `isImportDialogOpen`         | 追加ダイアログ表示状態         | `useIsImportDialogOpen()`      | `boolean`                              |
| `fetchSkills()`              | 初期読み込み・リフレッシュ     | `useFetchSkills()`             | `() => Promise<void>`                  |
| `importSkill()`              | ツール追加実行                 | `useImportSkill()`             | `(skillName: string) => Promise<void>` |
| `removeSkill()`              | ツール削除実行                 | `useRemoveSkill()`             | `(skillName: string) => Promise<void>` |
| `selectSkillByName()`        | DetailPanel 表示対象の選択     | `useSelectSkillByName()`       | `(name: string) => void`               |
| `setSkillFilter()`           | 検索入力                       | `useSetSkillFilter()`          | `(filter: string) => void`             |
| `setSkillCategory()`         | カテゴリ切替                   | `useSetSkillCategory()`        | `(category: string) => void`           |

### 2.2 画面固有の状態（SkillCenterLocalState）

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

  // サブダイアログ状態
  isForkDialogOpen: boolean;
  forkSourceSkillName: string | null;
  isExportDialogOpen: boolean;
  exportTargetSkillName: string | null;
  isGenerateDocsDialogOpen: boolean;
  generateDocsTargetSkillName: string | null;
}
```

### 2.3 状態配置の判断基準テーブル

| 状態                             | 配置先     | 理由                                                     | 参照ルール             |
| -------------------------------- | ---------- | -------------------------------------------------------- | ---------------------- |
| ツール一覧（skills）             | agentSlice | アプリ全体で共有する状態（AgentViewも参照）              | 03-state-management.md |
| 追加済みツール（importedSkills） | agentSlice | アプリ全体で共有する状態                                 | 03-state-management.md |
| スキルメタデータ                 | agentSlice | アプリ全体で共有する状態                                 | 03-state-management.md |
| 検索キーワード（skillFilter）    | agentSlice | ビュー切替後も検索状態を維持するため                     | 03-state-management.md |
| カテゴリ（skillCategory）        | agentSlice | ビュー切替後もカテゴリ状態を維持するため                 | 03-state-management.md |
| DetailPanel開閉                  | useState   | コンポーネント固有のUI状態（画面遷移で消える）           | 03-state-management.md |
| 削除確認ダイアログ               | useState   | コンポーネント固有のUI状態（一時的）                     | 03-state-management.md |
| 追加ボタン処理中（Map）          | useState   | コンポーネント固有の一時状態（操作完了で消える）         | 03-state-management.md |
| サブダイアログ開閉               | useState   | コンポーネント固有のUI状態（一時的）                     | 03-state-management.md |
| おすすめスキル選定結果           | useMemo    | skills + importedSkills からの派生状態（キャッシュ対象） | NFR-7: useMemo最適化   |

---

## 3. レスポンシブ設計

### 3.1 ブレークポイント定義テーブル

| ブレークポイント | Tailwind   | CardGrid 列数 | おすすめセクション   | DetailPanel 表示         | カテゴリタブ |
| ---------------- | ---------- | ------------- | -------------------- | ------------------------ | ------------ |
| >= 1440px        | `2xl:`     | 4列           | 3枚横並び（grid）    | スライドインパネル 450px | 横並び       |
| 1024px - 1439px  | `lg:`      | 3列           | 3枚横並び（grid）    | スライドインパネル 450px | 横並び       |
| 768px - 1023px   | `md:`      | 2列           | 横スクロール（flex） | ボトムシート（85vh）     | 横スクロール |
| < 768px          | デフォルト | 1列           | 横スクロール（flex） | ボトムシート（85vh）     | 横スクロール |

### 3.2 CardGrid CSS設計

```css
.skill-card-grid {
  display: grid;
  gap: 16px; /* 8pxグリッドの2倍 */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.skill-card {
  min-height: 120px;
  border-radius: 12px; /* Apple HIG準拠 */
  transition:
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
}

.skill-card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.skill-card:active {
  transform: scale(0.97);
}

.skill-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

**auto-fill + minmax による自動列数制御**:

- 260px = カード最小幅。コンテナ幅に応じて列数が自動で 1~4 列に変化する。
- > = 1440px: `floor(1440 / 276) = 5` だが DetailPanel 表示時のメインエリア幅を考慮し実質4列。
- 1024px - 1439px: 実質3列。
- 768px - 1023px: 実質2列。
- < 768px: 実質1列。

### 3.3 おすすめセクション CSS設計

```css
/* デスクトップ: 横並びグリッド（>= 1024px） */
@media (min-width: 1024px) {
  .featured-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

/* モバイル/タブレット: 横スクロール（< 1024px） */
@media (max-width: 1023px) {
  .featured-section {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }

  .featured-section::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .featured-card {
    min-width: 280px;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
}
```

**FeaturedCard スタイル共通**:

```css
.featured-card {
  height: 160px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-accent-rgb), 0.05) 0%,
    transparent 100%
  ); /* アクセントカラー5%グラデーション（左下から右上） */
}
```

### 3.4 DetailPanel レスポンシブ設計

| 属性             | デスクトップ（>= 1024px）                    | モバイル（< 1024px）                                   |
| ---------------- | -------------------------------------------- | ------------------------------------------------------ |
| 表示形式         | 右からスライドインパネル（SlideInPanel利用） | 下からスライドアップ（ボトムシート・独自実装）         |
| 幅 / 高さ        | 450px / 画面高さ100%                         | フル幅 / 最大 85vh                                     |
| アニメーション   | `translateX(100%) -> translateX(0)` 250ms    | `translateY(100%) -> translateY(0)` 300ms              |
| イージング       | ease-out                                     | ease-out                                               |
| ドラッグで閉じる | 非対応                                       | 下方向スワイプで閉じる（閾値50px）                     |
| オーバーレイ     | なし（メインコンテンツ横に表示）             | `rgba(0, 0, 0, 0.3)` 半透明オーバーレイ                |
| 閉じる操作       | x ボタン / Escape キー                       | x ボタン / Escape キー / スワイプ / オーバーレイタップ |

**ボトムシートのスワイプ実装**:

```typescript
// スワイプ検知ロジック概要
const SWIPE_THRESHOLD = 50; // px

function useBottomSheetSwipe(onClose: () => void) {
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  const onTouchStart = (e: TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0) {
      // 下方向にドラッグ中: パネルをずらす（transform）
    }
  };

  const onTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > SWIPE_THRESHOLD) {
      onClose();
    } else {
      // 元の位置にスナップバック
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
```

---

## 4. マイクロインタラクション設計

### 4.1 アニメーション一覧テーブル（11種類）

| No. | 対象                        | トリガー     | アニメーション                                                   | 時間        | プロパティ                  |
| --- | --------------------------- | ------------ | ---------------------------------------------------------------- | ----------- | --------------------------- |
| 1   | おすすめカード              | 初期表示     | stagger `opacity 0->1` + `translateY(8px->0)`, 各カード200ms間隔 | 300-700ms   | `transform`, `opacity`      |
| 2   | SkillCard                   | hover        | `scale(1.02)` + `box-shadow: var(--shadow-md)`                   | 200ms       | `transform`, `box-shadow`   |
| 3   | SkillCard                   | active       | `scale(0.97)`                                                    | 100ms       | `transform`                 |
| 4   | AddButton                   | タップ->成功 | スピナー -> チェックマーク(check)モーフィング -> success-bounce  | 750ms total | `transform`, `opacity`      |
| 5   | AddButton                   | 成功後       | 色変化: `--status-primary` -> `--status-success-subtle`          | 200ms       | `background-color`, `color` |
| 6   | カテゴリタブ                | 切替         | 下線インジケータ スライド（`left` + `width` 変化）               | 200ms       | `left`, `width`             |
| 7   | カードグリッド              | カテゴリ変更 | crossFade（`opacity` 切替）                                      | 150ms       | `opacity`                   |
| 8   | DetailPanel（デスクトップ） | 表示         | `translateX(100%) -> translateX(0)`（右からスライドイン）        | 250ms       | `transform`                 |
| 9   | DetailPanel（モバイル）     | 表示         | `translateY(100%) -> translateY(0)`（下からスライドアップ）      | 300ms       | `transform`                 |
| 10  | SkillMarkdownCollapse       | トグル       | `max-height` トランジション                                      | 300ms       | `max-height`                |
| 11  | おすすめカード              | 追加済み時   | fadeOut -> 次カード繰り上がり                                    | 300ms       | `opacity`, `transform`      |

### 4.2 AddButton 状態遷移図

```
                       タップ
[idle: 追加する] ──────────────> [processing: スピナー]
     ^                                   │
     │                          ┌────────┴────────┐
     │                          │                 │
     │                       成功              失敗
     │                          │                 │
     │                          v                 │
     │               [morphing: ✓ 200ms]          │
     │                          │                 │
     │                          v                 │
     │               [bounce: scale変化 300ms]    │
     │                          │                 │
     │                          v                 │
     │               [success: 追加済み!]         │
     │                                            │
     └────────────────────────────────────────────┘
                    + エラーToast表示
```

**AddButton 各フェーズの詳細**:

| フェーズ       | 内容                                                       | 時間      | CSS プロパティ                           |
| -------------- | ---------------------------------------------------------- | --------- | ---------------------------------------- |
| タップ直後     | ボタン幅を維持しつつテキスト fadeOut                       | 100ms     | `opacity: 1 -> 0`（テキストのみ）        |
| 処理中         | 中央にスピナー表示                                         | 最大300ms | スピナー: `animation: spin 600ms linear` |
| 成功           | スピナー -> チェックマーク(check)モーフィング              | 200ms     | `opacity`, SVG path morphing             |
| success-bounce | `scale(1.0 -> 1.15 -> 1.0)` + 色変化（primary -> success） | 300ms     | `transform: scale()`, `background-color` |
| 最終状態       | 「追加済み!」テキスト fadeIn                               | 150ms     | `opacity: 0 -> 1`（テキストのみ）        |

**色変化テーブル**:

| 状態   | 背景色                         | 文字色                  |
| ------ | ------------------------------ | ----------------------- |
| 未追加 | `var(--status-primary)`        | `white`                 |
| 処理中 | `var(--status-primary)`        | `white`（スピナー表示） |
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
  will-change: transform;
}
```

### 4.3 パフォーマンス考慮事項

| 観点                            | 対策                                                                                        | 根拠                     |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| success-bounce のパフォーマンス | `transform` と `opacity` のみ使用し、`will-change: transform` を事前設定                    | Compositor層で処理       |
| おすすめセクションの再計算      | `importedSkills` 変更時のみ再計算（`useMemo` で最適化）                                     | NFR-7                    |
| stagger アニメーションの SSR    | サーバーサイドでは stagger を無効化し、クライアントのみで実行（`useEffect` でトリガー）     | SSR非互換回避            |
| カテゴリタブ下線の位置計算      | タブ要素の `offsetLeft` と `offsetWidth` から動的に計算。`ResizeObserver` で再計算          | DOM依存の動的位置        |
| CardGrid crossFade              | `React.memo` + `key` による最小再レンダリング。フィルタ結果変更時のみ DOM 更新              | 不要な再レンダリング防止 |
| SearchBar デバウンス            | `useDebounce(150)` で入力イベントを間引き、`setSkillFilter()` の呼び出し頻度を制限          | NFR-5                    |
| アニメーション全般              | `prefers-reduced-motion: reduce` メディアクエリでアニメーションを無効化（アクセシビリティ） | WCAG 2.1 AA              |

---

## 5. IPC連携設計

### 5.1 データフロー図

```
┌─────────────────────────────────────────────────────┐
│  Renderer (SkillCenterView)                         │
│  ├── useSkillCenter (hook)                          │
│  └── useFeaturedSkills (hook)                       │
│       │                                             │
│       v                                             │
│  agentSlice (Zustand Store)                         │
│  ├── fetchSkills()    -> IPC: skill:list            │
│  ├── importSkill()    -> IPC: skill:import          │
│  ├── removeSkill()    -> IPC: skill:remove          │
│  ├── selectSkillByName() -> IPC: skill:get-detail   │
│  └── readSkillFile()  -> IPC: skill:readFile        │
└──────────────────┬──────────────────────────────────┘
                   │ safeInvoke (IPC_CHANNELS定数)
                   v
┌─────────────────────────────────────────────────────┐
│  Preload (contextBridge)                            │
│  ├── window.electronAPI.skill.list()                │
│  ├── window.electronAPI.skill.import(skillName)     │
│  ├── window.electronAPI.skill.remove(skillName)     │
│  ├── window.electronAPI.skill.getDetail(skillName)  │
│  └── window.electronAPI.skill.readFile(args)        │
└──────────────────┬──────────────────────────────────┘
                   │ ipcRenderer.invoke (IPC チャネル)
                   v
┌─────────────────────────────────────────────────────┐
│  Main Process (IPC Handler)                         │
│  ├── P42準拠3段バリデーション                       │
│  └── validateIpcSender (送信元検証)                 │
│       │                                             │
│       v                                             │
│  SkillService                                       │
│  ├── listSkills()                                   │
│  ├── importSkills([skillName])                      │
│  ├── removeSkill(skillName)                         │
│  ├── getSkillDetail(skillName)                      │
│  └── readFile(skillName, relativePath)              │
│       │                                             │
│       v                                             │
│  FileSystem / SkillFileManager                      │
└─────────────────────────────────────────────────────┘
```

### 5.2 利用するIPCチャネルテーブル

| 操作                 | IPCチャネル              | 引数型                                            | 戻り値型           | 呼び出し元（Renderer）           | トリガー               |
| -------------------- | ------------------------ | ------------------------------------------------- | ------------------ | -------------------------------- | ---------------------- |
| ツール一覧取得       | `skill:list`             | なし                                              | `Skill[]`          | `fetchSkills()` アクション       | 画面初期表示時         |
| ツール追加           | `skill:import`           | `skillName: string`                               | `ImportResult`     | `importSkill()` アクション       | AddButtonタップ時      |
| ツール削除           | `skill:remove`           | `skillName: string`                               | `RemoveResult`     | `removeSkill()` アクション       | DangerZone削除確認後   |
| ツール詳細取得       | `skill:get-detail`       | `{ skillId: string }`                             | `SkillDetail`      | `selectSkillByName()` アクション | カードクリック時       |
| SKILL.md取得         | `skill:readFile`         | `{ skillName: string, relativePath: "SKILL.md" }` | `string`           | useSkillCenter hook              | MarkdownCollapse展開時 |
| 外部ソースインポート | `skill:importFromSource` | `ShareTarget`                                     | `ImportResult`     | ImportSkillDialog拡張            | TASK-9F追加チャネル    |
| インポート元検証     | `skill:validateSource`   | `ShareTarget`                                     | `ValidationResult` | ImportSkillDialog拡張            | TASK-9F追加チャネル    |
| スキルエクスポート   | `skill:export`           | `{ skillName: string, destination: ShareTarget }` | `ExportResult`     | ExportSkillDialog                | TASK-9F追加チャネル    |
| スキルフォーク       | `skill:fork`             | `ForkOptions`                                     | `ForkResult`       | ForkSkillDialog                  | TASK-9E連携チャネル    |
| ドキュメント生成     | `skill:docs:generate`    | `{ skillName: string, options: SkillDocOptions }` | `GeneratedDoc`     | GenerateDocsDialog               | TASK-9I連携チャネル    |
| ドキュメント出力     | `skill:docs:export`      | `{ docId: string, format: ExportFormat }`         | `ExportResult`     | DocPreview                       | TASK-9I連携チャネル    |

### 5.3 IPC契約注意事項（P42/P44/P45対策）

| Pitfall | 該当箇所                               | 対策                                                                      | ステータス |
| ------- | -------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| **P42** | 全文字列引数の .trim() バリデーション  | Main側で3段バリデーション済み（型チェック -> 空文字列 -> トリム空文字列） | 対策済み   |
| **P44** | skill:import / skill:remove IPC 不整合 | 解決済み。現在は `string`（スキル名）を直接渡すパターンに統一             | 解決済み   |
| **P45** | skillId vs skillName 命名ドリフト      | 解決済み。全レイヤーで `skillName` に統一済み                             | 解決済み   |

**SkillCenterView 実装時の IPC 利用ルール**:

1. チャネル名は `IPC_CHANNELS` 定数で参照する（ハードコード文字列禁止: P27対策）
2. agentSlice のアクション経由でのみ IPC を呼び出す（Renderer から直接 `safeInvoke` しない）
3. サブダイアログ系の IPC は、ダイアログ固有のカスタムフック内で agentSlice アクションを呼び出す

---

## 6. 既存画面との差別化設計テーブル

| 観点             | SkillCenterView（新規）                            | AgentView（既存・変更なし）               | 差別化の根拠                             |
| ---------------- | -------------------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| **主目的**       | ツール探索・管理（アプリストア体験）               | スキル選択 + 実行                         | 責務分離: 発見 vs 実行                   |
| **レイアウト**   | おすすめ + カテゴリタブ + CardGrid + DetailPanel   | SkillList + SkillDetail + ExecutionStream | 探索型 vs 操作型                         |
| **操作**         | 追加、削除、詳細閲覧、フォーク、エクスポート       | スキル選択、実行開始、権限応答            | 管理操作 vs 実行操作                     |
| **表示形式**     | アプリストア型カード（探索型: グリッドレイアウト） | リスト（選択型: 垂直リスト）              | 視覚的発見 vs 効率的選択                 |
| **状態モデル**   | 追加 / 未追加の2状態                               | 有効 / 無効 / 選択 / 未選択               | シンプルな状態 vs 実行コンテキスト状態   |
| **遷移関係**     | カード -> DetailPanel -> 追加 or 削除              | スキル選択 -> 実行画面へ遷移              | 情報閲覧中心 vs 操作フロー中心           |
| **UX言語**       | 「ツール」「追加する」「AIにできること」           | 「スキル」「有効化」「パーミッション」    | ユーザー向け平易表現 vs 開発者向け用語   |
| **情報開示戦略** | 3レベル段階開示（おすすめ -> カード -> 詳細）      | 2ペイン（リスト + 詳細）                  | 探索的発見 vs 直接アクセス               |
| **データソース** | agentSlice（共有・読み取り中心）                   | agentSlice（共有・読み書き）              | 同一データソースでデータ整合性を自動維持 |

**重要**: AgentView は**一切変更しない**。SkillCenter は同じ `agentSlice` のデータを参照するため、データの整合性は自動的に保たれる。

---

## 7. サブダイアログ設計

### 7.1 ForkSkillDialog（task-9e移管）

**起動元**: SkillDetailPanel > SkillDangerZone > 「このツールをフォーク」ボタン

```typescript
interface ForkSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSkillName: string;
  onForkComplete: (newSkillName: string) => void;
}

interface ForkFormState {
  newName: string; // 必須、1-50文字、英数字+ハイフン
  description: string; // 任意
  copyAgents: boolean; // デフォルト: true
  copyReferences: boolean; // デフォルト: true
  copyScripts: boolean; // デフォルト: true
  copyAssets: boolean; // デフォルト: true
}
```

**バリデーションルール**:

| フィールド | ルール                          | エラーメッセージ                       |
| ---------- | ------------------------------- | -------------------------------------- |
| newName    | 必須、1-50文字、英数字+ハイフン | 「ツール名を入力してください」         |
| newName    | 既存スキル名と重複不可          | 「このツール名は既に使用されています」 |
| コピー対象 | 最低1つ選択                     | 「コピー対象を選択してください」       |

**インタラクションフロー**:

```
[このツールをフォーク] タップ
  -> ForkSkillDialog オープン（フェードイン 200ms）
  -> 新しい名前入力 + コピー対象選択
  -> [フォークを作成] タップ
     -> スピナー表示
     -> IPC: skill:fork
     -> 成功時: ダイアログ閉じる + Toast「{newName} を作成しました」+ カード一覧更新
     -> 失敗時: エラーメッセージ表示（ダイアログ内インライン）
```

**IPC**: `skill:fork`（task-9eバックエンド仕様参照）

### 7.2 ImportSkillDialog拡張（task-9f移管）

**起動元**: 既存 `SkillImportDialog`（organisms/）を拡張

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

**4つのインポートソースタブ**:

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

### 7.3 ExportSkillDialog（task-9f移管）

**起動元**: SkillDetailPanel > メタ情報セクション > 「このツールをエクスポート」ボタン

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
  isPublic: boolean; // Gist の場合、デフォルト: false
  localPath: string; // ローカルの場合
  description: string; // Gist の description
}

interface ExportDialogState {
  isExporting: boolean;
  result: ExportResult | null;
  errorMessage: string | null;
  retryCount: number;
}
```

**IPC**: `skill:export`

**表示項目**:

| 表示項目           | 配置         | 説明                                       |
| ------------------ | ------------ | ------------------------------------------ |
| エクスポート先選択 | ラジオボタン | Gist / ローカル                            |
| 公開設定           | トグル       | Gist の場合のみ表示、デフォルト: 非公開    |
| 保存先パス         | ファイル選択 | ローカルの場合のみ表示                     |
| 説明文             | テキスト入力 | Gist の description                        |
| 共有URL表示        | 読み取り専用 | エクスポート成功後に表示、コピーボタン付き |

**ExportResult -> UI変換**:

- 成功時（`shareUrl` あり）: 共有 URL を表示 + コピーボタン有効化
- 成功時（`shareUrl` なし: ローカル）: 「エクスポート完了」メッセージ + 出力先パス表示
- 失敗時: エラーメッセージ表示 + リトライボタン有効化
- 連続失敗（3回以上）: 「手動エクスポートを試してください」案内表示

### 7.4 GenerateDocsDialog + DocPreview（task-9i移管）

**起動元**: SkillDetailPanel > SkillMarkdownCollapse下 > 「ドキュメントを生成」ボタン

```typescript
interface GenerateDocsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
}

interface DocGenerationFormState {
  outputFormat: "markdown" | "html" | "pdf";
  language: "ja" | "en";
  includeExamples: boolean; // デフォルト: true
  includeApiReference: boolean; // デフォルト: false
  selectedSections: string[]; // 概要, インストール, 使い方, コマンド一覧等
  templateId: string; // Standard / Minimal / Detailed
}

interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  onExport: (docId: string, format: ExportFormat, outputPath: string) => void;
  onCopy: () => void;
  onClose: () => void;
}

type ExportFormat = "markdown" | "html" | "pdf";
```

**IPC**: `skill:docs:generate`, `skill:docs:export`

**インタラクションフロー**:

```
SkillDetailPanel > [ドキュメントを生成] タップ
  -> GenerateDocsDialog オープン
  -> 設定選択（フォーマット / 言語 / セクション / テンプレート）
  -> [生成する] タップ
     -> プログレスバー表示（LLM ストリーミング中）
     -> IPC: skill:docs:generate
     -> 完了時: DocPreview に遷移
  -> DocPreview:
     -> Markdown プレビュー表示（CodeViewer利用）
     -> [エクスポート] -> IPC: skill:docs:export -> ファイル保存
     -> [コピー] -> クリップボードコピー + Toast「コピーしました」
```

**DocPreview エクスポートのデータフロー**:

1. Renderer（DocPreview）: `doc.id`（docId）のみを渡す（オブジェクト全体は渡さない）
2. Preload: `safeInvoke(IPC_CHANNELS.SKILL_DOCS_EXPORT, { docId, format, outputPath })`
3. Main: `docId` から `GeneratedDoc` を取得 -> `exportToFile(doc, outputPath)` を実行
4. Preload -> Renderer: `ExportResult` を返す

---

## 8. テスト設計方針

### 8.1 テストファイル構成

```
apps/desktop/src/renderer/views/SkillCenterView/__tests__/
├── SkillCenterView.test.tsx      # 統合テスト: 画面全体のレンダリング・フロー
├── FeaturedSection.test.tsx      # おすすめセクション: 最大3枚表示・stagger・繰り上がり
├── SkillCard.test.tsx            # ツールカード: Props反映・hover/active・クリック
├── AddButton.test.tsx            # 追加ボタン: 状態遷移・モーフィング・size variant
├── CategoryTabs.test.tsx         # カテゴリタブ: 切替・下線スライド・横スクロール
├── SkillDetailPanel.test.tsx     # 詳細パネル: セクション表示・レスポンシブ・閉じる
├── useSkillCenter.test.ts        # フックテスト: フィルタリング・検索・選択ロジック
└── useFeaturedSkills.test.ts     # フックテスト: おすすめ選定ロジック・多様性確保
```

### 8.2 テスト区分別方針

| テスト区分       | 対象                               | 方針                                          | 検証軸                       |
| ---------------- | ---------------------------------- | --------------------------------------------- | ---------------------------- |
| ユニットテスト   | AddButton, SkillCard, CategoryTabs | 状態遷移、Props反映、アクセシビリティ（ARIA） | 表示・インタラクション・a11y |
| フックテスト     | useSkillCenter, useFeaturedSkills  | フィルタリングロジック、おすすめ選定ロジック  | ロジック正確性・境界値       |
| 統合テスト       | SkillCenterView                    | 追加/削除フロー、検索、カテゴリ切替           | E2Eフロー・agentSlice連携    |
| スナップショット | FeaturedSection, SkillDetailPanel  | レイアウト回帰検出                            | 構造の安定性                 |

### 8.3 Pitfall対策テーブル

| Pitfall | 対策内容                                                                                                                                                      | 適用箇所                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **P31** | agentSlice からは個別セレクタ使用（`useImportedSkills()`, `useSkillFilter()` 等）。合成Store Hook（`useAgentStore()`）の関数を `useEffect` 依存配列に含めない | 全コンポーネント・全テスト     |
| **P39** | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む                               | 全テストファイル               |
| **P40** | テスト実行は `cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/` から実行。プロジェクトルートからの実行は禁止                            | テスト実行時                   |
| **P47** | CSS変数ベースのスタイルテスト時、`variantStyles` を Record 定数として export し、テスト側で import して期待値を生成                                           | AddButton, SkillPermissions 等 |
| **P46** | `React.HTMLAttributes` を extends する際、HTML標準属性と同名のカスタムPropsは `Omit` で除外                                                                   | コンポーネントProps型定義時    |

### 8.4 テストで検証するアクセシビリティ項目

| 検証項目                    | 対象コンポーネント                 | 検証方法                                           |
| --------------------------- | ---------------------------------- | -------------------------------------------------- |
| キーボード操作（Tab/Enter） | AddButton, SkillCard, CategoryTabs | `fireEvent.keyDown` で Tab/Enter/Escape 操作を検証 |
| ARIA ラベル                 | 全インタラクティブ要素             | `getByRole`, `getByLabelText` でアクセス確認       |
| focus-visible アウトライン  | SkillCard, AddButton               | focus 状態の CSS クラスを確認                      |
| role 属性                   | CategoryTabs（tablist/tab）        | `getByRole("tablist")`, `getByRole("tab")` で確認  |

---

## 統合テスト連携

| 統合ポイント           | 契約定義                                                           |
| ---------------------- | ------------------------------------------------------------------ |
| Renderer -> agentSlice | 個別セレクタ使用（P31対策）、状態変更はアクション経由のみ          |
| agentSlice -> Preload  | safeInvoke 経由のIPC呼び出し、IPC_CHANNELS 定数使用（P27対策）     |
| Preload -> Main        | 既存IPCチャネル（P44/P45解決済み）、P42準拠3段バリデーション       |
| Main -> FileSystem     | SkillService / SkillFileManager 経由（既存サービス利用、変更なし） |

---

## 要件との整合性確認

| Phase 1 要件ID | 要件概要                | 本設計での対応箇所                      |
| -------------- | ----------------------- | --------------------------------------- |
| FR-1           | おすすめセクション      | 1.2 FeaturedSection + 4.1 No.1,11       |
| FR-2           | ツールカード + CardGrid | 1.2 SkillCard + 3.2 CardGrid CSS        |
| FR-3           | 追加ボタンモーフィング  | 4.2 AddButton状態遷移 + 4.1 No.4,5      |
| FR-4           | カテゴリタブ            | 1.2 CategoryTabs + 4.1 No.6,7           |
| FR-5           | 詳細パネル              | 1.2 SkillDetailPanel + 3.4 レスポンシブ |
| FR-6           | ツール操作フロー        | 5.1 データフロー + 5.2 IPCチャネル      |
| FR-7           | ゼロステート            | 1.2 SkillEmptyState                     |
| FR-8           | レスポンシブ対応        | 3.1 ブレークポイント + 3.2/3.3/3.4      |
| FR-9           | サブダイアログ          | 7.1/7.2/7.3/7.4                         |
| NFR-1~4        | アクセシビリティ        | 8.4 a11y検証項目 + 4.3 reduced-motion   |
| NFR-5~7        | パフォーマンス          | 4.3 パフォーマンス考慮事項              |
| NFR-8~10       | テストカバレッジ        | 8.1 テストファイル構成                  |
| NFR-11~13      | UX言語                  | 6 差別化設計テーブル                    |
| NFR-14         | AgentView変更なし       | 6 差別化設計テーブル（変更なし明記）    |
