# Phase 10: AC 充足マトリクス — TASK-RT-04

| AC   | 基準                          | 充足 | 根拠                                                   |
| ---- | ----------------------------- | ---- | ------------------------------------------------------ |
| AC-1 | ApiKeySettingsPanelが存在する | ✅   | `ApiKeySettingsPanel.tsx` 新規作成済み                 |
| AC-2 | バリデーションが機能する      | ✅   | 空文字・フォーマット・長さチェック実装、テスト通過     |
| AC-3 | 保存状態がUI上に表示される    | ✅   | 4状態(not_set/validating/configured/error)のバッジ表示 |
| AC-4 | 削除機能が動作する            | ✅   | delete IPC呼び出し + UI状態遷移、テスト通過            |
| AC-5 | SkillLifecyclePanelに統合     | ✅   | import + 「依頼をまとめる」セクション上部に配置        |

全AC充足。MINOR指摘なし。
