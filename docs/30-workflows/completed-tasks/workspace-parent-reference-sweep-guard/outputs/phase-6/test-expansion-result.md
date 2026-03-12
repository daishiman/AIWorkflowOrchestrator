# テスト拡充結果

## 追加した検証

| 種別         | コマンド                                                                                    | 結果            | 目的                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------ |
| fixture test | `pnpm exec vitest run scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs` | PASS（4 tests） | normalized / stale path / pending status / mirror drift を分離検証       |
| repo guard   | `node scripts/validate-workspace-parent-reference-sweep.mjs --json`                         | PASS            | 実 repo に対して `path-drift=0 / status-drift=0 / mirror-drift=0` を確認 |
| mirror check | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`    | PASS（差分 0）  | mirror drift を repo 実体で再確認                                        |

## 拡充した観点

1. `status-drift` を docs wording 全般ではなく `pending` / `未着手` 残存に限定し、false positive を抑えた。
2. `REQUIRED_PATHS` を別に持たせ、参照文字列だけ存在してリンク先が欠けるケースを検出できるようにした。
3. `mirror-drift` は文字列比較ではなく `diff -qr` 実行結果で判定し、dual-root 実運用に近づけた。

## false positive / false negative 点検

| 観点             | 判定 | 内容                                                                                                                     |
| ---------------- | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| false positive   | 低   | status 判定は `pending` / `未着手` の残存に絞っており、`completed` と `completed（移管済み）` の差は fail にしない       |
| false negative   | 中   | manifest で列挙していない新規 Workspace parent 参照先は検知できない。追加対象が出たら `FILE_CHECKS` を拡張する必要がある |
| mirror stability | 低   | rsync 後の `diff -qr` が 0 件で安定。再生成直後の一時 drift は運用順で吸収可能                                           |

## 結論

Phase 4 で定義した red case は 4 方向すべて再現可能で、正常系 fixture と実 repo の両方で green を確認できた。validator は docs-only parent workflow の drift guard として十分な再現性を持つ。
