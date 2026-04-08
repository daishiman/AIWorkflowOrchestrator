# Phase 1 要件確定レポート - UT-VERIFY-DOC-CONSOLIDATION-001

## 機能要件（FR）

| FR ID  | 要件                                                                                                       | 優先度 | 状態 |
| ------ | ---------------------------------------------------------------------------------------------------------- | ------ | ---- |
| FR-001 | `task-workflow.md` インデックステーブルに「区分」列（正本/履歴/契約仕様）を追加                            | must   | 確定 |
| FR-002 | `task-workflow-completed.md` 冒頭に `> 区分: 履歴記録（history record）` を追記                            | must   | 確定 |
| FR-003 | `task-workflow-active.md` 冒頭に `> 区分: 正本（current contract）` を追記                                 | must   | 確定 |
| FR-004 | `interfaces-skill-verify-contract.md` 冒頭に `> 区分: 契約仕様（current contract / Check ID 体系）` を追記 | must   | 確定 |
| FR-005 | verify エンジン責務分離セクション（3関数比較表）を `interfaces-skill-verify-contract.md` に追記            | must   | 確定 |

## 非機能要件（NFR）

| NFR ID  | 要件                                               | 優先度 | 状態 |
| ------- | -------------------------------------------------- | ------ | ---- |
| NFR-001 | 新規ファイルを作成しない（既存ファイルの改善のみ） | must   | 確定 |
| NFR-002 | 既存のリンク参照を破損しない                       | must   | 確定 |
| NFR-003 | Prettier フォーマットに準拠する                    | must   | 確定 |
| NFR-004 | Check ID 体系（19件）に影響を与えない              | must   | 確定 |

## 受け入れ基準（AC）

| AC ID  | 基準                                                                                      | 検証方法 | 状態 |
| ------ | ----------------------------------------------------------------------------------------- | -------- | ---- |
| AC-001 | `task-workflow.md` インデックスに「区分」列が存在する                                     | 目視確認 | 確定 |
| AC-002 | `task-workflow-completed.md` に「履歴記録」ラベルが含まれる                               | 目視確認 | 確定 |
| AC-003 | `task-workflow-active.md` に「正本」ラベルが含まれる                                      | 目視確認 | 確定 |
| AC-004 | `interfaces-skill-verify-contract.md` に「契約仕様」ラベルが含まれる                      | 目視確認 | 確定 |
| AC-005 | 責務分離比較表に `verifySkill()` / `verifyAndImproveLoop()` / `verify()` が記載されている | 目視確認 | 確定 |
| AC-006 | 全リンクが有効なファイルを指している                                                      | パス確認 | 確定 |

## 完了確認

- [x] 対象4ファイルの現状構造を確認済み
- [x] `RuntimeSkillCreatorFacade.ts` の `verifySkill()`/`verifyAndImproveLoop()` シグネチャを確認済み
- [x] `SkillCreatorVerificationEngine.ts` の `verify()` シグネチャを確認済み
- [x] FR-001〜FR-005 が確定している
- [x] AC-001〜AC-006 が確定している
- [x] `outputs/phase-1/` に成果物が生成されている
