# Phase 1 Spec Extraction Map

## 目的

FR-04 verify 契約と current workflow scope を、Layer 1/2 チェックへ落とし込む。

## 対応表

| 要件源                                      | 抽出内容                    | 本 workflow への反映                                                           |
| ------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ | -------- | -------- | ---------------- |
| `../requirements-draft.md` FR-04            | verify を独立契約として扱う | `SkillCreatorVerificationEngine.verify(skillDir)` を独立 public API として定義 |
| `../p0-verify-manifest-remediation-pack.md` | verify phase の空洞化是正   | WorkflowEngine は state owner、検証ロジックは engine へ分離                    |
| `packages/shared/src/types/skillCreator.ts` | verify result 型の互換維持  | `layer` を `"layer1"                                                           | "layer2" | "layer3" | "layer4"` へ拡張 |

## Layer 1 / Layer 2 への写像

| Layer       | チェック観点                                   | AC         |
| ----------- | ---------------------------------------------- | ---------- |
| Layer 1     | `SKILL.md`、`agents/`、必須構造                | AC-2       |
| Layer 2     | 必須見出し、agent doc frontmatter、JSON 妥当性 | AC-3       |
| Aggregate   | `RuntimeSkillCreatorVerifyCheck[]` 返却        | AC-4       |
| Integration | Facade injection とテスト導線                  | AC-5, AC-6 |
