# Phase 4 Status Drift Checkcases

## Case 1: index / artifacts status drift

- 症状: parent `index.md` が Phase 12=`blocked`、`artifacts.json` が Phase 12=`completed`
- 原因: `generate-index.js` が配列 phases を添字参照していた
- 判定: tooling fix + index 再生成が必要

## Case 2: implementation-guide validator fail

- 症状: Part 1 が理由先行でない、または `設定と定数` が欠落
- 判定: parent `outputs/phase-12/implementation-guide.md` を是正してから再検証

## Case 3: docs-only Phase 11 warning

- 症状: `validate-phase-output.js` が `screenshot-plan.json` / `screenshots/` 欠落を warning
- 判定: placeholder 補助成果物を追加し、manual result に用途を明記する

## Case 4: backlog / completed ledger drift

- 症状: follow-up task が backlog に残り、completed ledger に完了 entry がない
- 判定: same-wave で backlog 完了移管と completed entry 追加を実施する

## Case 5: resource / phase reference drift

- 症状: `resources[].phaseIds` が未定義 phase を指す、または `phases[].resourceIds` と噛み合わない
- 原因: `ManifestLoader` が `phaseIds` を型チェックするだけで参照整合を検証していない
- 判定: runtime hardening と unit test 追加が必要

## Case 6: cache false-hit on same mtime

- 症状: manifest 本文が変わっても `mtime` と resource hash が同じなら cache hit する余地がある
- 原因: cache 判定が manifest 全体の内容 hash を持っていない
- 判定: content hash を追加して再読込判定を補強する
