# Phase 1: 要件定義 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001       |
| Phase      | 1                                       |
| Phase 名   | 要件定義                                |
| カテゴリ   | implementation                          |
| 優先度     | Medium                                  |
| ステータス | pending                                 |
| 前提 Phase | なし（初回 Phase）                      |
| 後続 Phase | Phase 2: 設計                           |
| 起票日     | 2026-04-14                              |
| 依存タスク | UT-W3-ANALYTICS-ADAPTER-001（完了済み） |

---

## 目的

`analyticsHandler.ts` Line 106 の TODO を解消するために必要な要件・スコープ・受け入れ基準を明文化し、後続 Phase の設計・実装・テストの基盤を確立する。

現状の問題:

- Main プロセスの `analyticsHandler.ts` は、オプトアウトをパスしたイベントを `console.info` 出力のみ行い、本番環境では実際の外部送信を行わない
- TODO コメントが Line 106 に残存し、外部分析基盤との接続が未実装
- analytics イベントの送信成否を追跡する仕組みが存在しない

---

## 実行タスク

### Task 1-1: 既存実装状態確認（P50 チェック）

**目的**: 対象ファイルの現在の実装状態を正確に把握し、変更すべき箇所を特定する。

**手順**:

1. `apps/desktop/src/main/ipc/analyticsHandler.ts` を読み、Line 106 の TODO コメントの周辺実装（バリデーション・オプトアウト・ストア参照）を確認する
2. `apps/desktop/src/main/services/analytics/` ディレクトリの存在を確認し、UT-W3-ANALYTICS-ADAPTER-001 で配置された成果物を把握する
3. `apps/desktop/src/preload/channels.ts` の `ANALYTICS_SEND` チャネル定義と `ALLOWED_INVOKE_CHANNELS` 登録を確認する
4. `apps/desktop/src/preload/index.ts` の contextBridge 公開 API（analytics 関連）を確認する
5. `packages/shared/src/ipc/channels.ts` に analytics 系チャネルが定義されているか確認する
6. 既存の `analyticsHandler.ts` テストファイルの有無と内容を確認する

**期待される成果物**: 現状コード調査メモ（Phase 1 実行時に出力に含める）

**P50 確認ポイント**:

| チェック項目                         | 期待値                                                         |
| ------------------------------------ | -------------------------------------------------------------- |
| `analyticsHandler.ts` の TODO 残存   | Line 106 に `// TODO: 本番環境での HTTP 送信実装` が存在する   |
| `IPC_CHANNELS.ANALYTICS_SEND` の定義 | `"analytics:send"` として `channels.ts` に定義済み             |
| `ALLOWED_INVOKE_CHANNELS` 登録       | `ANALYTICS_SEND` が登録済み                                    |
| `analytics/` サービスディレクトリ    | 存在するかどうかを確認（UT-W3-ANALYTICS-ADAPTER-001 の成果物） |
| `analyticsStore` の現在のスキーマ    | `analyticsOptOut?: boolean` のみが定義されている               |

---

### Task 1-2: 機能要件の固定

**目的**: 本タスクで実装すべき機能要件（FR）を明確に定義する。

| ID    | 要件                                                                                                                                 | 優先度 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-01 | `AnalyticsHttpProvider` クラスを新規作成し、HTTP POST による analytics イベント送信機能を実装する                                    | 必須   |
| FR-02 | 環境変数 `ANALYTICS_ENDPOINT_URL` が設定されている場合のみ HTTP 送信を行い、未設定時は no-op で正常終了する                          | 必須   |
| FR-03 | 送信失敗時は指数バックオフで最大 3 回リトライを実施し、全リトライ失敗後は `{ success: false }` を返す                                | 必須   |
| FR-04 | 各 HTTP リクエストにタイムアウト（5 秒）を設定し、タイムアウト超過時は送信失敗として扱う                                             | 必須   |
| FR-05 | `analyticsStore` に `sentCount`（送信成功数）と `failedCount`（送信失敗数）カウンターを追加し、正確に記録する                        | 必須   |
| FR-06 | `analytics:get-stats` IPC チャネルを新規追加し、Renderer から `sentCount` / `failedCount` / `analyticsOptOut` を取得できるようにする | 必須   |
| FR-07 | `analyticsHandler.ts` の TODO を実際の `AnalyticsHttpProvider` 呼び出しに置き換える                                                  | 必須   |
| FR-08 | エラーが発生しても `analyticsHandler` の IPC レスポンス全体を壊さない（catch で握り潰す設計を維持する）                              | 必須   |

---

### Task 1-3: 非機能要件の固定

**目的**: パフォーマンス・セキュリティ・保守性に関する非機能要件（NFR）を定義する。

| ID     | 要件                                                                                                                     | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| NFR-01 | HTTP 送信処理は Main プロセスの IPC ハンドラーをブロックしない（async/await + AbortController による非同期タイムアウト） | 必須   |
| NFR-02 | `AnalyticsHttpProvider` はテスト容易性のために DI（依存注入）可能な設計とし、fetch をモック可能にする                    | 必須   |
| NFR-03 | リトライ間隔は指数バックオフ（1 回目: 1 秒、2 回目: 2 秒、3 回目: 4 秒）とし、テスト時はオーバーライド可能にする         | 必須   |
| NFR-04 | `ANALYTICS_ENDPOINT_URL` は環境変数からのみ取得し、electron-store には保存しない（セキュリティ上の理由）                 | 必須   |
| NFR-05 | `AnalyticsHttpProvider` は `analyticsHandler.ts` の既存バリデーション・オプトアウト確認の後に呼び出す（二重防衛を維持）  | 必須   |
| NFR-06 | `sentCount` / `failedCount` の更新はアトミックに行い、カウンターの不整合を防ぐ                                           | 推奨   |
| NFR-07 | `pnpm typecheck && pnpm lint` が PASS すること                                                                           | 必須   |
| NFR-08 | `AnalyticsHttpProvider.test.ts` のユニットテストカバレッジが行カバレッジ 80% 以上であること                              | 必須   |

---

### Task 1-4: 受け入れ基準の定義

**目的**: 各機能要件に対して検証可能な受け入れ基準を策定する。

| AC ID | 受け入れ基準                                                                                               | 検証方法                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| AC-1  | `ANALYTICS_ENDPOINT_URL` が設定されている環境でイベントが HTTP POST 送信される                             | fetch モック + `vi.fn()` で呼び出しを確認                |
| AC-2  | 送信失敗時（ネットワークエラー / タイムアウト）に `success: false` が返る                                  | fetch を `vi.fn().mockRejectedValue()` でモック          |
| AC-3  | リトライが最大 3 回実行される（3 回失敗後は `failedCount` がインクリメントされる）                         | fetch モックで 3 回連続失敗シナリオを検証                |
| AC-4  | `analyticsStore.sentCount` / `failedCount` が正確に記録される                                              | 成功/失敗シナリオ後のストア値を assertion で確認         |
| AC-5  | `ANALYTICS_ENDPOINT_URL` 未設定時は fetch が呼ばれず、`{ success: true }` が返る                           | `process.env.ANALYTICS_ENDPOINT_URL` を undefined で確認 |
| AC-6  | `AnalyticsHttpProvider.test.ts` が新規作成され、`pnpm test` で green                                       | テスト実行確認                                           |
| AC-7  | 既存の `analyticsHandler.ts` テスト（オプトアウト・バリデーション系）が引き続き PASS する                  | 回帰テスト実行確認                                       |
| AC-8  | `analytics:get-stats` IPC チャネルが追加され、`sentCount` / `failedCount` / `analyticsOptOut` が取得できる | IPC ハンドラーの手動確認またはテスト                     |

---

### Task 1-5: IPC 4 層整合性チェック

**目的**: 新規追加する `analytics:get-stats` チャネルが Electron の IPC 4 層（channels.ts → preload → ipcMain.handle → contextBridge）で整合していることを確認する。

**確認すべき 4 層**:

| 層               | 対象ファイル                                    | 確認内容                                                  |
| ---------------- | ----------------------------------------------- | --------------------------------------------------------- |
| チャネル定義層   | `apps/desktop/src/preload/channels.ts`          | `ANALYTICS_GET_STATS: "analytics:get-stats"` の追加       |
| ホワイトリスト層 | `apps/desktop/src/preload/channels.ts`          | `ALLOWED_INVOKE_CHANNELS` への `ANALYTICS_GET_STATS` 追加 |
| IPC ハンドラー層 | `apps/desktop/src/main/ipc/analyticsHandler.ts` | `ipcMain.handle(ANALYTICS_GET_STATS, ...)` の実装         |
| contextBridge 層 | `apps/desktop/src/preload/index.ts`             | `analyticsApi.getStats` の公開                            |

**整合性チェックポイント**:

- チャネル名の文字列が 4 層で一致していること（`"analytics:get-stats"`）
- `ALLOWED_INVOKE_CHANNELS` に登録されていない場合、preload からの呼び出しがセキュリティガードによりブロックされること
- 既存の `ANALYTICS_SEND` パターンを踏襲した実装にすること

---

## 参照資料

### aiworkflow-requirements 資料

| 参照資料                        | パス                                                                          | 参照理由                                                            |
| ------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| IPC Agent API 契約              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | analytics:send / analytics:get-stats チャネル契約パターン確認       |
| Electron セキュリティ API 設計  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`  | contextBridge 経由 API 公開ルール・ALLOWED_INVOKE_CHANNELS 登録規則 |
| Electron IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | preload サンドボックス・validate/sanitize パターン                  |
| エラーハンドリング設計          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | HTTP 送信エラーの握り潰しパターン・success: false 返却設計          |
| 品質要件                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | TDD・カバレッジ下限（80%）・typecheck/lint 必須要件                 |
| Electron サービスアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Main プロセスサービス配置ルール・クラス設計・DI 境界パターン        |

### プロジェクト内資料

| 参照資料                           | パス                                                               | 参照理由                                 |
| ---------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| analyticsHandler.ts 実装           | `apps/desktop/src/main/ipc/analyticsHandler.ts`                    | TODO 解消対象・既存バリデーション確認    |
| channels.ts（preload）             | `apps/desktop/src/preload/channels.ts`                             | 既存チャネル定義パターン・ホワイトリスト |
| channels.ts（shared）              | `packages/shared/src/ipc/channels.ts`                              | shared 定義との重複チェック              |
| preload/index.ts                   | `apps/desktop/src/preload/index.ts`                                | contextBridge 公開パターン確認           |
| UT-W3-ANALYTICS-ADAPTER-001 仕様書 | `docs/30-workflows/completed-tasks/UT-W3-ANALYTICS-ADAPTER-001.md` | 前提タスク設計・教訓の確認               |

---

## 統合テスト連携

- Phase 1 では統合テストの実施はない
- Phase 4 以降で使用するテストシナリオの基盤として AC-1〜AC-8 を定義済み
- Phase 10 では AC-1〜AC-8 と Phase 4〜9 の証跡を突合し、未達があれば未タスク化する

---

## 多角的チェック観点（AI が判断）

| 観点               | 適用   | 理由・チェック内容                                                              |
| ------------------ | ------ | ------------------------------------------------------------------------------- |
| セキュリティ       | 該当   | `ANALYTICS_ENDPOINT_URL` が外部に漏洩しない設計・contextBridge 公開範囲の最小化 |
| エラーハンドリング | 該当   | HTTP 送信エラーが IPC 全体を壊さない設計・catch 握り潰しパターンの徹底          |
| パフォーマンス     | 該当   | Main プロセスブロッキング防止・AbortController タイムアウト設計                 |
| テスト容易性       | 該当   | fetch DI による単体テスト可能設計・vi.fn() モックの活用                         |
| 後方互換性         | 該当   | 既存 `analyticsHandler.ts` のバリデーション・オプトアウト設計を破らない         |
| 状態管理           | 非該当 | Renderer 側の状態管理には関与しない（Main プロセスの electronStore のみ）       |
| UI/UX              | 非該当 | Renderer UI の変更は含まない                                                    |

---

## 実行手順

### ステップ 0: 前提確認（作業開始前）

1. `git log --oneline -5` で現在のブランチとコミット状態を確認する
2. `apps/desktop/src/main/ipc/analyticsHandler.ts` を読み、Line 106 の TODO が残存していることを確認する
3. `apps/desktop/src/main/services/analytics/` ディレクトリの存在を確認する（UT-W3-ANALYTICS-ADAPTER-001 の成果物）

### ステップ 1: 必要仕様抽出マトリクスの確認

| 区分   | 採用する仕様                | このタスクで使う理由                                          |
| ------ | --------------------------- | ------------------------------------------------------------- |
| 必須   | `api-ipc-agent.md`          | analytics:send / analytics:get-stats チャネル契約の確認       |
| 必須   | `security-api-electron.md`  | contextBridge 公開・ALLOWED_INVOKE_CHANNELS 登録ルール        |
| 必須   | `security-electron-ipc.md`  | preload サンドボックス・チャネルホワイトリスト管理            |
| 必須   | `error-handling.md`         | HTTP エラー非伝播設計・success: false 返却パターン            |
| 必須   | `quality-requirements.md`   | TDD・カバレッジ 80% 下限・typecheck/lint PASS 要件            |
| 必須   | `arch-electron-services.md` | Main プロセスサービスクラス配置・DI 境界設計                  |
| 非採用 | `arch-state-management.md`  | Renderer Store の変更は含まない（Main の electronStore のみ） |
| 非採用 | `ui-ux-agent-execution.md`  | UI 変更は本タスクのスコープ外                                 |

### ステップ 2: 機能要件 FR-01〜FR-08 を確定する

上記「Task 1-2: 機能要件の固定」の表を参照し、各 FR を受け入れ基準（AC）と対応させる。

### ステップ 3: 非採用案の明文化

- **Renderer 側での HTTP 送信案**: 採用しない。セキュリティ上、HTTP 送信は Main プロセスで行うべきであり、Renderer から直接外部エンドポイントに接続させない
- **electron-store へのエンドポイント URL 保存案**: 採用しない。環境変数で管理することで、ビルド・デプロイ設定で制御可能にする
- **IPC エラー時のスロー案**: 採用しない。analytics 送信の失敗はアプリ動作に影響させない方針を維持する（UT-W3-ANALYTICS-ADAPTER-001 からの教訓）

### ステップ 4: 受け入れ基準 AC-1〜AC-8 を確定する

上記「Task 1-4: 受け入れ基準の定義」の表を最終確認し、Phase 2 以降への引き継ぎ情報として固定する。

### ステップ 5: IPC 4 層整合性チェックを完了する

上記「Task 1-5: IPC 4 層整合性チェック」の確認を実施し、設計上の矛盾がないことを確認する。

---

## 成果物

| 成果物     | パス                                                                          | 説明           |
| ---------- | ----------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/phase-1-requirements.md` | 本ドキュメント |

---

## 完了条件

- [ ] FR-01〜FR-08 の機能要件が定義されている
- [ ] NFR-01〜NFR-08 の非機能要件が定義されている
- [ ] AC-1〜AC-8 の受け入れ基準が検証可能な形式で定義されている
- [ ] IPC 4 層整合性チェック（channels.ts → preload → ipcMain.handle → contextBridge）が完了している
- [ ] 既存 `analyticsHandler.ts` の実装状態が確認されている（P50 チェック完了）
- [ ] 必要仕様抽出マトリクスが完成し、非採用案の理由が明文化されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 1 完了を宣言する前に、以下の全項目にチェックを入れること。

- [ ] Task 1-1: 既存実装状態確認（P50 チェック）が完了している
- [ ] Task 1-2: 機能要件（FR-01〜FR-08）が確定している
- [ ] Task 1-3: 非機能要件（NFR-01〜NFR-08）が確定している
- [ ] Task 1-4: 受け入れ基準（AC-1〜AC-8）が確定している
- [ ] Task 1-5: IPC 4 層整合性チェックが完了している
- [ ] artifacts.json の phase-1 ステータスが `completed` に更新されている

---

## 次 Phase

**Phase 2: 設計** へ進む。

`AnalyticsHttpProvider` クラス設計・IPC 4 層整合性設計・analyticsStore スキーマ拡張・指数バックオフリトライ設計・DI 境界設計を行う。
