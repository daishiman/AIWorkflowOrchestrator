# Skill Feedback Report

- 良かった点:
  - Phase 骨格と artifacts parity の検証は有効
  - NON_VISUAL の screenshot 不要方針が workflow で明示されていた
- ワークフロー改善点:
  - `verify_existing` でも review で実害バグが見つかる場合があるので、「コメント整流のみ」と早期に固定しすぎない guard が欲しい
  - Phase 12 の implementation guide validator を workflow 実行手順にもっと前面表示した方がよい
- 技術的教訓:
  - restore UI と submission 生成元は、表示契約と送信契約を必ず同じ source にそろえるべき
  - restore state の clear は submit 成功時ではなく、新しい snapshot 到着時に寄せた方が競合が少ない
- スキル改善提案:
  - `task-specification-creator` の Phase 5/12 テンプレートに「review 発見バグは verify_existing でも実装修正へ切替可」を明記したい
- 新規Pitfall候補:
  - undo 復元 UI の見た目だけをテストし、submission payload を固定しないと requestId drift を見逃す
