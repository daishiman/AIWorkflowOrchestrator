# useFileContext Workspace型プロパティ追加 - タスク指示書

## メタ情報

```yaml
issue_number: 670
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | task-imp-usefilecontext-workspace-type-001 |
| タスク名     | useFileContext Workspace型プロパティ追加   |
| 分類         | 改善                                       |
| 対象機能     | useFileContext Hook / Workspace型          |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | コードベーススキャン（TODOコメント検出）   |
| 発見日       | 2026-02-02                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts:96` に以下のTODOコメントが存在する：

```
// TODO: Workspace型にopenFilesプロパティを追加するか、別の方法でファイル一覧を取得する
```

useFileContext Hookがワークスペースのオープンファイル一覧を取得しようとしているが、現在のWorkspace型にはopenFilesプロパティが存在しないため、型の不整合が発生している。

### 1.2 問題点・課題

- Workspace型定義とuseFileContextの期待するインターフェースが不一致
- ファイル一覧取得ロジックが不完全
- 型安全性が損なわれている可能性

### 1.3 放置した場合の影響

- workspace-chat-edit機能でファイルコンテキストが正しく取得できない
- TypeScriptの型チェックが不完全
- 将来の機能拡張時に混乱を招く

---

## 2. 何を達成するか（What）

### 2.1 目的

Workspace型とuseFileContext Hookの整合性を確保し、ファイル一覧を型安全に取得できるようにする。

### 2.2 最終ゴール

- Workspace型にopenFilesプロパティが追加されている、または代替手段でファイル一覧を取得できる
- useFileContext Hookが型安全にファイル一覧を取得できる
- TODOコメントが解消されている

### 2.3 スコープ

#### 含むもの

- Workspace型定義の修正（packages/shared/src/types/）
- useFileContext Hookの修正
- 関連するインターフェースの更新
- テストケースの追加

#### 含まないもの

- ワークスペース管理機能全体のリファクタリング
- UIコンポーネントの変更

### 2.4 成果物

| 成果物                    | 説明                     |
| ------------------------- | ------------------------ |
| 更新済みWorkspace型       | openFilesプロパティ追加  |
| 更新済みuseFileContext.ts | 型整合性確保             |
| テストケース              | 新規プロパティの動作確認 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Workspace型の現在の定義を理解していること
- workspace-chat-edit機能の概要を理解していること

### 3.2 依存タスク

- task-chat-edit-workspace-management-integration.md（関連だが独立して先行実行可能）

### 3.3 必要な知識

- TypeScript型定義
- React Hooks
- packages/shared構造

### 3.4 推奨アプローチ

**オプション A: Workspace型にopenFilesを追加**

```typescript
interface Workspace {
  id: string;
  name: string;
  // ... existing properties
  openFiles?: string[]; // ファイルパス一覧
}
```

**オプション B: 別の取得メソッドを使用**

- WorkspaceServiceにgetOpenFilesメソッドを追加
- useFileContextはそのメソッドを呼び出す

推奨: オプションAの方がシンプルで型安全。

### 3.5 システム仕様書参照

| 仕様書                     | セクション     | 内容         |
| -------------------------- | -------------- | ------------ |
| `interfaces-workspace.md`  | Workspace型    | 現在の型定義 |
| `arch-state-management.md` | workspaceSlice | 状態管理仕様 |

---

## 4. 実行手順

### Phase構成

| Phase | 名称 | 概要                              |
| ----- | ---- | --------------------------------- |
| 1     | 調査 | 現在のWorkspace型と使用箇所の確認 |
| 2     | 実装 | 型定義更新・Hook修正              |
| 3     | 検証 | テスト実行・確認                  |

### Phase 1: 調査

#### 目的

現在のWorkspace型定義と使用箇所を確認する。

#### 手順

1. `packages/shared/src/types/` でWorkspace型定義を確認
2. Workspace型を使用している箇所を検索
3. openFilesプロパティ追加による影響範囲を特定

#### 成果物

影響範囲リスト

### Phase 2: 実装

#### 目的

型定義を更新し、useFileContextを修正する。

#### 手順

1. Workspace型にopenFilesプロパティを追加（optional）

   ```typescript
   openFiles?: string[];
   ```

2. useFileContext.tsのTODO箇所を修正
   - workspace.openFilesを使用するように変更
   - undefinedの場合は空配列をフォールバック

3. 必要に応じてworkspaceSliceの初期値を更新

4. テストケースを追加

#### 成果物

- 修正済みWorkspace型
- 修正済みuseFileContext.ts
- テストケース

### Phase 3: 検証

#### 目的

実装が正しく動作することを確認する。

#### 手順

1. TypeScriptコンパイル確認
2. 単体テスト実行
3. workspace-chat-edit機能の動作確認
4. TODOコメント削除

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Workspace型にopenFilesプロパティが追加されている
- [ ] useFileContextがファイル一覧を型安全に取得できる
- [ ] 既存機能に影響がない

### 品質要件

- [ ] TypeScriptコンパイルエラーがない
- [ ] 関連テストがPASS
- [ ] ESLint警告がない

### ドキュメント要件

- [ ] TODOコメントが除去されている
- [ ] interfaces-workspace.mdが更新されている（新規プロパティ追加時）

---

## 6. 検証方法

### テストケース

| #   | テストケース                      | 期待結果           |
| --- | --------------------------------- | ------------------ |
| 1   | openFilesあり時のコンテキスト取得 | ファイル一覧が返る |
| 2   | openFilesなし時のコンテキスト取得 | 空配列が返る       |
| 3   | Workspace型の型チェック           | コンパイル成功     |

### 検証手順

```bash
# 1. TypeScriptコンパイル確認
pnpm typecheck

# 2. テスト実行
pnpm --filter @repo/desktop test useFileContext

# 3. TODOコメント確認
grep -n "Workspace型にopenFiles" apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts
# Expected: 結果なし
```

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                                                 |
| --------------------------- | ------ | -------- | ---------------------------------------------------- |
| 既存コードへの影響          | 中     | 低       | optionalプロパティとして追加し、既存コードに影響なし |
| シリアライズ/デシリアライズ | 中     | 低       | 新規プロパティはoptionalなのでJSON互換性維持         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `apps/desktop/src/renderer/features/workspace-chat-edit/`

### 参考資料

なし

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし（コードベーススキャンによる発見）

### 補足事項

- task-chat-edit-workspace-management-integration.mdと関連するが、本タスクは型定義の修正に限定されるため独立して実行可能
- 優先度は低いが、型安全性向上のために対応が望ましい
