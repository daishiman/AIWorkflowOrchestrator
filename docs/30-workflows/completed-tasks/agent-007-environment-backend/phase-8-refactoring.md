# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 8                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

動作を変えずにコード品質を改善する。

## 実行タスク

- コードスメル検出: 問題のあるコードパターンの特定
- リファクタリング: コード構造の改善（重複排除、命名改善、構造整理）
- SOLID原則適用: 設計原則に基づくコード改善

## 参照資料

| 資料名             | パス                                          | 説明          |
| ------------------ | --------------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`          | Phase 7成果物 |
| 実装コード         | `apps/desktop/src/main/services/environment/` | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                         | 内容               |
| -------------- | ---------------------------------------------------------------------------- | ------------------ |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Facadeパターン設計 |

## 実行手順

### 1. コードスメル検出

| コードスメル     | 確認対象                 | 結果 |
| ---------------- | ------------------------ | ---- |
| 重複コード       | 各サービスクラス         |      |
| 長いメソッド     | extractCodeBlocks等      |      |
| 過大なクラス     | EnvironmentService       |      |
| 未使用コード     | 全ファイル               |      |
| マジックナンバー | 正規表現、設定値         |      |
| 不適切な命名     | 変数、メソッド、クラス名 |      |

### 2. リファクタリング候補

#### 2.1 定数の抽出

````typescript
// Before
const regex = /```(\w+)?\n([\s\S]*?)```/g;

// After
const CODE_BLOCK_PATTERN = /```(\w+)?\n([\s\S]*?)```/g;
````

#### 2.2 DOMPurify設定の分離

```typescript
// Before: 設定がsanitizeHtml内に埋め込み

// After: 設定を定数として分離
const SANITIZER_CONFIG = {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base"],
  FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover", "onfocus"],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
} as const;
```

#### 2.3 型ガードの追加

```typescript
function isPreviewableType(type: ContentType): type is "html" | "markdown" {
  return type === "html" || type === "markdown";
}
```

### 3. SOLID原則確認

| 原則                            | 現状確認                           | 対応 |
| ------------------------------- | ---------------------------------- | ---- |
| 単一責任の原則 (SRP)            | 各サービスが単一責任を持つ         | ✅   |
| オープン/クローズドの原則 (OCP) | 拡張に対して開いている             | ✅   |
| リスコフの置換原則 (LSP)        | 該当なし                           | -    |
| インターフェース分離 (ISP)      | 必要なメソッドのみ公開             | ✅   |
| 依存性逆転の原則 (DIP)          | コンストラクタインジェクション検討 | 確認 |

### 4. リファクタリング後のテスト実行

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test

# 統合テスト
pnpm --filter @repo/desktop test:integration
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

## 成果物

| 成果物             | パス                                     | 説明         |
| ------------------ | ---------------------------------------- | ------------ |
| リファクタ記録     | `outputs/phase-8/refactoring-log.md`     | 実施内容     |
| コード品質レポート | `outputs/phase-8/code-quality-report.md` | 品質改善結果 |

## 完了条件

- [ ] コードスメルが特定され対応されている
- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 定数が適切に抽出されている
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. コードスメル検出
2. リファクタリング候補の特定
3. 定数の抽出
4. 設定の分離
5. 型ガードの追加
6. SOLID原則確認
7. リファクタリング後のテスト実行
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 8
```

## 次のPhase

Phase 9: 品質保証
