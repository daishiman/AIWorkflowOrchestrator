# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 1                                                                              |
| 機能名   | SkillManagementPanel                                                           |
| タスクID | TASK-10A-A                                                                     |
| 作成日   | 2026-03-02                                                                     |
| 前Phase  | なし（起点）                                                                   |
| 次Phase  | Phase 2: 設計                                                                  |
| 依存元   | TASK-9A（SkillEditor完了）, TASK-9B（skill-creator完了）, TASK-9C（skill改善） |
| 並列     | TASK-10A-B（SkillAnalysisView）                                                |
| ブロック | TASK-10A-D（統合）                                                             |

## 目的

SkillManagementPanel の要件を明確化し、受け入れ基準を定義する。ユーザーがインポート済みスキルを一覧表示し、検索・フィルタリング・編集・分析・削除の全操作を1パネル内で完結できるスキル管理UIに必要な機能要件・非機能要件を網羅的に抽出する。

## 実行タスク

- 要件抽出: 完了条件（スキル一覧表示、検索機能、編集/分析/削除ボタン、新規作成画面遷移）から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定
- 既存コンポーネントとの責務分離定義: SkillCenterView / AgentView との責務境界を明示

## 参照資料

| 資料名                    | パス                                                           | 説明                          |
| ------------------------- | -------------------------------------------------------------- | ----------------------------- |
| SkillCenterView仕様       | `TASK-UI-05-SKILL-CENTER-VIEW`                                 | ツール探索ビュー（追加/閲覧） |
| SkillEditorView仕様       | `TASK-UI-05A`                                                  | ツール編集ビュー              |
| SkillAdvancedViews仕様    | `TASK-UI-05B`                                                  | 高度管理ビュー群              |
| AgentView既存実装         | `apps/desktop/src/renderer/views/AgentView/index.tsx`          | スキル実行メインビュー        |
| SkillEditor既存実装       | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`   | スキルファイルエディター      |
| SkillSelector既存実装     | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | スキル選択ドロップダウン      |
| agentSlice                | `apps/desktop/src/renderer/store/slices/agentSlice.ts`         | Zustand状態管理               |
| IPCチャネル定義           | `apps/desktop/src/preload/channels.ts`                         | 既存チャネル定数              |
| Preload API               | `apps/desktop/src/preload/skill-api.ts`                        | Renderer公開API               |
| 共有型定義                | `packages/shared/src/types/skill.ts`                           | Skill, ImportedSkill等の型    |
| P31: Zustand無限ループ    | `.claude/rules/06-known-pitfalls.md#P31`                       | 個別セレクタ使用必須          |
| P39: happy-dom非互換      | `.claude/rules/06-known-pitfalls.md#P39`                       | fireEvent使用必須             |
| P42: trim()バリデーション | `.claude/rules/06-known-pitfalls.md#P42`                       | 3段バリデーション             |

## aiworkflow-requirements 仕様抽出結果

| 関心領域               | 仕様書                                                                                      | このPhaseでの利用目的             |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| UIコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | SkillManagementPanelのUI要件基準  |
| UI機能仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter/Editorとの差分確認    |
| UIデザイン原則         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG / WCAG準拠観点          |
| UIデザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラー/タイポ/トークン整合        |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | Atomic Design層分割               |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill関連型契約                   |
| IPC API契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill系IPCチャネル契約の確認      |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | agentSlice利用境界の確認          |
| セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC sender検証と入力検証要件      |
| スキルIPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキル操作系の攻撃面と防御要件    |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 既存パターンとの整合              |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 削除/操作失敗時のエラー契約確認   |
| テスト品質             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準                    |
| コンポーネントテスト   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト方針（TDD, モック, 検証軸） |
| アクセシビリティテスト | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | WCAG観点の試験項目抽出            |
| タスクワークフロー規約 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                 | Phase成果物定義の整合確認         |

## 実行手順

### 1. スコープ定義

#### IN スコープ

| ID       | 機能                                                  |
| -------- | ----------------------------------------------------- |
| SCOPE-1  | インポート済みスキルの一覧表示（カード形式）          |
| SCOPE-2  | スキル名・説明文によるテキスト検索                    |
| SCOPE-3  | カテゴリによるフィルタリング                          |
| SCOPE-4  | 各スキルカードに編集ボタン（→ SkillEditor遷移）       |
| SCOPE-5  | 各スキルカードに分析ボタン（→ SkillAnalysisView遷移） |
| SCOPE-6  | 各スキルカードに削除ボタン（確認ダイアログ付き）      |
| SCOPE-7  | 新規作成ボタン（→ 新規スキル作成画面遷移）            |
| SCOPE-8  | ローディング状態表示（スケルトンUI）                  |
| SCOPE-9  | エラー状態表示（リトライボタン付き）                  |
| SCOPE-10 | 空状態表示（インポート済みスキルが0件の場合）         |

#### OUT スコープ

| ID    | 除外機能                                 | 理由                                    |
| ----- | ---------------------------------------- | --------------------------------------- |
| OUT-1 | スキルの探索・追加UI                     | SkillCenterView（TASK-UI-05）の責務     |
| OUT-2 | スキル実行UI                             | AgentViewの責務                         |
| OUT-3 | スキルファイルの直接編集                 | SkillEditor（TASK-9A）の責務            |
| OUT-4 | スキル分析・改善のロジック               | SkillAnalysisView（TASK-10A-B）の責務   |
| OUT-5 | スキルチェーン/スケジュール/デバッグ管理 | SkillAdvancedViews（TASK-UI-05B）の責務 |
| OUT-6 | スキルアナリティクスダッシュボード       | TASK-9Jの責務                           |

### 2. 機能要件（FR）

#### FR-1: スキル一覧表示

| ID     | 要件                                                                                                    | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------- | ------ |
| FR-1-1 | マウント時に `fetchSkills()` を呼び出し、agentSliceの `importedSkills` を取得して表示する               | P0     |
| FR-1-2 | 各スキルをカード形式で表示する。カードには以下の情報を含む: スキル名、説明文（最大2行）、カテゴリバッジ | P0     |
| FR-1-3 | カードはグリッドレイアウトで配置する（デスクトップ: 3列、タブレット: 2列、モバイル: 1列）               | P1     |
| FR-1-4 | スキル数を「管理中のツール（N件）」形式でヘッダーに表示する                                             | P1     |

#### FR-2: 検索機能

| ID     | 要件                                                                                 | 優先度 |
| ------ | ------------------------------------------------------------------------------------ | ------ |
| FR-2-1 | テキスト入力フィールドで検索できる。検索対象は `name` と `description` の2フィールド | P0     |
| FR-2-2 | 検索はクライアントサイドフィルタリングで実行する（IPC呼び出し不要）                  | P0     |
| FR-2-3 | 検索は入力から300ms後にデバウンスして実行する                                        | P1     |
| FR-2-4 | 検索結果が0件の場合、「"検索語" に一致するツールが見つかりません」と表示する         | P0     |
| FR-2-5 | 検索フィールドにクリアボタン（×）を表示し、押下で検索をリセットする                  | P1     |

#### FR-3: カテゴリフィルタリング

| ID     | 要件                                                                                                                            | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-3-1 | `SkillCategory` の全カテゴリ（testing, design, development, documentation, security, performance, other）でフィルタリングできる | P1     |
| FR-3-2 | 「すべて」タブを含め、合計8つのタブを横スクロール可能な形式で表示する                                                           | P1     |
| FR-3-3 | 検索クエリとカテゴリフィルタはAND条件で適用する                                                                                 | P1     |
| FR-3-4 | フィルタリング結果が0件の場合、FR-2-4と同様のメッセージを表示する                                                               | P1     |

#### FR-4: 編集操作

| ID     | 要件                                                                                            | 優先度 |
| ------ | ----------------------------------------------------------------------------------------------- | ------ |
| FR-4-1 | 各スキルカードに編集アイコンボタンを配置する                                                    | P0     |
| FR-4-2 | 編集ボタン押下で `currentView` を `"editor"` に切り替え、`selectedSkill` に対象スキルを設定する | P0     |
| FR-4-3 | SkillEditor コンポーネントに `skill: ImportedSkill` と `onClose: () => void` を渡して表示する   | P0     |
| FR-4-4 | エディター閉じ時は `currentView` を `"list"` に戻す                                             | P0     |

#### FR-5: 分析操作

| ID     | 要件                                                                                              | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------- | ------ |
| FR-5-1 | 各スキルカードに分析アイコンボタンを配置する                                                      | P0     |
| FR-5-2 | 分析ボタン押下で `currentView` を `"analysis"` に切り替え、`selectedSkill` に対象スキルを設定する | P0     |
| FR-5-3 | SkillAnalysisView コンポーネントに対象スキルを渡して表示する                                      | P0     |
| FR-5-4 | 分析ビュー閉じ時は `currentView` を `"list"` に戻す                                               | P0     |

#### FR-6: 削除操作

| ID     | 要件                                                                                                                        | 優先度 |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-6-1 | 各スキルカードに削除アイコンボタンを配置する                                                                                | P0     |
| FR-6-2 | 削除ボタン押下で確認ダイアログを表示する。ダイアログのメッセージは「"スキル名" を削除しますか？この操作は取り消せません。」 | P0     |
| FR-6-3 | 確認ダイアログで「削除」を選択した場合、`removeSkill(skill.name)` を実行する                                                | P0     |
| FR-6-4 | 削除成功時にトースト通知「"スキル名" を削除しました」を表示する                                                             | P0     |
| FR-6-5 | 削除失敗時にトースト通知「削除に失敗しました: エラーメッセージ」を表示する                                                  | P0     |
| FR-6-6 | 削除中はボタンをdisabledにし、スピナーを表示する                                                                            | P1     |

#### FR-7: 新規作成操作

| ID     | 要件                                                                                  | 優先度 |
| ------ | ------------------------------------------------------------------------------------- | ------ |
| FR-7-1 | ヘッダー領域に「新しいツールを作成」ボタンを配置する                                  | P0     |
| FR-7-2 | ボタン押下で `currentView` を `"create"` に切り替える                                 | P0     |
| FR-7-3 | 作成画面閉じ時は `currentView` を `"list"` に戻し、`fetchSkills()` で一覧を再取得する | P0     |

#### FR-8: ローディング状態

| ID     | 要件                                                                                       | 優先度 |
| ------ | ------------------------------------------------------------------------------------------ | ------ |
| FR-8-1 | `isLoadingSkills === true` の間、スケルトンUIを表示する（カード形状のプレースホルダー3枚） | P0     |
| FR-8-2 | スケルトンUIはアニメーション（shimmer効果）を含む                                          | P2     |

#### FR-9: エラー状態

| ID     | 要件                                                                     | 優先度 |
| ------ | ------------------------------------------------------------------------ | ------ |
| FR-9-1 | `skillError !== null` の場合、エラーメッセージとリトライボタンを表示する | P0     |
| FR-9-2 | リトライボタン押下で `fetchSkills()` を再実行する                        | P0     |

#### FR-10: 空状態

| ID      | 要件                                                                                            | 優先度 |
| ------- | ----------------------------------------------------------------------------------------------- | ------ |
| FR-10-1 | インポート済みスキルが0件の場合、空状態UIを表示する                                             | P0     |
| FR-10-2 | 空状態UIには説明テキスト「まだツールが追加されていません」とSkillCenterViewへの誘導リンクを含む | P1     |

### 3. 非機能要件（NFR）

#### NFR-1: パフォーマンス

| ID      | 要件                                                              | 基準                           |
| ------- | ----------------------------------------------------------------- | ------------------------------ |
| NFR-1-1 | 初回レンダリング（スキル一覧表示）は500ms以内に完了する           | First Contentful Paint ≤ 500ms |
| NFR-1-2 | 検索フィルタリングは50件のスキルに対して100ms以内に結果を表示する | フィルタリング ≤ 100ms         |
| NFR-1-3 | useMemoでフィルタリング結果をキャッシュし、不要な再計算を防止する | 毎回フィルタ関数を実行しない   |

#### NFR-2: アクセシビリティ（WCAG 2.1 AA）

| ID      | 要件                                                                             | 基準                                 |
| ------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| NFR-2-1 | 全インタラクティブ要素にキーボードでアクセスできる                               | Tab/Shift+Tabで全要素に到達可能      |
| NFR-2-2 | スキルカード間をArrowUp/ArrowDownで移動できる                                    | WAI-ARIA grid パターン準拠           |
| NFR-2-3 | 削除確認ダイアログは `role="alertdialog"` を使用し、フォーカストラップを実装する | ダイアログ外にフォーカスが移動しない |
| NFR-2-4 | 全ボタンに `aria-label` を付与する                                               | スクリーンリーダーで操作目的が伝わる |
| NFR-2-5 | 動的コンテンツ変更（検索結果、削除完了）に `aria-live="polite"` を使用する       | 変更がスクリーンリーダーに通知される |
| NFR-2-6 | カラーコントラスト比は通常テキスト4.5:1以上、UIコンポーネント3:1以上を維持する   | WCAG 2.1 AA Success Criterion 1.4.3  |

#### NFR-3: Apple HIG準拠

| ID      | 要件                                                       |
| ------- | ---------------------------------------------------------- |
| NFR-3-1 | 8pxグリッドでスペーシングを統一する                        |
| NFR-3-2 | 角丸は8px〜12pxの範囲で統一する                            |
| NFR-3-3 | 影は `0 1px 3px rgba(0,0,0,0.04)` を基準にする             |
| NFR-3-4 | Apple HIGシステムカラーをライト/ダークの両モードで使用する |
| NFR-3-5 | アニメーションは200-300ms、目的を持ったものに限定する      |

#### NFR-4: 状態管理制約

| ID      | 要件                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| NFR-4-1 | Zustand agentSlice から個別セレクタで状態を取得する（P31対策）                    |
| NFR-4-2 | 合成Store Hook（`useSkillStore()` 等）は使用禁止                                  |
| NFR-4-3 | ローカル状態（`currentView`, `selectedSkill`, `searchQuery`）は `useState` で管理 |

#### NFR-5: テスト制約

| ID      | 要件                                                                       |
| ------- | -------------------------------------------------------------------------- |
| NFR-5-1 | happy-dom環境では `userEvent` を使用せず `fireEvent` を使用する（P39対策） |
| NFR-5-2 | テスト実行は `apps/desktop/` ディレクトリから行う（P40対策）               |
| NFR-5-3 | Line Coverage 80%以上、Branch Coverage 60%以上、Function Coverage 80%以上  |

### 4. 受け入れ基準

#### AC-1: スキル一覧表示

```
Given: ユーザーがSkillManagementPanelを開く
When: agentSliceに3件のインポート済みスキルが存在する
Then: 3枚のスキルカードがグリッドレイアウトで表示される
And: 各カードにスキル名、説明文（最大2行）、カテゴリバッジが表示される
And: ヘッダーに「管理中のツール（3件）」と表示される
```

#### AC-2: 検索機能

```
Given: 3件のスキル（"code-review", "test-generator", "doc-writer"）が表示されている
When: 検索フィールドに "test" と入力して300ms経過する
Then: "test-generator" のカードのみが表示される
And: 検索結果のカード数が更新される
```

#### AC-3: カテゴリフィルタリング

```
Given: 複数カテゴリのスキルが表示されている
When: "testing" カテゴリタブを選択する
Then: category が "testing" のスキルカードのみが表示される
And: 検索クエリが入力されている場合、検索条件とのAND結果が表示される
```

#### AC-4: 編集ボタン

```
Given: スキルカードが表示されている
When: 編集ボタンを押下する
Then: SkillEditorが該当スキルの情報とともに表示される
And: リスト表示は非表示になる
```

#### AC-5: 分析ボタン

```
Given: スキルカードが表示されている
When: 分析ボタンを押下する
Then: SkillAnalysisView（プレースホルダー）が該当スキルの情報とともに表示される
And: リスト表示は非表示になる
```

#### AC-6: 削除操作

```
Given: スキルカードが表示されている
When: 削除ボタンを押下する
Then: 確認ダイアログが表示される
When: ダイアログで「削除」を選択する
Then: removeSkill(skill.name)が実行される
And: 成功時に「"スキル名" を削除しました」トースト通知が表示される
And: スキル一覧から該当カードが消える
```

#### AC-7: 新規作成

```
Given: SkillManagementPanelのリスト表示が開かれている
When: 「新しいツールを作成」ボタンを押下する
Then: 新規作成画面が表示される
And: リスト表示は非表示になる
```

#### AC-8: ローディング状態

```
Given: スキル取得中（isLoadingSkills === true）
Then: 3枚のスケルトンカードが表示される
When: 取得完了する
Then: スケルトンが実際のスキルカードに置き換わる
```

#### AC-9: エラー状態

```
Given: スキル取得が失敗する（skillError !== null）
Then: エラーメッセージとリトライボタンが表示される
When: リトライボタンを押下する
Then: fetchSkills()が再実行される
```

#### AC-10: 空状態

```
Given: インポート済みスキルが0件
Then: 「まだツールが追加されていません」メッセージが表示される
And: SkillCenterViewへの誘導リンクが表示される
```

#### AC-11: キーボード操作

```
Given: SkillManagementPanelが表示されている
When: Tabキーを押下する
Then: 検索フィールド → カテゴリタブ → 新規作成ボタン → スキルカード群 の順にフォーカスが移動する
When: スキルカード群でArrowDownを押下する
Then: 次のスキルカードにフォーカスが移動する
```

### 5. 前提条件

| ID    | 前提条件                                                                                |
| ----- | --------------------------------------------------------------------------------------- |
| PRE-1 | TASK-9A（SkillEditor）が完了し、`SkillEditor.tsx` が使用可能                            |
| PRE-2 | agentSliceに `importedSkills`, `isLoadingSkills`, `skillError` の個別セレクタが定義済み |
| PRE-3 | `removeSkill` アクションが agentSlice に実装済み                                        |
| PRE-4 | `fetchSkills` アクションが agentSlice に実装済み                                        |
| PRE-5 | Preload APIの `skill.remove()` が P42準拠3段バリデーションを実装済み                    |

### 6. 制約

| ID    | 制約                                                                       |
| ----- | -------------------------------------------------------------------------- |
| CON-1 | Renderer → Main の通信は IPC（Preload Bridge）経由のみ                     |
| CON-2 | Zustandの合成Store Hook（`useSkillStore()`）は使用禁止（P31対策）          |
| CON-3 | happy-dom環境のテストでは `userEvent` 使用禁止（P39対策）                  |
| CON-4 | テスト実行は `apps/desktop/` ディレクトリから実行（P40対策）               |
| CON-5 | CSS変数ベースのスタイルは `variantStyles` Record で export する（P47対策） |

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物       | 配置先                                  |
| ------------ | --------------------------------------- |
| 本要件定義書 | `phase-1-requirements.md`（本ファイル） |

## 完了条件

- [ ] 全機能要件（FR-1〜FR-10）が定義されている
- [ ] 全非機能要件（NFR-1〜NFR-5）が定義されている
- [ ] 全受け入れ基準（AC-1〜AC-11）が検証可能な条件で記述されている
- [ ] INスコープ/OUTスコープが明確に分離されている
- [ ] 前提条件と制約が明示されている
- [ ] 既存コンポーネント（SkillCenterView, AgentView, SkillEditor）との責務境界が明確
- [ ] 既知の落とし穴（P31, P39, P40, P42, P47）の対策が要件に反映されている

## 次Phase

Phase 2: 設計 → `phase-2-design.md`
