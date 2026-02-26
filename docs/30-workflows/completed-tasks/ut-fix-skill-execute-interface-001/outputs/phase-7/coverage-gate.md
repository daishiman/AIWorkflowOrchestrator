# Phase 7 カバレッジゲート

## メタ情報

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- Phase: 7（テストカバレッジ確認）
- 作成日: 2026-02-25
- 前提: Phase 7 coverage-strategy.md

## ゲート定義

### 最低基準ゲート（全て PASS 必須）

| ゲートID | 条件                                  | 基準値 | 判定      | 根拠                         |
| -------- | ------------------------------------- | ------ | --------- | ---------------------------- |
| CG-01    | Line Coverage（skillHandlers.ts）     | >= 80% | PASS/FAIL | プロジェクト最低基準         |
| CG-02    | Branch Coverage（skillHandlers.ts）   | >= 60% | PASS/FAIL | プロジェクト最低基準         |
| CG-03    | Function Coverage（skillHandlers.ts） | >= 80% | PASS/FAIL | プロジェクト最低基準         |
| CG-04    | High 優先ケース実行率                 | = 100% | PASS/FAIL | Phase 6 定義の全 High ケース |

### 推奨基準ゲート（未達は MINOR 記録）

| ゲートID | 条件                                  | 基準値 | 判定       |
| -------- | ------------------------------------- | ------ | ---------- |
| CG-05    | Line Coverage（skillHandlers.ts）     | >= 90% | PASS/MINOR |
| CG-06    | Branch Coverage（skillHandlers.ts）   | >= 70% | PASS/MINOR |
| CG-07    | Function Coverage（skillHandlers.ts） | >= 90% | PASS/MINOR |

### P42 バリデーション専用ゲート（全て PASS 必須）

| ゲートID  | 条件                                  | 対象テスト       | 判定      |
| --------- | ------------------------------------- | ---------------- | --------- |
| CG-P42-01 | skillName 空文字 → VALIDATION_ERROR   | SH-EXE-V00-2     | PASS/FAIL |
| CG-P42-02 | skillName trim空白 → VALIDATION_ERROR | Phase 6 追加候補 | PASS/FAIL |
| CG-P42-03 | skillId 空文字 → VALIDATION_ERROR     | SH-EXE-V02       | PASS/FAIL |
| CG-P42-04 | skillId trim空白 → VALIDATION_ERROR   | SH-EXE-V03       | PASS/FAIL |
| CG-P42-05 | skillId null → VALIDATION_ERROR       | SH-EXE-V04       | PASS/FAIL |
| CG-P42-06 | skillId undefined → VALIDATION_ERROR  | SH-EXE-V05       | PASS/FAIL |
| CG-P42-07 | skillId 数値型 → VALIDATION_ERROR     | SH-EXE-V06       | PASS/FAIL |
| CG-P42-08 | skillId タブのみ → VALIDATION_ERROR   | SH-BV-04         | PASS/FAIL |
| CG-P42-09 | skillId CR+LF → VALIDATION_ERROR      | SH-BV-05         | PASS/FAIL |

## 判定フロー

```
1. テスト実行
   └─ pnpm vitest run（3テストファイル）

2. カバレッジ数値評価
   ├─ CG-01〜CG-03: 最低基準 → いずれか FAIL → No-Go
   └─ CG-05〜CG-07: 推奨基準 → いずれか MINOR → MINOR 記録

3. High 優先ケース実行率確認
   └─ CG-04: 100% 未満 → No-Go

4. P42 バリデーション確認
   └─ CG-P42-01〜09: いずれか FAIL → No-Go

5. 総合判定
   ├─ 全最低基準 PASS + 全P42 PASS + CG-04 PASS → Go
   ├─ 推奨基準 MINOR あり → Go（MINOR 記録）
   └─ いずれか FAIL → No-Go
```

## 失敗時アクション

| 失敗パターン                         | 手戻り先 | 対応内容                            |
| ------------------------------------ | -------- | ----------------------------------- |
| CG-01/02/03 FAIL（カバレッジ不足）   | Phase 6  | エッジケースカタログからケース追加  |
| CG-04 FAIL（High ケース欠落）        | Phase 4  | テスト仕様に欠落ケースを追加        |
| CG-P42-\* FAIL（バリデーション不備） | Phase 5  | ハンドラの3段バリデーション実装確認 |
| CG-05/06/07 MINOR（推奨基準未達）    | 記録のみ | Phase 10 open items として管理      |

## isSkillNameRequest 分岐カバレッジ詳細

skill:execute ハンドラの分岐カバレッジ上、以下の分岐パスが全て実行される必要がある。

| 分岐                     | true パス                                                  | false パス                                       |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| isSkillNameRequest(args) | skillName → scan → find → executeSkill(skill.id, {prompt}) | skillId → executeSkill(skillId, params)          |
| skillName バリデーション | 有効な skillName → 処理続行                                | 空/trim空/非string → VALIDATION_ERROR throw      |
| skillId バリデーション   | 有効な skillId → 処理続行                                  | 空/trim空/null/非string → VALIDATION_ERROR throw |
| skill = skills.find(...) | スキル発見 → executeSkill 呼び出し                         | スキル未発見 → `{ success: false }`              |
| try/catch                | 正常実行 → `{ success: true, data }`                       | 例外 → `{ success: false, error }`               |

## 完了条件

- [x] 最低基準ゲートを定義（CG-01〜CG-04）
- [x] 推奨基準ゲートを定義（CG-05〜CG-07）
- [x] P42バリデーション専用ゲートを定義（CG-P42-01〜09）
- [x] 失敗時の手戻り経路を定義
- [x] isSkillNameRequest 分岐カバレッジ詳細を記載
- [x] 判定フローを定義
