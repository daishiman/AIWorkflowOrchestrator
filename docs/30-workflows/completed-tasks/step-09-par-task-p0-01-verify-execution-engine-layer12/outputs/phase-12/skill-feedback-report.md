# Phase 12 Skill Feedback Report

## task-specification-creator への提案

1. **SKILL.md テンプレートのセクション名統一**: 生成される SKILL.md で `## 概要` / `## Trigger` セクションが含まれないケースがある。Layer 2 検証との整合性のため、テンプレートにこれらを必須セクションとして含めることを推奨。
2. **`spec_created` workflow の Phase 10 自動警告**: code 未実装なのに `PASS` を断定する drift を自動検知する rule を追加すると品質が上がる。

## aiworkflow-requirements への提案

1. **verify 契約の Layer 1/2 定義追加**: FR-04 verify 契約に Layer 1 (構造検証) / Layer 2 (コンテンツ検証) の定義が未記載。`SkillCreatorVerificationEngine` の check ID 体系 (L1-NNN / L2-NNN) を要件仕様に追記することで、将来の Layer 拡張時の基準を明確化できる。
2. **resource-map への参照追加**: runtime verify engine のような docs-first task で読むべき canonical file を resource-map に 1 行追加すると参照が速い。
