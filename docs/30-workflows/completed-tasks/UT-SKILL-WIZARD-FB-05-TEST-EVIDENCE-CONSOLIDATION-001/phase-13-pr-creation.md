# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 13                                                             |
| タスクID   | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001          |
| 機能名     | Phase 11 テスト証跡の一本化テンプレート整備（edge case一覧表） |
| 前提Phase  | Phase 12                                                       |
| 後続Phase  | -（最終フェーズ）                                              |
| 作成日     | 2026-04-13                                                     |
| ステータス | pending                                                        |

## 目的

Phase 1〜12 の全成果物をまとめ、レビュー可能な Pull Request を作成する。

> ## ⚠️ 重要: ユーザーの明示承認後のみ実施
>
> **本 Phase は、ユーザーが明示的に「PR を作成してください」と承認した場合にのみ実行すること。**
> Phase 12 完了後に自動的に PR 作成を開始してはならない。
> 承認を得ずに `git push` や `gh pr create` を実行することは禁止する。

## 前提条件チェック

PR 作成前に以下の全条件が満たされていることを確認する:

| 条件                                       | 確認方法                                                                                                                              | 状態         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Phase 10 最終レビューが GO 判定            | `outputs/phase-10/go-nogo-decision.md` 参照                                                                                           | （記入）     |
| Phase 11 手動テストが完了（HIGH 問題なし） | `outputs/phase-11/manual-test-checklist.md` / `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/discovered-issues.md` 参照 | （記入）     |
| Phase 12 の全 6 タスクが完了               | `outputs/phase-12/` 成果物の存在確認 / `outputs/phase-12/phase12-task-spec-compliance-check.md` 参照                                  | （記入）     |
| AC-1〜5 の全件 PASS                        | `outputs/phase-10/final-review-report.md` 参照                                                                                        | （記入）     |
| mirror parity（`.claude/` = `.agents/`）   | `outputs/phase-9/mirror-parity-diff.txt` 参照                                                                                         | （記入）     |
| ユーザーの明示承認を得た                   | 本 Phase 実行前にユーザーへ確認                                                                                                       | （確認必須） |

## コミット対象ファイル一覧

| ファイルパス                                                                                           | 変更種別 | 説明                                                                 |
| ------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/index.md`                     | 新規     | タスクインデックス                                                   |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-1-requirements.md`      | 新規     | Phase 1 要件定義                                                     |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-2-*.md`                 | 新規     | Phase 2 設計                                                         |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-3-*.md`                 | 新規     | Phase 3 技術調査                                                     |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-4-*.md`                 | 新規     | Phase 4 実装計画                                                     |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-5-*.md`                 | 新規     | Phase 5 テンプレート実装                                             |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-6-*.md`                 | 新規     | Phase 6 スキル反映                                                   |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-7-*.md`                 | 新規     | Phase 7 互換性確認                                                   |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-8-refactoring.md`       | 新規     | Phase 8 リファクタリング                                             |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-9-quality-assurance.md` | 新規     | Phase 9 品質保証                                                     |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-10-final-review.md`     | 新規     | Phase 10 最終レビュー                                                |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-11-manual-test.md`      | 新規     | Phase 11 手動テスト                                                  |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-12-documentation.md`    | 新規     | Phase 12 ドキュメント更新                                            |
| `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/phase-13-pr-creation.md`      | 新規     | Phase 13 PR 作成（本ファイル）                                       |
| `.claude/skills/task-specification-creator/SKILL.md`                                                   | 更新     | Phase 11 テンプレートに edge case 一覧表・仕様判断根拠テーブルを追加 |
| `.agents/skills/task-specification-creator/SKILL.md`                                                   | 更新     | mirror parity 維持（`.claude/` と同一内容）                          |
| `outputs/phase-*/`                                                                                     | 新規     | 各 Phase の成果物ファイル群                                          |

## PR 本文テンプレート

```
## Summary

- Phase 11 manual-test-checklist.md / manual-test-result.md / discovered-issues.md テンプレートに edge case 一覧表・仕様判断根拠テーブルを追加（AC-1〜3）
- task-specification-creator スキルの Phase 11 テンプレートに同構造を反映（AC-4）
- 既存 Phase 11 実例との互換性確認を実施（AC-5）
- Phase 12 root evidence として phase12-task-spec-compliance-check.md を追加

## 変更の背景

テスト件数・edge case 判断が複数ファイルに分散しており、レビュー・監査コストが高かった。
1ファイルで全体像を把握できるテンプレート構造を整備することで、テスト証跡の一本化を実現する。

## Test plan

- [ ] AC-1: Phase 11 テンプレートに edge case 一覧表が含まれていることを確認
- [ ] AC-2: テスト件数と内訳が 1 箇所（Summary テーブル）に集約されていることを確認
- [ ] AC-3: 仕様判断根拠テーブルが存在し、根拠ドキュメントへのリンクが明示されていることを確認
- [ ] AC-4: task-specification-creator SKILL.md の Phase 11 テンプレート箇所に新構造が反映されていることを確認
- [ ] AC-5: 既存 Phase 11 実例（outputs/phase-11/ 等）と新テンプレートの項目マッピングが確認済みであることを確認
- [ ] mirror parity: `.claude/` と `.agents/` の SKILL.md diff が 0 行であることを確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## CI 確認手順

PR 作成後、以下の CI チェックが全件 PASS であることを確認する:

| CI チェック項目 | 確認コマンド / 確認方法                                        | 期待結果  |
| --------------- | -------------------------------------------------------------- | --------- |
| Lint            | `pnpm lint`                                                    | 0 errors  |
| Type Check      | `pnpm typecheck`                                               | 0 errors  |
| Mirror Parity   | `diff .claude/skills/.../SKILL.md .agents/skills/.../SKILL.md` | diff = 0  |
| GitHub Actions  | `gh run view` で最新 run を確認                                | all green |

```bash
# CI ステータス確認コマンド
gh run list --limit 5
gh run view <run-id>
```

## 実行手順

1. ユーザーから明示承認を得る（必須）
2. 前提条件チェックテーブルの全項目を確認する
3. コミット対象ファイルをステージングする

```bash
git add docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/
git add .claude/skills/task-specification-creator/SKILL.md
git add .agents/skills/task-specification-creator/SKILL.md
git add outputs/
```

4. コミットメッセージを作成してコミットする

```bash
git commit -m "$(cat <<'EOF'
docs(test-evidence): Phase 11 テスト証跡テンプレートに edge case 一覧表・仕様判断根拠テーブルを追加

- AC-1: edge case 一覧表をテンプレートに追加
- AC-2: テスト件数と内訳を Summary テーブルに集約
- AC-3: 仕様判断根拠テーブルを追加
- AC-4: task-specification-creator Phase 11 テンプレートに反映
- AC-5: 既存実例との互換性確認済み

Closes #2033
EOF
)"
```

5. PR を作成する

```bash
gh pr create \
  --title "docs(test-evidence): Phase 11 テスト証跡テンプレートに edge case 一覧表を追加 #2033" \
  --body "$(cat outputs/phase-13/change-summary.md)"
```

6. CI チェックの結果を確認し、全件 PASS を確認する

## 成果物

| 成果物           | パス                                     | 説明                                 |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | Phase 13 実行前の確認記録            |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | `gh pr create --body` に渡すテキスト |
| PR 情報          | `outputs/phase-13/pr-info.md`            | 作成した PR の URL 等                |

## 完了条件

- [ ] ユーザーの明示承認を得ていること（最重要）
- [ ] 前提条件チェックの全項目が満たされていること
- [ ] コミット対象ファイルが全件ステージングされていること
- [ ] コミットメッセージが Closes #2033 を含んでいること
- [ ] PR が作成され URL が記録されていること
- [ ] CI チェックが全件 PASS であること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. ユーザーへの承認確認
2. 前提条件チェック
3. ファイルのステージング
4. コミット作成
5. PR 作成
6. CI 確認

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## タスク完了

本 Phase をもって UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001 の全 13 Phase が完了する。
