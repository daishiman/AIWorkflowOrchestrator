---
name: {{agent-name}}
description: |
  {{agent_description}}

  {{skill_dependency_section}}

tools: [{{tools_list}}]
model: {{model}}
version: 1.0.0
{{optional_fields}}
---

# {{Agent Title}}

## 役割

{{role_description}}

## 専門分野

- **{{specialty_1}}**: {{specialty_1_description}}
- **{{specialty_2}}**: {{specialty_2_description}}
- **{{specialty_3}}**: {{specialty_3_description}}

## いつ使うか

### シナリオ1: {{scenario_1_name}}

**状況**: {{scenario_1_situation}}

**適用条件**:
- [ ] {{condition_1}}
- [ ] {{condition_2}}
- [ ] {{condition_3}}

**期待される成果**: {{scenario_1_outcome}}

### シナリオ2: {{scenario_2_name}}

**状況**: {{scenario_2_situation}}

**適用条件**:
- [ ] {{condition_1}}
- [ ] {{condition_2}}

**期待される成果**: {{scenario_2_outcome}}

## 前提条件

### 必要な知識
- [ ] {{required_knowledge_1}}
- [ ] {{required_knowledge_2}}

### 必要なツール
- {{tool_1}}: {{tool_1_purpose}}
- {{tool_2}}: {{tool_2_purpose}}

### 環境要件
- {{env_requirement_1}}
- {{env_requirement_2}}

## ワークフロー

### Phase 1: {{phase_1_name}}

**目的**: {{phase_1_purpose}}

**ステップ**:
1. **{{step_1_name}}**:
   - {{step_1_action_1}}
   - {{step_1_action_2}}

2. **{{step_2_name}}**:
   - {{step_2_action_1}}
   - {{step_2_action_2}}

**判断基準**:
- [ ] {{phase_1_criterion_1}}
- [ ] {{phase_1_criterion_2}}

**リソース**: {{phase_1_resource}}

### Phase 2: {{phase_2_name}}

**目的**: {{phase_2_purpose}}

**ステップ**:
1. **{{step_1_name}}**:
   - {{step_1_action_1}}
   - {{step_1_action_2}}

2. **{{step_2_name}}**:
   - {{step_2_action_1}}
   - {{step_2_action_2}}

**判断基準**:
- [ ] {{phase_2_criterion_1}}
- [ ] {{phase_2_criterion_2}}

**リソース**: {{phase_2_resource}}

### Phase 3: {{phase_3_name}}

**目的**: {{phase_3_purpose}}

**ステップ**:
1. **{{step_1_name}}**:
   - {{step_1_action_1}}
   - {{step_1_action_2}}

2. **{{step_2_name}}**:
   - {{step_2_action_1}}
   - {{step_2_action_2}}

**判断基準**:
- [ ] {{phase_3_criterion_1}}
- [ ] {{phase_3_criterion_2}}

**リソース**: {{phase_3_resource}}

## スキル管理

### 使用タイミング

このエージェントは以下の状況で使用してください:
- {{use_timing_1}}
- {{use_timing_2}}
- {{use_timing_3}}

### 依存スキル

このエージェントは以下のスキルに依存しています:
- **{{skill_1_name}}** (`.claude/skills/{{skill_1_path}}/SKILL.md`)
- **{{skill_2_name}}** (`.claude/skills/{{skill_2_path}}/SKILL.md`)

{{skill_loading_section}}

### 関連エージェント

- **{{related_agent_1}}**: {{related_agent_1_description}}
- **{{related_agent_2}}**: {{related_agent_2_description}}

## ベストプラクティス

### すべきこと

1. **{{best_practice_1_title}}**:
   - {{best_practice_1_detail_1}}
   - {{best_practice_1_detail_2}}

2. **{{best_practice_2_title}}**:
   - {{best_practice_2_detail_1}}
   - {{best_practice_2_detail_2}}

3. **{{best_practice_3_title}}**:
   - {{best_practice_3_detail_1}}
   - {{best_practice_3_detail_2}}

### 避けるべきこと

1. **{{antipattern_1_title}}**:
   - ❌ {{antipattern_1_bad_example}}
   - ✅ {{antipattern_1_good_example}}

2. **{{antipattern_2_title}}**:
   - ❌ {{antipattern_2_bad_example}}
   - ✅ {{antipattern_2_good_example}}

3. **{{antipattern_3_title}}**:
   - ❌ {{antipattern_3_bad_example}}
   - ✅ {{antipattern_3_good_example}}

## トラブルシューティング

### 問題1: {{problem_1_title}}

**症状**: {{problem_1_symptom}}

**原因**: {{problem_1_cause}}

**解決策**:
1. {{solution_1_step_1}}
2. {{solution_1_step_2}}
3. {{solution_1_step_3}}

**予防策**: {{prevention_1}}

### 問題2: {{problem_2_title}}

**症状**: {{problem_2_symptom}}

**原因**: {{problem_2_cause}}

**解決策**:
1. {{solution_2_step_1}}
2. {{solution_2_step_2}}

**予防策**: {{prevention_2}}

## 関連スキル

- **{{related_skill_1}}** (`.claude/skills/{{related_skill_1_path}}/SKILL.md`): {{related_skill_1_description}}
- **{{related_skill_2}}** (`.claude/skills/{{related_skill_2_path}}/SKILL.md`): {{related_skill_2_description}}

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- {{resource_1_name}} (`resources/{{resource_1_file}}`)
- {{template_1_name}} (`templates/{{template_1_file}}`)
- {{script_1_name}} (`scripts/{{script_1_file}}`)

## メトリクス

### {{metric_1_name}}

**評価基準**:
- {{metric_1_criterion_1}}: {{metric_1_score_1}}
- {{metric_1_criterion_2}}: {{metric_1_score_2}}

**目標**: {{metric_1_target}}

### {{metric_2_name}}

**測定方法**: {{metric_2_measurement}}

**目標**: {{metric_2_target}}

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | {{date}} | 初版作成 |

## 使用上の注意

### このエージェントが得意なこと
- {{strength_1}}
- {{strength_2}}
- {{strength_3}}

### このエージェントが行わないこと
- {{not_responsible_1}}
- {{not_responsible_2}}
- {{not_responsible_3}}

### 推奨される使用フロー
1. {{recommended_flow_1}}
2. {{recommended_flow_2}}
3. {{recommended_flow_3}}

### 参考文献
- **『{{reference_book_1}}』** {{reference_author_1}}著
  - {{reference_chapter_1}}
- **『{{reference_book_2}}』** {{reference_author_2}}著
  - {{reference_chapter_2}}
