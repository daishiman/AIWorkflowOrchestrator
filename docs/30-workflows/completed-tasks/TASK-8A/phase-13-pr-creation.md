# Phase 13: PR作成

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 13                 |
| Phase名    | PR作成             |
| 前提Phase  | Phase 12           |
| 後続Phase  | なし               |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

ローカル検証を完了した後、ユーザーの許可を得てPRを作成し、CI/CDの通過を確認する。

## 背景

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

## 実行タスク

### Task 1: ローカル最終検証

**目的**: PR作成前にローカル環境で全品質チェックを実行する。

**実行手順**:

1. 以下のコマンドを順次実行し、すべてエラーなしであることを確認する：

```bash
# 1. 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# 2. Lint
pnpm --filter @repo/desktop eslint src/

# 3. 全テスト実行（カバレッジ付き）
pnpm --filter @repo/desktop vitest run --coverage

# 4. 対象テストファイルの個別確認
pnpm --filter @repo/desktop vitest run \
  src/main/services/skill/__tests__/SkillScanner.test.ts \
  src/main/services/skill/__tests__/SkillImportManager.test.ts \
  src/main/services/skill/__tests__/SkillExecutor.test.ts \
  src/main/services/skill/__tests__/PermissionResolver.test.ts \
  src/renderer/store/slices/__tests__/skillSlice.test.ts
```

2. 各チェック結果を記録する
3. エラーがある場合は修正し、再度全チェックを実行する
4. 結果を `outputs/phase-13/pr-info.md` に記録する

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

### Task 2: 変更サマリー作成

**目的**: PRの説明文に含める変更サマリーを作成する。

**実行手順**:

1. 以下の情報を整理する：
   - **変更概要**: TASK-8A 単体テスト（5モジュール、44テストケース）
   - **変更ファイル一覧**: テストファイル5件 + ドキュメント成果物
   - **テスト結果サマリー**: 通過テスト数、カバレッジ数値
   - **関連タスク**: TASK-8A（元仕様）、TASK-8B/8C（並列タスク）
2. PR本文のテンプレートを以下の形式で準備する：

   ```
   ## Summary
   - TASK-8A: skill-import-agent-system 単体テスト実装
   - 5モジュール（SkillScanner, SkillImportManager, SkillExecutor, PermissionResolver, skillSlice）の44テストケース
   - カバレッジ: Line XX%, Branch XX%, Function XX%

   ## Test plan
   - [ ] `pnpm --filter @repo/desktop vitest run` 全テスト通過
   - [ ] `pnpm --filter @repo/desktop vitest run --coverage` カバレッジ閾値達成
   - [ ] TypeScript型チェック通過
   - [ ] ESLintエラー0件
   ```

3. 結果を `outputs/phase-13/pr-info.md` に追記する

### Task 3: PR作成（ユーザー許可後）

**目的**: ユーザーの明示的な許可を得た後、PRを作成する。

**実行手順**:

1. **ユーザーに許可を求める**: 「PR作成の準備が整いました。PRを作成してよいですか？」と確認する
2. ユーザーの許可を得た後、`/ai:diff-to-pr` スキルを使用してPRを作成する
3. PR作成後、以下を確認する：
   - PRのURLを記録する
   - CI/CDパイプラインが開始されていることを確認する
4. 結果を `outputs/phase-13/pr-info.md` に追記する

### Task 4: CI確認

**目的**: CI/CDパイプラインが通過したことを確認する。

**実行手順**:

1. PR作成後、CI/CDの実行状況を確認する：
   ```bash
   gh pr checks
   ```
2. 全チェックがPASSしていることを確認する
3. FAILがある場合、原因を分析し修正する
4. 最終結果を `outputs/phase-13/pr-info.md` に追記する

## 参照資料

| 参照資料             | パス                                            | 説明             |
| -------------------- | ----------------------------------------------- | ---------------- |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`       | レビューPASS確認 |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`            | カバレッジ数値   |
| 品質レポート         | `outputs/phase-9/quality-report.md`             | 品質検証結果     |
| ドキュメント更新記録 | `outputs/phase-12/documentation-changelog.md`   | Phase 12結果     |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`        | Phase 11 成果物  |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Phase 12 成果物  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 成果物  |

## 成果物

| 成果物 | パス                          | 説明                     |
| ------ | ----------------------------- | ------------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | 検証結果・PR URL・CI結果 |

## 完了条件

- [ ] ローカル最終検証（型チェック・Lint・テスト）がすべて通過している
- [ ] 変更サマリーが作成されている
- [ ] ユーザーの明示的な許可を得ている
- [ ] PRが作成されている
- [ ] CI/CDがPASSしている
- [ ] PR情報が `outputs/phase-13/` に記録されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 13 \
  --artifacts "outputs/phase-13/pr-info.md:PR情報"
```

## 依存関係

| 項目      | 内容     |
| --------- | -------- |
| 前提Phase | Phase 12 |
| 後続Phase | なし     |
