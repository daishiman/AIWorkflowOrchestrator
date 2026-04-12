# [#1954] "[TASK-P0-09-U1-B] renderer-governance-display-ui"

## メタ情報

```yaml
task_id: TASK-P0-09-U1-B
task_name: renderer-governance-display-ui
category: UI
target_feature: renderer / governance イベント表示
priority: 低
scale: 中規模
status: 未着手
source_phase: Phase 12（TASK-P0-09-U1 unassigned-task-detection）
created_date: 2026-04-06
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-P0-09-U1-B-renderer-governance-display-ui.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未着手 |

---

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-P0-09-U1-B                                |
| タスク名     | renderer-governance-display-ui                 |
| 分類         | UI                                             |
| 対象機能     | renderer / governance イベント表示             |
| 優先度       | 低                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 未着手                                         |
| 発見元       | Phase 12（TASK-P0-09-U1 スコープ外として明示） |
| 発見日       | 2026-04-06                                     |

---

## 苦戦箇所・知見（TASK-P0-09-U1 実装時）

### 苦戦箇所 1: Main プロセスから Renderer への governance イベント伝達

governance 判定は Main プロセスの `RuntimeSkillCreatorFacade` で行われる。deny イベントを renderer にリアルタイム表示するには、IPC チャネル設計が必要。既存の `safeInvoke` / `safeOn` パターンを参照すること。

**知見**: `SkillCreatorAuditSink` のイベントを IPC で renderer に push するには、IPC チャネル定義（`packages/shared/src/ipc/channels.ts`）と preload ブリッジ（`preload/skill-api.ts`）の追加が最短パス。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-09-U1 では Main プロセスで path-scoped deny が runtime で発動するようになった。しかしユーザーは deny が発生したことを renderer（UI）で確認できない。

### 1.2 問題点・課題

- governance deny が発生しても、ユーザーには通知されない。
- `SkillCreatorAuditSink` の ring buffer は Main プロセス内のみ（in-memory）で保持されており、renderer からアクセスできない。
- skill-creator の実行ログに governance イベントが表示されないため、デバッグが困難。

### 1.3 放置した場合の影響

- deny が発生してもユーザーが気づかず、スキル改善が意図通りに動作していないと誤解するリスク。
- 開発者が governance を無効化するリスク（見えないから不要と判断）。

---

## 2. 何を達成するか（What）

### 2.1 目的

path-scoped deny イベントを renderer 側でリアルタイム表示し、ユーザーが governance の動作状況を確認できるようにする。

### 2.2 最終ゴール

1. Main プロセスで deny が発生した際、IPC 経由で renderer にイベントを push する。
2. renderer の skill-creator 実行ログパネルに governance イベント（allow/deny と理由）が表示される。
3. deny イベントには対象パスと `allowedSkillRoot` が表示される。

### 2.3 スコープ

#### 含むもの

- IPC チャネル追加（`governance:event` など）
- `SkillCreatorAuditSink` から IPC への push 機構
- renderer 側の governance イベント表示コンポーネント
- preload ブリッジ追加

#### 含まないもの

- audit 永続化（TASK-P0-09-U1-C）
- governance イベントのフィルタリング・検索 UI（将来スコープ）
- 通知音・デスクトップ通知（将来スコープ）

### 2.4 成果物

| 成果物                             | パス                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| IPC チャネル追加                   | `packages/shared/src/ipc/channels.ts`                                        |
| preload ブリッジ追加               | `apps/desktop/src/preload/skill-api.ts`                                      |
| AuditSink IPC push 追加            | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts` |
| renderer governance コンポーネント | `apps/desktop/src/renderer/components/skill-creator/GovernanceEventLog.tsx`  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-P0-09-U1 が完了していること（AuditSink 実装済み）
- IPC チャネル設計パターン（`packages/shared/src/ipc/channels.ts`）を理解していること
- preload API パターン（`preload/skill-api.ts`）を理解していること

### 3.2 依存タスク

- TASK-P0-09-U1（path-scoped-governance-runtime-enforcement）: **完了済み**

### 3.3 設計方針

```typescript
// IPC チャネル例
export const GOVERNANCE_CHANNELS = {
  EVENT_PUSH: "governance:event-push", // Main → Renderer (push)
} as const;

// AuditSink での IPC push
class SkillCreatorAuditSink {
  record(event: AuditEvent): void {
    this.ringBuffer.push(event);
    // IPC push（deny のみ or 全イベント）
    if (this.ipcSender) {
      this.ipcSender.send(GOVERNANCE_CHANNELS.EVENT_PUSH, event);
    }
  }
}
```

---

## 4. 実行手順

### Phase 1: 現状調査

IPC チャネル設計パターンと既存の skill-creator 実行ログ UI を調査する。

### Phase 2: 設計

IPC チャネル名・型定義・renderer コンポーネント設計を行う。

### Phase 3: 設計レビュー

IPC チャネルの命名規則と既存パターンとの整合を確認する。

### Phase 4: テスト作成（TDD Red）

IPC push と renderer 表示のテストを先に書く。

### Phase 5: 実装（Green）

IPC チャネル追加 → AuditSink push → preload ブリッジ → renderer コンポーネントの順で実装する。

### Phase 6: テスト拡充

エッジケース（IPC sender なし、高頻度イベント）を追加する。

### Phase 7: カバレッジ確認

新規コンポーネントのカバレッジを確認する。

### Phase 8: リファクタリング

コンポーネントの責務分離を確認する。

### Phase 9: 品質保証

```bash
pnpm --filter @repo/desktop lint --quiet
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test
```

### Phase 10: 最終レビュー

- [ ] deny イベントが renderer にリアルタイム表示される
- [ ] 既存テスト全 PASS
- [ ] typecheck / lint PASS

### Phase 11: 動作確認（VISUAL）

renderer での表示をスクリーンショットで記録する。

### Phase 12: ドキュメント更新

`outputs/phase-12/` に全 6 成果物を作成する。

### Phase 13: PR 作成

PR タイトル: `feat(governance): TASK-P0-09-U1-B renderer governance イベント表示 UI`

---

## 5. 完了条件チェックリスト

- [ ] deny イベントが renderer にリアルタイム表示される
- [ ] 表示には対象パスと allowedSkillRoot が含まれる
- [ ] 既存テスト全 PASS
- [ ] TypeScript 型エラーなし
- [ ] lint エラーなし

---

## 6. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                             |
| ---------------------------------------------- | ------ | -------- | ------------------------------------------------ |
| 高頻度イベントで renderer がパフォーマンス劣化 | 中     | 中       | deny イベントのみ push、または throttle 実装     |
| IPC チャネル名の衝突                           | 低     | 低       | `packages/shared/src/ipc/channels.ts` を事前確認 |
| preload セキュリティポリシーとの競合           | 中     | 低       | contextBridge 経由のみで expose する             |

---

## 7. 参照情報

| 資料                      | パス                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| 親タスク（U1）実装記録    | `docs/30-workflows/completed-tasks/task-p0-09-u1-path-scoped-governance-runtime-enforcement/` |
| IPC チャネル定義          | `packages/shared/src/ipc/channels.ts`                                                         |
| preload ブリッジ          | `apps/desktop/src/preload/skill-api.ts`                                                       |
| AuditSink 実装            | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`                  |
| unassigned-task-detection | `outputs/phase-12/unassigned-task-detection.md`（TASK-P0-09-U1）                              |
