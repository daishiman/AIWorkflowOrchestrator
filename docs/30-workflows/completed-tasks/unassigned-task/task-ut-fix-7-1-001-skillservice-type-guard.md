# UT-FIX-7-1-001 SkillService型アサーション→型ガード改善

## メタ情報

```yaml
issue_number: 775
task_id: UT-FIX-7-1-001
task_name: SkillService型アサーション→型ガード改善
category: リファクタリング
target_feature: スキル管理サービス
priority: 低
scale: 小規模
status: 未実施
```

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-FIX-7-1-001                                                   |
| タスク名     | SkillService型アサーション→型ガード改善                          |
| 分類         | リファクタリング                                                 |
| 対象機能     | スキル管理サービス                                               |
| 優先度       | 低                                                               |
| 見積もり規模 | 小規模                                                           |
| ステータス   | 未実施                                                           |
| 発見元       | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12（コード品質確認） |
| 発見日       | 2026-02-11                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SkillService.ts の scanAvailableSkills メソッド内（L70付近）で、エラーオブジェクトの処理に型アサーション `(error as Error).message` が使用されている。TypeScript の型安全性ルールでは、型アサーションはランタイム検証をバイパスするため、可能な限り型ガードへの置き換えが推奨されている。

### 1.2 問題点・課題

- `catch` ブロックで捕捉される `error` は `unknown` 型であり、必ずしも `Error` インスタンスとは限らない
- 型アサーション `as Error` は実行時検証を行わないため、`Error` 以外の値（文字列、オブジェクト等）が throw された場合に予期しない動作を引き起こす可能性がある
- コードベースの型安全性ポリシー（02-code-quality.md）に反する

### 1.3 放置した場合の影響

- 非 `Error` 型の例外が throw された場合、`undefined` が返されるか、ランタイムエラーが発生する可能性がある
- コード品質レビューで繰り返し指摘される
- チーム内での型安全性の一貫性が損なわれる

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillService.ts 内の型アサーションを型ガード関数に置き換え、ランタイムでの安全なエラーハンドリングを実現する。

### 2.2 最終ゴール

- `(error as Error).message` パターンが型ガード関数 `isError()` を使用したパターンに置換されている
- 型ガード関数がプロジェクト共通のユーティリティとして利用可能である
- 既存のテストが全て PASS する

### 2.3 スコープ

#### 含むもの

- SkillService.ts 内の型アサーションの修正
- 型ガード関数 `isError()` の作成または既存ユーティリティの利用
- 関連するテストの更新（必要な場合）

#### 含まないもの

- 他のサービスファイルでの同様の修正（別タスクとして検出）
- エラーハンドリングパターン全体の見直し
- Result<T, E> パターンへの全面移行

### 2.4 成果物

| 成果物               | パス                                                            |
| -------------------- | --------------------------------------------------------------- |
| 修正済みSkillService | `apps/desktop/src/main/services/skill/SkillService.ts`          |
| 型ガード関数（新規） | `apps/desktop/src/main/utils/typeGuards.ts`（または既存に追加） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION が完了していること

### 3.2 依存タスク

| タスクID                              | 依存内容             |
| ------------------------------------- | -------------------- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 対象コードの実装完了 |

### 3.3 必要な知識

- TypeScript 型ガード（User-Defined Type Guards）
- エラーハンドリングパターン

### 3.4 システム仕様書参照

| 仕様書                 | 参照セクション                       |
| ---------------------- | ------------------------------------ |
| `02-code-quality.md`   | TypeScript型安全、型アサーション禁止 |
| `06-known-pitfalls.md` | P19: 型キャストによる検証バイパス    |

### 3.5 実装課題と解決策（TASK-FIX-7-1からの学び）

TASK-FIX-7-1-EXECUTE-SKILL-DELEGATIONの実装で遭遇した課題と解決策を記録する。
このタスクを実行する際の参考情報として活用すること。

#### 課題1: 型ガード関数の配置場所

| 観点   | 内容                                                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | 型ガード関数を`@repo/shared`に配置するか、`apps/desktop`のutils内に配置するか                                                     |
| 解決策 | 現時点では`apps/desktop/src/main/utils/typeGuards.ts`に配置。将来的に他パッケージで再利用が必要になった場合に`@repo/shared`に移動 |
| 参照   | `architecture-monorepo.md` - モノレポ構造                                                                                         |

#### 課題2: 非Errorオブジェクトのフォールバック

| 観点   | 内容                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| 問題   | Error以外の値（文字列、オブジェクト等）がthrowされた場合の処理                                                      |
| 解決策 | `String(error)`でフォールバック。オブジェクトの場合はJSON.stringifyも検討したが、循環参照リスクを考慮しStringを採用 |
| 参照   | `error-handling.md` - エラーハンドリング原則                                                                        |

#### システム仕様書参照

| 仕様書                 | 参照セクション | 適用内容                           |
| ---------------------- | -------------- | ---------------------------------- |
| `06-known-pitfalls.md` | P19            | 型キャストによる実行時検証バイパス |
| `error-handling.md`    | エラーカテゴリ | Internal Error (5000-5999)         |
| `lessons-learned.md`   | 型変換パターン | Skill → SkillMetadata 変換の教訓   |

### 3.6 推奨アプローチ

```typescript
// Before: 型アサーション
errors.push({
  path: skillPath,
  error: (error as Error).message,
  code: "PARSE_ERROR",
});

// After: 型ガード
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

errors.push({
  path: skillPath,
  error: isError(error) ? error.message : String(error),
  code: "PARSE_ERROR",
});
```

---

## 4. 実行手順

### Phase構成

標準 Phase 1-13 に従う。小規模タスクのため Phase 4-9 を簡略化可能。

### Phase 5: 実装

#### 目的

型ガード関数の作成とSkillService.tsへの適用

#### 手順

1. 既存の型ガードユーティリティを確認（`utils/` ディレクトリ）
2. `isError()` 型ガード関数が存在しなければ作成
3. SkillService.ts L70 付近の型アサーションを型ガードに置換
4. テスト実行で既存動作の維持を確認

#### 成果物

- 修正済み SkillService.ts
- 型ガード関数

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `(error as Error).message` パターンが削除されている
- [ ] 型ガード関数 `isError()` が使用されている
- [ ] Error 以外の値が throw された場合も安全に処理される

### 品質要件

- [ ] 既存テストが全て PASS
- [ ] Lint エラーなし
- [ ] 型エラーなし

### ドキュメント要件

- [ ] 必要に応じてコードコメント追加

---

## 6. 検証方法

### テストケース

| #   | テストケース                      | 期待結果                         |
| --- | --------------------------------- | -------------------------------- |
| 1   | Error インスタンスが throw された | error.message が正しく取得される |
| 2   | 文字列が throw された             | 文字列がそのまま使用される       |
| 3   | オブジェクトが throw された       | String() で変換される            |

### 検証手順

1. `pnpm test apps/desktop/src/main/services/skill/` を実行
2. 全テストが PASS することを確認
3. `pnpm lint` でエラーがないことを確認

---

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                      |
| ------------------------------- | ------ | -------- | ------------------------- |
| 非Errorオブジェクトの文字列変換 | 低     | 低       | String() でフォールバック |
| 既存テストの失敗                | 低     | 低       | 事前にテスト実行で確認    |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント     | パス                                                   |
| ---------------- | ------------------------------------------------------ |
| コード品質ルール | `.claude/rules/02-code-quality.md`                     |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md#P19`               |
| SkillService実装 | `apps/desktop/src/main/services/skill/SkillService.ts` |

### 参考資料

- TypeScript Handbook: Narrowing - User-Defined Type Guards
- error-handling.md - エラーハンドリング原則

---

## 9. 備考

### 発見経緯

```
TASK-FIX-7-1 Phase 12 コード品質確認:
SkillService.ts L70 で型アサーション (error as Error).message を検出。
02-code-quality.md の「型アサーション（as）でバリデーションを回避しない」
ルールに該当するため、未タスクとして記録。
```

### 補足事項

- プロジェクト全体で同様のパターンが存在する可能性があり、包括的な調査が別途必要
- 型ガード関数は `@repo/shared` に配置することも検討可能
