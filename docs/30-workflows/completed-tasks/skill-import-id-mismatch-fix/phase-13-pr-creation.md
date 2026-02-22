# Phase 13: PR作成

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 13                                        |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001       |
| 機能名   | SkillImportDialog skill.id→skill.name修正 |
| 作成日   | 2026-02-22                                |

## 目的

全Phase（1-12）の成果物が完了していることを確認し、ユーザーの明示的な許可を得た場合のみコミットとPR作成を実施する。

## 実行タスク

- 事前確認: コード変更・テスト・Lint・TypeCheck・artifacts.jsonの全13 Phaseステータスを確認する
- 許可取得: ユーザーにPR作成許可を確認する（自動実行しない）
- PR作業: 許可後にコミット・push・PR作成・CI確認を実施する

## 参照資料

| 資料名                       | パス                                               | 説明            |
| ---------------------------- | -------------------------------------------------- | --------------- |
| Phase 1 要件定義             | `phase-1-requirements.md`                          | 依存Phase       |
| Phase 2 設計                 | `phase-2-design.md`                                | 依存Phase       |
| Phase 3 設計レビュー         | `phase-3-design-review.md`                         | 依存Phase       |
| Phase 4 テスト作成           | `phase-4-test-creation.md`                         | 依存Phase       |
| Phase 5 実装                 | `phase-5-implementation.md`                        | 依存Phase       |
| Phase 6 テスト拡充           | `phase-6-test-expansion.md`                        | 依存Phase       |
| Phase 7 カバレッジ確認       | `phase-7-coverage-check.md`                        | 依存Phase       |
| Phase 8 リファクタリング     | `phase-8-refactoring.md`                           | 依存Phase       |
| Phase 9 品質保証             | `phase-9-quality-assurance.md`                     | 依存Phase       |
| Phase 10 最終レビュー        | `phase-10-final-review.md`                         | 依存Phase       |
| Phase 11 手動テスト          | `phase-11-manual-test.md`                          | 依存Phase       |
| Phase 12 ドキュメント更新    | `phase-12-documentation.md`                        | 依存Phase       |
| Phase 13 PR作成              | `phase-13-pr-creation.md`                          | 本Phase成果物   |
| 手動テスト実行記録           | `outputs/phase-11/manual-test-execution-record.md` | Phase 11 成果物 |
| DevTools確認結果             | `outputs/phase-11/devtools-verification.md`        | Phase 11 成果物 |
| スクリーンショット代替説明   | `outputs/phase-11/screenshots/NOTE.txt`            | Phase 11 成果物 |
| 要件充足レビュー             | `outputs/phase-10/requirements-review.md`          | Phase 10 成果物 |
| 設計準拠レビュー             | `outputs/phase-10/design-review.md`                | Phase 10 成果物 |
| テスト品質レビュー           | `outputs/phase-10/test-quality-review.md`          | Phase 10 成果物 |
| コード品質レビュー           | `outputs/phase-10/code-quality-review.md`          | Phase 10 成果物 |
| セキュリティ・IPCレビュー    | `outputs/phase-10/security-ipc-review.md`          | Phase 10 成果物 |
| 最終判定                     | `outputs/phase-10/final-review-result.md`          | Phase 10 成果物 |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`         | Phase 12 成果物 |
| 変更履歴                     | `outputs/phase-12/documentation-changelog.md`      | Phase 12 成果物 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`       | Phase 12 成果物 |
| 未タスク検出集計             | `outputs/phase-12/unassigned-task-detection.md`    | Phase 12 成果物 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`        | Phase 12 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                        |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill:import チャンネル契約 |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice設計              |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                              | P39, P40, P44, P45          |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 最終確認観点                |
| デプロイ/CI                | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`             | CI確認観点                  |

## 実行手順

### Step 1: 事前確認（成果物チェックリスト）

以下の全項目を確認する。1つでも未完了の場合はPR作成に進まない。

#### コード変更確認

- [ ] `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` が変更されている（`skill.id` → `skill.name`）
- [ ] `apps/desktop/src/renderer/views/AgentView/index.tsx` が変更されている（`handleImport` 引数名修正）
- [ ] `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` が変更されている（テストケース更新）

#### 品質確認

以下のコマンドを `apps/desktop` ディレクトリで実行し、全てPASSすることを確認する:

```bash
# テスト実行（P40対策: apps/desktop ディレクトリから実行する）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx

# Lint チェック
pnpm lint

# TypeCheck
pnpm typecheck
```

- [ ] 関連テスト（SkillImportDialog.test.tsx）が全てPASSしている
- [ ] `pnpm lint` がエラーなく完了している
- [ ] `pnpm typecheck` がエラーなく完了している

#### artifacts.json 確認

- [ ] `docs/30-workflows/skill-import-id-mismatch-fix/artifacts.json` の全13 Phaseが `completed` ステータスである

以下のコマンドで確認する:

```bash
cat docs/30-workflows/skill-import-id-mismatch-fix/artifacts.json | grep -c '"completed"'
# 期待値: 13
```

### Step 2: ユーザーへの確認依頼

以下の情報をユーザーに提示し、PR作成の許可を明示的に得る。**ユーザーの許可なくPR作成・push・コミットを自動実行してはならない。**

提示する情報:

1. **変更サマリー**:
   - SkillImportDialog: `skill.id`（SHA-256ハッシュ先頭16文字）→ `skill.name`（人間可読名）に修正
   - AgentView: `handleImport` の引数名を `skillIds` → `skillNames` に修正
   - テスト: 期待値を `skill.id` → `skill.name` に更新
2. **テスト結果**: 全テストPASS、Lint PASS、TypeCheck PASS
3. **PR情報**:
   - ブランチ: `fix/ut-fix-skill-import-id-mismatch-001`
   - ベースブランチ: `main`
   - PRタイトル: `fix(organisms): SkillImportDialog skill.id→skill.name修正`

### Step 3: PR実施（ユーザー許可後のみ）

ユーザーから明示的な許可を得た場合のみ、以下を実行する。

#### 3-1: コミット

```bash
git add apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx
git add apps/desktop/src/renderer/views/AgentView/index.tsx
git add apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx
git add docs/30-workflows/skill-import-id-mismatch-fix/
```

コミットメッセージ:

```
fix(organisms): SkillImportDialog skill.id→skill.name修正

SkillImportDialogがskill.id（SHA-256ハッシュ先頭16文字）を
skillNameパラメータとしてIPCハンドラに渡していたバグを修正。
skill.name（人間可読名）に変更し、getSkillByName()との
照合が正しく行われるようにした。

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

#### 3-2: Push

```bash
git push -u origin fix/ut-fix-skill-import-id-mismatch-001
```

#### 3-3: PR作成

```bash
gh pr create --title "fix(organisms): SkillImportDialog skill.id→skill.name修正" --body "$(cat <<'EOF'
## Summary
- SkillImportDialogが`skill.id`（SHA-256ハッシュ先頭16文字）を`skillName`として渡していたバグを修正
- `skill.name`（人間可読名）に変更し、IPCハンドラの`getSkillByName()`との照合が正しく行われるようにした
- 関連テスト・AgentViewの引数名を修正

## Test Plan
- [ ] SkillImportDialog.test.tsx の全テストがPASS
- [ ] `pnpm lint` がエラーなし
- [ ] `pnpm typecheck` がエラーなし
- [ ] 手動テスト: スキルインポートダイアログからスキルをインポートできる
- [ ] 手動テスト: DevToolsでskillNameが人間可読名であることを確認
- [ ] 回帰テスト: skill:remove機能が正常動作

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### 3-4: CI確認

PR作成後、以下を確認する:

- [ ] GitHub Actions CI が起動していることを確認する
- [ ] CI の全ジョブがPASSすることを確認する
- [ ] PR ページに CI ステータスが緑色で表示されることを確認する

CI が失敗した場合は、失敗内容を確認し修正する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

1. 参照資料の確認
2. Step 1: 事前確認（成果物チェックリスト）の全項目確認
3. Step 2: ユーザーへの確認依頼（PR情報の提示）
4. Step 3: PR実施（ユーザー許可後のみ）
5. 成果物の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物 | パス                          | 説明                     |
| ------ | ----------------------------- | ------------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、CI結果、変更概要 |

## 完了条件

- [ ] Step 1 の全チェック項目が合格している
- [ ] ユーザーへ確認依頼が実施されている
- [ ] ユーザーの明示的な許可が記録されている
- [ ] 許可後のコミット・push・PR作成が完了している
- [ ] CI結果が確認されている
- [ ] PR URLが `outputs/phase-13/pr-info.md` に記録されている
- [ ] artifacts.json の Phase 13 ステータスが `completed` に更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

なし（ワークフロー完了）
