# Phase 13: PR info（**draft / gh pr create 未実行**）

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | 13                                                           |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                        |
| タスク種別 | NON_VISUAL code task                                         |
| Task       | 13-3                                                         |
| ステータス | **draft（user 承認受領まで `gh pr create` 一切実行しない）** |
| Issue      | `#2300`（closed 状態を維持。再 open しない）                 |

## タイトル案

```
feat: TASK-SC-08-FUP-02 progress payload への planId/requestId 付与による混線防止
```

## 本文（draft）

```markdown
## Summary

- `SkillCreatorProgress` に optional field `planId?: string` / `requestId?: string` を追加し、並行 `executePlan` 実行時の progress 混線を防止する
- `useStreamingProgress` に `options.planId` フィルタを追加し、受信側で自分の planId 一致通知のみを Zustand store に反映する
- 既存呼び出し / 既存 UI を破壊しない後方互換設計（optional + 未指定時は全通知受け入れ）

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm --filter @repo/desktop test -- --run useStreamingProgress` で match / miss / legacy / no-options 4 シナリオおよび既存テスト全 PASS
- [ ] `pnpm --filter @repo/desktop test -- --run skill-creator` が PASS
- [ ] dev server スモークで main プロセス console に planId 貫通を目視確認（NV-04）

## その他

- Phase 12 実装ガイド: `docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md`
- Phase 11 NON_VISUAL 代替証跡: `docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-11/manual-test-result.md`
- system spec 更新予定: `api-ipc-system-skill-creator.md` / `lessons-learned-stream-001-progress-callback.md`（本 PR と同じ波で反映予定）

Closes #2300（closed 状態を維持。参照リンクのみ）
```

## `gh pr create` 未実行理由

| 項目             | 内容                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| ステータス       | **pending（user 承認待ち）**                                                                                                                  |
| 本 spec 作成時点 | user から PR 作成承認を受領していない                                                                                                         |
| 解除条件         | user から「PR を作成してよい」旨の明示指示を受領                                                                                              |
| 承認後の手順     | (1) 必要ブランチを push（初回は `-u` 付き）→ (2) `gh pr create --title ... --body ...` を HEREDOC で実行 → (3) `pr-creation-result.md` を作成 |
| 禁止事項         | `--no-verify` 系オプション使用禁止（プロジェクト CLAUDE.md 準拠）                                                                             |

## HEREDOC 実行テンプレート（承認後に使用）

```bash
gh pr create --title "feat: TASK-SC-08-FUP-02 progress payload への planId/requestId 付与による混線防止" --body "$(cat <<'EOF'
## Summary

- `SkillCreatorProgress` に optional field `planId?: string` / `requestId?: string` を追加し、並行 `executePlan` 実行時の progress 混線を防止する
- `useStreamingProgress` に `options.planId` フィルタを追加し、受信側で自分の planId 一致通知のみを Zustand store に反映する
- 既存呼び出し / 既存 UI を破壊しない後方互換設計（optional + 未指定時は全通知受け入れ）

## Test plan

- [ ] pnpm --filter @repo/desktop typecheck が PASS
- [ ] pnpm --filter @repo/desktop lint が PASS
- [ ] pnpm --filter @repo/desktop test -- --run useStreamingProgress で match / miss / legacy / no-options 4 シナリオおよび既存テスト全 PASS
- [ ] pnpm --filter @repo/desktop test -- --run skill-creator が PASS
- [ ] dev server スモークで main プロセス console に planId 貫通を目視確認

## その他

- Phase 12 実装ガイド: docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md
- Phase 11 NON_VISUAL 代替証跡: docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-11/manual-test-result.md

Closes #2300
EOF
)"
```

## 参照

- `phase-13-pr-creation.md` Task 13-3 / 13-4
- `.github/pull_request_template.md`
- Issue #2300（closed 状態を維持）
- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/local-check-result.md`
- `CLAUDE.md`（`--no-verify` 禁止）
