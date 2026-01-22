# Phase 8: リファクタリング（TDD Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD Refactor）  |
| 前提Phase  | Phase 7                           |
| 後続Phase  | Phase 9                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

TDD（テスト駆動開発）のRefactorフェーズとして、テストを維持しながらコード品質を改善する。

## 背景

Green状態のテストを維持しながら、コードの可読性・保守性・パフォーマンスを改善する。リファクタリング後もテストがパスすることを確認し、品質を担保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: 現在のコード品質を分析し、改善ポイントを特定する

**実行手順**:

1. ESLint実行:
   ```bash
   pnpm --filter @repo/shared lint
   ```
2. 警告・エラーをリストアップ
3. コード複雑度の確認:
   - 関数の行数
   - ネストの深さ
   - サイクロマティック複雑度
4. 重複コードの検出
5. 改善ポイントをリストアップ

**期待される成果物**:

- `outputs/phase-8/code-quality-analysis.md`: コード品質分析結果

---

### タスク2: 共通処理の抽出

**目的**: 重複コードを共通メソッド/ヘルパーに抽出する

**実行手順**:

1. DrizzleChatSessionRepository と DrizzleChatMessageRepository で共通する処理を特定:
   - Mapper呼び出しパターン
   - エラーハンドリングパターン
   - ページネーション処理
2. 共通処理をプライベートメソッドまたはヘルパー関数に抽出
3. 抽出後、テストがパスすることを確認:
   ```bash
   pnpm --filter @repo/shared test -- --grep "Drizzle"
   ```

**期待される成果物**:

- リファクタリングされたコード

---

### タスク3: 型安全性の強化

**目的**: 型定義を改善し、型安全性を強化する

**実行手順**:

1. `any` 型の使用箇所を特定し、適切な型に置換
2. ジェネリクスの活用:
   - 共通処理での型パラメータ使用
3. 型ガードの追加:
   - Mapper変換結果のnullチェック
   - Result型のisOk/isErr判定
4. 型チェック実行:
   ```bash
   pnpm --filter @repo/shared typecheck
   ```
5. 型エラーがないことを確認

**期待される成果物**:

- 型安全性が強化されたコード

---

### タスク4: エラーハンドリングの改善

**目的**: エラーハンドリングを統一し、改善する

**実行手順**:

1. try-catch パターンの統一:
   - 共通のエラー変換ロジック
   - 適切なエラーメッセージ
2. カスタムエラークラスの活用:
   - `RepositoryError` の適切な使用
   - エラーコードの一貫性
3. ログ出力の追加（必要に応じて）
4. テスト実行で動作確認

**期待される成果物**:

- エラーハンドリングが改善されたコード

---

### タスク5: パフォーマンス最適化

**目的**: クエリパフォーマンスを最適化する

**実行手順**:

1. N+1問題の確認:
   - 関連データ取得でループ内クエリがないか
2. インデックス活用の確認:
   - WHERE句でインデックスが使われているか
3. 不要なデータ取得の削減:
   - SELECT \* ではなく必要なカラムのみ
4. バッチ処理の最適化:
   - `saveMany` のバルクインサート効率

**期待される成果物**:

- パフォーマンス最適化されたコード

---

### タスク6: リファクタリング後のテスト確認

**目的**: リファクタリング後もテストがパスすることを確認する

**実行手順**:

1. 全テスト実行:
   ```bash
   pnpm --filter @repo/shared test -- --grep "Drizzle"
   ```
2. 全テストがPASSすることを確認
3. カバレッジが維持されていることを確認:
   ```bash
   pnpm --filter @repo/shared test -- --coverage --grep "Drizzle"
   ```
4. 型チェック:
   ```bash
   pnpm --filter @repo/shared typecheck
   ```
5. Lint:
   ```bash
   pnpm --filter @repo/shared lint
   ```

**期待される成果物**:

- `outputs/phase-8/refactoring-result.md`: リファクタリング結果レポート

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                             | 内容                   |
| ------------------ | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |

### Phase 5/7成果物

| 参照資料           | パス                                                                                                   | 内容       |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ---------- |
| Session Repository | `packages/shared/src/features/chat-history/infrastructure/persistence/DrizzleChatSessionRepository.ts` | 実装コード |
| Message Repository | `packages/shared/src/features/chat-history/infrastructure/persistence/DrizzleChatMessageRepository.ts` | 実装コード |
| 最終カバレッジ     | `outputs/phase-7/coverage-final-report.md`                                                             | カバレッジ |

---

## 成果物

| 成果物                       | パス                                       | 内容         |
| ---------------------------- | ------------------------------------------ | ------------ |
| コード品質分析               | `outputs/phase-8/code-quality-analysis.md` | 分析結果     |
| リファクタリング結果         | `outputs/phase-8/refactoring-result.md`    | 結果レポート |
| リファクタリングされたコード | （各実装ファイル）                         | 改善コード   |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8での統合テスト連携アクション**:

- リファクタ後の統合テスト継続成功を確認
- 統合テストのパフォーマンスに影響がないことを確認

---

## 完了条件

- [ ] コード品質分析が完了している
- [ ] 共通処理の抽出が完了している
- [ ] 型安全性が強化されている（any型の排除）
- [ ] エラーハンドリングが統一されている
- [ ] パフォーマンス最適化が検討されている
- [ ] 全テストがPASSしている
- [ ] カバレッジが維持されている（Phase 7と同等以上）
- [ ] 型エラー・Lintエラーがない

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --grep "Drizzle"
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）がPASSで完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-9-quality.md`
