# Phase 6: 失敗モードカタログ

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 6 — エッジケース拡張
**作成日**: 2026-04-18

---

## 概要

本タスクの実装が「正しく動作しない状態」に陥るパターンを網羅する。
各失敗モードについて「症状」「根本原因」「検出方法」「回復手順」を記載する。

---

## FM-01: `merge.ours.driver` 未登録によるマージコンフリクト

**症状**:

```
CONFLICT (content): Merge conflict in indexes/topic-map.md
Automatic merge failed; fix conflicts and then commit the result.
```

**根本原因**:

`git config merge.ours.driver true` がローカルまたはグローバル git config に登録されていない。
`.gitattributes` で `merge=ours` を指定しても、対応するドライバーが未定義だと
git はデフォルトの3方向マージにフォールバックし、コンフリクトが発生する。

**発生しやすいタイミング**:

- 新規 clone 直後
- CI 環境の初回セットアップ
- git config がリセットされた後

**検出方法**:

```bash
git config --get merge.ours.driver
# 未設定の場合: exit code 1、stdout 空
```

または `session-init.sh` 実行時の警告:

```
[WARN] merge.ours.driver が未設定です。
```

**回復手順**:

```bash
bash .claude/scripts/setup-merge-drivers.sh
# 確認
git config --get merge.ours.driver  # → "true"
```

コンフリクトが発生済みの場合:

```bash
git checkout HEAD -- indexes/topic-map.md  # current branch 側を復元
node scripts/generate-index.js             # regenerate
git add indexes/topic-map.md
git merge --continue
```

---

## FM-02: `generate-index.js` 実行忘れによる stale index

**症状**:

- `indexes/topic-map.md` の内容が `.claude/skills/` の最新状態を反映していない
- 新しいスキルが topic-map に表示されない
- `git diff indexes/topic-map.md` で差分が出続ける

**根本原因**:

スキルファイルを追加・変更した後に `generate-index.js` を実行していない。
または `post-merge` フックがインストールされておらず、merge 後の自動 regenerate が走っていない。

**検出方法**:

```bash
node scripts/generate-index.js
git diff indexes/topic-map.md
# 差分があれば stale
```

**回復手順**:

```bash
node scripts/generate-index.js
git add indexes/topic-map.md
git commit -m "chore: regenerate topic-map"
```

`post-merge` フックを設定して自動化:

```bash
cat > .git/hooks/post-merge << 'EOF'
#!/usr/bin/env bash
node scripts/generate-index.js
git add indexes/topic-map.md 2>/dev/null || true
EOF
chmod +x .git/hooks/post-merge
```

---

## FM-03: `post-merge` フック未インストールによる regenerate 未実行

**症状**:

- merge 完了後に `indexes/topic-map.md` が古い内容のまま
- FM-02 と同じ症状だが、自動化の欠如が根本原因

**根本原因**:

`.git/hooks/post-merge` が存在しない、または実行権限がない。
`git clone` ではフックはコピーされないため、各開発者が手動でインストールする必要がある。

**検出方法**:

```bash
ls -la .git/hooks/post-merge
# 存在しない場合: "No such file or directory"
# 実行権限がない場合: "-rw-r--r--" (x がない)
```

**回復手順**:

```bash
# フックをインストール (setup-merge-drivers.sh に組み込む or 別途 setup-hooks.sh を作成)
cat > .git/hooks/post-merge << 'EOF'
#!/usr/bin/env bash
node scripts/generate-index.js
git add indexes/topic-map.md 2>/dev/null || true
EOF
chmod +x .git/hooks/post-merge
echo "post-merge hook installed."
```

---

## FM-04: `.agents/skills/` mirror sync 漏れによるパリティ不一致

**症状**:

```
Only in .claude/skills: new-skill.md
```

または:

```
Files .claude/skills/existing.md and .agents/skills/existing.md differ
```

**根本原因**:

`.claude/skills/` を変更した後、`.agents/skills/` への mirror sync が実行されていない。

**検出方法**:

```bash
diff -qr .claude/skills .agents/skills
# 出力があれば parity 不一致
```

**回復手順**:

```bash
rsync -av --delete .claude/skills/ .agents/skills/
git add .agents/skills/
git commit -m "chore: sync agents/skills mirror"
```

---

## FM-05: `generate-index.js` の date ヘッダー行が再混入する

**症状**:

- `topic-map.md` の先頭付近に `自動生成: 2026-XX-XXTXX:XX:XX.XXXZ` のような行が現れる
- 実行のたびに `git diff` で差分が出る
- merge 後に `merge=ours` で旧日付行が残り、topic-map が stale になる

**根本原因**:

- `generate-index.js` のリファクタが部分的に revert された
- 別ブランチの古いバージョンが merge された
- 他のスクリプトが同様の date 出力を行っている

**検出方法**:

```bash
rg "自動生成:" indexes/topic-map.md
# ヒットすれば再混入
```

**回復手順**:

```bash
# generate-index.js の date ヘッダー行を再確認・削除
# 修正後:
node scripts/generate-index.js
rg "自動生成:" indexes/topic-map.md  # 0件になるはず
git add indexes/topic-map.md scripts/generate-index.js
git commit -m "fix: remove date header from generate-index.js"
```

---

## 失敗モードサマリー

| ID    | 失敗モード                               | 発生頻度      | 重大度 | 自動検出                 |
| ----- | ---------------------------------------- | ------------- | ------ | ------------------------ |
| FM-01 | driver 未登録でコンフリクト              | 高 (clone 時) | High   | session-init.sh 警告     |
| FM-02 | generate 忘れで stale index              | 中            | Medium | git diff で検出          |
| FM-03 | フック未インストールで regenerate 未実行 | 高 (clone 時) | Medium | ls .git/hooks/post-merge |
| FM-04 | mirror sync 漏れでパリティ不一致         | 低            | Medium | diff -qr                 |
| FM-05 | date ヘッダー再混入                      | 低            | Low    | rg "自動生成:"           |

---

## 関連ドキュメント

- `outputs/phase-6/expanded-test-matrix.md` — エッジケーステストマトリクス
- `outputs/phase-6/regression-checks.md` — リグレッションチェック手順
- `outputs/phase-5/implementation-log.md` — 実装ログ
