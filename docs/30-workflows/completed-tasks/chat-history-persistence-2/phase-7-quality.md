# Phase 7: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 7                      |
| Phase名    | 品質保証               |
| 前提Phase  | Phase 6                |
| 後続Phase  | Phase 8                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-04             |
| 機能名     | チャット履歴永続化機能 |

---

## 目的

静的解析・セキュリティ・パフォーマンスの観点から品質を保証する。

## 背景

実装・リファクタリングが完了した段階で、自動化された品質チェックを実施し、問題を早期に発見・修正する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: eslint-configuration

**パス**: `.claude/skills/eslint-configuration/SKILL.md`

**Trigger条件**:
ESLintによる静的解析が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. エラー・警告を修正

**期待される成果物**:

- Lintエラー0件

---

### スキル2: static-analysis

**パス**: `.claude/skills/static-analysis/SKILL.md`

**Trigger条件**:
コード複雑度・重複検出が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 結果を分析・対応

**期待される成果物**:

- 複雑度レポート
- 重複検出レポート

---

### スキル3: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**:
TypeScript型チェック、型安全性確認が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 型エラーを修正

**期待される成果物**:

- 型エラー0件

---

### スキル4: dependency-auditing

**パス**: `.claude/skills/dependency-auditing/SKILL.md`

**Trigger条件**:
依存関係の脆弱性チェックが必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 脆弱性を対応

**期待される成果物**:

- 脆弱性レポート

---

## 参照資料

| 参照資料      | パス                   | 内容       |
| ------------- | ---------------------- | ---------- |
| Phase 6成果物 | `packages/shared/src/` | 実装コード |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                     | 内容     |
| -------- | ------------------------------------------------------------------------ | -------- |
| 品質基準 | `.claude/skills/aiworkflow-requirements/references/quality-standards.md` | 品質基準 |

---

## 成果物

| 成果物             | パス                                                                           | 内容             |
| ------------------ | ------------------------------------------------------------------------------ | ---------------- |
| 品質レポート       | `docs/30-workflows/chat-history-persistence/outputs/phase-7/quality-report.md` | 品質チェック結果 |
| カバレッジレポート | `docs/30-workflows/chat-history-persistence/outputs/phase-7/coverage.md`       | テストカバレッジ |

---

## 完了条件

- [ ] ESLintエラーが0件である
- [ ] TypeScript型エラーが0件である
- [ ] テストカバレッジが基準を満たしている
- [ ] 重大な脆弱性がない
- [ ] コード複雑度が基準以内である

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 へ進む

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] カバレッジ基準達成（目標: 80%以上）

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし

---

## 品質チェックコマンド

```bash
# Lint
pnpm lint

# 型チェック
pnpm typecheck

# テスト + カバレッジ
pnpm --filter @repo/shared test:coverage
pnpm --filter @repo/desktop test:coverage

# 脆弱性スキャン
pnpm audit
```

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 使用スキル

- eslint-configuration: {{result}}
- static-analysis: {{result}}
- type-safety-patterns: {{result}}
- dependency-auditing: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-history-persistence/phase-8-final-review.md`
