# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 3                                           |
| 後続Phase  | Phase 5                                           |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

スナップショットテストを TDD で設計し、Red 状態を確認する。

## 背景

`apps/desktop/src/main/ipc/creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers()` で
`SKILL_CREATOR_GET_ADAPTER_STATUS` チャンネルが2回 `ipcMain.handle()` で登録された。
Electron の `ipcMain.handle()` は同一チャンネルの2回目登録で例外をスローし、後続14ハンドラが全て未登録になる連鎖障害が発生した。
本 Phase では `ipcMain.handle` を spy で置き換え、登録チャンネル名配列を `toMatchSnapshot()` でスナップショット固定し、重複登録を CI で自動検出するテストを TDD で設計する。

## 実行タスク

1. テスト仕様書を作成する（REG-SNAP-01, REG-DEDUP-01）
2. `creatorHandlers.registrationSnapshot.test.ts` のテスト骨格を設計する
3. Red 状態の期待エラー内容を記録する（スナップショット未生成状態）
4. 統合テスト計画を作成する

## 参照資料

| 参照資料         | パス                                           | 説明                 |
| ---------------- | ---------------------------------------------- | -------------------- |
| 設計レビュー結果 | `outputs/phase-3/`                             | Phase 3 成果物       |
| ハンドラ実装     | `apps/desktop/src/main/ipc/creatorHandlers.ts` | 対象ハンドラファイル |
| 既存テスト構造   | `apps/desktop/src/main/ipc/__tests__/`         | 既存テストの構造確認 |

## 実行手順

1. 入力成果物（Phase 3 成果物）を確認する。
2. REG-SNAP-01 と REG-DEDUP-01 のテスト仕様を並列で設計する。
3. テスト骨格（概念コード）を仕様書に記載する。
4. Red 状態でのエラー内容を記録し `outputs/phase-4/red-test-result.md` に保存する。
5. 完了条件を判定する。

## テストケース仕様

### REG-SNAP-01: チャンネル登録スナップショット検証

| 項目      | 内容                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| テスト ID | REG-SNAP-01                                                                                       |
| 目的      | `registerRuntimeSkillCreatorHandlers()` が登録するチャンネル名一覧をスナップショットで固定する    |
| 前提条件  | `vi.hoisted` + `vi.mock("electron")` + `mockImplementation` で `ipcMain.handle` を capture できる |
| 手順      | 1. capture をセットアップする / 2. 関数を呼び出す / 3. 登録チャンネル名配列を抽出する             |
| 期待結果  | `expect(handles).toMatchSnapshot()` が既存スナップショットと一致する                              |
| 失敗条件  | スナップショット未生成状態では `Missing snapshots` エラーが出力される                             |

### REG-DEDUP-01: 重複チャンネル登録検出

| 項目      | 内容                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| テスト ID | REG-DEDUP-01                                                                            |
| 目的      | 同一チャンネル名が複数回登録されていないことを検証する                                  |
| 前提条件  | REG-SNAP-01 と同じ mock capture セットアップ                                            |
| 手順      | 1. capture をセットアップする / 2. 関数を呼び出す / 3. チャンネル名配列の重複を検査する |
| 期待結果  | `expect(new Set(handles).size).toBe(handles.length)` が成立する                         |
| 失敗条件  | 重複チャンネルが存在する場合、Set のサイズと配列長が不一致となりテスト失敗              |

## テストコード骨格（概念コード）

仕様書への参照用として、以下の概念コードを設計する。
実際の実装は Phase 5 で行う。

```typescript
// apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerRuntimeSkillCreatorHandlers } from "../creatorHandlers";

const { mockIpcMainHandle } = vi.hoisted(() => ({
  mockIpcMainHandle: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
  },
}));

describe("registerRuntimeSkillCreatorHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  it("REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する", () => {
    const mockWindow = {} as Electron.BrowserWindow;
    registerRuntimeSkillCreatorHandlers(mockWindow);

    // チャンネル一覧をスナップショットで固定する
    expect(handles).toMatchSnapshot();
  });

  it("REG-DEDUP-01: 重複チャンネルが存在しない", () => {
    const mockWindow = {} as Electron.BrowserWindow;
    registerRuntimeSkillCreatorHandlers(mockWindow);

    // Set のサイズと配列長が一致すれば重複なし
    expect(new Set(handles).size).toBe(handles.length);
  });
});
```

## 統合テスト連携

- 本 Phase の `REG-*` 仕様は Phase 5 / 6 のテスト実装と手動検証記録で同じ識別子を維持する。
- Phase 11 ではここで定義した期待結果を `manual-test-result.md` に転記し、Phase 12 では implementation guide に反映する。

## 多角的チェック観点

| 観点     | 確認内容                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| 矛盾     | REG-SNAP-01 と REG-DEDUP-01 の仕様が相互矛盾していないか確認する                                            |
| 漏れ     | `creatorHandlers.ts` の全 `ipcMain.handle` 呼び出しが検証対象に含まれているか確認する                       |
| 整合性   | mock capture の初期化・リセット処理が `beforeEach` と `vi.clearAllMocks()` で正しく設定されているか確認する |
| 依存関係 | Phase 3 成果物（設計レビュー結果）との整合が取れているか確認する                                            |

## 成果物

| 成果物         | パス                                       | 説明                                         |
| -------------- | ------------------------------------------ | -------------------------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | REG-SNAP-01, REG-DEDUP-01 のアサーション仕様 |
| Red 結果       | `outputs/phase-4/red-test-result.md`       | スナップショット未生成状態の失敗結果記録     |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 統合テスト計画                               |

## 完了条件

- [ ] テスト仕様書に REG-SNAP-01 と REG-DEDUP-01 の明確なアサーション仕様がある
- [ ] Red 状態の期待結果が記録されている
- [ ] テストコード骨格（概念コード）が設計書に含まれる
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 参照資料（Phase 3 成果物）の確認
2. REG-SNAP-01 テスト仕様の設計
3. REG-DEDUP-01 テスト仕様の設計
4. テストコード骨格の設計
5. Red 状態の記録
6. 統合テスト計画の作成
7. 成果物出力
8. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-IPC-HANDLER-CI-001
```

## 次のPhase

Phase 5: 実装
