# TASK-SW-CANCEL-002 実装ガイド

## Part 1: 中学生レベルの説明

### なぜ必要か

スキル作成を止めたいのに、画面から「止めて」と伝える道がないと途中でやめられません。
このタスクは、その「止めて」を安全に伝える入口を preload 側に作るためのものです。

### たとえば

たとえば、学校の職員室に電話するとき、
番号だけ知っていても、校内電話機がその番号にかけられなければ伝言できません。

今回やったことは次の2つです。

1. 電話をかけるための電話機を用意した
2. その番号にかけてよいと名簿へ登録した

### このタスクでできること

| 機能             | 説明                                         | 例                                          |
| ---------------- | -------------------------------------------- | ------------------------------------------- |
| cancelGeneration | 進行中の生成を止める入口を提供する           | `window.skillCreatorAPI.cancelGeneration()` |
| allowlist 登録   | preload からそのチャンネルを呼べるようにする | `IPC_CHANNELS.SKILL_CREATOR_CANCEL`         |

## Part 2: 技術者向け詳細

### current contract

| 対象           | 内容                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| API シグネチャ | `cancelGeneration: () => Promise<IpcResult<void>>`                      |
| 実装           | `safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)`        |
| allowlist      | `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を登録 |

### 使用例

```typescript
const result = await window.skillCreatorAPI.cancelGeneration();

if (!result.success) {
  // Main 側未接続や timeout は IpcResult で扱う
}
```

### エラーハンドリングとエッジケース

| ケース                | 挙動                                                   |
| --------------------- | ------------------------------------------------------ |
| Main ハンドラー未接続 | invoke 自体は走るが成功完了までは保証しない            |
| allowlist 未登録      | preload security gate で失敗する                       |
| UI から未接続         | Renderer 側 task が未実装なら user action まで届かない |

### 設定可能な定数

| 定数                                | 役割                           |
| ----------------------------------- | ------------------------------ |
| `IPC_CHANNELS.SKILL_CREATOR_CANCEL` | cancel invoke のチャンネル定数 |

### Consumer Contract & IPC Compatibility

| 項目               | Before                  | After                      |
| ------------------ | ----------------------- | -------------------------- |
| preload cancel API | なし                    | `Promise<IpcResult<void>>` |
| allowlist          | cancel channel なし     | cancel channel あり        |
| follow-up          | Main/Renderer が別 task | 同じ                       |

### 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`
