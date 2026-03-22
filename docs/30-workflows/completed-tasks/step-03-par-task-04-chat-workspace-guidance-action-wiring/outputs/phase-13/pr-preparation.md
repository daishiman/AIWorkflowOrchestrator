# Phase 13: PR準備メモ

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 13                                                 |
| 作成日   | 2026-03-22                                         |

## 1. PR blocked 条件

- ユーザーの明示的な指示なしにコミット・PR を作成しない
- 本タスクは設計タスクのため、PR はドキュメント変更のみを含む

## 2. PR 準備チェックリスト

- [x] 全 Phase (1-12) の成果物が outputs/ に配置済み
- [x] artifacts.json の更新方針が確認済み
- [x] AC-1〜AC-5 が設計で充足されている
- [x] Phase 3 / Phase 10 の gate が PASS

## 3. PR 本文テンプレート

```markdown
## Summary

- Main Chat / Workspace の blocked guidance action wiring を設計
- blocked reason -> action mapping、store/controller boundary、surface 間 copy consistency を定義
- 選択肢 B（共有 Hook: useBlockedGuidance）を採用

## Test Plan

- [ ] outputs/phase-1〜13 の全成果物が配置されている
- [ ] AC-1〜AC-5 の設計充足を確認
- [ ] Phase 3 / Phase 10 の gate が PASS
```

## 4. Handover 情報

### レビュー担当が見るべきドキュメント

| 優先度 | ドキュメント                             | 内容                   |
| ------ | ---------------------------------------- | ---------------------- |
| 必須   | outputs/phase-2/design-summary.md        | 設計判断と根拠         |
| 必須   | outputs/phase-2/contract-matrix.md       | state/action ownership |
| 推奨   | outputs/phase-5/implementation-plan.md   | 実装順序               |
| 推奨   | outputs/phase-9/risk-register.md         | 残余リスク             |
| 参考   | outputs/phase-12/implementation-guide.md | 実装ガイド             |

### 残余リスク要約

| リスク                   | 緩和策                   |
| ------------------------ | ------------------------ |
| openTerminal placeholder | Task06 完了後に実装      |
| retryConnection 未定義   | 後続タスクで IPC 定義    |
| 複数 reason 優先度       | 後続タスクでロジック実装 |

## 5. 現時点のステータス

**PR 作成は blocked（ユーザー指示待ち）**
