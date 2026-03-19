# 実装ガイド: SkillDetailPanel アクションボタン

## Part 1: なぜ必要か（中学生レベルの説明）

### スキル詳細パネルに「次のステップ」ボタンが必要な理由

AIワークフローオーケストレーターには「スキル」という仕組みがあります。スキルとは、AIに特定の仕事をさせるためのレシピのようなものです。

たとえば、「コードレビューをする」スキルや「ドキュメントを書く」スキルがあります。ユーザーはスキル一覧画面（ツールを探す画面）から、気になるスキルをクリックして詳細パネルを開きます。

しかし、これまでの詳細パネルには「削除する」ボタンしかありませんでした。スキルの中身を編集したい場合や、スキルの使われ方を分析したい場合、ユーザーは一度パネルを閉じて、別の画面を自分で探す必要がありました。

これは、たとえばレストランのメニューを見ているときに「この料理を注文したい」と思っても、注文ボタンがなくて、わざわざ店員を探しに行かなければならないようなものです。

今回の変更で、詳細パネルに「エディタで開く」と「分析する」の2つのボタンを追加しました。詳細パネルから直接、次の部屋（編集画面や分析画面）へ進めるようになります。

### 何が変わるか

この機能でできることは次の3つです。

1. 追加済みスキルの詳細パネルから、そのまま編集画面へ進める
2. 同じ場所から分析画面へ進める
3. 遷移前に対象スキル名を保存し、パネルを閉じた状態で次画面へ渡せる

### 仕組みのポイント

1. **表示条件**: ボタンは「追加済み」のスキルにだけ表示されます。まだ追加していないスキルには表示されません
2. **遷移の流れ**: ボタンをクリックすると、どのスキルを開くかを記憶してから、目的の画面に移動し、詳細パネルは自動で閉じます
3. **安全設計**: 「削除する」ボタンとは別のエリアに配置され、間違って押すリスクを減らしています

## Part 2: 開発者向け実装詳細

### 型定義

```typescript
export interface SkillDetailPanelProps {
  skillName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (skillName: string) => void;
  isImported: boolean;
  skill?: SkillMetadata | ImportedSkill;
  // 新規追加
  onEdit?: (skillName: string) => void;
  onAnalyze?: (skillName: string) => void;
}
```

### ハンドラシグネチャと使用例

```typescript
// useSkillCenter.ts
const handleEditSkill = useCallback(
  (skillName: string): void => {
    setCurrentSkillName(skillName); // 対象スキル名を記憶
    setCurrentView("skill-editor"); // エディタ画面へ遷移
    handleCloseDetail(); // パネルを閉じる
  },
  [setCurrentSkillName, setCurrentView, handleCloseDetail],
);

const handleAnalyzeSkill = useCallback(
  (skillName: string): void => {
    setCurrentSkillName(skillName);
    setCurrentView("skillAnalysis");
    handleCloseDetail();
  },
  [setCurrentSkillName, setCurrentView, handleCloseDetail],
);
```

### APIシグネチャ

```typescript
type SkillActionHandler = (skillName: string) => void;

const handleEditSkill: SkillActionHandler = (skillName) => {
  setCurrentSkillName(skillName);
  setCurrentView("skill-editor");
  handleCloseDetail();
};

const handleAnalyzeSkill: SkillActionHandler = (skillName) => {
  setCurrentSkillName(skillName);
  setCurrentView("skillAnalysis");
  handleCloseDetail();
};
```

### 使用例

```tsx
<SkillDetailPanel
  skillName={selectedSkillName}
  isOpen={isDetailOpen}
  onClose={handleCloseDetail}
  onDelete={handleDeleteSkill}
  isImported={true}
  skill={selectedImportedSkill}
  onEdit={handleEditSkill}
  onAnalyze={handleAnalyzeSkill}
/>
```

### 表示条件

```tsx
{
  isImported && onEdit && onAnalyze && (
    <div className="flex gap-3" data-testid="action-buttons-zone">
      {/* ボタン */}
    </div>
  );
}
```

3つの条件が全て真の場合のみ表示:

- `isImported`: スキルがインポート済み
- `onEdit`: 編集ハンドラが渡されている
- `onAnalyze`: 分析ハンドラが渡されている

### 遷移順序

`setCurrentSkillName` → `setCurrentView` → `handleCloseDetail`

Zustand の同期 set により順序依存は技術的にはないが、意図の明確さのためにこの順序を維持する。

### エラー処理

- `skillName` が `null` または空文字なら `SkillDetailPanel` 自体が早期 return するため、誤った遷移は発生しない
- `onEdit` または `onAnalyze` が未接続でも、エラー処理として action zone を非表示にし、未定義ハンドラ呼び出しを避ける
- `skillAnalysis` は既存 ViewType を再利用しているため、新しい例外経路や追加 slice は不要

### エッジケース

| ケース                                     | 動作                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `skillName === null`                       | SkillDetailPanel が早期リターンで null を返すため、ボタンは表示されない |
| `skillName === ""`                         | 同上（falsy 値で早期リターン）                                          |
| `onEdit` のみ undefined                    | アクションボタンゾーン全体が非表示                                      |
| `onAnalyze` のみ undefined                 | アクションボタンゾーン全体が非表示                                      |
| 既存 `skillAnalysis` / `renderView()` 契約 | 競合なし。handleAnalyzeSkill は既存の ViewType "skillAnalysis" を再利用 |

### 設定項目と定数一覧

| 項目                 | 値                     | 理由                     |
| -------------------- | ---------------------- | ------------------------ |
| Button variant       | "secondary"            | 非破壊的な操作用         |
| Button size          | "sm"                   | パネル内の補助アクション |
| leftIcon (編集)      | "pencil"               | Icon map に登録済み      |
| leftIcon (分析)      | "eye"                  | Icon map に登録済み      |
| className            | "flex-1"               | 2ボタン均等幅            |
| gap                  | gap-3 (12px)           | 8px Grid 1.5倍           |
| data-testid (ゾーン) | "action-buttons-zone"  | テスト用セレクタ         |
| data-testid (編集)   | "edit-skill-button"    | テスト用セレクタ         |
| data-testid (分析)   | "analyze-skill-button" | テスト用セレクタ         |
