import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import {
  classifyTestLayer,
  canRunInWorktree,
  type TestItem,
  type TestLayer,
} from "../test-layer-classifier";
import { parseDeferredTests } from "../deferred-tests-parser";

vi.mock("node:fs");
const mockedFs = vi.mocked(fs);

/**
 * Worktree Protocol Flow 統合テスト
 *
 * worktree-detector, deferred-tests-parser, test-layer-classifier の
 * 3ユーティリティを統合し、プロトコルフロー全体を検証する。
 */
describe("Worktree Protocol Flow（統合テスト）", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  /** Layer 1 テスト項目の定義 */
  const layer1Tests: TestItem[] = [
    {
      type: "unit-test",
      runner: "vitest",
      requiresElectron: false,
      requiresUI: false,
    },
    {
      type: "integration-test",
      runner: "vitest",
      requiresElectron: false,
      requiresUI: false,
    },
  ];

  /** Layer 2 テスト項目の定義 */
  const layer2Tests: TestItem[] = [
    {
      type: "static-analysis",
      runner: "typecheck",
      requiresElectron: false,
      requiresUI: false,
    },
    {
      type: "static-analysis",
      runner: "lint",
      requiresElectron: false,
      requiresUI: false,
    },
  ];

  /** Layer 3 テスト項目の定義 */
  const layer3Tests: TestItem[] = [
    {
      type: "e2e",
      runner: "playwright",
      requiresElectron: true,
      requiresUI: true,
    },
    {
      type: "manual",
      runner: "devtools",
      requiresElectron: true,
      requiresUI: true,
    },
  ];

  it("UT-PF-01: Worktree 環境で Layer 1 テスト実行フローが正しく動作する", async () => {
    // Worktree 環境をセットアップ
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/.git/worktrees/feature-branch\n",
    );

    const { isWorktreeEnvironment } = await import("../worktree-detector");

    // Worktree 環境であることを確認
    expect(isWorktreeEnvironment("/test/worktree-project")).toBe(true);

    // Layer 1 テスト全件が Layer 1 に分類されることを確認
    const classifiedLayers = layer1Tests.map((test) => classifyTestLayer(test));
    expect(classifiedLayers).toEqual([1, 1] satisfies TestLayer[]);

    // Layer 1 テスト全件が Worktree 環境で実行可能と判定されることを確認
    const canRunResults = classifiedLayers.map((layer) =>
      canRunInWorktree(layer),
    );
    expect(canRunResults.every((result) => result === true)).toBe(true);
  });

  it("UT-PF-02: Worktree 環境で Layer 2 テスト実行フローが正しく動作する", async () => {
    // Worktree 環境をセットアップ
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/.git/worktrees/feature-branch\n",
    );

    const { isWorktreeEnvironment } = await import("../worktree-detector");

    // Worktree 環境であることを確認
    expect(isWorktreeEnvironment("/test/worktree-project")).toBe(true);

    // Layer 2 テスト全件が Layer 2 に分類されることを確認
    const classifiedLayers = layer2Tests.map((test) => classifyTestLayer(test));
    expect(classifiedLayers).toEqual([2, 2] satisfies TestLayer[]);

    // Layer 2 テスト全件が Worktree 環境で実行可能と判定されることを確認
    const canRunResults = classifiedLayers.map((layer) =>
      canRunInWorktree(layer),
    );
    expect(canRunResults.every((result) => result === true)).toBe(true);
  });

  it("UT-PF-03: Worktree 環境で Layer 3 テストが deferred-tests に記録される", async () => {
    // Worktree 環境をセットアップ
    mockedFs.statSync.mockReturnValue({
      isFile: () => true,
    } as unknown as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(
      "gitdir: /path/to/.git/worktrees/feature-branch\n",
    );

    const { isWorktreeEnvironment } = await import("../worktree-detector");

    // Worktree 環境であることを確認
    expect(isWorktreeEnvironment("/test/worktree-project")).toBe(true);

    // Layer 3 テスト全件が Layer 3 に分類されることを確認
    const classifiedLayers = layer3Tests.map((test) => classifyTestLayer(test));
    expect(classifiedLayers).toEqual([3, 3] satisfies TestLayer[]);

    // Layer 3 テストは Worktree 環境で実行不可
    const canRunResults = classifiedLayers.map((layer) =>
      canRunInWorktree(layer),
    );
    expect(canRunResults.every((result) => result === false)).toBe(true);

    // Layer 3 テストを deferred-tests 形式の Markdown テーブルに変換
    const deferredMarkdown = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | E2Eテスト実行 | Worktree環境でElectron起動不可 | メインリポジトリ | 2026-03-15 | 未実施 |
| DT-002 | DevToolsコンソール検証 | Worktree環境でUI操作不可 | メインリポジトリ | 2026-03-15 | 未実施 |
`;

    // deferred-tests パーサーで正しくパースできることを確認
    const parseResult = parseDeferredTests(deferredMarkdown);
    expect(parseResult.items).toHaveLength(2);
    expect(parseResult.items[0].id).toBe("DT-001");
    expect(parseResult.items[0].status).toBe("未実施");
    expect(parseResult.items[1].id).toBe("DT-002");
    expect(parseResult.items[1].status).toBe("未実施");
    expect(parseResult.allResolved).toBe(false);
  });

  it("UT-PF-04: メインリポジトリ環境で全 Layer のテストが実行可能と判定される", async () => {
    // メインリポジトリ環境をセットアップ（.git がディレクトリ）
    mockedFs.statSync.mockReturnValue({
      isFile: () => false,
      isDirectory: () => true,
    } as unknown as fs.Stats);

    const { isWorktreeEnvironment } = await import("../worktree-detector");

    // メインリポジトリ環境であることを確認
    expect(isWorktreeEnvironment("/test/main-repo")).toBe(false);

    // 全テスト項目を分類
    const allTests = [...layer1Tests, ...layer2Tests, ...layer3Tests];
    const classifiedLayers = allTests.map((test) => classifyTestLayer(test));

    // Layer 1, 2 は canRunInWorktree === true（環境に関係なく Layer ベースで判定）
    // Layer 3 は canRunInWorktree === false（メインリポジトリでも Layer 3 は worktree 実行不可の分類）
    const layer1And2Results = classifiedLayers
      .filter((layer): layer is 1 | 2 => layer === 1 || layer === 2)
      .map((layer) => canRunInWorktree(layer));
    expect(layer1And2Results.every((result) => result === true)).toBe(true);

    const layer3Results = classifiedLayers
      .filter((layer): layer is 3 => layer === 3)
      .map((layer) => canRunInWorktree(layer));
    expect(layer3Results.every((result) => result === false)).toBe(true);

    // メインリポジトリ環境では Layer 3 テストも直接実行可能（worktree ではないため）
    // canRunInWorktree は「Worktree 環境で実行可能か」を返す純粋関数であり、
    // メインリポジトリ環境では全テストが実行可能であることは isWorktreeEnvironment === false で判定する
    const isWorktree = isWorktreeEnvironment("/test/main-repo");
    const allCanRun = classifiedLayers.every(
      (layer) => !isWorktree || canRunInWorktree(layer),
    );
    expect(allCanRun).toBe(true);
  });

  it("UT-PF-05: deferred-tests の全項目が完了の場合、プロトコル完了と判定される", () => {
    const completedDeferredTests = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | E2Eテスト実行 | Worktree環境でElectron起動不可 | メインリポジトリ | 2026-03-15 | 完了 |
| DT-002 | DevToolsコンソール検証 | Worktree環境でUI操作不可 | メインリポジトリ | 2026-03-15 | 完了 |
| DT-003 | UIレンダリング確認 | Worktree環境でElectron起動不可 | CI | 2026-03-15 | 完了 |
`;

    const result = parseDeferredTests(completedDeferredTests);

    // 全項目が「完了」であることを確認
    expect(result.items).toHaveLength(3);
    expect(result.items.every((item) => item.status === "完了")).toBe(true);

    // プロトコル完了と判定される
    const isProtocolComplete = result.allResolved;
    expect(isProtocolComplete).toBe(true);
  });

  it("UT-PF-06: deferred-tests に未完了項目がある場合、プロトコル未完了と判定される", () => {
    const partialDeferredTests = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | E2Eテスト実行 | Worktree環境でElectron起動不可 | メインリポジトリ | 2026-03-15 | 完了 |
| DT-002 | DevToolsコンソール検証 | Worktree環境でUI操作不可 | メインリポジトリ | 2026-03-15 | 未実施 |
| DT-003 | UIレンダリング確認 | Worktree環境でElectron起動不可 | CI | 2026-03-15 | 完了 |
`;

    const result = parseDeferredTests(partialDeferredTests);

    // 未完了項目が存在することを確認
    expect(result.items).toHaveLength(3);
    const pendingItems = result.items.filter((item) => item.status !== "完了");
    expect(pendingItems).toHaveLength(1);
    expect(pendingItems[0].id).toBe("DT-002");

    // プロトコル未完了と判定される
    const isProtocolComplete = result.allResolved;
    expect(isProtocolComplete).toBe(false);
  });
});
