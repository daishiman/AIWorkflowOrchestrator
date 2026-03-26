# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 8                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

route rule、handoff copy、approval/disclosure wording、shared contract 参照の重複を削り、governance を読みやすく保つ。

## 実行タスク

- policy / UI / IPC wording の重複を削る
- Skill Creator 固有 rule と shared governance rule を分離する
- `HandoffGuidance` / `TerminalHandoffBundle` / disclosure summary の命名を整理する

## リファクタリング観点

- route decision は `RuntimePolicyResolver` 側、表示 copy は surface 側と責務分離する
- approval と disclosure を同じ「安全ガード」説明に押し込めない
- Skill Creator 独自 DTO を増やさず shared 型へ寄せる
- console-only handoff の暫定コメントや TODO を残さない

## 参照資料

| 資料名           | パス                        | 説明              |
| ---------------- | --------------------------- | ----------------- |
| Phase 1 要件     | `phase-1-requirements.md`   | governance 要件   |
| Phase 2 設計     | `phase-2-design.md`         | topology / naming |
| Phase 5 実装     | `phase-5-implementation.md` | 実装対象          |
| Phase 6 拡充     | `phase-6-test-expansion.md` | edge case         |
| Phase 7 coverage | `phase-7-coverage-check.md` | coverage 観点     |

## 成果物

| 成果物           | パス                     | 説明             |
| ---------------- | ------------------------ | ---------------- |
| refactoring note | `phase-8-refactoring.md` | 命名と責務の整理 |

## 統合テスト連携

- wording の整理後も shared contract / visible handoff / approval token の回帰観点を保持する

## 完了条件

- [ ] governance rule の重複が整理されている
- [ ] shared / per-surface の責務が分離されている
- [ ] console-only handoff を許容しない方針が維持されている
- [ ] **本Phase内の全タスクを100%実行完了**
