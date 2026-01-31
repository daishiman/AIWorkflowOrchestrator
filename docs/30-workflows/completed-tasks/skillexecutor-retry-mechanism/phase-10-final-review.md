# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 10                            |
| Phase名   | 最終レビューゲート            |
| カテゴリ  | ゲート                        |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 9（品質保証）           |
| 後続Phase | Phase 11（手動テスト検証）    |

## 目的

実装全体の品質を最終検証し、手動テスト・ドキュメント作成・PR作成に進むかどうかのゲート判定を行う。

---

## 実行タスク

### Task 1: 機能完全性レビュー

**目的**: 全機能要件が実装されていることを確認する。

**手順**:

1. Phase 1要件定義書の全機能要件を確認する
2. 各要件の実装状況を検証する:
   | 要件 | 実装状況 | 検証方法 |
   | ---- | -------- | -------- |
   | ネットワークエラー自動リトライ | | テストケース確認 |
   | API rate limit (429) リトライ | | テストケース確認 |
   | 5xxサーバーエラーリトライ | | テストケース確認 |
   | 最大リトライ回数制限 | | テストケース確認 |
   | Exponential Backoff with Jitter | | テストケース確認 |
   | skill:retryストリーミング通知 | | テストケース確認 |
   | abort()によるリトライキャンセル | | テストケース確認 |
   | 設定可能なRetryConfig | | テストケース確認 |
3. 未実装要件がある場合はMAJOR判定

**期待される成果物**:

- 機能完全性レビュー結果（`outputs/phase-10/feature-completeness-review.md`）

### Task 2: コード品質レビュー

**目的**: コード品質が基準を満たしていることを確認する。

**手順**:

1. 以下の品質基準を確認する:
   - TypeScript strictモードエラーなし
   - ESLintエラーなし
   - Prettierフォーマット済み
   - any型の使用なし
   - テストカバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
2. コードレビュー観点:
   - 既存のSkillExecutor APIに破壊的変更がないこと
   - 新規関数のJSDocコメントが適切であること
   - エラーメッセージが日本語ユーザーに適切であること
   - ログ出力にsensitive情報が含まれないこと

**期待される成果物**:

- コード品質レビュー結果（`outputs/phase-10/code-quality-review.md`）

### Task 3: テスト品質レビュー

**目的**: テストの品質と網羅性を確認する。

**手順**:

1. テスト品質基準を確認する:
   - テストケース数: 67+
   - 正常系/異常系の網羅性
   - エッジケースのカバー
   - モックの適切性
2. テスト実行結果を確認する:
   - 全テストGreen
   - 既存テストに影響なし
3. テスト命名規則の統一性を確認する

**期待される成果物**:

- テスト品質レビュー結果（`outputs/phase-10/test-quality-review.md`）

### Task 4: ゲート判定

**目的**: 最終レビュー結果に基づきゲート判定を行う。

**手順**:

1. 判定基準:
   | 判定 | 条件 | 戻り先 |
   | -------- | ------------------------------------ | ------- |
   | PASS | 全レビュー項目に問題なし | Phase 11 |
   | MINOR | 軽微な修正で解決（手動テスト時に対応可能） | Phase 11 |
   | MAJOR | 実装に問題あり | Phase 5 |
   | MAJOR | テストに問題あり | Phase 4 |
   | CRITICAL | 根本的な設計問題 | Phase 1 |
2. MINOR判定の場合、修正事項を記録する
3. 判定結果を記録する

**期待される成果物**:

- ゲート判定結果（`outputs/phase-10/gate-judgment.md`）

---

## 参照資料

| 参照資料           | パス                                                                           | 用途         |
| ------------------ | ------------------------------------------------------------------------------ | ------------ |
| Phase 1要件定義    | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-1/`             | 要件参照     |
| Phase 9品質結果    | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-9/`             | 品質結果参照 |
| レビューゲート基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準     |
| SkillExecutor      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                        | 実装確認     |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| RetryConfig型設計書 | `outputs/phase-2/retry-config-design.md` | Phase 2 成果物 |

---

## 統合テスト連携

全テスト実行 + カバレッジ基準達成を最終確認:

- `pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/`
- カバレッジ基準達成を確認

---

## 成果物

| 成果物                 | パス                                              | 種別     |
| ---------------------- | ------------------------------------------------- | -------- |
| 機能完全性レビュー結果 | `outputs/phase-10/feature-completeness-review.md` | document |
| コード品質レビュー結果 | `outputs/phase-10/code-quality-review.md`         | document |
| テスト品質レビュー結果 | `outputs/phase-10/test-quality-review.md`         | document |
| ゲート判定結果         | `outputs/phase-10/gate-judgment.md`               | document |

---

## 完了条件

- [ ] 全機能要件の実装が確認されている
- [ ] コード品質基準を満たしている
- [ ] テスト品質基準を満たしている（67+ケース、全Green）
- [ ] ゲート判定がPASS/MINOR/MAJOR/CRITICALのいずれかで記録されている
- [ ] MAJOR/CRITICAL判定の場合、戻り先Phaseが明記されている
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 10 \
  --artifacts "outputs/phase-10/gate-judgment.md:最終ゲート判定結果"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 10
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 11: 手動テスト検証](./phase-11-manual-test.md)（PASS/MINOR判定時）
→ Phase 5, 4, または1（MAJOR/CRITICAL判定時）
