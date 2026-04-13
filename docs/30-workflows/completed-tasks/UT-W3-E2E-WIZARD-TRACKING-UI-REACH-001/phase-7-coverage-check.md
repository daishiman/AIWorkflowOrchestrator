# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 7                                                        |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| タスク名   | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| 前提Phase  | Phase 6                                                  |
| 後続Phase  | Phase 8                                                  |
| 作成日     | 2026-04-12                                               |
| ステータス | 完了                                                     |

## 目的

Phase 5・6 で実装した E2E テストが AC-1〜AC-9 を全て充足していることをトレーサビリティ表で確認する。
Playwright トレースレポートを使用して各テストケースのスクリーンショットを取得し、
UI 到達の証跡を記録する。

**カバレッジ対象の明示**:
本 Phase のカバレッジ対象は **変更した E2E テストファイルのみ** とする。

- `apps/desktop/e2e/skill-wizard-tracking.spec.ts`
- `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`
- `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`

既存 E2E スペック（`ipc-skill-import.spec.ts` 等）は対象外。

## カバレッジ対象

E2E テストはコード行カバレッジではなく、**受入条件（AC）の充足率**で網羅性を測定する。

| Concern     | カバレッジ方法                                      | 期待水準            |
| ----------- | --------------------------------------------------- | ------------------- |
| AC 充足     | トレーサビリティ表による全 AC 充足確認              | AC-1〜AC-9 全件充足 |
| UI 到達証跡 | Playwright トレースレポートのスクリーンショット取得 | 全 TC 分取得済み    |

## トレーサビリティ網羅率（AC 充足確認）

| AC番号 | 受入条件                                                                      | 対応 TC  | テストファイル                                       | 充足状態 |
| ------ | ----------------------------------------------------------------------------- | -------- | ---------------------------------------------------- | -------- |
| AC-1   | InfoStep → ConversationRoundStep 遷移の E2E 確認                              | TC-03    | `skill-wizard-tracking.spec.ts`                      | 充足済み |
| AC-2   | 👍 ボタン → `skill_skeleton_quality_feedback(satisfied=true)` 発火確認        | TC-05    | `skill-wizard-tracking.spec.ts`                      | 充足済み |
| AC-3   | 👎 ボタン → `skill_skeleton_quality_feedback(satisfied=false)` 発火確認       | TC-06    | `skill-wizard-tracking.spec.ts`                      | 充足済み |
| AC-4   | execute クリック → `skill_wizard_next_action(execute)` 発火確認               | TC-08    | `skill-wizard-tracking.spec.ts`                      | 充足済み |
| AC-5   | open_editor クリック → `skill_wizard_next_action(open_editor)` 発火確認       | TC-09    | `skill-wizard-tracking.spec.ts`                      | 充足済み |
| AC-6   | create_another クリック → `skill_wizard_next_action(create_another)` 発火確認 | TC-11    | `skill-wizard-tracking.spec.ts`                      | 充足済み |
| AC-7   | 「もう一度作成」後 InfoStep に戻ること確認                                    | TC-12    | `skill-wizard-tracking.spec.ts`                      | 充足済み |
| AC-8   | trackEvent E2E スタブと capture ヘルパーが本番型定義と型整合                  | 静的確認 | `wizard-tracking-stub.ts` / `trackEvent.e2e-stub.ts` | 充足済み |
| AC-9   | CI パイプラインで E2E 自動実行・PR ブロック                                   | CI 設定  | `.github/workflows/ci.yml`                           | 充足済み |

## 実行タスク

### 1. Playwright トレースレポート取得

```bash
# トレース付き E2E 実行（全 TC のスクリーンショット取得）
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E" \
  --trace on \
  --reporter=html

# レポートを開いて各 TC のスクリーンショットを確認
pnpm --filter @repo/desktop exec playwright show-report
```

各テストケース（TC-03/05/06/08/09/11/12）のスクリーンショットを確認し、
UI が正しく到達していることを目視確認する。

### 2. 全 AC 充足確認コマンド

```bash
# AC-1〜AC-7 対応テストの実行
pnpm --filter @repo/desktop test:e2e -- \
  --grep "TC-03|TC-05|TC-06|TC-08|TC-09|TC-11|TC-12" \
  --reporter=list

# TC-03/05/06/08/09/11/12 を含めた全実行
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E" \
  --reporter=list
```

### 3. AC-8 型整合の静的確認

```bash
# wizard-tracking-stub.ts の型チェック
pnpm --filter @repo/desktop tsc --noEmit

# TrackEventEntry 型が SkillWizardEvents と整合しているか確認
grep -n "SkillWizardEvents\|TrackEventEntry" \
  apps/desktop/e2e/helpers/wizard-tracking-stub.ts \
  apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts \
  apps/desktop/src/renderer/utils/trackEvent.ts
```

`wizard-tracking-stub.ts` の `TrackEventEntry` 型は `SkillWizardEvents` のマップ型から導出されるため、
`trackEvent.ts` または `trackEvent.e2e-stub.ts` の型定義が変更された場合にコンパイルエラーで検出できる。

### 4. AC-9 CI パイプライン確認

```bash
# CI ワークフローの e2e-desktop ジョブを確認
grep -A 30 "e2e-desktop:" .github/workflows/ci.yml

# PR ブロックの設定（required status checks）が有効か確認
# GitHub リポジトリの Branch Protection ルールで e2e-desktop が必須になっていること
```

**CI PR ブロック確認項目**:

- `e2e-desktop` ジョブが `.github/workflows/ci.yml` に定義されている
- `needs: [build-shared]` などの依存関係が適切に設定されている
- GitHub Branch Protection で `e2e-desktop` が Required Status Check に含まれている

### 5. 未到達分析

| 未到達シナリオ                                    | 対応方針                                                      |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `trackEvent.e2e-stub.ts` の型が不整合な場合       | AC-8 静的確認を優先し、Phase 4/5 に戻って修正する             |
| Electron アプリ起動が CI で失敗する場合           | `vite.e2e.config.ts` でのブラウザレンダラーモードに切り替える |
| `complete-step` が表示されない場合                | LLM モック・IPC スタブの設定漏れを確認する                    |
| `window.__trackEventCalls` が注入前に呼ばれる場合 | `addInitScript` の実行順序（`page.goto()` 前）を確認する      |

### 6. カバレッジコマンド（確認用まとめ）

```bash
# [1] 全 TC Green 確認（最終）
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E" \
  --reporter=list

# [2] トレース付き実行（スクリーンショット取得）
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E" \
  --trace on

# [3] 型チェック（AC-8 型整合）
pnpm --filter @repo/desktop tsc --noEmit

# [4] CI シミュレーション（AC-9 確認）
CI=true pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E"

# [5] 全体回帰（既存 E2E 含む）
pnpm --filter @repo/desktop test:e2e
```

## 参照資料

| 資料名                | パス                                              | 用途                               |
| --------------------- | ------------------------------------------------- | ---------------------------------- |
| 拡張テストケース      | `outputs/phase-6/expanded-test-cases.md`          | TC-03/05/06/08/09/11/12 の設計確認 |
| 回帰テスト結果        | `outputs/phase-6/regression-test-result.md`       | Phase 6 PASS 確認ログ参照          |
| trackEvent E2E スタブ | `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` | AC-8 型整合の確認対象              |
| trackEvent 型定義     | `apps/desktop/src/renderer/utils/trackEvent.ts`   | AC-8 型整合確認                    |
| CI ワークフロー       | `.github/workflows/ci.yml`                        | AC-9 CI 設定確認                   |

## 統合テスト連携

```bash
# 全 AC 充足テストをトレース付きで実行
pnpm --filter @repo/desktop test:e2e -- \
  --grep "スキルウィザード trackEvent E2E" \
  --trace on \
  --reporter=html
```

## 成果物

| 成果物                   | パス                                      | 説明                                            |
| ------------------------ | ----------------------------------------- | ----------------------------------------------- |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`      | AC-1〜AC-9 の充足確認・トレーサビリティ網羅率   |
| トレースレポートサマリー | `outputs/phase-7/trace-report-summary.md` | 各 TC のスクリーンショット取得確認・UI 到達証跡 |
| 未到達分析               | `outputs/phase-7/unreachable-analysis.md` | 未到達シナリオと対応方針の記録                  |
| CI 確認ログ              | `outputs/phase-7/ci-check-log.md`         | AC-9 の CI パイプライン設定確認ログ             |

## 完了条件

- [x] AC-1〜AC-9 の全件充足がトレーサビリティ表で確認済み
- [x] TC-03/05/06/08/09/11/12 の全件 PASS を確認済み
- [x] Playwright トレースレポートで各 TC のスクリーンショット取得済み
- [x] AC-8: `wizard-tracking-stub.ts` と `trackEvent.e2e-stub.ts` の型が `SkillWizardEvents` と整合していることを型チェックで確認済み
- [x] AC-9: `.github/workflows/ci.yml` の `e2e-desktop` ジョブに E2E 実行ステップが追加されていることを確認済み
- [x] 未到達分析が記録されている
- [x] 既存 E2E スペックが全て PASS のまま
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 全 AC 充足確認（トレーサビリティ表の全行を確認）
2. Playwright トレースレポート取得（TC 別スクリーンショット）
3. AC-8 型整合の静的確認（`tsc --noEmit`）
4. AC-9 CI パイプライン確認
5. 未到達分析の記録
6. 全体回帰確認（既存 E2E 含む）
7. 完了条件の判定

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
```

## 次Phase

Phase 8: リファクタリング
