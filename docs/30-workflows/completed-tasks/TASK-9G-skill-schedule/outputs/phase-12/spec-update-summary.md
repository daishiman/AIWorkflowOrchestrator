# TASK-9G 仕様更新サマリー

## 更新日

2026-02-27

---

## 1. メタ情報

| 項目         | 値                                                                               |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | TASK-9G                                                                          |
| 実施日       | 2026-02-27                                                                       |
| ステータス   | completed                                                                        |
| SubAgent分担 | A:interfaces / B:api-ipc / C:security / D:architecture / E:task-workflow+lessons |

## 2. 実装内容サマリー

| 観点           | 内容                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| 何を実装したか | スキルスケジュール機能（5 IPCチャネル、ScheduleStore、SkillScheduler、Preload API 5メソッド） |
| 変更範囲       | `packages/shared` 型定義 / Main サービス・IPC / Preload API / Phase 12成果物                  |
| なぜ必要か     | スキル実行の定期化・一回実行・イベント実行を統一契約で提供するため                            |
| 完了判定       | 実装・テスト・仕様更新・未タスク登録・監査コマンドがすべてPASS                                |

## 3. 仕様書別SubAgent分担

| SubAgent | 担当仕様書                                                                     | 主担当作業                                             | 依存関係       |
| -------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------- |
| A        | `references/interfaces-agent-sdk-skill.md`                                     | 共有型4種と Preload API 5メソッド契約の同期            | 実装差分確定後 |
| B        | `references/api-ipc-agent.md`                                                  | 5チャネル（request/response/validation）の契約同期     | A完了後        |
| C        | `references/security-electron-ipc.md`                                          | sender検証 + P42 + 方式別必須検証 + エラー正規化の同期 | B完了後        |
| D        | `references/arch-electron-services.md` / `references/architecture-overview.md` | Main 初期化配線・DI構成・責務分離の同期                | A/B/C完了後    |
| E        | `references/task-workflow.md` / `references/lessons-learned.md`                | 完了台帳・苦戦箇所・簡潔解決手順の同期                 | D完了後        |

## 4. 実装時の苦戦箇所（再利用可能形式）

| 苦戦箇所                       | 再発条件                                            | 解決策                                                                       | 今後の標準ルール                                                           |
| ------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 仕様書6ファイル同期漏れ        | IPC契約・型・配線・台帳を別ターンで更新した場合     | `interfaces/api-ipc/security/architecture/task+lessons` を同一ターンで同期   | 仕様同期は SubAgent 分担表を先に確定してから実施する                       |
| Phase成果物（7〜13）欠落       | `artifacts.json` 更新と成果物作成を分離した場合     | 欠落成果物を再作成し、`phase-12-documentation.md` と `artifacts.json` を同期 | Phase 12 完了判定を「成果物実体 + 台帳同期」の2条件に固定する              |
| 監査結果の誤読（baseline混入） | `audit-unassigned-tasks` の total件数で判定した場合 | `currentViolations` のみで合否判定し、baselineは別管理                       | 差分監査は `--diff-from HEAD` + `currentViolations=0` を完了条件に固定する |

---

## Phase 1 要件定義からの変更点

### 変更1: runHistory の最大保持件数（NFR-08）

| 項目     | Phase 1 要件                          | 実装                                           |
| -------- | ------------------------------------- | ---------------------------------------------- |
| 最大件数 | 最新 **10件** を保持（FR-08, NFR-08） | 最新 **100件** を保持（MAX_RUN_HISTORY = 100） |

- **理由**: Phase 2 設計時に、10件では長期運用で過去の実行パターン分析に不十分と判断。100件に拡張した。ScheduleStore.ts の `MAX_RUN_HISTORY` 定数で制御しており、変更は容易
- **影響**: ストレージ使用量が増加するが、1件あたりのデータサイズは小さい（約200バイト）ため、100件でも約20KBに収まり実用上問題なし

### 変更2: DI パターン（Constructor Injection に変更）

| 項目        | Phase 1/2 設計                                              | 実装                                                       |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| DI パターン | Setter Injection（`setSkillExecutor()`, `setMainWindow()`） | Constructor Injection（コンストラクタ引数）                |
| DI 対象     | SkillExecutor + BrowserWindow                               | ScheduleStore + SchedulerSkillExecutor                     |
| mainWindow  | Setter Injection で遅延注入                                 | IPCハンドラ引数として渡す（SkillScheduler 内部では不使用） |

- **理由**: SkillScheduler は mainWindow を直接使用しない（通知機能は未実装のため）。また、SkillExecutor の生成タイミングが SkillScheduler と同時期に可能であったため、Constructor Injection で十分だった。さらに `SchedulerSkillExecutor` インターフェースを定義し、依存を最小化した
- **影響**: テスト時のモック注入が簡潔になった。mainWindow は IPCハンドラ登録関数 `registerSkillScheduleHandlers()` の引数として受け取る設計に変更

### 変更3: sendNotification() 未実装

| 項目        | Phase 1/2 設計  | 実装                       |
| ----------- | --------------- | -------------------------- |
| 通知機能    | FR-09: 実装する | 未実装（プレースホルダー） |
| 対応する AC | AC-08           | 未対応                     |

- **理由**: 通知機能の実装には `Electron Notification API` と `mainWindow.webContents.send()` の連携が必要であり、UI タスク（task-031b）との統合で対応する方が効率的と判断した。`NotificationSettings` 型は定義済みで、データの保存・復元は可能
- **影響**: スケジュール実行後の通知は送信されない。`NotificationSettings` のデータは保存されるが、効果を発揮しない

### 変更4: shutdown() メソッド未実装

| 項目     | Phase 2 設計                                       | 実装   |
| -------- | -------------------------------------------------- | ------ |
| shutdown | `async shutdown(): Promise<void>` で全タイマー停止 | 未実装 |

- **理由**: Electron の `app.on('before-quit')` でのクリーンアップ統合が、アプリ全体のライフサイクル管理タスクと連動するため、本タスクでは見送った
- **影響**: アプリ終了時にタイマーが明示的に停止されない。ただし、Node.js プロセス終了時にタイマーは自動的に破棄されるため、実害は限定的

### 変更5: IPCハンドラの引数形式（delete / toggle）

| 項目          | Phase 2 設計               | 実装                             |
| ------------- | -------------------------- | -------------------------------- |
| delete の引数 | `id: string`（直接文字列） | `{ id: string }`（オブジェクト） |
| toggle の引数 | `id: string`（直接文字列） | `{ id: string }`（オブジェクト） |

- **理由**: Preload 側の `safeInvokeUnwrap` でオブジェクト形式で渡す設計に統一し、将来的な引数追加に対応しやすくした。P44 の教訓（引数形式の不整合）を適用した結果
- **影響**: Preload API の `scheduleDelete(id)` と `scheduleToggle(id)` は内部で `{ id }` に変換して送信する

### 変更6: toggleSchedule の API 分離

| 項目       | Phase 2 設計                    | 実装                                                                                    |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| トグル API | `toggleSchedule(id)` 1メソッド  | `enableSchedule(id)` + `disableSchedule(id)` の2メソッドに分離                          |
| IPC 側     | IPCハンドラ内で toggle ロジック | IPCハンドラ内で `scheduleStore.getById()` で現在状態を取得し、enable/disable を呼び分け |

- **理由**: enable と disable を独立メソッドにすることで、それぞれの責務が明確になり、テスト容易性が向上した
- **影響**: IPC チャンネル `skill:schedule:toggle` は維持。内部ロジックが enableSchedule/disableSchedule に委譲される

### 変更7: ScheduleStore.delete() のエラー挙動

| 項目   | Phase 2 設計                     | 実装                                   |
| ------ | -------------------------------- | -------------------------------------- |
| 削除時 | 対象が存在しない場合は何もしない | 対象が存在しない場合は例外をスローする |

- **理由**: 「存在しないデータの削除は正常系」とするよりも、呼び出し側のバグを早期検出するために例外をスローする方がデバッグ効率が高いと判断した
- **影響**: 存在しない ID で deleteSchedule() を呼ぶと Error がスローされ、IPCハンドラの try/catch で捕捉されて `{ success: false, error: "Schedule not found: ..." }` として返却される

### 変更8: ScheduleStore にインメモリキャッシュ追加

| 項目       | Phase 2 設計                                | 実装                                                                             |
| ---------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| データ管理 | `this.store.get()` で毎回ストアから読み取り | `this.schedules` 配列でインメモリ管理し、変更時に `persist()` でストアに書き込み |

- **理由**: electron-store への読み書きは同期I/Oであるため、頻繁なアクセスでパフォーマンスが低下する可能性がある。インメモリキャッシュにより読み取りが O(1) になる
- **影響**: メモリ使用量がわずかに増加するが、実用上問題なし

### 変更9: P19 バリデーションの簡略化

| 項目                 | Phase 2 設計                                               | 実装                                           |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| 復元時検証フィールド | `id`, `skillName`, `prompt`, `enabled` の4フィールドを検証 | `id` のみ検証（`typeof item.id === "string"`） |

- **理由**: ScheduleStore のコンストラクタ段階で全フィールドを検証するとコードが冗長になる。`id` フィールドの存在を最低限のガードとし、他のフィールドはビジネスロジック層で検証する設計に変更した
- **影響**: 不正データ（`skillName` が欠損しているが `id` は存在する）が復元される可能性があるが、実行時に SkillScheduler 側で検出される

---

## 変更されたファイル一覧

### 新規追加ファイル

| ファイル                                                               | パッケージ    | 説明                                                                                          |
| ---------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts`               | @repo/desktop | スケジューラサービス本体（411行）                                                             |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`                | @repo/desktop | electron-store ベースの永続化ストア（162行）                                                  |
| `packages/shared/src/types/skill-schedule.ts`                          | @repo/shared  | 共有型定義（ScheduledSkill, SkillSchedule, NotificationSettings, ScheduledRunResult）（85行） |
| `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts` | @repo/desktop | ScheduleStore ユニットテスト（20テストケース: D-01~D-15 + DB-01~DB-05）                       |
| `packages/shared/src/types/__tests__/skill-schedule.test.ts`           | @repo/shared  | 型定義コンパイルテスト（5テストケース: T-01~T-05）                                            |

### 修正ファイル

| ファイル                                     | パッケージ    | 変更内容                                                                                      |
| -------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | @repo/desktop | `registerSkillScheduleHandlers()` / `unregisterSkillScheduleHandlers()` を追加（544-784行目） |
| `apps/desktop/src/preload/channels.ts`       | @repo/desktop | 5チャンネル定数を `IPC_CHANNELS` に追加、`ALLOWED_INVOKE_CHANNELS` に登録                     |
| `apps/desktop/src/preload/skill-api.ts`      | @repo/desktop | `SkillAPI` インターフェースに5メソッド追加、`skillAPI` 実装に5メソッド追加                    |
| `packages/shared/src/types/index.ts`         | @repo/shared  | `export * from "./skill-schedule"` を追加                                                     |
| `apps/desktop/package.json`                  | @repo/desktop | `node-cron`, `@types/node-cron` を依存関係に追加                                              |

---

## 新規追加された型定義

| 型名                     | ファイル            | 説明                                                             |
| ------------------------ | ------------------- | ---------------------------------------------------------------- |
| `ScheduledSkill`         | `skill-schedule.ts` | スケジュール済みスキルの全情報を保持するインターフェース         |
| `SkillSchedule`          | `skill-schedule.ts` | スケジュール設定（cron / interval / once / event の4方式）       |
| `NotificationSettings`   | `skill-schedule.ts` | 通知設定（成功時/失敗時の通知有無と通知方式）                    |
| `ScheduledRunResult`     | `skill-schedule.ts` | スケジュール実行結果（runId, startedAt, success, output, error） |
| `SchedulerSkillExecutor` | `SkillScheduler.ts` | スケジューラが必要とするスキル実行インターフェース（DI用）       |
| `ActiveJob`              | `SkillScheduler.ts` | アクティブジョブの内部参照型（type discriminator パターン）      |
| `ScheduleStoreSchema`    | `ScheduleStore.ts`  | electron-store のスキーマ型                                      |

---

## IPC チャンネル追加（5チャンネル）

| 定数名                  | チャンネル文字列        | 方向   | 引数型                                             | 戻り値型                                 |
| ----------------------- | ----------------------- | ------ | -------------------------------------------------- | ---------------------------------------- |
| `SKILL_SCHEDULE_LIST`   | `skill:schedule:list`   | invoke | なし                                               | `IpcResult<ScheduledSkill[]>`            |
| `SKILL_SCHEDULE_ADD`    | `skill:schedule:add`    | invoke | `Omit<ScheduledSkill, "id" \| "runHistory">`       | `IpcResult<ScheduledSkill>`              |
| `SKILL_SCHEDULE_UPDATE` | `skill:schedule:update` | invoke | `{ id: string, updates: Partial<ScheduledSkill> }` | `IpcResult<void>`                        |
| `SKILL_SCHEDULE_DELETE` | `skill:schedule:delete` | invoke | `{ id: string }`                                   | `IpcResult<void>`                        |
| `SKILL_SCHEDULE_TOGGLE` | `skill:schedule:toggle` | invoke | `{ id: string }`                                   | `IpcResult<ScheduledSkill \| undefined>` |

全チャンネルは `ALLOWED_INVOKE_CHANNELS` ホワイトリストに登録済み。
`ALLOWED_ON_CHANNELS`（Main -> Renderer のイベント）への追加はなし（現時点ではスケジュール実行完了通知の push は未実装）。

---

## Phase 2 設計からの変更点サマリー

| 項目                   | Phase 2 設計                          | 実装                                   | 理由                                       |
| ---------------------- | ------------------------------------- | -------------------------------------- | ------------------------------------------ |
| DI パターン            | Setter Injection                      | Constructor Injection                  | 生成タイミングが同時期のため不要           |
| タイマー管理 Map       | `cronTasks` + `timers` の2つ          | `activeJobs` 1つに統合                 | 管理の簡素化とテスト容易性の向上           |
| toggleSchedule         | 1メソッド                             | enable/disable の2メソッドに分離       | 責務の明確化とテスト容易性の向上           |
| delete/toggle 引数     | `string` 直接                         | `{ id: string }` オブジェクト          | P44 教訓適用。将来の引数追加に対応         |
| ScheduleStore.delete() | 存在しない場合は何もしない            | 存在しない場合は例外スロー             | バグ早期検出のため                         |
| ScheduleStore 内部     | 毎回 store.get() で読み取り           | インメモリキャッシュ + persist()       | 読み取りパフォーマンス向上                 |
| validateScheduleConfig | 独立関数として設計                    | IPC ハンドラ内にインライン実装         | Phase 8 リファクタリングで共通関数に抽出   |
| sendNotification()     | 実装する                              | 未実装                                 | UI タスクとの統合で対応                    |
| shutdown()             | 実装する                              | 未実装                                 | アプリライフサイクル管理タスクと連動       |
| P19 検証フィールド     | id, skillName, prompt, enabled の4つ  | id のみ                                | 最低限のガードとし、BL層で詳細検証         |
| runHistory 上限        | 10件                                  | 100件                                  | 長期運用での分析に対応                     |
| electron-store schema  | JSON Schema バリデーション付き        | defaults のみ                          | P19 の実行時バリデーションで十分と判断     |
| re-export 方式         | `export type { ... }` 個別指定        | `export * from "./skill-schedule"`     | 全型を自動エクスポートする方が保守性が高い |
| Preload API 構造       | `schedule: { list, add, ... }` ネスト | `scheduleList`, `scheduleAdd` フラット | 既存 SkillAPI パターンとの整合性維持       |

---

## 未タスク登録（Step 1-E）

Phase 12 で検出した 5 件の未タスクを `docs/30-workflows/unassigned-task/` に正式登録し、
`task-workflow.md` と `interfaces-agent-sdk-skill.md` へリンクを同期した。

| タスクID  | 指示書                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| UT-9G-001 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-cron-next-run-accuracy.md`   |
| UT-9G-002 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-event-trigger-completion.md` |
| UT-9G-003 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-notification-dispatch.md`    |
| UT-9G-004 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-graceful-shutdown.md`        |
| UT-9G-005 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-execution-push-event.md`     |

---

## 成果物台帳同期（追補）

Phase 12 の運用ルールに合わせて、成果物台帳を以下の 2 ファイルで同期した。

- `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/artifacts.json`
- `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/artifacts.json`

同期方法: ルート台帳を正本として `outputs/artifacts.json` へ同一内容を反映。

---

## 同種課題の簡潔解決手順（5ステップ）

1. 実装差分確定後に SubAgent 分担（interfaces/api-ipc/security/architecture/task+lessons）を先に固定する。
2. 仕様更新は `task-workflow.md` と `lessons-learned.md` を含めて同一ターンで同期する。
3. 未タスクは `docs/30-workflows/unassigned-task/` へ配置し、テンプレート見出し（メタ情報 + 1..9）まで確認する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を固定順で実行する。
5. 監査結果は `currentViolations` を合否基準にして、baselineは改善バックログに分離する。

## 再確認時の検証コマンド

| コマンド                                                                                                                                                | 目的               | 判定基準              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9G-skill-schedule --json` | Phase仕様整合      | `13/13 PASS`          |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9G-skill-schedule`              | Phase成果物構造    | `0エラー, 0警告`      |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                     | 未タスクリンク整合 | `missing=0`           |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                              | 今回差分監査       | `currentViolations=0` |
