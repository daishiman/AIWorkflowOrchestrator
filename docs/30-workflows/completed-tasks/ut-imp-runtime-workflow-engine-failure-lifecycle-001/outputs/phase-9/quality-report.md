# Quality Report

## 判定

PASS WITH KNOWN EXTERNAL FAILURE

## 確認結果

- targeted vitest: PASS
- phase artifacts append と transition guard が追加テストで固定された
- parent workflow 文書更新済み

## 実装反映先

| ディレクトリ       | 結果     |
| ------------------ | -------- |
| `apps/desktop/`    | 変更あり |
| `apps/backend/`    | 変更なし |
| `packages/shared/` | 変更なし |

## 残リスク

- `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts` の alias 解決失敗は別件として残る
