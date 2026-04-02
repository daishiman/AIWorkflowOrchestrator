# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 8                                          |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

Phase 5〜7 で実装・テスト・カバレッジ確認を完了したコードについて、
`buildDisclosureInfo` の関数シグネチャと型安全性を検証し、
不要なコメント・TODO(DI) を除去して、関数名・変数名のスタイルを統一する。
lint/typecheck を実行して品質を確保する。

## 実行タスク

- タスク1: `buildDisclosureInfo` の関数シグネチャと型安全性確認
- タスク2: 不要コメント・`TODO(DI)` の除去
- タスク3: 関数名・変数名のスタイル統一確認
- タスク4: lint / typecheck 実行
- タスク5: Before/After/理由テーブル作成【必須】

## 実行手順

### ステップ1: `buildDisclosureInfo` の関数シグネチャと型安全性確認

```bash
# 実装箇所の確認
grep -n "buildDisclosureInfo\|DISCLOSURE_MODEL_NAME\|IAuthModeService" \
  apps/desktop/src/main/ipc/index.ts
```

確認観点:

- `buildDisclosureInfo(authModeService: IAuthModeService): DisclosureInfo` のシグネチャが正確か
- 戻り値が `DisclosureInfo` 型に完全準拠しているか（`aiServiceName`, `modelName`, `externalDestinations` の3フィールド）
- `DISCLOSURE_MODEL_NAME` が定数として適切に定義されているか
- `any` 型が使用されていないか

### ステップ2: 不要コメント・`TODO(DI)` の除去

```bash
# TODO(DI) が残存していないことを確認
grep -n "TODO(DI)\|placeholder\|static metadata" \
  apps/desktop/src/main/ipc/index.ts
```

確認観点:

- Phase 5 実装後に `TODO(DI): Replace getDisclosureInfo with actual service when available.` が除去されているか
- `Current placeholder returns static metadata.` 等の旧コメントが残っていないか
- 実装の意図を説明する適切なコメントが残されているか（過剰なコメントは不要）

### ステップ3: 関数名・変数名のスタイル統一確認

確認観点:

| 対象                        | 期待するスタイル          | 確認結果 |
| --------------------------- | ------------------------- | -------- |
| `buildDisclosureInfo`       | camelCase 関数名          | -        |
| `DISCLOSURE_MODEL_NAME`     | UPPER_SNAKE_CASE 定数     | -        |
| `authModeServiceForRuntime` | camelCase 変数名          | -        |
| `getDisclosureInfo`         | camelCase（既存命名維持） | -        |

### ステップ4: lint / typecheck 実行

```bash
# lint チェック
pnpm --filter @repo/desktop lint

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
```

エラーが発生した場合は修正してから次のステップに進む。

### ステップ5: Before/After/理由テーブル【必須】

リファクタリングで行った変更を記録する。変更がない場合も「変更なし」として記録する。

| 対象箇所         | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実施後に記載） | -      | -     | -    |

### ステップ6: テスト継続成功確認

リファクタリング後も全テストが PASS していることを確認する。

```bash
pnpm --filter @repo/desktop test -- --run
```

## 参照資料

| 資料名                     | パス                                              | 説明                             |
| -------------------------- | ------------------------------------------------- | -------------------------------- |
| Phase 2 設計書             | `phase-2-design.md`                               | `buildDisclosureInfo` の設計詳細 |
| Phase 5 実装               | `phase-5-implementation.md`                       | 実装内容の参照                   |
| Phase 7 カバレッジ確認     | `phase-7-coverage-check.md`                       | カバレッジ達成状況               |
| IPC ハンドラー定義         | `apps/desktop/src/main/ipc/disclosureHandlers.ts` | 変更対象ハンドラー               |
| placeholder 実装（変更前） | `apps/desktop/src/main/ipc/index.ts` L907-918     | TODO(DI) 除去の参照元            |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果   |
| ---------------------- | ---- | ------ |
| ユニットテストLine     | 80%+ | 未計測 |
| ユニットテストBranch   | 60%+ | 未計測 |
| ユニットテストFunction | 80%+ | 未計測 |
| lint                   | PASS | 未実行 |
| typecheck              | PASS | 未実行 |

## 成果物

| 成果物               | パス                                    | 説明                      |
| -------------------- | --------------------------------------- | ------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | Before/After/理由テーブル |

## 完了条件

- [ ] `buildDisclosureInfo` の関数シグネチャと型安全性が確認されている
- [ ] `TODO(DI)` および不要コメントが除去されている
- [ ] 関数名・変数名のスタイルが統一されている
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] Before/After/理由テーブルが作成されている（変更なしの場合も記録）
- [ ] リファクタリング後も全テストが PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク                            | 状態 | 備考 |
| --------------------------------- | ---- | ---- |
| 関数シグネチャ・型安全性確認      | -    | -    |
| 不要コメント・TODO(DI) 除去確認   | -    | -    |
| 関数名・変数名スタイル確認        | -    | -    |
| lint 実行                         | -    | -    |
| typecheck 実行                    | -    | -    |
| Before/After/理由テーブル作成     | -    | -    |
| リファクタリング後テスト PASS確認 | -    | -    |

## 次のPhase

Phase 9: 品質保証 → [phase-9-quality-assurance.md](phase-9-quality-assurance.md)

**ゲート**: lint / typecheck / テスト全 PASS 後にのみ Phase 9 へ進む。
