# カバレッジレポート - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 7

## AC → テストカバレッジ対応表

| AC   | 内容                               | テストファイル                                 | テスト数 | 判定            |
| ---- | ---------------------------------- | ---------------------------------------------- | -------- | --------------- |
| AC-1 | `auth-key:exists` が source を返す | `ApiKeySettingsPanel.test.tsx`                 | 4        | COVERED         |
| AC-2 | `auth-key:set` が保存を行う        | `ApiKeySettingsPanel.test.tsx`                 | 3        | COVERED         |
| AC-3 | `auth-key:validate` が有効性を返す | `ApiKeySettingsPanel.test.tsx`                 | 6        | COVERED         |
| AC-4 | `auth-key:delete` が削除を行う     | `ApiKeySettingsPanel.test.tsx`                 | 4        | COVERED         |
| AC-5 | 主導線・補助導線が同一契約を共有   | `SkillLifecyclePanel.auth-regression.test.tsx` | 7        | COVERED         |
| AC-6 | `ApiKeyStatus` が 4 値に収束       | `ApiKeySettingsPanel.test.tsx` (状態遷移全体)  | —        | COVERED         |
| AC-7 | エラー出力に API キーの生値なし    | セキュリティチェック (Phase 9)                 | —        | Phase 9 で確認  |
| AC-8 | Phase 9/11/12 の成果物整合         | Phase 10 最終レビュー                          | —        | Phase 10 で確認 |

## テストスイート別集計

| テストファイル                                 | describe 数 | テスト数 |
| ---------------------------------------------- | ----------- | -------- |
| `ApiKeySettingsPanel.test.tsx`                 | 8           | 26       |
| `SkillLifecyclePanel.auth-regression.test.tsx` | 8           | 8        |
| `authKeyHandlers.test.ts`                      | (既存)      | (既存)   |

## カバレッジ判定

| 区分                    | 判定                     |
| ----------------------- | ------------------------ |
| AC-1〜AC-6 のカバレッジ | SUFFICIENT               |
| エラーパス              | COVERED (Phase 6 で追加) |
| 境界値                  | COVERED (Phase 6 で追加) |
| 統合回帰                | COVERED                  |

**結論**: AC-1〜AC-6 のテストカバレッジは十分。Phase 8 へ進む。
