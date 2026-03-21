# Workflow Generation Patterns

## 目的

workflow 仕様書の設計と phase 境界を安定化させるパターンをまとめる。

## パターン1: Phase 1-3 gate 先行固定

| 項目 | 内容 |
| --- | --- |
| 課題 | inventory が固まる前に Phase 4 以降を書き込むと downstream が揺れる |
| 適用 | `spec_created` task、複数 concern を含む refactor task |
| 解決 | Phase 1〜3 で scope、topology、review gate を固め、Phase 4+ は planned のまま残す |
| 成果物 | `requirements-definition.md`、`responsibility-split-plan.md`、`design-review-result.md` |

## パターン2: 3 lane 上限の SubAgent 編成

| lane | 役割 |
| --- | --- |
| A | entrypoint / logs / top-level contract |
| B | reference family split |
| C | workflow guide / documentation family |
| V | validation と mirror parity |

4 本以上に増やす前に、shared dependency が本当に切れているか確認する。

## パターン3: outputs と registry の 1:1 対応

1. `outputs/phase-N/` に実体を作る。
2. `artifacts.json` と `outputs/artifacts.json` の両方へ登録する。
3. `phase-N-*.md` の `成果物` と `完了条件` を更新する。
4. `index.md` の phase status を同期する。

補足:
- まだ全 Phase が `pending` / `not_started` の skeleton workflow では、`outputs/artifacts.json` と Phase 11 補助成果物を先行生成しない。
- いずれかの Phase が開始された時点で、root / outputs 台帳同期と Phase 11/12 実体化を必須ゲートへ切り替える。

## パターン4: family file への責務分離

| 元ファイル | 分離先 |
| --- | --- |
| `SKILL.md` | entrypoint + family index |
| `patterns.md` | workflow / validation / Phase 12 |
| `phase-templates.md` | core / execution / phase11 / phase12 / phase13 |
| `spec-update-workflow.md` | step1 / step2 / validation |
| `phase-11-12-guide.md` | phase11 / phase12 |
| `LOGS.md` | rolling log + archive |

## パターン5: direct link first

- child file を作ったら同じ turn で `SKILL.md` から直リンクを張る。
- parent index から child へ 1 hop で辿れるようにする。
- archive は parent file から必ず戻り導線を作る。

## パターン6: review gate の戻り先固定

| 問題 | 戻り先 |
| --- | --- |
| scope mismatch | Phase 1 |
| topology mismatch | Phase 2 |
| validation path 不足 | Phase 2 |
| blocker 残存 | Phase 5 / 8 / 9 |

## 再利用チェックリスト

- [ ] Phase 1〜3 の outputs が揃っている
- [ ] lane 数が 3 以下である
- [ ] family file 追加時に parent link を増やした
- [ ] outputs と registry が一致する
- [ ] Phase 13 は user approval なしで進めていない
