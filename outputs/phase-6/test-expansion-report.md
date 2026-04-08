# Phase 6: テスト拡充レポート — UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## 実施日時

2026-04-07

---

## 追加テストケース一覧

| テストID | 説明                                                                                    | 結果 |
| -------- | --------------------------------------------------------------------------------------- | ---- |
| TC-01    | フックレンダリング時に buildMainlineExecutionAccessState に healthPolicy が渡されること | PASS |
| TC-02    | デフォルト状態で healthPolicy.healthStatus = "unknown" が渡されること                   | PASS |
| TC-03    | disconnected 状態で apiKeyDegraded 独自ロジックが除去されていること                     | PASS |
| TC-04    | connected 状態で healthPolicy.isConnectionAvailable = true になること                   | PASS |
| TC-05    | disconnected + lastHealthCheck あり で healthPolicy.healthStatus = "unhealthy"          | PASS |
| TC-6-1-1 | プロバイダー未選択時は healthPolicy.healthStatus = "unknown" になること                 | PASS |
| TC-6-1-2 | プロバイダーIDあり・healthStatus なしも "unknown" になること                            | PASS |
| TC-6-3-1 | connected 状態で healthPolicy.healthStatus = "healthy" になること                       | PASS |
| TC-6-3-2 | disconnected 状態で healthPolicy.healthStatus = "unhealthy" になること                  | PASS |
| TC-6-3-3 | error 状態で healthPolicy.healthStatus = "unhealthy" になること                         | PASS |

**合計: 10 テスト / 10 PASS / 0 FAIL**

---

## テスト戦略の記録

### vi.mock の制約と対応

Vitest `pool: "forks"` + `isolate: true` 環境において、`vi.mock("@repo/shared/types", ...)` がプロダクションコードのモジュールインスタンスを intercept できないことが判明した。

**原因**: package.json `exports` フィールドによる dist ファイル解決（`dist/src/types/index.js`）と、tsconfigPaths によるソースファイル解決（`src/types/index.ts`）の二経路が存在し、モック登録パスとプロダクションコードの解決パスが不一致になる。

**対応**: `resolveHealthPolicy` を直接スパイせず、モック済みの `buildMainlineExecutionAccessState` への引数（`healthPolicy`）を通じて統合的に検証するアプローチを採用。実際の `resolveHealthPolicy` 実行結果（純粋関数・決定論的）を利用することで、より実態に即したテストになった。

---

## TODO コメント一覧（将来対応）

```typescript
// TODO(UT-HEALTH-POLICY-MAINLINE-MIGRATION-001):
// isRateLimited が true の場合、resolveHealthPolicy() が
// DEGRADED または BLOCKED を返すよう将来拡張予定。
// 設計確定後に以下テストを有効化すること。
```

配置場所: `useMainlineExecutionAccess.test.ts` の末尾コメントブロック

---

## 次フェーズへの引き継ぎ事項

- 全テスト PASS 確認済み → Phase 7 カバレッジ確認へ進む
- `validateAllModes` および `refreshHealth` 関数のカバレッジが未達の可能性あり（Phase 7 で確認）
