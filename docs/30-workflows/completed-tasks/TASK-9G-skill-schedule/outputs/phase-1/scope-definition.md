# TASK-9G: スキルスケジュール実行機能 — スコープ定義書

## メタ情報

| 項目     | 値            |
| -------- | ------------- |
| タスクID | TASK-9G       |
| Phase    | 1（要件定義） |
| 作成日   | 2026-02-27    |
| 状態     | 作成完了      |

---

## 1. 実装範囲（In Scope）

### 1.1 新規作成ファイル

| ファイル                                                 | 層           | 説明                                       |
| -------------------------------------------------------- | ------------ | ------------------------------------------ |
| `packages/shared/src/types/skill-schedule.ts`            | Shared       | スケジュール関連の共有型定義               |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | Main Process | スケジューラサービス（ライフサイクル管理） |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | Main Process | electron-storeによるスケジュール永続化     |

### 1.2 修正ファイル

| ファイル                                     | 層      | 変更内容                                  |
| -------------------------------------------- | ------- | ----------------------------------------- |
| `packages/shared/src/types/index.ts`         | Shared  | `skill-schedule.ts`のre-export追加        |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | Main    | `skill:schedule:*`ハンドラ5件追加         |
| `apps/desktop/src/preload/channels.ts`       | Preload | `SKILL_SCHEDULE_*`チャンネル定数5件追加   |
| `apps/desktop/src/preload/skill-api.ts`      | Preload | `schedule`APIメソッド5件追加              |
| `apps/desktop/src/preload/types.ts`          | Preload | `SkillAPI`型に`schedule`プロパティ追加    |
| `apps/desktop/src/main/ipc/index.ts`         | Main    | `SkillScheduler.initialize()`呼び出し追加 |

### 1.3 テストファイル（新規）

| ファイル                                                                | 説明                                        |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts` | SkillSchedulerのユニットテスト              |
| `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`  | ScheduleStoreのユニットテスト               |
| `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`     | スケジュール関連IPCハンドラのユニットテスト |

### 1.4 機能スコープ

| 機能カテゴリ     | 詳細                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| スケジュール方式 | cron（node-cron）、interval（setInterval）、once（setTimeout）、event（app_start実装 + file_change/git_commitの型定義のみ） |
| CRUD操作         | 追加・一覧取得・更新・削除・有効/無効トグル                                                                                 |
| 永続化           | electron-storeによるJSON形式保存・復元                                                                                      |
| タイマー管理     | Map<string, ...>によるタイマー参照管理、二重登録防止、確実な解放                                                            |
| 実行履歴         | ScheduledRunResult記録、最新10件保持                                                                                        |
| 通知             | Electron Notification APIによるシステム通知（成功/失敗の個別制御）                                                          |
| 次回実行時刻計算 | cron/interval/onceの次回実行時刻算出、eventはnull                                                                           |
| IPCセキュリティ  | validateIpcSender()、P42準拠3段バリデーション                                                                               |
| IPC境界の型変換  | Date→ISO 8601文字列変換                                                                                                     |

---

## 2. 実装範囲外（Out of Scope）

### 2.1 UIコンポーネント

| コンポーネント             | 理由                                               | 参照タスク |
| -------------------------- | -------------------------------------------------- | ---------- |
| ScheduleSkillDialog        | スケジュール設定ダイアログはUI実装タスクのスコープ | task-031b  |
| CronEditor                 | cron式の視覚的エディタはUI実装タスクのスコープ     | task-031b  |
| ScheduleList               | スケジュール一覧表示はUI実装タスクのスコープ       | task-031b  |
| ScheduleManager            | スケジュール管理画面全体はUI実装タスクのスコープ   | task-031b  |
| Rendererコンポーネント全般 | 本タスクはバックエンドとIPC契約のみを対象とする    | task-031b  |

### 2.2 イベントトリガーの詳細実装

| 機能                      | 理由                                                       | 対応方針                                      |
| ------------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `file_change`イベント監視 | ファイル監視ライブラリ（chokidar等）の選定・統合は別タスク | 型定義とeventConfigのインターフェースのみ提供 |
| `git_commit`フック設定    | Git hookの設定・統合は別タスク                             | 型定義とeventConfigのインターフェースのみ提供 |

### 2.3 テスト

| テスト種別 | 理由                                                   |
| ---------- | ------------------------------------------------------ |
| E2Eテスト  | Playwright等のE2Eテストは本タスクのスコープ外          |
| UIテスト   | Rendererコンポーネントがスコープ外のためUIテストも除外 |

### 2.4 インフラ・運用

| 項目                 | 理由                                                         |
| -------------------- | ------------------------------------------------------------ |
| スケジュール数上限   | 初期実装では制限なし。パフォーマンス問題が発生した場合に対応 |
| 分散スケジューリング | 単一プロセス（Electron Main Process）での実行のみ            |
| cron式のUI補完       | CronEditorコンポーネントはUI実装タスクのスコープ             |

---

## 3. 依存関係

### 3.1 前提タスク

| タスクID | タイトル                         | 依存内容                                                    | ステータス |
| -------- | -------------------------------- | ----------------------------------------------------------- | ---------- |
| TASK-9B  | SkillService / SkillExecutor拡張 | `SkillExecutor.execute()`メソッドを使用してスキルを実行する | 完了       |

### 3.2 利用する既存コンポーネント

| コンポーネント    | ファイルパス                                              | 使用目的                       |
| ----------------- | --------------------------------------------------------- | ------------------------------ |
| SkillExecutor     | `apps/desktop/src/main/services/skill/SkillExecutor.ts`   | スケジュールされたスキルの実行 |
| SkillService      | `apps/desktop/src/main/services/skill/SkillService.ts`    | スキルの存在確認               |
| validateIpcSender | `apps/desktop/src/main/ipc/security/validateIpcSender.ts` | IPC送信元検証                  |
| IPC_CHANNELS      | `apps/desktop/src/preload/channels.ts`                    | チャンネル定数の管理           |
| safeInvoke        | `apps/desktop/src/preload/safe-ipc.ts`                    | Preload側のIPC呼び出し         |
| electron-store    | `node_modules/electron-store`                             | スケジュールデータの永続化     |

### 3.3 新規依存パッケージ

| パッケージ         | バージョン | 用途                   | インストール先                     |
| ------------------ | ---------- | ---------------------- | ---------------------------------- |
| `node-cron`        | 最新安定版 | cron式スケジューリング | `@repo/desktop`                    |
| `@types/node-cron` | 最新安定版 | TypeScript型定義       | `@repo/desktop`（devDependencies） |

### 3.4 後続タスク（本タスクに依存するタスク）

| タスクID  | タイトル                    | 依存内容                                          |
| --------- | --------------------------- | ------------------------------------------------- |
| task-031b | スケジュール管理UI実装      | 本タスクのIPC契約と型定義を使用してUI側を構築する |
| （未定）  | file_changeイベント詳細実装 | 本タスクのEventSchedule型とeventConfigを使用する  |
| （未定）  | git_commitイベント詳細実装  | 本タスクのEventSchedule型とeventConfigを使用する  |

---

## 4. 前提条件

### 4.1 技術的前提

| 前提条件                     | 説明                                                              |
| ---------------------------- | ----------------------------------------------------------------- |
| TASK-9B完了済み              | SkillExecutor.execute()が利用可能であること                       |
| electron-store利用可能       | 既存のelectron-storeインスタンスまたは新規インスタンスが利用可能  |
| node-cronインストール可能    | npmレジストリからnode-cronがインストールできること                |
| Main Processでのタイマー稼働 | Electron Main ProcessでsetInterval/setTimeoutが正常に動作すること |
| Notification API利用可能     | ElectronのNotification APIがMain Processから利用可能であること    |

### 4.2 設計上の前提

| 前提条件               | 説明                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| 単一プロセス実行       | スケジューラはElectron Main Processの単一インスタンスで動作する       |
| IPC経由のCRUD          | スケジュール操作は全てIPC経由で実行する（Rendererから直接操作しない） |
| スキル名でのスキル特定 | スケジュールはスキル名（skillName）でスキルを特定する                 |
| JSONシリアライズ可能   | ScheduledSkillの全フィールドがJSONシリアライズ可能であること          |

---

## 5. 制約事項

### 5.1 技術的制約

| 制約                        | 説明                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| cron式は5フィールド形式のみ | 秒フィールド（6フィールド形式）は非サポート                                 |
| インターバル範囲制限        | 最小1000ms（1秒）〜最大86400000ms（24時間）                                 |
| runHistory件数上限          | 最新10件のみ保持。ハードコード値                                            |
| タイマー精度                | Node.jsのsetInterval/setTimeoutの精度に依存する（ミリ秒精度は保証されない） |
| IPC境界のDate型             | Date型はISO 8601文字列に変換して返却する（Date型オブジェクトは送信しない）  |

### 5.2 セキュリティ制約

| 制約                         | 説明                                                      | 参照                       |
| ---------------------------- | --------------------------------------------------------- | -------------------------- |
| IPC送信元検証必須            | 全ハンドラでvalidateIpcSender()を実施する                 | `04-electron-security.md`  |
| P42準拠3段バリデーション     | 全文字列引数で型チェック→空文字列→トリム空文字列の3段検証 | `06-known-pitfalls.md#P42` |
| cron式のサニタイズ           | node-cronのvalidate()で事前検証し、不正な式を拒否する     | NFR-01                     |
| エラーメッセージのサニタイズ | IPC境界で内部エラー情報を漏洩しない                       | `04-electron-security.md`  |

### 5.3 互換性制約

| 制約                | 説明                                                 |
| ------------------- | ---------------------------------------------------- |
| 既存テスト全PASS    | 既存テスト（9000件以上）が全てPASSする状態を維持する |
| 既存IPC契約の非破壊 | 既存のskill:\*チャンネルの動作を変更しない           |
| 既存型定義の非破壊  | packages/sharedの既存型定義を変更しない（追加のみ）  |

---

## 6. リスク

| リスク                                     | 影響度 | 発生可能性 | 対策                                                                             |
| ------------------------------------------ | ------ | ---------- | -------------------------------------------------------------------------------- |
| node-cronのバージョン互換性                | 中     | 低         | インストール前にElectron環境での動作確認を実施する                               |
| タイマーのメモリリーク                     | 高     | 中         | Map管理によるタイマー参照追跡と、削除時の確実な解放を実装する                    |
| タイマー二重登録                           | 高     | 中         | 登録前の既存タイマー確認とP5対策ガードを実装する                                 |
| electron-storeのデータ破損                 | 中     | 低         | ロード時のバリデーションとフォールバック（空配列返却）を実装する                 |
| SkillExecutorの非可用                      | 中     | 低         | Setter Injection（P34対策）によりSkillExecutor未設定時はエラーを記録して継続する |
| 大量スケジュール登録時のパフォーマンス劣化 | 中     | 低         | 初期実装では制限なし。問題発生時にスケジュール数上限を検討する                   |

---

## 7. 成功基準

| 基準                                 | 測定方法                                         |
| ------------------------------------ | ------------------------------------------------ |
| 全機能要件（FR-01〜FR-10）の実装完了 | 受け入れ基準（AC-01〜AC-14）の全項目PASS         |
| 全非機能要件（NFR-01〜NFR-11）の充足 | セキュリティ・パフォーマンス・信頼性テストのPASS |
| 既存テストの非破壊                   | `pnpm test`で全テスト（9000件以上）がPASS        |
| 型安全性の確保                       | `pnpm typecheck`でエラー0件                      |
| コード品質基準の充足                 | `pnpm lint`でエラー0件                           |
| テストカバレッジ基準の充足           | Line 80%以上、Branch 60%以上、Function 80%以上   |

---

## 完了条件

- [x] 実装範囲（In Scope）が明確に定義されている
- [x] 実装範囲外（Out of Scope）が明確に定義されている
- [x] 依存関係（前提タスク・利用コンポーネント・新規パッケージ・後続タスク）が網羅されている
- [x] 前提条件（技術的・設計上）が記載されている
- [x] 制約事項（技術・セキュリティ・互換性）が記載されている
- [x] リスクと対策が定義されている
- [x] 成功基準が定義されている
