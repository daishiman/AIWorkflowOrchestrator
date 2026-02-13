# Phase 1: 受入基準 - Agent SDK 正式統合

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION |
| Phase    | 1（要件定義）                    |
| 作成日   | 2026-02-12                       |
| 作成者   | Claude Agent (Phase 1-3)         |

---

## 受入基準チェックリスト

### AC-001: `as any` 完全除去

- [ ] `SkillExecutor.ts` 内に `as any` キャストが存在しない
- [ ] `eslint-disable-next-line @typescript-eslint/no-explicit-any` コメントが除去されている
- [ ] `grep "as any" apps/desktop/src/main/services/skill/SkillExecutor.ts` が0件を返す

### AC-002: 型安全な動的 import

- [ ] `await import("@anthropic-ai/claude-agent-sdk")` が型情報を保持する
- [ ] `query` 関数が型付きで取得できる
- [ ] TypeScript strict mode で `SkillExecutor.ts` がコンパイル成功する

### AC-003: query() 呼び出しの型チェック

- [ ] `query()` の引数に誤った型を渡した場合にコンパイルエラーが発生する
- [ ] `query()` の戻り値に `.stream()` メソッドが型として認識される
- [ ] options の `tools`, `permissionMode`, `signal`, `apiKey` が型チェックされる

### AC-004: 既存テスト完全 PASS

- [ ] `SkillExecutor.test.ts` 全テスト PASS
- [ ] `SkillExecutor.auth.test.ts` 全テスト PASS
- [ ] `SkillExecutor.retry.test.ts` 全テスト PASS
- [ ] `SkillExecutor.integration.test.ts` 全テスト PASS
- [ ] `SkillExecutor.permission.test.ts` 全テスト PASS
- [ ] `SkillService.delegate.test.ts` 全テスト PASS

### AC-005: 既存コンポーネント無影響

- [ ] `AgentExecutor.ts` のコードに変更がない
- [ ] `agent-client.ts` のコードに変更がない
- [ ] `@repo/shared` の `QueryOptions` 型に変更がない
- [ ] `@repo/shared` の `ClaudeSDK` default export 型に変更がない

### AC-006: 型宣言ファイルの整合性

- [ ] `@anthropic-ai-claude-agent-sdk.d.ts` に `query` 名前付きエクスポートが追加されている
- [ ] 既存の `ClaudeSDK` default export が保持されている
- [ ] 型宣言が実際のSDK API シグネチャと整合する

### AC-007: ビルド・CI 正常動作

- [ ] `pnpm typecheck` が成功する
- [ ] `pnpm lint` が成功する（新たな eslint エラーが発生しない）

---

## 検証コマンド

```bash
# AC-001: as any が存在しないことを確認
grep -n "as any" apps/desktop/src/main/services/skill/SkillExecutor.ts

# AC-004: テスト実行
pnpm --filter @repo/desktop vitest run src/main/services/skill/__tests__/SkillExecutor

# AC-005: 差分確認（AgentExecutor, agent-client は変更なし）
git diff -- apps/desktop/src/main/services/agent/
git diff -- packages/shared/src/agent/agent-client.ts

# AC-007: 型チェック・Lint
pnpm typecheck
pnpm lint
```

---

## 判定基準

| 判定  | 条件                                               |
| ----- | -------------------------------------------------- |
| PASS  | AC-001 〜 AC-007 の全チェック項目が完了            |
| MINOR | AC-001 〜 AC-005 完了かつ AC-006/AC-007 に軽微課題 |
| MAJOR | AC-001 〜 AC-004 のいずれかが未達成                |
