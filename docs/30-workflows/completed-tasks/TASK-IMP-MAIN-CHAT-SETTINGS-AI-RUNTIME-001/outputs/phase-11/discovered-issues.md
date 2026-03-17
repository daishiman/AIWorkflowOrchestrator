# Phase 11: 発見課題一覧

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 11                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | discovered-issues.md                       |
| 作成日   | 2026-03-17                                 |

---

## 1. 発見課題一覧

| ID      | 重要度 | カテゴリ | テストID               | 発見内容                                                                                                 | 対応方針                                            |
| ------- | ------ | -------- | ---------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| DI-0001 | 中     | IPC契約  | MT-20                  | `AI_CHECK_CONNECTION` が実装上 legacy として残存し、Task06 文書の「廃止完了」記述と衝突                  | `UT-TASK06-004` で legacy 廃止/移行判定を formalize |
| DI-0002 | 中     | 仕様同期 | MT-19                  | RAG state の Main authority 昇格後、IPC仕様（state取得/通知）の正本追記が未完了                          | `UT-TASK06-001` で RAG IPC 仕様化                   |
| DI-0003 | 低     | UX/性能  | MT-12                  | `apiKey.validate()` の 300ms デバウンスはあるが、Main側レート制御・UI待機状態の契約が未固定              | `UT-TASK06-002` で完全実装                          |
| DI-0004 | 低     | UI統合   | MT-05, MT-24, TC-11-04 | AccountSection header 統合と terminal launcher 常設導線の完全同期が未完了（Phase11ハーネスでも PARTIAL） | `UT-TASK06-003` で統合実装                          |

---

## 2. 手動テスト実施状況（2026-03-17 13:19 JST）

| テスト区分                 | 対象     | 実施状況                    |
| -------------------------- | -------- | --------------------------- |
| Settings access capability | TC-11-01 | PASS                        |
| selector / prompt 同期     | TC-11-02 | PARTIAL（ハーネス範囲制約） |
| health / RAG guidance      | TC-11-03 | PASS                        |
| terminal launcher 常設導線 | TC-11-04 | PARTIAL（要素検出未達）     |

---

## 3. Phase 12 連携

本ファイルの DI-0001〜0004 は Phase 12 Task 4 で未タスクとして formalize し、
以下へ同期済み:

- `outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/unassigned-task/UT-TASK06-001-rag-ipc-spec.md`
- `docs/30-workflows/unassigned-task/UT-TASK06-002-api-key-debounce.md`
- `docs/30-workflows/unassigned-task/UT-TASK06-003-account-section-header.md`
- `docs/30-workflows/unassigned-task/UT-TASK06-004-ai-check-connection-cleanup.md`
