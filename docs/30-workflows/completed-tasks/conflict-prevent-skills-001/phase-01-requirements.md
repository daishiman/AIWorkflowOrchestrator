# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18                  |

## 目的

本 workflow が扱う競合源を `generated index`、`mirror tree`、`append-only log`、`volatile metadata` に分解し、`task-specification-creator` と `aiworkflow-requirements` の両方に反しない要件を固定する。

## 実行タスク

1. branch diff の対象が `docs/30-workflows/conflict-prevent-skills-001/` 一式であることを固定する
2. 現行仕様書群の validator エラーと論理矛盾を棚卸しする
3. `task-specification-creator` から phase 骨格、`aiworkflow-requirements` から canonical / mirror / regenerate policy を抽出する
4. generated / mirror / log / metadata の4分類ごとに acceptance criteria を定義する
5. 実 wave で扱う範囲と follow-up に落とす範囲を分ける

## 参照資料

| 資料名                | パス                                                                          | 用途                                        |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| task-spec skill       | `.agents/skills/task-specification-creator/SKILL.md`                          | phase 骨格、Phase 11/12/13 ルール           |
| aiworkflow skill      | `.agents/skills/aiworkflow-requirements/SKILL.md`                             | canonical root、regenerate 原則             |
| phase template core   | `.agents/skills/task-specification-creator/references/phase-template-core.md` | Phase 1-3 の必須骨格                        |
| git attributes manual | `git help attributes`                                                         | `union` built-in / custom driver 前提の確認 |
| 対象 root             | `docs/30-workflows/conflict-prevent-skills-001/`                              | 改善対象                                    |

## 実行手順

### ステップ0: P50チェック

```bash
git status --short
git diff --stat
node .agents/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/conflict-prevent-skills-001 --json
```

### ステップ1: 競合源の分類

- generated index: regenerate 可能で diff が大きいもの
- mirror tree: `.claude` の mirror としてのみ存在するもの
- append-only log: merge 順序差はあっても内容保持を優先できるもの
- volatile metadata: consumer 監査なしに削除・統一すると副作用が読めないもの

### ステップ2: 受入基準の固定

- AC-1: 13 phase 全てがテンプレート骨格を満たす
- AC-2: custom merge driver が必要な箇所と built-in で足りる箇所を混同しない
- AC-3: canonical `.claude` / mirror `.agents` の責務が一貫する
- AC-4: generated index に deterministic regenerate 導線がある
- AC-5: `topic-map.md` は行番号索引契約を維持する
- AC-6: EVALS はこの task で schema を変更しない

## 統合テスト連携

- Phase 4 で merge simulation、generator regression、mirror parity のテスト設計へ接続する
- Phase 9 で validator、grep、git-config 確認へ接続する

## 多角的チェック観点（AIが判断）

- 批判的思考: built-in / custom の誤認を排除できているか
- 要素分解: 4分類が MECE になっているか
- システム思考: Phase 5 の設定変更が Phase 9 / 12 へどう波及するか
- why思考: 本当に競合源か、単なる更新頻度の高さかを分けているか
- トレードオン思考: 即効性と副作用の大きさを切り分けているか

## サブタスク管理

| SubTask | 内容                         | 担当   |
| ------- | ---------------------------- | ------ |
| ST-1    | task-spec 骨格監査           | Lane A |
| ST-2    | aiworkflow requirements 抽出 | Lane B |
| ST-3    | acceptance criteria 再構成   | Lane C |

## 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/conflict-source-inventory.md`
- `outputs/phase-1/spec-extraction-map.md`

## 完了条件

- [ ] validator の骨格エラー原因が分類済み
- [ ] AC-1〜AC-6 が確定している
- [ ] 本 wave と follow-up の境界が明記されている

## タスク100%実行確認【必須】

- [ ] branch diff を確認した
- [ ] skill 2本を参照した
- [ ] 受入基準を本文へ反映した

## 次Phase

Phase 2 では、4分類に対する merge policy、generator policy、close-out policy を 3 レーン以下で設計する。
