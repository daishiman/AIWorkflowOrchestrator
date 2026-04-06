# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 13                                                                |
| Phase名    | PR 作成                                                           |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 12: ドキュメント更新                                        |
| 次Phase    | -（完了）                                                         |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

Phase 12 までの完了状況を確認し、ユーザー承認後にのみ PR 作成へ進める判断基準を明確にする。

## 実行タスク

1. `verify-all-specs` を実行する
2. `validate-phase-output` を実行する
3. `verify-unassigned-links` を実行する
4. `git diff` で差分を確認する
5. Phase 12 root evidence を確認する

## 参照資料

| 資料名                    | パス                                                     |
| ------------------------- | -------------------------------------------------------- |
| Phase 12 ドキュメント更新 | `./phase-12-documentation.md`                            |
| root evidence             | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 成果物

- PR 作成可否の判断メモ
- ユーザー承認後に実行する PR 本文案

## 統合テスト連携

- PR 作成前の全 validator 結果を最終確認する。
- ユーザー承認後にのみ `/ai:diff-to-pr` へ進む。

## 重要: ユーザーの明示承認が必要

> **PR 作成は自動実行しない。ユーザーの明示的な許可を得てから `/ai:diff-to-pr` を実行すること。**

| 禁止事項                                   | 理由                                       |
| ------------------------------------------ | ------------------------------------------ |
| 勝手に PR を作成する                       | レビュー前の変更がリモートに反映される     |
| ユーザー確認なしで `/ai:diff-to-pr` を実行 | 意図しないブランチが作成される可能性       |
| ローカル確認をスキップする                 | 動作確認されていないコードが PR に含まれる |

## PR 作成前チェックリスト（ユーザー実行）

| #   | 確認項目                        | コマンド                                                                                                                                                                                   |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | verify-all-specs が PASS        | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 --json`                                      |
| 2   | validate-phase-output が PASS   | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-phase-spec-format-improvement-001`                                                   |
| 3   | verify-unassigned-links が PASS | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/ut-phase-spec-format-improvement-001/outputs/phase-11/manual-test-result.md` |
| 4   | 改修済みテンプレートの内容確認  | git diff で差分確認                                                                                                                                                                        |
| 5   | Phase 12 root evidence の確認   | `outputs/phase-12/phase12-task-spec-compliance-check.md` の確認                                                                                                                            |

## PR 作成実行（ユーザー承認後）

```bash
# /ai:diff-to-pr スキルを使用して PR を作成する
# ユーザーの明示承認後のみ実行
```

## PR タイトル案

```
feat(task-spec): Phase仕様書フォーマットのTask/Step分離とNON_VISUAL evidenceルール追加
```

## PR 本文概要

```markdown
## 概要

TASK-P0-01 Phase 12 の skill-feedback-report で発見された 2 つの問題を解消する
`phase-spec-template.md` のテンプレート改修。

### 変更内容

1. **Task/Step 分離ガイドライン追加**
   - 「実行タスク（plan）」と「検証ログ（current fact）」を別セクションとして定義
   - 記述ルール（命令形 = plan / 過去形 = current fact）を明記

2. **docs-only / NON_VISUAL evidence ルール追加**
   - NON_VISUAL タスクでは screenshot 不要を明記
   - primary evidence として `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` を定義
   - VISUAL / NON_VISUAL の Handlebars 条件分岐を追加

3. **unassigned-task-template.md の苦戦箇所記載欄の明確化**

### 関連 Issue

Closes #1919

### テスト結果

- verify-all-specs: PASS
- validate-phase-output: PASS
- verify-unassigned-links: PASS
- Phase 11 手動テスト: manual-test-checklist / manual-test-result / discovered-issues PASS
- Phase 12 root evidence: `phase12-task-spec-compliance-check.md` PASS
```

## 完了条件

- [ ] ユーザーの明示承認を得た
- [ ] PR 作成前チェックリストを全て確認した
- [ ] PR が作成されている
- [ ] CI/CD が PASS している
- [ ] Issue #1919 が Closed になっている

## タスク100%実行確認【必須】

- [ ] ユーザーの明示承認を得てから PR を作成した
- [ ] PR URL を記録した
- [ ] 本Phase内の全タスクを100%実行完了
