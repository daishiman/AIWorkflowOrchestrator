# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト検証               |
| タスクID   | TASK-9G                      |
| 前提Phase  | Phase 10（最終レビュー）     |
| 後続Phase  | Phase 12（ドキュメント更新） |
| ステータス | 完了（2026-02-27, 代替実施） |
| 作成日     | 2026-02-27                   |
| 機能名     | TASK-9G-skill-schedule       |

---

## 目的

SkillScheduler / ScheduleStore / IPC ハンドラーの動作を、自動テスト結果とDevToolsコンソールからの直接呼び出しにより検証する。
UIは別タスク（task-031b）のスコープであるため、本タスクではMain Process側のIPCレベルのテストが主体となる。

## 背景

スケジューリング機能はMain Processで動作するサービスであり、タイマー制御・永続化・プロセス間通信の3つの境界が存在する。
自動テストではモック化されているこれらの境界を、実環境で検証する。

---

## テスト実施方針

### 制限事項

- スケジュール管理UIは別タスク（task-031b）のスコープであるため、DevToolsコンソール経由のIPC呼び出しが主な検証手段となる
- Preload API のスタブ未解消チャンネルが存在する場合、DevToolsからの直接呼び出しが不可能な場合がある
- その場合はユニットテスト結果をもって手動テストの代替とし、理由を `outputs/phase-11/manual-test-result.md` に記録する

### 検証方法

| 方法                           | 対象                              | 優先度 |
| ------------------------------ | --------------------------------- | ------ |
| DevToolsコンソール直接呼び出し | Preload APIが接続済みのチャンネル | 高     |
| ユニットテスト結果の確認       | 全5チャンネル + ScheduleStore     | 高     |
| コードリーディング             | セキュリティ実装の確認            | 中     |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 自動テストの実行確認

**目的**: 手動テスト前に自動テストが全てパスすることを確認する

**実行手順**:

1. SkillScheduler のユニットテストを実行する
2. ScheduleStore のユニットテストを実行する
3. skillHandlers のスケジュール関連テストを実行する
4. 全テストがパスすることを確認する
5. テスト結果サマリーを記録する

**コマンド**:

```bash
# SkillScheduler テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillScheduler --reporter=verbose

# ScheduleStore テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ScheduleStore --reporter=verbose

# skillHandlers スケジュール関連テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-11/auto-test-result.md`

---

### タスク2: スケジュール追加テスト

**目的**: `skill:schedule:add` IPCチャンネルによるスケジュール追加の正常動作を確認する

**テストケーステーブル**:

| TC-ID  | チャンネル         | 操作内容                                                                                                                                             | 前提条件       | 期待結果                                                                      |
| ------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------- |
| TC-001 | skill:schedule:add | DevToolsで `window.electronAPI.skill.scheduleAdd({ skillName: "test-skill", schedule: { type: "cron", expression: "0 9 * * *" } })` を実行           | アプリ起動済み | ScheduledSkill オブジェクトが返却され、nextRun に次回実行日時が設定されている |
| TC-002 | skill:schedule:add | DevToolsで `window.electronAPI.skill.scheduleAdd({ skillName: "test-skill", schedule: { type: "interval", intervalMs: 60000 } })` を実行             | アプリ起動済み | ScheduledSkill オブジェクトが返却され、intervalMs=60000 が設定されている      |
| TC-003 | skill:schedule:add | DevToolsで `window.electronAPI.skill.scheduleAdd({ skillName: "test-skill", schedule: { type: "once", runAt: "2026-03-01T09:00:00.000Z" } })` を実行 | アプリ起動済み | ScheduledSkill オブジェクトが返却され、runAt が設定されている                 |
| TC-004 | skill:schedule:add | DevToolsで `window.electronAPI.skill.scheduleAdd({ skillName: "test-skill", schedule: { type: "event", trigger: "app_start" } })` を実行             | アプリ起動済み | ScheduledSkill オブジェクトが返却され、trigger=app_start が設定されている     |

**実行手順（TC-001）**:

1. Electronアプリを起動する
2. DevTools（Cmd+Option+I）を開く
3. Consoleタブで以下を実行する:
   ```javascript
   await window.electronAPI.skill.scheduleAdd({
     skillName: "test-skill",
     schedule: { type: "cron", expression: "0 9 * * *" },
   });
   ```
4. レスポンスに `id`, `skillName`, `schedule`, `isEnabled`, `nextRun` フィールドが含まれていることを確認する
5. `nextRun` が現在時刻以降の値であることを確認する

**期待される成果物**:

- `outputs/phase-11/schedule-add-test-result.md`

---

### タスク3: スケジュール一覧・更新・削除テスト

**目的**: CRUD操作（list / update / delete）の正常動作を確認する

**テストケーステーブル**:

| TC-ID  | チャンネル            | 操作内容                                                                                                                       | 前提条件             | 期待結果                                                      |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------- |
| TC-005 | skill:schedule:list   | `window.electronAPI.skill.scheduleList()` を実行                                                                               | TC-001〜TC-004完了後 | 登録済みスケジュールの配列が返却される                        |
| TC-006 | skill:schedule:update | `window.electronAPI.skill.scheduleUpdate({ id: "<TC-001のID>", schedule: { type: "cron", expression: "0 10 * * *" } })` を実行 | TC-001完了後         | 更新後のScheduledSkillが返却され、expression が変更されている |
| TC-007 | skill:schedule:delete | `window.electronAPI.skill.scheduleDelete("<TC-004のID>")` を実行                                                               | TC-004完了後         | 削除成功が返却される                                          |
| TC-008 | skill:schedule:list   | 削除後に `scheduleList()` を再実行                                                                                             | TC-007完了後         | TC-004で追加したスケジュールが一覧に含まれていない            |

**期待される成果物**:

- `outputs/phase-11/schedule-crud-test-result.md`

---

### タスク4: 有効/無効トグルテスト

**目的**: `skill:schedule:toggle` IPCチャンネルによるスケジュールの有効/無効切り替えを確認する

**テストケーステーブル**:

| TC-ID  | チャンネル            | 操作内容                                                              | 前提条件                        | 期待結果                                                    |
| ------ | --------------------- | --------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| TC-009 | skill:schedule:toggle | `window.electronAPI.skill.scheduleToggle("<TC-001のID>")` を実行      | TC-001完了後（isEnabled=true）  | isEnabled=false になり、nextRun が null になる              |
| TC-010 | skill:schedule:toggle | 再度 `window.electronAPI.skill.scheduleToggle("<TC-001のID>")` を実行 | TC-009完了後（isEnabled=false） | isEnabled=true になり、nextRun に次回実行日時が再設定される |

**期待される成果物**:

- `outputs/phase-11/schedule-toggle-test-result.md`

---

### タスク5: 永続化・復元テスト

**目的**: アプリ再起動後にスケジュールが正しく復元されることを確認する

**テストケーステーブル**:

| TC-ID  | 操作内容                                         | 前提条件                                         | 期待結果                                                    |
| ------ | ------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------- |
| TC-011 | アプリを終了して再起動する                       | TC-001〜TC-010完了後（複数スケジュール登録済み） | `scheduleList()` で前回登録済みスケジュールが全て返却される |
| TC-012 | 復元後の有効スケジュールのタイマー状態を確認する | TC-011完了後                                     | isEnabled=true のスケジュールの nextRun が再計算されている  |
| TC-013 | 復元後の無効スケジュールの状態を確認する         | TC-011完了後                                     | isEnabled=false のスケジュールの nextRun が null のまま     |

**期待される成果物**:

- `outputs/phase-11/persistence-test-result.md`

---

### タスク6: バリデーション・エラーハンドリングテスト

**目的**: 不正入力時のバリデーションとエラーレスポンスを確認する

**テストケーステーブル**:

| TC-ID  | チャンネル            | 操作内容                                                                                                       | 期待結果                                                               |
| ------ | --------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| TC-014 | skill:schedule:add    | 空文字のskillNameで実行: `scheduleAdd({ skillName: "", schedule: { type: "cron", expression: "0 9 * * *" } })` | VALIDATION_ERROR が返却される（P42準拠: .trim()バリデーション）        |
| TC-015 | skill:schedule:add    | スペースのみのskillNameで実行: `scheduleAdd({ skillName: "   ", schedule: { ... } })`                          | VALIDATION_ERROR が返却される（P42準拠: .trim()バリデーション）        |
| TC-016 | skill:schedule:add    | 不正なcron式で実行: `scheduleAdd({ skillName: "test", schedule: { type: "cron", expression: "invalid" } })`    | VALIDATION_ERROR が返却され、不正なcron式であることが示される          |
| TC-017 | skill:schedule:add    | intervalMs=0 で実行: `scheduleAdd({ skillName: "test", schedule: { type: "interval", intervalMs: 0 } })`       | VALIDATION_ERROR が返却され、intervalMs は正の整数であることが示される |
| TC-018 | skill:schedule:add    | scheduleオブジェクトなしで実行: `scheduleAdd({ skillName: "test" })`                                           | VALIDATION_ERROR が返却される                                          |
| TC-019 | skill:schedule:delete | 存在しないIDで削除: `scheduleDelete("nonexistent-id")`                                                         | エラーまたは「スケジュールが見つかりません」レスポンスが返却される     |
| TC-020 | 全チャンネル          | エラーレスポンスに内部パス情報やスタックトレースが含まれていないことを確認する                                 | エラーメッセージがサニタイズされている                                 |

**期待される成果物**:

- `outputs/phase-11/validation-test-result.md`

---

### タスク7: イベントトリガー・通知テスト

**目的**: app_startイベントトリガーと実行結果通知の動作を確認する

**テストケーステーブル**:

| TC-ID  | テスト項目        | 操作内容                                                | 前提条件                                                               | 期待結果                                                             |
| ------ | ----------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| TC-021 | app_startトリガー | app_startイベントスケジュール登録後にアプリを再起動する | `{ type: "event", trigger: "app_start" }` のスケジュールが登録済み     | アプリ起動時にスキル実行がトリガーされる（ログまたは実行結果で確認） |
| TC-022 | 実行成功通知      | onSuccess: true の通知設定でスケジュール実行を待つ      | `notification: { onSuccess: true }` が設定されたスケジュールが登録済み | スキル実行完了後にシステム通知が表示される                           |
| TC-023 | 実行失敗通知      | onFailure: true の通知設定で実行失敗シナリオを確認する  | `notification: { onFailure: true }` が設定されたスケジュールが登録済み | スキル実行失敗時にシステム通知が表示される                           |

**確認方法**:

- TC-021: アプリ再起動後のコンソールログまたは `scheduleList()` の `lastRun` フィールドで実行を確認する
- TC-022/TC-023: macOS通知センターで通知を確認する。テスト環境で通知が利用できない場合はユニットテスト結果で代替する

**期待される成果物**:

- `outputs/phase-11/event-notification-test-result.md`

---

### タスク8: 発見課題の記録

**目的**: テスト中に発見した課題を記録する

**実行手順**:

1. タスク1〜7で発見した問題を記録する
2. 問題の重要度を分類する
3. 対応方針を決定する

**課題分類**:

| 重要度   | 基準                       | 対応             |
| -------- | -------------------------- | ---------------- |
| 致命的   | 機能が使用できない         | 即時修正         |
| 重大     | 一部機能に影響             | 本フェーズで修正 |
| 軽微     | 使用に支障なし             | Phase 12 で記録  |
| 改善提案 | より良くするためのアイデア | Phase 12 で記録  |

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料           | パス                                                                    | 内容                   |
| ------------------ | ----------------------------------------------------------------------- | ---------------------- |
| SkillScheduler実装 | `apps/desktop/src/main/services/skill/SkillScheduler.ts`                | スケジューラサービス   |
| ScheduleStore実装  | `apps/desktop/src/main/services/skill/ScheduleStore.ts`                 | スケジュール永続化     |
| IPCハンドラー実装  | `apps/desktop/src/main/ipc/skillHandlers.ts`                            | Main Processハンドラー |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                                 | Preload API実装        |
| 型定義             | `packages/shared/src/types/skill-schedule.ts`                           | スケジュール型定義     |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts` | テストコード           |
| Phase 1要件仕様    | `outputs/phase-1/requirements-definition.md`                            | 要件                   |
| Phase 2設計仕様    | `outputs/phase-2/architecture-design.md`                                | 設計成果物             |
| Phase 5実装成果物  | `outputs/phase-5/implementation-summary.md`                             | 実装成果物             |
| Phase 6拡充成果物  | `outputs/phase-6/coverage-report.md`                                    | 追加テスト結果         |
| Phase 7カバレッジ  | `outputs/phase-7/coverage-report.md`                                    | カバレッジ結果         |
| Phase 8成果物      | `outputs/phase-8/refactoring-log.md`                                    | リファクタ結果         |
| Phase 9成果物      | `outputs/phase-9/quality-report.md`                                     | 品質保証結果           |
| Phase 10成果物     | `outputs/phase-10/final-review-result.md`                               | 最終レビュー結果       |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                 | セキュリティ基準       |

---

## 成果物

| 成果物                     | パス                                                 | 内容                          |
| -------------------------- | ---------------------------------------------------- | ----------------------------- |
| 自動テスト結果             | `outputs/phase-11/auto-test-result.md`               | テスト実行結果                |
| スケジュール追加テスト結果 | `outputs/phase-11/schedule-add-test-result.md`       | 4スケジュールタイプの追加確認 |
| CRUD操作テスト結果         | `outputs/phase-11/schedule-crud-test-result.md`      | list/update/delete確認        |
| トグルテスト結果           | `outputs/phase-11/schedule-toggle-test-result.md`    | 有効/無効切り替え確認         |
| 永続化テスト結果           | `outputs/phase-11/persistence-test-result.md`        | アプリ再起動後の復元確認      |
| バリデーションテスト結果   | `outputs/phase-11/validation-test-result.md`         | 不正入力のエラーハンドリング  |
| イベント・通知テスト結果   | `outputs/phase-11/event-notification-test-result.md` | app_start/通知確認            |
| 発見課題                   | `outputs/phase-11/discovered-issues.md`              | 課題一覧                      |

---

## 統合テスト連携

> Electron環境での手動動作確認

| 確認項目                  | 基準                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| 全5チャンネル正常動作     | skill:schedule:list, add, update, delete, toggle                               |
| 4スケジュールタイプ対応   | cron, interval, once, event の全タイプでスケジュール追加が成功する             |
| 永続化・復元              | アプリ再起動後にスケジュールが正しく復元され、有効なスケジュールが再起動される |
| バリデーション（P42準拠） | 空文字・スペースのみ・不正cron式・不正intervalMs が全て拒否される              |
| エラーサニタイズ          | 全エラーレスポンスで内部情報が漏洩しない                                       |
| イベントトリガー          | app_startイベントでスキル実行がトリガーされる                                  |
| 通知                      | 実行結果の通知が設定に応じて表示される                                         |

---

## 完了条件

- [ ] 自動テストが全てパスしている
- [ ] スケジュール追加テスト（TC-001〜TC-004）が全てパスしている
- [ ] CRUD操作テスト（TC-005〜TC-008）が全てパスしている
- [ ] トグルテスト（TC-009〜TC-010）が全てパスしている
- [ ] 永続化・復元テスト（TC-011〜TC-013）が全てパスしている
- [ ] バリデーションテスト（TC-014〜TC-020）が全てパスしている
- [ ] イベント・通知テスト（TC-021〜TC-023）が全てパスしている
- [ ] 発見課題が記録されている（0件でも記録必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（8タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（8ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-12-documentation.md`
