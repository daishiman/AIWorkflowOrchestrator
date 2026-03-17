# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 機能名   | skillcenter-create-route              |
| Phase    | 7                                     |
| 作成日   | 2026-03-17                            |
| 依存     | Phase 6（テスト拡充）の成果物         |

## 目的

Phase 4〜6 で作成・拡充したテストのカバレッジが基準値を満たしているか確認し、未達の場合は Phase 6 へ差し戻す。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 参照資料

| 参照資料                          | パス                                                                            | 用途                                    |
| --------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 4 テスト作成                | `phase-4-test-creation.md`                                                      | 基本テストケース（TC-01〜TC-08）の確認  |
| Phase 6 テスト拡充                | `phase-6-test-expansion.md`                                                     | 追加テストケースと不足観点の確認        |
| aiworkflow-requirements: 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | カバレッジ基準の正本確認                |
| aiworkflow-requirements: UI仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillCenter/JourneyPanel の対象責務確認 |

## 実行タスク

- タスク 1: カバレッジ計測コマンドを実行して `coverage-report.txt` を生成する
- タスク 2: 対象ファイルごとに Line/Branch/Function を評価し基準とのギャップを記録する
- タスク 3: 基準未達の原因を特定し `gap-report.txt` へ差し戻し根拠を記録する
- タスク 4: PASS/FAIL を判定し、未達の場合は Phase 6 へ戻す

## 実行手順

### Step 1: カバレッジ計測コマンド実行

対象パッケージのディレクトリから実行する（P40対策）。

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/views/SkillCenterView/ \
  src/renderer/hooks/useSkillCenter/ \
  src/renderer/components/JourneyPanel/
```

### Step 2: カバレッジレポートの確認

`outputs/phase-7/coverage-report.txt` にレポートを記録する。

確認対象ファイル:

- `src/renderer/views/SkillCenterView/index.tsx` — ヘッダー CTA 実装
- `src/renderer/hooks/useSkillCenter.ts` — 3ナビゲーションアクション
- `src/renderer/components/JourneyPanel/index.tsx` — ステップカード CTA ボタン

### Step 3: 基準未達ファイルの特定

各ファイルについて以下を確認する:

- Line / Branch / Function の3指標が全て基準値を満たしているか
- 未達の場合は未達ファイル名と不足ブランチを `outputs/phase-7/gap-report.txt` に記録する

### Step 4: 判定

| 判定 | 条件                         | 対応                                              |
| ---- | ---------------------------- | ------------------------------------------------- |
| PASS | 全ファイルが最低基準を満たす | Phase 8 へ進む                                    |
| FAIL | 1ファイルでも最低基準未達    | Phase 6 へ差し戻し、gap-report.txt を参照して補充 |

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

- `outputs/phase-7/coverage-report.txt` — カバレッジ計測結果
- `outputs/phase-7/gap-report.txt` — 未達ファイル一覧（PASS の場合は「なし」と記載）

## 完了条件

- [ ] カバレッジ計測コマンドが正常終了している
- [ ] 全対象ファイルで Line Coverage 80% 以上
- [ ] 全対象ファイルで Branch Coverage 60% 以上
- [ ] 全対象ファイルで Function Coverage 80% 以上
- [ ] `outputs/phase-7/coverage-report.txt` が作成されている
- [ ] `outputs/phase-7/gap-report.txt` が作成されている（0件または差し戻し理由記載）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 8: リファクタリング
