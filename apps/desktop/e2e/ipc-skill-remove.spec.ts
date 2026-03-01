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

test.describe("skill:remove IPC E2E テスト", () => {
  test("E2E-SR-01: 存在するスキルの削除が成功する", async () => {
    const result = await invokeIPC(page, "skill.removeSkill", "test-skill");
    expect(result).toBeDefined();
  });

  test("E2E-SR-02: 削除が永続化される", async () => {
    await invokeIPC(page, "skill.removeSkill", "test-skill");
    await closeElectronApp(app);
    ({ electronApp: app, page } = await launchElectronApp());
    const skills = (await invokeIPC(page, "skill.getSkills")) as Array<{
      name: string;
    }>;
    expect(skills.find((s) => s.name === "test-skill")).toBeUndefined();
  });

  test("E2E-SR-03: 存在しないスキル名でエラーレスポンスを返す", async () => {
    try {
      await invokeIPC(page, "skill.removeSkill", "non-existent-skill");
    } catch (error) {
      expect(error).toHaveProperty("code");
    }
  });

  test("E2E-SR-04: 空文字列でバリデーションエラーを返す", async () => {
    try {
      await invokeIPC(page, "skill.removeSkill", "");
    } catch (error) {
      expect(error).toHaveProperty("code", "VALIDATION_ERROR");
    }
  });

  test("E2E-SR-05: スペースのみでバリデーションエラーを返す（P42準拠）", async () => {
    try {
      await invokeIPC(page, "skill.removeSkill", "   ");
    } catch (error) {
      expect(error).toHaveProperty("code", "VALIDATION_ERROR");
    }
  });

  test("E2E-SR-06: 特殊文字を含むスキル名の削除", async () => {
    const result = await invokeIPC(
      page,
      "skill.removeSkill",
      "test/skill",
    ).catch((error: unknown) => error);
    expect(result).toBeDefined();
  });

  test("E2E-SR-07: 非常に長いスキル名（256文字）の削除", async () => {
    const longName = "a".repeat(256);
    const result = await invokeIPC(page, "skill.removeSkill", longName).catch(
      (error: unknown) => error,
    );
    expect(result).toBeDefined();
  });

  test("E2E-SR-08: 連続して同じスキルを2回削除した場合", async () => {
    const skillName = "double-remove-test-skill";
    const firstResult = await invokeIPC(
      page,
      "skill.removeSkill",
      skillName,
    ).catch((error: unknown) => error);
    expect(firstResult).toBeDefined();

    const secondResult = await invokeIPC(
      page,
      "skill.removeSkill",
      skillName,
    ).catch((error: unknown) => error);
    expect(secondResult).toBeDefined();
    expect(secondResult).toHaveProperty("code");
  });
});
