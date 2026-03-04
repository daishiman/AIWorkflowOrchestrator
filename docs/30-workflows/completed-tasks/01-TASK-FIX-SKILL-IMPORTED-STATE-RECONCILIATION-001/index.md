# TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001 - タスク実行仕様書

## ユーザーからの元の指示

- task-specification-creator 準拠でタスク仕様書を作成する。
- 実装は行わず、仕様書作成に専念する。
- 並列可能な作業は分離し、関心ごとごとに SubAgent で担当する。
- aiworkflow-requirements の正本仕様を参照し、仕様整合を確保する。
- コミット/PR は実施しない。

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001     |
| タスク名     | インポート済みスキル復元の name/id 互換解決          |
| 分類         | fix                                                  |
| 対象機能     | SkillService.getImportedSkills（Main Service Layer） |
| 優先度       | high                                                 |
| 見積もり規模 | medium                                               |
| ステータス   | spec_created                                         |
| 作成日       | 2026-03-04                                           |

## タスク概要

### 目的

永続化済みインポートキーを id と name の両方で解決し、起動後にインポート済み一覧が欠落する不整合を解消する。

### 背景

保存キー形式の揺れにより getImportedSkills が復元に失敗し、UI上で未追加表示から再インポートが誘発されていた。

### 最終ゴール

再起動後でもインポート済み一覧が安定して復元され、再インポート操作が不要な状態にする。

### 成果物一覧

| 種別        | 成果物                    | 配置先                                                                                 |
| ----------- | ------------------------- | -------------------------------------------------------------------------------------- |
| 仕様        | index.md + phase-1..13    | docs/30-workflows/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001/                 |
| 管理        | artifacts.json            | docs/30-workflows/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001/artifacts.json   |
| Phase成果物 | phase別ドキュメント成果物 | docs/30-workflows/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001/outputs/phase-\* |

## 関心ごとの分離（SubAgent Team）

| SubAgent | 担当責務                              | 並列可否     |
| -------- | ------------------------------------- | ------------ |
| A        | Main Service 復元互換（id/name 解決） | B と並列     |
| B        | IPC契約・型整合（戻り値/エラー）      | A と並列     |
| C        | テスト戦略・Phase 12 文書同期         | A/B 後に直列 |

## 現時点の実装知見（仕様へ逆流）

- 歴史的データ（id保存/name保存）の両立が必要
- キャッシュ未初期化時の解決順序で見落としが発生しやすい
- 既存契約を壊さず後方互換を維持する必要

## システム仕様参照（aiworkflow-requirements）

### 抽出手順（Progressive Disclosure）

1. `indexes/resource-map.md` で Skill/Main Service の参照導線を特定する。
2. `scripts/search-spec.js` で `importedSkills` / `skill import` を検索し、該当仕様を絞り込む。
3. 変更ファイル（`SkillService.ts`, `skillHandlers.ts`, `SkillService.test.ts`）と仕様書の対応を確定する。

### 仕様書別 SubAgent 分担（仕様同期）

| SubAgent | 担当仕様書                                                                                                         | 責務                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| A        | `references/arch-electron-services.md` / `references/architecture-overview.md`                                     | Main Service層の復元ロジックと責務境界の同期 |
| B        | `references/api-ipc-agent.md` / `references/interfaces-agent-sdk-skill.md` / `references/security-electron-ipc.md` | IPC契約・型契約・境界防御の整合確認          |
| C        | `references/task-workflow.md` / `references/error-handling.md`                                                     | 検証観点とPhase 12記録観点の同期             |

### 抽出済み参照仕様（今回実装に必要）

| 参照資料             | パス                                                                                        | 反映ポイント                           |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| 参照起点             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 必要仕様の絞り込み起点                 |
| 早見表               | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | Skill/IPCの主要契約確認                |
| Main Service仕様     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | `getImportedSkills` の責務・戻り値契約 |
| API/IPC 仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC引数・戻り値・エラー契約            |
| API一覧              | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | Skill管理チャネルの全体整合            |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `importedSkills` 型契約                |
| セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC境界での入力/送信元検証             |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `importedSkills` 系の既知ドリフト回避  |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 復元失敗時の扱い整理                   |
| 全体設計             | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main-IPC-Renderer依存方向の整合        |
| タスク台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了/未タスク反映                      |

## ブランチ差分カバレッジ（本タスク担当）

| 種別         | 変更ファイル                                                          | 担当        | 根拠                                    |
| ------------ | --------------------------------------------------------------------- | ----------- | --------------------------------------- |
| Main実装     | `apps/desktop/src/main/services/skill/SkillService.ts`                | ✅ 01       | `getImportedSkills` の id/name 互換復元 |
| Mainテスト   | `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts` | ✅ 01       | 後方互換ケース（name保存）検証          |
| IPC契約      | `apps/desktop/src/main/ipc/skillHandlers.ts`                          | ➡️ 02へ委譲 | 冪等戻り値契約は 02 の主責務            |
| Renderer防御 | `apps/desktop/src/renderer/views/SkillCenterView/**`                  | ➡️ 03へ委譲 | 欠損メタデータ防御は 03 の主責務        |

## 横断依存関係（01視点）

| 依存先            | 関係               | 整合条件                                                   |
| ----------------- | ------------------ | ---------------------------------------------------------- |
| 02-idempotency    | 01の上位契約を消費 | 01で復元された imported 状態を 02 が再インポート抑止に利用 |
| 03-metadata-guard | 間接依存           | 01/02で供給される一覧データを 03 が安全表示する            |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001
```
