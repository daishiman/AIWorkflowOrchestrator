# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成・CI確認               |
| タスクID   | TASK-9I                      |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（マージ準備完了）       |
| ステータス | 未実施                       |
| 作成日     | 2026-02-28                   |
| 機能名     | TASK-9I-skill-docs           |

---

## 目的

`/ai:diff-to-pr` スキルを使用してコミット・PR作成・CI確認を行い、マージ準備を完了する。

## 背景

全ての開発フェーズが完了した後、変更をリモートリポジトリに反映する。
PR作成とCI確認により、マージ前の最終チェックを行う。

---

## 重要な注意事項

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                           | 理由                                     |
| ---------------------------------- | ---------------------------------------- |
| 勝手にPRを作成する                 | レビュー前の変更がリモートに反映される   |
| ユーザー確認なしでスキルを実行する | 意図しないブランチやコミットが作成される |
| ローカル確認をスキップする         | 動作確認されていないコードがPRに含まれる |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認チェック

**目的**: PR作成前に全てのチェックがパスすることを確認する

**実行手順**:

1. shared パッケージをビルドする
2. 型チェックがパスすることを確認する
3. Lintエラーがないことを確認する
4. 全テストがパスすることを確認する

**コマンド**:

```bash
# shared パッケージビルド
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint確認
pnpm --filter @repo/desktop lint

# テスト確認（SkillDocGenerator + skillHandlers docs ハンドラー）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillDocGenerator --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**チェックリスト**:

- [ ] shared ビルドが成功する
- [ ] 型チェックがパスする
- [ ] Lintエラーがない
- [ ] 全テストがパスする

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: ユーザーにローカル動作確認を依頼

**目的**: ユーザーにローカル環境での動作確認を依頼する

PR作成前に、ユーザーに以下の確認を依頼する:

| 確認項目                                 | 確認コマンド/方法                    |
| ---------------------------------------- | ------------------------------------ |
| 全テストが PASS すること                 | `cd apps/desktop && pnpm vitest run` |
| 型チェックが通ること                     | `pnpm typecheck`                     |
| Lint エラーがないこと                    | `pnpm lint`                          |
| skill:docs:\* IPC チャネルが動作すること | DevTools Console で手動確認          |

**重要**: ユーザーの確認完了報告を待ってから次のステップに進む。

---

### タスク3: 変更サマリーの提示と許可確認

**目的**: PR作成の許可をユーザーから取得する

**実行手順**:

1. 変更内容のサマリーを提示する
2. PR作成の許可を求める
3. 許可が得られたら次のタスクへ進む

**提示内容**:

```markdown
## TASK-9I 変更サマリー

### 新規作成ファイル

- `packages/shared/src/types/skill-docs.ts` -- ドキュメント生成型定義（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection）
- `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` -- ドキュメント生成サービス（LLM連携・構造解析）
- テストファイル（SkillDocGenerator.test.ts, skillHandlers docs テスト等）

### 変更ファイル

- `packages/shared/src/types/index.ts` -- skill-docs.ts の re-export 追加
- `apps/desktop/src/main/ipc/skillHandlers.ts` -- registerSkillDocsHandlers / unregisterSkillDocsHandlers 追加
- `apps/desktop/src/preload/channels.ts` -- SKILL*DOCS*\* 4チャネル定数追加
- `apps/desktop/src/preload/skill-api.ts` -- docs 操作4メソッド追加
- `apps/desktop/src/preload/types.ts` -- Preload 型定義追加

### 仕様書更新（Phase 12）

- aiworkflow-requirements 配下の仕様書6ファイル更新（api-ipc-agent.md, security-electron-ipc.md, architecture-overview.md, interfaces-agent-sdk-skill.md, task-workflow.md, arch-electron-services.md）
- LOGS.md x 2、SKILL.md x 2 更新
- topic-map.md 再生成

### ローカルチェック結果

- 型チェック: PASS
- Lint: PASS
- テスト: PASS

PRを作成してよろしいですか？
```

**重要**: ユーザーから明示的な許可（「PR作成してください」「OK」等）を得るまで PR 作成を実行しないこと。

**期待される成果物**:

- ユーザーからの許可（チャット上）

---

### タスク4: `/ai:diff-to-pr` 実行

**目的**: PR作成スキルを実行する

**実行手順**:

1. ユーザーの許可を確認する
2. `/ai:diff-to-pr` スキルを実行する
3. PRが作成されたことを確認する
4. PR URLを記録する

**スキル実行**:

```
/ai:diff-to-pr
```

**フォールバック（`/ai:diff-to-pr` が使えない場合）**:

git/gh CLI で手動対応する:

```bash
# 変更を確認
git status
git diff --stat

# コミット（未コミットの変更がある場合）
git add -A
git commit -m "$(cat <<'EOF'
feat(skill-docs): TASK-9I スキルドキュメント生成機能実装

- SkillDocGenerator サービス追加（LLM連携・構造解析・ドキュメント生成）
- IPC 4チャネル追加（skill:docs:generate/preview/export/templates）
- Preload API 4メソッド追加
- 共有型定義5インターフェース追加（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection）
- P42準拠4層セキュリティ適用（sender検証・3段バリデーション・サービス検証・エラーサニタイズ）

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

# PR 作成
gh pr create \
  --title "feat(skill-docs): TASK-9Iスキルドキュメント生成機能実装" \
  --body "$(cat <<'EOF'
## Summary
- SkillDocGenerator サービスを追加し、スキル構造解析とLLMによるドキュメント自動生成を実装
- IPC 4チャネル（generate/preview/export/templates）を追加
- P42/P44準拠の4層セキュリティ（sender検証・バリデーション・サービス検証・エラーサニタイズ）を適用

## Test plan
- [ ] SkillDocGenerator ユニットテストが全 PASS
- [ ] IPC ハンドラーテストが全 PASS
- [ ] `pnpm typecheck` が通ること
- [ ] `pnpm lint` がエラーなし
- [ ] DevTools Console で skill:docs:* チャネルの動作確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**期待される成果物**:

- `outputs/phase-13/pr-creation-result.md`
- PR URL

---

### タスク5: CI確認・マージ準備完了報告

**目的**: CIがパスしマージ準備が完了したことを確認・報告する

**実行手順**:

1. GitHub上でCIの実行状況を確認する
2. 全CIジョブがパスすることを確認する
3. PRのレビュー準備が整ったことを報告する
4. タスクディレクトリを `completed-tasks/` に移動する

**確認事項**:

| CI項目     | 期待結果 | 実際 |
| ---------- | -------- | ---- |
| ビルド     | PASS     | -    |
| テスト     | PASS     | -    |
| 型チェック | PASS     | -    |
| Lint       | PASS     | -    |

**CI確認コマンド**:

```bash
# PR のチェック状況を確認
gh pr checks

# 失敗した場合は詳細を確認
gh pr checks --watch
```

CI が失敗した場合:

1. 失敗原因を調査する（`gh pr checks --watch`）
2. 修正コミットを追加する
3. CI が再度 PASS するまで待つ

---

### タスク6: タスク完了処理

**目的**: タスクディレクトリを完了フォルダに移動し、artifacts.json を最終更新する

**タスクディレクトリ移動**:

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/TASK-9I-skill-docs/ docs/30-workflows/completed-tasks/TASK-9I-skill-docs/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-9I-skill-docs

# 変更をコミット
git add docs/30-workflows/
git commit -m "$(cat <<'EOF'
docs(workflows): TASK-9I-skill-docs を completed-tasks に移動

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
git push
```

**artifacts.json 更新**:

`artifacts.json` の Phase 13 ステータスを `completed` に更新する:

```bash
# 手動で artifacts.json を編集、または:
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-9I-skill-docs \
  --phase 13 \
  --artifacts "outputs/phase-13/local-check-result.md:ローカルチェック結果,outputs/phase-13/change-summary.md:変更サマリー,outputs/phase-13/pr-creation-result.md:PR作成結果,outputs/phase-13/pr-info.md:PR情報,outputs/phase-13/ci-result.md:CI結果,outputs/phase-13/merge-readiness-report.md:マージ準備報告"
```

スクリプトが存在しない場合は手動で `artifacts.json` を更新する。

---

## 参照資料

| 参照資料               | パス                                                        | 内容                 |
| ---------------------- | ----------------------------------------------------------- | -------------------- |
| ai:diff-to-pr コマンド | `.claude/commands/ai/diff-to-pr.md`                         | PR作成手順           |
| SkillDocGenerator実装  | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | 実装コード           |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`                | 要件定義             |
| Phase 2成果物          | `outputs/phase-2/architecture-design.md`                    | 設計成果物           |
| Phase 5成果物          | `phase-5-implementation.md`                                 | 実装仕様             |
| Phase 6成果物          | `outputs/phase-6/coverage-report.md`                        | テスト拡充           |
| Phase 7成果物          | `outputs/phase-7/coverage-report.md`                        | カバレッジ           |
| Phase 8成果物          | `outputs/phase-8/refactoring-log.md`                        | リファクタ結果       |
| Phase 9成果物          | `outputs/phase-9/quality-gate-result.md`                    | 品質保証結果         |
| Phase 10成果物         | `outputs/phase-10/final-review-result.md`                   | 最終レビュー         |
| Phase 11成果物         | `outputs/phase-11/integration-test-result.md`               | 手動テスト結果       |
| Phase 12成果物         | `outputs/phase-12/documentation-changelog.md`               | ドキュメント更新履歴 |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`                  | 実装ガイド           |
| 仕様書更新サマリー     | `outputs/phase-12/spec-update-summary.md`                   | 仕様書更新内容       |
| タスク概要             | `docs/30-workflows/TASK-9I-skill-docs/index.md`             | TASK-9I メタ情報     |
| Gitルール              | `.claude/rules/07-git-and-tooling.md`                       | Git操作ルール        |

---

## 統合テスト連携

PR 作成前に以下の統合テスト項目が全て PASS していることを確認する:

| テスト項目                       | 確認済み |
| -------------------------------- | -------- |
| SkillDocGenerator ユニットテスト | [ ]      |
| IPC ハンドラーテスト             | [ ]      |
| 型チェック（pnpm typecheck）     | [ ]      |
| Lint（pnpm lint）                | [ ]      |

---

## 多角的チェック観点

| 観点             | チェック内容                                                        |
| ---------------- | ------------------------------------------------------------------- |
| コミット整合     | 全変更がコミットされている（`git status` で未コミットファイルなし） |
| ブランチ整合     | PR のベースブランチが `main` であること                             |
| PR 本文          | Summary（1-3箇条書き）+ Test Plan が含まれていること                |
| CI 結果          | 全チェック（lint, typecheck, test）が PASS していること             |
| ドキュメント整合 | Phase 12 成果物がコミットに含まれていること                         |
| 機密情報         | APIキー・トークン等が含まれていないこと                             |
| 不要ファイル     | ビルド成果物・node_modules 等が含まれていないこと                   |

---

## 成果物

| 成果物           | パス                                         | 内容               |
| ---------------- | -------------------------------------------- | ------------------ |
| ローカルチェック | `outputs/phase-13/local-check-result.md`     | チェック結果       |
| 変更サマリー     | `outputs/phase-13/change-summary.md`         | 変更内容           |
| PR作成結果       | `outputs/phase-13/pr-creation-result.md`     | PR作成コマンド結果 |
| PR情報           | `outputs/phase-13/pr-info.md`                | PR URL等           |
| CI結果           | `outputs/phase-13/ci-result.md`              | CI状況             |
| マージ準備報告   | `outputs/phase-13/merge-readiness-report.md` | 最終報告           |

### pr-info.md テンプレート

```markdown
# PR 情報

| 項目         | 値                   |
| ------------ | -------------------- |
| PR URL       | {{PR_URL}}           |
| ブランチ     | {{BRANCH_NAME}}      |
| 作成日時     | {{CREATED_AT}}       |
| CI 結果      | {{PASS/FAIL}}        |
| レビュー状態 | {{PENDING/APPROVED}} |
```

---

## 完了条件

- [ ] ローカルチェック（ビルド、テスト、型、Lint）が全てパスしている
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが全てパスしている
- [ ] `outputs/phase-13/pr-info.md` に PR 情報が記録されている
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/` に移動されている
- [ ] `artifacts.json` の Phase 13 ステータスが `completed` に更新されている
- [ ] マージ準備完了報告が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] PR URLをユーザーに報告

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（マージ準備完了）

---

## タスク完了

**注意**: マージはユーザーがGitHub UI上で手動で実行してください。

```markdown
## TASK-9I: スキルドキュメント生成機能実装 完了

### 成果物

- SkillDocGenerator.ts（LLM連携・構造解析・ドキュメント自動生成サービス）
- skill-docs.ts（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection 型定義）
- skillHandlers.ts に registerSkillDocsHandlers / unregisterSkillDocsHandlers 追加（4ハンドラー: generate, preview, export, templates）
- Preload API拡張（channels.ts に SKILL*DOCS*\* 4チャネル定数、skill-api.ts に docs 操作4メソッド、types.ts に型追加）
- P42準拠4層セキュリティ適用
- ユニットテスト実装完了
- 実装ガイド作成完了（Part 1: 中学生レベル + Part 2: 技術詳細）

### PR

- URL: {{PR_URL}}
- ステータス: マージ準備完了

### 次のステップ

- GitHub UIでPRをレビュー・マージしてください
```

---

## 次のPhase

なし（ワークフロー完了）
