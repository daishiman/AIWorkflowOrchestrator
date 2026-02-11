# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| Phase名    | 品質保証                               |
| 前提Phase  | Phase 8                                |
| 後続Phase  | Phase 10                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-02-10                             |
| 機能名     | ut-fix-5-4-agent-sdk-api-type-mismatch |

---

## 目的

定義された品質基準をすべて満たすことを検証する。

## 背景

リファクタリングが完了した状態で、全品質ゲートをクリアすることを確認する。特に型定義の修正が正しく反映され、型安全性が確保されていることを検証する。

---

## 品質ゲート

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 型定義テスト成功

### コード品質

- [ ] Lintエラーなし（`pnpm lint`）
- [ ] 型エラーなし（`pnpm typecheck`）
- [ ] コードフォーマット適用済み（`pnpm format`）

### テスト網羅性

- [ ] Line Coverage 80%+
- [ ] Branch Coverage 60%+
- [ ] Function Coverage 80%+

### 型安全性

- [ ] `abort()` メソッドが `Promise<void>` を返すことを確認
- [ ] 呼び出し箇所で `await` または `.then()` が使用可能
- [ ] 2箇所の型定義が一致している

---

## 実行タスク

### タスク1: 自動テスト実行

**目的**: 全自動テストの成功確認

**実行手順**:

1. `pnpm --filter @repo/desktop test` を実行する
2. `pnpm --filter @repo/shared test` を実行する
3. 結果を記録する

**実行コマンド**:

```bash
# Desktop テスト
pnpm --filter @repo/desktop test

# Shared テスト
pnpm --filter @repo/shared test

# 型定義に関連するテスト
pnpm --filter @repo/desktop test -- --grep "abort"
```

**期待される成果物**:

- テスト結果レポート

---

### タスク2: コード品質チェック

**目的**: Lint、型チェック、フォーマットの確認

**実行手順**:

1. `pnpm lint` を実行する
2. `pnpm typecheck` を実行する
3. `pnpm format --check` を実行する

**実行コマンド**:

```bash
# Lint チェック
pnpm lint

# 型チェック
pnpm typecheck

# フォーマットチェック
pnpm format --check
```

**確認観点**:

| チェック項目          | コマンド              | 期待結果   |
| --------------------- | --------------------- | ---------- |
| ESLint エラー         | `pnpm lint`           | エラーなし |
| TypeScript 型エラー   | `pnpm typecheck`      | エラーなし |
| Prettier フォーマット | `pnpm format --check` | 差分なし   |

**期待される成果物**:

- コード品質レポート

---

### タスク3: 型安全性検証

**目的**: 型定義修正の正確性を検証

**実行手順**:

1. `abort()` メソッドの型定義が `Promise<void>` であることを確認する
2. 2箇所の型定義が一致していることを確認する
3. 呼び出し箇所でPromise処理が可能であることを確認する

**確認コマンド**:

```bash
# 型定義の確認
grep -n "abort.*Promise" apps/desktop/src/preload/types.ts
grep -n "abort.*Promise" packages/shared/src/agent/types.ts

# 型定義の一致確認
diff <(grep "abort" apps/desktop/src/preload/types.ts) \
     <(grep "abort" packages/shared/src/agent/types.ts)
```

**検証項目**:

| 検証項目                   | 確認方法         | 期待結果        |
| -------------------------- | ---------------- | --------------- |
| preload/types.ts の型      | grep で確認      | `Promise<void>` |
| shared/agent/types.ts の型 | grep で確認      | `Promise<void>` |
| 2箇所の一致                | diff で確認      | 一致            |
| TypeScript コンパイル      | `pnpm typecheck` | エラーなし      |

**期待される成果物**:

- 型安全性検証レポート

---

### タスク4: カバレッジ確認

**目的**: テストカバレッジ基準の達成確認

**実行手順**:

1. カバレッジレポートを生成する
2. 基準値を満たしているか確認する
3. 不足箇所があれば記録する

**実行コマンド**:

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --coverage
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 現在値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | -      |
| Branch Coverage   | 60%      | 70%      | -      |
| Function Coverage | 80%      | 90%      | -      |

**期待される成果物**:

- カバレッジレポート

---

## 参照資料

| 参照資料             | パス                                    | 内容             |
| -------------------- | --------------------------------------- | ---------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-report.md` | Phase 8成果物    |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`    | Phase 7成果物    |
| 型安全ルール         | `.claude/rules/02-code-quality.md`      | TypeScript型安全 |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`    | P23-P28 型管理   |

---

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目   | 確認内容                    | 結果 |
| ---------- | --------------------------- | ---- |
| 機能検証   | 全自動テスト成功            | -    |
| 型安全性   | 2箇所の型定義が一致         | -    |
| 型チェック | `pnpm typecheck` エラーなし | -    |
| Lint       | `pnpm lint` エラーなし      | -    |

---

## 完了条件

- [ ] 全品質ゲートをクリア
- [ ] 型安全性検証完了
- [ ] カバレッジ基準達成
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/phase-10-final-review.md`
