# Skill Feedback Report

## 所見

- `validate-phase12-implementation-guide` は `## Part 1` / `## Part 2` の厳密な見出しを要求するため、近似表記は落ちる。
- `validate-phase-output` は `TASK-UI-03` の `UI` 文字列だけでも Phase 11 の画面証跡を要求しやすいので、NON_VISUAL タスクでも placeholder PNG の運用規約が必要になる。
- `validate-phase11-screenshot-coverage` は `TC-` 系 ID を期待するため、`MTC-` のような別名を使うとカバレッジ抽出で取りこぼす。

## 改善提案

- `task-specification-creator` の Phase 12 validator に `outputs/artifacts.json` の存在確認を初手で組み込む。
- workflow path drift を `rg -n` で検出し、`index.md` / `phase-13-pr-creation.md` / `outputs/phase-12/*.md` を同一 wave で更新するチェックを標準化する。
- `implementation-guide` のテンプレートに `Part 1` / `Part 2` の exact heading を固定し、validator 互換性を上げる。
- Phase 11 の checklist テンプレートには `TC-` 系 ID と placeholder PNG の対応表を固定し、NON_VISUAL タスクでも検証がぶれないようにする。

## 新規 pitfall 候補

- root 台帳はあるが `outputs/artifacts.json` が欠落している状態。
- `phase-12-documentation.md` は更新済みでも、`outputs/phase-12/*.md` が揃っていない状態。
- workflow rename 後に `docs/30-workflows/skill-creator-agent-sdk-lane/...` が残存する状態。
- Phase 11 で `MTC-` 系ラベルを使ってしまい、coverage validator が TC を抽出できない状態。
