# Phase 2 変更計画書 - UT-VERIFY-DOC-CONSOLIDATION-001

## 変更対象一覧

| #   | ファイルパス                                                                            | 変更内容                                                                                                            | 変更種別         |
| --- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | インデックステーブルに「区分」列を追加                                                                              | 既存ファイル編集 |
| 2   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`          | `> 役割: completed records` 直後に `> 区分: 履歴記録（history record）` を追記                                      | 既存ファイル編集 |
| 3   | `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`             | `> 役割: active guide` 直後に `> 区分: 正本（current contract）` を追記                                             | 既存ファイル編集 |
| 4   | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | H1 後に `> 区分: 契約仕様（current contract / Check ID 体系）` を追記 + `## verify エンジン責務分離` セクション追加 | 既存ファイル編集 |

**新規ファイル作成: なし**（NFR-001 準拠）

---

## 変更順序（依存関係）

Phase 5 での実施順序:

1. **task-workflow-completed.md** — 依存なし、単純追記
2. **task-workflow-active.md** — 依存なし、単純追記
3. **interfaces-skill-verify-contract.md** — 依存なし（ラベル追記 → 責務分離セクション追加の順）
4. **task-workflow.md** — 上記3ファイルの変更確定後（区分値の一貫性確認のため最後に実施）

各ファイルは独立しているため SubAgent 並列実行可能。

---

## リスクと影響範囲

| リスク                            | 影響度 | 発生確率 | 対策                                                                                             |
| --------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------ |
| `task-workflow.md` のリンクが破損 | 中     | 低       | ファイル名変更なし、アンカー変更なしのため影響なし                                               |
| Check ID 体系（19件）への影響     | 高     | 低       | `interfaces-skill-verify-contract.md` への追記はセクション末尾のみ、既存 Check ID 行を変更しない |
| Prettier フォーマット差分         | 低     | 中       | Phase 9 で `pnpm prettier --write` を実行して対応                                                |
| 既存 `> 役割:` 記述の上書き       | 中     | 低       | 上書きではなく直後への追記のみ                                                                   |

---

## 完了確認

- [x] 変更対象の網羅性（4ファイル + 責務分離追記先）
- [x] 既存リンクへの影響が評価されている
- [x] Check ID 体系（19件）への影響が評価されている
- [x] 変更順序（依存関係）が確定している
