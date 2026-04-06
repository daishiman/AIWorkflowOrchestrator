# Phase 1: 要件定義 -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase番号  | 1                  |
| 機能名     | sdk-session-bridge |
| タスクID   | TASK-SDK-SC-01     |
| 作成日     | 2026-04-02         |
| 依存 Phase | なし（起点）       |
| 依存タスク | なし               |

## 目的

`@anthropic-ai/claude-agent-sdk` の `query()` API を利用して既存の `skill-creator` スキルを呼び出し、スキルが発行する `UserInput` ツールコールを Electron IPC 経由で Renderer に転送するブリッジの要件を定義する。

## 実行タスク

### Task 1-1: 現状調査

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` を読み込み、現行の実装を記録する
- `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts` を読み込み、SDKメッセージ変換の仕組みを確認する
- `packages/shared/src/types/skillCreator.ts` を読み込み、既存型定義を確認する
- `packages/shared/src/ipc/channels.ts` を読み込み、既存チャネル定義を確認する
- `.claude/skills/skill-creator/SKILL.md` を読み込み、スキルの UserInput ツールコール仕様を確認する

### Task 1-2: 機能要件定義

#### FR-001: SDKセッション管理

`@anthropic-ai/claude-agent-sdk` の `query()` API を使って既存の `/skill-creator` スキルを呼び出す。

- `SkillCreatorSdkSession` クラスが `query()` API のセッションライフサイクルを管理する
- セッション状態は `running / awaiting-input / completed / error` の4状態を持つ
- セッションIDで複数セッションを識別可能にする
- タイムアウト: 30秒（ユーザー入力待ちで応答がない場合に `error` 状態へ遷移）

#### FR-002: UserInputブリッジ

SDK セッションが `UserInput` ツールコールを発行したとき、IPC 経由で Renderer に転送する。

対応する UserInput 種別（5種）:

| 種別            | 説明                           |
| --------------- | ------------------------------ |
| `single_select` | 単一選択（ラジオボタン）       |
| `multi_select`  | 複数選択（チェックボックス）   |
| `free_text`     | 自由入力（テキストフィールド） |
| `secret`        | パスワード入力（マスク表示）   |
| `confirm`       | 確認（はい/いいえ）            |

#### FR-003: IPCチャネル定義

以下の5チャネルを `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_SESSION_CHANNELS` 定数として追加する:

| チャネル名                        | 方向            | 説明                     |
| --------------------------------- | --------------- | ------------------------ |
| `skill-creator:start-session`     | Renderer → Main | セッション開始リクエスト |
| `skill-creator:question-received` | Main → Renderer | UserInput質問イベント    |
| `skill-creator:answer`            | Renderer → Main | ユーザー回答送信         |
| `skill-creator:session-complete`  | Main → Renderer | セッション完了通知       |
| `skill-creator:session-error`     | Main → Renderer | セッションエラー通知     |

#### FR-004: セッション状態管理

セッション状態を `ISkillCreatorSessionState` インターフェースで型定義する:

```typescript
interface ISkillCreatorSessionState {
  sessionId: string;
  status: "running" | "awaiting-input" | "completed" | "error";
  currentQuestion?: UserInputQuestion;
  result?: string;
  error?: string;
  startedAt: Date;
  updatedAt: Date;
}
```

### Task 1-3: 非機能要件定義

| 項目           | 要件                                                          |
| -------------- | ------------------------------------------------------------- |
| 型安全性       | TypeScript strict モード準拠、any 型禁止                      |
| エラー処理     | セッションエラーは `session-error` イベントで Renderer に通知 |
| 後方互換性     | 既存の `SkillCreatorWorkflowEngine` の責務を侵害しない        |
| テスタビリティ | DI（依存性注入）ベースの設計でモック可能にする                |
| セキュリティ   | API キーをログに出力しない。IPC 経由でレンダラーに送出しない  |

### Task 1-4: 受入基準定義

| ID    | 受入基準                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------- |
| AC-01 | `SkillCreatorSdkSession.startSession()` が SDK の `query()` API を呼び出すこと                  |
| AC-02 | SDK が `UserInput` ツールコールを発行したとき、`question-received` IPC イベントが発行されること |
| AC-03 | `sendAnswer()` 呼び出しで SDK セッションに回答が注入されること                                  |
| AC-04 | セッション完了時に `session-complete` IPC イベントが発行されること                              |
| AC-05 | セッションエラー時に `session-error` IPC イベントが発行されること                               |
| AC-06 | IPC ハンドラーが正しく登録・解除されること（メモリリーク防止）                                  |

### Task 1-5: スコープ外の明記

以下は本タスクのスコープ外とする:

- Renderer 側の UI コンポーネント実装（別タスクで対応）
- `SkillCreatorWorkflowEngine` の変更（責務境界を維持）
- AskUserQuestion 以外のツールコール処理（Deferred Tool 対応は Phase 6 拡充で対応）
- セッション永続化（インメモリ管理のみ）
- 複数同時セッションの負荷テスト

## 参照資料

| 資料名                          | パス                                                                   |
| ------------------------------- | ---------------------------------------------------------------------- |
| skill-creator スキル定義        | `.claude/skills/skill-creator/SKILL.md`                                |
| 既存 SkillCreatorWorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` |
| SDK メッセージ正規化            | `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`       |
| 共有型定義                      | `packages/shared/src/types/skillCreator.ts`                            |
| IPCチャネル定義                 | `packages/shared/src/ipc/channels.ts`                                  |
| タスク概要                      | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md`    |

## 成果物

| 成果物                   | パス                                                                               | 形式     |
| ------------------------ | ---------------------------------------------------------------------------------- | -------- |
| 要件定義書（本ファイル） | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-1-requirements.md` | Markdown |

## 完了条件

- [ ] 既存の `SkillCreatorWorkflowEngine` の実装を調査した
- [ ] `skill-creator` スキルの `UserInput` ツールコール仕様を確認した
- [ ] FR-001（SDKセッション管理）要件を定義した
- [ ] FR-002（UserInputブリッジ、5種）要件を定義した
- [ ] FR-003（IPCチャネル、5チャネル）要件を定義した
- [ ] FR-004（セッション状態管理）要件を定義した
- [ ] 受入基準 AC-01 から AC-06 を定義した
- [ ] スコープ外事項を明記した

## 次の Phase

Phase 2: 設計（`phase-2-design.md`）
