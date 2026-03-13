# Phase 8 リファクタリング記録

## 集約したもの

| 項目                            | Before                                               | After                                                             |
| ------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| readiness / probe orchestration | capture script 内で直接実行                          | shared core へ集約                                                |
| localhost fallback              | capture script が `phase11-static-server` を直接利用 | shared core が helper を呼び、capture は consumer 化              |
| report schema                   | wrapper / metadata で別管理                          | `bundleName`, `timestamp`, `summary`, `checks`, `guidance` に統一 |

## 境界整理

- shared core: 判定、blocked、guidance、cleanup
- CLI wrapper: argv、write、stdout、exit code
- capture script: screenshot 実行、metadata 保存
- static server helper: localhost serve primitive

## 維持した制約

- remediation UI 修正は scope 外
- baseUrl auto serve は loopback のみ
