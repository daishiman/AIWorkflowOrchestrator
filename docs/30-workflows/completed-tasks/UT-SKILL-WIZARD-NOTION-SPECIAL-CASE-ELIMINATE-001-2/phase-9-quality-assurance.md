# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 9                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 8                                           |
| 後続Phase  | Phase 10                                          |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

静的解析・型チェック・lint・テストを一括実行し、品質ゲートを通過していることを確認する。
Phase 1〜8 の成果物を横断的に検証し、Phase 10 への進行可否を判定する。

## 実行タスク

- 静的解析一括実行: typecheck + lint + test（shared / desktop 両パッケージ）
- エクスポート確認: `SemanticLabelEntry` / `SemanticLabelResult` / `resolveLabelEntry` が正しくエクスポートされているか
- 品質ゲート判定: 全項目 PASS 確認
- Phase 10 ブロッカー確認: 進行を阻害する問題がないか確認

## 参照資料

| 資料名         | パス                                                                          | 用途                     |
| -------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                                          | カバレッジ結果確認       |
| Phase 8 成果物 | `outputs/phase-8/refactoring-log.md`                                          | リファクタリング結果確認 |
| 型定義ファイル | `packages/shared/src/types/skill-wizard-label-map.ts`                         | 最終コード確認           |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 最終コード確認           |

## 実行手順

### 1. 静的解析一括実行

```bash
# 型チェック（shared パッケージ）
pnpm --filter @repo/shared typecheck

# 型チェック（desktop パッケージ）
pnpm --filter @repo/desktop typecheck

# lint（shared パッケージ）
pnpm --filter @repo/shared lint

# lint（desktop パッケージ）
pnpm --filter @repo/desktop lint

# テスト（shared パッケージ全件実行）
pnpm --filter @repo/shared exec vitest run \
  src/types/__tests__/skill-wizard-label-map.test.ts

# テスト（desktop パッケージ全件実行）
pnpm --filter @repo/desktop test
```

### 2. 品質ゲート判定テーブル

| チェック項目                                            | 基準            | 結果      |
| ------------------------------------------------------- | --------------- | --------- |
| TypeScript 型チェック（shared）                         | エラー 0 件     | completed |
| TypeScript 型チェック（desktop）                        | エラー 0 件     | completed |
| ESLint（shared）                                        | エラー 0 件     | completed |
| ESLint（desktop）                                       | エラー 0 件     | completed |
| ユニットテスト（skill-wizard-label-map）                | 全件 PASS       | completed |
| `SemanticLabelEntry` 型エクスポート確認                 | export 確認済み | completed |
| `SemanticLabelResult` 型エクスポート確認                | export 確認済み | completed |
| `resolveLabelEntry` 関数エクスポート確認                | export 確認済み | completed |
| notion 特別ケースコード削除確認                         | 該当コード不在  | completed |
| カバレッジ（`resolveLabelEntry` Line）                  | 100%            | completed |
| カバレッジ（`resolveLabelEntry` Branch）                | 100%            | completed |
| カバレッジ（`resolveLabelEntry` Function）              | 100%            | completed |
| カバレッジ（`skill-wizard-label-map.ts` Line 全体）     | 80%+            | completed |
| カバレッジ（`skill-wizard-label-map.ts` Branch 全体）   | 60%+            | completed |
| カバレッジ（`skill-wizard-label-map.ts` Function 全体） | 80%+            | completed |

### 3. エクスポート確認

```bash
# SemanticLabelEntry・SemanticLabelResult・QuestionSemanticLabelMap・resolveLabelEntry のエクスポート確認
grep -n "export.*SemanticLabelEntry\|export.*SemanticLabelResult\|export.*QuestionSemanticLabelMap\|export.*resolveLabelEntry\|export.*resolveSemanticLabel\|export.*SEMANTIC_LABEL_MAP" \
  packages/shared/src/types/skill-wizard-label-map.ts
```

期待出力:

```
N: export type SemanticLabelEntry = ...
N: export type SemanticLabelResult = ...
N: export type QuestionSemanticLabelMap = ...
N: export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
N: export function resolveSemanticLabel(...
N: export function resolveLabelEntry(...
```

### 4. notion 特別ケースコード削除確認

```bash
# 特別ケースコードが ConversationRoundStep.tsx に残存していないことを確認
grep -n "normalizedKey.*notion\|notion.*その他\|特別ケース" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
# 期待: 出力なし（削除済み）
```

### 5. slack / github 回帰確認

```bash
# slack・github の正常動作を確認するテストが PASS していることを確認
pnpm --filter @repo/shared exec vitest run \
  --reporter=verbose \
  src/types/__tests__/skill-wizard-label-map.test.ts 2>&1 | grep -E "slack|github|PASS|FAIL"
```

### 6. Phase 10 ブロッカー確認

| ブロッカー候補              | 状況      |
| --------------------------- | --------- |
| 型エラーあり（shared）      | completed |
| 型エラーあり（desktop）     | completed |
| lint エラーあり（shared）   | completed |
| lint エラーあり（desktop）  | completed |
| テスト失敗あり              | completed |
| カバレッジ目標未達          | completed |
| notion 特別ケースコード残存 | completed |
| エクスポート不足            | completed |

## 統合テスト連携【必須】

| 判定項目                                     | 基準             | 結果      |
| -------------------------------------------- | ---------------- | --------- |
| typecheck（shared + desktop）                | PASS             | completed |
| lint（shared + desktop）                     | 0 error          | completed |
| ユニットテスト全件（skill-wizard-label-map） | 全件 PASS        | completed |
| notion 特別ケース削除確認                    | コード不在       | completed |
| `resolveLabelEntry` カバレッジ               | Line/Branch 100% | completed |
| Phase 10 ブロッカー                          | なし             | completed |

## 多角的チェック観点

| 観点     | 確認内容                                                                                 |
| -------- | ---------------------------------------------------------------------------------------- |
| 矛盾     | 品質ゲート判定テーブルの各項目が実際の計測結果と矛盾していないか                         |
| 漏れ     | shared / desktop 両パッケージの型チェック・lint・テストが網羅されているか                |
| 整合性   | Phase 5〜8 の成果物が品質ゲートの全項目を満たしていることが確認されているか              |
| 依存関係 | 依存タスク `UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` との整合が保たれているか |

## 成果物

| 成果物           | パス                                | 説明                                    |
| ---------------- | ----------------------------------- | --------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 静的解析・テスト結果・Phase 10 進行可否 |

## 完了条件

- [ ] 型チェック（`pnpm typecheck`）が shared / desktop ともにエラー 0 件
- [ ] lint（`pnpm lint`）が shared / desktop ともにエラー 0 件
- [ ] ユニットテスト（skill-wizard-label-map）が全件 PASS
- [ ] `SemanticLabelEntry` / `SemanticLabelResult` / `resolveLabelEntry` のエクスポート確認済み
- [ ] notion 特別ケースコードが `ConversationRoundStep.tsx` に残存していないことを確認済み
- [ ] slack / github 回帰テストが PASS
- [ ] カバレッジ目標（`resolveLabelEntry` Line/Branch/Function 100%）達成
- [ ] カバレッジ目標（`skill-wizard-label-map.ts` 全体 Line 80%+ / Branch 60%+ / Function 80%+）達成
- [ ] Phase 10 ブロッカーなし
- [ ] 品質保証レポート作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 静的解析一括実行（typecheck + lint + test）
2. 品質ゲート判定テーブル確認
3. エクスポート確認
4. notion 特別ケースコード削除確認
5. slack / github 回帰確認
6. Phase 10 ブロッカー確認
7. 品質保証レポート作成

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビュー
