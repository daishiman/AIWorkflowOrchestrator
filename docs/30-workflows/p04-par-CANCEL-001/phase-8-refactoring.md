# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 8                       |
| Phase名    | リファクタリング        |
| 対象機能   | TASK-SW-CANCEL-001      |
| 前提Phase  | Phase 7: カバレッジ確認 |
| 次Phase    | Phase 9: 品質保証       |
| ステータス | 未実施                  |
| 作成日     | 2026-04-16              |

## 目的

Phase 5 で実装した `SKILL_CREATOR_CANCEL` チャンネル定数追加のコードを、
命名・コメント・配置の観点で再調整する。
テストが全て Green であることを維持しながらコードを整理する。

## 実行タスク

### Task 1: コード品質チェック

実装コードを以下の観点で確認する。

| 観点             | チェック内容                                                  |
| ---------------- | ------------------------------------------------------------- |
| 命名の明確性     | `SKILL_CREATOR_CANCEL` という定数名が意図を正確に表しているか |
| 値の一貫性       | `"skill-creator:cancel"` が既存の命名規則に従っているか       |
| コメントの適切性 | チャンネルの用途（キャンセル処理IPC連携）が明記されているか   |
| 配置の適切性     | `SKILL_CREATOR_RUNTIME_CHANNELS` 内の末尾に配置されているか   |

### Task 2: 命名と構造の整理

追加した定数を確認し、以下を整理する。

- `SKILL_CREATOR_CANCEL` の値が `"skill-creator:cancel"` であることを示す適切なコメントがあるか
- 既存3件のチャンネル定数と同じインデント・スタイルで記述されているか
- コメントが JSDoc スタイルか行コメントかを既存に合わせているか

### Task 3: リファクタリング後のテスト全件確認

```bash
# 全テスト Green 確認
pnpm --filter @repo/shared test -- --testPathPattern="channels"

# Preload 側型チェック（自動有効化の維持確認）
pnpm --filter @repo/desktop typecheck
```

リファクタリング後も全テストが Green であることを確認する。

### Task 4: 技術的負債の記録

| 負債ID | 内容                                                  | 対応タスク                |
| ------ | ----------------------------------------------------- | ------------------------- |
| TD-001 | `SKILL_CREATOR_CANCEL` チャンネルのハンドラーが未実装 | TASK-SW-CANCEL-003 で対応 |
| TD-002 | Preload API の `cancelGeneration` メソッドが未実装    | TASK-SW-CANCEL-002 で対応 |
| TD-003 | renderer 側 `useCancelGeneration` の IPC 接続が未実装 | TASK-SW-CANCEL-004 で対応 |

## 参照資料

- `outputs/phase-7/TASK-SW-CANCEL-001-coverage-report.md` — カバレッジ確認結果
- `outputs/phase-5/TASK-SW-CANCEL-001-implementation-plan.md` — 実装内容

## 統合テスト連携

- リファクタリング後も `packages/shared` の外部型定義が変わらないことを確認する

## 成果物

| 成果物                                   | パス                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| TASK-SW-CANCEL-001-refactoring-record.md | `outputs/phase-8/TASK-SW-CANCEL-001-refactoring-record.md` |

## 完了条件

- [ ] コード品質チェック（Task 1）が完了している
- [ ] 命名と構造の整理（Task 2）が完了している
- [ ] リファクタリング後の全テストが Green である
- [ ] 技術的負債が記録されている

## タスク100%実行確認【必須】

- [ ] Task 1（コード品質チェック）を100%実行した
- [ ] Task 2（命名と構造の整理）を100%実行した
- [ ] Task 3（リファクタリング後のテスト全件確認）を100%実行した
- [ ] Task 4（技術的負債の記録）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-refactoring-record.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
