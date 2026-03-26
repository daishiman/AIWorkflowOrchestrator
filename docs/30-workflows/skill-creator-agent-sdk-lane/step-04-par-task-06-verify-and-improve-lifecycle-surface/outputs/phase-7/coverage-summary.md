# Coverage Summary

## coverage 判定

| 観点       | カバー対象                                           | 判定 |
| ---------- | ---------------------------------------------------- | ---- |
| flow       | `execute -> verify -> improve -> apply -> re-verify` | PASS |
| lane       | `integrated_api`, `terminal_handoff`                 | PASS |
| provenance | root / manifest / hash / route snapshot              | PASS |
| boundary   | Task05 / Task07 / Task08                             | PASS |

## 未カバーにしない条件

- verify の truth owner を renderer に複製しない
- terminal handoff を verify detail の代替実装にしない
- provenance 欠落時も panel 全体を閉じない
- future scope を current scope と同列に書かない
