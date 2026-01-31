# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 4                                   |
| フェーズ名   | テスト作成                          |
| カテゴリ     | TDD-Red                             |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

TDD Red フェーズとして、permissionDescriptions モジュールのユニットテストと、PermissionDialog の人間可読UI表示テストを先行作成する。この時点ではテストはすべてFAILする（実装前）。

---

## タスク

- Task 1: permissionDescriptions ユニットテスト作成
  - `apps/desktop/src/renderer/components/skill/__tests__/permissionDescriptions.test.ts` を新規作成する
  - `getDescription()` 関数の正常系テスト（各ツール10種類以上）を作成する
  - 異常系テスト（未定義ツール、空引数、null/undefined）を作成する
  - 境界値テスト（長い文字列、特殊文字、HTMLタグ含有）を作成する

- Task 2: PermissionDialog 人間可読UI テスト作成
  - `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx` を新規作成する
  - 説明文表示テスト（各ツールの説明が表示されること）を作成する
  - 詳細展開UIテスト（折りたたみ動作、展開状態）を作成する
  - アクセシビリティテスト（ARIA属性、キーボード操作）を作成する

- Task 3: テスト実行確認（全テストFAIL確認）
  - 作成したテストファイルが構文的に正しいことを確認する
  - テスト実行時にすべてFAILすることを確認する（Red状態）
  - 既存テスト（`PermissionDialog.test.tsx`）がPASSし続けることを確認する

---

## 参照資料

| ドキュメント   | パス                                                                             | 説明                 |
| -------------- | -------------------------------------------------------------------------------- | -------------------- |
| Phase 2成果物  | `outputs/phase-2/design-document.md`                                             | テスト設計の基礎     |
| Phase 3成果物  | `outputs/phase-3/design-review-report.md`                                        | レビュー指摘事項     |
| 既存テスト     | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | 既存テスト構造の参考 |
| カバレッジ基準 | `coverage-standards.md` (task-specification-creator)                             | カバレッジ目標       |

---

## 手順

### Task 1 実行手順

1. Phase 2の設計書からpermissionDescriptionsのインターフェースを確認する
2. テストファイル `permissionDescriptions.test.ts` を作成する
3. 以下のテストカテゴリを実装する：

**正常系テスト**:

```
describe('getDescription', () => {
  describe('各ツール別説明文生成', () => {
    // Bash: 「{command}」コマンドを実行します
    // Read: 「{path}」ファイルを読み取ります
    // Write: 「{path}」ファイルに書き込みます
    // Edit: 「{path}」ファイルを編集します
    // Glob: 「{pattern}」パターンでファイルを検索します
    // Grep: 「{pattern}」を含むファイルを検索します
    // WebSearch: 「{query}」で検索します
    // Task: タスクを実行します
    // NotebookEdit: ノートブックを編集します
    // WebFetch: URLからデータを取得します
  })
})
```

**異常系テスト**:

```
describe('フォールバック', () => {
  // 未定義ツール → デフォルト説明
  // 空引数 → 安全なフォールバック
  // null/undefined引数 → デフォルト説明
})
```

**境界値テスト**:

```
describe('境界値', () => {
  // 非常に長いコマンド文字列
  // 特殊文字を含むファイルパス
  // HTMLタグを含む引数（XSS安全性）
  // 日本語を含むパス
})
```

### Task 2 実行手順

1. 既存テスト（`PermissionDialog.test.tsx`）の構造を参考にする
2. テストファイル `PermissionDialog.readable.test.tsx` を作成する
3. 以下のテストカテゴリを実装する：

**説明文表示テスト**:

```
describe('人間可読説明文表示', () => {
  // Bashコマンドの説明が表示される
  // Readファイルの説明が表示される
  // 未定義ツールのデフォルト説明が表示される
})
```

**詳細展開UIテスト**:

```
describe('詳細展開UI', () => {
  // デフォルトは折りたたみ状態
  // 「詳細を表示」クリックで展開
  // 展開後に「詳細を隠す」クリックで折りたたみ
  // 技術的詳細が展開時のみ表示される
})
```

**アクセシビリティテスト**:

```
describe('アクセシビリティ', () => {
  // aria-expanded属性が正しく設定される
  // aria-controls属性が正しく設定される
  // Enter/Spaceキーで展開/折りたたみ可能
  // フォーカスが適切に管理される
})
```

### Task 3 実行手順

1. テストファイルの構文確認：
   ```bash
   cd apps/desktop && npx tsc --noEmit src/renderer/components/skill/__tests__/permissionDescriptions.test.ts
   ```
2. テスト実行（FAILを確認）：
   ```bash
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/permissionDescriptions.test.ts
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx
   ```
3. 既存テスト影響確認：
   ```bash
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
   ```

---

## TDD状態

| 項目         | 値                                                                           |
| ------------ | ---------------------------------------------------------------------------- |
| TDDフェーズ  | Red                                                                          |
| テスト状態   | 全テストFAIL（実装前）                                                       |
| 検証コマンド | `cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/` |

---

## 統合テストアクション

| カテゴリ           | 確認内容                                                     |
| ------------------ | ------------------------------------------------------------ |
| データフロー       | テストがgetDescription関数の入出力を正しく検証する設計か確認 |
| エラーハンドリング | フォールバックテストが適切にカバーされているか確認           |
| UI統合             | 既存テストが壊れないことを確認                               |

---

## システム開発観点チェック

| 観点               | 該当 | 確認内容                                       |
| ------------------ | ---- | ---------------------------------------------- |
| セキュリティ       | ○    | XSS安全性テストが含まれている                  |
| UI/UX（Apple HIG） | ○    | アクセシビリティテストが含まれている           |
| テスタビリティ     | ○    | モジュール単体テスト・コンポーネントテスト両方 |

---

## 成果物

| 成果物名                     | パス                                                                                      | 種別 | 説明                     |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ---- | ------------------------ |
| permissionDescriptionsテスト | `apps/desktop/src/renderer/components/skill/__tests__/permissionDescriptions.test.ts`     | code | 説明テンプレートのテスト |
| PermissionDialog拡張テスト   | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx` | code | 人間可読UI表示テスト     |

---

## 完了条件

- [ ] `permissionDescriptions.test.ts` が作成されている
- [ ] 正常系テスト（10種類以上のツール）が記述されている
- [ ] 異常系テスト（未定義ツール、空引数、null/undefined）が記述されている
- [ ] 境界値テスト（長文、特殊文字、HTMLタグ）が記述されている
- [ ] `PermissionDialog.readable.test.tsx` が作成されている
- [ ] 説明文表示テストが記述されている
- [ ] 詳細展開UIテストが記述されている
- [ ] アクセシビリティテスト（aria属性、キーボード操作）が記述されている
- [ ] 新規テストがすべてFAILしている（Red状態）
- [ ] 既存テスト（`PermissionDialog.test.tsx`）がPASSしている

---

## 次のフェーズ

Phase 5: 実装（TDD Green） → テストをPASSさせる実装を行う
