# Phase 5: 実装

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| Phase     | 5                                               |
| タスクID  | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 前提Phase | Phase 4                                         |
| 後続Phase | Phase 6                                         |
| 作成日    | 2026-04-21                                      |

## 目的

正本 `.claude/skills` を更新し、その後 `.agents/skills` を mirror 同期する。実装の主責務は「writer → fixture → reader → desktop test」の順序を崩さないこと。

## 実行タスク

1. 先行タスク完了を確認する
2. writer 側を `snake_case` に統一する
3. fixture / reader / test を同方言へ揃える
4. `.agents` mirror を同期する
5. 変更対象と差分理由を記録する

## 参照資料

| 資料              | パス                                    |
| ----------------- | --------------------------------------- |
| Phase 2 design    | `outputs/phase-2/unification-design.md` |
| Phase 4 scenarios | `outputs/phase-4/test-scenarios.md`     |

## 実行手順

- Step 1: `.claude/skills` 側 writer を更新
- Step 2: fixture / reader を更新
- Step 3: 旧方言が意図せず残っていないか確認
- Step 4: `.agents/skills` へ同期
- Step 5: `apps/desktop` fixture / test の期待値を合わせる
- Step 6: 変更ファイル一覧と理由を `implementation-diff-check.md` に記録

## 統合テスト連携

| 判定項目    | 基準                       | 結果 |
| ----------- | -------------------------- | ---- |
| root 更新順 | `.claude` 先、`.agents` 後 | TBD  |
| 旧方言残存  | 対象箇所 0 件              | TBD  |

## 多角的チェック観点（AIが判断）

- 垂直思考: root を固定してから実装する
- 因果関係分析: writer 不整合が fixture / reader へ伝播しないか確認する

## サブタスク管理

1. writer 更新
2. fixture / reader 更新
3. mirror 同期

## 成果物

| 成果物           | パス                                           | 説明             |
| ---------------- | ---------------------------------------------- | ---------------- |
| 実装差分チェック | `outputs/phase-5/implementation-diff-check.md` | 変更箇所と理由   |
| 変更計画         | `outputs/phase-5/changed-file-plan.md`         | 対象ファイル一覧 |

## 完了条件

- [ ] `.claude` 正本を更新した
- [ ] `.agents` mirror を同期した
- [ ] 変更理由を記録した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物2件を定義
- [ ] 4条件を確認

## 次Phase

Phase 6: テスト拡充
