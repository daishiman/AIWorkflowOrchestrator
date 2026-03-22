# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 7                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

UI 分岐（LLM 生成/テンプレート生成/TerminalHandoff）のカバレッジを確認し、基準値を満たしていることを確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

1. カバレッジ計測コマンドを実行
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/
   ```
2. カバレッジレポートを確認
   - Line Coverage: 80% 以上（推奨 90%）
   - Branch Coverage: 60% 以上（推奨 70%）
   - Function Coverage: 80% 以上（推奨 90%）
3. UI 分岐ごとのカバレッジ確認
   - LLM 生成フロー分岐（planSkill 呼び出し）
   - テンプレート生成フロー分岐（skill:create 呼び出し）
   - TerminalHandoff 表示分岐（isGenerating=true/false）
   - エラー表示分岐（generationError の有無）
4. Zustand セレクタのカバレッジ確認
   - 個別セレクタ（useIsSkillGenerating 等）の呼び出しカバレッジ
5. 未達分岐がある場合は Phase 6 へ戻る

## 参照資料

- Phase 6 拡充済みテストファイル
- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md`（P40: テスト実行ディレクトリ依存）
- `.claude/rules/06-known-pitfalls.md`（P41: v8 カバレッジプロバイダ）

## 成果物

- カバレッジレポートサマリー（テキスト記録）
- UI 分岐ごとのカバレッジ達成状況表

## 完了条件

- [ ] `cd apps/desktop && pnpm vitest run --coverage` でカバレッジを計測した（P40対策）
- [ ] Line Coverage 80% 以上を確認した
- [ ] Branch Coverage 60% 以上を確認した
- [ ] Function Coverage 80% 以上を確認した
- [ ] LLM 生成/テンプレート生成/TerminalHandoff 全分岐がカバーされていることを確認した
- [ ] 未達の場合は Phase 6 へ戻り追加テストを実装した
- [ ] カバレッジ達成状況を本ファイルに記録した

## 次のPhase

Phase 8: リファクタリング
