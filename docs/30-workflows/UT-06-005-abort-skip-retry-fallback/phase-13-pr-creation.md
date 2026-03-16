# Phase 13: 完了・PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-06-005                           |
| Phase      | 13                                  |
| Phase名    | 完了・PR作成                        |
| 機能名     | UT-06-005-abort-skip-retry-fallback |
| カテゴリ   | 機能実装                            |
| ステータス | not_started                         |
| 作成日     | 2026-03-16                          |
| 前提Phase  | Phase 12（ドキュメント完了）        |
| 後続Phase  | なし（最終Phase）                   |

## 目的

全 Phase の成果物を最終確認し、ユーザーの明示的な許可を得てから Pull Request を作成する。コードとドキュメントの整合性が保たれた状態で、マージ可能な PR を準備する。

## Blocked 状態【重要】

**ユーザーの明示承認がない限り、本 Phase は blocked のままとする。**

### ルール

1. **user の明示承認がない限り blocked** のままにする
2. **ローカル確認を省略しない** — ユーザーにローカル動作確認を必ず依頼する
3. **commit / PR を自動で作らない** — ユーザーの許可を得てから実行する

### 最低限の記録

| 記録項目                | 内容                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| なぜ blocked か         | PR 作成にはユーザーの明示的な許可が必要（自動作成禁止）          |
| user approval の有無    | （Phase 実行時に記録）                                           |
| Phase 12 までの完了根拠 | artifacts.json の Phase 1-12 全ステータスが completed であること |

## 実行タスク

- タスク1: ユーザーへのローカル動作確認依頼
- タスク2: 成果物の最終確認と変更サマリー提示
- タスク3: PR 作成（ユーザー許可後）
- タスク4: CI 確認
- タスク5: タスク完了処理

### タスク1: ユーザーへのローカル動作確認依頼

**目的**: ユーザーにローカル環境での動作確認を依頼する

**手順**:

1. ユーザーに以下の確認を依頼する:
   - abort/skip/retry/timeout フォールバックの動作確認
   - 既存スキル実行フローのリグレッション確認
2. 確認用コマンドを提示する:

   ```bash
   # フォールバック関連テスト
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*permission*.test.ts
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*fallback*.test.ts

   # 全テストスイート
   cd apps/desktop && pnpm vitest run
   ```

3. ユーザーからの確認結果を待つ

### タスク2: 成果物の最終確認と変更サマリー提示

**目的**: 全 Phase の成果物が揃っていること、受入基準が全て満たされていることを確認し、変更サマリーを提示する

**手順**:

1. `artifacts.json` を確認し、全 Phase のステータスが完了であることを確認する
2. 受入基準の最終チェックを実施する
3. Phase 12 の完了条件が全て満たされていることを再確認する:
   - [ ] LOGS.md 2ファイル更新済み（P1/P25 対策）
   - [ ] SKILL.md 2ファイル更新済み（P29 対策）
   - [ ] topic-map.md 再生成済み（P2/P27 対策）
   - [ ] `unassigned-task-detection.md` 作成済み
   - [ ] `skill-feedback-report.md` 作成済み
   - [ ] documentation-changelog の全 Step 完了結果が記録済み
4. 変更サマリーをユーザーに提示し、PR 作成の許可を確認する:

   ```
   ## 変更サマリー
   - SkillExecutor に Permission 拒否時の abort/skip/retry/timeout フォールバック実装
   - PermissionResolver にタイムアウト機構を追加
   - フォールバック関連のテストを追加
   - システム仕様書を更新

   PR を作成してよろしいですか?
   ```

### タスク3: PR 作成（ユーザー許可後）

**目的**: ユーザーの許可を得た上で Pull Request を作成する

**手順**:

1. `/ai:diff-to-pr` を実行する（ユーザー許可後のみ）
2. PR が自動作成されない場合は手動で作成する:

   ```bash
   gh pr create \
     --title "feat(skill): Permission拒否時のabort/skip/retry/timeoutフォールバック実装" \
     --body "$(cat <<'EOF'
   ## Summary
   - SkillExecutor に Permission 拒否時の abort/skip/retry/timeout フォールバックフローを実装
   - retry は最大3回、timeout は5分で abort にフォールバック
   - skip オプションにより拒否されたツール呼び出しをスキップして後続処理を継続可能

   ## Test Plan
   - [ ] Permission 拒否→abort→実行停止を確認
   - [ ] Permission 拒否(skip=true)→後続継続を確認
   - [ ] Permission 拒否→3回retry→abortを確認
   - [ ] Permission 応答なし→5分timeout→abortを確認
   - [ ] 正常Permission承認→スキル実行完了を確認（リグレッション）
   - [ ] 全テストスイートが PASS

   **Task ID**: UT-06-005
   **Closes**: #1250
   EOF
   )"
   ```

3. PR タイトルが70文字以内であることを確認する
4. PR 本文に Summary（1-3 箇条書き）+ Test Plan + 関連 Issue(#1250) が含まれていることを確認する
5. PR URL を記録する

### タスク4: CI 確認

**目的**: CI パイプラインが全て PASS することを確認する

**手順**:

1. PR 作成後に CI の実行状況を確認する
2. CI が失敗した場合は原因を調査し、修正する
3. 全 CI チェックが PASS したことを確認する

### タスク5: タスク完了処理

**目的**: タスクの成果物を整理し、完了状態にする

**手順**:

1. タスクディレクトリを完了タスクフォルダに移動する:
   ```bash
   mv docs/30-workflows/UT-06-005-abort-skip-retry-fallback/ docs/30-workflows/completed-tasks/UT-06-005-abort-skip-retry-fallback/
   ```
2. PR 情報を記録する:
   - PR URL
   - PR 番号
   - マージ先ブランチ

## 参照資料

| 参照資料         | パス                                                                      | 説明               |
| ---------------- | ------------------------------------------------------------------------- | ------------------ |
| Phase 12 成果物  | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/` | ドキュメント成果物 |
| Phase 11 成果物  | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-11/` | 手動テスト結果     |
| Phase 1 受入基準 | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-1/`  | 受入基準定義       |
| artifacts.json   | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/artifacts.json`    | 全Phase成果物管理  |
| GitHub Issue     | [#1250](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1250)  | タスク起票Issue    |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                         | 内容                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                | コミット前チェック手順                                             |
| 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                       | 教訓追加の最終確認                                                 |
| エラーハンドリング（詳細） | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| Agent SDK Executor（詳細） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver仕様、DEFAULT_TIMEOUT_MS=300000                  |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### ステップ2: 変更サマリーの提示と許可確認

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

**PR本文セクション連携ルール（必須）**:

- `/ai:diff-to-pr` の Phase 3.6 で、staged差分から `TARGET_WORKFLOW_DIR` を1件特定する
- Phase 11/12成果物パス（`implementation-guide.md` / `screenshots/`）は `TARGET_WORKFLOW_DIR` 配下のみ参照する
- PR本文 `## その他` に、Phase 12 実装ガイド反映元パスと要点（Part 1/Part 2）を必ず記載する
- `implementation-guide.md` の全文を PRコメントとして必ず投稿し、`## 実装ガイド（全文）` 見出しと Part 1/Part 2 を含むことを確認する
- UI/UX変更がない場合は PR本文 `## スクリーンショット` セクションを削除する

### ステップ4: 実行結果の確認

PRが作成されていること、CIが通過していること。

### ステップ5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物           | パス                                                                                        | 必須 | 説明             |
| ---------------- | ------------------------------------------------------------------------------------------- | ---- | ---------------- |
| PR 情報          | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-13/pr-info.md`         | 必須 | PR URL等         |
| 最終確認チェック | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-13/final-checklist.md` | 必須 | 最終確認チェック |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼済み
- [ ] 受入基準が全て満たされていることを確認済み
- [ ] Phase 12 の完了条件が全て満たされていることを再確認済み
- [ ] ユーザーから PR 作成の許可を取得済み
- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] 全テストスイートが PASS
- [ ] コミットに `--no-verify` を使用していないこと
- [ ] PR タイトルが70文字以内であること
- [ ] PR 本文に Summary + Test Plan + 関連Issue(#1250) が含まれていること
- [ ] PR URL が記録されていること
- [ ] CI が全て PASS していること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/UT-06-005-abort-skip-retry-fallback/ docs/30-workflows/completed-tasks/UT-06-005-abort-skip-retry-fallback/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep UT-06-005

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): UT-06-005-abort-skip-retry-fallbackをcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| #   | サブタスク                   | ステータス  |
| --- | ---------------------------- | ----------- |
| 1   | ローカル動作確認依頼         | not_started |
| 2   | 成果物最終確認・サマリー提示 | not_started |
| 3   | PR作成（ユーザー許可後）     | not_started |
| 4   | CI確認                       | not_started |
| 5   | タスク完了処理               | not_started |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 13
```

## 次のPhase

なし（最終 Phase）。PR がマージされたらタスク完了。
