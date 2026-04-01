# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 6                                        |
| Phase名    | テスト拡充                               |
| 前提Phase  | Phase 5（実装）                          |
| 後続Phase  | Phase 7                                  |
| ステータス | 完了                                     |
| 作成日     | 2026-04-01                               |
| 機能名     | fix-step2-seq-auth-login-ipc-nonblocking |

## 目的

Phase 4 で追加したテストをさらに拡充し、fire-and-forget パターンの
エッジケースをカバーする。全54テストの PASS を維持する。

## 実行タスク

### タスク1: テストカバレッジ確認

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/desktop exec vitest run --reporter=verbose --coverage "src/main/ipc/authHandlers.test.ts"
```

### タスク2: エッジケース確認

以下のエッジケースがテストでカバーされているか確認する:

| エッジケース                   | テスト名                                | カバー状況            |
| ------------------------------ | --------------------------------------- | --------------------- |
| 永遠待機 Promise               | `should not await OAuth flow`           | ✅ カバー済み         |
| rejection → success: true      | `should return success immediately...`  | ✅ カバー済み         |
| rejection → AUTH_STATE_CHANGED | `should send AUTH_STATE_CHANGED...`     | ✅ カバー済み         |
| invalid provider               | `should reject invalid provider`        | ✅ カバー済み（既存） |
| SQL injection                  | `should validate provider is one of...` | ✅ カバー済み（既存） |

## 参照資料

| 参照資料       | パス                                             | 内容       |
| -------------- | ------------------------------------------------ | ---------- |
| テストファイル | `apps/desktop/src/main/ipc/authHandlers.test.ts` | テスト実装 |

## 成果物

| 成果物         | パス                                             | 内容          |
| -------------- | ------------------------------------------------ | ------------- |
| 拡充済みテスト | `apps/desktop/src/main/ipc/authHandlers.test.ts` | 54テスト PASS |

## 統合テスト連携【必須】

fire-and-forget 専用テスト（永遠待機Promise等）のカバレッジが十分であることを確認。

## 完了条件

- [x] 全54テストが PASS している
- [x] fire-and-forget エッジケースがカバーされている
- [x] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

## 次のPhase

Phase 7: カバレッジ確認
`docs/30-workflows/fix-step2-seq-auth-login-ipc-nonblocking/phase-7-coverage-check.md`
