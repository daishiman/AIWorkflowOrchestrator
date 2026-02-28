# TASK-9J 仕様書整合性確認

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-9J                                  |
| Phase      | 1（要件定義）                            |
| タスク番号 | タスク2: 仕様書との整合性確認            |
| 作成日     | 2026-02-28                               |
| 確認対象   | aiworkflow-requirements仕様書 10ファイル |

---

## 確認サマリー

| #   | 仕様書                          | 整合性判定     | 抵触有無 | 備考                                             |
| --- | ------------------------------- | -------------- | -------- | ------------------------------------------------ |
| 1   | `architecture-overview.md`      | 整合           | なし     | レイヤー依存方向・デザインパターン遵守           |
| 2   | `arch-electron-services.md`     | 整合           | なし     | Facadeパターン・サービス配置規約に準拠           |
| 3   | `api-ipc-agent.md`              | 整合           | なし     | チャネル命名・方向・型定義パターンに準拠         |
| 4   | `security-electron-ipc.md`      | 整合           | なし     | sender検証・P42バリデーション・CSP準拠           |
| 5   | `security-skill-ipc.md`         | 整合（要追記） | なし     | 新規5チャネルのIPCチャネル検証テーブル追記が必要 |
| 6   | `interfaces-agent-sdk-skill.md` | 整合（要追記） | なし     | skillAnalyticsAPI セクション追記が必要           |
| 7   | `ipc-contract-checklist.md`     | 整合           | なし     | Phase 1-6 チェックリストに完全準拠可能           |
| 8   | `error-handling.md`             | 整合           | なし     | Validation Error（1000-1999）カテゴリ準拠        |
| 9   | `quality-requirements.md`       | 整合           | なし     | カバレッジ基準・TDD原則準拠                      |
| 10  | `development-guidelines.md`     | 整合           | なし     | テスト方針・ログ運用・命名規約準拠               |

**総合判定: 抵触なし。** 全10仕様書に対してTASK-9Jの要件は整合している。Phase 12（ドキュメント）にて、`security-skill-ipc.md` と `interfaces-agent-sdk-skill.md` への新規セクション追記が必要となる。

---

## 詳細分析

### 1. architecture-overview.md

**確認対象**: レイヤー依存方向の遵守、デザインパターンとの整合

| TASK-9J要件                                         | 仕様書の関連規定                                                     | 判定 | 根拠                                                                                                                                                                             |
| --------------------------------------------------- | -------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1: SkillAnalytics サービスを Main Process に配置 | Application Layer（apps/desktop）→ Infrastructure Layer の依存方向   | 整合 | SkillAnalytics は Main Process のサービス層に配置され、Renderer からは IPC 経由でアクセスする。依存方向は上位→下位の一方向を維持する                                             |
| FR-1〜FR-6: IPC ハンドラ経由での機能提供            | Electron IPC 通信フロー（Renderer → Preload Bridge → Main）          | 整合 | 5つの IPC チャネルは全て Renderer → Main 方向であり、Preload Bridge（safeInvoke）経由で通信する。仕様書記載の6ステップフローに準拠する                                           |
| NFR-1: electron-store による永続化                  | デザインパターン: Repository パターン（データアクセスの抽象化）      | 整合 | AnalyticsStore は electron-store を内部で使用し、リポジトリとしてデータアクセスを抽象化する。SQLite は使用しないが、Repository パターンの適用は可能                              |
| 全要件: Facadeパターンの採用                        | 構造パターン: Facade（複雑なサブシステムへの単純なインターフェース） | 整合 | SkillService が既に Facade として機能しており、SkillAnalytics はその内部コンポーネントとして追加される。既存の SkillAnalyzer / SkillImprover / SkillScheduler と同じ配置パターン |

**抵触箇所**: なし

---

### 2. arch-electron-services.md

**確認対象**: Main Process サービス層の責務境界、コンポーネント構成

| TASK-9J要件                    | 仕様書の関連規定                                                                     | 判定 | 根拠                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全要件: SkillAnalytics の配置  | スキル管理サービスのコンポーネント構成（L1: SkillService, L2: 各サブコンポーネント） | 整合 | SkillAnalytics は L2 コンポーネントとして `apps/desktop/src/main/services/skill/` 配下に配置する。既存の SkillAnalyzer（TASK-9C）、ScheduleStore（TASK-9G）と同階層                           |
| NFR-1: AnalyticsStore の配置   | ファイル構成規約（サービスファイル + ストアファイルの分離）                          | 整合 | `SkillAnalytics.ts`（サービス）と `AnalyticsStore.ts`（永続化）を分離する。既存の `ScheduleStore.ts`（TASK-9G）と同じパターン                                                                 |
| FR-1〜FR-6: IPC ハンドラの配置 | IPC Handlers（L1）→ skillHandlers.ts                                                 | 整合 | 新規チャネルのハンドラは `skillHandlers.ts` に追加する。TASK-9G の `skill:schedule:*` チャネルと同じ登録パターンに従う                                                                        |
| 新規型定義の配置               | 型定義テーブル（定義場所: `packages/shared/src/types/skill.ts`）                     | 整合 | 新規型（SkillUsageEvent, SkillStatistics 等）は `packages/shared/src/types/skill-analytics.ts` に定義し、`index.ts` からエクスポートする。既存の `skill-schedule.ts`（TASK-9G）と同じパターン |

**抵触箇所**: なし

**追記予定**: Phase 12 にて、コンポーネント構成テーブルに `SkillAnalytics`（L2）と `AnalyticsStore`（L2）を追加する。

---

### 3. api-ipc-agent.md

**確認対象**: IPC チャネル命名規則、契約の整合

| TASK-9J要件                          | 仕様書の関連規定                                                | 判定 | 根拠                                                                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5チャネルの命名: `skill:analytics:*` | 既存チャネルの命名パターン: `agent:*`, `chat-edit:*`, `skill:*` | 整合 | `skill:analytics:*` は既存の `skill:schedule:*`（TASK-9G）と同じ階層的命名パターンに従う。`skill:` プレフィックスの下にドメインサブプレフィックス `analytics:` を追加する |
| 全チャネル: Renderer → Main 方向     | 方向カラムの表記: `Renderer → Main`                             | 整合 | 5つの IPC チャネルは全て Renderer → Main 方向。Main → Renderer のイベントチャネルは TASK-9J のスコープ外                                                                  |
| Request/Response 型の定義            | 既存テーブル: Request / Response カラム                         | 整合 | 各チャネルの引数型（skillName: string, period: AnalyticsPeriod 等）と戻り値型（SkillStatistics, AnalyticsSummary 等）を明示的に定義する                                   |

**抵触箇所**: なし

**追記予定**: Phase 12 にて、`skill:analytics:*` 5チャネルのチャネル一覧テーブルを追記する。

---

### 4. security-electron-ipc.md

**確認対象**: IPC セキュリティ原則、sender 検証、P42 バリデーション

| TASK-9J要件                      | 仕様書の関連規定                                                                                      | 判定 | 根拠                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-3: P42 準拠3段バリデーション | Skill API 引数検証パターン（typeof + trim 検証）                                                      | 整合 | 全5チャネルの文字列引数（skillName 等）に P42 準拠の3段バリデーション（typeof → 空文字列 → trim 空文字列）を実装する。`VALIDATION_ERROR` コードで throw する |
| 全チャネル: sender 検証          | IPC sender 検証: webContents に対応する BrowserWindow の存在確認 + DevTools 拒否 + 許可ウィンドウ照合 | 整合 | 全5チャネルのハンドラで `validateIpcSender()` を呼び出す。TASK-9F / TASK-9G と同じ実装パターン                                                               |
| エラーレスポンス                 | エラーサニタイズ: 内部情報を漏洩しない                                                                | 整合 | catch ブロックで `sanitizeErrorMessage()` を適用し、パス・機密値をマスクしてから Renderer へ返却する                                                         |
| 契約ドリフト防止                 | P44/P45 対策: 引数形式一致・引数名セマンティクス確認・3段バリデーション                               | 整合 | ipc-contract-checklist.md の Phase 1-6 を実施する。ハンドラ・Preload API・テストの3箇所同時更新を行う                                                        |
| ホワイトリスト登録               | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS                                                         | 整合 | 5チャネルを `ALLOWED_INVOKE_CHANNELS` に追加する。safeInvoke パターンで検証される                                                                            |

**抵触箇所**: なし

---

### 5. security-skill-ipc.md

**確認対象**: skill 系 IPC の入力検証、safeInvoke 運用、チャネル検証テーブル

| TASK-9J要件                        | 仕様書の関連規定                                                                    | 判定           | 根拠                                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 5チャネルの検証要件                | IPC チャネル検証テーブル（全スキルチャネルの sender 検証 + P42 バリデーション記録） | 整合（要追記） | 既存テーブルには `skill:list` 〜 `skill:optimize:evaluate` の13チャネルが記録されている。TASK-9J の5チャネルを同テーブルに追記する必要がある |
| Preload API の safeInvoke パターン | SkillAPI Preload 実装セクション: safeInvoke 9件 + safeOn 4件                        | 整合（要追記） | 5チャネルを safeInvoke パターンで実装し、ALLOWED_INVOKE_CHANNELS に登録する。統一 SkillAPI のメソッド数が 13 → 18 に拡張される               |
| エラーサニタイズ                   | sanitizeErrorMessage() の適用範囲                                                   | 整合           | 既存のスキル関連ハンドラと同じパターンで `sanitizeErrorMessage()` を適用する                                                                 |

**抵触箇所**: なし

**追記予定（Phase 12 必須）**:

1. IPCチャネル検証テーブルに5チャネル分の行を追加:

| チャネル                     | 検証項目                                                         |
| ---------------------------- | ---------------------------------------------------------------- |
| `skill:analytics:record`     | sender検証 + SkillUsageEvent オブジェクト構造検証                |
| `skill:analytics:statistics` | sender検証 + skillName 非空文字列検証（trim() 含む）             |
| `skill:analytics:summary`    | sender検証（引数なし）                                           |
| `skill:analytics:trend`      | sender検証 + skillName 非空文字列検証 + AnalyticsPeriod 構造検証 |
| `skill:analytics:export`     | sender検証 + format 許可値検証（"csv" / "json"）                 |

2. 完了タスクテーブルに TASK-9J を追加
3. safeInvoke メソッド数の更新

---

### 6. interfaces-agent-sdk-skill.md

**確認対象**: skill 関連インターフェースと契約

| TASK-9J要件                                     | 仕様書の関連規定                                                           | 判定           | 根拠                                                                                                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新規型定義: SkillUsageEvent, SkillStatistics 等 | 既存型定義テーブル（Skill, SkillMetadata, ScheduledSkill 等）              | 整合（要追記） | 新規型は `packages/shared/src/types/skill-analytics.ts` に定義する。既存の `skill-schedule.ts`（TASK-9G: ScheduledSkill, SkillSchedule 等）と同じ配置パターン                    |
| skillAnalyticsAPI メソッド定義                  | 統一 SkillAPI メソッド一覧テーブル + skillScheduleAPI メソッド一覧テーブル | 整合（要追記） | TASK-9G の `skillScheduleAPI`（5メソッド: scheduleList / scheduleAdd / scheduleUpdate / scheduleDelete / scheduleToggle）と同じ形式で `skillAnalyticsAPI`（5メソッド）を追記する |
| Branded Type との連携                           | SkillId / SkillName Branded Type                                           | 整合           | SkillStatistics の skillName フィールドは `string` 型で定義し、IPC 境界では Branded Type を強制しない。サービス内部で必要に応じて変換する                                        |

**抵触箇所**: なし

**追記予定（Phase 12 必須）**:

1. `skillAnalyticsAPI` メソッド一覧テーブルを追加:

| メソッド名            | 引数                                                | 戻り値                      | チャネル                     |
| --------------------- | --------------------------------------------------- | --------------------------- | ---------------------------- |
| `analyticsRecord`     | `event: SkillUsageEvent`                            | `Promise<void>`             | `skill:analytics:record`     |
| `analyticsStatistics` | `skillName: string`                                 | `Promise<SkillStatistics>`  | `skill:analytics:statistics` |
| `analyticsSummary`    | なし                                                | `Promise<AnalyticsSummary>` | `skill:analytics:summary`    |
| `analyticsTrend`      | `skillName: string, period: AnalyticsPeriod`        | `Promise<UsageTrend>`       | `skill:analytics:trend`      |
| `analyticsExport`     | `format: "csv" \| "json", period?: AnalyticsPeriod` | `Promise<string>`           | `skill:analytics:export`     |

2. 新規型定義テーブルを追加
3. 完了タスクセクションに TASK-9J を追加

---

### 7. ipc-contract-checklist.md

**確認対象**: IPC 契約検証手順（Phase 1-6）の適用可否

| TASK-9J要件                         | 仕様書の関連規定                                                                                | 判定 | 根拠                                                                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5チャネルの新規作成                 | Phase 1: 変更前の契約確認（3箇所確認）                                                          | 整合 | 新規作成のため「変更前」の確認は不要だが、既存チャネルとの命名衝突がないことを確認する                                                                                |
| ハンドラ・Preload・テストの同時実装 | Phase 2: 実装変更（3箇所同時更新）                                                              | 整合 | 新規5チャネルについて、(1) Main ハンドラ (2) Preload API (3) テスト を同一コミットで作成する                                                                          |
| NFR-3: P42 バリデーション           | Phase 3: バリデーション確認（typeof + 空文字列 + trim）                                         | 整合 | 全文字列引数に3段バリデーションを実装する。`skill:analytics:statistics` の skillName、`skill:analytics:trend` の skillName、`skill:analytics:export` の format に適用 |
| 型定義の配置                        | Phase 4: 型定義同期（packages/shared + preload/types.ts）                                       | 整合 | `packages/shared/src/types/skill-analytics.ts` に型定義し、`apps/desktop/src/preload/types.ts` にも Preload 層の型定義を同期する                                      |
| 仕様書更新                          | Phase 5: 仕様書同期（security-skill-ipc.md / interfaces-agent-sdk-skill.md / api-ipc-agent.md） | 整合 | Phase 12 にて上記3仕様書を更新する                                                                                                                                    |
| テスト検証                          | Phase 6: テスト検証（正常系・異常系・セキュリティ）                                             | 整合 | 正常系・異常系（P42 バリデーションエラー）・セキュリティ（sender 検証）テストを実装する                                                                               |

**抵触箇所**: なし

---

### 8. error-handling.md

**確認対象**: エラーカテゴリとコード範囲、エラーレスポンス形式

| TASK-9J要件                          | 仕様書の関連規定                                                               | 判定 | 根拠                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-3: VALIDATION_ERROR コードの使用 | エラーカテゴリ: Validation Error（コード範囲 1000-1999、リトライ不可）         | 整合 | P42 バリデーション失敗時に `{ code: "VALIDATION_ERROR", message: "..." }` を throw する。Validation Error カテゴリに該当し、リトライ不可 |
| FR-1: イベント記録失敗時のエラー     | エラーカテゴリ: Infrastructure Error（4000-4999）/ Internal Error（5000-5999） | 整合 | electron-store への書き込み失敗は Infrastructure Error として分類する。予期しない内部エラーは Internal Error                             |
| エラーサニタイズ                     | sanitizeErrorMessage(): 内部情報（path, host, token）のマスク                  | 整合 | catch ブロックで `sanitizeErrorMessage()` を適用する。非 Error 例外および JS ランタイム詳細エラーは既定文言に正規化する                  |
| エラーレスポンス形式                 | Result 型パターン: `{ success, error, request_id }`                            | 整合 | IPC レスポンスは既存パターンに準拠する。ハンドラ内で throw した場合、Electron IPC の標準エラーハンドリングにより Renderer に伝播する     |

**抵触箇所**: なし

---

### 9. quality-requirements.md

**確認対象**: テストカバレッジ基準、品質ゲート

| TASK-9J要件               | 仕様書の関連規定                                        | 判定 | 根拠                                                                                                                                            |
| ------------------------- | ------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| テストカバレッジ目標      | ドメインサービス: Line 90%+, Branch 70%+, Function 90%+ | 整合 | SkillAnalytics / AnalyticsStore のテストカバレッジは Line 90%+、Branch 70%+、Function 90%+ を目標とする                                         |
| TDD サイクル              | Red → Green → Refactor                                  | 整合 | Phase 4（テスト作成）→ Phase 5（実装）→ Phase 8（リファクタリング）の Phase 構成が TDD サイクルに準拠する                                       |
| NFR-4: パフォーマンス基準 | 応答時間基準: 95パーセンタイル 500ms 以内（UI操作）     | 整合 | NFR-4 の「10,000件で1秒以内」はバックエンド集計処理であり、UI 操作の応答時間基準（500ms）よりも緩い設定。仕様書のパフォーマンス基準と矛盾しない |
| Phase 7: カバレッジ確認   | カバレッジ未達時は Phase 6 へ戻る                       | 整合 | Phase 7 でカバレッジ基準を確認し、未達の場合は Phase 6（テスト拡充）に戻る                                                                      |

**抵触箇所**: なし

---

### 10. development-guidelines.md

**確認対象**: テスト実装方針、ログ運用、命名規約

| TASK-9J要件        | 仕様書の関連規定                                    | 判定 | 根拠                                                                                                       |
| ------------------ | --------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| テスト実装方針     | Vitest + happy-dom 環境、describe/it 構造           | 整合 | Main Process のサービステストは happy-dom 不要（Node.js 環境で実行）。Vitest の describe/it 構造で記述する |
| ログ運用           | electron-log による構造化ログ、環境別出力レベル制御 | 整合 | SkillAnalytics のログは electron-log を使用する。テスト環境ではログ出力を抑制する（P20 対策）              |
| 命名規約           | boolean 変数: is/has/can/should プレフィックス      | 整合 | `isValidEvent`, `hasData` 等の boolean 変数名に is/has プレフィックスを使用する                            |
| コードレビュー基準 | any 型不使用、曖昧表現不使用                        | 整合 | 全型定義で any を使用せず、strict: true で型チェックを強制する                                             |
| Git ワークフロー   | feature/ プレフィックスのブランチ名                 | 整合 | `feature/task-9j-skill-analytics` ブランチで作業する                                                       |

**抵触箇所**: なし

---

## 横断的整合性チェック

### TASK-9J 機能要件 × 仕様書マトリクス

| 要件                      | arch-overview | arch-services | api-ipc | sec-ipc | sec-skill | if-skill | ipc-check | err-handle | quality | dev-guide |
| ------------------------- | :-----------: | :-----------: | :-----: | :-----: | :-------: | :------: | :-------: | :--------: | :-----: | :-------: |
| FR-1: イベント記録        |      OK       |      OK       |   OK    |   OK    |    OK     |    OK    |    OK     |     OK     |    -    |    OK     |
| FR-2: 統計取得            |      OK       |      OK       |   OK    |   OK    |    OK     |    OK    |    OK     |     -      |    -    |     -     |
| FR-3: サマリー取得        |      OK       |      OK       |   OK    |   OK    |    OK     |    OK    |    OK     |     -      |    -    |     -     |
| FR-4: トレンド分析        |      OK       |      OK       |   OK    |   OK    |    OK     |    OK    |    OK     |     -      |    -    |     -     |
| FR-5: エクスポート        |      OK       |      OK       |   OK    |   OK    |    OK     |    OK    |    OK     |     -      |    -    |     -     |
| FR-6: データクリア        |      OK       |      OK       |    -    |    -    |     -     |    -     |     -     |     -      |    -    |     -     |
| NFR-1: electron-store     |      OK       |      OK       |    -    |    -    |     -     |    -     |     -     |     -      |    -    |     -     |
| NFR-2: ISO 8601           |       -       |       -       |   OK    |    -    |     -     |    OK    |    OK     |     -      |    -    |     -     |
| NFR-3: P42 バリデーション |       -       |       -       |    -    |   OK    |    OK     |    -     |    OK     |     OK     |    -    |     -     |
| NFR-4: パフォーマンス     |       -       |       -       |    -    |    -    |     -     |    -     |     -     |     -      |   OK    |     -     |

凡例: OK = 整合確認済み、- = 該当なし（当該仕様書のスコープ外）

---

## 結論

### 抵触箇所

TASK-9J の全要件（FR-1〜FR-6、NFR-1〜NFR-4、5 IPC チャネル）は、調査対象の10仕様書いずれとも抵触しない。

### Phase 12 での仕様書追記が必要な箇所

| 仕様書                          | 追記内容                                                                       | 優先度       |
| ------------------------------- | ------------------------------------------------------------------------------ | ------------ |
| `security-skill-ipc.md`         | IPCチャネル検証テーブルに5チャネル追加、完了タスク記録追加                     | 必須         |
| `interfaces-agent-sdk-skill.md` | skillAnalyticsAPI メソッド一覧追加、新規型定義テーブル追加、完了タスク記録追加 | 必須         |
| `arch-electron-services.md`     | コンポーネント構成テーブルに SkillAnalytics / AnalyticsStore 追加              | 必須         |
| `api-ipc-agent.md`              | skill:analytics:\* 5チャネルの一覧テーブル追加                                 | 該当する場合 |
| `security-electron-ipc.md`      | TASK-9J セキュリティ実装パターンの変更履歴追加                                 | 該当する場合 |

### 既存パターンとの一貫性

TASK-9J は以下の既存タスクと同じ実装パターンを踏襲する:

| 踏襲元タスク              | パターン                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| TASK-9G（skill-schedule） | `skill:schedule:*` 階層的チャネル命名、electron-store 永続化、ScheduleStore 分離パターン |
| TASK-9F（skill-share）    | validateIpcSender + P42 3段バリデーション + sanitizeErrorMessage の多層防御              |
| TASK-9A-B（skill-file）   | skillHandlers.ts へのハンドラ追加、ALLOWED_INVOKE_CHANNELS へのホワイトリスト登録        |
| TASK-9B（skill-creator）  | Preload API メソッド追加、safeInvoke パターン、型定義の packages/shared 配置             |

### 解決アプローチ

仕様書への追記は全て Phase 12（ドキュメント）で実施する。実装（Phase 4-5）段階では仕様書との抵触を意識する必要はなく、既存パターンに従って実装を進められる。
