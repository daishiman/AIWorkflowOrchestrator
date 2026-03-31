# Phase 13: PR作成

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 13                                |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

ユーザーの明示的な承認を得た後、PR を作成し CI が PASS することを確認する。

## 重要

**PR 作成はユーザーの明示的な許可を得てから実行すること。自動実行禁止。**

## 実行タスク

### 1. PR 作成前チェックリスト

- [ ] Phase 12 が全て完了している
- [ ] 全テストが PASS している
- [ ] typecheck がエラー 0件
- [ ] lint がエラー 0件
- [ ] ユーザーから PR 作成の明示的な許可を得た

### 2. ブランチ確認

```bash
git branch --show-current
git status
git diff --stat HEAD
```

### 3. コミット確認

```bash
git log --oneline -10
```

### 4. PR 作成

```bash
gh pr create \
  --title "feat(execution): UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 Safety Governance Production 統合" \
  --body "$(cat <<'EOF'
## Summary

- `registerAllIpcHandlers()` に approvalHandlers / disclosureHandlers / advancedConsoleHandlers を登録
- `DefaultApprovalGate` singleton を DI で生成・注入
- `preload/index.ts` の contextBridge に `execution` namespace を追加
- `preload/types.ts` に `ExecutionAPI` インターフェースを追加
- approval:request push 通知を実装
- セッション終了時の `revokeAll(sessionId)` を実装
- `useApprovalFlow.ts` / `useAdvancedConsole.ts` を electronAPI.execution に接続

## Test plan
- [ ] 全テスト（既存 85 + 新規統合テスト）が PASS していることを確認
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0件であることを確認
- [ ] Electron アプリ起動で handler 登録エラーがないことを確認
- [ ] `window.electronAPI.execution` が公開されていることを確認
- [ ] approval フローが手動テストで動作することを確認

## Related

- GitHub Issue: #1609
- 元タスク: TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
- 残課題: UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

### 5. CI 確認

```bash
gh pr checks
```

## 参照資料

| 参照資料              | パス                                       |
| --------------------- | ------------------------------------------ |
| Phase 12 ドキュメント | `outputs/phase-12/implementation-guide.md` |

## 成果物

| 成果物 | パス                         | 説明        |
| ------ | ---------------------------- | ----------- |
| PR URL | `outputs/phase-13/pr-url.md` | 作成した PR |

## 完了条件

- [ ] ユーザーから PR 作成の明示的な許可を得た
- [ ] PR が作成された
- [ ] CI が PASS した
- [ ] `outputs/phase-13/pr-url.md` に PR URL が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
