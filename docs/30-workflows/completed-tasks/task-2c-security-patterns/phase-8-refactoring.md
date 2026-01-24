# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| フェーズ     | 8                             |
| フェーズ名   | リファクタリング              |
| 目的         | TDD: Refactor（品質改善）     |
| 前提フェーズ | Phase 7: テストカバレッジ確認 |
| 次フェーズ   | Phase 9: 品質保証             |
| 想定成果物   | リファクタリング済みコード    |

---

## 1. 目的

テストが全てパスしている状態を維持しながら、コードの品質を改善する。TDDのRefactorフェーズとして、可読性・保守性・効率性を向上させる。

---

## 2. 実行タスク

### Task 8-1: コード品質分析

**目的**: 現在のコードの品質を分析し、改善点を特定する

**チェックリスト**:

- [ ] 重複コードがないか
- [ ] 関数が適切な長さか（20行以下推奨）
- [ ] 命名が明確か
- [ ] コメント・JSDocが適切か
- [ ] 型定義が厳密か

### Task 8-2: JSDoc 改善

**目的**: JSDocコメントを充実させる

**確認項目**:

- [ ] 全エクスポート関数にJSDocがある
- [ ] @param タグが全パラメータにある
- [ ] @returns タグがある
- [ ] @example タグがある
- [ ] @remarks タグで補足説明がある（必要な場合）

### Task 8-3: 型安全性強化

**目的**: 型定義をより厳密にする

**改善候補**:

```typescript
// 改善前: 暗黙的な型変換
export function validateAllowedTools(tools: string[]): boolean;

// 改善後: ReadonlyArray を受け入れる
export function validateAllowedTools(tools: readonly string[]): boolean;
```

### Task 8-4: エラーハンドリング改善

**目的**: エラーケースの処理を改善する

**確認項目**:

- [ ] null/undefined の適切な処理
- [ ] 無効な入力に対するエラーメッセージ
- [ ] 正規表現エラーのキャッチ

### Task 8-5: パフォーマンス最適化

**目的**: 必要に応じてパフォーマンスを改善する

**検討項目**:

- [ ] 正規表現のコンパイル回数削減（キャッシュ化）
- [ ] 早期リターンの活用
- [ ] 不要なオブジェクト生成の削減

**パフォーマンス改善例（オプション）**:

```typescript
// パターンの正規表現をキャッシュ
const patternCache = new Map<string, RegExp>();

function getPatternRegex(pattern: string, homeDir: string): RegExp {
  const cacheKey = `${pattern}:${homeDir}`;

  if (!patternCache.has(cacheKey)) {
    // 正規表現を生成してキャッシュ
    const escapedPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "__DOUBLE_STAR__")
      .replace(/\*/g, "[^/]*")
      .replace(/__DOUBLE_STAR__/g, ".*")
      .replace(/~/g, homeDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    patternCache.set(cacheKey, new RegExp(`^${escapedPattern}$`));
  }

  return patternCache.get(cacheKey)!;
}
```

### Task 8-6: テスト再実行

**目的**: リファクタリング後もテストが全てパスすることを確認する

**手順**:

```bash
# テスト実行
pnpm --filter @repo/shared test -- --run

# 型チェック
pnpm --filter @repo/shared typecheck

# リント
pnpm --filter @repo/shared lint
```

---

## 3. リファクタリングガイドライン

### 3.1 してよいこと

- 変数名・関数名の改善
- コメント・JSDocの追加
- 不要なコードの削除
- 可読性向上のためのコード整理
- 型定義の厳密化

### 3.2 してはいけないこと

- 機能変更
- 外部インターフェースの変更
- 新機能の追加
- 依存関係の追加

---

## 4. 参照資料

| 資料名 | パス                          |
| ------ | ----------------------------- |
| 実装   | `./phase-5-implementation.md` |
| テスト | `./phase-4-test-creation.md`  |

---

## 5. 完了条件

- [ ] Task 8-1 完了: コード品質分析
- [ ] Task 8-2 完了: JSDoc 改善
- [ ] Task 8-3 完了: 型安全性強化
- [ ] Task 8-4 完了: エラーハンドリング改善
- [ ] Task 8-5 完了: パフォーマンス最適化
- [ ] Task 8-6 完了: テスト再実行
- [ ] 全テストがパス
- [ ] 型チェックがパス
- [ ] リントエラーなし

---

## 6. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。

---

## 7. 成果物

| 成果物               | パス                                        | 状態     |
| -------------------- | ------------------------------------------- | -------- |
| リファクタリング済み | `packages/shared/src/constants/security.ts` | 更新待ち |

---

## 8. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 9. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Task 8-1: コード品質分析
2. Task 8-2: JSDoc 改善
3. Task 8-3: 型安全性強化
4. Task 8-4: エラーハンドリング改善
5. Task 8-5: パフォーマンス最適化
6. Task 8-6: テスト再実行
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
