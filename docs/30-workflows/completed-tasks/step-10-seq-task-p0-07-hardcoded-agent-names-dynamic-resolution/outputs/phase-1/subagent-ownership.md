# subagent-ownership.md — Phase 1 成果物

## 関心分離と並列実行計画

### 担当分割

| SubAgent   | 担当                     | 成果物                     | 並列性     |
| ---------- | ------------------------ | -------------------------- | ---------- |
| SubAgent-A | skill 準拠監査           | skill-compliance-audit     | B と並列可 |
| SubAgent-B | 差分棚卸し               | spec-extraction-map        | A と並列可 |
| SubAgent-C | 設計（Phase 2）          | design-document            | A/B 後     |
| SubAgent-D | テスト作成（Phase 4）    | test-matrix + テストコード | C 後       |
| SubAgent-E | 実装（Phase 5）          | コード変更                 | D 後       |
| SubAgent-F | 品質保証（Phase 9）      | qa-report                  | E 後       |
| SubAgent-G | ドキュメント（Phase 12） | implementation-guide 他    | F 後       |

### 直列制約

```
A,B → C → D → E → F → G
```

### 並列可能部分

- A と B は同時実行可（情報源が独立）
- Phase 9 の lint/typecheck と リンク確認は同時実行可
- Phase 12 の 5 成果物は SubAgent 分割可

## 完了宣言

SubAgent 分担と並列/直列制約を記録した。
