# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 3                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

Phase 2 で作成した設計の妥当性を多角的に検証する。特に agent 仕様書3ファイルの合計コンテキスト長が Claude の上限に収まるか、プロンプト設計が AC-1/AC-4 を充足できるかを判定する。

## 実行タスク

1. **要件適合性チェック**
   - AC-1（自然言語入力 → 構造計画生成）をプロンプト設計が充足できるか検証する
   - AC-4（terminal_handoff 経路の非破壊）を設計が保証できるか検証する
   - FR-1 の機能要件と設計の対応を確認する
2. **コンテキスト長検証**
   - discover-problem.md + design-workflow.md + plan-structure.md の合計文字数を測定する
   - Claude API の input_tokens 上限（200,000 tokens）との比較を行う
   - 超過の場合は Phase 2 へ戻り、agent 仕様書の要約または分割読み込み方式を再設計する
3. **プロンプト設計レビュー**
   - system プロンプトの構造が LLM に意図どおりの JSON を返させるか評価する
   - JSON スキーマの各フィールドが RuntimeSkillCreatorPlanResult 型と整合するか確認する
   - プロンプトインジェクション攻撃への耐性を確認する
4. **DI 設計レビュー**
   - AnthropicAdapter のコンストラクタ注入がテスタビリティを確保できるか確認する
   - 既存のファクトリ・コンテナと整合するか確認する
5. 判定を記録し、MINOR 指摘は未タスク化する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/03-phase-02-design.md`（前 Phase 成果物）
- `docs/30-workflows/skill-creator-llm-integration/03-phase-02-design-output.md`

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/03-phase-03-review-output.md`（レビュー結果）
  - 判定: PASS / MINOR / MAJOR
  - 指摘事項リスト（MINOR は未タスク化必須）

## 完了条件

- [ ] AC-1 / AC-4 / FR-1 との適合性を確認した
- [ ] agent 仕様書3ファイルの合計トークン数を測定し、上限内であることを確認した
- [ ] JSON スキーマと RuntimeSkillCreatorPlanResult 型の整合を確認した
- [ ] DI 設計のテスタビリティを確認した
- [ ] 判定（PASS / MINOR / MAJOR）を記録した
- [ ] MINOR 指摘がある場合は未タスク化した

## 次のPhase

Phase 4: テスト作成
