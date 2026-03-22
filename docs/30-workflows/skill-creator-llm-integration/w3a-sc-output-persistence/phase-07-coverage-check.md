# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 7                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

SkillFileWriter の全メソッドと execute() の永続化パスのカバレッジ基準充足を計測・確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

1. **カバレッジ計測実行**
   - `pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/__tests__/SkillFileWriter.test.ts` を実行する
2. **基準確認**
   - Line Coverage ≥ 80%（推奨 90%）
   - Branch Coverage ≥ 60%（推奨 70%）
   - Function Coverage ≥ 80%（推奨 90%）
3. **分岐網羅確認**
   - `persist()` の正常系パス（全ファイル書き込み成功）が網羅されているか
   - `persist()` のエラーパス（バリデーション失敗・上書きガード・書き込みエラー）が網羅されているか
   - `validateSkillName()` の全パターン（正常・パストラバーサル・空文字列）が網羅されているか
   - ロールバックパス（途中失敗 → 部分ファイル削除）が網羅されているか
4. **v8 カバレッジプロバイダの注意点（P41 対策）**
   - インライン arrow function がカウントされているか確認する
   - カバレッジが低い場合は、コールバック関数の明示的な呼び出しテストを追加する
5. **未達時の対処**
   - 未達分岐を特定し、Phase 6 へ戻りテストを追加する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/04-phase-06-test-coverage.md`
- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md`（P41: v8 カバレッジプロバイダのインライン関数カウント）

## 成果物

- カバレッジレポート（コンソール出力）
- `docs/30-workflows/skill-creator-llm-integration/04-phase-07-coverage-output.md`（基準充足の記録）

## 完了条件

- [ ] Line Coverage ≥ 80% を達成した
- [ ] Branch Coverage ≥ 60% を達成した
- [ ] Function Coverage ≥ 80% を達成した
- [ ] `persist()` の全分岐が網羅されている
- [ ] `validateSkillName()` の全パターンが網羅されている
- [ ] ロールバックパスが網羅されている
- [ ] 未達の場合は Phase 6 へ戻りテストを追加した

## 次のPhase

Phase 8: リファクタリング
