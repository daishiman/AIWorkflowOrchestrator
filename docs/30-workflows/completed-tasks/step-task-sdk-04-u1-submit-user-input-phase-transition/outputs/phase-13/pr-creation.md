# Phase 13: PR作成

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 13                                         |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

ユーザー承認後に Pull Request を作成し、コード変更を main ブランチにマージ可能な状態にする。

## blocked 条件

**ユーザーの明示的な承認があるまで本 Phase の実行は禁止。** Phase 1〜12 の全完了をユーザーに報告し、承認を得てから実行すること。

## 実行タスク

### T-13-1: Phase 1-12 完了の最終確認

- Phase 1〜12 の完了条件が全て満たされていることを確認する
- 未完了の Phase がある場合は実行を中断し、該当 Phase に戻る

### T-13-2: git status / diff の確認

```bash
git status
git diff main...HEAD --stat
git diff main...HEAD
```

- 変更ファイルが想定範囲内であることを確認する
- 意図しない変更（.env、credentials 等）が含まれていないことを確認する

### T-13-3: コミットメッセージ作成

コミットメッセージ形式:

```
feat(skill-creator): add submitUserInput phase transition logic

- Add plan_review transition (ready_to_execute → execute, needs_changes → plan)
- Add verification_review transition (approve → handoff, improve → improve, reject → review)
- Record phase transitions as artifacts
- Add comprehensive test coverage for AC-1 through AC-7
```

### T-13-4: PR 作成

`gh pr create` を使用して PR を作成する。

#### PR テンプレート

```markdown
## Summary

- `SkillCreatorWorkflowEngine.submitUserInput()` に reason 別の phase 遷移ロジックを追加
- `plan_review` reason: `ready_to_execute` → execute 進行、`needs_changes` → plan 戻り
- `verification_review` reason: `approve` → handoff、`improve` → improve cycle、`reject` → re-plan

## Test plan

- [ ] `pnpm exec vitest run --grep "plan_review ready_to_execute"` パス（AC-1）
- [ ] `pnpm exec vitest run --grep "plan_review needs_changes"` パス（AC-2）
- [ ] `pnpm exec vitest run --grep "verification_review approve"` パス（AC-3）
- [ ] `pnpm exec vitest run --grep "verification_review improve"` パス（AC-4）
- [ ] `pnpm exec vitest run --grep "verification_review reject"` パス（AC-5）
- [ ] `pnpm exec vitest run --grep "facade snapshot"` パス（AC-6）
- [ ] `pnpm exec vitest run --grep "state-changed event"` パス（AC-7）
- [ ] `pnpm lint` エラー 0 件
- [ ] `pnpm typecheck` エラー 0 件

Closes #1672
```

### T-13-5: CI 確認

- PR 作成後、CI パイプラインの結果を確認する
- 全 CI チェックがパスすることを確認する
- 失敗した場合は原因を特定し、修正コミットを追加する

## 参照資料

### タスク仕様書

| 資料名                | パス                                   | 説明         |
| --------------------- | -------------------------------------- | ------------ |
| Phase 1 要件          | `outputs/phase-1/requirements.md`      | AC 定義      |
| Phase 9 QA            | `outputs/phase-9/quality-assurance.md` | 品質保証結果 |
| Phase 10 レビュー     | `outputs/phase-10/final-review.md`     | 最終レビュー |
| Phase 12 ドキュメント | `phase-12-documentation.md`            | ドキュメント |

### 関連 Issue

| Issue | URL                                             | 説明               |
| ----- | ----------------------------------------------- | ------------------ |
| #1672 | `https://github.com/<owner>/<repo>/issues/1672` | 本タスクの親 Issue |

## 成果物

| 成果物       | パス                              | 説明                       |
| ------------ | --------------------------------- | -------------------------- |
| PR 作成記録  | `outputs/phase-13/pr-creation.md` | 本ドキュメントに結果を追記 |
| Pull Request | GitHub PR URL                     | マージ待ち PR              |

## 完了条件

- [ ] T-13-1: Phase 1〜12 の全完了が確認されている
- [ ] T-13-2: git status / diff が確認されている
- [ ] T-13-3: コミットメッセージが作成されている
- [ ] T-13-4: PR が作成され、URL が記録されている
- [ ] T-13-5: CI が全パスしている
- [ ] ユーザーの明示的な承認を得てから実行したことが記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

なし（本タスクの最終 Phase）
