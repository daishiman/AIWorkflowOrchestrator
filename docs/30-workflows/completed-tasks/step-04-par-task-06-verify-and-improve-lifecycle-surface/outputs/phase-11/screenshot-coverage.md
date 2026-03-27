# Screenshot Coverage

## 目的

Phase 11 の capture plan と current workflow root の証跡チェーンを対応付ける。

## coverage

| ID    | surface                                | 期待証跡              | 現在の状態                                               |
| ----- | -------------------------------------- | --------------------- | -------------------------------------------------------- |
| MT-01 | `integrated_api` verify detail         | actual PNG + metadata | `TC-11-01-verify-detail-review-board.png` で代替確認済み |
| MT-03 | `integrated_api` apply result          | actual PNG + metadata | metadata のみ                                            |
| MT-05 | `terminal_handoff` guidance side panel | actual PNG + metadata | metadata のみ                                            |

## fallback evidence chain

- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- `outputs/phase-11/manual-test-result.md`

## 判定

- screenshot file requirement: PASS
- actual screenshot evidence: BLOCKED
