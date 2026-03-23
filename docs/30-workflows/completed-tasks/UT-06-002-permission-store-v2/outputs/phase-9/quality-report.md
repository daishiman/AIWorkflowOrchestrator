# Phase 9: 品質検証

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 9                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

### 静的解析

```bash
# TypeScript 型チェック
pnpm typecheck

# ESLint
pnpm lint
```

| 品質項目            | コマンド         | 基準 | 結果       |
| ------------------- | ---------------- | ---- | ---------- |
| TypeScript 型エラー | `pnpm typecheck` | 0件  | {{RESULT}} |
| ESLint エラー       | `pnpm lint`      | 0件  | {{RESULT}} |

### テスト実行

```bash
# 全テスト
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test
```

| 品質項目               | コマンド                                                                                     | 基準    | 結果       |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------- | ---------- |
| PermissionStore テスト | `pnpm --filter @repo/desktop test src/main/services/skill/__tests__/PermissionStore.test.ts` | 全 PASS | {{RESULT}} |
| calcExpiresAt テスト   | `pnpm --filter @repo/shared test`                                                            | 全 PASS | {{RESULT}} |
| IPC ハンドラテスト     | `pnpm --filter @repo/desktop test src/main/ipc/__tests__/permission-store-handlers.test.ts`  | 全 PASS | {{RESULT}} |
| 既存テスト回帰         | `pnpm --filter @repo/desktop test`                                                           | 全 PASS | {{RESULT}} |

### セキュリティチェック

| チェック項目                        | 基準                            | 結果       |
| ----------------------------------- | ------------------------------- | ---------- |
| P42準拠 3段バリデーション           | permission:clear-session に適用 | {{RESULT}} |
| MINOR-01: sender 検証               | 新規ハンドラに適用              | {{RESULT}} |
| electron-store データバリデーション | validateSchemaV2 が動作         | {{RESULT}} |

### IPC 契約ドリフト検証

- [ ] 新チャンネル `permission:clear-session` が channels.ts に定義されている
- [ ] ハンドラの引数形式と Preload 側の呼び出し形式が一致している
- [ ] ホワイトリストに新チャンネルが追加されている

## 成果物

| 成果物       | パス                                | 説明           |
| ------------ | ----------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 本ドキュメント |

## 完了条件

- [ ] 全品質ゲートをクリア
- [ ] セキュリティチェック完了
- [ ] IPC 契約ドリフト検証完了
- [ ] 既存テストの回帰がないことを確認
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー
