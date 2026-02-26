# Phase 2 IPC整合設計

## 対象契約

- `skill:import(skillName)`
- `skill:remove(skillName)`

## 整合ルール

- 型: `SkillName`
- 実行時バリデーション: `typeof === "string" && trim() !== ""` 維持
- エラー契約: `VALIDATION_ERROR` / `IMPORT_ERROR` を維持

## 互換性方針

- Branded Typeはコンパイル時のみ。
- IPC送信値は既存どおりプレーン文字列として送信される。
- 既存のMain実装ロジック（import実行->取得->返却）は変更しない。

## セキュリティ観点

- `validateIpcSender()` 維持。
- バリデーション条件は後退させない。
