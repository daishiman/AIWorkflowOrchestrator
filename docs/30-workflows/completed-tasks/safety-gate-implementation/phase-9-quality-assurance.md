# Phase 9: 品質検証

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 9                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

Phase 8 のリファクタリング後のコードに対して Lint・TypeScript型チェック・全テスト実行を順番に行い、品質基準（ESLint エラー0件・型エラー0件・テスト全PASS）を満たすことを確認する。

## 実行タスク

### Task 1: ESLint実行

以下のコマンドを実行し、エラーが0件であることを確認する:

```bash
pnpm --filter @repo/desktop lint
```

#### 1-1. 確認項目

| チェック対象                           | 判定基準                                       |
| -------------------------------------- | ---------------------------------------------- |
| `no-unused-vars`                       | 未使用import・変数が0件                        |
| `no-explicit-any`                      | `any` 型の使用が0件                            |
| `@typescript-eslint/naming-convention` | `skillName` パラメータが命名規則に準拠している |
| `import/no-unresolved`                 | 全importパスが解決可能                         |

#### 1-2. エラー対処フロー

- エラーが検出された場合: エラーメッセージの内容に応じて対象ファイルを修正し、再実行する
- 自動修正可能なエラー: `pnpm --filter @repo/desktop lint --fix` を使用して修正する
- 自動修正不可のエラー: 手動でコードを修正した後に再実行する

### Task 2: TypeScript型チェック

以下のコマンドを実行し、型エラーが0件であることを確認する:

```bash
pnpm --filter @repo/desktop typecheck
```

#### 2-1. 特にチェックすべき型安全ポイント

| 確認ポイント                                       | 根拠                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `SafetyCheckId` のユニオン型が網羅されているか     | `Record<SafetyCheckId, ...>` パターンで全5種が漏れなく扱われていること（P02準拠） |
| `any` 型の使用がないか                             | `02-code-quality.md` の型安全ルール準拠                                           |
| `@ts-ignore` / `@ts-expect-error` がないか         | 使用する場合は理由コメントが必須（`02-code-quality.md`準拠）                      |
| non-null assertion (`!`) がないか                  | P48・P52準拠、optional chaining または実行時検証に置換する                        |
| IPC ハンドラの引数型が `string` に固定されているか | P44準拠、オブジェクト形式と単一文字列の混在防止                                   |

#### 2-2. 型エラー対処フロー

- 型エラーが発生した場合: エラーメッセージとファイル・行番号を確認し、型アサーション（`as`）ではなく実行時検証で対処する
- `unknown` 型への変換が必要な箇所: `Array.isArray()` または `typeof` チェックを先行させる

### Task 3: 全テスト実行

以下のコマンドを実行し、テストが全件PASSすることを確認する:

```bash
pnpm --filter @repo/desktop test
```

#### 3-1. 対象テストファイルと期待カバレッジ

| テストファイル                                                  | 最低カバレッジ基準（Line/Function） |
| --------------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | Line: 80% 以上 / Function: 80% 以上 |
| `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | Line: 80% 以上 / Function: 80% 以上 |

カバレッジが基準未達の場合は Phase 6 に戻り、テストを追加してから再度 Phase 9 を実行する。

#### 3-2. テスト失敗対処フロー

| 失敗パターン                         | 対処方法                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| Phase 8 のリファクタリングによる失敗 | `git diff` で変更差分を確認し、意図しない変更を元に戻す                       |
| モック設定の問題                     | `beforeEach` のリセット処理を確認し、テスト間の状態リークを修正する（P9準拠） |
| タイマーテストの無限ループ           | `runAllTimers` を `advanceTimersByTime` に変更する（P13準拠）                 |
| happy-dom環境でのuserEvent失敗       | `userEvent` を `fireEvent` に変更する（P39準拠）                              |

### Task 4: セキュリティチェック

以下の項目を手動で確認する:

#### 4-1. P42 準拠3段バリデーション確認

`apps/desktop/src/main/ipc/handlers/safety-gate.ts` の `skill:evaluate-safety` ハンドラで、以下の3段バリデーションが実装されていることを確認する:

```typescript
// 確認基準: 以下の3条件が全て含まれていること
typeof skillName !== "string" || // 1. 型チェック
  skillName === "" || // 2. 空文字列チェック
  skillName.trim() === ""; // 3. トリム空文字列チェック
```

#### 4-2. P27 チャンネル名定数管理確認

以下のコマンドでチャンネル文字列のハードコードがないことを確認する:

```bash
grep -rn '"skill:evaluate-safety"' apps/desktop/src/main/
grep -rn '"skill:evaluate-safety"' apps/desktop/src/preload/
```

チャンネル名は `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` のみで参照されていること。上記grepで結果が0件であることを確認する。

#### 4-3. P44/P45 IPC引数命名・インターフェース確認

| 確認項目                                        | 確認方法                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| ハンドラ引数型が `string`（単一）であること     | `safety-gate.ts` の `ipcMain.handle` 第3引数を目視確認                          |
| Preload側も同じ型で呼び出していること           | `types.ts` の `evaluateSafety(skillName: string)` シグネチャを確認              |
| パラメータ名が `skillName` で統一されていること | `grep -n "skillId" apps/desktop/src/main/ipc/handlers/safety-gate.ts` で0件確認 |

#### 4-4. 送信元ウィンドウ検証確認

`safety-gate.ts` の IPCハンドラ内で `validateIpcSender(event)` が呼び出されていることを確認する:

```bash
grep -n "validateIpcSender" apps/desktop/src/main/ipc/handlers/safety-gate.ts
```

1件以上ヒットすること。

### Task 5: any型使用の検出と除去

以下のコマンドで `any` 型の使用箇所を検出する:

```bash
grep -n "any" apps/desktop/src/main/permissions/default-safety-gate.ts
grep -n "any" apps/desktop/src/main/ipc/handlers/safety-gate.ts
```

型引数・ジェネリクスでの正当な `any` 使用（例: `Promise<any>`）と不適切な `any` 使用を区別し、不適切な箇所は具体的な型に置換する。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容                                        |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | IPC セキュリティ原則                        |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 型安全パターン、テスト戦略                  |
| IPC設計          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | P27チャンネル定数確認・ハンドラ設計パターン |

### タスク固有参照

| 参照資料           | パス                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md` (P9, P13, P27, P39, P42, P44, P45, P48, P52) |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                           |

## 実行手順

### ステップ1: ESLint実行（Task 1）

1. `pnpm --filter @repo/desktop lint` を実行する
2. `no-unused-vars`, `no-explicit-any`, 命名規則, importパスの4項目を確認する
3. エラーがあれば `--fix` で自動修正、不可のものは手動修正後に再実行する

### ステップ2: TypeScript型チェック（Task 2）

1. `pnpm --filter @repo/desktop typecheck` を実行する
2. `SafetyCheckId` ユニオン型網羅、`any` 型0件、non-null assertion 0件、IPC引数型を確認する
3. 型エラーは実行時検証（`Array.isArray()` / `typeof`）で対処する

### ステップ3: 全テスト実行（Task 3）

1. `pnpm --filter @repo/desktop test` を実行する
2. Line Coverage 80%以上、Function Coverage 80%以上を確認する
3. 未達の場合は Phase 6 に戻る

### ステップ4: セキュリティチェック（Task 4）

1. P42 準拠3段バリデーションの存在を確認する
2. `grep -rn '"skill:evaluate-safety"'` でハードコード0件を確認する（P27）
3. P44/P45 IPC引数命名・インターフェース整合を確認する
4. `validateIpcSender` の呼び出しを確認する

### ステップ5: any型検出と除去（Task 5）

1. `grep -n "any"` で不適切な any 使用を検出する
2. 具体的な型に置換する

### ステップ6: 品質ゲート一括判定

全ステップ完了後、以下の品質ゲートを一括判定する:

| ゲート項目                     | 基準         | 結果 |
| ------------------------------ | ------------ | ---- |
| ESLint エラー件数              | 0件          | -    |
| TypeScript 型エラー件数        | 0件          | -    |
| テスト PASS 率                 | 100%         | -    |
| Line Coverage（2ファイル）     | 各 80% 以上  | -    |
| Function Coverage（2ファイル） | 各 80% 以上  | -    |
| `any` 型不適切使用             | 0件          | -    |
| P42 3段バリデーション          | 実装確認済み | -    |
| P27 チャンネルハードコード     | 0件          | -    |
| P44/P45 引数整合               | 確認済み     | -    |
| `validateIpcSender` 呼び出し   | 1件以上      | -    |

全ゲートが基準を満たした場合のみ Phase 9 完了とする。1件でも未達の場合は対応 Phase に戻って修正する。

## 統合テスト連携

- 品質検証でエラーが検出された場合、修正対象 Phase（Phase 5〜8）に戻って修正する
- カバレッジ基準未達の場合のみ Phase 6 に戻る（それ以外の修正は現 Phase 内で完結する）

## 多角的チェック観点（AIが判断）

| 観点           | 確認項目                                                               | 仕様参照先                                                         |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ   | P42 3段バリデーション、P27 チャンネル定数、P44/P45 IPC引数、送信元検証 | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ | DI 境界維持、レイヤー依存方向（Renderer→Preload→Main）の維持確認       | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| テスタビリティ | テスト間状態リーク防止（P9）、Line/Function Coverage 80%以上           | `aiworkflow-requirements: testing-component-patterns.md`           |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                                                          | 仕様参照先                                          |
| -------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------- |
| バックエンド（Main） | DefaultSafetyGate の型安全（`any` 型0件、non-null assertion 0件）                 | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | `skill:evaluate-safety` ハンドラの P42 準拠・P27 チャンネル定数・P44/P45 整合確認 | `aiworkflow-requirements: api-ipc-system.md`        |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Task 1: ESLint 実行（エラー0件確認）
2. Task 2: TypeScript 型チェック（エラー0件確認）
3. Task 3: 全テスト実行（全件 PASS・カバレッジ確認）
4. Task 4: セキュリティチェック（P42/P27/P44/P45/validateIpcSender）
5. Task 5: any 型使用の検出と除去
6. 品質ゲート一括判定（全ゲート基準充足の確認）
7. 成果物の作成・配置
8. 完了条件の検証

## 成果物

| 成果物            | パス                                          |
| ----------------- | --------------------------------------------- |
| 品質検証レポート  | `outputs/phase-9/quality-assurance-report.md` |
| ESLint実行ログ    | `outputs/phase-9/lint-results.txt`            |
| TypeCheck実行ログ | `outputs/phase-9/typecheck-results.txt`       |
| テスト実行ログ    | `outputs/phase-9/test-results.txt`            |

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` でエラーが0件である
- [ ] `pnpm --filter @repo/desktop typecheck` でエラーが0件である
- [ ] `pnpm --filter @repo/desktop test` で対象テストが全件PASSする
- [ ] `default-safety-gate.test.ts` の Line Coverage が 80% 以上である
- [ ] `default-safety-gate.test.ts` の Function Coverage が 80% 以上である
- [ ] `safety-gate.test.ts` (IPCハンドラ) の Line Coverage が 80% 以上である
- [ ] `safety-gate.test.ts` (IPCハンドラ) の Function Coverage が 80% 以上である
- [ ] `any` 型の不適切な使用が0件である
- [ ] P42 準拠3段バリデーションが実装されていることを確認済みである
- [ ] P27 チャンネル名ハードコードが0件であることを確認済みである
- [ ] P44/P45 IPC引数命名・インターフェース整合が確認済みである
- [ ] 送信元ウィンドウ検証 `validateIpcSender` が呼び出されていることを確認済みである

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 9
```

## 次Phase

Phase 10: 最終レビュー → `phase-10-final-review.md`
