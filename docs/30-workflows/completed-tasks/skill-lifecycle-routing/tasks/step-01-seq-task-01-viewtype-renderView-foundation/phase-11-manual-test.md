# Phase 11: 手動テスト

## メタ情報

| 項目      | 内容                                        |
| --------- | ------------------------------------------- |
| Phase番号 | 11                                          |
| 機能名    | viewtype-renderView-foundation              |
| タスクID  | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |
| 作成日    | 2026-03-17                                  |

## 目的

`skillAnalysis` / `skillCreate` case の描画確認を行う UI テスト・E2E シナリオを実行する。画面証跡は `advanced route fallback` で取得し、`renderView()` の直接分岐保証は unit test（`App.renderView.viewtype.test.tsx`）で補完して、証跡を `outputs/phase-11/screenshots/` に固定する。

## タスク種別判定

| 判定項目                     | 結果    | 理由                                                                      |
| ---------------------------- | ------- | ------------------------------------------------------------------------- |
| 設計タスク（コード変更なし） | No      | ViewType追加・renderView実装あり                                          |
| docs-onlyタスク              | No      | プロダクションコード変更あり                                              |
| UIタスク（UI変更あり）       | **Yes** | renderViewで新しいコンポーネントを描画する                                |
| スクリーンショット必須       | **Yes** | UI変更ありのため必須（Playwright `page.screenshot()` で実画面証跡を取得） |

## 実行タスク

| #   | タスク名                         | 説明                                               |
| --- | -------------------------------- | -------------------------------------------------- |
| 1   | Electronアプリケーション起動確認 | アプリが正常に起動することを確認                   |
| 2   | skillAnalysis画面の描画確認      | skillAnalysis ViewTypeの描画シナリオ実行           |
| 3   | skillCreate画面の描画確認        | skillCreate ViewTypeの描画シナリオ実行             |
| 4   | 既存ViewTypeへの影響なし確認     | リグレッションテスト（既存画面の正常動作確認）     |
| 5   | スクリーンショット取得計画       | 実画面キャプチャの対象TC・セレクタ・保存規約を定義 |
| 6   | 手動テスト結果記録               | テスト結果をmanual-test-result.mdに記録            |

## 参照資料

### タスク関連

| 資料名                     | パス                                       | 説明                           |
| -------------------------- | ------------------------------------------ | ------------------------------ |
| Phase 10 最終レビュー結果  | `outputs/phase-10/final-review-report.md`  | PASS/MINOR判定                 |
| 受入基準 AC-3, AC-4        | `phase-1-requirements.md`                  | renderViewのコンポーネント描画 |
| CLI スクリーンショット制約 | `.claude/rules/06-known-pitfalls.md` (P53) | CLI環境での取得制約            |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                     | 説明                                |
| -------------------- | -------------------------------------------------------- | ----------------------------------- |
| ナビゲーションUI設計 | `aiworkflow-requirements: ui-ux-navigation.md`           | ViewType一覧・Global Navigation設計 |
| 状態管理             | `aiworkflow-requirements: arch-state-management-core.md` | Zustand Store・ViewType状態管理     |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                       | カバレッジ基準・TDD設計             |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                     | P39/P40/P41/P53等                   |

## テストカテゴリ

| カテゴリ             | 対象                                                           | 本タスクでの適用 |
| -------------------- | -------------------------------------------------------------- | ---------------- |
| 機能テスト           | skillAnalysis/skillCreate画面が正しく描画されること            | 必須             |
| UI・UXテスト         | コンポーネントの表示・レイアウトが正しいこと                   | 必須             |
| 統合テスト           | ViewType切り替え→renderView→コンポーネント描画の一連フロー     | 必須             |
| リグレッションテスト | 既存ViewType（デフォルト画面、SettingsView等）が影響を受けない | 必須             |

## テストケース

| TC-ID    | 観点                               | 操作                                                 | 期待結果                                                        |
| -------- | ---------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| TC-11-01 | `renderView("skillAnalysis")` 描画 | `/advanced/skill-analysis?skipAuth=true` で起動      | `data-testid="skill-analysis-view"` が表示される                |
| TC-11-02 | `renderView("skillCreate")` 描画   | `/advanced/skill-create-wizard?skipAuth=true` で起動 | `data-testid="skill-create-wizard"` が表示される                |
| TC-11-03 | 既存 ViewType 回帰                 | `/?skipAuth=true` で起動                             | `data-testid="dashboard-view"` が表示される                     |
| TC-11-04 | `SkillAnalysisView` close 導線     | skillAnalysis 画面で「閉じる」を押下                 | `data-testid="skill-center-view"` へ遷移する                    |
| TC-11-05 | legacy alias 正規化                | `currentView=skill-center` で起動                    | `normalizeSkillLifecycleView` により `skillCenter` が描画される |

## スクリーンショット撮影ガイドライン

本タスクはUI変更を伴うため、スクリーンショットは**必須**。

P53（CLI環境でのスクリーンショット取得制約）に基づき、以下の優先順位で対応する:

1. **Playwright `page.screenshot()`** によるスクリプト化取得（推奨）
2. **Electron `webContents.capturePage()`** によるスクリプト化取得
3. **自動テスト結果を間接的な視覚検証として記録**（最終手段）

## 画面カバレッジマトリクス

| TC-ID    | 画面/状態                            | 証跡                                                            | 備考                        |
| -------- | ------------------------------------ | --------------------------------------------------------------- | --------------------------- |
| TC-11-01 | skillAnalysis 初期表示               | `screenshots/TC-11-01-renderview-skill-analysis.png`            | renderView case             |
| TC-11-02 | skillCreate 初期表示                 | `screenshots/TC-11-02-renderview-skill-create.png`              | renderView case             |
| TC-11-03 | dashboard 回帰                       | `screenshots/TC-11-03-renderview-dashboard-regression.png`      | 既存導線回帰                |
| TC-11-04 | skillAnalysis close 後 skillCenter   | `screenshots/TC-11-04-analysis-close-to-skill-center.png`       | onClose 導線                |
| TC-11-05 | legacy alias (`skill-center`) 正規化 | `screenshots/TC-11-05-legacy-skill-center-alias-normalized.png` | normalizeSkillLifecycleView |

## 実行手順

### Task 1: Electron アプリケーションの起動確認

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3
pnpm --filter @repo/desktop dev 2>&1 &
```

アプリが正常に起動することを確認する（起動エラーがないこと）。

### Task 2: skillAnalysis 画面の描画確認シナリオ

`apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs` で
`/advanced/skill-analysis?skipAuth=true` を開き、`[data-testid="skill-analysis-view"]` 待機後に capture する。

### Task 3: skillCreate 画面の描画確認シナリオ

`apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs` で
`/advanced/skill-create-wizard?skipAuth=true` を開き、`[data-testid="skill-create-wizard"]` 待機後に capture する。

### Task 4: 既存 ViewType への影響なし確認

以下の回帰経路を確認する:

- `/?skipAuth=true` で `dashboard` が描画される（TC-11-03）
- `skillAnalysis` の `閉じる` 操作で `skillCenter` へ戻る（TC-11-04）
- legacy alias `skill-center` が `skillCenter` と同一到達面になる（TC-11-05）

### Task 5: スクリーンショット取得計画

P53 で記録された通り、CLI 環境では screenshot 取得をスクリプト化して再現性を固定する。

```bash
node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs
```

補助証跡として、`renderView()` 分岐自体は unit test でも確認する。

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx
```

### Task 6: 手動テスト結果記録

`outputs/phase-11/manual-test-result.md` に以下を記録する:

```markdown
## Phase 11 手動テスト結果

| シナリオ              | 結果           | スクリーンショット                 | 備考 |
| --------------------- | -------------- | ---------------------------------- | ---- |
| skillAnalysis 描画    | PASS/FAIL/SKIP | outputs/phase-11/skillAnalysis.png | -    |
| skillCreate 描画      | PASS/FAIL/SKIP | outputs/phase-11/skillCreate.png   | -    |
| 既存ViewType 影響なし | PASS/FAIL/SKIP | -                                  | -    |
```

### テストケーステンプレート

各テストケースは以下の形式で記録する:

```markdown
### TC-11-XXX: [テストケース名]

- **前提条件**: [テスト実行前の状態]
- **操作手順**: [実行する操作のステップ]
- **期待結果**: [正常時に期待される挙動]
- **実際の結果**: PASS / FAIL / SKIP
- **スクリーンショット**: [ファイルパス or N/A]
- **備考**: [特記事項]
```

### ウォークスルーシナリオ発見事項リアルタイム分類

テスト実行中に発見した事項は、以下の分類でリアルタイムに記録する:

| 分類           | 説明                           | 対応                     |
| -------------- | ------------------------------ | ------------------------ |
| Bug            | 仕様と異なる動作・クラッシュ   | 即時修正またはIssue起票  |
| UX改善         | 動作するが使い勝手に問題がある | 未タスク化（Phase 12）   |
| 仕様不明       | 仕様書に記載がなく判断できない | 仕様確認後に再テスト     |
| パフォーマンス | 応答が遅い・描画がカクつく     | 計測値を記録し未タスク化 |

## 統合テスト連携【必須】

| 連携対象                  | 確認内容                                          | 確認結果 |
| ------------------------- | ------------------------------------------------- | -------- |
| Phase 5 実装コード        | renderView のcase文が正しく動作すること           | -        |
| Phase 6 テストコード      | 自動テストのカバレッジが手動テストを補完すること  | -        |
| Phase 9 品質検証結果      | Lint/TypeCheck/テスト全PASSの前提が維持されること | -        |
| Phase 10 最終レビュー指摘 | MINOR指摘事項が手動テストで再確認されていること   | -        |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物             | パス                                      | 必須   | 説明                        |
| ------------------ | ----------------------------------------- | ------ | --------------------------- |
| テスト結果         | `outputs/phase-11/manual-test-result.md`  | 必須   | 手動テスト結果              |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`   | 必須   | 発見した課題（0件でも出力） |
| スクリーンショット | `outputs/phase-11/screenshots/`           | 条件付 | UI/UX変更時は必須           |
| 撮影計画           | `outputs/phase-11/screenshot-plan.md`     | 条件付 | UI/UX変更時は必須           |
| カバレッジレポート | `outputs/phase-11/screenshot-coverage.md` | 条件付 | UI/UX変更時は必須           |

## 完了条件

- [ ] `skillAnalysis` case の描画確認シナリオが実行されている（PASS または SKIP + 理由記録）
- [ ] `skillCreate` case の描画確認シナリオが実行されている（PASS または SKIP + 理由記録）
- [ ] 既存 ViewType への影響なし確認が実施されている
- [ ] スクリーンショット撮影計画が `outputs/phase-11/screenshot-plan.md` に記録されている
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている（0件でも出力）
- [ ] スクリーンショットカバレッジレポート `outputs/phase-11/screenshot-coverage.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: Electronアプリケーション起動確認
3. Task 2: skillAnalysis画面の描画確認シナリオ
4. Task 3: skillCreate画面の描画確認シナリオ
5. Task 4: 既存ViewTypeへの影響なし確認
6. Task 5: スクリーンショット取得計画
7. Task 6: 手動テスト結果記録
8. 統合テスト連携の確認
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 11
```

## 次Phase

Phase 12: ドキュメント（phase-12-documentation.md）
