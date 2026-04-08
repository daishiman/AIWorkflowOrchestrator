# Phase 4 テストケース一覧 - UT-VERIFY-DOC-CONSOLIDATION-001

## テストケース一覧（TC-001〜TC-008）

| TC ID  | 対応 AC | テスト内容                                               | 確認方法                                                 | 期待結果                                                                               |
| ------ | ------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-001 | AC-001  | `task-workflow.md` インデックステーブルの列構成確認      | ファイル冒頭〜インデックスを目視                         | 「区分」列が存在し全エントリに値が設定されている                                       |
| TC-002 | AC-002  | `task-workflow-completed.md` 冒頭5行確認                 | ファイル冒頭を目視                                       | `> 区分: 履歴記録（history record）` が含まれている                                    |
| TC-003 | AC-003  | `task-workflow-active.md` 冒頭5行確認                    | ファイル冒頭を目視                                       | `> 区分: 正本（current contract）` が含まれている                                      |
| TC-004 | AC-004  | `interfaces-skill-verify-contract.md` 概要セクション確認 | ファイル冒頭を目視                                       | `> 区分: 契約仕様（current contract / Check ID 体系）` が含まれている                  |
| TC-005 | AC-005  | 責務分離比較表の内容確認                                 | 追記先ファイルの該当セクションを目視                     | `verifySkill()`/`verifyAndImproveLoop()`/`verify()` の実装ファイル・責務・返却値が正確 |
| TC-006 | AC-006  | `task-workflow.md` 内のリンク有効性確認                  | リンク先ファイルのパス確認                               | 全リンクが有効なファイルを指している                                                   |
| TC-007 | NFR-003 | Prettier フォーマット確認                                | `pnpm prettier --check` 実行                             | 差分なし                                                                               |
| TC-008 | NFR-004 | Check ID 体系への影響確認                                | `interfaces-skill-verify-contract.md` の Check ID 数確認 | 19件のまま変化なし                                                                     |

---

## 完了確認

- [x] TC-001〜TC-008 が全て定義されている
- [x] 各 TC に期待結果が明記されている
- [x] Prettier 確認コマンドが記載されている
- [x] `outputs/phase-4/` に成果物が生成されている
