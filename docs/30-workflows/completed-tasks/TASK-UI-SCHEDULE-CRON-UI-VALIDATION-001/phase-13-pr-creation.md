# Phase 13: PR作成・CI確認

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 13                                      |
| タスクID   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| タスク名   | VisualCronPicker UIバリデーション整理   |
| 前提Phase  | Phase 12                                |
| 後続Phase  | 完了                                    |
| 作成日     | 2026-04-13                              |
| ステータス | 未実施（ユーザー承認待ち）              |

## 目的

ユーザーの明示的な承認を得た上で、PR を作成し、CI が PASS していることを確認する。

## 実行タスク

- ユーザー承認の有無を確認する（**必須前提**）
- PR 作成前のローカルチェックを全件実施する
- 変更要約と PR 情報を整理する
- ユーザー承認後に PR を作成する
- CI の実行状況を確認する

## 参照資料

| 資料名                    | パス                                          | 説明                 |
| ------------------------- | --------------------------------------------- | -------------------- |
| Phase 2 設計              | `phase-2-design.md`                           | 設計前提             |
| Phase 5 実装              | `phase-5-implementation.md`                   | 実装内容の確認       |
| Phase 6 テスト拡充        | `phase-6-test-expansion.md`                   | テスト拡充結果       |
| Phase 9 品質保証          | `phase-9-quality-assurance.md`                | 品質ゲート根拠       |
| Phase 11 手動テスト       | `phase-11-manual-test.md`                     | VISUAL証跡（SS×4枚） |
| Phase 12 ドキュメント更新 | `outputs/phase-12/documentation-changelog.md` | 変更要約の根拠       |
| Phase 10 AC 検証記録      | `outputs/phase-10/ac-verification.md`         | 受入基準の最終根拠   |

## 重要: ユーザー承認必須

**このPhaseはユーザーの明示的な指示があるまで実行しないこと。**

コミット・push・PR作成のいずれも、ユーザーが明示的に承認するまで実行禁止。

```
Phase 13 は user の明示承認後のみ実施する。
PR の必要性・ブランチ・対象Issue についてユーザーに確認すること。
```

## PR情報

### タイトル

```
feat(schedule): TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 VisualCronPicker UIバリデーション整理
```

### ブランチ

```
docs/task-ui-schedule-cron-ui-validation-001-task-spec
```

### 変更ファイル

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`
- `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`

## PR作成前チェックリスト

以下の全項目がPASSであることを確認してからPR作成を実施する:

| チェック項目                                    | 確認コマンド                                                                        | 状態   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| AC が全て検証済み                               | `outputs/phase-10/ac-verification.md` を参照                                        | 未確認 |
| Phase 12 の全成果物（6ファイル）が揃っている    | `outputs/phase-12/` 配下の一覧確認                                                  | 未確認 |
| TypeScript型チェック PASS                       | `pnpm --filter @repo/desktop typecheck`                                             | 未確認 |
| ユニットテスト PASS（VisualCronPicker関連）     | `pnpm vitest run apps/desktop/src/__tests__/components/VisualCronPicker.validation` | 未確認 |
| ESLint PASS                                     | `pnpm --filter @repo/desktop lint`                                                  | 未確認 |
| VISUAL証跡（スクリーンショット4枚）が揃っている | `outputs/phase-11/screenshots/*.png` の存在確認                                     | 未確認 |
| ユーザーの明示的な承認取得済み                  | 口頭/テキストでの承認                                                               | 未取得 |

### チェック実行コマンド一覧

```bash
# 1. TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# 2. ユニットテスト（VisualCronPicker バリデーション関連）
pnpm vitest run apps/desktop/src/__tests__/components/VisualCronPicker.validation

# 3. ESLint
pnpm --filter @repo/desktop lint

# 4. 成果物確認（Phase 12）
ls outputs/phase-12/

# 5. VISUAL証跡確認（Phase 11）
ls outputs/phase-11/

# 6. 変更差分確認
git diff --stat main
git log --oneline main..HEAD
```

## PR作成手順（ユーザー承認後のみ実施）

```bash
gh pr create \
  --title "feat(schedule): TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 VisualCronPicker UIバリデーション整理" \
  --body "$(cat <<'EOF'
## Summary

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` に weekly + 空曜日・monthly + 無効日付（0/32以上）のUIバリデーションを追加
- `value` ベースの props 契約に `onValidationChange` を追加し、親コンポーネントへ有効/無効状態を通知
- バリデーションエラー時に画面へエラーメッセージを表示し、不正な設定の保存を防止
- `cronConverter.ts` 側の既存ガード処理との二重防御を実現

## 背景

`VisualCronPicker` コンポーネントで、曜日未選択（weekly）・無効日付（monthly）の状態のまま
設定が保存できてしまう問題があった。UIレベルでのバリデーションフィードバックを追加し、
ユーザーが設定ミスをその場で認識・修正できるようにした。

## 変更ファイル

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`: UIバリデーション追加
- `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`: バリデーションテスト追加

## Test plan

- [ ] `pnpm vitest run apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation` が全件 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] weekly + 空曜日でエラーメッセージが表示される（VISUAL証跡: `outputs/phase-11/screenshots/scene-01-weekly-empty-weekdays-error.png`）
- [ ] weekly + 曜日選択済みで正常表示される（VISUAL証跡: `outputs/phase-11/screenshots/scene-02-weekly-valid-weekdays-ok.png`）
- [ ] monthly + 無効日付（0/32）でエラーメッセージが表示される（VISUAL証跡: `outputs/phase-11/screenshots/scene-03-monthly-invalid-date-error.png`）
- [ ] monthly + 有効日付で正常表示される（VISUAL証跡: `outputs/phase-11/screenshots/scene-04-monthly-valid-date-ok.png`）

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
| AC が未達のものがある                   | 該当Phaseに戻り修正      |
| TypeScript型エラーが発生している        | Phase 5に戻り修正        |
| ユニットテストがFAILしている            | Phase 5〜6に戻り修正     |
| VISUAL証跡（スクリーンショット）が不足  | Phase 11に戻り再撮影     |
| CI/CDパイプラインでエラーが発生している | エラー内容を確認して修正 |

## 統合テスト連携

Phase 11 の VISUAL証跡（スクリーンショット4枚）および Phase 12 のドキュメント成果物（6ファイル）が
揃っていることを確認した上でPRを作成する。

## 多角的チェック観点

| チェック観点             | 確認内容                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| PRタイトルの正確性       | タスクIDとタスク名がタイトルに含まれているか                                                              |
| 変更ファイルの網羅性     | `schedule/VisualCronPicker.tsx` と `schedule/VisualCronPicker.validation.test.tsx` の両方が含まれているか |
| VISUAL証跡との整合性     | PRの説明文がスクリーンショット4シーンと対応しているか                                                     |
| --no-verify 未使用       | コミット時に `--no-verify` を使用していないか（プロジェクトルール）                                       |
| Conventional Commits形式 | コミットメッセージが `feat(schedule):` 形式になっているか                                                 |

## サブタスク管理

| サブタスクID | 内容                           | 状態     |
| ------------ | ------------------------------ | -------- |
| ST-13-01     | ユーザー承認確認               | 承認待ち |
| ST-13-02     | PR作成前チェックリスト全件実施 | 未実施   |
| ST-13-03     | PR作成コマンド実行             | 未実施   |
| ST-13-04     | CI実行状況確認                 | 未実施   |
| ST-13-05     | pr-creation-result.md 作成     | 未実施   |

## 成果物

| 成果物             | パス                                     | 説明                                        |
| ------------------ | ---------------------------------------- | ------------------------------------------- |
| PR作成結果レポート | `outputs/phase-13/pr-creation-result.md` | PRタイトル・URL・チェックリスト結果・CI状態 |

## 完了条件

- [ ] ユーザーの承認取得（**必須前提条件**）
- [ ] PR作成前チェックリスト全項目PASS
- [ ] PR が作成されている（承認後）
- [ ] CI/CD が PASS している
- [ ] `outputs/phase-13/pr-creation-result.md` が出力されている

## タスク100%実行確認【必須】

- [ ] ユーザーの明示承認を得た（実施前必須）
- [ ] PR作成前チェックリストを全件実行した
- [ ] PR作成コマンドを実行した（承認後）
- [ ] CI確認を実施した
- [ ] 成果物（1ファイル）を `outputs/phase-13/` に出力した

## 注意事項

- `--no-verify` オプションは絶対に使用しないこと（プロジェクトルール）
- コミットメッセージは Conventional Commits 形式を使用すること
- PR作成前に必ずローカルで全チェックをPASSさせること

## 完了

Phase 13 完了をもってタスク全体（TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001）が完了となります。

## 次Phase

なし（完了）
