# Phase 4: テスト作成

## 目的

既存コードの回帰確認に必要な targeted tests と差分確認コマンドを定義する。

## テストマトリクス

| TC    | 観点                                              | 既存/追加 | 根拠            |
| ----- | ------------------------------------------------- | --------- | --------------- |
| TC-01 | cancel 時に新規 dir が削除される                  | 既存      | `SC-CANCEL-001` |
| TC-02 | 既存 dir は削除されない                           | 既存      | `SC-CANCEL-002` |
| TC-03 | `cleanupCancelledSkillDir` 前提と spec が一致する | 追加確認  | code/spec diff  |
| TC-04 | artifact 名と phase 間参照が一致する              | 追加確認  | docs review     |

## 依存関係整合チェック【必須】

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test -- SkillCreatorService
```

## コマンド期待値

- targeted test が通る
- shared build に失敗しない
- phase spec の成果物名が `index.md` / `artifacts.json` / 各 phase で一致する

## 成果物

| 成果物               | パス                                      |
| -------------------- | ----------------------------------------- |
| test scenarios       | `outputs/phase-4/test-scenarios.md`       |
| command expectations | `outputs/phase-4/command-expectations.md` |

## 完了条件

- [ ] TC-01 から TC-04 が定義されている
- [ ] 依存関係整合チェックが含まれている
- [ ] targeted 実行方針が明確である
