# Phase 8: リファクタリング（TDD Refactor）

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 8                                   |
| フェーズ名   | リファクタリング                    |
| カテゴリ     | TDD-Refactor                        |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

TDD Refactor フェーズとして、Phase 5の実装コードを改善する。コードの可読性・保守性を向上させつつ、すべてのテストがPASSし続けることを保証する。

---

## タスク

- Task 1: permissionDescriptions.ts のリファクタリング
  - コードの重複排除を検討する
  - テンプレート定義の可読性を改善する
  - 定数・型定義の整理を行う
  - 不要なコメントの削除・必要なコメントの追加を行う

- Task 2: PermissionDialog.tsx のリファクタリング
  - 折りたたみUIロジックをカスタムフックまたはヘルパー関数に分離する検討を行う
  - JSXの構造を整理する
  - スタイルクラスの一貫性を確認する
  - 不要な状態管理がないか確認する

- Task 3: リファクタリング後の全テスト確認
  - すべてのテストがPASSすることを確認する
  - TypeScriptエラーが0件であることを確認する
  - ESLintエラーが0件であることを確認する
  - カバレッジが基準を維持していることを確認する

---

## 参照資料

| ドキュメント              | パス                                                                   | 説明                   |
| ------------------------- | ---------------------------------------------------------------------- | ---------------------- |
| Phase 5実装               | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts` | リファクタリング対象   |
| Phase 5実装               | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`      | リファクタリング対象   |
| Phase 7カバレッジレポート | `outputs/phase-7/coverage-report.md`                                   | カバレッジ基準維持確認 |

---

## 手順

### Task 1 実行手順

1. `permissionDescriptions.ts` を読み込み、以下の改善点を検討する：
   - テンプレート関数間の共通パターンを抽出できるか
   - 型定義が明確か
   - exportされるAPIが最小限か
   - 定数値（マジックナンバー等）が適切に命名されているか

2. 改善を適用する場合、テストがPASSし続けることを都度確認する

3. **注意**: 過度なリファクタリングを避ける。明確な改善点がない場合は「変更なし」と記録する

### Task 2 実行手順

1. `PermissionDialog.tsx` を読み込み、以下の改善点を検討する：
   - 折りたたみUIの状態管理が複雑でないか
   - JSXのネスト深度が適切か
   - 既存コードとの一貫性が保たれているか

2. **注意**: PermissionDialogは既存のTASK-7C実装があるため、既存パターンを尊重する。破壊的な変更は避ける

### Task 3 実行手順

1. 全テスト実行：
   ```bash
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/
   ```
2. TypeScript型チェック：
   ```bash
   cd apps/desktop && npx tsc --noEmit
   ```
3. ESLint実行：
   ```bash
   cd apps/desktop && npx eslint src/renderer/components/skill/
   ```
4. カバレッジ確認：
   ```bash
   cd apps/desktop && npx vitest run --coverage src/renderer/components/skill/__tests__/
   ```

---

## TDD状態

| 項目         | 値                                                                           |
| ------------ | ---------------------------------------------------------------------------- |
| TDDフェーズ  | Refactor                                                                     |
| テスト状態   | 全テストPASS（リファクタリング後も維持）                                     |
| 検証コマンド | `cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/` |

---

## 統合テストアクション

| カテゴリ       | 確認内容                                           |
| -------------- | -------------------------------------------------- |
| UI統合         | リファクタリング後もUI動作が正常であること         |
| テスタビリティ | リファクタリング後もカバレッジが維持されていること |

---

## 成果物

| 成果物名                 | パス                                    | 種別     | 説明                 |
| ------------------------ | --------------------------------------- | -------- | -------------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | document | 実施内容・判断の記録 |

---

## 完了条件

- [ ] permissionDescriptions.ts のリファクタリング検討が実施されている
- [ ] PermissionDialog.tsx のリファクタリング検討が実施されている
- [ ] リファクタリング実施内容（または「変更なし」の判断理由）が記録されている
- [ ] すべてのテストがPASSしている
- [ ] TypeScriptエラー 0件
- [ ] ESLintエラー 0件
- [ ] カバレッジ基準を維持している
- [ ] 成果物 `outputs/phase-8/refactoring-report.md` が生成されている

---

## 次のフェーズ

Phase 9: 品質保証 → 総合品質チェック
