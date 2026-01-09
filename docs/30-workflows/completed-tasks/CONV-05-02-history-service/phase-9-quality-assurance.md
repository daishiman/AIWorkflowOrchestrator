# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 9                             |
| Phase名    | 品質保証                      |
| 前提Phase  | Phase 8 (リファクタリング)    |
| 後続Phase  | Phase 10 (最終レビューゲート) |
| ステータス | 未実施                        |
| 作成日     | 2026-01-08                    |
| 機能名     | CONV-05-02-history-service    |

---

## 目的

静的解析・セキュリティ・性能の観点から品質を検証する。

## 背景

実装・リファクタリング完了後、本番リリースに向けた品質保証を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: static-analysis

**パス**: `.claude/skills/static-analysis/SKILL.md`

**Trigger条件**:

- 静的解析による品質検証が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

---

## 参照資料

| 参照資料             | パス                                                      | 内容     |
| -------------------- | --------------------------------------------------------- | -------- |
| 実装コード           | `packages/shared/src/services/history/history-service.ts` | 検証対象 |
| 型定義               | `packages/shared/src/services/history/types.ts`           | 検証対象 |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                      | 変更履歴 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                           | 内容     |
| -------- | -------------------------------------------------------------- | -------- |
| 品質基準 | `.claude/skills/aiworkflow-requirements/references/quality.md` | 品質基準 |

---

## 成果物

| 成果物       | パス                                | 内容         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## 品質チェックリスト

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] Line Coverage 80%+
- [ ] Branch Coverage 60%+
- [ ] Function Coverage 80%+

### セキュリティ

- [ ] 入力バリデーションが適切
- [ ] エラーメッセージに機密情報が含まれていない
- [ ] Result型による適切なエラーハンドリング

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 9での必須アクション

- [ ] 品質保証で統合テスト結果を確認
- [ ] セキュリティ観点の検証
- [ ] パフォーマンス観点の確認（必要に応じて）

---

## 実行コマンド

```bash
# Lint実行
pnpm --filter @repo/shared lint

# 型チェック
pnpm --filter @repo/shared typecheck

# テスト実行
pnpm --filter @repo/shared test -- history-service

# カバレッジ確認
pnpm --filter @repo/shared test:coverage
```

---

## 完了条件

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み
- [ ] テストカバレッジ基準達成
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 8 が完了していること
- **後続**: Phase 10 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 使用スキル

- static-analysis: {{result}}

### 品質検証結果

- Lintエラー: {{数}}
- 型エラー: {{数}}
- テストカバレッジ: {{%}}

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

`docs/30-workflows/CONV-05-02-history-service/phase-10-final-review.md`
