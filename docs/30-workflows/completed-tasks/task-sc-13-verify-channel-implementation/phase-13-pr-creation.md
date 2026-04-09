# Phase 13: PR作成

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 13                                       |
| Phase名    | PR作成                                   |
| 前提Phase  | Phase 12                                 |
| 後続Phase  | -（マージ後完了）                        |
| ステータス | blocked（ユーザー承認待ち）              |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

ユーザーの明示的な承認を得た後に、TASK-SC-13 の実装内容を PR として提出する。

> **⚠️ 重要**: PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

---

## 実行タスク

1. PR 作成前のローカルチェックを実施する
2. 変更サマリーを作成する
3. ユーザー承認後に PR を作成する
4. CI 確認を行う

### タスク1: ローカルチェック（PR作成前の最終確認）

**目的**: PR作成前に全チェックをパスしていることを確認する

```bash
# 最終チェック
pnpm --filter @repo/desktop test \
  apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts \
  apps/desktop/src/test/skill-creator-integration.test.ts

pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/

pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint
```

**成果物**: `outputs/phase-13/local-check-result.md`

---

### タスク2: 変更サマリーの作成

**目的**: PR 本文のベースとなる変更サマリーを作成する

**変更サマリー**:

```
## TASK-SC-13: skill-creator:verify チャネル実装

### 変更概要
skill-creator:verify IPC チャネルを実装し、FR-4 スキル検証機能を提供する。

### 変更ファイル
#### 新規作成
- apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts

#### 修正
- packages/shared/src/types/skillCreator.ts（VerifyResult / VerifyCheckResult 型追加）
- packages/shared/src/ipc/channels.ts（SKILL_CREATOR_VERIFY 定数追加）
- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts（verify() メソッド追加）
- apps/desktop/src/main/ipc/creatorHandlers.ts（verify ハンドラ追加・unregister 追加）
- apps/desktop/src/preload/skill-creator-api.ts（verifySkill メソッド追加）
- apps/desktop/src/test/skill-creator-integration.test.ts（verify テストケース追加）

### テスト結果
- verify UT: 12件 PASS
- E2E テスト: 4件 PASS
- 既存テスト: 全件 PASS（非影響確認済み）
- TypeScript 型チェック: PASS
```

**成果物**: `outputs/phase-13/change-summary.md`

---

### タスク3: PR作成（ユーザー承認後のみ）

> **前提**: ユーザーが明示的に「PR を作成してください」と指示した場合のみ実行する。

```bash
# ブランチ作成（未作成の場合）
git checkout -b feat/task-sc-13-verify-channel-implementation

# コミット
git add \
  packages/shared/src/types/skillCreator.ts \
  packages/shared/src/ipc/channels.ts \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  apps/desktop/src/main/ipc/creatorHandlers.ts \
  apps/desktop/src/preload/skill-creator-api.ts \
  apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts \
  apps/desktop/src/test/skill-creator-integration.test.ts \
  docs/30-workflows/task-sc-13-verify-channel-implementation/

git commit -m "feat(skill-creator): TASK-SC-13 skill-creator:verify チャネル実装

skill-creator:verify IPC チャネルを実装し、FR-4 スキル検証機能を提供する。
既存の plan/execute/improve パターンに従い4層（channels/Facade/handlers/preload）に実装。

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# PR作成
gh pr create \
  --title "feat(skill-creator): TASK-SC-13 skill-creator:verify チャネル実装" \
  --body "$(cat outputs/phase-13/change-summary.md)" \
  --base main
```

**成果物**: `outputs/phase-13/pr-info.md`（PR URL を記録）

---

### タスク4: CI 確認

**目的**: PR 作成後、CI が PASS していることを確認する

```bash
# CI 状態確認
gh pr checks
```

**成果物**: `outputs/phase-13/pr-ready-report.md`

---

## 参照資料

| 参照資料          | パス                                                                                                 | 内容                       |
| ----------------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| 依存Phase         | Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 / Phase 10 / Phase 11 / Phase 12 | 本Phase の前提             |
| Phase 12 更新結果 | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                             | 仕様更新完了の根拠         |
| 変更サマリー      | `outputs/phase-13/change-summary.md`                                                                 | PR 本文ベース              |
| 実装仕様          | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-5-implementation.md`               | 変更ファイル一覧と実装方針 |
| 品質ゲート        | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-9-quality-assurance.md`            | ローカルチェック前提       |

## 成果物

| 成果物           | パス                                     | 内容                        |
| ---------------- | ---------------------------------------- | --------------------------- |
| ローカルチェック | `outputs/phase-13/local-check-result.md` | 全チェック PASS 証跡        |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR 本文ベース               |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR URL・タイトル            |
| PR 準備レポート  | `outputs/phase-13/pr-ready-report.md`    | CI 確認結果・マージ準備状況 |

---

## 完了条件

- [ ] ユーザーの明示的な PR 作成承認を得ていること
- [ ] ローカルチェックが全件 PASS であること
- [ ] PR が作成されていること
- [ ] CI が PASS していること
- [ ] `outputs/phase-13/` に全成果物が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12 が完了していること・ユーザーの明示的な承認
- **後続**: マージ後に TASK-SC-13 完了

---

## 注意事項

- `--no-verify` は絶対に使用禁止（CLAUDE.md 規定）
- Force push は使用しない
- PR レビュー中に追加変更が必要な場合は新しいコミットを作成する
