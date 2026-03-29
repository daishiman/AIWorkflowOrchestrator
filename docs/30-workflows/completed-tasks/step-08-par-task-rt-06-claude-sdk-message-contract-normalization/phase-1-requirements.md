# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 1                                         |
| 機能名 | claude-sdk-message-contract-normalization |
| 作成日 | 2026-03-29                                |

## 目的

Claude Code SDK の `SDKMessage` を lane 正規化イベントへ変換するための要件を固定し、`session_id`、result subtype、permission denial、provenance の保持ルールを明確化する。

## 実行タスク

- `query()` が返す主要 message 種別を列挙する
- `session_id` / result subtype / permission denial の保持要件を定義する
- UI / IPC / WorkflowEngine が消費する最小契約を定義する
- `.claude/skills/skill-creator/` の provenance を結果へ結びつける

## 参照資料

| 資料名                   | パス                                                           | 説明                         |
| ------------------------ | -------------------------------------------------------------- | ---------------------------- |
| 要件草案                 | `../requirements-draft.md`                                     | `query()` 主線、session 要件 |
| remediation pack         | `../p0-verify-manifest-remediation-pack.md`                    | 15 タスク構成                |
| Claude Code SDK overview | `https://docs.claude.com/de/docs/claude-code/sdk/sdk-overview` | SDK 全体像                   |

## 実行手順

### ステップ1: message 種別を固定する

- `system/init`
- `assistant`
- `result`
- permission / error 系の派生情報

### ステップ2: lane 正規化イベントの必須項目を固定する

- `eventType`
- `sessionId`
- `resultSubtype`
- `permissionDenials`
- `sourceProvenance`

### ステップ3: 非目標を明示する

- skill-creator の静的埋め込みはしない
- `.claude/skills/skill-creator/` の動的読込主線は変えない

## 成果物

| 成果物              | パス                                     | 説明         |
| ------------------- | ---------------------------------------- | ------------ |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | SDK 契約抽出 |

## 完了条件

- [ ] message 種別が列挙されている
- [ ] 正規化イベントの必須項目が定義されている
- [ ] dynamic skill-creator 主線を維持する非目標が明示されている
- [ ] **本Phase内の全タスクを100%実行完了**
