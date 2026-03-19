# Phase 2 UI/UX 実現設計: アクションボタンゾーン

## 概要

SkillDetailPanel のアクションボタンゾーンの配置・マークアップ・スタイル・レスポンシブ対応の設計。Apple Human Interface Guidelines に準拠する。

---

## 配置設計

### DOM 内の位置

danger zone（`panelStyles.dangerZone`）の直前に配置する。

```
[スキルメタ情報ブロック]
     ↓
[アクションボタンゾーン]  ← ここに追加
     ↓
[danger zone]
```

### 表示条件

```typescript
isImported && onEdit && onAnalyze;
```

- `isImported` が `false`: DOM に存在しない（インポートされていないスキルは編集・分析対象外）
- `onEdit` が `undefined`: DOM に存在しない（呼び出し元が未接続の場合は非表示）
- `onAnalyze` が `undefined`: DOM に存在しない（呼び出し元が未接続の場合は非表示）

---

## マークアップ設計

### アクションボタンゾーン

```tsx
{
  isImported && onEdit && onAnalyze && (
    <div className="flex gap-3" data-testid="action-buttons-zone">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => skillName && onEdit(skillName)}
        leftIcon="edit-2"
        data-testid="edit-skill-button"
        className="flex-1"
      >
        エディタで開く
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => skillName && onAnalyze(skillName)}
        leftIcon="bar-chart-2"
        data-testid="analyze-skill-button"
        className="flex-1"
      >
        分析する
      </Button>
    </div>
  );
}
```

### クリックハンドラのガード

```typescript
onClick={() => skillName && onEdit(skillName)}
```

`skillName` が `null` の場合はクリックしても何もしない。SkillDetailPanel が開いている状態では原則 `skillName` は非 null だが、防衛的に null チェックを入れる。

---

## スタイル設計

### レイアウト

| クラス               | 値            | 目的                                            |
| -------------------- | ------------- | ----------------------------------------------- |
| `flex`               | display: flex | ボタンを横並びにする                            |
| `gap-3`              | gap: 12px     | 8px グリッドの 1.5 倍で隣接ボタン間の余白を確保 |
| `flex-1`（各ボタン） | flex: 1 1 0%  | 2 ボタンを均等幅に展開                          |

### ボタンスタイル

| Props      | 値                           | 選定理由                                                                                                         |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `variant`  | `"secondary"`                | 非破壊的な操作（編集・分析）に対してセカンダリスタイルが適切。danger zone の `variant="danger"` と明確に区別する |
| `size`     | `"sm"`                       | パネル内の情報密度を維持しつつ、タップ可能なサイズを確保                                                         |
| `leftIcon` | `"edit-2"` / `"bar-chart-2"` | 操作内容を視覚的に明示し、アイコンのみでも意味が伝わるよう設計                                                   |

### Apple HIG 準拠チェック

- **Clarity**: `leftIcon` によりアイコン + テキストで操作を明示。色だけでなく形でも区別可能
- **Deference**: `variant="secondary"` で背景色を控えめにし、スキル詳細情報をメインコンテンツとして尊重
- **8px グリッド**: `gap-3`（12px）は 8px グリッドの 1.5 倍でスペーシング基準に準拠
- **コントラスト**: `variant="secondary"` のスタイルは WCAG 2.1 AA（コントラスト比 4.5:1 以上）を満たすデザイントークンを使用

---

## レスポンシブ対応

PanelContent コンポーネントはデスクトップ版とモバイル版（ボトムシート）の両方から呼び出される共有コンポーネント。アクションボタンゾーンの追加は PanelContent 内の1箇所のみで、両環境に自動的に反映される。

```
デスクトップ（サイドパネル）    モバイル（ボトムシート）
+------------------------+    +------------------------+
| [スキル詳細情報]        |    | [スキル詳細情報]        |
|                        |    |                        |
| [エディタで開く][分析] |    | [エディタで開く][分析] |
|                        |    |                        |
| [削除する]              |    | [削除する]              |
+------------------------+    +------------------------+
```

`flex gap-3` はコンテナ幅に応じて自動的にリサイズするため、追加の breakpoint 対応は不要。

---

## data-testid 一覧

| 要素           | data-testid            | 用途                          |
| -------------- | ---------------------- | ----------------------------- |
| ゾーンコンテナ | `action-buttons-zone`  | ゾーン全体の表示/非表示テスト |
| 編集ボタン     | `edit-skill-button`    | クリックテスト・テキスト検証  |
| 分析ボタン     | `analyze-skill-button` | クリックテスト・テキスト検証  |

---

## アクセシビリティ設計

- `leftIcon` はスクリーンリーダー向けに `aria-hidden="true"` で除外し、ボタンテキスト（「エディタで開く」「分析する」）が読み上げられる（Button コンポーネントの実装に依存）
- キーボード操作: Tab で各ボタンにフォーカス可能、Enter / Space でアクティブ化
- フォーカスリング: フォーカス時に視認可能なリングを表示（Button コンポーネントのデフォルト動作に準拠）
