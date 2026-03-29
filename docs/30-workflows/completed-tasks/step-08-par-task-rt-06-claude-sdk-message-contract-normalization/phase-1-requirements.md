# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2（設計）                           |
| ステータス | completed                                 |
| 作成日     | 2026-03-29                                |

## 目的

Claude Code SDK の `SDKMessage` を lane 正規化イベントへ変換するための要件を固定し、`session_id`、result subtype、permission denial、provenance の保持ルールを明確化する。

## 背景

`query()` が返す SDK 生メッセージは種別・構造が多岐にわたり、下流の UI / IPC / WorkflowEngine がそれぞれ独自にパースすると契約が散逸する。正規化レイヤーの要件を先に固定することで、後続の設計・実装フェーズでの手戻りを防ぐ。

## 実行タスク

### Task 1: 主要 message 種別の列挙

**目的**: `query()` が返す主要 message 種別を列挙し、正規化対象を明確にする。

**実行手順**:

1. SDK ドキュメントおよび `query()` の型定義から message 種別を抽出する
2. 各種別の用途と出現タイミングを整理する

**期待される成果物**:

- message 種別一覧表

### Task 2: 保持要件の定義

**目的**: `session_id` / result subtype / permission denial の保持要件を定義する。

**実行手順**:

1. 各項目が下流で必要とされるユースケースを洗い出す
2. 必須 / optional / 欠損時の扱いを決定する

**期待される成果物**:

- 保持要件定義書

### Task 3: 最小契約の定義

**目的**: UI / IPC / WorkflowEngine が消費する最小契約を定義する。

**実行手順**:

1. 各消費者が必要とするフィールドを列挙する
2. 最小共通契約として統合する

**期待される成果物**:

- 最小契約定義

### Task 4: provenance の結びつけ

**目的**: `.claude/skills/skill-creator/` の provenance を結果へ結びつける。

**実行手順**:

1. provenance 情報の取得元を特定する
2. 正規化イベントへの埋め込み方法を定義する

**期待される成果物**:

- provenance 結びつけルール

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

## 統合テスト連携

SDK message 種別と後続タスク入力契約（RT-03/P0-05/P0-08/P0-09）を要件に明記する。

## 完了条件

- [ ] message 種別が列挙されている
- [ ] 正規化イベントの必須項目が定義されている
- [ ] dynamic skill-creator 主線を維持する非目標が明示されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-2-design.md`
