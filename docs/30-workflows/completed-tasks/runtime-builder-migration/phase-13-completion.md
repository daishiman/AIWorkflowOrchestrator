# Phase 13: 完了

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001                    |
| Phase      | 13 - 完了                                           |
| 依存成果物 | `phase-12-documentation.md`（ドキュメント更新完了） |

## 目的

`UT-RUNTIME-BUILDER-MIGRATION-001`（TerminalHandoffBuilder `buildForSurface()` 統一）タスクの最終成果物を確認し、PR 作成準備を完了させる。

## 完了チェックリスト

### 受入基準

- [ ] **AC-1**: `buildForSurface(request: BuildForSurfaceRequest, reason: HandoffGuidance["reason"]): HandoffGuidance` メソッドが `TerminalHandoffBuilder` に追加されている
- [ ] **AC-2**: 旧メソッド（`build`, `buildForAgentExecution`, `buildForSkillExecution`）に `@deprecated` タグが付与されている
- [ ] **AC-3**: `chatEditHandlers.ts` / `agentHandlers.ts` / `skillHandlers.ts` の呼び出し箇所が `buildForSurface()` に移行されている（合計 4 箇所）
- [ ] **AC-4**: `RuntimeSkillCreatorFacade.ts` の `terminal_handoff` 分岐が `buildForSurface()` を使用している
- [ ] **AC-5**: セキュリティ要件が満たされている（API キー非漏洩・shell 特殊文字サニタイズ）
- [ ] **AC-6**: `TerminalHandoffBuilder.test.ts` のユニットテスト 16 件が全て PASS している

### 品質確認

- [ ] 全テストが PASS している（`pnpm --filter @repo/desktop test` 回帰なし）
- [ ] Lint が PASS している（`pnpm --filter @repo/desktop lint`）
- [ ] TypeCheck が PASS している（`pnpm --filter @repo/desktop typecheck`）

### ドキュメント

- [ ] Phase 12 の全 Task（Task 1〜5）が完了している
- [ ] `implementation-guide.md` が作成されている（Part 1 日常例え・Part 2 実装詳細）
- [ ] `documentation-changelog.md` が全 Step 完了後に事後記録されている
- [ ] `unassigned-task-detection.md` が作成されている

### 未タスク管理

- [ ] MINOR-1（chat-edit/TerminalHandoffBuilder.ts 削除）が3ステップで管理されている
- [ ] MINOR-2（RuntimeSkillCreatorFacade 戻り値型波及）が3ステップで管理されている
- [ ] 各未タスクに対応する GitHub Issue がオープンされている（または再評価クローズ時は Close 済み）

### PR 作成準備

- [ ] ブランチ `feature/UT-RUNTIME-BUILDER-MIGRATION-001` に全変更がコミットされている
- [ ] コミット前チェックリスト（lint / typecheck / テスト全 PASS / `--no-verify` 不使用）が完了している

## PR 情報

| 項目           | 内容                                                             |
| -------------- | ---------------------------------------------------------------- |
| ブランチ名     | `feature/UT-RUNTIME-BUILDER-MIGRATION-001`                       |
| PR タイトル    | `feat(runtime): add buildForSurface() to TerminalHandoffBuilder` |
| 関連 Issue     | #1461                                                            |
| ベースブランチ | `main`                                                           |

**PR 本文テンプレート**:

```markdown
## Summary

- TerminalHandoffBuilder に buildForSurface() 統一メソッドを追加
- 旧メソッド (build, buildForAgentExecution, buildForSkillExecution) に @deprecated 付与
- 4箇所の呼び出し元を buildForSurface() に移行

## Test Plan

- [ ] buildForSurface() ユニットテスト 16 件全 PASS
- [ ] pnpm lint PASS
- [ ] pnpm typecheck PASS
- [ ] 既存テスト回帰なし
```

**PR 作成コマンド**:

```bash
gh pr create \
  --title "feat(runtime): add buildForSurface() to TerminalHandoffBuilder" \
  --body "$(cat <<'EOF'
## Summary

- TerminalHandoffBuilder に buildForSurface() 統一メソッドを追加
- 旧メソッド (build, buildForAgentExecution, buildForSkillExecution) に @deprecated 付与
- 4箇所の呼び出し元を buildForSurface() に移行

## Test Plan

- [ ] buildForSurface() ユニットテスト 16 件全 PASS
- [ ] pnpm lint PASS
- [ ] pnpm typecheck PASS
- [ ] 既存テスト回帰なし

Closes #1461
EOF
)" \
  --base main
```

## 成果物一覧

| ファイル                                                                          | 種別 | 変更内容                                                                                                      |
| --------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                | 修正 | `buildForSurface()` 追加、旧メソッドに `@deprecated` 付与                                                     |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`                                   | 修正 | `build()` → `buildForSurface({ surfaceType: 'chat-edit', ... }, reason)`                                      |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                                      | 修正 | `buildForAgentExecution()` → `buildForSurface({ surfaceType: 'runtime', runtimeType: 'agent', ... }, reason)` |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | 修正 | `buildForSkillExecution()` → `buildForSurface({ surfaceType: 'runtime', runtimeType: 'skill', ... }, reason)` |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`             | 修正 | `terminal_handoff` 分岐で `buildForSurface()` を使用                                                          |
| `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`              | 修正 | 型定義の共有                                                                                                  |
| `apps/desktop/src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts` | 修正 | `buildForSurface()` ユニットテスト 16 件追加                                                                  |
| `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | 修正 | `TerminalHandoffBuilder` セクション更新                                                                       |

## 参照資料

- `phase-1-requirements.md` - 受入基準定義
- `phase-2-design.md` - 設計詳細
- `phase-3-design-review.md` - 設計レビュー（MINOR-1/MINOR-2 の出典）
- `phase-12-documentation.md` - ドキュメント更新手順

---

## 統合テスト連携

全テスト（単体 16+ ケース + 統合テスト C-1〜C-3, D-1）が PASS していることを最終確認する。

---

## 多角的チェック観点

| 観点         | 確認内容                                      | 対応チェックリスト     |
| ------------ | --------------------------------------------- | ---------------------- |
| 受入基準     | AC-1〜AC-6 が全て満たされているか             | 受入基準セクション     |
| ドキュメント | Phase 12 Task 1〜5 が全て完了しているか       | ドキュメントセクション |
| 未タスク管理 | MINOR-1/MINOR-2 が3ステップで管理されているか | 未タスク管理セクション |

---

## サブタスク管理

- [ ] 受入基準（AC-1〜AC-6）を最終確認する
- [ ] 品質確認（テスト・Lint・TypeCheck）を最終確認する
- [ ] ドキュメント（Phase 12 Task 1〜5）を最終確認する
- [ ] 未タスク管理（MINOR-1, MINOR-2）を最終確認する
- [ ] PR作成準備を完了する
