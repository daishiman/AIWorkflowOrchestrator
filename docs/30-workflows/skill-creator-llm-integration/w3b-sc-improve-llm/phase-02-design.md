# Phase 2: 設計

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 2                      |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

improve() の LLM 呼び出しアーキテクチャを設計する。プロンプト設計（system=improve-prompt.md、user=フィードバック+現在SKILL.md内容）、改善提案 JSON Schema、承認後の適用フロー（SkillFileWriter との連携）を定義する。

## 実行タスク

1. プロンプト設計
   - system プロンプト: `.claude/skills/skill-creator/agents/improve-prompt.md` の内容を使用
   - user プロンプト: `{フィードバック内容}\n\n現在のSKILL.md:\n{SKILL.md全文}` の形式を設計
2. 改善提案 JSON Schema 設計
   ```json
   {
     "suggestions": [
       {
         "section": "string（対象セクション名）",
         "before": "string（変更前のテキスト）",
         "after": "string（変更後のテキスト）",
         "reason": "string（変更理由）"
       }
     ]
   }
   ```
3. SkillFileManager を使った SKILL.md 読み込みフロー設計
4. 承認後の適用フロー設計（SkillFileWriter / applyImprovement() インターフェース）
5. エラーハンドリング設計（スキル不存在、SKILL.md読み込み失敗、LLMパース失敗）
6. plan() との AnthropicAdapter 共通化設計

## 参照資料

- Phase 1 成果物（要件定義書）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/adapters/AnthropicAdapter.ts`（存在確認）
- `.claude/skills/skill-creator/agents/improve-prompt.md`
- `apps/desktop/src/main/services/skill/SkillFileManager.ts`
- `packages/shared/src/types/skillCreator.ts`

## 成果物

- improve() LLM 呼び出しシーケンス図（テキスト形式）
- 改善提案 JSON Schema 定義
- SkillFileWriter 連携インターフェース設計
- エラーハンドリング設計書
- AnthropicAdapter 共通化設計

## 完了条件

- [ ] プロンプト設計（system/user の両方）を完成させた
- [ ] 改善提案 JSON Schema を定義した（section, before, after, reason の型・制約）
- [ ] SKILL.md 読み込みフローを設計した
- [ ] 承認後の適用フローを設計した（SkillFileWriter との連携）
- [ ] エラーケース（スキル不存在、読み込み失敗、LLMパース失敗）を網羅した
- [ ] plan() との AnthropicAdapter 共通化ポイントを特定した

## 次のPhase

Phase 3: 設計レビュー
