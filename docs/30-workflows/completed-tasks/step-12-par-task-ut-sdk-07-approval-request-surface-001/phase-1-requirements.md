# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 1                                                                     |
| Phase名    | 要件定義                                                              |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | -                                                                     |
| 次Phase    | Phase 2: 設計                                                         |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

`approval:request` channel の現在の実装状態を調査し、preload listener と approval UI surface の未実装箇所を特定して、受入条件とスコープ境界を確定する。

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# APPROVAL_REQUEST channel 定数の確認
grep -n "APPROVAL_REQUEST\|approval" apps/desktop/src/preload/channels.ts

# onApprovalRequest の実装状況確認
grep -n "onApprovalRequest\|approval:request\|respondToApproval" apps/desktop/src/preload/skill-creator-api.ts

# SkillCreatorAPI interface の確認
grep -n "onApprovalRequest\|ApprovalRequest" apps/desktop/src/preload/skill-creator-api.ts

# SkillLifecyclePanel の approval 受信状況
grep -n "approval\|onApprovalRequest" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# approvalHandlers（Main 側・実装済みの確認）
grep -n "approval:request\|APPROVAL_REQUEST" apps/desktop/src/main/ipc/approvalHandlers.ts

# ApprovalGate TTL 設定値確認
grep -n "TTL\|300\|timeout" apps/desktop/src/main/services/runtime/ApprovalGate.ts
```

| 判定           | 条件                                                 | 対応                             |
| -------------- | ---------------------------------------------------- | -------------------------------- |
| 未実装（想定） | onApprovalRequest が preload になく、UI も存在しない | Phase 2 で設計を新規策定して進行 |
| 部分実装       | preload listener はあるが UI がない（または逆）      | 実装済み部分を活かして差分を策定 |
| 既実装         | onApprovalRequest・UI ともに接続済み                 | スコープ見直しをユーザーに確認   |

## 実行タスク

### Task 1: channels.ts の APPROVAL_REQUEST 定数確認

`apps/desktop/src/preload/channels.ts` を読み込み、以下を確認する:

- `APPROVAL_REQUEST` 定数が定義されているか
- チャネル名の文字列値（例: `'approval:request'`）
- ホワイトリストへの登録状況
- Main → Renderer の push 方向が正しく設定されているか

### Task 2: skill-creator-api.ts の現状分析

`apps/desktop/src/preload/skill-creator-api.ts` を読み込み、以下を確認する:

- `respondToApproval()` の実装（既実装の確認）
- `onApprovalRequest` の有無（未実装を確認）
- `SkillCreatorAPI` interface に `onApprovalRequest` が含まれているか
- listener の型定義パターン（既存の `onEvent` 系 listener を参照）

### Task 3: SkillLifecyclePanel の approval UI 現状確認

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を読み込み、以下を確認する:

- approval request を受信するコードの有無
- approval 確認 UI コンポーネントの有無（`ApprovalRequestPanel` 等）
- `respondToApproval()` を呼び出す UI イベントハンドラの有無

### Task 4: TTL 仕様の把握

`apps/desktop/src/main/services/runtime/ApprovalGate.ts` を読み込み、以下を確認する:

- TTL 値（300s が正しいか）
- TTL 超過時の動作（イベント発火・レスポンス形式）
- single-use 制約の仕様
- approval request のデータ型（`ApprovalRequest`）

### Task 5: 受入条件の確定

| AC   | 条件                                                         | 検証方法                    |
| ---- | ------------------------------------------------------------ | --------------------------- |
| AC-1 | `approval:request` onEvent が preload に登録されている       | コードレビュー / UT         |
| AC-2 | Renderer に approval 確認 UI が表示される                    | 手動テスト / screenshot     |
| AC-3 | approve/reject 操作が `respondToApproval()` と接続されている | UT / 統合テスト             |
| AC-4 | AC-4 enforcement の手動テスト screenshot あり                | Phase 11 スクリーンショット |

### Task 6: スコープ境界の確定

- **含む**:
  - `approval:request` onEvent listener の preload 追加
  - `SkillCreatorAPI` interface への `onApprovalRequest` 追加
  - approval 確認 UI コンポーネントの実装（`SkillLifecyclePanel` 内または専用コンポーネント）
  - approve/reject ボタン → `respondToApproval()` 接続
  - TTL expired 時の警告表示

- **含まない**:
  - approval TTL 値の変更（`ApprovalGate.ts` は変更しない）
  - Main 側の `approvalHandlers.ts` 変更（既に実装済み）
  - 新規 IPC チャンネルの追加（既存 `APPROVAL_REQUEST` を使用）

## 参照資料

| 資料名                 | パス                                                                         | 説明                          |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| channels.ts            | `apps/desktop/src/preload/channels.ts`                                       | APPROVAL_REQUEST channel 定数 |
| skill-creator-api.ts   | `apps/desktop/src/preload/skill-creator-api.ts`                              | respondToApproval 実装済み    |
| SkillLifecyclePanel    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`         | approval UI 追加対象          |
| approvalHandlers.ts    | `apps/desktop/src/main/ipc/approvalHandlers.ts`                              | Main 側 handler（参照のみ）   |
| ApprovalGate.ts        | `apps/desktop/src/main/services/runtime/ApprovalGate.ts`                     | TTL / single-use 仕様         |
| governance-bundle test | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | approval lifecycle テスト     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                              |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 修正時の Main/Preload/型定義 同時更新チェック |
| API IPC エージェント仕様  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | approval:request チャネル一覧・型定義             |
| Skill Creator Service仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | approval IPC パターンの仕様                       |
| スキル実行IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | IPC セキュリティパターン                          |

## 多角的チェック観点

| 観点         | 適用判断                                          | 確認内容                                         |
| ------------ | ------------------------------------------------- | ------------------------------------------------ |
| IPC通信      | approval:request は Main→Renderer push のため適用 | チャネル定義・ホワイトリスト登録の完全性         |
| セキュリティ | 危険操作の approval 制御のため適用                | approval なしに危険操作が通過しないこと          |
| UI/UX        | approval 確認 UI の新規追加のため適用             | ユーザーが approve/reject を直感的に操作できるか |

## 統合テスト連携

- Phase 1 で確定した受入条件とスコープは Phase 2 の設計、Phase 4 の TDD、Phase 11 の手動テストへ引き継ぐ。
- TTL 仕様と approval surface の未実装箇所は Phase 12 のドキュメント更新と Phase 13 の PR 判断へ引き継ぐ。

## 成果物

| 成果物     | パス                                         | 説明                                                  |
| ---------- | -------------------------------------------- | ----------------------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | P50チェック結果・AC確定・スコープ境界・TTL 仕様まとめ |

## 完了条件

- [ ] P50チェックで `channels.ts`・`skill-creator-api.ts`・`SkillLifecyclePanel.tsx` の現状を確認した
- [ ] `APPROVAL_REQUEST` channel の定数が確認できた
- [ ] `respondToApproval()` が実装済みであることを確認した
- [ ] `onApprovalRequest` が未実装であることを確認した（または既実装の場合はスコープ見直し）
- [ ] TTL 仕様（300s、single-use）を把握した
- [ ] AC-1〜AC-4 が検証可能な形で確定している
- [ ] 含む / 含まないが明確に確定している
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
