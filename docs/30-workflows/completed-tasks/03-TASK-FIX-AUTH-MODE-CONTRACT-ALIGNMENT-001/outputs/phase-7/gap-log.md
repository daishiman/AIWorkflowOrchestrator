# Phase 7: gap log

## 監査結果

| ID        | 区分                   | 不足/懸念                                                                                       | owner                                         | 戻り先 Phase | 状態         |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------ | ------------ |
| GAP-07-01 | numerical coverage     | workspace global threshold は今回の touched scope と一致しない                                  | SubAgent-Spec-Sync 相当                       | Phase 8      | 受容済み     |
| GAP-07-02 | type ownership         | shared に新 DTO を集約したが、internal service 側には旧来の internal type が残る                | SubAgent-Contract-Main 相当                   | Phase 8      | 受容済み     |
| GAP-07-03 | excluded file evidence | `preload/index.ts`, `preload/types.ts`, `store/index.ts` は coverage 除外のため別根拠明記が必要 | SubAgent-Bridge-Preload / Renderer-State 相当 | Phase 8      | 解消方針確定 |
| GAP-07-04 | manual evidence        | UI の event 反映と restart restore は自動テストだけでは画面証跡が不足                           | SubAgent-Renderer-State 相当                  | Phase 11     | 未着手       |

## Phase 8 へ渡す refactor ポイント

1. public type owner は shared に固定し、internal type は internal 用と明示する。
2. event path の所有を `AuthModeChangedEvent` に一本化し、旧 payload 名を public surface に戻さない。
3. coverage 除外ファイルの根拠を refactor checklist に残す。

## blocker 判定

- blocker は 0 件
- gap はすべて次 Phase で説明可能なレベル
