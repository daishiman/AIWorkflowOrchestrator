# Phase 12 成果物: ドキュメント変更履歴

## タスクID: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## 変更概要

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| 変更者     | AI (Claude Sonnet 4.6)                                                   |
| 関連 Issue | [#1682](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1682) |
| 関連 PR    | 未作成（Phase 13 にて作成予定）                                          |
| 変更日     | 2026-04-06                                                               |

## 変更したファイル一覧

| ファイル                                                                             | 変更種別 | 変更内容                                                           |
| ------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------ |
| `packages/shared/src/ipc/channels.ts`                                                | 修正     | `SKILL_CREATOR_RUNTIME_CHANNELS` 追加・IPC_CHANNELS スプレッド追加 |
| `apps/desktop/src/preload/channels.ts`                                               | 修正     | shared import 追加・参照コメント追加                               |
| `packages/shared/src/ipc/__tests__/channels.test.ts`                                 | 修正     | runtime channel 正本テスト追加                                     |
| `apps/desktop/src/preload/channels.test.ts`                                          | 修正     | runtime allowlist 回帰テスト追加                                   |
| `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`         | 修正     | cross-layer parity / runtime parity テスト追加                     |
| `packages/shared/vitest.config.ts`                                                   | 修正     | `src/ipc/channels.ts` を coverage 対象へ戻し                       |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                       | 修正     | `generate-index.js` により更新時刻を再生成                         |
| `docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/artifacts.json`         | 修正     | `outputs/artifacts.json` を phase 12 artifacts に追加              |
| `docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/outputs/artifacts.json` | 新規     | root `artifacts.json` の mirror を追加                             |

## 更新不要だったファイルとその理由

| ファイル                  | 更新不要の理由                     |
| ------------------------- | ---------------------------------- |
| IPC handler ファイル群    | channel 文字列値の変更なし         |
| renderer 側コンポーネント | UI 変更なし（NON_VISUAL タスク）   |
| security-\* 仕様書        | allowlist セマンティクスの変更なし |

## artifacts.json 同期

- `artifacts.json` と `outputs/artifacts.json` を同内容で同期
- Phase 1〜12 の全成果物を `outputs/phase-N/` に出力済み
- 全フェーズが完了状態
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4 点で current facts を確認済み

## validator 実行結果

```
TypeScript typecheck (shared): PASS
TypeScript typecheck (desktop): PASS
ESLint (shared): PASS
vitest (shared): 17 tests PASS
vitest (desktop preload): 19 tests PASS
vitest (desktop governance-bundle): 20 tests PASS
topic-map regenerate: PASS
```
