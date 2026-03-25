# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 前提Phase  | Phase 12                    |
| ステータス | 未実施                      |
| 作成日     | 2026-03-25                  |
| 機能名     | w5b-sc-e2e-terminal-handoff |
| タスクID   | TASK-SC-08-E2E-VALIDATION   |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。Skill Creator LLM 統合タスク全体（01〜08）の統合 PR を準備する最終フェーズ。

## 背景

Skill Creator LLM 統合タスク全体（TASK-SC-01〜TASK-SC-08）の統合 PR を準備する最終フェーズである。ユーザーの明示的承認なしには PR 作成・コミット・プッシュを行わない。全 AC（AC-1〜AC-8）および全 NFR（NFR-1〜NFR-4）の充足を確認した上で PR を作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 成果物最終確認

**目的**: PR 作成前に全成果物の存在と整合性を確認する

**実行手順**:

1. E2E テストファイルが存在し、全 PASS であることを確認する

| #   | ファイル                                                      | 内容                                                     |
| --- | ------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | `apps/desktop/src/test/e2e/skill-creator-integration.test.ts` | シナリオ A〜C（正常フロー・TerminalHandoff・LLM エラー） |
| 2   | `apps/desktop/src/test/e2e/terminal-handoff.test.ts`          | シナリオ D〜E（improve モード・後方互換）                |
| 3   | `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts` | テストヘルパー・ユーティリティ                           |

2. テストヘルパーファイル（LLM モックサーバー設定、テストフィクスチャ、共通ユーティリティ）を確認する
3. Phase 12 ドキュメントが全て作成されていることを確認する

| #   | ドキュメント                                    | Phase    |
| --- | ----------------------------------------------- | -------- |
| 1   | `outputs/phase-12/implementation-guide.md`      | Phase 12 |
| 2   | `outputs/phase-12/test-results-report.md`       | Phase 12 |
| 3   | `outputs/phase-12/overall-completion-report.md` | Phase 12 |

### タスク2: ユーザーにローカル動作確認を依頼【必須】

**目的**: PR 作成前に、ユーザーにローカル環境での動作確認を依頼する

**実行手順**:

1. ユーザーに以下のコマンドでの動作確認を依頼する:
   ```bash
   cd apps/desktop && pnpm vitest run src/test/e2e/
   ```
2. 確認結果を待つ

### タスク3: 変更サマリー提示と許可確認【必須】

**目的**: 変更内容のサマリーを提示し、PR 作成の許可を確認する

**実行手順**:

1. `git diff --name-only main` で全変更ファイルを一覧化する
2. 以下の PR タイトル・本文草案をユーザーに提示する
3. ユーザーから明示的な許可を得るまで PR 作成を実行しない

**PR タイトル案**:

```
feat(skill-creator): LLM統合E2Eテスト・TerminalHandoff検証・全AC充足確認 (#TASK-SC-08)
```

**PR 本文草案**:

```markdown
## Summary

- Skill Creator LLM 統合の全フロー（plan → execute-plan → TerminalHandoff）を 5 シナリオの E2E テストで検証
- TerminalHandoff の suggestedCommand 返却と CLI 実行可能性を確認（AC-4）
- LLM エラー・後方互換・パフォーマンス基準（plan 30 秒・execute 120 秒）を全充足

## AC 充足確認

| AC   | 説明                             | 充足 |
| ---- | -------------------------------- | ---- |
| AC-1 | LLM モデル選択                   | PASS |
| AC-2 | スキル一覧表示                   | PASS |
| AC-3 | 進捗リアルタイム更新             | PASS |
| AC-4 | TerminalHandoff suggestedCommand | PASS |
| AC-5 | improve モード上書き保存         | PASS |
| AC-6 | パフォーマンス基準               | PASS |
| AC-7 | LLM エラーハンドリング           | PASS |
| AC-8 | 後方互換維持                     | PASS |

## NFR 充足確認

| NFR   | 説明                         | 充足 |
| ----- | ---------------------------- | ---- |
| NFR-1 | plan 応答 30 秒以内          | PASS |
| NFR-2 | execute-plan 応答 120 秒以内 | PASS |
| NFR-3 | テストカバレッジ基準         | PASS |
| NFR-4 | エラー時クラッシュなし       | PASS |

## Test Plan

- [ ] シナリオ A〜E 自動 E2E テスト全 PASS
- [ ] TerminalHandoff suggestedCommand CLI 実行確認
- [ ] 既存 skill:create チャンネル動作確認
```

### タスク4: PR 作成（ユーザー承認後のみ）

**目的**: ユーザーの許可を得た後、PR を作成する

**実行手順**:

**重要**: ユーザーの明示的承認を得るまで以下の操作は実行しない。

1. ユーザーの承認を確認する
2. `/ai:diff-to-pr` を実行する

```
/ai:diff-to-pr
```

**フォールバック**（`/ai:diff-to-pr` が使えない場合）:

```bash
gh pr create \
  --title "feat(skill-creator): LLM統合E2Eテスト・TerminalHandoff検証・全AC充足確認 (#TASK-SC-08)" \
  --body "<PR本文草案>" \
  --base main
```

### タスク5: CI 確認

**目的**: CI が通過したことを確認する

**実行手順**:

1. PR が作成されていることを確認する
2. CI が通過していることを確認する
3. レビュー準備が完了していることを確認する

---

## 参照資料

| 参照資料         | パス                                                       | 内容            |
| ---------------- | ---------------------------------------------------------- | --------------- |
| 正本（全体仕様） | `docs/30-workflows/skill-creator-llm-integration/index.md` | AC/FR定義       |
| 最終レビュー     | `outputs/phase-10/final-review-report.md`                  | Phase 10 成果物 |
| 手動テスト       | `outputs/phase-11/manual-test-results.md`                  | Phase 11 成果物 |
| ドキュメント     | `outputs/phase-12/documentation-changelog.md`              | Phase 12 成果物 |
| PR 作成ルール    | `.claude/rules/07-git-and-tooling.md`                      | PR 作成ルール   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                       | 内容                                        |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Skill Creator UI/UX仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` | TerminalHandoff経路・承認フロー・進捗UI仕様 |

---

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] 全テストファイルが存在し、全 PASS であること
- [ ] ドキュメント全作成完了（implementation-guide.md, test-results-report.md, overall-completion-report.md）
- [ ] AC-1〜AC-8 全充足確認
- [ ] NFR-1〜NFR-4 全充足確認
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## タスク完了処理【必須】

**PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/w5b-sc-e2e-terminal-handoff/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep w5b-sc-e2e-terminal-handoff

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): w5b-sc-e2e-terminal-handoffをcompleted-tasksに移動"
git push
```

---

## Phase末端アクション

- [ ] 全成果物の存在と整合性を最終確認する
- [ ] ユーザーに PR タイトル・本文・変更ファイル一覧を提示する
- [ ] ユーザー承認を待つ
- [ ] 承認後、`/ai:diff-to-pr` を実行する
- [ ] PR URL を記録する

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）全完了
- **前提**: Phase 1〜11 の自動テスト全 PASS・手動テスト全 PASS
- **前提**: ユーザー承認（PR 作成の前提条件）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- タスク1（成果物最終確認）:
- タスク2（ローカル動作確認依頼）:
- タスク3（変更サマリー提示・許可確認）:
- タスク4（PR作成）:
- タスク5（CI確認）:

### PR 情報

- PR URL:
- PR 番号:
- CI 結果: PASS / FAIL

### タスク完了処理

- completed-tasks 移動: 完了 / 未完了
- 移動後コミット: 完了 / 未完了

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:
```

---

## 次のPhase

（最終 Phase -- タスク完了）
