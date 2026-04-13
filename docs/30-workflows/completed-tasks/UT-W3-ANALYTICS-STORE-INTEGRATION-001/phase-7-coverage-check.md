# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| フェーズ | Phase 7                                        |
| 機能名   | renderer analytics slice / SkillAnalytics 連携 |
| 作成日   | 2026-04-13                                     |
| 担当     | 実装担当者                                     |

---

## 目的

`analyticsSlice.ts` の変更行・ブランチの coverage を計測し、品質基準を満たしていることを可視化する。

Phase 4〜6 で作成したテストが実装の主要パスを十分にカバーしていることを数値で確認し、不足箇所があれば Phase 6 へ戻って補完する。

---

## 重要注意事項

- coverage 目標は「全体 X%」のような広域指定ではなく、**変更した関数・ブロックの line/branch coverage を明記すること**
- 計測対象は `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` に限定する（`skill-analytics.ts` の型定義ファイルは対象外）
- coverage 不足の場合はテストを追加して対処すること（実装を削減して coverage を上げることは禁止）
- coverage レポートは `outputs/phase-7/coverage-report.md` に実測値を記録すること

---

## coverage 目標

以下の目標値を**すべて**達成すること。

| 計測対象                  | 指標            | 目標値   |
| ------------------------- | --------------- | -------- |
| `analyticsSlice.ts` 全体  | line coverage   | 90% 以上 |
| `analyticsSlice.ts` 全体  | branch coverage | 85% 以上 |
| `trackSkillStart` 関数    | line coverage   | 100%     |
| `trackSkillComplete` 関数 | line coverage   | 100%     |
| `trackSkillError` 関数    | line coverage   | 100%     |

---

## 実行タスク

### T-07-1: coverage 計測実行

以下のコマンドで coverage を計測する。

```bash
pnpm --filter @repo/desktop test -- --run --coverage \
  apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

**確認事項**:

- コマンドがエラーなく完了すること
- coverage レポートが出力されること（通常は `coverage/` ディレクトリ、または標準出力に表示）
- `analyticsSlice.ts` の行が coverage レポートに含まれていること

**補足**: coverage レポートの出力形式を確認したい場合は以下のオプションを追加する。

```bash
# テキスト形式で標準出力に表示
pnpm --filter @repo/desktop test -- --run --coverage --reporter=text \
  apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts

# HTML レポートを生成（ブラウザで確認可能）
pnpm --filter @repo/desktop test -- --run --coverage --reporter=html \
  apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

---

### T-07-2: `analyticsSlice.ts` の line coverage / branch coverage 実測値を記録

coverage 計測結果から `analyticsSlice.ts` の実測値を抽出し、記録する。

出力先: `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-7/coverage-report.md`

**記録フォーマット**:

```markdown
# Coverage 実測値記録

## 計測日時

YYYY-MM-DD HH:MM:SS

## 計測コマンド

pnpm --filter @repo/desktop test -- --run --coverage \
 apps/desktop/src/renderer/store/slices/**tests**/analyticsSlice.test.ts

## analyticsSlice.ts 実測値

| 指標            | 実測値 | 目標値   | 判定        |
| --------------- | ------ | -------- | ----------- |
| line coverage   | XX%    | 90% 以上 | PASS / FAIL |
| branch coverage | XX%    | 85% 以上 | PASS / FAIL |

## 関数別 line coverage

| 関数名               | 実測値 | 目標値 | 判定        |
| -------------------- | ------ | ------ | ----------- |
| `trackSkillStart`    | XX%    | 100%   | PASS / FAIL |
| `trackSkillComplete` | XX%    | 100%   | PASS / FAIL |
| `trackSkillError`    | XX%    | 100%   | PASS / FAIL |

## カバーされていない行・ブランチ（FAIL の場合のみ）

| 行番号 | 内容 | 未カバーの理由 |
| ------ | ---- | -------------- |
| XX     | ...  | ...            |

## 総合判定

[ ] 全目標値を達成（Phase 8 へ進む）
[ ] 目標値未達成（Phase 6 へ戻る）
```

---

### T-07-3: 不足箇所がある場合 Phase 6 へ戻る

T-07-2 の記録で FAIL が1件以上ある場合、Phase 6 へ戻って不足テストを追加する。

**判断基準**:

| 状況                                                                                       | 対応                                                  |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 全目標値 PASS                                                                              | Phase 8 へ進む                                        |
| `analyticsSlice.ts` の line coverage が 90% 未満                                           | Phase 6 へ戻り fail path / edge case テストを追加する |
| `analyticsSlice.ts` の branch coverage が 85% 未満                                         | Phase 6 へ戻り条件分岐をカバーするテストを追加する    |
| `trackSkillStart` / `trackSkillComplete` / `trackSkillError` の line coverage が 100% 未満 | Phase 6 へ戻り該当関数のテストを補完する              |

**Phase 6 へ戻る手順**:

1. `outputs/phase-7/coverage-report.md` の「カバーされていない行・ブランチ」セクションを確認する
2. 未カバー箇所に対応するテストケースを設計する
3. Phase 6 の `T-06-1` または `T-06-3` に追記してテストを実装する
4. `T-06-4` で全 PASS を確認後、Phase 7 へ再度戻る

---

## coverage 計測コマンド（再掲）

```bash
pnpm --filter @repo/desktop test -- --run --coverage \
  apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

---

## 参照資料

| 資料名                 | パス                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充仕様 | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/phase-6-test-expansion.md`                |
| analyticsSlice 実装    | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                                         |
| テストファイル         | `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`                          |
| Phase 6 テスト拡充結果 | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-6/test-expansion-result.md` |

---

## 成果物

| 成果物              | パス                                                                                         | 説明                                            |
| ------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| coverage 実測値記録 | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-7/coverage-report.md` | line / branch coverage の実測値と目標値との比較 |

---

## 完了条件

- [ ] T-07-1: coverage 計測コマンドがエラーなく完了した
- [ ] T-07-2: `analyticsSlice.ts` の line coverage / branch coverage 実測値が `outputs/phase-7/coverage-report.md` に記録された
- [ ] T-07-2: 関数別（`trackSkillStart` / `trackSkillComplete` / `trackSkillError`）の line coverage が記録された
- [ ] T-07-3: 全目標値が PASS していること、または Phase 6 へ戻って補完済みであること
- [ ] `outputs/phase-7/coverage-report.md` の総合判定が「全目標値を達成」となっていること

---

## 次のフェーズへの移行条件

以下をすべて満たした後、Phase 8（統合確認）へ進む。

- `analyticsSlice.ts` の line coverage が 90% 以上
- `analyticsSlice.ts` の branch coverage が 85% 以上
- `trackSkillStart` / `trackSkillComplete` / `trackSkillError` の line coverage が 100%
- `outputs/phase-7/coverage-report.md` の総合判定が「全目標値を達成」
