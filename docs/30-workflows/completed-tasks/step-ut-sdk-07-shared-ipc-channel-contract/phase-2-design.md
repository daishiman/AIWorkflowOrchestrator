# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| Phase名    | 設計                                       |
| 前提Phase  | Phase 1                                    |
| 後続Phase  | Phase 3                                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

shared ↔ desktop 間の IPC channel parity drift を解消するための設計方針、修正トポロジー、テスト戦略を策定する。

## 背景

Phase 1 の P50 チェックで以下が確認された：

- `packages/shared/src/ipc/channels.ts` に `APPROVAL_RESPOND`, `APPROVAL_REQUEST`, `EXECUTION_GET_DISCLOSURE_INFO` が**未定義**
- `apps/desktop/src/preload/channels.ts` にはこれらが独自定義済み
- desktop 側は shared を import せず、ローカルで文字列定数を保持している

---

## 実行タスク

### タスク1: チャネル定義の同期方式設計

**目的**: shared → desktop の single source of truth を実現する方式を決定する

**設計決定**:

#### 方式: shared 側に定義を追加し、desktop 側から import する

```
packages/shared/src/ipc/channels.ts  ← 定義元（追加）
    ↓ import
apps/desktop/src/preload/channels.ts ← 利用側（import に変更）
```

**理由**:

- 既存の shared channels（`CHAT_EXPORT_CHANNELS`, `SKILL_CHANNELS` 等）と同じパターンに従う
- desktop 側の独自定義を削除し、import に置き換えることで drift を構造的に防止
- `@repo/shared/src/ipc/channels` は package.json の公開 subpath なので、desktop preload から直接参照できる

#### shared 側の追加定義設計

```typescript
// packages/shared/src/ipc/channels.ts に追加
export const APPROVAL_CHANNELS = {
  APPROVAL_RESPOND: "approval:respond",
  APPROVAL_REQUEST: "approval:request",
} as const;

export const EXECUTION_CHANNELS = {
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
} as const;
```

**設計判断ポイント**:

- グルーピング: approval 系と execution 系は関心の分離に従い別オブジェクトとする
- 命名: 既存パターン（`*_CHANNELS`）に準拠
- `as const` assertion: 文字列リテラル型を保持（型安全性）

#### desktop 側の import 変更設計

```typescript
// apps/desktop/src/preload/channels.ts
// BEFORE（現在）:
//   APPROVAL_RESPOND: 'approval:respond',
//   APPROVAL_REQUEST: 'approval:request',
//   EXECUTION_GET_DISCLOSURE_INFO: 'execution:get-disclosure-info',

// AFTER（変更後）:
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
} from "@repo/shared/src/ipc/channels";

// IPC_CHANNELS オブジェクト内で spread or 直接参照
// APPROVAL_RESPOND: APPROVAL_CHANNELS.APPROVAL_RESPOND,
// APPROVAL_REQUEST: APPROVAL_CHANNELS.APPROVAL_REQUEST,
// EXECUTION_GET_DISCLOSURE_INFO: EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
```

---

### タスク2: テスト設計

**目的**: parity drift の再発を検出するテスト戦略を設計する

#### テスト観点マトリクス

| #   | テスト観点                            | テスト種別    | 配置先                                                                       |
| --- | ------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| 1   | shared 定義値の一致テスト             | ユニット      | `packages/shared/src/ipc/__tests__/channels.test.ts`                         |
| 2   | desktop preload allowlist テスト      | ユニット      | `apps/desktop/src/preload/channels.test.ts`                                  |
| 3   | cross-layer parity テスト             | 統合          | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` |
| 4   | channel separation assertion          | ユニット      | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` |
| 5   | desktop import 元が shared であること | 静的解析/lint | 既存 lint ルール                                                             |

#### テスト1: shared 定義値テスト（新規）

```typescript
// packages/shared/src/ipc/__tests__/channels.test.ts
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
} from "@repo/shared/src/ipc/channels";

describe("APPROVAL_CHANNELS", () => {
  it('APPROVAL_RESPOND は "approval:respond"', () => {
    expect(APPROVAL_CHANNELS.APPROVAL_RESPOND).toBe("approval:respond");
  });
  it('APPROVAL_REQUEST は "approval:request"', () => {
    expect(APPROVAL_CHANNELS.APPROVAL_REQUEST).toBe("approval:request");
  });
});

describe("EXECUTION_CHANNELS", () => {
  it('EXECUTION_GET_DISCLOSURE_INFO は "execution:get-disclosure-info"', () => {
    expect(EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
      "execution:get-disclosure-info",
    );
  });
});
```

#### テスト2: cross-layer parity テスト（governance-bundle.test.ts 観点5拡張）

```typescript
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
} from "@repo/shared/src/ipc/channels";
import { IPC_CHANNELS } from "../../../../preload/channels";

// 観点5 に追加
it("shared と desktop で同一チャネル名が使用されている", () => {
  expect(IPC_CHANNELS.APPROVAL_RESPOND).toBe(
    APPROVAL_CHANNELS.APPROVAL_RESPOND,
  );
  expect(IPC_CHANNELS.APPROVAL_REQUEST).toBe(
    APPROVAL_CHANNELS.APPROVAL_REQUEST,
  );
  expect(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
    EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
  );
});
```

---

### タスク3: 影響範囲分析

**目的**: 変更による影響を事前に把握する

| 変更対象ファイル                                                             | 変更内容       | リスク |
| ---------------------------------------------------------------------------- | -------------- | ------ |
| `packages/shared/src/ipc/channels.ts`                                        | 定義追加       | 低     |
| `apps/desktop/src/preload/channels.ts`                                       | import 元変更  | 中     |
| `apps/desktop/src/preload/channels.test.ts`                                  | allowlist 追加 | 低     |
| `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | assertion 追加 | 低     |
| `packages/shared/src/ipc/__tests__/channels.test.ts`                         | テスト新規作成 | 低     |

**リスク「中」の詳細**: desktop preload は Electron の contextBridge 経由で renderer に公開されるため、import パス変更時にバンドル解決が失敗する可能性がある。ビルド確認が必須。

---

## 参照資料

| 参照資料                 | パス                                   | 内容                     |
| ------------------------ | -------------------------------------- | ------------------------ |
| Phase 1 要件定義         | `phase-1-requirements.md`              | スコープ・受入基準       |
| shared channels          | `packages/shared/src/ipc/channels.ts`  | 既存チャネル定義パターン |
| desktop preload channels | `apps/desktop/src/preload/channels.ts` | 現在の独自定義           |

---

## 統合テスト連携（Phase 2）

- 統合ポイント: `@repo/shared` → `@repo/desktop` の package boundary
- 契約: shared で export した定数が desktop preload で正しく参照できること
- ビルド検証: `pnpm --filter @repo/desktop build` でバンドル解決エラーがないこと

---

## 成果物

| 成果物       | パス                                   | 内容                     |
| ------------ | -------------------------------------- | ------------------------ |
| 設計書       | `outputs/phase-2/design.md`            | 同期方式・import 戦略    |
| テスト設計   | `outputs/phase-2/validation-matrix.md` | テスト観点マトリクス     |
| 影響範囲分析 | `outputs/phase-2/topology-diagram.md`  | 変更ファイル・リスク一覧 |

---

## 完了条件

- [ ] shared → desktop の同期方式が決定されている
- [ ] チャネルグルーピング・命名規則が既存パターンに準拠している
- [ ] テスト観点マトリクスが定義されている
- [ ] 影響範囲（変更ファイル・リスク）が分析されている
- [ ] ビルド・バンドル解決のリスクが認識されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 3: 設計レビューゲート → `phase-3-design-review.md`
