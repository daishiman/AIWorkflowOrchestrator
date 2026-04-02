/**
 * beforeQuitGuard - アプリ終了前にスキル実行中を確認するガード
 *
 * TASK-NOTIFICATION-SERVICE-001
 * AC-7: before-quit ガードで hasRunningExecution() チェック
 *
 * `ipc/index.ts` から呼び出し、戻り値の解除関数を unregisterAllIpcHandlers() で呼ぶ。
 */

import type { App, Dialog } from "electron";
import type { RuntimeSkillCreatorFacade } from "../services/runtime/RuntimeSkillCreatorFacade";

type BeforeQuitGuardDeps = {
  app: App;
  dialog: Dialog;
  facade: RuntimeSkillCreatorFacade;
};

export const registerBeforeQuitGuard = ({
  app,
  dialog,
  facade,
}: BeforeQuitGuardDeps): (() => void) => {
  const handler = (event: Electron.Event) => {
    if (!facade.hasRunningExecution()) {
      return;
    }

    event.preventDefault();
    dialog
      .showMessageBox({
        type: "warning",
        buttons: ["中断して終了", "キャンセル"],
        message: "スキル作成が進行中です",
        detail: "スキル作成を中断してアプリを終了しますか？",
      })
      .then(({ response }) => {
        if (response === 0) {
          app.exit(0);
        }
      })
      .catch((error: unknown) => {
        console.warn(
          "[beforeQuitGuard] Failed to show confirmation dialog",
          error,
        );
      });
  };

  app.on("before-quit", handler);
  return () => app.removeListener("before-quit", handler);
};
