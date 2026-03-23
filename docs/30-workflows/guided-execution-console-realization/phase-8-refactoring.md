# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 8                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 1、Phase 2、Phase 5、Phase 6、Phase 7 の成果を見直し、親パックの構造と命名を簡素化する。

## 実行タスク

- 構造簡素化: root 配下の責務分離が過不足なく保たれているか確認する
- 命名正規化: `terminal` と `実行コンソール` の使い分けを文書単位で整理する
- 重複排除: root と child task に同じ説明が二重に書かれていないか確認する

## 参照資料

| 資料名     | パス                        | 説明                |
| ---------- | --------------------------- | ------------------- |
| Phase 1    | `phase-1-requirements.md`   | root 用語と受入基準 |
| Phase 2    | `phase-2-design.md`         | 責務分離            |
| Phase 5    | `phase-5-implementation.md` | 着手順              |
| Phase 6    | `phase-6-test-expansion.md` | edge case           |
| Phase 7    | `phase-7-coverage-check.md` | coverage と gap     |
| UI/UX 正本 | `ui-ux-realization.md`      | 表示語彙の正本      |

## 実行手順

### ステップ1: root と child の説明重複を探す

Task01-03 に移すべき説明が root に残っていないか確認する。

### ステップ2: 用語を正規化する

front 名称は `実行コンソール`、詳細レイヤーは `高度な表示`、生の shell 文脈だけ `terminal` と表記する。

### ステップ3: 構造を最小化する

親ディレクトリ 1 つと 3 task で足りる構造を崩さず、不要な lane 追加を禁止する。

## 統合テスト連携

構造の簡素化後も Phase 7 で張った coverage matrix が維持されることを確認対象とする。

## 成果物

| 成果物                   | パス                                          | 説明                |
| ------------------------ | --------------------------------------------- | ------------------- |
| structure simplification | `outputs/phase-8/structure-simplification.md` | root 構造の整理結果 |
| naming normalization     | `outputs/phase-8/naming-normalization.md`     | 用語の正規化結果    |

## 完了条件

- [ ] 親ディレクトリ1つと task 3つの構造が維持されている
- [ ] `実行コンソール`、`高度な表示`、`terminal` の使い分けが明記されている
- [ ] root と child の説明重複が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 9（品質保証）](./phase-9-quality-assurance.md)
