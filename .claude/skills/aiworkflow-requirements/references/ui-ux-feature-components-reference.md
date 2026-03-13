# 機能別 UI コンポーネント / reference bundle

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: reference bundle

## SkillCenterView UI（TASK-UI-05 / 完了）

TASK-UI-05-SKILL-CENTER-VIEW で、ツール探索専用ビュー `SkillCenterView` の実装と検証（Phase 1-12）が完了。
AgentView の「実行」責務と分離し、ツールの探索・追加・詳細確認を一画面で完結できる UI として定義する。

### 実装済みコンポーネント / Hook

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view | SkillCenterView | 画面統合（検索、カテゴリ、おすすめ、グリッド、詳細パネル） | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` |
| organism | FeaturedSection | 未追加ツールのおすすめ表示（最大3件） | `.../components/FeaturedSection/FeaturedSection.tsx` |
| organism | SkillDetailPanel | ツール詳細表示、削除導線 | `.../components/SkillDetailPanel/SkillDetailPanel.tsx` |
| molecule | FeaturedCard / SkillCard / CategoryTabs / SkillEmptyState | カード表示・カテゴリ切替・空状態表示 | `.../components/` |
| atom | AddButton | 追加ボタン状態遷移（idle/processing/success） | `.../components/AddButton.tsx` |
| hook | useSkillCenter | Store接続、フィルタリング、詳細パネル状態管理 | `.../hooks/useSkillCenter.ts` |
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
2. 未タスク候補を `docs/30-workflows/unassigned-task/` に分離登録する。  
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

## SkillAnalysisView UI（TASK-10A-B / completed）

TASK-10A-B で `SkillAnalysisView`（分析結果の可視化と改善操作UI）を実装し、Phase 1-12 を完了。
`ScoreDisplay`（スコア表示）、`SuggestionList`（改善提案選択）、`RiskPanel`（リスク表示）を `useSkillAnalysis` で統合する構成を採用した。

### コンポーネント構成

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view-like component | SkillAnalysisView | 画面統合、分析実行、改善アクション、エラー/ローディング表示 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` |
| molecule | ScoreDisplay | 総合スコア/カテゴリ別スコアの表示 | `.../components/skill/ScoreDisplay.tsx` |
| molecule | SuggestionList | 優先度別提案リスト、チェック選択、auto-fixable表示 | `.../components/skill/SuggestionList.tsx` |
| molecule | RiskPanel | リスクレベル別表示（critical/high/medium/low） | `.../components/skill/RiskPanel.tsx` |
| hook | useSkillAnalysis | 分析API呼び出し、選択状態、改善適用、再分析制御 | `.../components/skill/hooks/useSkillAnalysis.ts` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/skill-analysis-view/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/` |
| テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/components/skill/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| 状態管理 | コンポーネントローカル状態 + `useSkillAnalysis` に集約（Store追加なし） |
| IPC利用 | `window.electronAPI.skill.analyze` / `applyImprovements` / `autoImprove` |
| エラー処理 | `role=\"alert\"` のUI表示 + 再試行導線 |
| 設計方針 | UI表示とビジネスロジックを hook 分離（Refactor済み） |

### アクセシビリティ・デザイントークン補正（Phase 11 反映）

| 観点 | 反映内容 |
| --- | --- |
| リストラベル | `SuggestionList` の優先度別リスト / `RiskPanel` リストへ `aria-label` を追加 |
| 色トークン | `SkillAnalysisView` のボタン文字色を `text-[var(--text-inverse)]` に統一 |
| テスト補強 | `SuggestionList.test.tsx` / `RiskPanel.test.tsx` に `aria-label` 検証を追加 |

### 画面検証証跡（2026-03-02）

| 証跡 | ファイル |
| --- | --- |
| 初期表示（分析結果） | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-01-analysis-default.png` |
| 提案選択状態 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-02-analysis-selection.png` |
| 改善後状態 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-03-analysis-improved.png` |
| エラー表示 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-04-analysis-error.png` |

### 実装時の苦戦箇所（TASK-10A-B）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| Phase 11 がコード分析ベースのまま残りやすい | UI起動制約を理由にスクリーンショット取得を省略する場合 | 専用スクリプトで 4 状態（通常/選択/改善後/エラー）を再撮影し、manual-test-result を実証跡ベースへ更新 | UIタスクのPhase 11は「実画面証跡」を完了条件に固定する |
| Phase 11 必須セクション欠落で `validate-phase-output` が落ちる | `phase-11-manual-test.md` の章立てを簡略化しすぎる場合 | 「統合テスト連携」節を追加し、Phase 12未タスク連携を明記 | 仕様書更新前にテンプレート必須節を機械検証する |
| Phase 12 で active set が stale のまま残る | 完了済みUT（001/003/008）と継続UT（002/004/005/006/007/009）を同一表で更新しない場合 | `task-workflow.md` を canonical、`unassigned-task-detection.md` を derived として current active set 6件へ再同期し、`validate-task10ab-ledger-sync` を追加 | 未タスク台帳は固定レンジでなく canonical ledger から毎回再計算する |
| React StrictMode で分析画面がローディングのまま固着する | `useEffect` cleanup で `isMountedRef=false` にしたまま再マウントし、初回 `setIsAnalyzing(true)` だけが残る場合 | `useSkillAnalysis` で mount 時に `isMountedRef.current = true` を再設定し、Phase 11 screenshot 再監査で 8 ケースを再取得した | 画面証跡再監査で perpetual loading が出たら selector ではなく Hook の mount/unmount 制御も疑い、StrictMode を含む targeted test を追加する |

### 同種課題の簡潔解決手順（5ステップ）

1. 画面証跡を先に再取得し、`outputs/phase-11/screenshots` を更新する。  
2. `manual-test-result` と `discovered-issues` を実証跡ベースに書き換える。  
3. `verify-all-specs` と `validate-phase-output` を実行し、不足セクションを埋める。  
4. 未タスク台帳（作成済みID）を再計算し、`task-workflow.md` と同期する。  
5. 苦戦箇所を `lessons-learned.md` に転記して再利用ルール化する。  

### 関連未タスク（active set）

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-002 | 改善結果トースト通知実装 | `docs/30-workflows/unassigned-task/task-10a-b-improvement-toast-notification.md` |
| UT-TASK-10A-B-004 | Props 契約整合（`skill` vs `skillName`） | `docs/30-workflows/unassigned-task/task-10a-b-props-contract-alignment.md` |
| UT-TASK-10A-B-005 | molecule 分割設計追補（Header/Error/Actions） | `docs/30-workflows/unassigned-task/task-10a-b-analysis-view-molecule-separation.md` |
| UT-TASK-10A-B-006 | Phase 11 必須セクション検証ガード（統合テスト連携/完了条件） | `docs/30-workflows/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md` |
| UT-TASK-10A-B-007 | Phase 11 画面証跡鮮度ガード（再撮影 + 更新時刻確認） | `docs/30-workflows/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md` |
| UT-TASK-10A-B-009 | 完了済みUT配置ポリシー統一ガード（3分類 + target監査境界） | `docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md` |

### 完了済み派生タスク

| タスクID | 状態 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-001 | 完了（2026-03-05） | `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md` |
| UT-TASK-10A-B-003 | 完了（2026-03-05） | `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md` |
| UT-TASK-10A-B-008 | 完了（2026-03-06） | `docs/30-workflows/completed-tasks/task-10a-b-unassigned-count-resync-guard.md` |

---

<a id="skill-create-wizard-task-10a-c"></a>

## SkillCreateWizard UI（TASK-10A-C / completed）

TASK-10A-C で `SkillCreateWizard`（説明入力→設定→生成→完了の4ステップ）を実装し、Phase 1-12 を完了。
`useWizardStep` でステップ遷移を管理し、`window.electronAPI.skill.create` を通じて Main の `skill:create` IPC と接続する。

### コンポーネント構成

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view-like component | SkillCreateWizard | ウィザード全体状態管理（description/options/error/skillPath） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| molecule | StepIndicator | ステップ進捗表示（active/completed/pending） | `.../components/skill/wizard/StepIndicator.tsx` |
| molecule | DescribeStep | 説明入力 + 次へ遷移 | `.../components/skill/wizard/DescribeStep.tsx` |
| molecule | ConfigureStep | 生成オプション設定（generateTasks/addAgents/addReferences） | `.../components/skill/wizard/ConfigureStep.tsx` |
| molecule | GenerateStep | 生成中ローディング / エラー表示 | `.../components/skill/wizard/GenerateStep.tsx` |
| molecule | CompleteStep | 生成完了表示（作成パス表示 + close） | `.../components/skill/wizard/CompleteStep.tsx` |
| hook | useWizardStep | ステップ遷移ロジック（goNext/goBack/goToStep） | `.../components/skill/hooks/useWizardStep.ts` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/skill-create-wizard/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/` |
| テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/components/skill/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| 状態管理 | ローカル state + `useWizardStep` で完結（Store追加なし） |
| IPC利用 | `window.electronAPI.skill.create({ description, options })` |
| エラー処理 | `GenerateStep` 上でエラーメッセージ表示 |
| 契約整合 | `skill:create`（P42準拠3段バリデーション + sender検証） |

### 画面検証証跡（2026-03-02）

| 証跡 | ファイル |
| --- | --- |
| Step1 初期表示（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-01-step1-initial-dark.png` |
| Step1 入力後（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-02-step1-filled-dark.png` |
| Step2 設定（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-03-step2-configure-dark.png` |
| Step3 生成中（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-04-step3-generating-dark.png` |
| Step4 完了（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-05-step4-complete-dark.png` |
| Step3 エラー（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-06-step3-error-dark.png` |
| Step1 初期表示（Light） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-07-step1-initial-light.png` |
| Step1 初期表示（Mobile Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-08-step1-initial-mobile-dark.png` |

### 実装時の苦戦箇所（TASK-10A-C）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| ウィザード状態の画面証跡が不足しやすい | 正常系のみ撮影して生成中/エラー状態を取り逃がす場合 | 専用スクリプトで 8 状態を一括撮影し、TCとの対応表を作成 | UIタスクは状態遷移ごとに screenshot-plan を先に固定する |
| `skill:create` 契約が仕様未反映のまま残る | Main/Preload更新後に仕様同期を後回しにする場合 | `api-ipc-agent`/`interfaces`/`security`/`architecture` を同一ターン更新 | 新規 `skill:*` 追加時は4仕様書同時更新を必須化 |
| Phase 12 成果物名の揺れ | `unassigned-task-report` など旧命名を残す場合 | `unassigned-task-detection.md` へ統一し artifacts を同期 | 命名規約と `validate-phase-output` を完了前に必ず照合する |

### 関連未タスク

本タスクで新規未タスクは検出されていない（`unassigned-task-detection.md`: 0件）。

---

## Store駆動ライフサイクルUI統合（TASK-10A-F / completed）

TASK-10A-F では `SkillAnalysisView` / `SkillCreateWizard` の責務境界を再確認し、Renderer コンポーネントからの直接 `window.electronAPI.skill.*` 呼び出しを排除した。

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/store-driven-lifecycle-ui/` |
| 実画面検証（スクリーンショット） | ✅ 11件取得 | `docs/30-workflows/store-driven-lifecycle-ui/outputs/phase-11/screenshots/` |
| Phase 12成果物 | ✅ 5成果物 + changelog | `docs/30-workflows/store-driven-lifecycle-ui/outputs/phase-12/` |

### UI観点の要点

- `useSkillAnalysis` は Store 個別セレクタ経由で `analysis/isAnalyzing/isImproving/skillError` を参照する。
- `SkillCreateWizard` は `useCreateSkill()` で作成 action を実行し、生成進捗をUIに反映する。
- 画面検証は dark/light/mobile と error/loading を含む 11ケースで確認済み。
- TASK-SKILL-LIFECYCLE-01 では `skillLifecycleJourney.ts` を追加し、create / use / improve の job guide と downstream contract を Store-driven lifecycle の前段ガイドとして固定した。

### 後続未タスク（TASK-10A-F 由来）

| タスクID | 内容 | 優先度 | 仕様書 |
| --- | --- | --- | --- |
| TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION | SkillEditor.tsx ファイル操作系 direct IPC の Store 移行（6API） | 中 | `docs/30-workflows/unassigned-task/task-10a-g-skilleditor-fileops-store-migration.md` |
| TASK-10A-F-MINOR-01-ANALYSIS-SUCCESS-FEEDBACK | SkillAnalysisView 成功フィードバックの視覚強化 | 低 | `docs/30-workflows/unassigned-task/task-10a-f-minor-01-analysis-success-feedback.md` |
| TASK-10A-F-MINOR-02-WIZARD-GENERATE-RECOVERY | SkillCreateWizard GenerateStep のリカバリ導線追加 | 低 | `docs/30-workflows/unassigned-task/task-10a-f-minor-02-wizard-generate-recovery.md` |

---

<a id="organisms-foundation-task-ui-00-organisms"></a>
