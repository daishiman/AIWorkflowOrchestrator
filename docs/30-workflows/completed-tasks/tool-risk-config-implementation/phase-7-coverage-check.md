# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| Phase名    | カバレッジ確認                  |
| タスクID   | UT-06-001                       |
| 前提Phase  | Phase 6（テスト拡充）           |
| 後続Phase  | Phase 8（リファクタリング）     |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

Phase 6 完了後のカバレッジが基準値（Line 80%+、Branch 60%+、Function 80%+）を満たしているかを確認する。未達の場合は Phase 6 に戻り追加テストを実装する。基準達成を確認後、Phase 8（リファクタリング）へ進む。

---

## 背景

`TOOL_RISK_CONFIG` は純粋な定数オブジェクトであるため、関数カバレッジは定義そのものの実行で達成される。ただし `security.ts` 全体のカバレッジ指標には、既存の `isDangerousCommand`・`matchGlobPattern`・`isProtectedPath`・`validateAllowedTools`・`filterAllowedTools` 関数が含まれる。`security.test.ts` が `TOOL_RISK_CONFIG` のテストのみを含む場合、既存関数のカバレッジが反映されないため、`security.ts` 全体のカバレッジを正しく解釈する必要がある。

---

## 実行タスク

### タスク1: カバレッジ測定とゲート判定

**目的**: Phase 6 完了時点のカバレッジを測定し、基準達成を判定する。

**実行手順**:

1. カバレッジ付きでテストを実行する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --coverage --coverage.include='src/constants/security.ts' --reporter=verbose 2>&1
   ```

2. カバレッジレポートから以下の数値を取得する:
   - `security.ts` の Line Coverage（%）
   - `security.ts` の Branch Coverage（%）
   - `security.ts` の Function Coverage（%）

3. ゲート判定を実施する:

   | カバレッジ種別    | 最低基準 | 測定値（実行後に記入） | 判定      |
   | ----------------- | -------- | ---------------------- | --------- |
   | Line Coverage     | 80%+     | -                      | PASS/FAIL |
   | Branch Coverage   | 60%+     | -                      | PASS/FAIL |
   | Function Coverage | 80%+     | -                      | PASS/FAIL |

4. **全項目 PASS**: Phase 8 へ進む

5. **いずれかが FAIL**: Phase 6 に戻り、未達カバレッジを補完するテストを追加する

   戻り先判定:
   - Line Coverage 未達: 実行されていない行を特定し、対応するテストを追加
   - Branch Coverage 未達: 分岐がある箇所（条件分岐はないが、型アサーション・リテラル型の型保証）を確認
   - Function Coverage 未達: 未実行の関数を特定し、対応するテストを追加

**期待される成果物**:

- `docs/30-workflows/tool-risk-config-implementation/outputs/phase-7/coverage-gate-decision.md`

---

### タスク2: TOOL_RISK_CONFIG 追加コードのカバレッジ分析

**目的**: `security.ts` に追加した新規コード（`TOOL_RISK_CONFIG` 関連）のカバレッジを個別に評価する。

**実行手順**:

1. 追加したコードの範囲を確認する:
   - `RiskLevel` 型（行数: 約3行、TypeScript 型なのでカバレッジ測定対象外）
   - `ToolRiskConfigEntry` interface（行数: 約8行、TypeScript 型なのでカバレッジ測定対象外）
   - `TOOL_RISK_CONFIG` 定数（行数: 約18行、定数定義なので1回のアクセスで全行カバー）

2. カバレッジレポートで追加コードの行が全て実行済みであることを確認する

3. 分析結果を `outputs/phase-7/coverage-gate-decision.md` に記録する

**期待される成果物**:

- `docs/30-workflows/tool-risk-config-implementation/outputs/phase-7/coverage-gate-decision.md`（タスク1と同ファイル）

---

### タスク3: 全テストスイートの最終確認

**目的**: `security.test.ts` の全テストが PASS していることを最終確認する。

**実行手順**:

1. カバレッジなしで全テストを実行し、実行結果を確認する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --reporter=verbose 2>&1
   ```

2. 以下の数値を記録する:
   - テスト総件数（期待値: 15件）
   - PASS件数（期待値: 15件）
   - FAIL件数（期待値: 0件）
   - スキップ件数（期待値: 0件）

3. 結果を `outputs/phase-7/coverage-gate-decision.md` に追記する

**期待される成果物**:

- `docs/30-workflows/tool-risk-config-implementation/outputs/phase-7/coverage-gate-decision.md`（最終記録）

---

## 参照資料

| 参照資料                 | パス                                             | 内容                                    |
| ------------------------ | ------------------------------------------------ | --------------------------------------- |
| Phase 6 拡充後カバレッジ | `outputs/phase-6/coverage-after-expansion.md`    | Phase 6 完了時の測定値（比較基準）      |
| Phase 6 ギャップ分析     | `outputs/phase-6/coverage-gap-analysis.md`       | Phase 5 完了時の不足箇所分析            |
| テストファイル           | `packages/shared/src/constants/security.test.ts` | 15件のテストケース                      |
| カバレッジ基準           | `.claude/rules/02-code-quality.md`               | Line 80%+ / Branch 60%+ / Function 80%+ |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                                   | 内容                 |
| -------------- | -------------------------------------------------------------------------------------- | -------------------- |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns-core.md` | テスト設計パターン   |
| 品質基準       | `.claude/skills/aiworkflow-requirements/references/quality-requirements-core.md`       | カバレッジ基準の正本 |

---

## 実行手順

### ステップ1: カバレッジ測定とゲート判定

タスク1 の手順に従い、`vitest --coverage` でカバレッジを測定し、Line/Branch/Function の3指標をゲート判定テーブルに記入する。

### ステップ2: 追加コードのカバレッジ分析

タスク2 の手順に従い、`TOOL_RISK_CONFIG` 関連の追加コード（concern）が全行実行済みであることを確認する。テストコマンド（command）と追加コードの依存関係（dependency edge）を突き合わせて未カバー行がないことを検証する。

### ステップ3: 全テストスイートの最終確認

タスク3 の手順に従い、カバレッジなしで全15件のテストを実行し、PASS/FAIL/スキップの件数を記録する。ゲート判定結果を `outputs/phase-7/coverage-gate-decision.md` に最終記録する。

---

## 統合テスト連携

- `@repo/shared` パッケージ全体のテストに影響を与えないことを確認する
- Phase 8（リファクタリング）での変更が、本 Phase のカバレッジ判定結果を無効にしないよう注意する

---

## カバレッジゲート判定フロー

```
Phase 6 完了
    ↓
カバレッジ測定（vitest --coverage）
    ↓
Line 80%+ AND Branch 60%+ AND Function 80%+?
    ↓ YES                      ↓ NO
Phase 8 へ進む          Phase 6 に戻り追加テスト実装
```

---

## 成果物

| 成果物                       | パス                                        | 内容                                     |
| ---------------------------- | ------------------------------------------- | ---------------------------------------- |
| カバレッジゲート判定レポート | `outputs/phase-7/coverage-gate-decision.md` | 測定値・ゲート判定・次のアクションの記録 |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --coverage` を実行した結果が記録されている
- [ ] Line Coverage が 80% 以上であることが確認されている
- [ ] Branch Coverage が 60% 以上であることが確認されている
- [ ] Function Coverage が 80% 以上であることが確認されている
- [ ] テスト総件数 15件、全件 PASS が確認されている
- [ ] `outputs/phase-7/coverage-gate-decision.md` が作成されている
- [ ] 未達の場合は Phase 6 に戻るアクションが記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] カバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）の PASS/FAIL が判定されている
- [ ] 成果物（カバレッジゲート判定レポート）が生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続（PASS の場合）**: Phase 8（リファクタリング）へ進む
- **後続（FAIL の場合）**: Phase 6 に戻り、未達カバレッジを補完するテストを追加する

---

## Phase実行記録

Phase完了後、以下を記録してください:

### 実行タスク

- タスク1（カバレッジ測定とゲート判定）: （実行後に記入）
- タスク2（追加コードのカバレッジ分析）: （実行後に記入）
- タスク3（全テストスイートの最終確認）: （実行後に記入）

### 発見事項

- 良かった点: （実行後に記入）
- 問題点: （実行後に記入）
- 改善提案: （実行後に記入）

### 次Phase への引き継ぎ事項

- （実行後に記入）

---

## 次のPhase

**カバレッジ PASS の場合**: 以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-8-refactoring.md`

**カバレッジ FAIL の場合**: 以下のファイルに戻り、追加テストを実装してください:

`docs/30-workflows/tool-risk-config-implementation/phase-6-test-expansion.md`
