# TASK-SW-CANCEL-003: 実装ガイド

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 作成日     | 2026-04-15                        |
| ステータス | completed                         |

---

## 1. 中学生レベルの概念説明

### 「工場の管理室」で考えるキャンセル処理

Electron アプリを「工場」に例えてみましょう。

- **Renderer（画面）** = 工場の「受付カウンター」。ユーザーが操作する場所です。
- **Preload（橋）** = 受付カウンターと管理室をつなぐ「内線電話」です。
- **Main（メインプロセス）** = 工場の「管理室」。実際に重い作業（スキル生成）を指示する場所です。
- **SkillCreatorService** = 管理室にいる「作業担当者」です。

**キャンセルの流れ（CANCEL-001〜003 完成後）**:

1. ユーザーが画面（Renderer）の「キャンセル」ボタンを押す。
2. 画面が内線電話（Preload）を通じて「作業を止めてください！」と管理室（Main）に連絡する。
3. 管理室の受付係（`SKILL_CREATOR_CANCEL` ハンドラー）が連絡を受け取る。
4. 受付係が作業担当者（`SkillCreatorService`）に「今すぐ止めて！」と伝える（`cancelCurrentOperation()` を呼び出す）。
5. 作業担当者が現在の作業を中断する（`AbortController.abort()` を実行する）。

**CANCEL-003 で実装した部分**は、手順 3〜5 の「管理室の受付係と作業担当者」の部分です。これがなければ、いくら「止めて」と連絡しても誰も受け取らず、作業は止まりません。

---

## 2. `cancelCurrentOperation()` の使用方法と動作フロー

### 実装箇所

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

### プロパティ

```typescript
/** TASK-SW-CANCEL-003: 実行中の操作を中断するための AbortController */
private currentAbortController: AbortController | null = null;
```

このプロパティは「今どの作業が進行中か」を追跡するための目印です。スキル生成が開始されると `AbortController` インスタンスがセットされ、完了またはキャンセル後に `null` にリセットされます。

### メソッド

```typescript
/**
 * IPC チャンネル SKILL_CREATOR_CANCEL から呼び出される
 */
public cancelCurrentOperation(): void {
  this.currentAbortController?.abort();
  this.currentAbortController = null;
}
```

### 動作フロー

```
cancelCurrentOperation() 呼び出し
  ↓
currentAbortController が存在するか？
  ├── Yes: abort() を呼び出す → 実行中の非同期処理にキャンセルシグナルを送信
  └── No: 何もしない（冪等性を保証）
  ↓
currentAbortController を null にリセット
  ↓
完了（SkillCreatorService は次の操作を受け付けられる状態に戻る）
```

### 生成中との連携

スキル生成開始時（`createSkill()` / `runCreateWorkflow()` 内）では以下のように `AbortController` をセットします:

```typescript
const abortController = new AbortController();
this.currentAbortController = abortController;
// ... 非同期処理に abortController.signal を渡す ...
// 完了時にリセット
if (this.currentAbortController === abortController) {
  this.currentAbortController = null;
}
```

これにより、複数のキャンセル呼び出しが来ても最後に開始した処理のみを対象にするレース条件が防止されます。

---

## 3. `SKILL_CREATOR_CANCEL` ハンドラーの動作フロー

### 実装箇所

**ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

### ハンドラー登録コード

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, async () => {
  skillCreatorService.cancelCurrentOperation();
});
```

### 動作フロー

```
Renderer が ipcRenderer.invoke('skill-creator:cancel') を呼び出す
  ↓
Electron IPC が SKILL_CREATOR_CANCEL チャンネルを通じてハンドラーに届ける
  ↓
ipcMain.handle() のコールバックが実行される
  ↓
skillCreatorService.cancelCurrentOperation() を呼び出す
  ↓
Promise が解決（void を返す）
  ↓
Renderer に成功レスポンスが返る
```

### チャンネル名

`IPC_CHANNELS.SKILL_CREATOR_CANCEL` の値は `'skill-creator:cancel'` です（`preload/channels.ts` で定義）。

---

## 4. `unregisterSkillCreatorHandlers()` への追加の重要性（メモリリーク防止）

### なぜ unregister が必要か

Electron の `ipcMain.handle()` で登録したハンドラーは、**明示的に `removeHandler()` を呼び出すまで削除されません**。アプリのウィンドウが閉じられたり再作成されたりしても、ハンドラーはメインプロセスのメモリに残り続けます。

登録したハンドラーを解除しないと以下の問題が発生します:

- **メモリリーク**: ハンドラーが参照する `skillCreatorService` オブジェクトもガベージコレクションされない。
- **二重登録エラー**: テストや再起動時に `ipcMain.handle()` を再度呼び出すと「チャンネルは既に登録済み」というエラーが発生する。

### 実装コード

```typescript
export function unregisterSkillCreatorHandlers(): void {
  // ... 既存のハンドラー解除 ...
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL); // CANCEL-003 で追加
}
```

### 呼び出しタイミング

`unregisterSkillCreatorHandlers()` はウィンドウが閉じられるとき（`app.on('window-all-closed')`）またはテストのクリーンアップ（`afterEach`）で呼び出されます。

---

## 5. IPC 4層（CANCEL-001〜003）の完成状態

キャンセル機能は IPC の 4 層に分けて段階的に実装されました。CANCEL-003 の完了をもって **層 1〜3 が完成**し、エンドツーエンドのキャンセル経路が確立しました。

### IPC 4層の全体像

```
層4: Renderer（画面）  ← CANCEL-001 で実装
  ↓ ipcRenderer.invoke()
層3.5: Preload（橋）   ← CANCEL-002 で実装
  ↓ contextBridge 経由
層3: Main ハンドラー   ← CANCEL-003 で実装（本タスク）
  ↓ ipcMain.handle()
層2: Service（実行）   ← CANCEL-003 で実装（本タスク）
  ↓ AbortController
層1: 実際の処理中断    ← CANCEL-004 で完成予定（AbortSignal 伝播）
```

### 各タスクの担当範囲

| タスク     | 担当層                    | 実装内容                                                      |
| ---------- | ------------------------- | ------------------------------------------------------------- |
| CANCEL-001 | Renderer（画面）          | `useCancelGeneration` フック、キャンセルボタン UI             |
| CANCEL-002 | Preload（橋）             | `cancelGeneration()` メソッドを `contextBridge` に公開        |
| CANCEL-003 | Main ハンドラー + Service | `SKILL_CREATOR_CANCEL` ハンドラー、`cancelCurrentOperation()` |
| CANCEL-004 | Service 内部（実行中断）  | `AbortSignal` を各非同期処理（ScriptExecutor 等）に伝播させる |

---

## 6. CANCEL-004 への引き継ぎ情報

### 現状の課題

CANCEL-003 の実装により、`cancelCurrentOperation()` が呼び出されると `AbortController.abort()` が実行されます。しかし、`abort()` が呼ばれたことを **ScriptExecutor や内部の非同期処理が検知して実際に停止する仕組み**はまだ実装されていません。

### CANCEL-004 でやること

1. `ScriptExecutor.execute()` に `AbortSignal` を渡すインターフェースを追加する。
2. 子プロセス（`child_process.spawn`）に `signal` オプションとして渡し、`abort()` 時に強制終了させる。
3. `createSkill()` 内の各非同期ステップで `signal.aborted` をチェックし、早期リターンするロジックを追加する。

### 引き継ぎ時の注意点

- `currentAbortController` は `private` なので、テスト時は `cancelCurrentOperation()` を通じて間接的にテストする。
- `AbortController` は一度 `abort()` すると再利用できない。新しい操作が始まるたびに新しいインスタンスを生成すること（現在の実装は既にこの設計になっている）。
- キャンセル後に部分的に作成されたスキルディレクトリが残存する問題は **TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001** として記録済み（別タスク）。
