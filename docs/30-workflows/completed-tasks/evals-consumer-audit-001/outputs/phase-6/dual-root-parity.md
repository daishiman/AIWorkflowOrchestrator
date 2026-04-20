# Dual Root Parity Report（`.claude` vs `.agents`）

> ★最終成果物 3 / Phase 6 / TASK-EVALS-CONSUMER-AUDIT-001
> AC-4 / FR-6 の直接根拠。

---

## 1. メタ情報

| 項目                                  | 内容                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| phase_id                              | 6                                                                               |
| task_id                               | TASK-EVALS-CONSUMER-AUDIT-001                                                   |
| 生成日時 (UTC)                        | 2026-04-19T08:56:40Z                                                            |
| 作業ブランチ                          | `.worktrees/task-20260419-160952-wt-9`                                          |
| 入力                                  | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt` |
| 対象 root                             | `.claude/skills/*/EVALS.json`（left） / `.agents/skills/*/EVALS.json`（right）  |
| 対象スキル数 (`skills-union.txt`)     | 6                                                                               |
| 両 root 存在 (`skills-both.txt`)      | 6                                                                               |
| `.claude` のみ (`only-in-claude.txt`) | 0                                                                               |
| `.agents` のみ (`only-in-agents.txt`) | 0                                                                               |
| 分類別件数                            | **0（完全一致）: 6** / 許容: 0 / 要対応: 0 / 片方欠損: 0                        |
| 使用ツール                            | `diff -u`, `cmp -s`, `shasum -a 256`（比較は bit-for-bit）                      |
| 正本判定                              | **本 Phase では行わない**（Phase 2 §3.1 の dual root 断定禁止方針に準拠）       |

### 判定ハッシュ（両 root が bit-for-bit 一致であることの追加証跡）

`cmp -s` にて全 6 ペアが IDENTICAL。以下は `.claude` 側 EVALS.json の SHA-256（`.agents` 側も同一ハッシュ）。

| スキル                     | バイト数 | SHA-256（`.claude` == `.agents`）                                  |
| -------------------------- | -------- | ------------------------------------------------------------------ |
| aiworkflow-requirements    | 1162     | `4579e61e2268d0d04313f03be419f5fd06749a16e1bac816ea9fec57461e90d3` |
| github-issue-manager       | 409      | `1fa508d9c4fbc28125e8e4af8760832d14baafacde1f641712931ca14dfdba43` |
| int-test-skill             | 403      | `65bf0a254f2bc350d713ee73f3e21c28c092c6a6d7cb1a27af01de9345c9aa14` |
| skill-creator              | 809      | `5576171341c5263038d7d90607d811b51558e2008050183945f6d95e80eaffb8` |
| skill-fixture-runner       | 160      | `a8312b3284f82bde8b883be7fbe9ebc6f945a54e7f5877fd7d2b52e88a0981b6` |
| task-specification-creator | 4764     | `43f9d6a94b65929041ec2c499f09820e1056af4477cea1636e99a6b42d26531b` |

---

## 2. サマリ表（全スキル）

| スキル                     | `.claude` 存在 | `.agents` 存在 | 分類 | 差分の概要                                         | 対応方針             |
| -------------------------- | -------------- | -------------- | ---- | -------------------------------------------------- | -------------------- |
| aiworkflow-requirements    | 有             | 有             | 0    | `diff -u` 出力空／`cmp -s` IDENTICAL／SHA-256 一致 | 対応不要（完全一致） |
| github-issue-manager       | 有             | 有             | 0    | `diff -u` 出力空／`cmp -s` IDENTICAL／SHA-256 一致 | 対応不要（完全一致） |
| int-test-skill             | 有             | 有             | 0    | `diff -u` 出力空／`cmp -s` IDENTICAL／SHA-256 一致 | 対応不要（完全一致） |
| skill-creator              | 有             | 有             | 0    | `diff -u` 出力空／`cmp -s` IDENTICAL／SHA-256 一致 | 対応不要（完全一致） |
| skill-fixture-runner       | 有             | 有             | 0    | `diff -u` 出力空／`cmp -s` IDENTICAL／SHA-256 一致 | 対応不要（完全一致） |
| task-specification-creator | 有             | 有             | 0    | `diff -u` 出力空／`cmp -s` IDENTICAL／SHA-256 一致 | 対応不要（完全一致） |

> 注: 表の分類列は `0 / 許容 / 要対応 / 片方欠損` のいずれか。本スナップショットでは全件 `0`。

### 2.1 分類基準（Phase 3 §1 Phase 6 準拠）

| 分類         | 定義                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0**        | バイナリ diff が空（`diff -u` の出力なし、かつ `cmp -s` が IDENTICAL）                                                                            |
| **許容**     | `lastUpdated` / `metrics.totalUsageCount` / `metrics.successCount` / `metrics.lastEvaluated` 等、運用メトリクスの数値・時刻揺らぎのみの差分       |
| **要対応**   | スキーマ構造差（キーの有無・型の違い・`levelCriteria` など構造体の差異）。Phase 12 で `unassigned-task-detection.md` の未タスク候補として引き渡す |
| **片方欠損** | 片方の root にのみ EVALS.json が存在。Phase 12 の未タスク候補化、および Phase 8 の dual root 同期手順の対象                                       |

---

## 3. 詳細セクション（スキル別判定根拠）

各スキルの詳細 diff は `per-skill/<skill>.diff` を参照（全ファイル先頭 4 行にメタコメント）。統合版は `raw-diff.txt`。

### 3.1 aiworkflow-requirements

- diff ファイル: `outputs/phase-6/per-skill/aiworkflow-requirements.diff`
- `diff -u` 出力: 空（ヘッダコメント 4 行のみ）
- `cmp -s` 結果: IDENTICAL（1162 bytes）
- 判定: **0（完全一致）**
- 根拠: left と right のバイト列が完全一致。`lastUpdated` を含むすべてのフィールドが同値。

### 3.2 github-issue-manager

- diff ファイル: `outputs/phase-6/per-skill/github-issue-manager.diff`
- `diff -u` 出力: 空
- `cmp -s` 結果: IDENTICAL（409 bytes）
- 判定: **0（完全一致）**

### 3.3 int-test-skill

- diff ファイル: `outputs/phase-6/per-skill/int-test-skill.diff`
- `diff -u` 出力: 空
- `cmp -s` 結果: IDENTICAL（403 bytes）
- 判定: **0（完全一致）**

### 3.4 skill-creator

- diff ファイル: `outputs/phase-6/per-skill/skill-creator.diff`
- `diff -u` 出力: 空
- `cmp -s` 結果: IDENTICAL（809 bytes）
- 判定: **0（完全一致）**

### 3.5 skill-fixture-runner

- diff ファイル: `outputs/phase-6/per-skill/skill-fixture-runner.diff`
- `diff -u` 出力: 空
- `cmp -s` 結果: IDENTICAL（160 bytes）
- 判定: **0（完全一致）**

### 3.6 task-specification-creator

- diff ファイル: `outputs/phase-6/per-skill/task-specification-creator.diff`
- `diff -u` 出力: 空
- `cmp -s` 結果: IDENTICAL（4764 bytes）
- 判定: **0（完全一致）**

---

## 4. 片方欠損スキル一覧

`only-in-claude.txt` / `only-in-agents.txt` は **ともに 0 件**。片方欠損スキルは存在しない。

| root    | スキル                                   |
| ------- | ---------------------------------------- |
| .claude | （該当なし — `only-in-claude.txt` は空） |
| .agents | （該当なし — `only-in-agents.txt` は空） |

出典: `outputs/phase-6/only-in-claude.txt`, `outputs/phase-6/only-in-agents.txt`（いずれも 0 バイト）。

---

## 5. 要対応差分の未タスク候補リスト（Phase 12 引き渡し）

**該当 0 件**。

本スナップショット時点で、スキーマ構造差（`要対応`）および片方欠損は検出されず、Phase 12 の `unassigned-task-detection.md` に引き渡す dual-root 起因の未タスクは **0 件**。

将来スキーマが dual root 間でドリフトした場合は、本表を再生成し該当行を「要対応」に分類変更、Phase 12 へ連携する運用とする（Phase 8 `schema-change-guide.md` §dual root 同期手順で手順化予定）。

---

## 6. 正本判定を行わなかった旨の注記（Phase 2 §3.1 準拠）

本 Phase では、`.claude/skills/` と `.agents/skills/` のどちらが **正本（source of truth）** であるかの断定は行わない。

根拠: `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` §3.1 において「dual root は並存を前提とし、本監査タスクは差分の可視化に留め、正本判定は別タスクで扱う」と規定されているため。本レポートは差分の **量と性質** のスナップショットとして機能し、正本判定判断材料としてのみ後続タスクに引き渡される。

Phase 8 の `schema-change-guide.md` では、フィールド追加・削除・リネーム時の **dual root 同期手順**（両 root に同時反映する手順）を策定する。これは「どちらが正か」を決めるものではなく、「両 root を bit-for-bit 一致させる運用」を定義するものである。

---

## 7. フィクスチャ root の扱い

以下のファイルは dual root 対称性判定の **対象外** とする。

- `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`

理由:

- Phase 4 `raw-find-evals.txt` line 16 で検出されているが、これはテストフィクスチャ（`__fixtures__/`）であり、`skill-creator` スキルの出力検証用サンプルとして **固定された期待値** である。
- `.claude/skills/` / `.agents/skills/` のランタイム EVALS と異なり、スキル実行時の読み書き対象ではない。
- Phase 2 §3.1 の dual root 対称性判定は **ランタイム skill root**（`.claude/skills/`, `.agents/skills/`）に限定されるため、本フィクスチャは本レポートのサマリ表・詳細セクション・片方欠損判定のいずれにも含めない。
- 当該フィクスチャの検証は `skill-fixture-runner` スキルおよび関連テストが担当する（consumer-audit-report 側で document-only / test consumer として記録）。

---

## 8. 自己検証結果

| 検証項目 (spec §6)                                                    | 結果                |
| --------------------------------------------------------------------- | ------------------- |
| §6.1 スキル数の網羅確認（`skills-union.txt` 6 行 ≦ サマリ表列挙数 6） | OK                  |
| §6.2 `per-skill/<skill>.diff` 全生成（6/6）                           | OK                  |
| §6.3 3 分類のいずれかが全スキル行に付与                               | OK（全 6 件が `0`） |
| §6.4 フィクスチャ root 除外の明記（本書 §7）                          | OK                  |
| §6.5 正本判定を行わない旨の明記（本書 §6）                            | OK                  |
| 片方欠損スキル専用セクション（本書 §4）                               | OK                  |
| 要対応差分の未タスク候補リスト（0 件でも明記／本書 §5）               | OK                  |

---

## 9. 参考: 成果物ファイル一覧

| ファイル                                    | 内容                                                 |
| ------------------------------------------- | ---------------------------------------------------- |
| `dual-root-parity.md`（本書）               | ★最終成果物 3                                        |
| `raw-diff.txt`                              | 全 6 スキルの `diff -u` 出力連結（スキル区切り付き） |
| `per-skill/aiworkflow-requirements.diff`    | aiworkflow-requirements スキルの diff                |
| `per-skill/github-issue-manager.diff`       | github-issue-manager スキルの diff                   |
| `per-skill/int-test-skill.diff`             | int-test-skill スキルの diff                         |
| `per-skill/skill-creator.diff`              | skill-creator スキルの diff                          |
| `per-skill/skill-fixture-runner.diff`       | skill-fixture-runner スキルの diff                   |
| `per-skill/task-specification-creator.diff` | task-specification-creator スキルの diff             |
| `skills-claude.txt` / `skills-agents.txt`   | 各 root のスキル集合                                 |
| `skills-union.txt` / `skills-both.txt`      | 和集合 / 積集合                                      |
| `only-in-claude.txt` / `only-in-agents.txt` | 片方欠損スキル集合（本スナップショットでは 0 件）    |

---

## 10. Phase 5 突合（要対応差分 × consumer 影響）

`要対応` スキルが **0 件** のため、Phase 5 `consumer-audit-report.md` との突合により consumer への影響を追記する対象は存在しない。

将来 `要対応` が発生した場合の追記フォーマット:

> - 対象スキル: `<skill>`
> - 構造差内容: `<追加/削除/型変更されたキー>`
> - 影響 consumer: `<reader / writer / validator を consumer-audit-report から抜粋>`
> - 未タスク候補: `unassigned-task/<slug>.md`（Phase 12 で起票）

---

## 11. 判定結論

- **dual root drift: なし**（全 6 スキルがバイト単位で完全一致）
- **片方欠損: なし**
- **要対応差分: なし**
- したがって Phase 6 時点で Phase 12 に引き渡す dual-root 起因の未タスクは 0 件。
- 正本判定は本 Phase では行わず、Phase 8 の dual root 同期手順策定にスナップショットとして引き継ぐ。

本結論は **2026-04-19T08:56:40Z 時点のスナップショット** であり、EVALS.json が更新されるたびに再生成する必要がある（Phase 8 `schema-change-guide.md` の運用手順として織り込む）。
