# Phase 4 テスト仕様書 — UT-FIX-SKILL-REMOVE-INTERFACE-001

## 作成日時

2026-02-20

## テストケース一覧

| ID       | 種別         | テスト内容                                       | 引数              | 期待結果                                               |
| -------- | ------------ | ------------------------------------------------ | ----------------- | ------------------------------------------------------ |
| SH-RM-01 | 正常系(修正) | 文字列引数で skillService.removeSkill が呼ばれる | "skill-to-remove" | removeSkill("skill-to-remove") が1回呼ばれ、結果が返る |
| SH-RM-02 | 異常系(修正) | 引数が文字列でない場合 VALIDATION_ERROR          | 123（数値）       | { code: "VALIDATION_ERROR" } がスローされる            |
| SH-RM-03 | 異常系(修正) | 引数が空文字列の場合 VALIDATION_ERROR            | ""                | { code: "VALIDATION_ERROR" } がスローされる            |
| SH-RM-04 | 正常系(修正) | 存在しないスキル削除が graceful に処理される     | "nonexistent"     | { success: true, removed: false } が返る               |
| SH-RM-05 | 異常系(新規) | 引数がスペースのみの場合 VALIDATION_ERROR（P42） | " "               | { code: "VALIDATION_ERROR" } がスローされる            |
| SH-RM-06 | 異常系(新規) | 引数が undefined の場合 VALIDATION_ERROR         | undefined         | { code: "VALIDATION_ERROR" } がスローされる            |

## 変更内容

### 既存テスト修正（SH-RM-01〜04）

- 引数形式を `{ skillId: "..." }` → `"..."` に変更
- SH-RM-02, 03 にバリデーションエラー message アサーション追加

### 新規テスト追加（SH-RM-05〜06）

- SH-RM-05: P42準拠のスペースのみ文字列バリデーション
- SH-RM-06: undefined 引数のバリデーション

## 設計理由

- P42: `.trim()` バリデーション漏れ対策としてSH-RM-05を追加
- P44: skill:import同一パターンとの一貫性のためundefinedテスト追加
