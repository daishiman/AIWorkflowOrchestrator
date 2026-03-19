# 状態管理パターン（Desktop Renderer） / reference bundle

> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: reference bundle

## permissionHistorySlice（権限要求履歴管理）

### 概要

権限要求の履歴をトラッキングするSlice。PermissionDialog での判断結果（approved/denied/approved_once）を時系列で記録し、フィルタリング・クリア機能を提供する。skillSlice.respondToSkillPermission から cross-slice アクセスで自動記録される。

**実装場所**: `apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts`

**実装ファイル**:

| ファイル                    | パス                                                               | 行数 | 説明                                      |
| --------------------------- | ------------------------------------------------------------------ | ---- | ----------------------------------------- |
| `permissionHistorySlice.ts` | `apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts` | 60+  | Slice定義（状態+アクション）              |
| `permissionHistory.ts`      | `apps/desktop/src/renderer/components/skill/permissionHistory.ts`  | 116  | データモデル・型定義・ヘルパー関数        |
| `dateFilterUtils.ts`        | `apps/desktop/src/renderer/components/settings/PermissionSettings/dateFilterUtils.ts` | 107 | 期間フィルタヘルパー（getDateRangeStartDate, filterByDateRange） |

**テストファイル**:

| ファイル                              | テスト数 | カテゴリ               |
| ------------------------------------- | -------- | ---------------------- |
| `permissionHistorySlice.test.ts`      | 16       | Store操作              |
| `permissionHistory.test.ts`           | 21       | データモデル           |
| `dateFilterUtils.test.ts`             | 22       | 期間フィルタロジック   |
| `PermissionHistoryFilter.test.tsx`    | 8        | フィルタUIコンポーネント |

### 状態定義（2プロパティ）

| プロパティ          | 型                         | 初期値 | 説明                                       |
| ------------------- | -------------------------- | ------ | ------------------------------------------ |
| `permissionHistory` | `PermissionHistoryEntry[]` | `[]`   | 履歴エントリ一覧（最新が先頭、最大1000件） |
| `historyFilter`     | `PermissionHistoryFilter`  | `{}`   | フィルタ条件（非永続化）                   |

### アクション定義（3メソッド）

| アクション         | シグネチャ                                                           | 説明                                 |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------ |
| `addHistoryEntry`  | `(entry: Omit<PermissionHistoryEntry, "id" \| "timestamp">) => void` | 履歴追加（1000件上限で自動切り捨て） |
| `clearHistory`     | `() => void`                                                         | 全履歴クリア                         |
| `setHistoryFilter` | `(filter: PermissionHistoryFilter) => void`                          | フィルタ条件設定                     |

### データモデル

| 型名                      | 説明                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `PermissionDecision`      | `"approved" \| "denied" \| "approved_once"`                 |
| `PermissionHistoryEntry`  | id, timestamp, toolName, argsSnapshot, decision, sessionId? |
| `PermissionHistoryFilter` | toolName?, decision?, dateRange? によるフィルタ条件         |
| `DateRangeFilter`         | preset, start?, end? による期間フィルタ条件                 |
| `DatePreset`              | `"all" \| "today" \| "week" \| "month" \| "custom"`        |

### 定数

| 定数名                           | 値   | 説明               |
| -------------------------------- | ---- | ------------------ |
| `PERMISSION_HISTORY_MAX_ENTRIES` | 1000 | 履歴最大保持件数   |
| `ARGS_SNAPSHOT_MAX_LENGTH`       | 200  | 引数要約最大文字数 |

### セキュリティ: safeArgsSnapshot()

引数を安全な文字列に変換するヘルパー関数。

| ステップ | 処理                               |
| -------- | ---------------------------------- |
| 1        | JSON.stringify（循環参照時は"{}"） |
| 2        | HTMLタグ除去（XSS防止）            |
| 3        | 制御文字除去                       |
| 4        | 200文字制限（超過時は"..."付加）   |

### Store統合

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

| インポート対象                 | インポート元                      |
| ------------------------------ | --------------------------------- |
| `createPermissionHistorySlice` | `./slices/permissionHistorySlice` |
| `PermissionHistorySlice`       | `./slices/permissionHistorySlice` |

**永続化**: Zustand persist middleware の`partialize`設定に`permissionHistory`を追加。ストレージキー: `knowledge-studio-store`（localStorage）。`historyFilter`は非永続化。

### Cross-Sliceアクセス

`skillSlice.respondToSkillPermission`内で`(get() as unknown as PermissionHistorySlice).addHistoryEntry()`パターンで自動記録。権限応答時に以下のマッピングで判断結果を記録:

| 条件                    | decision          |
| ----------------------- | ----------------- |
| `!approved`             | `"denied"`        |
| `approved && remember`  | `"approved"`      |
| `approved && !remember` | `"approved_once"` |

### フィルタリングパイプライン

`PermissionHistoryPanel`内の`useMemo`で3段階の順次フィルタを適用:

| 順序 | フィルタ     | 条件                       | 関数                                    |
| ---- | ------------ | -------------------------- | --------------------------------------- |
| 1    | ツール名     | `toolName`が定義されている | `entry.toolName === filter.toolName`    |
| 2    | 判断結果     | `decision`が定義されている | `entry.decision === filter.decision`    |
| 3    | 期間         | `dateRange`が定義されている | `filterByDateRange(entries, dateRange)` |

**filterByDateRange処理フロー**:

| プリセット | 処理                                                     |
| ---------- | -------------------------------------------------------- |
| `all`      | 全エントリ返却（フィルタなし）                          |
| `today`    | `getDateRangeStartDate("today")`で本日0時を算出→比較    |
| `week`     | `getDateRangeStartDate("week")`で7日前0時を算出→比較    |
| `month`    | `getDateRangeStartDate("month")`で30日前0時を算出→比較  |
| `custom`   | `start?`/`end?`をISO8601変換し範囲フィルタ（境界含む）  |

### 品質メトリクス

| 指標              | 値     |
| ----------------- | ------ |
| テスト数          | 72     |
| Line Coverage     | 98.50% |
| Branch Coverage   | 87.82% |
| Function Coverage | 100%   |
| TypeScript strict | PASS   |
| ESLint            | PASS   |

### 関連タスク

| タスクID                        | 内容                         | ステータス |
| ------------------------------- | ---------------------------- | ---------- |
| task-imp-permission-history-001 | Permission履歴トラッキングUI | **完了**   |
| task-imp-permission-date-filter | 期間別フィルタリング         | **完了**   |

---

## Skill Advanced Views 状態管理設計（TASK-UI-05B / completed）

> ステータス: **completed**（実装・テスト・導線同期完了）

TASK-UI-05B の4ビュー（3A SkillChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard）は、ビュー間で状態を共有しない設計のため、新規 Zustand Slice は作成しない。

### 状態配置方針

| 状態 | 管理方法 | 理由 |
| --- | --- | --- |
| チェーン一覧 | `useChainList` (useState) | ビュー固有データ、他ビューと共有不要 |
| チェーン編集中状態 | `useChainEditor` (useState) | エディター内でのみ使用 |
| スケジュール一覧 | `useScheduleList` (useState) | ビュー固有データ |
| デバッグセッション | `useDebugSession` (useState) | セッション状態はビュー内完結 |
| ブレークポイント | `useBreakpoints` (useState) | デバッグビュー内でのみ使用 |
| 分析サマリー | `useAnalyticsSummary` (useState) | ビュー固有データ |
| トレンドデータ | `useUsageTrend` (useState) | ビュー固有データ |
| 利用可能スキル一覧 | `agentSlice` 個別セレクタ | 既存 Store を再利用（P31対策で個別セレクタ） |

### 設計根拠

- **P31対策**: `agentSlice` の合成Store Hook を使わず、個別セレクタ（`useXxx()`）で必要なフィールドのみ取得
- **関心の分離**: 4ビューが互いに依存しない設計により、将来の1ビュー単独リファクタリングが容易
- **IPC中心**: 永続状態はMain Process側で管理し、Rendererはカスタム Hook 内でIPC経由取得

### 実装時の苦戦箇所（SubAgent-D）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| 状態責務分離は実装済みでも仕様文に残し漏れる | Hook実装完了後に状態管理仕様の同期を後回しにする | `arch-state-management.md` に 4ビューの状態配置表を固定し、`task-workflow.md` へ同時同期 | 状態管理変更時はコードと仕様を同一ターンで更新する |
| 未タスク監査の判定軸が揺れる | `current` と `baseline` を分離せず報告する | `currentViolations=0` を合否基準として明記し、baselineは別管理化 | 監査結果は `current/baseline` を必ず併記する |

### 同種課題の簡潔解決手順（5ステップ）

1. ビューごとの状態責務（useState / selector / IPC）を表にして先に固定する。  
2. `verify-all-specs` と `validate-phase-output` で仕様整合を先に確認する。  
3. 状態管理仕様を `task-workflow.md` と同一ターンで更新する。  
4. `audit --diff-from HEAD` は `current` を合否、`baseline` を改善課題として分離する。  
5. 苦戦箇所を `lessons-learned.md` へ転記し、再発条件付きでルール化する。  

### 参照
- [TASK-UI-05B Phase 2 状態管理設計](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/phase-2-design.md)

---

## Skill Import / SkillCenter 防御状態管理（2026-03-04）

`TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001` / `TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` / `TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` を状態管理視点で同期した追補仕様。

### agentSlice.importSkill の冪等ガード

| 観点 | 契約 |
| --- | --- |
| 事前判定 | `importedSkills.some((s) => s.name === skillName)` が真なら IPC を呼ばずに早期 return |
| 事前同期 | 既存インポート時でも `availableSkillsMetadata` から該当 `skillName` を除外し、一覧表示を整合 |
| 追加時の重複防止 | import 成功後も `importedSkills` へ push 前に同名存在チェックを実施 |
| エラー状態 | 冪等早期終了時は `skillError: null` を維持し、擬似失敗を記録しない |

### SkillCenter 系 Hook の nullish 防御

| 対象 | 防御契約 |
| --- | --- |
| `useSkillCenter` | `useAvailableSkillsMetadata() ?? []` / `useImportedSkills() ?? []` で Store 読み出し時の nullish を吸収 |
| `useSkillCenter.handleAddSkill` | `addingSkills.has(skillName)` を先頭ガードにし、追加中の同一スキル再実行を抑止 |
| `useSkillCenter.handleAddSkill` | 既存インポート済み時は `importSkill` 同期のみ実施し、成功アニメーション状態（`addingSkills`）を開始しない |
| `useSkillCenter.handleEditSkill` | `setCurrentSkillName(skillName)` → `setCurrentView("skill-editor")` → `handleCloseDetail()` の順で handoff し、detail panel state を destination へ持ち込まない |
| `useSkillCenter.handleAnalyzeSkill` | `setCurrentSkillName(skillName)` → `setCurrentView("skillAnalysis")` → `handleCloseDetail()` の順で handoff する |
| `SkillDetailPanel` action zone | `isImported && onEdit && onAnalyze` を満たす imported detail panel だけに action buttons を表示する |
| 検索/カテゴリ判定 | `normalizeSearchText(value)` で `description` 欠損時にも `.toLowerCase()` 例外を回避 |
| Featured 計算 | `useFeaturedSkills` で `allSkills=[]`, `importedSkillNames=[]` を既定値化し、計算関数の前提を固定 |

### TASK-043B: import dialog の成功判定とエラー面の単一化

| 観点 | 契約 |
| --- | --- |
| action failure 契約 | `importSkill(skillName)` は failure 時でも resolve しうる。UI は `catch` の有無ではなく、`await` 後の Store 状態で成否を判定する |
| post-condition 判定 | 成功条件は `importedSkills.some((s) => s.name === skillName)` が真で、かつ `skillError` が未残置であること。件数差分や throw だけで判定しない |
| 既存インポート済み | import 前から対象 skill が存在する場合は close 可否を `wasImportedBefore` と `skillError` で判定し、偽失敗を出さない |
| error surface 調停 | dialog open 中は panel 側の共有 alert を抑止し、失敗理由は dialog 内 `role="alert"` に集約する |
| テストモック契約 | `SkillImportDialog` 系テストは selector モックに加え `useAppStore.getState()` を必ず提供し、post-condition 更新を再現する |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | PASS（既存インポート時 IPC スキップと重複防止を確認） |
| `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts` | PASS（追加中再実行抑止 + 既存インポート時アニメーション抑止を確認） |
| `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx` | PASS（action zone 表示条件 + keyboard/Escape 回帰を確認） |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` | PASS（31 tests、`追加する` / `追加中...` copy と `getState()` 依存成功判定を確認） |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/` | TC-01〜TC-04 の画面証跡で冪等状態遷移（追加済み/追加中/追加後/詳細表示）を確認 |
| `docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/` | TC-01〜TC-04 の画面証跡で欠損メタデータ時のクラッシュ非発生を確認 |

---

## TASK-10A-E-C: Store駆動ライフサイクル統合（2026-03-06）

### 追加セレクタ契約

| セレクタ | 目的 | 比較戦略 |
| --- | --- | --- |
| `useAvailableSkillsForImport` | `availableSkillsMetadata` から `importedSkills` を除外した追加候補を導出 | `useShallow`（`.filter()` 派生） |
| `useFilteredAvailableSkills` | 追加候補に `skillFilter` を適用して表示候補を導出 | `useShallow`（`.filter()` + `trim().toLowerCase()`） |

### action 状態遷移契約（importSkill）

| フェーズ | 状態更新 | 要件 |
| --- | --- | --- |
| 開始 | `isImporting=true`, `importingSkillName=<target>` | UIボタンを即時 disable する |
| 成功 | `importedSkills` 追加 + `availableSkillsMetadata` 除外 + `isImporting=false` + `importingSkillName=null` | 1トランザクション更新で表示整合を維持 |
| 失敗 | `skillError` 設定 + `isImporting=false` + `importingSkillName=null` | throw ではなく state でエラー表示する |

### 境界契約（TASK-10A-F との責務分離）

- import lifecycle は `isImporting` / `importingSkillName` / `skillError` だけを変更し、`isAnalyzing` / `isImproving` / `currentAnalysis` を変更しない。
- create/analyze 導線は TASK-10A-F 管轄とし、TASK-10A-E-C では責務境界のみを固定する。

### 実装時の苦戦箇所（TASK-10A-E-C）

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| `.filter()` 派生 selector が毎回新規配列参照を返し、再描画が不安定化 | 派生 selector を `useAppStore` でそのまま返す | `useShallow` で shallow 比較に切替 |
| Phase 12 で「更新予定のみ」記述が残り、実更新の証跡と乖離 | `spec-update-summary.md` だけ更新して changelog/台帳を同期しない | Step 1-A〜1-D の実行結果を `documentation-changelog.md` に固定 |
| 未タスク指示書を最小記述で作成し、フォーマット監査に失敗 | 9見出しテンプレートを満たさない | `unassigned-task-template.md` 準拠で 1-9 を必須化 |

### 同種課題の5分解決カード（TASK-10A-E-C）

1. `rg` で inline selector / direct IPC の残存箇所を棚卸しする。
2. `.filter()` / `.map()` 派生 selector は `useShallow` 適用を先に固定する。
3. Phase 11 を `TC-ID + 証跡` 形式へ整え、coverage validator を先に通す。
4. Phase 12 は Step 1-A〜1-D を実行し、`LOGS/SKILL/task-workflow/topic-map` を同時同期する。
5. 未タスクは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` にテンプレート準拠で作成し、台帳リンクまで同ターンで閉じる。

## TASK-10A-F: Store駆動ライフサイクルUI統合（selector migration / renderer direct IPC removal, 2026-03-07）

**検索キーワード**: `TASK-10A-F`, `store-driven lifecycle`, `selector migration`, `renderer direct IPC removal`

### 責務境界の最終同期

| タスク       | 責務                                                 |
| ------------ | ---------------------------------------------------- |
| TASK-10A-D   | agentSlice へ lifecycle state/action を追加する      |
| TASK-10A-E-C | import lifecycle（`isImporting` 系）を安定化する     |
| TASK-10A-F   | Renderer 直接IPCを排除し Store action 経由へ統一する |

### UI側契約

- `useSkillAnalysis` は `useCurrentAnalysis` / `useIsAnalyzingSkill` / `useIsImprovingSkill` / `useSkillError` と action selector を使用する。
- `SkillCreateWizard` は `useCreateSkill()` を使用し、UIから `window.electronAPI.skill.create` を直接呼ばない。
- 画面検証は `docs/30-workflows/store-driven-lifecycle-ui/outputs/phase-11/screenshots/` の 11証跡で確認する。

### Phase 12 再同期追補（2026-03-09）

| 区分 | 今回反映した内容 |
| --- | --- |
| current workflow 証跡 | `TC-11-01`〜`TC-11-08` を満たす実スクリーンショット11件へ再同期し、`manual-test-result.md` を validator 互換の `テストケース / 証跡` 形式へ更新 |
| 実装ガイド | `implementation-guide.md` を `## Part 1` / `## Part 2` と `型定義` / `APIシグネチャ` / `使用例` / `エラーハンドリング` / `エッジケース` / `設定項目と定数一覧` を持つ構造へ再編 |
| 状態設計の維持 | `analysis` / `isAnalyzing` / `isImproving` / `skillError` は Store、`selectedSuggestions` / `improvementResult` / `wizardStep` はローカル、という Case B 判断を再確認 |
| 後続境界 | `SkillEditor.tsx` に残る file operation 系 direct IPC は TASK-10A-G の受け皿を維持し、新規未タスクは追加しない |

### 再同期で苦戦した箇所（2026-03-09）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| Phase 11 placeholder の残置 | `P53` / `代替` / `スクリーンショット不可` を current workflow に残したまま validator だけ再実行する | 実スクリーンショット取得後に placeholder 文言を除去し、`TC-ID ↔ png` へ置換 | screenshot 必須タスクでは placeholder を成果物へ残さない |
| implementation-guide の literal 見出し不足 | Part 1/2 はあるが validator が要求する見出し語が欠ける | テンプレートと実成果物の両方に `APIシグネチャ` / `エラーハンドリング` / `設定項目と定数一覧` を明示 | Phase 12 はテンプレート段階で validator 必須語を先置きする |
| unassigned-task の directory 全体と今回差分の混同 | `currentViolations=0` のみ見て「指定ディレクトリは完全準拠」と書いてしまう | `current` と `baseline` を分離し、legacy 正規化タスクを参照して報告 | 未タスク確認は「今回差分」「legacy baseline」の2軸で書く |
### 苦戦箇所と再利用手順
| 課題                                  | 再発条件                                                       | 解決策                                                                                              |
| ------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Store移行後のテストmockパターン不統一 | Store個別セレクタをmockする際、vi.mockの戻り値構造が不一致     | `vi.mock("../../../store", () => ({ useSelectorName: () => mockValue }))` パターンを標準化          |
| handleAnalyze の try/catch 欠落       | Store action が例外をthrowした場合、Unhandled Rejection が発生 | 全ハンドラに try/catch を追加（Store側でerror処理済みでも、UIクラッシュ防止のため必須）             |
| improvementResult のStore化見送り     | applySkillImprovements の戻り値がStore stateに含まれていない   | 設計判断（Case B）として明文化。将来必要になれば agentSlice に `lastImprovementResult` state を追加 |
### 検証証跡
| 検証        | 結果                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| テスト      | 52テスト全PASS（SkillCreateWizard: 19, SkillAnalysisView: 33）                                                    |
| カバレッジ  | SkillCreateWizard: Line 97.18%, Branch 90.9%, Func 100% / useSkillAnalysis: Line 98.85%, Branch 86.95%, Func 100% |
| 直接IPC残存 | 実行コード内 0件（grep検証済み）                                                                                  |
| TypeScript  | `tsc --noEmit` PASS                                                                                               |
### 関連タスク
| タスクID     | 内容                                          | ステータス             |
| ------------ | --------------------------------------------- | ---------------------- |
| TASK-10A-D   | agentSlice スキルライフサイクルアクション追加 | **完了**（2026-03-03） |
| TASK-10A-E-C | import lifecycle の Store 駆動設計            | **完了**（2026-03-06） |
| TASK-10A-F   | スキルライフサイクルUI Store移行（本タスク）  | **完了**（2026-03-07） |
| TASK-10A-G   | スキルライフサイクル統合テスト強化（3層52テスト） | **完了**（2026-03-10） |

### 統合検証結果

| 検証項目 | 結果 |
| --- | --- |
| skill テスト（24ファイル） | 479/479 PASS |
| agentSlice テスト（17ファイル） | 441/441 PASS |
| 合計 | 920/920 PASS |
| ESLint | エラー 0件 |
| TypeScript 型チェック | エラー 0件 |
| 直接 IPC 呼び出し（実コード） | 0件 |
| non-null assertion（実コード） | 0件 |
| `useAgentStore` 直接使用 | 0件（P31準拠） |

---

## permissionHistorySlice 拡張仕様（TASK-SKILL-LIFECYCLE-06）

TASK-SKILL-LIFECYCLE-06 の設計により、permissionHistorySlice に以下の制約が追加された。

### 最大保持件数

- 定数: `PERMISSION_HISTORY_MAX_ENTRIES = 1000`
- 定義ファイル: `apps/desktop/src/main/permissions/permission-store-interface.ts`
- 超過時の動作: 最古エントリを FIFO 方式で削除する

### 失効ポリシー別エントリ管理

- `session`: electron-store に書き込まない（メモリ上のみ）。アプリ再起動・abort フロー実行時に全削除
- `time_24h`: electron-store に書き込む。`allowedAt + 86_400_000` ms で自動失効
- `time_7d`: electron-store に書き込む。`allowedAt + 604_800_000` ms で自動失効
- `permanent`: electron-store に書き込む。`revokeTool()` の明示的呼び出しまで有効

### セッション終了時のクリーンアップ

- `revokeSessionEntries(sessionId)` を呼び出し、`expiryPolicy === "session"` の全エントリを削除する
- 恒久許可（`permanent`）エントリは削除しない

### 個別セレクタ使用一覧（P31/P48準拠）

| ファイル | 使用セレクタ | 種別 |
| --- | --- | --- |
| `useSkillAnalysis.ts` | `useCurrentAnalysis` | State |
| `useSkillAnalysis.ts` | `useIsAnalyzingSkill` | State |
| `useSkillAnalysis.ts` | `useIsImprovingSkill` | State |
| `useSkillAnalysis.ts` | `useSkillError` | State |
| `useSkillAnalysis.ts` | `useAnalyzeSkill` | Action |
| `useSkillAnalysis.ts` | `useApplySkillImprovements` | Action |
| `useSkillAnalysis.ts` | `useAutoImproveSkill` | Action |
| `SkillCreateWizard.tsx` | `useCreateSkill` | Action |
| `SkillManagementPanel.tsx` | `useAvailableSkillsMetadata` | State (useShallow) |
| `SkillManagementPanel.tsx` | `useClearSkillError` | Action |
| `SkillManagementPanel.tsx` | `useFetchSkills` | Action |
| `SkillManagementPanel.tsx` | `useImportedSkills` | State (useShallow) |
| `SkillManagementPanel.tsx` | `useImportingSkillName` | State |
| `SkillManagementPanel.tsx` | `useIsImportingSkill` | State |
| `SkillManagementPanel.tsx` | `useIsLoadingSkills` | State |
| `SkillManagementPanel.tsx` | `useRemoveSkill` | Action |
| `SkillManagementPanel.tsx` | `useSkillError` | State |

### Store / ローカル状態の分類基準（Case B方式）

| 状態 | 配置先 | 理由 |
| --- | --- | --- |
| `currentAnalysis` | Store (`agentSlice`) | 複数画面で共有可能 |
| `isAnalyzing` / `isImproving` | Store (`agentSlice`) | Store action 内で管理 |
| `skillError` | Store (`agentSlice`) | エラー状態を一元管理 |
| `selectedSuggestions` | ローカル (`useState`) | UI固有の選択状態 |
| `improvementResult` | ローカル (`useState`) | Store action の戻り値として利用、将来 Store 化も可 |
| `wizardStep` | ローカル (`useState`) | Wizard 固有の UI 遷移状態 |

### 実装時の苦戦箇所サマリ

| # | 苦戦箇所 | 根本原因 | 解決策 |
| --- | --- | --- | --- |
| 1 | テスト mock パターン不統一 | State用/Action用の戻り値構造差異 | State: `() => value`、Action: `() => fn` で統一 |
| 2 | try/catch 欠落 | Store action 委譲で防御コード省略 | Store action 呼び出しは常に try/catch で包む |
| 3 | improvementResult の Store 化見送り | Store action が void 返却 | Case B（ローカル維持）を設計判断として記録 |
| 4 | 2workflow 間の stale 化 | current が completed 参照のみ | current 側 outputs を実体として維持 |
| 5 | screenshot harness のUI文言依存 | Store が内部例外を汎用文言に変換 | `data-testid` を ready 条件の正本に |

詳細: `lessons-learned.md` の TASK-10A-F セクション参照
