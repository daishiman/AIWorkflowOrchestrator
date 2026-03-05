# Phase 7 未到達分析

## 未到達の主要因

| ファイル                   | 未到達の主因                                            | 補完方針                       |
| -------------------------- | ------------------------------------------------------- | ------------------------------ |
| `profileHandlers.ts`       | DB/Storage/認証失敗の分岐が多く、今回対象外の経路が多い | `PROFILE_*` 異常系を段階追加   |
| `AccountSection/index.tsx` | Portal UI操作の全分岐（削除確認/アバター操作）未網羅    | UIタスク時にe2e/視覚ケース拡充 |
| `authSlice.ts`             | 既存広範囲機能（offline/session/未実装系）未網羅        | 現タスク対象外のため今回は維持 |

## 補完優先度

1. `profileHandlers.ts` の unlink関連異常系
2. `AccountSection` の視覚導線（必要時）
3. `authSlice` の低頻度分岐
