# Phase 5: 実装

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 5                                      |
| 機能名 | TASK-RT-03-skill-creation-result-panel |
| 作成日 | 2026-04-04                             |

## 目的

`SkillCreationResultPanel.tsx` を新規作成し、`SkillLifecyclePanel.tsx` へ統合する。新規 detail renderer は増やさず、既存の `PlanResultDetailPanel` / `ExecuteResultDetailPanel` / `VerifyResultDetailPanel` を orchestration する wrapper として実装する。Phase 4 のテストが全 GREEN になることを確認する。

**前提条件（Phase 3 以降ゲート）**:

- TASK-RT-02 完了確認: `plan()` / `execute()` がスタブ返却しないこと
- TASK-RT-06 完了確認: `sdkEvents` / `SkillCreatorSdkEvent` の型が安定していること

## 実行タスク

- **事前確認**: 既存テスト baseline GREEN 確認
- **SkillCreationResultPanel.tsx 新規作成**: 既存 detail panel を束ねる wrapper 実装
- **SkillLifecyclePanel.tsx 統合**: 表示タイミング・データ受け渡し実装
- **既存パネル重複整理**: Phase 2 で決定した方針（A or B）を実施
- **typecheck・lint**: NFR-01/NFR-02 確認
- **GREEN確認**: Phase 4 の TC-01〜TC-11 が全て GREEN になることを確認

## 参照資料

| 資料名                 | パス                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| Phase 4 テストファイル | `apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.test.tsx` |
| Phase 2 設計書         | `outputs/phase-2/component-design.md`                                          |
| Phase 2 統合設計書     | `outputs/phase-2/integration-design.md`                                        |
| 型定義                 | `packages/shared/src/types/skillCreator.ts`                                    |
| 統合先                 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`           |

## 実行手順

### ステップ 0: 事前確認

```bash
# 既存テスト baseline GREEN 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel|PlanResultDetail|ExecuteResultDetail|VerifyResultDetail"

# RT-02/RT-06 完了確認（スタブ排除・型安定）
grep -n "stub\|mock\|TODO" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### ステップ 1: 新規作成ファイル・修正ファイル一覧

**新規作成**:

| ファイル                                                                  | 説明                         |
| ------------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.tsx` | メインコンポーネント（新規） |

**修正**:

| ファイル                                                                  | 説明                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | SkillCreationResultPanel を統合                           |
| `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx` | persistResult.skillPath / files / persistError 表示を追加 |

### ステップ 2: SkillCreationResultPanel.tsx 実装

**全体ステータスバッジ判定ロジック**:

```typescript
type OverallStatus =
  | "進行中"
  | "Plan完了"
  | "実行失敗"
  | "検証中"
  | "検証失敗"
  | "完了";

function getOverallStatus(
  planResult: RuntimeSkillCreatorPlanResult | null,
  executeResult: RuntimeSkillCreatorExecuteResult | null,
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null,
): OverallStatus {
  if (!planResult) return "進行中";
  if (!executeResult) return "Plan完了";
  if (!executeResult.success) return "実行失敗";
  if (!verifyDetail || verifyDetail.status === "pending") return "検証中";
  if (verifyDetail.status === "fail") return "検証失敗";
  return "完了";
}
```

**execute detail の補強点**:

- `ExecuteResultDetailPanel` は `persistResult.skillPath` と `persistResult.files` を表示し、生成先と生成されたファイルの一覧を確認できるようにする
- `persistError` がある場合は failure state の補足情報として表示する
- wrapper 側は execute detail の詳細を再実装せず、既存 panel をそのまま呼び出す

**実装構造**:

```typescript
export function SkillCreationResultPanel({
  planResult,
  executeResult,
  verifyDetail,
  onClose,
}: SkillCreationResultPanelProps) {
  const overallStatus = getOverallStatus(planResult, executeResult, verifyDetail);
  const isEmpty = !planResult && !executeResult && !verifyDetail;

  return (
    <section className="...">
      {/* ヘッダー */}
      <OverallStatusBadge status={overallStatus} />

      {isEmpty ? (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          結果がまだありません
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {planResult && <PlanResultDetailPanel planResult={planResult} />}
          {executeResult && (
            <ExecuteResultDetailPanel executeResult={executeResult} />
          )}
          {verifyDetail && <VerifyResultDetailPanel verifyDetail={verifyDetail} />}
        </div>
      )}
    </section>
  );
}
```

### ステップ 3: SkillLifecyclePanel.tsx 統合

```bash
# 既存の Jotai atom フック確認
grep -n "useCurrentPlanResult\|useWorkflowSnapshot\|extractExecuteResult" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

**統合箇所**: `SkillLifecyclePanel` の結果表示エリアに `SkillCreationResultPanel` を追加。表示タイミングは Phase 2 の設計に従う（`planResult` / `executeResult` / `verifyDetail` のいずれかが揃った時点）。`SkillLifecyclePanel` の inline plan / execute / verify 詳細レンダリングは wrapper 採用後に整理し、再検証ボタンは親側のアクションとして維持する。

### ステップ 4: 既存パネル重複整理

Phase 2 で決定した方針（A: 内部から呼び出し / B: 置き換え）を実施する。変更内容を Before/After テーブルで記録する:

| 対象                     | Before                                                   | After                                                                                        | 理由     |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| SkillLifecyclePanel      | plan / execute / verify を個別描画                       | SkillCreationResultPanel に orchestration を集約                                             | 重複排除 |
| PlanResultDetailPanel    | SkillLifecyclePanel から直接使用                         | SkillCreationResultPanel から再利用                                                          | 重複排除 |
| ExecuteResultDetailPanel | persistResult.skillPath / files を表示しない             | persistResult.skillPath / files / persistError を表示し、SkillCreationResultPanel から再利用 | 重複排除 |
| VerifyResultDetailPanel  | SkillLifecyclePanel 内の inline verify / reverify action | SkillCreationResultPanel から再利用しつつ、reverify action は SkillLifecyclePanel に残す     | 重複排除 |

### ステップ 5: 静的解析・テスト実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# テスト（TC-01〜TC-11 が全て GREEN になることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreationResultPanel"

# 既存テスト回帰確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel"
```

## 統合テスト連携【必須】

| 判定項目                                     | 基準    | 結果 |
| -------------------------------------------- | ------- | ---- |
| TC-01〜TC-11 が全て GREEN                    | 100%    | TBD  |
| 既存テスト（SkillLifecyclePanel 等）が GREEN | 100%    | TBD  |
| typecheck PASS                               | 0エラー | TBD  |
| lint PASS                                    | 0エラー | TBD  |

## 成果物

| 成果物                       | パス                                                                      | 説明                   |
| ---------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| メインコンポーネント（新規） | `apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.tsx` | Phase 4 テスト GREEN   |
| SkillLifecyclePanel（修正）  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | 統合済み               |
| 実装サマリー                 | `outputs/phase-5/implementation-summary.md`                               | 作成・修正ファイル一覧 |
| Before/After 記録            | `outputs/phase-5/refactor-record.md`                                      | 重複整理の変更内容     |

## 完了条件

- [ ] `SkillCreationResultPanel.tsx` が新規作成されている
- [ ] TC-01〜TC-11 が全て GREEN
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS（0エラー）
- [ ] `pnpm --filter @repo/desktop lint` が PASS（0エラー）
- [ ] 既存テスト（SkillLifecyclePanel 等）が回帰していない
- [ ] 新規作成・修正ファイル一覧が `outputs/phase-5/implementation-summary.md` に記録されている
- [ ] 既存パネル重複整理の Before/After が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
