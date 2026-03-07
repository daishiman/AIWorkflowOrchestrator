# Phase 4: 統合テストケース

## メタ情報

| 項目   | 内容                                          |
| ------ | --------------------------------------------- |
| Phase  | 4                                             |
| 機能名 | 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| 作成日 | 2026-03-06                                    |

## 統合テストシナリオ

### シナリオ 1: APIキー設定フロー

1. SettingsView を開く
2. auth-mode を api-key に切り替え
3. AuthKeySection が表示される
4. APIキーを入力
5. 保存ボタンをクリック
6. 保存成功後、緑バッジ「APIキー設定済み」が表示される

### シナリオ 2: 環境変数fallback表示

1. auth-mode を api-key に切り替え
2. authModeStatus.hasCredentials = false
3. authKeyAPI.exists() = { exists: true }
4. 黄バッジ「環境変数(ANTHROPIC_API_KEY)で実行可能ですが、設定画面には未保存です」

### シナリオ 3: APIキー削除フロー

1. auth-mode を api-key に切り替え
2. 保存済み状態（緑バッジ）
3. 削除ボタンをクリック
4. 削除成功後、赤バッジ「APIキーが未設定」に変更

### シナリオ 4: モード切替と AuthKeySection の連動

1. subscription モード → AuthKeySection 非表示
2. api-key モードに切替 → AuthKeySection 表示
3. subscription モードに戻す → AuthKeySection 非表示

### シナリオ 5: preflight との整合

1. auth-mode = api-key, 保存済みキーあり → preflight OK, SettingsView 緑バッジ
2. auth-mode = api-key, 環境変数のみ → preflight OK, SettingsView 黄バッジ
3. auth-mode = api-key, キーなし → preflight NG, SettingsView 赤バッジ
