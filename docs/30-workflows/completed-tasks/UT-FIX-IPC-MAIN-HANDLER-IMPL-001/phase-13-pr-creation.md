# Phase 13 — コミット準備・完了確認

## メタ情報

| 項目           | 値                                    |
| -------------- | ------------------------------------- |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH13 |
| フェーズ       | Phase 13（コミット準備・完了確認）    |
| ステータス     | completed                             |
| 前フェーズ     | Phase 12（ドキュメント更新）          |
| 次フェーズ     | なし（タスク完了）                    |

---

## 注意事項

**本フェーズはユーザーからの明示的なPR作成指示があるまで実施しない。**

このフェーズは手順を定義するドキュメントであり、Claude Code が自律的にコミット・PR作成を実行するものではない。

---

## Phase 13 実施条件

以下の条件が全て満たされていることを確認してから実施する。

- [x] Phase 1〜12 が全て完了済みであること
- [x] ユーザーからコミット・PR作成の**明示的な指示**があること

---

## コミット準備チェックリスト

### 変更ファイル確認

```bash
# 変更ファイルの一覧確認
git status

# 変更内容の詳細確認（スコープ外の変更が含まれていないか）
git diff HEAD -- apps/desktop/src/main/ipc/
```

### 最終検証コマンド

```bash
# Rule-2 PASS の最終確認（必須）
node scripts/verify-ipc-4layer.cjs

# 型チェック（必須）
pnpm --filter @repo/desktop typecheck

# テスト（必須）
pnpm --filter @repo/desktop test
```

全コマンドが PASS であることを確認してからコミットに進む。

---

## コミットメッセージ案

```
fix(ipc): implement missing main handlers for Rule-2 channels

verify-ipc-4layer.cjs Rule-2（preload ALLOWED_INVOKE_CHANNELSに
あるがmainハンドラ未実装）の違反を解消する。

実装チャネル:
- auth:start-oauth-flow (authHandlers.ts)
- auth:test-callback (authHandlers.ts, 本番環境ガード付き)
- settings:get (storeHandlers.ts)
- settings:update (同上)
- agent:get-skills (agentHandlers.ts)
- agent:get-skill-detail (agentHandlers.ts)
- agent:execute (agentHandlers.ts)
- agent:permission-respond (agentHandlers.ts)

関連: UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001
```

---

## 実施手順（ユーザー指示後）

### ステップ1: ステージング

```bash
# 変更ファイルを個別にステージング（git add -A は使用しないこと）
git add apps/desktop/src/main/ipc/authHandlers.ts
git add apps/desktop/src/main/ipc/agentHandlers.ts

# storeHandlers.ts を変更した場合
git add apps/desktop/src/main/ipc/storeHandlers.ts

# index.ts は変更不要

# 仕様書ドキュメント
git add docs/30-workflows/ipc-4layer-fix-lane/UT-FIX-IPC-MAIN-HANDLER-IMPL-001/
```

### ステップ2: コミット

```bash
git commit -m "$(cat <<'EOF'
fix(ipc): implement missing main handlers for Rule-2 channels

verify-ipc-4layer.cjs Rule-2（preload ALLOWED_INVOKE_CHANNELSに
あるがmainハンドラ未実装）の違反を解消する。

実装チャネル:
- auth:start-oauth-flow (authHandlers.ts)
- auth:test-callback (authHandlers.ts, 本番環境ガード付き)
- settings:get (storeHandlers.ts)
- settings:update (同上)
- agent:get-skills (agentHandlers.ts)
- agent:get-skill-detail (agentHandlers.ts)
- agent:execute (agentHandlers.ts)
- agent:permission-respond (agentHandlers.ts)

関連: UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001
EOF
)"
```

### ステップ3: PR作成（ユーザー指示がある場合のみ）

PR作成はユーザーから別途明示的な指示を受けた後に実施する。
