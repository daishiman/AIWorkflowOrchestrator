# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 9                          |
| Phase名    | 品質保証                   |
| 前提Phase  | Phase 8                    |
| 後続Phase  | Phase 10                   |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

コード品質、セキュリティ、アクセシビリティの観点から総合的な品質チェックを行う。

## 背景

実装とリファクタリングが完了した後、本番リリース前の品質ゲートとして、各種品質基準への適合を確認する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: accessibility-wcag

**パス**: `.claude/skills/accessibility-wcag/SKILL.md`

**選定理由**: WCAG準拠のアクセシビリティチェックを行うため

**Trigger条件**:
アクセシビリティ実装、WCAG準拠確認、ARIAとスクリーンリーダーサポートの設計を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. AgentViewのアクセシビリティを検証

**期待される成果物**:

- `outputs/phase-9/accessibility-report.md` - アクセシビリティレポート

---

### スキル2: code-smell-detection

**パス**: `.claude/skills/code-smell-detection/SKILL.md`

**選定理由**: 最終的なコード品質チェックを行うため

**Trigger条件**:
コードスメルの検出、リファクタリング対象の特定、技術的負債の分析を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 残存するコードスメルがないか確認

**期待される成果物**:

- `outputs/phase-9/quality-report.md` - 品質レポート

---

## 参照資料

| 参照資料                 | パス                                    | 内容          |
| ------------------------ | --------------------------------------- | ------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | Phase 8成果物 |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`    | Phase 7成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料    | パス                                                                        | 内容      |
| ----------- | --------------------------------------------------------------------------- | --------- |
| 品質要件    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準  |
| UI/UXガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-guidelines.md`     | UI/UX基準 |

---

## 品質チェック観点

### 1. コード品質

- [ ] ESLintエラーがない
- [ ] TypeScript型エラーがない
- [ ] 未使用の変数・インポートがない
- [ ] console.logが残っていない（デバッグ用）
- [ ] コメントが適切に記述されている

### 2. セキュリティ

- [ ] XSS脆弱性がない
- [ ] 機密情報がハードコードされていない
- [ ] 入力値のサニタイズが適切
- [ ] IPC通信が安全に実装されている

### 3. アクセシビリティ（WCAG 2.1 AA準拠）

- [ ] キーボードナビゲーションが可能
- [ ] スクリーンリーダー対応（ARIA属性）
- [ ] 色のコントラスト比が適切
- [ ] フォーカス表示が明確
- [ ] 代替テキストが適切

### 4. パフォーマンス

- [ ] 初期レンダリングが高速
- [ ] 不要な再レンダリングがない
- [ ] バンドルサイズが適切

---

## 品質チェックコマンド

```bash
# ESLint
pnpm --filter @repo/desktop lint

# TypeScript
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test

# ビルド確認
pnpm --filter @repo/desktop build
```

---

## 成果物

| 成果物                   | パス                                      | 内容             |
| ------------------------ | ----------------------------------------- | ---------------- |
| 品質レポート             | `outputs/phase-9/quality-report.md`       | 総合品質評価     |
| アクセシビリティレポート | `outputs/phase-9/accessibility-report.md` | a11yチェック結果 |
| セキュリティレポート     | `outputs/phase-9/security-report.md`      | セキュリティ評価 |

---

## 完了条件

- [ ] ESLintエラーがない
- [ ] 型エラーがない
- [ ] セキュリティチェックがパス
- [ ] アクセシビリティチェックがパス
- [ ] パフォーマンス基準を満たしている
- [ ] 品質レポートが作成されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 使用スキル

- accessibility-wcag: {{result}}
- code-smell-detection: {{result}}

### 品質チェック結果

- ESLint: {{PASS/FAIL}}
- TypeScript: {{PASS/FAIL}}
- セキュリティ: {{PASS/FAIL}}
- アクセシビリティ: {{PASS/FAIL}}

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

`docs/30-workflows/agent-dashboard-foundation/phase-10-final-review.md`
