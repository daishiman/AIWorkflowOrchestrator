# [#1731] [task-imp-agents-subdir-recursive-scan-008] SkillCreatorVerificationEngine agents/ サブディレクトリ再帰探索対応

## メタ情報

```yaml
issue_number: 1731
title: [task-imp-agents-subdir-recursive-scan-008] SkillCreatorVerificationEngine agents/ サブディレクトリ再帰探索対応
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1731
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

現在の L1-003 / L2-005 / L2-006 チェックは `agents/` 直下のファイルのみを探索しており、サブディレクトリ内の agent spec が検出されない。再帰探索対応により検証カバレッジを向上させる。

## スコープ

- L1-003: agents/ has files チェックの再帰探索対応
- L2-005: agent H1 heading チェックの再帰探索対応
- L2-006: agent responsibility section チェックの再帰探索対応
- 再帰深度の制限実装（無限ループ防止）
- 再帰探索パターンのテスト追加

## 技術的コンテキスト

現在の VerificationEngine クラス構造:

```
SkillCreatorVerificationEngine
  └── verify(skillDir)
      ├── validateLayer1(skillDir)
      │   └── L1-003: agents/ has files  // 現在は直下のみ
      └── validateLayer2(skillDir)
          ├── L2-005: agent H1 heading (per .md file)  // 現在は直下のみ
          └── L2-006: agent responsibility section (per .md file)  // 現在は直下のみ
```

agents/ 配下にサブディレクトリが存在する場合、その中の agent spec は現在無視される。

## 参照

- Phase 12 implementation guide: `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/implementation-guide.md`
- VerificationEngine: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
