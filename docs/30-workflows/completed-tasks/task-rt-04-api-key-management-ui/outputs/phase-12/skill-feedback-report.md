# Skill Feedback Report

## ワークフロー改善点

- Phase 11 に実画面の PNG がある場合は、`NON_VISUAL` を残さず screenshot-backed current fact として記録した方が誤読が減る。
- Phase 12 の Step 2 は、`current facts` と `no-op` を分けて書くと誤読が減る。
- Phase 13 の local check は、`artifacts.json` parity と canonical/mirror parity を先に固定した方が安全。

## 技術的教訓

- root `artifacts.json` と `outputs/artifacts.json` は同一内容で持つ方が drift を抑えやすい。
- screenshot evidence を current fact として残すと、visual review と manual result の整合が取りやすい。

## スキル改善提案

- `phase-12-documentation-guide.md` に screenshot-backed current fact の記述例を追加すると、Step 2 の誤読を減らせる。
- `phase-template-phase13-detail.md` に parity チェックと screenshot evidence の引き継ぎを明示すると、承認前の差分確認が揃いやすい。
- `phase-11-manual-test.md` には current build capture と baseline reuse を別列で固定すると、再監査時の証跡 drift を抑えやすい。

## 新規Pitfall候補

- docs-only branch で Step 2 を一律必須扱いにすると、system spec の current fact が stale に見える。
- current build capture を採っているのに `NON_VISUAL` wording が残ると、Phase 11 / 12 の読み手が誤判定しやすい。
