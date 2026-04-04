# Unassigned Task Detection

## 結論

大きな follow-up は 4 件ある。いずれも今回のレビューでは安全に即時実装しない方がよいと判断した。

## follow-up

| ID                                                | 内容                                               | 理由                                            |
| ------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| UT-10                                             | `disclosureHandlers.ts` 独立テスト作成             | 既存 backlog 管理対象。今回の review では未着手 |
| UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001       | `pushApprovalRequest()` の production 発火元を接続 | 輸送経路はあるが、自動発火 producer が未接続    |
| UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001    | disclosure 情報を runtime から注入                 | 現在は static metadata を返す placeholder 実装  |
| UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 | Advanced Console を実セッションログへ接続          | 現在は `[]` / `null` を返す placeholder 実装    |

## 補足

- `manual-test-result.md` は current facts として `passed` に更新済み。Phase 11 は `NON_VISUAL` 前提で閉じる。
- follow-up は「実装が全くない」ではなく、runtime producer / runtime injection / session log service の別 concern を formalize したもの。
