# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 10                                         |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

AC-1〜AC-7 全ての受入基準が実装で満たされているかを確認し、
DENY-5 セキュリティ要件の最終確認と、実装ファイルと設計書（phase-2-design.md）との整合性を検証する。
総合判定 PASS/FAIL を記録し、Phase 11 への進行可否を判定する。

## 実行タスク

- タスク1: 受入基準（AC-1〜AC-7）全確認
- タスク2: DENY-5 セキュリティ要件の最終確認
- タスク3: 実装ファイルと設計書（phase-2-design.md）との整合性確認
- タスク4: 総合判定（PASS/FAIL）と記録

## 実行手順

### ステップ1: 受入基準チェックリスト（AC-1〜AC-7）

| AC ID | 受入基準                                                                       | 確認方法                       | 結果 |
| ----- | ------------------------------------------------------------------------------ | ------------------------------ | ---- |
| AC-1  | authMode が "subscription" のとき aiServiceName が "Claude Code CLI" になる    | テスト確認 / コード確認        | -    |
| AC-2  | authMode が "api-key" のとき aiServiceName が "Anthropic API" になる           | テスト確認 / コード確認        | -    |
| AC-3  | provider 未設定時（authMode が null/undefined）の fallback が "unknown" になる | テスト確認 / コード確認        | -    |
| AC-4  | `externalDestinations` には API key / token が含まれない                       | テスト確認 / コード確認        | -    |
| AC-5  | 送信元が mainWindow でない場合 UNAUTHORIZED エラーが返る                       | テスト確認                     | -    |
| AC-6  | `getDisclosureInfo()` が例外を投げた場合 DISCLOSURE_ERROR が返る               | テスト確認                     | -    |
| AC-7  | `disclosureHandlers.test.ts` が新規作成され全テストが PASS する                | CI / `pnpm test -- --run` 確認 | -    |

確認コマンド:

```bash
# AC-7: テスト全 PASS 確認
pnpm --filter @repo/desktop test -- --run

# AC-4: externalDestinations に apiKey が含まれないことを確認
grep -n "apiKey\|token\|api_key" \
  apps/desktop/src/main/ipc/disclosureHandlers.ts \
  apps/desktop/src/main/ipc/index.ts
```

### ステップ2: DENY-5 セキュリティ要件の最終確認

DENY-5 要件:「API key / token を renderer に返さない」

| 確認項目                                                       | 確認方法                        | 結果 |
| -------------------------------------------------------------- | ------------------------------- | ---- |
| `DisclosureInfo` 型に apiKey フィールドがないか                | `preload/types.ts` の型定義確認 | -    |
| `buildDisclosureInfo` の戻り値に apiKey が含まれないか         | コード確認（index.ts）          | -    |
| `externalDestinations: []` が固定であるか                      | コード確認（index.ts）          | -    |
| `aiServiceName` / `modelName` はプロバイダー名・モデル名のみか | コード確認                      | -    |

```bash
# DENY-5 確認: DisclosureInfo 型定義
grep -n "DisclosureInfo\|apiKey\|token" \
  apps/desktop/src/preload/types.ts
```

### ステップ3: 実装ファイルと設計書（phase-2-design.md）との整合性確認

| 設計書の設計内容                                                         | 実装での対応                                           | 整合性 |
| ------------------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| `DISCLOSURE_MODEL_NAME = "claude-sonnet-4-6"` の定数定義                 | `index.ts` で定数として定義されているか                | -      |
| `buildDisclosureInfo(authModeService: IAuthModeService): DisclosureInfo` | 関数シグネチャが設計通りか                             | -      |
| `mode === "subscription"` → `"Claude Code CLI"`                          | 分岐ロジックが設計通りか                               | -      |
| `mode === "api-key"` → `"Anthropic API"`                                 | 分岐ロジックが設計通りか                               | -      |
| その他 → `"unknown"`                                                     | fallback が設計通りか                                  | -      |
| `authModeServiceForRuntime` を DI として使用                             | 既存変数を使用しているか（新規変数を作成していないか） | -      |
| `disclosureHandlers.ts` 本体は変更しない                                 | `disclosureHandlers.ts` が変更されていないか           | -      |

```bash
# 設計との整合性確認
grep -n "buildDisclosureInfo\|DISCLOSURE_MODEL_NAME\|authModeServiceForRuntime" \
  apps/desktop/src/main/ipc/index.ts

# disclosureHandlers.ts が変更されていないことを確認（git diff）
git diff HEAD -- apps/desktop/src/main/ipc/disclosureHandlers.ts
```

### ステップ4: 総合判定

| カテゴリ            | 確認項目数 | PASS数 | 結果      |
| ------------------- | ---------- | ------ | --------- |
| 受入基準            | 7          | -      | PASS/FAIL |
| DENY-5 セキュリティ | 4          | -      | PASS/FAIL |
| 設計整合性          | 7          | -      | PASS/FAIL |

**総合判定**: PASS / FAIL

- **PASS**: 全項目 PASS → Phase 11 へ進む
- **MINOR**: 軽微な指摘あり → 修正後 Phase 11 へ進む
- **MAJOR**: 重大な指摘あり → 対応するフェーズに戻って修正
  - 受入基準の欠如 → Phase 5（実装）または Phase 4（テスト作成）へ戻る
  - セキュリティ要件違反 → Phase 5（実装）へ戻る
  - 設計整合性なし → Phase 2（設計）の見直しを検討

## 参照資料

| 資料名               | パス                                                             | 説明                           |
| -------------------- | ---------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義     | `phase-1-requirements.md`                                        | AC-1〜AC-7 の定義元            |
| Phase 2 設計書       | `phase-2-design.md`                                              | buildDisclosureInfo の設計詳細 |
| Phase 3 設計レビュー | `phase-3-design-review.md`                                       | レビュー結果・MINOR指摘事項    |
| テストファイル       | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | AC-1〜AC-7 の検証テスト        |
| 実装ファイル         | `apps/desktop/src/main/ipc/index.ts`                             | DI 接続実装箇所                |
| DisclosureInfo 型    | `apps/desktop/src/preload/types.ts`                              | DENY-5 確認の参照元            |

## 統合テスト連携【必須】

| 判定項目                 | 基準 | 結果   |
| ------------------------ | ---- | ------ |
| ユニットテストLine       | 80%+ | 未計測 |
| ユニットテストBranch     | 60%+ | 未計測 |
| ユニットテストFunction   | 80%+ | 未計測 |
| 結合テストAPI            | 100% | 未計測 |
| 結合テストシナリオ正常系 | 100% | 未計測 |
| 結合テストシナリオ異常系 | 80%+ | 未計測 |

## 成果物

| 成果物           | パス                                      | 説明                            |
| ---------------- | ----------------------------------------- | ------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC 確認・セキュリティ・総合判定 |

## 完了条件

- [ ] AC-1〜AC-7 が全て PASS している
- [ ] DENY-5 セキュリティ要件の全確認項目が PASS している
- [ ] 実装ファイルと設計書の整合性が確認されている
- [ ] 総合判定が記録されている（PASS / MINOR / MAJOR）
- [ ] 最終レビュー結果が `outputs/phase-10/final-review-result.md` に保存されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク                           | 状態 | 備考 |
| -------------------------------- | ---- | ---- |
| 受入基準（AC-1〜AC-7）全確認     | -    | -    |
| DENY-5 セキュリティ要件最終確認  | -    | -    |
| 実装ファイルと設計書の整合性確認 | -    | -    |
| 総合判定の記録                   | -    | -    |
| 最終レビュー結果ファイル作成     | -    | -    |

## 次のPhase

Phase 11: 手動テスト → [phase-11-manual-test.md](phase-11-manual-test.md)

**ゲート**: 総合判定 PASS または MINOR（修正完了後）のみ Phase 11 へ進む。
MAJOR / CRITICAL の場合は対応するフェーズへ戻る。
