# Phase 1: 要件定義

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

verify 実行エンジン（Layer 1/2）の検証対象、チェック項目、結果型、Facade 連携方式を要件として固定する。

## 実行タスク

- FR-04 verify 契約から Layer 1/2 に該当する要件を抽出する
- Layer 1（構造検証）のチェック項目を定義する
- Layer 2（コンテンツルール検証）のチェック項目を定義する
- `RuntimeSkillCreatorVerifyCheck` 型の拡張要件を定義する
- AC-1〜AC-6 への写像を確認する

## 参照資料

| 資料名           | パス                                                                   | 説明                                    |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| 要件草案         | `../requirements-draft.md`                                             | FR-04 verify 契約                       |
| P0 是正パック    | `../p0-verify-manifest-remediation-pack.md`                            | P0-1 問題定義と設計原則                 |
| 親 workflow pack | `../root-workflow-pack/index.md`                                       | lane 共通不変条件                       |
| WorkflowEngine   | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `buildVerifyDetail()` の現状            |
| 型定義           | `packages/shared/src/types/skillCreator.ts`                            | `RuntimeSkillCreatorVerifyCheck` 現行型 |

### 現行コードアンカー

| ファイル                                                               | 観察点                                                                     |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                            | `RuntimeSkillCreatorVerifyCheck.layer` は現在 `"layer3"` / `"layer4"` のみ |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `buildVerifyDetail()` はスナップショット生成のみ。実検証なし               |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | `recordVerifyFailure()` あり、`recordVerifyPass()` なし                    |

## 実行手順

### ステップ1: FR-04 から Layer 1/2 要件を抽出する

- FR-04「verify は独立した契約として存在すること」から、Layer 1/2 のスコープを抽出する。
- Layer 1 = 構造検証（ファイル・ディレクトリの存在）
- Layer 2 = コンテンツルール検証（フィールド・フォーマット準拠）
- Layer 3/4 は対象外として明示する。

### ステップ2: Layer 1 チェック項目を定義する

- `SKILL.md` ファイルの存在
- `agents/` ディレクトリの存在
- 必須ファイル構造の存在（`SKILL.md`、`agents/` 配下に少なくとも 1 ファイル）
- 推奨ファイルの存在（`references/`、`output-schema.json` など）は warning レベル

### ステップ3: Layer 2 チェック項目を定義する

- `SKILL.md` の必須フィールド: `# スキル名`、`## 概要`、`## Trigger`、`## Anchors`
- Markdown フォーマット準拠（heading 構造、リスト構文）
- agents/ 配下のエージェント仕様書に `# エージェント名`、`## 責務` が存在すること
- `output-schema.json` が存在する場合の JSON 構文妥当性

### ステップ4: 結果型の拡張要件を定義する

- `RuntimeSkillCreatorVerifyCheck.layer` を `"layer1" | "layer2" | "layer3" | "layer4"` に拡張する。
- severity は既存の定義を維持する。
- `evidenceSummary` に具体的なファイルパスやフィールド名を記録する。

## 統合テスト連携

- Phase 4 で Layer 1/2 チェック項目を test case へ変換する。
- Phase 7 で全チェック項目の coverage を確認する。
- Phase 9 で型拡張と既存 Layer 3/4 の互換性を監査する。

## 成果物

| 成果物              | パス                                     | 説明                                   |
| ------------------- | ---------------------------------------- | -------------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | Layer 1/2 の要件固定                   |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | FR-04 → Layer 1/2 チェック項目の対応表 |

## 完了条件

- [ ] Layer 1 チェック項目が列挙されている
- [ ] Layer 2 チェック項目が列挙されている
- [ ] `RuntimeSkillCreatorVerifyCheck.layer` の拡張要件が定義されている
- [ ] AC-1〜AC-6 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
