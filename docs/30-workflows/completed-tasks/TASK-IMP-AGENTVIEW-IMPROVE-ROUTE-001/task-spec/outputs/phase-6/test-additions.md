# Phase 6 追加テスト一覧

実施日: 2026-03-20

## 追加ファイル

新規作成:
`apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.coverage.test.tsx`

## 追加テスト一覧（17件）

| #   | テストグループ                               | テスト名                                                                                    | 対象行           | 目的                               |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------- |
| 1   | 実行キャンセル状態                           | skillExecutionStatus=cancelled のとき cancelled 履歴に追加し floatingStatus を idle に戻す  | L338-350         | cancelled ステータス遷移の検証     |
| 2   | TerminalHandoffCard 表示                     | handoffGuidance が存在するとき TerminalHandoffCard が表示される                             | L669-677         | handoffGuidance 表示条件           |
| 3   | TerminalHandoffCard 表示                     | handoffGuidance が null のとき TerminalHandoffCard は表示されない                           | L669-677         | null ガード確認                    |
| 4   | TerminalHandoffCard 表示                     | TerminalHandoffCard の Dismiss ボタンクリックで clearHandoffGuidance が呼ばれる             | L675             | dismiss コールバック検証           |
| 5   | FloatingExecutionBar onStop                  | FloatingExecutionBar の中止ボタンクリックで abortExecution が呼ばれる                       | L726-727         | onStop コールバック検証            |
| 6   | handleResetRemembered エラーブランチ         | clearRemembered が失敗したとき Error インスタンスのメッセージを含むエラートーストを表示する | L558-564         | Error インスタンス catch           |
| 7   | handleResetRemembered エラーブランチ         | clearRemembered が非 Error で失敗したとき汎用エラートーストを表示する                       | L558-564         | 非 Error catch                     |
| 8   | TerminalHandoffCard onCopyCommand            | コマンドをコピーボタンクリックで handleCopyHandoffCommand が呼ばれる                        | L673-674         | onCopyCommand インライン関数カバー |
| 9   | handleSkillSelect コールバック実行           | SkillChip クリックで selectSkill が呼ばれる                                                 | L439-440         | handleSkillSelect 内部コールバック |
| 10  | handleCopyHandoffCommand アーリーリターン    | handoffGuidance が null のとき clipboard.writeText は呼ばれない                             | L462-463         | null アーリーリターン              |
| 11  | handleCopyHandoffCommand 失敗                | clipboard.writeText が失敗したときエラートーストを表示する                                  | L468-469         | clipboard 失敗ブランチ             |
| 12  | handlePermissionModeChange setMode 未定義    | permissions API に setMode がないとき早期リターンしてトーストは出ない                       | L529-530         | setMode 未定義ガード               |
| 13  | handlePermissionModeChange 非 Error catch    | setMode が非 Error で失敗したとき汎用エラートーストを表示する                               | L539             | 非 Error catch ブランチ            |
| 14  | handleResetRemembered clearRemembered 未定義 | permissions API に clearRemembered がないとき カウントを 0 にリセットしてトーストは出ない   | L549-551         | clearRemembered 未定義ガード       |
| 15  | CTA selectedSkillName=undefined              | selectedSkillName=undefined のとき CTA を表示しない                                         | canOfferAnalysis | undefined 境界値テスト             |
| 16  | CTA skillExecutionStatus=cancelled           | skillExecutionStatus=cancelled のとき CTA を表示しない                                      | canOfferAnalysis | cancelled 境界値テスト             |
| 17  | CTA skillExecutionStatus=permission_pending  | skillExecutionStatus=permission_pending のとき CTA を表示しない                             | canOfferAnalysis | permission_pending 境界値テスト    |

## 技術的注意事項

- P39 準拠: happy-dom 環境のため `userEvent` ではなく `fireEvent` を使用
- P40 準拠: `cd apps/desktop && pnpm vitest run` で実行
- P41 対応: v8 カバレッジプロバイダはインライン Arrow Function を独立した関数としてカウントする
  → `onCopyCommand={() => { void handleCopyHandoffCommand(); }}` のインライン関数カバーが必要だった
- navigator.clipboard はテスト環境でモックが必要（Object.defineProperty で設定）
- TerminalHandoffCard の `guidance` props は `contextSummary` と `reason` フィールドも必須

## テスト実行結果

テスト追加後: 全 17 テスト PASS（失敗なし）
