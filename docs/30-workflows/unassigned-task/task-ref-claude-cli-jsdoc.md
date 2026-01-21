# JSDoc/TSDoc補完

## メタ情報

```yaml
issue_number: 356
```

## メタ情報

| 項目         | 値                            |
| ------------ | ----------------------------- |
| タスクID     | UNASSIGNED-CLI-007            |
| タスク名     | JSDoc/TSDoc補完               |
| 分類         | リファクタリング (ref)        |
| 対象機能     | Claude Code CLI統合           |
| 優先度       | **低**                        |
| 見積もり規模 | 小規模                        |
| ステータス   | 未着手                        |
| 発見元       | Phase 10: 最終レビュー (m-02) |
| 発見日       | 2026-01-17                    |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

Claude CLI統合の主要publicメソッドにはJSDocが記載されているが、privateメソッドやヘルパー関数のドキュメントが省略されている。

### 問題点・課題

- privateメソッドの意図が不明確
- 保守時の理解コストが高い
- 型定義だけでは分からない制約事項

### 放置した場合の影響

- 将来の保守担当者の理解コスト増大
- バグ修正時の影響範囲の誤認
- コード品質の低下印象

---

## 2. 何を達成するか（What）

### 目的

Claude CLI統合のコードベース全体のJSDoc/TSDocカバレッジを向上させ、保守性を高める。

### 最終ゴール

- 全publicメソッドにJSDoc記載
- privateメソッドに意図・制約を記載
- 複雑なロジックに説明コメント追加

### スコープ

**含むもの**:

- `apps/desktop/src/main/claude-cli/` 配下の全ファイル
- `packages/shared/src/claude-cli/` の型定義

**含まないもの**:

- テストファイルのドキュメント
- 外部ドキュメント（README等）の更新

### 成果物

| 成果物              | 形式       |
| ------------------- | ---------- |
| JSDoc追加済みソース | TypeScript |

---

## 3. どのように実行するか（How）

### 前提条件

- なし（保守タスク）

### 依存タスク

| タスクID | 内容 | ステータス |
| -------- | ---- | ---------- |
| なし     | -    | -          |

### 必要な知識・スキル

- JSDoc/TSDoc記法
- Claude CLI統合の実装理解

### 推奨アプローチ

1. 既存のJSDocスタイルを確認
2. 未記載メソッドをリストアップ
3. 優先度順に記載（複雑なものから）

---

## 4. 実行手順

### Phase 1: 現状調査

1. JSDoc未記載メソッドのリストアップ
2. 優先度付け（複雑度、重要度）

### Phase 2: JSDoc記載

1. ClaudeCliManager.tsのprivateメソッド
2. ProcessManager.tsの内部関数
3. SessionManager.tsのヘルパー
4. SkillScanner.tsのパース処理

### Phase 3: レビュー

1. ドキュメントの正確性確認
2. スタイルの統一確認

---

## 5. 完了条件チェックリスト

### ドキュメント要件

- [ ] 全publicメソッドにJSDoc記載
- [ ] privateメソッドの50%以上に記載
- [ ] 複雑なロジックに説明コメント
- [ ] @param, @returns, @throws の適切な使用

### 品質要件

- [ ] TypeScript型チェック通過
- [ ] 既存テストへの影響なし

---

## 6. 検証方法

| カテゴリ | テストケース                |
| -------- | --------------------------- |
| 記載確認 | 全publicメソッドにJSDocあり |
| スタイル | 既存スタイルとの一貫性      |
| 正確性   | 記載内容が実装と一致        |

---

## 7. リスクと対策

| リスク             | 影響 | 対策                   |
| ------------------ | ---- | ---------------------- |
| 実装との乖離       | 低   | コードリーディング徹底 |
| 過剰なドキュメント | 低   | 自明な箇所は省略       |

---

## 8. 参照情報

### 関連ドキュメント

- 最終レビュー結果: `docs/30-workflows/claude-code-cli-integration/outputs/phase-10/final-review-result.md`

### 対象ファイル

- `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`
- `apps/desktop/src/main/claude-cli/ProcessManager.ts`
- `apps/desktop/src/main/claude-cli/SessionManager.ts`
- `apps/desktop/src/main/claude-cli/SkillScanner.ts`

---

**作成日**: 2026-01-17
**ステータス**: 未着手
