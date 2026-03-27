# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 8                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

verify を高価な第2実行レーンへ肥大化させず、gate と提案生成の責務を分離した実装へ整える。

## 実行タスク

- gate と suggestion generation の責務を分離する
- detail panel と create entry の責務を分離する
- DTO と UI state の重複を減らす

## 参照資料

| 資料名                 | パス                        | 説明                  |
| ---------------------- | --------------------------- | --------------------- |
| Phase 1 requirements   | `phase-1-requirements.md`   | 初回 scope の上限     |
| Phase 2 設計           | `phase-2-design.md`         | 分離基準              |
| Phase 5 実装           | `phase-5-implementation.md` | 実装対象              |
| Phase 6 test expansion | `phase-6-test-expansion.md` | edge case の負債      |
| Phase 7 coverage       | `phase-7-coverage-check.md` | coverage で見えた重複 |

## 実行手順

### ステップ1: verify の責務を縮める

- gate 判定
- provenance 表示
- nextAction 決定

### ステップ2: improve の責務を縮める

- suggestion 生成
- selection
- apply result 表示

## 統合テスト連携

- Phase 6 と Phase 7 で検出した重複ケースを減らしても test matrix の ID が維持されることを確認する
- Phase 9 QA で refactoring 後の契約 drift を確認する

## 成果物

| 成果物               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| リファクタリング仕様 | `phase-8-refactoring.md`                 | 役割分離の方針 |
| refactoring summary  | `outputs/phase-8/refactoring-summary.md` | 重複削減の要約 |

## 完了条件

- [ ] gate と suggestion generation が分離されている
- [ ] Task05 の主導線責務と重なっていない
- [ ] **本Phase内の全タスクを100%実行完了**
