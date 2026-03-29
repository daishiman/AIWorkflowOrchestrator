# UT-TASK-RT-04-PHASE11-SCREENSHOT-EVIDENCE-001: TASK-RT-04 Phase 11 スクリーンショット証跡補完

## メタ情報

| 項目       | 内容                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| タスクID   | UT-TASK-RT-04-PHASE11-SCREENSHOT-EVIDENCE-001                                          |
| ステータス | resolved                                                                               |
| 発見元     | TASK-RT-04 Phase 11/12 review                                                          |
| 発見日     | 2026-03-29                                                                             |
| 優先度     | 高                                                                                     |
| 種別       | テスト証跡                                                                             |
| 関連仕様書 | docs/30-workflows/step-08-par-task-rt-04-api-key-management-ui/phase-11-manual-test.md |

## 背景

UI task の Phase 11 で必須となる screenshot evidence（TC-11-01〜03）は存在していたが、
当初は `phase11-capture-metadata.json` が `upstream_fallback` で記録されていた。
2026-03-29 に current build 用 harness / capture script を追加し、再撮影で解消した。

## 対応内容

1. `apps/desktop/scripts/capture-task-rt-04-api-key-management-ui-phase11.mjs` を追加し、以下3枚を current build で再撮影する。

- `outputs/phase-11/screenshots/TC-11-01-skill-authkey-initial.png`
- `outputs/phase-11/screenshots/TC-11-02-skill-authkey-action.png`
- `outputs/phase-11/screenshots/TC-11-03-skill-authkey-fallback.png`

2. `manual-test-result.md` ほか Phase 11/12 成果物の fallback 前提文言を current facts に更新する。
3. `phase11-capture-metadata.json` の `captureMethod` を current build 実撮影へ更新する。

## 受入基準

- [x] 3つの PNG が指定パスに存在する
- [x] TC-ID と証跡の紐付けが `screenshot-coverage.md` で PASS になっている
- [x] Phase 11 blocker が解消されている
