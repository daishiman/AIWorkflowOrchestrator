# Phase 13: 完了・PR 作成

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| Phase     | 13                                       |
| タスクID  | TASK-UI-05B-SKILL-ADVANCED-VIEWS         |
| 機能名    | ツール高度管理ビュー群                   |
| 作成日    | 2026-03-01                               |
| 状態      | **未着手**                               |
| 依存Phase | Phase 12（ドキュメント更新）完了後に実行 |

## 目的

全 Phase（1〜12）の成果物を最終確認し、変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

---

## 参照資料

| 資料名                  | パス                                                                         | 説明                  |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------- |
| Phase 2 設計書          | `phase-2-design.md`                                                          | 設計基準確認          |
| Phase 5 実装サマリー    | `phase-5-implementation.md`                                                  | 実装差分確認          |
| Phase 6 テスト拡充      | `phase-6-test-expansion.md`                                                  | テスト資産確認        |
| Phase 7 カバレッジ      | `phase-7-coverage-check.md`                                                  | カバレッジ証跡確認    |
| Phase 8 リファクタ      | `phase-8-refactoring.md`                                                     | リファクタ影響確認    |
| Phase 9 品質保証        | `phase-9-quality-assurance.md`                                               | 品質ゲート確認        |
| 最終レビュー結果        | `outputs/phase-10/final-review-result.md`                                    | Phase 10 成果物       |
| 手動テスト結果          | `outputs/phase-11/manual-test-result.md`                                     | Phase 11 成果物       |
| ドキュメント更新履歴    | `outputs/phase-12/documentation-changelog.md`                                | Phase 12 成果物       |
| 未タスク検出レポート    | `outputs/phase-12/unassigned-task-detection.md`                              | Phase 12 成果物       |
| 仕様抽出正本            | `spec-extraction-matrix.md`                                                  | aiworkflow 抽出根拠   |
| aiworkflow ワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 完了/未タスク運用確認 |
| aiworkflow セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 最終セキュリティ確認  |

---

## 実行タスク

- 成果物監査: Phase 1〜12 の成果物実体と参照整合を確認する
- 品質再確認: テスト/Lint/Typecheck の最終結果を確認する
- 変更統制: コミット対象と機密情報混入有無を確認する
- ユーザー確認: ローカル動作確認と PR 作成許可を取得する
- PR準備: Summary/Test Plan を整備して PR 生成準備を行う
- 完了処理: CI 完了後に移管手順を実行する

### Task 1: 成果物最終確認

#### 1-1: Phase 成果物存在確認

| Phase | 成果物                     | パス                                            | 存在確認   |
| ----- | -------------------------- | ----------------------------------------------- | ---------- |
| 1     | 要件定義書                 | `outputs/phase-1/requirements-definition.md`    | [ ] 未確認 |
| 1     | 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`        | [ ] 未確認 |
| 1     | スコープ定義               | `outputs/phase-1/scope-definition.md`           | [ ] 未確認 |
| 2     | アーキテクチャ設計         | `outputs/phase-2/architecture-design.md`        | [ ] 未確認 |
| 2     | コンポーネント階層         | `outputs/phase-2/component-hierarchy.md`        | [ ] 未確認 |
| 2     | 状態管理設計               | `outputs/phase-2/state-management-design.md`    | [ ] 未確認 |
| 2     | IPC インターフェース設計   | `outputs/phase-2/ipc-interface-design.md`       | [ ] 未確認 |
| 3     | 設計レビュー結果           | `outputs/phase-3/design-review-result.md`       | [ ] 未確認 |
| 3     | レビューチェックリスト     | `outputs/phase-3/review-checklist.md`           | [ ] 未確認 |
| 4     | テスト仕様書               | `outputs/phase-4/test-specification.md`         | [ ] 未確認 |
| 4     | テストユーティリティ設計書 | `outputs/phase-4/test-utilities-design.md`      | [ ] 未確認 |
| 5     | 実装サマリー               | `outputs/phase-5/implementation-summary.md`     | [ ] 未確認 |
| 6     | テスト拡充レポート         | `outputs/phase-6/test-expansion-report.md`      | [ ] 未確認 |
| 7     | カバレッジレポート         | `outputs/phase-7/coverage-report.md`            | [ ] 未確認 |
| 8     | リファクタリングレポート   | `outputs/phase-8/refactoring-report.md`         | [ ] 未確認 |
| 9     | 品質保証レポート           | `outputs/phase-9/quality-report.md`             | [ ] 未確認 |
| 10    | 最終レビュー結果           | `outputs/phase-10/final-review-result.md`       | [ ] 未確認 |
| 10    | レビューチェックリスト     | `outputs/phase-10/review-checklist.md`          | [ ] 未確認 |
| 10    | 未タスク一覧               | `outputs/phase-10/unassigned-tasks.md`          | [ ] 未確認 |
| 11    | 手動テスト結果             | `outputs/phase-11/manual-test-result.md`        | [ ] 未確認 |
| 11    | 発見課題一覧               | `outputs/phase-11/discovered-issues.md`         | [ ] 未確認 |
| 11    | スクリーンショット証拠     | `outputs/phase-11/screenshots/`                 | [ ] 未確認 |
| 12    | 実装ガイド                 | `outputs/phase-12/implementation-guide.md`      | [ ] 未確認 |
| 12    | コンポーネントドキュメント | `outputs/phase-12/component-documentation.md`   | [ ] 未確認 |
| 12    | 仕様書更新サマリー         | `outputs/phase-12/spec-update-summary.md`       | [ ] 未確認 |
| 12    | ドキュメント更新履歴       | `outputs/phase-12/documentation-changelog.md`   | [ ] 未確認 |
| 12    | 未タスク検出レポート       | `outputs/phase-12/unassigned-task-detection.md` | [ ] 未確認 |
| 12    | スキルフィードバック       | `outputs/phase-12/skill-feedback-report.md`     | [ ] 未確認 |

#### 1-2: artifacts.json 確認

- [ ] `artifacts.json` の全 Phase ステータスが "completed"

#### 1-3: 品質チェック

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/

# ESLint チェック
pnpm lint

# TypeScript 型チェック
pnpm typecheck
```

- [ ] 全テストが PASS
- [ ] ESLint 違反 0 件
- [ ] TypeScript 型エラー 0 件

---

### Task 2: コミット準備

#### 2-1: 変更ファイル確認

```bash
git status
git diff --stat
```

- [ ] 変更ファイルの一覧を確認
- [ ] 機密ファイル（`.env`, `credentials`, API キー）が含まれていないこと
- [ ] テスト対象外のファイルが意図せず変更されていないこと

#### 2-2: 差分規模の確認

- [ ] 変更ファイル数が妥当な範囲（4 ビュー + テスト + ドキュメント）
- [ ] 不要なフォーマット変更やコメント追加が混入していないこと

---

### Task 3: ユーザーにローカル動作確認を依頼【必須】

```
PR作成前に、以下の手順でローカル環境での動作確認をお願いします:

1. pnpm --filter @repo/shared build
2. pnpm --filter @repo/desktop dev
3. スキルセンターを開き、以下の4ビューを順に確認:
   - ChainBuilder: チェーン作成・ステップ追加・実行
   - ScheduleManager: スケジュール作成・Cron設定・ON/OFFトグル
   - DebugPanel: デバッグ開始・コントロール操作・変数ウォッチ
   - AnalyticsDashboard: サマリーカード・チャート・エクスポート
4. ダークモード/ライトモード切替で色が正しく変わることを確認
```

- [ ] ユーザーにローカル動作確認を依頼した
- [ ] ユーザーから確認完了の報告を受けた

---

### Task 4: 変更サマリーの提示と許可確認【必須】

**変更内容サマリー:**

| カテゴリ        | ファイル群                                                            | 変更内容                           |
| --------------- | --------------------------------------------------------------------- | ---------------------------------- |
| ChainBuilder    | `apps/desktop/src/renderer/components/skill/chain-builder/`           | パイプラインビルダー UI 新規実装   |
| ScheduleManager | `apps/desktop/src/renderer/components/skill/schedule-manager/`        | スケジュール管理 UI 新規実装       |
| DebugPanel      | `apps/desktop/src/renderer/components/skill/debug-panel/`             | デバッグパネル UI 新規実装         |
| Analytics       | `apps/desktop/src/renderer/components/skill/analytics-dashboard/`     | 使用分析ダッシュボード UI 新規実装 |
| Hooks           | `apps/desktop/src/renderer/hooks/skill/`                              | カスタム Hooks 8 種新規作成        |
| テスト          | `apps/desktop/src/renderer/components/skill/**/__tests__/`            | コンポーネントテスト群             |
| ドキュメント    | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` | Phase 1〜13 仕様書 + 成果物        |

**影響範囲:**

- スキルセンター配下に 4 つの新規ビューを追加
- 既存コンポーネント（SkillCenterView 等）への影響: ルーティング追加のみ
- バックエンド IPC ハンドラ: TASK-9D/9G/9H/9J で実装済みのものを使用

> ⚠️ **重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

- [ ] 変更サマリーをユーザーに提示した
- [ ] ユーザーから PR 作成の許可を得た

---

### Task 5: PR 作成【ユーザー許可後】

ユーザーの許可を得た後、`/ai:diff-to-pr` を実行する。

**PR 情報:**

| 項目        | 値                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------- |
| ブランチ名  | `feature/task-ui-05b-skill-advanced-views`                                                  |
| PR タイトル | `feat(ui): ツール高度管理ビュー群実装（ChainBuilder/ScheduleManager/DebugPanel/Analytics）` |

**PR 本文テンプレート:**

```markdown
## Summary

- SkillChainBuilder: パイプラインビルダーUI実装（ステップ追加/並替/入力マッピング4種/実行ビジュアル）
- ScheduleManager: スケジュール管理UI実装（CronEditor/プリセット/ON-OFFトグル/実行履歴）
- DebugPanel: デバッグパネルUI実装（セッション制御/コールスタック/変数ウォッチ/ブレークポイント）
- AnalyticsDashboard: 使用分析ダッシュボードUI実装（サマリーカード/トレンドチャート/ランキング/エクスポート）

## Test Plan

- [ ] 全コンポーネントテスト PASS
- [ ] カバレッジ基準充足（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 手動テスト完了（Phase 11 レポート参照）
- [ ] レスポンシブ対応確認（768px ブレークポイント）
- [ ] ダークモード/ライトモード表示確認
- [ ] lucide-react アイコンのみ使用（絵文字なし）
```

```bash
/ai:diff-to-pr feature/task-ui-05b-skill-advanced-views
```

- [ ] PR が作成されている
- [ ] PR 本文に Summary と Test Plan が含まれている

---

### Task 6: CI 確認

- [ ] GitHub Actions の全ジョブが PASS
- [ ] 型チェック PASS
- [ ] Lint PASS
- [ ] テスト PASS

---

## 成果物

| 成果物       | パス                                     | 説明                        |
| ------------ | ---------------------------------------- | --------------------------- |
| 完了サマリー | `outputs/phase-13/completion-summary.md` | 全 Phase 完了状況のサマリー |
| PR 情報      | `outputs/phase-13/pr-info.md`            | PR URL・ブランチ情報        |

---

## 完了条件

- [ ] Phase 1〜12 の全成果物が存在している（Task 1-1 チェック済み）
- [ ] `artifacts.json` の全 Phase が "completed"（Task 1-2 チェック済み）
- [ ] 全テスト PASS・ESLint 0 件・TypeScript エラー 0 件（Task 1-3 チェック済み）
- [ ] 機密ファイルが含まれていないこと（Task 2-1 チェック済み）
- [ ] ユーザーにローカル動作確認を依頼した（Task 3 チェック済み）
- [ ] 変更サマリーを提示し PR 作成の許可を得た（Task 4 チェック済み）
- [ ] PR が作成されている（Task 5 チェック済み）
- [ ] CI が全て PASS（Task 6 チェック済み）
- [ ] タスクディレクトリが `completed-tasks` に移動されている
- [ ] **本 Phase 内の全作業を 100% 完了（PR 作成・CI 確認・移動）**

---

## タスク完了処理【必須】

PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。

### 移動手順

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep skill-advanced-views

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-UI-05B-SKILL-ADVANCED-VIEWS を completed-tasks に移動"
git push
```

---

## 次の Phase

なし（ワークフロー完了）
