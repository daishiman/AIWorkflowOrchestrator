# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 8               |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

動作を変えずにコード品質を改善する。

## 使用スキル

| スキル                 | 選定理由                       |
| ---------------------- | ------------------------------ |
| `refactoring-patterns` | リファクタリングパターンの適用 |
| `code-smell-detection` | コードスメルの検出と改善       |
| `solid-principles`     | SOLID原則への準拠確認          |

## 参照資料

| 資料名     | パス                                                        | 説明          |
| ---------- | ----------------------------------------------------------- | ------------- |
| 実装コード | `packages/shared/src/services/logging/conversion-logger.ts` | Phase 5成果物 |
| 型定義     | `packages/shared/src/services/logging/types.ts`             | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 変換処理仕様     | `.claude/skills/aiworkflow-requirements/references/conversion.md` | 変換処理の全体フロー       |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md`   | テーブル設計・リレーション |
| 型定義仕様       | `.claude/skills/aiworkflow-requirements/references/types.md`      | 共通型定義パターン         |

## 実行手順

### ステップ1: コードスメル検出

`code-smell-detection` スキルを使用して、以下を検出:

- 長いメソッド
- 重複コード
- 不適切な命名
- マジックナンバー

### ステップ2: SOLID原則チェック

`solid-principles` スキルを使用して、以下を確認:

- SRP: 各クラス/関数が単一責務か
- OCP: 拡張に対して開いているか
- LSP: 代替可能性が保たれているか
- ISP: インターフェースが適切に分割されているか
- DIP: 抽象に依存しているか

### ステップ3: リファクタリング実行

`refactoring-patterns` スキルを使用して、検出された問題を改善:

- Extract Method
- Rename Variable
- Replace Magic Number with Named Constant
- Introduce Parameter Object

### ステップ4: テスト継続成功確認

```bash
pnpm --filter @repo/shared test:run
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/shared test:run
```

| 確認項目             | 結果 |
| -------------------- | ---- |
| 全ユニットテスト成功 | [ ]  |
| 全統合テスト成功     | [ ]  |
| カバレッジ維持       | [ ]  |

## 成果物

| 成果物               | パス                                    | 説明           |
| -------------------- | --------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`    | 実施内容の記録 |
| コードレビュー結果   | `outputs/phase-8/code-review-result.md` | 品質確認結果   |

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 命名が適切
- [ ] SOLID原則に準拠
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全スキルを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. code-smell-detectionスキルの実行
3. solid-principlesスキルの実行
4. refactoring-patternsスキルの実行
5. リファクタリングの実施
6. テスト継続成功の確認
7. リファクタリング記録の作成
8. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 8
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル               | 結果                        | 備考                        |
| -------------------- | --------------------------- | --------------------------- |
| refactoring-patterns | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| code-smell-detection | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| solid-principles     | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 9: 品質保証
