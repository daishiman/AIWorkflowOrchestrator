# Phase 11 Reproduction Verification Report

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 11 の **再現結果と 13 実行対象パス集合の 0 差分証明** を担当する補助成果物。
> 一次証跡は `manual-test-result.md`。本ファイルは RC ごとの詳細差分と集合検証証跡のみを集約する。

---

## メタ情報

| 項目           | 値                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------- |
| task_id        | TASK-EVALS-CONSUMER-AUDIT-001                                                             |
| phase          | 11                                                                                        |
| 生成日時 (UTC) | 2026-04-19                                                                                |
| 再実行 iter    | #3（Phase 4 初回 / Phase 7 第 2 回目 / Phase 11 第 3 回目）                               |
| 対象           | consumer-audit-report.md / evals-field-map.md / dual-root-parity.md / coverage-recheck.md |
| 判定結果       | **全 RC で差分 0（PASS）**                                                                |

---

## 1. 0 差分証明（Summary）

### 1.1 consumer パス集合の 3 時点一致

| 時点     | ファイル                          | consumer パス数 | SHA-256-like 比較                |
| -------- | --------------------------------- | --------------: | -------------------------------- |
| Phase 4  | `raw-grep-*.txt` 4 本             |              13 | raw データの一次スナップショット |
| Phase 7  | `recheck-paths.txt`               |              13 | Phase 4 と完全一致（Phase 7 §3） |
| Phase 11 | `logs/phase-11-recheck-paths.txt` |              13 | Phase 7 と `diff` 出力空         |

→ **3 時点で同一の 13 実行対象パス集合**。`comm -23 P11 P7 = 0`、`comm -13 P11 P7 = 0`。

### 1.2 consumer-audit-report.md §7 動的パス 13 件との対応

| #   | Phase 11 hit path                                                     | consumer-audit-report.md 該当セクション |
| --- | --------------------------------------------------------------------- | --------------------------------------- |
| 1   | `.claude/skills/task-specification-creator/scripts/log-usage.js`      | §4.1（B / read+write / camelCase）      |
| 2   | `.claude/skills/skill-creator/scripts/log_usage.js`                   | §4.2（B / read+write / snake_case）     |
| 3   | `.claude/skills/skill-creator/scripts/collect_feedback.js`            | §4.3（B / read）                        |
| 4   | `.claude/skills/skill-creator/scripts/init_skill.js`                  | §4.4（B / write）                       |
| 5   | `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`         | §4.5（B / read+write / snake_case）     |
| 6   | `.agents/skills/task-specification-creator/scripts/log-usage.js`      | §4.6                                    |
| 7   | `.agents/skills/skill-creator/scripts/log_usage.js`                   | §4.7                                    |
| 8   | `.agents/skills/skill-creator/scripts/collect_feedback.js`            | §4.8                                    |
| 9   | `.agents/skills/skill-creator/scripts/init_skill.js`                  | §4.9                                    |
| 10  | `.agents/skills/aiworkflow-requirements/scripts/log_usage.js`         | §4.10                                   |
| 11  | `apps/desktop/src/main/services/skill/SkillScanner.ts`                | §3.1（A / validate）                    |
| 12  | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | §5.1（C / validate）                    |
| 13  | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`   | §5.2（C / read+validate / snake_case）  |

→ **13 / 13 が consumer-audit-report.md §3〜§5 および §7 に記載**。漏れ 0 件。

---

## 2. RC 別詳細（Phase 4 raw / Phase 7 recheck / Phase 11 re-run の 3 点比較）

### 2.1 RC-1: find EVALS.json

| 観点                   | Phase 4                          | Phase 11                                  |
| ---------------------- | -------------------------------- | ----------------------------------------- |
| コマンド               | §1 raw-find-evals.txt の 1 行目  | 同一（`manual-test-result.md` §4.2 参照） |
| タイムスタンプ (UTC)   | 2026-04-19T08:50:45Z             | 2026-04-19T09:29:55Z                      |
| ヒット件数             | 13                               | 13                                        |
| 集合差分（`comm`）     | —                                | P4 \\ P11 = 0 / P11 \\ P4 = 0             |
| メタ行（`^#`）の揺らぎ | タイムスタンプ・exit_status のみ | タイムスタンプ・executor 注記のみ         |
| 判定                   | —                                | **IDENTICAL**                             |

### 2.2 RC-2a/2b/2c: rg on .claude / .agents / apps

| kind   | Phase 4 行数（正規化後） | Phase 11 行数（正規化後） | `comm -23`（P4 only） | `comm -13`（P11 only） | 判定          |
| ------ | -----------------------: | ------------------------: | --------------------: | ---------------------: | ------------- |
| claude |                       42 |                        42 |                     0 |                      0 | **IDENTICAL** |
| agents |                       42 |                        42 |                     0 |                      0 | **IDENTICAL** |
| apps   |                       14 |                        14 |                     0 |                      0 | **IDENTICAL** |

- 正規化: `grep -v '^#' | grep -v '^$' | sort -u`
- Phase 7 比較（`coverage-recheck.md` §2.1）との対称性: `recheck-grep-claude.txt` 45 行 / Phase 11 raw 47 行 / Phase 4 raw 46 行 のメタ行揺らぎを除けば **3 時点で全て同一集合**。

### 2.3 RC-3: 動的パス (rg join/template/quoted)

| 観点                     | Phase 4 (`raw-grep-dynamic.txt`) | Phase 11 (`rc-3-grep-dynamic.log`) |
| ------------------------ | -------------------------------: | ---------------------------------: |
| 実データ行数（正規化後） |                               33 |                                 33 |
| `comm -23`               |                                — |                                  0 |
| `comm -13`               |                                — |                                  0 |
| unique consumer paths    |                               13 |                                 13 |
| 判定                     |                                — |                      **IDENTICAL** |

### 2.4 RC-4: dual root diff (6 skills, SHA-256)

| skill                      | bytes (`.claude` == `.agents`) | SHA-256                                                            | Phase 6 記載 SHA-256                                               | 判定                                  |
| -------------------------- | -----------------------------: | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------- |
| aiworkflow-requirements    |                           1162 | `4579e61e2268d0d04313f03be419f5fd06749a16e1bac816ea9fec57461e90d3` | `4579e61e2268d0d04313f03be419f5fd06749a16e1bac816ea9fec57461e90d3` | **IDENTICAL（Phase 6 ハッシュ一致）** |
| github-issue-manager       |                            409 | `1fa508d9c4fbc28125e8e4af8760832d14baafacde1f641712931ca14dfdba43` | `1fa508d9c4fbc28125e8e4af8760832d14baafacde1f641712931ca14dfdba43` | **IDENTICAL（Phase 6 ハッシュ一致）** |
| int-test-skill             |                            403 | `65bf0a254f2bc350d713ee73f3e21c28c092c6a6d7cb1a27af01de9345c9aa14` | `65bf0a254f2bc350d713ee73f3e21c28c092c6a6d7cb1a27af01de9345c9aa14` | **IDENTICAL（Phase 6 ハッシュ一致）** |
| skill-creator              |                            809 | `5576171341c5263038d7d90607d811b51558e2008050183945f6d95e80eaffb8` | `5576171341c5263038d7d90607d811b51558e2008050183945f6d95e80eaffb8` | **IDENTICAL（Phase 6 ハッシュ一致）** |
| skill-fixture-runner       |                            160 | `a8312b3284f82bde8b883be7fbe9ebc6f945a54e7f5877fd7d2b52e88a0981b6` | `a8312b3284f82bde8b883be7fbe9ebc6f945a54e7f5877fd7d2b52e88a0981b6` | **IDENTICAL（Phase 6 ハッシュ一致）** |
| task-specification-creator |                           4764 | `43f9d6a94b65929041ec2c499f09820e1056af4477cea1636e99a6b42d26531b` | `43f9d6a94b65929041ec2c499f09820e1056af4477cea1636e99a6b42d26531b` | **IDENTICAL（Phase 6 ハッシュ一致）** |

- `claude-agent-sdk` スキルは両 root 共に EVALS.json 非所持（スコープ外）。Phase 6 `skills-union.txt` の 6 スキルと完全に一致する対象集合で比較。

### 2.5 RC-5: 漏れ再検索（QG-6 再現）

| 観点                                             | 結果                      |
| ------------------------------------------------ | ------------------------- |
| Phase 11 recheck paths 件数                      | 13                        |
| Phase 7 `recheck-paths.txt` との `diff`          | 完全一致（`diff` 出力空） |
| consumer-audit-report.md 記載集合との `comm -23` | **0 行**（unlisted = 0）  |
| QG-6（未記載ヒット 0 件）                        | **再現 PASS**             |

---

## 3. Phase 10 AC-6 解除判定の再現性

Phase 10 `ac6-release-verdict.md` §0 の「AC-6 解除可能（PASS）」を本 Phase 11 で再確認した結果:

| AC6-COND | condition text                                           | Phase 10 判定 | Phase 11 再現手段                                                                                                               | Phase 11 再確認結果 |
| -------- | -------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| COND-1   | 全 consumer が consumer-audit-report.md に記載           | pass          | RC-1 / RC-2 / RC-3 / RC-5 は 13 実行対象パス集合の一致を補助確認する証跡                                                        | **補助確認**        |
| COND-2   | 各 consumer の参照フィールドが evals-field-map.md に記載 | pass          | Phase 5 成果物（`evals-field-map.md`）の存在確認 + RC-2/3 が指す行が consumer-audit-report.md の `referenced_fields` 列挙と一致 | **pass**（再現）    |
| COND-3   | schema-change-guide.md でフィールド変更手順が定義        | pass          | Phase 8 成果物（`schema-change-guide.md`）の存在確認                                                                            | **pass**（再現）    |
| COND-4   | dual-root-parity.md で差分 0 または許容範囲内            | pass          | RC-4 の SHA-256 bit-for-bit 6 / 6 一致                                                                                          | **pass**（再現）    |

**結論**: Phase 10 AC-6 解除判定 PASS は Phase 11 再実行で **完全に再現可能**。Phase 4 → Phase 7 → Phase 11 の 3 回の独立再実行が同一結論を返している。

---

## 4. 差分が出なかった理由（Phase 4 / Phase 7 との整合性分析）

Phase 7 `coverage-recheck.md` §3.1 の原因分析を Phase 11 でも再確認:

| 観点                 | 期待                               | 実測                                                                                                  |
| -------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 並行作業の影響       | なし                               | `git status --short` は `?? docs/30-workflows/evals-consumer-audit-001/` のみ（本タスク未追跡成果物） |
| 新規コミットの影響   | なし                               | `.claude/skills/` / `.agents/skills/` / `apps/` の EVALS 関連ファイルは Phase 4 以降未変更            |
| ripgrep バージョン差 | Phase 4 と同一（`ripgrep 13.0.0`） | Phase 11 も同一                                                                                       |
| Node バージョン差    | Phase 4 と同等                     | Phase 11: `v22.21.1`（find / rg / diff / shasum は Node 非依存だが参考）                              |

→ **検索集合は Phase 4 と完全同一**、Phase 2 §2.3「本タスク実行中は EVALS.json / consumer コード変更禁止」ルール遵守を確認。

---

## 5. 集合比較データの生成手順（第三者再実行者への説明）

本 Phase 11 で実施した集合比較は、任意の第三者が以下のコマンドで追試できる。

```bash
# 1. Phase 4 raw と Phase 11 log の正規化
grep -v '^#' <raw-file> | grep -v '^$' | sort -u > <norm-file>

# 2. 集合比較
comm -23 p4-norm.txt p11-norm.txt | wc -l   # P4 only (期待: 0)
comm -13 p4-norm.txt p11-norm.txt | wc -l   # P11 only (期待: 0)

# 3. dual root bit-for-bit 比較
for s in aiworkflow-requirements github-issue-manager int-test-skill skill-creator skill-fixture-runner task-specification-creator; do
  cmp -s ".claude/skills/$s/EVALS.json" ".agents/skills/$s/EVALS.json" && echo "$s: IDENTICAL"
done

# 4. SHA-256 一致確認
shasum -a 256 .claude/skills/<skill>/EVALS.json .agents/skills/<skill>/EVALS.json
```

全手順は `manual-test-checklist.md` にチェックリスト化されている。

---

## 6. 参照

- 一次証跡: `outputs/phase-11/manual-test-result.md`
- 発見事項: `outputs/phase-11/discovered-issues.md`
- チェックリスト: `outputs/phase-11/manual-test-checklist.md`
- ログ: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/logs/rc-*.log`、`docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/logs/rc-6-content-set-diff.log`
- 前段成果物: `outputs/phase-5/consumer-audit-report.md` / `outputs/phase-6/dual-root-parity.md` / `outputs/phase-7/coverage-recheck.md` / `outputs/phase-10/ac6-release-verdict.md`
