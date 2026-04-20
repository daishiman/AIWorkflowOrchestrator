# Phase 11 Manual Test Checklist（第三者再実行用 1 枚サマリー）

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 11 で第三者が追試するための 1 枚チェックリスト。
> 判定の一次ソースは `manual-test-result.md`。

---

## 0. 前提条件

- [ ] ワークツリーが `task-20260419-160952-wt-9` と同等（または main の Phase 4 スナップショット時点）
- [ ] `git status --short` が clean（本タスクの未追跡成果物を除く）
- [ ] `ripgrep 13.0.0` 以上 / `diff`（POSIX）/ `shasum -a 256` / `find`（POSIX）/ `node v20+` が使える
- [ ] 作業ディレクトリ = リポジトリ ルート

---

## 1. RC-1: EVALS.json 全列挙（期待 13 件）

```bash
find .claude .agents apps -type f -name 'EVALS.json' \
  -not -path '*/node_modules/*' -not -path '*/.backups/*' | sort
```

- [ ] 出力が 13 行
- [ ] `.claude/skills/*` から 6 件
- [ ] `.agents/skills/*` から 6 件
- [ ] `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` が 1 件
- [ ] Phase 4 `raw-find-evals.txt`（メタ行除外）と `diff` 空

---

## 2. RC-2a/2b/2c: consumer grep（期待 代表値 claude=42 / agents=42 / apps=14）

```bash
# 2a: .claude
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' .claude/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' > /tmp/p11-claude.txt

# 2b: .agents
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' .agents/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' > /tmp/p11-agents.txt

# 2c: apps
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' > /tmp/p11-apps.txt
```

- [ ] claude: `sort -u` 後 42 行
- [ ] agents: `sort -u` 後 42 行
- [ ] apps: `sort -u` 後 14 行
- [ ] Phase 4 `raw-grep-*.txt`（メタ除外後）と `comm -23` / `comm -13` の両方で 0 行

---

## 3. RC-3: 動的パス検索（期待 33 行 / 13 unique consumer）

```bash
rg -n "join\([^)]*EVALS|\`[^\`]*EVALS\.json|'EVALS\.json'|\"EVALS\.json\"" \
  .claude/skills/ .agents/skills/ apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' > /tmp/p11-dynamic.txt
```

- [ ] `sort -u` 後 33 行
- [ ] `awk -F: '{print $1}' | sort -u` で 13 unique パス
- [ ] Phase 4 `raw-grep-dynamic.txt` と `comm` で 0 行差分

---

## 4. RC-4: dual root diff（期待 6 スキル完全一致）

```bash
for s in aiworkflow-requirements github-issue-manager int-test-skill skill-creator skill-fixture-runner task-specification-creator; do
  cmp -s ".claude/skills/$s/EVALS.json" ".agents/skills/$s/EVALS.json" \
    && echo "$s: IDENTICAL" \
    || echo "$s: DIFFERS"
done
```

- [ ] 全 6 スキルで `IDENTICAL` が出力される
- [ ] `shasum -a 256` が `.claude` / `.agents` で一致
- [ ] 期待ハッシュ:
  - [ ] aiworkflow-requirements: `4579e61e2268d0d04313f03be419f5fd06749a16e1bac816ea9fec57461e90d3`
  - [ ] github-issue-manager: `1fa508d9c4fbc28125e8e4af8760832d14baafacde1f641712931ca14dfdba43`
  - [ ] int-test-skill: `65bf0a254f2bc350d713ee73f3e21c28c092c6a6d7cb1a27af01de9345c9aa14`
  - [ ] skill-creator: `5576171341c5263038d7d90607d811b51558e2008050183945f6d95e80eaffb8`
  - [ ] skill-fixture-runner: `a8312b3284f82bde8b883be7fbe9ebc6f945a54e7f5877fd7d2b52e88a0981b6`
  - [ ] task-specification-creator: `43f9d6a94b65929041ec2c499f09820e1056af4477cea1636e99a6b42d26531b`

---

## 5. RC-5: 漏れ再検索（期待 unlisted = 0）

```bash
# Step 1: RC-2/3 結果からユニーク consumer パスを抽出
cat /tmp/p11-claude.txt /tmp/p11-agents.txt /tmp/p11-apps.txt /tmp/p11-dynamic.txt \
  | awk -F: '{print $1}' | sort -u > /tmp/p11-paths.txt

# Step 2: Phase 7 recheck-paths.txt との diff（完全一致を期待）
diff /tmp/p11-paths.txt \
  docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-paths.txt

# Step 3: consumer-audit-report.md 記載集合との差分（未記載 = 0 を期待）
comm -23 /tmp/p11-paths.txt \
  docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-paths.txt
```

- [ ] 13 ユニークパス
- [ ] Phase 7 `recheck-paths.txt` と完全一致
- [ ] `comm -23` の出力が 0 行

---

## 6. 判定サマリ（5 RC）

| RC-ID | 内容              | PASS | FAIL |
| ----- | ----------------- | ---- | ---- |
| RC-1  | find EVALS.json   | ☐    | ☐    |
| RC-2  | 3 root grep       | ☐    | ☐    |
| RC-3  | 動的パス検索      | ☐    | ☐    |
| RC-4  | dual root diff    | ☐    | ☐    |
| RC-5  | 漏れ再検索 (QG-6) | ☐    | ☐    |

- [ ] 5 件すべて PASS → QG-10 PASS
- [ ] FAIL あり → `manual-test-result.md` §8.4 の戻し先 Phase に従う

---

## 7. 完了条件（Phase 11 Spec §5）

- [ ] `outputs/phase-11/manual-test-result.md` を確認した
- [ ] `UI/UX 変更なしのため Phase 11 スクリーンショット不要` が明記されていることを確認した
- [ ] RC-1〜RC-5 の結果が集約されていることを確認した
- [ ] `reproduction-verification.md` / `manual-test-checklist.md`（本ファイル）/ `discovered-issues.md` が補助成果物として整合していることを確認した
- [ ] `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/logs/` に RC ごとのログが保存されていることを確認した
- [ ] screenshots ディレクトリを必須成果物として要求していないことを確認した

---

## 8. 参照

- 一次証跡: `outputs/phase-11/manual-test-result.md`
- 詳細差分: `outputs/phase-11/reproduction-verification.md`
- 発見事項: `outputs/phase-11/discovered-issues.md`
- ログ本体: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/logs/rc-*.log`
