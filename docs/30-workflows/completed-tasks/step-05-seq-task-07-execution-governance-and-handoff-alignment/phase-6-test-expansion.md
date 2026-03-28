# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 6                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

degraded policy、consumer token、expired approval、disclosure unavailable、visible handoff 再表示といった governance edge case を補う。

## 実行タスク

- policy edge case の異常系を追加する
- approval token lifecycle の異常系を追加する
- disclosure / visible handoff の UI regression を追加する

## 拡張対象

- consumer token 入力時の reject
- degraded + subscription valid / invalid の route 差分
- approval token の expired / already_used / mismatch
- disclosure handler unavailable 時の graceful degradation
- `SkillLifecyclePanel.tsx` の console-only handoff 再発防止

## 参照資料

| 資料名         | パス                             | 説明       |
| -------------- | -------------------------------- | ---------- |
| Phase 5 実装   | `phase-5-implementation.md`      | 実装対象   |
| Phase 4 テスト | `phase-4-test-creation.md`       | 基本観点   |
| test matrix    | `outputs/phase-4/test-matrix.md` | ケース一覧 |

## 成果物

| 成果物         | パス                        | 説明               |
| -------------- | --------------------------- | ------------------ |
| テスト拡充計画 | `phase-6-test-expansion.md` | edge case 追加方針 |

## 統合テスト連携

- Runtime policy と approval gate の unit / integration に edge case を追加する
- visible handoff と disclosure unavailable を renderer regression として固定する

## 完了条件

- [ ] governance edge case が列挙されている
- [ ] approval / disclosure / visible handoff の異常系が追加されている
- [ ] consumer auth 非流用の回帰観点が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
