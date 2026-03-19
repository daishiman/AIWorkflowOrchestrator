# Phase 2 設計サマリー: SkillDetailPanel アクションボタン追加

## 概要

SkillDetailPanel にスキル編集・分析への導線となるアクションボタン（「エディタで開く」「分析する」）を追加する設計。

---

## Props 設計

### SkillDetailPanelProps（変更差分）

```typescript
export interface SkillDetailPanelProps {
  skillName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (skillName: string) => void;
  isImported: boolean;
  skill?: SkillMetadata | ImportedSkill;
  onEdit?: (skillName: string) => void; // 新規追加
  onAnalyze?: (skillName: string) => void; // 新規追加
}
```

`onEdit` / `onAnalyze` はオプショナルとし、両方が渡された場合のみアクションボタンゾーンを表示する。これにより後方互換性を維持する。

### PanelContent Props（内部コンポーネント変更差分）

PanelContent の内部 Props にも以下を追加する:

| Props名     | 型                            | 必須 | 説明                           |
| ----------- | ----------------------------- | ---- | ------------------------------ |
| `skillName` | `string \| null`              | 必須 | ボタンクリック時に渡すスキル名 |
| `onEdit`    | `(skillName: string) => void` | 任意 | 編集ボタンのハンドラ           |
| `onAnalyze` | `(skillName: string) => void` | 任意 | 分析ボタンのハンドラ           |

---

## PanelContent 内部構造変更

### アクションボタンゾーンの配置

既存の danger zone（`panelStyles.dangerZone`、`isImported === true` の条件でレンダーされるブロック）の直前に配置する。

```
[スキル詳細情報]
[アクションボタンゾーン]  ← 新規追加
[danger zone (削除ボタン)]
```

### 表示条件

```typescript
isImported && onEdit && onAnalyze;
```

3条件が全て満たされた場合にのみレンダーする。`isImported` が false の場合、またはハンドラが未渡しの場合は DOM に存在しない。

---

## 遷移フロー設計

### handleEditSkill(skillName: string)

```
1. setCurrentSkillName(skillName)   // 編集対象のスキル名をストアに保存
2. setCurrentView("skill-editor")   // SkillEditor ビューに遷移
3. handleCloseDetail()              // SkillDetailPanel を閉じる
```

### handleAnalyzeSkill(skillName: string)

```
1. setCurrentSkillName(skillName)   // 分析対象のスキル名をストアに保存
2. setCurrentView("skillAnalysis")  // SkillAnalysis ビューに遷移
3. handleCloseDetail()              // SkillDetailPanel を閉じる
```

---

## SkillCenterView 接続設計

### フック接続

```typescript
const {
  handleEditSkill,
  handleAnalyzeSkill,
  // ...既存フィールド
} = useSkillCenter();
```

`useSkillCenter` から `handleEditSkill` / `handleAnalyzeSkill` を分割代入する。

### SkillDetailPanel へのバインド

```tsx
<SkillDetailPanel
  // ...既存 Props
  onEdit={handleEditSkill}
  onAnalyze={handleAnalyzeSkill}
/>
```

---

## レスポンシブ対応設計

PanelContent コンポーネントはデスクトップ版とモバイル版の両方から共有されている。アクションボタンの追加は PanelContent 内の1箇所のみで、両対応が自動的に完了する。

デスクトップ: サイドパネル内に `flex gap-3` で横並び2列表示
モバイル: ボトムシート内に同じ `flex gap-3` で横並び2列表示

---

## 影響範囲

| ファイル               | 変更種別       | 内容                                            |
| ---------------------- | -------------- | ----------------------------------------------- |
| `SkillDetailPanel.tsx` | Props 追加     | `onEdit` / `onAnalyze` の型定義追加             |
| `SkillDetailPanel.tsx` | 内部実装       | PanelContent へのアクションボタンゾーン追加     |
| `SkillCenterView.tsx`  | Props 渡し追加 | `onEdit` / `onAnalyze` のバインド               |
| `useSkillCenter.ts`    | フック実装追加 | `handleEditSkill` / `handleAnalyzeSkill` の実装 |

---

## 設計制約・判断根拠

- `onEdit` / `onAnalyze` をオプショナルにすることで、既存の呼び出し元（テスト含む）への後方互換性を維持する
- 表示条件を `isImported && onEdit && onAnalyze` とすることで、インポートされていないスキルにはボタンを表示しない（未インポートスキルに対する編集・分析は未定義の動作のため）
- `handleCloseDetail` をボタンクリック後に呼び出すことで、遷移後にパネルが残留しない UX を実現する
