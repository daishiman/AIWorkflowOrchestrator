# Phase 9: 品質保証 - execute-plan IPC の非同期化（fire-and-forget化）

## メタ情報

| 項目      | 値                                     |
| --------- | -------------------------------------- |
| Phase     | 9                                      |
| 機能名    | fix-step3-seq-execute-plan-nonblocking |
| 作成日    | 2026-04-04                             |
| 前提Phase | Phase 8                                |
| 後続Phase | Phase 10                               |

## 目的

静的解析・型チェック・セキュリティ確認を実施し、コード品質がプロジェクト基準を満たしていることを保証する。全ての自動検証ツールをパスし、手動のセキュリティ・品質チェックも完了させる。

## 実行タスク

### タスク1: TypeScript 型チェック

**目的**: 型エラーがゼロであることを確認する。

**手順**:

1. desktop パッケージの型チェックを実行する

```bash
pnpm --filter @repo/desktop typecheck
```

2. 確認ポイント:

| 確認項目                          | 期待結果                   |
| --------------------------------- | -------------------------- |
| 型エラーの数                      | 0 件                       |
| `any` 型の新規導入                | なし                       |
| `as` キャストの新規導入           | 最小限（型ガード内のみ可） |
| `@ts-ignore` / `@ts-expect-error` | 新規導入なし               |

3. エラーがある場合は修正し、再実行する

4. `any` 型の確認:

```bash
# 変更ファイルで any 型が新規導入されていないか確認
git diff main -- \
  apps/desktop/src/main/ipc/creatorHandlers.ts \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx \
  | grep "+.*\bany\b"
```

### タスク2: ESLint 静的解析

**目的**: lint エラーがゼロであることを確認する。

**手順**:

1. desktop パッケージの lint を実行する

```bash
pnpm --filter @repo/desktop lint
```

2. 確認ポイント:

| 確認項目                                       | 期待結果         |
| ---------------------------------------------- | ---------------- |
| ESLint エラーの数                              | 0 件             |
| ESLint 警告の数                                | 既存数と同等以下 |
| `eslint-disable` コメントの新規追加            | なし             |
| `@typescript-eslint/no-floating-promises` 違反 | なし             |

3. エラーがある場合は修正し、再実行する

### タスク3: セキュリティ確認

**目的**: Electron セキュリティのベストプラクティスに従っていることを確認する。

**手順**:

1. `validateSender` の維持確認

```bash
grep -n "validateSender" \
  apps/desktop/src/main/ipc/creatorHandlers.ts
```

確認ポイント:

- execute-plan ハンドラーの冒頭で `validateSender(event, channel, mainWindow)` が呼ばれている
- fire-and-forget 化により `validateSender` が削除・スキップされていない

2. floating promise の確認

```bash
# void キーワードなしの Promise が放置されていないか確認
grep -n "executeAsync\|\.then\|\.catch" \
  apps/desktop/src/main/ipc/creatorHandlers.ts
```

確認ポイント:

- `void runtimeSkillCreatorService.executeAsync(planId, args)` の形で明示的に void 修飾されている
- `.then()` / `.catch()` チェーンが中途半端に切れていない
- ESLint の `@typescript-eslint/no-floating-promises` ルールに違反していない

3. IPC チャンネルの入力バリデーション確認

```bash
grep -n "isBlank\|validationError\|args\.\|trim()" \
  apps/desktop/src/main/ipc/creatorHandlers.ts
```

確認ポイント:

- `planId` と `skillSpec` の必須チェックが行われている
- `planId.trim()` で前後空白が除去されている
- `runtimeSkillCreatorService` の null チェックが行われている

### タスク4: IPC チャンネル整合性確認

**目的**: IPC チャンネル定義と実装の整合性を確認する。

**手順**:

1. `channels.ts` の定義を確認する

```bash
grep -n "EXECUTE_PLAN\|WORKFLOW_STATE_CHANGED" \
  apps/desktop/src/preload/channels.ts
```

2. ハンドラーで使用しているチャンネル名と `channels.ts` の定義が一致していることを確認する

| チャンネル                             | channels.ts 定義 | ハンドラー使用 | 一致 |
| -------------------------------------- | ---------------- | -------------- | ---- |
| `SKILL_CREATOR_EXECUTE_PLAN`           | —                | —              | —    |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` | —                | —              | —    |

3. `IPC_CHANNELS` の import が正しいパスから行われていることを確認する

### タスク5: 品質保証レポートの作成

**目的**: 全ての品質確認結果をレポートにまとめる。

**手順**:

1. `outputs/phase-9/quality-report.md` を作成する
2. 以下の情報を含める:

```markdown
# 品質保証レポート

## 1. TypeScript 型チェック

| 項目             | 結果                                    |
| ---------------- | --------------------------------------- |
| 実行コマンド     | `pnpm --filter @repo/desktop typecheck` |
| エラー数         | \_ 件                                   |
| 新規 any 型      | あり / なし                             |
| 新規 as キャスト | あり / なし                             |

## 2. ESLint 静的解析

| 項目                  | 結果                               |
| --------------------- | ---------------------------------- |
| 実行コマンド          | `pnpm --filter @repo/desktop lint` |
| エラー数              | \_ 件                              |
| 警告数                | \_ 件                              |
| floating promise 違反 | あり / なし                        |

## 3. セキュリティ確認

| 確認項目                      | 結果    |
| ----------------------------- | ------- |
| validateSender 維持           | OK / NG |
| void 修飾（floating promise） | OK / NG |
| 入力バリデーション            | OK / NG |
| isDestroyed チェック          | OK / NG |

## 4. IPC チャンネル整合性

| チャンネル                           | channels.ts | ハンドラー | 整合性 |
| ------------------------------------ | ----------- | ---------- | ------ |
| SKILL_CREATOR_EXECUTE_PLAN           | —           | —          | —      |
| SKILL_CREATOR_WORKFLOW_STATE_CHANGED | —           | —          | —      |

## 5. 総合判定

| カテゴリ     | 判定            |
| ------------ | --------------- |
| 型チェック   | PASS / FAIL     |
| 静的解析     | PASS / FAIL     |
| セキュリティ | PASS / FAIL     |
| IPC 整合性   | PASS / FAIL     |
| **総合**     | **PASS / FAIL** |
```

## 参照資料

| 資料名                   | パス                                                                         | 説明                  |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------- |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-report.md`                                      | リファクタリング結果  |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electron セキュリティ |
| IPC Bridge 仕様          | `.claude/skills/aiworkflow-requirements/references/api-ipc-bridge.md`        | IPC チャンネル定義    |
| channels.ts              | `apps/desktop/src/preload/channels.ts`                                       | IPC チャンネル定数    |

### システム仕様（aiworkflow-requirements）

> 品質保証の判定基準は以下のシステム仕様に準拠します。

| 参照資料                       | パス                                                                            | 内容                                    |
| ------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------- |
| IPC Bridge 仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-bridge.md`           | チャンネル名の命名規約                  |
| セキュリティ                   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`    | validateSender 必須、入力バリデーション |
| エラーハンドリング             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | floating promise 禁止ルール             |
| Skill Creator インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-creator.md` | 型定義の品質基準                        |

## 統合テスト連携

Phase 9 では静的解析が主体。テスト実行は Phase 6-7 で完了済みだが、品質保証の一環として最終テスト実行を行う。

| 確認項目                 | コマンド                                                         |
| ------------------------ | ---------------------------------------------------------------- |
| TypeScript 型チェック    | `pnpm --filter @repo/desktop typecheck`                          |
| ESLint                   | `pnpm --filter @repo/desktop lint`                               |
| テスト最終実行（確認用） | `pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/` |

## 多角的チェック観点

| 観点         | 適用判断                                   | 仕様参照先                 |
| ------------ | ------------------------------------------ | -------------------------- |
| 型安全性     | TypeScript strict モードでのエラーゼロ     | TypeScript 設定            |
| 静的解析     | ESLint ルールセット準拠                    | `.eslintrc` 設定           |
| セキュリティ | validateSender 維持、floating promise 防止 | `security-api-electron.md` |
| IPC整合性    | チャンネル定義と実装の一致                 | `api-ipc-bridge.md`        |
| コード品質   | any 型禁止、ts-ignore 禁止                 | プロジェクト規約           |

## 成果物

| 成果物           | パス                                | 説明                                            |
| ---------------- | ----------------------------------- | ----------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 型チェック・lint・セキュリティ・IPC整合性の結果 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で完了
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 で完了
- [ ] `validateSender` がハンドラー冒頭で維持されていることを確認
- [ ] floating promise がないことを確認（`void` 修飾済み）
- [ ] 新規 `any` 型が導入されていないことを確認
- [ ] IPC チャンネル名が `channels.ts` の定義と一致していることを確認
- [ ] 品質保証レポート（`outputs/phase-9/quality-report.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート — [phase-10-final-review.md](phase-10-final-review.md)
