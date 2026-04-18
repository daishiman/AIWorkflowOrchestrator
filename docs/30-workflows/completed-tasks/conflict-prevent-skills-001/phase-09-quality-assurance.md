# Phase 9: 品質保証

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 9 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

validator、grep、merge simulation、parity check を束ねて、仕様と実装のズレを一括判定する。

## 実行タスク

1. workflow validator を実行する
2. custom driver / union / regenerate の command suite を実行する
3. `.claude` / `.agents` parity と hook warning を確認する
4. Phase 12 close-out で必要な同期対象を先行確認する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| verify script | `.agents/skills/task-specification-creator/scripts/verify-all-specs.js` | workflow 検証 |
| phase 12 guide | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | close-out 前提確認 |

## 実行手順

### ステップ1: command suite

```bash
node .agents/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/conflict-prevent-skills-001
rg -n "自動生成:" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
rg -n "\\| L[0-9]+" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
diff -qr .claude/skills .agents/skills
git config --get merge.keep-ours.driver
```

### ステップ2: 判定ルール

- validator NG: MAJOR
- regenerate 前提のズレや行番号索引欠落: MAJOR
- wording のみ: MINOR
- follow-up 化済み high-risk 領域: PASS

## 統合テスト連携

- Phase 10 final review の入力にする

## 多角的チェック観点（AIが判断）

- 批判的思考: command が実測に繋がっているか
- 因果ループ: Phase 12 sync しないと再び drift しないか
- 価値提案思考: 品質ゲートが運用コストを過度に増やしていないか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-19 | validator / command suite | Lane C |

## 成果物

- `outputs/phase-9/quality-report.md`
- `outputs/phase-9/command-log.md`
- `outputs/phase-9/mirror-parity-summary.md`

## 完了条件

- [ ] validator 結果を記録した
- [ ] command suite を記録した
- [ ] Phase 12 同期対象を確認した

## タスク100%実行確認【必須】

- [ ] validator を含めた
- [ ] parity / driver / regenerate を含めた
- [ ] Phase 10 入力へ接続した

## 次Phase

Phase 10 では acceptance criteria と blocker を最終判定する。
