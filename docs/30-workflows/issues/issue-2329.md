# [#2329] [UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001] SkillScanner に EVALS.json 内容バリデーション追加

## メタ情報

```yaml
issue_number: 2329
title: [UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001] SkillScanner に EVALS.json 内容バリデーション追加
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2329
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`SkillScanner.ts` は EVALS.json の存在しか見ていないため、内容バリデーションを追加して破損ファイルを早期検知する。

## 発見元

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 12
- 判定根拠: [implementation-guide.md §3.1 / §11](../blob/docs/task-spec-TASK-EVALS-CONSUMER-AUDIT-001/docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md)

## 仕様書

`docs/30-workflows/unassigned-task/task-skill-scanner-evals-content-validate-001.md`

## 依存

- 先行推奨: UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## 主な苦戦箇所

- SkillScanner は type=evals タグのみ返す設計、空 `{}` / 破損 JSON も valid 扱い
- camelCase/snake_case 両方言を許容する validator 設計判断
- SkillScanner は同期処理、重い検証は性能トレードオフ
- 既存 3 テスト（SkillScanner.test.ts）が「中身を期待しない」契約、テスト設計ごと見直し
- fixture（skill-creator/complete-skill/EVALS.json）の snake_case を壊さない設計
