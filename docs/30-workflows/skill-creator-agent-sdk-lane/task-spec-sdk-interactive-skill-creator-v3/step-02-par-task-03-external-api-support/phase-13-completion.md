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

TASK-SDK-SC-03 の全成果物を最終確認し、コミット・PR作成を行う。

## Task 13-1: 成果物の最終確認

### コード成果物

| ファイル                                                                       | 確認内容                                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreatorExternalApi.ts`                         | `IExternalApiAdapter` / `ExternalApiConfig` / `SkillExternalApiContext` / エラークラス2件が定義されていること |
| `packages/shared/src/ipc/channels.ts`                                          | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API = 'skill-creator:configure-api'` が追加されていること      |
| `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`    | `setAuth` / `get` / `post` / `fetchWithTimeout` / `buildAuthHeader` / `warnIfNotHttps` が実装されていること   |
| `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx` | URL / メソッド / 認証種別 / 認証情報 / カスタムヘッダーのフォームが実装されていること                         |

### テスト成果物

| ファイル                                                                                   | 確認内容                               |
| ------------------------------------------------------------------------------------------ | -------------------------------------- |
| `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts` | T-01〜T-13（最低限）が全件PASSすること |

### ドキュメント成果物

| ファイル                                                                                                                                                 | 確認内容                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/` 配下の全14ファイル | 全Phaseのドキュメントが作成されていること |

## Task 13-2: 最終テスト実行

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts \
  --reporter=verbose
```

期待する結果: **全テスト PASS**

## Task 13-3: PR作成前チェックリスト

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
- [ ] `--no-verify` を使っていないこと（プロジェクトルール遵守）

## Task 13-4: コミットメッセージ案

```
feat(desktop): TASK-SDK-SC-03 — HttpExternalApiAdapter実装・外部APIサポート機能

- packages/shared に ExternalApiConfig / IExternalApiAdapter 型定義追加
- packages/shared/ipc/channels.ts に skill-creator:configure-api チャネル追加
- HttpExternalApiAdapter: fetch + AbortController + 認証4種（none/api-key/bearer/basic）+ 30秒タイムアウト
- ExternalApiConfigForm: 外部API設定UIフォーム（URL/メソッド/認証種別/カスタムヘッダー）
- セキュリティ: APIキーログ非出力 / HTTPS以外URL警告 / パスワード入力フィールド
```

## Task 13-5: PR作成コマンド

```bash
# ブランチ作成（未作成の場合）
git checkout -b feat/TASK-SDK-SC-03-external-api-support

# ステージング
git add packages/shared/src/types/skillCreatorExternalApi.ts
git add packages/shared/src/ipc/channels.ts
git add apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts
git add apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx
git add apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts

# コミット
git commit -m "feat(desktop): TASK-SDK-SC-03 — HttpExternalApiAdapter実装・外部APIサポート機能"

# PR作成
gh pr create \
  --title "feat(desktop): TASK-SDK-SC-03 — HttpExternalApiAdapter実装・外部APIサポート機能" \
  --body "## 概要

skill-creator SDKセッション中に外部API（天気/Slack/GitHub等）連携が必要な場合の
設定UIと HTTP通信アダプターを実装。

## 変更内容

- \`ExternalApiConfig\` / \`IExternalApiAdapter\` 型定義（shared）
- \`SKILL_CREATOR_EXTERNAL_API_CHANNELS\` IPCチャネル追加（shared）
- \`HttpExternalApiAdapter\`: fetch + AbortController + 認証4種 + 30秒タイムアウト
- \`ExternalApiConfigForm\`: URL/メソッド/認証種別/認証情報/カスタムヘッダーのフォームUI

## セキュリティ対応

- APIキーをログに出力しない（FR-005）
- HTTPSでないURLに警告ログを出力（FR-005）
- 認証情報フィールドを \`type=password\` で保護
- OWASP Top10（A01/A02/A03/A07/A09）観点でレビュー済み

## テスト

- T-01〜T-13 全件PASS
- HttpExternalApiAdapter: ライン80%以上・ブランチ80%以上・関数100%
- セキュリティ関連コード（setAuth/buildAuthHeader/warnIfNotHttps）100%カバー

## 関連タスク

- 依存: TASK-SDK-SC-01（SDK Session Bridge）
- 並列: TASK-SDK-SC-02（SDKセッションUI等）"
```

## Task 13-6: タスク完了サマリー

| 項目                    | 内容                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| タスクID                | TASK-SDK-SC-03                                                             |
| 新規ファイル数          | 3ファイル（shared型定義・desktop/adapters・desktop/renderer）              |
| 変更ファイル数          | 1ファイル（packages/shared/src/ipc/channels.ts）                           |
| 新規インターフェース    | `IExternalApiAdapter`・`ExternalApiConfig`・`SkillExternalApiContext`      |
| 新規クラス              | `HttpExternalApiAdapter`                                                   |
| 新規Reactコンポーネント | `ExternalApiConfigForm`                                                    |
| 新規エラークラス        | `ExternalApiTimeoutError`・`ExternalApiHttpError`                          |
| 新規IPCチャネル         | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`                        |
| テストケース数          | T-01〜T-13（基本8件 + 拡充5件）                                            |
| セキュリティ要件対応    | FR-005（APIキーログ非出力・HTTPS警告）/ OWASP Top10（A01/A02/A03/A07/A09） |
| 並列タスクへの影響      | channels.ts追記のみ・他ファイルとの競合なし                                |

## 完了チェックリスト

### コード成果物

- [ ] `packages/shared/src/types/skillCreatorExternalApi.ts` が作成されている
- [ ] `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_EXTERNAL_API_CHANNELS` が追加されている
- [ ] `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts` が作成されている
- [ ] `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx` が作成されている

### テスト

- [ ] `HttpExternalApiAdapter.test.ts` が作成されている
- [ ] 最終テスト実行で全テスト（T-01〜T-13）がPASSした
- [ ] カバレッジ目標（ライン80%以上・関数100%）を達成した
- [ ] セキュリティ関連コードのカバレッジ100%を達成した

### 品質

- [ ] PR作成前チェックリスト（lint・typecheck・test）を全て確認した
- [ ] OWASP Top10観点のセキュリティレビューを完了した
- [ ] コミットを作成した（`--no-verify` 不使用）
- [ ] PRを作成した

### ドキュメント

- [ ] Phase 1〜13の全14ファイルが作成されている
- [ ] 中学生レベル説明・技術者向けリファレンス・セキュリティ上の注意点が記述されている

---

**タスク完了**: TASK-SDK-SC-03 — External API Support（外部APIサポート）
