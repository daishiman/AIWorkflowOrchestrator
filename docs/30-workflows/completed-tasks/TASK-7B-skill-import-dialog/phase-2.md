# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | TASK-7B-skill-import-dialog |
| 作成日 | 2026-01-30                  |

## 目的

SkillImportDialogの要件を実現可能なコンポーネント構造・UI設計・状態管理設計に落とし込む。

## 実行タスク

- コンポーネント設計: SkillImportDialog/Section/ResourceListの構造定義
- 状態管理設計: useAppStoreとの連携パターン設計
- UI/UX設計: レイアウト・インタラクション・アクセシビリティ設計
- Props/インターフェース設計: コンポーネントAPIの定義

## 参照資料

| 資料名     | パス                                         | 説明          |
| ---------- | -------------------------------------------- | ------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                         | 内容                     |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| UI/UXコンポーネント概要 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design原則        |
| UI/UXフォーム設計       | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`           | ダイアログUI設計         |
| デザインシステム        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | トークン・タイポグラフィ |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustandスライス設計      |

## 実行手順

### ステップ1: コンポーネント設計

#### コンポーネントツリー

```
SkillImportDialog (Organism)
├── Overlay (背景オーバーレイ)
├── DialogContainer
│   ├── Header
│   │   ├── Title (h2: "スキルをインポート")
│   │   └── CloseButton (×ボタン)
│   ├── Content (スクロール可能エリア)
│   │   ├── SkillInfo (名前 + アイコン)
│   │   ├── Section[説明]
│   │   │   └── Description text
│   │   ├── Section[許可ツール] (条件表示)
│   │   │   └── ToolTags (flex-wrap)
│   │   ├── Section[サブエージェント] (条件表示)
│   │   │   └── ResourceList
│   │   ├── Section[参照資料] (条件表示)
│   │   │   └── ResourceList
│   │   ├── Section[スクリプト] (条件表示)
│   │   │   └── ResourceList
│   │   ├── Section[アセット] (条件表示)
│   │   │   └── ResourceList
│   │   ├── Section[スキーマ] (条件表示)
│   │   │   └── ResourceList
│   │   └── Section[インデックス] (条件表示)
│   │       └── ResourceList
│   └── Footer
│       ├── CancelButton
│       └── ImportButton (ローディング対応)
```

#### Props定義

```typescript
interface SkillImportDialogProps {
  skill: SkillMetadata;
  isOpen: boolean;
  onClose: () => void;
}
```

#### 内部コンポーネント

```typescript
// Sectionコンポーネント（セクション見出し + コンテンツ）
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// ResourceListコンポーネント（サブリソース一覧）
interface ResourceListProps {
  resources: SkillSubResource[];
}
```

### ステップ2: 状態管理設計

```
┌─────────────────────────────┐
│    SkillImportDialog        │
│  ┌───────────────────────┐  │
│  │ useAppStore() から取得 │  │
│  │ - importSkill()       │  │
│  │ - isImporting          │  │
│  │ - importingSkillName   │  │
│  └───────────────────────┘  │
│                             │
│  handleImport():            │
│    await importSkill(name)  │
│    onClose()                │
│                             │
│  isCurrentlyImporting:      │
│    isImporting &&           │
│    importingSkillName ===   │
│    skill.name               │
└─────────────────────────────┘
```

### ステップ3: UI/UXデザイン

#### レイアウト仕様

| 要素         | 仕様                                                          |
| ------------ | ------------------------------------------------------------- |
| オーバーレイ | `fixed inset-0 bg-black/50 z-50`                              |
| ダイアログ   | `max-w-2xl w-full max-h-[80vh] bg-white rounded-lg shadow-xl` |
| ヘッダー     | `px-6 py-4 border-b` (flexで左右配置)                         |
| コンテンツ   | `px-6 py-4 overflow-y-auto max-h-[60vh]`                      |
| フッター     | `px-6 py-4 border-t bg-gray-50` (flex justify-end)            |

#### インタラクション

| 操作                 | 動作                 |
| -------------------- | -------------------- |
| オーバーレイクリック | ダイアログを閉じない |
| ESCキー              | onClose()を呼ぶ      |
| インポートボタン     | handleImport()を呼ぶ |
| キャンセルボタン     | onClose()を呼ぶ      |
| ×ボタン              | onClose()を呼ぶ      |

#### アクセシビリティ設計

| 要件               | 実装方法                                                   |
| ------------------ | ---------------------------------------------------------- |
| role               | `role="dialog"` on container                               |
| aria-modal         | `aria-modal="true"` on container                           |
| aria-labelledby    | `aria-labelledby="skill-import-dialog-title"` on container |
| フォーカストラップ | useRefで最初・最後のフォーカス可能要素を管理               |
| ESCハンドラー      | useEffectでkeydownイベントリスナー登録                     |
| 初期フォーカス     | ダイアログ表示時にキャンセルボタンにフォーカス             |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント          | 契約定義                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| SkillSlice → Dialog   | `useAppStore()`から`importSkill`, `isImporting`, `importingSkillName`を取得 |
| @repo/shared → Dialog | `SkillMetadata`, `SkillSubResource`型をpropsで受け取り                      |
| Dialog → SkillSlice   | `importSkill(skillName: string)`を呼び出し                                  |

## アーキテクチャ層別設計（Electronデスクトップアプリ観点）

| 層                         | 設計観点                                            | 仕様参照先                              |
| -------------------------- | --------------------------------------------------- | --------------------------------------- |
| フロントエンド（Renderer） | コンポーネント設計、Zustand連携、A11y、Tailwind CSS | `ui-ux-components.md`, `ui-ux-forms.md` |

## 成果物

| 成果物             | パス                                  | 説明            |
| ------------------ | ------------------------------------- | --------------- |
| コンポーネント設計 | `outputs/phase-2/component-design.md` | 構造・Props設計 |
| UI設計             | `outputs/phase-2/ui-design.md`        | レイアウト・UX  |

## 完了条件

- [ ] コンポーネントツリーが定義されている
- [ ] Props/インターフェースが定義されている
- [ ] 状態管理との連携パターンが設計されている
- [ ] UI/UXレイアウト仕様が定義されている
- [ ] アクセシビリティ設計が完了している
- [ ] 要件との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. コンポーネント設計の実施
3. 状態管理設計の実施
4. UI/UXデザインの実施
5. Props/インターフェース設計の実施
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7B-skill-import-dialog --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
