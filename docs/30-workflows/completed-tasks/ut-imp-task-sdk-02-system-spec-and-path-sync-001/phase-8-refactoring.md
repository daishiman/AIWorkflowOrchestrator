# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 8                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

same-wave remediation を読みやすく保つため、命名、path 記法、成果物表記の重複を整理する。

## 実行タスク

- path 記法を正規化する
- current / legacy / incomplete の語彙を統一する
- artifact inventory の重複記述を削る

## 参照資料

| 資料名           | パス                                              | 説明           |
| ---------------- | ------------------------------------------------- | -------------- |
| Phase 1 成果物   | `outputs/phase-1/spec-extraction-map.md`          | drift 元の整理 |
| Phase 2 成果物   | `outputs/phase-2/canonical-sync-target-matrix.md` | 正規化順       |
| Phase 5 実装     | `phase-5-implementation.md`                       | 編集対象       |
| Phase 5 成果物   | `outputs/phase-5/implementation-sequencing.md`    | 実更新順       |
| Phase 6 成果物   | `outputs/phase-6/test-expansion-summary.md`       | guard 表現     |
| Phase 7 coverage | `phase-7-coverage-check.md`                       | 保持すべき証跡 |
| Phase 7 成果物   | `outputs/phase-7/coverage-summary.md`             | 維持対象       |

## 実行手順

### ステップ1: path を統一する

- 現行 path は root relative で統一する。

### ステップ2: 語彙を統一する

- `current fact`
- `same-wave`
- `path drift`
- `未完了表現`

## 統合テスト連携

- Phase 8 では path 記法、語彙、artifact inventory 表記の揺れを整え、既存の grep / validator が安定して再利用できる形に寄せる。
- 語彙統一は Phase 12 の close-out 文書にも波及するため、未完了表現の再混入を防ぐ。

## 成果物

| 成果物              | パス                                     | 説明       |
| ------------------- | ---------------------------------------- | ---------- |
| リファクタリング    | `phase-8-refactoring.md`                 | 正規化方針 |
| refactoring summary | `outputs/phase-8/refactoring-summary.md` | 整理項目   |

## 完了条件

- [ ] path 記法が統一されている
- [ ] 語彙が統一されている
- [ ] coverage で必要な証跡が失われていない
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. path / 語彙 / inventory 表記の正規化
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] refactor 後も validator 手順が変わっていない
