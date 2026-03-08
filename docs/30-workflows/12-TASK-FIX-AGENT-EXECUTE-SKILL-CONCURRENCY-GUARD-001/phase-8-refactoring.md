# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 8                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 5で実装したガードコードの品質を確認し、コード品質改善の余地を検討する。変更量が極めて少ないため、大規模なリファクタリングは不要と想定されるが、コードの一貫性と可読性を確認する。

## 実行タスク

- コード一貫性確認: 追加したガードパターンが既存コードスタイルと一致しているか確認
- 命名規約確認: 変数名・コメントが規約に準拠しているか確認
- 不要コード確認: 実装により不要になったコードがないか確認

## 参照資料

| 資料名           | パス                                                   | 説明           |
| ---------------- | ------------------------------------------------------ | -------------- |
| コード品質ルール | `.claude/rules/02-code-quality.md`                     | 命名規約等     |
| Phase 5 実装     | `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 実装済みコード |

### システム仕様（aiworkflow-requirements）

- `architecture-implementation-patterns.md`: コードパターンの一貫性基準

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

### ステップ1: Store層コードレビュー

1. `executeSkill` 関数内の `isExecuting` ガードが以下を満たすか確認:
   - コメントが簡潔かつ目的を説明している
   - `get()` の分割代入が既存パターンと一致している
   - early returnのスタイルが関数内の他のガード（`!selectedSkillName`）と統一されている

2. 確認項目:

| チェック項目                                      | 期待                                                |
| ------------------------------------------------- | --------------------------------------------------- |
| `isExecuting` が `get()` の分割代入に含まれている | `const { selectedSkillName, isExecuting } = get();` |
| ガードの if 文スタイル                            | 既存の `if (!selectedSkillName) return;` と統一     |
| コメントの有無                                    | ガードの目的を1行コメントで記述                     |

### ステップ2: UI層コードレビュー

1. disabled制御の実装が以下を満たすか確認:
   - `isExecuting` の取得が個別セレクタ経由である（P31対策）
   - disabled属性とスタイルが一貫している
   - テキスト変更が適切なローカライズパターンに従っている

### ステップ3: テストコードレビュー

1. テストコードの品質を確認:
   - テスト名が `it("should ...")` パターンに統一されている
   - `beforeEach` でモックが毎回同一手順でリセットされている（P9対策）
   - テスト間で状態が共有されていない

### ステップ4: リファクタリング実施

**想定される変更:**

- 変更量が極めて少ない（2行追加 + UI数行）ため、大規模リファクタリングは不要
- コメントの微調整やスタイル統一のみ実施する

**リファクタリング後のテスト確認:**

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

## 統合テスト連携（Phase 1〜11は必須）

- リファクタリング後に全テスト（T-01〜T-12）がPASSすることを確認
- 既存テストに回帰がないことを確認

## 成果物

| 成果物               | パス                                                                                             | 説明           |
| -------------------- | ------------------------------------------------------------------------------------------------ | -------------- |
| リファクタリング記録 | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-8-refactoring.md` | 本ドキュメント |

## 完了条件

- [ ] Store層のガードコードが既存コードスタイルと一致している
- [ ] UI層のdisabled制御が命名規約・スタイルガイドに準拠している
- [ ] テストコードがテスト設計規約に準拠している（P9対策含む）
- [ ] リファクタリング後に全テストがPASSしている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質検証
