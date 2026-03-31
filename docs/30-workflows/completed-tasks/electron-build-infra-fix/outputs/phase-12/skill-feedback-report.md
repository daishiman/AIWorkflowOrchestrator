# Skill Feedback Report

## 改善点

### 1. Phase 12 compliance に root 台帳チェックを標準化する

- **問題**: `outputs/artifacts.json` だけ completed で、root `artifacts.json` が pending のままでも false green になりうる
- **改善案**: compliance check の必須項目に「root `artifacts.json` と `outputs/artifacts.json` の Phase status / artifacts 一致」を追加する

### 2. ネイティブモジュール系 workflow は bootstrap owner を最初に固定する

- **問題**: `desktop postinstall` と `root postinstall` の責務が曖昧だと、二重実行・CWD 依存・誤った復旧手順が起きやすい
- **改善案**: Phase 1 / 2 のテンプレートに「install bootstrap owner」「manual recovery command」「workspace path owner」を明示する欄を追加する

### 3. Phase 11 テンプレートに N/A 条件を持たせる

- **問題**: UI 変更のない infra task でも、画面スクリーンショット欄が空欄のまま completed 扱いになりやすい
- **改善案**: 「UI contract 変更なしなら screenshot / UI scenario を N/A と明示して閉じる」ルールをテンプレート化する

### 4. same-wave sync 対象に canonical / mirror の両方を明示する

- **問題**: `.claude` 正本だけ更新して `.agents` mirror が後回しになりやすい
- **改善案**: Phase 12 成果物定義に `canonical + mirror parity` を明記し、完了条件へ入れる

## ワークフロー評価

- **有効だった点**: 問題A / 問題B のレーン分割、Phase 3 での MR-01〜03 の先出し、Phase 11 実測値の回収
- **不足していた点**: close-out 側の検証が outputs 偏重で、root / same-wave sync まで見ていなかった

## 次回への反映方針

1. compliance check に root 台帳整合を追加する
2. build infra task の Phase 1 に bootstrap owner 欄を追加する
3. Phase 11 に `PASS / N/A / FAIL` のスコープ判定表を追加する
4. Phase 12 に canonical / mirror parity の必須確認を追加する
