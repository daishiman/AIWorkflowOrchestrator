# Phase 9: 品質保証

## メタ情報

| 項目      | 内容                                  |
| --------- | ------------------------------------- |
| Phase     | 9                                     |
| Phase名   | 品質保証                              |
| カテゴリ  | 品質                                  |
| 機能名    | task-imp-permission-tool-metadata-001 |
| Issue     | #606                                  |
| 前提Phase | Phase 8（リファクタリング）           |
| 次Phase   | Phase 10（最終レビューゲート）        |

---

## 目的

toolMetadata.tsとPermissionDialog.tsx（リスクバッジ関連部分）に対して、TypeScript型チェック、ESLint、WCAG 2.1 AAコントラスト比検証、セキュリティチェックを実施し、品質基準を満たしていることを保証する。

---

## 実行タスク

### Task 1: TypeScript strict mode検証

**目的**: TypeScript strict modeでコンパイルエラーがないことを確認する。

**手順**:

1. 型チェックを実行する：

   ```bash
   pnpm --filter @repo/desktop exec tsc --noEmit
   ```

2. toolMetadata.tsに関連する型エラーがないことを確認する：
   - RiskLevel型が正しくエクスポートされているか
   - ToolMetadata型が正しくエクスポートされているか
   - 関数の戻り値型が正しく推論されているか

3. PermissionDialog.tsxに関連する型エラーがないことを確認する：
   - toolMetadataからのimportが型安全か
   - RISK_LEVEL_STYLESの型定義が正しいか

**期待される成果物**: TypeScript型チェック結果

### Task 2: ESLint検証

**目的**: ESLintルールに違反がないことを確認する。

**手順**:

1. ESLintを実行する：

   ```bash
   pnpm --filter @repo/desktop exec eslint apps/desktop/src/renderer/components/skill/toolMetadata.ts apps/desktop/src/renderer/components/skill/PermissionDialog.tsx
   ```

2. エラーがある場合は修正する
3. 修正後にテストを再実行し全テストPASSを確認する

**期待される成果物**: ESLint検証結果

### Task 3: WCAG 2.1 AAコントラスト比検証

**目的**: リスクバッジの配色がWCAG 2.1 AAの要件（コントラスト比4.5:1以上）を満たすことを確認する。

**手順**:

1. 各リスクレベルの背景色・テキスト色のコントラスト比を計算する：

   | RiskLevel | 背景色（Hex）        | テキスト色（Hex）    | コントラスト比 | 判定 |
   | --------- | -------------------- | -------------------- | -------------- | ---- |
   | Low       | #dcfce7 (green-100)  | #166534 (green-800)  |                |      |
   | Medium    | #fef9c3 (yellow-100) | #854d0e (yellow-800) |                |      |
   | High      | #ffedd5 (orange-100) | #9a3412 (orange-800) |                |      |
   | Critical  | #fee2e2 (red-100)    | #991b1b (red-800)    |                |      |

2. 4.5:1を下回る組み合わせがある場合は代替色を適用する

3. コントラスト比チェッカー（オンラインツール or 手動計算）で検証する

**期待される成果物**: コントラスト比検証結果

### Task 4: セキュリティチェック

**目的**: 追加コードにセキュリティ上の懸念がないことを確認する。

**手順**:

1. toolMetadata.tsのチェック：
   - 静的データのみを含み、ユーザー入力を処理しないことを確認する
   - 外部リソースへのアクセスがないことを確認する

2. PermissionDialog.tsx（リスクバッジ関連部分）のチェック：
   - XSS脆弱性がないことを確認する（React JSXの自動エスケープに依存）
   - dangerouslySetInnerHTMLが使用されていないことを確認する
   - ユーザー入力がそのままDOMに挿入されていないことを確認する

**期待される成果物**: セキュリティチェック結果

---

## 参照資料

| 資料名                  | パス                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| Phase 8リファクタリング | `outputs/phase-8/refactoring-report.md`                                         |
| セキュリティ仕様        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` |
| UI/UXデザイン原則       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  |

---

## 統合テスト連携アクション

- 品質保証チェック後も全テストがPASSしていることを確認する
- ESLint/TypeScript修正による回帰がないことを確認する

---

## 成果物

| 成果物名         | パス                                          | 種別     |
| ---------------- | --------------------------------------------- | -------- |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | document |

---

## 完了条件

- [ ] TypeScript strict modeでエラーがない
- [ ] ESLintエラーがない
- [ ] WCAG 2.1 AAコントラスト比が4.5:1以上を満たしている（全4リスクレベル）
- [ ] セキュリティチェックで懸念事項がない
- [ ] XSS脆弱性がないことが確認されている
- [ ] 品質保証チェック後も全テストがPASSしている
- [ ] 品質保証レポートが作成されている

---

## 次Phase

Phase 10（最終レビューゲート）: 全体的な品質・整合性を最終検証する。
