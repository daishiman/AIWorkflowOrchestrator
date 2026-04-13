# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 13                                                |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 12                                          |
| 後続Phase  | 完了                                              |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施（ユーザー承認待ち）                        |

## 目的

ユーザーの明示的な承認を得た上で、PR を作成する。

## ⚠️ 重要: PR作成はユーザー承認後のみ実施

**このPhaseはユーザーの明示的な指示があるまで実行しないこと。**

```
Phase 13 は user の明示承認後のみ実施する。
Issue #2054 はすでに CLOSED のため、
PR の必要性についてユーザーに確認すること。
```

## PR blocked 条件

以下のいずれかに該当する場合、PR 作成を行わない:

- ユーザーの明示的な承認がない
- AC-1〜AC-5 のいずれかが未達
- `pnpm typecheck` でエラーが発生している
- `wizard-exports.test.ts` のテストが FAIL している
- CI/CD パイプラインでエラーが発生している
- Issue #2054 が CLOSED のため PR 不要とユーザーが判断した場合

## PR作成手順（承認後に実施）

### 1. ブランチ確認

```bash
git branch --show-current
git status
git diff --stat main
```

### 2. 変更サマリー確認

```bash
git log --oneline main..HEAD
git diff main -- apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx \
  apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts
```

### 3. PR作成コマンド

```bash
gh pr create \
  --title "refactor(wizard): remove deprecated DescribeStep.tsx / DescribeStep.test.tsx (#2054)" \
  --body "$(cat <<'EOF'
## Summary

- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` を物理削除
- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx` を物理削除
- `wizard-exports.test.ts` を新規作成し、DescribeStep の再露出を防止
- W2-seq-03b で完了済みの @deprecated 付与・エクスポート削除に続く最終クリーンアップ

## 背景

W2-seq-03b にて以下の準備が完了済み：
- `wizard/index.ts` から `DescribeStep` のエクスポートを削除
- `DescribeStep.tsx` に `@deprecated` JSDoc を追加
- `GenerationMode` の import 先を `GenerateStep` に変更

本 PR はその最終ステップとして、参照がなくなった DescribeStep 系ファイルを物理削除し、
barrel contract ガードを併せて固定する。

## 変更ファイル

- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`: 削除
- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx`: 削除
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts`: 新規作成

## Test plan

- [ ] `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` がエラーを返す（ファイルなし）
- [ ] `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx` がエラーを返す（ファイルなし）
- [ ] `grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"` が 0 件
- [ ] `pnpm typecheck` がエラーなく通過する
- [ ] `pnpm --filter @repo/desktop test -- wizard-exports` が全件 PASS する

Closes #2054

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 4. CI確認

```bash
gh run list --branch $(git branch --show-current) --limit 5
gh run watch
```

### 5. タスク完了処理

```bash
# Issue は既に CLOSED のため、完了記録のみ行う
echo "Task UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 completed"
```

## PR本文テンプレート変数

| 変数         | 値                                                                                      |
| ------------ | --------------------------------------------------------------------------------------- |
| タイトル     | `refactor(wizard): remove deprecated DescribeStep.tsx / DescribeStep.test.tsx (#2054)`  |
| 関連Issue    | #2054（CLOSED）                                                                         |
| 変更ファイル | `DescribeStep.tsx` / `DescribeStep.test.tsx` の削除 + `wizard-exports.test.ts` 新規作成 |
| テスト       | `pnpm --filter @repo/desktop test -- wizard-exports`                                    |

## 実行タスク

実行確認手順を参照。

## 参照資料

| 資料名               | パス                                                     | 用途            |
| -------------------- | -------------------------------------------------------- | --------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | PR本文参照      |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                | AC確認          |
| 出荷準備チェック     | `outputs/phase-10/release-readiness-checklist.md`        | Phase 10 成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物 |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

## 成果物

| 成果物 | パス | 説明           |
| ------ | ---- | -------------- |
| PR URL | -    | PR作成後に記録 |

## 完了条件

- [ ] ユーザーの承認取得（**必須前提条件**）
- [ ] PR が作成されている（承認後）
- [ ] CI/CD が PASS している
- [ ] Issue #2054 との紐付けが完了

## タスク100%実行確認【必須】

- [ ] ユーザーの明示承認を得た（実施前必須）
- [ ] PR作成コマンドを実行した（承認後）
- [ ] CI確認を実施した

## 注意事項

**Issue #2054 は CLOSED 状態です。**
実装は既に完了しているため、PR作成の要否についてはユーザーに確認してください。

## 完了

Phase 13 完了をもってタスク全体が完了となります。
