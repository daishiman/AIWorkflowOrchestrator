# Phase 13: PR作成

## メタ情報

| 項目      | 内容                     |
| --------- | ------------------------ |
| Phase     | 13                       |
| 名称      | PR作成                   |
| 前提Phase | Phase 12（ドキュメント） |
| 次Phase   | なし（完了）             |
| 作成日    | 2026-04-03               |

## 目的

全 Phase の成果物が揃っていることを確認し、ユーザーの明示承認後に PR を作成する。

**重要: PR作成はユーザーの明示的な許可を得てから実行すること。自動実行禁止。**

## 実行タスク

### Task 13-1: PR 作成前チェック

| チェック項目                     | 確認結果                                               |
| -------------------------------- | ------------------------------------------------------ |
| Phase 1-12 全完了                | PASS（Phase 13 はユーザー承認待ちで blocked）          |
| TypeScript 型チェック エラー 0件 | PASS（`pnpm --filter @repo/desktop typecheck`）        |
| ESLint エラー 0件                | PASS（対象範囲で lint エラーなし）                     |
| 全テスト PASS                    | PASS（対象 vitest + visual harness + 回帰テスト）      |
| artifacts.json 整合              | PASS（Phase 1-12 completed / Phase 13 blocked と整合） |
| Phase 12 タスク仕様準拠チェック  | PASS（outputs/phase-12 一式で同期済み）                |
| local-check-result.md 作成       | 未実施（PR 作成はユーザー承認待ち）                    |
| change-summary.md 作成           | 未実施（PR 作成はユーザー承認待ち）                    |
| pr-info.md 作成                  | 未実施（PR 作成はユーザー承認待ち）                    |
| pr-creation-result.md 作成       | 未実施（PR 作成はユーザー承認待ち）                    |

### Task 13-2: PR 本文作成

PR タイトル: `feat(skill-lifecycle-panel): Verify/Improve 結果パネル実装 (#1751)`

PR 本文に含める内容:

- Summary: 変更概要（VerifyResultDetailPanel / ImproveResultDetailPanel の新規作成、SkillLifecyclePanel 統合、result-panel-parts.tsx の StatusBadge label override）
- Test plan: テスト内容（40件のユニットテスト、verify/improve 回帰ガード含む）
- Change summary:
  - `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx` — 新規作成
  - `apps/desktop/src/renderer/components/skill/ImproveResultDetailPanel.tsx` — 新規作成
  - `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx` — `StatusBadge` に label override 追加
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — verify detail / runtime improve result の統合
  - `apps/desktop/src/renderer/components/skill/__tests__/VerifyResultDetailPanel.test.tsx` — 新規作成
  - `apps/desktop/src/renderer/components/skill/__tests__/ImproveResultDetailPanel.test.tsx` — 新規作成
  - `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` — verify/improve surface の回帰確認
- その他: `TARGET_WORKFLOW_DIR` を特定し、Phase 12 の `implementation-guide.md` 反映元パスと Part 1 / Part 2 の要点を PR 本文に記載する
- PRコメント: `outputs/phase-12/implementation-guide.md` の全文を投稿する
- Breaking changes: なし
- Screenshots: 手動テストで取得した場合のみ

### Task 13-3: PR 作成（ユーザー承認後）

```bash
# ユーザー承認後のみ実行
gh pr create --title "feat(skill-lifecycle-panel): Verify/Improve 結果パネル実装 (#1751)" --body "..."
```

## 成果物

| 成果物             | 配置先                                   |
| ------------------ | ---------------------------------------- |
| PR                 | GitHub PR URL                            |
| local-check-result | `outputs/phase-13/local-check-result.md` |
| change-summary     | `outputs/phase-13/change-summary.md`     |
| pr-info            | `outputs/phase-13/pr-info.md`            |
| pr-creation-result | `outputs/phase-13/pr-creation-result.md` |

## 完了条件

- [ ] PR 作成前チェック全項目 PASS
- [ ] ユーザーの明示的な承認を取得
- [ ] PR が作成されている
- [ ] CI/CD が PASS

## タスク100%実行確認【必須】

- [ ] Task 13-1: PR 作成前チェック
- [ ] Task 13-2: PR 本文作成
- [ ] Task 13-3: PR 作成（ユーザー承認後）

## 完了

TASK-RT-03-VERIFY-IMPROVE-PANEL-001 は Phase 1-12 完了、Phase 13 はユーザー承認待ちで blocked。
