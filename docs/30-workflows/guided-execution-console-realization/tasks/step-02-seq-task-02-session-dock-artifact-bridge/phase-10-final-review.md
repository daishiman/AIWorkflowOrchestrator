# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| Phase名    | 最終レビュー                              |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-9                                 |
| 後続Phase  | Phase 11（手動テスト）                    |
| ステータス | not_started                               |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session surface が `artifact-first / manual-share / restoreable` を満たすかを判定する。

## 実行タスク

- AC review
- dependency review
- gate decision

## 参照資料

- 依存Phase: Phase 1, Phase 2, Phase 5
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- task 実装計画: `phase-5-implementation.md`
- task 品質確認: `phase-9-quality-assurance.md`

## 成果物

| 成果物           | パス                                      | 説明                 |
| ---------------- | ----------------------------------------- | -------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | AC 判定              |
| 最終 gate        | `outputs/phase-10/final-gate-decision.md` | PASS / MINOR / MAJOR |

## 完了条件

- [ ] AC-1〜AC-4 の判定がある
- [ ] Task03 へ渡す safety 論点が記録されている
- [ ] gate decision が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md)
