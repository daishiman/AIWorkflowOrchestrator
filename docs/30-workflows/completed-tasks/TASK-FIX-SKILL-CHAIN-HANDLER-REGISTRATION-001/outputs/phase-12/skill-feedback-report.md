# Phase 12: スキルフィードバックレポート

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| Phase    | 12 - Task 5: スキルフィードバック             |
| 作成日   | 2026-03-03                                    |

---

## 改善提案: 1件

| #     | 提案                                              | 対象スキル                 | 説明                                                                                      | 優先度 |
| ----- | ------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| SF-01 | registerAllIpcHandlers の静的チャンネル数チェック | task-specification-creator | 新規ハンドラ追加時に登録漏れを自動検出するテストパターンを Phase 4 テンプレートに追加推奨 | medium |

## SF-01 詳細

### 背景

本タスクの根本原因は、`registerSkillChainHandlers` が実装済みであるにもかかわらず、`registerAllIpcHandlers()` 内での呼出が漏れていたことである。

このパターンは今後も再発する可能性がある（新規 IPC ハンドラグループを追加する際に、実装はしたが登録関数への配線を忘れるケース）。

### 提案内容

`task-specification-creator` の Phase 4 テンプレートに、以下のテストパターンを追加することを推奨：

```typescript
// 回帰防止テスト: 全ハンドラ登録グループの呼出確認
describe("registerAllIpcHandlers - 完全性チェック", () => {
  it("should call all handler registration functions", () => {
    registerAllIpcHandlers(mockWindow);

    // 全てのハンドラ登録関数が呼ばれることを検証
    expect(registerAuthHandlers).toHaveBeenCalled();
    expect(registerSkillHandlers).toHaveBeenCalled();
    expect(registerSkillChainHandlers).toHaveBeenCalled();
    // ... 新規追加時はここにも追加
  });
});
```

### 期待効果

- 新規ハンドラグループ追加時に、Phase 4（テスト作成）で登録漏れチェックテストを含めることが標準化される
- Red テストで登録漏れが即座に検出される
- P5（リスナー二重登録）対策テストとの相乗効果

### ワークフロー改善点

1. Phase 4 テンプレートに「IPC ハンドラ登録完全性テスト」セクションを追加
2. 新規 IPC ハンドラタスクでは、実装だけでなく `registerAllIpcHandlers` への配線テストも必須とする
3. Phase 3（設計レビュー）で「registerAllIpcHandlers への追加が必要か」をチェック項目に含める
