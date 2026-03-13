# Spec Update Step1 Completion

## Step 1-A: 完了記録

更新対象:

- workflow 本文の `phase-12-documentation.md`
- `task-workflow.md`
- `LOGS.md` x2
- `SKILL.md` history x2
- 必要なら `topic-map.md`

## Step 1-B: 実装状況テーブル

| 状態 | 使う条件 |
| --- | --- |
| `completed` | 実装と検証が終わっている |
| `spec_created` | Phase 1-3 完了で実装未着手 |

## Step 1-C: 関連タスク

- `関連タスク`
- `未タスク候補`
- `残課題`

上記の table を grep で横断確認する。

## Step 1-D: index 再生成

仕様書の見出しや行数が変わったら index を再生成する。

## Step 1-E: 未タスク登録

1件以上なら task spec を作る。0件でも detection report は出す。

## Step 1-F: 補助更新

必要に応じて lessons learned、cross-skill spec、workflow summary を同期する。

## Step 1-G: 検証

- `quick_validate.js`
- `validate_all.js`
- `verify-all-specs.js`
- `validate-phase-output.js`
- `diff -qr`

結果は `documentation-changelog.md` と `system-spec-update-summary.md` に転記する。
