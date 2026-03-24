# Phase 4 成果物: モック戦略

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 4 - テスト作成

## 1. モック戦略の前提

このタスクは type:design（プロダクションコードなし）のため、実行時のモックは存在しない。
ここで定義するモック戦略は、将来の実装フェーズで使用するテストコードの境界設計として記録する。

| 前提事項                           | 内容                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------- |
| 対象レイヤー                       | ファイルシステム操作 / Shell コマンド実行 / GitHub CLI (gh)            |
| モック不要の観点                   | State 遷移条件（MD ファイル内の text 検証）は grep/ls で直接検証       |
| モック境界の決定基準               | 副作用（ファイル書き込み・外部プロセス起動）を持つ操作のみモック化する |
| 設計タスクにおける mock の位置づけ | 将来の governance 自動化ツール実装時のテスト設計仕様として記録する     |

## 2. Dependency モック境界

### 2.1 ファイルシステム操作

| 対象操作                      | モック方針                       | 代替戦略                            |
| ----------------------------- | -------------------------------- | ----------------------------------- |
| `rsync -avz --checksum` 実行  | モック化（副作用あり）           | dry-run モード (`--dry-run`) を使用 |
| `diff -qr` 実行               | モック不要（読み取り専用）       | 実 diff を直接実行                  |
| `node generate-index.js` 実行 | モック化（ファイル書き込みあり） | 出力ファイルへの書き込みを spy      |
| LOGS.md 書き込み              | モック化（ファイル書き込みあり） | in-memory filesystem を使用         |
| `ls outputs/phase-N/` 実行    | モック不要（読み取り専用）       | 実ディレクトリを直接参照            |
| `grep -c` 実行                | モック不要（読み取り専用）       | 実ファイルを直接参照                |

### 2.2 外部プロセス操作

| 対象操作                                 | モック方針                    | mock 実装パターン               |
| ---------------------------------------- | ----------------------------- | ------------------------------- |
| `gh issue close <number>` 実行           | モック化（外部 API 呼び出し） | `child_process.execSync` を spy |
| `git diff --stat` 実行                   | モック不要（読み取り専用）    | 実 git コマンドを実行           |
| `stat -f "%Sm"` 実行（ファイル時刻取得） | モック化（環境依存）          | 固定タイムスタンプを返す spy    |

## 3. IPC モック境界

このタスクは IPC 契約を直接持たないため、IPC モックは不要。
ただし、将来の governance 自動化ツールが IPC を経由する場合に備えて境界を定義する。

| IPC チャンネル候補                       | モック必要度 | 根拠                                              |
| ---------------------------------------- | ------------ | ------------------------------------------------- |
| `system:get-app-path`（将来利用可能性）  | 低           | 現時点では不使用                                  |
| `system:open-external`（将来利用可能性） | 低           | 現時点では不使用                                  |
| なし（現状）                             | なし         | type:design のため Renderer-Main 通信が発生しない |

## 4. Store モック境界

このタスクは Zustand Store を直接持たないため、Store モックは不要。
ただし、将来の governance state が Zustand Store で管理される場合に備えて境界を定義する。

| Store Slice 候補                    | モック必要度 | 根拠                                                     |
| ----------------------------------- | ------------ | -------------------------------------------------------- |
| `governanceSlice`（将来設計候補）   | 中           | spec_created / implementation_ready / completed の state |
| `taskWorkflowSlice`（将来設計候補） | 低           | task-workflow.md の更新状態管理                          |
| なし（現状）                        | なし         | type:design のため Store 変更が発生しない                |

## 5. テスト環境モック設定テンプレート

将来の自動化テスト実装者向けのモック設定例:

```typescript
// governance-contract.test.ts（将来実装用テンプレート）

import { vi } from "vitest";
import * as fs from "node:fs";
import * as child_process from "node:child_process";

// ファイル書き込みモック（副作用を防ぐ）
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof fs>();
  return {
    ...actual,
    writeFileSync: vi.fn(), // LOGS.md 書き込みをモック
    appendFileSync: vi.fn(), // changelog 追記をモック
  };
});

// 外部プロセスモック（gh コマンドをモック）
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof child_process>();
  return {
    ...actual,
    execSync: vi.fn().mockReturnValue(""), // gh issue close の空応答
  };
});

// ファイル読み取りはモック不要（実ファイルを参照）
// grep / ls / diff は副作用なしのため直接実行
```

## 6. モック優先度と決定根拠

| 優先度 | 対象操作          | モック方針   | 決定根拠                                      |
| ------ | ----------------- | ------------ | --------------------------------------------- |
| 高     | rsync             | dry-run 代替 | ファイルを誤上書きするリスクがある            |
| 高     | LOGS.md 書き込み  | モック化     | 2ファイル同時更新の副作用がテスト間で干渉する |
| 高     | gh issue close    | モック化     | 実 GitHub API を叩かないための隔離が必要      |
| 中     | generate-index.js | spy 化       | 実行確認のみ必要、ファイル生成は検証不要      |
| 低     | grep / ls / diff  | モック不要   | 読み取り専用で副作用なし                      |
| 低     | git diff --stat   | モック不要   | 読み取り専用で副作用なし                      |

## 7. 設計タスク固有の注意事項

このタスクは type:design のため、以下の点でモック戦略が通常の実装タスクと異なる:

| 差異点                     | 内容                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| テストコードの実装は対象外 | 本成果物は将来の実装者向けのモック境界設計仕様であり、コード作成ではない |
| 検証は grep/ls ベース      | contract テスト（C-1〜C-12）は shell コマンドで直接実行可能              |
| Store/IPC モックは参考情報 | 現時点では不要。governance 自動化ツール実装時に参照すること              |
