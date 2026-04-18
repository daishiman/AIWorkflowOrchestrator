# Phase 4 Output: コマンドと期待値

## TC-4-01: merge simulation

```bash
# 一時 repo でテスト
git init /tmp/test-ours
cd /tmp/test-ours
git config merge.ours.driver true
echo "branch-a content" > topic-map.md
git add . && git commit -m "base"
git checkout -b branch-b
echo "branch-b content" > topic-map.md
git commit -am "branch-b"
git checkout main
echo "branch-a updated" > topic-map.md
echo "topic-map.md merge=ours" > .gitattributes
git commit -am "branch-a"
git merge branch-b
# 期待: topic-map.md の内容が branch-a 側（main）のまま
```

## TC-4-02: union merge

```bash
rg "自動生成:" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
# 期待: 0件（日付ヘッダー除去済み）
```

## TC-4-03: generator

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
rg "自動生成:" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
# 期待: 0件
rg "\| L[0-9]+" .claude/skills/aiworkflow-requirements/indexes/topic-map.md | wc -l
# 期待: 1以上（行番号索引が維持されている）
```

## TC-4-04: parity

```bash
diff -qr .claude/skills .agents/skills
# 期待: 差分が一覧表示される（full sync は follow-up）
```

## TC-4-05: driver 登録

```bash
git config --get merge.ours.driver
# 期待: setup-merge-drivers.sh 実行後に "true"
bash .claude/scripts/setup-merge-drivers.sh
git config --get merge.ours.driver
# 出力: true
```
