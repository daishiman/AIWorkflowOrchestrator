# タスク仕様書 検証レポート

> 検証日時: 2026-01-19T08:42:40.617Z
> 対象: docs/30-workflows/file-selector-accessibility-improvements

## サマリー

| 項目          | 値          |
| ------------- | ----------- |
| 総Phase数     | 13          |
| 検証済みPhase | 13          |
| エラー        | 0           |
| 警告          | 0           |
| 情報          | 22          |
| **結果**      | **✅ PASS** |

## Phase別検証結果

### Phase 1: 要件定義 ✅

- ℹ️ [consistency] 参照パス「 を読み、WCAG 2.4.3 / 4.1.2 / 1.3.1 / 1.4.11 の指摘内容を整理する。

2. FileSelectorTrigger / FileSelectorModal / FileSelector（external の選択済み一覧）/ WorkspaceFileSelector（ツリー）/ SelectedFilesPanel の実装ファイルを特定する。
3. 指摘内容と実装コンポーネントの対応表を作成し、どの要素に role/ARIA を付与すべきかを明確化する。
4. 仕様書に記載されたアクセシビリティ要件と照合し、欠落している要件を一覧化する。

**期待される成果物**:

- outputs/phase-1/requirements-definition.md
- outputs/phase-1/issue-mapping.md

---

### タスク1: T-01-2 受け入れ基準とスコープ定義

**目的**: 受け入れ基準、スコープ、制約、リスクを明文化する。

**実行手順**:

1. フォーカス移動、フォーカストラップ、ARIA 属性、キーボード操作、スクリーンリーダー通知の受け入れ基準を定義する。
2. 対象外とする範囲を明記し、影響を受ける既存機能を整理する。
3. 既存 UI の挙動変更によるリスクを列挙し、対策方針を記載する。

**期待される成果物**:

- outputs/phase-1/acceptance-criteria.md
- outputs/phase-1/scope-definition.md
- outputs/phase-1/risk-assessment.md

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                       | 内容 |
| ----------------------------- | -------------------------- | ---- |
| ファイルセレクターUI設計      | 」の存在を確認してください |
| - ℹ️ [consistency] 参照パス「 | UI/UX 基準                 |

---

## 成果物

| 成果物         | パス                                       | 内容                                |
| -------------- | ------------------------------------------ | ----------------------------------- |
| 要件定義書     | outputs/phase-1/requirements-definition.md | 機能要件と非機能要件                |
| 指摘マッピング | outputs/phase-1/issue-mapping.md           | WCAG 指摘と対象コンポーネント対応表 |
| 受け入れ基準   | outputs/phase-1/acceptance-criteria.md     | 検証可能な受け入れ基準              |
| スコープ定義   | outputs/phase-1/scope-definition.md        | 実装範囲と対象外範囲                |
| リスク評価     | outputs/phase-1/risk-assessment.md         | リスクと対策方針                    |

---

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| API接続          | FileSelection IPC 仕様は変更しないことを要件に記載する                                                                         |
| 認証フロー       | Renderer から Main への呼び出し前提を要件に記載する                                                                            |
| データフロー     | FileSelectorTrigger → FileSelectorModal → FileSelector/WorkspaceFileSelector → SelectedFilesPanel の UI フローを要件に記載する |

---

## 完了条件

- [ ] WCAG 指摘事項が要件として整理されている
- [ ] external/workspace 両モードの対象コンポーネントとファイルが明記されている
- [ ] 受け入れ基準が検証可能な形で定義されている
- [ ] スコープと対象外範囲が記載されている
- [ ] リスクと対策方針が記載されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 1
```

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- T-01-1 要件抽出と問題整理: {result}
- T-01-2 受け入れ基準とスコープ定義: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 2: 設計 ✅

- ℹ️ [consistency] 参照パス「 の対象を明確化する。

6. aria-live は external/workspace で 1 箇所に集約する方針を設計し、重複通知の回避方針を明記する。

**期待される成果物**:

- outputs/phase-2/accessibility-design.md
- outputs/phase-2/focus-management-design.md

---

### タスク1: T-02-2 テスト設計

**目的**: アクセシビリティテストのケースと使用するテストツールを確定する。

**実行手順**:

1. フォーカス管理、ARIA 属性、キーボード操作、スクリーンリーダー通知のテストケースを定義する。
2. 」の存在を確認してください

- ℹ️ [consistency] 参照パス「 の連携、ダイアログのラベル関連、一覧の role/label を検証するテストケースを追加する。

3. jest-axe と React Testing Library の使用方針を整理する。
4. external/workspace 両モードのテストファイル配置と命名ルールを確定する。

**期待される成果物**:

- outputs/phase-2/test-design.md

---

### タスク2: T-02-3 変更影響分析

**目的**: 影響範囲と変更対象ファイルを明確化する。

**実行手順**:

1. FileSelectorTrigger / FileSelectorModal / FileSelector / WorkspaceFileSelector / SelectedFilesPanel の変更点を整理する。
2. 新規フック 」の存在を確認してください

- ℹ️ [consistency] 参照パス「 の配置場所と API を確定する。

3. FileSelection IPC インターフェースへの影響がないことを確認し、記録する。

**期待される成果物**:

- outputs/phase-2/change-impact.md

---

## 参照資料

依存Phase成果物:

| 参照資料       | パス                                       | 内容                |
| -------------- | ------------------------------------------ | ------------------- |
| 要件定義書     | outputs/phase-1/requirements-definition.md | Phase 1 の要件定義  |
| 指摘マッピング | outputs/phase-1/issue-mapping.md           | WCAG 指摘の整理結果 |
| 受け入れ基準   | outputs/phase-1/acceptance-criteria.md     | 受け入れ基準        |
| スコープ定義   | outputs/phase-1/scope-definition.md        | 対象範囲            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                       | 内容 |
| ----------------------------- | -------------------------- | ---- |
| ファイルセレクターUI設計      | 」の存在を確認してください |
| - ℹ️ [consistency] 参照パス「 | WCAG 違反内容と改善要件    |

---

## 成果物

| 成果物               | パス                                       | 内容                       |
| -------------------- | ------------------------------------------ | -------------------------- |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md    | ARIA 属性と role の設計    |
| フォーカス管理設計   | outputs/phase-2/focus-management-design.md | フォーカス移動と復帰の設計 |
| テスト設計           | outputs/phase-2/test-design.md             | テストケースとツール選定   |
| 変更影響分析         | outputs/phase-2/change-impact.md           | 変更対象の整理             |

---

## 統合テスト連携（Phase 1〜11は必須）

- FileSelection IPC の接続要件が変わらないことを設計に明記する
- FileSelectorTrigger と Modal の連携フローを統合観点として記載する

---

## 完了条件

- [ ] フォーカス管理設計が文書化されている
- [ ] ARIA 属性と role の割り当てが文書化されている
- [ ] テスト設計が文書化されている
- [ ] 変更影響分析が文書化されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 2
```

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- T-02-1 アクセシビリティ設計: {result}
- T-02-2 テスト設計: {result}
- T-02-3 変更影響分析: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 3: 設計レビューゲート ✅

- ℹ️ [consistency] 参照パス「 | テスト戦略と jest-axe 指針 |

---

## 成果物

| 成果物                 | パス                                    | 内容           |
| ---------------------- | --------------------------------------- | -------------- |
| レビューチェックリスト | outputs/phase-3/review-checklist.md     | レビュー観点   |
| 設計レビュー報告書     | outputs/phase-3/design-review-report.md | 判定結果と指摘 |
| 決定ログ               | outputs/phase-3/decision-log.md         | 判定と対応方針 |

---

## 統合テスト連携（Phase 1〜11は必須）

- Phase 2 で定義した統合テスト観点がレビューに含まれていることを確認する

---

## 完了条件

- [ ] レビュー観点が整理されている
- [ ] レビュー報告書に判定が記載されている
- [ ] 指摘と対応方針が決定ログに記載されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 3
```

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4 へ進む

---

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 3 実行記録

### 実行タスク

- T-03-1 レビュー準備: {result}
- T-03-2 レビュー実施: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 4: テスト作成 ✅

- ℹ️ [consistency] 参照パス「 を作成し、tree/treeitem と SelectedFilesPanel の list/listitem を検証する。

5. aria-expanded、aria-controls、role、aria-selected、aria-live のテストを追加する。

**期待される成果物**:

- apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/FileSelectorTrigger.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/FileSelectorModal/FileSelectorModal.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.a11y.test.tsx

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                    | 内容          |
| -------------------- | --------------------------------------- | ------------- |
| 設計レビュー報告書   | outputs/phase-3/design-review-report.md | レビュー判定  |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md | ARIA 属性設計 |
| テスト設計           | outputs/phase-2/test-design.md          | テスト計画    |
| 受け入れ基準         | outputs/phase-1/acceptance-criteria.md  | 受け入れ基準  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                       | 内容 |
| ----------------------------- | -------------------------- | ---- |
| 品質要件                      | 」の存在を確認してください |
| - ℹ️ [consistency] 参照パス「 | WCAG 2.1 AA 対応方針       |

---

## 成果物

| 成果物                 | パス                                                                                                     | 内容                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| テストケース一覧       | outputs/phase-4/test-cases.md                                                                            | テスト観点とケース                     |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/FileSelectorTrigger.a11y.test.tsx     | FileSelectorTrigger の a11y テスト     |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/FileSelectorModal/FileSelectorModal.a11y.test.tsx         | FileSelectorModal の a11y テスト       |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.a11y.test.tsx                   | FileSelector（external）の a11y テスト |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.a11y.test.tsx | WorkspaceFileSelector の a11y テスト   |

---

## 統合テスト連携（Phase 1〜11は必須）

- external/workspace 両モードの選択フローを統合シナリオとしてテストケースに含める

---

## 完了条件

- [ ] テストケース一覧が作成されている
- [ ] a11y テストファイルが作成されている
- [ ] テスト実行で失敗することが確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 4
```

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- FileSelectorTrigger.a11y.test.tsx FileSelectorModal.a11y.test.tsx FileSelector.a11y.test.tsx WorkspaceFileSelector.a11y.test.tsx
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- T-04-1 テストケース確定: {result}
- T-04-2 アクセシビリティテスト実装: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 5: 実装 ✅

- ℹ️ [consistency] 参照パス「 が付与される箇所を明確化する。

5. aria-live は FileSelector または WorkspaceFileSelector のいずれか 1 箇所に集約し、モーダル側の重複通知を除去する。

**期待される成果物**:

- apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/index.tsx
- apps/desktop/src/renderer/components/organisms/FileSelectorModal/index.tsx
- apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.tsx
- apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.tsx
- apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectedFilesPanel.tsx

---

### タスク2: T-05-3 キーボード操作実装

**目的**: キーボード操作が要件に一致するように実装する。

**実行手順**:

1. Escape キーによるモーダル閉鎖を確認し、閉鎖しない場合は修正する。
2. Tab と Shift+Tab の移動範囲がモーダル内に限定されることを確認する。
3. Enter と Space の操作がトリガーとボタンで期待動作になることを確認する。
4. WorkspaceFileSelector の treeitem で Enter/Space/Arrow の操作が意図通り動作することを確認する。

**期待される成果物**:

- outputs/phase-5/implementation-notes.md
- outputs/phase-5/a11y-change-summary.md

---

## 参照資料

依存Phase成果物:

| 参照資料         | パス                          | 内容                   |
| ---------------- | ----------------------------- | ---------------------- |
| テストケース一覧 | outputs/phase-4/test-cases.md | Phase 4 のテストケース |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                           | 内容 |
| ----------------------------- | ------------------------------ | ---- |
| ファイルセレクターUI設計      | 」の存在を確認してください     |
| - ℹ️ [consistency] 参照パス「 | フォーカス管理とキーボード操作 |

---

## 成果物

| 成果物                     | パス                                                                                           | 内容                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| フォーカストラップ Hook    | apps/desktop/src/renderer/hooks/useFocusTrap.ts                                                | モーダル内フォーカス制御             |
| FileSelectorTrigger 改修   | apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/index.tsx                   | ARIA 属性追加                        |
| FileSelectorModal 改修     | apps/desktop/src/renderer/components/organisms/FileSelectorModal/index.tsx                     | フォーカス管理と ARIA 属性追加       |
| FileSelector 改修          | apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.tsx                   | 一覧のラベル付けと aria-live 整理    |
| WorkspaceFileSelector 改修 | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.tsx | aria-live と tree セマンティクス整理 |
| SelectedFilesPanel 改修    | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectedFilesPanel.tsx    | list セマンティクス整理              |
| 実装メモ                   | outputs/phase-5/implementation-notes.md                                                        | 実装内容の記録                       |
| a11y 変更サマリー          | outputs/phase-5/a11y-change-summary.md                                                         | 変更点の一覧                         |

---

## 統合テスト連携（Phase 1〜11は必須）

- FileSelectorTrigger から Modal を開閉するフローを統合テストで確認する
- external/workspace 両モードで選択結果が UI に反映されることを統合観点で確認する

---

## 完了条件

- [ ] フォーカストラップが実装されている
- [ ] ARIA 属性と role が実装されている
- [ ] キーボード操作が要件通りに動作する
- [ ] テストが成功する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 5
```

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- FileSelectorTrigger.a11y.test.tsx FileSelectorModal.a11y.test.tsx FileSelector.a11y.test.tsx WorkspaceFileSelector.a11y.test.tsx
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- T-05-1 フォーカス管理実装: {result}
- T-05-2 ARIA 属性と role 実装: {result}
- T-05-3 キーボード操作実装: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 6: テスト拡充 ✅

- ℹ️ [consistency] 参照パス「 の整合性を検証するテストを追加する。

**期待される成果物**:

- apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/FileSelectorTrigger.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/FileSelectorModal/FileSelectorModal.a11y.test.tsx

---

### タスク1: T-06-2 テスト安定化

**目的**: テストの安定性と可読性を高める。

**実行手順**:

1. React Testing Library の推奨クエリを優先して使用する。
2. テストユーティリティを利用して重複処理を削減する。
3. テストケースの実行結果を記録する。

**期待される成果物**:

- outputs/phase-6/test-expansion-summary.md
- outputs/phase-6/regression-test-log.md

---

## 参照資料

依存Phase成果物:

| 参照資料          | パス                                    | 内容               |
| ----------------- | --------------------------------------- | ------------------ |
| 実装メモ          | outputs/phase-5/implementation-notes.md | Phase 5 の実装内容 |
| a11y 変更サマリー | outputs/phase-5/a11y-change-summary.md  | 変更点の一覧       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                       | 内容 |
| ----------------------------- | -------------------------- | ---- |
| 品質要件                      | 」の存在を確認してください |
| - ℹ️ [consistency] 参照パス「 | テスト戦略と RTL 指針      |

---

## 成果物

| 成果物             | パス                                      | 内容             |
| ------------------ | ----------------------------------------- | ---------------- |
| テスト拡充サマリー | outputs/phase-6/test-expansion-summary.md | 追加テストの概要 |
| 回帰テストログ     | outputs/phase-6/regression-test-log.md    | 実行結果の記録   |

---

## 統合テスト連携（Phase 1〜11は必須）

- external/workspace 両モードの選択完了フローの統合テストを追加し、結果を記録する

---

## 完了条件

- [ ] 追加テストが実装されている
- [ ] テスト実行結果が記録されている
- [ ] 既存テストが継続して成功する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 6
```

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 実行タスク

- T-06-1 テスト拡充: {result}
- T-06-2 テスト安定化: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 7: テストカバレッジ確認 ✅

- ℹ️ [consistency] 参照パス「 を実行する。

2. Line/Branch/Function のカバレッジ数値を記録する。
3. 基準未達の項目がある場合は Phase 6 に戻す。

**期待される成果物**:

- outputs/phase-7/coverage-report.md

---

## 参照資料

依存Phase成果物:

| 参照資料           | パス                                      | 内容                 |
| ------------------ | ----------------------------------------- | -------------------- |
| 実装メモ           | outputs/phase-5/implementation-notes.md   | Phase 5 の実装内容   |
| テスト拡充サマリー | outputs/phase-6/test-expansion-summary.md | Phase 6 の追加テスト |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                       | 内容 |
| ----------------------------- | -------------------------- | ---- |
| 品質要件                      | 」の存在を確認してください |
| - ℹ️ [consistency] 参照パス「 | カバレッジ基準             |

---

## 成果物

| 成果物         | パス                               | 内容                 |
| -------------- | ---------------------------------- | -------------------- |
| カバレッジ報告 | outputs/phase-7/coverage-report.md | カバレッジ数値と判定 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テストを再実行し、結果をカバレッジ報告に記載する

---

## 完了条件

- [ ] カバレッジ報告が作成されている
- [ ] 基準未達の場合の戻り先が記録されている
- [ ] 統合テスト結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 7
```

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 実行タスク

- T-07-1 カバレッジ確認: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 8: リファクタリング ✅

- ℹ️ [consistency] 参照パス「 の責務とファイル構成を見直し、重複ロジックを整理する。

2. ARIA 属性設定の共通処理を抽出する。
3. リファクタ後にテストを再実行し、結果を記録する。

**期待される成果物**:

- outputs/phase-8/refactor-notes.md
- outputs/phase-8/refactor-risk-check.md

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                       | 内容                 |
| -------------------- | ------------------------------------------ | -------------------- |
| 要件定義書           | outputs/phase-1/requirements-definition.md | Phase 1 の要件定義   |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md    | Phase 2 の設計       |
| 実装メモ             | outputs/phase-5/implementation-notes.md    | Phase 5 の実装内容   |
| テスト拡充サマリー   | outputs/phase-6/test-expansion-summary.md  | Phase 6 の追加テスト |
| カバレッジ報告       | outputs/phase-7/coverage-report.md         | Phase 7 のカバレッジ |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                           | 内容 |
| ----------------------------- | ------------------------------ | ---- |
| UI/UXコンポーネント           | 」の存在を確認してください     |
| - ℹ️ [consistency] 参照パス「 | フォーカス管理とキーボード操作 |

---

## 成果物

| 成果物         | パス                                   | 内容         |
| -------------- | -------------------------------------- | ------------ |
| リファクタ記録 | outputs/phase-8/refactor-notes.md      | 変更点と理由 |
| リスク確認     | outputs/phase-8/refactor-risk-check.md | 再確認項目   |

---

## 統合テスト連携（Phase 1〜11は必須）

- リファクタ後に統合テストを再実行し、結果を記録する

---

## 完了条件

- [ ] リファクタ内容が記録されている
- [ ] リファクタ後にテストが成功する
- [ ] 統合テスト結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 8
```

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9 へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- FileSelectorTrigger.a11y.test.tsx FileSelectorModal.a11y.test.tsx FileSelector.a11y.test.tsx WorkspaceFileSelector.a11y.test.tsx
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- T-08-1 リファクタリング: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 9: 品質保証 ✅

- ℹ️ [consistency] 参照パス「 を実行する。

4. 結果を品質報告に記載する。

**期待される成果物**:

- outputs/phase-9/quality-report.md

---

### タスク1: T-09-2 コントラスト検証

**目的**: WCAG 2.1 AA のコントラスト基準を満たすことを確認する。

**実行手順**:

1. FileSelector の主要 UI 要素の色と背景色の組み合わせを列挙する。
2. コントラスト比を測定し、基準を満たすか判定する。
3. 結果をコントラスト検証報告に記載する。

**期待される成果物**:

- outputs/phase-9/contrast-check.md

---

## 参照資料

依存Phase成果物:

| 参照資料 | パス                                    | 内容               |
| -------- | --------------------------------------- | ------------------ |
| 実装メモ | outputs/phase-5/implementation-notes.md | Phase 5 の実装内容 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                       | 内容 |
| ----------------------------- | -------------------------- | ---- |
| 品質要件                      | 」の存在を確認してください |
| - ℹ️ [consistency] 参照パス「 | コントラスト基準           |

---

## 成果物

| 成果物           | パス                              | 内容                   |
| ---------------- | --------------------------------- | ---------------------- |
| 品質報告         | outputs/phase-9/quality-report.md | テストと静的解析の結果 |
| コントラスト検証 | outputs/phase-9/contrast-check.md | コントラスト測定結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト結果を品質報告に記載する

---

## 完了条件

- [ ] 品質報告が作成されている
- [ ] コントラスト検証が記録されている
- [ ] 主要テストが成功している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 9
```

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10 へ進む

---

## 品質ゲート（Phase 9 の場合）

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] 総合カバレッジ指数180%+達成

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 実行タスク

- T-09-1 自動品質チェック: {result}
- T-09-2 コントラスト検証: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 10: 最終レビューゲート ✅

- ℹ️ [consistency] 参照パス「 | アクセシビリティ要件 |

---

## 成果物

| 成果物                     | パス                                       | 内容           |
| -------------------------- | ------------------------------------------ | -------------- |
| 最終レビュー報告           | outputs/phase-10/final-review-report.md    | 判定と指摘事項 |
| 最終レビューチェックリスト | outputs/phase-10/final-review-checklist.md | 確認項目       |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト結果が最終レビュー報告に記載されていることを確認する

---

## 完了条件

- [ ] 最終レビュー報告が作成されている
- [ ] 判定が記録されている
- [ ] 受け入れ基準との差分が整理されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 10
```

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 へ進む

---

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実行タスク

- T-10-1 最終レビュー: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

」の存在を確認してください

### Phase 11: 手動テスト検証 ✅

- ℹ️ [consistency] 参照パス「 | フォーカス管理とキーボード操作 |

---

## 成果物

| 成果物         | パス                                   | 内容         |
| -------------- | -------------------------------------- | ------------ |
| 手動テスト結果 | outputs/phase-11/manual-test-result.md | テスト記録   |
| 発見課題       | outputs/phase-11/discovered-issues.md  | 発見課題一覧 |

---

## テスト結果レポート形式

手動テスト結果は以下の形式で 」の存在を確認してください

### Phase 12: ドキュメント更新 ✅

- ℹ️ [consistency] 参照パス「 | 仕様更新判断と更新手順 |

---

## 成果物

| 成果物           | パス                                         | 内容                 |
| ---------------- | -------------------------------------------- | -------------------- |
| 実装ガイド       | outputs/phase-12/implementation-guide.md     | 2 パート構成のガイド |
| 更新履歴         | outputs/phase-12/documentation-change-log.md | 更新ファイル一覧     |
| 未タスクレポート | outputs/phase-12/unassigned-task-report.md   | 未タスク結果         |
| 仕様更新判断     | outputs/phase-12/spec-update-decision.md     | 更新の要否記録       |

---

## 未タスク検出レポート形式（0件の場合）

未タスクが存在しない場合も、以下の形式で 」の存在を確認してください

### Phase 13: PR作成 ✅

問題なし
