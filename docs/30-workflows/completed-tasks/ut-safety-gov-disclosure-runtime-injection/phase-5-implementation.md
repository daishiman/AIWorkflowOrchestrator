# Phase 5: 実装

## メタ情報

| 項目      | 値                                             |
| --------- | ---------------------------------------------- |
| Phase     | 5                                              |
| 機能名    | ut-safety-gov-disclosure-runtime-injection     |
| 作成日    | 2026-04-02                                     |
| タスクID  | UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 |
| Issue     | #1804                                          |
| 前提Phase | Phase 4 テスト作成・RED 確認済み               |

## 目的

Phase 2 で確定した設計に従い、以下の 2 点を実装する：

1. `apps/desktop/src/main/ipc/index.ts` の L907-918 の placeholder を `buildDisclosureInfo` に差し替え
2. `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` を正式に完成させ、全テストが GREEN になることを確認する

## 実行タスク

- **実装 C-1**: `ipc/index.ts` の DI 接続差し替え（`buildDisclosureInfo` 追加 + placeholder 削除）
- **実装 C-2**: `disclosureHandlers.test.ts` の完成（Phase 4 で作成済みのテストを確認・補完）
- **GREEN 確認**: `pnpm --filter @repo/desktop test -- disclosureHandlers` が全テスト PASS

## 実行手順

### 1. 変更前の状態確認

```bash
# placeholder 実装の確認
grep -n "TODO(DI)\|getDisclosureInfo\|aiServiceName\|claude-sonnet" \
  apps/desktop/src/main/ipc/index.ts

# authModeServiceForRuntime の定義箇所を確認（変更不要）
grep -n "authModeServiceForRuntime" apps/desktop/src/main/ipc/index.ts

# IAuthModeService の import 状況確認
grep -n "IAuthModeService\|AuthModeService" apps/desktop/src/main/ipc/index.ts
```

### 2. C-1: `ipc/index.ts` の変更

#### 変更箇所: L907-918 周辺

**変更前（placeholder 実装）**:

```typescript
// TODO(DI): Replace getDisclosureInfo with actual service when available.
track("registerDisclosureHandlers", () =>
  registerDisclosureHandlers({
    mainWindow,
    getDisclosureInfo: async () => ({
      aiServiceName: "anthropic",
      modelName: "claude-sonnet",
      externalDestinations: [],
    }),
  }),
);
```

**変更後（buildDisclosureInfo による動的取得）**:

```typescript
// disclosureHandlers 用の定数・ファクトリ関数
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

#### 追加が必要な import

```typescript
// IAuthModeService が未インポートの場合
import type { IAuthModeService } from "../services/auth/types";

// DisclosureInfo が未インポートの場合
import type { DisclosureInfo } from "../../preload/types";
```

#### 実装上の注意事項

| 注意点                             | 対応                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `authModeServiceForRuntime` の参照 | 既存の変数（L672 付近で定義済み）をそのまま使用。新規作成不要。         |
| `buildDisclosureInfo` の配置場所   | `registerDisclosureHandlers` 呼び出しの直前（同スコープ内）に定義する。 |
| `TODO(DI)` コメントの削除          | placeholder コメントを完全に削除する。                                  |
| `DisclosureInfo` 型の import       | 既存 import ブロックに追加する（重複しないよう確認）。                  |

### 3. C-2: `disclosureHandlers.test.ts` の確認・補完

Phase 4 で作成したテストファイルを確認し、以下の点を補完する：

```bash
# Phase 4 で作成したテストファイルの確認
cat apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts
```

確認ポイント:

- `registerDisclosureHandlers` の import パスが正しいか
- `IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO` の mock が channels.ts の実際の値と一致するか
- `ipcMain.handle` の呼び出し順（`.mock.calls[0]`）が正しいか

### 4. テスト実行（GREEN 確認）

```bash
# テスト実行
pnpm --filter @repo/desktop test -- disclosureHandlers
```

**期待される結果**: 全テストケースが PASS（GREEN）。

### 5. TypeScript 型チェック

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck
```

**期待される結果**: 型エラーなし。

### 6. Lint チェック

```bash
# ESLint
pnpm --filter @repo/desktop lint
```

**期待される結果**: Lint エラーなし。

## 参照資料

| 資料名                  | パス                                              | 説明                              |
| ----------------------- | ------------------------------------------------- | --------------------------------- |
| Phase 2 設計            | `phase-2-design.md`                               | 変更設計（C-1/C-2）の詳細         |
| Phase 3 設計レビュー    | `phase-3-design-review.md`                        | PASS 済みの設計判断               |
| Phase 4 テスト作成      | `phase-4-test-creation.md`                        | テストコードの仕様（再確認用）    |
| placeholder 実装        | `apps/desktop/src/main/ipc/index.ts` L907-918     | 変更対象                          |
| disclosureHandlers 本体 | `apps/desktop/src/main/ipc/disclosureHandlers.ts` | 変更しない（既存実装を維持）      |
| AuthMode 型定義         | `apps/desktop/src/main/services/auth/types.ts`    | IAuthModeService インターフェース |
| DisclosureInfo 型       | `apps/desktop/src/preload/types.ts`               | 戻り値の型定義                    |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果   |
| ---------------------- | ---- | ------ |
| ユニットテストLine     | 80%+ | 未計測 |
| ユニットテストBranch   | 60%+ | 未計測 |
| ユニットテストFunction | 80%+ | 未計測 |
| 全テスト GREEN         | PASS | 未計測 |
| TypeScript 型チェック  | PASS | 未計測 |
| ESLint                 | PASS | 未計測 |

## 成果物

| 成果物                           | パス                                                             | 説明                                     |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| DI 接続差し替え済み ipc/index.ts | `apps/desktop/src/main/ipc/index.ts`                             | buildDisclosureInfo による動的取得に変更 |
| 完成済みテストファイル           | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | GREEN 確認済みのテストファイル           |
| テスト実行結果（GREEN）          | `outputs/phase-5/test-result-green.txt`                          | GREEN 確認の記録（実行後に保存）         |

## 完了条件

- [ ] `ipc/index.ts` の placeholder（`TODO(DI)`）が削除されている
- [ ] `buildDisclosureInfo` 関数が `ipc/index.ts` に追加されている
- [ ] `authModeServiceForRuntime` が `buildDisclosureInfo` に渡されている
- [ ] `disclosureHandlers.test.ts` の全テストが GREEN（PASS）
- [ ] TypeScript 型チェックが PASS
- [ ] ESLint が PASS
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                        | 状態 | 備考                                                     |
| ----------------------------- | ---- | -------------------------------------------------------- |
| 変更前状態確認                | 未   | placeholder L907-918 を確認                              |
| C-1: buildDisclosureInfo 実装 | 未   | ipc/index.ts の placeholder 差し替え                     |
| C-1: import 追加確認          | 未   | IAuthModeService / DisclosureInfo の import 確認         |
| C-2: テストファイル確認・補完 | 未   | Phase 4 作成済みファイルの内容確認                       |
| テスト実行（GREEN 確認）      | 未   | `pnpm --filter @repo/desktop test -- disclosureHandlers` |
| TypeScript 型チェック         | 未   | `pnpm --filter @repo/desktop typecheck`                  |
| ESLint                        | 未   | `pnpm --filter @repo/desktop lint`                       |

## 次のPhase

Phase 6: テスト拡充 → [phase-6-test-expansion.md](phase-6-test-expansion.md)

**ゲート**: 全テスト GREEN・型チェック PASS・ESLint PASS 後にのみ Phase 6 へ進む。
