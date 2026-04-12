# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 13                                             |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 12                                       |
| 後続Phase  | 完了                                           |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施（ユーザー承認待ち）                     |

## 目的

ユーザーの明示的な承認を得た上で PR を作成する。

## 実行タスク

- ユーザーの明示的な承認を取得する（必須前提条件）
- ブランチ・変更サマリーを確認する
- PR 作成コマンドを実行する
- CI / CD パイプラインの結果を確認する
- PR URL と完了記録を成果物として保存する

## ⚠️ 重要: PR作成はユーザー承認後のみ実施

**このPhaseはユーザーの明示的な指示があるまで実行しないこと。**

```
Phase 13 はユーザーの明示承認後のみ実施する。
Issue #2053 はすでに CLOSED のため、
PR の必要性についてユーザーに確認すること。
```

## PR blocked 条件

以下のいずれかに該当する場合、PR 作成を行わない:

- ユーザーの明示的な承認がない
- AC-1〜AC-5 のいずれかが未達
- CI/CD パイプラインでエラーが発生している
- Issue #2053 が CLOSED のため PR 不要とユーザーが判断した場合

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
git diff main -- \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

### 3. PR作成コマンド

```bash
gh pr create \
  --title "refactor(desktop): describe.skip 内の旧 testid 参照クリーンアップ (#2053)" \
  --body "$(cat <<'EOF'
## Summary

- `describe.skip` ブロック内に残存していた削除済み testid `skill-lifecycle-request-input` の参照を除去
- 対象ファイル: `SkillLifecyclePanel.llm-generation.test.tsx`, `SkillLifecyclePanel.auth-regression.test.tsx`
- 実行時コードへの影響なし（テストファイルのみの変更）

## 背景

`UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001` の実装で `skill-lifecycle-request-input` testid が
UI から削除されたが、`describe.skip` ブロック内は CI で実行されないため参照が残存していた。
スキップ解除時の突然の失敗を防ぐため、今回クリーンアップを実施した。

## 変更ファイル

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`: `skill-lifecycle-request-input` 参照削除
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`: `skill-lifecycle-request-input` 参照削除

## Test plan

- [ ] `grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/` で 0 件を確認
- [ ] `pnpm --filter @repo/desktop test:run` が全件 PASS することを確認
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS することを確認

Relates to #2053 (CLOSED)

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
echo "Task UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 completed"
```

## PR本文テンプレート変数テーブル

| 変数         | 値                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------- |
| タイトル     | refactor(desktop): describe.skip 内の旧 testid 参照クリーンアップ (#2053)                     |
| 関連 Issue   | #2053（CLOSED）                                                                               |
| 変更ファイル | `SkillLifecyclePanel.llm-generation.test.tsx`, `SkillLifecyclePanel.auth-regression.test.tsx` |
| テスト確認   | `pnpm --filter @repo/desktop test:run`                                                        |
| 型チェック   | `pnpm --filter @repo/desktop typecheck`                                                       |

## 参照資料

| 資料名           | パス                                                     | 用途              |
| ---------------- | -------------------------------------------------------- | ----------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | PR本文参照        |
| 準拠確認結果     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了判定 |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                | AC確認            |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物   |

## 成果物

| 成果物 | パス | 説明           |
| ------ | ---- | -------------- |
| PR URL | -    | PR作成後に記録 |

## 完了条件

- [ ] ユーザーの承認取得（**必須前提条件**）
- [ ] PR が作成されている（承認後）
- [ ] CI/CD が PASS している
- [ ] Issue #2053 との紐付けが完了

## サブタスク管理

| サブタスクID | 内容                       | 状態   |
| ------------ | -------------------------- | ------ |
| ST-13-1      | ユーザー承認確認           | 未実施 |
| ST-13-2      | ブランチ・変更サマリー確認 | 未実施 |
| ST-13-3      | PR 作成コマンド実行        | 未実施 |
| ST-13-4      | CI 確認                    | 未実施 |
| ST-13-5      | PR URL 記録                | 未実施 |

## タスク100%実行確認【必須】

- [ ] ユーザーの明示承認を得た（実施前必須）
- [ ] PR作成コマンドを実行した（承認後）
- [ ] CI確認を実施した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 注意事項

**Issue #2053 は CLOSED 状態です。**
実装が完了した場合、PR 作成の要否についてはユーザーに確認してください。

## 完了

Phase 13 完了をもってタスク全体が完了となります。
