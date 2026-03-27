# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify で追加する concern、非対象、受入基準、sibling task 境界を固定する。

## 実行タスク

- 真の論点を 1 文で固定する
- Layer 3 / Layer 4 verify の concern inventory を抽出する
- governance / session 項目を委譲先ごとに分離する
- 受入基準を DTO / UI / validation / close-out へ展開可能な形で定義する
- current code anchor と system spec の対応を固定する

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| 真の論点                   | verify depth を増やしても owner を増やさず、evidence surface を deeper にすること                       |
| 依存関係・責務境界の問題点 | governance と session を取り込むと genuine gap がぼやけるため、Task07 / Task08 へ明示委譲が必要         |
| 価値とコストの不均衡       | 実装先行よりも field set と delegated item を先に固定する方が再実装コストを抑えられる                   |
| 改善優先順位               | 1. concern inventory 2. delegated boundary 3. acceptance criteria 4. current anchor map                 |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: Task06/07/08 参照で高 / 運用性: validation と Phase 12 を定義すれば高 |

## 参照資料

| 資料名         | パス                                                                                                                                        | 説明                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 入力 task      | `../unassigned-task/task-imp-task-sdk-06-layer34-verify-expansion-001.md`                                                                   | Why/What/How と完了条件              |
| Task06 index   | `../skill-creator-agent-sdk-lane/step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`                                         | Layer 1 / 2 verify と non-goal       |
| Task06 Phase 2 | `../skill-creator-agent-sdk-lane/step-04-par-task-06-verify-and-improve-lifecycle-surface/outputs/phase-2/verify-improve-surface-matrix.md` | Layer 1 / 2 surface の current fact  |
| Task07 Phase 1 | `../skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/phase-1-requirements.md`                    | governance owner と handoff boundary |
| Task08 index   | `../skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md`                                      | session compatibility owner          |

### システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                                                              | 内容                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| created skill usage journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`       | runtime surface / CTA / reuse 導線の上位文脈 |
| agent execution core        | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                                 | `HandoffGuidance` と Manual Boundary の正本  |
| skill reference bundle      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | shared DTO 同期時の標準パターン              |
| follow-up backlog           | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                      | follow-up 台帳の配置と登録方針               |

## 受入条件

- [ ] AC-1: Layer 3 / Layer 4 verify で追加する concern が `owner / consumer / delegated / non-goal` に分離されている
- [ ] AC-2: `verifyResult` / `sourceProvenance` / `routeSnapshot` の owner が `SkillCreatorWorkflowEngine` のまま維持される
- [ ] AC-3: Task07 の governance 項目と Task08 の session semantics 項目が delegated item として明示されている
- [ ] AC-4: shared types / IPC / preload / facade / renderer の 5 層で同じ field set をトレースできる
- [ ] AC-5: unit / integration / docs QA / manual walkthrough / Phase 12 close-out の検証観点が定義されている
- [ ] AC-6: commit / PR / push は対象外として固定されている

## 実行手順

### ステップ1: concern inventory を固定する

- Layer 3 / Layer 4 で追加したい判定軸を `evidence / provenance / action / risk` の 4 群に分ける。
- Task06 がすでに持つ Layer 1 / 2 concern と重複しないよう、差分だけを列挙する。

### ステップ2: sibling boundary を固定する

- governance / disclosure / approval / manual boundary は Task07 owner として残す。
- persistence / resume invalidation / stale session は Task08 owner として残す。
- 本 task は verify detail / re-verify / evidence mapping に限定する。

### ステップ3: acceptance を検証可能にする

- DTO 追加、IPC payload、renderer section、manual test、Phase 12 成果物のどこで AC を証明するかを紐付ける。
- `outputs/phase-1/spec-extraction-map.md` を Phase 2 以降の基準にする。

## 統合テスト連携

- Phase 4 で Layer 3 / Layer 4 concern ごとの test matrix を作成する。
- Phase 6 で delegated item 侵食防止の regression case を追加する。
- Phase 9 で Task07 / Task08 との責務衝突がないか docs QA を再監査する。

## 成果物

| 成果物              | パス                                     | 説明                              |
| ------------------- | ---------------------------------------- | --------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | concern と受入基準の固定          |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | source / code anchor / gap の対応 |

## 完了条件

- [ ] concern inventory が `owner / consumer / delegated / non-goal` に分離されている
- [ ] AC-1 から AC-6 が後続 Phase で追跡可能である
- [ ] current code anchor と system spec の対応が記録されている
- [ ] Task07 / Task08 との責務境界が明文化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. concern inventory の抽出
3. sibling boundary の固定
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 2 へ渡す acceptance と source map が固定されている
