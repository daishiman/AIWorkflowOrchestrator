# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 13                                   |
| Phase名    | PR作成                               |
| 前提Phase  | Phase 12: ドキュメント更新           |
| 後続Phase  | なし（最終 Phase）                   |
| ステータス | 保留（ユーザー承認待ち）             |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

全 Phase の品質チェックが完了したことを確認した上で、**ユーザーの明示的な承認を得てから** Pull Request を作成する。

## 重要な警告

> **このPhaseはユーザー指示待ちです。ユーザーの明示的な許可なしに PR の作成・push を自動実行することは禁止です。**

Claude Code は以下のアクションを **ユーザーの明示的な指示なしに自動実行してはならない**:

- `git push` の実行
- `gh pr create` の実行
- ブランチの作成・切り替え（承認前）

上記に違反する操作は、プロジェクトの main ブランチを意図せず汚染する可能性があるため、厳守すること。

## PR 作成前チェックリスト

PR 作成を依頼する前に、以下を全件確認すること。

### 全 Phase 完了確認

| Phase    | Phase名              | 完了確認 |
| -------- | -------------------- | -------- |
| Phase 1  | 要件定義             | [ ]      |
| Phase 2  | 設計                 | [ ]      |
| Phase 3  | 設計レビュー         | [ ]      |
| Phase 4  | テスト作成           | [ ]      |
| Phase 5  | 実装                 | [ ]      |
| Phase 6  | コードレビュー       | [ ]      |
| Phase 7  | リファクタリング     | [ ]      |
| Phase 8  | 単体テスト実行       | [ ]      |
| Phase 9  | E2Eテスト            | [ ]      |
| Phase 10 | 統合テスト           | [ ]      |
| Phase 11 | 手動テスト（VISUAL） | [ ]      |
| Phase 12 | ドキュメント更新     | [ ]      |

### 品質チェック

| 確認項目        | コマンド         | 結果   |
| --------------- | ---------------- | ------ |
| 型チェック PASS | `pnpm typecheck` | 未確認 |
| Lint 警告ゼロ   | `pnpm lint`      | 未確認 |
| 全テスト PASS   | `pnpm test`      | 未確認 |
| ビルド成功      | `pnpm build`     | 未確認 |

### 成果物確認

- [ ] `manual-test-result.md` が存在し全シナリオ PASS
- [ ] `screenshot-plan.json` が存在し全スクリーンショットが取得済み
- [ ] `implementation-guide.md` が存在する
- [ ] `documentation-changelog.md` が存在する
- [ ] `unassigned-task-detection.md` が存在する
- [ ] `skill-feedback-report.md` が存在する

## ブランチ命名規則

```
feat/visual-cron-picker-ui
```

- プレフィックス: `feat/`（新機能の場合）
- 命名: kebab-case でコンポーネント名を表現
- 例: `feat/visual-cron-picker-ui`

## PR タイトル案

```
feat(ui): スケジュール設定ビジュアルピッカーUI実装（TASK-UI-SCHEDULE-VISUAL-PICKER-001）
```

## PR 本文テンプレート

```markdown
## Summary

- `VisualCronPicker` および関連サブコンポーネント（FrequencySelector / WeekdaySelector / TimePickerSection / DayOfMonthSelector / CronPreview）を新規実装
- cron 式変換ユーティリティ（cronConverter / cronParser / cronHumanizer）と共通バリデーション（scheduleConfigValidator）を新規実装
- `ScheduleDialog` と `ConversationRoundStep` で共通バリデーションを再利用し、issue #2000 の `cronExpression` / `timezone` 検証不足を解消
- 既存バックエンド（TASK-9G: ScheduleStore / SkillScheduler / IPC 5チャンネル）は変更なし

## 変更ファイル

### 新規追加

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`
- `apps/desktop/src/renderer/components/schedule/FrequencySelector.tsx`
- `apps/desktop/src/renderer/components/schedule/WeekdaySelector.tsx`
- `apps/desktop/src/renderer/components/schedule/TimePickerSection.tsx`
- `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx`
- `apps/desktop/src/renderer/components/schedule/CronPreview.tsx`
- `apps/desktop/src/renderer/utils/cronConverter.ts`
- `apps/desktop/src/renderer/utils/cronParser.ts`
- `apps/desktop/src/renderer/utils/cronHumanizer.ts`
- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`

### 更新

- `docs/00-requirements/16-ui-ux-guidelines.md`（スケジュールUIセクション追記）
- `docs/00-requirements/master_system_design.md`（実装状況テーブル更新）
- `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

## Test plan

- [ ] 単体テスト: cronConverter / cronParser / cronHumanizer の全パターン PASS
- [ ] 単体テスト: scheduleConfigValidator の cron/timezone 判定 PASS
- [ ] コンポーネントテスト: user-event によるインタラクションテスト PASS
- [ ] コンポーネントテスト: ConversationRoundStep の共通バリデーション PASS
- [ ] 統合テスト: IPC モックを使ったスケジュール保存フロー PASS
- [ ] 手動テスト: シナリオ 1〜9 全件 PASS（manual-test-result.md 参照）
- [ ] アクセシビリティ: キーボードナビゲーション PASS
- [ ] レスポンシブ: 800px 幅での表示確認済み

## スクリーンショット

手動テスト Phase（Phase 11）で取得したスクリーンショットを添付する。
詳細は `screenshot-plan.json` および `screenshots/` ディレクトリを参照。
`ss-001` 〜 `ss-010` の取得結果を含めること。

## 関連 Issue

Closes #2000
```

## コミット方針

PR 作成前に以下の手順でコミットを整理すること。

### 必須コマンド（`--no-verify` は絶対禁止）

```bash
# 品質チェック（必須）
pnpm lint
pnpm typecheck

# ステージング
git add <変更ファイルを個別に指定>

# コミット
git commit -m "feat(ui): スケジュール設定ビジュアルピッカーUI実装（TASK-UI-SCHEDULE-VISUAL-PICKER-001）"
```

### 禁止事項

```bash
# 絶対禁止
git commit --no-verify
git push --force
git commit -n
```

pre-commit フック（lint-staged）が失敗した場合は、フックをスキップせず問題を修正してから再コミットすること。

### ブランチ作成とプッシュ

```bash
# ブランチ作成（ユーザー承認後のみ実行）
git checkout -b feat/visual-cron-picker-ui

# プッシュ（ユーザー承認後のみ実行）
git push -u origin feat/visual-cron-picker-ui
```

### PR 作成コマンド（ユーザー承認後のみ実行）

```bash
gh pr create \
  --title "feat(ui): スケジュール設定ビジュアルピッカーUI実装（TASK-UI-SCHEDULE-VISUAL-PICKER-001）" \
  --body "$(cat <<'EOF'
## Summary
...（上記テンプレートの内容）
EOF
)"
```

## 多角的チェック観点

- **差分の最小化**: 既存 TASK-9G ファイルへの不意な変更がないか
- **コミット粒度**: 1 PR に含める変更が単一の機能（VisualCronPicker）のみか
- **PR 本文の完全性**: スクリーンショット・テスト計画・関連 Issue が記載されているか
- **CI 通過見込み**: lint / typecheck / test が全件 PASS していることを確認してから PR 作成
- **レビュアー指定**: チームの慣例に従いレビュアーを指定する

## 成果物テーブル

| 成果物 | 説明                                           | 必須 |
| ------ | ---------------------------------------------- | ---- |
| PR URL | `gh pr create` 後に発行される GitHub PR の URL | 必須 |

## 完了条件チェックリスト

- [ ] PR 作成前チェックリストの全項目が PASS している
- [ ] ユーザーから PR 作成の明示的な承認を得た
- [ ] ブランチが `feat/visual-cron-picker-ui` で作成されている
- [ ] `git push` が成功している
- [ ] `gh pr create` が成功し PR URL が発行されている
- [ ] PR 本文にスクリーンショット・テスト計画・`Closes #2000` が含まれている
- [ ] CI（GitHub Actions）が起動していることを確認した

## このPhaseはユーザー指示待ち

**PR 作成・push の実行はユーザーが明示的に「PR を作成してください」と指示するまで行わないこと。**

準備が整った場合は以下のメッセージをユーザーに提示し、承認を待つ:

> PR 作成前チェックリストが全件 PASS しました。
> `feat/visual-cron-picker-ui` ブランチを push して PR を作成してよいですか？
