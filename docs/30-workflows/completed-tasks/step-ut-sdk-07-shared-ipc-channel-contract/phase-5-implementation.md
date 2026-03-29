# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| Phase名    | 実装                                       |
| 前提Phase  | Phase 4                                    |
| 後続Phase  | Phase 6                                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

shared 側に `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` を追加し、desktop 側の import を変更することで、IPC channel の single source of truth を実現する。TDD Green フェーズとして、Phase 4 で作成した全テストを PASS させる。

## 背景

Phase 4 で TDD Red フェーズが完了し、テストが FAIL 状態にある。本 Phase では設計（Phase 2）に基づいて実装を行い、テストを Green にする。変更は 2 ファイルに限定され、既存の `*_CHANNELS` パターンに厳密に従う。

---

## 実行タスク

### タスク1: shared 側にチャネル定義を追加

**目的**: `packages/shared/src/ipc/channels.ts` に `APPROVAL_CHANNELS` と `EXECUTION_CHANNELS` を追加する

**対象ファイル**: `packages/shared/src/ipc/channels.ts`

**追加内容**:

```typescript
export const APPROVAL_CHANNELS = {
  APPROVAL_RESPOND: "approval:respond",
  APPROVAL_REQUEST: "approval:request",
} as const;

export const EXECUTION_CHANNELS = {
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
} as const;
```

**注意事項**:

- 既存の `CHAT_EXPORT_CHANNELS` / `SKILL_CHANNELS` と同じ `as const` assertion パターンに従う
- グルーピングは approval 系と execution 系で分離する
- ファイル末尾に追加し、既存定義の順序を変更しない

---

### タスク2: desktop 側の import を変更

**目的**: `apps/desktop/src/preload/channels.ts` のローカル定義を shared からの import に変更する

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

**変更内容**:

```typescript
// import 追加
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
} from "@repo/shared/src/ipc/channels";

// IPC_CHANNELS 内の該当箇所を変更
// BEFORE:
//   APPROVAL_RESPOND: 'approval:respond',
//   APPROVAL_REQUEST: 'approval:request',
//   EXECUTION_GET_DISCLOSURE_INFO: 'execution:get-disclosure-info',

// AFTER:
//   APPROVAL_RESPOND: APPROVAL_CHANNELS.APPROVAL_RESPOND,
//   APPROVAL_REQUEST: APPROVAL_CHANNELS.APPROVAL_REQUEST,
//   EXECUTION_GET_DISCLOSURE_INFO: EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
```

**注意事項**:

- `IPC_CHANNELS` オブジェクトの他のプロパティには一切変更を加えない
- import パスが `@repo/shared/src/ipc/channels` であることを確認（package.json exports の公開 subpath）

---

### タスク3: shared package の export 確認

**目的**: 新定義が shared package の公開 subpath から参照可能であることを確認する

**確認内容**:

- `packages/shared/package.json` の `exports` に `./src/ipc/channels` が含まれていることを確認する
- root barrel への追加 re-export は行わず、`@repo/shared/src/ipc/channels` を正として扱う

---

### タスク4: ビルド確認

**目的**: shared → desktop の import パスが Electron バンドルで正しく解決されることを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/shared build && pnpm --filter @repo/desktop build
```

**期待結果**: ビルドエラーなしで完了する。

---

### タスク5: テスト実行（Green フェーズ確認）

**目的**: Phase 4 で作成した全テストが PASS することを確認する

**実行コマンド**:

```bash
# shared 定義値テスト
pnpm --filter @repo/shared test -- --run src/ipc/__tests__/channels.test.ts

# preload allowlist テスト
pnpm --filter @repo/desktop test -- --run src/preload/channels.test.ts

# governance-bundle parity テスト
pnpm --filter @repo/desktop test -- --run src/main/services/runtime/__tests__/governance-bundle.test.ts

# preload surface / main handler regression
pnpm --filter @repo/desktop test -- --run src/preload/__tests__/skill-creator-api.governance.test.ts src/main/ipc/__tests__/approvalHandlers.test.ts
```

**期待結果**: 全テストが PASS する（TDD Green フェーズ完了）。

---

## 参照資料

| 参照資料         | パス                                   | 内容                         |
| ---------------- | -------------------------------------- | ---------------------------- |
| Phase 2 設計     | `phase-2-design.md`                    | 同期方式・import 戦略        |
| Phase 4 テスト   | `phase-4-test-creation.md`             | テスト仕様・Red フェーズ     |
| shared channels  | `packages/shared/src/ipc/channels.ts`  | 既存チャネル定義（変更対象） |
| desktop channels | `apps/desktop/src/preload/channels.ts` | 現在の独自定義（変更対象）   |

---

## 統合テスト連携（Phase 5）

- フロント/バック接続の確認: desktop preload が shared からの import で正しくチャネル名を解決できることをビルド通過で検証
- `@repo/shared` → `@repo/desktop` の package boundary を超えた import が Electron バンドラーで解決されることを確認
- parity テスト PASS により、shared ↔ desktop 間の契約が成立

---

## 成果物

| 成果物                 | パス                                    | 内容                    |
| ---------------------- | --------------------------------------- | ----------------------- |
| shared channels 更新   | `packages/shared/src/ipc/channels.ts`   | APPROVAL/EXECUTION 定義 |
| desktop channels 更新  | `apps/desktop/src/preload/channels.ts`  | import 元変更           |
| ビルド確認ログ         | `outputs/phase-5/build-result.md`       | ビルド成功確認          |
| Green フェーズ確認ログ | `outputs/phase-5/green-phase-result.md` | テスト PASS 結果        |

---

## 完了条件

- [ ] `packages/shared/src/ipc/channels.ts` に `APPROVAL_CHANNELS` が追加されている
- [ ] `packages/shared/src/ipc/channels.ts` に `EXECUTION_CHANNELS` が追加されている
- [ ] `apps/desktop/src/preload/channels.ts` が shared からの import に変更されている
- [ ] `packages/shared/package.json` の exports で `@repo/shared/src/ipc/channels` が公開されている
- [ ] `pnpm --filter @repo/shared build` がエラーなしで完了する
- [ ] `pnpm --filter @repo/desktop build` がエラーなしで完了する
- [ ] Phase 4/6 で作成・拡張した全テストが PASS する（Green フェーズ）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 6: テスト拡充 → `phase-6-test-expansion.md`
