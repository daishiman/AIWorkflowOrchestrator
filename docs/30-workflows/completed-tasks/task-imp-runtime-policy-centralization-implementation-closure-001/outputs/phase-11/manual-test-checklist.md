# Phase 11 Manual Test Checklist

## 代表導線

| ID    | 導線                         | 確認内容                                                             |
| ----- | ---------------------------- | -------------------------------------------------------------------- |
| NV-01 | Agent integrated             | `integrated_api` で handoff せず既存 start フローへ進む              |
| NV-02 | Agent handoff                | `terminal_handoff` で guidance 理由に `manualRetryRule` が反映される |
| NV-03 | Skill integrated             | `integrated_api` で execute が継続する                               |
| NV-04 | Skill handoff                | `terminal_handoff` で guidance を返し実行しない                      |
| NV-05 | Skill backward compatibility | resolver 未注入でも既存 execute path が動く                          |
| NV-06 | Legacy presence              | `AI_CHECK_CONNECTION` が cleanup 前提として残存している              |

## UI / screenshot 判定

- renderer UI 差分なし
- screenshot 要件: 非該当
- 代替 evidence: main IPC runtime tests、baseline regression、code review
