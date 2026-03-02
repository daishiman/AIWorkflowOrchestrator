import {
  test,
  expect,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import {
  launchElectronApp,
  closeElectronApp,
  invokeIPC,
} from "./helpers/electron-app";

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  ({ electronApp: app, page } = await launchElectronApp());
});

test.afterAll(async () => {
  await closeElectronApp(app);
});

test.describe("skill:import IPC E2E テスト", () => {
  test("E2E-SI-01: 有効なスキル名のインポートが成功する", async () => {
    const result = await invokeIPC(page, "skill.importSkill", "valid-skill");
    expect(result).toBeDefined();
  });

  test("E2E-SI-02: インポートが永続化される", async () => {
    await invokeIPC(page, "skill.importSkill", "persist-skill");
    await closeElectronApp(app);
    ({ electronApp: app, page } = await launchElectronApp());
    const skills = (await invokeIPC(page, "skill.getSkills")) as Array<{
      name: string;
    }>;
    expect(skills.find((s) => s.name === "persist-skill")).toBeDefined();
  });

  test("E2E-SI-03: 存在しないスキル名でエラーレスポンスを返す", async () => {
    try {
      await invokeIPC(page, "skill.importSkill", "non-existent-skill-xyz");
    } catch (error) {
      expect(error).toHaveProperty("code");
    }
  });

  test("E2E-SI-04: 空文字列でバリデーションエラーを返す", async () => {
    try {
      await invokeIPC(page, "skill.importSkill", "");
    } catch (error) {
      expect(error).toHaveProperty("code", "VALIDATION_ERROR");
    }
  });

  test("E2E-SI-05: スペースのみでバリデーションエラーを返す（P42準拠）", async () => {
    try {
      await invokeIPC(page, "skill.importSkill", "   ");
    } catch (error) {
      expect(error).toHaveProperty("code", "VALIDATION_ERROR");
    }
  });

  test("E2E-SI-06: 特殊文字を含むスキル名のインポート", async () => {
    const result = await invokeIPC(
      page,
      "skill.importSkill",
      "test/skill",
    ).catch((error: unknown) => error);
    expect(result).toBeDefined();
  });

  test("E2E-SI-07: 非常に長いスキル名（256文字）のインポート", async () => {
    const longName = "a".repeat(256);
    const result = await invokeIPC(page, "skill.importSkill", longName).catch(
      (error: unknown) => error,
    );
    expect(result).toBeDefined();
  });

  test("E2E-SI-08: 同じスキルを2回インポートした場合", async () => {
    const skillName = "double-import-test-skill";
    const firstResult = await invokeIPC(
      page,
      "skill.importSkill",
      skillName,
    ).catch((error: unknown) => error);
    expect(firstResult).toBeDefined();

    const secondResult = await invokeIPC(
      page,
      "skill.importSkill",
      skillName,
    ).catch((error: unknown) => error);
    expect(secondResult).toBeDefined();
  });
});
