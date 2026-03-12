# スキル改善レポート

## aiworkflow-requirements への改善

- Task02 のように `shared contract は実装済み / transport は follow-up` という段差がある task では、`task-workflow.md` と `lessons-learned.md` の両方に partial completion の理由を書く必要がある。
- `resource-map.md` と `quick-reference.md` は code anchor の入口として十分機能したが、Phase 11 dedicated harness の path まで同一ターンで登録しないと UI 検証導線が弱くなる。
- `LOGS.md` / `SKILL.md` の change history は task の reopen と current branch 実装再監査を区別して書くべきで、今回その粒度を 1 段上げた。
- `verify-unassigned-links` の既定 source が `.agents/.../task-workflow.md` なので、canonical `.claude` 更新後に mirror sync を忘れると監査結果が遅延する。skill 本文で mirror 手順をより明示してよい。

## task-specification-creator への改善

- Phase 12 の必須成果物が揃っていても、acceptance partial と follow-up が残る場合は `artifacts.status=completed` にしないガードを追加すべきだった。
- `phase-11-12-guide.md` は screenshot / documentation の完了条件を強く持っていたが、「overall completion の判定」と「Phase 12 task completion」の分離が弱かったため、今回補強した。
- `patterns.md` に「Phase 1-12 完了だが residual follow-up が残る task」パターンを追加し、同種タスクで completed 誤判定を防ぐべきと判断した。
- `unassigned-task-guidelines.md` の実行例が `.agents` 側へ寄っていたため、`.claude` canonical root と mirror sync 条件を明記する改善を今回反映した。

## skill-creator への改善

- 今回の主対象ではないが、Phase 12 再監査を跨ぐ task では `phase12-task-spec-compliance-check.md` を outputs の root evidence として扱う設計が有効だった。
- current / baseline / follow-up 2軸報告をテンプレート群へ横展開する余地がある。
- active workflow の partial completion を扱う task では、system spec 側に `実装内容（要点）` / `苦戦箇所` / `5分解決カード` の3ブロックを同期するパターンを meta-skill 側にも持つべきで、今回それを反映した。

## 今回固定した再利用ルール

1. `.claude` を canonical root、`.agents` を mirror として扱う。
2. current workflow と completed archive が併存する場合、archive/current split の理由を workflow / task-workflow / lessons の3層で同時記録する。
3. Phase 1-12 が完了していても follow-up が残る場合、`artifacts.status=in_progress` と未タスク formalization を同時に残す。
4. UI task の再監査では dedicated harness screenshot と Apple UI/UX 視覚レビューを current workflow 配下へ再固定する。
5. validator の source root が `.agents` に寄るものは、`.claude -> .agents` 再同期と `diff -qr` 確認までを Phase 12 の一部として扱う。

## 結論

- 改善点はあり、`aiworkflow-requirements` と `task-specification-creator` の両方に再発防止ルールを追加する価値がある。
- 今回の Task02 は skill 改善を伴う再監査ケースとして再利用可能である。
