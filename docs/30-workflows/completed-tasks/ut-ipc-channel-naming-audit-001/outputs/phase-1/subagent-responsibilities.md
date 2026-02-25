# Phase 1 SubAgent責務表

## チーム編成

| SubAgent          | 役割                | 入力                  | 出力                                     | 並列可否    |
| ----------------- | ------------------- | --------------------- | ---------------------------------------- | ----------- |
| A (Inventory)     | チャネル抽出・分類  | `preload/channels.ts` | `phase-5/channel-inventory.md`           | 可          |
| B (Audit)         | 命名規則照合        | Aの棚卸し, 命名規則   | `phase-5/channel-naming-audit-report.md` | A後に可     |
| C (Impact)        | 影響範囲/優先度付け | Bの違反一覧, `rg`結果 | `phase-5/channel-rename-plan.md`         | B途中から可 |
| Lead (Integrator) | 品質ゲート統合      | A/B/C成果物           | Phase 8-12成果物                         | 直列        |

## 境界条件

- Aは評価をしない（抽出と分類のみ）。
- Bはリネーム案を決めない（違反判定まで）。
- Cは判定ロジックを変更しない（影響評価のみ）。

## 引き継ぎ契約

- A→B: `key`, `value`, `domain` を必須。
- B→C: `violationType`, `ruleRef`, `evidenceCommand` を必須。
- C→Lead: `priority`, `scope`, `proposal`, `riskTag` を必須。
