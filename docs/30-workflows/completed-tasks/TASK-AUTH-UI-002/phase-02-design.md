# Phase 2: 設計

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 2                |
| 機能名 | TASK-AUTH-UI-002 |
| 作成日 | 2026-02-04       |

## 目的

要件を実現可能な構造に落とし込む。**実装済みのため、設計の確認・検証を行う。**

## 実行タスク

- アーキテクチャ確認: 既存実装がシステム仕様に準拠しているか確認
- パターン検証: Portal実装パターンとの整合性確認
- アクセシビリティ確認: WAI-ARIA準拠の確認

## 参照資料

| 資料名             | パス                                                                                        | 説明               |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------ |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                                                | Phase 1成果物      |
| Portal実装パターン | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`                | Portal基本パターン |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集     |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント | 契約定義                                 |
| ------------ | ---------------------------------------- |
| React Portal | createPortal(element, document.body)     |
| State管理    | useState: isAvatarMenuOpen, menuPosition |
| Ref管理      | useRef: avatarButtonRef, avatarMenuRef   |

## アーキテクチャ層別設計確認

### Renderer Process（フロントエンド）

**コンポーネント構造**:

```
AccountSection
├── Profile Card（GlassPanel）
│   ├── アバター表示
│   └── アバター編集ボタン（トリガー）
├── Portal（document.body直下）
│   └── アバターメニュー（role="menu"）
│       ├── アップロード（role="menuitem"）
│       ├── プロバイダーアバター使用（role="menuitem"）
│       └── アバター削除（role="menuitem"）
└── 連携サービス（GlassPanel）
```

**State設計**:

| State            | 型                   | 初期値 | 用途             |
| ---------------- | -------------------- | ------ | ---------------- |
| isAvatarMenuOpen | boolean              | false  | メニュー表示状態 |
| menuPosition     | MenuPosition \| null | null   | メニュー位置座標 |

**型定義**:

| 型名         | 定義                            | 用途         |
| ------------ | ------------------------------- | ------------ |
| MenuPosition | `{ top: number; left: number }` | メニュー位置 |

### イベントハンドリング設計

| イベント             | ハンドラー             | 処理内容                              |
| -------------------- | ---------------------- | ------------------------------------- |
| トリガークリック     | handleToggleAvatarMenu | メニュー表示/非表示切り替え、位置計算 |
| アウトサイドクリック | useEffect内ハンドラー  | メニュークローズ                      |
| Escapeキー           | useEffect内ハンドラー  | メニュークローズ、フォーカス復帰      |

### アクセシビリティ設計（WAI-ARIA）

**トリガーボタン属性**:

| 属性          | 値               | 用途                       |
| ------------- | ---------------- | -------------------------- |
| aria-label    | "アバターを編集" | スクリーンリーダー用ラベル |
| aria-expanded | isAvatarMenuOpen | 展開状態                   |
| aria-haspopup | "menu"           | ポップアップ種別           |

**メニューコンテナ属性**:

| 属性       | 値                     | 用途                       |
| ---------- | ---------------------- | -------------------------- |
| role       | "menu"                 | メニューロール             |
| aria-label | "アバター編集メニュー" | スクリーンリーダー用ラベル |

**メニュー項目属性**:

| 属性 | 値         | 用途               |
| ---- | ---------- | ------------------ |
| role | "menuitem" | メニュー項目ロール |

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点             | 適用判断              | 仕様参照先                                                         |
| ---------------- | --------------------- | ------------------------------------------------------------------ |
| UI/UX            | ✅ フロントエンド設計 | `aiworkflow-requirements: ui-ux-portal-patterns.md`                |
| アクセシビリティ | ✅ ARIA設計           | `aiworkflow-requirements: ui-ux-components.md`                     |
| アーキテクチャ   | ✅ Portal設計         | `aiworkflow-requirements: architecture-implementation-patterns.md` |

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造 |

## 完了条件

- [ ] 既存実装がPortal実装パターンに準拠していることを確認
- [ ] State設計が適切であることを確認
- [ ] WAI-ARIA属性が完備されていることを確認
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計確認が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
