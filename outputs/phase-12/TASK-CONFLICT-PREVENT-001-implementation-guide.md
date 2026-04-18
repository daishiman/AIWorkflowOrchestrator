# Phase 12 実装ガイド

## タスクID: TASK-CONFLICT-PREVENT-001

---

## Part 1: 中学生レベルの解説

### なぜコンフリクトが起きるのか？

Gitでは、複数の人が同じファイルを同時に変更すると「コンフリクト（衝突）」が起きます。
例えば、AさんとBさんが同じ文書の同じ行を別々に書き換えた場合、Gitはどちらの変更を正しいと判断できず、「衝突しています！どちらを使いますか？」と教えてくれます。

このプロジェクトでは `.claude/skills/` という「設定ファイルの入れ物」があります。このフォルダには自動生成される索引ファイルが含まれていて、異なるブランチで別々に自動生成されると、内容が少し違うため毎回コンフリクトが起きていました。

### merge（マージ）とは何か？

マージとは「2つのブランチの変更を1つにまとめる操作」です。
本の例えで言うと、先生がAさん版のノートとBさん版のノートを1冊にまとめるようなイメージです。

### ours（アワーズ）とは何か？

マージ時に「どちらの変更を使うか」を決めるルールの一つです。
`merge=ours` を指定すると「コンフリクトが起きたら、今いるブランチ（手元）の内容を使う」というルールになります。

自動生成ファイルは「どのブランチで生成しても内容が同じになる」ように設計したので、「手元の内容をそのまま使う」が正解になります。これでコンフリクトを自動的に回避できます。

---

## Part 2: 技術詳細

### 1. `.gitattributes` の merge policy 設計（4カテゴリ分類）

コンフリクトを防ぐため、ファイルを4つのカテゴリに分類してそれぞれ異なる merge 戦略を適用しました。

| カテゴリ        | 対象ファイル                                                             | 戦略          | 理由                                                                   |
| --------------- | ------------------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------- |
| Generated index | `keywords.json`, `topic-map.md`, `resource-map.md`, `quick-reference.md` | `merge=ours`  | 自動生成ファイル。deterministic 化により内容は同一のため手元を優先     |
| Mirror tree     | `.agents/skills/**`                                                      | `merge=ours`  | canonical は `.claude/skills/` であり mirror は常に canonical から生成 |
| EVALS           | `EVALS.json`                                                             | `merge=ours`  | スキーマ変更は単一責務。同時変更は想定しない                           |
| LOGS            | `LOGS.md`                                                                | `merge=union` | append-only ログ。両ブランチの追記内容を結合する                       |

`merge=union` は git の組み込みマージドライバーで、両側で追記された行を重複なく結合します。
`merge=ours` には custom merge driver の登録が必要です（次項参照）。

### 2. custom merge driver (`merge.ours.driver = true`) の仕組みとbootstrap

`.gitattributes` に `merge=ours` を指定するだけでは動作しません。
git のローカルリポジトリ設定（`.git/config`）に以下のエントリが必要です。

```ini
[merge "ours"]
  driver = true
```

`driver = true` は「競合があれば問答無用で現在のブランチ（ours）を使い、常に成功を返す」特殊な値です。

このエントリを自動設定するために `setup-merge-drivers.sh` を作成しました。

```bash
# .claude/scripts/setup-merge-drivers.sh
git config merge.ours.driver true
```

スクリプトは以下のタイミングで実行されます：

- `session-init.sh` で driver 未設定を検知 → ユーザーに警告
- 開発者が手動で `bash .claude/scripts/setup-merge-drivers.sh` を実行

### 3. deterministic generate の設計（日付除去、行番号索引維持）

以前の `generate-index.js` は索引ファイルに生成日時（`Generated: 2026-04-17T12:34:56.789Z` 等）を出力していました。
異なるブランチで異なる日時に生成した場合、内容が一致しないためコンフリクトが発生します。

対策として、`generate-index.js` から日付ヘッダー生成処理を除去しました。

- 除去対象: ファイル先頭のタイムスタンプコメント・ヘッダー行
- 維持対象: 行番号付き索引（行番号は内容から決定論的に決まるため安全）

これにより、同一コンテンツからは常に同一の索引ファイルが生成されます。

### 4. session-init の warning flow

`session-init.sh` に以下のチェックを追加しました。

```bash
# merge driver 設定チェック
OURS_DRIVER=$(git config merge.ours.driver 2>/dev/null)
if [ "$OURS_DRIVER" != "true" ]; then
  echo "⚠️  [session-init] merge.ours.driver が未設定です。"
  echo "    bash .claude/scripts/setup-merge-drivers.sh を実行してください。"
fi
```

フロー:

1. セッション開始時に `session-init.sh` が実行される
2. `git config merge.ours.driver` の値を確認
3. `true` でなければ警告メッセージを出力
4. 開発者が `setup-merge-drivers.sh` を実行してドライバーを設定

### 5. post-merge-index-regenerate.sh の役割

`merge=ours` で自動解決された場合でも、マージ後に索引を再生成して最新状態にします。

```bash
# .claude/hooks/post-merge-index-regenerate.sh
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

このフックにより、マージ直後に必ず最新の索引が生成されます。

### 6. 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

本タスクは NON_VISUAL / docs-only タスクです。全変更はシェルスクリプト・設定ファイル・ドキュメントに限定されており、ブラウザや Electron UI への変更はありません。

---

## 変更ファイル一覧

| ファイル                                                           | 変更種別                            |
| ------------------------------------------------------------------ | ----------------------------------- |
| `.gitattributes`                                                   | 変更（4カテゴリ merge policy 追加） |
| `.claude/scripts/setup-merge-drivers.sh`                           | 新規作成                            |
| `.claude/hooks/session-init.sh`                                    | 変更（driver 未設定 warning 追加）  |
| `.claude/hooks/post-merge-index-regenerate.sh`                     | 変更（再生成 hook 追加）            |
| `.agents/skills/aiworkflow-requirements/scripts/generate-index.js` | 変更（deterministic 化）            |
| `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` | 変更（deterministic 化）            |
