# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 6                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、plan() エラー時の UI フォールバックテストと既存 skill:create との共存テストを追加する。

## 実行タスク

1. カバレッジレポートの確認（未カバー UI 分岐の特定）
2. plan() エラー時の UI フォールバックテスト
   - E-1: planSkill が NETWORK_ERROR を返した場合、エラーメッセージが表示される
   - E-2: planSkill が VALIDATION_ERROR を返した場合、入力フォームにエラーが表示される
   - E-3: executePlan が失敗した場合、TerminalHandoff 表示が解除されエラーが表示される
3. 既存 skill:create との共存テスト
   - E-4: DescribeStep で「テンプレートから作成」を選択した場合、skill:create IPC が呼ばれる
   - E-5: LLM 生成フロー後に「別のスキルを作成」した場合、Zustand 状態がリセットされる
4. Zustand 状態リセットテスト
   - E-6: SkillCreateWizard がアンマウントされると generationError がリセットされる
5. ローディング状態の境界値テスト
   - E-7: planSkill 呼び出し中に「LLM で生成」ボタンが無効化される（二重送信防止）
6. アクセシビリティテスト
   - E-8: TerminalHandoff 中の ARIA ロール設定が正しいことを確認

## 参照資料

- Phase 5 実装後のカバレッジレポート
- Phase 4 テストファイル
- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md`（P9: テスト間状態リーク）
- `.claude/rules/01-architecture.md`（WCAG 2.1 AA アクセシビリティ）

## 成果物

- 拡充済みテストファイル（E-1〜E-8 追加）

## 完了条件

- [ ] E-1（NETWORK_ERROR フォールバック）テストを追加した
- [ ] E-2（VALIDATION_ERROR フォールバック）テストを追加した
- [ ] E-3（executePlan 失敗）テストを追加した
- [ ] E-4（テンプレート作成との共存）テストを追加した（AC-7）
- [ ] E-5（Zustand 状態リセット）テストを追加した
- [ ] E-6（アンマウント時のクリーンアップ）テストを追加した
- [ ] E-7（二重送信防止）テストを追加した
- [ ] E-8（ARIA ロール確認）テストを追加した
- [ ] 全テストが Green の状態になった

## 次のPhase

Phase 7: カバレッジ確認
