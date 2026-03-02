# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目       | 値                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| タスク ID  | TASK-UI-05-SKILL-CENTER-VIEW                                                      |
| Phase      | 5                                                                                 |
| 機能名     | SkillCenterView（ツールを探す）                                                   |
| 作成日     | 2026-03-01                                                                        |
| 前提条件   | Phase 4 完了（全テスト Red 状態）                                                 |
| 成果物パス | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-5/` |
| コード配置 | `apps/desktop/src/renderer/views/SkillCenterView/`                                |

## 目的

Phase 4 で作成したテストを通すための最小限の実装を行う（Green 状態）。アプリストア型のツール探索・管理画面 SkillCenterView を、コンポーネント・フック・状態管理の各レイヤーで実装する。

## 参照資料

| 資料名             | パス                                                                                                   | 説明                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| タスク定義         | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-030-ui-05-skill-center-view.md` | 全セクション参照                     |
| Phase 4 テスト仕様 | `outputs/phase-4/test-specification.md`                                                                | テストケース一覧                     |
| Phase 2 設計書     | `outputs/phase-2/architecture-design.md`                                                               | コンポーネント設計                   |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                                   | P31, P39, P40, P44, P45, P47         |
| デザイン基盤       | TASK-UI-00                                                                                             | 共通コンポーネント・デザイントークン |
| UI アーキテクチャ  | TASK-UI-01                                                                                             | 状態管理パターン                     |

## aiworkflow-requirements 仕様抽出結果（実装Phase）

| 実装観点                   | 仕様書                                                                            | 実装時の拘束条件                     |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| UIコンポーネント           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | コンポーネント責務と命名方針         |
| 機能別UI                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | SkillCenter関連機能の境界            |
| 状態管理                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice再利用、ローカル状態の分離 |
| IPC API                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存チャネル契約の再利用             |
| API一覧                    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | 利用チャネルの用途整合               |
| 型契約                     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `skillName` 契約の遵守               |
| IPCセキュリティ            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | contextBridge経由制約                |
| IPCセキュリティ            | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill系IPC検証ルール準拠             |
| 入力検証                   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`  | ダイアログ入力の検証ルール           |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時メッセージと復旧動線           |
| 品質基準                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 実装完了時のゲート条件               |
| データ整合性（非適用確認） | `.claude/skills/aiworkflow-requirements/references/database-schema.md`            | DB更新なしを明示                     |

## 実行タスク

- hooks 実装: useSkillCenter, useFeaturedSkills の状態管理基盤構築
- コンポーネント実装: 全 UI コンポーネントの TDD Green 実装
- IPC 連携実装: 既存 IPC チャネルを活用したデータフロー構築
- サブダイアログ実装: ForkSkillDialog, ImportSkillDialog拡張, ExportSkillDialog, GenerateDocsDialog

## 実装順序（依存関係ベース）

以下の順序で実装する。各ステップでテスト Green を確認してから次に進む。

### ステップ 1: hooks（状態管理基盤）

#### 1.1 useFeaturedSkills.ts

```
apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts
```

- 未追加スキルから最大3件を選定するロジック
- popularity 降順ソート + カテゴリ多様性確保（同カテゴリ最大2件）
- `useMemo` で最適化（`importedSkills` 変更時のみ再計算）

**実装ポイント**:

```typescript
// ensureCategoryDiversity: 同カテゴリ最大 maxPerCategory 件に制限
function ensureCategoryDiversity(
  skills: Skill[],
  maxPerCategory: number,
): Skill[];
```

#### 1.2 useSkillCenter.ts

```
apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts
```

- フィルタリング（カテゴリ + 検索キーワード）
- DetailPanel 開閉状態管理
- ツール追加/削除の非同期操作管理
- `agentSlice` 個別セレクタ使用（P31 対策）

**状態管理設計（P31 対策: 個別セレクタ使用必須）**:

```typescript
// ✅ 正しい: 個別セレクタを使用
const skills = useSkills();
const importedSkills = useImportedSkills();
const isLoadingSkills = useIsLoadingSkills();
const fetchSkills = useFetchSkills();
const importSkill = useImportSkill();
const removeSkill = useRemoveSkill();
const setSkillFilter = useSetSkillFilter();
const setSkillCategory = useSetSkillCategory();

// ❌ 禁止: 合成 Hook を使用（P31 無限ループの原因）
// const { skills, importedSkills, ... } = useAgentStore();
```

**ローカル状態**:

```typescript
interface SkillCenterLocalState {
  isDetailOpen: boolean;
  detailSkillName: string | null;
  isDeleteConfirmOpen: boolean;
  deleteTargetSkillName: string | null;
  addingSkills: Map<string, boolean>;
}
```

### ステップ 2: SkillEmptyState

```
apps/desktop/src/renderer/views/SkillCenterView/components/SkillEmptyState.tsx
```

- ゼロステート表示（ツール0件 / 検索結果0件）
- EmptyState mood="welcoming"（共通コンポーネント 00 参照）
- 検索結果0件時: 「{keyword}に一致するツールが見つかりませんでした」+ フィルタークリアボタン

### ステップ 3: CategoryTabs

```
apps/desktop/src/renderer/views/SkillCenterView/components/CategoryTabs.tsx
```

- 横スクロール可能なカテゴリタブ（6カテゴリ: すべて / 開発ツール / 文書作成 / データ分析 / 自動化 / その他）
- 下線インジケータのスライドアニメーション（200ms ease-out）
- スクロールバー非表示（`scrollbar-width: none`）
- キーボードナビゲーション（矢印キー移動、Enter/Space 選択）
- ARIA: `role="tablist"` / `role="tab"` / `aria-selected`

**カテゴリ定数定義**:

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

### ステップ 4: SkillCard

```
apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx
```

- カードグリッド内ツールカード（min-height: 120px、48px アイコン）
- Props: `skill`, `isAdded`, `onAdd`, `onSelect`
- マイクロインタラクション: hover `scale(1.02)` + shadow、active `scale(0.97)`
- フォーカスリング: 2px accent color outline（offset 2px）
- ボタンタッチターゲット: 44x44px（Apple HIG 準拠）
- 説明文1行切り捨て

### ステップ 5: AddButton

```
apps/desktop/src/renderer/views/SkillCenterView/components/AddButton.tsx
```

- モーフィングボタン: `[追加する] → スピナー → ✓ → [追加済み!]`
- Props: `isAdded`, `isProcessing`, `onAdd`, `size?: "default" | "featured"`
- 状態遷移アニメーション（合計約750ms）:
  - タップ直後: テキスト fadeOut（100ms）
  - 処理中: スピナー表示（最大300ms）
  - 成功: チェックマークモーフィング（200ms）
  - success-bounce: `scale(1.0 → 1.15 → 1.0)`（300ms）+ 色変化
  - 最終状態: 「追加済み!」fadeIn（150ms）
- 色変化: `var(--status-primary)` → `var(--status-success-subtle)`
- `will-change: transform` でパフォーマンス最適化
- アクセシビリティ: `aria-label`, `aria-busy`

### ステップ 6: FeaturedSection（FeaturedCard 含む）

```
apps/desktop/src/renderer/views/SkillCenterView/components/FeaturedSection/
├── FeaturedSection.tsx
└── FeaturedCard.tsx
```

- おすすめセクション（最大3枚、未追加ツールのみ）
- FeaturedCard: h=160px, 56px アイコン, アクセントカラー5%グラデーション背景
- stagger 出現アニメーション: `opacity 0→1` + `translateY(8px→0)`, 各カード200ms間隔
- 追加後: フェードアウト → 次のおすすめが繰り上がり
- レスポンシブ: デスクトップ 3列グリッド / モバイル 横スクロール（scroll-snap）

### ステップ 7: SkillDetailPanel（サブコンポーネント含む）

```
apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/
├── SkillDetailPanel.tsx
├── SkillCapabilities.tsx
├── SkillPermissions.tsx
├── SkillMarkdownCollapse.tsx
└── SkillDangerZone.tsx
```

- **SkillDetailPanel**: デスクトップ=右スライドイン（450px, 250ms）、モバイル=ボトムシート（85vh, 300ms）
- **SkillCapabilities**: 「このツールでできること」箇条書き（SKILL.md Capabilities セクションから抽出、3〜5項目）
- **SkillPermissions**: 「AIにできること」バッジ表示（権限名→平易表現マッピング）

  | 技術的権限名 | ユーザー向け表現     | バッジ色                  |
  | ------------ | -------------------- | ------------------------- |
  | `Bash`       | コマンドを実行       | `--status-warning-subtle` |
  | `Read`       | ファイルを読む       | `--status-info-subtle`    |
  | `Write`      | ファイルに書き込む   | `--status-warning-subtle` |
  | `Edit`       | ファイルを編集する   | `--status-warning-subtle` |
  | `WebSearch`  | ウェブを検索する     | `--status-info-subtle`    |
  | `WebFetch`   | ウェブから情報を取得 | `--status-info-subtle`    |

- **SkillMarkdownCollapse**: 折りたたみ（`max-height` トランジション 300ms）、SKILL.md 全文 Markdown レンダリング
- **SkillDangerZone**: 「このツールを削除」（赤テキスト、確認ダイアログ付き）+ 「このツールをフォーク」

### ステップ 8: SkillImportSection

```
apps/desktop/src/renderer/views/SkillCenterView/components/SkillImportSection.tsx
```

- 既存 `SkillImportDialog`（organisms/）との連携トリガー
- ヘッダーの「+ 追加する」ボタンから起動

### ステップ 9: SkillCenterView（index.tsx）メインビュー統合

```
apps/desktop/src/renderer/views/SkillCenterView/index.tsx
```

- 全コンポーネントの統合レイアウト
- 画面タイトル: 「ツールを探す」
- SearchBar + おすすめセクション + カテゴリタブ + CardGrid + DetailPanel
- レスポンシブ対応（4ブレークポイント）:

  | ブレークポイント | CardGrid 列数 | おすすめ表示 | DetailPanel        |
  | ---------------- | ------------- | ------------ | ------------------ |
  | >= 1440px        | 4列           | 3枚横並び    | スライドイン 450px |
  | 1024px〜1439px   | 3列           | 3枚横並び    | スライドイン 450px |
  | 768px〜1023px    | 2列           | 横スクロール | ボトムシート 85vh  |
  | < 768px          | 1列           | 横スクロール | ボトムシート 85vh  |

- UX言語統一: 「スキル」→「ツール」、「インポート」→「追加する」、「パーミッション」→「AIにできること」
- 件数表示: 「XX件のツール」

### ステップ 10: サブダイアログ 4 種

#### 10.1 ForkSkillDialog

- `SkillDangerZone` から起動
- 新しいツール名入力 + コピー対象チェックボックス（agents / references / scripts / assets）
- バリデーション: 名前必須・重複不可・1-50文字・英数字+ハイフン
- IPC: `skill:fork`

#### 10.2 ImportSkillDialog 拡張

- 既存 `SkillImportDialog` を拡張
- 4つのインポートソースタブ: GitHub / Gist / URL / ローカル
- 検証: `skill:validateSource` → プレビュー表示
- インポート: `skill:importFromSource`

#### 10.3 ExportSkillDialog

- `SkillDetailPanel` メタ情報セクションから起動
- エクスポート先: Gist（公開/非公開トグル） / ローカル（ファイル選択）
- IPC: `skill:export`
- 成功時: 共有URL表示（Gist）/ 完了メッセージ（ローカル）
- 失敗時: リトライボタン / 3回連続失敗で手動案内

#### 10.4 GenerateDocsDialog + DocPreview

- `SkillMarkdownCollapse` 下の「ドキュメントを生成」から起動
- 設定: フォーマット（MD/HTML/PDF）、言語（ja/en）、セクション選択、テンプレート
- IPC: `skill:docs:generate`（プログレスバー付き）→ DocPreview 遷移
- DocPreview: Markdown レンダリング + エクスポート（`skill:docs:export`）+ コピー

## IPC 連携（既存チャネル活用）

| 操作                 | IPC チャネル             | 引数                                              | P44/P45 対策                         |
| -------------------- | ------------------------ | ------------------------------------------------- | ------------------------------------ |
| ツール一覧取得       | `skill:list`             | なし                                              | —                                    |
| ツール追加           | `skill:import`           | `skillName: string`                               | string を直接渡す（P44 解決済み）    |
| ツール削除           | `skill:remove`           | `skillName: string`                               | skillName に統一済み（P45 解決済み） |
| ツール詳細取得       | `skill:get-detail`       | `{ skillId: string }`                             | 実装契約準拠                         |
| SKILL.md 取得        | `skill:readFile`         | `{ skillName: string, relativePath: "SKILL.md" }` | TASK-9A 契約準拠                     |
| 外部ソースインポート | `skill:importFromSource` | `ShareTarget`                                     | TASK-9F 追加                         |
| インポート元検証     | `skill:validateSource`   | `ShareTarget`                                     | TASK-9F 追加                         |
| エクスポート         | `skill:export`           | `{ skillName, destination: ShareTarget }`         | TASK-9F 追加                         |

## 状態管理設計

### agentSlice 既存セレクタ使用（P31 対策）

| agentSlice セレクタ            | SkillCenter での用途           |
| ------------------------------ | ------------------------------ |
| `useSkills()`                  | ツール一覧表示・おすすめ選定   |
| `useAvailableSkillsMetadata()` | カードの詳細情報表示           |
| `useImportedSkills()`          | 追加済み判定（ボタン状態制御） |
| `useIsLoadingSkills()`         | ローディングスケルトン表示     |
| `useSkillFilter()`             | 検索キーワード                 |
| `useSkillCategory()`           | カテゴリフィルター             |
| `useFetchSkills()`             | 初期読み込み・リフレッシュ     |
| `useImportSkill()`             | ツール追加実行                 |
| `useRemoveSkill()`             | ツール削除実行                 |

### 画面固有ローカル状態（useState）

- `isDetailOpen` / `detailSkillName`: DetailPanel 開閉
- `isDeleteConfirmOpen` / `deleteTargetSkillName`: 削除確認ダイアログ
- `addingSkills: Map<string, boolean>`: ボタンの処理中状態

## 実装時の注意事項（既知の Pitfall 対策）

| Pitfall | 注意事項                       | 対策                                                                                |
| ------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| **P31** | Zustand Store Hooks 無限ループ | 合成 Store Hook 禁止。個別セレクタ（`useSkills()`, `useImportedSkills()` 等）を使用 |
| **P5**  | リスナー二重登録               | React StrictMode 二重実行対策。`useEffect` 内リスナー登録時は初期化フラグでガード   |
| **P44** | skill:import IPC 不整合        | 解決済み。`skillName: string` を直接渡す                                            |
| **P45** | skillId vs skillName 命名      | 解決済み。全レイヤーで `skillName` に統一                                           |
| **P47** | CSS 変数テストアサーション     | `variantStyles` Record 定数をモジュールスコープで export し、テストから import      |
| **P46** | HTMLAttributes Props 型衝突    | `Omit<React.HTMLAttributes, "content">` で衝突属性を除外                            |

## アクセシビリティ要件（WCAG 2.1 AA）

- 最小タッチターゲット: 44x44px（全インタラクティブ要素）
- キーボードナビゲーション: Tab / Shift+Tab でフォーカス移動、Enter / Space で操作
- CategoryTabs: 矢印キーでタブ移動
- フォーカスリング: 2px accent color outline（offset 2px）
- ARIA ラベル: 全インタラクティブ要素に適切な `aria-label`
- 色だけで情報を伝えない（アイコン・テキスト併用）
- コントラスト比: 4.5:1 以上（通常テキスト）、3:1 以上（大テキスト / UI 部品）

## 統合テスト連携

| 実装項目           | 内容                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| IPC 接続           | 既存チャネル（skill:list / skill:import / skill:remove 等）を活用         |
| エラーハンドリング | IPC エラー時に Toast 表示 + ボタン状態リセット                            |
| 状態同期           | agentSlice 状態変更 → SkillCenterView UI 自動反映（Zustand リアクティブ） |

## 多角的チェック観点

| 観点             | 適用判断 | チェック項目                                                              |
| ---------------- | -------- | ------------------------------------------------------------------------- |
| UI/UX            | ✅       | Apple HIG 準拠、8px グリッド、角丸 8-12px、繊細な影                       |
| アクセシビリティ | ✅       | 44px タッチターゲット、キーボードナビ、ARIA、フォーカス管理               |
| パフォーマンス   | ✅       | `useMemo` / `useCallback` 最適化、`will-change: transform`                |
| セキュリティ     | ✅       | IPC ホワイトリスト準拠、入力バリデーション（フォーク名の英数字+ハイフン） |

## 設計変更記録（該当する場合）

実装中に Phase 2 設計から乖離が発生した場合:

- [ ] 乖離内容と理由を `outputs/phase-5/design-changes.md` に記録
- [ ] Phase 2 設計書への影響を評価し、Phase 10 レビューで検証できるようにする

## 成果物

| 成果物                   | パス                                                     | 説明               |
| ------------------------ | -------------------------------------------------------- | ------------------ |
| 実装コード               | `apps/desktop/src/renderer/views/SkillCenterView/`       | 全コンポーネント   |
| hooks                    | `apps/desktop/src/renderer/views/SkillCenterView/hooks/` | useSkillCenter 等  |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`              | 実装の概要         |
| 設計変更記録（条件付き） | `outputs/phase-5/design-changes.md`                      | Phase 2 からの乖離 |

## 完了条件

- [ ] Phase 4 の全テストが成功状態（Green）
- [ ] 全コンポーネント（10ステップ）が実装されている
- [ ] agentSlice から個別セレクタのみ使用している（P31 対策）
- [ ] IPC 連携が `skillName: string` インターフェースで統一されている（P44/P45 対策）
- [ ] UX 言語マッピング（スキル→ツール、インポート→追加する、パーミッション→AIにできること）が全箇所に適用されている
- [ ] 4ブレークポイントのレスポンシブ対応が完了している
- [ ] 全インタラクティブ要素に hover / active / focus 状態が定義されている
- [ ] 44px 最小タッチターゲットが全ボタンに適用されている
- [ ] キーボードナビゲーションで全操作が可能
- [ ] AgentView に変更がないこと
- [ ] 設計書から変更した箇所がある場合、変更理由が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計書、Phase 4 テスト仕様）
2. useFeaturedSkills.ts 実装
3. useSkillCenter.ts 実装
4. SkillEmptyState 実装
5. CategoryTabs 実装
6. SkillCard 実装
7. AddButton 実装
8. FeaturedSection + FeaturedCard 実装
9. SkillDetailPanel + サブコンポーネント 5 ファイル実装
10. SkillImportSection 実装
11. SkillCenterView index.tsx 統合
12. サブダイアログ 4 種実装
13. Green 状態の確認（全テスト成功確認）
14. 成果物の作成・配置

## TDD 検証

```bash
# テスト実行コマンド（Green 確認）
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/__tests__/

# 確認項目
# - [ ] テストが成功することを確認（Green 状態）
# - [ ] Lint / 型チェックが通ること
```

## 次の Phase

Phase 6: テスト拡充
