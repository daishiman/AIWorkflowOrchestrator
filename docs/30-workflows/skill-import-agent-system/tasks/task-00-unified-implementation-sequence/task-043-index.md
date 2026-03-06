# TASK-043 Atent Team 編成

## 目的

`TASK-10A-E` の仕様策定を関心ごとで分離し、並列化できる設計作業を並列で進め、最終品質ゲート定義だけを直列で統合する。

## チーム構成

| SubAgent | 仕様書                                             | 役割                          | 実行順序        | ステータス |
| -------- | -------------------------------------------------- | ----------------------------- | --------------- | ---------- |
| A        | `task-043a-ipc-contract-and-security-alignment.md` | IPC契約・セキュリティ境界定義 | 並列            | pending    |
| B        | `task-043b-ui-ux-import-list-design.md`            | UI/UX・アクセシビリティ設計   | 並列            | completed  |
| C        | `task-043c-store-lifecycle-integration-design.md`  | store駆動の状態遷移設計       | 並列            | pending    |
| D        | `task-043d-test-quality-gate-design.md`            | テスト/品質ゲート統合         | 直列（A/B/C後） | pending    |

## 並列・直列フロー

```text
A (IPC/Security) ─┐
B (UI/UX)        ├─> D (Test/Quality Gate 統合)
C (Store)        ┘
```

## aiworkflow-requirements 抽出順

1. `indexes/resource-map.md` でタスク種別（UI実装, API設計, セキュリティ実装, テスト実装）を選定
2. `indexes/quick-reference.md` で IPC/Store/Result パターンを先に固定
3. 参照正本を A/B/C の入力に配布
4. D で A/B/C の決定事項を衝突チェックして単一ゲートへ統合

## 参照正本

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`

## task-043a 13フェーズ仕様書

- `task-043a-ipc-contract-and-security-alignment/index.md`
- `task-043a-ipc-contract-and-security-alignment/phase-1-requirements.md`
- `task-043a-ipc-contract-and-security-alignment/phase-2-design.md`
- `task-043a-ipc-contract-and-security-alignment/phase-3-design-review.md`
- `task-043a-ipc-contract-and-security-alignment/phase-4-test-creation.md`
- `task-043a-ipc-contract-and-security-alignment/phase-5-implementation.md`
- `task-043a-ipc-contract-and-security-alignment/phase-6-test-expansion.md`
- `task-043a-ipc-contract-and-security-alignment/phase-7-coverage-check.md`
- `task-043a-ipc-contract-and-security-alignment/phase-8-refactoring.md`
- `task-043a-ipc-contract-and-security-alignment/phase-9-quality-assurance.md`
- `task-043a-ipc-contract-and-security-alignment/phase-10-final-review.md`
- `task-043a-ipc-contract-and-security-alignment/phase-11-manual-test.md`
- `task-043a-ipc-contract-and-security-alignment/phase-12-documentation.md`
- `task-043a-ipc-contract-and-security-alignment/phase-13-pr-creation.md`

## 実行ポリシー

- 本ディレクトリは仕様書作成専用。
- 実装・テスト実行・コミット・PRは本タスク範囲外。
