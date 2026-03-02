import { _electron, type ElectronApplication, type Page } from "playwright";

/**
 * Electronアプリを起動し、最初のウィンドウのPageを返す。
 * 呼び出し元は必ず closeElectronApp() で終了すること。
 *
 * @returns electronApp と page のペア
 */
export async function launchElectronApp(): Promise<{
  electronApp: ElectronApplication;
  page: Page;
}> {
  const electronApp = await _electron.launch({
    args: ["."],
    cwd: process.cwd(),
    timeout: 60_000,
    env: {
      ...process.env,
      NODE_ENV: "test",
      ELECTRON_IS_E2E: "true",
    },
  });

  const page = await electronApp.firstWindow();
  await page.waitForLoadState("domcontentloaded");

  return { electronApp, page };
}

/**
 * Electronアプリを安全に終了する。
 * afterEach で必ず呼び出し、ゾンビプロセスを防止する。
 *
 * @param electronApp - 終了するElectronApplicationインスタンス
 */
export async function closeElectronApp(
  electronApp: ElectronApplication,
): Promise<void> {
  await electronApp.close();
}

/**
 * Preload API経由でIPC通信を実行し、結果を返す。
 * window.electronAPI 配下のネストされたAPIパスをサポートする。
 *
 * 使用例: invokeIPC(page, "skill.remove", "my-skill")
 *   -> window.electronAPI.skill.remove("my-skill") を実行
 *
 * @param page - RendererウィンドウのPage
 * @param apiPath - window.electronAPI 配下のドット区切りAPIパス
 * @param args - APIに渡す引数（可変長）
 * @returns IPC通信の結果（成功時）またはエラー（失敗時は reject）
 */
export async function invokeIPC(
  page: Page,
  apiPath: string,
  ...args: unknown[]
): Promise<unknown> {
  return page.evaluate(
    ({ path, invokeArgs }) => {
      const parts = path.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let api: any = (window as any).electronAPI;
      for (const part of parts) {
        if (api === undefined || api === null) {
          throw new Error(
            `window.electronAPI.${path} is not available: ${part} is ${api}`,
          );
        }
        api = api[part];
      }
      if (typeof api !== "function") {
        throw new Error(`window.electronAPI.${path} is not a function`);
      }
      return api(...invokeArgs);
    },
    { path: apiPath, invokeArgs: args },
  );
}
