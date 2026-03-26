# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 13                                            |
| Phase名    | PR作成                                        |
| 前提Phase  | Phase 12                                      |
| 後続Phase  | -（本タスクの最終 Phase）                     |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

TASK-SC-07 の全 Phase（1〜12）が完了した状態で、GitHub Pull Request を作成し、CI/CD の通過を確認する。マージはユーザーが GitHub UI で手動実行するため、本 Phase では PR 作成と CI 確認までを担当する。

## 背景

Phase 12 でドキュメント更新が完了し、実装・テスト・品質保証・手動テスト・ドキュメントが全て揃った状態で PR を作成する。**本 Phase はユーザーの明示的な承認を得た後にのみ実施する。**

---

## 前提条件【必須確認】

**以下の全条件が満たされていることを確認してから本 Phase を開始すること:**

| 前提条件                                         | 確認方法                                      |
| ------------------------------------------------ | --------------------------------------------- |
| Phase 1〜12 が全て完了している                   | 各 Phase の完了条件チェックリストを確認       |
| 型チェック・Lint・全テストが通過している         | Phase 9 の `qa-summary.md` を確認             |
| AC-1〜AC-10 が全て充足されている                 | Phase 10 の `ac-verification.md` を確認       |
| 手動テストが完了し重大な問題がない               | Phase 11 の `manual-test-summary.md` を確認   |
| ドキュメント更新が完了している                   | Phase 12 の全成果物が生成されていることを確認 |
| **ユーザーから PR 作成の明示的な承認を得ている** | ユーザーの「PR 作成してください」等の指示     |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: PR 作成前の最終確認

**目的**: PR 作成前に全ての前提条件が満たされていることを最終確認する

**実行手順**:

1. 作業ブランチが最新の状態であることを確認する:
   ```bash
   git status
   git log --oneline -5
   ```
2. main ブランチとの差分を確認する:
   ```bash
   git diff main --name-only
   ```
3. 変更ファイルが本タスクのスコープ内であることを確認する:
   - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
   - `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`
   - `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`
   - テストファイル（`__tests__/` 配下）
   - Phase 8 でリファクタリングにより変更された共通ファイル（ある場合）
4. スコープ外のファイルが含まれていないことを確認する
5. 確認結果を `outputs/phase-13/pre-pr-check.md` に記録する

**期待される成果物**:

- `outputs/phase-13/pre-pr-check.md`（PR 作成前確認結果）

---

### タスク2: コミットの整理

**目的**: PR に含めるコミットを整理する

**実行手順**:

1. コミット履歴を確認する:
   ```bash
   git log --oneline main..HEAD
   ```
2. コミットメッセージが適切であることを確認する（conventional commits 形式が望ましい）
3. 必要に応じてコミットをまとめる（`git rebase -i main`）
   - ただし、ユーザーの明示指示なしに rebase は実施しない
4. 最終的なコミット構成を `outputs/phase-13/commit-log.md` に記録する

**期待される成果物**:

- `outputs/phase-13/commit-log.md`（コミット一覧）

---

### タスク3: PR 本文の生成

**目的**: PR レビュワーが内容を素早く把握できる PR 本文を作成する

**実行手順**:

1. 以下のテンプレートに従い PR 本文を作成する:

   ````markdown
   ## Summary

   TASK-SC-07: SkillCreateWizard への LLM 生成フロー接続

   SkillCreateWizard の4段階ウィザードフローに、`planSkill` / `executePlan` による LLM 生成ルートを追加します。

   ### 変更内容

   - **DescribeStep**: 「LLM で生成」「テンプレートから作成」のモード選択 UI を追加
   - **SkillCreateWizard**: `planSkill` / `executePlan` ハンドラを追加（Hybrid State Pattern）
   - **GenerateStep**: plan 結果（type, estimatedSteps, guidance）の表示 UI を追加

   ### フロー

   **LLM 生成フロー（新規）**:
   DescribeStep（モード選択・説明入力）→ GenerateStep（planSkill 実行・plan 結果表示・executePlan 実行）→ CompleteStep

   **テンプレートフロー（既存・非破壊）**:
   DescribeStep → ConfigureStep → GenerateStep → CompleteStep

   ### 関連 Issue

   Closes #1588

   ### TASK-SC-06 苦戦箇所の回避

   | 苦戦箇所                       | 回避策                                                                      |
   | ------------------------------ | --------------------------------------------------------------------------- |
   | C-1: executePlan 引数型        | `skillSpec: string`（必須）を Preload API から直接 import                   |
   | C-2: generationProgress 未表示 | import・state・JSX 表示をセットで実装                                       |
   | C-4: PlanResult 二重定義       | `agentSlice.ts` から import（ローカル型定義なし）                           |
   | 対称クリア                     | handleCancelPlan / handleExecutePlan 両方で `clearGenerationState()` を呼ぶ |

   ## Test Plan

   ### 自動テスト

   - AC-1〜AC-10 に対応するユニットテストを追加
   - 既存テストが全て通過することを確認済み

   ```bash
   pnpm --filter @repo/desktop vitest run
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/desktop lint
   ```
   ````

   ### 手動テスト
   1. DescribeStep で「LLM で生成」を選択 → GenerateStep に遷移し plan 結果が表示される
   2. 「実行する」で CompleteStep に遷移する
   3. 「キャンセル」で DescribeStep に戻る
   4. テンプレートフローが既存通り動作する

   スクリーンショット: `outputs/phase-11/screenshots/` 参照

   ```

   ```

2. PR 本文を `outputs/phase-13/pr-body.md` に保存する

**期待される成果物**:

- `outputs/phase-13/pr-body.md`（PR 本文）

---

### タスク4: Pull Request の作成

**目的**: GitHub に PR を作成する

**実行手順**:

1. GitHub CLI を使用して PR を作成する:
   ```bash
   gh pr create \
     --title "feat(skill-creator): SkillCreateWizard への LLM 生成フロー接続 (#1588)" \
     --body-file outputs/phase-13/pr-body.md \
     --base main \
     --label "enhancement"
   ```
2. 作成された PR の URL を記録する
3. PR ページで以下を確認する:
   - タイトルが適切であること
   - 本文が正しく表示されていること
   - base ブランチが `main` であること
   - Closes #1588 のリンクが表示されていること
4. 確認結果と PR URL を `outputs/phase-13/pr-created.md` に記録する

**期待される成果物**:

- `outputs/phase-13/pr-created.md`（作成済み PR の情報）

---

### タスク5: CI/CD 完了確認

**目的**: CI が全て通過していることを確認する

**実行手順**:

1. PR ページで CI/CD の状態を確認する:
   ```bash
   gh pr checks
   ```
2. 以下の CI ジョブが全て通過していることを確認する:
   - TypeScript 型チェック
   - ESLint
   - Vitest（ユニットテスト）
   - その他プロジェクト固有の CI ジョブ

3. CI が失敗している場合は以下を確認する:
   - ローカルでは通過している（Phase 9 で確認済み）のに CI で失敗する場合は、環境差異を調査する
   - テスト失敗の場合はコードを修正して push する（`--no-verify` は使用禁止）

4. 全 CI が通過したことを `outputs/phase-13/ci-result.md` に記録する

**期待される成果物**:

- `outputs/phase-13/ci-result.md`（CI 実行結果）

**注意事項**:

- **マージはユーザーが GitHub UI で手動実行する**
- Claude は PR 作成と CI 確認までを担当する
- CI 通過後、ユーザーにマージの準備が完了した旨を報告する

---

### タスク6: 完了報告

**目的**: タスク全体の完了をユーザーに報告する

**実行手順**:

1. 以下の内容を含む完了報告を作成し、ユーザーに伝える:
   - PR URL
   - CI 通過状況
   - 実装した機能の概要（AC-1〜AC-10 の充足）
   - マージ後のリリース注意事項（ある場合）
   - TASK-SC-07 の完了宣言

2. 完了報告を `outputs/phase-13/completion-report.md` に記録する

**期待される成果物**:

- `outputs/phase-13/completion-report.md`（完了報告書）

---

## 参照資料

| 参照資料                 | パス                                                                              | 内容                                   |
| ------------------------ | --------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 12 成果物          | `outputs/phase-12/`                                                               | ドキュメント更新完了状態の確認         |
| Phase 11 手動テスト結果  | `outputs/phase-11/manual-test-summary.md`                                         | 手動テスト完了エビデンス               |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-summary.md`                                        | AC 充足・品質確認済みエビデンス        |
| Phase 9 品質保証結果     | `outputs/phase-9/qa-summary.md`                                                   | 型チェック・Lint・テスト通過エビデンス |
| スクリーンショット       | `outputs/phase-11/screenshots/`                                                   | PR 本文に添付するエビデンス            |
| GitHub Issue #1588       | GitHub UI                                                                         | Closes で参照する Issue                |
| index.md（タスク全体像） | `docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/index.md`        | PR タイトル・説明の参照元              |
| UI コンポーネント仕様    | `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md`    | PR レビュー時の仕様整合確認            |
| 状態管理仕様             | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Hybrid State Pattern 仕様整合確認      |
| IPC Agent API            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | planSkill/executePlan 契約最終確認     |

---

## 成果物

| 成果物        | パス                                    | 内容                                 |
| ------------- | --------------------------------------- | ------------------------------------ |
| PR 作成前確認 | `outputs/phase-13/pre-pr-check.md`      | ブランチ状態・変更ファイルの確認結果 |
| コミット一覧  | `outputs/phase-13/commit-log.md`        | PR に含まれるコミットの一覧          |
| PR 本文       | `outputs/phase-13/pr-body.md`           | Summary + Test Plan を含む PR 本文   |
| PR 作成結果   | `outputs/phase-13/pr-created.md`        | 作成済み PR の URL と確認結果        |
| CI 実行結果   | `outputs/phase-13/ci-result.md`         | CI ジョブの通過状況                  |
| 完了報告書    | `outputs/phase-13/completion-report.md` | タスク全体の完了報告                 |

---

## 統合テスト連携（Phase 13）

PR の CI で以下の統合テストが実行されることを確認する:

- Vitest による SkillCreateWizard / GenerateStep / DescribeStep の LLM フローテスト
- planSkill / executePlan mock を使用したテストが CI 環境で正しく動作すること
- 型チェックが CI 環境でも通過すること

---

## 完了条件

- [ ] ユーザーから PR 作成の明示的な承認を得ている
- [ ] PR 作成前確認が完了している
- [ ] PR が GitHub に作成されている
- [ ] PR 本文に Summary と Test Plan が含まれている
- [ ] Closes #1588 が PR 本文に含まれている
- [ ] 全 CI ジョブが通過している
- [ ] 完了報告書が生成されている
- [ ] ユーザーにマージ準備完了の旨を報告している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 重要な制約事項

### マージについて

**マージはユーザーが GitHub UI で手動実行する。Claude は自動マージを行わない。**

- CI 通過確認後、ユーザーにマージ準備完了を報告する
- ユーザーがレビュー・承認・マージを GitHub UI から実施する

### `--no-verify` 禁止

プロジェクトルール通り、以下のコマンドは絶対に使用しない:

```bash
# 禁止
git commit --no-verify
git push --no-verify
```

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること、かつユーザーの明示的な PR 作成承認があること
- **後続**: なし（本タスクの最終 Phase）

---

## タスク完了

TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION の全 Phase（1〜13）が完了します。

**完了状態の確認:**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION --phase 13
```
