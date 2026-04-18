# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| PhaseID    | 1                                                              |
| Phase名    | 要件定義                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前Phase    | なし                                                           |
| 次Phase    | Phase 2                                                        |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

`SkillLifecyclePanel.llm-generation.test.tsx` に残存する12件の `describe.skip` を精査し、
旧フロー（planSkill / detectMode）に依存するテストの削除・修正・別途判断の方針を確定する。
受け入れ基準 AC-1〜AC-6 を固定し、後続 Phase への入力を確定する。

## 背景

SkillCreateWizard.llm-generation.test.tsx のクリーンアップ（UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001）完了後、
同じ `__tests__/` ディレクトリ内の `SkillLifecyclePanel.llm-generation.test.tsx` に
旧フロー（planSkill / detectMode）に依存した12件の `describe.skip` が残存している。
`executePlan` は現行 API だが、旧フロー由来の skip テストと混在しており判断コストを上げている。

## Step 0: P50チェック

対象ファイルの現在状態を確認する。

```bash
# 対象ファイルの存在確認
test -e apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  && echo "present" || echo "deleted"

# describe.skip 件数確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# describe.skip の全箇所を確認
grep -n "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 廃止済み API 依存のモック宣言確認
grep -n "planSkill\|detectMode\|generationMode" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# SkillLifecyclePanel 本体での planSkill / detectMode 使用確認
grep -n "planSkill\|detectMode" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 現在アクティブな describe ブロック数の確認
grep -c "^describe(" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# snapshot 系 describe.skip の特定
grep -n "snapshot\|approvedSkillSpec\|canonical" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 最近のコミット履歴確認
git log --oneline -15 -- \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 実行タスク

- [ ] P50チェック: 対象ファイルの describe.skip 件数・旧 API 依存の確認
- [ ] 12件の describe.skip を「削除」「修正」「別途判断」に分類する
- [ ] 問題点の整理: デッドコード蓄積・CI信頼性低下・新規参入者の混乱・カバレッジ過大評価の4点を明示
- [ ] 受け入れ基準 AC-1〜AC-6 の固定
- [ ] タスク分類の宣言: CLEANUPタスク / テストファイルのみ変更 / NON_VISUAL

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| SkillLifecyclePanel.llm-generation.test.tsx  | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`  | describe.skip 件数・旧 API 依存の確認 |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 現行 API（createSkill）のフロー確認   |
| SkillLifecyclePanel.test.tsx                 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                 | 既存テスト構造・カバレッジ確認        |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | スコープ外（参考のみ）                |
| UT-W2-03A 仕様書                             | `docs/30-workflows/completed-tasks/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001/`                      | 先行タスクの設計パターン参照          |
| GitHub Issue #2236                           | [#2236](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2236)                            | タスク背景・要件原本                  |
| aiworkflow-requirements refs                 | `.claude/skills/aiworkflow-requirements/references/`                                                | プロジェクト共通仕様参照              |

## 12件の describe.skip 初期分類

| ID    | describe 名                                                  | 分類方針    | 理由                                   |
| ----- | ------------------------------------------------------------ | ----------- | -------------------------------------- |
| U-1   | detectMode → planSkill sequential call                       | 削除        | 旧フロー依存（planSkill / detectMode） |
| U-2   | backward compatibility - detectMode='create' skips planSkill | 削除        | 旧フロー依存（detectMode）             |
| U-4   | isGenerating guard prevents double invocation (R-1)          | 要調査→修正 | 現行 API でも再現可能な可能性あり      |
| U-6   | terminal_handoff triggers handoff guidance display           | 削除        | 旧 planSkill ベースの terminal_handoff |
| U-10  | planSkill failure propagates error                           | 削除        | 旧フロー依存（planSkill）              |
| U-11  | empty input validation                                       | 要調査→修正 | 現行 UI でのバリデーション確認が必要   |
| U-12  | planSkill API unavailable graceful degradation               | 削除        | 旧フロー依存（planSkill）              |
| U-8b  | canonical binding drift prevention                           | 要調査→修正 | canonical spec 保持の動作確認が必要    |
| U-18b | cancel then re-plan replaces approved snapshot               | 別途判断    | snapshot 系・追加調査が必要            |
| U-19b | multiple textarea edits do not affect approved snapshot      | 別途判断    | snapshot 系・追加調査が必要            |
| U-20b | cancel clears approved snapshot symmetrically                | 別途判断    | snapshot 系・追加調査が必要            |
| U-21  | approved snapshot behavior after execute failure             | 別途判断    | snapshot 系・追加調査が必要            |

## 問題点の整理

| 問題               | 詳細                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| デッドコード蓄積   | 旧テスト12件が廃止済み API（planSkill / detectMode）を参照するため、永遠に動かないコードが残留する                       |
| CI 信頼性低下      | skip されたテストはカバレッジに算入されず、CI の「全テスト PASS」表示がミスリーディングになる                            |
| 新規参入者の混乱   | なぜ skip されているのか、いつ有効化するのかが明示されておらず、コードベース理解を妨げる                                 |
| カバレッジ過大評価 | describe.skip のテストがカバレッジから除外されているにもかかわらず、ファイル数・テスト数の見かけが膨らみ、品質評価が歪む |

## 受け入れ基準

| ID   | 受け入れ基準                                                                      | 検証方法                                                              |
| ---- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| AC-1 | 旧フロー依存の `describe.skip`（U-1/U-2/U-6/U-10/U-12 の5件）が削除されている     | `grep -c "describe\.skip"` の結果が7件以下（削除対象5件を除いた残り） |
| AC-2 | 要調査テスト（U-4/U-11/U-8b）が `describe` または削除のいずれかで解消されている   | 対象テストに `describe.skip` が存在しない                             |
| AC-3 | snapshot 系テスト（U-18b/U-19b/U-20b/U-21）の処置方針が明確に記録されている       | Phase 2 設計書に snapshot 系テストの方針が記載されている              |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する                               | CI 相当のテスト実行が全件 PASS                                        |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                              | TypeScript 型チェックが 0 error                                       |
| AC-6 | 廃止済み API モック宣言（mockPlanSkill / mockDetectMode）の整理方針が確定している | Phase 2 設計書に廃止済み API モック宣言の処置方針が記載されている     |

## スコープ定義

### 含む

- `describe.skip` の解消（削除・修正・別途判断）
- 廃止済み API モック宣言（`mockPlanSkill` / `mockDetectMode`）の整理
- snapshot 系テストの処置（削除 or 旧 snapshot 参照のみ除去）

### 含まない

- `SkillLifecyclePanel.auth-regression.test.tsx` のスキップ処理
- プロダクションコード（`SkillLifecyclePanel.tsx`）の変更
- 新しいテストケースの追加（既存のアクティブな describe への追加は除く）

## タスク分類の宣言

| 分類項目   | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスク種別 | CLEANUPタスク                                      |
| 変更範囲   | テストファイルのみ（プロダクションコード変更なし） |
| UIタスク   | 非UIタスク（UIの見た目変更なし）                   |
| 可視性     | NON_VISUAL（テストコードのみ変更）                 |
| テスト種別 | コンポーネントテスト（desktop renderer 層）        |

## 統合テスト連携

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| ユニットテストLine     | 80%+ | pending |
| ユニットテストBranch   | 60%+ | pending |
| ユニットテストFunction | 80%+ | pending |
| ユニットテストLines    | 80%+ | pending |

## 多角的チェック観点

| 観点                 | チェック内容                                                                          |
| -------------------- | ------------------------------------------------------------------------------------- |
| 削除安全性           | 旧フロー5件が削除対象として安全であることをプロダクションコード側で確認する           |
| 修正可能性           | U-4/U-11/U-8b が現行 API で再現可能かをテスト対象コンポーネントで確認する             |
| snapshot 系の独立性  | U-18b/U-19b/U-20b/U-21 が旧 planSkill 依存かどうかを identify する                    |
| モック宣言の残留影響 | 旧 API モック（mockPlanSkill 等）を削除した場合に TypeScript エラーが出ないか確認する |
| CI 整合性            | describe.skip 除去後に CI が正常動作し、カバレッジが正確に計測されることを確認する    |

## 参照資料

| 資料名                  | パス                                                                        | 説明                 |
| ----------------------- | --------------------------------------------------------------------------- | -------------------- |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/references/`                        | プロジェクト共通仕様 |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | タスク運用ルール     |
| lessons-learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 再発防止知見         |
| quality-requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート           |

## 成果物

| 成果物       | パス                                         | 説明                                     |
| ------------ | -------------------------------------------- | ---------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 問題点・12件分類・受け入れ基準・スコープ |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-6 の検証可能な定義              |

## 完了条件

- [ ] P50チェック実施済み（describe.skip 件数・旧 API 依存の確認を完了）
- [ ] 12件の describe.skip を「削除」「修正」「別途判断」に分類済み
- [ ] 問題点（4点: デッドコード蓄積・CI信頼性低下・新規参入者混乱・カバレッジ過大評価）を整理済み
- [ ] AC-1〜AC-6 が検証可能な形で定義されている
- [ ] タスク分類（CLEANUP / テストファイルのみ / NON_VISUAL）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次Phase

Phase 2（設計）へ進む。
