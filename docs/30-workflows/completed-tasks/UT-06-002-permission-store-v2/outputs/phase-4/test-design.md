# Phase 4: テスト設計書

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 4                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 実行結果

### テストファイル作成

| ファイル                                                                 | テスト数      | 状態                           |
| ------------------------------------------------------------------------ | ------------- | ------------------------------ |
| `packages/shared/src/types/__tests__/permission-store.test.ts`           | 10            | Green (calcExpiresAt 実装済み) |
| `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts` | 20 (V2追加分) | Red (V2メソッド未実装)         |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts`  | 4 (V2追加分)  | Red (ハンドラ未実装)           |

### テストケース一覧

#### calcExpiresAt (TC-CEA-01〜06) — 10テスト — Green

| ID        | テストケース             | 結果 |
| --------- | ------------------------ | ---- |
| TC-CEA-01 | session → undefined      | PASS |
| TC-CEA-02 | time_24h → +86400000     | PASS |
| TC-CEA-03 | time_7d → +604800000     | PASS |
| TC-CEA-04 | permanent → undefined    | PASS |
| TC-CEA-05 | allowedAt=0 エッジケース | PASS |
| TC-CEA-06 | 全ポリシー網羅性         | PASS |

#### isToolAllowed 6分岐フロー (TC-ITA-01〜08) — Red

| ID        | テストケース                         | 分岐     |
| --------- | ------------------------------------ | -------- |
| TC-ITA-01 | エントリなし → false                 | (1)      |
| TC-ITA-02 | expiresAt undefined → true           | (2)      |
| TC-ITA-03 | 期限切れ → 削除&false                | (3)      |
| TC-ITA-04 | 期限内 → true                        | (4)      |
| TC-ITA-05 | skillName不一致 → false              | (5)      |
| TC-ITA-06 | 全条件クリア → true                  | (6)      |
| TC-ITA-07 | entry.skillName undefined → 全スキル | (5) skip |
| TC-ITA-08 | session expiresAt undefined → 有効   | (2)      |

#### allowToolV2 (TC-ATV-01〜05) — Red

#### revokeSessionEntries V2 (TC-RSE-01〜04) — Red

#### V1→V2 Migration (TC-MIG-01〜03) — Red

#### IPC Handler clear-session (TC-IPC-01〜04) — Red

## 完了条件

- [x] テストケースが全 FR をカバーしている
- [x] 6分岐フローの全パスがテストケースに含まれている
- [x] P42準拠 3段バリデーションテストが含まれている
- [x] V1→V2 マイグレーションテストが含まれている
- [x] テストファイルの配置先がコード成果物ディレクトリになっている
- [x] **本Phase内の全タスクを100%実行完了**
