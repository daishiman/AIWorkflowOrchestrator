# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| タスクID   | TASK-9G                        |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | 完了（2026-02-27）             |
| 作成日     | 2026-02-27                     |
| 機能名     | TASK-9G-skill-schedule         |

---

## 目的

静的解析、型チェック、セキュリティ検証、テスト実行の4観点からスキルスケジュール機能全体の品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

## 背景

スキルスケジュール機能はMain Process（SkillScheduler + ScheduleStore + IPCハンドラー）とPreload層の2レイヤーにまたがる。
IPCハンドラーはセキュリティ境界に位置し、node-cronによるタイマー実行を制御するため、送信元検証と入力バリデーションを重点検証する。
UI層はスコープ外（TASK-9G）であるため、UIコンポーネントの品質検証は対象外とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint 検証

**目的**: ESLint ルールへの準拠を全対象ファイルで確認する

**実行手順**:

1. ESLint を全対象ファイルに対して実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 再度 Lint を実行してクリアを確認する

**コマンド**:

```bash
# Lint 実行（desktopパッケージ）
pnpm --filter @repo/desktop lint

# sharedパッケージも確認
pnpm --filter @repo/shared lint

# 自動修正
pnpm --filter @repo/desktop lint --fix
```

**検証対象ファイル**:

| ファイル                                                 | 確認項目                   |
| -------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | スケジューラのLintクリア   |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | ストアのLintクリア         |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPCハンドラーのLintクリア  |
| `packages/shared/src/types/skill-schedule.ts`            | 型定義のLintクリア         |
| `packages/shared/src/types/index.ts`                     | re-exportのLintクリア      |
| `apps/desktop/src/preload/skill-api.ts`                  | Preload APIのLintクリア    |
| `apps/desktop/src/preload/channels.ts`                   | チャンネル定数のLintクリア |
| `apps/desktop/src/preload/types.ts`                      | 型定義のLintクリア         |
| `apps/desktop/src/main/ipc/index.ts`                     | 初期化コードのLintクリア   |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認し、レイヤー間の型整合性を検証する

**実行手順**:

1. TypeScript コンパイラを desktopパッケージとsharedパッケージに対して実行する
2. `packages/shared/src/types/skill-schedule.ts` の型定義が正しくexportされていることを確認する
3. `preload/types.ts` と `skillHandlers.ts` の型整合性を確認する
4. P32チェック（型定義の二箇所同時更新）を実施する

**コマンド**:

```bash
# 型チェック実行
pnpm --filter @repo/desktop typecheck

# shared パッケージも確認
pnpm --filter @repo/shared typecheck
```

**型整合性チェックポイント**:

| チェック項目                 | 確認内容                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Preload型 ↔ Mainハンドラー型 | 5メソッド全ての引数型・戻り値型がハンドラーのレスポンス型と一致                       |
| チャンネル定数整合           | `IPC_CHANNELS` に5チャンネル（SKILL_SCHEDULE_LIST/ADD/UPDATE/DELETE/TOGGLE）が定義    |
| ホワイトリスト整合           | `ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されている                               |
| 共有型定義整合               | `packages/shared/src/types/skill-schedule.ts` の型が `index.ts` から正しくre-export   |
| SkillSchedule型一貫性        | SkillScheduler / ScheduleStore / IPCハンドラーが同一の SkillSchedule 型を参照している |
| any型不使用                  | `any` 型が使用されていないか                                                          |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 確認内容                               |
| -------------------------------------- | -------------------------------------- |
| `packages/shared/src/types/index.ts`   | skill-schedule.ts のre-exportが最新か  |
| `apps/desktop/src/preload/types.ts`    | Preload型定義にscheduleメソッドが追加  |
| `apps/desktop/src/preload/channels.ts` | ホワイトリストにscheduleチャンネル追加 |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: 全5 IPCハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. 全5ハンドラーで `validateIpcSender()` が実施されていることを確認する
2. 全catchブロックで `sanitizeErrorMessage` が使用されていることを確認する
3. チャンネル名が `IPC_CHANNELS` 定数で参照されていることを確認する
4. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラーで実施されていることを確認する
5. skillName引数に対するパストラバーサル防止チェックが実施されていることを確認する

**セキュリティチェックマトリクス**:

| チャンネル              | validateIpcSender | skillName検証 | sanitizeErrorMessage | IPC_CHANNELS定数 | 3段バリデーション |
| ----------------------- | ----------------- | ------------- | -------------------- | ---------------- | ----------------- |
| `skill:schedule:list`   | -                 | -             | -                    | -                | -                 |
| `skill:schedule:add`    | -                 | -             | -                    | -                | -                 |
| `skill:schedule:update` | -                 | -             | -                    | -                | -                 |
| `skill:schedule:delete` | -                 | -             | -                    | -                | -                 |
| `skill:schedule:toggle` | -                 | -             | -                    | -                | -                 |

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認（P27対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**node-cronセキュリティ確認**:

| チェック項目               | 確認内容                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| cron式インジェクション防止 | ユーザー入力のcron式がnode-cron.validate()で検証されている             |
| タイマーリソースリーク防止 | deactivate時にcron.stop() / clearInterval / clearTimeoutが呼ばれている |
| 同時実行制御               | 同一スケジュールの重複起動が防止されている                             |
| アプリ終了時クリーンアップ | destroy()メソッドで全アクティブタイマーが停止される                    |

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. 全対象テストを実行する
2. カバレッジレポートを確認する
3. カバレッジ基準との照合を行う
4. 基準未達の場合はPhase 6に戻る

**コマンド**:

```bash
# SkillSchedulerテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillScheduler --coverage --reporter=verbose

# ScheduleStoreテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ScheduleStore --coverage --reporter=verbose

# スケジュール型定義テスト
cd apps/desktop && pnpm vitest run --coverage --reporter=verbose --grep "schedule"

# スケジュール関連IPCハンドラーテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage --reporter=verbose --grep "schedule"
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**テスト対象範囲**:

| テスト対象                   | テストファイル                                               | 分類                       |
| ---------------------------- | ------------------------------------------------------------ | -------------------------- |
| SkillScheduler               | `src/main/services/skill/__tests__/SkillScheduler.test.ts`   | 正常/異常/タイマー管理     |
| ScheduleStore                | `src/main/services/skill/__tests__/ScheduleStore.test.ts`    | CRUD/永続化/バリデーション |
| IPCハンドラー（5チャンネル） | `src/main/ipc/__tests__/skillHandlers*.test.ts`              | 正常/異常/セキュリティ     |
| スケジュール型定義           | `packages/shared/src/types/__tests__/skill-schedule.test.ts` | 型ガード/バリデーション    |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートテーブル**:

| 品質ゲート   | 確認内容                                       | コマンド                                                                    | 結果 |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| 機能検証     | 全自動テスト成功                               | `pnpm --filter @repo/desktop test`                                          | -    |
| コード品質   | Lint/型チェッククリア                          | `pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop typecheck` | -    |
| テスト網羅性 | カバレッジ基準達成                             | `pnpm --filter @repo/desktop test -- --coverage`                            | -    |
| セキュリティ | validateIpcSender適用、3段バリデーション全実施 | 手動レビュー                                                                | -    |

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] SkillSchedulerテスト全件PASS（cron/interval/oneshot/event各種スケジュール）
- [ ] ScheduleStoreテスト全件PASS（CRUD/永続化/復元）
- [ ] IPCハンドラー5チャンネル全テストPASS
- [ ] 型定義テスト全件PASS

#### コード品質

- [ ] Lint エラーなし（desktopパッケージ）
- [ ] Lint エラーなし（sharedパッケージ）
- [ ] 型エラーなし（desktopパッケージ）
- [ ] 型エラーなし（sharedパッケージ）
- [ ] コードフォーマット適用済み
- [ ] any型不使用

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ

- [ ] 全ハンドラーで validateIpcSender 実施確認済み
- [ ] P42準拠3段バリデーション全ハンドラー実施確認済み
- [ ] エラーサニタイズ実施確認済み
- [ ] ハードコード文字列なし確認済み（P27対策）
- [ ] node-cronインジェクション防止確認済み
- [ ] タイマーリソースリーク防止確認済み

**判定結果テーブル**:

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料           | パス                                                             | 内容                   |
| ------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillScheduler     | `apps/desktop/src/main/services/skill/SkillScheduler.ts`         | スケジューラ実装       |
| ScheduleStore      | `apps/desktop/src/main/services/skill/ScheduleStore.ts`          | 永続化実装             |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| スケジュール型定義 | `packages/shared/src/types/skill-schedule.ts`                    | 共有型定義             |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillScheduler*` | スケジューラテスト     |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/ScheduleStore*`  | ストアテスト           |
| Phase 5 実装成果物 | `outputs/phase-5/`                                               | 実装結果               |
| Phase 8 成果物     | `outputs/phase-8/`                                               | リファクタリング結果   |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容             |
| --------------------- | ----------------------------------------------------------------------------- | ---------------- |
| IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPC チャンネル   |
| サービス設計          | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Electronサービス |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ |
| Skill IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`     | Skill系IPC境界   |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 品質基準         |
| デスクトップ技術      | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`     | Electron実行基盤 |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ   |

---

## 成果物

| 成果物               | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`          | Lint結果         |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`      | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果       |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`  | 総合判定         |

---

## 統合テスト連携

> 品質保証で統合テスト結果を確認する

| 確認項目                   | 基準                                                |
| -------------------------- | --------------------------------------------------- |
| 全テスト                   | 100% パス                                           |
| SkillSchedulerテスト       | cron/interval/oneshot/event全種テスト成功           |
| ScheduleStoreテスト        | CRUD・永続化・復元テスト全件PASS                    |
| IPCハンドラーテスト        | 5チャンネル全て正常動作、セキュリティテスト全件PASS |
| エラーハンドリングテスト   | エラーサニタイズ確認済み                            |
| タイマーリソース管理テスト | リーク防止・クリーンアップ確認済み                  |

---

## 完了条件

- [ ] Lint エラーがない（desktop + sharedパッケージ）
- [ ] 型エラーがない（desktop + sharedパッケージ）
- [ ] セキュリティレビューが完了している（全5ハンドラーで全項目確認済み）
- [ ] node-cronセキュリティ確認（インジェクション防止・リソースリーク防止）が完了している
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 品質ゲートの全項目をパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目PASSを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-10-final-review.md`
