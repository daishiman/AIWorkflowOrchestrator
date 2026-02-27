# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 7                    |
| Phase名    | テストカバレッジ確認 |
| 前提Phase  | Phase 6              |
| 後続Phase  | Phase 8              |
| ステータス | 未実施               |
| 作成日     | 2026-02-27           |
| 機能名     | TASK-9H-skill-debug  |

---

## 目的

Phase 6 のテスト拡充結果を検証し、ユニットテスト・結合テストのカバレッジ基準を満たすことを確認するゲートフェーズ。

## 背景

テストカバレッジはコード品質の重要な指標である。基準未達の場合は Phase 6 に戻り、追加テストを作成する。TASK-9H では特に IPC ハンドラ（7チャネル）の全網羅と、v8 カバレッジプロバイダのインライン関数カウント（P41）に注意する。

---

## 実行タスク

### タスク1: カバレッジ測定

- ユニットテストと結合テストのカバレッジを対象ファイル単位で測定する

### タスク2: 統合テスト再実行

- 7チャンネル全ての統合テストを再実行し、データフロー整合を確認する

### タスク3: P41/フラッキー検証

- v8 カバレッジ特性と 3回連続実行で安定性を検証する

### タスク4: ゲート判定

- 基準未達時は Phase 6 へ戻し、達成時のみ Phase 8 へ進行する

---

## SubAgent 分担

| SubAgent                 | 関心ごと                         | 参照先                                                                                     | 期待成果物            |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------ | --------------------- |
| `coverage-metrics-agent` | カバレッジ測定と未達箇所分析     | `.claude/skills/task-specification-creator/SKILL.md` / `references/coverage-standards.md`  | `coverage-report.md`  |
| `integration-gate-agent` | IPC 7チャネル統合テスト再検証    | `.claude/skills/aiworkflow-requirements/SKILL.md` / `references/ipc-contract-checklist.md` | `integration-test.md` |
| `stability-agent`        | P41観点・3回連続実行の安定性検証 | `.claude/skills/claude-agent-sdk/SKILL.md`                                                 | 再現性確認ログ        |

SubAgent は測定・判定・戻し条件（Phase 6差し戻し）をそれぞれ独立して確認する。

---

## 参照資料

| 参照資料        | パス                                                                              | 内容               |
| --------------- | --------------------------------------------------------------------------------- | ------------------ |
| Phase 5 成果物  | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                           | 実装コード基準     |
| Phase 6 成果物  | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-6/coverage-report.md`        | カバレッジ測定結果 |
| Phase 6 成果物  | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-6/integration-test.md`       | 統合テスト結果     |
| カバレッジ基準  | `.claude/skills/task-specification-creator/references/coverage-standards.md`      | カバレッジ基準     |
| IPC契約チェック | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P42/P44/P45確認    |
| Skill I/F仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型契約確認         |
| 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | TDD/性能要件       |

---

## カバレッジ基準

### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                                  | 現在値 | 判定 |
| ----------------- | -------- | -------- | ------------------------------------------------------------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | SkillDebugger.ts, DebugSession.ts, skillHandlers（debug部分） | -      | -    |
| Branch Coverage   | 60%      | 70%      | 同上                                                          | -      | -    |
| Function Coverage | 80%      | 90%      | 同上                                                          | -      | -    |

### 結合テストカバレッジ基準

| 指標                         | 目標 | 現在値 | 判定 |
| ---------------------------- | ---- | ------ | ---- |
| IPC チャネル（7本全て）      | 100% | -      | -    |
| モジュール間インターフェース | 100% | -      | -    |
| 正常系シナリオ               | 100% | -      | -    |
| 異常系シナリオ               | 80%+ | -      | -    |
| デバッグイベント通知         | 100% | -      | -    |

### ファイル別カバレッジ基準

| ファイル                      | Line 最低基準 | Branch 最低基準 | Function 最低基準 | 現在値 | 判定 |
| ----------------------------- | ------------- | --------------- | ----------------- | ------ | ---- |
| SkillDebugger.ts              | 80%           | 60%             | 80%               | -      | -    |
| DebugSession.ts               | 80%           | 60%             | 80%               | -      | -    |
| skillHandlers.ts（debug部分） | 80%           | 60%             | 80%               | -      | -    |
| skill-debug.ts                | 80%           | 60%             | 80%               | -      | -    |

---

## 実行手順

### 1. ユニットテストカバレッジ測定

```bash
# SkillDebugger カバレッジ測定
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/__tests__/SkillDebugger.test.ts

# DebugSession カバレッジ測定
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/__tests__/DebugSession.test.ts

# IPC ハンドラカバレッジ測定
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillDebugHandlers.test.ts

# 共有型定義カバレッジ測定
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/skill-debug.test.ts

# 全デバッグ関連テスト一括カバレッジ測定
cd apps/desktop && pnpm vitest run --coverage -- --grep "SkillDebugger|DebugSession|debug"
```

### 2. P41 対策確認

```bash
# v8 カバレッジプロバイダのインライン関数カウント確認
# Function Coverage が 80% を下回る場合、以下を確認:
# - validateIpcSender の getAllowedWindows コールバックが呼び出されているか
# - mockValidateIpcSender.mock.calls でコールバック呼び出しを検証
```

### 3. フラッキーテスト確認

```bash
# 同一テストを3回実行して全て成功することを確認
cd apps/desktop && pnpm vitest run -- --grep "SkillDebugger|DebugSession|debug" --reporter=verbose
cd apps/desktop && pnpm vitest run -- --grep "SkillDebugger|DebugSession|debug" --reporter=verbose
cd apps/desktop && pnpm vitest run -- --grep "SkillDebugger|DebugSession|debug" --reporter=verbose
```

### 4. 判定

| 判定 | 条件                 | 次のアクション               |
| ---- | -------------------- | ---------------------------- |
| PASS | 全基準を達成         | Phase 8 へ進行               |
| FAIL | いずれかの基準が未達 | Phase 6 へ戻り追加テスト作成 |

---

## ゲート判定チェックリスト

### ユニットテスト

- [ ] SkillDebugger.ts の Line Coverage ≥ 80%
- [ ] SkillDebugger.ts の Branch Coverage ≥ 60%
- [ ] SkillDebugger.ts の Function Coverage ≥ 80%
- [ ] DebugSession.ts の Line Coverage ≥ 80%
- [ ] DebugSession.ts の Branch Coverage ≥ 60%
- [ ] DebugSession.ts の Function Coverage ≥ 80%
- [ ] skillHandlers（debug 部分）の Line Coverage ≥ 80%
- [ ] skillHandlers（debug 部分）の Branch Coverage ≥ 60%
- [ ] skillHandlers（debug 部分）の Function Coverage ≥ 80%
- [ ] skill-debug.ts の Line Coverage ≥ 80%
- [ ] 全テストが成功

### 結合テスト

- [ ] skill:debug:start のテストが成功
- [ ] skill:debug:command のテストが成功
- [ ] skill:debug:breakpoint:add のテストが成功
- [ ] skill:debug:breakpoint:remove のテストが成功
- [ ] skill:debug:inspect のテストが成功
- [ ] skill:debug:evaluate のテストが成功
- [ ] skill:debug:event のテストが成功

### フラッキーテスト確認

- [ ] 同一テストを3回実行して全て成功
- [ ] タイマーモックが安定して動作
- [ ] 非同期処理のモックが安定して動作

---

## 未達時の対応

カバレッジ基準未達の場合:

1. 未カバーのコードパスを `--coverage` レポートで特定する
2. 追加テストケースを設計する
3. Phase 6 に戻りテストを追加する
4. 再度 Phase 7 で検証する

```bash
# カバレッジレポートで未カバー箇所を確認
cd apps/desktop && pnpm vitest run --coverage -- --grep "SkillDebugger|DebugSession|debug" --reporter=text-summary
```

### P41 起因の Function Coverage 低下対策

Function Coverage が未達の場合、以下を優先確認:

1. `validateIpcSender` のオプションオブジェクト内 `getAllowedWindows` コールバック
2. IPC ハンドラ内のインライン arrow function（エラーハンドリングコールバック）
3. DebugSession 内のイベントリスナーコールバック

---

## 成果物

| 成果物             | パス                                                                        | 内容               |
| ------------------ | --------------------------------------------------------------------------- | ------------------ |
| カバレッジ検証結果 | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-7/coverage-report.md`  | 検証結果と判定     |
| 統合テスト結果     | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

---

## 統合テスト連携（Phase 1〜11 は必須）

Phase 7 では以下の統合テスト連携アクションを実施:

- [ ] 全7 IPC チャネルの統合テスト再実行とゲート判定
- [ ] SkillDebugger → DebugSession 間の連携テスト確認
- [ ] デバッグイベント通知のデータフロー確認

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（各ファイル: Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 7チャネル 100%、正常系 100%、異常系 80%+）
- [ ] 全テストが成功している
- [ ] フラッキーテストがない（3回連続成功）
- [ ] P41 対策が実施されている（インライン arrow function のカバレッジ確認）
- [ ] カバレッジ検証結果レポートが出力されている
- [ ] 統合テスト連携アクションが完了している
- [ ] 本 Phase 内の全作業を 100%完了

---

## Phase 末端アクション【必須】

- [ ] カバレッジ検証が完了している
- [ ] 判定結果が記録されている
- [ ] 未達の場合は Phase 6 への戻りが記録されている

---

## 依存関係

- **前提**: Phase 5, 6 が完了していること
- **後続**: Phase 8（リファクタリング）へ進む

---

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. SubAgent 分担タスクの実行（各担当ごとに1タスク）
3. ユニットテストカバレッジ測定
4. 結合テストカバレッジ測定
5. P41 対策確認
6. フラッキーテスト確認
7. ゲート判定
8. 統合テスト連携の実施
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## SubAgent 100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各担当の成果物が生成されている
- [ ] SubAgent 実行記録が `outputs/phase-7/coverage-report.md` に記録されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9H-skill-debug --phase 7
```

---

## SubAgent 実行記録（全 Phase 共通）

Phase 完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### カバレッジ結果

| ファイル             | Line    | Branch  | Function |
| -------------------- | ------- | ------- | -------- |
| SkillDebugger.ts     | [数値]% | [数値]% | [数値]%  |
| DebugSession.ts      | [数値]% | [数値]% | [数値]%  |
| skillHandlers(debug) | [数値]% | [数値]% | [数値]%  |
| skill-debug.ts       | [数値]% | [数値]% | [数値]%  |

### 判定

- ゲート判定: [PASS/FAIL]
- Phase 6 戻り回数: [数値]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次 Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9H-skill-debug/phase-8-refactoring.md`
