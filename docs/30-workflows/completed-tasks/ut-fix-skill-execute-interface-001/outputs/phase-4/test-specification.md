# Phase 4 テスト仕様

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 4
- 入力: Phase 2設計 + Phase 3レビュー結果（DG-01, DG-02）

## 対象

- チャネル: `skill:execute` (IPC_CHANNELS.SKILL_EXECUTE)
- 対象層: Main Handler（型ガード・バリデーション・名前解決・委譲）
- 主題: ユニオン型入力（skillName/skillId）の分岐処理とP42準拠バリデーション

## テスト方針

| カテゴリ           | 方針                                                | 優先度 |
| ------------------ | --------------------------------------------------- | ------ |
| 正常系             | skillNameパス: SkillExecutionRequestで実行委譲成功  | High   |
| 正常系             | skillIdパス: skillId直接指定で実行委譲成功          | High   |
| 型ガード           | isSkillNameRequest の判定ロジックが正しく分岐するか | High   |
| バリデーション     | skillName/skillIdのP42準拠3段バリデーション         | High   |
| バリデーション     | promptのP42準拠バリデーション（DG-01対応）          | Medium |
| 名前解決           | skillName → skillId の変換成功・失敗                | High   |
| エラーハンドリング | 各エラーパスで適切なエラー種別・メッセージ          | High   |
| セキュリティ       | sender検証の維持確認                                | High   |
| 回帰               | skill:import / skill:remove の既存契約を壊さない    | Medium |

## 既存テストファイルへの反映位置（3ファイル）

### 1. `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts` (637行)

- **現在のテスト内容**: skill:execute の正常系・異常系・型ガード分岐テスト
- **変更対象**:
  - 名前解決ロジック変更に伴うmock差分（scanAvailableSkills → getSkillByName）
  - promptバリデーションテストケース追加（DG-01対応）
  - 型ガード境界ケースの追加

### 2. `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts` (425行)

- **現在のテスト内容**: skill:execute の委譲先（executeSkill呼び出し）検証
- **変更対象**:
  - skillNameパスでの委譲時にskill.id（解決済み）が使われることの検証
  - getSkillByName使用時のmock設定更新

### 3. `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` (1010行)

- **現在のテスト内容**: 全skill:\*ハンドラのバリデーション検証
- **変更対象**:
  - skill:execute バリデーション期待値のskillNameパス対応
  - promptバリデーションテストケース追加（DG-01対応）
  - 型ガードで分岐しないケース（skillName/skillId両方を含む入力）の挙動検証

## テストID方針

| プレフィックス | カテゴリ                          | 例                                           |
| -------------- | --------------------------------- | -------------------------------------------- |
| EXE-HAPPY      | 正常系（実行成功）                | EXE-HAPPY-01: skillName指定で実行成功        |
| EXE-VAL        | バリデーション（入力検証エラー）  | EXE-VAL-01: skillName空文字                  |
| EXE-GUARD      | 型ガード分岐                      | EXE-GUARD-01: skillName存在時にskillNameパス |
| EXE-MAP        | 名前解決（skillName→skillId変換） | EXE-MAP-01: 存在するskillNameで正しいskillId |
| EXE-ERR        | エラーハンドリング                | EXE-ERR-01: executeSkill例外時のエラー返却   |
| EXE-SEC        | セキュリティ                      | EXE-SEC-01: sender検証失敗時の拒否           |
| EXE-REG        | 回帰                              | EXE-REG-01: skill:import正常系維持           |

## 完了記録

- [x] 正常/異常ケースが網羅されている
- [x] P42観点が反映されている（DG-01対応含む）
- [x] 既存テスト反映先が3ファイルで明記されている（実際のファイル名・行数付き）
