# 実装ガイド: TASK-SW-CANCEL-004 (skill-creator-cancel-renderer-hook)

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| Phase      | 12 成果物                          |
| 作成日     | 2026-04-15                         |
| ステータス | completed                          |

---

## 1. 中学生レベルの概念説明（まずここから読んでください）

### ゲームの「中断ボタン」の比喩

スキル生成ウィザードを使っているとき、「キャンセル」ボタンを押すとスキルの生成を途中でやめることができます。

この「キャンセルボタン」のしくみは、今回の CANCEL-001〜004 の4つの作業で順番に作られました。

**CANCEL-001〜004 が構築したもの——「連絡経路」のたとえ**

想像してみてください。あなたは学校の教室（画面）にいて、工場（メインプロセス）に「作業を止めて！」と伝えたいとします。しかし、教室から工場に直接声は届きません。なので、4つの「連絡中継ポスト」を作りました。

| 番号 | タスク     | 「連絡ポスト」の役割                                  |
| ---- | ---------- | ----------------------------------------------------- |
| 1    | CANCEL-001 | 「CANCEL という連絡の名前」を決めた（チャンネル定数） |
| 2    | CANCEL-002 | 「教室側の出口窓口」を作った（Preload API）           |
| 3    | CANCEL-003 | 「工場側の受付窓口」を作った（Main ハンドラー）       |
| 4    | CANCEL-004 | 「キャンセルボタンを押したとき出口に連絡する」を実装  |

CANCEL-004（今回）が最後のピースです。キャンセルボタン（`useCancelGeneration`）が、教室の出口窓口（Preload API）に「キャンセルしてください」と伝えるようになりました。これで4層の連絡経路が全部つながりました。

---

## 2. `useCancelGeneration.cancelGeneration()` の動作フロー（完全版）

### 修正前（CANCEL-004 実装前）

```
ユーザーがキャンセルボタン押下
    |
    v
cancelGeneration()
    |
    +-- AbortController.abort()   ← ローカルの AbortSignal を中断
    +-- setStage("cancelled")     ← 画面の表示を「キャンセル済み」に変える
    |
    (メインプロセスには何も伝わらない → 工場は作業を続けている)
```

### 修正後（CANCEL-004 実装後）

```
ユーザーがキャンセルボタン押下
    |
    v
cancelGeneration()  [apps/desktop/src/renderer/hooks/useCancelGeneration.ts]
    |
    +-- 1. abortControllerRef.current?.abort()   ← ローカル中断
    +-- 2. abortControllerRef.current = null      ← 参照クリア
    +-- 3. setStage("cancelled")                  ← UI 表示更新
    +-- 4. await window.skillCreatorAPI?.cancelGeneration?.()  ← IPC 経由通知
              |
              v
         [Preload: skill-creator-api.ts]
         safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)
              |
              v
         [Main: skillCreatorHandlers.ts]
         ipcMain.handle("skill-creator:cancel", ...)
              |
              v
         [SkillCreatorService.cancelCurrentOperation()]
              |
              v
         [ScriptExecutor] AbortController.abort() → スクリプト中断
```

---

## 3. IPC 4層の完全接続図（CANCEL-001〜004 の全体像）

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CANCEL-001: チャンネル定数定義（shared）                               │
│  packages/shared/src/ipc/channels.ts                                    │
│  SKILL_CREATOR_CANCEL = "skill-creator:cancel"                          │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ 定数を参照
┌─────────────────────────────▼───────────────────────────────────────────┐
│  CANCEL-002: Preload API 追加                                            │
│  apps/desktop/src/preload/channels.ts      ← ホワイトリスト追加          │
│  apps/desktop/src/preload/skill-creator-api.ts                          │
│  cancelGeneration: () => safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)  │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ ipcRenderer.invoke
┌─────────────────────────────▼───────────────────────────────────────────┐
│  CANCEL-003: Main ハンドラー追加                                         │
│  apps/desktop/src/main/ipc/skillCreatorHandlers.ts                      │
│  ipcMain.handle("skill-creator:cancel", async (event) => {              │
│    await skillCreatorService.cancelCurrentOperation();                   │
│    return { success: true };                                             │
│  })                                                                      │
│                                                                          │
│  apps/desktop/src/main/services/skill/SkillCreatorService.ts            │
│  cancelCurrentOperation() → abortController.abort()                     │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ abort signal
┌─────────────────────────────▼───────────────────────────────────────────┐
│  (ScriptExecutor による実行中断)                                         │
│  apps/desktop/src/main/services/skill/ScriptExecutor.ts                 │
│  AbortController.abort() → 実行中のスクリプトプロセスを強制終了          │
└─────────────────────────────────────────────────────────────────────────┘

                           ↑ 上記を繋ぐトリガー ↑

┌─────────────────────────────────────────────────────────────────────────┐
│  CANCEL-004: Renderer Hook 修正（今回）                                  │
│  apps/desktop/src/renderer/hooks/useCancelGeneration.ts                 │
│  cancelGeneration() が window.skillCreatorAPI.cancelGeneration() を呼ぶ  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. キャンセル処理の E2E フロー説明

### 4.1 各レイヤーの責務

| レイヤー     | ファイル                               | 責務                                      |
| ------------ | -------------------------------------- | ----------------------------------------- |
| Renderer     | `useCancelGeneration.ts`               | UI 状態更新 + IPC 送信トリガー            |
| Preload      | `skill-creator-api.ts` + `channels.ts` | 安全な IPC ブリッジ（ホワイトリスト検証） |
| Main Handler | `skillCreatorHandlers.ts`              | IPC 受信 → Service 呼び出し               |
| Service      | `SkillCreatorService.ts`               | ビジネスロジック（AbortController 管理）  |
| Executor     | `ScriptExecutor.ts`                    | 実際のプロセス中断                        |

### 4.2 エラーハンドリング

`cancelGeneration()` は IPC 失敗時に例外をキャッチして `console.warn` に出力します。これにより、IPC 通信が失敗してもUI側のキャンセル処理（`setStage("cancelled")`）は必ず完了します。

```typescript
try {
  await window.skillCreatorAPI?.cancelGeneration?.();
} catch (error) {
  console.warn("[useCancelGeneration] cancelGeneration IPC failed", error);
}
```

### 4.3 Optional Chaining による安全性

`window.skillCreatorAPI?.cancelGeneration?.()` は Optional Chaining を使用しており、以下のケースで安全にスキップされます:

- `skillCreatorAPI` が未定義（テスト環境など）
- `cancelGeneration` メソッドが未定義（古いバージョンとの互換性）

---

## 5. CANCEL シリーズの完成により実現したこと

CANCEL-004 の完成により、ユーザーがキャンセルボタンを押したとき:

1. 画面の表示が即座に「キャンセル済み」に変わる
2. バックグラウンドのスクリプト実行プロセスが中断される
3. 中断エラーは適切にハンドリングされ、不整合なUI状態にならない

これにより、ユーザーエクスペリエンスが向上し、不要なリソース消費が防止されます。

---

## 6. 残課題（未タスク）

### AbortSignal の createSkill() への直接接続

現在、`cancelCurrentOperation()` は `AbortController.abort()` を呼び出しますが、`createSkill()` の内部でその `AbortSignal` を受け取って中断する実装は未完成です。詳細は `unassigned-task-detection.md` を参照してください。

**タスクID候補**: `TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001`
