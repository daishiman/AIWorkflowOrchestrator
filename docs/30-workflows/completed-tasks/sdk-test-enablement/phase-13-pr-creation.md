# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 13                                           |
| Phase名    | PR作成                                       |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT            |
| 機能名     | sdk-test-enablement                          |
| 前提Phase  | Phase 12 (ドキュメント更新)                  |
| 後続Phase  | -（完了）                                    |
| ステータス | 未実施                                       |
| 作成日     | 2026-02-13                                   |
| 関連Issue  | #641                                         |
| 前提タスク | TASK-9B-I-SDK-FORMAL-INTEGRATION（完了済み） |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得た上でPRを作成する。CI確認後、タスクを完了状態に遷移させる。

## 背景

全Phaseが完了した状態で、変更を本番ブランチにマージするためのPRを作成する。PR作成はユーザーの明示的な許可が必要である。

---

## 実行タスク

- 事前確認: ローカル動作確認と変更サマリー提示を実施する
- 許可取得: ユーザーの明示的許可を得るまでPR作成・pushを行わない
- PR実施: 許可後にPR作成しCI結果を確認する
- 完了処理: タスクディレクトリ移動と `artifacts.json` 更新を完了する

---

## 使用スキル

> このPhaseでは `/ai:diff-to-pr` スキルを使用してPR作成を行います。

### diff-to-pr スキルの使用

```bash
# diff-to-pr スキルを呼び出し
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

---

## 参照資料

| 参照資料             | パス                                                            | 内容                   |
| -------------------- | --------------------------------------------------------------- | ---------------------- |
| テスト対象1          | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | 変更対象テストファイル |
| テスト対象2          | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | 変更対象テストファイル |
| テスト対象3          | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | 変更対象テストファイル |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                      | 変更内容のドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`                   | 更新記録               |
| 全Phase成果物        | `outputs/phase-*/`                                              | 全成果物               |

- 依存Phase成果物: `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-7-coverage-check.md`, `phase-8-refactoring.md`, `phase-9-quality-assurance.md`, `phase-10-final-review.md`, `phase-11-manual-test.md`, `phase-12-documentation.md`

---

## 成果物

| 成果物 | パス                          | 内容                       |
| ------ | ----------------------------- | -------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果・マージ状態 |

---

## 実行手順

### Step 1: ローカル動作確認依頼

ユーザーに以下の最終確認を依頼する:

```bash
# テスト実行
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/main/slide/__tests__/skill-executor.test.ts \
  apps/desktop/src/main/slide/__tests__/agent-client.test.ts \
  apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

### Step 2: 変更サマリー提示

ユーザーに以下の変更サマリーを提示する:

#### 変更概要

| 項目           | 内容                      |
| -------------- | ------------------------- |
| 変更ファイル数 | 3件（テストファイルのみ） |
| TODO除去数     | 17箇所                    |
| テスト有効化数 | 17箇所                    |

#### 変更ファイル一覧

| ファイル                                                        | 変更箇所数 | 変更内容                                                                 |
| --------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | 5箇所      | スキル名マッピング、projectPath検証、タイムアウト、エラーハンドリング2件 |
| `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | 9箇所      | 認証3件、リクエスト設定3件、HTTPエラー2件、APIエラー1件                  |
| `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | 3箇所      | 無効APIキー、SDK障害、パラメータ検証                                     |

### Step 3: ユーザー許可確認

> **重要**: PR作成はユーザーの明示的な許可が必要です。
> 許可を得るまでPR作成・pushは行わないこと。

ユーザーに以下を確認する:

- 変更内容に問題がないか
- PR作成を進めてよいか

### Step 4: `/ai:diff-to-pr` 実行

ユーザーの許可を得た後、`/ai:diff-to-pr` スキルを使用してPRを作成する。

#### PR情報

| 項目           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| ブランチ名     | `fix/task-fix-11-1-sdk-test-enablement`                  |
| PRタイトル     | `fix(test): SDK統合テスト17箇所の有効化 (TASK-FIX-11-1)` |
| ベースブランチ | `main`                                                   |
| 関連Issue      | #641                                                     |

#### PR本文テンプレート

```markdown
## Summary

- SDK正式統合後に無効化されていた17箇所のテストを有効化
- TODOコメント除去とSDKモックによるテスト実装
- 認証(401)・サーバーエラー(500)・タイムアウト(30s)のハンドリング検証を追加

## Test plan

- [ ] 対象3ファイルの全テストPASS
- [ ] `grep -rn "TODO.*SDK"` で0件確認
- [ ] `pnpm --filter @repo/desktop test` で全テストPASS
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS

Closes #641
```

### Step 5: CI確認

PR作成後、CIの結果を確認する:

- [ ] GitHub Actions のCI結果がすべてPASS
- [ ] TypeScript型チェックがPASS
- [ ] テストスイートがPASS
- [ ] ESLintがPASS

---

## PR作成フロー

```
Step 1: ローカル動作確認依頼
    |
Step 2: 変更サマリー提示
    |
Step 3: ユーザー許可確認 ← ★ ここでユーザー許可が必須
    |
Step 4: /ai:diff-to-pr 実行
    |
Step 5: CI確認
    |
タスク完了処理
    |
ワークフロー完了
```

---

## タスク完了処理

CI通過後、以下のタスク完了処理を実行する:

### 1. タスクディレクトリを completed-tasks に移動

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/sdk-test-enablement/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep sdk-test-enablement
```

### 2. 元タスク指示書の確認・削除（該当する場合）

```bash
# 元タスク指示書がある場合は削除
ls docs/30-workflows/unassigned-task/ | grep -i "sdk-test" || echo "元指示書なし"

# 該当する場合
# rm docs/30-workflows/unassigned-task/{{元指示書ファイル名}}
```

### 3. Phase 12で作成した新規未タスク指示書の存在確認

```bash
# Phase 12で作成した新規未タスク指示書は削除しない
ls docs/30-workflows/unassigned-task/ | grep -v "sdk-test"
```

> **注意**: Phase 12 で検出・作成した**新規**未タスク指示書は削除しないでください。

### 4. artifacts.json の更新

```json
{
  "status": "completed",
  "phase": 13,
  "completedAt": "2026-02-13T..."
}
```

### 5. 変更をコミット

```bash
git add docs/30-workflows/
git commit -m "docs(workflows): sdk-test-enablementをcompleted-tasksに移動"
git push
```

---

## 完了条件

- [ ] ユーザーの明示的な許可を得てからPRを作成している
- [ ] PRが作成されている
- [ ] CIが全て通過している
- [ ] タスクディレクトリが `completed-tasks/` に移動済み
- [ ] `artifacts.json` の `status` が `"completed"` へ更新されている
- [ ] （該当時）元タスク指示書が削除済み
- [ ] （該当時）Phase 12で作成した新規未タスク指示書が存在する
- [ ] **本Phase内の全作業を100%完了**

---

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 本タスクでの適用判断                                      | 仕様参照先                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | APIキー・認証情報・エラー表示を扱うため適用               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`, `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                      |
| インターフェース   | SkillExecutor と Agent SDK の接続仕様確認が必要なため適用 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                             |
| エラーハンドリング | timeout/API key not configured/SDK failure を扱うため適用 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                         |
| テスト品質         | TODO有効化・回帰防止・カバレッジ判定が必要なため適用      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| タスク運用         | 未タスク発生時の記録・追跡が必要なため適用                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成して進捗管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごと）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase末端アクションで完了を明記している

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] ユーザーの明示的な許可を得てPRを作成している
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open}}

### タスク完了

- completed-tasks移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}
- 元タスク指示書削除: {{完了/該当なし}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

-
```

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは `docs/30-workflows/completed-tasks/sdk-test-enablement/` に移動されます。
