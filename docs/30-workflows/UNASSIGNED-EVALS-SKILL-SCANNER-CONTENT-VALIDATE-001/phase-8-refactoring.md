# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 8                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 7                                             |
| 後続Phase  | Phase 9                                             |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

実装後のコードから duplicate と navigation drift を削り、責務を適切に分離する。
`SkillScanner.ts` に追加したバリデーションロジックの責務境界を明確にし、
将来の `EvalsValidator`（先行タスク: UNASSIGNED-EVALS-VALIDATOR-GUARD-001）との接合点を整備する。

## リファクタ対象

### バリデーション処理の責務分離

Phase 5 で `SkillScanner.ts` にインラインで追加したバリデーションロジックを見直し、
SkillScanner 本来の責務（ファイルシステムのスキャン）から内容バリデーションを適切に分離する。

### 型定義の整理

`EvalsValidationResult` 型の定義箇所と export 範囲を確認し、将来の共通 validator との接続を容易にする。

## 変更内容テーブル

| 対象                           | Before                               | After                                                                  | 理由                                                                                       |
| ------------------------------ | ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| バリデーションロジック配置     | `SkillScanner.ts` 内にインライン実装 | プライベートヘルパー関数 `validateEvalsContent()` として抽出           | 単一責務原則（SRP）に従い、スキャン処理と検証処理を分離する                                |
| `EvalsValidationResult` 型定義 | `SkillScanner.ts` 内にローカル定義   | 同ファイル内で `export` し、テストから参照可能にする                   | 先行タスク（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）の共通型との将来的な置き換えを容易にする |
| camelCase/snake_case チェック  | 2箇所に分散したキー確認ロジック      | `isValidKey(camel: string, snake: string, obj: object)` ヘルパーに統一 | コードの重複排除（DRY 原則）                                                               |
| エラーメッセージ文字列         | 各チェック箇所にリテラル文字列       | `EVALS_VALIDATION_ERRORS` 定数オブジェクトに集約                       | メッセージの一貫性確保とテストでの参照容易性向上                                           |

## 責務境界マップ

```
SkillScanner（本タスクのスコープ）
  ├─ スキャン責務: スキルディレクトリの列挙・ファイル存在確認・サイズチェック
  ├─ バリデーション呼び出し責務: validateEvalsContent() を呼び出し結果を付加する
  └─ validateEvalsContent()（プライベートヘルパー）
       ├─ JSON パース（SyntaxError キャッチ）
       ├─ 空オブジェクトチェック
       ├─ 必須キーチェック（camelCase/snake_case 両許容）
       └─ 大容量ファイルスキップ判定

EvalsValidator（先行タスク: UNASSIGNED-EVALS-VALIDATOR-GUARD-001 のスコープ）
  └─ 将来: validateEvalsContent() を EvalsValidator に委譲する接合点を用意する
       └─ SkillScanner は EvalsValidator.validate() を呼び出すだけにする（移行後）
```

### SkillScanner vs EvalsValidator の責務境界

| 責務                              | 現在の担当                   | 将来の担当     | 移行方針               |
| --------------------------------- | ---------------------------- | -------------- | ---------------------- |
| ファイルシステムのスキャン        | SkillScanner                 | SkillScanner   | 変更なし               |
| EVALS.json の存在・サイズ確認     | SkillScanner                 | SkillScanner   | 変更なし               |
| EVALS.json のパース               | SkillScanner（本タスク追加） | EvalsValidator | 先行タスク完了後に委譲 |
| 必須キーバリデーション            | SkillScanner（本タスク追加） | EvalsValidator | 先行タスク完了後に委譲 |
| camelCase/snake_case ポリシー適用 | SkillScanner（本タスク追加） | EvalsValidator | 先行タスク完了後に委譲 |

## 再テスト計画

リファクタリング後に以下のテストを再実行し、動作変更がないことを確認する。

```bash
# リファクタリング後の全テスト再実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillScanner

# 型チェック（型のリファクタが正しいことを確認）
pnpm --filter @repo/desktop typecheck

# Lint（ヘルパー関数抽出後の警告がないことを確認）
pnpm --filter @repo/desktop lint
```

## 成果物

| 成果物         | パス                                             | 説明                                                                          |
| -------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | 実施したリファクタリングの内容と判断根拠（または不要判断の根拠）              |
| 再テスト計画   | `outputs/phase-8/retest-plan.md`                 | リファクタリング後の再テスト実行結果                                          |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | SkillScanner と EvalsValidator の責務境界の整理（先行タスクへの引き継ぎ情報） |

## 完了条件

- [ ] バリデーションロジックが `validateEvalsContent()` プライベートヘルパーとして抽出されている
- [ ] `EvalsValidationResult` 型が `export` されている
- [ ] camelCase/snake_case チェックが `isValidKey()` ヘルパーに統一されている
- [ ] エラーメッセージが `EVALS_VALIDATION_ERRORS` 定数に集約されている
- [ ] リファクタリング後も全テストが GREEN である
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 9: 品質保証
