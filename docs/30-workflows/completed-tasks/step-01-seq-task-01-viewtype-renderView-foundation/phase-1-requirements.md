# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                                  |
| Phase      | 1 - 要件定義                                                                                                                                 |
| 前 Phase   | なし（起点）                                                                                                                                 |
| 次 Phase   | Phase 2 - 設計                                                                                                                               |
| 成果物パス | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-1-requirements.md` |
| ステータス | not_started                                                                                                                                  |

## 目的

`ViewType` と `renderView()` の現状を調査し、`skillAnalysis` / `skillCreate` の追加に必要な変更スコープを確定する。後続の設計・実装 Phase が迷わず着手できる受入基準と制約を明文化する。

## 実行タスク

1. **現状調査**: 以下のファイルの現在の定義を読み取る
   - `apps/desktop/src/renderer/store/types.ts` — `ViewType` union type の全 member を列挙
   - `apps/desktop/src/renderer/App.tsx` — `renderView()` switch 文の全 case を列挙
   - `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` — `SkillLifecycleJobGuide` 型の全フィールドを列挙
   - `apps/desktop/src/renderer/store/slices/navigationSlice.ts` — `setCurrentView` の型シグネチャを確認

2. **既存 ViewType の不整合調査**:
   - `"skill-center"` と `"skillCenter"` の両方が存在する理由と `normalizeSkillLifecycleView` の動作を確認
   - `"skill-editor"` の利用状況（`setCurrentView("skill-editor")` の呼び出し箇所）を調査
   - 追加予定の `skillAnalysis` / `skillCreate` に対応するコンポーネントが既に存在するか確認

3. **依存コンポーネント確認**:
   - `SkillAnalysisView` の props シグネチャを確認（`skillName`, `onClose` の型）
   - `SkillCreateWizard` の props シグネチャを確認（`onClose` の型）
   - `apps/desktop/src/renderer/components/skill/index.ts` から両コンポーネントが export されているか確認

4. **受入基準の確定**: 上記調査結果を踏まえ、AC-1〜AC-6 を本 Phase 完了条件として記録する

## 参照資料

### タスク関連

| 資料名       | パス                                                            | 説明                         |
| ------------ | --------------------------------------------------------------- | ---------------------------- |
| パックindex  | `docs/30-workflows/skill-lifecycle-routing/index.md`            | タスク全体像・依存関係図     |
| 導線契約正本 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | 画面責務境界・normalize 関数 |

### システム仕様（aiworkflow-requirements）

| 資料名                   | パス                                                                                        | 説明                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| ナビゲーション仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 正本仕様                           |
| 機能別コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / SkillEditor / SkillAnalysis コンポーネント仕様 |
| アーキテクチャパターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand / ナビゲーションパターン                             |

## 実行手順

1. 実行タスク 1（現状調査）: 対象4ファイルを Read して現在の定義を列挙する
2. 実行タスク 2（不整合調査）: `"skill-center"` / `"skillCenter"` の normalize ロジックと `"skill-editor"` の利用状況を確認する
3. 実行タスク 3（依存コンポーネント確認）: `SkillAnalysisView` / `SkillCreateWizard` の props シグネチャを記録する
4. 実行タスク 4（受入基準の確定）: 調査結果を基に AC-1〜AC-6 を確定する
5. 完了条件の全項目を検証する

## 統合テスト連携

本 Phase は要件定義のため、統合テストの直接実施はない。ただし、以下の観点を Phase 4（テスト作成）に引き継ぐ:

- `ViewType` union の網羅性テスト方針
- `renderView()` の新 case に対する描画テスト方針
- `SkillLifecycleJobGuide` 型の互換性テスト方針

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

| 成果物                   | パス                                                                                                                                         | 種別     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 要件定義書（本ファイル） | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-1-requirements.md` | 仕様書   |
| 現状調査結果             | 本ファイル内に記録                                                                                                                           | 調査記録 |
| 受入基準 AC-1〜AC-6      | 本ファイル内に記録                                                                                                                           | 受入基準 |

## 完了条件

- [ ] `ViewType` の現在の全 member が列挙されている
- [ ] `renderView()` の現在の全 case が列挙されている
- [ ] `"skill-center"` → `"skillCenter"` の normalize ロジックが確認済み
- [ ] `SkillAnalysisView` の props シグネチャが記録されている（`skillName: string`, `onClose: () => void` を含む）
- [ ] `SkillCreateWizard` の props シグネチャが記録されている（`onClose: () => void` を含む）
- [ ] `SkillLifecycleJobGuide` の現在のフィールド一覧が記録されている
- [ ] `skillAnalysis` / `skillCreate` case で `currentSkillName` を渡すか否かの判断が記録されている
- [ ] AC-1〜AC-6 が本 Phase 完了条件として確認済み
- [ ] Phase 2 への引き継ぎ事項が明文化されている
- [ ] **本Phase内の全タスクを100%実行完了**

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
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 1
```

## 次Phase

Phase 2 - 設計（`phase-2-design.md`）
