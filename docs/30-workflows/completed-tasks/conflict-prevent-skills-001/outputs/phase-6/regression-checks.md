# Phase 6 Output: 回帰確認

## RC-6-01: .claude 更新後の .agents parity

```bash
diff -qr .claude/skills .agents/skills
```

確認項目: `indexes/*.md` の変更が `.agents` 側に未反映でも、それは既知の follow-up 差分か確認する。

## RC-6-02: topic-map.md 以外の index を壊していないか

```bash
rg "\| L[0-9]+" .claude/skills/aiworkflow-requirements/indexes/topic-map.md | wc -l
# 変更前後で行数が大きく減っていないこと
```

## RC-6-03: keywords.json が valid JSON であること

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/aiworkflow-requirements/indexes/keywords.json','utf8'))"
echo "valid"
```

## RC-6-04: EVALS.json schema 不変

```bash
node -e "
const before = Object.keys(JSON.parse(require('fs').readFileSync(
  '.claude/skills/aiworkflow-requirements/EVALS.json','utf8')));
console.log('keys:', before.join(', '));
"
```

本 task 実施前後でキー一覧が変わらないことを確認。
