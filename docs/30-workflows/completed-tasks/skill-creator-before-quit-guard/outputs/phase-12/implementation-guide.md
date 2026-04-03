# Phase 12: implementation-guide

## Part 1: 初学者向けの説明

before-quit guard は、「引っ越しの荷物を運んでいる途中に、いきなり家の電源を切らないようにする仕組み」です。

スキル作成は、裏側で少し時間のかかる作業が進みます。もしその途中でアプリを閉じると、作業が半分だけ終わってしまうことがあります。そこで、終了しようとしたときに「本当にやめますか?」と確認して、必要なら止めるのが before-quit guard です。

`app.exit(0)` は、アプリをすぐに終わらせる命令です。これは速い一方で、途中の作業を待たずに終わるので、保存しきれていないデータが残るおそれがあります。

今回はそのリスクを知ったうえで、あえて `app.exit(0)` を使う設計にしました。理由は、ユーザーが「中断して終了」を選んだ時点で、すぐ終わること自体を望んでいるからです。加えて、今回のスコープは graceful shutdown ではなく、終了前の確認と記録に絞っているためです。

## Part 2: 開発者向けの説明

### 主要型と API

```ts
type BeforeQuitGuardDeps = {
  app: App;
  dialog: Dialog;
  facade: RuntimeSkillCreatorFacade;
};

export const registerBeforeQuitGuard = (
  deps: BeforeQuitGuardDeps,
): (() => void) => {
  // ...
};

hasRunningExecution(): boolean;

execute(planResult, authMode, apiKey): Promise<SkillExecuteResponse>;
```

### 実装契約

- `execute()` は `activeExecutionCount` を増減する
- `hasRunningExecution()` は `activeExecutionCount > 0` を返す
- `registerBeforeQuitGuard()` は `before-quit` イベントを購読し、cleanup 関数を返す
- `dialog.showMessageBox()` は固定文言の警告ダイアログを表示する
- `response === 0` のときのみ `app.exit(0)` を呼ぶ
- `dialog` が reject した場合は `console.warn()` で記録する

### 使用例

```ts
const cleanup = registerBeforeQuitGuard({
  app,
  dialog,
  facade,
});

// 画面破棄やアプリ終了時
cleanup();
```

### 既知の制限

- `app.exit(0)` は即時終了なので、LLM への graceful shutdown 要求は送られない
- そのため、途中状態を完全に待機して閉じる仕様は別タスクへ分離する

### 変更の要点

- before-quit 判定は `RuntimeSkillCreatorFacade.hasRunningExecution()` に集約した
- UI 側には処理を持たせず、main process で完結させた
- 追加テストは既存ファイルに寄せて、重複ファイルを作らない方針を採用した
