# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 3                             |
| Phase名   | 設計レビューゲート            |
| カテゴリ  | ゲート                        |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 2（設計）               |
| 後続Phase | Phase 4（テスト作成）         |

## 目的

Phase 2で作成した設計の品質を検証し、実装に進むかどうかのゲート判定を行う。

---

## 実行タスク

### Task 1: 要件-設計トレーサビリティ検証

**目的**: Phase 1の全要件がPhase 2の設計でカバーされていることを確認する。

**手順**:

1. Phase 1の要件定義書（`outputs/phase-1/requirements-definition.md`）から全機能要件を抽出する
2. Phase 2の各設計書と要件を突合する
3. カバレッジマトリクスを作成する:
   | 要件ID | 要件内容 | 設計書 | カバー状態 |
4. 未カバー要件がある場合はMAJOR判定（Phase 2に戻り）

**期待される成果物**:

- トレーサビリティマトリクス（`outputs/phase-3/traceability-matrix.md`）

### Task 2: リトライ戦略の妥当性レビュー

**目的**: 設計されたリトライアルゴリズムが実用上の問題を起こさないことを確認する。

**手順**:

1. Exponential Backoff with Jitterの計算結果を全attempt分検算する
2. 最悪ケースの総待機時間を算出する（3回リトライ時の最大待機時間合計）
3. Retry-Afterヘッダー対応の設計が仕様通りであることを確認する
4. 無限リトライ防止策（maxRetries上限）が設計に含まれることを確認する
5. abort()によるリトライ即座中止の設計が正しいことを確認する

**期待される成果物**:

- リトライ戦略レビュー結果（`outputs/phase-3/retry-strategy-review.md`）

### Task 3: 型安全性・既存コードとの整合性レビュー

**目的**: 新規型定義が既存の型システムと整合し、型安全であることを確認する。

**手順**:

1. RetryConfig型が既存のSkillExecutionRequest型と矛盾しないことを確認する
2. RetryMessageContent型がSkillStreamMessage discriminated unionに正しく統合されることを確認する
3. RetryableErrorType型が既存のSkillExecutionErrorCode型と重複しないことを確認する
4. SkillExecutor.tsの既存publicAPIに破壊的変更がないことを確認する
5. packages/shared/src/types/skill.tsへの追加が他パッケージに影響しないことを確認する

**期待される成果物**:

- 型安全性レビュー結果（`outputs/phase-3/type-safety-review.md`）

### Task 4: ゲート判定

**目的**: レビュー結果に基づきゲート判定を行う。

**手順**:

1. 判定基準:
   | 判定 | 条件 | 戻り先 |
   | ------- | ---------------------------------------- | ------- |
   | PASS | 全レビュー項目に問題なし | Phase 4 |
   | MINOR | 軽微な修正で解決（実装時に対応可能） | Phase 4 |
   | MAJOR | 要件に問題あり | Phase 1 |
   | MAJOR | 設計に重大な問題あり | Phase 2 |
2. MINOR判定の場合、修正事項を未タスク指示書として記録する
3. 判定結果を記録する

**期待される成果物**:

- ゲート判定結果（`outputs/phase-3/gate-judgment.md`）

---

## 参照資料

| 参照資料            | パス                                                                           | 用途           |
| ------------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 1成果物       | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-1/`             | 要件参照       |
| Phase 2成果物       | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-2/`             | 設計参照       |
| レビューゲート基準  | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準       |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 成果物 |
| RetryConfig型設計書 | `outputs/phase-2/retry-config-design.md`                                       | Phase 2 成果物 |

---

## 統合テスト連携

統合テスト設計の妥当性をレビュー:

- リトライ→成功のE2Eテストシナリオが設計されているか
- モック設計がquery() APIの実際の挙動を正確に模擬しているか

---

## 成果物

| 成果物                     | パス                                       | 種別     |
| -------------------------- | ------------------------------------------ | -------- |
| トレーサビリティマトリクス | `outputs/phase-3/traceability-matrix.md`   | document |
| リトライ戦略レビュー結果   | `outputs/phase-3/retry-strategy-review.md` | document |
| 型安全性レビュー結果       | `outputs/phase-3/type-safety-review.md`    | document |
| ゲート判定結果             | `outputs/phase-3/gate-judgment.md`         | document |

---

## 完了条件

- [ ] 全要件が設計でカバーされていることがマトリクスで確認されている
- [ ] リトライアルゴリズムの計算結果が検算されている
- [ ] 型安全性が確認されている（既存型との矛盾なし）
- [ ] ゲート判定がPASS/MINOR/MAJORのいずれかで記録されている
- [ ] MAJOR判定の場合、戻り先Phaseが明記されている
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 3 \
  --artifacts "outputs/phase-3/gate-judgment.md:ゲート判定結果"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 3
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

→ [Phase 4: テスト作成](./phase-4-test-creation.md)（PASS/MINOR判定時）
→ Phase 1またはPhase 2（MAJOR判定時）
