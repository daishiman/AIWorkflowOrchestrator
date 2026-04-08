# Phase 13: PR 作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 13                                                  |
| Phase 名   | PR 作成                                             |
| 前提 Phase | Phase 12（ドキュメント更新）                        |
| 後続 Phase | -（最終 Phase）                                     |
| ステータス | 保留（ユーザー承認待ち）                            |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

ユーザーの明示的な承認を得た後に、変更内容の PR を作成しマージ準備を完了させる。

## 背景

> **PR 作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

Phase 12 まで完了した変更（`RuntimeSkillCreatorFacade.ts` の exhaustive check 導入・テスト追加）を PR としてまとめ、レビュー依頼を行う。
本ブランチの現在スコープでは PR 作成は実行しない。Phase 13 は承認待ちのハンドオフ手順として保持する。

---

## 実行タスク

> **注意**: このフェーズはユーザーの明示的な承認後にのみ実行すること。

### タスク 1: PR 作成前チェック

**目的**: PR 作成に必要な前提条件を確認する。

**実行手順**:

1. 変更ファイルの差分を確認する：

   ```bash
   git diff --stat
   git status
   ```

2. コミット履歴が 1 変更単位ごとに整理されているか確認する：

   ```bash
   git log --oneline -5
   ```

3. ブランチ名が適切か確認する（例：`feat/ut-rt-01-exhaustive-check-execute-response-001`）

4. CI が通過しているか確認する（GitHub Actions）

**期待される成果物**:

- PR 作成前チェックリスト確認記録

---

### タスク 2: PR 本文作成

**目的**: 変更内容を分かりやすく説明する PR 本文を作成する。

**PR タイトル案**:

```
refactor(runtime): executeAsync() に exhaustive check パターンを導入（TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001）
```

**PR 本文構成**:

```markdown
## 概要

`RuntimeSkillCreatorFacade.executeAsync()` の `RuntimeSkillCreatorExecuteResponse` union 型判定を
`classifyExecuteResult()` + `switch` + `assertNever` による exhaustive check パターンに揃え、
error message 正規化は `extractExecuteErrorMessage()` に集約する。

関連: #1993
親タスク: TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001

## 変更内容

- `classifyExecuteResult()` + switch による 3 outcome 化
- `extractExecuteErrorMessage()` による error message 正規化
- `assertNever` ヘルパー追加（union 型拡張時のコンパイル時検出）
- TC-01〜TC-09 のユニットテスト追加

## テスト結果

- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop lint`: PASS
- `pnpm --filter @repo/desktop test`: N 件 PASS

## 注意事項

- 外部 API（`executeAsync()` シグネチャ）への変更なし
- 既存の phase 遷移・`onWorkflowStateSnapshot` 呼び出し動作は変更なし
```

**期待される成果物**:

- PR 本文（ユーザー確認済み）

---

### タスク 3: PR 作成（ユーザー承認後）

**目的**: ユーザーの承認を得た後に PR を作成する。

**実行手順**:

1. ユーザーの明示的な PR 作成承認を確認する
2. PR を作成する：

   ```bash
   gh pr create \
     --title "refactor(runtime): executeAsync() に exhaustive check パターンを導入" \
     --body "$(cat PR_BODY.md)"
   ```

3. PR URL を記録する
4. CI/CD ステータスを確認する：

   ```bash
   gh run list --limit 5
   ```

**期待される成果物**:

- 作成された PR の URL
- CI ステータス確認記録

---

### タスク 4: Issue のクローズ確認

**目的**: GitHub Issue #1993 が PR マージ後に `closes #1993` により自動クローズされる状態かを確認する。

**実行手順**:

1. PR マージ後に Issue #1993 が自動クローズされるか確認する（`closes #1993` が PR に含まれているか）
2. 必要であれば手動でクローズする
3. Issue ステータスを記録する（Issue はクローズドのまま維持）

**期待される成果物**:

- Issue クローズ確認記録

---

## 参照資料

| 参照資料                                               | パス                                                                           | 内容                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------- |
| review-gate-criteria                                   | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PR 作成基準          |
| Phase 12 実行記録                                      | 本ワークフロー Phase 12 完了記録                                               | ドキュメント更新確認 |
| phase-12-documentation.md                              | `phase-12-documentation.md`                                                    | Phase 12 成果物      |
| outputs/phase-12/implementation-guide.md               | `outputs/phase-12/implementation-guide.md`                                     | Phase 12 成果物      |
| outputs/phase-12/system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`                               | Phase 12 成果物      |
| outputs/phase-12/documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`                                  | Phase 12 成果物      |
| outputs/phase-12/unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`                                | Phase 12 成果物      |
| outputs/phase-12/skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`                                    | Phase 12 成果物      |
| outputs/phase-12/phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md`                       | Phase 12 成果物      |

---

## 成果物

| 成果物      | パス         | 内容                 |
| ----------- | ------------ | -------------------- |
| GitHub PR   | GitHub UI    | 変更内容・テスト結果 |
| PR URL 記録 | （実行記録） | PR の URL            |

---

## 統合テスト連携

- PR 作成後に CI/CD ステータスを確認する。
- 全 CI チェックが PASS することを確認する。

---

## 完了条件

- [ ] ユーザーの明示的な PR 作成承認を得ている
- [ ] PR が作成されている
- [ ] CI/CD が全件 PASS している
- [ ] Issue #1993 のクローズ確認が完了している

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **ユーザー承認**: PR 作成にはユーザーの明示的な許可が必要
- **後続**: なし（最終 Phase）

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 13 実行記録

### PR 作成情報

- PR URL:
- PR 作成日:
- CI ステータス: PASS / FAIL

### Issue クローズ確認

- Issue #1993 ステータス: クローズド（維持）

### タスク完了

- TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001 完了確認: ✅
```

---

## タスク完了

Phase 13 完了をもって `TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001` の全工程が完了します。

```
✅ Phase 1-13 全完了
✅ GitHub Issue #1993 クローズ
✅ PR マージ準備完了
```
