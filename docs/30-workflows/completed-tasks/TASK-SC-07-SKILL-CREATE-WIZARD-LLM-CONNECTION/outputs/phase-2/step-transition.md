# Phase 2: ステップ遷移マトリクス

| 現在          | mode     | アクション          | 遷移先           |
| ------------- | -------- | ------------------- | ---------------- |
| DescribeStep  | template | onNext              | ConfigureStep(1) |
| DescribeStep  | llm      | onNext              | GenerateStep(2)  |
| ConfigureStep | template | onGenerate          | GenerateStep(2)  |
| GenerateStep  | llm      | onExecutePlan(成功) | CompleteStep(3)  |
| GenerateStep  | llm      | onCancelPlan        | DescribeStep(0)  |
