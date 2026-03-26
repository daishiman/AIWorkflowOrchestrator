# Phase 6 Regression Expansion Plan

## 追加した回帰観点

- `generate-index.js` が `phases` 配列でも Phase 12/13 status を正しく出力する
- docs-only Phase 11 で placeholder 補助成果物を置いたとき `validate-phase-output.js` warning が消える
- parent `implementation-guide.md` が validator 10/10 を維持する
- backlog 完了移管後に completed ledger と task path が競合しない
- `ManifestLoader` が `resource.phaseIds` の未定義 / 不一致参照を reject する
- manifest 本文だけが変わったケースでも cache false-hit を起こさない
