# Phase 7: テストカバレッジ確認 - execute-plan IPC の非同期化（fire-and-forget化）

## メタ情報

| 項目      | 値                                     |
| --------- | -------------------------------------- |
| Phase     | 7                                      |
| 機能名    | fix-step3-seq-execute-plan-nonblocking |
| 作成日    | 2026-04-04                             |
| 前提Phase | Phase 6                                |
| 後続Phase | Phase 8                                |

## 目的

Phase 6 までに作成・拡充したテストが、変更対象のコード範囲を十分にカバーしているかを定量的に検証する。カバレッジ目標は変更ファイル・変更ブロック限定で設定し、達成状況を記録する。

## 実行タスク

### タスク1: カバレッジ計測の実行

**目的**: 変更対象ファイルのカバレッジを計測する。

**手順**:

1. カバレッジ付きでテストを実行する

```bash
pnpm --filter @repo/desktop vitest run --coverage \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts \
  src/main/ipc/__tests__/creatorHandlers.test.ts
```

2. 変更ファイルのカバレッジが目標未達の場合、全テストスイートでカバレッジを再計測する

```bash
pnpm --filter @repo/desktop vitest run --coverage
```

3. カバレッジレポートの出力先を確認する
   - HTML レポート: `apps/desktop/coverage/index.html`
   - テキスト出力: ターミナル出力を記録

### タスク2: カバレッジ目標の検証

**目的**: 変更ファイル・変更ブロック限定でカバレッジ目標を検証する。

**カバレッジ目標**:

| 対象ファイル / 関数                               | Line 目標 | Branch 目標 | 実測 Line | 実測 Branch | 判定 |
| ------------------------------------------------- | --------- | ----------- | --------- | ----------- | ---- |
| `creatorHandlers.ts` — execute-plan ハンドラー    | 100%      | 100%        | \_%       | \_%         | —    |
| `RuntimeSkillCreatorFacade.ts` — `executeAsync()` | 90%+      | 80%+        | \_%       | \_%         | —    |
| `isExecutePlanAck` 型ガード                       | 100%      | 100%        | \_%       | \_%         | —    |

**手順**:

1. 各対象ファイルのカバレッジを確認する

```bash
# カバレッジレポートからファイル単位の数値を抽出
# HTML レポートまたはターミナル出力から読み取る
```

2. 関数単位のカバレッジを確認する
   - `creatorHandlers.ts` の execute-plan ハンドラー部分（行範囲を特定して確認）
   - `RuntimeSkillCreatorFacade.ts` の `executeAsync()` メソッド部分
   - `isExecutePlanAck` 関数

3. 目標未達の場合の対処:
   - 未カバー行・分岐を特定する
   - 追加テストが必要かを判断する
   - 追加テストを作成して再計測する

### タスク3: 未カバー行の分析

**目的**: カバレッジ目標未達の場合、未カバー行を特定して対処する。

**手順**:

1. カバレッジレポートで赤色（未カバー）の行を確認する

2. 未カバー行の分類:

| 分類                 | 対処方針                                  |
| -------------------- | ----------------------------------------- |
| テスト追加で対応可能 | Phase 6 に戻ってテスト追加                |
| 防御的コード         | `/* istanbul ignore next */` の使用を検討 |
| デッドコード         | リファクタリング対象として Phase 8 に記録 |

3. `/* istanbul ignore next */` を使用する場合は、必ず理由をコメントに記載する

```typescript
/* istanbul ignore next -- ウィンドウ破棄時の防御的チェック、テスト環境では再現困難 */
if (mainWindow.isDestroyed()) return;
```

### タスク4: カバレッジレポートの作成

**目的**: カバレッジ計測結果をレポートにまとめる。

**手順**:

1. `outputs/phase-7/coverage-report.md` を作成する
2. 以下の情報を含める:

```markdown
# カバレッジレポート

## 計測環境

- テストフレームワーク: Vitest
- カバレッジツール: v8 / istanbul（使用ツール名）
- 実行日時: YYYY-MM-DD HH:MM

## カバレッジ結果（変更対象ファイル限定）

| ファイル / 関数                             | Line | Branch | 目標Line | 目標Branch | 判定 |
| ------------------------------------------- | ---- | ------ | -------- | ---------- | ---- |
| creatorHandlers.ts (execute-plan handler)   | \_%  | \_%    | 100%     | 100%       | —    |
| RuntimeSkillCreatorFacade.ts (executeAsync) | \_%  | \_%    | 90%+     | 80%+       | —    |
| isExecutePlanAck                            | \_%  | \_%    | 100%     | 100%       | —    |

## 未カバー行の分析

| ファイル | 行番号 | コード概要 | 未カバー理由 | 対処 |
| -------- | ------ | ---------- | ------------ | ---- |
| —        | —      | —          | —            | —    |

## 追加テスト（カバレッジ改善のために追加した場合）

| テストケース | 対象ファイル | カバー行 |
| ------------ | ------------ | -------- |
| —            | —            | —        |
```

## 参照資料

| 資料名             | パス                                       | 説明                    |
| ------------------ | ------------------------------------------ | ----------------------- |
| Phase 6 テスト成果 | `outputs/phase-6/test-expansion-report.md` | 追加テスト一覧          |
| Phase 4 テスト設計 | `outputs/phase-4/`                         | TC-T2-01〜TC-T2-07 設計 |
| Vitest 設定        | `apps/desktop/vitest.config.ts`            | カバレッジ設定          |

### システム仕様（aiworkflow-requirements）

> カバレッジ計測結果が仕様上の重要パスを網羅していることを確認してください。

| 参照資料           | パス                                                                  | 内容                             |
| ------------------ | --------------------------------------------------------------------- | -------------------------------- |
| IPC Bridge 仕様    | `.claude/skills/aiworkflow-requirements/references/api-ipc-bridge.md` | fire-and-forget の正常・異常パス |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラー伝播の全パス               |

## 統合テスト連携

Phase 7 ではカバレッジ計測が主体。統合テストのカバレッジは計測対象外とし、単体テストのカバレッジのみを検証する。

| 確認項目                     | コマンド                                                |
| ---------------------------- | ------------------------------------------------------- |
| カバレッジ付きテスト実行     | `pnpm --filter @repo/desktop vitest run --coverage`     |
| 特定ファイルのカバレッジ確認 | カバレッジレポート（HTML/テキスト）で対象ファイルを確認 |

## 多角的チェック観点

| 観点               | 適用判断                                             | 仕様参照先          |
| ------------------ | ---------------------------------------------------- | ------------------- |
| エラーハンドリング | エラーパスのカバレッジが十分か                       | `error-handling.md` |
| IPC通信            | 正常・異常・タイムアウトの各パスがカバーされているか | `api-ipc-bridge.md` |
| 型安全性           | 型ガードの全分岐がカバーされているか                 | —                   |

## 成果物

| 成果物             | パス                                 | 説明                                   |
| ------------------ | ------------------------------------ | -------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・未カバー行分析・目標達成判定 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop vitest run --coverage` が正常に完了
- [ ] `creatorHandlers.ts` execute-plan ハンドラーの Line 100%、Branch 100% を達成（または未達理由を記録）
- [ ] `RuntimeSkillCreatorFacade.ts` `executeAsync()` の Line 90%+、Branch 80%+ を達成（または未達理由を記録）
- [ ] `isExecutePlanAck` の Line 100%、Branch 100% を達成
- [ ] 未カバー行が存在する場合、理由と対処方針が記録されている
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング — [phase-8-refactoring.md](phase-8-refactoring.md)
