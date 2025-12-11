import { describe, it, expect, beforeEach } from "vitest";
import { Execution } from "./execution";

describe("Execution Entity", () => {
  describe("create", () => {
    it("デフォルト値で新規実行を作成できる", () => {
      const execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });

      expect(execution.id).toBe("exec-001");
      expect(execution.workflowId).toBe("wf-001");
      expect(execution.status).toBe("pending");
      expect(execution.inputPayload).toBeNull();
      expect(execution.outputPayload).toBeNull();
      expect(execution.errorMessage).toBeNull();
      expect(execution.retryCount).toBe(0);
      expect(execution.startedAt).toBeNull();
      expect(execution.completedAt).toBeNull();
      expect(execution.createdAt).toBeInstanceOf(Date);
    });

    it("入力ペイロード付きで実行を作成できる", () => {
      const inputPayload = { filePath: "/path/to/file.txt" };
      const execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
        inputPayload,
      });

      expect(execution.inputPayload).toEqual(inputPayload);
    });
  });

  describe("start", () => {
    let execution: Execution;

    beforeEach(() => {
      execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });
    });

    it("pendingステータスの実行を開始できる", () => {
      execution.start();

      expect(execution.status).toBe("running");
      expect(execution.startedAt).toBeInstanceOf(Date);
    });

    it("pending以外のステータスから開始しようとするとエラー", () => {
      execution.start();

      expect(() => execution.start()).toThrow(
        "Cannot start execution in running status",
      );
    });
  });

  describe("complete", () => {
    let execution: Execution;

    beforeEach(() => {
      execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });
      execution.start();
    });

    it("runningステータスの実行を完了できる", () => {
      const output = { result: "success", data: [1, 2, 3] };

      execution.complete(output);

      expect(execution.status).toBe("completed");
      expect(execution.outputPayload).toEqual(output);
      expect(execution.completedAt).toBeInstanceOf(Date);
    });

    it("running以外のステータスから完了しようとするとエラー", () => {
      execution.complete({ result: "ok" });

      expect(() => execution.complete({ result: "ok" })).toThrow(
        "Cannot complete execution in completed status",
      );
    });
  });

  describe("fail", () => {
    let execution: Execution;

    beforeEach(() => {
      execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });
      execution.start();
    });

    it("runningステータスの実行を失敗させることができる", () => {
      const errorMessage = "Connection timeout";

      execution.fail(errorMessage);

      expect(execution.status).toBe("failed");
      expect(execution.errorMessage).toBe(errorMessage);
      expect(execution.completedAt).toBeInstanceOf(Date);
    });

    it("running以外のステータスから失敗させようとするとエラー", () => {
      execution.fail("error");

      expect(() => execution.fail("another error")).toThrow(
        "Cannot fail execution in failed status",
      );
    });
  });

  describe("retry", () => {
    let execution: Execution;

    beforeEach(() => {
      execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });
      execution.start();
      execution.fail("Initial failure");
    });

    it("failedステータスの実行をリトライできる", () => {
      execution.retry();

      expect(execution.status).toBe("pending");
      expect(execution.retryCount).toBe(1);
      expect(execution.errorMessage).toBeNull();
      expect(execution.startedAt).toBeNull();
      expect(execution.completedAt).toBeNull();
    });

    it("複数回リトライするとカウントが増加する", () => {
      execution.retry();
      execution.start();
      execution.fail("Second failure");
      execution.retry();

      expect(execution.retryCount).toBe(2);
    });

    it("failed以外のステータスからリトライしようとするとエラー", () => {
      execution.retry();

      expect(() => execution.retry()).toThrow(
        "Cannot retry execution in pending status",
      );
    });
  });

  describe("状態遷移", () => {
    it("正常フロー: pending → running → completed", () => {
      const execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });

      expect(execution.status).toBe("pending");

      execution.start();
      expect(execution.status).toBe("running");

      execution.complete({ success: true });
      expect(execution.status).toBe("completed");
    });

    it("失敗フロー: pending → running → failed", () => {
      const execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });

      execution.start();
      execution.fail("Something went wrong");

      expect(execution.status).toBe("failed");
    });

    it("リトライフロー: pending → running → failed → pending → running → completed", () => {
      const execution = Execution.create({
        id: "exec-001",
        workflowId: "wf-001",
      });

      execution.start();
      execution.fail("First attempt failed");
      execution.retry();

      expect(execution.status).toBe("pending");
      expect(execution.retryCount).toBe(1);

      execution.start();
      execution.complete({ success: true });

      expect(execution.status).toBe("completed");
    });
  });
});
