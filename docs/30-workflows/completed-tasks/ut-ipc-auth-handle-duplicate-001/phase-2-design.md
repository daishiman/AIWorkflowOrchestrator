# Phase 2: 設計

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

重複式を排除しつつ契約を維持する登録一元化設計を確定する。

## 実行タスク

- SubAgent-C: 登録一元化方式（登録マップ/ヘルパー）の比較設計を作成する。
- SubAgent-B: テスト設計と連動する観点で副作用リスクを整理する。
- Lead: 採用方式を1つに決定し、Phase 3レビュー素材を整える。

## 参照資料

| 参照資料                     | パス                                                                                        | 内容           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1要件                  | `phase-1-requirements.md`                                                                   | 要件と制約     |
| IPC契約チェック              | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約整合ルール |
| 実装パターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P44/P45対策 |
| acceptance-criteria.md       | `outputs/phase-1/acceptance-criteria.md`                                                    | Phase 1 成果物 |
| requirements-definition.md   | `outputs/phase-1/requirements-definition.md`                                                | Phase 1 成果物 |
| spec-planned-artifacts.md    | `outputs/phase-1/spec-planned-artifacts.md`                                                 | Phase 1 成果物 |
| subagent-responsibilities.md | `outputs/phase-1/subagent-responsibilities.md`                                              | Phase 1 成果物 |

## 実行手順

1. 候補方式の責務分離と変更点を比較する。
2. AUTHチャネル追加時の拡張手順を設計に含める。
3. テスト観点と設計観点の対応表を作成する。

## 統合テスト連携

| 統合ポイント | 設計反映内容                       |
| ------------ | ---------------------------------- |
| Main→Preload | 既存APIシグネチャを不変に維持      |
| Main内部     | 登録方式を一元化して変更点を局所化 |
| 回帰テスト   | 既存AUTH IPCシナリオで互換性を検証 |

## 成果物

| 成果物          | パス                                     | 説明           |
| --------------- | ---------------------------------------- | -------------- |
| 一元化設計書    | `outputs/phase-2/registration-design.md` | 採用方式と理由 |
| リスク分析      | `outputs/phase-2/risk-analysis.md`       | 副作用と回避策 |
| 設計-テスト対応 | `outputs/phase-2/design-test-mapping.md` | 追跡性マップ   |

## 完了条件

- [ ] 採用方式が1つに確定している
- [ ] リスクと回避策が設計書に記載されている
- [ ] Phase 3で判定可能なレビュー観点が定義済み
- [ ] 統合テスト連携要件が設計へ反映済み
- [ ] 本Phase内の全タスクを100%実行完了
