# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| タスクID   | UT-06-001                       |
| 前提Phase  | Phase 5（実装）                 |
| 後続Phase  | Phase 7（カバレッジ確認）       |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

Phase 5 で Green 状態（全9件 PASS）を達成したテストスイートに対し、異常系・境界値・網羅性テストを追加することでカバレッジを向上させる。Phase 7 のカバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）を確実に達成できるよう、補完テストを設計・実装する。

---

## 背景

Phase 4 の9件は正常系・セキュリティ不変条件を中心に設計されている。`TOOL_RISK_CONFIG` は定数オブジェクトであるためブランチカバレッジは低いが、型の整合性・不変性（`as const` アサーションによる TypeScript の型保証）と、定数への直接アクセスパターンを補完テストでカバーする。Phase 7 のカバレッジ確認で未達の場合は Phase 6 に戻る（Phase 7 → Phase 6 の戻りフロー）。

---

## 実行タスク

### タスク1: 既存テストのカバレッジ状況確認

**目的**: Phase 5 完了後のカバレッジ基準達成状況を測定し、補完が必要なテストを特定する。

**実行手順**:

1. カバレッジ付きでテストを実行する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --coverage --reporter=verbose 2>&1
   ```

2. カバレッジレポートから以下の数値を記録する:
   - `security.ts` 全体の Line Coverage（%）
   - `security.ts` 全体の Branch Coverage（%）
   - `security.ts` 全体の Function Coverage（%）

3. 新規追加コードのみのカバレッジを推定する（`TOOL_RISK_CONFIG` 関連）:
   - 型定義（`RiskLevel`, `ToolRiskConfigEntry`）: TypeScript の型は実行時コードなし、カバレッジ測定対象外
   - 定数定義（`TOOL_RISK_CONFIG`）: オブジェクトリテラルへのアクセスが測定対象

4. カバレッジ未達の場合、不足箇所を `outputs/phase-6/coverage-gap-analysis.md` に記録する

**期待される成果物**:

- `docs/30-workflows/tool-risk-config-implementation/outputs/phase-6/coverage-gap-analysis.md`

---

### タスク2: 補完テストの追加

**目的**: `security.test.ts` に補完テストを追加し、カバレッジ基準を達成する。

**実行手順**:

1. 以下の補完テストを `packages/shared/src/constants/security.test.ts` の末尾（`TOOL_RISK_CONFIG` の `describe` ブロック内）に追加する:

   ```typescript
   describe("定数の不変性", () => {
     it("TOOL_RISK_CONFIG の各エントリは ToolRiskConfigEntry の全フィールドを持つ", () => {
       const requiredFields: (keyof ToolRiskConfigEntry)[] = [
         "dialogWidth",
         "headerColorToken",
         "allowPermanent",
         "allowTime24h",
         "allowTime7d",
       ];
       const levels: RiskLevel[] = ["low", "medium", "high"];
       for (const level of levels) {
         for (const field of requiredFields) {
           expect(TOOL_RISK_CONFIG[level]).toHaveProperty(field);
         }
       }
     });

     it("dialogWidth は 400 / 480 / 640 のいずれかである", () => {
       const validWidths = [400, 480, 640] as const;
       const levels: RiskLevel[] = ["low", "medium", "high"];
       for (const level of levels) {
         expect(validWidths).toContain(TOOL_RISK_CONFIG[level].dialogWidth);
       }
     });

     it("headerColorToken は '--risk-low' / '--risk-medium' / '--risk-high' のいずれかである", () => {
       expect(TOOL_RISK_CONFIG.low.headerColorToken).toBe("--risk-low");
       expect(TOOL_RISK_CONFIG.medium.headerColorToken).toBe("--risk-medium");
       expect(TOOL_RISK_CONFIG.high.headerColorToken).toBe("--risk-high");
     });
   });

   describe("インデックスアクセスの動作", () => {
     it("RiskLevel 型でインデックスアクセスした結果は undefined でない", () => {
       const levels: RiskLevel[] = ["low", "medium", "high"];
       for (const level of levels) {
         expect(TOOL_RISK_CONFIG[level]).toBeDefined();
       }
     });

     it("dialogWidth は数値型である", () => {
       const levels: RiskLevel[] = ["low", "medium", "high"];
       for (const level of levels) {
         expect(typeof TOOL_RISK_CONFIG[level].dialogWidth).toBe("number");
       }
     });

     it("headerColorToken は文字列型である", () => {
       const levels: RiskLevel[] = ["low", "medium", "high"];
       for (const level of levels) {
         expect(typeof TOOL_RISK_CONFIG[level].headerColorToken).toBe("string");
       }
     });
   });
   ```

2. 補完テスト追加後に全テストを実行し、全件 PASS を確認する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --reporter=verbose
   ```

3. テスト件数が9件から15件に増加していることを確認する

**期待される成果物**:

- `packages/shared/src/constants/security.test.ts`（補完テスト追加済み）

---

### タスク3: 拡充後のカバレッジ測定

**目的**: 補完テスト追加後のカバレッジが Phase 7 の基準を満たしているか確認する。

**実行手順**:

1. カバレッジ付きでテストを実行する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --coverage --reporter=verbose 2>&1
   ```

2. カバレッジ数値を `outputs/phase-6/coverage-after-expansion.md` に記録する:
   - Line Coverage: 目標 80%+
   - Branch Coverage: 目標 60%+
   - Function Coverage: 目標 80%+

3. 未達の場合は追加テストを検討し、タスク2を繰り返す（Phase 7 → Phase 6 戻りフローを避けるため）

**期待される成果物**:

- `docs/30-workflows/tool-risk-config-implementation/outputs/phase-6/coverage-after-expansion.md`

---

## 参照資料

| 参照資料                      | パス                                             | 内容                                    |
| ----------------------------- | ------------------------------------------------ | --------------------------------------- |
| Phase 4 テストファイル        | `packages/shared/src/constants/security.test.ts` | 既存の9件のテストケース                 |
| Phase 5 Green状態確認レポート | `outputs/phase-5/green-state-confirmation.md`    | Phase 5 完了時のテスト実行結果          |
| Phase 2 テスト設計            | `outputs/phase-2/test-design.md`                 | 設計段階でのカバレッジ計画              |
| カバレッジ基準                | `.claude/rules/02-code-quality.md`               | Line 80%+ / Branch 60%+ / Function 80%+ |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                                   | 内容               |
| -------------- | -------------------------------------------------------------------------------------- | ------------------ |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns-core.md` | テスト設計パターン |

---

## 実行手順

### ステップ1: 既存カバレッジの測定

タスク1 の手順に従い、Phase 5 完了時点のカバレッジを測定する。不足箇所を `outputs/phase-6/coverage-gap-analysis.md` に記録する。

### ステップ2: 補完テストの追加と再検証

タスク2 の手順に従い、6件の補完テストを `security.test.ts` に追加する。追加後に全15件が PASS であることを確認する（regression check）。

### ステップ3: 拡充後のカバレッジ測定と再検証

タスク3 の手順に従い、補完テスト追加後のカバレッジが基準（Line 80%+、Branch 60%+、Function 80%+）を満たしているか測定する。未達の場合はステップ2 に戻り追加テストを実装する。

---

## 統合テスト連携

- 補完テストは `TOOL_RISK_CONFIG` のみを対象とし、既存の `security.ts` の他の関数（`isDangerousCommand`・`matchGlobPattern`・`isProtectedPath`・`validateAllowedTools`・`filterAllowedTools`）に影響を与えない
- 既存テストが引き続き PASS することを確認する（regression なし）

---

## 成果物

| 成果物                     | パス                                             | 内容                                |
| -------------------------- | ------------------------------------------------ | ----------------------------------- |
| テストファイル（拡充済み） | `packages/shared/src/constants/security.test.ts` | 15件のテストケース（9件 + 6件補完） |
| カバレッジギャップ分析     | `outputs/phase-6/coverage-gap-analysis.md`       | Phase 5 完了時のカバレッジ不足箇所  |
| 拡充後カバレッジレポート   | `outputs/phase-6/coverage-after-expansion.md`    | 補完テスト追加後の測定値            |

---

## 完了条件

- [ ] `packages/shared/src/constants/security.test.ts` に補完テスト6件が追加されている（合計15件）
- [ ] 全15件のテストが PASS している
- [ ] `outputs/phase-6/coverage-gap-analysis.md` が作成されている
- [ ] `outputs/phase-6/coverage-after-expansion.md` が作成されている
- [ ] Line Coverage が 80% 以上であることが記録されている
- [ ] Branch Coverage が 60% 以上であることが記録されている
- [ ] Function Coverage が 80% 以上であることが記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 全テスト PASS（15件）であることを実行ログで確認
- [ ] カバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）の達成を確認
- [ ] 成果物（テストファイル拡充 + 2つのカバレッジレポート）が生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了し、テストが Green 状態（全9件 PASS）であること
- **後続**: Phase 7（カバレッジ確認）でカバレッジ基準の充足を確認する（未達の場合は Phase 6 に戻る）

---

## Phase実行記録

Phase完了後、以下を記録してください:

### 実行タスク

- タスク1（既存テストのカバレッジ状況確認）: （実行後に記入）
- タスク2（補完テストの追加）: （実行後に記入）
- タスク3（拡充後のカバレッジ測定）: （実行後に記入）

### 発見事項

- 良かった点: （実行後に記入）
- 問題点: （実行後に記入）
- 改善提案: （実行後に記入）

### 次Phase への引き継ぎ事項

- （実行後に記入）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-7-coverage-check.md`
