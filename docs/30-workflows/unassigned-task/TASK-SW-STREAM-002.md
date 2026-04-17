# skillCreatorHandlers.ts で onProgress コールバックを IPC に接続 - タスク指示書

## メタ情報

```yaml
issue_number: 2224
task_id: TASK-SW-STREAM-002
status: open
priority: high
scale: tiny
task_type: FEATURE
```

| 項目         | 内容                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| タスクID     | TASK-SW-STREAM-002                                                                     |
| タスク名     | stream-002-connect-progress-callback-to-handler                                        |
| 分類         | 機能追加（接続）                                                                       |
| 対象機能     | skillCreatorHandlers - SKILL_CREATOR_CREATE ハンドラーで onProgress コールバックを接続 |
| 優先度       | 高（`priority:high`）                                                                  |
| 見積もり規模 | 極小（`scale:tiny`）                                                                   |
| ステータス   | 未実施（`status:open`）                                                                |
| 依存タスク   | TASK-SW-STREAM-001（createSkill への onProgress 追加が前提）                           |
| 発見元       | skill-create-flow-gaps 分析（2026-04-16）                                              |
| 発見日       | 2026-04-16                                                                             |
| タスク分類   | FEATURE タスク（IPC 接続の完成）                                                       |
| 仕様書       | docs/30-workflows/p03-par-STREAM-002/                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-STREAM-001 で `createSkill()` に `onProgress` 引数が追加されたが、`skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラー（:276）がこの引数を渡していないため、IPC メッセージが送信されない。

### 1.2 問題点・課題

`SKILL_CREATOR_CREATE` ハンドラーは `skillCreatorService.createSkill(options)` を呼び出すだけで、`onProgress` コールバックを渡していない。結果として `sendSkillCreatorProgress()` は依然として呼ばれず、フロント側プログレスバーが更新されない。

また、`SkillCreateWizard.tsx` の `streaming` prop が `GenerateStep` に正しく渡されているか確認が必要。

### 1.3 放置した場合の影響

- TASK-SW-STREAM-001 の実装が IPC 接続なしで無用化する
- ユーザーはスキル作成中に進捗フィードバックを得られない

---

## 2. 何を達成するか（What）

### 2.1 目的

`SKILL_CREATOR_CREATE` ハンドラー（:276）の `createSkill()` 呼び出しに `onProgress` コールバックを接続し、`sendSkillCreatorProgress(mainWindow, progress)` を実際に送信する。

### 2.2 最終ゴール

- `:276` の `createSkill(options)` が `createSkill(options, (p) => sendSkillCreatorProgress(mainWindow, p))` に変更されている
- スキル作成中にフロント側の `useStreamingProgress` が IPC メッセージを受信し、プログレスバーが5段階で更新される
- `SkillCreateWizard.tsx` で `streaming` prop が `GenerateStep` に渡されていることを確認済み

### 2.3 スコープ

**含むもの**:

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（:276 の呼び出し箇所修正）
- `apps/desktop/src/renderer/components/skill-creator/SkillCreateWizard.tsx`（streaming prop 接続確認）
- E2E 動作確認（コメントまたはスクリーンショット）

**含まないもの**:

- `createSkill()` シグネチャ変更（TASK-SW-STREAM-001 の担当）
- IPC チャンネル定義の変更

### 2.4 成果物

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（onProgress 接続修正）
- `apps/desktop/src/renderer/components/skill-creator/SkillCreateWizard.tsx`（streaming prop 確認・修正）

---

## 3. 苦戦箇所（Lessons Learned）

### 3.1 ハンドラーと Service の責務境界の曖昧さ

「IPC に送る処理をどこに置くか」が設計上の迷いどころ。Service 内で直接 IPC 送信すると Service が IPC に依存し、テストが困難になる。コールバックでハンドラーに委譲する設計が責務分離の観点で正しい。

**対処法**: Service はビジネスロジックのみを持ち、IPC 通信はハンドラー側のコールバックで行う設計パターンを採用する。

### 3.2 mainWindow の null チェック

`sendSkillCreatorProgress(mainWindow, progress)` で `mainWindow` が null の場合にエラーとならないよう、コールバック内でのガードが必要。

**対処法**: ハンドラー内で `mainWindow` の存在確認後にコールバックを設定するか、`sendSkillCreatorProgress` 内に null ガードを追加する。
