# Phase 8 Refactoring Record

## 整理内容

- SDK 生 message 解釈を `RuntimeSkillCreatorFacade` 内の正規化関数へ集約
- `SkillExecutor` は raw capture のみを担当し、lane 契約への意味付け責務を持たない形へ整理
- workflow artifact には execute summary と normalized event をまとめて保存し、後続 task が raw SDK schema に依存しないようにした

## 削減した重複

- `session_id` / `stop_reason` / `permission_denials` の読み出しを helper 群へ統一
- error/failure 時の execute summary 組み立てを result オブジェクトへ統一
