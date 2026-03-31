# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

全チャンネル共通の `IPC_TIMEOUT_MS = 5000` が、長時間処理チャンネルに対して不適切であることを要件として固定する。
後方互換性を維持しながらチャンネル別タイムアウトを設定できる仕組みを要件化し、Phase 2 の設計に渡せる受入基準を確定する。

## 実行タスク

- 現状の `ipc-utils.ts` を確認し、問題の本質を特定する
- 後方互換性維持の方針を確定する
- チャンネル別タイムアウト一覧を受入基準として固定する

## 参照資料

| 資料名                     | パス                                                 | 参照理由                         |
| -------------------------- | ---------------------------------------------------- | -------------------------------- |
| ipc-utils current code     | `apps/desktop/src/preload/ipc-utils.ts`              | 修正対象の current code anchor   |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` | Phase 1-13 / Phase 12 正本       |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`    | current facts / system spec 正本 |

## 問題の本質

- `ipc-utils.ts` の `IPC_TIMEOUT_MS = 5000` が `invokeWithTimeout` 内でハードコードされており、全チャンネルに適用されている
- `auth:login` は OAuth フローを起動する fire-and-forget であり、応答は即時に返るが念のための確認のみ（500ms で十分）
- `auth:get-session` / `auth:refresh` はネットワーク通信を伴うため 10 秒程度が妥当
- `skill-creator:plan` は AI 生成処理を含むため 30 秒程度が妥当
- `skill:execute` はスキル実行処理を含むため 60 秒程度が妥当
- 現状の 5 秒では長時間処理が強制タイムアウトしてしまう

## 受入基準（詳細）

| ID     | 基準                                                                               | 確認方法    |
| ------ | ---------------------------------------------------------------------------------- | ----------- |
| AC-001 | `getChannelTimeout("auth:login")` が `500` を返す                                  | unit test   |
| AC-002 | `getChannelTimeout("auth:get-session")` が `10000` を返す                          | unit test   |
| AC-003 | `getChannelTimeout("auth:refresh")` が `10000` を返す                              | unit test   |
| AC-004 | `getChannelTimeout("skill-creator:plan")` が `30000` を返す                        | unit test   |
| AC-005 | `getChannelTimeout("skill:execute")` が `60000` を返す                             | unit test   |
| AC-006 | `getChannelTimeout("unknown:channel")` が `5000`（`IPC_TIMEOUT_MS`）を返す         | unit test   |
| AC-007 | `invokeWithTimeout` が `getChannelTimeout(channel)` を使ってタイムアウトを決定する | code review |
| AC-008 | 既存テストが全て PASS する（後方互換性維持）                                       | vitest      |
| AC-009 | `IPC_TIMEOUT_MS` のデフォルト値（5000）が変わらない                                | code review |

## スコープ外

- IPC チャンネル定義（`channels.ts`）の変更
- IPC コントラクト（引数型・戻り値型）の変更
- Main プロセス側のタイムアウト処理
- commit / PR / push

## 実行手順

### ステップ1: current facts を固定する

1. `ipc-utils.ts` の `IPC_TIMEOUT_MS` の使われ方を確認する
2. `invokeWithTimeout` がどこから呼ばれているかを確認する
3. 各呼び出し元（`index.ts` / `skill-api.ts` / `skill-creator-api.ts`）がチャンネル別タイムアウトを必要としているか確認する

### ステップ2: 後方互換性の方針を確定する

1. `IPC_TIMEOUT_MS` を削除せず、`CHANNEL_TIMEOUTS` のデフォルト値として維持する
2. `getChannelTimeout` のフォールバックが `IPC_TIMEOUT_MS` を使う方針を確定する
3. 既存テストへの影響がゼロであることを確認する

### ステップ3: チャンネル別タイムアウト一覧を確定する

1. 設計参照資料（index.md）のチャンネル別タイムアウト設計を受入基準に写像する
2. 各チャンネルの根拠を記録する
3. Phase 2 へ渡せる状態にする

## 成果物

| 成果物   | パス                      | 説明                           |
| -------- | ------------------------- | ------------------------------ |
| 要件定義 | `phase-1-requirements.md` | current facts と受入基準の固定 |

## 完了条件

- [ ] 問題の本質が「全チャンネル共通タイムアウト」として明確に記述されている
- [ ] 後方互換性維持の方針（`IPC_TIMEOUT_MS` の存続）が確定している
- [ ] チャンネル別タイムアウト一覧が AC として固定されている
- [ ] Phase 2 へ渡せる受入基準が確定している

## サブタスク管理

1. `ipc-utils.ts` current code anchor の確認
2. 後方互換性方針の確定
3. チャンネル別タイムアウト値の根拠整理
4. 受入基準の 1:1 対応確認

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] current code anchor と参照資料のズレがない
- [ ] Phase 2 で使う source of truth が 1 文で言える
