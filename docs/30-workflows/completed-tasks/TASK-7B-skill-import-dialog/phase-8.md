# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 8                           |
| 機能名 | TASK-7B-skill-import-dialog |
| 作成日 | 2026-01-30                  |

## 目的

動作を変えずにSkillImportDialogのコード品質を改善する。

## 実行タスク

- コードスメル検出: 問題のあるコードパターンの特定と修正
- コンポーネント整理: Section/ResourceListの分割検討
- 命名改善: 変数名・関数名の明確化
- 重複排除: 繰り返しパターンの共通化

## リファクタリング候補

| 項目                                   | 現状                         | 改善案                                 |
| -------------------------------------- | ---------------------------- | -------------------------------------- |
| サブリソースセクションの繰り返し       | 6つの類似条件ブロック        | 配列マッピングで共通化                 |
| ESCキーハンドラー                      | インラインuseEffect          | カスタムHook（useEscapeKey）に抽出     |
| フォーカストラップ                     | インラインuseEffect          | カスタムHook（useFocusTrap）に抽出     |
| Section/ResourceListの同一ファイル配置 | 1ファイル内に3コンポーネント | 必要に応じて分割（コード量による判断） |

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillImportDialog"
```

## 実行手順

### 1. コードスメル分析

現在のSkillImportDialog.tsxを精査し、改善可能な箇所を特定する。

### 2. リファクタリング実施

テストが通る状態を維持しながら、以下の改善を検討・実施する:

- サブリソースセクションの共通化

```typescript
const resourceSections = [
  { key: "agents", title: "サブエージェント (agents/)", data: skill.agents },
  { key: "references", title: "参照資料 (references/)", data: skill.references },
  { key: "scripts", title: "スクリプト (scripts/)", data: skill.scripts },
  { key: "assets", title: "アセット (assets/)", data: skill.assets },
  { key: "schemas", title: "スキーマ (schemas/)", data: skill.schemas },
  { key: "indexes", title: "インデックス (indexes/)", data: skill.indexes },
];

{resourceSections
  .filter(({ data }) => data.length > 0)
  .map(({ key, title, data }) => (
    <Section key={key} title={`${title} - ${data.length}件`}>
      <ResourceList resources={data} />
    </Section>
  ))}
```

### 3. テスト再実行

```bash
pnpm --filter @repo/desktop test
```

## 成果物

リファクタリング後の更新済みコードファイル。

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複パターンが排除されている
- [ ] ESLint/TypeScriptエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. コードスメル分析の実施
2. リファクタリング候補の特定
3. リファクタリング実施
4. テスト再実行とGreen確認
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7B-skill-import-dialog --phase 8
```

## 次のPhase

Phase 9: 品質保証
