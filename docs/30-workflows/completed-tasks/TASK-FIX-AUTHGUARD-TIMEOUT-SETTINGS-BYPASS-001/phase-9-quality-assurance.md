# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 9                                              |
| Phase名    | 品質検証                                       |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 8                                        |
| 後続Phase  | Phase 10                                       |

## 目的

Lint・型チェック・全テスト実行により、コード品質がプロジェクト基準を満たしていることを確認する。

## 実行タスク

- タスク1: ESLint を実行して規約違反の有無を確認する
- タスク2: TypeScript 型チェックで型契約の破綻を検出する
- タスク3: 全テストを実行して回帰を確認する
- タスク4: shared / desktop のビルド成功を確認する

### タスク1: ESLint 実行

**目的**: コーディング規約違反がないことを確認する

**手順**:

```bash
pnpm lint
```

**確認項目**:

- [ ] ESLint エラーが0件であること
- [ ] ESLint 警告が新規追加されていないこと

### タスク2: TypeScript 型チェック

**目的**: 型エラーがないことを確認する

**手順**:

```bash
pnpm typecheck
```

**確認項目**:

- [ ] TypeScript エラーが0件であること
- [ ] `AuthGuardDisplayState` の拡張により既存コードで型エラーが発生していないこと
- [ ] `getAuthState` の `isTimedOut` パラメータ追加による呼び出し元エラーがないこと

**特に確認すべきファイル**:

- `getAuthState` を呼び出している全箇所（`useAuthState.ts` 以外にないか `grep` で確認）
- `AuthGuardDisplayState` を使用している全箇所

### タスク3: 全テスト実行

**目的**: 全テストが PASS することを確認する

**手順**:

```bash
cd apps/desktop && pnpm vitest run
```

**確認項目**:

- [ ] 全テストが PASS すること
- [ ] 新規テストが全て PASS すること
- [ ] 既存テストに失敗がないこと（回帰なし）

### タスク4: ビルド確認

**目的**: ビルドが成功することを確認する

**手順**:

```bash
pnpm --filter @repo/shared build && pnpm --filter @repo/desktop build
```

**確認項目**:

- [ ] shared パッケージのビルドが成功すること
- [ ] desktop パッケージのビルドが成功すること

## 参照資料

| 参照資料                 | パス                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-5-implementation.md` |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-8-refactoring.md`    |
| Git & ツーリングルール   | `.claude/rules/07-git-and-tooling.md`                                                                        |

### システム仕様（aiworkflow-requirements）

> 品質検証時に以下のシステム仕様を参照してください。

| 参照資料           | パス                                                                                        | 内容                                   |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| 実装パターン集     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | TypeScript型安全パターン・ESLintルール |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result型パターン・エラーカテゴリ       |

## 統合テスト連携

- 品質検証の全項目 PASS が Phase 10 への前提条件

## 成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| 品質検証結果 | `outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] ESLint エラーが0件であること
- [ ] TypeScript 型エラーが0件であること
- [ ] 全テストが PASS すること
- [ ] ビルドが成功すること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 10: 最終レビューへ進む。多角的品質・整合性検証を行う。
