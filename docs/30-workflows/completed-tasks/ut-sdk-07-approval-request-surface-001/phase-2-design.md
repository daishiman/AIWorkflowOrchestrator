# Phase 2: 設計

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 2                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 1                                     |
| 後続Phase  | Phase 3                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

`onApprovalRequest` の追加に必要なアーキテクチャ・IPC契約・テスト戦略を設計し、既存の `ApprovalSheet` を再利用しながら Phase 3 ゲート通過可能な設計書を作成する。

## 背景

Phase 1 で確定した要件に基づき、以下の設計判断を行う：

- `skill-creator-api.ts` の `SkillCreatorAPI` interface 拡張設計
- `safeOn` による `APPROVAL_REQUEST` チャンネル購読の実装設計
- `SkillLifecyclePanel.tsx` での `ApprovalSheet` 再利用と approval UI 表示設計

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                          |
| ---------- | --------------- | ------------------------------- |
| SubAgent-A | Preload/API設計 | interface 拡張・safeOn 実装設計 |
| SubAgent-B | Renderer/UI設計 | SkillLifecyclePanel UI 設計     |
| SubAgent-C | テスト設計      | テスト戦略・モック設計          |
| SubAgent-D | 統合設計        | 責務境界・依存関係・型整合設計  |

## 実行タスク

- アーキテクチャ設計: Preload/Renderer/IPC の責務境界を設計する
- IPC契約設計: `onApprovalRequest` の型シグネチャと `ALLOWED_ON_CHANNELS` 整合を確認する
- UI設計: `SkillLifecyclePanel.tsx` の approval request 表示ロジックを設計する
- テスト戦略: Unit/Integration テストの分割戦略を設計する
- 依存整合マトリクス: 変更ファイル間の依存関係を定義する

## 設計詳細

### アーキテクチャ設計

```
[Main Process]
  approvalHandlers.ts
    └─ mainWindow.webContents.send(APPROVAL_REQUEST, payload)
          │
          ▼ IPC push
[Preload Layer]
  skill-creator-api.ts
    └─ onApprovalRequest(callback) ← 【追加】
         └─ safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)
              │
              ▼ Renderer へ転送
[Renderer Layer]
  SkillLifecyclePanel.tsx
    └─ getSkillCreatorApi().onApprovalRequest(handler) ← 【接続】
         └─ pendingApproval state
              └─ ApprovalSheet 再利用
                   └─ respondToApproval(sessionId, operationId, action)
```

### 型設計

```typescript
// SkillCreatorAPI インターフェース追加メソッド
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => () => void;

// payload は preload/types.ts の execution approval shape と揃える
```

### 実装設計（skill-creator-api.ts）

```typescript
// SkillCreatorAPI interface に追加
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => () => void;

// skillCreatorAPI オブジェクトに追加
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

### SkillLifecyclePanel.tsx 設計

- `getSkillCreatorApi()` で `window.electronAPI?.skillCreator` / `window.skillCreatorAPI` を吸収する
- `useEffect` 内で `skillCreatorApi.onApprovalRequest` を購読する
- `useState<{ operationType: string; description: string; destination?: string; sessionId: string; operationId: string } | null>` で pending approval 状態を保持する
- `ApprovalSheet` を再利用し、approve/reject は `respondToApproval` に接続する
- `ApprovalSheet` に表示する disclosure 情報は既存の `disclosureInfo` state を流用する
- cleanup: `useEffect` の return で unsubscribe 関数を呼び出す

## 参照資料

| 参照資料                 | パス                                                                 | 説明                        |
| ------------------------ | -------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義書       | `outputs/phase-1/requirements-definition.md`                         | Phase 1 成果物              |
| Phase 1 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`                             | Phase 1 成果物              |
| Phase 1 トレーサビリティ | `outputs/phase-1/traceability-matrix.md`                             | Phase 1 成果物              |
| 汎用 Preload API         | `apps/desktop/src/preload/index.ts`                                  | onApprovalRequest 参照実装  |
| skill-creator-api.ts     | `apps/desktop/src/preload/skill-creator-api.ts`                      | 拡張対象                    |
| IPC チャンネル定義       | `apps/desktop/src/preload/channels.ts`                               | ALLOWED_ON_CHANNELS 確認    |
| SkillLifecyclePanel      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | UI接続先                    |
| ApprovalSheet            | `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`   | 既存 approval UI の再利用先 |
| useApprovalFlow          | `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`                 | execution console の対照例  |

## テスト戦略概要

| テスト種別  | 対象                      | 戦略                                     |
| ----------- | ------------------------- | ---------------------------------------- |
| Unit        | `skill-creator-api.ts`    | `safeOn` が正しいチャンネルで呼ばれるか  |
| Unit        | `SkillLifecyclePanel.tsx` | onApprovalRequest 接続・UI 表示・cleanup |
| Integration | Preload → Renderer 疎通   | IPC push → callback 呼び出し             |

## 依存関係設計

```
変更ファイル:
  1. apps/desktop/src/preload/skill-creator-api.ts  ← interface + 実装追加
  2. apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx ← UI接続（ApprovalSheet 再利用）

型依存:
  - approval request payload shape: shared ではなく preload / renderer の local alias として扱う
  - IPC_CHANNELS.APPROVAL_REQUEST: preload/channels.ts（既存定数）

変更不要:
  - packages/shared/src/ipc/channels.ts（APPROVAL_CHANNELS 定義済み）
  - apps/desktop/src/preload/channels.ts（ALLOWED_ON_CHANNELS 登録済み）
  - apps/desktop/src/main/ipc/approvalHandlers.ts（Main 側は変更不要）
```

## 成果物

| 成果物             | パス                                               | 説明                         |
| ------------------ | -------------------------------------------------- | ---------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | 責務境界・レイヤー設計       |
| IPC契約設計        | `outputs/phase-2/ipc-contract-design.md`           | 型シグネチャ・チャンネル設計 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | Unit/Integration テスト方針  |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 変更ファイル依存関係         |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] アーキテクチャ設計で Preload/Renderer/IPC の責務境界が明確化されている
- [ ] IPC契約設計で型シグネチャが `preload/index.ts` と対称であることが確認済み
- [ ] `ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` が登録済みであることを確認
- [ ] テスト戦略が定義されている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 統合テスト連携

本 Phase の IPC 契約設計（`APPROVAL_CHANNELS.APPROVAL_REQUEST`・`safeOn` パターン）は Phase 4 テストケース TC-APPR-01〜05 の設計根拠として使用される。
テスト戦略（Phase 2 成果物）は Phase 4〜6 のテスト実装方針を規定する。

## 次のPhase

Phase 3: 設計レビューゲート
