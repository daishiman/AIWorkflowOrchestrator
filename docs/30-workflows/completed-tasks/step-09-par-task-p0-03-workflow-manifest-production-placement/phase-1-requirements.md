# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 1                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

workflow-manifest.json の canonical 配置に必要な要件・制約・受入条件を固定する。ManifestLoader の検証ルールを正本とし、skill-creator ディレクトリ構造を manifest schema へマッピングしつつ、`.claude` / `.agents` の root 方針を前提条件として確定する。

## 実行タスク

- FR-01 マッピング: ManifestLoader の検証ルールから manifest 必須フィールドを抽出する
- manifest schema 要件: schemaVersion、workflowId、phases、resources、entry/exit hooks の構造要件を固定する
- skill-creator ディレクトリ棚卸し: agents/、references/、schemas/、scripts/、assets/ の実在構造を確認する
- 受入基準の定義: AC-1 から AC-7 の判定基準を固定する

## 参照資料

| 資料名               | パス                                                                                                 | 説明                        |
| -------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------- |
| ManifestLoader       | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | 検証ルールの正本            |
| テストフィクスチャ   | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | manifest 構造のリファレンス |
| skill-creator 正本   | `.claude/skills/skill-creator/`                                                                      | 配置先ディレクトリ          |
| skill-creator mirror | `.agents/skills/skill-creator/`                                                                      | parity 確認対象             |
| SKILL.md             | `.claude/skills/skill-creator/SKILL.md`                                                              | skill 定義                  |
| path 定数            | `apps/desktop/src/main/services/skill/constants.ts`                                                  | パス定数                    |
| P0 是正パック        | `../p0-verify-manifest-remediation-pack.md`                                                          | 親タスクパック              |

## 機能要求

| ID    | 要求                                                                              |
| ----- | --------------------------------------------------------------------------------- |
| FR-01 | manifest は ManifestLoader.loadManifest() の全検証項目を通過すること              |
| FR-02 | schemaVersion は WORKFLOW_MANIFEST_SCHEMA_VERSION（= 1）と一致すること            |
| FR-03 | workflowId は skill-creator を一意に識別する文字列であること                      |
| FR-04 | phases[] は skill creation workflow の lifecycle（5 phase）をカバーすること       |
| FR-05 | resources[] は `.claude/skills/skill-creator/` 内の実在ファイルを参照すること     |
| FR-06 | `.agents/skills/skill-creator/workflow-manifest.json` が canonical と同期すること |
| FR-07 | resource の kind は "agent"、"reference"、"schema" のいずれかにマッピングすること |
| FR-08 | entry/exit hooks は各 phase に対応し、ManifestLoader の hooks 検証を通過すること  |

## 非機能要求

| ID     | 要求                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| NFR-01 | manifest の JSON は human-readable で、変更差分が追跡しやすい構造であること    |
| NFR-02 | skill-creator ディレクトリ構造の変更時に manifest の更新箇所が最小限であること |
| NFR-03 | テストフィクスチャとの構造互換性を維持すること                                 |

## 制約

| ID   | 制約                                                       |
| ---- | ---------------------------------------------------------- |
| C-01 | ManifestLoader のコード変更は行わない（TASK-P0-04 の責務） |
| C-02 | skill-creator ディレクトリ構造自体は変更しない             |
| C-03 | runtime pipeline への manifest 組み込みは行わない          |

## 実行手順

### ステップ1: ManifestLoader 検証ルールを抽出する

ManifestLoader.ts の `loadManifest()` メソッドから、必須フィールドと検証条件を一覧化し、mirror parity で補う論点を分離する。

### ステップ2: skill-creator ディレクトリ構造を棚卸しする

`.claude/skills/skill-creator/` を正本として agents/（38 files）、references/（56 files）、schemas/（40 files）、scripts/（31 files）、assets/（56 files）の代表的なファイルを確認し、resource descriptor の候補を決める。

### ステップ3: manifest schema 要件を固定する

テストフィクスチャの構造を参考に、本番 manifest の必須項目と省略可能項目を整理する。

### ステップ4: 受入基準を定義する

AC-1 から AC-7 の判定方法と検証コマンドを固定する。

## 統合テスト連携

| 観点                | 実施内容                                                    |
| ------------------- | ----------------------------------------------------------- |
| ManifestLoader 整合 | loadManifest() の全検証項目が FR に反映されていること       |
| ディレクトリ実在性  | resource descriptor が参照するパスが実在すること            |
| mirror parity       | `.claude` と `.agents` の同期条件が FR に反映されていること |
| schema 互換性       | テストフィクスチャと同一の schema structure であること      |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                                       |
| -------- | --------------------------------------------------------------- |
| 分析思考 | ManifestLoader の検証ルールを漏れなく抽出できているか           |
| 構造思考 | skill-creator のディレクトリ構造と resource kind の対応が妥当か |
| 境界思考 | TASK-P0-04 との責務境界が明確か                                 |

## サブタスク管理

1. ManifestLoader 検証ルール抽出
2. skill-creator ディレクトリ棚卸し
3. manifest schema 要件固定
4. 受入基準定義

## 成果物

| 成果物               | パス                                           | 説明                     |
| -------------------- | ---------------------------------------------- | ------------------------ |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`   | FR / NFR / 制約の確定    |
| 検証ルール抽出表     | `outputs/phase-1/manifest-validation-rules.md` | ManifestLoader 検証項目  |
| ディレクトリ棚卸し表 | `outputs/phase-1/directory-inventory.md`       | skill-creator 構造の確認 |

## 完了条件

- [ ] ManifestLoader の検証ルールが一覧化されている
- [ ] skill-creator ディレクトリ構造が棚卸しされている
- [ ] FR / NFR / 制約が定義されている
- [ ] 受入基準 AC-1 から AC-7 の判定方法が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] ManifestLoader.ts を読み、検証ルールを抽出した
- [ ] テストフィクスチャを読み、構造を確認した
- [ ] skill-creator ディレクトリを棚卸しした
- [ ] FR / NFR / 制約を定義した

## 次のPhase

Phase 2: 設計
