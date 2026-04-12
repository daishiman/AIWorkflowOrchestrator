# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 13                                       |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| タスク名   | cronConverter 空曜日ガード処理追加       |
| 前提Phase  | Phase 12                                 |
| 後続Phase  | 完了                                     |
| 作成日     | 2026-04-12                               |
| ステータス | 未実施（ユーザー承認待ち）               |

## 目的

ユーザーの明示的な承認を得た上で、PR を作成する。

## 実行タスク

- ユーザー承認の有無を確認する
- PR 作成前のローカルチェック内容を整理する
- 変更要約と PR 情報の下書きを作成する
- approval 後の実行条件を明記する

## 参照資料

| 資料名                    | パス                                                     | 説明                 |
| ------------------------- | -------------------------------------------------------- | -------------------- |
| Phase 2 設計              | `phase-2-design.md`                                      | 設計前提             |
| Phase 6 テスト拡充        | `phase-6-test-expansion.md`                              | テスト拡充結果       |
| Phase 7 カバレッジ確認    | `phase-7-coverage-check.md`                              | カバレッジ根拠       |
| Phase 8 リファクタリング  | `phase-8-refactoring.md`                                 | リファクタリング結果 |
| Phase 9 品質保証          | `phase-9-quality-assurance.md`                           | 品質ゲート根拠       |
| Phase 11 手動テスト検証   | `phase-11-manual-test.md`                                | NON_VISUAL 証跡      |
| Phase 12 ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`            | 変更要約の根拠       |
| Phase 12 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認    |
| Phase 10 AC 検証記録      | `outputs/phase-10/ac-verification.md`                    | 受入基準の最終根拠   |
| GitHub Issue #1606        | daishiman/AIWorkflowOrchestrator#1606                    | 関連 Issue           |

## 重要: ユーザー承認必須

**このPhaseはユーザーの明示的な指示があるまで実行しないこと。**

コミット・push・PR作成のいずれも、ユーザーが明示的に承認するまで実行禁止。

```
Phase 13 は user の明示承認後のみ実施する。
PR の必要性・ブランチ・対象Issue についてユーザーに確認すること。
```

## PR作成前チェックリスト

以下の全項目がPASSであることを確認してからPR作成を実施する:

| チェック項目                                 | 確認コマンド                                                     | 状態   |
| -------------------------------------------- | ---------------------------------------------------------------- | ------ |
| AC-1〜AC-5 が全て検証済み                    | `outputs/phase-10/ac-verification.md` を参照                     | 未確認 |
| Phase 12 の全成果物（6ファイル）が揃っている | outputs/phase-12/ 配下の一覧確認                                 | 未確認 |
| TypeScript型チェック PASS                    | `pnpm --filter @repo/desktop typecheck`                          | 未確認 |
| ユニットテスト PASS（cronConverter関連）     | `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter` | 未確認 |
| ESLint PASS                                  | `pnpm --filter @repo/desktop lint`                               | 未確認 |
| ユーザーの明示的な承認取得済み               | 口頭/テキストでの承認                                            | 未取得 |

### チェック実行コマンド一覧

```bash
# 1. TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# 2. ユニットテスト（cronConverter関連）
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter

# 3. ESLint
pnpm --filter @repo/desktop lint

# 4. 成果物確認
ls outputs/phase-12/

# 5. 変更差分確認
git diff --stat main
git log --oneline main..HEAD
```

## PR情報テンプレート

ユーザー承認後、以下のテンプレートを使用してPRを作成する。

### タイトル

```
fix(desktop): cronConverter 空曜日ガード処理追加 (TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001)
```

### 説明文（本文）雛形

```markdown
## Summary

- `apps/desktop/src/renderer/utils/cronConverter.ts` に空曜日ガード処理を追加
- `visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` が不正なcron式を生成しないよう、空文字 `""` を返すように修正
- 純粋関数レベルのガードを追加し、UIバリデーションとの二重防御を維持

## 背景

UIレベルの週次スケジュール設定で曜日未選択時のバリデーションは存在するが、
純粋関数 `visualConfigToCron` レベルでのガードが不足していた。
空曜日配列が渡された場合に不正なcron式が生成されていた問題を根本修正した。

## 変更ファイル

- `apps/desktop/src/renderer/utils/cronConverter.ts`: 空曜日ガード処理追加・JSDoc更新
- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`: エッジケーステスト追加

## 受入基準

- [x] AC-1: `{ frequency: "weekly", weekdays: [] }` で不正なcron式が生成されない
- [x] AC-2: 正常ケース（weekdaysに値あり）は引き続きPASS
- [x] AC-3: 既存テスト全件PASS
- [x] AC-4: 空曜日ケースの追加テストケースが存在する
- [x] AC-5: cronConverter.tsのJSDocにガード処理仕様が記載されている

## Test plan

- [ ] `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter` が全件 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `grep -n "weekdays\\|return \"\"" apps/desktop/src/renderer/utils/cronConverter.ts` でガード処理が確認できる

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### PR作成コマンド雛形

```bash
gh pr create \
  --title "fix(desktop): cronConverter 空曜日ガード処理追加 (TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001)" \
  --body "$(cat <<'EOF'
## Summary

- `apps/desktop/src/renderer/utils/cronConverter.ts` に空曜日ガード処理を追加
- `visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` が不正なcron式を生成しないよう、空文字 `""` を返すように修正
- 純粋関数レベルのガードを追加し、UIバリデーションとの二重防御を維持

## 変更ファイル

- `apps/desktop/src/renderer/utils/cronConverter.ts`: 空曜日ガード処理追加・JSDoc更新
- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`: エッジケーステスト追加

## Test plan

- [ ] `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter` が全件 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## CI確認

PR作成後、以下のコマンドでCI状態を確認する:

```bash
# CI実行状況の確認
gh run list --branch $(git branch --show-current) --limit 5

# CI完了まで待機（必要な場合）
gh run watch

# PR状態の確認
gh pr view --web
```

## PR blocked 条件

以下のいずれかに該当する場合、PR作成を行わない:

| 条件                                    | 対処                     |
| --------------------------------------- | ------------------------ |
| ユーザーの明示的な承認がない            | 承認を待つ               |
| AC-1〜AC-5 のいずれかが未達             | 該当Phaseに戻り修正      |
| TypeScript型エラーが発生している        | Phase 5に戻り修正        |
| ユニットテストがFAILしている            | Phase 5〜6に戻り修正     |
| CI/CDパイプラインでエラーが発生している | エラー内容を確認して修正 |

## 成果物

| 成果物               | パス                                     | 説明                                  |
| -------------------- | ---------------------------------------- | ------------------------------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | typecheck/lint/testの実行結果         |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | git diff/log の出力・変更内容サマリー |
| PR情報               | `outputs/phase-13/pr-info.md`            | PRタイトル・本文・URL（作成後に記録） |
| PR準備レポート       | `outputs/phase-13/pr-ready-report.md`    | 全チェックリストの最終確認結果        |

## 完了条件

- [ ] ユーザーの承認取得（**必須前提条件**）
- [ ] PR作成前チェックリスト全項目PASS
- [ ] PR が作成されている（承認後）
- [ ] CI/CD が PASS している
- [ ] `outputs/phase-13/` の全成果物が揃っている

## タスク100%実行確認【必須】

- [ ] ユーザーの明示承認を得た（実施前必須）
- [ ] PR作成前チェックリストを全件実行した
- [ ] PR作成コマンドを実行した（承認後）
- [ ] CI確認を実施した
- [ ] 全成果物（4ファイル）を `outputs/phase-13/` に出力した

## 注意事項

- `--no-verify` オプションは絶対に使用しないこと（プロジェクトルール）
- コミットメッセージは Conventional Commits 形式を使用すること
- PR作成前に必ずローカルで全チェックをPASSさせること

## 完了

Phase 13 完了をもってタスク全体（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001）が完了となります。
