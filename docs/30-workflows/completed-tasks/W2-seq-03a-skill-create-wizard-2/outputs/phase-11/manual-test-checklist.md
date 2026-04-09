# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## NON_VISUAL チェックリスト

### ウィザード基本動作

- [x] Step 0（SkillInfoStep）が初期表示される
- [x] Step 0 で目的 10 文字以上 + カテゴリ選択で「次へ」が有効化される
- [x] Step 0 → Step 1 遷移時に inferSmartDefaults が呼び出される
- [x] Step 1（ConversationRoundStep）で smartDefaults が Props として受け取られる
- [x] Step 1 で「今すぐ生成する」→「生成する」で IPC が呼ばれる
- [x] IPC 成功後 Step 2（CompleteStep）に遷移する
- [x] Step 1 の「戻る」で Step 0 に戻り、formData が保持される

### 完了画面

- [x] 「今すぐ実行する」で onClose が呼ばれる
- [x] 「エディタで開く」で onClose が呼ばれる
- [x] 「別のスキルを作る」で Step 0 にリセットされる
- [x] 👎 ボタンで Step 0 に戻り、formData が保持される

### 旧設計削除確認

- [x] `data-testid="generation-mode-selector"` が存在しない
- [x] 「スキルの説明」テキストが存在しない（旧 DescribeStep UI）

### inferSmartDefaults 動作確認

- [x] Slack → tool='slack' が推論される
- [x] GitHub → tool='github' が推論される
- [x] Notion → tool='notion' が推論される
- [x] 毎日/定期 → timing='scheduled' が推論される
- [x] リアルタイム → timing='realtime' が推論される
- [x] category=code-support → format='code' が推論される
- [x] category=data-analysis → format='structured' が推論される
- [x] inferenceLog に推論根拠が記録される
