# Skill Feedback Report

## 対象

- `task-specification-creator`
- `aiworkflow-requirements`

## 良かった点

- canonical な Phase 12 出力名が明確で、`manual-test-result.md` を参照点にできた。
- `NON_VISUAL` タスクとして screenshot 不要を明示できた。
- `artifacts.json` と `outputs/artifacts.json` を同じ wave で揃える方針は、drift を減らせる。

## 改善提案

1. `task-specification-creator` は、phase doc の見出しに `current state` / `target state` を明示するテンプレートを入れると、古い語彙が混ざりにくい。
2. `aiworkflow-requirements` は、`index.md` / `artifacts.json` / 各 phase 本文メタの status を同時検査する軽量チェックを用意するとよい。
3. `task-specification-creator` は、`validate-phase-output.js` と `validate-phase12-implementation-guide.js` の CLI 形式差を吸収する wrapper か usage 表示を持つと誤実行が減る。
4. `manual-test-result.md` のテンプレートに `docs-only wave` / `実機未実施` / `シナリオ単位で一部実測済み` の選択肢があると、NON_VISUAL タスクでの誤記録を減らせる。

## 反映結果

- global ledger 系は 2026-04-17 wave で既に同期済みであり、この wave では再書き込み不要と確認した。
- そのため `skill-creator` への追加波及提案はなし。

## 結論

- 追加の改善はあるが、今回の Phase 12 文書群としては十分に整合している。
- current reference sync は task-local docs だけでなく、`.claude/skills` の正本にも波及させる運用が効果的だった。
