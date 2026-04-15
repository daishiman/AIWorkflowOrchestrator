# Phase 12: 未タスク検出

## メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| Phase    | 12                              |
| 実行日   | 2026-04-15                      |
| タスクID | TASK-SC-IMP-CREATE-WORKFLOW-001 |

---

## 検出された未タスク

### 未タスク-01: generateSkillMd への structurePlan 接続

| 項目   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| 優先度 | High                                                                             |
| 依存   | TASK-SC-FIX-GENERATE-SKILL-MD-001 の完了                                         |
| 内容   | `void structurePlan` を `generateSkillMd(skillDir, structurePlan)` に置換        |
| 理由   | タスクAで `generate_skill_md.js` の `--plan` / `--output` を受け付ける前提が必要 |

### 未タスク-02: LLM 呼び出しの最終接続

| 項目   | 内容                                                                |
| ------ | ------------------------------------------------------------------- |
| 優先度 | Medium                                                              |
| 依存   | 未タスク-01 の完了                                                  |
| 内容   | `purpose` を実 LLM 呼び出し結果へ差し替える                         |
| 理由   | `generate_skill_md.js` 側で最終生成を担う設計に接続してから判断する |

### 未タスク-03: `StructurePlanJson` の共有型昇格判断

| 項目   | 内容                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| 優先度 | Low                                                                            |
| 依存   | タスクA接続後の契約確認                                                        |
| 内容   | `StructurePlanJson` を `@repo/shared/types` に昇格するか判断する               |
| 理由   | 現時点ではローカル型で十分だが、後続の生成・検証が増えるなら共通化の余地がある |

---

## 本タスクのスコープ内で完了した項目

- `StructurePlanJson` 型定義
- `runCreateWorkflow` の `Promise<void>` → `Promise<StructurePlanJson | null>` 変更
- `loadAgent("extract-purpose")` / `loadAgent("plan-structure")` 呼び出し
- フォールバック（null 返却）実装
- TC-01〜TC-05 テスト追加
