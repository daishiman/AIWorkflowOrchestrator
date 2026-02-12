# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 6                                      |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC            |
| タスク名 | SkillCreatorServiceのIPCハンドラー登録 |
| 機能名   | skill-creator-ipc                      |
| 作成日   | 2026-02-12                             |
| 次Phase  | Phase 7: カバレッジ確認                |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標（Line 80%+, Branch 60%+, Function 80%+）を達成する。エッジケース、同時呼び出し、タイムアウト、大量データ、セキュリティ攻撃パターン、進捗通知の詳細テストを追加し、全5カテゴリの統合テストカバレッジを向上させる。

---

## 実行タスク

### Task 1: カバレッジ分析

**目的**: Phase 5実装後のカバレッジを測定し、不足箇所を特定する

#### 1-1. カバレッジ測定コマンド

```bash
# ハンドラーテストのカバレッジ測定
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts

# Preload APIテストのカバレッジ測定
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/preload/__tests__/skill-creator-api.test.ts
```

#### 1-2. 分析対象ファイル

| ファイル                                            | 測定対象        |
| --------------------------------------------------- | --------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | ハンドラー実装  |
| `apps/desktop/src/preload/api/skill-creator-api.ts` | Preload API実装 |

#### 1-3. 未カバー箇所の特定

以下の観点で未カバー箇所をリストアップする:

- 未カバーのブランチ（if/else、try/catchの各パス）
- 未カバーの行（エラーハンドリング、ガード句、パストラバーサル検証）
- 未テストの関数（sanitizeError、validatePathSafety）

**成果物パス**: `outputs/phase-6/coverage-analysis.md`

### Task 2: エッジケーステスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`（追記）

#### 2-1. 同時呼び出しテスト

| テストID    | テスト内容                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| SCIT-EDG-01 | 2つの`skill-creator:create`リクエストを同時発行し両方が正常レスポンスを返す |
| SCIT-EDG-02 | `detect-mode`処理中に`create`リクエストを発行し両方が独立して処理される     |
| SCIT-EDG-03 | 5チャンネル全てに同時リクエストを発行しデッドロックが発生しない             |

#### 2-2. タイムアウトテスト

| テストID    | テスト内容                                                   |
| ----------- | ------------------------------------------------------------ |
| SCIT-EDG-04 | `executeTasks`が長時間実行された場合のタイムアウト処理を検証 |
| SCIT-EDG-05 | タイムアウト後のクリーンアップが正常に実行される             |

#### 2-3. 大量データテスト

| テストID    | テスト内容                                                                       |
| ----------- | -------------------------------------------------------------------------------- |
| SCIT-EDG-06 | `create`に1000文字超の文字列プロパティを持つオプションを渡した場合のハンドリング |
| SCIT-EDG-07 | `execute-tasks`に100件のタスクIDを持つオプションを渡した場合のハンドリング       |
| SCIT-EDG-08 | `detect-mode`に10000文字のリクエスト文字列を渡した場合のハンドリング             |

#### 2-4. 不正型入力テスト

| テストID    | テスト内容                                                                           |
| ----------- | ------------------------------------------------------------------------------------ |
| SCIT-EDG-09 | `detect-mode`に数値（`{ request: 123 }`）を渡した場合のバリデーションエラー          |
| SCIT-EDG-10 | `create`にstring型を渡した場合（オブジェクト型ではない）のバリデーションエラー       |
| SCIT-EDG-11 | `execute-tasks`の`taskIds`にstring（配列ではない）を渡した場合のバリデーションエラー |
| SCIT-EDG-12 | 各チャンネルにundefinedを渡した場合のバリデーションエラー                            |

### Task 3: セキュリティテスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`（追記）

#### 3-1. パストラバーサル攻撃パターンテスト

| テストID    | テスト内容                                                                        |
| ----------- | --------------------------------------------------------------------------------- |
| SCIT-SEC-05 | `validate`: `{ skillDir: "../../../etc/passwd" }` → ブロック                      |
| SCIT-SEC-06 | `validate`: `{ skillDir: "/path/to/../../secret" }` → ブロック                    |
| SCIT-SEC-07 | `validate`: `{ skillDir: "..\\..\\windows\\system32" }` → ブロック（Windowsパス） |
| SCIT-SEC-08 | `validate-schema`: パストラバーサルパターンがブロックされる                       |

#### 3-2. コマンドインジェクションテスト

| テストID    | テスト内容                                                           |
| ----------- | -------------------------------------------------------------------- |
| SCIT-SEC-09 | `validate`: `{ skillDir: "/path; rm -rf /" }` → バリデーションエラー |
| SCIT-SEC-10 | `create`: シェルメタ文字を含むオプション → 安全にハンドリング        |

#### 3-3. 未登録チャンネルテスト

| テストID    | テスト内容                                                           |
| ----------- | -------------------------------------------------------------------- |
| SCIT-SEC-11 | ホワイトリスト外のチャンネル名でのsafeInvoke呼び出しがブロックされる |
| SCIT-SEC-12 | `skill-creator:unknown`チャンネルへのアクセスが拒否される            |

### Task 4: 進捗通知テスト拡充

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`（追記）
及び `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`（追記）

#### 4-1. 複数リスナー登録テスト

| テストID    | テスト内容                                                |
| ----------- | --------------------------------------------------------- |
| SCIT-PRG-01 | 同じチャンネルに2つのリスナーを登録し両方が通知を受け取る |
| SCIT-PRG-02 | 3つのリスナーを登録し全てが同じデータを受け取る           |

#### 4-2. リスナークリーンアップテスト

| テストID    | テスト内容                                                        |
| ----------- | ----------------------------------------------------------------- |
| SCIT-PRG-03 | `onProgress`の戻り値（解除関数）を呼び出した後、通知が届かない    |
| SCIT-PRG-04 | 2つのリスナーのうち1つを解除した場合、残りの1つのみ通知を受け取る |

#### 4-3. 通知データ型検証テスト

| テストID    | テスト内容                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| SCIT-PRG-05 | `SkillCreatorProgress`の全フィールド（phase, taskIndex, totalTasks, message, timestamp）が正しく渡される |
| SCIT-PRG-06 | `progress.taskIndex`が0以上`progress.totalTasks`以下の範囲である                                         |
| SCIT-PRG-07 | `progress.phase`が空文字列でない                                                                         |

#### 4-4. mainWindow破棄後テスト

| テストID    | テスト内容                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| SCIT-PRG-08 | `mainWindow.isDestroyed()`が`true`の場合、`webContents.send()`が呼ばれない |
| SCIT-PRG-09 | mainWindow破棄後に例外が発生しない                                         |

### Task 5: 統合テスト拡充

**目的**: Phase 4で設計した全5カテゴリの統合テストカバレッジを向上させる

#### 5-1. IPC接続カテゴリ

| テストID    | テスト内容                                                               |
| ----------- | ------------------------------------------------------------------------ |
| SCIT-INT-01 | 5 invokeチャンネルの完全フロー（Preload→IPC→Handler→Service→レスポンス） |
| SCIT-INT-02 | 全チャンネルのホワイトリスト登録確認                                     |

#### 5-2. データフローカテゴリ

| テストID    | テスト内容                                                           |
| ----------- | -------------------------------------------------------------------- |
| SCIT-INT-03 | `createSkill`の入力パラメータがSkillCreatorServiceまで正しく伝播する |
| SCIT-INT-04 | `executeTasks`のExecutionReportがRendererまで正しく返却される        |

#### 5-3. エラーハンドリングカテゴリ

| テストID    | テスト内容                                                         |
| ----------- | ------------------------------------------------------------------ |
| SCIT-INT-05 | バリデーションエラーのメッセージがそのままRendererに返却される     |
| SCIT-INT-06 | 内部エラーがサニタイズされてRendererに返却される                   |
| SCIT-INT-07 | Error以外のthrow（文字列、オブジェクト）も安全にハンドリングされる |

#### 5-4. セキュリティカテゴリ

| テストID    | テスト内容                                           |
| ----------- | ---------------------------------------------------- |
| SCIT-INT-08 | sender検証失敗時のエンドツーエンドエラーフロー       |
| SCIT-INT-09 | パストラバーサル検出時のエンドツーエンドエラーフロー |

#### 5-5. 進捗通知カテゴリ

| テストID    | テスト内容                                                 |
| ----------- | ---------------------------------------------------------- |
| SCIT-INT-10 | `executeTasks`実行中に進捗通知がRendererリスナーに到達する |
| SCIT-INT-11 | 複数回の進捗通知が正しい順序でRendererに到達する           |

---

## 参照資料

| 資料名                        | パス                                                                                        | 説明                             |
| ----------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5実装コード             | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                         | テスト対象のハンドラー実装       |
| Phase 5 Preload API実装       | `apps/desktop/src/preload/api/skill-creator-api.ts`                                         | テスト対象のPreload API実装      |
| Phase 4テスト設計             | `docs/30-workflows/skill-creator-ipc/phase-4-test-creation.md`                              | 初期テスト設計                   |
| Phase 4統合テスト設計         | `outputs/phase-4/integration-test-design.md`                                                | 5カテゴリ統合テストシナリオ      |
| IPC通信セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | セキュリティテスト基準           |
| スキルIPCセキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | SkillCreator固有セキュリティ要件 |
| Handler Map方式テストパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターン参照               |
| コード品質ルール              | `.claude/rules/02-code-quality.md`                                                          | カバレッジ基準定義               |

---

## 統合テスト連携【必須】

| カテゴリ           | テスト数 | カバレッジ目標       | AC参照        |
| ------------------ | -------- | -------------------- | ------------- |
| IPC接続            | 2        | 6/6チャンネル (100%) | AC-01〜05, 10 |
| データフロー       | 2        | 正常系100%           | AC-01〜05     |
| エラーハンドリング | 3        | 異常系80%+           | AC-08, 09     |
| セキュリティ       | 2        | 攻撃パターン80%+     | AC-07, 08     |
| 進捗通知           | 2        | 通知フロー100%       | AC-06         |

---

## 多角的チェック観点

| 観点                | 確認項目                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------- |
| エッジケース網羅    | 同時呼び出し、タイムアウト、大量データの全パターンがテスト済み                           |
| セキュリティ網羅    | パストラバーサル（Unix/Windows）、コマンドインジェクション、未登録チャンネルがテスト済み |
| 進捗通知網羅        | 複数リスナー、クリーンアップ、型検証、mainWindow破棄がテスト済み                         |
| 統合テスト5カテゴリ | IPC接続、データフロー、エラーハンドリング、セキュリティ、進捗通知が全てカバー済み        |
| テスト独立性        | 各テストが独立して実行可能（beforeEachでリセット）                                       |
| 既存テスト非破壊    | Phase 4で作成したテストが引き続きPASSする                                                |

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テスト基準

| 指標           | 目標       |
| -------------- | ---------- |
| IPCチャンネル  | 6/6 (100%) |
| 正常系シナリオ | 100%       |
| 異常系シナリオ | 80%+       |

---

## 成果物

| 成果物                    | パス                                                                      | 説明                                 |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| カバレッジ分析レポート    | `outputs/phase-6/coverage-analysis.md`                                    | 未カバー箇所の特定結果               |
| カバレッジレポート        | `outputs/phase-6/coverage-report.md`                                      | 拡充後のカバレッジ測定結果           |
| ハンドラーテスト（拡充）  | `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts` | エッジケース・セキュリティ・統合追加 |
| Preload APIテスト（拡充） | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`            | 進捗通知テスト追加                   |

---

## 完了条件

- [ ] Task 1のカバレッジ分析が完了し、未カバー箇所が特定されている
- [ ] SCIT-EDG-01〜12: エッジケーステスト（同時呼び出し、タイムアウト、大量データ、不正型）が追加されている
- [ ] SCIT-SEC-05〜12: セキュリティテスト（パストラバーサル攻撃パターン、コマンドインジェクション、未登録チャンネル）が追加されている
- [ ] SCIT-PRG-01〜09: 進捗通知テスト（複数リスナー、クリーンアップ、型検証、mainWindow破棄後）が拡充されている
- [ ] SCIT-INT-01〜11: 統合テスト（5カテゴリ）が追加されている
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] IPCチャンネルカバレッジ 6/6 (100%)
- [ ] 正常系シナリオカバレッジ 100%
- [ ] 異常系シナリオカバレッジ 80%以上
- [ ] 全テストがPASS
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| サブタスクID | タスク名           | ステータス | 完了条件                   |
| ------------ | ------------------ | ---------- | -------------------------- |
| T6-1         | カバレッジ分析     | 未着手     | 未カバー箇所リスト作成完了 |
| T6-2         | エッジケーステスト | 未着手     | 12テストケース追加完了     |
| T6-3         | セキュリティテスト | 未着手     | 8テストケース追加完了      |
| T6-4         | 進捗通知テスト     | 未着手     | 9テストケース追加完了      |
| T6-5         | 統合テスト拡充     | 未着手     | 11テストケース追加完了     |

---

## タスク100%実行確認【必須】

- [ ] Task 1（カバレッジ分析）: 完了
- [ ] Task 2（エッジケーステスト追加）: 完了
- [ ] Task 3（セキュリティテスト追加）: 完了
- [ ] Task 4（進捗通知テスト拡充）: 完了
- [ ] Task 5（統合テスト拡充）: 完了
- [ ] 全成果物が生成されている
- [ ] カバレッジ基準を全て満たしている
- [ ] 全テストがPASS

---

## テスト実行コマンド

```bash
# 全テスト実行（カバレッジ付き）
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/preload/__tests__/skill-creator-api.test.ts

# カバレッジレポート確認
# - [ ] Line Coverage: __% (最低80%)
# - [ ] Branch Coverage: __% (最低60%)
# - [ ] Function Coverage: __% (最低80%)
# - [ ] 全テストがPASS
```

---

## 次のPhase

[Phase 7: カバレッジ確認](./phase-7-coverage-verification.md)
