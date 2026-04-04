# Phase 2: 設計

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 2                                          |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

Phase 1 で定義した受入基準（AC-1〜AC-7）を満たすための具体的な設計を策定する。
変更箇所は最小限（`ipc/index.ts` の DI 接続差し替え + `disclosureHandlers.test.ts` 新規作成）に留める。

## 実行タスク

- タスク1: DI 接続差し替え設計
- タスク2: disclosure テスト設計
- タスク3: 型境界・責務境界の確認

## 設計方針（concern分類）

この変更は 2 concern に分類される（2 concern以下のため単一ファイルに記述）：

| concern             | 対象                                                             | 変更種別 |
| ------------------- | ---------------------------------------------------------------- | -------- |
| C-1: DI接続差し替え | `apps/desktop/src/main/ipc/index.ts` L907-918                    | 修正     |
| C-2: 独立テスト作成 | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 新規     |

## 設計詳細

### C-1: DI接続差し替え

#### 現状分析

`ipc/index.ts` にて `registerDisclosureHandlers` を呼び出す際、
`getDisclosureInfo` が inline の async arrow function として定義されており、
固定値を返している：

```typescript
// 変更前（L907-918）
// TODO(DI): Replace getDisclosureInfo with actual service when available.
track("registerDisclosureHandlers", () =>
  registerDisclosureHandlers({
    mainWindow,
    getDisclosureInfo: async () => ({
      aiServiceName: "anthropic", // ← 固定値
      modelName: "claude-sonnet", // ← 固定値
      externalDestinations: [],
    }),
  }),
);
```

#### 変更後の設計

`authModeServiceForRuntime`（L672 で定義済み）を使用して runtime の authMode から `aiServiceName` を動的取得する。
`modelName` は `AnthropicLLMAdapter` と同じ定数値（`"claude-sonnet-4-6"`）を使用する。

```typescript
// 変更後
const DISCLOSURE_MODEL_NAME = "claude-sonnet-4-6";

function buildDisclosureInfo(
  authModeService: IAuthModeService,
): DisclosureInfo {
  const mode = authModeService.getMode();
  const aiServiceName =
    mode === "subscription"
      ? "Claude Code CLI"
      : mode === "api-key"
        ? "Anthropic API"
        : "unknown";

  return {
    aiServiceName,
    modelName: DISCLOSURE_MODEL_NAME,
    externalDestinations: [],
  };
}

track("registerDisclosureHandlers", () =>
  registerDisclosureHandlers({
    mainWindow,
    getDisclosureInfo: async () =>
      buildDisclosureInfo(authModeServiceForRuntime),
  }),
);
```

#### 責務境界

| コンポーネント               | 責務                                     | 状態所有権        |
| ---------------------------- | ---------------------------------------- | ----------------- |
| `authModeServiceForRuntime`  | authMode を保持                          | `AuthModeService` |
| `buildDisclosureInfo()`      | authMode → DisclosureInfo の変換ロジック | なし（純粋関数）  |
| `registerDisclosureHandlers` | IPC ハンドラーの登録                     | なし              |
| `disclosureHandlers.ts`      | IPC 受信と sender 検証                   | なし              |

**注意**: `buildDisclosureInfo` を `index.ts` にローカル関数として定義するか、
`disclosureHandlers.ts` に移動するかは、テスタビリティを考慮してローカル関数とする。
（`disclosureHandlers.ts` 自体のロジックは変更しない）

#### DI境界の型配置判断

| 条件                                                                              | 配置先                                  |
| --------------------------------------------------------------------------------- | --------------------------------------- |
| `buildDisclosureInfo` は `ipc/index.ts` のみで使用                                | `ipc/index.ts` にローカル関数として定義 |
| `IAuthModeService` は既存の `apps/desktop/src/main/services/auth/types.ts` に存在 | 変更不要                                |

### C-2: 独立テスト作成（disclosureHandlers.test.ts）

#### テスト対象

`apps/desktop/src/main/ipc/disclosureHandlers.ts` の：

1. `registerDisclosureHandlers` 関数
2. sender 検証ロジック
3. DENY-5 準拠（API key 非含有）
4. getDisclosureInfo 失敗時の fallback

#### テスト構造

```typescript
// apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerDisclosureHandlers } from "../disclosureHandlers";
import { IPC_CHANNELS } from "../../../preload/channels";

// Electron mock パターン（approvalHandlers.test.ts と同様）
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

describe("disclosureHandlers", () => {
  describe("registerDisclosureHandlers", () => {
    // AC-5: sender 検証
    it("送信元が mainWindow でない場合 UNAUTHORIZED を返す");
    // AC-1/AC-2: aiServiceName 動的取得
    it("getDisclosureInfo から aiServiceName を返す");
    // AC-4: DENY-5 準拠（API key 非含有）
    it("レスポンスに API key / token が含まれない");
    // AC-6: getDisclosureInfo 失敗時
    it("getDisclosureInfo が例外を投げた場合 DISCLOSURE_ERROR を返す");
  });
});
```

#### 既存テストパターンとの整合

`approvalHandlers.test.ts` および `advancedConsoleIpc.test.ts` と同じ：

- Electron mock パターン（`vi.mock("electron", ...)`）
- `ipcMain.handle.mock.calls` で handler を取得して直接呼び出す
- `BrowserWindow.webContents` の mock を使った sender 検証テスト

## IPC 4層整合性チェック（変更箇所なし）

| 層                | 確認内容                                         | 状態                 |
| ----------------- | ------------------------------------------------ | -------------------- |
| 1. 定数定義       | `IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO`     | 定義済み（変更不要） |
| 2. ホワイトリスト | `preload/index.ts` allowedChannels               | 登録済み（変更不要） |
| 3. IPCハンドラー  | `disclosureHandlers.ts`                          | 実装済み（変更不要） |
| 4. Preload API    | `preload/skill-creator-api.ts` getDisclosureInfo | 実装済み（変更不要） |

## 変更ファイル一覧

| ファイル                                                         | 変更種別 | 変更内容                                                    |
| ---------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                             | 修正     | L907-918 の placeholder を `buildDisclosureInfo` に差し替え |
| `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 新規     | 独立ユニットテスト（AC-1〜AC-7 の検証）                     |

## 参照資料

| 資料名                          | パス                                                           | 説明                              |
| ------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| Phase 1 要件定義                | `phase-1-requirements.md`                                      | FR/NFR/AC の定義                  |
| IPC ハンドラー定義              | `apps/desktop/src/main/ipc/disclosureHandlers.ts`              | 変更対象のハンドラー              |
| placeholder 実装                | `apps/desktop/src/main/ipc/index.ts` L907-918                  | TODO(DI) 箇所                     |
| AuthMode 型                     | `apps/desktop/src/main/services/auth/types.ts`                 | IAuthModeService インターフェース |
| approvalHandlers テスト（参考） | `apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts` | テストパターンの参考              |

## 統合テスト連携【必須】

| 判定項目                | 基準     | 結果     |
| ----------------------- | -------- | -------- |
| ユニットテストLine      | 80%+     | 未計測   |
| ユニットテストBranch    | 60%+     | 未計測   |
| 設計の整合性（IPC 4層） | 全層確認 | 確認済み |

## 多角的チェック観点（AIが判断）

### システム系

- **強化ループ**: authMode 変更 → `getMode()` 呼び出しで反映 → disclosure 表示が更新される（実データ接続）
- **バランスループ**: DENY-5 → API key を含めない制約 → セキュリティと transparency のバランス
- **状態所有権**: `buildDisclosureInfo` は純粋関数（状態を持たない）。authMode の所有権は `AuthModeService` が維持。

### 価値系

- **初回スコープの価値**: `authModeServiceForRuntime` は既に `ipc/index.ts` L672 で定義済み。DI 接続コストは最小。
- **将来拡張の分離**: `externalDestinations` の実際のリスト収集は将来タスクとし、今回はスコープ外。

### 問題解決系

- **最小変更原則**: `disclosureHandlers.ts` 本体は変更しない。DI 接続側の `index.ts` のみ変更。
- **テスタビリティ**: `buildDisclosureInfo` を純粋関数として切り出すことで単独テストが可能。

## 成果物

| 成果物 | パス                        | 説明                       |
| ------ | --------------------------- | -------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 本ファイルが設計書を兼ねる |

## 完了条件

- [x] DI接続の変更設計（C-1）が完成している
- [x] テスト構造の設計（C-2）が完成している
- [x] 変更ファイル一覧が確定している
- [x] IPC 4層整合性チェックが完了している
- [x] 責務境界・状態所有権が明確になっている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク                          | 状態 | 備考                                    |
| ------------------------------- | ---- | --------------------------------------- |
| concern分類                     | 完了 | C-1（DI接続）、C-2（テスト）の2 concern |
| C-1 設計（buildDisclosureInfo） | 完了 | 純粋関数として設計                      |
| C-2 設計（テスト構造）          | 完了 | approvalHandlers パターンに準拠         |
| IPC 4層整合性チェック           | 完了 | 変更不要を確認                          |
| 変更ファイル特定                | 完了 | 2ファイル（修正1 + 新規1）              |

## 次のPhase

Phase 3: 設計レビューゲート → [phase-3-design-review.md](phase-3-design-review.md)

**ゲート**: Phase 2 完了後にのみ Phase 3 へ進む。
