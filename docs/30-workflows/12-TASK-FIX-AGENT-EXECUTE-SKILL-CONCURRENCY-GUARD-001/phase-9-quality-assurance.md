# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 9                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Lint・TypeScript型チェック・全テスト実行を行い、実装がプロジェクトの品質基準を満たしていることを検証する。

## 実行タスク

- ESLint実行: 変更ファイルに対するLint検証
- TypeScript型チェック: プロジェクト全体の型整合性確認
- 全テスト実行: agentSlice関連テストおよびプロジェクト全体のテスト実行

## 参照資料

| 資料名               | パス                                  | 説明                |
| -------------------- | ------------------------------------- | ------------------- |
| コード品質ルール     | `.claude/rules/02-code-quality.md`    | Lint/型チェック基準 |
| Git/ツーリングルール | `.claude/rules/07-git-and-tooling.md` | コミット前チェック  |

### システム仕様（aiworkflow-requirements）

- 該当なし（品質基準は `.claude/rules/` に定義）

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: ESLint実行

```bash
cd apps/desktop && pnpm lint
```

**確認事項:**

- [ ] 変更ファイル（agentSlice.ts、UIコンポーネント）にLintエラーがない
- [ ] 新規テストファイルにLintエラーがない
- [ ] 未使用importが残っていない

### ステップ2: TypeScript型チェック

```bash
pnpm typecheck
```

**確認事項:**

- [ ] `get()` の分割代入に `isExecuting` を追加したことによる型エラーがない
- [ ] `useIsExecuting()` セレクタの戻り値型が `boolean` である
- [ ] UIコンポーネントの `disabled` 属性に型エラーがない

### ステップ3: agentSlice関連テスト実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice
```

**確認事項:**

- [ ] T-01〜T-12（並行実行ガードテスト）が全てPASS
- [ ] 既存のagentSliceテストが全てPASS
- [ ] テスト実行時間が異常に長くない（無限ループの兆候なし）

### ステップ4: プロジェクト全体テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

**確認事項:**

- [ ] 全テストがPASS
- [ ] 他のSlice/コンポーネントに回帰がない

## 統合テスト連携（Phase 1〜11は必須）

- agentSlice関連の全テストファイルが実行対象に含まれることを確認
- UI層テスト（コンポーネントテスト）も実行対象に含まれることを確認

## 成果物

| 成果物       | パス                                                                                                   | 説明           |
| ------------ | ------------------------------------------------------------------------------------------------------ | -------------- |
| 品質検証記録 | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-9-quality-assurance.md` | 本ドキュメント |

## 完了条件

- [ ] ESLintが変更ファイルに対してエラーなしで通過する
- [ ] TypeScript型チェックがプロジェクト全体でエラーなしで通過する
- [ ] agentSlice関連の全テストがPASSする
- [ ] プロジェクト全体のテストがPASSする（回帰なし）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー
