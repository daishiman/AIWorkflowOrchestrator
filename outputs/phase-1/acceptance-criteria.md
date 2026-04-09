# Phase 1: 受け入れ基準 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

| AC番号 | 基準                                                          | 検証方法           | 結果                         |
| ------ | ------------------------------------------------------------- | ------------------ | ---------------------------- |
| AC-1   | `skill-lifecycle-request-input` textarea が削除               | grep確認           | PASS（PR #2036済み）         |
| AC-2   | `skill-lifecycle-execution-input` textarea が削除             | grep確認 + テスト  | PASS                         |
| AC-3   | `data-testid="skill-lifecycle-open-wizard-button"` ボタン追加 | screen.getByTestId | PASS（PR #2036済み）         |
| AC-4   | `executionPrompt` state がコードに残らない                    | grep確認           | PASS                         |
| AC-5   | 既存テストファイル6本が全てPASS                               | vitest run         | PASS（85テスト、18スキップ） |
| AC-6   | Phase 9 QA基準（live import ゼロ）                            | grep確認           | PASS                         |
| AC-7   | SkillCreateWizard本体実装なし                                 | スコープ外確認     | PASS                         |
| AC-8   | IPCチャンネル変更なし                                         | スコープ外確認     | PASS                         |
