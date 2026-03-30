# Phase 5: 実装

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 5                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

workflow-manifest.json を正本 `.claude/skills/skill-creator/` に作成し、mirror `.agents/skills/skill-creator/` と同期する。Phase 2 で確定した manifest 構造に従い、ManifestLoader.loadManifest() の検証を通過するファイルを生成する。

## 実行タスク

- manifest JSON 作成: Phase 2 設計に基づく workflow-manifest.json を作成する
- resource path 確認: 全 resource descriptor の path が実在ファイルを指すことを確認する
- mirror parity 確認: `.claude` と `.agents` の manifest が一致することを確認する
- ManifestLoader 検証実行: loadManifest() で manifest を読み込み、検証を通過することを確認する

## 参照資料

| 資料名              | パス                                           | 説明              |
| ------------------- | ---------------------------------------------- | ----------------- |
| phase-2 design      | `phase-2-design.md`                            | manifest 構造設計 |
| phase-4 test        | `phase-4-test-creation.md`                     | テストケース      |
| manifest 構造設計書 | `outputs/phase-2/manifest-structure-design.md` | JSON 全体構造     |
| resource mapping 表 | `outputs/phase-2/resource-mapping.md`          | resource 変換表   |
| phase-hook 対応表   | `outputs/phase-2/phase-hook-mapping.md`        | hook 対応関係     |
| test plan           | `outputs/phase-4/test-plan.md`                 | テスト実行計画    |

## 実装内容

### 作成ファイル

| ファイル                                              | 内容                          |
| ----------------------------------------------------- | ----------------------------- |
| `.claude/skills/skill-creator/workflow-manifest.json` | 本番 manifest 正本ファイル    |
| `.agents/skills/skill-creator/workflow-manifest.json` | 本番 manifest mirror ファイル |

### manifest 構造

- `schemaVersion`: 1
- `workflowId`: "skill-creator"
- `phases[]`: requirements-gathering, plan, execute, verify, improve の 5 phase
- `resources[]`: agents/, references/, schemas/ から代表的ファイルの resource descriptor
- `entry[]`: 各 phase の entry hook（validation command）
- `exit[]`: 各 phase の exit hook（handoff command）

### 検証手順

1. manifest JSON を作成する
2. JSON syntax validation（`JSON.parse`）を通す
3. `.claude/skills/skill-creator/` に配置し、`.agents/skills/skill-creator/` mirror を同期する
4. resource descriptor の全 path が実在するか `fs.existsSync()` で確認する
5. `diff -q` 等で canonical / mirror parity を確認する
6. ManifestLoader.loadManifest() で読み込み、エラーなしを確認する

## 実行手順

### ステップ1: manifest JSON を作成する

Phase 2 設計の manifest 構造設計書に基づき、workflow-manifest.json を作成する。

### ステップ2: resource path を検証する

全 resource descriptor の path が `.claude/skills/skill-creator/` 配下の実在ファイルを指し、mirror drift がないことを確認する。

### ステップ3: ManifestLoader 検証を実行する

Phase 4 で定義したテストケース TC-01 から TC-07 を実行し、全 PASS を確認する。

## 統合テスト連携

| 観点           | 実施内容                                  |
| -------------- | ----------------------------------------- |
| JSON validity  | JSON.parse で構文エラーがないこと         |
| path existence | 全 resource.path が実在すること           |
| mirror parity  | `.claude` と `.agents` に差分がないこと   |
| ManifestLoader | loadManifest() がエラーなしで完了すること |
| test cases     | TC-01 から TC-07 が全て PASS すること     |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                             |
| -------- | ----------------------------------------------------- |
| 実務性   | manifest が ManifestLoader で実際に読めること         |
| 正確性   | resource path が skill-creator の実ファイルを指すこと |
| 境界意識 | ManifestLoader のコード変更を行っていないこと         |

## サブタスク管理

1. manifest JSON 作成
2. resource path 検証
3. ManifestLoader 検証実行
4. Phase 6 input 整理

## 成果物

| 成果物                     | パス                                                  | 説明               |
| -------------------------- | ----------------------------------------------------- | ------------------ |
| workflow-manifest.json     | `.claude/skills/skill-creator/workflow-manifest.json` | 本番 manifest 正本 |
| workflow-manifest mirror   | `.agents/skills/skill-creator/workflow-manifest.json` | parity 確認対象    |
| mirror parity log          | `outputs/phase-5/mirror-parity-log.md`                | 同期結果の記録     |
| implementation evidence    | `outputs/phase-5/implementation-evidence.md`          | 検証結果の記録     |
| resource validation result | `outputs/phase-5/resource-validation-result.md`       | path 実在性の確認  |

## 完了条件

- [ ] workflow-manifest.json が `.claude/skills/skill-creator/` に存在する
- [ ] `.agents/skills/skill-creator/` mirror と parity が取れている
- [ ] JSON syntax validation を通過する
- [ ] 全 resource descriptor の path が実在ファイルを指す
- [ ] ManifestLoader.loadManifest() がエラーなしで完了する
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 2 を参照した
- [ ] Phase 4 を参照した
- [ ] manifest JSON を作成した
- [ ] resource path を検証した
- [ ] ManifestLoader 検証を実行した

## 次のPhase

Phase 6: テスト拡充
