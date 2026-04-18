# IPC チャンネル SKILL_CREATOR_CANCEL 定数追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2223
task_id: TASK-SW-CANCEL-001
status: completed
priority: high
scale: tiny
task_type: FEATURE
```

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-SW-CANCEL-001                                       |
| タスク名     | cancel-001-add-skill-creator-cancel-channel              |
| 分類         | 機能追加                                                 |
| 対象機能     | IPC チャンネル - SKILL_CREATOR_CANCEL チャンネル定数追加 |
| 優先度       | 高（`priority:high`）                                    |
| 見積もり規模 | 極小（`scale:tiny`）                                     |
| ステータス   | 未実施（`status:open`）                                  |
| 依存タスク   | なし                                                     |
| 発見元       | skill-create-flow-gaps 分析（2026-04-16）                |
| 発見日       | 2026-04-16                                               |
| タスク分類   | FEATURE タスク（キャンセル IPC 基盤整備）                |
| 仕様書       | docs/30-workflows/p04-par-CANCEL-001/                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`useCancelGeneration.ts:24-31` の `cancelGeneration()` は renderer 内の `AbortController.abort()` を呼び出すだけで、IPC チャンネルを通じてメインプロセスに通知する仕組みが実装されていない。

### 1.2 問題点・課題

`skillCreatorHandlers.ts` に `SKILL_CREATOR_CANCEL` チャンネルのハンドラー登録がなく、`packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` にもチャンネル定数が未定義。これにより Renderer からメインプロセスへのキャンセル通知経路が存在しない。

コメントの「メインプロセス側も中断される」は将来の意図を記したメモであり、実際には実装されていない。

### 1.3 放置した場合の影響

- ユーザーがキャンセルボタンを押してもメインプロセス側のスキル作成処理が継続される
- スキル作成が完了してから UI がキャンセル状態を示すという矛盾が発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

`packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を追加する。キャンセル IPC 連携の最初のステップ。

### 2.2 最終ゴール

- `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` が追加されている
- TypeScript の型チェックが通る
- 既存のチャンネル定数への影響なし

### 2.3 スコープ

**含むもの**:

- `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` への 1 行追加

**含まないもの**:

- ハンドラー実装（後続タスクの担当）
- Preload 側の対応（TASK-SW-CANCEL-002 の担当）
- `AbortController` 連携（別タスク）

### 2.4 成果物

- `packages/shared/src/ipc/channels.ts`（`SKILL_CREATOR_CANCEL` 定数追加）

---

## 3. 苦戦箇所（Lessons Learned）

### 3.1 renderer 側キャンセルとメインプロセス側キャンセルの断絶

`AbortController.abort()` を renderer 内で呼んでもメインプロセスの非同期処理には何も影響しない。Electron の IPC 通信モデルでは、renderer とメインはプロセスが分離しているため、明示的な IPC メッセージが必要。

**対処法**: キャンセル処理は必ず「renderer → IPC → main」の通信経路を経由させ、main 側で `AbortSignal` を処理する設計にする。

### 3.2 チャンネル定数の分類（RUNTIME vs 通常）

`SKILL_CREATOR_RUNTIME_CHANNELS` に含めるべきか、別のカテゴリに入れるべきか判断が必要。実行時のキャンセルは runtime 操作なので `RUNTIME_CHANNELS` が適切。

**対処法**: IPC チャンネルのカテゴリ分類を事前に確認し、`invoke` か `on` かも含めて設計段階で決定する。
