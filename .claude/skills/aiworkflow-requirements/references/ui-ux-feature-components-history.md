# 機能別 UI コンポーネント / history bundle

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: history bundle

## 完了タスク

| Issue #    | 機能名                                                         | 完了日     | 関連ドキュメント                                                                                    |
| ---------- | -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| TASK-RT-03-VERIFY-IMPROVE-PANEL-001 | Verify / Improve 結果パネル実装（VerifyResultDetailPanel / ImproveResultDetailPanel、visual harness、phase-11 screenshot 3件） | 2026-04-04 | `docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001/` |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 | AuthTimeoutFallback + Settings 公開シェル | 2026-03-10 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/` |
| TASK-UI-03 | AgentView Enhancement（Tap & Discover リデザイン、5サブコンポーネント + レイアウト/統合/Store 136テスト） | 2026-03-10 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/` |
| TASK-UI-08 | NotificationCenter 058e UX 再整備（`お知らせ`、Portal、relative time、個別削除 IPC、Phase 11 screenshot 7件） | 2026-03-11 | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/` |
| TASK-UI-07 | DashboardView ホーム画面リデザイン（GreetingHeader / DashboardSuggestionSection / RecentTimeline、Phase 11 screenshot 5件） | 2026-03-11 | `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/` |
| 09-TASK-FIX | Settings AuthKeySection + ApiKeysSection preload/sandbox iterable ガード | 2026-03-07 | `docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001/` |
| TASK-UI-01-C | Notification / History Domain（通知センター + 履歴検索） | 2026-03-05 | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/` |
| TASK-UI-02 | Global Navigation Core（GlobalNavStrip / MobileNavBar / AppLayout） | 2026-03-06 | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` |
| TASK-UI-00-FOUNDATION-REFLECTION-AUDIT | UI基盤反映監査（正本導線・Task 5D具体例・Task 5B境界の是正） | 2026-03-05 | `docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/` |
| TASK-UI-00-ORGANISMS | Organisms共通基盤（CardGrid / MasterDetailLayout / SearchFilterList） | 2026-03-04 | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/` |
| TASK-UI-05 | SkillCenterView（ツール探索UI、7コンポーネント + 2フック + 10テストファイル） | 2026-03-01 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` |
| TASK-UI-05B | Skill Advanced Views（4ビュー + 共通IPC Hooks + 導線追加） | 2026-03-02 | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` |
| TASK-10A-B | SkillAnalysisView（分析・改善UI、4コンポーネント + 1 Hook） | 2026-03-02 | `docs/30-workflows/completed-tasks/skill-analysis-view/` |
| TASK-10A-C | SkillCreateWizard（4ステップUI + IPC `skill:create`） | 2026-03-02 | `docs/30-workflows/completed-tasks/skill-create-wizard/` |
| TASK-9A    | skill-editor（SkillEditor / SkillCodeEditor + CRUD + backups） | 2026-02-26 | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/`                                                           |
| TASK-7D    | chatpanel-agent-integration（ChatPanel統合・SkillStreamingView） | 2026-01-31 | `docs/30-workflows/TASK-7D-chatpanel-agent-integration/`                                            |
| TASK-3-2-D | skill-stream-copy-history                                      | 2026-01-28 | `docs/30-workflows/TASK-3-2-D-skill-stream-copy-history/`                                           |
| TASK-3-2-B | skill-stream-i18n                                              | 2026-01-28 | `docs/30-workflows/TASK-3-2-B-skill-stream-i18n/`                                                   |
| TASK-3-2-C | timestamp-autoupdate                                           | 2026-01-28 | `docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/`                                                |
| TASK-3-2-A | skill-stream-ux-improvements                                   | 2026-01-27 | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/`                                        |
| TASK-3-2   | skillexecutor-ipc-integration                                  | 2026-01-25 | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/`                                         |
| #468       | workspace-chat-edit-ui (基盤)                                  | 2026-01-25 | `docs/30-workflows/workspace-chat-edit-ui/`                                                         |
| #494       | workspace-chat-edit-ui (FileAttachmentButton, FileContextList) | 2026-01-27 | `docs/30-workflows/completed-tasks/workspace-chat-edit-ui/outputs/phase-12/implementation-guide.md` |

---

### Global Navigation Core（TASK-UI-02 / completed）

TASK-UI-02-GLOBAL-NAV-CORE は、Desktop/Tablet/Mobile を跨ぐ正式なグローバルナビ基盤を実装し、`AppLayout` / `GlobalNavStrip` / `MobileNavBar` / `useNavShortcuts` / `uiSlice` nav state を現行標準へ引き上げた。
legacy `AppDock` は rollback path と比較検証のために残存するが、正系の UI 仕様は `ui-ux-navigation.md` と本節の Global Navigation Core を参照する。

| 項目 | 内容 |
| --- | --- |
| ワークフロー仕様 | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` |
| 実装コア | `GlobalNavStrip` / `MobileNavBar` / `MoreMenu` / `AppLayout` / `ComingSoonView` / `useNavShortcuts` |
| 状態同期 | `uiSlice.currentView` / `responsiveMode` / `isNavExpanded` / `isMobileMoreOpen` |
| ロールバック | `VITE_USE_GLOBAL_NAV_STRIP=false` で legacy `AppDock` 経路へ切り戻し可能 |
| 画面検証 | Phase 11 スクリーンショット 5件 + Apple UI/UX 観点レビュー |

### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| repo-wide coverage threshold が task scope 品質と混線する | coverage の全体結果だけで UI基盤タスクの合否を判断する | `coverage-final.json` から task scope 値を抽出して別記録にした | UI基盤タスクは repo-wide と task scope を別メトリクスとして残す |
| rollback path と新レイアウトの責務が `App.tsx` に戻りやすい | 旧 `AppDock` と新 nav を同居させたまま state/shortcut も親で持つ | `AppLayout` / `GlobalNavStrip` / `MobileNavBar` / `useNavShortcuts` / `uiSlice` に責務を分離し、切替は feature flag に閉じた | rollback は shell 切替だけに留め、契約と状態の正本を二重化しない |
| mobile More / 下部バー品質が自動テストだけでは確定しない | overlay / safe-area / ラベル切れを unit test だけで判断する | Phase 11 で desktop/tablet/mobile 5状態を再撮影し、`mobileLabel` で表示名を短縮、`aria-label` は正式名を維持した | mobile ナビ変更は `SCREENSHOT` 証跡と視覚レビューを完了条件に含める |
| UI仕様書の同期先が task/lessons に偏りやすい | `task-workflow` / `lessons` だけ更新して UI正本を後回しにする | `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで更新した | UIタスクは「基本6仕様書 + ドメイン追加仕様」を 1仕様書=1担当で同期する |
| completed 表示でも workflow 本文 `phase-1..11` が stale 化する | `artifacts.json` / `index.md` だけを完了同期し、本文の `pending` を見落とす | `phase-1..11` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同一ターンで更新し、pending grep を追加した | Phase 12 完了判定は「成果物 / 台帳 / 本文仕様書」の三層同期で閉じる |

### 仕様同期セット

| 同期レイヤー | 更新先 |
| --- | --- |
| UI index | `ui-ux-components.md` |
| UI detail | `ui-ux-feature-components.md` |
| navigation 正本 | `ui-ux-navigation.md` |
| state 正本 | `arch-state-management.md` |
| 台帳 | `task-workflow.md` |
| 教訓 | `lessons-learned.md` |

### 関連未タスク（2026-03-06 追補）

| 未タスクID | 概要 | 参照先 |
| --- | --- | --- |
| UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001 | UIタスクで domain UI spec が同期漏れしないようにするガード | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` |
| UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001 | Phase 12 完了後の workflow 本文 stale を検出するガード | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` |

---

### AgentView Enhancement — Tap & Discover リデザイン（TASK-UI-03 / completed）

TASK-UI-03 は、既存の `AgentView` をシングルカラム・3セマンティックリージョン構成に再設計し、Atomic Design の organisms 配下に5つのサブコンポーネントを新設した UIエンハンスメントタスクである。

#### コンポーネント構成

| 階層 | コンポーネント | 分類 | 行数 | 説明 |
| --- | --- | --- | --- | --- |
| 1 | AgentView | views | - | メインビュー（max-w-600px シングルカラム） |
| 1-1 | SkillChip | organisms | 66 | ツール選択チップ（選択/解除/トグル） |
| 1-2 | ExecuteButton | organisms | 39 | 実行ボタン（disabled/loading状態対応） |
| 1-3 | RecentExecutionList | organisms | 98 | 最近の実行履歴リスト |
| 1-4 | FloatingExecutionBar | organisms | 110 | 実行状況フローティングバー（オーバーレイ） |
| 1-5 | AdvancedSettingsPanel | organisms | 144 | 詳細設定スライドインパネル（オーバーレイ） |
| - | animations.ts | 共通定数 | 20 | アニメーション定義 |
| - | styles.ts | 共通定数 | 31 | 共通スタイル定義 |
| - | types.ts | 共通型 | 15 | AgentView 専用の状態/permission/model 型 |

#### ファイル配置

| ディレクトリ | 内容 |
| --- | --- |
| `apps/desktop/src/renderer/components/organisms/AgentView/` | 5サブコンポーネント + 共通定数 + 共通型 |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/` | 5コンポーネントテスト |
| `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx` | 統合レイアウトテスト |
| `apps/desktop/src/renderer/phase11-agent-view.{html,tsx}` | Phase 11 dedicated harness |

#### レイアウト構成

| リージョン | 内容 | 表示条件 |
| --- | --- | --- |
| 「できること」セクション | SkillChip群 + 条件付き検索バー | 常時表示（検索バーは11件以上で表示） |
| 「実行」セクション | ExecuteButton | 常時表示 |
| 「最近の実行」セクション | RecentExecutionList | 常時表示 |
| オーバーレイ | FloatingExecutionBar | 実行中に表示 |
| オーバーレイ | AdvancedSettingsPanel | 詳細設定開閉時に表示 |

#### テスト構成

| テストファイル | テスト件数 | 行数 | 対象 |
| --- | --- | --- | --- |
| `SkillChip.test.tsx` | 15 | 203 | ツール選択チップの表示・操作 |
| `ExecuteButton.test.tsx` | 8 | 120 | 実行ボタンの状態・操作 |
| `FloatingExecutionBar.test.tsx` | 12 | 130 | フローティングバーの表示・進捗 |
| `AdvancedSettingsPanel.test.tsx` | 15 | 235 | 詳細設定パネルの開閉・操作 |
| `RecentExecutionList.test.tsx` | 11 | 229 | 実行履歴の表示・操作 |
| `AgentView.layout.test.tsx` | 13 | 272 | 統合レイアウト（3リージョン構成検証） |
| `AgentView.test.tsx` | 45 | - | 統合動作・アクセシビリティ・Permission 連携 |
| `agentSlice.extension.test.ts` | 10 | - | recent history / advanced settings |
| `agentSlice.p31-regression.test.ts` | 7 | - | P31 回帰 |
| **合計** | **136** | **1,189+** | |

#### 関連未タスク

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001 | light theme の副次テキスト token コントラスト改善 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md` |

#### 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | AgentView を「できること / 実行 / 最近の実行」の 3 リージョンへ再構成し、5 organisms と Phase 11 dedicated harness を追加した |
| テスト/検証 | renderer targeted tests 136 件、typecheck、Phase 11 screenshot、Phase 12 validators を通し current workflow へ同期した |
| 苦戦箇所1 | `ImportedSkill` / `SkillMetadata` / view `Skill` の境界が曖昧だと view 実装が `as unknown as Skill[]` に流れやすかった |
| 苦戦箇所2 | 実画面導線では screenshot ごとの state 固定が難しく、panel/floating/recent list を dedicated harness 側で再現する必要があった |
| 苦戦箇所3 | light theme の副次テキスト所見は layout 完了判定と別責務で、component 修正ではなく design token 改善として切り出す必要があった |
| 再利用ルール | UIタスクでは「view 型変換」「画面 state 固定」「token scope 判定」を別 concern として分離し、1 仕様書に混ぜ込まない |

#### 同種課題の5分解決カード

1. view 層の型ずれは `adapter helper` を追加して閉じ、`unknown as` を残さない。
2. 画面証跡は App shell に依存させず、dedicated harness で `scenario` / `theme` を固定する。
3. screenshot 所見は component scope と token scope に分離し、token 起因なら `ui-ux-design-system.md` と未タスクへ送る。
4. `task-workflow.md` / `lessons-learned.md` / 本仕様書に同じ task ID と検証値を同期する。
5. Phase 12 は `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --target-file` まで閉じる。

---

### Settings AuthKeySection（09-TASK-FIX / completed）

09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 により、Settings 画面に新規 `AuthKeySection` コンポーネントを追加し、既存の `ApiKeysSection` に preload/sandbox iterable ガードを追加した。

#### コンポーネント構成

| コンポーネント | 分類 | 行数 | 説明 |
| --- | --- | --- | --- |
| `AuthKeySection/index.tsx` | organisms | 295 | APIキー管理セクション（CRUD + バリデーション） |
| `ApiKeysSection` | organisms | - | preload/sandbox iterable ガード追加（既存コンポーネント改修） |

#### テスト構成

| テストファイル | テスト件数 | 行数 | 対象 |
| --- | --- | --- | --- |
| `AuthKeySection.test.tsx` | 13 | 317 | AuthKeySection の CRUD・バリデーション・エラーハンドリング |
| `ApiKeysSection` 関連テスト | 6 | - | Preload Shape 異常系テスト（セクション 14 パターン準拠） |

#### ファイル配置

| ディレクトリ | 内容 |
| --- | --- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/` | AuthKeySection コンポーネント + テスト |

---

### AuthTimeoutFallback / Settings 公開シェル（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 / completed）

`AuthTimeoutFallback` は、AuthGuard の認証確認が `AUTH_TIMEOUT_MS = 10_000` を超えた場合に表示するフォールバック UI である。再監査では `settings` 公開シェルが AuthGuard bypass だけでなく未認証 reset 除外も満たしていることまで確認した。

#### コンポーネント構成

| コンポーネント | 分類 | 実装ファイル | 役割 |
| --- | --- | --- | --- |
| `AuthTimeoutFallback` | molecules | `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx` | timeout 時の warning + retry + settings 導線 |
| `SettingsView` | view | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | 認証不能時でも操作可能な公開シェル |
| `shouldResetUnauthenticatedView` | util | `apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts` | `settings` を公開ビューとして reset 対象外にする |

#### UI 契約

| 観点 | 契約 |
| --- | --- |
| timeout fallback | warning icon、見出し、説明文、`リトライ`、`設定画面へ` を表示する |
| settings shell | 未認証でも `AccountSection` のログイン CTA、認証方式、APIキー、テーマ、RAG を表示できる |
| safety | 保護ビューは reset 対象のまま維持し、公開するのは `settings` のみ |
| 再監査補足 | current workflow の screenshot では light theme の `リトライ` 視認性差分が見つかったため、機能完了とは分離して未タスク化する |

#### 画面証跡

| TC | 証跡 |
| --- | --- |
| TC-11-01 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-01-timeout-fallback-light.png` |
| TC-11-02 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-02-timeout-fallback-dark.png` |
| TC-11-03 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-03-timeout-to-settings.png` |
| TC-11-04 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-04-settings-shell-unauthenticated.png` |

#### 関連未タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-AUTH-TIMEOUT-FALLBACK-LIGHT-CONTRAST-GUARD-001 | `AuthTimeoutFallback` ライトテーマで `リトライ` の視認性が低い問題を改善する | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` |

---

## 関連ドキュメント

### 分割ファイル

- [SkillStreamDisplay詳細仕様](./ui-ux-feature-skill-stream.md) - TASK-3-2シリーズの完全な仕様
- [SkillStreamingView統合仕様](./interfaces-agent-sdk-ui.md) - TASK-7D ChatPanel統合仕様

### 親・関連仕様

- [UI/UXコンポーネント概要](./ui-ux-components.md)
- [デザイン原則](./ui-ux-design-principles.md)
- [Agent Execution UI](./ui-ux-agent-execution.md)

### 実装ガイド

- [SkillStreamDisplay UX改善](../../../docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md)
- [タイムスタンプ自動更新](../../../docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/outputs/phase-12/implementation-guide.md)
- [SkillStreamDisplay i18n](../../../docs/30-workflows/TASK-3-2-B-skill-stream-i18n/outputs/phase-12/implementation-guide.md)
- [SkillStreamDisplay コピー履歴](../../../docs/30-workflows/TASK-3-2-D-skill-stream-copy-history/outputs/phase-12/implementation-guide.md)
- [TASK-9A SkillEditor実装](../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/implementation-guide.md)
- [workspace-chat-edit-ui](../../../docs/30-workflows/completed-tasks/workspace-chat-edit-ui/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05 SkillCenterView実装](../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05A SkillEditorView仕様（spec_created）](../../../docs/30-workflows/skill-editor-view/index.md)
- [TASK-UI-05A 画面検証結果](../../../docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md)
- [TASK-10A-B SkillAnalysisView仕様](../../../docs/30-workflows/completed-tasks/skill-analysis-view/index.md)
- [TASK-10A-B 手動検証結果](../../../docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/manual-test-result.md)
- [TASK-10A-B 画面検証スクリーンショット](../../../docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/)
- [TASK-10A-C SkillCreateWizard仕様](../../../docs/30-workflows/completed-tasks/skill-create-wizard/index.md)
- [TASK-10A-C 手動検証結果](../../../docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/manual-test-result.md)
- [TASK-10A-C 画面検証スクリーンショット](../../../docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/)
- [TASK-UI-00-ORGANISMS 仕様](../../../docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/index.md)
- [TASK-UI-00-ORGANISMS 手動検証結果](../../../docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/manual-test-result.md)
- [TASK-UI-00-FOUNDATION-REFLECTION-AUDIT 仕様](../../../docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/index.md)
- [TASK-UI-01-C Notification / History Domain 仕様](../../../docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md)
- [TASK-UI-01-C Notification / History Domain 手動検証結果](../../../docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-11/manual-test-result.md)
- [TASK-UI-03 AgentView Enhancement 仕様](../../../docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/)

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                        |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 2026-03-11 | v1.14.35   | TASK-UI-04C follow-up: `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` を Workspace Preview / Quick Search 節の関連未タスクへ追加し、fuzzy no-match、renderer timeout+retry、error taxonomy を再利用用未タスクへ接続 |
| 2026-03-11 | v1.14.34   | TASK-UI-04C-WORKSPACE-PREVIEW を反映: 収録機能一覧へ Workspace Preview / Quick Search を追加し、専用セクションへ `PreviewPanel` / `QuickFileSearch` / timeout+retry / screenshot 11件 / 苦戦箇所 3件を同期 |
| 2026-03-11 | v1.14.33   | TASK-UI-04B-WORKSPACE-CHAT を反映: 収録機能一覧へ Workspace Chat Panel を追加し、専用セクションへ `WorkspaceChatPanel` / mention / stream / file context / conversation persist、targeted tests 14件、Phase 11 screenshot 8件を同期 |
| 2026-03-11 | v1.14.32   | TASK-UI-07 の related UT を追加: `UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001` を Dashboard Home Enhancement 節の関連未タスクへ登録し、dual root repository での canonical root 固定と mirror sync を UI 実装後の Phase 12 ガードとして再利用可能化 |
| 2026-03-11 | v1.14.31   | TASK-UI-07 再監査反映: Dashboard Home Enhancement 節に実装時の苦戦箇所（表示名と内部契約の境界、view-local component 判断、harness screenshot 運用）と 5分解決カードを追加し、再利用可能な UI 実装知見として固定 |
| 2026-03-11 | v1.14.30   | TASK-UI-07 完了反映: 収録機能一覧へ Dashboard Home Enhancement を追加し、専用セクションに GreetingHeader / DashboardSuggestionSection / RecentTimeline 構成、22 tests、Phase 11 screenshot 5件を同期 |
| 2026-03-11 | v1.14.32   | TASK-SKILL-LIFECYCLE-01 の feature spec 形成を最適化: `ui-ux-feature-components.md` の lifecycle 追補を `実装内容（要点）` / `苦戦箇所（再利用形式）` / `同種課題の5分解決カード` の3ブロックへ再編し、system spec 単体でも短手順で再利用できる状態に整理 |
| 2026-03-11 | v1.14.31   | TASK-SKILL-LIFECYCLE-01 再監査同期: `SkillCenterView UI` に surface ownership board と要素単位 screenshot 証跡（TC-11-05）を追記し、責務境界の可視化を system spec から参照可能にした |
| 2026-03-11 | v1.14.30   | TASK-SKILL-LIFECYCLE-01 完了同期: `SkillCenterView UI` に lifecycle journey panel を追加し、`Store駆動ライフサイクルUI統合` へ job guide / downstream contract の前段責務を追記 |
| 2026-03-10 | v1.14.29   | TASK-UI-06-HISTORY-SEARCH-VIEW 節をテンプレート準拠へ最適化。見出しを `実装内容（要点）` に統一し、5分解決カードを追加して専用仕様 `ui-history-search-view.md` と粒度を揃えた |
| 2026-03-11 | v1.14.29   | TASK-UI-04C-WORKSPACE-PREVIEW を反映。`Workspace Preview / Quick Search` 節を追加し、`PreviewPanel` / `QuickFileSearch` / `SourceView` / timeout+retry / structured fallback / screenshot 11件 / 52 tests PASS を 04A 直下の feature 正本へ同期 |
| 2026-03-10 | v1.14.28   | TASK-UI-06-HISTORY-SEARCH-VIEW を反映。`HistorySearchView` の timeline 再設計、`historySearchSlice` / `editorSlice` 契約、Phase 11 screenshot 6件、未タスク `UT-IMP-SKILL-ROOT-CANONICAL-SYNC-GUARD-001` を追加し、専用仕様 `ui-history-search-view.md` への入口を作成 |
| 2026-03-10 | v1.14.27   | TASK-UI-03 workflow completed-tasks 移管: AgentView Enhancement の正本導線を `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/` へ更新し、関連未タスクも親 workflow 配下 `unassigned-task/` へ移管した状態へ同期 |
| 2026-03-10 | v1.14.26   | TASK-UI-03 実装/苦戦サマリー追補: AgentView Enhancement 節に「実装内容と苦戦箇所サマリー」と「同種課題の5分解決カード」を追加し、adapter helper・dedicated harness・token scope 分離を feature 正本から直接参照できるよう再編 |
| 2026-03-10 | v1.14.25   | UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 を追加。Workspace Layout Foundation 節へ current build source pinning と visual checklist 共通化の未タスク導線を登録し、04A の苦戦箇所から active backlog へ直接たどれるようにした |
| 2026-03-10 | v1.14.24   | TASK-UI-04A-WORKSPACE-LAYOUT を反映: 収録機能一覧へ Workspace Layout Foundation を追加し、`WorkspaceView` / `FileBrowserPanel` / `PanelToggleBar` / `WorkspaceStatusBar` / watcher 連携 / Phase 11 screenshot 8件 / light theme contrast 是正を専用セクションへ同期 |
| 2026-03-10 | v1.14.23   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査追補: `AuthTimeoutFallback` / Settings 公開シェル / `shouldResetUnauthenticatedView` を UI 機能仕様へ追加し、Phase 11 screenshot 4件を同期 |
| 2026-03-10 | v1.14.22   | TASK-UI-03 current workflow 同期: AgentView Enhancement の workflow 導線を `docs/30-workflows/task-ui-03-agent-view-enhancement/` に修正し、`types.ts` と Phase 11 dedicated harness、実測 136 tests を反映 |
| 2026-03-11 | v1.14.23   | TASK-UI-08-NOTIFICATION-CENTER を反映。Notification / History Domain 節へ 058e 追補（`お知らせ`、Portal、relative time、個別削除 IPC、Phase 11 screenshot 7件、59 tests PASS）を追加し、完了タスク表へ登録 |
| 2026-03-08 | v1.14.21   | TASK-UI-03 / 09-TASK-FIX 完了反映: AgentView Enhancement 専用セクション（5サブコンポーネント構成、71テスト、レイアウトテスト）と Settings AuthKeySection 専用セクション（13テスト）を追加。完了タスクテーブルに2件登録。関連ドキュメントリンクを追加 |
| 2026-03-07 | v1.14.22   | TASK-10A-F 完了反映: 収録機能一覧に Store-Driven Lifecycle Integration を追加。`useSkillAnalysis` の Store統合と画面検証（11 screenshot）を専用セクションへ同期し、workflow 導線を `docs/30-workflows/store-driven-lifecycle-ui/` に固定 |
| 2026-03-06 | v1.14.21   | UT-TASK-10A-B-008 再監査追補を反映。SkillAnalysisView 節へ `useSkillAnalysis` の StrictMode ローディング固着修正と screenshot 8ケース再検証（dark/light/mobile/error/loading）を追記し、active/completed 別表運用の再発防止ルールを補強 |
| 2026-03-06 | v1.14.20   | UT-TASK-10A-B-008 完了を反映。SkillAnalysisView の関連未タスク表を current active set 6件（002/004/005/006/007/009）へ再同期し、完了済み派生タスク 3件（001/003/008）を別表へ分離。`validate-task10ab-ledger-sync` で task-workflow / detection との整合を機械検証する運用を追記 |
| 2026-03-06 | v1.14.19   | TASK-UI-02 移管反映。workflow 導線を `completed-tasks/task-057-ui-02-global-nav-core/` へ更新し、関連未タスク 2 件を同 workflow の `unassigned-task/` 配下へ移した状態に同期 |
| 2026-03-06 | v1.14.18   | TASK-UI-02 派生未タスクを追補。domain UI spec 同期ガードと workflow 本文 stale ガードを `関連未タスク` として登録し、Global Navigation Core の再発防止導線を task spec へ接続 |
| 2026-03-06 | v1.14.17   | TASK-UI-02 追補: 収録機能一覧へ Global Navigation Core の入口行を追加し、専用セクションへ苦戦箇所テーブルと仕様同期セット（index/detail/navigation/state/task/lessons）を追記 |
| 2026-03-06 | v1.14.16   | TASK-UI-02 再監査追補: 完了タスク表へ Global Navigation Core を追加し、`GlobalNavStrip` / `MobileNavBar` / `AppLayout` / `uiSlice` nav state / rollback path / Phase 11 視覚検証を feature catalog へ同期。あわせて TASK-UI-05A のナビ導線表記を `AppDock` 前提から現行の `GlobalNavStrip` / `MobileNavBar` 基準へ更新 |
| 2026-03-05 | v1.14.15   | TASK-UI-01-C 追補: `UT-IMP-TASK-UI-01C-NOTIFICATION-HISTORY-BOUNDARY-GUARD-001` を関連未タスクへ追加。Notification/History の境界難所（push正規化/dedupe/filter継承）を未タスク導線として固定 |
| 2026-03-05 | v1.14.14   | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN の実装完了内容を反映。収録機能一覧/専用セクション/完了タスクへ `NotificationCenter` と `HistorySearchView` を追加し、実装時の苦戦箇所（timestamp正規化、履歴重複排除、filter一元化）と Phase 11 証跡（TC-01〜03）を同期 |
| 2026-03-05 | v1.14.13   | UT-IMP-TASK-UI-055-FIVE-MINUTE-CARD-SYNC-GUARD-001 を追加。Foundation Reflection Audit の関連未タスク表へ同IDを登録し、5分解決カードの3仕様書同時同期（task-workflow/lessons/ui-ux-feature）を再発防止タスクとして接続 |
| 2026-03-05 | v1.14.12   | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT の最終追補（12:21 JST）を反映。追加再検証値（28項目/13-13/TC6-6/92-92/current=0）を同期し、Foundation Reflection Audit 節へ「同種課題の5分解決カード（TASK-055）」を追加して再利用導線を短縮 |
| 2026-03-05 | v1.14.11   | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT の最終再確認を反映。Phase 11 証跡を 11:51 JST へ更新し、再確認時の苦戦箇所（検証コマンド実行経路ドリフト / 再撮影時刻ドリフト）と再利用ルールを task-workflow / lessons と同期 |
| 2026-03-05 | v1.14.10   | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT 再監査追補。Phase 11 再撮影（11:43 JST）と `validate-phase11-screenshot-coverage` 警告0件化（TC 6/6）を反映 |
| 2026-03-05 | v1.14.9    | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT を反映。正本導線（FND-055-001）、Task 5D具体例（FND-055-002）、Task 5B適用境界（FND-055-003）の是正と、検証スクリプト/テスト追加を完了タスクへ同期 |
| 2026-03-04 | v1.14.8    | UT-IMP-TASK-UI-00-ORGANISMS-PHASE12-SYNC-GUARD-001 を追補。Organisms Foundation 節に関連未タスク導線を追加し、Phase 12 の時刻同期・監査判定軸・Step 1-A 同時更新を未タスク正本へ接続 |
| 2026-03-04 | v1.14.7    | TASK-UI-00-ORGANISMS 最適化追補: Organisms Foundation に「苦戦箇所（再発条件付き）」と「同種課題の最短解決テンプレート（5分）」を追加し、記録形式を統一 |
| 2026-03-04 | v1.14.6    | TASK-UI-00-ORGANISMS 完了反映: 収録機能一覧・専用セクション・完了タスクへ CardGrid / MasterDetailLayout / SearchFilterList を追加し、Phase 11 証跡（TC-01〜TC-06）を同期 |
| 2026-03-04 | v1.13.5    | SkillCenter削除導線ホットフィックスの実測値を再確定。対象テストを `delete-confirm/useSkillCenter/useFeaturedSkills` の3ファイルへ固定し、再検証値を `3 files / 30 tests`、coverage `86.89/84.61/88.88` へ更新 |
| 2026-03-04 | v1.13.4    | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 追補: SkillCenter 削除導線ホットフィックス（確認ダイアログ未描画の解消）を追加。テスト資産件数を `10ファイル / 132テスト` に更新し、再検証値（3 files / 30 tests、coverage 86.89/84.61/88.88）を記録 |
| 2026-03-04 | v1.13.3    | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: SkillStreamDisplay セクションに認証 preflight UX ガード（`auth-key:exists` 事前判定、`AUTHENTICATION_ERROR` 表示、execute抑止）を追加。Phase 11 画面証跡3件を同期 |
| 2026-03-04 | v1.14.5    | workflow02 追補を反映。`UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` / `UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001` を Skill Import Idempotency Guard 節へ追記し、苦戦箇所（コマンド公開不足 / `page.goto` timeout）の再利用ルールを追加 |
| 2026-03-04 | v1.14.4    | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 を反映。SkillCenterView セクションへ欠損メタデータ防御契約（description nullish、配列 nullish、検索/おすすめ防御）を追加し、Phase 11 画面証跡 TC-01〜TC-04 を同期。完了タスク台帳へ同タスクを登録 |
| 2026-03-04 | v1.14.3    | TASK-10A-D の再確認苦戦箇所から未タスク2件を追加。`UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001`（仕様書別SubAgent実行ログ必須化）と `UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001`（画面証跡の状態名+検証目的分離）を関連未タスクへ登録 |
| 2026-03-04 | v1.14.2    | TASK-10A-D 仕様書別SubAgent反映ログを追加。`ui-ux-feature-components` / `task-workflow` / `lessons-learned` の3仕様書分担で実装内容と苦戦箇所を同一ターン同期する運用を明文化し、5ステップの簡潔解決手順へ再編 |
| 2026-03-04 | v1.14.1    | TASK-10A-D 再確認追補: Phase 12再検証値（13/13, 28項目, TC 5/5, current=0/baseline=85）を追加。TC-02（analysis遷移時フォールバック）とTC-05（意図的エラー検証）の証跡意図を分離し、画面証跡レビューの運用ルールを明文化 |
| 2026-03-03 | v1.14.0    | TASK-10A-D 完了反映: 収録機能一覧・完了タスクへスキルライフサイクルUI統合を追加。専用セクション（コンポーネント階層/ビュー構成/ChatPanel統合/Store拡張/テスト132件/苦戦箇所3件）を新設 |
| 2026-03-02 | v1.13.2    | TASK-10A-C 完了反映: 収録機能一覧・完了タスクへ SkillCreateWizard を追加。専用セクション（構成/IPC依存/画面証跡8件/苦戦箇所）を新設し、未タスク0件を同期 |
| 2026-03-02 | v1.13.1    | TASK-10A-B 未タスク追補: 苦戦箇所3件（Phase 11必須節検証/画面証跡鮮度/未タスク件数再計算）を独立未タスク `UT-TASK-10A-B-006〜008` として追加し、関連未タスク表を8件へ拡張 |
| 2026-03-02 | v1.13.0    | TASK-10A-B 追補: 実装時の苦戦箇所（Phase 11 実証跡化/必須節不足/未タスク件数ドリフト）と5ステップ簡潔解決手順を追加 |
| 2026-03-02 | v1.12.9    | TASK-10A-B 完了反映: 収録機能一覧・完了タスクへ SkillAnalysisView を追加。専用セクション（構成/IPC/a11y補正/画面証跡/未タスク5件）を新設 |
| 2026-03-02 | v1.12.5    | TASK-UI-05A 再監査反映: SkillEditorView を「実装未着手」から「実装済み（統合未完了）」へ更新。再取得した画面証跡（UI05A-03/04）を追加し、未タスク正本を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ統一 |
| 2026-03-01 | v1.12.4    | TASK-UI-05A spec_created 反映: 収録機能一覧へ `Skill Editor View`（実装未着手）を追加。`仕様書作成済みタスク` セクションを新設し、未実装ギャップ（View未生成・導線未配線）と画面検証証跡を明記 |
| 2026-03-02 | v1.12.8    | UT-UI-05B-001 登録: TASK-UI-05B の苦戦箇所（画面証跡の再撮影漏れリスク）を未タスク化し、関連未タスク表へ `task-ui-05b-phase12-screenshot-evidence-recapture-guard.md` を追加 |
| 2026-03-02 | v1.12.7    | TASK-UI-05B テンプレート最適化: 仕様書別SubAgent分担（6責務）を追加し、簡潔解決手順を5ステップへ再編 |
| 2026-03-02 | v1.12.6    | TASK-UI-05B 再確認追補: 苦戦箇所（Phase 12参照不足warning、画面証跡再撮影、未タスク監査のcurrent/baseline分離）と4ステップの簡潔解決手順を追加 |
| 2026-03-02 | v1.12.5    | TASK-UI-05B 実装完了同期: 収録機能一覧を `完了` に更新し、専用セクションの進捗を `completed` へ反映。完了タスクへ TASK-UI-05B を追加し、spec_created 台帳を解消 |
| 2026-03-01 | v1.12.4    | TASK-UI-05B spec_created を反映: 収録機能一覧に Skill Advanced Views を追加し、専用セクション（4ビュー責務・実装前ガード・画面証跡）と `仕様書作成済みタスク` テーブルを新設 |
| 2026-03-01 | v1.12.3    | TASK-UI-05 completed-tasks 移管: ワークフロー参照を `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` へ更新し、関連未タスク7件の参照先を同ディレクトリ配下 `unassigned-task/` へ同期 |
| 2026-03-01 | v1.12.2    | TASK-UI-05追補: 関連未タスクに UT-UI-05-007（Phase 12 UI仕様同期プロファイル適用ガード）を追加し、task-workflow/ui-ux-components との参照整合を統一 |
| 2026-03-01 | v1.12.1    | TASK-UI-05追補: SkillCenterView 実装時の苦戦箇所（型境界/責務集中/Phase 12同期）と4ステップ簡潔解決手順を追加 |
| 2026-03-01 | v1.12.0    | TASK-UI-05完了反映: SkillCenterView セクション追加（コンポーネント/状態管理/IPC依存/関連未タスク）。収録機能一覧・完了タスク・関連ドキュメントを同期 |
| 2026-02-26 | v1.11.2    | TASK-9A成果物移管を反映。参照正本を `completed-tasks/TASK-9A-skill-editor/` に更新し、`TASK-9A-C-004` を完了化して `completed-tasks/unassigned-task/` へ移管 |
| 2026-02-26 | v1.11.1    | TASK-9A-C-004 を関連未タスクへ追加。Phase 12再確認で顕在化した Part 1/2 要件漏れ・監査判定誤読・メタ情報重複・3仕様書同期漏れの再発防止タスクを台帳化 |
| 2026-02-26 | v1.11.0    | TASK-9A完了反映: SkillEditor UI を `spec_created` から `完了` に更新。`TASK-9A-skill-editor` を正本参照へ追加し、未タスク `TASK-9A-C-002` を完了化（統合実装） |
| 2026-02-19 | v1.10.0    | TASK-9A-C: 関連未タスク3件参照テーブル追加。仕様書ディレクトリをcompleted-tasks/にパス移行 |
| 2026-02-19 | v1.9.0     | TASK-9A-C: SkillEditorコンポーネント仕様追加（コンポーネント階層、レイアウト、状態管理、IPC依存、キーボード、アクセシビリティ） |
| 2026-02-19 | v1.8.1     | TASK-9A-C: Phase 12準拠監査結果（`phase12-compliance-audit.md`）と監査反映内容を追記 |
| 2026-02-19 | v1.8.0     | TASK-9A-C: SkillEditor UIの仕様書作成済み状態を追加（実装未着手を明記、関連ドキュメントリンク追加） |
| 2026-01-31 | v1.7.0     | TASK-7D: SkillStreamingViewコンポーネント仕様追加、完了タスクテーブルにTASK-7D追加、関連ドキュメントリンク追加 |
| 2026-01-28 | v1.6.0     | TASK-3-2-D: コピー履歴機能追加（CopyHistoryPanel、CopyHistoryContext、useCopyHistory）          |
| 2026-01-28 | v1.5.0     | 構造最適化: SkillStreamDisplay関連を ui-ux-feature-skill-stream.md に分割（826行→約400行）      |
| 2026-01-28 | v1.4.0     | TASK-3-2-B: i18n対応追加（formatRelativeTime localeパラメータ、日英2言語、翻訳テーブル）        |
| 2026-01-28 | v1.3.0     | TASK-3-2-C: タイムスタンプ自動更新機能追加（TimestampProvider, useInterval, usePageVisibility） |
| 2026-01-27 | v1.2.0     | TASK-3-2-A: SkillStreamDisplay UX改善（R1スピナー、R2タイムスタンプ、R3コピー）追加             |
| 2026-01-27 | v1.1.1     | 構造最適化: 概要セクション追加（収録機能一覧・共通仕様テーブル）                                |
| 2026-01-27 | v1.1.0     | Issue #494: FileAttachmentButton, FileContextList コンポーネント仕様追加                        |
| 2026-01-26 | v1.0.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                                              |
