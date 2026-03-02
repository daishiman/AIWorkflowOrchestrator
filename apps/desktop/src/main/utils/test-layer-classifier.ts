/**
 * テスト Layer の型定義
 * Layer 1: 自動テスト（pnpm vitest run）- Worktree 実施可
 * Layer 2: 静的コード検証（typecheck, lint）- Worktree 実施可
 * Layer 3: UI操作・実環境テスト - CI/メインリポジトリのみ
 */
export type TestLayer = 1 | 2 | 3;

/**
 * テスト項目の定義
 */
export interface TestItem {
  type: "unit-test" | "integration-test" | "static-analysis" | "e2e" | "manual";
  runner: "vitest" | "typecheck" | "lint" | "playwright" | "devtools";
  requiresElectron: boolean;
  requiresUI: boolean;
}

/**
 * テスト項目を Layer 1〜3 に分類する。
 *
 * 分類基準:
 * - Layer 1: Electron不要 かつ UI不要 かつ runner が vitest
 * - Layer 2: Electron不要 かつ UI不要 かつ runner が typecheck または lint
 * - Layer 3: Electron必要 または UI必要
 *
 * @param testItem - 分類対象のテスト項目
 * @returns テスト Layer（1, 2, 3 のいずれか）
 */
export function classifyTestLayer(testItem: TestItem): TestLayer {
  if (testItem.requiresElectron || testItem.requiresUI) {
    return 3;
  }

  if (testItem.runner === "typecheck" || testItem.runner === "lint") {
    return 2;
  }

  return 1;
}

/**
 * 指定された Layer のテストが Worktree 環境で実行可能かを判定する。
 *
 * Layer 1（自動テスト）と Layer 2（静的検証）は Worktree で実行可能。
 * Layer 3（UI操作・実環境テスト）は Worktree では実行不可。
 *
 * @param layer - 判定対象の Layer
 * @returns Worktree 環境で実行可能な場合 true
 */
export function canRunInWorktree(layer: TestLayer): boolean {
  return layer === 1 || layer === 2;
}
