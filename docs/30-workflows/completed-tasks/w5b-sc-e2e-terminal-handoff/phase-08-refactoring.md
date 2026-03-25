# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 8                           |
| Phase名    | リファクタリング            |
| 前提Phase  | Phase 7                     |
| 後続Phase  | Phase 9                     |
| ステータス | 未実施                      |
| 作成日     | 2026-03-25                  |
| 機能名     | w5b-sc-e2e-terminal-handoff |
| タスクID   | TASK-SC-08-E2E-VALIDATION   |

---

## 目的

E2Eテストコードの品質を向上させ、テストヘルパーを共通化し、重複コードを排除する。TDD Refactor フェーズとして、テストが Green の状態を維持しながらコードの可読性と保守性を高める。

## 背景

TDD サイクルの Refactor フェーズに該当する。Phase 4〜7 で作成・拡充したE2Eテスト（シナリオA〜E + 拡充テスト）は全て Green（PASS）の状態にある。この Green を維持しながら、テストコードの内部品質を向上させる。

具体的な課題:

- シナリオ間で重複する `beforeEach` / `afterEach` セットアップ
- LLMモック生成パターンの散在
- アサーションロジックの重複
- `any` 型の残存（P48・P52 対策が不十分な箇所）

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストヘルパー共通化

**目的**: シナリオA〜Eで共通するセットアップ処理をヘルパーに集約する

**実行手順**:

1. `beforeEach` / `afterEach` のセットアップロジックをヘルパー関数に移動する
2. LLMモックファクトリ関数を整理する:
   - `createSuccessMock()`: 正常レスポンスを返すLLMモック
   - `createErrorMock()`: エラーレスポンスを返すLLMモック
   - `createTerminalHandoffMock()`: TerminalHandoff レスポンスを返すLLMモック
3. 各シナリオテストファイルからヘルパーをインポートして使用する

**期待される成果物**:

- 共通化されたテストヘルパーファイル

### タスク2: アサーションヘルパー整理

**目的**: テストアサーションを4種のヘルパーに統一する

**実行手順**:

1. 以下の4種のアサーションヘルパーを実装する:
   - `assertIpcSuccess(result)`: IPC成功レスポンスの検証（`success: true` + `data` フィールド確認）
   - `assertIpcError(result, expectedCode)`: IPCエラーレスポンスの検証（`success: false` + `error.code` 一致確認）
   - `assertTerminalHandoff(result)`: TerminalHandoff レスポンスの検証（`terminalHandoff.suggestedCommand` 存在・形式確認）
   - `assertPerformance(startTime, limitMs)`: パフォーマンス基準の検証（実行時間が `limitMs` 以内であること）
2. 既存テストの個別アサーションを上記ヘルパーで置き換える

**期待される成果物**:

- アサーションヘルパー4種の実装

### タスク3: テスト重複排除

**目的**: テストコードの重複を排除し可読性を向上させる

**実行手順**:

1. 類似したアサーションパターンを共通化する
2. テストデータ（フィクスチャ）を定数として抽出する（例: `TEST_SKILL_NAME`, `TEST_DESCRIPTION` など）
3. `describe` / `it` のネスト構造を整理し、テストの階層構造を明確にする

**期待される成果物**:

- フィクスチャ定数ファイル
- 整理されたテストファイル

### タスク4: 型安全性強化

**目的**: テストコード内の `any` 型を排除し、型安全性を向上させる

**実行手順**:

1. テストヘルパーの引数・戻り値の型を明確に定義する
2. `any` 型を全て排除する
3. `unknown` 型での受け取りと実行時検証パターンを採用する（P48・P52 対策）
4. 型ガード関数を必要に応じて追加する

**期待される成果物**:

- `any` 型が排除されたテストコード

### タスク5: リファクタリング後動作確認

**目的**: リファクタリングにより既存テストが壊れていないことを確認する

**実行手順**:

1. E2Eテストを実行する: `cd apps/desktop && pnpm vitest run src/test/e2e/`
2. 全テストが PASS であることを確認する
3. `pnpm --filter @repo/desktop typecheck` が通過することを確認する

**期待される成果物**:

- 全テスト PASS の証跡
- typecheck 通過の証跡

---

## TDD検証（Refactor）

リファクタリング後もテストが Green（全 PASS）であることを確認する。

**検証コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/test/e2e/
```

**判定基準**:

- 全テスト PASS: リファクタリング完了、Phase 9 へ
- いずれかが FAIL: リファクタリングに起因するバグを修正し、再度全テスト PASS を確認する

**注意**: リファクタリングでテストの振る舞い（what）を変更してはならない。変更するのは構造（how）のみ。

---

## 参照資料

| 参照資料           | パス                                 | 内容                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| Phase 5 実装       | `phase-05-implementation.md`         | E2Eテストインフラ・LLMモック     |
| Phase 6 テスト拡充 | `phase-06-test-coverage.md`          | 境界値・負荷・セキュリティテスト |
| コード品質規約     | `.claude/rules/02-code-quality.md`   | コーディング規約                 |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md` | P48（any排除）, P52（型安全性）  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                       | 内容                                        |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Skill Creator UI/UX仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` | TerminalHandoff経路・承認フロー・進捗UI仕様 |

---

## 成果物

| 成果物                     | パス                                                          | 内容                                             |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| テストヘルパー（共通化済） | `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts` | セットアップ・モック・アサーション・フィクスチャ |
| E2Eテスト（整理済）        | `apps/desktop/src/test/e2e/skill-creator-integration.test.ts` | リファクタリング済みテスト                       |
| TerminalHandoffテスト      | `apps/desktop/src/test/e2e/terminal-handoff.test.ts`          | リファクタリング済みテスト                       |

---

## 統合テスト連携

本Phase では以下の統合テスト連携アクションを実施する:

- リファクタリング後の全テスト PASS 確認（シナリオA〜E + 拡充テスト）
- テストヘルパーの共通化により、今後の統合テスト追加が容易になることを確認する
- IPCチャネル名（`skill-creator:execute-plan` 等）がテストヘルパー内で正しく参照されていることを確認する

---

## 完了条件

- [ ] テストヘルパーがシナリオ間で共通化されている
- [ ] アサーションヘルパー（4種: `assertIpcSuccess`, `assertIpcError`, `assertTerminalHandoff`, `assertPerformance`）が実装されている
- [ ] テストの重複コードが排除されている（フィクスチャ定数抽出済み）
- [ ] `any` 型が排除されている（`unknown` 型 + 実行時検証パターン採用）
- [ ] リファクタリング後も全テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が通過している

---

## Phase末端アクション

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] TDD検証（Refactor）: 全テスト Green を確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）完了、カバレッジ基準達成済み
- **後続**: Phase 9（品質検証）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- タスク1（テストヘルパー共通化）:
- タスク2（アサーションヘルパー整理）:
- タスク3（テスト重複排除）:
- タスク4（型安全性強化）:
- タスク5（リファクタリング後動作確認）:

### TDD Refactor 結果

- リファクタリング前テスト数:
- リファクタリング後テスト数:
- 全テスト PASS: Yes / No
- typecheck 結果: PASS / FAIL

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/w5b-sc-e2e-terminal-handoff/phase-09-quality-verification.md`
