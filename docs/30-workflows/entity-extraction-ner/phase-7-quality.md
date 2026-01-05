# Phase 7: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 7                          |
| Phase名    | 品質保証                   |
| 前提Phase  | Phase 6 (リファクタリング) |
| 後続Phase  | Phase 8 (最終レビュー)     |
| ステータス | 未実施                     |
| 作成日     | 2026-01-05                 |
| 機能名     | entity-extraction-ner      |

---

## 目的

実装コードの品質を静的解析・カバレッジ・パフォーマンスの観点から検証する。

## 背景

リファクタリング後のコードが品質基準を満たしているかを自動化ツールで検証し、問題があれば修正する。

---

## 使用スキル

### スキル1: code-quality

**パス**: `.claude/skills/code-quality/SKILL.md`

**Trigger条件**: Lint、型チェック、静的解析

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. ESLint、TypeScript、静的解析ツールを実行
3. 問題を修正

**期待される成果物**:

- 静的解析レポート
- 修正済みコード

---

### スキル2: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**Trigger条件**: 境界値テスト、エッジケース、テストカバレッジ

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 境界値テストケースを追加
3. エッジケースをカバー

**期待される成果物**:

- 追加テストケース

---

## 参照資料

| 参照資料   | パス                                                 | 内容          |
| ---------- | ---------------------------------------------------- | ------------- |
| 実装コード | `packages/shared/src/services/extraction/`           | Phase 6成果物 |
| テスト     | `packages/shared/src/services/extraction/__tests__/` | テストケース  |

---

## 成果物

| 成果物       | パス                                 | 内容               |
| ------------ | ------------------------------------ | ------------------ |
| 品質レポート | `outputs/phase-7/quality-report.md`  | 静的解析結果       |
| カバレッジ   | `outputs/phase-7/coverage-report.md` | カバレッジレポート |

---

## 品質チェック項目

### 1. 静的解析

```bash
# ESLint
pnpm --filter @repo/shared lint

# TypeScript型チェック
pnpm --filter @repo/shared typecheck

# Prettier
pnpm --filter @repo/shared format:check
```

### 2. テストカバレッジ

```bash
pnpm --filter @repo/shared test:coverage -- --grep "EntityExtractor"
```

| 指標      | 目標値 |
| --------- | ------ |
| Line      | 80%+   |
| Branch    | 75%+   |
| Function  | 80%+   |
| Statement | 80%+   |

### 3. エッジケーステスト

| ケース       | テスト内容               |
| ------------ | ------------------------ |
| 空入力       | 空文字列・空配列の処理   |
| 大量データ   | 100+エンティティの処理   |
| 不正データ   | 不正なJSON・型の処理     |
| タイムアウト | LLMタイムアウト時の処理  |
| 境界値       | minConfidence=0, 1の処理 |

### 4. セキュリティチェック

| 項目       | 確認内容                             |
| ---------- | ------------------------------------ |
| 入力検証   | 全ての入力がバリデーションされている |
| エラー露出 | 内部エラーが外部に露出しない         |
| 依存関係   | 脆弱な依存がない                     |

---

## 完了条件

- [ ] ESLintエラーが0件
- [ ] TypeScript型エラーが0件
- [ ] テストカバレッジが目標値以上
- [ ] エッジケーステストが追加されている
- [ ] セキュリティチェックがパス
- [ ] 品質レポートが `outputs/phase-7/` に出力されている

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 (最終レビューゲート) へ進む

---

## スキルフィードバック記録

```markdown
## Phase 7 実行記録

### 使用スキル

- code-quality: {{result}}
- boundary-value-analysis: {{result}}

### 品質指標

- ESLintエラー: {{件数}}
- 型エラー: {{件数}}
- カバレッジ: {{%}}

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/entity-extraction-ner/phase-8-final-review.md`
