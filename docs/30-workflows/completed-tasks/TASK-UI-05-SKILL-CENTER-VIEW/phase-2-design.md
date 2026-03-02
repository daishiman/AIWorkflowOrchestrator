# Phase 2: 設計

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 2                            |
| 機能名   | TASK-UI-05-SKILL-CENTER-VIEW |
| タスクID | TASK-UI-05-SKILL-CENTER-VIEW |
| 作成日   | 2026-03-01                   |

## 目的

Phase 1 で定義した要件を実現可能な構造に落とし込む。SkillCenterView のコンポーネント設計、状態管理設計、レスポンシブ設計、マイクロインタラクション設計、IPC連携設計を策定する。

## 実行タスク

- コンポーネント設計: タスク原本セクション5のコンポーネントツリーに基づく設計
- 状態管理設計: タスク原本セクション6に基づくagentSlice利用設計とローカルステート設計
- レスポンシブ設計: タスク原本セクション7の4段階ブレークポイント設計
- マイクロインタラクション設計: タスク原本セクション9のアニメーション仕様策定
- IPC連携設計: タスク原本セクション11の既存チャネル利用設計
- 既存画面との差別化設計: タスク原本セクション10のAgentViewとの責務分離設計
- サブダイアログ設計: タスク原本セクション15Bのダイアログ仕様策定

## 参照資料

| 資料名         | パス                                                                                                   | 説明                |
| -------------- | ------------------------------------------------------------------------------------------------------ | ------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`                                                           | Phase 1成果物       |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                                                               | Phase 1成果物       |
| スコープ定義   | `outputs/phase-1/scope-definition.md`                                                                  | Phase 1成果物       |
| タスク原本     | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-030-ui-05-skill-center-view.md` | 全仕様              |
| 状態管理ルール | `.claude/rules/03-state-management.md`                                                                 | Zustand設計原則     |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`                                                                   | P31/P39/P40/P44/P45 |

## aiworkflow-requirements 仕様抽出結果（設計Phase）

Phase 1 で抽出した候補から、設計確定に必須な仕様を再抽出する。

| 設計観点                   | 仕様書                                                                            | 設計で固定する内容                     |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| UIコンポーネント           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | SkillCenterViewの責務境界と構成        |
| 機能別UI                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Featured/Detail/Import系の機能分割     |
| UI設計原則                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | HIG/WCAGに沿った情報設計               |
| アーキテクチャ             | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | Atomic Design 層分割                   |
| 状態管理                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSliceの利用方針とローカル状態境界 |
| IPC/API                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | skill系チャネルの使用契約              |
| API一覧                    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | 利用チャネルの一覧整合                 |
| インターフェース           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill関連型契約（skillName中心）       |
| セキュリティ               | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Renderer-Preload-Main境界制約          |
| セキュリティ               | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill系IPCの入力検証要件               |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時の通知/復旧方針                  |
| データ整合性（非適用確認） | `.claude/skills/aiworkflow-requirements/references/database-schema.md`            | DB変更なしを設計段階で確定             |

## 実行手順

### 1. コンポーネント設計

#### 1.1 コンポーネントツリー

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
│   │   └── SkillDangerZone.tsx           # 「このツールを削除」+「フォーク」ボタン
│   ├── SkillImportSection.tsx             # 追加トリガー（既存SkillImportDialog連携）
│   └── SkillEmptyState.tsx               # ゼロステート表示
└── hooks/
    ├── useSkillCenter.ts                  # フィルタリング・検索・選択ロジック
    └── useFeaturedSkills.ts              # おすすめスキル選定ロジック
```

#### 1.2 コンポーネント間の依存関係

```
SkillCenterView (index.tsx)
  ├── FeaturedSection
  │   ├── FeaturedCard × 3（最大）
  │   │   └── AddButton (size="featured")
  │   └── useFeaturedSkills (hook)
  ├── CategoryTabs
  ├── SearchBar (TASK-UI-00共通)
  ├── CardGrid (TASK-UI-00共通)
  │   └── SkillCard × N
  │       └── AddButton (size="default")
  ├── SkillDetailPanel
  │   ├── SkillCapabilities
  │   ├── SkillPermissions
  │   ├── SkillMarkdownCollapse
  │   │   └── CodeViewer (TASK-UI-00共通)
  │   └── SkillDangerZone
  │       ├── ForkSkillDialog (サブダイアログ)
  │       └── ExportSkillDialog (サブダイアログ)
  ├── SkillImportSection
  │   └── SkillImportDialog (既存organisms/)
  │       └── ImportSkillDialog拡張 (サブダイアログ)
  ├── SkillEmptyState
  └── useSkillCenter (hook)
```

#### 1.3 Atomic Design分類

| 分類      | コンポーネント                                                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| atoms     | AddButton                                                                                                                           |
| molecules | SkillCard, FeaturedCard, CategoryTabs, SkillCapabilities, SkillPermissions, SkillMarkdownCollapse, SkillDangerZone, SkillEmptyState |
| organisms | FeaturedSection, SkillDetailPanel, SkillImportSection                                                                               |
| templates | SkillCenterView (index.tsx)                                                                                                         |

#### 1.4 共通コンポーネント利用（TASK-UI-00参照）

| 共通コンポーネント | 利用箇所                         | 用途                              |
| ------------------ | -------------------------------- | --------------------------------- |
| SearchBar          | SkillCenterView ヘッダー         | ツール検索                        |
| CardGrid           | SkillCenterView メインエリア     | SkillCard のグリッド配置          |
| SlideInPanel       | SkillDetailPanel（デスクトップ） | 右からスライドイン表示            |
| CodeViewer         | SkillMarkdownCollapse            | SKILL.md の Markdown レンダリング |

### 2. 状態管理設計

#### 2.1 既存スライスの利用（agentSlice）

SkillCenter は **新規スライスを作成しない**。既存 `agentSlice` のスキル管理機能をそのまま利用する。

| agentSlice の状態/アクション | SkillCenter での用途           | 個別セレクタ（P31対策）        |
| ---------------------------- | ------------------------------ | ------------------------------ |
| `skills`                     | ツール一覧表示・おすすめ選定   | `useSkills()`                  |
| `availableSkillsMetadata`    | カードの詳細情報表示           | `useAvailableSkillsMetadata()` |
| `importedSkills`             | 追加済み判定（ボタン状態制御） | `useImportedSkills()`          |
| `isLoadingSkills`            | ローディングスケルトン表示     | `useIsLoadingSkills()`         |
| `skillFilter`                | 検索キーワード                 | `useSkillFilter()`             |
| `skillCategory`              | カテゴリフィルター             | `useSkillCategory()`           |
| `isImportDialogOpen`         | 追加ダイアログ表示状態         | `useIsImportDialogOpen()`      |
| `fetchSkills()`              | 初期読み込み・リフレッシュ     | `useFetchSkills()`             |
| `importSkill()`              | ツール追加実行                 | `useImportSkill()`             |
| `removeSkill()`              | ツール削除実行                 | `useRemoveSkill()`             |
| `selectSkillByName()`        | DetailPanel 表示対象の選択     | `useSelectSkillByName()`       |
| `setSkillFilter()`           | 検索入力                       | `useSetSkillFilter()`          |
| `setSkillCategory()`         | カテゴリ切替                   | `useSetSkillCategory()`        |

**重要（P31対策）**: 合成Store Hook（`useAgentStore()`）の関数を`useEffect`依存配列に含めない。上記の個別セレクタを使用すること。

#### 2.2 画面固有の状態（コンポーネントローカル）

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

**状態配置の判断基準**（`03-state-management.md` 準拠）:

| 状態                 | 配置先         | 理由                         |
| -------------------- | -------------- | ---------------------------- |
| ツール一覧・追加済み | agentSlice     | アプリ全体で共有する状態     |
| DetailPanel開閉      | useState       | コンポーネント固有のUI状態   |
| 削除確認ダイアログ   | useState       | コンポーネント固有のUI状態   |
| 追加ボタン処理中     | useState (Map) | コンポーネント固有の一時状態 |
| サブダイアログ開閉   | useState       | コンポーネント固有のUI状態   |

### 3. レスポンシブ設計

#### 3.1 ブレークポイント定義

| ブレークポイント | CardGrid 列数 | おすすめセクション | DetailPanel 表示         | カテゴリタブ |
| ---------------- | ------------- | ------------------ | ------------------------ | ------------ |
| >= 1440px        | 4列           | 3枚横並び          | スライドインパネル 450px | 横並び       |
| 1024px〜1439px   | 3列           | 3枚横並び          | スライドインパネル 450px | 横並び       |
| 768px〜1023px    | 2列           | 横スクロール       | ボトムシート（85vh）     | 横スクロール |
| < 768px          | 1列           | 横スクロール       | ボトムシート（85vh）     | 横スクロール |

#### 3.2 CardGrid CSS設計

```css
.skill-card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.skill-card {
  min-height: 120px;
}
```

#### 3.3 おすすめセクション CSS設計

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

#### 3.4 DetailPanel レスポンシブ

| 属性             | デスクトップ（>= 1024px）         | モバイル（< 1024px）                 |
| ---------------- | --------------------------------- | ------------------------------------ |
| 表示形式         | 右からスライドインパネル          | 下からスライドアップ（ボトムシート） |
| 幅 / 高さ        | 450px                             | フル幅 / 最大 85vh                   |
| アニメーション   | 右からスライドイン 250ms ease-out | 下からスライドアップ 300ms ease-out  |
| ドラッグで閉じる | 非対応                            | 下方向スワイプで閉じる（閾値50px）   |
| オーバーレイ     | なし（メインコンテンツ横に表示）  | 半透明オーバーレイ表示               |

### 4. マイクロインタラクション設計

#### 4.1 アニメーション一覧

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

#### 4.2 AddButton 状態遷移

```
[追加する] --タップ--> (スピナー 300ms) --成功--> [追加済み! ✓]
                                          |
                                          +--失敗--> [追加する] + エラーToast
```

| フェーズ       | 内容                                        | 時間      |
| -------------- | ------------------------------------------- | --------- |
| タップ直後     | ボタン幅を維持しつつテキスト fadeOut        | 100ms     |
| 処理中         | 中央にスピナー表示                          | 最大300ms |
| 成功           | スピナー -> チェックマーク（✓）モーフィング | 200ms     |
| success-bounce | `scale(1.0 -> 1.15 -> 1.0)` + 色変化        | 300ms     |
| 最終状態       | 「追加済み!」テキスト fadeIn                | 150ms     |

#### 4.3 パフォーマンス考慮事項

| 観点                            | 対策                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| success-bounce のパフォーマンス | `transform` と `opacity` のみ使用し、`will-change: transform` を事前設定 |
| おすすめセクションの再計算      | `importedSkills` 変更時のみ再計算（useMemo で最適化）                    |
| stagger アニメーションの SSR    | サーバーサイドでは stagger を無効化し、クライアントのみで実行            |
| カテゴリタブ下線の位置計算      | タブ要素の `offsetLeft` と `offsetWidth` から動的に計算                  |

### 5. IPC連携設計

#### 5.1 データフロー

```
Renderer (SkillCenterView)
  -> agentSlice (Zustand Store)
    -> Preload (contextBridge / safeInvoke)
      -> Main Process (IPC Handler)
        -> SkillService
          -> FileSystem / SkillFileManager
```

#### 5.2 利用するIPCチャネル

| 操作                 | IPCチャネル              | 呼び出し元（Renderer）           | 備考                   |
| -------------------- | ------------------------ | -------------------------------- | ---------------------- |
| ツール一覧取得       | `skill:list`             | `fetchSkills()` アクション       | 画面初期表示時         |
| ツール追加           | `skill:import`           | `importSkill()` アクション       | AddButtonタップ時      |
| ツール削除           | `skill:remove`           | `removeSkill()` アクション       | DangerZone削除確認後   |
| ツール詳細取得       | `skill:get-detail`       | `selectSkillByName()` アクション | カードクリック時       |
| SKILL.md取得         | `skill:readFile`         | useSkillCenter hook              | MarkdownCollapse展開時 |
| 外部ソースインポート | `skill:importFromSource` | ImportSkillDialog拡張            | TASK-9F追加チャネル    |
| インポート元検証     | `skill:validateSource`   | ImportSkillDialog拡張            | TASK-9F追加チャネル    |
| スキルエクスポート   | `skill:export`           | ExportSkillDialog                | TASK-9F追加チャネル    |

#### 5.3 IPC契約注意事項

| Pitfall | 該当箇所                  | 対策                                                            |
| ------- | ------------------------- | --------------------------------------------------------------- |
| **P44** | skill:import IPC 不整合   | 解決済み。現在は `string`（スキル名）を直接渡すパターン         |
| **P45** | skillId vs skillName 命名 | 解決済み。全レイヤーで `skillName` に統一済み                   |
| **P42** | .trim() バリデーション    | Main側で3段バリデーション済み（型チェック → 空文字列 → トリム） |

### 6. 既存画面との差別化設計

| 観点           | SkillCenterView（新規）                          | AgentView（既存・変更なし）               |
| -------------- | ------------------------------------------------ | ----------------------------------------- |
| **主目的**     | ツール探索・管理（アプリストア体験）             | スキル選択 + 実行                         |
| **レイアウト** | おすすめ + カテゴリタブ + CardGrid + DetailPanel | SkillList + SkillDetail + ExecutionStream |
| **操作**       | 追加、削除、詳細閲覧                             | スキル選択、実行開始、権限応答            |
| **表示形式**   | アプリストア型カード（探索型）                   | リスト（選択型）                          |
| **状態モデル** | 追加 / 未追加の2状態                             | 有効 / 無効 / 選択 / 未選択               |
| **遷移関係**   | カード -> DetailPanel -> 追加 or 削除            | スキル選択 -> 実行画面へ遷移              |

**重要**: AgentView は **一切変更しない**。SkillCenter は同じ `agentSlice` のデータを参照するため、データの整合性は自動的に保たれる。

### 7. サブダイアログ設計

#### 7.1 ForkSkillDialog（task-9e移管）

- 起動元: SkillDetailPanel > SkillDangerZone > 「このツールをフォーク」
- 入力: 新しいツール名（必須、1-50文字、英数字+ハイフン）、説明文、コピー対象チェックボックス
- バリデーション: 重複チェック、最低1コピー対象選択
- IPC: `skill:fork`（task-9eバックエンド仕様参照）

#### 7.2 ImportSkillDialog拡張（task-9f移管）

- 既存 `SkillImportDialog`（organisms/）を拡張
- 4つのインポートソースタブ: GitHub / Gist / URL / ローカル
- 共通フロー: ソース選択 -> 入力 -> 検証 -> プレビュー -> インポート
- IPC: `skill:importFromSource`, `skill:validateSource`

#### 7.3 ExportSkillDialog（task-9f移管）

- 起動元: SkillDetailPanel > メタ情報セクション > 「このツールをエクスポート」
- エクスポート先: Gist / ローカル
- IPC: `skill:export`

#### 7.4 GenerateDocsDialog + DocPreview（task-9i移管）

- 起動元: SkillDetailPanel > SkillMarkdownCollapse下 > 「ドキュメントを生成」
- 出力フォーマット: Markdown / HTML / PDF
- 言語: 日本語 / English
- IPC: `skill:docs:generate`, `skill:docs:export`

### 8. テスト設計方針

#### 8.1 テストファイル構成

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

#### 8.2 P31/P39/P40 対策

| Pitfall | 対策                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| **P31** | agentSlice からは個別セレクタ使用（`useImportedSkills()`, `useSkillFilter()` 等） |
| **P39** | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止                             |
| **P40** | テスト実行は `cd apps/desktop` から実行                                           |

## 統合テスト連携【必須】

統合ポイント/契約を設計に反映する:

| 統合ポイント          | 契約定義                                                     |
| --------------------- | ------------------------------------------------------------ |
| Renderer → agentSlice | 個別セレクタ使用（P31対策）、状態変更はアクション経由        |
| agentSlice → Preload  | safeInvoke経由のIPC呼び出し、IPC_CHANNELS定数使用            |
| Preload → Main        | 既存IPCチャネル（P44/P45解決済み）、P42準拠3段バリデーション |
| Main → FileSystem     | SkillService / SkillFileManager 経由（既存サービス利用）     |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断 | 確認内容                                            | 仕様参照先          |
| ---------------- | -------- | --------------------------------------------------- | ------------------- |
| UI/UX            | 適用     | 3レベル情報開示、マイクロインタラクション設計       | `ui-ux-*.md`        |
| アクセシビリティ | 適用     | キーボード操作設計、ARIAラベル設計                  | `ui-ux-*.md`        |
| アーキテクチャ   | 適用     | Atomic Design分類、agentSlice利用                   | `architecture-*.md` |
| パフォーマンス   | 適用     | useMemo最適化、will-change設定、60fpsアニメーション | `architecture-*.md` |

## 成果物

| 成果物             | パス                                     | 説明                                  |
| ------------------ | ---------------------------------------- | ------------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | コンポーネント設計・状態管理・IPC連携 |

## 完了条件

- [ ] コンポーネントツリーが定義されている
- [ ] Atomic Design分類が完了している
- [ ] 状態管理設計（agentSlice利用 + ローカルステート）が定義されている
- [ ] P31対策として個別セレクタ使用が明記されている
- [ ] レスポンシブ設計（4段階ブレークポイント）が定義されている
- [ ] マイクロインタラクション仕様が策定されている
- [ ] IPC連携設計が定義されている
- [ ] 既存画面（AgentView）との差別化が明確である
- [ ] サブダイアログ設計（Fork/Import拡張/Export/GenerateDocs）が定義されている
- [ ] テスト設計方針（P31/P39/P40対策）が含まれている
- [ ] 統合テスト連携の統合ポイント/契約が設計に反映されている
- [ ] 要件（Phase 1）との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1成果物）
2. コンポーネント設計（ツリー + Atomic Design分類）
3. 状態管理設計（agentSlice利用 + ローカルステート）
4. レスポンシブ設計（4段階ブレークポイント）
5. マイクロインタラクション設計
6. IPC連携設計
7. 既存画面との差別化設計
8. サブダイアログ設計
9. テスト設計方針
10. 成果物の作成・配置

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --phase 2
```

## 使用スキル

- aiworkflow-requirements（仕様参照用）

## 次のPhase

Phase 3: 設計レビューゲート
