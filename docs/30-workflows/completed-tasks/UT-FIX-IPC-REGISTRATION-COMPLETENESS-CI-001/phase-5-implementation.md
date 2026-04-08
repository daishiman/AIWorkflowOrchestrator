# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 5                                           |
| Phase名    | 実装                                        |
| 前提Phase  | Phase 4                                     |
| 後続Phase  | Phase 6                                     |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

スナップショットテストを実装し、Green（PASS）にする。

## 背景

Phase 4 で Red 状態のテストが確認できたので、次はテストを Green にする実装を行う。スナップショットテストは初回実行時に自動的にスナップショットファイルを生成する。

---

## 実行タスク

### タスク1: スナップショットテストの実装

**目的**: テストコードを実装して全 TC を PASS 状態にする

**実行手順**:

1. `vi.mock("electron")` で `ipcMain.handle` をモックし、チャネル名収集用配列に push する spy を設定する
2. `registerRuntimeSkillCreatorHandlers()` 用に最小限の `BrowserWindow` スタブを用意する
3. 収集したチャネル名をソートして `toMatchSnapshot()` でスナップショット保存する
4. `Set` 変換後のサイズと元配列サイズの一致を `expect(set.size).toBe(arr.length)` で検証する
5. チャネル総数が 18（public runtime 16 + auxiliary 2）であることを `expect(channels).toHaveLength(18)` で固定する
6. `pnpm vitest run` で Green を確認する

**実装ファイル一覧**:

| 操作     | ファイルパス                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------- |
| 新規作成 | `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`                    |
| 自動生成 | `apps/desktop/src/main/ipc/__tests__/__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap` |

**実装パターン（参考）**:

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { BrowserWindow } from "electron";

// electron をモック
vi.mock("electron", () => {
  return {
    ipcMain: {
      handle: vi.fn(),
    },
  };
});

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: {
    send: vi.fn(),
  },
} as unknown as BrowserWindow;

describe("IPC ハンドラ登録完全性", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registerRuntimeSkillCreatorHandlers: チャネル一覧がスナップショットと一致する", async () => {
    const { registerRuntimeSkillCreatorHandlers } =
      await import("../creatorHandlers");
    const { ipcMain } = await import("electron");

    registerRuntimeSkillCreatorHandlers(mockMainWindow);

    const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls
      .map((args) => args[0] as string)
      .sort();

    expect(channels).toHaveLength(18); // 16 public runtime + 2 auxiliary
    // スナップショット保存（初回実行で自動生成）
    expect(channels).toMatchSnapshot();

    // 重複登録がないことを確認
    const unique = new Set(channels);
    expect(unique.size).toBe(channels.length);
  });
});
```

**実行コマンド**:

```bash
# テスト実行
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot

# スナップショット更新（初回実行時）
pnpm --filter @repo/desktop vitest run --update-snapshots \
  src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot

# typecheck / lint
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap`
- `outputs/phase-5/implementation-summary.md`

---

## 参照資料

| 参照資料         | パス                                           | 内容                     |
| ---------------- | ---------------------------------------------- | ------------------------ |
| テスト設計書     | `outputs/phase-2/test-design.md`               | モック方針・アサーション |
| テストマトリクス | `outputs/phase-4/test-matrix.md`               | TC 一覧                  |
| IPC ハンドラ実装 | `apps/desktop/src/main/ipc/creatorHandlers.ts` | 対象ファイル             |

---

## 成果物

| 成果物                   | パス                                                                                            | 説明           |
| ------------------------ | ----------------------------------------------------------------------------------------------- | -------------- |
| スナップショットテスト   | `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`                    | テストファイル |
| スナップショットファイル | `apps/desktop/src/main/ipc/__tests__/__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap` | 自動生成       |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`                                                     | 実装内容の記録 |

---

## 完了条件

- [ ] 全 TC（TC-01〜TC-03）が PASS している
- [ ] スナップショットファイルが生成されている
- [ ] `pnpm typecheck` が PASS している
- [ ] `pnpm lint` が PASS している

---

## リスクと対策

| リスク                                                | 影響度 | 対策                                                            |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `vi.mock("electron")` の reset が不完全でテスト間干渉 | 高     | `beforeEach` で `vi.clearAllMocks()` + モジュールリセットを実施 |
| スナップショットが非決定論的（登録順に依存）          | 高     | チャネル名配列を `.sort()` してからスナップショット保存する     |
| 他のテストとの `ipcMain` モック競合                   | 中     | 独立したテストファイルに分離し `vi.mock` スコープを閉じる       |
| `mainWindow` モックの surface 不足                    | 中     | `isDestroyed` と `webContents.send` を持つ最小モックを用意する  |

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目          | 内容 |
| ------------- | ---- |
| 実行日時      | -    |
| 実行者        | -    |
| 完了判定      | -    |
| Green TC 件数 | -    |
| 特記事項      | -    |
