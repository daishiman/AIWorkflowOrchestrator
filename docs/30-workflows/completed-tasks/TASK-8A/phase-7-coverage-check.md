# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 7                    |
| Phase名    | テストカバレッジ確認 |
| 前提Phase  | Phase 6              |
| 後続Phase  | Phase 8              |
| ステータス | 未実施               |
| 作成日     | 2026-02-01           |
| 機能名     | TASK-8A 単体テスト   |

## 目的

対象5モジュールのテストカバレッジが受け入れ基準（Line 80%, Branch 60%, Function 80%）を達成していることを検証し、未達の場合はPhase 6へ差し戻す。

## 背景

カバレッジ閾値はVitestの設定（`apps/desktop/vitest.config.ts`）で `lines: 80, functions: 80, branches: 60, statements: 80` と定義されている。本Phaseではこの閾値を対象5モジュールについて個別に確認する。

## 実行タスク

### Task 1: カバレッジ計測

**目的**: 対象5モジュールのカバレッジを個別に計測する。

**実行手順**:

1. 以下のコマンドで全テストを実行しカバレッジを生成する：
   ```bash
   pnpm --filter @repo/desktop vitest run --coverage
   ```
2. カバレッジレポート（`apps/desktop/coverage/` 配下のHTMLまたはJSON）を確認する
3. 以下の5ファイルについて個別のカバレッジを記録する：

| 対象ファイル                                    | Line | Branch | Function | Statement |
| ----------------------------------------------- | ---- | ------ | -------- | --------- |
| `src/main/services/skill/SkillScanner.ts`       | ?%   | ?%     | ?%       | ?%        |
| `src/main/services/skill/SkillImportManager.ts` | ?%   | ?%     | ?%       | ?%        |
| `src/main/services/skill/SkillExecutor.ts`      | ?%   | ?%     | ?%       | ?%        |
| `src/main/services/skill/PermissionResolver.ts` | ?%   | ?%     | ?%       | ?%        |
| `src/renderer/store/slices/skillSlice.ts`       | ?%   | ?%     | ?%       | ?%        |

4. 結果を `outputs/phase-7/coverage-report.md` に記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

### Task 2: 閾値判定

**目的**: 各モジュールが受け入れ基準を満たしているか判定する。

**実行手順**:

1. Task 1の結果を以下の基準と照合する：
   - **最低基準（PASS）**: Line 80%, Branch 60%, Function 80%
   - **推奨目標**: Line 90%, Branch 70%, Function 90%
2. 各モジュールについて PASS / FAIL を判定する
3. FAIL のモジュールについて、未カバーの具体的な行番号・分岐を記録する
4. 判定結果を `outputs/phase-7/coverage-report.md` に追記する

### Task 3: 差し戻し判定

**目的**: カバレッジ未達の場合にPhase 6への差し戻しを判定する。

**実行手順**:

1. Task 2の判定結果を確認する
2. 以下の基準で判定する：

| 条件                                   | アクション                              |
| -------------------------------------- | --------------------------------------- |
| 全5モジュールが最低基準をPASS          | Phase 8へ進行                           |
| 1モジュール以上がFAIL                  | Phase 6へ差し戻し（未カバー箇所を明記） |
| Branch Coverageのみ60%未満（他はPASS） | Phase 6へ差し戻し（分岐テスト追加指示） |

3. 差し戻しの場合、`outputs/phase-7/coverage-report.md` に以下を記載する：
   - 差し戻し先: Phase 6
   - 未カバー箇所の一覧（ファイルパス:行番号）
   - 追加すべきテストケースの概要

## 参照資料

| 参照資料           | パス                                              | 説明               |
| ------------------ | ------------------------------------------------- | ------------------ |
| Phase 6 カバレッジ | `outputs/phase-6/coverage-report.md`              | 拡充後カバレッジ   |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`          | 定量的基準         |
| Vitest設定         | `apps/desktop/vitest.config.ts`                   | カバレッジ閾値設定 |
| カバレッジ基準     | aiworkflow-requirements `quality-requirements.md` | プロジェクト基準   |
| 予備カバレッジ     | `outputs/phase-6/preliminary-coverage.md`         | Phase 6 成果物     |

## 成果物

| 成果物             | パス                                 | 説明                                    |
| ------------------ | ------------------------------------ | --------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | モジュール別カバレッジと PASS/FAIL 判定 |

## 統合テスト連携

- 単体テストのカバレッジが統合テスト込みのカバレッジとどの程度差があるかを記録する
- 統合テスト（TASK-8B, TASK-8C）でカバーされる予定のパスは、単体テストのカバレッジ不足として差し戻さない

## 完了条件

- [ ] 5モジュールすべてのカバレッジが計測されている
- [ ] 各モジュールのPASS/FAILが判定されている
- [ ] Line Coverage 80%以上が全モジュールで達成されている
- [ ] Branch Coverage 60%以上が全モジュールで達成されている
- [ ] Function Coverage 80%以上が全モジュールで達成されている
- [ ] カバレッジレポートが `outputs/phase-7/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 7 \
  --artifacts "outputs/phase-7/coverage-report.md:カバレッジレポート"
```

## 依存関係

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| 前提Phase | Phase 6                              |
| 後続Phase | Phase 8（PASS時）/ Phase 6（FAIL時） |

## 次のPhase

→ [phase-8-refactoring.md](phase-8-refactoring.md)
