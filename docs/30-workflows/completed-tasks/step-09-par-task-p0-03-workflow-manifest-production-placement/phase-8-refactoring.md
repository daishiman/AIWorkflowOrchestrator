# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 8                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

manifest の resource descriptor を最適化し、保守性と可読性を向上させる。冗長な記述や一貫性のない命名を整理する。

## 実行タスク

- resource descriptor 最適化: 冗長な resource 記述を整理し、phase ごとの resource 割り当てを最適化する
- 命名規則統一: resource id、phase id、hook id の命名規則を統一する
- path 記法統一: resource path の相対パス記法を統一する

## 参照資料

| 資料名                 | パス                                                  | 説明              |
| ---------------------- | ----------------------------------------------------- | ----------------- |
| phase-2 design         | `phase-2-design.md`                                   | 設計方針          |
| phase-5 implementation | `phase-5-implementation.md`                           | 実装済み manifest |
| phase-7 coverage check | `phase-7-coverage-check.md`                           | カバレッジ確認    |
| workflow-manifest.json | `.claude/skills/skill-creator/workflow-manifest.json` | 最適化対象        |

## リファクタリング対象

### resource descriptor 最適化

| 観点           | 確認内容                                                  |
| -------------- | --------------------------------------------------------- |
| 冗長性         | 同一ファイルを複数 resource descriptor で参照していないか |
| phase 割り当て | resourceIds と phaseIds の対応関係が妥当か                |
| kind 一貫性    | 同じディレクトリ配下のファイルが同じ kind を使っているか  |

### 命名規則統一

| 対象        | 命名規則                     | 例                             |
| ----------- | ---------------------------- | ------------------------------ |
| phase id    | kebab-case                   | requirements-gathering         |
| resource id | kebab-case + kind prefix     | agent-xxx, ref-xxx, schema-xxx |
| hook id     | phase-id + entry/exit suffix | rg-entry, rg-exit              |

### path 記法統一

- 全 resource path を `./` 始まりの相対パスに統一する
- ディレクトリ区切りは `/` に統一する

## 実行手順

### ステップ1: resource descriptor を最適化する

冗長な記述を除去し、phase ごとの resource 割り当てを見直す。

### ステップ2: 命名規則を統一する

id の命名規則を一貫させ、読みやすさを向上させる。

### ステップ3: path 記法を統一する

全 resource path の記法を統一する。

## 統合テスト連携

| 観点          | 実施内容                                               |
| ------------- | ------------------------------------------------------ |
| 非破壊性      | リファクタリング後も ManifestLoader 検証を通過すること |
| 命名一貫性    | 全 id が統一された命名規則に従っていること             |
| path validity | リファクタリング後も全 resource path が実在すること    |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                          |
| -------- | -------------------------------------------------- |
| 可読性   | manifest を初見で読んでも構造が理解できるか        |
| 保守性   | ファイル追加時に manifest の変更箇所が最小限か     |
| 正本意識 | リファクタリングが manifest の意味を変えていないか |

## サブタスク管理

1. resource descriptor 最適化
2. 命名規則統一
3. path 記法統一
4. Phase 9 input 整理

## 成果物

| 成果物             | パス                                    | 説明                 |
| ------------------ | --------------------------------------- | -------------------- |
| refactoring plan   | `outputs/phase-8/refactoring-plan.md`   | 最適化計画           |
| naming convention  | `outputs/phase-8/naming-convention.md`  | 命名規則定義         |
| refactoring result | `outputs/phase-8/refactoring-result.md` | リファクタリング結果 |

## 完了条件

- [ ] resource descriptor の冗長性が解消されている
- [ ] 命名規則が統一されている
- [ ] path 記法が統一されている
- [ ] リファクタリング後も ManifestLoader 検証を通過する
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 2 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 7 を参照した
- [ ] リファクタリング後に ManifestLoader 検証を実行した

## 次のPhase

Phase 9: 品質保証
