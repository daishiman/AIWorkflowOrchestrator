# aiworkflow-requirements 監査結果

## 結論

初回作成時点でも主要仕様は拾えていたが、抽出入口と運用系仕様が不足していたため補強した。

- `quick-reference.md` と `resource-map.md` を抽出入口として明記
- `ui-ux-components.md`、`llm-streaming.md`、`error-handling.md`、`directory-structure.md`、`lessons-learned.md` を追加
- `.claude/skills/aiworkflow-requirements/...` を正本として workflow に反映

## 監査項目

| 観点                    | 監査結果 | 反映先                                                               |
| ----------------------- | -------- | -------------------------------------------------------------------- |
| 抽出入口の明示          | 補強済み | `aiworkflow-requirements-extraction-matrix.md`, `index.md`           |
| UI / layout 契約        | PASS     | `index.md`, `phase-1`, `phase-2`                                     |
| state ownership         | PASS     | `index.md`, `phase-1`, `phase-2`                                     |
| streaming 契約          | 補強済み | `aiworkflow-requirements-extraction-matrix.md`, `index.md`           |
| conversation 契約       | PASS     | `index.md`, `phase-1`, `phase-2`                                     |
| security / preload      | PASS     | `index.md`, `phase-1`, `phase-2`                                     |
| error handling          | 補強済み | `aiworkflow-requirements-extraction-matrix.md`, `phase-1`, `phase-2` |
| testing / accessibility | PASS     | `index.md`, `phase-1`, `phase-2`                                     |
| directory / lessons     | 補強済み | `aiworkflow-requirements-extraction-matrix.md`, `index.md`           |

## 補強内容

1. 04B に必要な検索入口を `quick-reference.md` / `resource-map.md` として先頭に追加した。
2. stream / error / directory / lessons の仕様を補い、抽出台帳を widen した。
3. `.claude` 正本 root を基準に workflow 全体の skill 参照を寄せた。
