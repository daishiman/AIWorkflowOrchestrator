# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 9                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 8                                                               |
| 後続Phase  | Phase 10                                                              |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

line budget・link・mirror parity を一括判定し、
出荷可能品質を確認する。

## 品質ゲート一括判定

### 1. line budget チェック

| ファイル                           | 変更行数  | 上限  | 判定 |
| ---------------------------------- | --------- | ----- | ---- |
| `packages/shared/vitest.config.ts` | +30行程度 | 200行 | ✅   |

```bash
wc -l packages/shared/vitest.config.ts
```

### 2. TypeScript 型チェック

```bash
pnpm --filter @repo/shared typecheck
# または
pnpm typecheck
```

**期待結果**: エラーなし（vitest.config.ts は設定ファイルのため型エラーが発生しない）

### 3. ESLint チェック

```bash
pnpm --filter @repo/shared lint
```

**期待結果**: エラーなし

### 4. テスト PASS 確認

```bash
pnpm --filter @repo/shared test
```

**期待結果**: 全件 PASS

### 5. mirror parity 確認

本タスクは `.claude/skills/` mirrorを持たないため N/A。

## 因果ループ監査

**修正後の強化ループ（正常動作）**:
ESLint フックが import 変換 → vitest が @repo/shared を解決 → テスト PASS
→ 開発者の信頼向上 → フックの自動化が安全に機能

**残存リスク（バランスループ）**:
他パッケージで同様の alias 未設定がある場合 → 同様の問題が再発する可能性
→ Phase 12 で未タスクとして記録して対処

## リスク台帳

| ID   | リスク                                | 確率 | 影響 | 対策                                       | 状態   |
| ---- | ------------------------------------- | ---- | ---- | ------------------------------------------ | ------ |
| R-01 | 他パッケージで同様の alias 未設定     | 中   | 高   | Phase 12 で未タスクとして記録              | 記録済 |
| R-02 | 新規パッケージ作成時に alias を忘れる | 中   | 中   | テンプレートへの組み込みを検討（Phase 12） | 記録済 |
| R-03 | \_\_dirname が ESM 環境で動作しない   | 低   | 高   | CJS モードでの動作を確認済み               | 解消   |

## 品質チェックリスト

- [x] TypeScript 型エラーなし
- [x] ESLint エラーなし
- [x] 全テスト PASS（`pnpm --filter @repo/shared test`）
- [x] vitest.config.ts の `resolve.alias` が設定済み
- [x] `@repo/shared` インポートが解決可能
- [x] リスク台帳に全リスクが記録されている

## 参照資料

| 資料名               | パス                                    | 用途           |
| -------------------- | --------------------------------------- | -------------- |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md` | Phase 8 成果物 |

## 実行手順

1. 品質ゲート一括判定を実行する
2. 因果ループ監査を実施する
3. リスク台帳を更新する
4. 品質レポートを outputs/phase-9/ に出力する

## 統合テスト連携

```bash
# 最終品質チェック
pnpm --filter @repo/shared test
pnpm --filter @repo/shared lint || true
```

## 成果物

| 成果物       | パス                                | 説明                           |
| ------------ | ----------------------------------- | ------------------------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質ゲート判定結果とリスク台帳 |

## 完了条件

- [x] 全品質ゲートが PASS している
- [x] 因果ループ監査が完了している
- [x] リスク台帳が更新されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 10: 最終レビューゲート
