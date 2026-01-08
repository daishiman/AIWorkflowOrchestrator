# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 9                        |
| Phase名    | 品質保証                 |
| 前提Phase  | Phase 8                  |
| 後続Phase  | Phase 10                 |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

静的解析、セキュリティチェック、パフォーマンス確認を行い、品質を保証する。

## 背景

リファクタリング後のコードに対して、各種品質チェックを実施し、本番リリースに向けた品質を担保する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: linting-formatting-automation

**パス**: `.claude/skills/linting-formatting-automation/SKILL.md`

**Trigger条件**:
コード品質の静的解析が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### スキル2: dependency-auditing

**パス**: `.claude/skills/dependency-auditing/SKILL.md`

**Trigger条件**:
依存関係のセキュリティ監査が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-9/security-audit.md`

---

### スキル3: accessibility-wcag

**パス**: `.claude/skills/accessibility-wcag/SKILL.md`

**Trigger条件**:
UIコンポーネントのアクセシビリティ確認が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-9/accessibility-report.md`

---

## 参照資料

| 参照資料      | パス                                 | 内容                 |
| ------------- | ------------------------------------ | -------------------- |
| Phase 8成果物 | `outputs/phase-8/refactoring-log.md` | リファクタリング記録 |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                 | 内容             |
| ---------------- | -------------------------------------------------------------------- | ---------------- |
| コード品質       | `.claude/skills/aiworkflow-requirements/references/code-quality.md`  | 品質基準         |
| セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security.md`      | セキュリティ方針 |
| アクセシビリティ | `.claude/skills/aiworkflow-requirements/references/accessibility.md` | A11y基準         |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "quality"`

---

## 成果物

| 成果物                   | パス                                      | 内容               |
| ------------------------ | ----------------------------------------- | ------------------ |
| 品質レポート             | `outputs/phase-9/quality-report.md`       | 総合品質レポート   |
| Lintレポート             | `outputs/phase-9/lint-report.md`          | 静的解析結果       |
| セキュリティ監査         | `outputs/phase-9/security-audit.md`       | 脆弱性チェック結果 |
| アクセシビリティレポート | `outputs/phase-9/accessibility-report.md` | WCAG準拠確認結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 9の統合テスト連携アクション**: 品質保証で統合テスト結果を確認

具体的な確認項目:

- [ ] 統合テストが全て成功している
- [ ] カバレッジが基準を満たしている
- [ ] パフォーマンスが許容範囲内

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%+
- [ ] Branch Coverage 60%+
- [ ] Function Coverage 80%+

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし
- [ ] APIキーのハードコーディングなし

#### アクセシビリティ

- [ ] WCAG 2.1 AA準拠
- [ ] キーボード操作可能
- [ ] スクリーンリーダー対応

---

## 実行コマンド

```bash
# Lint実行
pnpm lint

# 型チェック
pnpm typecheck

# セキュリティ監査
pnpm audit

# アクセシビリティチェック
pnpm test:a11y
```

---

## 完了条件

- [ ] 全品質チェックが成功している
- [ ] Lintエラーがない
- [ ] 型エラーがない
- [ ] セキュリティ脆弱性がない
- [ ] アクセシビリティ基準を満たしている
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. linting-formatting-automationスキルの実行
3. dependency-auditingスキルの実行
4. accessibility-wcagスキルの実行
5. 統合テスト連携の実施（品質保証で統合テスト結果確認）
6. 成果物の作成・配置
7. 品質ゲート確認
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 9
```

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 使用スキル

- linting-formatting-automation: {{result}}
- dependency-auditing: {{result}}
- accessibility-wcag: {{result}}

### 品質ゲート結果

- 機能検証: {{PASS/FAIL}}
- コード品質: {{PASS/FAIL}}
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

`docs/30-workflows/chat-multi-llm-switching/phase-10-final-review.md`
