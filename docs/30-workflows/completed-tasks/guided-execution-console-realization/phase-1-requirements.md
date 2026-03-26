# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

一般ユーザー向けの `実行コンソール` を成立させるため、対象範囲、禁止事項、root 受入基準を明文化する。

## 実行タスク

- 要件抽出: terminal-first ではなく guided-execution-first の要件へ変換する
- スコープ固定: root が扱う責務と配下 task へ委譲する責務を分離する
- 受入基準定義: 配下 task が共通で満たすべき UX / safety 条件を固定する

## 参照資料

| 資料名               | パス                                                                                                            | 説明                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| canonical workflow   | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | runtime / handoff の正本         |
| navigation           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                         | route / view / IA の正本         |
| agent execution core | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                               | dock / transcript / share の正本 |
| parent UX pack       | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`                        | 既存語彙との整合確認             |
| unassigned tasks     | `docs/30-workflows/unassigned-task/ut-viewtype-terminal-addition.md`                                            | 既存 GAP の確認                  |
| unassigned tasks     | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md`                         | CTA 未配線の確認                 |
| unassigned tasks     | `docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001.md`                                 | session persistence GAP の確認   |

## root 受入基準

| ID   | 基準                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| AC-1 | front UI の primary label が `実行コンソール` 系へ正規化されている            |
| AC-2 | `APIで実行` と `端末で続ける` の 2 レーンが明示されている                     |
| AC-3 | transcript / artifact / share / approval が task 単位で責務分離されている     |
| AC-4 | no auto-send、manual share、AI 開示、外部送信開示が全 task に引き継がれている |

## 実行手順

### ステップ1: root 要件を確定する

一般ユーザー向け UI の主語を `terminal` から `実行` へ置き換え、front naming を固定する。

### ステップ2: existing GAP を root スコープへ再配置する

既存 unassigned task を読み、どの責務に再編するかを決める。

### ステップ3: task 分割の前提条件を定義する

Task01-03 が共通で従う CTA、manual boundary、Phase 3 gate 条件を決める。

## 統合テスト連携

Phase 4 以降の各 task で、少なくとも `routing` `dock` `artifact summary` `approval` `manual share` の 5 観点を統合テスト対象に含める。

## 成果物

| 成果物          | パス                                         | 説明                                   |
| --------------- | -------------------------------------------- | -------------------------------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | root 要件と受入基準                    |
| スコープ定義    | `outputs/phase-1/scope-definition.md`        | root と task の責務境界                |
| spec 抽出マップ | `outputs/phase-1/spec-extraction-map.md`     | system spec と code anchor の 1:1 対応 |

## 完了条件

- [ ] root 受入基準が 4 件以上の検証可能な文章で定義されている
- [ ] 既存 GAP が Task01-03 のいずれかへ割り当てられている
- [ ] manual boundary と compliance 条件が root 前提として明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md)
