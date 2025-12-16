# RAG型定義改善 - タスク指示書

## メタ情報

| 項目             | 内容                                   |
| ---------------- | -------------------------------------- |
| タスクID         | CONV-03-01-IMPROVE                     |
| タスク名         | RAG型定義改善（JSDoc・テスト品質向上） |
| 分類             | 改善                                   |
| 対象機能         | RAG基本型・共通インターフェース        |
| 優先度           | 低                                     |
| 見積もり規模     | 小規模                                 |
| ステータス       | 未実施                                 |
| 発見元           | Phase 7 最終レビューゲート             |
| 発見日           | 2025-12-16                             |
| 発見エージェント | @code-quality, @unit-tester            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-03-01「RAG基本型・共通インターフェース定義」の最終レビューゲート（Phase 7）において、
3エージェント並列レビュー（@code-quality, @arch-police, @unit-tester）を実施した。

レビュー結果：

- `@code-quality`: MINOR判定 - JSDoc改善を推奨
- `@arch-police`: PASS判定 - 問題なし
- `@unit-tester`: MINOR判定 - 境界値テスト追加を推奨

現状でも本番使用可能な品質であり、機能・アーキテクチャ面での問題はないが、
ドキュメント品質とテスト網羅性の観点で改善の余地がある。

### 1.2 問題点・課題

1. **JSDoc @templateタグの欠如**
   - ジェネリック型パラメータに`@template`タグがない
   - IDE補完時の型情報が不十分

2. **エラーケース明示化の不足**
   - インターフェースメソッドの`@throws`タグがない
   - 発生しうるエラーがドキュメント上で不明確

3. **境界値テストの不足**
   - 型ガードの境界値（null、undefined、不正構造）テストがない
   - Zodスキーマの極端な値テストがない

4. **パフォーマンステストの欠如**
   - 大量データ処理時の性能検証がない

### 1.3 放置した場合の影響

- **開発者体験の低下**: IDE補完時の情報不足により、型の使い方が分かりにくい
- **バグ発見の遅延**: 境界値テストがないため、エッジケースのバグを見逃す可能性
- **保守性の低下**: エラーケースが明示されていないため、エラーハンドリングの漏れが発生しやすい
- **本番障害リスク**: パフォーマンス問題が本番環境で初めて発覚する可能性

ただし、これらは**緊急性は低い**。現状でもCONV-03-01の品質ゲートはすべてPASSしている。

---

## 2. 何を達成するか（What）

### 2.1 目的

RAG型定義のドキュメント品質とテスト網羅性を向上させ、
開発者が安心して使用できる基盤を強化する。

### 2.2 最終ゴール

- すべてのジェネリック型に`@template`タグが付与されている
- すべてのインターフェースメソッドに`@throws`タグが付与されている
- 型ガードとZodスキーマの境界値テストが追加されている
- パフォーマンステストが追加され、ベースラインが確立されている

### 2.3 スコープ

#### 含むもの

- JSDoc `@template`タグの追加
- JSDoc `@throws`タグの追加
- 境界値テストの追加（null, undefined, 不正構造, MAX_SAFE_INTEGER, Infinity）
- パフォーマンステストの追加（オプション）

#### 含まないもの

- 機能追加・変更
- アーキテクチャ変更
- 既存テストの削除・変更
- 新規型定義の追加

### 2.4 成果物

| 種別         | 成果物                                     | 配置先                                         |
| ------------ | ------------------------------------------ | ---------------------------------------------- |
| コード       | JSDoc改善済みの型定義ファイル              | `packages/shared/src/types/rag/*.ts`           |
| テスト       | 境界値テストファイル                       | `packages/shared/src/types/rag/__tests__/*.ts` |
| テスト       | パフォーマンステストファイル（オプション） | `packages/shared/src/types/rag/__tests__/*.ts` |
| ドキュメント | 改善完了レポート                           | `docs/30-workflows/rag-types-improvements/`    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-03-01が完了していること
- `@repo/shared`パッケージがビルド可能な状態であること
- Vitestが正常に動作すること

### 3.2 依存タスク

- CONV-03-01: RAG基本型・共通インターフェース定義（✅ 完了済み）

### 3.3 必要な知識・スキル

- TypeScript JSDoc記法（特に`@template`, `@throws`タグ）
- Vitestによるユニットテスト作成
- Zodスキーマの理解
- Result型・Branded Typesの理解

### 3.4 推奨アプローチ

1. **段階的実施**: 全改善を一度に行わず、関連ファイル更新時に順次実施
2. **優先順位**:
   - 高: JSDoc `@template`タグ（工数小、効果大）
   - 中: 境界値テスト追加（バグ防止効果）
   - 低: エラーケース明示化（CONV-03-02以降で実装が進んでから）
   - 低: パフォーマンステスト（RAGパイプライン完成後）

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（スキップ可 - 本ドキュメントで定義済み）
Phase 1: 設計（スキップ可 - 改善内容が明確）
Phase 2: 設計レビュー（スキップ可 - 軽微な改善のため）
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
Phase 7: 最終レビュー（軽量版）
Phase 8: 手動テスト（スキップ可 - ドキュメント改善のため）
Phase 9: ドキュメント更新
```

### Phase 3: テスト作成 (TDD: Red)

#### 目的

境界値テストを作成し、Red状態を確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests packages/shared/src/types/rag/__tests__/result.test.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: `@unit-tester`
- **選定理由**: 境界値テストの設計・実装に特化したエージェント
- **代替候補**: `@frontend-tester`（フロントエンド寄りの場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                  | 活用方法                               | 選定理由                     |
| ------------------------- | -------------------------------------- | ---------------------------- |
| `boundary-value-analysis` | 境界値の特定と網羅的なテストケース設計 | 境界値テスト設計の体系的手法 |
| `tdd-principles`          | Red-Green-Refactorサイクルの遵守       | TDDプロセスの品質確保        |
| `zod-validation`          | Zodスキーマの境界値テスト設計          | Zodスキーマ固有のテスト観点  |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                   | パス                                                      |
| ------------------------ | --------------------------------------------------------- |
| 境界値テスト（Result型） | `packages/shared/src/types/rag/__tests__/result.test.ts`  |
| 境界値テスト（Zod）      | `packages/shared/src/types/rag/__tests__/schemas.test.ts` |

#### 完了条件

- [ ] 型ガードの境界値テスト（null, undefined, 不正構造）が追加されている
- [ ] Zodスキーマの境界値テスト（MAX_SAFE_INTEGER, Infinity）が追加されている
- [ ] テストがRed状態（失敗）であることを確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

JSDocの改善とテストを通すための実装を行う。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor packages/shared/src/types/rag/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: `@code-quality`
- **選定理由**: JSDocの品質改善に特化したエージェント
- **代替候補**: `@logic-dev`（ロジック変更が必要な場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法                  | 選定理由                     |
| ---------------------- | ------------------------- | ---------------------------- |
| `code-style-guides`    | JSDoc記法の標準化         | 一貫したドキュメントスタイル |
| `type-safety-patterns` | @templateタグの適切な使用 | 型安全性の向上               |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                        | パス                                          |
| ----------------------------- | --------------------------------------------- |
| JSDoc改善済みResult型         | `packages/shared/src/types/rag/result.ts`     |
| JSDoc改善済みインターフェース | `packages/shared/src/types/rag/interfaces.ts` |
| JSDoc改善済みスキーマ         | `packages/shared/src/types/rag/schemas.ts`    |

#### 完了条件

- [ ] すべてのジェネリック型に`@template`タグが付与されている
- [ ] インターフェースメソッドに`@throws`タグが付与されている
- [ ] テストがGreen状態（成功）であることを確認

---

### Phase 6: 品質保証

#### 目的

改善後のコードが品質基準を満たすことを確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: `@unit-tester`
- **選定理由**: テスト実行と品質検証に特化
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 全テスト成功
- [ ] カバレッジ100%維持
- [ ] Lintエラーなし
- [ ] 型エラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `@template`タグが全ジェネリック型に付与されている
- [ ] `@throws`タグが全インターフェースメソッドに付与されている
- [ ] 境界値テスト（null, undefined, 不正構造）が追加されている
- [ ] Zodスキーマ境界値テスト（MAX_SAFE_INTEGER, Infinity）が追加されている

### 品質要件

- [ ] 全テスト成功（324+新規テスト）
- [ ] カバレッジ100%維持
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] ビルド成功

### ドキュメント要件

- [ ] 改善完了レポートが作成されている

---

## 6. 検証方法

### テストケース

| No  | テスト項目                       | 期待結果                        |
| --- | -------------------------------- | ------------------------------- |
| 1   | `@template`タグの存在確認        | IDEでホバー時に型情報が表示     |
| 2   | `@throws`タグの存在確認          | IDEでホバー時にエラー情報が表示 |
| 3   | 境界値テスト（null）             | `isOk(null)`がfalseを返す       |
| 4   | 境界値テスト（undefined）        | `isOk(undefined)`がfalseを返す  |
| 5   | 境界値テスト（MAX_SAFE_INTEGER） | スキーマが正常に検証            |
| 6   | 境界値テスト（Infinity）         | スキーマが拒否                  |

### 検証手順

1. `pnpm --filter @repo/shared build` でビルド成功を確認
2. `pnpm --filter @repo/shared test:run` で全テスト成功を確認
3. `pnpm --filter @repo/shared test:coverage` でカバレッジ100%を確認
4. IDEでJSDoc情報が正しく表示されることを確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                         |
| ---------------------------------- | ------ | -------- | ---------------------------- |
| JSDoc変更による型推論への影響      | 低     | 低       | 変更後に型チェックを実行     |
| 境界値テスト追加による実行時間増加 | 低     | 中       | テストを適切にグループ化     |
| 他タスクとのコンフリクト           | 中     | 低       | 関連ファイル更新時に順次実施 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/rag-base-types/step07-review-report.md` - 元レビューレポート
- `docs/30-workflows/rag-base-types/step09-completion.md` - CONV-03-01完了レポート
- `docs/00-requirements/06-core-interfaces.md` - コアインターフェース仕様

### 参考資料

- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Zod Documentation](https://zod.dev/)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
@code-quality (MINOR):
- JSDocの@templateタグをジェネリック型パラメータに追加することを推奨
- インターフェースメソッドに@throwsタグを追加することを推奨

@unit-tester (MINOR):
- 型ガードの境界値テスト（null, undefined, 不正な構造）の追加を推奨
- Zodスキーマの境界値テスト（MAX_SAFE_INTEGER, Infinity）の追加を推奨
- パフォーマンステストの追加を検討
```

### 補足事項

- 本タスクは緊急性が低いため、他のタスク（CONV-03-02等）の実施中に順次対応することを推奨
- パフォーマンステストはRAGパイプライン完成後に実施することを推奨
- 見積もり工数: 合計約7.5時間（JSDoc: 1.5h, テスト: 6h）
