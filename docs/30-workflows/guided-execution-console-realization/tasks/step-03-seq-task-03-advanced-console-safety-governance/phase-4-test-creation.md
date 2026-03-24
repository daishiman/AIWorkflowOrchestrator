# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 4                                               |
| Phase名    | テスト作成                                      |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-3                                       |
| 後続Phase  | Phase 5（実装）                                 |
| ステータス | not_started                                     |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval、disclosure、manual boundary、advanced console opt-in のテスト仕様を定義する。

## 実行タスク

- approval case 作成
- disclosure case 作成
- no auto-send case 作成
- advanced console opt-in case 作成

## 参照資料

- 依存Phase: Phase 1, Phase 2, Phase 3
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- task 設計レビュー: `phase-3-design-review.md`
- root pack: `../../phase-4-test-creation.md`

## 成果物

| 成果物                 | パス                                        | 説明                |
| ---------------------- | ------------------------------------------- | ------------------- |
| テストマトリクス       | `outputs/phase-4/test-matrix.md`            | ケース一覧          |
| threat model checklist | `outputs/phase-4/threat-model-checklist.md` | abuse / misuse 観点 |

## 完了条件

- [ ] approval と disclosure の両方に test case がある
- [ ] no auto-send の negative case がある
- [ ] advanced console opt-in の case がある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
