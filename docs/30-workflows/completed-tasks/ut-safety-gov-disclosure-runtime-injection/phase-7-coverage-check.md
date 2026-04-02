# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                             |
| --------- | ---------------------------------------------- |
| Phase     | 7                                              |
| 機能名    | ut-safety-gov-disclosure-runtime-injection     |
| 作成日    | 2026-04-02                                     |
| タスクID  | UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 |
| Issue     | #1804                                          |
| 前提Phase | Phase 6 テスト拡充・全テスト GREEN 済み        |

## 目的

Phase 5〜6 で実装・拡充したテストのカバレッジを計測し、目標値（Line 80%+、Branch 60%+、Function 80%+）の達成を確認する。
未達成の場合は Phase 6 に戻ってテストを追加する。

## カバレッジ目標値

| 指標     | 目標値 | 根拠                                   |
| -------- | ------ | -------------------------------------- |
| Line     | 80%+   | プロジェクト標準（統合テスト連携基準） |
| Branch   | 60%+   | プロジェクト標準（分岐網羅の最低限）   |
| Function | 80%+   | プロジェクト標準（公開関数の網羅）     |

## 実行タスク

- **カバレッジ計測**: `disclosureHandlers` 対象のカバレッジを計測
- **目標値照合**: Line / Branch / Function の各値を目標値と比較
- **ギャップ分析**: 未達成項目がある場合、カバーされていないコードパスを特定
- **Phase 6 フィードバック**: 未達成の場合 Phase 6 に戻り、テストを追加・修正

## 実行手順

### 1. カバレッジ計測

```bash
# disclosureHandlers のカバレッジ計測
pnpm --filter @repo/desktop test -- --coverage disclosureHandlers
```

#### 計測対象ファイル

| ファイル                                                         | 計測理由                             |
| ---------------------------------------------------------------- | ------------------------------------ |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`                | テスト対象の IPC ハンドラー          |
| `apps/desktop/src/main/ipc/index.ts`（buildDisclosureInfo 周辺） | buildDisclosureInfo の分岐カバレッジ |

### 2. カバレッジ結果の確認

計測結果を以下のテーブルに記録する：

| ファイル                    | Line   | Branch | Function | 判定         |
| --------------------------- | ------ | ------ | -------- | ------------ |
| disclosureHandlers.ts       | 未計測 | 未計測 | 未計測   | 計測後に記入 |
| index.ts（buildDisclosure） | 未計測 | 未計測 | 未計測   | 計測後に記入 |
| **総合**                    | 未計測 | 未計測 | 未計測   | 計測後に記入 |

### 3. ギャップ分析

目標値未達成の場合、未カバーのコードパスを確認する：

```bash
# カバレッジレポートの詳細確認（HTML形式）
pnpm --filter @repo/desktop test -- --coverage --reporter=html disclosureHandlers

# レポートのパス（生成後に確認）
open apps/desktop/coverage/index.html
```

#### 主要な未カバーパスの候補

| コードパス                                 | 対応テスト（Phase 6 追加） | 対応方針             |
| ------------------------------------------ | -------------------------- | -------------------- |
| `buildDisclosureInfo` の subscription 分岐 | Phase 6 で追加済み         | カバレッジ計測で確認 |
| `buildDisclosureInfo` の api-key 分岐      | Phase 6 で追加済み         | カバレッジ計測で確認 |
| `buildDisclosureInfo` の fallback 分岐     | Phase 6 で追加済み         | カバレッジ計測で確認 |
| sender 検証の UNAUTHORIZED 分岐            | Phase 4 で追加済み         | カバレッジ計測で確認 |
| `getDisclosureInfo` 例外時の catch 分岐    | Phase 4 で追加済み         | カバレッジ計測で確認 |

### 4. 目標値達成判定フロー

```
カバレッジ計測
  ↓
Line 80%+ かつ Branch 60%+ かつ Function 80%+ ?
  ├── YES → Phase 8（PR準備）へ進む
  └── NO  → 未達成パスを特定 → Phase 6 に戻る
```

#### 未達成時の対処方針

| 未達成指標    | 対処方法                                                                       |
| ------------- | ------------------------------------------------------------------------------ |
| Line 未達     | 実行されていない行を特定し、対応するテストケースを Phase 6 に追加              |
| Branch 未達   | 未テストの分岐（`if/else`、三項演算子）を特定し、境界値テストを Phase 6 に追加 |
| Function 未達 | 未テストの関数を特定し、関数単位のテストを Phase 6 に追加                      |

### 5. 最終テスト実行（全体確認）

カバレッジ目標達成後、全体テストを実行して既存テストへの影響がないことを確認する：

```bash
# disclosureHandlers 単体
pnpm --filter @repo/desktop test -- disclosureHandlers

# ipc 関連テスト全体
pnpm --filter @repo/desktop test -- --testPathPattern="ipc"
```

## 参照資料

| 資料名                     | パス                                                             | 説明                       |
| -------------------------- | ---------------------------------------------------------------- | -------------------------- |
| Phase 5 実装               | `phase-5-implementation.md`                                      | buildDisclosureInfo の実装 |
| Phase 6 テスト拡充         | `phase-6-test-expansion.md`                                      | 拡充テストケース一覧       |
| disclosureHandlers.test.ts | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | テスト対象ファイル         |
| disclosureHandlers.ts      | `apps/desktop/src/main/ipc/disclosureHandlers.ts`                | カバレッジ計測対象         |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果   |
| ---------------------- | ---- | ------ |
| ユニットテストLine     | 80%+ | 未計測 |
| ユニットテストBranch   | 60%+ | 未計測 |
| ユニットテストFunction | 80%+ | 未計測 |
| 全テスト GREEN         | PASS | 未計測 |

## 成果物

| 成果物                     | パス                                 | 説明                                   |
| -------------------------- | ------------------------------------ | -------------------------------------- |
| カバレッジレポート（最終） | `outputs/phase-7/coverage-final.txt` | 目標値達成確認済みのカバレッジレポート |
| ギャップ分析記録           | `outputs/phase-7/gap-analysis.md`    | 未達成時のギャップ分析（達成時は不要） |

## 完了条件

- [ ] `pnpm --filter @repo/desktop test -- --coverage disclosureHandlers` を実行した
- [ ] Line カバレッジが 80%+ に達している
- [ ] Branch カバレッジが 60%+ に達している
- [ ] Function カバレッジが 80%+ に達している
- [ ] 全テストが GREEN（PASS）
- [ ] 未達成の場合は Phase 6 に戻ってテストを追加した（必要な場合のみ）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                                 | 状態 | 備考                                                                |
| -------------------------------------- | ---- | ------------------------------------------------------------------- |
| カバレッジ計測実行                     | 未   | `pnpm --filter @repo/desktop test -- --coverage disclosureHandlers` |
| Line 目標値照合（80%+）                | 未   | 計測値を記録                                                        |
| Branch 目標値照合（60%+）              | 未   | 計測値を記録                                                        |
| Function 目標値照合（80%+）            | 未   | 計測値を記録                                                        |
| ギャップ分析（未達成時のみ）           | 未   | 未達成コードパスの特定                                              |
| Phase 6 フィードバック（未達成時のみ） | 未   | テスト追加後に本 Phase を再実行                                     |
| 最終テスト実行                         | 未   | `pnpm --filter @repo/desktop test -- disclosureHandlers`            |

## 次のPhase

Phase 8: PR 準備 → [phase-8-pr-preparation.md](phase-8-pr-preparation.md)

**ゲート**: カバレッジ目標（Line 80%+、Branch 60%+、Function 80%+）達成後にのみ Phase 8 へ進む。
未達成の場合は Phase 6 に戻る。
