# Phase 13: PR 作成

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 13                            |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

Phase 12 までの全作業をまとめ、GitHub Pull Request を作成してマージ準備を完了する。

> **重要: このフェーズはユーザーの明示的な承認を得てから実行すること。自動実行禁止。**
> Phase 13 のコマンドは、ユーザーが「PR を作成してください」と明示的に指示した後にのみ実行する。

---

## Phase 13 blocked 条件

以下のいずれかに該当する場合は Phase 13 を実行しない。

| blocked 条件                         | 確認方法                                                 |
| ------------------------------------ | -------------------------------------------------------- |
| Phase 10 で MAJOR 判定が残っている   | `outputs/phase-10/final-review-decision.md`              |
| AC-1〜AC-6 のいずれかが未達成        | Phase 10 の AC 判定テーブル                              |
| Phase 12 の Task 12-1〜12-6 が未完了 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| ユーザーの明示的な承認がない         | ユーザーへの確認（必須）                                 |

---

## 実行タスク

### タスク1: 事前確認チェックリスト

PR 作成前に以下を確認する。

- [ ] Phase 10: 最終レビューゲート PASS（MAJOR 指摘なし）
- [ ] AC-1: IPC ロジック統合 PASS
- [ ] AC-2: ApiKeyStatus 唯一定義 PASS
- [ ] AC-3: onStatusChange props PASS
- [ ] AC-4: テスト全 PASS
- [ ] AC-5: lint/typecheck エラーなし
- [ ] AC-6: フック IPC 統合 PASS
- [ ] Phase 12: Task 12-1〜12-6 全完了
- [ ] ユーザーの明示的な PR 作成承認を得た

---

### タスク2: ブランチ・差分確認

```bash
# 現在のブランチ確認
git branch --show-current

# 変更ファイル一覧
git diff main --name-only

# コミットログ確認
git log main..HEAD --oneline
```

**変更ファイル一覧（期待値）:**

| ファイル                                                                               | 変更種別                  |
| -------------------------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`                              | 新規追加                  |
| `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`               | 新規追加                  |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`               | 変更                      |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | 変更                      |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                   | 変更（委譲）              |
| `packages/shared/src/types/skillCreator.ts`                                            | 変更（ApiKeyStatus 拡張） |

---

### タスク3: PR 作成（ユーザー承認後のみ実行）

```bash
gh pr create \
  --title "refactor: TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001 AuthKeySection・ApiKeySettingsPanel 重複解消" \
  --body "$(cat <<'EOF'
## 変更サマリー

- `useAuthKeyManagement` カスタムフックを新規追加し、AuthKeySection・ApiKeySettingsPanel の共通 IPC ロジックを統合
- `ApiKeyStatus` 型を `packages/shared/src/types/skillCreator.ts` に一元定義し、`AuthKeyStatus` ローカル型を廃止
- `AuthKeySection` に `onStatusChange` props を追加
- `ApiKeySettingsPanel` を `AuthKeySection` への委譲実装に変更

## 受入条件 AC 達成確認

| AC     | 内容                                                    | 結果 |
| ------ | ------------------------------------------------------- | ---- |
| AC-1   | ApiKeySettingsPanel の IPC ロジックが共通フックに統合   | PASS |
| AC-2   | ApiKeyStatus 型が packages/shared に唯一定義            | PASS |
| AC-3   | AuthKeySection が onStatusChange props を受け取れる     | PASS |
| AC-4   | 既存テストが全 PASS                                     | PASS |
| AC-5   | pnpm lint / pnpm typecheck エラーなし                   | PASS |
| AC-6   | useAuthKeyManagement フックに IPC 呼び出しが統合        | PASS |

## テスト結果サマリー

- `pnpm --filter @repo/desktop test`: 全 PASS
- `pnpm --filter @repo/desktop lint`: エラー 0 件
- `pnpm --filter @repo/desktop typecheck`: エラー 0 件
- Line Coverage（useAuthKeyManagement.ts）: 80%以上

## 未タスク（後続作業）

- **TECH-M-01**: `ApiKeySettingsPanel` 廃止（委譲実装確認後に別タスクで対応）
  - 参照: `outputs/phase-12/unassigned-task-detection.md`

## 関連 Issue

Closes #1903
EOF
)"
```

---

### タスク4: CI 確認

PR 作成後に CI の実行状況を確認する。

```bash
# 現在のブランチ名を確認してから実行
BRANCH_NAME=$(git branch --show-current)

# CI 実行一覧
gh run list --branch "${BRANCH_NAME}" --limit 3

# 特定の CI Run の詳細確認（RUN_ID は上記コマンドで取得）
gh run view <RUN_ID>
```

**CI 確認テーブル:**

| CI ジョブ | ステータス | 備考 |
| --------- | ---------- | ---- |
| lint      | -          | -    |
| typecheck | -          | -    |
| test      | -          | -    |
| build     | -          | -    |

**CI 判定**: （全 PASS / FAIL あり）

> CI FAIL の場合は該当する修正を行い、再コミット・再 CI 確認を行うこと。

---

### タスク5: PR 作成完了確認

```bash
# 作成した PR の確認
gh pr view --web
```

**完了確認テーブル:**

| 確認項目                  | 結果 |
| ------------------------- | ---- |
| PR URL                    | -    |
| PR タイトル               | -    |
| 関連 Issue（#1903）リンク | -    |
| レビュワー割り当て        | -    |
| CI ステータス             | -    |

---

## 参照資料

| 参照資料           | パス                                                              | 内容                            |
| ------------------ | ----------------------------------------------------------------- | ------------------------------- |
| システム仕様       | `.claude/skills/aiworkflow-requirements/references/`              | AIWorkflowOrchestrator 正本仕様 |
| 要件定義           | [phase-1-requirements.md](phase-1-requirements.md)                | AC-1〜AC-6                      |
| 最終レビュー結果   | [phase-10-final-review.md](phase-10-final-review.md)              | AC 判定記録                     |
| ドキュメント更新   | [phase-12-documentation.md](phase-12-documentation.md)            | Task 12-1〜12-6 完了状況        |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md`                   | TECH-M-01 未タスク化記録        |
| GitHub Issue #1903 | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/1903` | 関連 Issue                      |

---

## 統合テスト連携【必須】

| 判定項目                    | 基準                                         | 確認方法                       |
| --------------------------- | -------------------------------------------- | ------------------------------ |
| blocked 条件クリア          | 全 blocked 条件に該当しないこと              | タスク1 チェックリスト         |
| PR 本文の AC 達成確認       | AC-1〜AC-6 全 PASS を明記                    | タスク3 PR 本文                |
| 未タスク（TECH-M-01）の記載 | PR 本文に未タスク情報あり                    | タスク3 PR 本文                |
| CI 全 PASS                  | lint / typecheck / test / build 全 PASS      | タスク4 CI 確認テーブル        |
| ユーザー承認                | 明示的な承認を得てから PR 作成コマンドを実行 | タスク1 事前確認チェックリスト |

---

## 成果物

| 成果物      | パス                                     | 説明                              |
| ----------- | ---------------------------------------- | --------------------------------- |
| PR 作成記録 | `outputs/phase-13/pr-creation-result.md` | PR URL・CI 結果・完了確認テーブル |

---

## 完了条件

- [ ] blocked 条件を全てクリア（タスク1）
- [ ] 変更ファイル・コミットログ確認（タスク2）
- [ ] ユーザーの明示的な承認取得
- [ ] PR 作成完了（タスク3）
- [ ] CI 全 PASS（タスク4）
- [ ] PR 作成完了確認（タスク5）
- [ ] 成果物 `outputs/phase-13/pr-creation-result.md` 作成済み
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク100%実行確認【必須】

| タスク                          | 完了 |
| ------------------------------- | ---- |
| タスク1: 事前確認チェックリスト | [ ]  |
| タスク2: ブランチ・差分確認     | [ ]  |
| タスク3: PR 作成（承認後のみ）  | [ ]  |
| タスク4: CI 確認                | [ ]  |
| タスク5: PR 作成完了確認        | [ ]  |

---

## 次のPhase

**Phase 13 はタスクの最終フェーズです。**

PR がマージされ CI が全 PASS となった時点でタスク `TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001` は完了となる。

マージ後に以下を確認すること:

```bash
# マージ確認
gh pr view --json state,mergedAt
```
