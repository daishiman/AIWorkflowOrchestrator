# Phase 11 Discovered Issues

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 11 の **発見事項分類**（Blocker / Note / Info）を集約する補助成果物。
> 一次証跡は `manual-test-result.md`。

---

## メタ情報

| 項目           | 内容                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| task_id        | TASK-EVALS-CONSUMER-AUDIT-001                                              |
| phase          | 11                                                                         |
| 生成日時 (UTC) | 2026-04-19                                                                 |
| 実施 iter      | #3（Phase 4 初回 / Phase 7 第 2 回目 / Phase 11 第 3 回目の独立再実行）    |
| 方針           | Phase 11 実行中に「新規発見した問題」のみ列挙。過去 Phase の既存発見は再掲 |

---

## 1. 結論

**Phase 11 で新規に発見した問題: なし（0 件）**

- Blocker: 0 件
- Note: 0 件
- Info: 0 件（本 Phase 固有の新規発見として）

※ Phase 5 §8 / Phase 7 §9 / Phase 10 §4.4 で既に記録済の未タスク候補 6 件は、Phase 11 の RC 再実行では新たな根拠・反証とも得られず、そのまま Phase 12 `unassigned-task-detection.md` へ引き継ぎ対象とする（§3 参照）。

---

## 2. Phase 11 RC 実行結果に関する Info 記録

本 Phase 11 は「第三者再実行で consumer-audit-report.md との 0 差分」を確認するのが目的であり、RC-1〜RC-5 すべて PASS で完了した。以下は Phase 12 への情報共有として保持。

| #   | カテゴリ | 内容                                                                                                                                                                                                                                    | 対応                                                                  |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Info     | `claude-agent-sdk` スキルは両 root 共に EVALS.json 非所持（Phase 6 対象外 / Phase 5 consumer 表にも非掲載）。RC-4 のシェル駆動方式（`ls .claude/skills`）では「missing one side」として検出されるが、これは期待通りの動作で問題ではない | Phase 12 `implementation-guide.md` で再現コマンドの注記として明示候補 |
| 2   | Info     | `rg` のファイル走査順序が非決定的なため、raw ファイルの行順は Phase 4 / Phase 7 / Phase 11 の 3 時点で微差があるが、集合比較（`sort -u` + `comm`）では完全一致（0 差分）                                                                | 既に Phase 7 §3 で記録済。新規対応なし                                |
| 3   | Info     | メタ行（タイムスタンプ、working_directory、exit_status）は各実行で異なるが、`grep -v '^#'` で除外すれば集合は同一                                                                                                                       | 既に Phase 7 §3 で記録済。新規対応なし                                |

---

## 3. 既存発見（Phase 5 / Phase 7 / Phase 10 記録 → Phase 12 引き継ぎ）

本 Phase 11 の再実行では下記 6 件について新たな情報は得られなかった。いずれも Phase 12 `unassigned-task-detection.md` にて正式記録される予定。

| #   | 発見内容（Phase 11 では変化なし）                                        | 分類 | 初出             | 推奨記録先                                                                                 |
| --- | ------------------------------------------------------------------------ | ---- | ---------------- | ------------------------------------------------------------------------------------------ |
| 1   | EVALS スキーマの camel/snake 二重標準統一                                | Note | Phase 5 §8 #1    | `docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`           |
| 2   | mirror cross-root link 解消（`.agents/.../resource-map.md` → `.claude`） | Note | Phase 5 §8 #3    | `docs/30-workflows/unassigned-task/task-mirror-resource-map-cross-root-link-001.md`        |
| 3   | SkillScanner の EVALS 内容バリデーション実装                             | Note | Phase 5 §8 #4    | `docs/30-workflows/unassigned-task/task-skill-scanner-evals-content-validate-001.md`       |
| 4   | `validate-schemas.js` / `validate-skill-structure.js` の EVALS 検証追加  | Note | Phase 5 §8 #5    | `docs/30-workflows/unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md` |
| 5   | snake_case v1 系スキーマの正本化                                         | Info | Phase 10 §4.4 #5 | `docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`          |
| 6   | qualityInsights.\* フィールドの正本化                                    | Info | Phase 10 §4.4 #6 | `docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md`       |

（補足: Phase 10 §4.4 には 7 件目として「validator=0 件事実の正本追記」も記録されているが、本 Phase 11 で追試対象ではなく、Phase 12 で参照される）

---

## 4. Blocker / Note / Info 判定ルール（参考）

| 分類    | 定義                                                                           |                     Phase 11 件数 |
| ------- | ------------------------------------------------------------------------------ | --------------------------------: |
| Blocker | 本 Phase 11 の QG-10 を不合格にする / Phase 12 への進行を妨げる問題            |                                 0 |
| Note    | Phase 12 `unassigned-task-detection.md` への記録対象となる運用補強事項         |                         0（新規） |
| Info    | 参考情報（Phase 11 では §2 の 3 件が該当。いずれも想定内の挙動で問題ではない） | 0（新規 / §2 は想定内の挙動記録） |

---

## 5. 本 Phase で FAIL が発生した場合の想定戻し先（参考 / 実際は FAIL 0 件）

| RC-ID | FAIL 想定原因                                                | 戻し先 Phase               |
| ----- | ------------------------------------------------------------ | -------------------------- |
| RC-1  | find 条件（除外パス・`-name`）の再精査                       | Phase 4                    |
| RC-2  | consumer 表の行/列漏れ                                       | Phase 4 + Phase 5          |
| RC-3  | 動的パスパターン（`resolve` / テンプレートリテラル等）の拡張 | Phase 4 + Phase 5 §7       |
| RC-4  | dual root のスキル構造差、EVALS.json 片方欠損                | Phase 6                    |
| RC-5  | 再検索ヒットに consumer-audit-report.md 未記載のパスが出現   | Phase 5 (§3〜§5) + Phase 7 |

※ 本 Phase 11 では **FAIL 0 件**のため、戻しは発生しない。

---

## 6. 参照

- 一次証跡: `outputs/phase-11/manual-test-result.md`
- 詳細差分: `outputs/phase-11/reproduction-verification.md`
- チェックリスト: `outputs/phase-11/manual-test-checklist.md`
- 既存発見 6 件の原本:
  - `outputs/phase-5/consumer-audit-report.md` §8
  - `outputs/phase-7/coverage-recheck.md` §9
  - `outputs/phase-10/ac6-release-verdict.md` §4.4
