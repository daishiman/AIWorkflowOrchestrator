# Phase 6 拡充テストケース記録

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001 |
| 作成日   | 2026-04-11                                     |

---

## TC-07: lane/index.md が存在しないワークフローでのフォールバック動作確認

| 項目           | 内容                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| テスト種別     | エッジケース                                                                   |
| 前提条件       | `lane/index.md` が存在しないワークフローを想定                                 |
| テスト手順     | compliance-template.md の lane/index.md 同期項目に注記が明記されているかを確認 |
| 期待される結果 | チェックリスト項目に「lane 非採用 workflow は N/A 理由を記録」の注記が存在する |
| 合否判定基準   | 注記が存在する → PASS                                                          |

**実行結果**: PASS

- compliance-template.md 行77: `- [ ] \`lane/index.md\`（lane index）: lane 状態とタスク参照が更新済み（lane 非採用 workflow は N/A 理由を記録）` に注記あり ✅

---

## TC-08: completed.md と backlog.md が同一エントリを持つ場合の処理

| 項目           | 内容                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| テスト種別     | エッジケース                                                                                       |
| 前提条件       | task-workflow.md と task-workflow-completed.md に同一タスクが存在する状態を想定                    |
| テスト手順     | チェックリストの「backlog から削除」と「completed に追加」が排他的操作として明記されているかを確認 |
| 期待される結果 | 両ファイルへの操作が「削除」と「追加」として明確に区別されていること                               |
| 合否判定基準   | 区別されている → PASS                                                                              |

**実行結果**: PASS

- compliance-template.md 行75: `完了タスクが open 側に残っていない`（削除確認）
- compliance-template.md 行76: `完了タスク記録が current facts に一致する`（追加確認）
- 削除と追加が別チェック項目として明確に区別されている ✅

---

## TC-09: artifacts.json の workflow root と skill root が両方更新される場合

| 項目           | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| テスト種別     | エッジケース                                                                                             |
| 前提条件       | `outputs/artifacts.json` と `.claude/skills/.../outputs/artifacts.json` の両方を同一ターンで更新する状況 |
| テスト手順     | チェックリストに「workflow artifacts」と「skill artifacts」が別項目として明示されているかを確認          |
| 期待される結果 | 2つの artifacts.json が別々のチェックリスト項目として独立して記載されていること                          |
| 合否判定基準   | 独立して記載されている → PASS                                                                            |

**実行結果**: PASS

- compliance-template.md 行78: `\`outputs/artifacts.json\`（workflow artifacts）`
- compliance-template.md 行79: `\`.claude/skills/task-specification-creator/outputs/artifacts.json\`（skill artifacts）`
- 2件が独立した別チェック項目として記載されている ✅

---

## TC-10: チェックリストが既存の Phase 12 完了条件と重複しないことの確認

| 項目           | 内容                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| テスト種別     | エッジケース                                                                                       |
| 前提条件       | 実装済みの compliance-template.md と追加前の既存チェックリスト                                     |
| テスト手順     | 追加した三者同期チェックリストの各項目が既存チェックリスト項目と意味的に重複していないかを目視確認 |
| 期待される結果 | 全5同期項目が既存チェックリストに存在しない新規項目であること                                      |
| 合否判定基準   | 重複なし → PASS                                                                                    |

**実行結果**: PASS

- FB-04チェックはledger/lane/artifactsの5ファイル同期を明示的に要求する新規項目
- 既存の `task-workflow.md` / `task-workflow-completed.md` のledger parity確認は存在したが、5ファイル一括の「同一wave同期」という観点は新規 ✅

---

## TC-11: mirror (.agents/skills/) との同期確認

| 項目           | 内容                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| テスト種別     | エッジケース                                                                                                |
| 前提条件       | `.claude/skills/task-specification-creator/` と `.agents/skills/task-specification-creator/` が存在すること |
| テスト手順     | 変更した3ファイルについて `.claude/skills/` と `.agents/skills/` の diff が0であることを確認                |
| 期待される結果 | 両ディレクトリのファイル内容が完全に一致していること                                                        |
| 合否判定基準   | diff = 0 → PASS                                                                                             |

**実行コマンド**:

```bash
diff -qr .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/
```

**実行結果**: PASS（出力なし = 差分0件）✅

---

## 総合判定

| TC    | 判定 |
| ----- | ---- |
| TC-07 | PASS |
| TC-08 | PASS |
| TC-09 | PASS |
| TC-10 | PASS |
| TC-11 | PASS |

全TC（TC-07〜TC-11）: **全件 PASS** ✅
