# Phase 9: 品質保証

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 9                              |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

TypeScript型チェック、ESLint、Prettier、テスト実行を総合的に実施し、品質基準を満たしていることを最終確認する。

## 実行タスク

- Task 1: TypeScript型チェック — コンパイルエラー0件を確認
- Task 2: ESLint実行 — Lintエラー0件を確認
- Task 3: Prettier実行 — フォーマット整合性を確認
- Task 4: テスト全実行 — 全テストPASSを確認
- Task 5: 品質レポート作成

## 参照資料

| 資料名        | パス                                                                        | 説明           |
| ------------- | --------------------------------------------------------------------------- | -------------- |
| 品質基準      | `.claude/skills/task-specification-creator/references/quality-standards.md` | 品質基準       |
| Phase 8成果物 | `outputs/phase-8/refactoring-log.md`                                        | リファクタ結果 |

## 実行手順

### ステップ1: TypeScript型チェック

```bash
cd apps/desktop && npx tsc --noEmit
```

**期待結果**: エラー0件

**確認項目**:

- TOOL_ICONS定数のRecord<string, string>型が正しいか
- getToolIcon関数の引数・戻り値型が正しいか
- JSXテンプレートに型エラーがないか

### ステップ2: ESLint実行

```bash
cd apps/desktop && npx eslint src/renderer/components/skill/PermissionDialog.tsx
cd apps/desktop && npx eslint src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

**期待結果**: エラー0件、警告0件

### ステップ3: Prettier実行

```bash
cd apps/desktop && npx prettier --check src/renderer/components/skill/PermissionDialog.tsx
cd apps/desktop && npx prettier --check src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

**期待結果**: フォーマット済み（変更不要）

### ステップ4: テスト全実行

```bash
cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

**期待結果**: 全テストPASS

### ステップ5: 品質レポート作成

以下の品質サマリーを作成する。

| 項目             | 結果    | 基準             |
| ---------------- | ------- | ---------------- |
| TypeScript       | ✅/❌   | エラー0件        |
| ESLint           | ✅/❌   | エラー0件        |
| Prettier         | ✅/❌   | フォーマット済み |
| テスト           | ✅/❌   | 全PASS           |
| カバレッジLine   | \_\_\_% | 80%+             |
| カバレッジBranch | \_\_\_% | 60%+             |
| カバレッジFunc   | \_\_\_% | 80%+             |

## 統合テスト連携

Phase 9はテスト実行・品質チェックのみ。統合テスト影響なし。

## 多角的チェック観点

| 観点             | 該当 | 確認内容                    |
| ---------------- | ---- | --------------------------- |
| セキュリティ     | -    | 入力処理なし                |
| UI/UX            | ✅   | 表示結果が設計通りか        |
| アクセシビリティ | ✅   | aria-hidden属性が正しいか   |
| 型安全性         | ✅   | TypeScriptエラー0件         |
| コード品質       | ✅   | ESLint/Prettierチェック通過 |

## 成果物

| 成果物       | パス                                | 説明             |
| ------------ | ----------------------------------- | ---------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質チェック結果 |

## 完了条件

- [ ] TypeScriptエラー0件
- [ ] ESLintエラー0件
- [ ] Prettierチェック通過
- [ ] 全テストPASS
- [ ] カバレッジ基準達成
- [ ] 品質レポートが `outputs/phase-9/` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. TypeScript型チェック（Task 1）
3. ESLint実行（Task 2）
4. Prettier実行（Task 3）
5. テスト全実行（Task 4）
6. 品質レポート作成（Task 5）
7. 成果物の作成・配置
8. 完了条件の検証

各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
