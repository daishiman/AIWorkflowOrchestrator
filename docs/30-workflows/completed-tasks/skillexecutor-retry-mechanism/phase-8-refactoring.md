# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 8                               |
| Phase名   | リファクタリング                |
| カテゴリ  | TDD-Refactor                    |
| 機能名    | skillexecutor-retry-mechanism   |
| 作成日    | 2026-01-30                      |
| 前提Phase | Phase 7（テストカバレッジ確認） |
| 後続Phase | Phase 9（品質保証）             |

## 目的

テスト通過を維持しながら、リトライ機構のコード品質を改善する。

---

## 実行タスク

### Task 1: 関数分離の検討

**目的**: リトライロジックの関数分離が適切かを評価し、必要に応じてリファクタリングする。

**手順**:

1. 以下の関数が適切に分離されているか確認する:
   - isRetryableError(): 単一責務（エラー分類のみ）
   - calculateBackoffDelay(): 単一責務（delay計算のみ）
   - sleep(): 単一責務（待機のみ）
   - executeWithRetry(): リトライオーケストレーション
2. 各関数の行数が50行以内に収まっているか確認する
3. 関数間の結合度が低いことを確認する
4. 必要に応じてヘルパー関数を抽出する（例: parseRetryAfterHeader）

**期待される成果物**:

- リファクタリング結果（コード変更があった場合のみ）

### Task 2: 命名の統一性確認

**目的**: 変数名・関数名・型名が既存コードベースの命名規則と一致しているか確認する。

**手順**:

1. 既存のSkillExecutor.tsの命名パターンを確認する:
   - camelCase: 変数、関数、メソッド
   - PascalCase: 型、インターフェース
   - UPPER_SNAKE_CASE: 定数
2. 新規追加した名前が命名規則に準拠しているか確認する
3. 不統一がある場合は修正する

**期待される成果物**:

- 命名修正（変更があった場合のみ）

### Task 3: デッドコード・未使用importの除去

**目的**: 不要なコードを除去する。

**手順**:

1. 未使用のimport文がないか確認する
2. 到達不能コード（unreachable code）がないか確認する
3. コメントアウトされた古いコードを除去する
4. 不要な型アサーション（as）を除去する

**期待される成果物**:

- クリーンアップされたコード

### Task 4: テスト全パス確認

**目的**: リファクタリング後も全テストがパスすることを確認する。

**手順**:

1. リトライテストを実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
   ```
2. 既存テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/
   ```
3. 全テストがGreenであることを確認する

**期待される成果物**:

- テスト結果確認記録（`outputs/phase-8/refactoring-test-results.md`）

---

## 参照資料

| 参照資料       | パス                                                                         | 用途         |
| -------------- | ---------------------------------------------------------------------------- | ------------ |
| SkillExecutor  | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                      | 対象ファイル |
| skill型定義    | `packages/shared/src/types/skill.ts`                                         | 対象ファイル |
| リトライテスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | テスト確認   |

---

## TDDフェーズ設定

| 項目           | 値                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------- |
| TDD状態        | Refactor                                                                                    |
| テストコマンド | `pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/` |

---

## 統合テスト連携

リファクタリング後の既存テスト全パス確認:

- SkillExecutor.test.ts
- SkillExecutor.permission.test.ts
- SkillExecutor.integration.test.ts
- SkillExecutor.retry.test.ts

---

## 成果物

| 成果物             | パス                                          | 種別     |
| ------------------ | --------------------------------------------- | -------- |
| テスト結果確認記録 | `outputs/phase-8/refactoring-test-results.md` | document |

---

## 完了条件

- [ ] 関数分離が適切であることが確認されている
- [ ] 命名が既存規則と一致している
- [ ] デッドコード・未使用importが除去されている
- [ ] リトライテスト全パス
- [ ] 既存テスト全パス
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 8 \
  --artifacts "outputs/phase-8/refactoring-test-results.md:リファクタリングテスト結果"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 8
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

→ [Phase 9: 品質保証](./phase-9-quality.md)
