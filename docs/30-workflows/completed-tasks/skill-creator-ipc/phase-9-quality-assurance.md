# Phase 9: 品質保証

## メタ情報

| 項目    | 値                     |
| ------- | ---------------------- |
| Phase   | 9                      |
| 機能名  | skill-creator-ipc      |
| 作成日  | 2026-02-12             |
| 次Phase | Phase 10: 最終レビュー |

## 目的

定義された品質基準を全て満たすことを検証する。ESLint検証、TypeScript型チェック、セキュリティ検証、全テスト実行の4項目を実施し、品質ゲートの全項目をクリアする。

## 実行タスク

### Task 1: ESLint検証

#### 1-1. デスクトップパッケージのLint実行

```bash
pnpm --filter @repo/desktop lint
```

- 警告0件を達成する
- エラー0件を達成する
- 自動修正可能な警告は `--fix` で修正する

#### 1-2. 共有パッケージのLint実行

```bash
pnpm --filter @repo/shared lint
```

- skill-creator関連の型定義ファイルに警告がないことを確認する

#### 1-3. Lint結果の記録

- 検出された警告・エラーの一覧を記録する
- 全て修正済みであることを確認する
- 修正内容を `outputs/phase-9/quality-report.md` に記録する

### Task 2: TypeScript型チェック

#### 2-1. 共有パッケージの型チェック（依存元を先に実行）

```bash
pnpm --filter @repo/shared typecheck
```

- `packages/shared/src/skill-creator/types.ts` にエラーがないことを確認する

#### 2-2. デスクトップパッケージの型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- エラー0件を達成する
- `skillCreatorHandlers.ts` にエラーがないことを確認する
- `skill-creator-api.ts` にエラーがないことを確認する
- `preload/types.ts` にエラーがないことを確認する

#### 2-3. P32対策: 型定義の2箇所同期確認

- `packages/shared/src/skill-creator/types.ts` の型名を全て列挙する
- `apps/desktop/src/preload/types.ts` の `SkillCreatorAPI` で参照される型名を全て列挙する
- 両方の型名が一致していることを確認する
- 不一致がある場合は修正し、再度 `pnpm typecheck` を実行する

### Task 3: セキュリティ検証

#### 3-1. Zodスキーマの網羅性確認

- 全5つのinvokeチャンネルの引数バリデーションにZodスキーマ（またはランタイム型チェック）が適用されていることを確認する

| チャンネル                      | バリデーション対象                      | Zodスキーマ/型チェック有無 | 結果       |
| ------------------------------- | --------------------------------------- | -------------------------- | ---------- |
| `skill-creator:detect-mode`     | `request: string`（非空）               |                            | {{RESULT}} |
| `skill-creator:create`          | `CreateSkillOptions`（必須フィールド）  |                            | {{RESULT}} |
| `skill-creator:execute-tasks`   | `ExecuteTasksOptions`（必須フィールド） |                            | {{RESULT}} |
| `skill-creator:validate`        | `skillDir: string`（非空）              |                            | {{RESULT}} |
| `skill-creator:validate-schema` | `schemaName: string`, `data: unknown`   |                            | {{RESULT}} |

#### 3-2. validateIpcSender全ハンドラー呼び出し確認

- `skillCreatorHandlers.ts` 内の全 `ipcMain.handle` / `ipcMain.on` 登録箇所で `validateIpcSender(event)` が呼ばれていることを確認する

| ハンドラー                      | validateIpcSender呼び出し     | 結果       |
| ------------------------------- | ----------------------------- | ---------- |
| `skill-creator:detect-mode`     |                               | {{RESULT}} |
| `skill-creator:create`          |                               | {{RESULT}} |
| `skill-creator:execute-tasks`   |                               | {{RESULT}} |
| `skill-creator:validate`        |                               | {{RESULT}} |
| `skill-creator:validate-schema` |                               | {{RESULT}} |
| `skill-creator:progress`        | （Main→Rendererのため対象外） | N/A        |

#### 3-3. ホワイトリスト登録の確認

- `channels.ts` に SKILL_CREATOR 系の全6チャンネルが定義されていることを確認する
- `ALLOWED_INVOKE_CHANNELS` に5つのinvokeチャンネルが含まれていることを確認する
- `ALLOWED_ON_CHANNELS` に `SKILL_CREATOR_PROGRESS` が含まれていることを確認する

#### 3-4. ハードコード文字列チェック（P27対策）

```bash
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/ | grep -v "IPC_CHANNELS"
```

- ハードコードされたチャンネル名が0件であることを確認する
- `IPC_CHANNELS` 定数以外でチャンネル名を参照している箇所が0件であることを確認する

#### 3-5. エラーサニタイズ確認

- 全ハンドラーの catch ブロックで `{ success: false, error: string }` 形式のレスポンスが返されていることを確認する
- エラーメッセージにスタックトレースが含まれていないことを確認する
- エラーメッセージに内部ファイルパスが含まれていないことを確認する

### Task 4: 全テスト実行

#### 4-1. デスクトップパッケージ全テスト

```bash
pnpm --filter @repo/desktop test
```

- 全テストがPASSすることを確認する
- skillCreator関連テストの結果を個別に記録する

#### 4-2. 共有パッケージテスト

```bash
pnpm --filter @repo/shared test
```

- skill-creator関連の型テスト（存在する場合）がPASSすることを確認する

#### 4-3. テスト結果サマリー

| テストスイート               | テスト数 | PASS | FAIL | 結果       |
| ---------------------------- | -------- | ---- | ---- | ---------- |
| skillCreatorHandlers.test.ts |          |      |      | {{RESULT}} |
| skill-creator-api.test.ts    |          |      |      | {{RESULT}} |
| 既存skillHandlers.test.ts    |          |      |      | {{RESULT}} |
| @repo/desktop全体            |          |      |      | {{RESULT}} |
| @repo/shared全体             |          |      |      | {{RESULT}} |

## 参照資料

| 資料名                    | パス                                                                              | 説明                                   |
| ------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| セキュリティ（Skill IPC） | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | SkillCreator IPC固有のセキュリティ要件 |
| インターフェース仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillCreatorService API仕様            |
| IPCアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | Pattern 3準拠、Handler Map方式         |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC通信セキュリティ原則                |
| IPC API仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存チャンネルとの命名一貫性確認       |
| Phase 8 成果物            | `docs/30-workflows/skill-creator-ipc/outputs/phase-8/`                            | リファクタリング済みコード             |
| セキュリティルール        | `.claude/rules/04-electron-security.md`                                           | Electronセキュリティ設計原則           |
| コード品質ルール          | `.claude/rules/02-code-quality.md`                                                | カバレッジ基準・コーディング規約       |
| チャンネル定義            | `apps/desktop/src/preload/channels.ts`                                            | ホワイトリスト確認用                   |
| Preload 型定義            | `apps/desktop/src/preload/types.ts`                                               | 型定義確認用                           |

## 実行手順

1. Task 1 を実行し、ESLint警告・エラーを0件にする
2. Task 2 を実行し、TypeScriptエラーを0件にする
3. Task 3 を実行し、セキュリティ検証の全項目をクリアする
4. Task 4 を実行し、全テストがPASSすることを確認する
5. 品質ゲートテーブルの全項目に結果を記入する
6. 全結果を `outputs/phase-9/quality-report.md` に記録する

## 統合テスト連携【必須】

品質保証で全統合テスト成功を確認する。

| 品質項目     | 確認内容                              | 結果       |
| ------------ | ------------------------------------- | ---------- |
| 機能検証     | 全6チャンネルのハンドラーテストPASS   | {{RESULT}} |
| 統合テスト   | Handler Map方式テスト全PASS           | {{RESULT}} |
| セキュリティ | validateIpcSender + Zod検証テストPASS | {{RESULT}} |

## 多角的チェック観点

| 観点             | 確認内容                                                              |
| ---------------- | --------------------------------------------------------------------- |
| コード品質       | ESLint警告0件、未使用import0件                                        |
| 型安全性         | TypeScriptエラー0件、型アサーション不使用、P32型同期済み              |
| セキュリティ     | sender検証100%、Zodバリデーション100%、ホワイトリスト完備、P27準拠    |
| テスト網羅性     | 全テストPASS、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+） |
| 既存機能への影響 | 既存skillHandlersテストが影響なくPASS                                 |

## 品質ゲートテーブル

| 項目           | 基準                        | 結果       |
| -------------- | --------------------------- | ---------- |
| ESLint         | 警告0件                     | {{RESULT}} |
| TypeScript     | エラー0件                   | {{RESULT}} |
| ユニットテスト | 全PASS                      | {{RESULT}} |
| 統合テスト     | 全PASS                      | {{RESULT}} |
| セキュリティ   | sender検証100%、Zod検証100% | {{RESULT}} |

## 成果物

| 成果物       | パス                                                                    | 説明                                         |
| ------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| 品質レポート | `docs/30-workflows/skill-creator-ipc/outputs/phase-9/quality-report.md` | ESLint・型チェック・セキュリティ・テスト結果 |

## 完了条件

- [ ] ESLint 警告が0件
- [ ] ESLint エラーが0件
- [ ] TypeScript 型チェックエラーが0件（shared + desktop）
- [ ] P32対策: shared型とpreload型の同期が確認済み
- [ ] 全5 invokeハンドラーでZodスキーマ/型チェックが適用されている
- [ ] 全5 invokeハンドラーで validateIpcSender が呼び出されている
- [ ] ホワイトリスト（ALLOWED_INVOKE_CHANNELS/ALLOWED_ON_CHANNELS）に全チャンネル登録済み
- [ ] ハードコードチャンネル名が0件（P27対策）
- [ ] エラーメッセージにスタックトレース・内部パスが含まれていない
- [ ] 全テストがPASS（@repo/desktop + @repo/shared）
- [ ] 品質ゲートテーブルの全項目がクリア
- [ ] `outputs/phase-9/quality-report.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク                   | ステータス | 完了日 |
| ---------------------------- | ---------- | ------ |
| Task 1: ESLint検証           | 未着手     |        |
| Task 2: TypeScript型チェック | 未着手     |        |
| Task 3: セキュリティ検証     | 未着手     |        |
| Task 4: 全テスト実行         | 未着手     |        |

## タスク100%実行確認【必須】

- [ ] Task 1（ESLint検証）: desktop + shared 両方実行完了、警告0件・エラー0件
- [ ] Task 2（TypeScript型チェック）: shared → desktop 順に実行完了、エラー0件、P32確認済み
- [ ] Task 3（セキュリティ検証）: Zodスキーマ5チャンネル確認、sender検証5ハンドラー確認、ホワイトリスト確認、P27確認、エラーサニタイズ確認
- [ ] Task 4（全テスト実行）: desktop + shared 全テストPASS、テスト結果サマリー記録済み

## 次のPhase

[Phase 10: 最終レビュー](./phase-10-final-review.md)
