# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 7                      |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

improve() の全分岐のカバレッジを確認し、基準値（Line 80%、Branch 60%、Function 80%）を満たしていることを確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

1. カバレッジ計測コマンドを実行
   ```bash
   pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/runtime/RuntimeSkillCreatorFacade.ts
   ```
2. カバレッジレポートを確認
   - Line Coverage: 80% 以上（推奨 90%）
   - Branch Coverage: 60% 以上（推奨 70%）
   - Function Coverage: 80% 以上（推奨 90%）
3. improve() の全分岐カバレッジを個別確認
   - 正常系（LLM 呼び出し成功）
   - スキル不存在エラー
   - SKILL.md 読み込み失敗エラー
   - LLM 呼び出し失敗エラー
   - 不正 JSON パースエラー
   - バリデーションエラー（空フィードバック）
   - 提案 0 件ケース
4. 未達分岐がある場合は Phase 6 へ戻る

## 参照資料

- Phase 6 拡充済みテストファイル
- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md`（P41: v8 カバレッジプロバイダのインライン関数カウント）

## 成果物

- カバレッジレポートサマリー（テキスト記録）
- 各指標の達成状況表

## 完了条件

- [ ] カバレッジ計測コマンドを実行した
- [ ] Line Coverage 80% 以上を確認した
- [ ] Branch Coverage 60% 以上を確認した
- [ ] Function Coverage 80% 以上を確認した
- [ ] improve() の全主要分岐がカバーされていることを確認した
- [ ] 未達の場合は Phase 6 へ戻り追加テストを実装した
- [ ] カバレッジ達成状況を本ファイルに記録した

## 次のPhase

Phase 8: リファクタリング
