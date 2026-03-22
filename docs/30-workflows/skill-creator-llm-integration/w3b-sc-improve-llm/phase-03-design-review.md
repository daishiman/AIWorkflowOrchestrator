# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 3                      |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

Phase 2 で設計した improve() LLM 実装の妥当性を検証する。特に改善提案の適用安全性と破壊的変更防止策を重点的にレビューする。

## 実行タスク

1. 設計レビューチェックリスト実行
   - JSON Schema の堅牢性確認（LLM が不正 JSON を返した場合のハンドリング）
   - section/before/after/reason フィールドの型制約確認
2. 改善提案の適用安全性検証
   - before テキストが SKILL.md に存在しない場合の処理
   - after テキストで SKILL.md のフォーマットが壊れる可能性
   - 複数提案の適用順序と競合処理
3. 破壊的変更防止策の検証
   - SKILL.md バックアップ戦略（適用前の退避）
   - ロールバック可能な適用フロー設計の確認
4. plan() との AnthropicAdapter 共通化設計の妥当性確認（DRY 原則）
5. レビュー判定（PASS / MINOR / MAJOR）

## 参照資料

- Phase 2 成果物（設計書）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `.claude/rules/02-code-quality.md`（エラーハンドリング原則）
- `.claude/rules/06-known-pitfalls.md`（P19, P48: 型安全性）

## 成果物

- 設計レビュー報告書
  - 判定: PASS / MINOR / MAJOR
  - 指摘事項リスト（MINORの場合は対応方針も記載）

## 完了条件

- [ ] JSON Schema 堅牢性を確認した（不正 JSON 時のフォールバック）
- [ ] 改善提案の適用安全性を検証した（before 不一致、フォーマット破壊）
- [ ] 破壊的変更防止策（バックアップ・ロールバック）を確認した
- [ ] AnthropicAdapter 共通化設計の妥当性を確認した
- [ ] レビュー判定を PASS / MINOR / MAJOR で明記した
- [ ] MINOR 以上の指摘は全て対応方針を記載した

## 次のPhase

Phase 4: テスト作成
