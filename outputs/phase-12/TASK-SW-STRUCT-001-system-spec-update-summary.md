# TASK-SW-STRUCT-001 system spec 反映確認

## 変更の外部影響

本タスクの変更は `SkillCreatorService` の内部実装と Phase 12 ドキュメントの更新のみで、公開 API には影響しない。

| 層             | 変更有無 | 理由                                 |
| -------------- | -------- | ------------------------------------ |
| IPC チャンネル | なし     | `createSkill()` のシグネチャ変更なし |
| Preload 層     | なし     | IPC 契約変更なし                     |
| Renderer 層    | なし     | フロントエンドへの影響なし           |
| 外部 API       | なし     | 公開インターフェース変更なし         |

## Step 1: current facts の固定

### Step 1-A: 実装の current facts

| 項目                  | current facts                                      |
| --------------------- | -------------------------------------------------- |
| `runCreateWorkflow()` | `StructurePlanJson` を組み立てるだけの薄い層       |
| `purpose`             | `options.description`                              |
| `agents`              | `["extract-purpose", "plan-structure"]`            |
| `features`            | `[]`                                               |
| 失敗時の挙動          | `null` を返して `createSkill()` 側でフォールバック |

### Step 1-B: `createSkill()` の current facts

| 項目           | current facts                                                           |
| -------------- | ----------------------------------------------------------------------- |
| 実行順序       | `runCreateWorkflow()` -> `init_skill.js` -> `generateSkillMd()`         |
| SKILL.md 生成  | create モードでは `generateSkillMd()` が `structurePlan` を消費する     |
| フォールバック | `structurePlan` が `null` の場合は `ensureSkillMdExists()` に切り替える |

### Step 1-C: ドキュメント current facts

| 項目           | current facts                                               |
| -------------- | ----------------------------------------------------------- |
| 未来タスク表現 | future wording は current docs から除去                     |
| 命名           | `TASK-SW-STRUCT-001-*` を Phase 12 の正規成果物名として採用 |
| 方針           | 未接続表現は使用しない                                      |

### Step 1-D: artifact / state parity

| 対象                                                  | 結果                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| `docs/30-workflows/p01-par-STRUCT-001/artifacts.json` | phase artifact 名と status を current facts に合わせて確認     |
| `outputs/artifacts.json`                              | 別 workflow の ledger のため parity 対象外（参照のみ）         |
| 状態同期                                              | Phase 9 / 11 / 12 / 13 の完了状態を current facts と整合させる |

## Step 2: aiworkflow-requirements への反映

### Step 2A: 参照した正本

| 参照資料                                  | 反映内容                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `task-workflow.md`                        | Phase 12 の current facts と task 完了状態の確認                                      |
| `arch-electron-services-details-part1.md` | `SkillCreatorService` / `StructurePlanJson` / `generateSkillMd()` の current contract |
| `lessons-learned-current-2026-04.md`      | `runCreateWorkflow()` と `generateSkillMd()` の責務分離の教訓                         |

### Step 2B: 更新結果

| 項目                     | 結果 |
| ------------------------ | ---- |
| 新規インターフェース追加 | なし |
| 既存インターフェース変更 | なし |
| 追加定数/設定値          | なし |
| API 変更                 | なし |

## current / baseline

| 観点                 | baseline                       | current                                                     |
| -------------------- | ------------------------------ | ----------------------------------------------------------- |
| create モードの責務  | 将来接続を前提にした曖昧な表現 | `StructurePlanJson` を組み立てて `generateSkillMd()` に渡す |
| `purpose` / `agents` | プロンプト本文を含む表現       | 意味的に正しい値を保持                                      |
| Phase 12 文言        | future-task 前提の記述         | current facts に合わせて整理済み                            |
