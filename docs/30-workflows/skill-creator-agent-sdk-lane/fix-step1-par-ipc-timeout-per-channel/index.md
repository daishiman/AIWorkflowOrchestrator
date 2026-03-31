# fix-ipc-timeout-per-channel

## 概要

`apps/desktop/src/preload/ipc-utils.ts` の全チャンネル共通タイムアウト `IPC_TIMEOUT_MS = 5000` を、チャンネル別に上書きできる仕組みへ拡張する。

OAuth ログイン（最大 300 秒）やスキル実行（最大 60 秒）といった長時間処理チャンネルに対して、個別のタイムアウト値を設定可能にし、既存の短命チャンネルへの後方互換性を維持する。

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-FIX-IPC-TIMEOUT-001                     |
| タスク種別 | バグ修正 / 機能拡張                          |
| 優先度     | medium                                       |
| 複雑度     | small                                        |
| ステータス | spec_created                                 |
| 依存タスク | なし（TASK-FIX-AUTH-IPC-001 と並列実行可能） |
| 後続タスク | なし                                         |
| 作成日     | 2026-04-01                                   |
| 更新日     | 2026-04-01                                   |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| 真の論点             | 全チャンネル共通の 5 秒タイムアウトが、長時間処理チャンネルに対して早期タイムアウトを引き起こしている |
| 依存関係・責務境界   | `ipc-utils.ts` 内で完結する変更。IPC コントラクト（チャンネル名・引数型）は変えない                   |
| 価値とコストの不均衡 | `CHANNEL_TIMEOUTS` マップと `getChannelTimeout` 関数を追加するだけで高い保守性を得られる              |
| 改善優先順位         | 1. デフォルト維持の後方互換 2. チャンネル別マップ 3. `invokeWithTimeout` でマップを参照               |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 高                                                     |

## 受入基準

| ID     | 基準                                                                                       |
| ------ | ------------------------------------------------------------------------------------------ |
| AC-001 | `getChannelTimeout(channel)` がマップに定義されたチャンネルには個別値を返す                |
| AC-002 | `getChannelTimeout(channel)` がマップ未定義チャンネルには `IPC_TIMEOUT_MS`（5000ms）を返す |
| AC-003 | `invokeWithTimeout` が `getChannelTimeout` を使い、チャンネル別タイムアウトで動作する      |
| AC-004 | `auth:login` は 500ms、`skill:execute` は 60000ms など、設計書通りの値が設定されている     |
| AC-005 | 既存テストが全て PASS する（後方互換性維持）                                               |
| AC-006 | `getChannelTimeout` のユニットテストが全パターンを網羅している                             |

## スコープ

**含む**:

- `apps/desktop/src/preload/ipc-utils.ts` の修正
  - `CHANNEL_TIMEOUTS` マップの追加
  - `getChannelTimeout(channel)` 関数の追加
  - `invokeWithTimeout` のタイムアウト取得を `getChannelTimeout` に変更
- `ipc-utils.ts` のユニットテスト追加・更新

**含まない**:

- IPC チャンネル定義（`channels.ts`）の変更
- IPC コントラクト（引数型・戻り値型）の変更
- Main プロセス側のタイムアウト処理
- commit / PR 作成 / push（Phase 13 で user approval があるまで実行しない）

## 依存関係

| 種別      | 参照先                                               | 役割                                     |
| --------- | ---------------------------------------------------- | ---------------------------------------- |
| canonical | `apps/desktop/src/preload/ipc-utils.ts`              | 修正対象の current code                  |
| canonical | `.claude/skills/task-specification-creator/SKILL.md` | Phase 1-13 / Phase 12 テンプレートの正本 |
| canonical | `.claude/skills/aiworkflow-requirements/SKILL.md`    | system spec の正本                       |
| parallel  | TASK-FIX-AUTH-IPC-001                                | 並列実行可能な関連タスク                 |

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)

## ディレクトリ構成

```text
fix-ipc-timeout-per-channel/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
└── phase-13-pr-creation.md
```

## 実装者向けクイックガイド

### 着手条件

- `apps/desktop/src/preload/ipc-utils.ts` の `invokeWithTimeout` と `IPC_TIMEOUT_MS` の関係を読了している
- チャンネル別に必要なタイムアウト値（設計参照）を把握している

### 想定変更ポイント

- `apps/desktop/src/preload/ipc-utils.ts`
  - `CHANNEL_TIMEOUTS` 定数の追加
  - `getChannelTimeout(channel: string): number` 関数の追加
  - `invokeWithTimeout` 内のタイムアウト取得を `getChannelTimeout(channel)` に変更

### 非対象

- `preload/index.ts` / `preload/skill-api.ts` / `preload/skill-creator-api.ts`（呼び出し側は変更不要）
- IPC チャンネル名・型定義
- Main プロセス側の処理
- commit / PR / push

### 完了イメージ

- `getChannelTimeout("auth:login")` が `500` を返す
- `getChannelTimeout("unknown:channel")` が `5000` を返す
- `invokeWithTimeout` がチャンネル別タイムアウトで動作する
- 既存テストと新規テストがともに pass する
