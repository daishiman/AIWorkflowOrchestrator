# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 8                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Phase 5/6 で実装したテストコードと Layer3/4 実装の重複・冗長性を解消し、保守性を高める。

## 実行タスク

- テストコードの重複 fixture 作成パターンをヘルパーに抽出する
- Layer3/4 実装のユーティリティ関数を共通化する
- チェック ID 定数化を検討する
- `validateLayer3` / `validateLayer4` の実装を Layer1/2 と一貫したパターンに揃える

## 参照資料

| 資料名       | パス                                                                       | 説明                   |
| ------------ | -------------------------------------------------------------------------- | ---------------------- |
| Phase 5 実装 | `phase-5-implementation.md`                                                | 実装済みテストコード   |
| Phase 6 拡充 | `phase-6-test-expansion.md`                                                | edge case テストコード |
| 既存実装     | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | Layer1/2 実装パターン  |

## リファクタリング対象

### テストコードの改善

| 対象                                 | 現状                                   | 改善後                                            |
| ------------------------------------ | -------------------------------------- | ------------------------------------------------- |
| Layer3 テスト用の繰り返し fixture    | 各テストで個別に `outputSchema` を構築 | `withJsonSchema(schema)` ヘルパーを追加           |
| Layer4 Anchors テスト用 SKILL.md     | 各テストで文字列を手書き               | `withAnchors(items)` ヘルパーを追加               |
| 結合テストの `fs.writeFile` パターン | 直接書き込み                           | `updateSkillFixture(dir, options)` ヘルパーに集約 |

### 実装コードの改善

| 対象                                   | 現状                    | 改善後                                                            |
| -------------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| `validateLayer3` の section 文字数計算 | インライン実装          | `extractSectionContent(content, heading)` に抽出                  |
| Layer3/4 の `createCheck` 呼び出し     | Layer1/2 と同じパターン | 差異がなければそのまま維持する                                    |
| `VALID_JSON_SCHEMA_TYPES` 定数         | 配列リテラル            | `const VALID_JSON_SCHEMA_TYPES = ["object", "array", ...]` に分離 |

## 実行手順

### ステップ1: テストヘルパーを整理する

- `createSkillFixture` の肥大化を防ぐため、Layer3/4 用ユーティリティを別関数として定義する
- 既存テスト（T-ENG-01 等）との整合性を確認する

### ステップ2: 実装のユーティリティを整理する

- `validateLayer3` / `validateLayer4` のロジックが Layer1/2 と同じパターンで書かれているか確認する
- 共通化できるユーティリティがあれば `SkillCreatorVerificationEngine.ts` のトップレベルに抽出する

### ステップ3: リファクタリング後に全テストを再実行する

```bash
pnpm --filter @repo/desktop vitest run
```

- デグレがないことを確認する

## 統合テスト連携

- Phase 9 でリファクタリング後の型整合性を確認する

## 成果物

| 成果物             | パス                     | 説明                       |
| ------------------ | ------------------------ | -------------------------- |
| リファクタリング書 | `phase-8-refactoring.md` | リファクタリング対象と結果 |

## 完了条件

- [ ] テストコードの重複が解消されている
- [ ] 実装コードのユーティリティが整理されている
- [ ] リファクタリング後に全テストが pass する
- [ ] **本Phase内の全タスクを100%実行完了**
