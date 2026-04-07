# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 9                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 8                                                      |
| 後続Phase  | Phase 10                                                     |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 参照資料

| 資料名               | パス                                                                   | 説明             |
| -------------------- | ---------------------------------------------------------------------- | ---------------- |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md`                            | Phase 6 成果物   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                   | Phase 7 成果物   |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md`                                | Phase 8 成果物   |
| テスト対象           | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 変更対象ファイル |

## 多角的チェック観点（AIが判断）

| 品質項目   | 確認内容                          | 基準         |
| ---------- | --------------------------------- | ------------ |
| 機能検証   | 全自動テスト PASS                 | 100%         |
| TypeScript | typecheck エラーなし              | Error 0件    |
| Lint       | ESLint エラーなし                 | Error 0件    |
| カバレッジ | 変更関数の line/branch カバレッジ | 100%         |
| IPC契約    | IPC チャンネル変更なし            | 変更なし確認 |
| 前段整合   | Phase 6〜8 の結果と矛盾しない     | 記録整合     |

## 実行タスク

- 全品質ゲートを実行し、結果を記録する
- IPC 契約ドリフト確認（IPC 変更がないことを確認）
- 品質レポートを作成する

## サブタスク管理

- Lane A: 全自動テスト / typecheck / lint / coverage を確認する
- Lane B: IPC 契約ドリフトを確認する
- Lane C: A/B の結果を統合して quality-report を作成する
- A/B は並列、C は直列

## 実行手順

### 1. テスト実行

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

### 2. TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### 3. Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

### 4. IPC 契約ドリフト確認

```bash
# IPC チャンネルに変更がないことを確認（本タスクでは変更なしのはず）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

## 統合テスト連携

| 品質項目   | 確認内容             | 結果       |
| ---------- | -------------------- | ---------- |
| 機能検証   | 全自動テスト PASS    | {{RESULT}} |
| TypeScript | typecheck エラーなし | {{RESULT}} |
| Lint       | ESLint エラーなし    | {{RESULT}} |
| IPC 契約   | ドリフトなし         | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] テスト全件 PASS
- [ ] typecheck PASS（Error 0件）
- [ ] lint PASS（Error 0件）
- [ ] IPC 契約ドリフトなし確認
- [ ] 品質レポートが作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
