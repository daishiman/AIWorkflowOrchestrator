# Phase 5 ロールバック計画

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 5

## ロールバック発動条件

| 条件ID | 条件                                                                   | 重大度   | 検知方法                     |
| ------ | ---------------------------------------------------------------------- | -------- | ---------------------------- |
| RB-01  | skill:execute の正常系（EXE-HAPPY-01, EXE-HAPPY-04）が失敗             | Critical | テスト実行結果               |
| RB-02  | P42異常系（EXE-VAL-01〜09）で `VALIDATION_ERROR` が返却されない        | Critical | テスト実行結果               |
| RB-03  | skill:import / skill:remove 回帰テスト（EXE-REG-01, EXE-REG-02）が失敗 | Critical | テスト実行結果               |
| RB-04  | sender検証が回避可能になるセキュリティ回帰                             | Critical | EXE-SEC-01テスト             |
| RB-05  | getSkillByName が scanAvailableSkills + find と異なる結果を返す        | High     | EXE-MAP-01, EXE-MAP-02テスト |
| RB-06  | 型ガード分岐が意図と異なる（EXE-GUARD-01〜03 失敗）                    | High     | テスト実行結果               |

## ロールバック手順

### Critical条件（RB-01〜04）の場合

1. **即座に全変更をrevert**
   - `git revert HEAD` で最新コミットを取り消し
   - または `git stash` で未コミット変更を退避

2. **原因特定**
   - `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers` で全テスト実行
   - 失敗テストのエラーメッセージを確認

3. **手戻り先判定**
   - 契約設計の問題（getSkillByName の戻り値不整合）: Phase 2 へ
   - バリデーション設計の問題（prompt検証ロジック）: Phase 4 へ
   - テスト設計の問題（期待値の誤り）: Phase 4 へ

### High条件（RB-05, RB-06）の場合

1. **問題箇所のみ部分revert**
   - Step 1（名前解決変更）のみ、または Step 2（promptバリデーション）のみを取り消し

2. **テスト再実行で確認**
   - 部分revert後に既存テストが全PASS することを確認

3. **修正方針の再検討**
   - Phase 4 テストケースの期待値を見直し

## 手戻り先フェーズの判定基準

| 問題の種類                         | 手戻り先         | 判定基準                                                           |
| ---------------------------------- | ---------------- | ------------------------------------------------------------------ |
| 名前解決ロジックの根本的な設計問題 | Phase 2          | getSkillByNameとscanAvailableSkills+findの結果が構造的に異なる場合 |
| バリデーション規約の不備           | Phase 2          | P42準拠の規約自体に見直しが必要な場合                              |
| テストケースの期待値誤り           | Phase 4          | 実装は正しいがテストの期待値が間違っている場合                     |
| mockの設定不備                     | Phase 5 (Step 3) | mockの戻り値やスパイの設定が実装と不整合な場合                     |
| 品質ゲート基準の未達               | Phase 9          | テストは通るがカバレッジや品質指標が基準に満たない場合             |

## コミット分割方針

変更を巻き戻しやすくするため、以下の順序で個別コミットを推奨:

1. **Commit A**: Main Handler の名前解決ロジック変更（Step 1）
2. **Commit B**: promptバリデーション追加（Step 2）
3. **Commit C**: テスト更新（Step 3）
4. **Commit D**: 回帰テスト確認結果の記録（Step 4）

この分割により、Commit A のみのrevert、Commit B のみのrevert が可能になる。

## 完了記録

- [x] ロールバック発動条件が6件定義されている
- [x] Critical/Highの重大度別にロールバック手順が定義されている
- [x] 手戻り先フェーズの判定基準が明記されている
- [x] コミット分割方針が定義されている
