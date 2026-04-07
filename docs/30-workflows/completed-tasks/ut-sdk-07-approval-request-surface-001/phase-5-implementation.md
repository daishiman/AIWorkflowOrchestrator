# Phase 5: 実装

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 5                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 4                                     |
| 後続Phase  | Phase 6                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

Phase 4 で作成した Red テストを Green へ移行するための最小実装を行う。

## 背景

Phase 3 ゲートを通過した設計に従い、以下のファイルを実装する：

1. `apps/desktop/src/preload/skill-creator-api.ts` — `onApprovalRequest` を interface と実装に追加
2. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — `ApprovalSheet` を再利用して approval request UI を接続

## 実装計画（新規作成 / 修正ファイル一覧）

| 種別 | ファイルパス                                                         | 変更内容                                                  |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| 修正 | `apps/desktop/src/preload/skill-creator-api.ts`                      | SkillCreatorAPI interface + 実装に onApprovalRequest 追加 |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | onApprovalRequest 購読・ApprovalSheet 再利用・cleanup     |

**変更不要ファイル（確認済み）:**

- `apps/desktop/src/preload/channels.ts` — ALLOWED_ON_CHANNELS に APPROVAL_REQUEST 登録済み
- `packages/shared/src/ipc/channels.ts` — APPROVAL_CHANNELS 定義済み
- `apps/desktop/src/main/ipc/approvalHandlers.ts` — Main 側変更不要

## canUseTool 適用範囲と制約（Phase 5 必須記載）

本タスクは `skill-creator-api.ts` と `SkillLifecyclePanel.tsx` の直接編集であり、LLM Adapter 経由の `improve()` フローは適用しない。SDK callback の canUseTool は対象外。

## SubAgentチーム編成

| SubAgent   | 関心ごと      | 主担当                                             |
| ---------- | ------------- | -------------------------------------------------- |
| SubAgent-A | Preload 実装  | SkillCreatorAPI interface + safeOn 実装            |
| SubAgent-B | Renderer 実装 | SkillLifecyclePanel onApprovalRequest 接続         |
| SubAgent-C | 型整合確認    | approval request payload shape の local alias 確認 |
| SubAgent-D | 統合確認      | Green 移行確認・契約差分監査                       |

## 実装手順

1. `skill-creator-api.ts` を修正する：
   - `SkillCreatorAPI` interface に `onApprovalRequest` メソッドを追加する
   - `skillCreatorAPI` オブジェクトに `onApprovalRequest` の実装を追加する
   - approval request payload shape は `{ operationType, description, destination?, sessionId, operationId }` として local alias で定義する

2. `SkillLifecyclePanel.tsx` を修正する：
   - `getSkillCreatorApi()` を経由して `window.electronAPI?.skillCreator` / `window.skillCreatorAPI` を購読する
   - `useState<{ operationType: string; description: string; destination?: string; sessionId: string; operationId: string } | null>` で `pendingApproval` 状態を追加する
   - `ApprovalSheet` を条件付きレンダリングで表示する
   - approve/reject 操作を `respondToApproval` に接続する
   - disclosure 情報は既存の `disclosureInfo` state を流用する
   - `useEffect` の return でアンサブスクライブ関数を呼び出す

3. `pnpm typecheck` を実行して型エラーがないことを確認する。
4. Vitest を実行して TC-APPR-01〜10 が Green になることを確認する。

## 実装コードイメージ

### skill-creator-api.ts（SkillCreatorAPI interface への追加）

```typescript
// TASK-SDK-07: onApprovalRequest — approval:request push 購読
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => () => void;
```

### skill-creator-api.ts（skillCreatorAPI オブジェクトへの追加）

```typescript
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
): (() => void) =>
  safeOn<{
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }>(
    IPC_CHANNELS.APPROVAL_REQUEST,
    callback,
  ),
```

### SkillLifecyclePanel.tsx（状態 + useEffect）

```typescript
const [pendingApproval, setPendingApproval] = useState<{
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
} | null>(null);

useEffect(() => {
  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.onApprovalRequest) {
    return;
  }

  const unsubscribe = skillCreatorApi.onApprovalRequest((payload) => {
    setPendingApproval(payload);
  });
  return unsubscribe;
}, []);
```

## 参照資料

| 参照資料           | パス                                       | 説明           |
| ------------------ | ------------------------------------------ | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`    | Phase 4 成果物 |
| Red結果            | `outputs/phase-4/red-test-result.md`       | Phase 4 成果物 |
| 統合テスト計画     | `outputs/phase-4/integration-test-plan.md` | Phase 4 成果物 |
| IPC契約設計        | `outputs/phase-2/ipc-contract-design.md`   | Phase 2 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`   | Phase 2 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                |
| ---------------- | ------------------------------------------- | ------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容と差分要約  |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル    |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 型・IPC契約差分記録 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 「新規作成/修正」ファイルパス一覧が実装サマリーに記載されている
- [ ] canUseTool 適用範囲が明記されている
- [ ] TC-APPR-01〜10 が全て Green であることを確認
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] 矛盾がないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 実行タスク

- `skill-creator-api.ts` に `onApprovalRequest` メソッドを追加（interface + 実装）
- `SkillLifecyclePanel.tsx` に `pendingApproval` state・useEffect・ApprovalSheet 条件レンダリングを追加
- `pnpm vitest run` で TC-APPR-01〜10 全件 Green を確認

## 統合テスト連携

Phase 4 で作成した TC-APPR-01〜10 が本 Phase で Green になることを確認する。
Phase 6 テスト拡充（TC-APPR-11〜18）の基盤として本 Phase の実装を使用する。

## 次のPhase

Phase 6: テスト拡充
