# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 7                         |
| 機能名   | TASK-9E-skill-fork        |
| タスク名 | スキルフォーク・派生機能  |
| 作成日   | 2026-02-28                |
| 前Phase  | Phase 6: テスト拡充       |
| 次Phase  | Phase 8: リファクタリング |

## 目的

Phase 6 で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。基準未達の場合は Phase 6 へ戻ってテストを追加する。

## 実行タスク

- カバレッジ再測定: テストカバレッジの再計測を行う
- ゲート判定: カバレッジ基準の充足を判定する
- 未達対応: 基準未達の場合の対応方針を決定する

## 参照資料

| 資料名             | パス                                                                                             | 説明             |
| ------------------ | ------------------------------------------------------------------------------------------------ | ---------------- |
| Phase 5 実装成果物 | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-5/implementation-summary.md` | 実装完了内容     |
| Phase 6 テスト     | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`                             | 拡充テスト成果物 |
| Phase 6 IPC テスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`                                 | 拡充 IPC テスト  |
| カバレッジレポート | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-6/test-expansion.md`         | Phase 6 レポート |

## 実行手順

### ステップ1: カバレッジ再測定

```bash
# カバレッジ測定（apps/desktop ディレクトリから実行 — P40対策）
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/__tests__/SkillForker.test.ts src/main/ipc/__tests__/skillHandlers.fork.test.ts

# SkillForker.ts 単体のカバレッジを確認
# coverage/lcov-report/apps/desktop/src/main/services/skill/SkillForker.ts.html
```

### ステップ2: ゲート判定

以下のテーブルに実測値を記入し、基準充足を判定する:

| 判定項目                           | 基準 | 実測値     | 判定          |
| ---------------------------------- | ---- | ---------- | ------------- |
| SkillForker.ts Line Coverage       | 80%+ | {{RESULT}} | {{PASS/FAIL}} |
| SkillForker.ts Branch Coverage     | 60%+ | {{RESULT}} | {{PASS/FAIL}} |
| SkillForker.ts Function Coverage   | 80%+ | {{RESULT}} | {{PASS/FAIL}} |
| IPC ハンドラ（skill:fork）Line     | 80%+ | {{RESULT}} | {{PASS/FAIL}} |
| IPC ハンドラ（skill:fork）Branch   | 60%+ | {{RESULT}} | {{PASS/FAIL}} |
| IPC ハンドラ（skill:fork）Function | 80%+ | {{RESULT}} | {{PASS/FAIL}} |

### ステップ3: 未達の場合の対応

カバレッジ未達の項目がある場合:

1. 未到達の行/分岐/関数を特定する
2. **Phase 6 へ戻り**、不足テストを追加する
3. 再度 Phase 7 を実行してカバレッジを再検証する

| 未達パターン                    | 対応方針                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Line Coverage 未達              | 未到達の行を含むテストケースを追加する                                                                   |
| Branch Coverage 未達            | 条件分岐の全パスを網羅するテストケースを追加する                                                         |
| Function Coverage 未達          | 未呼出の関数を呼び出すテストケースを追加する                                                             |
| P41: インライン関数カウント問題 | v8 カバレッジプロバイダのインライン関数カウントに注意（P41対策）。コールバックの戻り値を明示的に検証する |

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                  | 基準 | 結果       |
| ------------------------- | ---- | ---------- |
| ユニットテスト Line       | 80%+ | {{RESULT}} |
| ユニットテスト Branch     | 60%+ | {{RESULT}} |
| ユニットテスト Function   | 80%+ | {{RESULT}} |
| IPC テスト全ケース PASS   | 100% | {{RESULT}} |
| 異常系テスト全ケース PASS | 100% | {{RESULT}} |
| 境界値テスト全ケース PASS | 100% | {{RESULT}} |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                             |
| ------------------ | -------- | ---------------------------------------------------- |
| セキュリティ       | 適用     | validateIpcSender テストがカバレッジに含まれているか |
| エラーハンドリング | 適用     | エラーパスの分岐カバレッジが基準を満たしているか     |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                                |
| -------------------- | -------- | --------------------------------------- |
| バックエンド（Main） | 適用     | SkillForker のカバレッジ基準充足        |
| IPC通信              | 適用     | skill:fork ハンドラのカバレッジ基準充足 |

## 成果物

| 成果物             | パス                                                                                      | 説明       |
| ------------------ | ----------------------------------------------------------------------------------------- | ---------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-7/coverage-report.md` | 再測定結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] IPC ハンドラのカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 全テストが PASS している
- [ ] カバレッジレポートが出力されている
- [ ] **基準未達の場合は Phase 6 へ戻り、テストを追加後に再検証が完了している**
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 6 カバレッジレポート）
2. カバレッジ再測定の実行
3. ゲート判定テーブルへの実測値記入
4. 未達項目の対応（Phase 6 へ戻る判断を含む）
5. カバレッジレポートの作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
