# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 9                  |
| Phase名    | 品質保証           |
| 前提Phase  | Phase 8            |
| 後続Phase  | Phase 10           |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

定義された品質基準をすべて満たすことを検証する。機能検証、コード品質、テスト網羅性、セキュリティの各観点で品質ゲートを通過させる。

## 背景

Phase 8までで実装とリファクタリングが完了した。この段階で総合的な品質検証を行い、Phase 10の最終レビューに進む準備を整える。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: agent-quality-standards

**パス**: `.claude/skills/agent-quality-standards/SKILL.md`

**選定理由**: 品質基準への適合を確認するため。コード品質の検証を行う。

**Trigger条件**:

- コード品質の定量評価、メトリクス測定を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 品質メトリクスを測定・記録

**期待される成果物**:

- `outputs/phase-9/quality-standards-check.md` - 品質基準チェック結果

---

### スキル2: security-configuration-review

**パス**: `.claude/skills/security-configuration-review/SKILL.md`

**選定理由**: セキュリティ観点での品質確認を行うため。Agent SDK連携部分のセキュリティが重要。

**Trigger条件**:

- セキュリティチェック、脆弱性検査を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. セキュリティチェックを実施

**期待される成果物**:

- `outputs/phase-9/security-check.md` - セキュリティチェック結果

---

## 参照資料

| 参照資料             | パス                                        | 内容          |
| -------------------- | ------------------------------------------- | ------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`        | Phase 8成果物 |
| カバレッジ結果       | `outputs/phase-7/coverage-report.md`        | Phase 7成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> 品質基準は以下のシステム仕様を参照してください。

| 参照資料     | パス                                                                        | 内容             |
| ------------ | --------------------------------------------------------------------------- | ---------------- |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト・品質基準 |
| セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-guidelines.md`  | セキュリティ指針 |

---

## 品質ゲート

### 1. 機能検証

| 項目              | 基準     | 結果       |
| ----------------- | -------- | ---------- |
| ユニットテスト    | 全て成功 | {{RESULT}} |
| 統合テスト        | 全て成功 | {{RESULT}} |
| Main/Renderer接続 | 正常動作 | {{RESULT}} |

### 2. コード品質

| 項目                 | 基準           | 結果       |
| -------------------- | -------------- | ---------- |
| ESLint               | エラー0件      | {{RESULT}} |
| TypeScript型チェック | エラー0件      | {{RESULT}} |
| Prettier             | 全ファイル適合 | {{RESULT}} |

### 3. テスト網羅性

| 項目              | 基準    | 結果       |
| ----------------- | ------- | ---------- |
| Line Coverage     | 80%以上 | {{RESULT}} |
| Branch Coverage   | 60%以上 | {{RESULT}} |
| Function Coverage | 80%以上 | {{RESULT}} |

### 4. セキュリティ

| 項目           | 基準                          | 結果       |
| -------------- | ----------------------------- | ---------- |
| 依存関係脆弱性 | High/Critical 0件             | {{RESULT}} |
| コード脆弱性   | 重大な問題なし                | {{RESULT}} |
| Agent SDK連携  | トークン/秘密情報の安全な扱い | {{RESULT}} |

---

## 成果物

| 成果物           | パス                                 | 内容             |
| ---------------- | ------------------------------------ | ---------------- |
| 品質レポート     | `outputs/phase-9/quality-report.md`  | 品質検証総合結果 |
| 品質メトリクス   | `outputs/phase-9/quality-metrics.md` | 定量的品質測定   |
| セキュリティ結果 | `outputs/phase-9/security-check.md`  | セキュリティ確認 |

---

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目     | 確認内容              | 結果       |
| ------------ | --------------------- | ---------- |
| 機能検証     | 全自動テスト成功      | {{RESULT}} |
| 統合テスト   | 全統合テスト成功      | {{RESULT}} |
| 接続テスト   | Main/Renderer接続成功 | {{RESULT}} |
| セキュリティ | 脆弱性スキャン通過    | {{RESULT}} |

---

## 実行手順

### 1. Lint・型チェック

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

### 2. テスト実行

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

### 3. カバレッジ確認

```bash
pnpm --filter @repo/desktop test:coverage
```

### 4. セキュリティスキャン

```bash
pnpm audit
```

---

## 完了条件

- [ ] 全品質ゲートをクリア
- [ ] ESLint/TypeScriptエラーがない
- [ ] カバレッジ基準を達成
- [ ] セキュリティチェック完了
- [ ] 統合テスト結果が確認されている
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 8成果物の確認
2. Lint・型チェックの実行
3. テスト実行・成功確認
4. カバレッジ測定
5. code-quality-metricsスキルの実行
6. security-best-practicesスキルの実行
7. セキュリティスキャン
8. 品質ゲート判定
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] 全品質ゲートがクリアされている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 9
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 9 実行記録

### 使用スキル

- agent-quality-standards: {{result}}
- security-configuration-review: {{result}}

### 品質ゲート結果

- 機能検証: {{PASS/FAIL}}
- コード品質: {{PASS/FAIL}}
- テスト網羅性: {{PASS/FAIL}}
- セキュリティ: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 10: 最終レビューゲート

`docs/30-workflows/slide-reverse-sync/phase-10-final-review.md`
