# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| Phase名    | 品質保証                        |
| 前提Phase  | Phase 8                         |
| 後続Phase  | Phase 10                        |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

静的解析、セキュリティチェック、型チェックなど、コード品質を総合的に検証する。

## 背景

Phase 8でリファクタリングが完了した。本番環境へのデプロイ前に、品質を総合的に検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 静的解析

**目的**: ESLintによる静的解析を実行し、問題がないことを確認する

**実行手順**:

1. ESLint実行:

   ```bash
   pnpm --filter @repo/desktop lint
   ```

2. エラー・警告の確認:
   - エラー: 0件であること
   - 警告: 可能な限り解消

3. 必要に応じて修正

**期待される成果物**:

- `outputs/phase-9/lint-result.md`: ESLint実行結果

---

### タスク2: 型チェック

**目的**: TypeScript strict modeで型エラーがないことを確認する

**実行手順**:

1. 型チェック実行:

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

2. エラーがないことを確認

3. 必要に応じて型定義を修正

**期待される成果物**:

- `outputs/phase-9/typecheck-result.md`: 型チェック結果

---

### タスク3: セキュリティチェック

**目的**: セキュリティ上の問題がないことを確認する

**実行手順**:

1. IPCチャネル許可リストの確認:
   - 新規追加したチャネルが正しく許可リストに追加されているか
   - 不要なチャネルが公開されていないか

2. 入力検証の確認:
   - PermissionRequest/Responseの入力が適切に検証されているか

3. XSS対策の確認:
   - ダイアログ表示時にユーザー入力が適切にエスケープされているか

**期待される成果物**:

- `outputs/phase-9/security-check.md`: セキュリティチェック結果

---

### タスク4: 全テスト実行

**目的**: 全テストがPASSすることを最終確認する

**実行手順**:

1. 全テスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run
   ```

2. カバレッジ確認:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage --run
   ```

3. 結果の記録

**期待される成果物**:

- `outputs/phase-9/final-test-result.md`: 最終テスト結果

---

## 参照資料

| 参照資料         | パス                                                                           | 内容             |
| ---------------- | ------------------------------------------------------------------------------ | ---------------- |
| Phase 8成果物    | `outputs/phase-8/`                                                             | リファクタ結果   |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容          |
| ---------------- | ------------------------------------------------------------------------------ | ------------- |
| セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | IPC安全性要件 |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質基準      |

---

## 成果物

| 成果物               | パス                                   | 内容               |
| -------------------- | -------------------------------------- | ------------------ |
| ESLint実行結果       | `outputs/phase-9/lint-result.md`       | 静的解析結果       |
| 型チェック結果       | `outputs/phase-9/typecheck-result.md`  | TypeScript検証結果 |
| セキュリティチェック | `outputs/phase-9/security-check.md`    | セキュリティ検証   |
| 最終テスト結果       | `outputs/phase-9/final-test-result.md` | テスト結果         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 9での統合テスト連携アクション:**

- 品質保証で統合テスト結果を確認する
- 全テストがPASSしていることを確認する

---

## 完了条件

- [ ] ESLintエラーがない
- [ ] TypeScript型エラーがない
- [ ] セキュリティチェックが完了している
- [ ] 全テストがPASSしている
- [ ] カバレッジが維持されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

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

- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上

#### セキュリティ

- [ ] IPCチャネル許可リスト確認
- [ ] 入力検証確認
- [ ] XSS対策確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-10-final-review.md`
