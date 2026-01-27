# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 4                         |
| タスクID | TASK-5-1                  |
| タスク名 | SkillAPI 実装（Preload）  |
| 機能名   | skill-import-agent-system |
| 作成日   | 2026-01-27                |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ユニットテスト作成: SkillAPI の各メソッドのテスト
- 統合テスト設計: IPC通信のテスト設計
- 境界値分析: エッジケースのテスト追加

## 参照資料

| 資料名             | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物  |
| 設計書             | `outputs/phase-2/architecture-design.md`     | Phase 2成果物  |
| 設計レビュー       | `outputs/phase-3/design-review-result.md`    | Phase 3成果物  |
| 既存テストパターン | `apps/desktop/src/preload/__tests__/`        | 既存テスト参照 |

---

## テストシナリオ設計

### ユニットテスト

#### SkillAPI.execute

| テストケース                       | 入力                           | 期待結果                        |
| ---------------------------------- | ------------------------------ | ------------------------------- |
| 正常系: 実行リクエストを送信できる | 有効な `SkillExecutionRequest` | `SkillExecutionResponse` が返る |
| 異常系: 無効なリクエストでエラー   | null/undefined                 | エラーがスローされる            |

#### SkillAPI.abort

| テストケース               | 入力                     | 期待結果              |
| -------------------------- | ------------------------ | --------------------- |
| 正常系: 実行を中断できる   | 有効な `executionId`     | `true` が返る         |
| 異常系: 存在しないIDで中断 | 存在しない `executionId` | `false` または エラー |

#### SkillAPI.getExecutionStatus

| テストケース                     | 入力                     | 期待結果               |
| -------------------------------- | ------------------------ | ---------------------- |
| 正常系: 実行状態を取得できる     | 有効な `executionId`     | `ExecutionInfo` が返る |
| 正常系: 存在しないIDでnullが返る | 存在しない `executionId` | `null` が返る          |

#### SkillAPI.onStream

| テストケース                             | 入力                   | 期待結果                   |
| ---------------------------------------- | ---------------------- | -------------------------- |
| 正常系: ストリームを購読できる           | コールバック関数       | クリーンアップ関数が返る   |
| 正常系: メッセージ受信でコールバック実行 | IPC経由のメッセージ    | コールバックが呼び出される |
| 正常系: クリーンアップで購読解除         | クリーンアップ関数呼出 | リスナーが削除される       |

#### SkillAPI.onPermissionRequest

| テストケース                             | 入力                | 期待結果                   |
| ---------------------------------------- | ------------------- | -------------------------- |
| 正常系: 権限リクエストを購読できる       | コールバック関数    | クリーンアップ関数が返る   |
| 正常系: リクエスト受信でコールバック実行 | IPC経由のリクエスト | コールバックが呼び出される |

#### SkillAPI.sendPermissionResponse

| テストケース                 | 入力                             | 期待結果                 |
| ---------------------------- | -------------------------------- | ------------------------ |
| 正常系: 権限応答を送信できる | 有効な `SkillPermissionResponse` | `{success: true}` が返る |

### セキュリティテスト（safeInvoke/safeOn）

| テストケース                                   | 入力             | 期待結果                               |
| ---------------------------------------------- | ---------------- | -------------------------------------- |
| 異常系: 許可されていないチャネルでinvokeエラー | 不正なチャネル名 | `Channel is not allowed` エラー        |
| 異常系: 許可されていないチャネルでonエラー     | 不正なチャネル名 | console.error + 空のクリーンアップ関数 |

---

## 統合テスト設計

### IPC通信テスト

| シナリオカテゴリ   | 検証内容                          | テストファイル                 |
| ------------------ | --------------------------------- | ------------------------------ |
| IPC接続テスト      | Renderer→Preload→Main の通信疎通  | `skill-api.ipc.test.ts`        |
| データフローテスト | execute→stream→complete のフロー  | `skill-api.flow.test.ts`       |
| エラーハンドリング | チャネル拒否時のエラー処理        | `skill-api.error.test.ts`      |
| 権限フロー         | permissionRequest→response の往復 | `skill-api.permission.test.ts` |

### モック設計

```typescript
// ipcRenderer モック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));

// チャネル許可リストのモック
vi.mock("./channels", () => ({
  ALLOWED_INVOKE_CHANNELS: [
    "skill:execute",
    "skill:abort",
    "skill:getStatus",
    "skill:permission:response",
  ],
  ALLOWED_ON_CHANNELS: ["skill:stream", "skill:permission:request"],
  IPC_CHANNELS: {
    SKILL_EXECUTE: "skill:execute",
    SKILL_ABORT: "skill:abort",
    SKILL_GET_STATUS: "skill:getStatus",
    SKILL_STREAM: "skill:stream",
    SKILL_PERMISSION_REQUEST: "skill:permission:request",
    SKILL_PERMISSION_RESPONSE: "skill:permission:response",
  },
}));
```

---

## アーキテクチャ層別テスト

| 層      | テスト観点                           | テストファイル配置                                                 |
| ------- | ------------------------------------ | ------------------------------------------------------------------ |
| Preload | SkillAPI メソッド、safeInvoke/safeOn | `apps/desktop/src/preload/__tests__/skill-api.test.ts`             |
| IPC通信 | チャネル定義、ホワイトリスト         | `apps/desktop/src/preload/__tests__/channels.skill-import.test.ts` |

---

## テストコードテンプレート

```typescript
// apps/desktop/src/preload/__tests__/skill-api.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { skillAPI } from "../skill-api";
import { ipcRenderer } from "electron";

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));

describe("skillAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should send execution request via IPC", async () => {
      const mockResponse = { executionId: "exec-123" };
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(mockResponse);

      const request = { skillName: "test-skill", args: {} };
      const result = await skillAPI.execute(request);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith("skill:execute", request);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("abort", () => {
    it("should abort execution via IPC", async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue(true);

      const result = await skillAPI.abort("exec-123");

      expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        "skill:abort",
        "exec-123",
      );
      expect(result).toBe(true);
    });
  });

  describe("onStream", () => {
    it("should register stream listener and return cleanup function", () => {
      const callback = vi.fn();
      const cleanup = skillAPI.onStream(callback);

      expect(ipcRenderer.on).toHaveBeenCalledWith(
        "skill:stream",
        expect.any(Function),
      );
      expect(typeof cleanup).toBe("function");
    });

    it("should remove listener when cleanup is called", () => {
      const callback = vi.fn();
      const cleanup = skillAPI.onStream(callback);

      cleanup();

      expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
        "skill:stream",
        expect.any(Function),
      );
    });
  });

  describe("onPermissionRequest", () => {
    it("should register permission request listener", () => {
      const callback = vi.fn();
      const cleanup = skillAPI.onPermissionRequest(callback);

      expect(ipcRenderer.on).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.any(Function),
      );
      expect(typeof cleanup).toBe("function");
    });
  });

  describe("sendPermissionResponse", () => {
    it("should send permission response via IPC", async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });

      const response = { requestId: "req-123", allowed: true };
      const result = await skillAPI.sendPermissionResponse(response);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        "skill:permission:response",
        response,
      );
      expect(result).toEqual({ success: true });
    });
  });
});
```

---

## 成果物

| 成果物             | パス                                                   | 説明             |
| ------------------ | ------------------------------------------------------ | ---------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                | 本ドキュメント   |
| テストケース       | `outputs/phase-4/test-cases.md`                        | テストケース一覧 |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`           | 統合テスト設計   |
| テストファイル     | `apps/desktop/src/preload/__tests__/skill-api.test.ts` | テストコード     |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（80%以上）
- [ ] 境界値テストが含まれている
- [ ] セキュリティテスト（safeInvoke/safeOn）が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- skill-api

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）
