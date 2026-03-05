---
id: TASK-10A-E
tier: 2
title: SkillManagementPanel 利用可能スキル表示・インポート統合
phase: 10
depends_on: [TASK-10A-A, TASK-10A-D]
parallel_with: [TASK-10A-F]
blocks: [TASK-10A-G]
status: pending
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, skill-management, import]

execution:
  mode: sequential
  timeout_minutes: 90
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-043-subagent-team/index.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-043-subagent-team/task-043a-ipc-contract-and-security-alignment.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-043-subagent-team/task-043b-ui-ux-import-list-design.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-043-subagent-team/task-043c-store-lifecycle-integration-design.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-043-subagent-team/task-043d-test-quality-gate-design.md
  modifies:
    - apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
    - apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
    - apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx
---

# SkillManagementPanel 利用可能スキル表示・インポート統合

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-10A-E                                           |
| 実行モード | 仕様書作成のみ（実装・テスト実行・コミット・PRなし） |
| 関心ごと   | IPC契約/UI/Store/品質ゲートの分離と統合              |

## 目的

`TASK-10A-D` で統合されたライフサイクル UI に対し、`SkillManagementPanel` で「未インポートの利用可能スキル表示」と「インポート導線」を同一画面で完結させる。Import -> List Update -> Analyze までの一貫導線を確立する。

## 前提とスコープ

- 前提:
  - `TASK-10A-A`: SkillManagementPanel の基本構造は実装済み
  - `TASK-10A-D`: ChatPanel から管理画面への導線は実装済み
- 本タスクで扱う範囲:
  - Renderer UI 表示ロジック
  - Store selector/action 経由の import 導線
  - UI テストと統合テスト更新
- 本タスクで扱わない範囲:
  - 新規 IPC チャンネル追加
  - Main Process の新規サービス追加

## Atent Team 編成（関心ごと分離）

| SubAgent | 仕様書                                             | 主責務                               | 実行方式        |
| -------- | -------------------------------------------------- | ------------------------------------ | --------------- |
| A        | `task-043a-ipc-contract-and-security-alignment.md` | IPC/Preload 契約とセキュリティ整合   | 並列            |
| B        | `task-043b-ui-ux-import-list-design.md`            | UI/UX・アクセシビリティ・空状態設計  | 並列            |
| C        | `task-043c-store-lifecycle-integration-design.md`  | store 駆動の状態遷移・再描画境界設計 | 並列            |
| D        | `task-043d-test-quality-gate-design.md`            | テスト戦略統合・品質ゲート確定       | 直列（A/B/C後） |

## 並列実行と直列実行の境界

### 並列実行（先行）

- SubAgent A/B/C を同時着手する。
- A/B/C はファイル責務を分離し、相互依存なしで設計を確定する。

### 直列実行（統合）

- SubAgent D は A/B/C の確定仕様を入力として統合する。
- D でテストマトリクス・検証コマンド・完了ゲートを単一仕様へ集約する。

## 実行タスク

1. `task-043-subagent-team/` ディレクトリを作成し、A/B/C/D の個別仕様書を作成する。
2. A/B/C 仕様で `aiworkflow-requirements` 正本への参照を固定する。
3. D 仕様で統合テスト戦略と品質ゲートを明文化する。
4. 本タスク仕様に SubAgent 分担・並列/直列境界・成果物を反映する。

## 参照資料（aiworkflow-requirements）

| 観点                 | 正本仕様                                                                          | 反映内容                                              |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 抽出導線             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | UI/API/セキュリティ/テストの対象仕様を網羅抽出        |
| 先行パターン         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | IPC・P31・Result の先行固定                           |
| IPC契約              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `skill:import` 引数契約を維持（`skillName: string`）  |
| IPC API              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:importFromSource` と責務を混在させない         |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証・P42入力検証・ハンドラ重複防止を遵守       |
| Preload境界          | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | `contextIsolation=true` 前提で Preload API 経由を維持 |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | store個別selector優先、P31無限ループ対策              |
| UI/UX                | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | empty/loading/error の表示基準を統一                  |
| UI原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | キーボード操作・aria属性・文言統一                    |
| エラー設計           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | ERR_1xxx/2xxx 系の表示方針を整理                      |
| テスト設計           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | selector/action モック方針と統合テスト粒度を固定      |
| 品質ゲート           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | typecheck + 対象テスト + 回帰確認を必須化             |
| タスク運用ルール     | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`        | SubAgent統合時の合否判定条件を固定                    |

## aiworkflow抽出トレーサビリティ

| 抽出ステップ | 根拠                                            | 結果                                             |
| ------------ | ----------------------------------------------- | ------------------------------------------------ |
| タスク分類   | `indexes/resource-map.md`                       | UI実装/API設計/セキュリティ実装/テスト実装に分類 |
| パターン固定 | `indexes/quick-reference.md`                    | IPC・Result・P31対策を先行固定                   |
| 正本抽出     | `references/interfaces-agent-sdk-skill.md` ほか | A/B/C/D 各仕様書へ責務別に反映                   |

## 実行手順

1. SubAgent A/B/C を並列で実施し、IPC/UI/Storeの責務を分離して仕様確定する。
2. SubAgent D を直列で実施し、A/B/Cの決定事項を単一テストゲートへ統合する。
3. `task-specification-creator` の必須セクション構成と完了条件を確認する。
4. 実装・コミット・PRを行わず、仕様書成果物のみを出力する。

## 成果物

- `task-043-subagent-team/index.md`
- `task-043-subagent-team/task-043a-ipc-contract-and-security-alignment.md`
- `task-043-subagent-team/task-043b-ui-ux-import-list-design.md`
- `task-043-subagent-team/task-043c-store-lifecycle-integration-design.md`
- `task-043-subagent-team/task-043d-test-quality-gate-design.md`

## 完了条件

- [ ] SubAgent A/B/C/D の仕様書が作成されている
- [ ] 並列実行境界と直列統合境界が明記されている
- [ ] `aiworkflow-requirements` の正本参照が各仕様書に記載されている
- [ ] `TASK-10A-G` へ引き渡せる検証条件が定義されている
- [ ] 本タスクでは実装・コミット・PRを行わない方針が明示されている

## 自動検証コマンド（実装フェーズで使用）

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test:run apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
pnpm --filter @repo/desktop test:run apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx
```
