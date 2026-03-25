# Phase 9: 品質保証

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 9                      |
| 機能名   | Skill Creator DI 配線  |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

Lint、型チェック、全テスト実行による品質検証を行う。

## 背景

Phase 8 のリファクタリング完了後、ESLint/TypeScript/Prettierの一括検証と品質ゲートのPASS確認を行う。

## 実行タスク

### Task 1: ESLint 検証

```bash
cd apps/desktop && pnpm lint
```

修正対象ファイル `apps/desktop/src/main/ipc/index.ts` に ESLint エラーがないことを確認する。

### Task 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm typecheck
```

以下を確認する:

- 追加した import が型として正しいこと
- `ILLMAdapter | undefined` の型互換性に問題がないこと
- `skillFileManager` が L701 のスコープから参照可能であること

### Task 3: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreator
```

既存テスト全件が PASS することを確認する。

### Task 4: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm prettier --check src/main/ipc/index.ts
```

## 参照資料

- `.claude/rules/02-code-quality.md`
- `.claude/rules/07-git-and-tooling.md`（コミット前チェックリスト）

## 成果物

- 品質検証結果（各コマンドの実行結果を記録）

## 完了条件

- [ ] ESLint がエラーなしで完了した
- [ ] TypeScript 型チェックがエラーなしで完了した
- [ ] RuntimeSkillCreatorFacade 関連テストが全て PASS した
- [ ] SkillCreatorHandlers 関連テストが全て PASS した
- [ ] Prettier フォーマットチェックが PASS した

## 統合テスト連携

ESLint/TypeScript/Prettier/全テストの一括検証。品質保証で統合テスト結果を確認する。

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] RuntimeSkillCreatorFacade 関連テスト全件成功
- [ ] SkillCreatorHandlers 関連テスト全件成功

#### コード品質

- [ ] ESLint エラーなし
- [ ] TypeScript 型チェックエラーなし
- [ ] Prettier フォーマットチェック PASS

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. ESLint 検証（Task 1）
2. TypeScript 型チェック（Task 2）
3. 全テスト実行（Task 3）
4. Prettier フォーマット確認（Task 4）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w4a-sc-ipc-di-wiring --phase 9
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク                            | 結果 | 備考 |
| --------------------------------- | ---- | ---- |
| Task 1: ESLint 検証               | -    | -    |
| Task 2: TypeScript 型チェック     | -    | -    |
| Task 3: 全テスト実行              | -    | -    |
| Task 4: Prettier フォーマット確認 | -    | -    |

### 発見事項

- 良かった点: -
- 問題点: -
- 改善提案: -

### 次Phaseへの引き継ぎ事項

- -

## 次のPhase

Phase 10: 最終レビュー
