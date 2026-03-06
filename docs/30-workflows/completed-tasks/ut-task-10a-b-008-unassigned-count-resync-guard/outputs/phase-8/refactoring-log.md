# Phase 8 リファクタリング記録

## 実施内容

- `active` と `completed` を同じ表に混在させる構造を解消
- ledger 同期確認を `validate-task10ab-ledger-sync.js` に抽出
- completed 指示書の stale duplicate を削除して物理配置を整理

## 影響

- 参照先が明確になり、固定レンジ依存を除去
- derived ledger の更新手順が単純化
