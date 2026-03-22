# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 11                                                 |
| Phase 名   | 手動テスト                                         |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 10                                           |
| 後続 Phase | Phase 12（ドキュメント）                           |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix の manual walkthrough / screenshot 証跡契約を定義する。

## 実行タスク

- walkthrough 設計: 手動確認のシナリオと順序を定義する
- screenshot 設計: capture すべき TC-ID と画面状態を定義する
- fallback 記録方針: live preview 不可時の代替証跡方針を決める

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
| Phase 8                | phase-8-refactoring.md                                                                                                                     | Phase 8（リファクタリング）の仕様書               |
| Phase 9                | phase-9-quality-assurance.md                                                                                                               | Phase 9（品質検証）の仕様書                       |
| Phase 10               | phase-10-final-review.md                                                                                                                   | Phase 10（最終レビュー）の仕様書                  |
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
| Task02 index           | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                                               | 共有 policy の消費契約                            |
| ui-ux-settings         | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                                                        | Settings 正本の親入口                             |
| ui-ux-settings-core    | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                                                   | Settings IA / bypass / screenshot 契約            |
| ui-ux-navigation       | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                                      | settings 公開導線・nav 契約                       |
| llm-ipc-types          | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                         | health row の型契約                               |

## 実行手順

### ステップ1: Phase 10 gate 判定確認と手動テスト scope 確定

1. `outputs/phase-10/final-gate-decision.md` を読み込み、gate 判定が PASS または MINOR であることを確認する（MAJOR/CRITICAL の場合は Phase 11 に進まない）
2. 本タスクが**設計タスク（プロダクションコード実装なし）**であることを確認し、手動テストの scope を「設計ドキュメントの walkthrough + 将来の実装時 screenshot 計画の策定」に固定する
3. P53（CLI 環境でのスクリーンショット取得制約）を考慮し、本 Phase では screenshot plan の**定義**を行い、実際の screenshot 取得は後続実装タスクに委譲する

### ステップ2: MT-01〜MT-06 手動テスト計画の策定

各 MT-ID について、walkthrough シナリオと screenshot 計画を定義する:

**MT-01: Settings 画面に access matrix 表示**

- 前提条件: 認証済みユーザーで Settings 画面を開く
- 確認内容: Access Matrix セクションが Settings 画面内に表示されること
- screenshot 計画: Settings 画面全体のキャプチャ（access matrix セクションが視認可能な状態）
- CLI fallback: 設計ドキュメントの画面構成図を証跡として参照する

**MT-02: 4 capability 状態の card 切り替え（screenshot x4）**

- 前提条件: 各 capability 状態を再現できるテストデータが存在する
- 確認内容: active / degraded / unavailable / not-configured の4状態で CapabilityCard が正しく切り替わること
- screenshot 計画: 各状態ごとに1枚、計4枚のキャプチャ
- CLI fallback: Phase 5 設計ドキュメントの状態別 UI 仕様を証跡として参照する

**MT-03: health row connected/disconnected（screenshot x2）**

- 前提条件: provider の接続状態を切り替えられる環境
- 確認内容: HealthStatusRow が connected / disconnected の2状態を正しく表示すること
- screenshot 計画: 各状態ごとに1枚、計2枚のキャプチャ
- CLI fallback: 設計ドキュメントの HealthStatusRow コンポーネント仕様を証跡として参照する

**MT-04: persistent launcher 全画面表示（screenshot x3）**

- 前提条件: AppLayout が表示される任意の3画面（Settings / Chat / Agent）
- 確認内容: TerminalLauncher が全画面で persistent に表示されること
- screenshot 計画: 各画面ごとに1枚、計3枚のキャプチャ
- CLI fallback: 設計ドキュメントの AppLayout 配置図を証跡として参照する

**MT-05: 未認証時 guidance-only**

- 前提条件: 未認証状態でアプリにアクセスする
- 確認内容: Public Shell Access Contract に基づき、guidance-only モードが表示されること。操作不可の機能が明確にグレーアウトまたは非表示であること
- screenshot 計画: 未認証状態の画面キャプチャ1枚
- CLI fallback: PUBLIC_UNAUTHENTICATED_VIEWS の定義と設計ドキュメントの未認証画面仕様を証跡として参照する

**MT-06: mobile responsive**

- 前提条件: viewport 幅 375px / 768px / 1024px の3パターン
- 確認内容: access matrix / launcher / guidance-only が各 viewport でレイアウト崩れなく表示されること
- screenshot 計画: 各 viewport ごとに主要画面のキャプチャ
- CLI fallback: 設計ドキュメントのレスポンシブ仕様を証跡として参照する

### ステップ3: Fallback 記録方針の確定と screenshot-plan.json 作成

1. P53 準拠の fallback 方針を明文化する:
   - 設計タスクのため、実画面キャプチャは後続実装タスクで取得する
   - 本 Phase では設計ドキュメントの walkthrough 結果を「間接的な視覚検証」として記録する
   - 後続実装タスクの Phase 11 で `Electron webContents.capturePage()` または Playwright `page.screenshot()` による実キャプチャを必須とする
2. `outputs/phase-11/screenshot-plan.json` を作成: MT-01〜MT-06 の TC-ID / capture 対象 / 前提条件 / fallback 方針を JSON 形式で記録する
3. `outputs/phase-11/discovered-issues.md` を作成: walkthrough 中に発見した設計上の懸念事項を記録する（0件の場合も「発見事項なし」として作成する）

### ステップ4: 成果物の確定と Phase 12 handoff

1. `outputs/phase-11/manual-test-plan.md` を作成: MT-01〜MT-06 の walkthrough シナリオ + screenshot 計画 + fallback 方針
2. 全成果物パスが `outputs/phase-11/` と一致していることを確認する
3. Phase 12 へ引き渡す情報として「MT-01〜MT-06 の手動テスト計画が確定し、後続実装タスクへの screenshot 取得委譲が明記されていること」を記録する

## 統合テスト連携（Phase 1〜11は必須）

manual walkthrough と screenshot coverage を task 固有の TC-ID で管理する。

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

| 成果物                 | パス                                  | 内容                            |
| ---------------------- | ------------------------------------- | ------------------------------- |
| 手動テスト計画         | outputs/phase-11/manual-test-plan.md  | walkthrough / screenshot の手順 |
| スクリーンショット計画 | outputs/phase-11/screenshot-plan.json | TC-ID と capture 対象           |
| 発見事項               | outputs/phase-11/discovered-issues.md | manual walkthrough の所見       |

## 完了条件

- [ ] manual test plan と screenshot plan が定義されている
- [ ] fallback capture 方針が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-11/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)
