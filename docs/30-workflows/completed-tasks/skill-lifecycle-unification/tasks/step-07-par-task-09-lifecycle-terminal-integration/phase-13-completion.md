# Phase 13 完了 - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                          |
| Phase      | 13 - 完了                                                                                                            |
| ステータス | blocked（ユーザー承認待ち）                                                                                          |
| 前提 Phase | Phase 12 完了（`outputs/phase-12/` 配下の全成果物が存在し、Phase 12 完了条件チェックリストが全項目 PASS であること） |
| 成果物     | なし（最終確認のみ。`artifacts.json` のステータス更新のみ書き込み操作）                                              |
| 次 Phase   | なし（タスク完了）                                                                                                   |

## ステータス: blocked

### なぜ blocked か

Phase 13（PR 作成・コミット）は、ユーザーの明示的な承認なしに実行してはならない。以下の理由による:

1. **コミット操作の不可逆性**: `git commit` は履歴に残り、`--no-verify` 禁止のため pre-commit hook が実行される
2. **PR の外部可視性**: PR 作成後はチームメンバーに通知される共有アクション
3. **Phase 12 までの完了保証**: Phase 1〜12 の全成果物が揃い、品質基準を満たしていることの最終確認が必要

### user approval の有無

- [ ] ユーザーから Phase 13 の実行を明示的に承認された（日時: \_\_\_\_）

### Phase 12 までの完了根拠

以下の全条件が満たされていることを確認してから、ユーザーに Phase 13 実行の承認を求める:

- [ ] `artifacts.json` の Phase 1〜12 が全て `"completed"` ステータスである
- [ ] `outputs/phase-12/` に7つの必須成果物が存在する
- [ ] Phase 10 の判定が PASS（または MINOR 対応完了後 PASS）である
- [ ] Phase 11 の手動テストで Blocker 事項が 0 件である

## サブタスク管理

本 Phase はサブエージェントに委譲しない。メインエージェントが直接実行する。

## 目的

Phase 1〜12 の全成果物が揃い、品質基準を満たしていることを最終確認する。PR の準備を行い、レビュー依頼可能な状態にする。

**重要**: 本 Phase の実行にはユーザーの明示的な承認が必須。承認なしにコミット・PR 作成を行ってはならない。

## 実行タスク

### Task 13-1: 全 Phase 成果物の存在確認

以下のファイルが全て存在し、空でないことを確認する。

| Phase | 必須ファイル                                  | 確認方法                                 |
| ----- | --------------------------------------------- | ---------------------------------------- |
| 1     | `outputs/phase-1/requirements-analysis.md`    | ファイルサイズ > 0 bytes                 |
| 2     | `outputs/phase-2/design-document.md`          | ファイルサイズ > 0 bytes                 |
| 3     | `outputs/phase-3/design-review-report.md`     | PASS/MINOR/MAJOR 判定の記載あり          |
| 4     | `outputs/phase-4/`（テストファイル）          | 1ファイル以上存在                        |
| 5     | `outputs/phase-5/`（実装変更ファイル記録）    | 変更ファイル一覧の記載あり               |
| 6     | `outputs/phase-6/`（テスト拡充記録）          | 追加テスト一覧の記載あり                 |
| 7     | `outputs/phase-7/`（カバレッジレポート）      | カバレッジ数値の記載あり                 |
| 8     | `outputs/phase-8/`（リファクタリング記録）    | 変更内容の記載あり                       |
| 9     | `outputs/phase-9/`（品質検証結果）            | lint/typecheck/test の PASS 確認         |
| 10    | `outputs/phase-10/final-review-report.md`     | PASS/MINOR/MAJOR/CRITICAL 判定の記載あり |
| 11    | `outputs/phase-11/`（手動テスト結果）         | 手動テストシナリオ結果の記載あり         |
| 12    | `outputs/phase-12/implementation-guide.md`    | Part 1 と Part 2 の両方が記載あり        |
| 12    | `outputs/phase-12/component-documentation.md` | Props 一覧・セレクタ一覧が記載あり       |
| 12    | `outputs/phase-12/documentation-changelog.md` | 全 Step の完了記録が記載あり             |
| 12    | `outputs/phase-12/unassigned-task-report.md`  | 0件でも存在すること                      |

確認コマンド例:

```bash
ls -la outputs/phase-{1..12}/
# 各ディレクトリに1ファイル以上存在し、0 bytesのファイルがないことを確認
```

### Task 13-2: artifacts.json の更新

`artifacts.json` の全 Phase の `status` を `"completed"` に更新し、`updatedAt` を本日日付に更新する。

更新前に以下を確認する:

- 各 Phase の `outputs` パスに記載されたファイルが実際に存在すること
- `currentPhase` の値が `13` であること

更新後の artifacts.json の構造:

```json
{
  "taskId": "TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001",
  "status": "completed",
  "currentPhase": 13,
  "phases": {
    "phase-1": { "status": "completed", ... },
    "phase-2": { "status": "completed", ... },
    // ... 全 phase が "completed"
    "phase-13": { "status": "completed", ... }
  },
  "updatedAt": "YYYY-MM-DD"  // 本日日付
}
```

### Task 13-3: ブランチ・コミット確認

以下を確認する。

**ブランチ名**:

```bash
git branch --show-current
```

- ブランチ名は `feature/`・`fix/`・`refactor/`・`docs/` のいずれかのプレフィックスで始まること
- 本タスクの場合、推奨ブランチ名: `feature/skill-lifecycle-terminal-integration`

**コミット履歴の確認**:

```bash
git log --oneline -10
```

- `--no-verify` が使われたコミットがないこと
- コミットメッセージが目的を適切に表現していること（「WIP」「test」のような不明瞭なメッセージが最終コミットに残っていないこと）

**未コミットの変更**:

```bash
git status
git diff --stat
```

- 実装対象の全ファイルがコミット済みであること
- 意図していない変更ファイルがないこと

**確認すべき実装対象ファイル**:

| ファイル                                                             | 変更内容                                      | コミット状態 |
| -------------------------------------------------------------------- | --------------------------------------------- | ------------ |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | Terminal ボタン追加・TerminalHandoffCard 接続 | 確認必須     |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | buildForSkillImprovement() 追加               | 確認必須     |
| `apps/desktop/src/preload/channels.ts`                               | SKILL_BUILD_IMPROVEMENT_HANDOFF 定数追加      | 確認必須     |
| IPC ハンドラ登録ファイル（Phase 5 設計に従ったファイル）             | skill:buildImprovementHandoff 登録            | 確認必須     |

### Task 13-4: PR 準備

以下の内容で PR 文書を作成する（実際の PR 作成は本 Task の完了条件ではない）。

**PR タイトル（70文字以内）**:

```
feat(skill): SkillLifecyclePanelにTerminal統合とhandoff機能を追加
```

文字数確認: 上記タイトルは日本語含め70文字以内であること。

**PR 本文（Summary + Test Plan）**:

```markdown
## Summary

- SkillLifecyclePanel ヘッダーに固定 Terminal ボタンを追加（GAP C-02 解消、TH-04 準拠）
- TerminalHandoffCard を SkillLifecyclePanel に統合し、handoffGuidance 状態と接続（GAP C-03 解消、TH-01 準拠）
- TerminalHandoffBuilder.buildForSkillImprovement() を新規追加し、前回改善結果の要約を Terminal に転送（GAP C-07 解消、TH-03 準拠）

## 解消した GAP

| GAP ID | 問題内容                                      | 解消方法                                                              |
| ------ | --------------------------------------------- | --------------------------------------------------------------------- |
| C-02   | ヘッダーに固定 Terminal ボタンがない          | `data-testid="skill-lifecycle-open-terminal"` ボタンを追加            |
| C-03   | TerminalHandoffCard が未接続                  | handoffGuidance セレクタと props マッピングで接続                     |
| C-07   | improve→terminal で前回改善結果の要約転送なし | buildForSkillImprovement() で improvementSummary を含む prompt を生成 |
| D-02   | TerminalDock が未接続                         | TerminalHandoffCard 経由で接続パスを確保                              |

## terminal handoff 5契約の対応状況

| 契約  | 内容                                       | 対応状況                   |
| ----- | ------------------------------------------ | -------------------------- |
| TH-01 | create→terminal: 1カードに3情報をまとめる  | 対応済み                   |
| TH-02 | execute→terminal: 自動実行しない旨を明記   | 対応済み                   |
| TH-03 | improve→terminal: 前回結果と改善観点を要約 | 対応済み                   |
| TH-04 | どの画面でも固定 Terminal ボタンを表示     | 対応済み                   |
| TH-05 | transcript→chat: 明示操作でのみ戻す        | 対応済み（onDismiss のみ） |

## 新規 IPC チャンネル

- `skill:buildImprovementHandoff`: improve→terminal handoff の HandoffGuidance 構築

## Test Plan

- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS
- [ ] `cd apps/desktop && pnpm vitest run` PASS
- [ ] SkillLifecyclePanel に Terminal ボタンが表示される（data-testid="skill-lifecycle-open-terminal"）
- [ ] Terminal ボタンクリック時に TerminalHandoffCard が表示される
- [ ] onDismiss でカードが閉じる
- [ ] improve フェーズで improvementSummary が Terminal コマンドに含まれる
```

**PR 作成コマンド例**:

```bash
gh pr create \
  --title "feat(skill): SkillLifecyclePanelにTerminal統合とhandoff機能を追加" \
  --body-file /tmp/pr-body.md \
  --base main
```

**重要**: 上記の PR 作成コマンドは、ユーザーの明示的な承認を得てから実行すること。承認なしに `gh pr create` を実行してはならない。PR 本文の準備（ファイル作成）までは承認なしで実施可能。

### Task 13-5: 最終チェックリスト実行

本 Task では以下のコマンドを実際に実行し、全て PASS することを確認する。

**1. Lint チェック**:

```bash
pnpm --filter @repo/desktop lint
```

期待結果: エラー・警告なし

**2. 型チェック**:

```bash
pnpm --filter @repo/desktop typecheck
```

期待結果: エラーなし

**3. テスト実行**:

```bash
cd apps/desktop && pnpm vitest run
```

期待結果: 全テスト PASS（失敗 0件）

**4. git status 確認**:

```bash
git status
```

期待結果: 想定外のファイルが変更・追加されていないこと。意図的なステージング外ファイルがある場合は `.gitignore` への追加または削除を判断すること。

**5. 実装対象ファイルの最終確認**:

```bash
git diff --stat origin/main...HEAD
```

期待結果: 以下のファイルのみが変更されている（Phase 5 の実装内容に応じて調整）:

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`
- `apps/desktop/src/preload/channels.ts`
- IPC ハンドラ登録ファイル
- テストファイル（`*.test.ts` / `*.test.tsx`）
- `docs/` 配下の仕様書ファイル

## 参照資料

| 資料                 | パス                                                                                                                    | 参照目的                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 12 成果物      | `outputs/phase-12/`                                                                                                     | 全成果物の存在確認               |
| artifacts.json       | `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-09-lifecycle-terminal-integration/artifacts.json` | ステータス更新対象               |
| Git ルール           | `.claude/rules/07-git-and-tooling.md`                                                                                   | ブランチ・コミット規則確認       |
| PR 作成ルール        | `.claude/rules/07-git-and-tooling.md#PR 作成ルール`                                                                     | PR タイトル・本文の規則確認      |
| ui-ux-realization.md | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`                                                    | terminal handoff 5契約の最終確認 |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] ユーザーから Phase 13 の実行承認を得ている
- [ ] 上記「実行タスク」セクションの全タスク（Task 13-1〜13-5）を実行した
- [ ] artifacts.json の全 Phase が "completed" に更新されている
- [ ] PR 文書が作成されている（実際の PR 作成はユーザー承認後）

## 統合テスト連携

本 Phase は全 Phase（1〜12）の統合完了確認を行う。

- Phase 10 の最終レビュー判定が PASS であることを確認する
- Phase 11 の手動テストで Blocker 0 件であることを確認する
- Phase 12 の7成果物が全て存在することを確認する

## 多角的チェック観点

| 観点         | 確認内容                                                  |
| ------------ | --------------------------------------------------------- |
| 成果物網羅   | artifacts.json の Phase 1〜12 が全て completed であること |
| GAP 完全解消 | C-02・C-03・C-07・D-02 の4 GAP が全て解消されていること   |
| ユーザー承認 | Phase 13 の実行がユーザーから明示的に承認されていること   |
| コミット品質 | --no-verify を使用していないこと                          |

## 完了条件チェックリスト

### Task 13-1（成果物存在確認）

- [ ] `outputs/phase-1/requirements-analysis.md` が存在し、空でない
- [ ] `outputs/phase-2/design-document.md` が存在し、空でない
- [ ] `outputs/phase-3/design-review-report.md` が存在し、PASS/MINOR/MAJOR の判定が記載されている
- [ ] `outputs/phase-4/` に1ファイル以上のテストファイルが存在する
- [ ] `outputs/phase-5/` に変更ファイル一覧の記録が存在する
- [ ] `outputs/phase-6/` にテスト拡充記録が存在する
- [ ] `outputs/phase-7/` にカバレッジ数値が記録されている
- [ ] `outputs/phase-8/` にリファクタリング内容が記録されている
- [ ] `outputs/phase-9/` に lint/typecheck/test の PASS が記録されている
- [ ] `outputs/phase-10/final-review-report.md` が存在し、PASS/MINOR/MAJOR/CRITICAL の判定が記載されている
- [ ] `outputs/phase-11/` に手動テスト結果が記録されている
- [ ] `outputs/phase-12/implementation-guide.md` が存在し、Part 1 と Part 2 が記載されている
- [ ] `outputs/phase-12/component-documentation.md` が存在し、Props 一覧が記載されている
- [ ] `outputs/phase-12/documentation-changelog.md` が存在し、全 Step の完了記録が記載されている
- [ ] `outputs/phase-12/unassigned-task-report.md` が存在する（0件でも必須）

### Task 13-2（artifacts.json 更新）

- [ ] `artifacts.json` の全 Phase の `status` が `"completed"` である
- [ ] `artifacts.json` の `currentPhase` が `13` である
- [ ] `artifacts.json` の `updatedAt` が本日日付に更新されている
- [ ] `artifacts.json` の各 Phase の `outputs` パスに記載されたファイルが実際に存在する

### Task 13-3（ブランチ・コミット確認）

- [ ] ブランチ名が `feature/`・`fix/`・`refactor/`・`docs/` のいずれかのプレフィックスで始まる
- [ ] `--no-verify` を使ったコミットが存在しない
- [ ] 実装対象の4ファイル（SkillLifecyclePanel.tsx / TerminalHandoffBuilder.ts / channels.ts / IPC ハンドラファイル）が全てコミット済みである
- [ ] `git status` で意図していない変更ファイルが存在しない

### Task 13-4（PR 準備）

- [ ] PR タイトルが70文字以内である
- [ ] PR 本文に Summary（1-3箇条書き）が含まれている
- [ ] PR 本文に解消した GAP（C-02/C-03/C-07/D-02）の対応内容が記載されている
- [ ] PR 本文に terminal handoff 5契約（TH-01〜TH-05）の対応状況が記載されている
- [ ] PR 本文に Test Plan（チェックリスト形式）が含まれている

### Task 13-5（最終チェック）

- [ ] `pnpm --filter @repo/desktop lint` が PASS（エラー・警告なし）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS（エラーなし）
- [ ] `cd apps/desktop && pnpm vitest run` が PASS（失敗 0件）
- [ ] `git status` に想定外のファイルが存在しない

## タスク完了宣言

上記の全完了条件チェックリストが全項目 PASS した場合、以下の宣言を記録する。

```
TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001 完了
完了日: YYYY-MM-DD
解消 GAP: C-02 / C-03 / C-07 / D-02
達成契約: TH-01 / TH-02 / TH-03 / TH-04 / TH-05
PR: [PR URL または PR 番号]
```
