# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 9                                   |
| フェーズ名   | 品質保証                            |
| カテゴリ     | 品質                                |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

実装全体の品質を総合的に検証する。TypeScript型安全性、ESLint準拠、テスト合格、セキュリティ、アクセシビリティの各観点から最終品質を保証する。

---

## タスク

- Task 1: TypeScript型チェック
  - プロジェクト全体のTypeScript型チェックを実行する
  - 型エラーが0件であることを確認する
  - 新規ファイル（permissionDescriptions.ts）の型安全性を確認する

- Task 2: ESLintチェック
  - 変更対象ファイルのESLintチェックを実行する
  - エラーが0件であることを確認する
  - 警告がある場合は妥当性を確認する

- Task 3: テスト全体実行
  - 変更対象ディレクトリ配下の全テストを実行する
  - すべてPASSすることを確認する
  - テスト実行時間が妥当であることを確認する

- Task 4: セキュリティ確認
  - XSS防止が適切に実装されていることを確認する
  - `dangerouslySetInnerHTML` が使用されていないことを確認する
  - ユーザー由来データの安全な表示を確認する

- Task 5: アクセシビリティ確認
  - ARIA属性が正しく実装されていることを確認する
  - キーボード操作が正しく動作することを確認する
  - フォーカス管理が適切であることを確認する

---

## 参照資料

| ドキュメント      | パス                                                                           | 説明                 |
| ----------------- | ------------------------------------------------------------------------------ | -------------------- |
| Phase 5実装       | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`         | 品質確認対象         |
| Phase 5実装       | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`              | 品質確認対象         |
| セキュリティ実装  | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ基準     |
| UI/UXデザイン原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | アクセシビリティ基準 |

---

## 手順

### Task 1 実行手順

1. TypeScript型チェックを実行する：
   ```bash
   cd apps/desktop && npx tsc --noEmit
   ```
2. エラーが0件であることを確認する
3. 新規ファイルの型定義が明示的であることを確認する（暗黙のanyがないこと）

### Task 2 実行手順

1. ESLintチェックを実行する：
   ```bash
   cd apps/desktop && npx eslint src/renderer/components/skill/permissionDescriptions.ts src/renderer/components/skill/PermissionDialog.tsx
   ```
2. エラーが0件であることを確認する

### Task 3 実行手順

1. テストを実行する：
   ```bash
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/
   ```
2. 全テストPASSを確認する

### Task 4 実行手順

1. `permissionDescriptions.ts` のソースコードを確認する：
   - `dangerouslySetInnerHTML` が使用されていないこと
   - 文字列連結でHTMLが生成されていないこと
   - ユーザー入力（ツール引数）がReactの自動エスケープで安全に処理されていること
2. `PermissionDialog.tsx` のソースコードを確認する：
   - 折りたたみUI内でraw HTMLが使用されていないこと
   - `formatArgs()` の出力が安全に表示されていること

### Task 5 実行手順

1. 以下のARIA属性を確認する：
   - 折りたたみボタンに `aria-expanded` が設定されている
   - 折りたたみボタンに `aria-controls` が設定されている
   - 詳細表示領域に `role="region"` が設定されている
2. キーボード操作を確認する：
   - Enter/Spaceで展開/折りたたみが動作する
   - Tabでフォーカス移動が正常

---

## 統合テストアクション

| カテゴリ         | 確認内容                                           |
| ---------------- | -------------------------------------------------- |
| セキュリティ     | XSS攻撃ベクターが安全にハンドリングされている      |
| アクセシビリティ | ARIA属性・キーボード操作が仕様通り動作する         |
| 品質総合         | TypeScript, ESLint, テスト全てが基準を満たしている |

---

## 成果物

| 成果物名         | パス                                          | 種別     | 説明                     |
| ---------------- | --------------------------------------------- | -------- | ------------------------ |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | document | 品質チェック結果レポート |

---

## 完了条件

- [ ] TypeScriptエラー 0件
- [ ] ESLintエラー 0件
- [ ] 全テストPASS
- [ ] XSS防止が確認されている（dangerouslySetInnerHTML不使用）
- [ ] ARIA属性が正しく実装されている
- [ ] キーボード操作が正しく動作している
- [ ] 品質保証レポートが作成されている
- [ ] 成果物 `outputs/phase-9/quality-assurance-report.md` が生成されている

---

## 次のフェーズ

Phase 10: 最終レビューゲート → 総合レビュー
