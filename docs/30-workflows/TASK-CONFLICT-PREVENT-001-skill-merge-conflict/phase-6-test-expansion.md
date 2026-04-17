# Phase 6: テスト拡充 - TASK-CONFLICT-PREVENT-001

## ステータス: pending

## 追加テストケース

### TC-06: merge=union で重複行が発生した場合の確認

**目的**: `SKILL.md`に重複バージョン行が発生した場合の実際の影響を確認

**手順**:

```bash
# テスト用ブランチを作成して擬似的に重複を発生させる
git checkout -b test/skill-merge-union
echo "| **v99.99.99** | **2099-01-01** | テスト行 |" >> .claude/skills/skill-creator/SKILL.md
git add .claude/skills/skill-creator/SKILL.md
git commit -m "test: SKILL.md union test"
# → mainと比較してunioinマージを確認
git checkout main
git merge test/skill-merge-union --no-ff
# 期待値: SKILL.md にテスト行が追加されるがコンフリクトマーカーは不在
git branch -D test/skill-merge-union
```

---

### TC-07: generate-index.js の決定論性確認

**目的**: `generate-index.js`が同じ入力から同じ`keywords.json`を生成すること

**手順**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
cp .claude/skills/aiworkflow-requirements/indexes/keywords.json /tmp/keywords-1.json
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
diff /tmp/keywords-1.json .claude/skills/aiworkflow-requirements/indexes/keywords.json
# 期待値: 差分なし（または順序のみの差分）
```

---

### TC-08: .agents/ ミラー同期の確認

**目的**: post-mergeフック後に`.agents/`の`indexes/*.json`が`.claude/`と一致すること

**手順**:

```bash
sh .husky/post-merge
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
     .agents/skills/aiworkflow-requirements/indexes/keywords.json
# 期待値: 差分なし
```

---

## 回帰ガード

- `.gitattributes`を変更した場合は全TC-01〜TC-05を再実行する
- post-mergeフックを変更した場合はTC-03・TC-05を再実行する
