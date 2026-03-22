# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 10                     |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

多角的な品質・整合性の最終検証を行う。特に AC-5「フィードバックを入力すると改善提案（section/before/after/reason）が返り、ユーザーが承認すると SKILL.md に反映される」の検証を重点的に実施する。

## 実行タスク

1. 受入基準 AC-5 の検証
   - フィードバック入力 → LLM 呼び出し → 改善提案 JSON 取得のフローが動作する
   - 改善提案に section, before, after, reason が全て含まれる
   - ユーザー承認後に SKILL.md が正しく更新される
   - ロールバック機能が動作する
2. セキュリティ観点のレビュー
   - SKILL.md のパスにパストラバーサル攻撃が可能でないか確認（P42対策）
   - SkillFileManager の引数バリデーションを確認
3. エラーハンドリングの網羅性確認
   - 全エラーコードが定義されているか
   - エラーが適切に Renderer に返されているか（内部情報漏洩がないか）
4. 型安全性の最終確認
   - non-null assertion (`!`) の残存がないか（P52対策: `grep -n '!'`）
   - 型キャスト (`as`) の不当使用がないか
5. レビュー判定（PASS / MINOR / MAJOR / CRITICAL）
6. MINOR 以上の指摘を未タスク仕様書に変換

## 参照資料

- Phase 9 品質検証結果
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `.claude/rules/05-task-execution.md`（Phase 10 最終レビューゲート）
- `.claude/rules/06-known-pitfalls.md`（P48, P52: non-null assertion）

## 成果物

- 最終レビュー報告書
  - 判定: PASS / MINOR / MAJOR / CRITICAL
  - AC-5 達成確認記録
  - 指摘事項リスト

## 完了条件

- [ ] AC-5 の全達成条件を検証した
- [ ] セキュリティ観点（パストラバーサル、情報漏洩）を確認した
- [ ] エラーハンドリングの網羅性を確認した
- [ ] non-null assertion (`!`) の残存がないことを確認した（P52対策）
- [ ] 型キャスト (`as`) の不当使用がないことを確認した
- [ ] レビュー判定を PASS / MINOR / MAJOR / CRITICAL で明記した
- [ ] MINOR 以上の指摘は全て未タスク仕様書に変換した

## 次のPhase

Phase 11: 手動テスト
