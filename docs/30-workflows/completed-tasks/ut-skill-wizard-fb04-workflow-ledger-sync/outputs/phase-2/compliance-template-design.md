# Phase 2 テンプレート追記設計書

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001 |
| 作成日   | 2026-04-11                                     |

---

## 設計目的

`phase12-task-spec-compliance-template.md` への三者同期チェックリストの配置場所・構造・文言を設計する。

---

## 挿入位置の決定

現行テンプレートの `### 4. system spec / outputs 同期` セクション内の `task-workflow.md` / `task-workflow-completed.md` 確認チェックの直後に追加。

**理由**: Step 1-A（完了タスク記録）直後のタイミングがledger同期の実行フローに最も沿っている。

---

## 三者同期チェックリスト設計（追記内容）

```markdown
- [ ] **FB-04** `ledger / lane / artifacts` 三者同期チェックを実施し、以下 5 対象を同一 wave で更新した
- [ ] `task-workflow.md`（backlog ledger）: 完了タスクが open 側に残っていない
- [ ] `task-workflow-completed.md`（completed ledger）: 完了タスク記録が current facts に一致する
- [ ] `lane/index.md`（lane index）: lane 状態とタスク参照が更新済み（lane 非採用 workflow は N/A 理由を記録）
- [ ] `outputs/artifacts.json`（workflow artifacts）: status / phase artifacts が current facts に一致する
- [ ] `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts）: status / artifact metadata が current facts に一致する
```

---

## 設計の根拠

- 5ファイルを1つの「FB-04チェック」として定義することで漏れを防ぐ
- `lane 非採用 workflow は N/A 理由を記録` という注記でエッジケース（TC-07）に対応
- `skill artifacts` を常に確認対象として記載（スキップ時はN/A理由記録）
- インデント構造で親チェック（FB-04）と子チェック（5ファイル）の階層関係を明確化

---

## TC-04, TC-05 との対応

| TC    | 期待結果                                       | この設計での充足                                    |
| ----- | ---------------------------------------------- | --------------------------------------------------- |
| TC-04 | 三者同期チェックリストセクションが存在すること | `**FB-04**` 見出しで識別可能なブロックとして存在 ✅ |
| TC-05 | 5同期対象ファイルが全件含まれていること        | 5ファイルをすべて箇条書きで明示 ✅                  |
