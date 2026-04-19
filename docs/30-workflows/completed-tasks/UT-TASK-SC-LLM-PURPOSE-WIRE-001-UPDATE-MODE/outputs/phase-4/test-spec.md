# Phase 4: テスト仕様書

## 追加テストケース

### update モード dispatch テスト

| ID         | テスト内容                                   | 検証方法                            | TDD状態 |
| ---------- | -------------------------------------------- | ----------------------------------- | ------- |
| SC-UPD-001 | runUpdateWorkflow が1回呼ばれること          | vi.spyOn + toHaveBeenCalledOnce()   | Green   |
| SC-UPD-002 | init_skill.js が呼ばれないこと               | execute.mock.calls フィルター       | Green   |
| SC-UPD-003 | エラー発生時に処理が中断されること           | mockRejectedValue + rejects.toThrow | Green   |
| SC-UPD-004 | create モードで runUpdateWorkflow 非呼び出し | not.toHaveBeenCalled() (回帰)       | Green   |

### improve-prompt モード dispatch テスト

| ID         | テスト内容                                 | 検証方法                          | TDD状態 |
| ---------- | ------------------------------------------ | --------------------------------- | ------- |
| SC-IMP-001 | runImprovePromptWorkflow が1回呼ばれること | vi.spyOn + toHaveBeenCalledOnce() | Green   |
| SC-IMP-002 | init_skill.js が呼ばれないこと             | execute.mock.calls フィルター     | Green   |

## TDD サイクル確認

| ステップ | 状態     | 説明                                       |
| -------- | -------- | ------------------------------------------ |
| Red      | 確認済み | Phase 4 追加時点でメソッド未実装のため失敗 |
| Green    | 完了     | Phase 5 実装後に全件 Green                 |
| Refactor | 完了     | Phase 8 でリファクタリング不要を確認       |
