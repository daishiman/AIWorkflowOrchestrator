# command-suite.md — 検証コマンドスイート

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 4（テスト作成）

---

## SC-01: `levels.{N}` 構造確認

```bash
# levels 関連記述が存在するか確認
rg -n "levels\.\{N\}|levels\.N|LevelEntry|min_usage_count|min_success_rate|unlocked" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 静的オブジェクト表現の確認
rg -n "静的オブジェクト|static object" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

---

## SC-02: `average_satisfaction` 確認

```bash
# average_satisfaction の記述確認
rg -n -B 1 -A 5 "average_satisfaction" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

---

## SC-03: v2 対照テーブル更新確認

```bash
# levels 行の記述確認（「配列構造」が残っていないか）
rg -n "levels" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 3.3 / 3.4 セクション新設確認
rg -n "^### 3\." \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

---

## SC-04: dual root parity 確認

```bash
# 完全一致確認（差分ゼロが PASS）
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements

# 個別ファイル差分確認
diff \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
  .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

---

## SC-05: JSON parse 検証

```bash
# EVALS.json 変更なし確認
git diff HEAD -- .claude/skills/aiworkflow-requirements/EVALS.json

# parse 確認
node -e "
  const fs = require('fs');
  const paths = [
    '.claude/skills/aiworkflow-requirements/EVALS.json',
    '.agents/skills/aiworkflow-requirements/EVALS.json',
  ];
  paths.forEach(p => {
    try { JSON.parse(fs.readFileSync(p, 'utf-8')); console.log('PASS:', p); }
    catch (e) { console.error('FAIL:', p, e.message); }
  });
"
```
