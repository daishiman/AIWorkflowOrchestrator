# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 6                                          |
| Phase名    | テスト拡充                                 |
| 前提Phase  | Phase 5                                    |
| 後続Phase  | Phase 7                                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

リグレッション防止のためテストを拡充する。Phase 5 で実装した shared ↔ desktop の single source of truth が将来の変更で壊れないよう、多角的なテスト観点を追加する。

## 背景

Phase 5 で TDD Green フェーズが完了し、基本テストは PASS している。しかし、リグレッション防止には以下の追加テスト観点が必要：

- shared channels.ts の全チャネル定義値テスト（既存含む）
- desktop preload の allowlist にチャネルが含まれることの確認
- renderer hooks での正しいチャネル名使用の確認
- import パス解決の確認

---

## 実行タスク

### タスク1: shared channels.ts の全チャネル定義値テスト

**目的**: 既存チャネルも含め、shared channels.ts の全定義値を網羅的にテストする

**対象ファイル**: `packages/shared/src/ipc/__tests__/channels.test.ts`

**テスト内容**:

- 既存の `CHAT_EXPORT_CHANNELS` / `SKILL_CHANNELS` 等の定義値テストが存在することを確認
- 不足している場合は追加する
- `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` のテストは Phase 4 で作成済みのため、重複しないこと

**確認観点**:

- 全 `*_CHANNELS` オブジェクトのプロパティ数が期待値と一致すること（プロパティ追加漏れ検出）
- 各チャネル値が `namespace:action` 形式であること

---

### タスク2: desktop preload allowlist テスト

**目的**: desktop preload の IPC チャネル allowlist に新チャネルが含まれることを確認する

**対象ファイル**: `apps/desktop/src/preload/channels.test.ts`

**確認内容**:

- `apps/desktop/src/preload/channels.test.ts` の allowlist チェックに `APPROVAL_RESPOND`, `APPROVAL_REQUEST`, `EXECUTION_GET_DISCLOSURE_INFO` が含まれていることを確認
- allowlist ベースの IPC セキュリティが新チャネルを許可していることを検証

**テスト例**:

```typescript
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

it("approval / disclosure channel が allowlist に含まれる", () => {
  expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.APPROVAL_RESPOND);
  expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.APPROVAL_REQUEST);
  expect(ALLOWED_INVOKE_CHANNELS).toContain(
    IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
  );
});
```

---

### タスク3: renderer hooks のチャネル名使用確認

**目的**: renderer 側の hooks（`useApprovalFlow.ts` 等）で正しいチャネル名が使用されていることを確認する

**確認内容**:

- `useApprovalFlow.ts` 内で使用されるチャネル名が shared 正本値と一致することを確認する
- renderer 消費コードの変更はスコープ外のため、この phase では実装を変更せず、必要なら follow-up task として切り出す
- テストが既存で存在する場合は追加不要、不足の場合のみ追加

---

### タスク4: import パス解決の確認

**目的**: `@repo/shared/src/ipc/channels` からの import パスが正しく解決されることを確認する

**確認内容**:

- `apps/desktop/src/preload/channels.ts` の import が `@repo/shared/src/ipc/channels` から解決されていることを確認
- TypeScript コンパイルが成功すること（型レベルでの解決確認）
- Edge case: package.json exports 経由の公開 subpath で解決できること

**実行コマンド**:

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

---

## 参照資料

| 参照資料         | パス                                                 | 内容                       |
| ---------------- | ---------------------------------------------------- | -------------------------- |
| Phase 4 テスト   | `phase-4-test-creation.md`                           | 基本テスト仕様             |
| Phase 5 実装     | `phase-5-implementation.md`                          | 実装内容                   |
| shared channels  | `packages/shared/src/ipc/channels.ts`                | 定義元ファイル             |
| desktop channels | `apps/desktop/src/preload/channels.ts`               | import 元変更済みファイル  |
| useApprovalFlow  | `apps/desktop/src/renderer/hooks/useApprovalFlow.ts` | renderer hooks（参照確認） |

---

## 統合テスト連携（Phase 6）

- 統合テストの拡充: shared ↔ desktop ↔ renderer の 3 層にまたがるチャネル名一貫性を確認
- allowlist テストにより、IPC セキュリティ境界でのチャネル許可を保証
- renderer hooks テストにより、エンドユーザーに到達するまでの経路全体をカバー

---

## 成果物

| 成果物           | パス                                                 | 内容                   |
| ---------------- | ---------------------------------------------------- | ---------------------- |
| 拡充テスト       | `packages/shared/src/ipc/__tests__/channels.test.ts` | 全チャネル定義値テスト |
| allowlist テスト | `apps/desktop/src/preload/channels.test.ts`          | preload allowlist 確認 |
| テスト実行結果   | `outputs/phase-6/test-expansion-result.md`           | 全テスト PASS 結果     |

---

## 完了条件

- [ ] shared channels.ts の全チャネル定義値がテストされている
- [ ] desktop preload allowlist に新チャネルが含まれることがテストされている
- [ ] renderer hooks のチャネル名使用が確認されている
- [ ] `@repo/shared/src/ipc/channels` からの import パス解決が確認されている
- [ ] 全テストが PASS する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 7: カバレッジ確認 → `phase-7-coverage-check.md`
