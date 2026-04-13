# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 5                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 4                                              |
| 後続Phase  | Phase 6                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

Phase 4 の Red テストを Green に変えるため、`analyticsHandler.ts` に `sendToAnalyticsProvider` を実装する。

## 背景

TDD の Red フェーズ（Phase 4）が完了し、全テストが失敗していることが確認された。最小実装でテストを通す。

## 実行タスク

- sendToAnalyticsProvider を内部 helper として追加する
- `ANALYTICS_ENDPOINT_URL` / `NODE_ENV` / AbortController / fetch / finally を実装する
- catch で例外を握り潰し、IPC の `success: true` を維持する
- typecheck / lint / existing tests で回帰を確認する

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                             |
| ---------- | ------------------ | ---------------------------------- |
| SubAgent-A | HTTP 送信実装      | `sendToAnalyticsProvider` 関数本体 |
| SubAgent-B | エラーハンドリング | catch/finally/AbortController 実装 |
| SubAgent-C | 環境変数統合       | `ANALYTICS_ENDPOINT_URL` 参照実装  |
| SubAgent-D | 統合監査           | 型整合、IPC 契約非破壊性確認       |

## 実装計画

### 新規作成ファイル

なし

### 修正ファイル

| ファイル                                        | 変更種別 | 変更内容                                  |
| ----------------------------------------------- | -------- | ----------------------------------------- |
| `apps/desktop/src/main/ipc/analyticsHandler.ts` | 修正     | `sendToAnalyticsProvider` 追加、TODO 削除 |

### 変更詳細（analyticsHandler.ts）

1. `sendToAnalyticsProvider` 関数を `registerAnalyticsHandlers` の上に追加
2. Line 106-107 の TODO コメントを `await sendToAnalyticsProvider({ eventName, payload, timestamp })` に置き換え
3. 既存の型定義・インターフェースは変更しない

### 実装チェックリスト

- [ ] `ANALYTICS_ENDPOINT_URL` 未設定時に静かにスキップ（FR-05）
- [ ] `NODE_ENV !== "production"` 時に送信しない（FR-01）
- [ ] `AbortController` で 5000ms タイムアウト（FR-03）
- [ ] `fetch` POST 送信（FR-02）
- [ ] `catch` でエラー握り潰し（FR-04, NFR-01）
- [ ] `finally` で `clearTimeout`（リソースリーク防止）
- [ ] 既存型定義を変更しない（NFR-03）

## 参照資料

| 参照資料            | パス                                    | 説明           |
| ------------------- | --------------------------------------- | -------------- |
| テスト仕様書        | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| Red 結果            | `outputs/phase-4/red-test-result.md`    | Phase 4 成果物 |
| HTTP 送信モック設計 | `outputs/phase-4/http-mock-design.md`   | Phase 4 成果物 |
| HTTP 送信設計       | `outputs/phase-2/http-send-design.md`   | Phase 2 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                             |
| ---------------- | ------------------------------------------- | -------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装計画と差分要約               |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル                 |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 契約差分記録（なしの場合も記録） |

## 統合テスト連携【必須】

実装後の統合確認を Phase 4 / 6 / 7 と結び付ける:

| 統合ポイント     | 確認内容                                                 |
| ---------------- | -------------------------------------------------------- |
| handler → helper | analytics:send の応答が `success: true` のまま維持される |
| env/config       | `ANALYTICS_ENDPOINT_URL` の有無で送信制御する            |
| error path       | timeout / fetch exception が呼び出し元へ伝搬しない       |

## 完了条件

- [ ] `sendToAnalyticsProvider` が `analyticsHandler.ts` に実装されていること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] 既存テストが回帰していないこと
- [ ] `pnpm typecheck && pnpm lint` が PASS すること
- [ ] IPC チャネル定義（channels.ts）に変更がないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列実装作業
3. SubAgent-D の統合判定
4. Green 確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 全テストが Green であることを確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 6: テスト拡充
