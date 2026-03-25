# Phase 2: データフロー設計

## フローA: LLM生成

DescribeStep[llm] → handleLlmGenerate → goToStep(2) → planSkill → 成功: plan結果表示 → 実行する → executePlan → 成功: goToStep(3)

## フローB: テンプレート生成（既存非破壊）

DescribeStep[template] → goNext → ConfigureStep → handleGenerate → createSkill → goToStep(3)
