# Phase 9: 品質保証

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 9                                   |
| 機能名    | UT-06-005-abort-skip-retry-fallback |
| 作成日    | 2026-03-16                          |
| 前提Phase | Phase 8（リファクタリング）完了     |

## 目的

Phase 8 のリファクタリング完了後、プロジェクトで定義された品質基準（TypeScript 型安全、ESLint、テストカバレッジ、セキュリティ）をすべて満たしていることを体系的に検証する。品質ゲートを通過できない場合は、該当箇所を修正してから再検証する。

## 参照資料

| 資料                   | パス / 参照先                                                                  |
| ---------------------- | ------------------------------------------------------------------------------ |
| Phase 8 成果物         | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/phase-8-refactoring.md` |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                             |
| セキュリティルール     | `.claude/rules/04-electron-security.md`                                        |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                           |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`     |
| IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 仕様書                     | パス                                                                                         | 確認観点                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| エラーハンドリング仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラーカテゴリ・Result パターン準拠                                |
| エラーハンドリング（コア） | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細） | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | 実装パターン準拠確認                                               |
| セキュリティ（スキル実行） | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed 原則、セッション管理                                   |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                  | カバレッジ基準、品質ゲート基準                                     |
| Agent SDK Executor（コア） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode         |
| Agent SDK Executor（詳細） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |

## 品質ゲート

| ゲート       | 基準                                                         | 未達時の対応                 |
| ------------ | ------------------------------------------------------------ | ---------------------------- |
| 機能検証     | 全テスト PASS（fallback/permission/retry/既存）              | Phase 8 の変更を修正し再検証 |
| コード品質   | TypeScript 型チェック・ESLint エラー 0 件                    | 当 Phase 内で修正し再検証    |
| テスト網羅性 | Line >= 80%, Branch >= 60%, Function >= 80%                  | Phase 6（テスト拡充）に戻る  |
| セキュリティ | fail-closed / ログ安全性 / IPC 安全性 / セッション管理 全 OK | Phase 5（実装）に戻り修正    |

## 実行タスク

### Task 1: TypeScript 型チェック

- **コマンド**: `pnpm --filter @repo/desktop exec tsc --noEmit`
- **期待結果**: エラー 0 件
- **失敗時対応**: 型エラーを修正し、再度実行
- **注意事項**:
  - `any` 型の使用がないこと（`grep -rn ": any" apps/desktop/src/main/services/skill/` で確認）
  - `@ts-ignore` / `@ts-expect-error` が増加していないこと
  - non-null assertion (`!`) が増加していないこと（P48/P52 準拠）
  - 型アサーション (`as`) でバリデーションを回避していないこと（P19/P49 準拠）

### Task 2: ESLint チェック

- **コマンド**: `pnpm --filter @repo/desktop lint`
- **期待結果**: エラー 0 件、warning は許容（ただし新規 warning は調査）
- **失敗時対応**: lint エラーを修正し、再度実行
- **注意事項**:
  - 未使用 import がないこと
  - 命名規約違反がないこと

### Task 3: テスト実行（全テスト）

- **コマンド**:
  ```bash
  cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/
  ```
- **期待結果**: 全テスト PASS
- **失敗時対応**: 失敗テストの原因を特定し、Phase 8 の変更に起因する場合はコードを修正
- **個別テスト確認**:
  | テストファイル | 対象 |
  | --------------------------------------- | ---------------------------- |
  | `SkillExecutor.fallback.test.ts` | abort/skip/retry/timeout |
  | `SkillExecutor.permission.test.ts` | 既存 permission テスト |
  | `SkillExecutor.retry.test.ts` | 既存 retry テスト |
  | `SkillExecutor.test.ts` | 既存基本テスト |
  | `SkillExecutor.integration.test.ts` | 既存統合テスト |
  | `SkillExecutor.auth.test.ts` | 既存認証テスト |

### Task 4: カバレッジ確認

- **コマンド**:
  ```bash
  cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/
  ```
- **カバレッジ基準**:
  | 指標 | 最低基準 | 推奨基準 | 対象ファイル |
  | ----------------- | -------- | -------- | ------------------------- |
  | Line Coverage | 80% | 90% | SkillExecutor.ts |
  | Branch Coverage | 60% | 70% | SkillExecutor.ts |
  | Function Coverage | 80% | 90% | SkillExecutor.ts |
  | Line Coverage | 80% | 90% | PermissionStore.ts |
- **失敗時対応**: Phase 6（テスト拡充）に戻り、不足箇所のテストを追加
- **注意事項**: P41 準拠 -- v8 プロバイダのインライン関数カウントに注意

### Task 5: セキュリティチェック

#### 5-1: fail-closed 原則の確認

- Permission 応答が不明な値の場合、デフォルトで abort（安全側）に倒れることを確認
- `handlePermissionResponse` のデフォルトケースが abort であること
- テストで unknown 応答タイプが abort として処理されることを検証

#### 5-2: ログ安全性の確認

- **コマンド**:
  ```bash
  grep -rn "password\|apiKey\|token\|secret\|credential" apps/desktop/src/main/services/skill/SkillExecutor.ts
  grep -rn "password\|apiKey\|token\|secret\|credential" apps/desktop/src/main/services/skill/PermissionStore.ts
  ```
- PII / API キー / パスワードがログ出力に含まれていないこと
- P55 準拠: ファイルパスをログに含む場合、`escapeRegExp()` でメタ文字をエスケープ後にマスク処理

#### 5-3: IPC チャンネル名管理の確認

- abort/skip 結果を Renderer に通知する IPC チャンネル名が `SKILL_CHANNELS` 定数で管理されていること
- ハードコード文字列でのチャンネル指定がないこと（P27 準拠）
- **コマンド**:
  ```bash
  grep -rn "safeInvoke\|ipcMain.handle\|ipcMain.on" apps/desktop/src/main/services/skill/SkillExecutor.ts | grep -v "SKILL_CHANNELS\|IPC_CHANNELS"
  ```

#### 5-4: セッション管理の確認

- abort 時の `revokeSessionEntries` が確実にセッション権限をクリアすること
- セッション権限のリーク（abort 後に旧セッションの権限が残存）がないこと

### Task 6: エラーハンドリング確認

- エラーカテゴリが `02-code-quality.md` のコード範囲に準拠していること
- External Service Error（3000-3999）はリトライ可能、Validation Error（1000-1999）はリトライ不可
- `Result<T, E>` パターンでエラーが明示的に返されていること
- try/catch でエラーが握りつぶされていないこと

## 実行手順

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175650-wt-2

# Step 1: TypeScript 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# Step 2: ESLint
pnpm --filter @repo/desktop lint

# Step 3: 全テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/

# Step 4: カバレッジ確認
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/

# Step 5: セキュリティチェック（手動 grep）
grep -rn "password\|apiKey\|token\|secret\|credential" apps/desktop/src/main/services/skill/SkillExecutor.ts
grep -rn "safeInvoke\|ipcMain.handle\|ipcMain.on" apps/desktop/src/main/services/skill/SkillExecutor.ts | grep -v "SKILL_CHANNELS\|IPC_CHANNELS"

# Step 6: any 型チェック
grep -rn ": any\b" apps/desktop/src/main/services/skill/SkillExecutor.ts
grep -rn ": any\b" apps/desktop/src/main/services/skill/PermissionStore.ts

# Step 7: non-null assertion チェック
grep -rn "\!" apps/desktop/src/main/services/skill/SkillExecutor.ts | grep -v "!=\|!=="
```

## 統合テスト連携【必須】

| チェック項目             | コマンド / 確認方法                                                                                     | 期待結果                |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| TypeScript 型チェック    | `pnpm --filter @repo/desktop exec tsc --noEmit`                                                         | エラー 0 件             |
| ESLint                   | `pnpm --filter @repo/desktop lint`                                                                      | エラー 0 件             |
| fallback テスト PASS     | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts`   | 全 PASS                 |
| permission テスト PASS   | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts` | 全 PASS                 |
| retry テスト PASS        | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`      | 全 PASS                 |
| skill 全テスト PASS      | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/`                                 | 全 PASS                 |
| Line Coverage >= 80%     | `cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/`                                | SkillExecutor.ts >= 80% |
| Branch Coverage >= 60%   | 同上                                                                                                    | SkillExecutor.ts >= 60% |
| Function Coverage >= 80% | 同上                                                                                                    | SkillExecutor.ts >= 80% |

## 多角的チェック観点

| 観点               | チェック内容                                            |
| ------------------ | ------------------------------------------------------- |
| 型安全             | `any` / `as` / `!` の不適切な使用がないこと             |
| fail-closed        | 不明な Permission 応答がデフォルトで abort に倒れること |
| ログ安全性         | PII / API キー / パスワードがログに含まれないこと       |
| IPC 安全性         | チャンネル名が定数管理、ハードコード文字列なし          |
| セッション安全性   | abort 後にセッション権限がリークしないこと              |
| エラーハンドリング | エラーカテゴリ準拠、Result パターン使用、握りつぶしなし |
| カバレッジ充足     | Line >= 80%, Branch >= 60%, Function >= 80%             |
| パス安全性         | P55 準拠のパスエスケープ処理                            |
| non-null assertion | P48/P52 準拠で `!` が増加していないこと                 |

### Electronデスクトップアプリ観点

| 観点                  | チェック内容                                                       |
| --------------------- | ------------------------------------------------------------------ |
| Main Process 完結性   | スキル実行・フォールバック処理が Main Process 内で完結していること |
| IPC チャンネル安全性  | abort/skip/retry 結果通知の IPC チャンネルが定数管理されていること |
| Preload Bridge 安全性 | contextBridge 経由の API が安全にサニタイズされていること          |
| セッション隔離        | abort 後のセッション権限が Renderer に漏洩しないこと               |
| sandbox 設定維持      | `sandbox: true` / `contextIsolation: true` が維持されていること    |

### 統合テスト結果確認

| テスト種別        | 結果 | 備考 |
| ----------------- | ---- | ---- |
| fallback テスト   | -    |      |
| permission テスト | -    |      |
| retry テスト      | -    |      |
| 基本テスト        | -    |      |
| 統合テスト        | -    |      |
| 認証テスト        | -    |      |

## 成果物

| 成果物                   | パス                                                   | 説明                 |
| ------------------------ | ------------------------------------------------------ | -------------------- |
| 品質検証結果レポート     | Phase 9 実行時の各コマンド出力ログ                     | 品質ゲート判定結果   |
| カバレッジレポート       | `cd apps/desktop && pnpm vitest run --coverage` の出力 | カバレッジ計測結果   |
| セキュリティチェック結果 | grep 出力結果と確認記録                                | セキュリティ検証結果 |

## 完了条件

- [ ] Task 1: TypeScript 型チェック PASS（エラー 0 件）
- [ ] Task 2: ESLint PASS（エラー 0 件）
- [ ] Task 3: 全テスト PASS（fallback/permission/retry/既存）
- [ ] Task 4: カバレッジ基準充足（Line >= 80%, Branch >= 60%, Function >= 80%）
- [ ] Task 5-1: fail-closed 原則が実装されている
- [ ] Task 5-2: ログに PII / API キー / パスワードが含まれていない
- [ ] Task 5-3: IPC チャンネル名が定数管理されている
- [ ] Task 5-4: abort 後のセッション権限リークがない
- [ ] Task 6: エラーハンドリングがカテゴリ準拠で Result パターンを使用
- [ ] `any` 型が増加していない
- [ ] non-null assertion (`!`) が増加していない
- [ ] 型アサーション (`as`) でバリデーションを回避していない
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 内容                   | 状態   | 備考                                  |
| ---------- | ---------------------- | ------ | ------------------------------------- |
| Task 1     | TypeScript 型チェック  | 未着手 | `tsc --noEmit`                        |
| Task 2     | ESLint                 | 未着手 | エラー 0 件必須                       |
| Task 3     | テスト実行             | 未着手 | 6テストファイル全 PASS                |
| Task 4     | カバレッジ確認         | 未着手 | 未達の場合 Phase 6 に戻る             |
| Task 5     | セキュリティチェック   | 未着手 | fail-closed / ログ / IPC / セッション |
| Task 6     | エラーハンドリング確認 | 未着手 | カテゴリ準拠 / Result パターン        |

## タスク100%実行確認【必須】

```bash
# Phase 9 成果物検証
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175650-wt-2

# 1. TypeScript 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# 2. ESLint
pnpm --filter @repo/desktop lint

# 3. 全テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/

# 4. カバレッジ
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/

# 5. validate-phase-output.js（利用可能な場合）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 9
```

## 次のPhase

Phase 9 完了後 -> **Phase 10: 最終レビューゲート**（`phase-10-final-review.md`）

品質ゲート未達の場合:

- カバレッジ未達 -> Phase 6（テスト拡充）に戻る
- 型エラー / Lint エラー -> 当 Phase 内で修正し再検証
- セキュリティ問題 -> Phase 5（実装）に戻り修正
