# Phase 1: 要件定義

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 1                      |
| 機能名    | TASK-9G-skill-schedule |
| 作成日    | 2026-02-27             |
| 前提Phase | なし                   |
| 後続Phase | Phase 2: 設計          |
| 状態      | 未着手                 |

## 目的

スキルスケジュール実行機能の機能要件・非機能要件を抽出し、受け入れ基準を定義する。
本タスクはバックエンドサービス・IPC契約・型定義のみを対象とし、UIコンポーネントはスコープ外とする。

## 実行タスク

- 要件抽出: スケジュール方式4種（cron/interval/once/event）の機能要件を定義
- 非機能要件定義: セキュリティ・パフォーマンス・永続化・エラーハンドリングの要件を定義
- 受け入れ基準作成: 各要件に対してGherkin形式で検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定
- スコープ定義: 実装範囲と除外範囲を明確化

## 参照資料

| 資料名                   | パス                                                                                                                                 | 説明                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| タスク定義               | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/index.md`                                                                  | TASK-9G概要          |
| システム仕様（IPC）      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                 | IPC チャンネル仕様   |
| システム仕様（サービス） | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                                                        | Electronサービス設計 |
| システム仕様（スキルIF） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                    | スキル型定義         |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                         | IPC セキュリティ     |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                            | Skill系IPC境界       |
| エラーハンドリング仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                | エラーハンドリング   |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                                         | アーキテクチャ概要   |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                        | IPC契約検証手順      |
| IPC型不整合ガイド        | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`                                                     | Date/引数形式の整合  |
| UI仕様（参考）           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md` | スケジュールUI仕様   |

## 要件定義

### 機能要件（FR）

| FR-ID | 要件                                                                                                                       | 優先度 |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | cron式（`node-cron`互換）でスケジュールを登録し、指定パターンでスキルを自動実行する                                        | 高     |
| FR-02 | インターバル（ミリ秒指定）でスケジュールを登録し、一定間隔でスキルを自動実行する                                           | 高     |
| FR-03 | ワンショット（ISO 8601日時指定）でスケジュールを登録し、指定時刻に1回だけスキルを自動実行する                              | 高     |
| FR-04 | イベントトリガー（`app_start` / `file_change` / `git_commit`）でスケジュールを登録し、イベント発生時にスキルを自動実行する | 中     |
| FR-05 | スケジュールの有効/無効を切り替えられる（`enabled`フラグのトグル）                                                         | 高     |
| FR-06 | スケジュールのCRUD操作（追加・取得・更新・削除）をIPC経由で実行できる                                                      | 高     |
| FR-07 | アプリ再起動後に保存済みスケジュールを`electron-store`から復元し、有効なスケジュールのタイマーを再開する                   | 高     |
| FR-08 | スキル実行結果を`ScheduledRunResult`として`runHistory`に記録し、最新10件を保持する                                         | 中     |
| FR-09 | スキル実行完了時に`NotificationSettings`に基づいて通知を送信する（成功時・失敗時を個別制御）                               | 中     |
| FR-10 | `nextRun`を計算し、次回実行予定時刻をスケジュール情報として返却する                                                        | 中     |

### 非機能要件（NFR）

| NFR-ID | 要件                                                                                                                                                       | 優先度 | 参照                                    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------- |
| NFR-01 | 全IPCハンドラでP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を実施する                                                                | 高     | `06-known-pitfalls.md#P42`              |
| NFR-02 | 全IPCハンドラで`validateIpcSender()`による送信元ウィンドウ検証を実施する                                                                                   | 高     | `04-electron-security.md`               |
| NFR-03 | IPCハンドラの引数名はPreload側で渡す値のセマンティクスと一致させる（P45対策）                                                                              | 高     | `06-known-pitfalls.md#P45`              |
| NFR-04 | スケジュールデータは`electron-store`で永続化し、アプリ再起動後も保持する                                                                                   | 高     | —                                       |
| NFR-05 | `setInterval`/`node-cron`のタイマー参照を`Map<string, ...>`で管理し、スケジュール削除時に`clearInterval`/`task.stop()`で確実に解放する（メモリリーク防止） | 高     | —                                       |
| NFR-06 | 同一スケジュールIDのタイマーが二重登録されないようガードする（P5対策）                                                                                     | 高     | `06-known-pitfalls.md#P5`               |
| NFR-07 | IPC境界ではDate型を`.toISOString()`でISO 8601文字列に変換して返却する                                                                                      | 高     | —                                       |
| NFR-08 | `runHistory`は最新10件に制限し、無制限な蓄積によるストレージ肥大化を防止する                                                                               | 中     | —                                       |
| NFR-09 | スケジュール実行エラーは握りつぶさず`ScheduledRunResult.error`に記録し、通知で通知する                                                                     | 中     | `02-code-quality.md#エラーハンドリング` |
| NFR-10 | 共有型定義は`packages/shared/src/types/skill-schedule.ts`に配置し、`index.ts`からre-exportする                                                             | 高     | `01-architecture.md#モノレポ構造`       |
| NFR-11 | 既存テスト（9000件以上）が全てPASSする状態を維持する                                                                                                       | 高     | —                                       |

### IPCチャンネル定義

| チャンネル名            | メソッド | 引数                                               | 戻り値                                      | 説明               |
| ----------------------- | -------- | -------------------------------------------------- | ------------------------------------------- | ------------------ |
| `skill:schedule:list`   | `handle` | なし                                               | `{ success: true, data: ScheduledSkill[] }` | 全スケジュール取得 |
| `skill:schedule:add`    | `handle` | `Omit<ScheduledSkill, "id" \| "runHistory">`       | `{ success: true, data: ScheduledSkill }`   | スケジュール追加   |
| `skill:schedule:update` | `handle` | `{ id: string, updates: Partial<ScheduledSkill> }` | `{ success: true }`                         | スケジュール更新   |
| `skill:schedule:delete` | `handle` | `id: string`                                       | `{ success: true }`                         | スケジュール削除   |
| `skill:schedule:toggle` | `handle` | `id: string`                                       | `{ success: true, data: ScheduledSkill }`   | 有効/無効トグル    |

## 受け入れ基準

### AC-01: Cronスケジュール登録と実行

- **Given**: SkillSchedulerが初期化されている
- **When**: cron式`"*/5 * * * *"`（5分毎）とスキル名・プロンプトを指定してスケジュールを追加する
- **Then**: `node-cron`タスクが登録され、cron式に合致するタイミングでスキルが自動実行される

### AC-02: インターバルスケジュール登録と実行

- **Given**: SkillSchedulerが初期化されている
- **When**: インターバル`60000`（60秒）とスキル名・プロンプトを指定してスケジュールを追加する
- **Then**: `setInterval`で60秒ごとにスキルが自動実行される

### AC-03: ワンショットスケジュール登録と実行

- **Given**: SkillSchedulerが初期化されている
- **When**: 未来の日時（ISO 8601）を指定してワンショットスケジュールを追加する
- **Then**: 指定時刻に1回だけスキルが実行され、実行後に`enabled`が`false`に設定される

### AC-04: イベントトリガースケジュール（app_start）

- **Given**: `event: "app_start"`のスケジュールが有効状態で保存されている
- **When**: アプリケーションが起動しSkillScheduler.initialize()が呼ばれる
- **Then**: `app_start`イベントのスケジュールが即座に実行される

### AC-05: スケジュール有効/無効トグル

- **Given**: 有効状態のcronスケジュールが存在する
- **When**: `skill:schedule:toggle` IPCチャンネルで該当スケジュールIDを送信する
- **Then**: スケジュールが無効化され、`node-cron`タスクが停止し、`enabled`が`false`になる

### AC-06: スケジュール永続化と復元

- **Given**: 複数のスケジュールが登録されている
- **When**: アプリケーションを再起動する
- **Then**: `electron-store`から全スケジュールが復元され、`enabled: true`のスケジュールのタイマーが再開される

### AC-07: 実行履歴の記録

- **Given**: 有効なスケジュールが存在する
- **When**: スケジュールされたスキルが実行される（成功または失敗）
- **Then**: `ScheduledRunResult`が`runHistory`に追加され、最新10件のみ保持される

### AC-08: 通知設定に基づく通知送信

- **Given**: `notification.onSuccess: true, notificationType: "system"`のスケジュールが存在する
- **When**: スケジュールされたスキルが正常に実行完了する
- **Then**: システム通知（`Notification` API）が送信される

### AC-09: IPCバリデーション

- **Given**: `skill:schedule:delete`ハンドラが登録されている
- **When**: 空文字列`""`またはスペースのみ`"   "`のIDが送信される
- **Then**: `VALIDATION_ERROR`がスローされ、スケジュールは削除されない

### AC-10: タイマーの確実な解放

- **Given**: 有効なcronスケジュールとintervalスケジュールが各1件存在する
- **When**: 両スケジュールを削除する
- **Then**: `node-cron`タスクの`stop()`と`clearInterval`が呼ばれ、タイマー参照がMapから削除される

## スコープ定義

### 含むもの

- `SkillScheduler`サービス（Main Process）— スケジュールのライフサイクル管理
- `ScheduleStore`（electron-store ラッパー）— スケジュールデータの永続化
- `packages/shared/src/types/skill-schedule.ts` — 共有型定義
- IPCハンドラ5件（`skill:schedule:list/add/update/delete/toggle`）
- Preload API拡張（`skill-api.ts`に`schedule`メソッド追加）
- `channels.ts`へのチャンネル定数追加
- `preload/types.ts`への型追加
- `apps/desktop/src/main/ipc/index.ts`への初期化呼び出し追加
- ユニットテスト（SkillScheduler、ScheduleStore、IPCハンドラ）

### 含まないもの

- スケジュール管理UI（ScheduleSkillDialog / CronEditor / ScheduleList — task-031bで定義）
- Rendererコンポーネント
- E2Eテスト（Playwright）
- `file_change`イベントの詳細実装（ファイル監視ライブラリの選定は別タスク。本タスクではインターフェースのみ定義し、`eventConfig`で監視対象パスを指定する型定義を提供する）
- `git_commit`イベントの詳細実装（Git hookの設定は別タスク。本タスクではインターフェースのみ定義する）

## アーキテクチャ層別要件

| 層             | 要件                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Shared Package | `ScheduledSkill`、`SkillSchedule`、`NotificationSettings`、`ScheduledRunResult`型定義。`index.ts`からre-export |
| Main Process   | `SkillScheduler`サービス（スケジュール管理・タイマー管理・実行制御）、`ScheduleStore`（永続化）                |
| IPC通信        | 5チャンネル追加。全ハンドラでsender検証・P42バリデーション実施                                                 |
| Preload        | `skill-api.ts`にscheduleメソッド5件追加。`channels.ts`に定数5件追加                                            |
| Renderer       | 変更なし（UIは別タスクのスコープ）                                                                             |

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| IPC通信          | `skill:schedule:list/add/update/delete/toggle` 5チャンネル。全てハンドラ形式（invoke/handle）          |
| スキル実行連携   | `SkillScheduler` → `SkillExecutor.execute()` でスキルを実行。既存の`skill:execute`と同じ実行パスを使用 |
| 永続化           | `electron-store`でJSON形式保存。キー: `scheduledSkills`。値: `ScheduledSkill[]`                        |
| 通知             | `Notification` API（システム通知）。Main Processから送信                                               |
| データフロー     | Main Process（ScheduleStore ↔ SkillScheduler ↔ SkillExecutor） → IPC → Preload → Renderer              |

## 多角的チェック観点

| 観点           | 確認事項                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------- |
| セキュリティ   | IPC送信元検証、引数バリデーション（P42）、cron式のインジェクション防止（node-cronのvalidate使用） |
| メモリ安全性   | タイマー二重登録防止（P5）、削除時のタイマー解放、runHistory件数制限                              |
| 型安全性       | IPC境界のDate→ISO 8601変換、共有型の@repo/shared配置、Preload型との整合性                         |
| 障害耐性       | スキル実行失敗時のエラー記録と継続動作、不正cron式の拒否、過去日時ワンショットの拒否              |
| テスタビリティ | DI設計によるモック可能性、タイマーのfake timer対応、node-cronのモック可能性                       |

## 成果物

| 成果物     | パス                                         | 説明           |
| ---------- | -------------------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 本ドキュメント |

## 完了条件

- [ ] 機能要件（FR-01〜FR-10）が全て定義されている
- [ ] 非機能要件（NFR-01〜NFR-11）が全て定義されている
- [ ] 受け入れ基準（AC-01〜AC-10）がGherkin形式で記述されている
- [ ] IPCチャンネル5件の引数・戻り値が定義されている
- [ ] スコープ（含むもの/含まないもの）が明確に記述されている
- [ ] アーキテクチャ層別要件が定義されている
- [ ] 統合テスト連携の接続要件が記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
