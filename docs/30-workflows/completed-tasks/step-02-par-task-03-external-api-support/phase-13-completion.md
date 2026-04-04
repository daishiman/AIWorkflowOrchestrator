# Phase 13: 完了チェックリスト -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                           |
| --------- | ---------------------------- |
| Phase番号 | 13                           |
| 機能名    | external-api-support         |
| タスクID  | TASK-SDK-SC-03               |
| 作成日    | 2026-04-02                   |
| 依存Phase | Phase 12（ドキュメント整備） |

## 目的

TASK-SDK-SC-03 の全成果物を最終確認し、commit / PR は scope 外として保留する。

## Task 13-1: 成果物の最終確認

### コード成果物

| ファイル                                                                    | 確認内容                                                                                                                |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreatorExternalApi.ts`                      | `IExternalApiAdapter` / `ExternalApiConnectionConfig` / `SkillExternalApiContext` / エラークラス2件が定義されていること |
| `packages/shared/src/ipc/channels.ts`                                       | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API = 'skill-creator:configure-api'` が追加されていること                |
| `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts` | `setAuth` / `get` / `post` / `fetchWithTimeout` / `buildAuthHeader` / `warnIfNotHttps` が実装されていること             |
| `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`      | URL / メソッド / 認証種別 / 認証情報 / カスタムヘッダーのフォームが実装されていること                                   |

### テスト成果物

| ファイル                                                                                   | 確認内容                               |
| ------------------------------------------------------------------------------------------ | -------------------------------------- |
| `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts` | T-01〜T-13（最低限）が全件PASSすること |

### ドキュメント成果物

| ファイル                                                                         | 確認内容                                  |
| -------------------------------------------------------------------------------- | ----------------------------------------- |
| `docs/30-workflows/step-02-par-task-03-external-api-support/` 配下の全14ファイル | 全Phaseのドキュメントが作成されていること |

## Task 13-2: 最終テスト実行

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts \
  --reporter=verbose
```

期待する結果: **全テスト PASS**

## Task 13-3: 最終品質チェックリスト

```bash
# TypeScript型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint

# Vitest
pnpm --filter @repo/desktop vitest run
```

- [ ] `pnpm lint` が通ること（エラー0件）
- [ ] `pnpm typecheck` が通ること（エラー0件）
- [ ] 関連テストが全てPASSすること
- [ ] commit / PR を実行しないことを確認した（scope外）

## Task 13-4: 引き継ぎメモ

- commit / PR は本スコープでは実行しない
- 追加の公開判断が必要になった場合のみ、ユーザー承認後に次工程へ進める
- 作業ブランチやコミットメッセージ案は必要になってから別途生成する

## Task 13-5: タスク完了サマリー

| 項目                    | 内容                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| タスクID                | TASK-SDK-SC-03                                                                  |
| 新規ファイル数          | 3ファイル（shared型定義・desktop/adapters・desktop/renderer）                   |
| 変更ファイル数          | 1ファイル（packages/shared/src/ipc/channels.ts）                                |
| 新規インターフェース    | `IExternalApiAdapter`・`ExternalApiConnectionConfig`・`SkillExternalApiContext` |
| 新規クラス              | `HttpExternalApiAdapter`                                                        |
| 新規Reactコンポーネント | `ExternalApiConfigForm`                                                         |
| 新規エラークラス        | `ExternalApiTimeoutError`・`ExternalApiHttpError`                               |
| 新規IPCチャネル         | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`                             |
| テストケース数          | T-01〜T-13（基本8件 + 拡充5件）                                                 |
| セキュリティ要件対応    | FR-005（APIキーログ非出力・HTTPS警告）/ OWASP Top10（A01/A02/A03/A07/A09）      |
| 並列タスクへの影響      | channels.ts追記のみ・他ファイルとの競合なし                                     |

## 完了チェックリスト

### コード成果物

- [ ] `packages/shared/src/types/skillCreatorExternalApi.ts` が作成されている
- [ ] `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_EXTERNAL_API_CHANNELS` が追加されている
- [ ] `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts` が作成されている
- [ ] `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx` が作成されている

### テスト

- [ ] `HttpExternalApiAdapter.test.ts` が作成されている
- [ ] 最終テスト実行で全テスト（T-01〜T-13）がPASSした
- [ ] カバレッジ目標（ライン80%以上・関数100%）を達成した
- [ ] セキュリティ関連コードのカバレッジ100%を達成した

### 品質

- [ ] OWASP Top10観点のセキュリティレビューを完了した
- [ ] commit / PR は scope 外として保留した

### ドキュメント

- [ ] Phase 1〜13の全14ファイルが作成されている
- [ ] 実装ガイド・system spec update summary・documentation changelog・unassigned-task detection・skill feedback report が記述されている

---

**タスク完了**: TASK-SDK-SC-03 — External API Support（外部APIサポート）
