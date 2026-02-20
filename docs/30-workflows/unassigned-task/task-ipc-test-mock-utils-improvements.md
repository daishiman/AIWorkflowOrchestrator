# IPCテスト handlerMap モックユーティリティ共通化 - タスク指示書

## メタ情報

```yaml
issue_number: 831
```

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | UT-9A-B-003                                   |
| タスク名     | IPCテストhandlerMapモックユーティリティ共通化 |
| 分類         | 改善                                          |
| 対象機能     | IPC テスト基盤                                |
| 優先度       | 低                                            |
| 見積もり規模 | 小規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | Phase 12（TASK-9A-B実装経験）                 |
| 発見日       | 2026-02-19                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

- TASK-9A-B、TASK-9B-H、TASK-8C-A等のIPCハンドラー実装で handlerMap ESMモックパターンが繰り返し使用されている
- 各テストファイルで同じ `vi.mock("electron")` ボイラープレートが重複
- mockEvent の構造、mockMainWindow の定義が各ファイルで微妙に異なる

### 1.2 問題点・課題

- テストボイラープレートの重複（DRY違反）: 約30行のモックセットアップが各テストファイルに存在
- mockEvent構造の不統一: `sender.getOwnerBrowserWindow` の戻り値形式がファイルごとに異なる
- 新規IPCハンドラーテスト追加時の学習コスト: handlerMapパターンを理解し、正しくコピーする必要がある
- handlerMapの型安全性不足: `Map<string, Function>` では引数/戻り値の型が失われる

### 1.3 放置した場合の影響

- 新規IPCテスト追加のたびに30行のボイラープレートをコピー＆修正
- mockEvent構造の不整合による断続的なテスト失敗リスク
- テストファイルの可読性低下（実質的なテストコードが埋もれる）

---

## 2. 何を達成するか（What）

### 2.1 目的

IPCテスト用の共通ユーティリティモジュールを作成し、handlerMapモック・mockEvent・mockMainWindowの重複を解消する

### 2.2 最終ゴール

- 共通テストユーティリティ `apps/desktop/src/main/ipc/__tests__/helpers/ipcTestUtils.ts` の作成
- `createIpcMock()` 関数: handlerMap + listenerMap + vi.mock設定を一括生成
- `createMockEvent(mainWindow?)` 関数: 標準化されたmockEvent生成
- `invokeHandler<TArgs, TResult>(handlerMap, channel, event, args)` 型安全ハンドラー呼び出し
- 既存テストファイルのリファクタリング（ボイラープレート削減）

### 2.3 スコープ

#### 含むもの

- 共通テストユーティリティモジュールの新規作成
- `createIpcMock()` - Electron IPCモック一式の生成
- `createMockEvent()` - validateIpcSender対応のmockEvent生成
- `createMockMainWindow()` - 標準化されたBrowserWindowモック
- `invokeHandler()` - 型安全なハンドラー呼び出しラッパー
- skillFileHandlers.test.ts のリファクタリング（参考実装）
- 他テストファイルへの適用可能性調査

#### 含まないもの

- テストケース自体の追加・変更（ユーティリティ移行のみ）
- テストカバレッジ目標の変更
- Vitest設定の変更（vitest.config.ts）
- Renderer側テストユーティリティ

### 2.4 成果物

- `apps/desktop/src/main/ipc/__tests__/helpers/ipcTestUtils.ts`（共通ユーティリティ）
- `apps/desktop/src/main/ipc/__tests__/helpers/__tests__/ipcTestUtils.test.ts`（ユーティリティ自体のテスト）
- 既存テストファイルの修正（ボイラープレート削減）
- Phase 1-12ワークフロー成果物

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9A-B（スキルファイルIPCハンドラー）が完了していること ✅
- handlerMapパターンを使用するテストファイルが3つ以上存在すること

### 3.2 依存タスク

- TASK-9A-B（完了済み）
- UT-9A-B-001, UT-9A-B-002 とは独立して実行可能

### 3.3 必要な知識

- Vitest ESM環境での `vi.mock()` パターン
- Electron IPC の `ipcMain.handle` / `ipcMain.on` の動作
- TypeScript ジェネリクス（型安全なハンドラー呼び出し）
- テストヘルパー設計のベストプラクティス

### 3.4 推奨アプローチ

#### ステップ1: 現状のボイラープレート調査

```bash
grep -rn "handlerMap\|vi.mock.*electron" apps/desktop/src/main/ipc/__tests__/
```

#### ステップ2: 共通ユーティリティ設計

```typescript
// apps/desktop/src/main/ipc/__tests__/helpers/ipcTestUtils.ts

export interface IpcMock {
  handlerMap: Map<string, Function>;
  listenerMap: Map<string, Function>;
  mockIpcMain: {
    handle: ReturnType<typeof vi.fn>;
    removeHandler: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };
}

export function createIpcMock(): IpcMock {
  const handlerMap = new Map<string, Function>();
  const listenerMap = new Map<string, Function>();
  return {
    handlerMap,
    listenerMap,
    mockIpcMain: {
      handle: vi.fn((ch: string, fn: Function) => handlerMap.set(ch, fn)),
      removeHandler: vi.fn((ch: string) => handlerMap.delete(ch)),
      on: vi.fn((ch: string, fn: Function) => listenerMap.set(ch, fn)),
      removeListener: vi.fn(),
    },
  };
}

export function createMockMainWindow() {
  return { webContents: { id: 1 } } as unknown as BrowserWindow;
}

export function createMockEvent(mainWindow?: BrowserWindow) {
  return {
    sender: {
      getOwnerBrowserWindow: vi.fn(() => mainWindow ?? createMockMainWindow()),
    },
  } as unknown as IpcMainInvokeEvent;
}

export async function invokeHandler<TResult = unknown>(
  handlerMap: Map<string, Function>,
  channel: string,
  event: IpcMainInvokeEvent,
  args: Record<string, unknown>,
): Promise<TResult> {
  const handler = handlerMap.get(channel);
  if (!handler) throw new Error(`No handler for channel: ${channel}`);
  return handler(event, args) as Promise<TResult>;
}
```

#### ステップ3: skillFileHandlers.test.ts リファクタリング例

```typescript
// Before: 30行のボイラープレート
// After:
import {
  createIpcMock,
  createMockEvent,
  invokeHandler,
} from "./helpers/ipcTestUtils";

const { handlerMap, mockIpcMain } = createIpcMock();
vi.mock("electron", () => ({
  ipcMain: mockIpcMain,
  BrowserWindow: { getAllWindows: vi.fn(() => []) },
}));

const mockEvent = createMockEvent(mockMainWindow);
const result = await invokeHandler(
  handlerMap,
  IPC_CHANNELS.SKILL_READ_FILE,
  mockEvent,
  { skillName: "test", relativePath: "file.md" },
);
```

### 3.5 実装課題と解決策（TASK-9A-Bからの学び）

| 課題                                 | 原因                                                                                | 解決策                                                                          | 教訓                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ESM環境での vi.mock("electron") 確立 | `require("electron")` がESM環境で使用不可                                           | `vi.mock("electron", () => ({...}))` ファクトリ関数パターン使用                 | ESM環境ではvi.mockのファクトリ関数が唯一の安定パターン      |
| handlerMapの型安全性不足             | `Map<string, Function>` では引数型が消失                                            | ジェネリクス付きラッパー `invokeHandler<TResult>()` で型を復元                  | テストユーティリティでも型安全性を確保すべき                |
| mockEvent構造の不統一                | 各テストファイルで独自にmockEvent作成                                               | `createMockEvent(mainWindow?)` で標準化。validateIpcSender対応構造を保証        | モック構造は1箇所で定義し、テスト間で共有する               |
| vi.mock hoisting の理解              | vi.mock() はファイル先頭にホイストされるため、createIpcMock()の戻り値を直接渡せない | vi.mock内でグローバル変数を参照するパターン、またはvi.mock外でmockIpcMainを定義 | vi.mockのhoisting挙動を理解し、変数スコープを正しく設計する |

### 3.6 システム仕様書参照テーブル

| 仕様書                                  | 参照セクション                             | 用途                     |
| --------------------------------------- | ------------------------------------------ | ------------------------ |
| architecture-implementation-patterns.md | IPC ハンドラー3層テスト分離パターン        | テスト構成の参考         |
| lessons-learned.md                      | TASK-9A-B苦戦箇所4（handlerMap ESMモック） | ESMモックパターンの詳細  |
| patterns.md (skill-creator)             | handlerMap ESMモック成功パターン           | テスト設計パターンの参考 |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                         | 目的                                 |
| ----- | ---------------------------- | ------------------------------------ |
| 1     | 要件定義                     | 既存テストのボイラープレート現状調査 |
| 2     | 設計                         | 共通ユーティリティAPI設計            |
| 3     | 設計レビュー                 | レビューゲート                       |
| 4     | テスト作成                   | ユーティリティ自体のテスト作成       |
| 5     | 実装                         | 共通ユーティリティ作成               |
| 6-7   | テスト拡充・カバレッジ       | 回帰テスト確認                       |
| 8-9   | リファクタリング・品質検証   | 既存テストのリファクタリング         |
| 10-13 | レビュー・ドキュメント・完了 | 最終レビュー・PR                     |

### Phase 1: 要件定義

#### 目的

handlerMapパターンを使用する全テストファイルの調査と、共通化対象の特定

#### 手順

1. `grep -rn "handlerMap\|new Map.*Function" apps/desktop/src/main/ipc/__tests__/` で対象ファイル特定
2. 各テストファイルのボイラープレート行数をカウント
3. mockEvent構造の差異を分析
4. 共通化による削減効果を見積もり

#### 成果物

- テストボイラープレート現状調査レポート

#### 完了条件

- [ ] 全IPCテストファイルの調査が完了
- [ ] 共通化対象と削減効果が明確

### Phase 4-5: テスト作成・実装

#### 目的

共通ユーティリティモジュールの作成

#### 手順

1. `createIpcMock()` のテストを先に書く（Red）
2. `createMockEvent()` のテストを先に書く（Red）
3. `invokeHandler()` のテストを先に書く（Red）
4. 共通ユーティリティ実装（Green）
5. skillFileHandlers.test.ts をリファクタリング（参考実装）

#### 成果物

- 共通ユーティリティモジュール
- ユーティリティテスト

#### 完了条件

- [ ] 共通ユーティリティが作成されている
- [ ] ユーティリティ自体のテストが全PASS
- [ ] skillFileHandlers.test.ts が共通ユーティリティを使用している
- [ ] 既存65テストが全PASS（回帰なし）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `createIpcMock()` が handlerMap + listenerMap + mockIpcMain を返す
- [ ] `createMockEvent()` が validateIpcSender 対応の mockEvent を返す
- [ ] `invokeHandler()` が型安全にハンドラーを呼び出せる
- [ ] 少なくとも1つの既存テストファイルがリファクタリング済み

### 品質要件

- [ ] ユーティリティモジュール Line Coverage 90%以上
- [ ] ESLintエラー0件
- [ ] TypeScript型チェックエラー0件
- [ ] 既存テスト全PASS（回帰なし）

### ドキュメント要件

- [ ] 実装ガイド（Part 1: 概念説明 + Part 2: 技術詳細）
- [ ] 使用例付きAPIリファレンス
- [ ] documentation-changelog.md

---

## 6. 検証方法

### テストケース

| #   | シナリオ                            | 期待結果                                        |
| --- | ----------------------------------- | ----------------------------------------------- |
| 1   | createIpcMock() 実行                | handlerMap, listenerMap, mockIpcMain が返される |
| 2   | mockIpcMain.handle でハンドラー登録 | handlerMap にエントリが追加される               |
| 3   | mockIpcMain.removeHandler で削除    | handlerMap からエントリが削除される             |
| 4   | createMockEvent() 実行              | sender.getOwnerBrowserWindow が存在する         |
| 5   | invokeHandler 存在するチャンネル    | ハンドラーが実行され結果が返る                  |
| 6   | invokeHandler 存在しないチャンネル  | Error がスローされる                            |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/helpers/` でユーティリティテスト
2. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/` で全IPCテスト（回帰確認）
3. `pnpm lint && pnpm typecheck`

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                                                   |
| ------------------------ | ------ | -------- | ---------------------------------------------------------------------- |
| vi.mock hoistingとの競合 | 高     | 中       | vi.mockのファクトリ関数内で変数参照が正しく動作することをPoCで事前検証 |
| 既存テストの回帰         | 高     | 低       | 1ファイルずつリファクタリングし、各段階で全テスト実行                  |
| 型定義の複雑化           | 低     | 中       | ジェネリクスは最小限に留め、明示的な型注釈で可読性を確保               |

---

## 8. 参照情報

### 関連ドキュメント

- [architecture-implementation-patterns.md](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) - IPC 3層テスト分離パターン
- [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) - TASK-9A-B苦戦箇所
- [patterns.md](../../.claude/skills/skill-creator/references/patterns.md) - handlerMap ESMモック成功パターン

### 関連Pitfall

- P41: v8カバレッジプロバイダのインライン関数カウント
- P9: モジュールスコープ変数のテスト間リーク
- P40: テスト実行ディレクトリ依存（モノレポ）

### 参考完了タスク

- TASK-9A-B（IPC ファイルハンドラー追加）- handlerMapパターンの原型
- TASK-9B-H（SkillCreator IPC）- 別ドメインでのhandlerMapパターン使用例
- TASK-IMP-VITEST-UTILS-001（Vitestテスト共通ユーティリティ整備）- 類似の共通化タスク

---

## 9. 備考

### 補足事項

- TASK-IMP-VITEST-UTILS-001 との統合も検討すること（スコープが重複する可能性）
- vi.mock の hoisting 挙動を十分理解してから実装に着手すること
- skillFileHandlers.test.ts をまず参考実装としてリファクタリングし、パターンが安定してから他ファイルに展開
- 共通ユーティリティは `__tests__/helpers/` に配置し、プロダクションコードとは分離する
