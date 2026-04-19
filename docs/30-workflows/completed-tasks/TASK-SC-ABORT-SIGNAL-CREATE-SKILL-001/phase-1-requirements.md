# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

旧仕様の誤前提を除去し、本タスクを「`createSkill()` の Abort 契約再監査 + private workflow 入口統一」
として定義し直す。

## 実行タスク

1. 現行コードの Abort 伝播点と cleanup 点を棚卸しする
2. public 契約と private 実装詳細を分離する
3. 受け入れ基準を value-based に縮約する

## 参照資料

| 資料                         | パス                                                                                              | 用途               |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| 実装本体                     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                                     | current facts 固定 |
| cancel テスト                | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`               | public 契約確認    |
| service テスト               | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`                      | mode 別回帰確認    |
| cancel chain lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-creator-cancel-chain.md` | current facts      |

## 実行手順

### Step 1: P50 チェック

| 確認項目                                             | 結果 | 解釈                           |
| ---------------------------------------------------- | ---- | ------------------------------ |
| `createSkill()` が `operationSignal` を生成している  | ✅   | 公開契約は成立済み             |
| `runOrchestrateWorkflow()` が signal を受け取る      | ✅   | 受け取り済み、入口未使用       |
| `runCreateWorkflow()` が signal を受け取る           | ✅   | 受け取り済み、入口未使用       |
| `createSkill()` 側で abort-like error を再スローする | ✅   | create fallback は過大修正不要 |
| UI レイアウト変更が必要                              | ❌   | NON_VISUAL 扱い                |

### Step 2: 要件整理

| ID   | 要件                                                                                 | 種別 |
| ---- | ------------------------------------------------------------------------------------ | ---- |
| R-01 | `runOrchestrateWorkflow()` と `runCreateWorkflow()` の入口で `signal` を即時確認する | 機能 |
| R-02 | `cancelCurrentOperation()` 後に `createSkill()` が abort-like error を握り潰さない   | 機能 |
| R-03 | 新規作成ディレクトリ cleanup 契約を壊さない                                          | 機能 |
| R-04 | テスト仕様は Vitest / 既存 test file / public flow 優先に統一する                    | 品質 |
| R-05 | Phase 11/12/13 の canonical artifact 名と blocked 運用を揃える                       | 品質 |

### Step 3: 受け入れ基準

| AC   | 条件                                                                            | 検証方法       |
| ---- | ------------------------------------------------------------------------------- | -------------- |
| AC-1 | `createSkill()` のキャンセル契約が既存 cancel テストと矛盾しない                | テストレビュー |
| AC-2 | `runOrchestrateWorkflow()` / `runCreateWorkflow()` の入口で `signal` を確認する | コードレビュー |
| AC-3 | create / orchestrate / collaborative の正常系が非回帰である                     | 既存テスト実行 |
| AC-4 | Phase 11/12/13 と artifacts parity が skill 規約に一致する                      | 仕様レビュー   |

## 統合テスト連携

- Phase 4 は `SkillCreatorService-cancel.test.ts` と `SkillCreatorService.test.ts` を優先的に再利用する
- Phase 10 は AC-1〜AC-4 の最終判定を root evidence に集約する

## 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/current-facts-inventory.md`
- `outputs/phase-1/acceptance-criteria.md`

## 完了条件

- [ ] P50 を「未実装」ではなく「入口未統一」として再定義した
- [ ] AC を 4 件へ縮約した
- [ ] public 契約と private 実装詳細を分離した
