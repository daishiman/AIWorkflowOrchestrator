# Phase 5: 実装（TDD Green）

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 5                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 4（TDD Red確立）                                       |
| 後続Phase  | Phase 6                                                      |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

TDD Green: Phase 4で作成したテストを通過させる実装を行う。
`analyticsAdapter.ts`の新規作成・`trackEvent.ts`のsink差し替え・
オフラインキュー実装・オプトアウト連動実装・IPCハンドラ実装（IPC経由の場合）を行う。

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド（Green確認）
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/analyticsAdapter.test.ts
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

## 実行タスク

### タスク1: analyticsAdapter.ts 実装

**目的**: Phase 2設計に基づく`analyticsAdapter.ts`を実装する

**実行手順**:

1. Phase 2の`AnalyticsAdapter`インターフェース設計を確認する
2. `analyticsAdapter.ts`を新規作成する（`apps/desktop/src/renderer/utils/analyticsAdapter.ts`）
3. 実装内容:
   - `initialize(): Promise<void>` - analytics provider初期化
   - `send(eventName, payload): void` - IPC経由イベント送信
   - `flush(): Promise<void>` - オフラインキュードレイン
   - `isOptedOut(): boolean` - オプトアウト状態確認
   - エラー時no-opフォールバック（AC-9）
4. `window.api.analytics.send()` (Preload API経由) での送信を実装する
5. Phase 4のテストが通ることを確認する（Green）

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

### タスク2: trackEvent.ts sink差し替え

**目的**: `trackEvent.ts`の内部sinkを`analyticsAdapter`に差し替える

**実行手順**:

1. `apps/desktop/src/renderer/utils/trackEvent.ts`を確認する
2. L44付近のTODOコメント位置を特定する
3. `analyticsAdapter.send(eventName, payload)`呼び出しに差し替える
4. 公開APIシグネチャ（`trackEvent<K>(eventName, payload): void`）が変更されていないことを確認する（AC-5）
5. 開発環境での`console.info`ログは維持または削除を判断する

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`（差し替えセクション）
- `outputs/phase-5/contract-diff.md`（API変更なし証跡）

### タスク3: オフラインキュー実装

**目的**: Phase 2設計に基づくオフラインイベントキューを実装する

**実行手順**:

1. Phase 2のキュー設計（ストレージ方式・上限件数・TTL）を確認する
2. キューの実装を`analyticsAdapter.ts`または別ユーティリティに追加する
3. オンライン状態の検知方法を実装する
4. キュードレイン（バッチ送信）を実装する
5. キュー上限到達時の古いイベント破棄ポリシーを実装する

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`（キューセクション）

### タスク4: IPCハンドラー実装（IPC経由の場合）

**目的**: Main プロセス側のanalyticsハンドラーを実装する

**実行手順**:

1. `apps/desktop/src/main/ipc/analyticsHandler.ts`を新規作成する
2. `ipcMain.handle("analytics:send", ...)`でイベントを受信する
3. HTTP送信処理を実装する（選定したprovider SDKを使用）
4. `ALLOWED_INVOKE_CHANNELS`に`"analytics:send"`を追加する（[FB-SC-13-1]必須）
5. Preload APIのcontextBridgeエクスポートを更新する

**期待される成果物**:

- `outputs/phase-5/changed-files.md`

### タスク5: CSP設定更新

**目的**: IPC経由アプローチのCSP設定確認・必要に応じて更新する

**実行手順**:

1. Phase 1で特定したCSP設定ファイルを確認する
2. IPC経由アプローチであればCSP変更が不要であることを確認する
3. 万一analytics providerのドメインへの直接通信が必要な場合は`connect-src`を最小限更新する
4. Electronのwebセキュリティ設定を緩めていないことを確認する

**期待される成果物**:

- `outputs/phase-5/changed-files.md`（CSP変更記録）

## 実装計画

### 新規作成ファイル

| ファイル                                              | 内容                     |
| ----------------------------------------------------- | ------------------------ |
| `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | analyticsアダプター実装  |
| `apps/desktop/src/main/ipc/analyticsHandler.ts`       | IPCハンドラー（IPC経由） |

### 修正ファイル

| ファイル                                               | 変更内容                    |
| ------------------------------------------------------ | --------------------------- |
| `apps/desktop/src/renderer/utils/trackEvent.ts`        | sink差し替え（L44付近）     |
| `apps/desktop/src/preload/channels.ts` or 相当ファイル | ALLOWED_INVOKE_CHANNELS追加 |
| `apps/desktop/src/preload/index.ts` or 相当ファイル    | contextBridge更新           |
| CSP設定ファイル（IPC経由であれば不要の可能性大）       | analytics domain追加        |

## canUseTool適用可能範囲と制約（[Feedback P0-09-U1-2]対応）

`analyticsAdapter.ts`のIPC送信は`window.api.analytics.send()`（Preload API経由）を使用する。
SDK callbackではなく、`safeInvoke`パターンでラップされたPreload API経由での送信であるため、
SDK直接callbackは適用外となる。

| 呼び出し経路              | canUseTool適用 | 理由                             |
| ------------------------- | -------------- | -------------------------------- |
| window.api.analytics.send | 非適用         | Preload API → IPC経由のため      |
| SDK直接呼び出し           | 適用可能       | Renderer→SDK直接の場合（非推奨） |

## 参照資料

| 参照資料                     | パス                                                      |
| ---------------------------- | --------------------------------------------------------- |
| Phase 4 テスト仕様書         | `outputs/phase-4/test-specification.md`                   |
| Phase 2 IPC契約設計          | `outputs/phase-2/ipc-contract-design.md`                  |
| trackEvent現状実装           | `apps/desktop/src/renderer/utils/trackEvent.ts`           |
| 既存IPCハンドラーパターン    | `apps/desktop/src/main/ipc/`                              |
| channels.ts（ALLOWED追加先） | `apps/desktop/src/preload/channels.ts` または相当ファイル |
| FB-RT-03: 実装計画必須記載   | `.claude/skills/task-specification-creator/SKILL.md`      |

## 成果物

| 成果物           | パス                                        | 内容                                |
| ---------------- | ------------------------------------------- | ----------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約                      |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 新規作成・修正ファイルのリスト      |
| API変更なし証跡  | `outputs/phase-5/contract-diff.md`          | trackEvent公開APIシグネチャ不変証跡 |

## 完了条件

- [ ] `analyticsAdapter.ts`実装完了
- [ ] `trackEvent.ts`のsink差し替え完了
- [ ] `ALLOWED_INVOKE_CHANNELS`に追加完了
- [ ] オフラインキュー実装完了
- [ ] オプトアウト連動実装完了
- [ ] Phase 4の全テストがGreenになっていること
- [ ] `trackEvent`公開APIシグネチャが変更されていないこと（contract-diff.md確認）
- [ ] `pnpm --filter @repo/desktop typecheck`がPASS
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 6: テスト拡充
