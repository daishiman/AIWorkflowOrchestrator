# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 3                                |
| 機能名    | TASK-9G-skill-schedule           |
| 作成日    | 2026-02-27                       |
| 前提Phase | Phase 1: 要件定義, Phase 2: 設計 |
| 後続Phase | Phase 4: テスト作成              |
| 状態      | 未着手                           |

## 目的

Phase 1（要件定義）とPhase 2（設計）の成果物を多角的にレビューし、実装開始前に品質ゲートを通過させる。要件カバレッジ、設計妥当性、セキュリティ、IPC契約整合性を検証する。

## 実行タスク

- 要件カバレッジ検証: FR-01〜FR-10の全要件が設計でカバーされているか確認
- NFRカバレッジ検証: NFR-01〜NFR-11の全非機能要件が設計に反映されているか確認
- アーキテクチャ品質検証: クラス設計・DI設計・責務分離の妥当性を検証
- セキュリティ設計検証: IPC送信元検証・バリデーション・インジェクション防止を検証
- IPC契約整合性検証: ハンドラ引数型とPreload API呼び出し型の一致を検証（P44/P45対策）
- レビューゲート判定: PASS / MINOR / MAJOR を判定

## 参照資料

| 資料名                 | パス                                                                          | 説明               |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                     | 要件定義成果物     |
| Phase 2 設計           | `phase-2-design.md`                                                           | 設計成果物         |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ   |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC契約検証手順    |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーハンドリング |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                          | P42/P44/P45等      |

## 判定基準

| 判定              | 条件                           | 対応                    |
| ----------------- | ------------------------------ | ----------------------- |
| PASS              | 全観点で問題なし               | Phase 4へ進行           |
| MINOR             | 軽微な指摘あり（機能影響なし） | 指摘対応後Phase 4へ進行 |
| MAJOR（要件問題） | 要件の欠落・矛盾あり           | Phase 1へ戻る           |
| MAJOR（設計問題） | 設計上の重大な問題あり         | Phase 2へ戻る           |

## レビュー観点

### 1. 機能要件カバレッジ（FR → 設計マッピング）

| FR-ID | 要件概要             | 設計でのカバー箇所                                    | 結果 |
| ----- | -------------------- | ----------------------------------------------------- | ---- |
| FR-01 | cronスケジュール     | SkillScheduler.activateSchedule → cron.schedule()     | —    |
| FR-02 | intervalスケジュール | SkillScheduler.activateSchedule → setInterval()       | —    |
| FR-03 | onceスケジュール     | SkillScheduler.activateSchedule → setTimeout()        | —    |
| FR-04 | イベントトリガー     | SkillScheduler.registerEventListener()                | —    |
| FR-05 | 有効/無効トグル      | SkillScheduler.toggleSchedule() + activate/deactivate | —    |
| FR-06 | CRUD操作             | 5 IPCハンドラ + SkillScheduler公開API                 | —    |
| FR-07 | 永続化と復元         | ScheduleStore（electron-store） + initialize()        | —    |
| FR-08 | 実行履歴記録         | executeScheduledSkill() → runHistory追加（最新10件）  | —    |
| FR-09 | 通知送信             | sendNotification() + NotificationSettings             | —    |
| FR-10 | nextRun計算          | calculateNextRun() → 種別ごとの計算ロジック           | —    |

### 2. 非機能要件カバレッジ（NFR → 設計マッピング）

| NFR-ID | 要件概要                 | 設計でのカバー箇所                                       | 結果 |
| ------ | ------------------------ | -------------------------------------------------------- | ---- |
| NFR-01 | P42準拠3段バリデーション | 全IPCハンドラのStep 2で実装                              | —    |
| NFR-02 | 送信元検証               | 全IPCハンドラのStep 1でvalidateIpcSender()呼び出し       | —    |
| NFR-03 | 引数名セマンティクス一致 | id→id, skillName→skillName, schedule→schedule（P45対策） | —    |
| NFR-04 | electron-store永続化     | ScheduleStore（name: "skill-schedules"）                 | —    |
| NFR-05 | タイマー参照Map管理      | cronTasks / timers の2つのMapで管理                      | —    |
| NFR-06 | 二重登録防止             | activateSchedule()内でdeactivateSchedule()を先に呼ぶ     | —    |
| NFR-07 | IPC境界ISO 8601変換      | 型定義でstring型（ISO 8601）を使用                       | —    |
| NFR-08 | runHistory 10件制限      | executeScheduledSkill()内で制限                          | —    |
| NFR-09 | エラー記録・通知         | ScheduledRunResult.error + sendNotification()            | —    |
| NFR-10 | 共有型@repo/shared配置   | packages/shared/src/types/skill-schedule.ts + re-export  | —    |
| NFR-11 | 既存テスト維持           | 新規ファイル追加のみ、既存コード変更は最小限             | —    |

### 3. アーキテクチャ品質

| 観点                | 確認項目                                                                    | 結果 |
| ------------------- | --------------------------------------------------------------------------- | ---- |
| 単一責務原則（SRP） | SkillScheduler（制御）とScheduleStore（永続化）の責務が明確に分離されている | —    |
| 依存性逆転（DIP）   | SkillExecutorはインターフェース経由でモック可能                             | —    |
| DI設計（P34対策）   | BrowserWindow/SkillExecutorはSetter Injectionで遅延注入                     | —    |
| レイヤー依存方向    | Main → Shared の一方向依存のみ。逆方向importなし                            | —    |
| モノレポ構成        | 共有型は@repo/shared、実装はapps/desktop。幽霊依存なし（P8対策）            | —    |
| テスタビリティ      | DI設計によりScheduleStore/SkillExecutorのモック差し替えが可能               | —    |
| メモリ安全性        | shutdown()で全タイマー停止、deleteSchedule()でMap参照削除                   | —    |

### 4. セキュリティ設計

| 観点                       | 確認項目                                                     | 結果 |
| -------------------------- | ------------------------------------------------------------ | ---- |
| IPC送信元検証              | 全5ハンドラでvalidateIpcSender() + getAllowedWindows         | —    |
| P42準拠バリデーション      | 全文字列引数に3段バリデーション（型→空文字列→trim空文字列）  | —    |
| cron式インジェクション防止 | cron.validate()で不正な式を拒否                              | —    |
| 数値バリデーション         | interval: Number.isFinite() + 範囲チェック（1000〜86400000） | —    |
| 日時バリデーション         | runAt: ISO 8601パース + 未来日時チェック                     | —    |
| エラーサニタイズ           | catch節でerror.messageのみ返却し内部情報を隠蔽               | —    |
| チャンネル名管理           | IPC_CHANNELS定数で参照（ハードコード文字列なし）             | —    |

### 5. IPC契約整合性（ipc-contract-checklist.md準拠）

| チェック項目                               | 確認内容                                                                          | 結果 |
| ------------------------------------------ | --------------------------------------------------------------------------------- | ---- |
| Phase 1: チャンネル名の定数管理            | channels.tsにSKILL*SCHEDULE*\*定数5件定義、ALLOWED_INVOKE_CHANNELSに登録          | —    |
| Phase 2: ハンドラ引数型の一致              | skill:schedule:add — Preload: scheduleオブジェクト → Handler: scheduleInputで受信 | —    |
| Phase 2: ハンドラ引数型の一致              | skill:schedule:update — Preload: { id, updates } → Handler: args.id, args.updates | —    |
| Phase 2: ハンドラ引数型の一致              | skill:schedule:delete — Preload: id(string) → Handler: id(string)                 | —    |
| Phase 2: ハンドラ引数型の一致              | skill:schedule:toggle — Preload: id(string) → Handler: id(string)                 | —    |
| Phase 3: 引数名のセマンティクス一致（P45） | id→スケジュールID、skillName→スキル名、schedule→スケジュール設定。命名と値が一致  | —    |
| Phase 4: レスポンス型の一致                | Preload: safeInvokeUnwrapでdata展開。Handler: { success, data?, error? }形式      | —    |
| Phase 5: エラーレスポンスの型一致          | 全ハンドラ: { success: false, error: string }。VALIDATION_ERRORはthrow            | —    |
| Phase 6: 送信元検証の実装                  | 全5ハンドラでvalidateIpcSender()が呼ばれること                                    | —    |

### 6. 型設計品質

| 観点                    | 確認項目                                                        | 結果 |
| ----------------------- | --------------------------------------------------------------- | ---- |
| discriminated union     | SkillSchedule.typeで4種別を判別可能                             | —    |
| IPC境界の型変換         | lastRun/nextRun/startedAt/completedAtはstring(ISO 8601)で統一   | —    |
| P19対策（実行時検証）   | ScheduleStore.getAll()でArray.isArray + フィルタリング          | —    |
| P32対策（型二箇所更新） | shared/types + preload/types の両方に型定義                     | —    |
| オプショナルフィールド  | lastRun/nextRun/completedAt/output/errorは`?`付きまたはnull許容 | —    |
| 型パラメータの安全性    | Partial<ScheduledSkill>でid変更禁止をバリデーションで担保       | —    |

### 7. エラーハンドリング

| 観点                 | 確認項目                                                               | 結果 |
| -------------------- | ---------------------------------------------------------------------- | ---- |
| バリデーションエラー | VALIDATION_ERRORコードでthrow。リトライ不可（1000-1999番台）           | —    |
| ビジネスエラー       | スケジュール未検出時のエラーメッセージ明確化                           | —    |
| スキル実行エラー     | executeScheduledSkill()内でcatch → runHistory.error記録 → 例外非スロー | —    |
| 永続化エラー         | electron-storeの読み書きエラー時のフォールバック（空配列返却）         | —    |
| エラーの非握りつぶし | 全エラーがログ記録またはrunHistoryに記録される                         | —    |

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

| レビュー観点       | 確認項目                                                                        | 結果 |
| ------------------ | ------------------------------------------------------------------------------- | ---- |
| IPC設計            | 5チャンネルの引数・戻り値型がPreload側と一致                                    | —    |
| データフロー       | Renderer → Preload(safeInvokeUnwrap) → Handler → SkillScheduler → ScheduleStore | —    |
| スキル実行連携     | SkillScheduler → SkillExecutor.execute() の呼び出し規約                         | —    |
| 永続化             | electron-storeスキーマの妥当性。P19準拠の実行時バリデーション                   | —    |
| タイマー管理       | Map<string, Task/Timer>による参照管理。二重登録防止（P5）。shutdown()での全解放 | —    |
| エラーハンドリング | バリデーションエラー/ビジネスエラー/実行エラーの区別と処理                      | —    |
| 通知               | NotificationSettings に基づく条件分岐（success/failure × system/inApp/both）    | —    |

## 多角的チェック観点（AIレビュー判断）

| 観点                   | 確認事項                                                                              | 結果 |
| ---------------------- | ------------------------------------------------------------------------------------- | ---- |
| 過去の落とし穴の対策   | P5(二重登録), P19(型キャスト), P34(遅延DI), P42(trim), P44/P45(契約ドリフト) 対策済み | —    |
| once実行後の状態遷移   | setTimeout実行後にenabled=falseに設定する設計が明確                                   | —    |
| app_start即時実行      | initialize()内でapp_startイベントスケジュールを即座に実行する設計が明確               | —    |
| file_change/git_commit | インターフェースのみ定義し詳細実装は別タスクとする境界が明確                          | —    |
| 既存コードへの影響     | 修正対象ファイルは6件のみ。既存機能への副作用リスクが低い                             | —    |
| 依存パッケージ         | node-cron（軽量・メンテナンス活発）の選定が妥当                                       | —    |

## レビュー結果

### 判定

**判定: （Phase実行時に記入）**

### 指摘事項

（Phase実行時に記入。MINOR指摘は全て未タスク仕様書に変換する）

## 成果物

| 成果物       | パス                                      | 説明           |
| ------------ | ----------------------------------------- | -------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 本ドキュメント |

## 完了条件

- [ ] 機能要件カバレッジ（FR-01〜FR-10）の全項目が確認されている
- [ ] 非機能要件カバレッジ（NFR-01〜NFR-11）の全項目が確認されている
- [ ] アーキテクチャ品質の全観点が確認されている
- [ ] セキュリティ設計の全観点が確認されている
- [ ] IPC契約整合性の全チェック項目が確認されている
- [ ] 型設計品質の全観点が確認されている
- [ ] エラーハンドリングの全観点が確認されている
- [ ] 統合テスト連携の全レビュー観点が確認されている
- [ ] レビュー判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR指摘がある場合、全て未タスク仕様書に変換されている
- [ ] **本Phase内のレビュー作業を100%実行完了**

## 次のPhase

Phase 4: テスト作成
