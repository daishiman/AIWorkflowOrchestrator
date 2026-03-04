# Phase 1 受け入れ基準（Given/When/Then）

更新日: 2026-03-04

1. Given 欠損 `description` を含むスキル一覧
   When `healthy` で検索する
   Then 例外が発生せず、一致スキルのみ表示される。

2. Given `agents/references/indexes` が `undefined/null` のスキル
   When SkillCard が描画される
   Then ファイル数計算でクラッシュしない。

3. Given サブリソースが欠損したスキル
   When 詳細パネルを開く
   Then DetailPanel が描画継続し、操作不能にならない。

4. Given 欠損メタデータ混在データ
   When Featured を算出する
   Then popularity 計算で例外が出ない。

5. Given 仕様・成果物更新後
   When `verify-all-specs` と `validate-phase-output` を実行する
   Then error=0, warning=0 を維持する。

6. Given UI/UX 変更を含むタスク
   When Phase 11 を実施する
   Then TC-01〜TC-04 のスクリーンショットが存在し、`validate-phase11-screenshot-coverage` が PASS となる。
