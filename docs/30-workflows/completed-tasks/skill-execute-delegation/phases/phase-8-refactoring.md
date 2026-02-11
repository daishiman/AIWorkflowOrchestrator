# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 8                                     |
| 機能名   | skill-execute-delegation              |
| 作成日   | 2026-02-10                            |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |

## 目的

動作を変えずにコード品質を改善する。SkillService.executeSkill()とSkillExecutorの統合コードにおいて、可読性・保守性・テスト容易性を向上させる。

## 実行タスク

- リファクタリング: コード構造の改善（重複排除、命名改善、構造整理）
- コードスメル検出: 問題のあるコードパターンの特定と修正
- SOLID原則適用: 設計原則に基づくコード改善
- 責務分離: SkillServiceとSkillExecutorの責務を明確に分離

## 参照資料

| 資料名             | パス                                                    | 説明                 |
| ------------------ | ------------------------------------------------------- | -------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`                    | Phase 7成果物        |
| 設計書             | `outputs/phase-2/architecture-design.md`                | Phase 2成果物        |
| SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`  | リファクタリング対象 |
| SkillExecutor      | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | リファクタリング対象 |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                      | 品質基準             |

## リファクタリング観点

### 1. 責務分離（Single Responsibility Principle）

| コンポーネント | 期待される責務                                       |
| -------------- | ---------------------------------------------------- |
| SkillService   | スキルのライフサイクル管理、バリデーション、状態管理 |
| SkillExecutor  | スキル実行エンジン、SDK連携、ストリーミング処理      |
| IPC Handler    | リクエスト受付、レスポンス返却、エラー変換           |

### 2. コードスメル検出項目

| スメル           | 検出方法                       | 修正アプローチ           |
| ---------------- | ------------------------------ | ------------------------ |
| 長いメソッド     | 20行以上のメソッド             | メソッド分割             |
| 重複コード       | 類似ロジックの複数箇所存在     | 共通関数への抽出         |
| マジックナンバー | ハードコードされた数値・文字列 | 定数への抽出             |
| 不適切な命名     | 意図が不明確な変数・関数名     | 意図を反映した命名       |
| 深いネスト       | 3レベル以上のネスト            | 早期リターン、ガード句   |
| 過剰なパラメータ | 4つ以上のパラメータ            | オブジェクトパラメータ化 |

### 3. SOLID原則適用チェック

| 原則 | 確認項目                                               | 状態       |
| ---- | ------------------------------------------------------ | ---------- |
| SRP  | 各クラス/関数が単一責務を持つ                          | {{STATUS}} |
| OCP  | 拡張に対して開いており、修正に対して閉じている         | {{STATUS}} |
| LSP  | 派生型が基底型の代替として使用可能                     | {{STATUS}} |
| ISP  | インターフェースが適切に分離されている                 | {{STATUS}} |
| DIP  | 高レベルモジュールが低レベルモジュールに依存していない | {{STATUS}} |

## 実行手順

### 1. コードスメル検出

```bash
# ESLint複雑度チェック
pnpm --filter @repo/desktop lint -- --rule 'complexity: ["error", 10]'

# 重複コード検出
pnpm dlx jscpd apps/desktop/src/main/services/skill/
```

### 2. リファクタリング実施

対象ファイル:

- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- `apps/desktop/src/main/ipc/handlers/skill-handlers.ts`

### 3. テスト継続成功確認

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillService|SkillExecutor"

# 統合テスト実行
pnpm --filter @repo/desktop test:integration

# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm test
pnpm test:integration
pnpm test:e2e
```

### 確認項目

| テストカテゴリ | 実行コマンド            | 結果       |
| -------------- | ----------------------- | ---------- |
| ユニットテスト | `pnpm test`             | {{RESULT}} |
| 統合テスト     | `pnpm test:integration` | {{RESULT}} |
| E2Eテスト      | `pnpm test:e2e`         | {{RESULT}} |

## タスク固有のリファクタリング対象

### SkillService.executeSkill() 委譲ロジック

#### Before（想定）

```typescript
// スタブコード（L214-216）
const output = `Skill "${skill.name}" executed successfully`;
```

#### After（期待）

```typescript
// SkillExecutorへの委譲
const result = await this.skillExecutor.execute(skill, options);
return result;
```

### 責務の明確化

| 処理               | 担当コンポーネント | 理由                           |
| ------------------ | ------------------ | ------------------------------ |
| スキル存在確認     | SkillService       | スキルライフサイクル管理の責務 |
| インポート状態確認 | SkillService       | 状態管理の責務                 |
| SDK呼び出し        | SkillExecutor      | 実行エンジンの責務             |
| ストリーミング処理 | SkillExecutor      | 実行エンジンの責務             |
| エラー変換・伝播   | IPC Handler        | 境界での責務                   |

## アーキテクチャ層別リファクタリング

| 層                 | リファクタリング観点                   | 完了       |
| ------------------ | -------------------------------------- | ---------- |
| Main Process       | SkillService/SkillExecutor の責務分離  | {{STATUS}} |
| IPC通信            | ハンドラーのエラー処理統一             | {{STATUS}} |
| 型定義             | 共有型の packages/shared への移動      | {{STATUS}} |
| エラーハンドリング | エラーコードの統一、メッセージの標準化 | {{STATUS}} |

## 成果物

| 成果物               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`     | 変更内容の記録 |
| コード品質レポート   | `outputs/phase-8/code-quality-report.md` | 品質改善結果   |

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 命名が明確になっている
- [ ] SkillServiceとSkillExecutorの責務が明確に分離されている
- [ ] SOLID原則に準拠している
- [ ] マジックナンバーが定数化されている
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] テストカバレッジが維持されていることを確認
```

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断              | 仕様参照先                                                         |
| ------------------ | --------------------- | ------------------------------------------------------------------ |
| アーキテクチャ     | ✅ SOLID原則準拠確認  | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| コード品質         | ✅ スメル検出・修正   | `.claude/rules/02-code-quality.md`                                 |
| 責務分離           | ✅ SRP適用確認        | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| エラーハンドリング | ✅ エラー処理の統一化 | `aiworkflow-requirements: error-handling.md`                       |

📖 詳細: `references/quality-standards.md` セクション8

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. コードスメル検出
3. リファクタリング実施
4. テスト継続成功確認
5. リファクタリング記録の作成
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-execute-delegation --phase 8
```

## 次のPhase

Phase 9: 品質保証
