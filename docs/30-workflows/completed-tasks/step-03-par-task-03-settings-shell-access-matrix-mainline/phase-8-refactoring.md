# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 8                                                  |
| Phase 名   | リファクタリング                                   |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 7                                            |
| 後続 Phase | Phase 9（品質検証）                                |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix をより単純に保つ refactor boundary を定義する。

## 実行タスク

- simpler alternative 再評価: より単純な構造へ寄せられる箇所を洗い出す
- 責務再整列: component / service / doc の責務を再確認する
- 回帰条件確認: refactor で崩してはいけない contract を固定する

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                 | 依存順・並列可否・設計ゲート                      |
| Task index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                | phase-1-requirements.md                                                                                                                    | 要件定義の確定内容                                |
| Phase 2                | phase-2-design.md                                                                                                                          | 設計内容と validation matrix                      |
| Phase 3                | phase-3-design-review.md                                                                                                                   | review gate の判定                                |
| Phase 4                | phase-4-test-creation.md                                                                                                                   | Phase 4（テスト作成）の仕様書                     |
| Phase 5                | phase-5-implementation.md                                                                                                                  | Phase 5（実装）の仕様書                           |
| Phase 6                | phase-6-test-expansion.md                                                                                                                  | Phase 6（テスト拡充）の仕様書                     |
| Phase 7                | phase-7-coverage-check.md                                                                                                                  | Phase 7（カバレッジ確認）の仕様書                 |
| 旧canonical workflow   | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                              | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                                                     | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                                                        | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                                                   | 矛盾・依存・漏れの監査軸                          |
| workflow 正本          | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md                              | runtime 責務再配線の current canonical            |
| resource map           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                                             | 必要仕様の初動選定                                |
| quick reference        | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                                                          | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth        | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                                                       | auth/access 契約の親入口                          |
| api-ipc-system         | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                                                        | system IPC 契約の親入口                           |
| arch-state-management  | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                                                 | Renderer 責務境界の親入口                         |
| Task02 index           | docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md                                                               | 共有 policy の消費契約                            |
| ui-ux-settings         | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                                                        | Settings 正本の親入口                             |
| ui-ux-settings-core    | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                                                   | Settings IA / bypass / screenshot 契約            |
| ui-ux-navigation       | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                                      | settings 公開導線・nav 契約                       |
| llm-ipc-types          | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                         | health row の型契約                               |

## 実行手順

### ステップ1: Phase 7 カバレッジ確認結果の読み込みと refactor scope 固定

1. `outputs/phase-7/` の成果物を読み込み、カバレッジ基準の充足状況を確認する
2. Phase 5 実装成果物（設計ドキュメント群）を再読し、3 Concern の境界を把握する
   - Concern 1: Settings Access Matrix Section（CapabilityCard / HealthStatusRow / ProviderSummaryCard）
   - Concern 2: AppLayout Persistent Launcher（TerminalLauncher）
   - Concern 3: Public Shell Access Contract（未認証時 guidance-only）
3. 本タスクが**設計タスク（プロダクションコード実装なし）**であることを再確認し、refactor 対象は設計ドキュメントの構造・命名・責務分割に限定する

### ステップ2: 3 Concern ごとの Refactor Boundary 分析

**Concern 1（Settings Access Matrix Section）の簡素化検討:**

1. CapabilityCard / HealthStatusRow / ProviderSummaryCard の責務が単一責務原則に沿っているか確認する
2. 4 capability 状態（active / degraded / unavailable / not-configured）の状態遷移が冗長でないか検証する
3. simpler alternative: 状態数を削減できるか、カード間で共通化できる props interface があるか評価する

**Concern 2（AppLayout Persistent Launcher）の簡素化検討:**

1. TerminalLauncher の配置が AppLayout 内で適切か（全画面共通 vs Settings 限定）を再評価する
2. simpler alternative: Launcher を独立コンポーネントにせず既存 AppLayout の slot に統合できるか検討する

**Concern 3（Public Shell Access Contract）の簡素化検討:**

1. 未認証時 guidance-only の境界条件が明確か確認する
2. PUBLIC_UNAUTHENTICATED_VIEWS との整合を検証する
3. simpler alternative: guidance-only ロジックを専用コンポーネントに分離 vs 条件分岐で吸収の比較を行う

### ステップ3: RG-ID ベースの回帰チェック（崩してはいけない contract の固定）

以下の各 RG-ID について、refactor で壊れないことを明文化する:

| RG-ID | 観点                             | 確認内容                                                                                                         |
| ----- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| RG-01 | P31 Store Hook 無限ループ        | 新セレクタが個別セレクタパターン（`useXxx()` 単体）であること。合成 Hook を useEffect 依存配列に含めていないこと |
| RG-02 | P48 useShallow 未適用            | `.filter()` / `.map()` で配列を返す派生セレクタに `useShallow` が適用される設計であること                        |
| RG-03 | P5 リスナー二重登録              | health subscription の cleanup が useEffect return で確実に実行される設計であること                              |
| RG-04 | P62 DEFAULT_CONFIG 暗黙 fallback | provider 未選択時にエラー表示またはセレクター画面リダイレクトが行われ、暗黙 fallback しない設計であること        |
| RG-05 | Settings bypass                  | PUBLIC_UNAUTHENTICATED_VIEWS に変更がないこと                                                                    |
| RG-06 | CTA 契約 Task01                  | primary 1 + secondary 1 の CTA 上限が守られていること                                                            |

成果物 `outputs/phase-8/refactor-boundaries.md` に RG-01〜RG-06 の不変条件を記録する。

### ステップ4: 成果物作成と次 Phase handoff

1. `outputs/phase-8/refactor-boundaries.md` を作成: 3 Concern ごとの refactor 安全境界 + RG-01〜RG-06 の不変条件一覧
2. `outputs/phase-8/simplification-candidates.md` を作成: 各 Concern の simpler alternative 比較表（採用/不採用の判断理由を含む）
3. Phase 9 へ引き渡す観点として「RG-01〜RG-06 が品質検証で個別チェックされること」を明記する

## 統合テスト連携（Phase 1〜11は必須）

refactor 後も integration contract を維持するための invariants を記録する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: Settings / AppLayout / public unauthenticated shell に capability cards / health row / terminal launcher を実装する設計を固める

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                         | 内容                           |
| -------------- | -------------------------------------------- | ------------------------------ |
| リファクタ境界 | outputs/phase-8/refactor-boundaries.md       | 安全に整理できる構造と禁止事項 |
| 簡素化候補     | outputs/phase-8/simplification-candidates.md | より単純な代替案の比較         |

## 完了条件

- [ ] simpler alternative と refactor boundary が整理されている
- [ ] 崩してはいけない contract が明文化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-8/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)
