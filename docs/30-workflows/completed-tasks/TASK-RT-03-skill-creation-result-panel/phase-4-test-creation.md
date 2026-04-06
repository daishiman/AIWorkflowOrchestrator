# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 4                                      |
| 機能名 | TASK-RT-03-skill-creation-result-panel |
| 作成日 | 2026-04-04                             |

## 目的

TDD Red フェーズとして `SkillCreationResultPanel.test.tsx` のテストケースを作成する。Phase 2 の部分成功判定テーブルと1:1対応するテストを設計し、実装前に全テストが RED（失敗）状態になることを確認する。

## 実行タスク

- **事前確認**: 既存ユーティリティ重複検出・命名規則との整合確認
- **テストファイル作成**: `SkillCreationResultPanel.test.tsx`
- **全11ケース実装**: TC-01〜TC-11 を全て記述
- **RED確認**: テスト実行して全ケースが RED になることを確認

## 参照資料

| 資料名               | パス                                                    |
| -------------------- | ------------------------------------------------------- |
| Phase 2 設計書       | `outputs/phase-2/component-design.md`                   |
| 部分成功判定テーブル | `outputs/phase-2/status-matrix.md`                      |
| 既存テスト参考       | `apps/desktop/src/renderer/components/skill/*.test.tsx` |
| 命名規則記録         | `outputs/phase-1/type-investigation.md`                 |

## 実行手順

### ステップ 0: 事前確認

```bash
# 命名規則との整合確認（Phase 1 記録と照合）
grep -n "export interface.*Props" apps/desktop/src/renderer/components/skill/*.tsx

# 既存テストのセットアップパターン確認
grep -n "import\|render\|screen\|describe\|it(" \
  apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.test.tsx 2>/dev/null | head -20

# verify detail の既存テストパターン確認
grep -n "import\|render\|screen\|describe\|it(" \
  apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.test.tsx 2>/dev/null | head -20

# execute 詳細の既存テストパターン確認
grep -n "import\|render\|screen\|describe\|it(" \
  apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.test.tsx 2>/dev/null | head -20
```

**IPC レスポンス形式の事前合意**: 本タスクは UI コンポーネントの純粋テストのため、IPC ハンドラは関係しない。props に直接データを渡す形でテストする。

### ステップ 1: テストファイル作成

**配置先**: `apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.test.tsx`

**テストフィクスチャ定義**:

```typescript
// テスト用フィクスチャ
const mockPlanResult: RuntimeSkillCreatorPlanResult = {
  planId: "plan-test-001",
  skillSpec: "test skill spec",
  estimatedSteps: 3,
  skillName: "test-skill",
  description: "テスト用スキル",
  agents: [
    { name: "agent-1", role: "executor" },
    { name: "agent-2", role: "reviewer" },
  ],
  scripts: [{ name: "run.sh", purpose: "実行スクリプト" }],
  triggers: ["on:push", "on:manual"],
  anchors: ["anchor-1"],
};

const mockExecuteResultSuccess: RuntimeSkillCreatorExecuteResult = {
  executeId: "exec-test-001",
  skillName: "test-skill",
  success: true,
  persistResult: {
    skillPath: ".claude/skills/test-skill",
    files: [
      ".claude/skills/test-skill/SKILL.md",
      ".claude/skills/test-skill/agents/main.md",
    ],
  },
  persistError: null,
  sessionId: "session-test-001",
};

const mockExecuteResultFailure: RuntimeSkillCreatorExecuteResult = {
  executeId: "exec-test-002",
  skillName: "test-skill",
  success: false,
  error: "実行中にエラーが発生しました",
  persistResult: null,
  persistError: "ファイル書き出しに失敗しました",
};

const mockVerifyDetailPass: RuntimeSkillCreatorVerifyDetail = {
  planId: "plan-test-001",
  currentPhase: "verify",
  status: "pass",
  checks: [
    {
      id: "L1-01",
      layer: "layer1",
      severity: "info",
      summary: "構造チェック PASS",
    },
    {
      id: "L2-01",
      layer: "layer2",
      severity: "info",
      summary: "内容チェック PASS",
    },
  ],
  evidenceCount: 5,
  route: {
    type: "integrated_api",
    summary: "通常の integrated_api ルート",
    permissionMode: "default",
  },
  reverifyEligible: true,
  delegatedGovernanceNote: "通常経路のため追加のガバナンス委譲は不要",
  delegatedSessionNote: "session-test-001 の verify detail",
};

const mockVerifyDetailFail: RuntimeSkillCreatorVerifyDetail = {
  planId: "plan-test-001",
  currentPhase: "verify",
  status: "fail",
  checks: [
    {
      id: "L1-01",
      layer: "layer1",
      severity: "info",
      summary: "構造チェック PASS",
    },
    {
      id: "L3-01",
      layer: "layer3",
      severity: "error",
      summary: "品質チェック FAIL",
    },
    {
      id: "L4-01",
      layer: "layer4",
      severity: "warning",
      summary: "整合性 WARNING",
    },
  ],
  evidenceCount: 3,
  route: {
    type: "integrated_api",
    summary: "improve へ進む integrated_api ルート",
    permissionMode: "default",
  },
  reverifyEligible: false,
  delegatedGovernanceNote: "layer3/4 の指摘を改善へ引き継ぐ",
  delegatedSessionNote: "session-test-001 の verify detail",
  nextAction: "improve",
};
```

> 補足: `TC-10` は `within()` を使って `skill-lifecycle-verify-check-*` の内部だけを scoped に検証する。
> テスト実装時は `within` を `@testing-library/react` から import する。

### ステップ 2: テストケース実装（TC-01〜TC-11）

```typescript
describe("SkillCreationResultPanel", () => {
  // TC-01: 全props が null（初期状態）
  it("TC-01: 全props が null の場合にエラーなく描画される", () => {
    render(
      <SkillCreationResultPanel
        planResult={null}
        executeResult={null}
        verifyDetail={null}
      />,
    );
    expect(screen.getByText("結果がまだありません")).toBeInTheDocument();
  });

  // TC-02: planResult のみあり
  it("TC-02: planResult のみ渡された場合に plan セクションが表示される", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={null}
        verifyDetail={null}
      />,
    );
    expect(screen.getByText("test-skill")).toBeInTheDocument();
  });

  // TC-03: planResult の各フィールド表示
  it("TC-03: planResult の agents 一覧と scripts 一覧が表示される", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={null}
        verifyDetail={null}
      />,
    );
    expect(screen.getByText("agent-1")).toBeInTheDocument();
    expect(screen.getByText("run.sh")).toBeInTheDocument();
  });

  // TC-04: executeResult 成功
  it("TC-04: executeResult.success=true の場合に成功表示になる", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultSuccess}
        verifyDetail={null}
      />,
    );
    // 成功ステータスの表示確認
  });

  // TC-05: persistResult.skillPath / files の表示
  it("TC-05: executeResult.persistResult.skillPath と files が表示される", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultSuccess}
        verifyDetail={null}
      />,
    );
    expect(screen.getByText(".claude/skills/test-skill")).toBeInTheDocument();
    expect(
      screen.getByText(".claude/skills/test-skill/SKILL.md"),
    ).toBeInTheDocument();
  });

  // TC-06: executeResult 失敗
  it("TC-06: executeResult.success=false の場合に失敗表示になる", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultFailure}
        verifyDetail={null}
      />,
    );
    // 失敗ステータスの表示確認
  });

  // TC-07: エラーメッセージ表示
  it("TC-07: executeResult.error が表示される", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultFailure}
        verifyDetail={null}
      />,
    );
    expect(
      screen.getByText("実行中にエラーが発生しました"),
    ).toBeInTheDocument();
  });

  // TC-08: verifyDetail pass → 全体ステータス「完了」
  it("TC-08: verifyDetail.status=pass の場合に全体ステータスが「完了」になる", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultSuccess}
        verifyDetail={mockVerifyDetailPass}
      />,
    );
    expect(screen.getByText("完了")).toBeInTheDocument();
  });

  // TC-09: verifyDetail fail → layer ごとにチェック一覧表示
  it("TC-09: verifyDetail.status=fail の場合に checks が layer ごとに表示される", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultSuccess}
        verifyDetail={mockVerifyDetailFail}
      />,
    );
    expect(screen.getByText("構造チェック PASS")).toBeInTheDocument();
    expect(screen.getByText("品質チェック FAIL")).toBeInTheDocument();
  });

  // TC-10: severity=error のバッジ表示
  it("TC-10: severity=error のチェックが適切なバッジで表示される", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultSuccess}
        verifyDetail={mockVerifyDetailFail}
      />,
    );
    // severity=error のバッジが check article 内で表示されていることを確認
    const errorCheck = screen.getByTestId("skill-lifecycle-verify-check-L3-01");
    expect(within(errorCheck).getByText("error")).toBeInTheDocument();
  });

  // TC-11: 部分成功（execute成功 + verify失敗）→ 「検証失敗」バッジ
  it("TC-11: executeResult.success=true かつ verifyDetail.status=fail の場合に「検証失敗」バッジが表示される", () => {
    render(
      <SkillCreationResultPanel
        planResult={mockPlanResult}
        executeResult={mockExecuteResultSuccess}
        verifyDetail={mockVerifyDetailFail}
      />,
    );
    expect(screen.getByText("検証失敗")).toBeInTheDocument();
  });
});
```

### ステップ 3: RED確認

```bash
# テスト実行（全ケースが RED になることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreationResultPanel"
```

**期待結果**: `SkillCreationResultPanel` が存在しないため全11ケースがコンパイルエラーまたは RED になる。

## 統合テスト連携【必須】

| 判定項目                                | 基準 | 結果 |
| --------------------------------------- | ---- | ---- |
| TC-01〜TC-11 が全て定義されている       | 11件 | TBD  |
| 各テストが部分成功判定テーブルと1:1対応 | ✅   | TBD  |
| 命名規則（PascalCase, \*Props型）と整合 | ✅   | TBD  |
| フィクスチャが Phase 1 の型定義と整合   | ✅   | TBD  |

## 成果物

| 成果物                    | パス                                                                           | 説明                         |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| テストファイル（RED状態） | `apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.test.tsx` | TC-01〜TC-11 全11ケース      |
| テスト設計書              | `outputs/phase-4/test-design.md`                                               | フィクスチャ定義・ケース一覧 |

## 完了条件

- [ ] `SkillCreationResultPanel.test.tsx` が作成されている
- [ ] TC-01〜TC-11 が全て実装されている
- [ ] フィクスチャが Phase 1 の型定義（`RuntimeSkillCreatorPlanResult` 等）と整合している
- [ ] テスト実行で全ケースが RED 状態になることが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
