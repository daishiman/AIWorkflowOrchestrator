# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 1                                                   |
| Phase名    | 要件定義                                            |
| 対象機能   | TASK-P0-07 hardcoded-agent-names-dynamic-resolution |
| 前提Phase  | -                                                   |
| 次Phase    | Phase 2: 設計                                       |
| ステータス | pending                                             |
| 作成日     | 2026-03-29                                          |
| 更新日     | 2026-03-30                                          |

## 目的

本ブランチの変更分が `task-specification-creator` と `aiworkflow-requirements` の両 skill に漏れなく準拠しているかを先に固定し、`AGENT_NAMES` のハードコードを動的解決へ置き換える要件を、検証可能な粒度で定義する。

## 実行タスク

### Task 1: 仕様の正本を読む

- `task-specification-creator` の Phase 1 / Phase 12 / quality ルールを確認する
- `aiworkflow-requirements` の canonical / link / update policy を確認する
- `requirements-draft.md`、`root-workflow-pack/index.md`、`p0-verify-manifest-remediation-pack.md` を確認する

### Task 2: 変更差分を棚卸しする

- `index.md` と Phase ファイルの不足・重複・broken link を洗い出す
- 新しい task directory の相対パスが正しいかを確認する
- 参照先が旧 lane のまま残っていないかを確認する

### Task 3: 受入基準を固定する

- `AGENT_NAMES` の動的解決に必要な AC-1〜AC-6 を検証可能な形へ整える
- デフォルトフォールバックと後方互換性の判定条件を明記する

### Task 4: スコープ境界を固定する

- 含む / 含まない / 非対象を整理し、ManifestLoader と WorkflowEngine の責務境界を分離する
- 既存実装を patch で活かせるか、再構成が必要かの判断材料を残す

### Task 5: SubAgent 分担を定義する

- skill 準拠監査、30思考法分析、仕様再構成、最終統合の担当を分ける
- 並列可能な作業と直列制約を記録する

## 参照資料

| 資料名                     | パス                                                                     | 説明                                  |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------------- |
| task-specification-creator | `../../../.claude/skills/task-specification-creator/SKILL.md`            | Phase 構成・必須成果物の正本          |
| aiworkflow-requirements    | `../../../.claude/skills/aiworkflow-requirements/SKILL.md`               | canonical spec / link / update policy |
| lane 要件草案              | `../skill-creator-agent-sdk-lane/requirements-draft.md`                  | skill-creator 全体の背景と制約        |
| 親 workflow pack           | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`            | lane 共通不変条件                     |
| P0 是正パック              | `../skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | 15 タスクの依存順と背景               |
| task 概要                  | `index.md`                                                               | 受入基準と影響範囲                    |

## SubAgent 実行計画

| SubAgent   | 担当                      | 主な成果物          | 並列性     |
| ---------- | ------------------------- | ------------------- | ---------- |
| SubAgent-A | skill 準拠監査            | spec extraction map | B と並列可 |
| SubAgent-B | 差分棚卸し                | spec extraction map | A と並列可 |
| SubAgent-C | スコープ / 依存境界の整理 | subagent ownership  | A/B 後     |
| SubAgent-D | 統合判定                  | phase 1 gate note   | C 後       |

## 実行手順

### ステップ1: 受入基準を定義する

index.md の受入基準を、テスト可能な条件に変換して並べる。

### ステップ2: 正本と差分を対応付ける

skill 定義、lane 正本、変更差分の三者を並べ、どの項目がどこで満たされるかを明記する。

### ステップ3: スコープを明確化する

実装対象と非対象を分け、責務境界と依存順を固定する。

### ステップ4: SubAgent 分担を確定する

並列実行できる作業を先に切り分け、直列制約だけを残す。

## 成果物

| 成果物                 | パス                                        | 説明                           |
| ---------------------- | ------------------------------------------- | ------------------------------ |
| spec extraction map    | `outputs/phase-1/spec-extraction-map.md`    | 要件抽出、差分棚卸し、受入条件 |
| skill compliance audit | `outputs/phase-1/skill-compliance-audit.md` | 2つの skill 定義への準拠監査   |
| subagent ownership     | `outputs/phase-1/subagent-ownership.md`     | 関心分離と並列実行計画         |

## 完了条件

- [ ] 受入基準が検証可能な形で定義されている
- [ ] skill 正本と変更差分の対応が明確である
- [ ] skill 準拠監査が成果物として保存されている
- [ ] スコープ境界が明確である
- [ ] SubAgent 分担と並列/直列制約が明記されている
- [ ] broken link と参照不足が解消されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
