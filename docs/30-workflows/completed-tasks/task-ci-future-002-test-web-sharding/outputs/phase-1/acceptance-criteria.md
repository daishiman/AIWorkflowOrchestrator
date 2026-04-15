# 受入基準（AC-1〜AC-6）

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 受入基準一覧

| AC番号 | 受入基準                                                                                                                 | 検証方法                                           | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------ |
| AC-1   | `test-web` ジョブが設定したシャード数（2）に分割されて CI 上で実行される                                                 | `ci.yml` の matrix 設定確認 / CI 実行ログ確認      | 必須   |
| AC-2   | 全シャードが CI 上で PASS する                                                                                           | CI 実行結果確認                                    | 必須   |
| AC-3   | `test-desktop + test-web + typecheck + test-shared + e2e-desktop` の並列数合計が GitHub Free Tier 上限 20 以内に収まる   | 計算式検証: 15+2+1+1+1=20                          | 必須   |
| AC-4   | シャード化後の `test-web` 最長シャード実行時間がベースライン（単一ジョブ実行時間）を上回らない                           | 実行時間計測比較                                   | 必須   |
| AC-5   | シャード数の計算根拠（`20 - (test-desktop + typecheck + test-shared + e2e-desktop)` の計算式と結果）が文書化されている   | `outputs/phase-2/shard-count-design.md` の存在確認 | 必須   |
| AC-6   | 変更が CI 設定ファイル（`.github/workflows/ci.yml`）のみに限定される（`apps/backend/vitest.config.ts` は修正不要と判明） | `git diff --name-only` による変更範囲確認          | 必須   |

## 補足: apps/web と apps/backend の関係

タスク仕様書は `apps/web` および `@repo/web` を参照しているが、実際のコードベースでは：

- **実在パス**: `apps/backend/`
- **パッケージ名**: `@repo/backend`
- **vitest設定**: `apps/backend/vitest.config.ts`（シャード対応済み: 設定変更不要）

この乖離はPhase 1 の P50 チェックで確認済み。CI 実装では `@repo/backend` を使用する。
