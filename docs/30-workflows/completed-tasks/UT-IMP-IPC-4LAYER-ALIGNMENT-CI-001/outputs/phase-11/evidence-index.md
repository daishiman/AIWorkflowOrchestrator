# Phase 11 成果物: 証跡インデックス

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 11                                 |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |
| 判定   | NON_VISUAL                         |

## 証跡一覧

| 種別     | コマンド / ファイル                                                     | 役割                   | 結果                                                  |
| -------- | ----------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| 実行証跡 | `node scripts/verify-ipc-4layer.cjs`                                    | 4層整合の実コード検証  | Rule-1: 12 missing / Rule-2: 8 missing / Rule-3: PASS |
| 実行証跡 | `/usr/bin/time -p node scripts/verify-ipc-4layer.cjs`                   | 実行時間の確認         | `real 0.00` (計測丸め)                                |
| 実行証跡 | `pnpm vitest run scripts/__tests__/verify-ipc-4layer`                   | ユニットテスト全件確認 | 4 files / 113 tests / all pass                        |
| 実行証跡 | `python3 -c \"import yaml; ...\"`                                       | CI YAML 構文確認       | `VALID`                                               |
| 実行証跡 | `node -e \"const m = require('./scripts/verify-ipc-4layer.cjs'); ...\"` | CommonJS export 確認   | 20 exports                                            |

## 補足

- `screenshots/` は作成していない。対象は CLI スクリプトであり、UI 描画は伴わない。
- `screenshot-plan.json` は作成していない。NON_VISUAL のため不要である。
- 上記証跡は `outputs/phase-11/manual-test-result.md` の要約元である。
