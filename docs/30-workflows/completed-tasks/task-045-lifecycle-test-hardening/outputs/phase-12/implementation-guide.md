# TASK-10A-G 実装ガイド

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-10A-G                         |
| 作成日   | 2026-03-09                         |
| 対象     | tests hardening（既存 suite 補完） |

## Part 1

### なぜ必要か

このタスクが必要な理由は、`TASK-10A-F` で設計したライフサイクル（作成→分析→改善→再分析）が将来の変更で壊れるリスクを下げるためです。
既存の実装は動いていても、回帰テストが薄い状態だと、軽微な修正で重要な導線が壊れてしまいます。

### 何をするか

このタスクでやることは、新しい機能追加ではなく、既存の6つのテスト suite に回帰ケースを追加して `RT-01`〜`RT-07` を守ることです。

### 日常の例え

家の点検で、壊れた家を建て直すのではなく、弱い柱に補強材を追加するイメージです。
たとえば地震前に補強しておくと、次の揺れでも家が崩れにくくなります。
今回の回帰テストは、その「補強材」にあたります。

## Part 2

### 型定義

```typescript
interface RegressionTarget {
  rtId: "RT-01" | "RT-02" | "RT-03" | "RT-04" | "RT-05" | "RT-06" | "RT-07";
  suite: string;
  focus: string;
}

type ValidationResult = {
  typecheck: "PASS" | "FAIL";
  targetedSuite: "PASS" | "FAIL";
  screenshotCoverage: "PASS" | "FAIL";
};
```

### APIシグネチャ

- CLIシグネチャ（Phase 11/12）

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir>
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-dir>
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow <workflow-dir>
```

- Storeアクションシグネチャ（回帰対象）

```typescript
analyzeSkill: (skillName: string) => Promise<void>;
improveSkill: (skillName: string, options?: { auto?: boolean }) =>
  Promise<void>;
executeSkill: (prompt: string) => Promise<void>;
```

### 使用例

```bash
# 0) screenshot 再取得
pnpm --filter @repo/desktop run screenshot:task-045-lifecycle-test-hardening

# 1) 型チェック
pnpm --filter @repo/desktop typecheck

# 2) task-045 対象suite実行
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx

# 3) screenshot証跡検証
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening
```

```ts
// 役割分担の利用例（ドキュメント上の運用例）
const targets: RegressionTarget[] = [
  {
    rtId: "RT-01",
    suite: "SkillCreateWizard.test.tsx",
    focus: "create後一覧同期",
  },
  {
    rtId: "RT-07",
    suite: "ChatPanel.skill-management.test.tsx",
    focus: "実行中排他制御",
  },
];
```

### エラーハンドリング

| 条件                            | 扱い                     | 対応                                                 |
| ------------------------------- | ------------------------ | ---------------------------------------------------- |
| Rollup optional dependency 欠落 | 環境 blocker（WARN）     | preflight結果として記録し、対象suite実行可否を別判定 |
| targeted suite failure          | product failure（FAIL）  | failing case を修正して再実行                        |
| screenshot未紐付け              | ドキュメント欠落（FAIL） | `TC-ID ↔ png` を phase-11 / result 両方で補完        |

### エッジケース

| エッジケース                                | 期待動作                            |
| ------------------------------------------- | ----------------------------------- |
| `isAnalyzing=true` で improve 実行          | improve 操作を抑止し二重操作を防止  |
| `isExecuting=true` で ChatPanel toggle 操作 | toggle が disabled で状態遷移しない |
| analyze API エラー                          | エラー文言を表示し再試行導線を維持  |

### 設定項目と定数一覧

| 設定項目/定数          | 値                                                                             | 用途                        |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------------- |
| `WORKFLOW_DIR`         | `docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening`          | validator 実行対象          |
| `TARGETED_SUITE_COUNT` | `6`                                                                            | 実行対象 test file 数       |
| `TARGETED_TEST_COUNT`  | `170`                                                                          | 実行で確認した総テスト数    |
| `SCREENSHOT_TC_COUNT`  | `9`                                                                            | Phase 11 で紐付ける TC 数   |
| `SCREENSHOT_SCRIPT`    | `pnpm --filter @repo/desktop run screenshot:task-045-lifecycle-test-hardening` | task-045 専用再撮影コマンド |
