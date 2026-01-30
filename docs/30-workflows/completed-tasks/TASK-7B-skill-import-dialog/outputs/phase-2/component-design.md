# コンポーネント設計書

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| Phase      | 2                           |
| 機能名     | TASK-7B-skill-import-dialog |
| 成果物種別 | コンポーネント設計          |
| 作成日     | 2026-01-30                  |

## 概要

SkillImportDialogのコンポーネント構造、Props定義、状態管理設計、および統合ポイントを定義する。

## コンポーネントツリー

```
SkillImportDialog (Organism)
├── Overlay (fixed bg-black/50)
├── DialogContainer
│   ├── Header
│   │   ├── Title (h2: "スキルをインポート")
│   │   └── CloseButton (× button)
│   ├── Content (scrollable)
│   │   ├── SkillInfo (name + icon)
│   │   ├── Section[説明] -> Description text
│   │   ├── Section[許可ツール] (conditional) -> ToolTags
│   │   ├── Section[サブエージェント] (conditional) -> ResourceList
│   │   ├── Section[参照資料] (conditional) -> ResourceList
│   │   ├── Section[スクリプト] (conditional) -> ResourceList
│   │   ├── Section[アセット] (conditional) -> ResourceList
│   │   ├── Section[スキーマ] (conditional) -> ResourceList
│   │   └── Section[インデックス] (conditional) -> ResourceList
│   └── Footer
│       ├── CancelButton
│       └── ImportButton (with loading state)
```

## コンポーネント階層と責務

### SkillImportDialog（Organism）

ダイアログ全体を管理するトップレベルコンポーネント。オーバーレイ表示、ESCキーハンドリング、フォーカストラップ、およびインポート処理のオーケストレーションを担当する。

### Overlay

固定位置の半透明背景。ダイアログの背後に表示され、コンテンツとの視覚的分離を実現する。クリックによるダイアログ閉鎖は行わない（誤操作防止）。

### DialogContainer

ダイアログ本体のコンテナ。Header、Content、Footerの3領域を構造化し、`role="dialog"` および `aria-modal="true"` を付与する。

### Header

ダイアログタイトルと閉じるボタンを横並びで配置する領域。

### Content

スクロール可能なコンテンツ領域。スキル情報と各セクションを縦方向に配置する。

### Section

汎用的なセクション見出し＋コンテンツラッパー。条件付き表示に対応し、データが存在する場合のみレンダリングされる。

### ResourceList

サブリソース（サブエージェント、参照資料、スクリプト、アセット、スキーマ、インデックス）の一覧表示を行うコンポーネント。

### Footer

キャンセルボタンとインポートボタンを配置するアクション領域。

## Props定義

### SkillImportDialogProps

```typescript
interface SkillImportDialogProps {
  /** インポート対象のスキルメタデータ */
  skill: SkillMetadata;
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
}
```

### SectionProps（内部コンポーネント）

```typescript
interface SectionProps {
  /** セクション見出しテキスト */
  title: string;
  /** セクションコンテンツ */
  children: React.ReactNode;
}
```

### ResourceListProps（内部コンポーネント）

```typescript
interface ResourceListProps {
  /** サブリソースの配列 */
  resources: SkillSubResource[];
}
```

## 状態管理設計

### ストアとの連携

SkillImportDialogは `useAppStore()` フックを通じて Zustand ストアの SkillSlice と連携する。

```
┌─────────────────────────────────┐
│    SkillImportDialog            │
│  ┌───────────────────────────┐  │
│  │ useAppStore() から取得    │  │
│  │ - importSkill()           │  │
│  │ - isImporting             │  │
│  │ - importingSkillName      │  │
│  └───────────────────────────┘  │
│                                 │
│  isCurrentlyImporting:          │
│    isImporting &&               │
│    importingSkillName ===       │
│    skill.name                   │
│                                 │
│  handleImport():                │
│    await importSkill(name)      │
│    onClose()                    │
│                                 │
└─────────────────────────────────┘
```

### 状態フロー

1. ユーザーがインポートボタンをクリック
2. `handleImport()` が呼び出される
3. `importSkill(skill.name)` が実行される（ストアの `isImporting` が `true` に変化）
4. `isCurrentlyImporting` が `true` となり、ボタンにローディング表示が反映される
5. インポート処理完了後、`onClose()` が呼び出されダイアログが閉じる

### 派生状態

```typescript
// 現在のスキルがインポート中かどうかの判定
const isCurrentlyImporting = isImporting && importingSkillName === skill.name;
```

この派生状態により、複数のスキルインポートダイアログが存在する場合でも、対象スキルのみが正しくローディング表示される。

## 統合ポイント

### SkillSlice -> Dialog

| 項目     | 詳細                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 連携方法 | `useAppStore()` フック経由                                                                                    |
| 取得項目 | `importSkill` (アクション), `isImporting` (状態), `importingSkillName` (状態)                                 |
| 方向     | SkillSlice から Dialog へのデータ提供                                                                         |
| 契約     | `importSkill(skillName: string): Promise<void>`, `isImporting: boolean`, `importingSkillName: string \| null` |

### @repo/shared -> Dialog

| 項目     | 詳細                                                   |
| -------- | ------------------------------------------------------ |
| 連携方法 | 型インポート                                           |
| 取得項目 | `SkillMetadata` 型, `SkillSubResource` 型              |
| 方向     | 共有パッケージから Dialog への型提供                   |
| 契約     | Props の `skill` プロパティが `SkillMetadata` 型に準拠 |

### Dialog -> SkillSlice

| 項目     | 詳細                                             |
| -------- | ------------------------------------------------ |
| 連携方法 | `useAppStore()` フック経由のアクション呼び出し   |
| 呼出内容 | `importSkill(skillName: string)`                 |
| 方向     | Dialog から SkillSlice へのアクション発行        |
| 契約     | スキル名を文字列で渡し、インポート処理を開始する |

## 条件付き表示ロジック

各セクションは対応するデータが存在する場合のみ表示される。

| セクション       | 表示条件                                   |
| ---------------- | ------------------------------------------ |
| 説明             | 常時表示（`skill.description` を表示）     |
| 許可ツール       | `skill.allowedTools` が存在し、長さが1以上 |
| サブエージェント | `skill.subAgents` が存在し、長さが1以上    |
| 参照資料         | `skill.references` が存在し、長さが1以上   |
| スクリプト       | `skill.scripts` が存在し、長さが1以上      |
| アセット         | `skill.assets` が存在し、長さが1以上       |
| スキーマ         | `skill.schemas` が存在し、長さが1以上      |
| インデックス     | `skill.indexes` が存在し、長さが1以上      |
