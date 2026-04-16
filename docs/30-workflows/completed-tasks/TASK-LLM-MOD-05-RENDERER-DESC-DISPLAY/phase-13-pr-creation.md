# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| Phase名    | PR作成                                |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 12: ドキュメント更新            |
| 次Phase    | -（完了）                             |
| ステータス | pending（ユーザー承認待ち）           |
| 作成日     | 2026-04-16                            |

## 目的

ユーザーの明示承認後に PR を作成する。**ユーザー承認なしに実行禁止**。

## ⚠️ 重要: 実行前にユーザー承認が必要

このフェーズは **ユーザーが明示的に「PR を作成してください」と指示した場合のみ** 実行する。

## 実行タスク（ユーザー承認後のみ）

### Task 1: ブランチ確認

```bash
git branch --show-current
git log --oneline -5
```

### Task 2: 最終チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop build
```

### Task 3: PR 作成

```bash
gh pr create \
  --title "feat(llm): InlineModelSelector description tooltip follow-up (#2159)" \
  --body "$(cat <<'EOF'
## Summary

- `InlineModelSelector` にのみ `description` 表示を追加
- `ModelSelector` と `ProviderSelector` は baseline のまま維持
- `description` が `undefined` / 空文字 / 空白のみの場合は非表示とし、レイアウト崩れを防ぐ

## Changes

- `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`: tooltip / helper text 形式で description 表示を追加
- `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`: T-1〜T-15 の期待値を追加

## Test plan

- [ ] T-1〜T-15: description あり/なし/空文字/回帰テスト PASS
- [ ] Phase 11 手動テスト: 2枚のスクリーンショット証跡取得済み
- [ ] typecheck / lint / test / build PASS

Closes #2159

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 参照資料

| 資料名           | パス                        | 説明          |
| ---------------- | --------------------------- | ------------- |
| ドキュメント更新 | `phase-12-documentation.md` | PR 内容の根拠 |

## 成果物

| 成果物  | パス                          | 説明               |
| ------- | ----------------------------- | ------------------ |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL・マージ結果 |

## 完了条件

- [ ] ユーザーの明示承認を得ている
- [ ] 全品質チェックが PASS している
- [ ] PR が作成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している
