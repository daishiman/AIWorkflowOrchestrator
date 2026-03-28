# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 6                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

hash drift、route drift、lease conflict、cleanup、legacy session 共存の edge case を補う。

## 実行タスク

- drift edge case を追加する
- conflict edge case を追加する
- cleanup / limit edge case を追加する
- legacy coexistence edge case を追加する

## 参照資料

| 資料名               | パス                                                  | 説明                   |
| -------------------- | ----------------------------------------------------- | ---------------------- |
| Phase 4 test matrix  | `outputs/phase-4/test-matrix.md`                      | baseline suite         |
| Phase 5 実装         | `phase-5-implementation.md`                           | repository / evaluator |
| compatibility matrix | `outputs/phase-2/persistence-compatibility-matrix.md` | drift rule             |

## 実行手順

### ステップ1: drift case を足す

- `manifestCacheKey` mismatch
- `resourceDescriptorHash` mismatch
- `resolvedSkillCreatorRoot` relocate warning
- `routeSnapshot.type` mismatch

### ステップ2: conflict / cleanup case を足す

- active lease conflict
- expired lease recovery
- cleanup で古い generic session が削除されても workflow latest checkpoint が整合すること
- legacy session entry に workflow payload がない場合の graceful reject

## 統合テスト連携

- Phase 7 で drift / conflict / cleanup / coexistence の coverage を集計する。
- Phase 9 で warning と reject の実装差が silent fallback を生んでいないか再監査する。

## 成果物

| 成果物         | パス                        | 説明           |
| -------------- | --------------------------- | -------------- |
| test expansion | `phase-6-test-expansion.md` | edge case 方針 |

## 完了条件

- [ ] drift / conflict / cleanup / coexistence の edge case が列挙されている
- [ ] warning と reject の差が test case で分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
