# Phase 6: 追加確認 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | 追加確認                        |
| 前提Phase  | Phase 5                         |
| 後続Phase  | Phase 7                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

Phase 5 で実施した変更に対して、主要4ファイル以外の child companion（`task-workflow-completed-*.md`）のラベル対応状況を確認し、必要であれば追加追記を行う。

---

## 実行タスク

### タスク1: child companion 全件ラベル確認

**目的**: `task-workflow.md` のインデックスに登録されている全 child companion の冒頭ラベルを確認する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` のインデックステーブルを読み、child companion の一覧を取得する
2. 各 child companion の冒頭5行を確認し、`> 区分:` または `> 役割:` の記述有無を確認する
3. 確認結果を一覧表に記録する

**確認対象ファイル（主要なもの）**:

- `task-workflow-completed.md`（Phase 5 で対応済み）
- `task-workflow-active.md`（Phase 5 で対応済み）
- `task-workflow-completed-workspace-chat-lifecycle-tests.md`
- `task-workflow-completed-skill-lifecycle.md`
- `task-workflow-history.md`
- `task-workflow-phases.md`
- `task-workflow-rules.md`
- `task-workflow-backlog.md`

4. 未対応ファイルがある場合は優先度を評価する（本タスクスコープ内か否かを判断する）

**期待される成果物**:

- child companion ラベル確認レポート（`outputs/phase-6/child-companion-check.md`）

---

### タスク2: task-workflow.md リンク有効性確認

**目的**: Phase 5 の変更後も `task-workflow.md` 内の全リンクが有効であることを確認する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を読む
2. インデックステーブル内の全ファイルリンクを抽出する
3. 各リンク先ファイルが実際に存在することを確認する

```bash
# リンク先ファイル存在確認
ls .claude/skills/aiworkflow-requirements/references/task-workflow-active.md
ls .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md
ls .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md
```

**期待される成果物**:

- リンク確認レポート（`outputs/phase-6/link-check-report.md`）

---

### タスク3: 責務分離セクションの追加確認

**目的**: 責務分離セクションの内容が正確で、コードと照合済みであることを再確認する

**実行手順**:

1. 責務分離セクションを追記したファイルを読む
2. 3関数の情報が正確であることを `RuntimeSkillCreatorFacade.ts` と照合する:
   - `verifySkill()` が 294行目にあること
   - `verifyAndImproveLoop()` が 352行目にあること
3. `SkillCreatorVerificationEngine.ts` の `verify()` メソッドが存在することを確認する

**期待される成果物**:

- 責務分離照合確認レポート（`outputs/phase-6/responsibility-check.md`）

---

## 参照資料

| 参照資料                   | パス                                                                  | 内容                 |
| -------------------------- | --------------------------------------------------------------------- | -------------------- |
| task-workflow インデックス | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`  | child companion 一覧 |
| RuntimeSkillCreatorFacade  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 294行目・352行目     |

---

## 成果物

| 成果物                       | パス                                       | 内容                                |
| ---------------------------- | ------------------------------------------ | ----------------------------------- |
| child companion 確認レポート | `outputs/phase-6/child-companion-check.md` | 全 child companion のラベル確認結果 |
| リンク確認レポート           | `outputs/phase-6/link-check-report.md`     | 全リンクの有効性確認結果            |
| 責務分離照合レポート         | `outputs/phase-6/responsibility-check.md`  | 3関数情報のコード照合結果           |

---

## 完了条件

- [ ] 全 child companion のラベル確認が完了している
- [ ] `task-workflow.md` 内の全リンクが有効であることを確認済み
- [ ] 責務分離セクションのコード照合が完了している
- [ ] `outputs/phase-6/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（ドキュメント更新実施）が完了していること
- **後続**: Phase 7（変更網羅性確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-7-coverage-check.md`
