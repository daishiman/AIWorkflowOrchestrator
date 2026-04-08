# 機能別 UI コンポーネント / reference bundle

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: reference bundle

> 2026-04-08 追記: `CompleteStep` 再設計の current contract は詳細側の `ui-ux-feature-components-skill-analysis.md` に反映済み。`skillPath` / `onClose` ベースの旧表示から、起点画面化された完了画面へ更新された。

## SkillCenterView UI（TASK-UI-05 / 完了）

TASK-UI-05-SKILL-CENTER-VIEW で、ツール探索専用ビュー `SkillCenterView` の実装と検証（Phase 1-12）が完了。
AgentView の「実行」責務と分離し、ツールの探索・追加・詳細確認を一画面で完結できる UI として定義する。

### 実装済みコンポーネント / Hook

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view | SkillCenterView | 画面統合（検索、カテゴリ、おすすめ、グリッド、詳細パネル） | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` |
| organism | FeaturedSection | 未追加ツールのおすすめ表示（最大3件） | `.../components/FeaturedSection/FeaturedSection.tsx` |
| organism | SkillDetailPanel | ツール詳細表示、編集/分析 handoff、削除導線 | `.../components/SkillDetailPanel/SkillDetailPanel.tsx` |
| molecule | FeaturedCard / SkillCard / CategoryTabs / SkillEmptyState | カード表示・カテゴリ切替・空状態表示 | `.../components/` |
| atom | AddButton | 追加ボタン状態遷移（idle/processing/success） | `.../components/AddButton.tsx` |
| hook | useSkillCenter | Store接続、フィルタリング、詳細パネル状態管理、edit/analyze handoff | `.../hooks/useSkillCenter.ts` |
| hook | useFeaturedSkills | 未追加ツール抽出 + 多様性考慮のおすすめ選定 | `.../hooks/useFeaturedSkills.ts` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/views/SkillCenterView/` |
| テスト資産 | ✅ 完了（10ファイル / 132テストケース定義） | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/` |
| Phase 12成果物 | ✅ 完了（5必須 + 補助1） | `outputs/phase-12/*.md` |

### Task-Skill-Lifecycle-01 foundation 追補（2026-03-11）

#### 実装内容（要点）

| 観点 | 内容 |
| --- | --- |
| 画面の主目的 | `SkillCenterView` を create / use / improve の一次導線入口として固定し、後続 surface へ handoff する |
| 変更範囲 | `Renderer`（`SkillCenterView`, `App.tsx`, `skillLifecycleJourney.ts`, view test） |
| 実装した要点 | `skillLifecycleJourney.ts` へ job guide / surface responsibility / downstream contract を集約し、`SkillCenterView` に journey panel と surface ownership board を追加した |
| 契約上の要点 | legacy `skill-center` は shell の `normalizeSkillLifecycleView()` で canonical `skillCenter` に正規化し、下流の UI / test / spec は正本値へ統一する |
| 視覚検証 | Phase 11 screenshot 6件を再取得し、TC-11-05 は `data-testid="skill-lifecycle-surface-ownership"` の要素 capture を正本証跡にした |
| 完了根拠 | targeted tests 18 PASS、`verify-all-specs` 13/13 PASS、`validate-phase-output` PASS、`validate-phase12-implementation-guide` PASS |

#### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| 一次導線の説明が nav / feature / state に分散し、入口判断が揺れる | UI 表示だけ更新し、コード契約の正本を持たない | `skillLifecycleJourney.ts` を導線正本にし、`SkillCenterView` は表示責務だけに寄せた | 入口・責務・例外・handoff は 1 ファイルへ集約する |
| legacy alias を放置すると shell 分岐と仕様書が二重化する | `skill-center` を view や test 側で個別吸収する | `App.tsx` の `normalizeSkillLifecycleView()` で 1 回だけ canonical 化した | alias 正規化は shell 入口で一度だけ行う |
| representative screenshot が shell 全景だけだと責務比較に弱い | route screenshot だけで TC を閉じる | surface ownership board を追加し、TC-11-05 を要素 capture へ切り替えた | representative evidence は責務や state を表す selector を待って要素単位で撮る |
| 0件報告だけでは未タスクディレクトリ全体が健全に見える | `unassigned-task-detection.md` に件数 0 しか書かない | `currentViolations=0 / baselineViolations=133` と既存 remediation task 参照を同時に記録した | 0件報告でも current/baseline と既存 backlog 導線を分離して残す |

#### 同種課題の5分解決カード

1. 導線再編は job guide と責務境界をコード契約へ切り出し、view 本体は表示責務へ寄せる。
2. legacy alias は shell で canonical 化し、下流コード・test・spec は正本値だけを使う。
3. 入口画面には primary journey と destination surface を同居させず、handoff を明記する。
4. representative screenshot は shell 全景ではなく、責務境界が読める要素 capture を正本にする。
5. Phase 12 は `task-workflow` / `lessons-learned` / `ui-ux-feature-components` に同じ実装内容・苦戦箇所・current/baseline 監査値を同期する。

### TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001（2026-03-19）

#### 実装内容（要点）

| 観点 | 内容 |
| --- | --- |
| action zone 表示条件 | `SkillDetailPanel` は `isImported && onEdit && onAnalyze` のときだけ `action-buttons-zone` を表示する |
| edit handoff | `エディタで開く` は `handleEditSkill(skillName)` を呼び、`currentSkillName` を設定して `skill-editor` へ遷移する |
| analyze handoff | `分析する` は `handleAnalyzeSkill(skillName)` を呼び、`currentSkillName` を設定して `skillAnalysis` へ遷移する |
| detail state | handoff 後は `handleCloseDetail()` により detail panel を閉じ、一覧 state を残さない |
| 画面証跡 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/outputs/phase-11/screenshots/TC-11-01..07` |
| 自動検証 | `SkillDetailPanel.test.tsx`（49 tests）+ `useSkillCenter.test.ts`（17 tests）+ `useSkillCenter.navigation.test.ts`（4 tests）で 70 tests PASS |

#### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| standalone route の screenshot だけでは handoff 証明が弱い | destination view の単体 capture だけで完了判定する | `SkillCenter` main shell 上で detail panel click から destination まで連続 capture した | handoff 系 UI は source surface から destination まで同一 shell で撮る |
| desktop / mobile 両パネルが同時に DOM に存在し selector が衝突する | `data-testid="edit-skill-button"` を page 全体で直接探す | visible panel を返す locator に scope して click した | shared DOM を持つ UI は panel scope を切ってから操作する |

#### 同種課題の5分解決カード

1. source surface がある handoff は destination 単独ではなく main shell 上で撮る。
2. state payload が必要な遷移は `skillName` などの payload 設定順序も test で固定する。
3. shared desktop/mobile DOM は visible container を先に特定してから selector を使う。
4. destructive action と primary action は detail panel 内で縦方向に分離する。
5. Phase 12 では `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` を同時同期する。

### TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001（2026-03-20）

#### 実装内容（要点）

| 観点 | 内容 |
| --- | --- |
| CTA surface | `AgentView` に `aria-label="スキル改善提案"` region を追加し、実行完了後だけ「分析する」を提示する |
| CTA gate | `selectedSkillName` / `skillExecutionStatus` / `isExecuting` から `canOfferAnalysis` を導出し、未完了・未選択・実行中では非表示にする |
| analysis handoff | CTA click で `currentSkillName` を設定して `skillAnalysis` へ遷移し、対象スキル名を round-trip 全体で維持する |
| Agent round-trip | `SkillAnalysisView` に optional props `onNavigateBack` / `onNavigateToAgent` を追加し、Agent 起点のときだけ「戻る」「エージェントで再実行」を表示する |
| shell guard | `App.tsx` は `viewHistory[length - 2] === "agent"` の場合だけ navigation props を注入し、SkillCenter 起点の analysis UI を汚染しない |
| 画面証跡 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/outputs/phase-11/screenshots/TC-11-01..06` |
| 自動検証 | `AgentView.cta.test.tsx`, `AgentView.coverage.test.tsx`, `SkillAnalysisView.navigation.test.tsx`, `App.renderView.viewtype.test.tsx` |

#### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| onboarding overlay が CTA 領域を覆って screenshot が安定しない | App 実画面を harness で起動しても onboarding 完了 state を与えない | screenshot harness の `store.get("onboarding.hasCompleted")` を `true` に固定した | UI証跡 harness は overlay/初期導線の前提 state を明示してから capture する |
| x64 Node では esbuild バイナリ不一致で capture が失敗する | Volta の x64 Node と arm64 esbuild が混在した worktree で Vite を起動する | `/opt/homebrew/bin/node` と `/opt/homebrew/bin/pnpm` を使う arm64 経路へ切り替えた | Phase 11 capture 前に `process.arch` を確認し、native 依存ツールは実アーキに合わせる |
| `戻る` と `再実行` の screenshot が最終画面だけ見ると同形に見える | round-trip 先がどちらも AgentView で、画面差分が視覚的に薄い | `phase11-capture-metadata.json` に action 別イベントを保存し、証跡説明を併記した | 同形 screenshot が想定されるときは metadata をセットで正本証跡にする |

#### 同種課題の5分解決カード

1. 実行完了 CTA は store に保持せず、既存 state からの派生値で制御する。
2. round-trip UI は source surface 固有の props を optional にして、他起点の画面責務を混ぜない。
3. screenshot harness は onboarding / auth / theme の前提 state を明示的に固定する。
4. native 依存ツールを使う前に `process.arch` を確認し、arm64/x64 の実行経路を揃える。
5. 同形 screenshot があり得る場合は metadata や manual-test-result を同時に残す。

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| Store接続 | `useAvailableSkillsMetadata` / `useImportedSkills` / `useSetSkillFilter` など個別セレクタを使用（P31準拠） |
| ローカル状態 | 詳細パネル開閉、削除確認、追加中アニメーション状態を `useState` で管理 |
| IPC利用 | Rendererは Store アクション経由で利用（`skill:list`, `skill:import`, `skill:remove`） |
| 契約変更 | 新規IPCチャンネル追加なし（既存契約の再利用） |

### 欠損メタデータ防御（TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001）

| 観点 | 実装 |
| --- | --- |
| 文字列防御 | `String(skill.description ?? "")` を `SkillCard` / `SkillDetailPanel` / Hook検索で統一し、null/undefined 表示クラッシュを防止 |
| 配列防御 | `safeLength` / `safeSubResources` / `safeOtherFiles` で `agents/references/indexes/scripts/otherFiles` の nullish を空配列扱い |
| 検索防御 | `normalizeSearchText` を導入し、フィルタ・カテゴリ推論で `.toLowerCase()` 例外を防止 |
| Featured 防御 | `useFeaturedSkills` の入力既定値を `allSkills=[]` / `importedSkillNames=[]` に固定 |
| 結果 | 欠損メタデータを含むスキルでも SkillCenterView の一覧/詳細/おすすめ表示が継続可能 |

### 画面検証証跡（2026-03-04）

| TC | 証跡 | ファイル |
| --- | --- | --- |
| TC-01 | 欠損説明文ありカード表示（通常表示） | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-01-skill-center-initial.png` |
| TC-02 | 欠損説明文でフィルタ遷移 | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-02-search-with-missing-description.png` |
| TC-03 | 欠損サブリソースを含む詳細パネル | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-03-detail-panel-malformed-metadata.png` |
| TC-04 | 欠損データ混在でのおすすめ表示 | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/TC-04-featured-and-category.png` |

### Skill Import Idempotency Guard 追補（2026-03-04）

| 観点 | UI契約 |
| --- | --- |
| 追加中ガード | `useSkillCenter.handleAddSkill` は `addingSkills.has(skillName)` で同一スキル再実行を抑止する |
| 既存追加済み時の挙動 | 既に追加済みスキルでは追加成功アニメーションを開始せず、状態同期のみを実施する |
| 状態視認性 | ボタン状態は `追加する` → `追加中...` → 一覧反映（対象カード除外）を維持し、誤操作を誘発しない |

| TC | 証跡 | ファイル |
| --- | --- | --- |
| TC-01 | 追加済み/未追加の初期分離表示 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-01-initial-imported-state.png` |
| TC-02 | 追加中ステータス表示 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-02-new-skill-processing.png` |
| TC-03 | 追加完了後の一覧整合 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-03-post-import-state.png` |
| TC-04 | 追加済み詳細パネル表示 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/TC-04-imported-detail-panel.png` |

### workflow02 追補の関連未タスク（2026-03-04）

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 | Phase 12 UI証跡再取得コマンドを `pnpm run screenshot:*` で公開し、実行経路を一意化するガード | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-screenshot-command-registration-guard-001.md` |
| UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001 | capture script の遷移待機（`domcontentloaded` 基準 + 補助待機）を標準化するガード | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-capture-script-navigation-stability-guard-001.md` |

### workflow02 追補の苦戦箇所（再利用用）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| screenshot 実行コマンドが scripts 一覧に露出していない | `node scripts/...` 直実行前提で運用し、`pnpm run` 経路へ未登録のとき | 未タスク `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` を起票し、`screenshot:*` 命名で登録を必須化 | UI証跡は「スクリプト実体」ではなく「run コマンド公開」まで完了条件にする |
| capture script の `page.goto` 待機戦略が環境依存で timeout する | `waitUntil: load` 固定で画面遷移待機するとき | 未タスク `UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001` を起票し、`domcontentloaded` 基準 + 補助待機の標準化を追加 | 失敗時ログ（待機段階/URL）を残し、1回目失敗で切り分け可能にする |
### 2026-03-04 追補: 削除導線ホットフィックス

| 観点 | 追補内容 |
| --- | --- |
| 不具合 | 「ツールを削除」押下後に削除が実行されない（`handleRequestDelete` 後の確認UIが未描画） |
| 修正 | `SkillCenterView/index.tsx` に削除確認ダイアログを追加し、`handleConfirmDelete` / `handleCancelDelete` / `Escape` キー導線を接続 |
| 追加テスト | `SkillCenterView.delete-confirm.test.tsx`（表示/確認/キャンセルの3ケース） |
| 回帰検証 | `SkillCenterView.delete-confirm.test.tsx` + `useSkillCenter.test.ts` + `useFeaturedSkills.test.ts` の 3 files / 30 tests PASS |
| カバレッジ | `index.tsx + useSkillCenter.ts + useFeaturedSkills.ts` で `Stmts/Lines 86.89`, `Branch 84.61`, `Functions 88.88`（全指標80%以上） |
### 関連未タスク

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| UT-UI-05-001 | CategoryId / SkillCategory 型統一 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-categoryid-skillcategory-type-unification.md` |
| UT-UI-05-002 | SkillDetailPanel 内部 Molecule 分離 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-detail-panel-molecule-split.md` |
| UT-UI-05-003 | ローディングスケルトン実装 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-loading-skeleton-implementation.md` |
| UT-UI-05-004 | モバイルスワイプ閉じ実装 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-mobile-swipe-close-detail-panel.md` |
| UT-UI-05-005 | SKILL.md 全文 Markdown レンダリング | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-markdown-full-rendering.md` |
| UT-UI-05-006 | useFeaturedSkills 選定アルゴリズム改善 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-featured-skills-algorithm-improvement.md` |
| UT-UI-05-007 | Phase 12 UI仕様同期プロファイル適用ガード | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md` |

### 実装時の苦戦箇所（TASK-UI-05）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| `CategoryId` / `SkillCategory` の境界が分散しやすい | 表示都合の `all` とドメインカテゴリを同じ層で扱う場合 | 変換点を限定し、`UT-UI-05-001` として型統一を追跡可能化 | 型は「表示ID層」「ドメイン層」「変換層」で分離する |
| `SkillDetailPanel` への責務集中 | 表示/操作/状態を1コンポーネントで同時拡張する場合 | `UT-UI-05-002`〜`005` へ分解し、Phase 12で残課題を明示化 | 大型UIは完了時に Molecule 分割の未タスクを先に切る |
| Phase 12証跡の同期漏れ | 成果物更新と仕様書更新を別ターンで実施する場合 | `verify/validate/links/audit` の結果を `task-workflow` / `lessons` へ同一ターン反映 | 実装記録と教訓記録は同一ターン同期を完了条件にする |

### 同種課題の簡潔解決手順（4ステップ）

1. UI責務を `view / organism / molecule / hook` に分解し、拡張点を先に決める。  
2. 未タスク候補を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に分離登録する。  
3. `verify-unassigned-links` と `audit --target-file` で参照と形式を機械確認する。  
4. `task-workflow.md` と `lessons-learned.md` に苦戦箇所を同一ターンで同期する。  

### 関連ドキュメント

- [TASK-UI-05 ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/index.md)
- [TASK-UI-05 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05 仕様更新サマリー](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/spec-update-summary.md)
- [TASK-UI-05 未タスク検出](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/unassigned-task-detection.md)

---

<a id="skill-advanced-views-task-ui-05b"></a>

## Skill Advanced Views UI（TASK-UI-05B / completed）

TASK-UI-05B-SKILL-ADVANCED-VIEWS は、SkillCenter 拡張として 4 ビュー（3A ChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard）を実装した完了タスク。
UI 実装コード・IPC 統合・自動テスト・画面検証証跡を正本として管理する。

### 対象ビューと責務

| ビュー | 主要責務 | バックエンド依存 |
| --- | --- | --- |
| 3A SkillChainBuilder | ツールチェーン作成・編集・実行 | TASK-9D（`skill:chain:*`） |
| 3B ScheduleManager | 定期実行設定と履歴確認 | TASK-9G（`skill:schedule:*`） |
| 3C DebugPanel | 実行ステップ可視化・停止/継続制御 | TASK-9H（`skill:debug:*`） |
| 3D AnalyticsDashboard | 実行統計・トレンド確認・エクスポート | TASK-9J（`skill:analytics:*`） |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ completed | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/views/` |
| 自動テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/views/*/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-11/screenshots/` |

### 仕様書別SubAgent分担（Phase 12 再同期）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| A | `ui-ux-components.md` | 主要UI一覧・完了タスク同期 | UI索引と実装導線が一致 |
| B | `ui-ux-feature-components.md` | 4ビュー機能仕様・苦戦箇所同期 | 機能仕様と実装が一致 |
| C | `arch-ui-components.md` | UI構造・責務境界同期 | コンポーネント構造が一致 |
| D | `arch-state-management.md` | 状態管理・P31対策同期 | 状態分離方針が一致 |
| E | `task-workflow.md` | 完了台帳・検証証跡同期 | 証跡値が同日同期済み |
| F | `lessons-learned.md` | 再発条件付き教訓同期 | 同種課題に再利用可能 |

### 実装時の苦戦箇所（再利用用）

| 苦戦箇所 | 原因 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| Phase 12 再確認で `verify-all-specs` warning が残る | `phase-12-documentation.md` の参照資料に依存Phase成果物が不足 | Phase 2/5/6/7/8/9/10 の成果物参照を追記して依存関係を明示 | UIタスクの再確認は参照資料の依存Phaseを先に埋める |
| 画面検証が既存画像の存在確認に寄る | スクリーンショット再取得コマンドが固定されていない | `capture-skill-advanced-views-screenshots.mjs` を実行して TC-04〜TC-07 を再取得 | UI完了判定は「画像存在」ではなく「再撮影 + 更新時刻確認」で行う |
| 未タスク監査の baseline ノイズ誤読 | `current` と `baseline` を同じ判定として扱ってしまう | `audit --diff-from HEAD` の `currentViolations` を合否、`baseline` を改善バックログとして分離記録 | 未タスク監査は二軸（current/baseline）で記録する |

### 関連未タスク

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-UI-05B-001 | Phase 12 画面証跡再取得ガード（再撮影 + 更新時刻確認の標準化） | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/unassigned-task/task-ui-05b-phase12-screenshot-evidence-recapture-guard.md` |

### 同種課題の簡潔解決手順（5ステップ）

1. 更新対象を 1仕様書=1SubAgent で分割し、担当責務を先に固定する。  
2. `verify-all-specs` と `validate-phase-output` を実行し、warning/error の根拠を抽出する。  
3. Phase 12 文書の参照資料に依存Phase成果物を追加して再検証する。  
4. UI画面はスクリーンショットを再撮影し、更新時刻で当日証跡を固定する。  
5. 未タスク監査結果は `current` を合否、`baseline` を改善バックログとして分離記録する。  

### 実装着手前のガード条件

| 観点 | ガード |
| --- | --- |
| 型境界 | 05B UI Props と task-9 系 shared types の境界を実装前に再監査する |
| IPC契約 | `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` の3点を同時更新する |
| 状態管理 | `agentSlice` の個別セレクタ利用（P31）を維持し、Viewごとに Hook を分離する |
| Phase 12同期 | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` を同一ターンで実行する |

### 関連ドキュメント

- [TASK-UI-05B ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/index.md)
- [TASK-UI-05B Phase 11 手動テスト仕様](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/phase-11-manual-test.md)
- [TASK-UI-05B 画面証跡スクリーンショット](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-11/screenshots/)

---

<a id="skill-analysis-view-task-10a-b"></a>



---

## 続き

後半コンテンツは分割ファイルを参照:
- [ui-ux-feature-components-skill-analysis.md](ui-ux-feature-components-skill-analysis.md) — SkillAnalysisView + SkillCreateWizard UI
