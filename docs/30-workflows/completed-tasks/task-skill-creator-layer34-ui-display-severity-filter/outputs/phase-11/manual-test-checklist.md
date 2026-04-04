# Phase 11: 手動テストチェックリスト

## 機能テスト

| TC-ID | テスト項目             | 前提条件                | 実施可否         |
| ----- | ---------------------- | ----------------------- | ---------------- |
| MT-01 | デフォルトで全件表示   | verify detail 表示中    | 実施可能（手動） |
| MT-02 | warning+ フィルタ      | info/warning/error 混在 | 実施可能（手動） |
| MT-03 | error フィルタ         | info/warning/error 混在 | 実施可能（手動） |
| MT-04 | フィルタ解除           | warning+ 適用中         | 実施可能（手動） |
| MT-05 | Layer 非表示           | Layer4 に info のみ     | 実施可能（手動） |
| MT-06 | reverify 後 state 維持 | warning+ 適用中         | 実施可能（手動） |
| MT-07 | check 0件時            | check なし              | 実施可能（手動） |

## UI/UX 3層評価

| 評価軸   | 確認項目           | 実施可否         |
| -------- | ------------------ | ---------------- |
| Semantic | ラベル直感性       | 実施可能（手動） |
| Semantic | フィルタ適用明示   | 実施可能（手動） |
| Visual   | 8pxグリッド整合    | 実施可能（手動） |
| Visual   | ダークモード視認性 | 実施可能（手動） |
| Visual   | 既存UIとの一貫性   | 実施可能（手動） |
| AI UX    | 即時反映           | 実施可能（手動） |
| AI UX    | アニメーション競合 | 実施可能（手動） |

## スクリーンショット

Playwright harness により撮影済み。撮影計画は `screenshot-plan.md`、実体は `outputs/phase-11/screenshots/` を参照。
