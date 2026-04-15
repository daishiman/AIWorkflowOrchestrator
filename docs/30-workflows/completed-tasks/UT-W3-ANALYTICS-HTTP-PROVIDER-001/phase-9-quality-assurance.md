# Phase 9: 品質保証 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 9                                                       |
| Phase名    | 品質保証                                                |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                       |
| タイトル   | Analytics HTTP プロバイダー実装（外部分析基盤への接続） |
| 前提Phase  | Phase 8: リファクタリング                               |
| 次Phase    | Phase 10: 最終レビューゲート                            |
| ステータス | pending                                                 |
| 作成日     | 2026-04-14                                              |

## 目的

Phase 5〜8 で実装・テスト・リファクタリングした成果物に対して静的解析・セキュリティ・
パフォーマンス・後方互換性の 4 観点から品質ゲートを実施する。
全ゲートを通過した場合のみ Phase 10（最終レビュー）へ進む。

## 実行タスク

### Task 9-1: 静的解析

#### pnpm typecheck

TypeScript コンパイラによる型チェックを実行し、型エラーが 0 件であることを確認する。

```bash
pnpm --filter @repo/desktop typecheck
# または
pnpm typecheck
```

| 確認観点                                           | 判定基準                           |
| -------------------------------------------------- | ---------------------------------- |
| `AnalyticsHttpProvider.ts` に型エラーがない        | exit code 0                        |
| `analyticsHandler.ts` に型エラーがない             | exit code 0                        |
| `channels.ts` の型変更が呼び出し側に影響していない | 関連ファイルに型エラーがない       |
| `any` 型の使用がない                               | `noImplicitAny: true` でエラーなし |

#### pnpm lint

ESLint による静的解析を実行し、lint エラーが 0 件であることを確認する。

```bash
pnpm --filter @repo/desktop lint
# または
pnpm lint
```

| 確認観点                                             | 判定基準                                 |
| ---------------------------------------------------- | ---------------------------------------- |
| `@typescript-eslint/no-explicit-any` 違反がない      | lint エラー 0 件                         |
| `@typescript-eslint/no-floating-promises` 違反がない | 未処理 Promise がない                    |
| `no-console` 違反がない（本番コード）                | console.log が残存していない             |
| `exhaustive-deps` 違反がない                         | useEffect 依存配列が適切（N/A for Main） |

**lint エラー発生時の対処手順**:

1. エラーメッセージを確認し、該当箇所を特定する
2. 自動修正可能な場合: `pnpm lint --fix` を実行する
3. 自動修正不可の場合: 手動で修正する
4. 修正後に `pnpm --filter @repo/desktop test` を再実行して回帰がないことを確認する

---

### Task 9-2: セキュリティチェック

#### ANALYTICS_ENDPOINT_URL バリデーション

環境変数から取得した URL が悪意ある値でも安全に動作することを確認する。

| チェック項目                 | 確認観点                                                    | 判定基準                       |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------ |
| URL 形式バリデーション       | `http://` または `https://` で始まる URL のみ受け付けること | 不正 URL 時に no-op で動作する |
| `file://` スキームの拒否     | ローカルファイルへのアクセスを防ぐこと                      | `file://` 時は送信しない       |
| `javascript:` スキームの拒否 | XSS 攻撃ベクターを閉じること                                | `javascript:` 時は送信しない   |
| 空文字・null の扱い          | AC-5 に準拠して no-op で動作すること                        | 送信されない                   |

```typescript
// バリデーション実装例（確認用）
function isValidEndpointUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
```

#### HTTP 送信ペイロードのサニタイズ

`eventName` および `payload` に機密情報が混入しないことを確認する。

| チェック項目                                   | 確認観点                                             | 判定基準                            |
| ---------------------------------------------- | ---------------------------------------------------- | ----------------------------------- |
| `eventName` に認証トークンが含まれていない     | テストケースで確認済みであること                     | TC-12 等で検証済み                  |
| `payload` に `password` / `token` が含まれない | ペイロード送信前に機密フィールドをフィルタする設計か | フィルタリング実装または仕様明記    |
| ログ出力に `payload` 全量が出力されない        | デバッグログに機密情報が含まれないこと               | `console.log(payload)` が残存しない |

#### 認証情報のログ出力禁止確認

```bash
# 機密情報のログ出力がないことをコード検索で確認する
grep -rn "console.log.*payload\|console.log.*token\|console.log.*password" \
  apps/desktop/src/main/services/analytics/ \
  apps/desktop/src/main/ipc/analyticsHandler.ts
```

判定基準: 上記コマンドの出力が 0 件であること

---

### Task 9-3: パフォーマンス確認

#### タイムアウト 5 秒の妥当性

| 確認項目                                               | 根拠・判定基準                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| 5 秒タイムアウトが Main プロセスをブロックしない設計か | `analyticsHandler.ts` での `await` が IPC レスポンスを遅延させていないこと |
| Electron の IPC タイムアウト（デフォルト）との整合性   | IPC 呼び出し側（Renderer）が 5 秒以内に応答を受け取れること                |
| ユーザー操作への影響                                   | analytics 送信の遅延が UI のフリーズを引き起こさないこと                   |

確認観点:

- [ ] `analyticsHandler.ts` の IPC ハンドラが `async` で非同期処理されていること
- [ ] analytics 送信の失敗がアプリ動作に影響しないこと（エラー非伝播設計）
- [ ] タイムアウト値 `TIMEOUT_MS = 5000` が定数として管理されていること

#### リトライによる最大待機時間（最悪ケース）

指数バックオフを使用する場合の最大待機時間を算出し、許容範囲内であることを確認する。

| リトライ回 | バックオフ待機時間 | HTTP タイムアウト | 合計（1 回あたり） |
| ---------- | ------------------ | ----------------- | ------------------ |
| 1 回目     | 0 ms（初回）       | 5,000 ms          | 5,000 ms           |
| 2 回目     | 100 ms             | 5,000 ms          | 5,100 ms           |
| 3 回目     | 200 ms             | 5,000 ms          | 5,200 ms           |
| **合計**   | **300 ms**         | **15,000 ms**     | **15,300 ms**      |

判定基準: 最悪ケースで約 **15.3 秒** の待機時間となること。
この時間が Electron の IPC タイムアウト設定と矛盾しないことを確認する。

---

### Task 9-4: 後方互換性確認

#### 既存 analytics:send IPC 型契約の維持

`packages/shared/src/ipc/channels.ts` の `analytics:send` チャンネル定義が
変更前後で型シグネチャを維持していることを確認する。

| 確認項目                         | 変更前型シグネチャ                         | 変更後型シグネチャ    | 判定 |
| -------------------------------- | ------------------------------------------ | --------------------- | ---- |
| `AnalyticsSendRequest.eventName` | `string`                                   | `string`              | 維持 |
| `AnalyticsSendRequest.payload`   | `Record<string, unknown>` または `unknown` | 同左                  | 維持 |
| `AnalyticsSendRequest.timestamp` | `number`                                   | `number`              | 維持 |
| `AnalyticsSendResponse.success`  | `boolean`                                  | `boolean`             | 維持 |
| `AnalyticsSendResponse.error`    | `string \| undefined`                      | `string \| undefined` | 維持 |

確認観点:

- [ ] Renderer 側の `analytics.send()` 呼び出しコードに変更が不要であること
- [ ] Preload の `contextBridge.exposeInMainWorld` に変更が不要であること
- [ ] `channels.ts` のチャンネル名 `analytics:send` が変更されていないこと

#### analyticsStore 既存フィールドへの影響なし

| 確認項目                                        | 確認観点                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| `analyticsStore` の既存フィールドへの破壊的変更 | `sentCount` / `failedCount` 以外のフィールドが変更されていないこと |
| electron-store のスキーマ互換性                 | 既存のストアデータが新スキーマで読み込めること                     |
| マイグレーション処理の有無                      | スキーマ拡張時にマイグレーション実装が必要か確認する               |

## 品質ゲート

以下の全項目が「合格」となった場合のみ Phase 10 へ進む。
1 項目でも「不合格」の場合は該当 Phase に差し戻す。

| ゲート番号 | 確認項目                                              | 合格基準                      | 判定              |
| ---------- | ----------------------------------------------------- | ----------------------------- | ----------------- |
| QG-1       | `pnpm typecheck` が成功する                           | exit code 0                   | - / 合格 / 不合格 |
| QG-2       | `pnpm lint` が成功する                                | lint エラー 0 件              | - / 合格 / 不合格 |
| QG-3       | `pnpm --filter @repo/desktop test` が全 PASS          | 全テスト GREEN                | - / 合格 / 不合格 |
| QG-4       | カバレッジが目標値以上                                | 85% 以上（Phase 7 確認済み）  | - / 合格 / 不合格 |
| QG-5       | ANALYTICS_ENDPOINT_URL バリデーションが実装されている | 不正 URL で no-op 動作        | - / 合格 / 不合格 |
| QG-6       | 機密情報がログ出力されていない                        | grep で 0 件                  | - / 合格 / 不合格 |
| QG-7       | 最悪ケース待機時間が IPC タイムアウト以内             | 15.3 秒以内                   | - / 合格 / 不合格 |
| QG-8       | IPC 型契約が維持されている                            | Renderer/Preload 側に変更不要 | - / 合格 / 不合格 |
| QG-9       | analyticsStore 既存フィールドへの影響なし             | 破壊的変更なし                | - / 合格 / 不合格 |

## 参照資料

| 資料名                | パス                                                                | 説明                   |
| --------------------- | ------------------------------------------------------------------- | ---------------------- |
| メインタスク仕様      | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001.md`            | 受入基準・スコープ定義 |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                         | Phase 5 成果物         |
| 変更ファイル一覧      | `outputs/phase-5/changed-files.md`                                  | Phase 5 成果物         |
| リファクタリング記録  | `outputs/phase-8/refactoring-record.md`                             | Phase 8 成果物         |
| 定数定義一覧          | `outputs/phase-8/constants-definition.md`                           | Phase 8 成果物         |
| 責務境界マップ        | `outputs/phase-8/responsibility-boundary-map.md`                    | Phase 8 成果物         |
| AnalyticsHttpProvider | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` | 品質確認対象ファイル   |
| analyticsHandler      | `apps/desktop/src/main/ipc/analyticsHandler.ts`                     | 品質確認対象ファイル   |
| channels.ts           | `packages/shared/src/ipc/channels.ts`                               | 型契約確認対象         |

## 実行手順

1. Phase 8 の成果物（`outputs/phase-8/`）を確認し、リファクタリングが完了していることを前提とする
2. Task 9-1（静的解析）を実施する
   - `pnpm typecheck` を実行し、結果を記録する
   - `pnpm lint` を実行し、結果を記録する
3. Task 9-2（セキュリティチェック）を実施する
   - URL バリデーションの実装を確認する
   - ペイロードサニタイズの確認を行う
   - `grep` コマンドで認証情報のログ出力がないことを確認する
4. Task 9-3（パフォーマンス確認）を実施する
   - タイムアウト設定の妥当性を確認する
   - 最悪ケース待機時間を算出し記録する
5. Task 9-4（後方互換性確認）を実施する
   - `channels.ts` の型シグネチャ変更有無を確認する
   - `analyticsStore` の既存フィールドへの影響を確認する
6. 品質ゲート（QG-1〜QG-9）の判定を記録する
7. 不合格ゲートがある場合は該当 Phase に差し戻し、ブロッカーを記録する
8. 全ゲート合格の場合は `outputs/phase-9/quality-report.md` に結果を保存して Phase 10 へ進む

## 成果物

| 成果物                   | パス                                               | 説明                                   |
| ------------------------ | -------------------------------------------------- | -------------------------------------- |
| 品質保証レポート         | `outputs/phase-9/quality-report.md`                | QG-1〜QG-9 の判定結果・合否サマリー    |
| セキュリティチェック記録 | `outputs/phase-9/security-check-record.md`         | URL バリデーション・サニタイズ確認結果 |
| 後方互換性確認記録       | `outputs/phase-9/backward-compatibility-record.md` | 型契約・ストア互換性の確認結果         |

## 完了条件

- [ ] `pnpm typecheck` が exit code 0 で完了している（QG-1 合格）
- [ ] `pnpm lint` が lint エラー 0 件で完了している（QG-2 合格）
- [ ] 全テストが GREEN である（QG-3 合格）
- [ ] カバレッジが 85% 以上である（QG-4 合格）
- [ ] `ANALYTICS_ENDPOINT_URL` の不正値で no-op 動作することを確認した（QG-5 合格）
- [ ] 機密情報がログ出力されていないことを grep で確認した（QG-6 合格）
- [ ] 最悪ケース待機時間（15.3 秒）が IPC タイムアウト以内である（QG-7 合格）
- [ ] IPC 型契約が変更前後で維持されていることを確認した（QG-8 合格）
- [ ] `analyticsStore` 既存フィールドへの影響がないことを確認した（QG-9 合格）
- [ ] 成果物テーブル記載のファイルが全件生成されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 9-1 / 9-2 / 9-3 / 9-4）を 100% 実行完了
- [ ] 品質ゲート（QG-1〜QG-9）の全判定を記録した
- [ ] 不合格ゲートがある場合はブロッカーとして記録し、差し戻し先 Phase を明記した
- [ ] 実行記録を `outputs/phase-9/` に残した

```bash
pnpm typecheck
pnpm lint
pnpm --filter @repo/desktop test --coverage
```

## 次Phase

→ [Phase 10: 最終レビューゲート](./phase-10-final-review.md)
