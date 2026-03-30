# Phase 13: 完了処理（PR作成） - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 13                                        |
| Phase名    | 完了処理（PR作成）                        |
| 前提Phase  | Phase 12 (ドキュメント更新)               |
| 後続Phase  | -（ワークフロー完了）                     |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-27                                |
| 機能名     | skill-ipc-response-consistency            |

---

## 目的

完了条件の証跡化と PR 準備を行う。ただし、コミット・PRはユーザーの明示的な指示がある場合のみ実施する。

## 背景

Phase 12 までの全成果物が完成していることを確認し、マージ準備を行う。

---

## 使用スキル

> `/ai:diff-to-pr` スキルを使用してPR作成を行います（ユーザー指示時のみ）。

---

## 参照資料

| 参照資料               | パス                                         | 内容                 |
| ---------------------- | -------------------------------------------- | -------------------- |
| PR作成ルール           | `.claude/rules/07-git-and-tooling.md`        | PR/コミットルール    |
| CLAUDE.md              | `CLAUDE.md`                                  | Git操作禁止事項      |
| Phase 1 要件成果物     | `outputs/phase-1/requirements.md`            | 完了条件判定の根拠   |
| Phase 2 設計成果物     | `outputs/phase-2/design-document.md`         | 設計完了判定の根拠   |
| Phase 5 実装成果物     | `apps/desktop/src/main/ipc/skillHandlers.ts` | 実装完了判定の根拠   |
| Phase 5 実装成果物     | `apps/desktop/src/preload/skill-api.ts`      | 実装完了判定の根拠   |
| Phase 6 テスト成果     | `outputs/phase-6/test-expansion-report.md`   | テスト拡充判定の根拠 |
| Phase 7 カバレッジ結果 | `outputs/phase-7/coverage-report.md`         | カバレッジ判定の根拠 |
| Phase 8 リファクタ結果 | `outputs/phase-8/refactoring-report.md`      | リファクタ判定の根拠 |
| Phase 9 品質結果       | `outputs/phase-9/quality-report.md`          | 品質判定の根拠       |
| Phase 10 結果          | `outputs/phase-10/final-review-result.md`    | レビュー判定結果     |
| Phase 11 結果          | `outputs/phase-11/manual-test-result.md`     | 手動テスト結果       |
| Phase 12 成果物        | `outputs/phase-12/`                          | ドキュメント成果物   |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                              | 内容                       |
| ---------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| タスク台帳・残課題管理 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 完了条件と未タスク整合確認 |
| Skill IPC 契約仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 最終契約整合の確認基準     |
| IPC チャンネル仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | PR前の仕様同期確認対象     |
| 品質基準               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質ゲート証跡の確認       |

---

## 成果物

| 成果物             | パス                                                | 内容                   |
| ------------------ | --------------------------------------------------- | ---------------------- |
| 完了チェックリスト | `outputs/phase-13/completion-checklist.md`          | 全Phase完了確認        |
| PRテンプレート     | `outputs/phase-13/pr-template.md`                   | PR準備                 |
| 整合監査レポート   | `outputs/phase-13/requirements-extraction-audit.md` | 仕様抽出・整合監査結果 |

---

## 実行タスク

### タスク1: 完了条件の最終確認

**目的**: 全Phase の完了条件が満たされていることを確認する。

**手順**:

1. Phase 1-12 の完了条件チェックリストを順次確認
2. 未完了項目がある場合は該当Phaseに戻る
3. `outputs/phase-13/completion-checklist.md` に結果を出力

**確認チェックリスト**:

| Phase | 確認内容                         | ステータス |
| ----- | -------------------------------- | ---------- |
| 1     | 要件定義が完了している           | [ ]        |
| 2     | 設計が完了している               | [ ]        |
| 3     | 設計レビューがPASS/MINOR対応済み | [ ]        |
| 4     | テストが作成されている           | [ ]        |
| 5     | 実装が完了している               | [ ]        |
| 6     | テスト拡充が完了している         | [ ]        |
| 7     | カバレッジ基準を満たしている     | [ ]        |
| 8     | リファクタリングが完了している   | [ ]        |
| 9     | 品質検証が通過している           | [ ]        |
| 10    | 最終レビューがPASS/MINOR対応済み | [ ]        |
| 11    | 手動テストが全てPASS             | [ ]        |
| 12    | ドキュメント更新が完了している   | [ ]        |

### タスク2: 変更差分の確認

**目的**: コミット対象のファイルを確認する。

**手順**:

```bash
git status
git diff --stat
```

1. 意図しない変更がないことを確認
2. 機密ファイル（.env, credentials 等）が含まれていないことを確認
3. テストファイルが含まれていることを確認

### タスク3: コミットメッセージ準備

**目的**: コミットメッセージを準備する（実行はユーザー指示時のみ）。

**推奨コミットメッセージ**:

```
refactor(ipc): skill:ハンドラIPCレスポンス形式統一

- 全skill:チャネルの戻り値を契約プロファイルに統一
- Preload APIでRenderer向け単一戻り値解釈を提供
- 契約ドリフト検出テストを追加
- P23/P32/P42/P44/P45の再発防止策を組み込み
```

### タスク4: PR 準備

**目的**: PR テンプレートを準備する（作成はユーザー指示時のみ）。

**PR情報**:

- **タイトル**: `refactor(ipc): skill:ハンドラIPCレスポンス形式統一`
- **関連Issue**: #860

**PR本文テンプレート**:

```markdown
## Summary

- 全skill:チャネル（execute/import/remove/list/get-config）の戻り値を契約プロファイルに統一
- Preload API層でRendererが単一形式で解釈できる戻り値を提供
- 契約ドリフト検出テストを追加し、将来の不整合を防止

## Test plan

- [ ] 既存テストが全てPASS（`pnpm --filter @repo/desktop test`）
- [ ] 契約ドリフト検出テストがPASS
- [ ] 型チェックが通過（`pnpm typecheck`）
- [ ] Lint通過（`pnpm lint`）
- [ ] 手動テスト: スキル実行/インポート/削除の各フローが正常動作
- [ ] 手動テスト: DevToolsで`window.skillAPI === undefined`を確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**出力先**: `outputs/phase-13/pr-template.md`

### タスク5: artifacts.json 最終更新

**目的**: 全Phase のステータスを反映する。

**手順**:

1. Phase 13 のステータスを更新
2. workflow の status を "completed" に更新

---

## SubAgent 分担

| SubAgent   | 担当                                                         |
| ---------- | ------------------------------------------------------------ |
| SubAgent-A | タスク1（完了条件最終確認）+ タスク2（差分確認）             |
| SubAgent-B | タスク3（コミットメッセージ準備）+ タスク4（PRテンプレ準備） |
| SubAgent-C | タスク5（artifacts最終更新）+ ユーザー許可ゲート管理         |

## PR作成フロー

```
Phase 13: PR作成
    ↓
1. Phase 1-12 完了条件を最終確認
    ↓
2. 変更差分を確認（git status / git diff --stat）
    ↓
3. ユーザーにローカル動作確認を依頼
    ↓
4. 変更サマリーを提示し、ユーザーからPR作成の許可を取得
    ↓
5. /ai:diff-to-pr を実行（ユーザー指示後）
    ↓
6. CI通過確認
    ↓
7. タスクディレクトリを completed-tasks/ に移動
    ↓
8. artifacts.json を最終更新
    ↓
ワークフロー完了
```

> **重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

---

## タスク完了時の移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-ipc-response-consistency/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep skill-ipc-response-consistency

# 3. 元タスク指示書を削除（該当する場合）
# 確認: 元の指示書が存在するか
ls docs/30-workflows/unassigned-task/ | grep skill-ipc || echo "元指示書なし"

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): skill-ipc-response-consistencyをcompleted-tasksに移動"
```

> **注意**: Phase 12で検出・作成した**新規**未タスク指示書は削除しないでください。

---

## 完了条件

- [ ] Phase 1-12 の完了条件が全て満たされている
- [ ] 変更差分が確認されている
- [ ] コミットメッセージが準備されている
- [ ] PR テンプレートが準備されている
- [ ] artifacts.json が最終更新されている
- [ ] 仕様抽出・整合監査レポートが作成されている
- [ ] ユーザー指示がある場合のみ PR 作成・CI確認・タスク移動を実施する
- [ ] **本Phase内の全作業を100%完了**

## 完了判定詳細チェックリスト

| #   | 項目                                                                 | 必須 |
| --- | -------------------------------------------------------------------- | ---- |
| 1   | Phase 1-12 の完了条件が全て満たされている                            | ✅   |
| 2   | 変更差分が確認されている                                             | ✅   |
| 3   | コミットメッセージが準備されている                                   | ✅   |
| 4   | PR テンプレートが準備されている                                      | ✅   |
| 5   | artifacts.json が最終更新されている                                  | ✅   |
| 6   | （ユーザー指示後）PRが作成されている                                 | 条件 |
| 7   | （ユーザー指示後）CIが全て通過している                               | 条件 |
| 8   | （ユーザー指示後）タスクディレクトリが `completed-tasks/` に移動済み | 条件 |
| 9   | **本Phase内の全作業を100%完了**                                      | ✅   |

> ⚠️ **注意**: コミット・PR作成はユーザーの明示的な指示がある場合のみ実施する。

---

## サブタスク管理

| #   | タスク                 | 必須 | ステータス |
| --- | ---------------------- | ---- | ---------- |
| 1   | 完了条件の最終確認     | ✅   | 未実施     |
| 2   | 変更差分の確認         | ✅   | 未実施     |
| 3   | コミットメッセージ準備 | ✅   | 未実施     |
| 4   | PR準備                 | ✅   | 未実施     |
| 5   | artifacts.json最終更新 | ✅   | 未実施     |

---

## タスク100%実行確認【必須】チェックリスト

- [ ] タスク1（完了条件の最終確認）を実行した
- [ ] タスク2（変更差分の確認）を実行した
- [ ] タスク3（コミットメッセージ準備）を実行した
- [ ] タスク4（PR準備）を実行した
- [ ] タスク5（artifacts.json最終更新）を実行した

---

## Phase実行記録テンプレート

```markdown
## Phase 13 実行記録

### 完了確認

- Phase 1-12 全完了: {{はい/いいえ}}
- 変更差分確認: {{完了/未完了}}
- 機密ファイルチェック: {{問題なし/要対応}}

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open/未作成}}

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

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 完了条件チェックリストが全て確認済み
- [ ] artifacts.json が最終更新されている
- [ ] （ユーザー指示後）PRが作成されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（ワークフロー完了）

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは `docs/30-workflows/completed-tasks/skill-ipc-response-consistency/` に移動されます。

---

## 次のPhase

なし（ワークフロー完了）
