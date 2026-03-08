# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 4                                             |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 3 設計レビュー（PASS）                  |

## 目的

Phase 2の設計に基づき、`registerProfileFallbackHandlers()` と `registerAvatarFallbackHandlers()` のテストケースを設計し、テストコードを作成する。TDDのRedフェーズとして、実装前にテストを用意する。

## 実行タスク

- Task 1: テストケース設計: Profile 11 チャンネル / Avatar 3 チャンネルの fallback 応答をケース化する
- Task 2: テストファイル作成: `ipc-double-registration.test.ts` への追加方針を決める
- Task 3: テストコード実装: RED として失敗する契約テストを先に用意する

### Task 1: テストケース設計

#### 1.1 Profile フォールバックハンドラ テスト

| #    | テストケース                                                                                            | 期待結果                             |
| ---- | ------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| T-P1 | `registerProfileFallbackHandlers()` を呼び出すと `ipcMain.handle` が11回呼ばれる                        | `ipcMain.handle` が11回呼び出される  |
| T-P2 | 登録されるチャンネル名が `IPC_CHANNELS` のProfile定数と一致する                                         | 11チャンネル全てが一致               |
| T-P3 | `profile:get` のフォールバックが `{ success: false, error: { code: 'profile/not-configured' } }` を返す | レスポンス構造が一致                 |
| T-P4 | 全11チャンネルのフォールバックが同一構造のエラーレスポンスを返す                                        | 全てのレスポンスが一致               |
| T-P5 | エラーメッセージに内部パス・スタックトレースが含まれない                                                | メッセージがユーザー向けテキストのみ |

#### 1.2 Avatar フォールバックハンドラ テスト

| #    | テストケース                                                                                             | 期待結果                           |
| ---- | -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| T-A1 | `registerAvatarFallbackHandlers()` を呼び出すと `ipcMain.handle` が3回呼ばれる                           | `ipcMain.handle` が3回呼び出される |
| T-A2 | 登録されるチャンネル名が `IPC_CHANNELS` のAvatar定数と一致する                                           | 3チャンネル全てが一致              |
| T-A3 | `avatar:upload` のフォールバックが `{ success: false, error: { code: 'avatar/not-configured' } }` を返す | レスポンス構造が一致               |
| T-A4 | 全3チャンネルのフォールバックが同一構造のエラーレスポンスを返す                                          | 全てのレスポンスが一致             |

#### 1.3 統合テスト

| #    | テストケース                                                            | 期待結果                           |
| ---- | ----------------------------------------------------------------------- | ---------------------------------- |
| T-I1 | Supabase未設定時に Auth + Profile + Avatar 全フォールバックが登録される | 合計19チャンネル（5+11+3）が登録   |
| T-I2 | Supabase設定済み時にフォールバックハンドラが登録されない                | フォールバック関数が呼び出されない |

### Task 2: テストファイル作成

#### テストファイルパス

```
apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts
```

#### テスト構造

```typescript
describe("registerProfileFallbackHandlers", () => {
  // T-P1〜T-P5
});

describe("registerAvatarFallbackHandlers", () => {
  // T-A1〜T-A4
});

describe("Fallback handlers integration", () => {
  // T-I1〜T-I2
});
```

#### モック戦略

- `ipcMain.handle`: `vi.fn()` でモック化し、呼び出し回数とチャンネル名を検証
- `IPC_CHANNELS`: 実際の定数をインポートして使用（モック不要）
- `net.isOnline`: 既存テストのモックパターンを踏襲

### Task 3: テストコード実装

テストコードの骨格:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../../preload/channels";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  net: {
    isOnline: vi.fn().mockReturnValue(true),
  },
}));

describe("registerProfileFallbackHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register handlers for all 11 profile channels", () => {
    // T-P1: ipcMain.handle が11回呼ばれることを検証
  });

  it("should register handlers with correct channel names from IPC_CHANNELS", () => {
    // T-P2: チャンネル名が IPC_CHANNELS 定数と一致
  });

  it("should return PROFILE_ERROR_CODES.NOT_CONFIGURED for profile:get", async () => {
    // T-P3: レスポンス構造を検証
  });

  it("should return identical error response for all profile channels", async () => {
    // T-P4: 全チャンネルで同一レスポンス
  });

  it("should not include internal paths or stack traces in error message", async () => {
    // T-P5: セキュリティ検証
  });
});

describe("registerAvatarFallbackHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register handlers for all 3 avatar channels", () => {
    // T-A1
  });

  it("should register handlers with correct channel names from IPC_CHANNELS", () => {
    // T-A2
  });

  it("should return AVATAR_ERROR_CODES.NOT_CONFIGURED for avatar:upload", async () => {
    // T-A3
  });

  it("should return identical error response for all avatar channels", async () => {
    // T-A4
  });
});
```

## 参照資料

| 資料名            | パス                                                                                                   | 説明                         |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Phase 2 設計      | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-2-design.md` | 関数設計・レスポンス構造     |
| IPCチャンネル定数 | `apps/desktop/src/preload/channels.ts:58-75`                                                           | Profile/Avatarチャンネル定義 |
| 既存テスト        | `apps/desktop/src/main/ipc/__tests__/`                                                                 | テストパターンの参考         |

### システム仕様（aiworkflow-requirements）

- `references/error-handling.md` - エラーレスポンス形式

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. 既存の IPC テストファイルのパターンを確認（`apps/desktop/src/main/ipc/__tests__/`）
2. テストケース一覧（T-P1〜T-P5, T-A1〜T-A4, T-I1〜T-I2）を設計
3. テストファイル `fallback-handlers.test.ts` を作成
4. モック設定（`ipcMain`, `electron`）を記述
5. 各テストケースの骨格を実装
6. テスト実行して全件 RED（失敗）であることを確認

## 統合テスト連携

- `registerAllIpcHandlers()` を起点に通常経路 / fallback 経路のどちらが登録されるかを同一テストファイルで確認する
- `channels.ts` の定数とテストの期待件数を一致させ、Profile 11 / Avatar 3 のズレを回帰検知できるようにする
- Phase 11 の手動シナリオと同じ操作順序で、`profile:get` と `avatar:upload` の代表ケースを先に固定する

## 成果物

| 成果物         | パス                                                            | 説明                                |
| -------------- | --------------------------------------------------------------- | ----------------------------------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts` | Profile/Avatar フォールバックテスト |

## 完了条件

- [ ] テストケース11件（T-P1〜T-P5, T-A1〜T-A4, T-I1〜T-I2）が全て実装済み
- [ ] テスト実行で全件 RED（未実装のため失敗）であることを確認
- [ ] モック設定が既存テストパターンと一致
- [ ] `IPC_CHANNELS` 定数を直接参照している（ハードコード文字列なし）

## 次のPhase

Phase 5: 実装
