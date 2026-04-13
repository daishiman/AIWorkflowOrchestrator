# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 9                                        |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| タスク名   | cronConverter 空曜日ガード処理追加       |
| 前提Phase  | Phase 8                                  |
| 後続Phase  | Phase 10                                 |
| 作成日     | 2026-04-12                               |
| ステータス | 未実施                                   |

## 目的

line budget・link・mirror parity を一括判定し、
`cronConverter.ts` の空文字退避ガードが正しく実装された状態で出荷可能品質を確認する。

## 実行タスク

1. ユニットテスト、型チェック、リントを実行して品質ゲートの結果を確認する
2. `cronConverter.ts` 内にガード処理と JSDoc の記述が存在することを確認する
3. 空曜日ケースの追加テストが存在し、既存テストも含めて PASS していることを確認する
4. 品質チェックリストの AC-1 から AC-5 を順に判定する
5. 因果ループ監査とリスク台帳を更新し、`outputs/phase-9/quality-check-result.md` に記録する

## 品質チェックリスト

- [ ] AC-1: `{ frequency: "weekly", weekdays: [] }` で不正なcron式（末尾スペース等）が生成されず、空文字が返る
- [ ] AC-2: 正常ケース（weekdaysに値あり）は引き続きPASS
- [ ] AC-3: 既存テスト全件PASS
- [ ] AC-4: 空曜日ケースの追加テストケースが存在し、PASSしている
- [ ] AC-5: `cronConverter.ts` のJSDocにガード処理仕様が記載されている
- [ ] TypeScript 型チェックPASS（エラーなし）
- [ ] ESLint チェックPASS（エラーなし）
- [ ] ガード処理が `cronConverter.ts` 内に実装されていること

## 実行コマンド

| コマンド                                                                                               | 目的                 | 期待結果                 |
| ------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------ |
| `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter`                                       | ユニットテスト全実行 | 全テストPASS             |
| `pnpm --filter @repo/desktop typecheck`                                                                | 型チェック           | エラーなし               |
| `pnpm --filter @repo/desktop lint`                                                                     | リント               | エラーなし               |
| `grep -n "weekdays\|visualConfigToCron\|return \"\"" apps/desktop/src/renderer/utils/cronConverter.ts` | ガード処理存在確認   | ガード処理が含まれること |

### コマンド実行例

```bash
# ユニットテスト全実行
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter

# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# ガード処理の存在確認
grep -n "weekdays\|visualConfigToCron\|空曜日\|empty\|guard\|return \"\"" \
  apps/desktop/src/renderer/utils/cronConverter.ts

# エッジケーステスト単体実行
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

## 品質ゲート一括判定

### 1. line budget チェック

| ファイル                                                      | 変更行数                        | 上限  | 判定   |
| ------------------------------------------------------------- | ------------------------------- | ----- | ------ |
| `apps/desktop/src/renderer/utils/cronConverter.ts`            | +20行程度（ガード処理 + JSDoc） | 300行 | 未確認 |
| `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | +30行程度（テストケース追加）   | 300行 | 未確認 |

```bash
wc -l apps/desktop/src/renderer/utils/cronConverter.ts
wc -l apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

### 2. TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラーなし

### 3. ESLint チェック

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラーなし

### 4. テスト PASS 確認

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter
```

**期待結果**: 全件 PASS（既存テスト + 新規エッジケーステスト）

### 5. ガード処理の存在確認

```bash
grep -n "weekdays\|visualConfigToCron\|空曜日\|empty\|guard\|return \"\"" \
  apps/desktop/src/renderer/utils/cronConverter.ts
```

**期待結果**: ガード処理のコードが含まれていること

## 統合テスト連携

本 Phase は最終的な品質ゲートであり、Phase 7 のカバレッジ確認と Phase 8 のリファクタリング結果を含めて判定する。
問題があれば Phase 6 のテスト拡充または Phase 8 の修正へ戻し、品質基準を満たした状態で確定する。

## 因果ループ監査

**修正後の強化ループ（正常動作）**:
空曜日ガードが `cronConverter.ts` 内で early return → 不正なcron式が生成されない
→ UIバリデーションとロジック層のガードが二重防御として機能
→ スケジュール機能の信頼性向上

**残存リスク（バランスループ）**:
UIバリデーションが将来変更された場合でも、純粋関数レベルのガードが機能するため安全。
ただし、他の `frequency` 種別での類似ガード漏れがある可能性
→ Phase 12 で未タスクとして記録して対処

## リスク台帳

| ID   | リスク                                                     | 確率 | 影響 | 対策                          | 状態   |
| ---- | ---------------------------------------------------------- | ---- | ---- | ----------------------------- | ------ |
| R-01 | 他のfrequency種別（monthly等）で同様の空値ガード漏れがある | 中   | 中   | Phase 12 で未タスクとして記録 | 未確認 |
| R-02 | ガード処理追加によって既存の正常ケースが回帰する           | 低   | 高   | AC-3のテストで回帰確認        | 未確認 |
| R-03 | JSDocの記述が不完全でAC-5を満たさない                      | 低   | 低   | コードレビューで確認          | 未確認 |

## サブタスク管理

| サブタスクID | 内容                           | 担当   | 状態   |
| ------------ | ------------------------------ | ------ | ------ |
| QA-01        | ユニットテスト全実行・結果記録 | Claude | 未実施 |
| QA-02        | 型チェック実行・結果記録       | Claude | 未実施 |
| QA-03        | リント実行・結果記録           | Claude | 未実施 |
| QA-04        | ガード処理存在確認             | Claude | 未実施 |
| QA-05        | AC-1〜AC-5 判定記録            | Claude | 未実施 |

## 参照資料

| 資料名               | パス                                    | 用途                 |
| -------------------- | --------------------------------------- | -------------------- |
| Phase 5 実装         | `phase-5-implementation.md`             | ガード処理実装の前提 |
| リファクタリング報告 | `outputs/phase-8/refactoring-result.md` | Phase 8 成果物       |
| テスト設計書         | `phase-4-test-creation.md`              | テストケース一覧     |

## 成果物

| 成果物           | パス                                      | 説明                                   |
| ---------------- | ----------------------------------------- | -------------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | 品質ゲート判定結果・AC確認・リスク台帳 |

## 完了条件

- [ ] 全品質ゲートが PASS している
- [ ] AC-1〜AC-5 が全て満たされている
- [ ] 因果ループ監査が完了している
- [ ] リスク台帳が更新されている
- [ ] 品質チェック結果が `outputs/phase-9/quality-check-result.md` に出力されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
```

## 次Phase

Phase 10: 最終レビューゲート
