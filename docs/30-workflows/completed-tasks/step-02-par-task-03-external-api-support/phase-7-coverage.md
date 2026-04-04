# Phase 7: カバレッジチェック -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 7                     |
| 機能名    | external-api-support  |
| タスクID  | TASK-SDK-SC-03        |
| 作成日    | 2026-04-02            |
| 依存Phase | Phase 6（テスト拡充） |

## 目的

`HttpExternalApiAdapter` を中心としたカバレッジ目標値を確認し、未カバーのブランチ・ラインを特定・補完する。
セキュリティ関連コード（`buildAuthHeader` / `warnIfNotHttps` / `setAuth`）は100%カバレッジを必須とする。

## Task 7-1: カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts \
  --coverage \
  --coverage.reporter=text \
  --coverage.include='src/main/services/runtime/adapters/HttpExternalApiAdapter.ts'
```

## Task 7-2: カバレッジ目標値

| ファイル                    | ライン目標 | ブランチ目標 | 関数目標 |
| --------------------------- | ---------- | ------------ | -------- |
| `HttpExternalApiAdapter.ts` | ≥80%       | ≥80%         | 100%     |

**セキュリティ関連コードの追加要件**:

| コード箇所                          | カバレッジ要件 | 理由                        |
| ----------------------------------- | -------------- | --------------------------- |
| `setAuth` メソッド全体              | 100%           | SEC-02（APIキーログ非出力） |
| `buildAuthHeader` の全branchケース  | 100%           | 認証4種類の網羅的テスト     |
| `warnIfNotHttps` のHTTPS/HTTP両分岐 | 100%           | SEC-01（HTTPS以外URL警告）  |

## Task 7-3: 必須カバレッジ項目チェック

### 認証種類

| 認証タイプ           | カバーするテスト | 確認  |
| -------------------- | ---------------- | ----- |
| `api-key`            | T-03             | - [ ] |
| `bearer`             | T-04             | - [ ] |
| `basic`              | T-05             | - [ ] |
| 認証なし（null状態） | T-11             | - [ ] |

### タイムアウト・エラー系

| シナリオ                   | カバーするテスト | 確認  |
| -------------------------- | ---------------- | ----- |
| タイムアウト（AbortError） | T-06             | - [ ] |
| HTTP 4xx（404）            | T-07             | - [ ] |
| HTTP 5xx（500）            | T-10             | - [ ] |
| ネットワークエラー         | T-09             | - [ ] |

### セキュリティ系（100%必須）

| シナリオ          | カバーするテスト | 確認  |
| ----------------- | ---------------- | ----- |
| APIキーログ非出力 | T-08             | - [ ] |
| HTTPS以外URL警告  | T-12             | - [ ] |

## Task 7-4: カバレッジ不足時の補完テスト候補

目標値を下回った場合、以下を追加する。

### T-14（補完用）: api-key認証でAuthorizationヘッダーが付与されない

```typescript
it("T-14: api-key認証ではAuthorizationヘッダーが付与されない（X-API-Keyのみ）", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  adapter.setAuth("api-key", "test-key");
  await adapter.get("https://api.example.com/resource");

  const calledHeaders = fetchMock.mock.calls[0][1].headers;
  expect(calledHeaders["X-API-Key"]).toBe("test-key");
  expect(calledHeaders["Authorization"]).toBeUndefined();
});
```

### T-15（補完用）: カスタムヘッダーが認証ヘッダーとマージされる

```typescript
it("T-15: カスタムヘッダーが認証ヘッダーにマージされる", async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  adapter.setAuth("bearer", "my-token");
  await adapter.get("https://api.example.com/resource", {
    "X-Request-Id": "test-123",
  });

  const calledHeaders = fetchMock.mock.calls[0][1].headers;
  expect(calledHeaders["Authorization"]).toBe("Bearer my-token");
  expect(calledHeaders["X-Request-Id"]).toBe("test-123");
});
```

## Task 7-5: カバレッジ計測結果の記録

```
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
HttpExternalApiAdapter.ts     |   ___%  |    ___%  |   ___%  |   ___%
```

（実装後に実際の数値を記入する）

## Task 7-6: 目標値判定

| 判定項目                            | 目標 | 実測  | 判定  |
| ----------------------------------- | ---- | ----- | ----- |
| ライン カバレッジ                   | ≥80% | \_\_% | - [ ] |
| ブランチ カバレッジ                 | ≥80% | \_\_% | - [ ] |
| 関数 カバレッジ                     | 100% | \_\_% | - [ ] |
| セキュリティ関連コード カバレッジ   | 100% | -     | - [ ] |
| 認証4種類すべてテスト済み           | 必須 | -     | - [ ] |
| タイムアウト・HTTP4xx/5xxテスト済み | 必須 | -     | - [ ] |

## 参照資料

| 資料名             | パス                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/step-02-par-task-03-external-api-support/phase-6-test-expansion.md` |

## 完了条件

- [ ] カバレッジ計測コマンドを実行した
- [ ] `HttpExternalApiAdapter.ts` のライン80%以上を達成した
- [ ] `HttpExternalApiAdapter.ts` のブランチ80%以上を達成した
- [ ] `HttpExternalApiAdapter.ts` の関数100%を達成した
- [ ] セキュリティ関連コード（setAuth / buildAuthHeader / warnIfNotHttps）が100%カバーされていることを確認した
- [ ] 認証4種類（none / api-key / bearer / basic）が全てテストされていることを確認した
- [ ] タイムアウト・HTTP 4xx / 5xx / ネットワークエラーが全てテストされていることを確認した

## 次の Phase: Phase 8（phase-8-refactoring.md）
