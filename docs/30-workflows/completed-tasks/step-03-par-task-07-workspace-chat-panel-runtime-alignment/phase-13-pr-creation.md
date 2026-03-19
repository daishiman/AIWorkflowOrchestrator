# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 13                                           |
| Phase名    | PR作成                                       |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 12（ドキュメント）                     |
| 後続Phase  | なし                                         |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 更新日     | 2026-03-17                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。Workspace Chat Panel の streaming / file context / conversation / terminal transcript 同期に関する変更を main ブランチへマージするための PR を準備する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼する
- 変更サマリー提示: 変更内容のサマリーを提示し PR 作成の許可を確認する
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行する
- CI確認: CI が通過したことを確認する
- タスク完了処理: タスクディレクトリを completed-tasks に移動する

## 参照資料

| 参照資料                    | パス                                                                   | 内容                          |
| --------------------------- | ---------------------------------------------------------------------- | ----------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                              | 背景と受入条件を確認する      |
| Phase 2（設計）             | `phase-2-design.md`                                                    | 設計意図を確認する            |
| Phase 5（実装）             | `phase-5-implementation.md`                                            | 変更順序と影響範囲を確認する  |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                            | 回帰拡張の要点を確認する      |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                            | coverage 結果を確認する       |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                               | 最終構造整理の要点を確認する  |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                         | 品質観点の結果を確認する      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                             | release 判断の要点を確認する  |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                              | 手動確認結果を確認する        |
| Phase 12（ドキュメント）    | `phase-12-documentation.md`                                            | spec sync と証跡を確認する    |
| 実装ガイド                  | `outputs/phase-12/implementation-guide.md`                             | PR コメントに投稿する全文     |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | UI 変更点の説明素材を確認する |

## 実行手順

### 0. Blocked 状態の記録【必須 — PR作成前に記録すること】

PR 作成前に以下を `outputs/phase-13/pr-summary-draft.md` に記録し、ユーザー承認まで blocked のままにする。

| 記録項目                | 内容                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| blocked 理由            | ユーザーの明示的な承認が得られていないため PR 作成は blocked               |
| user approval の有無    | 未取得（依頼済み / 未依頼）                                                |
| Phase 12 までの完了根拠 | `outputs/phase-12/phase12-task-spec-compliance-check.md` の全チェック PASS |
| ローカル動作確認の有無  | 未確認 / 確認依頼中 / 確認済み                                             |

**重要**: ユーザーから明示的な許可を得るまで Step 3（`/ai:diff-to-pr`）を実行しないこと。

### 1. ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

- `pnpm install` → `pnpm --filter @repo/desktop dev` で Electron アプリが起動すること
- Workspace Chat Panel で streaming が動作すること
- file context / mention が正常に機能すること
- conversation persistence（保存 → リロード → 復元）が動作すること

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PR を作成してよいかユーザーに確認する。

**サマリーに含める内容**:

- 変更の目的（Workspace Chat Panel の AI runtime 同期）
- 変更ファイル数と主要な変更点
- テスト結果（自動テスト PASS 数 + 手動テスト PASS 数）
- 破壊的変更の有無
- 影響範囲（Workspace Chat Panel / streaming / conversation）

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR 作成を実行する。

```
/ai:diff-to-pr
```

**PR 作成時の自動投稿内容（`/ai:diff-to-pr`）**:

1. **PR 本文**（`.github/pull_request_template.md` 準拠）:
   概要・変更内容・変更タイプ・テスト・関連 Issue・破壊的変更・（UI/UX 変更時のみ）スクリーンショット・チェックリスト・その他
2. **PR コメント 1**: 実装の詳細・レビュー注意点・テスト方法・参考資料
3. **PR コメント 2**（Phase 12 成果物あり時）: `implementation-guide.md` の全文
4. **PR コメント 3**（Phase 11 スクリーンショットあり時）: スクリーンショットギャラリー

### PR 本文セクション連携ルール【必須】

- `/ai:diff-to-pr` の Phase 3.6 で、staged 差分から `TARGET_WORKFLOW_DIR` を 1 件特定する
- Phase 11/12 成果物パス（`implementation-guide.md` / `screenshot-coverage.md` / `screenshots/`）は `TARGET_WORKFLOW_DIR` 配下のみ参照する
- PR 本文 `## その他` に、Phase 12 実装ガイド反映元パスと要点（Part 1 / Part 2）を必ず記載する
- `implementation-guide.md` の全文を PR コメントとして必ず投稿し、`## 実装ガイド（全文）` 見出しと Part 1 / Part 2 を含むことを `gh api .../issues/<PR_NUMBER>/comments` で検証する
- UI/UX 変更時は `outputs/phase-11/screenshots/*.png` を検出し、PR 本文 `## スクリーンショット` に画像リンクを自動挿入する
- PR 本文/PR コメントで画像を埋め込む場合は `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対 URL を使う（相対パス直貼りは禁止）
- workflow 候補が複数ある場合は、PR 作成前にユーザーへ対象 workflow を確認する

### 4. 実行結果の確認

- PR が作成されていること
- CI が通過していること
- PR コメントに `implementation-guide.md` 全文が投稿されていること
- UI/UX 変更時はスクリーンショットが PR 本文に含まれていること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLI で手動対応する:

```bash
# 1. ブランチ作成（未作成の場合）
git checkout -b feature/workspace-chat-panel-runtime-alignment

# 2. 全変更をステージング
git add .

# 3. コミット
git commit -m "feat(workspace-chat): AI runtime streaming / file context / conversation 同期"

# 4. プッシュ
git push origin feature/workspace-chat-panel-runtime-alignment

# 5. PR 作成
gh pr create \
  --title "feat(workspace-chat): Workspace Chat Panel AI Runtime Alignment" \
  --body-file outputs/phase-13/pr-body.md
```

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点           | 適用判断                                   | 仕様参照先                                   |
| -------------- | ------------------------------------------ | -------------------------------------------- |
| UI/UX          | スクリーンショットの PR 本文挿入を確認する | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ | 変更影響範囲の PR 本文記載を確認する       | `aiworkflow-requirements: architecture-*.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

📖 詳細: `references/quality-standards.md` セクション8

## 成果物

| 成果物            | パス                                   | 必須 | 説明                       |
| ----------------- | -------------------------------------- | ---- | -------------------------- |
| PR 情報           | `outputs/phase-13/pr-info.md`          | 必須 | PR URL・PR 番号を記録する  |
| PR サマリー下書き | `outputs/phase-13/pr-summary-draft.md` | 必須 | レビュー用の要約を整理する |

## 完了条件

- [ ] blocked 状態を `pr-summary-draft.md` の記録テーブルに記入した（Step 0）
- [ ] Phase 12 までの完了根拠（`phase12-task-spec-compliance-check.md` 全チェック PASS）を確認した
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] PR 本文に Summary（1-3 箇条書き）+ Test Plan が含まれている
- [ ] PR コメントに `implementation-guide.md` 全文が投稿されている
- [ ] UI/UX 変更時は PR 本文にスクリーンショットが含まれている
- [ ] CI が通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep workspace-chat-panel-runtime-alignment

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): workspace-chat-panel-runtime-alignment を completed-tasks に移動"
git push
```

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. blocked 状態を記録する（Step 0 の記録テーブルを `pr-summary-draft.md` に作成）
2. ユーザーにローカル動作確認を依頼する
3. 変更サマリーを提示し許可を確認する
4. PR を作成する（`/ai:diff-to-pr` または手動）— **ユーザー承認後のみ実行**
5. CI 通過を確認する
6. タスクディレクトリを completed-tasks に移動する

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（本タスクの最終 Phase）
