# Phase 13: PR作成 — UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001

## メタ情報

| 項目               | 値                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001                                                     |
| Phase              | 13（PR作成）                                                                                  |
| 機能名             | ut-imp-aiworkflow-spec-reference-sync-001                                                     |
| 作成日             | 2026-02-25                                                                                    |
| 前提Phase          | phase-12-documentation.md                                                                     |
| 目的               | 変更をコミットし、ユーザーの明示的許可を得てからPRを作成する。                                |
| 成果物ディレクトリ | docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-13/ |

## 目的

変更をコミットし、ユーザーの明示的許可を得てからPRを作成する。本タスクは仕様書修正のみ（コード変更なし）のため、ビルド検証やテスト実行は不要。ドキュメントのみの変更として扱う。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。
- **実行ガード**: コミットとPR作成はユーザーの明示的許可を得てから実行する。

### Task 13-1: 変更一覧確定

- `git diff --stat` で変更ファイル一覧を取得する
- 変更ファイルが全て `docs/` 配下または `.claude/skills/` 配下であることを確認する
- `apps/` や `packages/` 配下のファイルが含まれていないことを確認する

### Task 13-2: ユーザー確認依頼

- 変更サマリーをユーザーに提示する
- ユーザーにローカル動作確認を依頼する（検証コマンド3種の実行結果確認）
- PR作成の明示的許可を取得する

### Task 13-3: PR作成実行

- ユーザー許可取得後に `/ai:diff-to-pr` を実行する
- PR本文に以下を含める:
  - Summary（1-3箇条書き）: 同期ガード強化の変更概要
  - Test Plan: 検証コマンド3種の実行結果
  - 本タスクは仕様書修正のみでコード変更なしであることの明記
- GitHub Issue #903 との紐付けを行う

### Task 13-4: 完了記録

- artifacts.json の Phase 13 ステータスを `completed` へ更新する
- CI通過を確認する（ドキュメントのみの変更のためテスト自動スキップが期待される）
- タスクディレクトリを `docs/30-workflows/completed-tasks/` に移動する準備をする（PRマージ後に実行）

## SubAgent分担

| SubAgent   | 担当                            |
| ---------- | ------------------------------- |
| SubAgent-D | Task 13-1 〜 13-4（統合・実行） |

## 参照資料

### システム仕様（aiworkflow-requirements + task-specification-creator）

| 参照資料                  | パス                                                                           | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| リソースマップ            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | 必要仕様の探索起点           |
| トピックマップ            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | セクション単位の参照位置特定 |
| タスクワークフロー        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 未タスク参照同期ルール       |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 同種タスク失敗例と予防策     |
| パターン集                | `.claude/skills/aiworkflow-requirements/references/patterns.md`                | Phase 12漏れ再発防止パターン |
| 品質基準                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質ゲートとテスト要件       |
| 仕様更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A/1-B/1-C/Step 2 要件 |
| final-review-result       | `outputs/phase-10/final-review-result.md`                                      | Phase 10 成果物              |
| manual-test-result        | `outputs/phase-11/manual-test-result.md`                                       | Phase 11 成果物              |
| documentation-changelog   | `outputs/phase-12/documentation-changelog.md`                                  | Phase 12 成果物              |
| implementation-guide      | `outputs/phase-12/implementation-guide.md`                                     | Phase 12 成果物              |
| skill-feedback-report     | `outputs/phase-12/skill-feedback-report.md`                                    | Phase 12 成果物              |
| spec-update-summary       | `outputs/phase-12/spec-update-summary.md`                                      | Phase 12 成果物              |
| unassigned-task-detection | `outputs/phase-12/unassigned-task-detection.md`                                | Phase 12 成果物              |

### aiworkflow-requirements 抽出ログ（Progressive Disclosure）

1. `indexes/resource-map.md` で PR作成Phase に必要なガイドライン系仕様を特定。
2. `indexes/topic-map.md` で `task-workflow.md` / `lessons-learned.md` / `patterns.md` の参照位置を特定。
3. PR本文に反映すべき根拠（再発防止ルール・検証コマンド・教訓）を抽出。

### aiworkflow-requirements 抽出完全性チェック

| カテゴリ                   | 参照仕様                                                                                               | 判定   | PR反映先                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------------------ |
| タスク運用ルール           | `references/task-workflow.md`                                                                          | 必須   | PR概要, チェックリスト         |
| 教訓・再発防止             | `references/lessons-learned.md`, `references/patterns.md`                                              | 必須   | PR本文の再発防止セクション     |
| 品質ゲート                 | `references/quality-requirements.md`                                                                   | 必須   | Test Plan, 検証結果            |
| 探索インデックス           | `indexes/resource-map.md`, `indexes/topic-map.md`                                                      | 必須   | 参照資料, 抽出ログ             |
| 仕様作成規約               | `references/spec-guidelines.md`                                                                        | 必須   | PR本文の仕様差分記述           |
| API/UI/DB/セキュリティ個別 | `references/api-*.md`, `references/ui-ux-*.md`, `references/database-*.md`, `references/security-*.md` | 非該当 | コード変更なし（仕様書タスク） |

### タスク固有参照

| 参照資料               | パス                                                                             | 内容                   |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| Phase 12成果物         | phase-12-documentation.md                                                        | 更新履歴と未タスク検出 |
| Phase 11成果物         | phase-11-manual-test.md                                                          | 手動テスト検証結果     |
| Phase 10成果物         | phase-10-final-review.md                                                         | 最終判定結果           |
| Phase 9成果物          | phase-9-quality-assurance.md                                                     | 品質検証結果           |
| Phase 8成果物          | phase-8-refactoring.md                                                           | リファクタ結果         |
| Phase 7成果物          | phase-7-coverage-check.md                                                        | ゲート判定結果         |
| Phase 6成果物          | phase-6-test-expansion.md                                                        | 検証拡充結果           |
| Phase 5成果物          | phase-5-implementation.md                                                        | 仕様書更新手順         |
| Phase 2成果物          | phase-2-design.md                                                                | 設計基準               |
| Phase 1成果物          | phase-1-requirements.md                                                          | 要件定義               |
| 未タスク指示書（原本） | docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md | 元の未タスク指示書     |
| 完了タスク（発見元）   | docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md          | 教訓の発見元タスク     |

## 統合テスト連携

- Phase 12 の documentation-changelog.md を PR 本文に反映する
- Phase 11 の manual-test-result.md を Test Plan に反映する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                 | 仕様参照先                                       |
| ------------------ | ------------------------ | ------------------------------------------------ |
| セキュリティ       | 非該当（コード変更なし） | aiworkflow-requirements: security-\*.md          |
| UI/UX              | 非該当（仕様書タスク）   | aiworkflow-requirements: ui-ux-\*.md             |
| アーキテクチャ     | 非該当（コード変更なし） | aiworkflow-requirements: architecture-\*.md      |
| API設計            | 非該当（コード変更なし） | aiworkflow-requirements: api-\*.md               |
| データ整合性       | 非該当（DB変更なし）     | aiworkflow-requirements: database-\*.md          |
| エラーハンドリング | 非該当（コード変更なし） | aiworkflow-requirements: error-handling.md       |
| パフォーマンス     | 非該当（コード変更なし） | aiworkflow-requirements: quality-requirements.md |
| アクセシビリティ   | 非該当（UI実装なし）     | aiworkflow-requirements: ui-ux-\*.md             |
| テスタビリティ     | 非該当（PR作成Phase）    | aiworkflow-requirements: quality-requirements.md |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                 | 仕様参照先 |
| -------------------------- | ------------------------ | ---------- |
| フロントエンド（Renderer） | 非該当（コード変更なし） | -          |
| バックエンド（Main）       | 非該当（コード変更なし） | -          |
| IPC通信                    | 非該当（コード変更なし） | -          |
| Preload/セキュリティ       | 非該当（コード変更なし） | -          |
| ローカルストレージ         | 非該当（DB変更なし）     | -          |

## 実行手順

### Step 1: 変更一覧確定（Task 13-1）

1. `git diff --stat` を実行し、変更ファイル一覧を取得する
2. 変更ファイルが全て以下のいずれかに該当することを確認する:
   - `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/` 配下
   - `.claude/skills/aiworkflow-requirements/` 配下
   - `.claude/skills/task-specification-creator/` 配下
3. `apps/` や `packages/` 配下のファイルが含まれていないことを確認する
4. 変更ファイル一覧を `outputs/phase-13/pr-info.md` に記録する

### Step 2: ユーザー確認依頼（Task 13-2）

1. 変更サマリーをユーザーに提示する
2. 以下の検証コマンド実行をユーザーに依頼する:
   - `node scripts/verify-unassigned-links.js` → `ALL_LINKS_EXIST`
   - `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` / `node .claude/skills/task-specification-creator/scripts/generate-index.js` → topic-map.md 更新成功
   - `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements` / `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator` → `Skill is valid!`
3. PR作成の明示的許可を取得する
4. **実行ガード**: 許可が得られるまで Step 3 に進まない

### Step 3: PR作成実行（Task 13-3）

1. ユーザーの明示的許可を確認する
2. `/ai:diff-to-pr` を実行する
3. PR本文に以下を含める:
   - `## Summary` — 同期ガード強化の変更概要（1-3箇条書き）
   - `## Test Plan` — 検証コマンド3種の実行結果
   - 「本タスクは仕様書修正のみ。`apps/`/`packages/` 配下のコード変更なし」を明記
4. GitHub Issue `#903` を PR に紐付ける（`Closes #903` または `Refs #903`）
5. PR URL を `outputs/phase-13/pr-info.md` に記録する

### Step 4: 完了記録（Task 13-4）

1. artifacts.json の Phase 13 ステータスを `completed` へ更新する
2. CI 通過を確認する（ドキュメントのみの変更のためテスト自動スキップが期待される）
3. PRマージ後に以下を実行する:
   - タスクディレクトリを `docs/30-workflows/completed-tasks/` に移動する
   - index.md のステータスを `completed` へ更新する

## 成果物

| 成果物 | パス                        | 説明                         |
| ------ | --------------------------- | ---------------------------- |
| PR情報 | outputs/phase-13/pr-info.md | 変更一覧・PR URL・CI結果記録 |

## 完了条件

- [ ] 変更ファイル一覧が確定し、`apps/` / `packages/` 配下のファイルが含まれていないことが確認されている
- [ ] ユーザーの明示的許可が取得されている
- [ ] PR が作成され、GitHub Issue #903 に紐付けられている
- [ ] PR 本文に Summary / Test Plan / 「仕様書修正のみ」の明記が含まれている
- [ ] artifacts.json の Phase 13 ステータスが `completed` へ更新されている
- [ ] 成果物1件（pr-info.md）が生成されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成して管理する。

1. 参照資料確認
2. 実行タスク実施（Task 13-1 〜 13-4）
3. 成果物作成
4. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で完了状態を明記している

## 次Phase

ワークフロー完了。ユーザー許可前はコミットとPR作成を実行しない。
