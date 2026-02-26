# Phase 7 カバレッジ戦略

## メタ情報

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- Phase: 7（テストカバレッジ確認）
- 作成日: 2026-02-25
- 前提: Phase 6 テスト拡充計画

## 測定対象

### プロダクションコード

| #   | ファイル                                     | 対象範囲                                                |
| --- | -------------------------------------------- | ------------------------------------------------------- |
| 1   | `apps/desktop/src/main/ipc/skillHandlers.ts` | `skill:execute` ハンドラ（L217-L283）を中心に全ハンドラ |
| 2   | `apps/desktop/src/preload/skill-api.ts`      | `execute()` メソッド（L224-L225）                       |

### テストファイル

| #   | ファイル                                                               | テスト数   | 主な観点                              |
| --- | ---------------------------------------------------------------------- | ---------- | ------------------------------------- |
| 1   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`    | 約20テスト | 正常系・エラー系・セキュリティ系      |
| 2   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` | 約55テスト | P42準拠3段バリデーション（6ハンドラ） |
| 3   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`   | 約15テスト | SkillExecutor注入・委譲統合           |

合計: 3ファイル・約90テスト

## 目標値（プロジェクト基準準拠）

### 最低基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

> プロジェクト基準: `.claude/rules/02-code-quality.md` カバレッジ基準に準拠

### skill:execute 固有の目標

| 指標                               | 目標値  | 根拠                                         |
| ---------------------------------- | ------- | -------------------------------------------- |
| skill:execute ハンドラ行カバレッジ | 90%以上 | 推奨基準に合致                               |
| skill:execute 分岐カバレッジ       | 70%以上 | isSkillNameRequest 型ガードによる2分岐を網羅 |
| High 優先テストケース実行率        | 100%    | Phase 6 で定義した High ケースの全実行       |

## 最小実行テストセット（Task 7-2）

Phase 7 ゲート通過に必須となる最小テストセット。

### 必須セット（High 優先度）

1. **バリデーション系（P42準拠）**
   - skillName パス: 空文字、trim空白、型不一致 → VALIDATION_ERROR
   - skillId パス: 空文字、trim空白、null、undefined、型不一致 → VALIDATION_ERROR
   - テスト対応: SH-EXE-V00-2, SH-EXE-V02〜V06, SH-BV-04, SH-BV-05

2. **委譲系（skillName → skillId 解決 → 実行）**
   - skillName で呼び出し → scanAvailableSkills → 名前一致 → executeSkill(skill.id, {prompt})
   - skillId で呼び出し → executeSkill(skillId, params)
   - テスト対応: TC-4-005 系, IT-002 系

3. **エラー伝播系**
   - サービス例外 → `{ success: false, error: "..." }` レスポンス
   - skillName 解決失敗 → `{ success: false, error: "スキルが見つかりません" }`
   - テスト対応: error handling 系, IT-003 系

4. **セキュリティ系**
   - validateIpcSender 失敗 → toIPCValidationError が throw
   - テスト対応: TC-4-007, TC-6-008, TC-6-009

### 推奨セット（Medium 優先度）

5. **回帰系**
   - skill:import / skill:remove の既存契約維持
   - unregisterSkillHandlers のクリーンアップ

## 測定方法

```bash
# skillHandlers.ts に限定したカバレッジ測定
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.execute.test.ts \
  src/main/ipc/__tests__/skillHandlers.validation.test.ts \
  src/main/ipc/__tests__/skillHandlers.delegate.test.ts \
  --coverage --coverage.include='src/main/ipc/skillHandlers.ts'
```

## 判定ルール

- 最低基準（Line 80%, Branch 60%, Function 80%）未達 → No-Go（Phase 6 へ戻りケース追加）
- High 優先ケース欠落 → No-Go（Phase 4 へ戻りテスト仕様再定義）
- 推奨基準（Line 90%, Branch 70%, Function 90%）未達 → MINOR として記録し Go 可能

## 完了条件

- [x] 測定対象を定義（プロダクションコード2ファイル、テスト3ファイル）
- [x] 目標値をプロジェクト基準に準拠して定義（最低/推奨の2段階）
- [x] 最小実行テストセットを定義（必須4カテゴリ + 推奨1カテゴリ）
- [x] 測定コマンドを記載
- [x] 判定条件を定義（Go/No-Go + 手戻り先）
