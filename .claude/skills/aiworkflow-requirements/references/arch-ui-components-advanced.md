# UIコンポーネントパターン（Desktop Renderer） / advanced specification

> 親仕様書: [arch-ui-components.md](arch-ui-components.md)
> 役割: advanced specification

## SkillManagementPanel アーキテクチャパターン（TASK-10A-A / completed）

> ステータス: **completed**（実装・テスト・画面証跡・仕様同期完了）

TASK-10A-A は、スキル運用に必要な 4ビュー（一覧/編集/分析/新規作成）を単一パネルで切り替える UI コンポーネントである。  
`SkillCenterView` とは責務を分離し、検証用のスタンドアロン経路（`/advanced/skill-management-panel`）で動作させる。

### レイヤー構成

| レイヤー | 主要要素 | 役割 |
| --- | --- | --- |
| Panel Root | `SkillManagementPanel` | 画面全体、状態遷移、イベント配線 |
| List Item | `SkillCard` | スキル1件の表示と操作ボタン（編集/分析/削除） |
| View Bridge | `SkillEditor` / 分析・作成プレースホルダー | `currentView` に応じた表示切替 |
| Store Bridge | `useImportedSkills`, `useIsLoadingSkills`, `useFetchSkills`, `useRemoveSkill` | Zustand 個別セレクタ経由で IPC 呼び出しを抽象化 |

### 状態遷移モデル

| 状態 | トリガー | 遷移先 |
| --- | --- | --- |
| `list` | 編集ボタン | `editor` |
| `list` | 分析ボタン | `analysis` |
| `list` | 新規作成ボタン | `create` |
| `editor` / `analysis` / `create` | 戻る/閉じる | `list` |
| `list` + 削除要求 | 削除確認ダイアログ表示 | `list`（成功/失敗でメッセージ更新） |

### データフロー

| 操作 | 経路 | 説明 |
| --- | --- | --- |
| 初期ロード | mount → `fetchSkills()` | Store 経由でスキル一覧を同期 |
| 検索 | `searchQuery` 更新 → `useMemo(filteredSkills)` | 名前/説明文の大小文字非依存フィルタ |
| 編集/分析/作成 | ボタン押下 → `setCurrentView(...)` | ビュー状態を明示的に切替 |
| 削除 | `handleRequestDelete` → `handleConfirmDelete` → `removeSkill(name)` | 成功時はダイアログ閉鎖、失敗時はエラーバナー表示 |

### IPC境界

| チャネル | 利用経路 | 変更有無 |
| --- | --- | --- |
| `skill:list` | `useFetchSkills` | 既存再利用 |
| `skill:remove` | `useRemoveSkill` | 既存再利用 |

### 品質指標（TASK-10A-A）

| 指標 | 値 |
| --- | --- |
| テストファイル | 1（`SkillManagementPanel.test.tsx`） |
| テストケース数 | 38（PASS） |
| 画面証跡 | TC-01〜TC-10（スクリーンショット再取得済み） |
| 検証コマンド | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` PASS |

### 仕様同期時の苦戦箇所（SubAgent-B）

| 苦戦箇所 | 原因 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| Step 2 を `該当なし` と誤判定しやすい | UI新規コンポーネント追加時に `arch-ui-components.md` 更新判定を見落とした | `phase-12-documentation.md` の更新対象表を正として、`documentation-changelog.md` の Step 判定と突合して是正 | 新規 UI コンポーネント追加時は `arch-ui-components.md` を Step 2 必須更新に固定する |
| `task-workflow` のみ先行更新して教訓同期が遅れる | 台帳更新と教訓更新を別ターンで進めた | `task-workflow.md` と `lessons-learned.md` を同ターン更新し、検証値を共通化した | UI機能の Phase 12 は「arch + task + lessons」を同一ターンで同期する |

### 参照

- [TASK-10A-A ワークフロー仕様](../../../../docs/30-workflows/skill-management-panel/index.md)
- [TASK-10A-A 実装ガイド](../../../../docs/30-workflows/skill-management-panel/outputs/phase-12/implementation-guide.md)
- [TASK-10A-A 手動検証結果](../../../../docs/30-workflows/skill-management-panel/outputs/phase-11/manual-test-result.md)

---

## SkillManagementPanel ビュー統合アーキテクチャパターン（TASK-10A-D / completed）

> ステータス: **completed**（実装・テスト・画面検証完了）

TASK-10A-D は、TASK-10A-A で構築した SkillManagementPanel の「準備中」プレースホルダーを実コンポーネント（SkillAnalysisView / SkillCreateWizard）に差し替え、ChatPanel からのアクセスポイントを追加するUI統合タスクである。

### レイヤー構成

| レイヤー | 主要要素 | 役割 |
| --- | --- | --- |
| Panel Root | `SkillManagementPanel` | 4ビュー切替（list/editor/analysis/create）、状態遷移 |
| View Bridge | `SkillAnalysisView` / `SkillCreateWizard` / `SkillEditor` | `currentView` に応じた実コンポーネント表示 |
| Access Point | `ChatPanel`（トグルボタン） | `showSkillManagement` state でパネル表示/非表示切替 |
| Store Bridge | agentSlice 拡張（5アクション + 3状態 + 8セレクタ） | 分析・改善・作成操作を Store 経由で IPC 呼び出し |

### コンポーネント関係図

| 親コンポーネント | 子コンポーネント | 表示条件 |
| --- | --- | --- |
| ChatPanel | SkillManagementPanel | `showSkillManagement === true` |
| SkillManagementPanel | SkillEditor | `currentView === 'editor'` |
| SkillManagementPanel | SkillAnalysisView | `currentView === 'analysis'` |
| SkillManagementPanel | SkillCreateWizard | `currentView === 'create'` |

### 状態遷移モデル（TASK-10A-A からの差分）

| 変更点 | TASK-10A-A（旧） | TASK-10A-D（新） |
| --- | --- | --- |
| `analysis` ビュー | プレースホルダー（準備中テキスト） | `SkillAnalysisView`（分析・改善・自動改善操作） |
| `create` ビュー | プレースホルダー（準備中テキスト） | `SkillCreateWizard`（4ステップウィザード） |
| ChatPanel導線 | なし | トグルボタン（`data-testid="skill-management-toggle"`） |
| agentSlice | 既存セレクタのみ | 5アクション + 3状態フィールド + 8個別セレクタ追加 |

### Store拡張（agentSlice差分）

**追加状態フィールド**:

| プロパティ | 型 | 用途 |
| --- | --- | --- |
| `currentAnalysis` | `SkillAnalysis \| null` | スキル分析結果の保持 |
| `isAnalyzing` | `boolean` | 分析処理中フラグ |
| `isImproving` | `boolean` | 改善処理中フラグ |

**追加アクション**:

| アクション | IPC依存 | 説明 |
| --- | --- | --- |
| `analyzeSkill` | `skill:analyze` | スキル分析を実行し `currentAnalysis` を更新 |
| `applySkillImprovements` | `skill:applyImprovements` | 選択された改善提案を適用 |
| `autoImproveSkill` | `skill:autoImprove` | 全自動改善を実行 |
| `createSkill` | `skill:create` | 新規スキルを作成 |
| `clearAnalysis` | なし | 分析結果をクリア |

**追加個別セレクタ（P31準拠）**:

| セレクタ | 種別 |
| --- | --- |
| `useCurrentAnalysis` | State |
| `useIsAnalyzingSkill` | State |
| `useIsImprovingSkill` | State |
| `useAnalyzeSkill` | Action |
| `useApplySkillImprovements` | Action |
| `useAutoImproveSkill` | Action |
| `useCreateSkill` | Action |
| `useClearAnalysis` | Action |

### IPC境界

| チャネル | 利用経路 | 変更有無 |
| --- | --- | --- |
| `skill:list` | `useFetchSkills` | 既存再利用 |
| `skill:remove` | `useRemoveSkill` | 既存再利用 |
| `skill:analyze` | `useAnalyzeSkill` | 既存再利用（agentSlice経由追加） |
| `skill:applyImprovements` | `useApplySkillImprovements` | 既存再利用（agentSlice経由追加） |
| `skill:autoImprove` | `useAutoImproveSkill` | 既存再利用（agentSlice経由追加） |
| `skill:create` | `useCreateSkill` | 既存再利用（agentSlice経由追加） |

### 品質指標（TASK-10A-D）

| 指標 | 値 |
| --- | --- |
| テストファイル | 4（SkillManagementPanel / ChatPanel / agentSlice / store selectors） |
| テストケース数 | 132（全PASS） |
| 変更ファイル | SkillManagementPanel.tsx, ChatPanel.tsx, agentSlice.ts, store/index.ts |

### 苦戦箇所

| 苦戦箇所 | 原因 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| `Suggestion`型を`unknown[]`で仮定義 | IPC境界の引数型を共有型から参照せず仮定義した | `@repo/shared/types/skill-improver`から`Suggestion`型を正しくインポート | IPC境界の型は常に`@repo/shared`の共有型を使用し、`unknown[]`で仮定義しない |
| P40テスト実行ディレクトリ依存（再発） | モノレポルートからテスト実行すると`vitest.config.ts`が読み込まれない | テストコマンドに`cd apps/desktop &&`プレフィックスを含める | テスト実行は常に対象パッケージのディレクトリから行う |
| PostToolUseフックによるEdit失敗（P11） | Prettier/ESLint自動修正がファイル内容を変更し文字列マッチが失敗 | 大量編集後は`git diff --stat`で変更数を検証 | 連続Edit時はフック実行後のファイル内容を前提として次のEdit文字列を構成する |

### 参照

- [TASK-10A-D ワークフロー仕様](../../../../docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/)
- [TASK-10A-A SkillManagementPanel仕様（基盤）](../../../../docs/30-workflows/skill-management-panel/index.md)
- [TASK-10A-B SkillAnalysisView仕様](../../../../docs/30-workflows/completed-tasks/skill-analysis-view/index.md)
- [TASK-10A-C SkillCreateWizard仕様](../../../../docs/30-workflows/completed-tasks/skill-create-wizard/index.md)

---

## SkillManagementPanel Import List アーキテクチャパターン（TASK-043B / completed）

> ステータス: **completed**（実装・テスト・画面検証完了）

TASK-043B は、TASK-10A-D で統合済みの `SkillManagementPanel` list branch を、imported / available の 2 セクション一覧へ再設計した UI refinement タスクである。

### レイヤー構成

| レイヤー | 要素 | 役割 |
| --- | --- | --- |
| Panel Root | `SkillManagementPanel` | search、state priority、dialog state、focus return |
| Imported Section | imported cards | edit / analyze / remove を維持 |
| Available Section | available rows | request import trigger |
| Modal | `SkillImportDialog` | metadata preview、confirm / cancel、dialog-local alert |
| Store Bridge | selector / action hooks | data source / error / import state |

### 状態境界

| 状態 | 判定 |
| --- | --- |
| success | imported 反映 + `skillError === null` + available row 非表示 |
| error | dialog open 中は dialog alert のみ、close 後は panel alert |
| empty | global empty と inline empty を分離 |

### 品質指標

| 指標 | 値 |
| --- | --- |
| テストファイル | 2 |
| テストケース | 21（全PASS） |
| 対象カバレッジ | Statements 89.71 / Branches 87.41 / Functions 84.61 / Lines 89.71 |
| 画面証跡 | TC-11-01〜09 + mobile dark |

---

## TASK-UI-00-ORGANISMS アーキテクチャ記録

### 対象コンポーネント

| コンポーネント | 責務 | 再利用方針 |
| --- | --- | --- |
| `CardGrid` | カードのレスポンシブ表示、キーボード矢印移動、loading/empty表現 | Item型をジェネリクス化し、`renderCard` 注入で用途を分離 |
| `MasterDetailLayout` | master/detail の画面分割とモバイル時のオーバーレイ表示 | 画面幅判定は `matchMedia` 抽象で統一し、desktop/tablet/mobile差分を内部吸収 |
| `SearchFilterList` | 検索 + 複数フィルタ（AND） + list/grid 切替 + 件数表示 | 検索条件と描画責務を分離し、`renderItem`/`renderCard` フォールバックで適用先を拡張 |

### レイヤー設計（Atomic Design整合）

| レイヤー | 構成要素 | 依存方向 |
| --- | --- | --- |
| Organisms | `CardGrid`, `MasterDetailLayout`, `SearchFilterList` | Molecules/Atomsに依存（逆依存なし） |
| Molecules | `SearchBar`, `SlideInPanel` | Atomsに依存 |
| Atoms | `FilterChip`, `EmptyState`, `SkeletonCard` | 末端レイヤー |

### 品質メトリクス（TASK-UI-00-ORGANISMS）

| 指標 | 値 |
| --- | --- |
| テストファイル | 3 |
| テストケース | 41（全PASS） |
| 対象カバレッジ（Statements/Branches/Functions/Lines） | 97.26% / 92.00% / 94.73% / 97.26% |
| 手動検証スクリーンショット | 6枚（desktop dark/light + mobile dark） |

### 設計時の苦戦箇所と対策（TASK-UI-00-ORGANISMS）

| 苦戦箇所 | 原因 | 対策 | 標準化ルール |
| --- | --- | --- | --- |
| `MasterDetailLayout` の表示責務が viewport 条件で分散しやすい | desktop/tablet/mobile の分岐が呼び出し側へ漏れる | `MasterDetailLayout` 内で viewport 判定を吸収し、呼び出し側は `items/selectedId` のみを渡す構造へ統一 | レイアウト条件分岐は Organism 内に閉じる |
| `SearchFilterList` の描画責務が list/grid で重複しやすい | `renderItem` と `renderCard` の分離が曖昧 | `viewMode` ごとに明示的に切替し、`renderCard ?? renderItem` をフォールバック順で固定 | 表示モード差分は 1コンポーネント内で完結させる |
| `CardGrid` の loading/empty/loaded が分離されず回帰しやすい | 視覚状態とデータ状態の対応が未定義 | 3状態（loading/empty/loaded）をテストIDとスクショTCで固定化 | UI状態は実装前に状態表を先に定義する |

### 関連タスク

- **TASK-UI-00-ORGANISMS**: Organisms共通コンポーネント実装（2026-03-04完了）

### 参照

- [TASK-UI-00-ORGANISMS ワークフロー仕様](../../../../docs/30-workflows/skill-import-agent-system/tasks/task-054-ui-00-4-organisms-components/index.md)
- [TASK-UI-00-ORGANISMS 手動テスト結果](../../../../docs/30-workflows/skill-import-agent-system/tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/manual-test-result.md)

---

## AgentView Enhancement アーキテクチャパターン（TASK-UI-03 / completed）

> ステータス: **completed**（実装・テスト・レイアウト検証完了）

TASK-UI-03 は、既存の `AgentView`（`views/AgentView/index.tsx`）をシングルカラム・3セマンティックリージョン構成に再設計し、Atomic Design の organisms 配下にサブコンポーネント群を新設するUIエンハンスメントタスクである。

### コンポーネント構成

| 階層 | コンポーネント | 分類 | 説明 |
|------|----------------|------|------|
| 1 | AgentView | views | メインビュー（max-w-600px シングルカラム） |
| 1-1 | SkillChip | organisms | ツール選択チップ |
| 1-2 | ExecuteButton | organisms | 実行ボタン |
| 1-3 | RecentExecutionList | organisms | 最近の実行履歴 |
| 1-4 | FloatingExecutionBar | organisms | 実行状況フローティングバー（オーバーレイ） |
| 1-5 | AdvancedSettingsPanel | organisms | 詳細設定スライドインパネル（オーバーレイ） |

### ファイル配置

| ディレクトリ | 内容 |
| --- | --- |
| `apps/desktop/src/renderer/components/organisms/AgentView/` | サブコンポーネント群 |
| `apps/desktop/src/renderer/views/AgentView/` | メインビュー（既存、レイアウト変更） |

```
components/organisms/AgentView/
├── SkillChip.tsx            [新規] ツール選択チップ
├── ExecuteButton.tsx        [新規] 実行ボタン
├── FloatingExecutionBar.tsx [新規] 実行状況フローティングバー
├── AdvancedSettingsPanel.tsx [新規] 詳細設定スライドインパネル
├── RecentExecutionList.tsx  [新規] 最近の実行履歴
├── animations.ts            [新規] アニメーション定数
├── styles.ts                [新規] 共通スタイル定数
└── __tests__/
    ├── SkillChip.test.tsx
    ├── ExecuteButton.test.tsx
    ├── FloatingExecutionBar.test.tsx
    ├── AdvancedSettingsPanel.test.tsx
    └── RecentExecutionList.test.tsx
```

### レイアウト構成（AgentView）

シングルカラム（`max-w-600px`）の3セマンティックリージョン + オーバーレイ構成。

| リージョン | 内容 | 表示条件 |
| --- | --- | --- |
| 「できること」セクション | SkillChip群 + 条件付き検索バー | 常時表示（検索バーは11件以上で表示） |
| 「実行」セクション | ExecuteButton | 常時表示 |
| 「最近の実行」セクション | RecentExecutionList | 常時表示 |
| オーバーレイ | FloatingExecutionBar | 実行中に表示 |
| オーバーレイ | AdvancedSettingsPanel | 詳細設定開閉時に表示 |

### レイヤー設計（Atomic Design整合）

| レイヤー | 構成要素 | 依存方向 |
| --- | --- | --- |
| Views | `AgentView` | Organismsに依存 |
| Organisms | `SkillChip`, `ExecuteButton`, `FloatingExecutionBar`, `AdvancedSettingsPanel`, `RecentExecutionList` | 共通スタイル・アニメーション定数に依存 |
| 共通定数 | `animations.ts`, `styles.ts` | 末端レイヤー |

### Store連携（agentSlice拡張）

| ファイル | 変更内容 |
| --- | --- |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | AgentView Enhancement 用の状態・アクション追加 |
| `apps/desktop/src/renderer/store/index.ts` | 新規セレクタのエクスポート追加 |

### テスト構成

| テストファイル | テスト件数 | 行数 | 対象 |
| --- | --- | --- | --- |
| `SkillChip.test.tsx` | 15 | 203 | ツール選択チップの表示・操作 |
| `ExecuteButton.test.tsx` | 8 | 120 | 実行ボタンの状態・操作 |
| `FloatingExecutionBar.test.tsx` | 12 | 130 | フローティングバーの表示・進捗 |
| `AdvancedSettingsPanel.test.tsx` | 13 | 235 | 詳細設定パネルの開閉・操作 |
| `RecentExecutionList.test.tsx` | 11 | 229 | 実行履歴の表示・操作 |
| `AgentView.layout.test.tsx` | 12 | 272 | 統合レイアウトテスト（3リージョン構成検証） |
| `agentSlice.p31-regression.test.ts` | 7 | - | Store拡張 P31回帰テスト |
| **合計** | **78** | **1,189+** | |

### 関連タスク

- **TASK-UI-03-AGENT-VIEW-ENHANCEMENT**: AgentView Enhancement（completed）

### 実装ファイルサマリー

| ファイル | 行数 | 責務 |
| --- | --- | --- |
| `AdvancedSettingsPanel.tsx` | 144 | 詳細設定スライドインパネル |
| `ExecuteButton.tsx` | 39 | 実行ボタン（disabled/loading対応） |
| `FloatingExecutionBar.tsx` | 110 | 実行状況フローティングバー |
| `RecentExecutionList.tsx` | 98 | 最近の実行履歴リスト |
| `SkillChip.tsx` | 66 | ツール選択チップ（トグル操作） |
| `animations.ts` | 20 | アニメーション定義（フェード/スライド） |
| `styles.ts` | 31 | 共通スタイル定数 |
| **合計** | **508** | |

### Settings AuthKeySection（09-TASK-FIX 関連）

AgentView Enhancement と同時期に実装された Settings 画面の新規コンポーネント。

| ファイル | 行数 | 責務 |
| --- | --- | --- |
| `AuthKeySection/index.tsx` | 295 | APIキー管理セクション |
| `AuthKeySection/AuthKeySection.test.tsx` | 317 | テスト（13ケース） |

### 参照

- [AgentView Enhancement ワークフロー仕様](../../../../docs/30-workflows/agent-view-enhancement/)

---

