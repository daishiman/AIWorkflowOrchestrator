# Phase 6: テスト拡充サマリー

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-SW-CANCEL-004                                                      |
| Phase      | 6                                                                       |
| 作成日     | 2026-04-20                                                              |
| 対象テスト | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` |

## 1. 拡充判定結果

| 観点                              | 既存カバー               | 判定       |
| --------------------------------- | ------------------------ | ---------- |
| `abort()` 呼び出し                | T-2                      | OK         |
| ref clear                         | T-4 (間接)               | OK         |
| `setStage("cancelled")`           | T-3, T-4                 | OK         |
| IPC 呼び出し回数                  | T-2                      | OK         |
| undefined guard (start 前 cancel) | T-4                      | OK         |
| **IPC failure swallow (catch)**   | **未カバー**             | **追加要** |
| 連続呼び出し冪等性                | 現状非機能要件、追加不要 | skip       |

## 2. 追加内容

### 追加テストケース

- **名称**: `IPC cancelGeneration が reject してもエラーを伝播させず cancelled を維持する`
- **ファイル**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`（**既存ファイルへの追記**、新規ファイルなし）
- **観点**: C-6 (catch swallow の挙動観測)
- **手法**:
  - `vi.fn().mockRejectedValue(new Error(...))` で IPC reject をシミュレート
  - `expect(... cancelGeneration()).resolves.toBeUndefined()` で `throw` しないことを観測
  - `streamingStage` が `cancelled` のまま維持されることで local abort 優先の contract を証跡化

### 追加根拠

- Phase 5 の diff check で contract 完全一致を確認済み
- Phase 4 test-matrix.md で C-6 のみ Uncovered と判定済み
- `verify_existing` モードでも「既存実装を observability で補強する」targeted 追加は許可範囲

## 3. 連続呼び出し / start 前 cancel の取扱い

| ケース                          | 既存状況                                                                                                        | 判定     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| start 前 cancel                 | T-4 でカバー                                                                                                    | 追加不要 |
| 連続 cancel                     | contract 上明示要件なし（冪等性は副作用で担保）                                                                 | 追加不要 |
| start → cancel → start → cancel | abortControllerRef を null 後に再 `startGeneration` で再生成される設計。現行 T-1 + T-2 の組み合わせで型的に保障 | 追加不要 |

## 4. Phase 6 結論

- targeted 追加は **1 ケース**（IPC failure swallow）のみ
- 新規テストファイル作成なし
- コード本体 (`useCancelGeneration.ts`) の変更なし
