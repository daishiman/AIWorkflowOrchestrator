# Phase 9: 品質保証 - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase     | 9                                       |
| Phase名   | 品質保証                                |
| カテゴリ  | 品質                                    |
| Feature   | skill-import-agent-system               |
| Task      | TASK-7C PermissionDialog コンポーネント |
| 前提Phase | Phase 8（リファクタリング）             |
| 次Phase   | Phase 10（最終レビューゲート）          |
| 作成日    | 2026-01-30                              |

## 目的

PermissionDialogコンポーネントの品質を多角的に検証し、機能・コード・カバレッジ・セキュリティの全品質ゲートをクリアすることを確認する。

## 実行タスク

### Task 1: 機能品質ゲート

**目的**: 全機能要件が正しく実装されていることを確認する

**手順**:

1. Phase 1の受け入れ基準（AC-001〜AC-015）を1件ずつ検証する
2. 各基準の合否を記録する:

| AC-ID  | 検証結果 | 備考 |
| ------ | -------- | ---- |
| AC-001 | □        |      |
| AC-002 | □        |      |
| AC-003 | □        |      |
| AC-004 | □        |      |
| AC-005 | □        |      |
| AC-006 | □        |      |
| AC-007 | □        |      |
| AC-008 | □        |      |
| AC-009 | □        |      |
| AC-010 | □        |      |
| AC-011 | □        |      |
| AC-012 | □        |      |
| AC-013 | □        |      |
| AC-014 | □        |      |
| AC-015 | □        |      |

### Task 2: コード品質ゲート

**目的**: コードが品質基準を満たしていることを確認する

**手順**:

1. 以下のコマンドで品質チェックを実行する:

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLintチェック
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

2. 品質指標を記録する:

| 指標               | 基準  | 結果 | 判定 |
| ------------------ | ----- | ---- | ---- |
| TypeScript型エラー | 0件   |      | □    |
| ESLint警告         | 0件   |      | □    |
| ESLintエラー       | 0件   |      | □    |
| テスト失敗         | 0件   |      | □    |
| any型使用          | 0箇所 |      | □    |

### Task 3: カバレッジ品質ゲート

**目的**: テストカバレッジが基準を満たしていることを確認する

**手順**:

1. カバレッジを計測する:

   ```bash
   pnpm --filter @repo/desktop vitest run --coverage src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
   ```

2. 結果を記録する:

| メトリクス | 基準 | 結果 | 判定 |
| ---------- | ---- | ---- | ---- |
| Line       | 80%  |      | □    |
| Branch     | 60%  |      | □    |
| Function   | 80%  |      | □    |

### Task 4: セキュリティ品質ゲート

**目的**: セキュリティ要件が満たされていることを確認する

**手順**:

1. 以下のセキュリティ項目を確認する:

| セキュリティ項目                   | 確認方法                       | 判定 |
| ---------------------------------- | ------------------------------ | ---- |
| XSS防止（引数表示）                | ReactのJSX自動エスケープを使用 | □    |
| dangerouslySetInnerHTML 不使用     | コード検索で確認               | □    |
| eval/Function コンストラクタ不使用 | コード検索で確認               | □    |
| ユーザー入力のサニタイズ           | formatArgs関数の安全性確認     | □    |

### Task 5: 品質レポートの作成

**目的**: 全品質ゲートの結果をレポートにまとめる

**手順**:

1. `outputs/phase-9/quality-report.md` を作成する
2. 全ゲート（機能・コード・カバレッジ・セキュリティ）の結果を記載する
3. 総合判定（PASS/FAIL）を記録する

## 統合テスト連携

| カテゴリ     | 確認内容                                  |
| ------------ | ----------------------------------------- |
| 状態同期     | Store連携の品質が確保されている           |
| データフロー | 全データフローパスが検証されている        |
| セキュリティ | XSS防止・安全なデータ表示が確認されている |

## 成果物

| 成果物名     | パス                                | タイプ   |
| ------------ | ----------------------------------- | -------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | document |

## 完了条件

- [ ] 機能品質ゲート: 全受け入れ基準（AC-001〜AC-015）がPASS
- [ ] コード品質ゲート: TypeScript型エラー0件、ESLintエラー/警告0件
- [ ] カバレッジ品質ゲート: Line≥80%, Branch≥60%, Function≥80%
- [ ] セキュリティ品質ゲート: XSS防止確認、危険なAPI不使用
- [ ] 品質レポートが作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート

`docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/phase-10-final-review-gate.md`

## 参照資料

| 参照資料         | パス                                                   | 説明                 |
| ---------------- | ------------------------------------------------------ | -------------------- |
| Phase 1成果物    | `outputs/phase-1/`                                     | 受け入れ基準         |
| Phase 7成果物    | `outputs/phase-7/`                                     | カバレッジ結果       |
| Phase 8成果物    | `outputs/phase-8/`                                     | リファクタリング記録 |
| セキュリティ仕様 | `aiworkflow-requirements: security-skill-execution.md` | セキュリティ基準     |
