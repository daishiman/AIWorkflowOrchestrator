# Phase 11: 手動テスト検証 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目         | 値                                                      |
| ------------ | ------------------------------------------------------- |
| Phase        | 11                                                      |
| タスクID     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                       |
| タイトル     | Analytics HTTP プロバイダー実装（外部分析基盤への接続） |
| GitHub Issue | #2125 (CLOSED)                                          |
| 作成日       | 2026-04-14                                              |
| 状態         | 未実施                                                  |

---

## 目的

デスクトップアプリを実際に起動し、`AnalyticsHttpProvider` 経由のイベント送信フローが
正常に動作することを手動で確認する。

環境変数 `ANALYTICS_ENDPOINT_URL` の有無によって挙動が切り替わることを確認し、
送信成功・失敗・リトライ・カウント記録の各シナリオを検証する。

---

## 手動テストシナリオ

### MT-01: ANALYTICS_ENDPOINT_URL未設定でのアプリ起動確認

**前提条件**: 環境変数 `ANALYTICS_ENDPOINT_URL` が未設定（または空文字列）の状態でアプリを起動する。

**手順**:

```bash
# ANALYTICS_ENDPOINT_URLを未設定でアプリを起動
unset ANALYTICS_ENDPOINT_URL
pnpm --filter @repo/desktop dev
```

**確認内容**:

| 確認項目                                        | 期待結果                     | 実測結果 | 判定 |
| ----------------------------------------------- | ---------------------------- | -------- | ---- |
| アプリ起動時にクラッシュしないこと              | 正常起動する                 | TBD      | TBD  |
| コンソールにエラーログが出ないこと              | エラー 0 件                  | TBD      | TBD  |
| `AnalyticsHttpProvider` 初期化時のエラーなし    | エラーなし                   | TBD      | TBD  |
| 既存の analytics 機能が正常に動作すること       | IPC 正常応答                 | TBD      | TBD  |
| no-op として動作（HTTP リクエストが発火しない） | Network タブにリクエストなし | TBD      | TBD  |

**確認コンソールログ**:

- `ANALYTICS_ENDPOINT_URL is not set` のような情報ログが出ることを確認（エラーでないこと）
- `TypeError` / `Cannot read properties of undefined` 等のエラーが出ないこと

---

### MT-02: ANALYTICS_ENDPOINT_URL設定でのイベント送信確認

**前提条件**: 環境変数 `ANALYTICS_ENDPOINT_URL` に有効なエンドポイント URL を設定してアプリを起動する。

**手順**:

```bash
# テスト用エンドポイントを設定してアプリを起動
# (例: httpbin.org を利用してHTTPリクエストを確認)
export ANALYTICS_ENDPOINT_URL="https://httpbin.org/post"
pnpm --filter @repo/desktop dev
```

アプリ起動後に DevTools (Ctrl+Shift+I / Cmd+Option+I) を開き、Network タブを確認する。

**確認内容**:

| 確認項目                                                | 期待結果                                   | 実測結果 | 判定 |
| ------------------------------------------------------- | ------------------------------------------ | -------- | ---- |
| アプリ起動後に analytics イベントが発火すること         | Network タブに POST リクエストが表示される | TBD      | TBD  |
| リクエスト先 URL が設定値と一致すること                 | `https://httpbin.org/post` 宛のリクエスト  | TBD      | TBD  |
| リクエストボディに イベント情報が含まれること           | JSON 形式でイベントデータが含まれる        | TBD      | TBD  |
| レスポンスが 200 OK の場合に `success: true` が返ること | IPC 応答で success: true                   | TBD      | TBD  |
| `sentCount` がインクリメントされること                  | `analytics:get-stats` で確認               | TBD      | TBD  |

**DevTools Network タブ確認手順**:

1. DevTools を開く（Renderer プロセス側）
2. Network タブを選択し、「All」フィルタを適用する
3. analytics イベントをトリガーする操作を行う
4. POST リクエストが `ANALYTICS_ENDPOINT_URL` 宛に送信されることを確認する

---

### MT-03: 無効なエンドポイントへの送信

**前提条件**: 環境変数 `ANALYTICS_ENDPOINT_URL` に到達不能なエンドポイント URL を設定する。

**手順**:

```bash
# 到達不能なエンドポイントを設定
export ANALYTICS_ENDPOINT_URL="https://invalid.example.nonexistent/analytics"
pnpm --filter @repo/desktop dev
```

**確認内容**:

| 確認項目                                 | 期待結果                       | 実測結果 | 判定 |
| ---------------------------------------- | ------------------------------ | -------- | ---- |
| アプリがクラッシュしないこと             | 正常に起動し続ける             | TBD      | TBD  |
| 送信失敗時に `success: false` が返ること | IPC 応答で success: false      | TBD      | TBD  |
| リトライが最大 3 回実行されること        | ログに retry 3 回の記録        | TBD      | TBD  |
| `failedCount` がインクリメントされること | `analytics:get-stats` で確認   | TBD      | TBD  |
| UI / 既存機能に影響がないこと            | 他の操作が正常に動作する       | TBD      | TBD  |
| エラーがユーザーに表示されないこと       | エラートースト等が表示されない | TBD      | TBD  |

**確認ポイント（エラーを握り潰す設計の確認）**:

- analytics 送信の失敗がアプリ全体の動作を停止させないことを確認する
- コンソールにエラーログが出ることは許容（クラッシュは不可）

---

### MT-04: analytics:get-stats の動作確認

**前提条件**: `ANALYTICS_ENDPOINT_URL` を設定してアプリを起動し、複数のイベントを送信する。

**手順**:

DevTools の Console タブで以下を実行する（Renderer プロセス側）:

```javascript
// analytics統計情報を取得
const stats = await window.electronAPI.analytics.getStats();
console.log("Analytics Stats:", JSON.stringify(stats, null, 2));
```

または、IPC を直接確認する場合:

```bash
# Main プロセス側ログで確認
# アプリのコンソールログに sentCount / failedCount が出力されることを確認
```

**確認内容**:

| 確認項目                                       | 期待結果                 | 実測結果 | 判定 |
| ---------------------------------------------- | ------------------------ | -------- | ---- |
| `sentCount` が送信成功回数と一致すること       | 成功した送信回数と同じ値 | TBD      | TBD  |
| `failedCount` が送信失敗回数と一致すること     | 失敗した送信回数と同じ値 | TBD      | TBD  |
| 統計情報が正確にリセットされること（再起動後） | 0 にリセットされる       | TBD      | TBD  |
| `analytics:get-stats` IPC が正常に応答すること | エラーなく応答する       | TBD      | TBD  |

**シナリオ手順**:

1. `ANALYTICS_ENDPOINT_URL=https://httpbin.org/post` でアプリを起動
2. 3 回のイベントを送信する操作を実行
3. `analytics:get-stats` を呼び出し、`sentCount === 3` を確認
4. `ANALYTICS_ENDPOINT_URL=https://invalid.example.nonexistent/analytics` でアプリを再起動
5. 2 回のイベントを送信する操作を実行
6. `analytics:get-stats` を呼び出し、`failedCount >= 2` を確認

---

## スクリーンショット要件

| スクリーンショット | 内容                                                                      | 必須 |
| ------------------ | ------------------------------------------------------------------------- | ---- |
| MT-02-network.png  | DevTools Network タブで HTTP POST リクエストが確認できる画面              | 必須 |
| MT-03-noCrash.png  | 無効エンドポイント設定でアプリが正常動作している画面                      | 必須 |
| MT-04-stats.png    | `analytics:get-stats` の応答で sentCount/failedCount が表示されている画面 | 必須 |
| MT-01-noError.png  | ANALYTICS_ENDPOINT_URL 未設定でエラーなし起動の画面                       | 推奨 |

スクリーンショットは `outputs/phase-11/screenshots/` に配置する。

---

## 検証環境

| 項目                   | 値                                                          |
| ---------------------- | ----------------------------------------------------------- |
| OS                     | macOS (Darwin)                                              |
| Node.js                | プロジェクト指定バージョン                                  |
| pnpm                   | プロジェクト指定バージョン                                  |
| Electron               | `apps/desktop/package.json` 参照                            |
| テスト用エンドポイント | `https://httpbin.org/post`（MT-02 用）                      |
| 無効エンドポイント     | `https://invalid.example.nonexistent/analytics`（MT-03 用） |

---

## 参照資料

| 資料名                                         | パス                                                                | 説明               |
| ---------------------------------------------- | ------------------------------------------------------------------- | ------------------ |
| Phase 10 最終レビュー結果                      | `outputs/phase-10/final-review-result.md`                           | PASS 判定確認      |
| Phase 1 受入基準                               | `outputs/phase-1/acceptance-criteria.md`                            | 手動テスト観点     |
| analyticsHandler.ts                            | `apps/desktop/src/main/ipc/analyticsHandler.ts`                     | IPC ハンドラー     |
| AnalyticsHttpProvider.ts                       | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` | 実装対象           |
| analyticsStore.ts                              | `apps/desktop/src/main/services/analytics/analyticsStore.ts`        | カウント記録ストア |
| 最終レビュー書（AC-1〜AC-8突合・MAJOR指摘0件） | `outputs/phase-10/final-review.md`                                  | Phase 10 成果物    |

---

## 実行手順

### ステップ1: アプリのビルド・起動（MT-01）

```bash
# デスクトップアプリのビルド
pnpm --filter @repo/desktop build

# ANALYTICS_ENDPOINT_URL未設定で起動（MT-01）
unset ANALYTICS_ENDPOINT_URL
pnpm --filter @repo/desktop dev
```

### ステップ2: MT-01 の確認と記録

アプリ起動後のコンソールを確認し、MT-01 の確認テーブルを埋める。

### ステップ3: 有効エンドポイント設定で再起動（MT-02）

```bash
# アプリを停止し、有効エンドポイントで再起動
export ANALYTICS_ENDPOINT_URL="https://httpbin.org/post"
pnpm --filter @repo/desktop dev
```

DevTools Network タブを開き、HTTP POST リクエストを確認する。MT-02-network.png を取得する。

### ステップ4: 無効エンドポイント設定で再起動（MT-03）

```bash
# アプリを停止し、無効エンドポイントで再起動
export ANALYTICS_ENDPOINT_URL="https://invalid.example.nonexistent/analytics"
pnpm --filter @repo/desktop dev
```

アプリがクラッシュしないことと、`success: false` が返ることを確認する。MT-03-noCrash.png を取得する。

### ステップ5: stats確認（MT-04）

MT-02 の環境で `analytics:get-stats` を呼び出し、sentCount / failedCount を確認する。
MT-04-stats.png を取得する。

### ステップ6: 結果記録

全シナリオの結果を `outputs/phase-11/manual-test-result.md` に記録する。

---

## 成果物

| 成果物             | 配置先                                           | 形式     |
| ------------------ | ------------------------------------------------ | -------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`         | Markdown |
| 手動テストレポート | `outputs/phase-11/manual-test-report.md`         | Markdown |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`          | Markdown |
| スクリーンショット | `outputs/phase-11/screenshots/`                  | PNG      |
| capture メタデータ | `outputs/phase-11/phase11-capture-metadata.json` | JSON     |

---

## 完了条件

- [ ] MT-01: ANALYTICS_ENDPOINT_URL 未設定でアプリが正常起動し、エラーログが出ないことを確認済み
- [ ] MT-02: HTTP POST リクエストが DevTools Network タブで確認でき、sentCount が正確なことを確認済み
- [ ] MT-03: 無効エンドポイントでアプリがクラッシュせず、success:false と failedCount が正確なことを確認済み
- [ ] MT-04: `analytics:get-stats` が正常に応答し、sentCount / failedCount が一致していることを確認済み
- [ ] 必須スクリーンショット（MT-02-network.png, MT-03-noCrash.png, MT-04-stats.png）が取得済み
- [ ] `outputs/phase-11/manual-test-result.md` に全シナリオの結果が記録されていること
- [ ] `outputs/phase-11/discovered-issues.md` が（0件でも）作成されていること

---

## タスク100%実行確認【必須】

- [ ] T-11-1: MT-01 を実行し、ANALYTICS_ENDPOINT_URL 未設定での正常動作を確認済み
- [ ] T-11-2: MT-02 を実行し、HTTP 送信と sentCount の動作を確認済み（スクリーンショット取得済み）
- [ ] T-11-3: MT-03 を実行し、クラッシュなし・success:false・failedCount の動作を確認済み（スクリーンショット取得済み）
- [ ] T-11-4: MT-04 を実行し、sentCount / failedCount の正確な記録を確認済み（スクリーンショット取得済み）
- [ ] T-11-5: 手動テスト結果・レポート・発見課題・capture メタデータを記録済み

---

## 次Phase

**Phase 12: ドキュメント更新** — 仕様書・CHANGELOG・未タスク記録の更新を行う。

**Phase 12 開始条件**: Phase 11 の全完了条件を満たすこと。
