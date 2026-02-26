# skill-feedback-report

## ワークフロー改善点

- `task-specification-creator` に「実差分ファイルの完全照合（git status -> 仕様書参照）」を標準ステップとして追加すると、反映漏れを早期検知できる。
- Phase 12のテンプレートに「削除・移管ファイルの記録欄」を追加すると、`D` 差分の見落としが減る。

## 技術的教訓

- 旧パス表記（`skillHandlers.ts`, `skill-api.ts`, `types/skill.ts`）が残ると、検証スクリプトはPASSでもトレーサビリティが崩れる。
- `verify-all-specs` PASSだけでは不十分で、`git diff` と突合する補助チェックが必要。

## スキル改善提案

- `task-specification-creator/scripts/verify-all-specs.js` に `--check-changed-files` オプションを追加する。
  - 入力: `git diff --name-status`
  - 出力: 仕様書内の未参照差分一覧
- `aiworkflow-requirements/scripts/search-spec.js` 結果をMarkdown表へ自動整形するオプションを追加する。

## 新規Pitfall候補

- 候補ID: `P46`
- 内容: 「仕様書のパス表記が旧実装名のまま残り、レビュー時に誤読が発生する」
- 暫定対策:
  - 旧/新パスの一括置換チェックをPhase 12必須化
  - `git status --porcelain` と仕様書参照の差分照合を必須化
