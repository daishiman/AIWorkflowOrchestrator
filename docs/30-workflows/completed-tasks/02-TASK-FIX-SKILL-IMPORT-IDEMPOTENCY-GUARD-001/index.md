# TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 - タスク実行仕様書

## ユーザーからの元の指示

- task-specification-creator 準拠でタスク仕様書を作成する。
- 実装は行わず、仕様書作成に専念する。
- 並列可能な作業は分離し、関心ごとごとに SubAgent で担当する。
- aiworkflow-requirements の正本仕様を参照し、仕様整合を確保する。
- コミット/PR は実施しない。

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001       |
| タスク名     | 重複インポート時の冪等性保証と不要IPC呼び出し抑止 |
| 分類         | fix                                               |
| 対象機能     | Skill Import Flow（Renderer Store + IPC Handler） |
| 優先度       | high                                              |
| 見積もり規模 | medium                                            |
| ステータス   | spec_created                                      |
| 作成日       | 2026-03-04                                        |

## タスク概要

### 目的

同一スキル再追加時に不要な skill:import 呼び出しを防ぎ、0 new imports ログ連発とUXノイズを抑止する。

### 背景

既存実装では再インポート要求が繰り返し Main に到達し、冪等成功であっても無駄なIPC/ログ発生が残っていた。

### 最終ゴール

既にインポート済みのスキルに対してRenderer側で早期終了し、IPCは必要時のみ実行される状態にする。

### 成果物一覧

| 種別        | 成果物                    | 配置先                                                                            |
| ----------- | ------------------------- | --------------------------------------------------------------------------------- |
| 仕様        | index.md + phase-1..13    | docs/30-workflows/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/                 |
| 管理        | artifacts.json            | docs/30-workflows/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/artifacts.json   |
| Phase成果物 | phase別ドキュメント成果物 | docs/30-workflows/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-\* |

## 関心ごとの分離（SubAgent Team）

| SubAgent | 担当責務                               | 並列可否     |
| -------- | -------------------------------------- | ------------ |
| A        | IPC Handler 冪等契約（`skill:import`） | B と並列     |
| B        | Renderer Store 再インポート抑止        | A と並列     |
| C        | 回帰テスト戦略・Phase 12 文書同期      | A/B 後に直列 |

## 現時点の実装知見（仕様へ逆流）

- Store状態とMain永続状態のズレで再インポート判定が揺れる
- success=true/importedCount=0 の契約解釈が曖昧
- 既存テストが重複を失敗扱いしていたため仕様再定義が必要

## システム仕様参照（aiworkflow-requirements）

### 抽出手順（Progressive Disclosure）

1. `indexes/resource-map.md` で Skill/Store/IPC の参照対象を特定する。
2. `scripts/search-spec.js` で `importedSkills` / `skill import` を検索し、冪等性に関係する仕様を抽出する。
3. 変更ファイル（`agentSlice.ts`, `useSkillCenter.ts`, `skillHandlers.test.ts`）に対応する仕様書だけを採用する。

### 仕様書別 SubAgent 分担（仕様同期）

| SubAgent | 担当仕様書                                                                                                         | 責務                          |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| A        | `references/arch-state-management.md` / `references/arch-ui-components.md`                                         | Store冪等化とUI導線の責務整理 |
| B        | `references/api-ipc-agent.md` / `references/interfaces-agent-sdk-skill.md` / `references/security-electron-ipc.md` | IPC契約/型契約/境界防御の整合 |
| C        | `references/ui-ux-feature-components.md` / `references/error-handling.md` / `references/task-workflow.md`          | 冪等時UXと運用記録の同期      |

### 抽出済み参照仕様（今回実装に必要）

| 参照資料             | パス                                                                                        | 反映ポイント                         |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| 参照起点             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 必要仕様の絞り込み起点               |
| 早見表               | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | Skill Import契約のクイック確認       |
| Main Service仕様     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | `skill:import` と Service API の整合 |
| 状態管理仕様         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | `importSkill` 冪等ガードの責務       |
| UIアーキ仕様         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | 重複追加時のUI状態整合               |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Skill Center導線・表示契約           |
| API/IPC 仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | `skill:import` 呼び出し条件          |
| API一覧              | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | Skill管理APIの一覧整合               |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Store/IPC データ契約                 |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P44系 IPC契約ドリフト回避            |
| セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC過剰呼び出し抑止の境界観点        |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 早期return時のエラー状態整合         |
| タスク台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了/未タスク反映                    |

## ブランチ差分カバレッジ（本タスク担当）

| 種別        | 変更ファイル                                                                            | 担当        | 根拠                                 |
| ----------- | --------------------------------------------------------------------------------------- | ----------- | ------------------------------------ |
| IPC実装     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | ✅ 02       | `importedCount=0` 成功時の戻り値契約 |
| IPCテスト   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | ✅ 02       | 冪等成功ケースの仕様固定             |
| Store実装   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                  | ✅ 02       | 再インポート時 IPC未呼び出しガード   |
| Storeテスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | ✅ 02       | 冪等動作の回帰保証                   |
| Main復元    | `apps/desktop/src/main/services/skill/SkillService.ts`                                  | ⬅️ 01を参照 | 復元互換は 01 の主責務               |
| UI欠損防御  | `apps/desktop/src/renderer/views/SkillCenterView/**`                                    | ➡️ 03へ委譲 | 欠損耐性は 03 の主責務               |

## 横断依存関係（02視点）

| 依存先            | 関係     | 整合条件                                           |
| ----------------- | -------- | -------------------------------------------------- |
| 01-reconciliation | 前提依存 | 01の復元互換により imported 一覧が安定していること |
| 03-metadata-guard | 後続依存 | 02で重複抑止後の状態を 03 が安全表示できること     |

## 思考フレーム監査リンク

- 横断監査（20思考フレーム、矛盾/漏れ/依存チェック）:
  `docs/30-workflows/00-SKILL-IMPORT-SPECS-CROSS-AUDIT-20260304.md`

## タスク分解サマリー

| ID   | Phase | サブタスク       | 責務                       | 依存 |
| ---- | ----- | ---------------- | -------------------------- | ---- |
| T-01 | 1     | 要件定義         | 再現条件・受け入れ基準固定 | -    |
| T-02 | 2     | 設計             | 責務境界と契約設計         | T-01 |
| T-03 | 3     | 設計レビュー     | Gate判定                   | T-02 |
| T-04 | 4     | テスト作成       | Redケース固定              | T-03 |
| T-05 | 5     | 実装             | Green実装                  | T-04 |
| T-06 | 6     | テスト拡充       | 回帰防止                   | T-05 |
| T-07 | 7     | カバレッジ確認   | 検証網羅性判定             | T-06 |
| T-08 | 8     | リファクタ       | 保守性改善                 | T-07 |
| T-09 | 9     | 品質保証         | 品質ゲート判定             | T-08 |
| T-10 | 10    | 最終レビュー     | 最終是正判定               | T-09 |
| T-11 | 11    | 手動テスト       | 実機検証と証跡化           | T-10 |
| T-12 | 12    | ドキュメント更新 | 仕様同期・苦戦箇所記録     | T-11 |
| T-13 | 13    | PR作成準備       | 変更説明の整備             | T-12 |

## 実行フロー図

Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
-> Phase 8 -> Phase 9 -> Phase 10 -> Phase 11 -> Phase 12 -> Phase 13

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

## テストカバレッジ目標

| 指標              | 目標     |
| ----------------- | -------- |
| Line Coverage     | 90% 以上 |
| Branch Coverage   | 80% 以上 |
| Function Coverage | 90% 以上 |

## Phase完了時の必須アクション

1. 本Phase内タスクを100%完了する。
2. 成果物を outputs/phase-N/ に記録する。
3. 次Phaseへ引き継ぎ事項を明記する。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
```
