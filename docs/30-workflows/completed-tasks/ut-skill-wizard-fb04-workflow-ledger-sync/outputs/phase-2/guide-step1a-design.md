# Phase 2 ガイド Step 1-A 設計書

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001 |
| 作成日   | 2026-04-11                                     |

---

## 設計目的

`phase-12-documentation-guide.md` の `Task 12-2: system spec update summary` セクションに
FB-04 の三者同期チェック手順を追記する設計を行う。

---

## 挿入位置の決定

`phase-12-documentation-guide.md` の Task 12-2 セクション内で：

- 既存の「`artifacts.json` と `outputs/artifacts.json` の同期結果も書く」の直後
- `### 設計タスク（docs-only）での注意` の前
- 見出し: `### FB-04: ledger / lane / artifacts 三者同期チェック（Task 12-2 必須）`

---

## 追記内容設計（最終案）

```markdown
### FB-04: ledger / lane / artifacts 三者同期チェック（Task 12-2 必須）

- `system-spec-update-summary.md` に、以下 5 対象の同期結果を **同一 wave** で記録する
- `task-workflow.md`（backlog ledger）: 完了タスクが open 側に残っていないことを確認する
- `task-workflow-completed.md`（completed ledger）: 完了タスク記録を current facts に合わせる
- `lane/index.md`（lane index）: lane 状態とタスク参照を更新する（lane 非採用 workflow は N/A 理由を残す）
- `outputs/artifacts.json`（workflow artifacts）: status / phase artifacts を current facts に合わせる
- `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts）: status / artifact metadata を current facts に合わせる
- `artifacts.json` 系 2 ファイルは片側のみ更新を禁止し、差分理由がある場合は両方に明記する
```

---

## 設計の根拠

- Task 12-2 の主担当は system spec 同期であり、ledger 同期もこの責務に属する
- 「同一 wave」で別ターン分割を防止する
- 「片側のみ更新を禁止」でartifacts.jsonの不整合を防ぐ
- `N/A 理由を残す` でlane非採用ワークフローへの対応を明示

---

## TC-06 との対応

| TC    | 期待結果                              | この設計での充足                                   |
| ----- | ------------------------------------- | -------------------------------------------------- |
| TC-06 | Step 1-A に三者同期手順が存在すること | `### FB-04` セクションとして Task 12-2 内に追記 ✅ |
