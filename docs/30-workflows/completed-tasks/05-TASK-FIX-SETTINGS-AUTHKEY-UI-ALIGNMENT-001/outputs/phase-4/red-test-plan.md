# Phase 4: Red テスト計画

## メタ情報

| 項目   | 内容                                          |
| ------ | --------------------------------------------- |
| Phase  | 4                                             |
| 機能名 | 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| 作成日 | 2026-03-06                                    |

## Red テストケース

### AuthKeySection コンポーネント（新規）

| ID         | テストケース                               | 期待結果                                     | 対応する受入基準 |
| ---------- | ------------------------------------------ | -------------------------------------------- | ---------------- |
| TC-AKS-001 | コンポーネントが正しくレンダリングされる   | 入力フィールド、保存・削除ボタンが表示される | AC-01            |
| TC-AKS-002 | 保存済み状態で緑バッジが表示される         | "APIキー設定済み" の緑バッジが表示           | AC-03            |
| TC-AKS-003 | 環境変数fallback状態で黄バッジが表示される | "環境変数で実行可能" の黄バッジが表示        | AC-03            |
| TC-AKS-004 | 未設定状態で赤バッジが表示される           | "APIキーが未設定" の赤バッジが表示           | AC-03            |
| TC-AKS-005 | 確認失敗状態で灰バッジが表示される         | "状態確認に失敗" の灰バッジが表示            | AC-03            |
| TC-AKS-006 | APIキー入力・保存フローが動作する          | set() 呼び出し後にステータス更新             | AC-01            |
| TC-AKS-007 | APIキー削除フローが動作する                | delete() 呼び出し後にステータス更新          | AC-02            |
| TC-AKS-008 | パスワードマスクトグルが動作する           | type が password/text に切り替わる           | AC-05            |
| TC-AKS-009 | 空キーでバリデーションエラー               | "APIキーを入力してください" が表示           | AC-01            |
| TC-AKS-010 | a11y: aria-label が適切                    | 入力フィールドに aria-label がある           | AC-06            |

### SettingsView 統合テスト（既存拡充）

| ID            | テストケース                                        | 期待結果                                                   |
| ------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| TC-SV-INT-001 | api-key モードで AuthKeySection が表示される        | data-testid="auth-key-section" が DOM に存在               |
| TC-SV-INT-002 | subscription モードで AuthKeySection が表示されない | data-testid="auth-key-section" が DOM に不在               |
| TC-SV-INT-003 | モード切替後に AuthKeySection の表示が切り替わる    | subscription→api-key で表示、api-key→subscription で非表示 |

## テスト環境

- Vitest + @testing-library/react
- happy-dom 環境（fireEvent 使用、userEvent 使用禁止: P39）
- 個別セレクタモック（P31 対策）

## fixture 設計

- mockAuthKeyAPI: set/exists/validate/delete の共通モック
- mockAuthModeStatus: 4状態（保存済み/fallback/未設定/失敗）のファクトリ
