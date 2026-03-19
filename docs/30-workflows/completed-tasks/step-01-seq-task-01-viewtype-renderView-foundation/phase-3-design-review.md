# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                   |
| Phase      | 3 - 設計レビュー                                                                                                              |
| 前 Phase   | Phase 2 - 設計                                                                                                                |
| 次 Phase   | Phase 4 - テスト作成（PASS / MINOR の場合）                                                                                   |
| 依存成果物 | `phase-2-design.md`（設計方針・スニペット）                                                                                   |
| 成果物パス | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-3-design-review.md` |
| ステータス | not_started                                                                                                                   |

## 目的

Phase 2 の設計が AC-1〜AC-6 を満たすか、既存コードへの破壊的影響がないか、後続 Task02〜04 との依存契約が成立するかを多角的に検証する。

## 実行タスク

1. **AC 充足性レビュー**: AC-1〜AC-6 の各項目について、Phase 2 設計が要件を満たすか検証する
2. **後方互換性レビュー**: `normalizeSkillLifecycleView` の戻り値型と `SKILL_LIFECYCLE_JOB_GUIDES` 定数への影響を確認する
3. **依存契約レビュー**: Task02〜04 が Phase 2 設計の型定義を利用して実装できることを検証する
4. **セキュリティレビュー**: 新規 case が AuthGuard をバイパスしていないか確認する
5. **判定と指摘記録**: 全レビュー観点の判定結果を記録し、最終判定（PASS / MINOR / MAJOR）を下す

## レビュー観点

| 観点                   | 検証項目                                                                            | 判定基準                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| AC-1 充足性            | `"skillAnalysis"` と `"skillCreate"` が `ViewType` union に追加されているか         | 両 member が型定義に存在する                                                          |
| AC-2 充足性            | `renderView()` に `case "skillAnalysis"` と `case "skillCreate"` が追加されているか | 2 case が switch 文に存在し、対応するコンポーネントを返す                             |
| AC-3 後方互換性        | `"skill-center"` / `"skillCenter"` / `"skill-editor"` が削除・変更されていないか    | 既存 member が全て残存している                                                        |
| AC-4 充足性            | `SkillLifecycleJobGuide` に `onAction?: () => void` が追加されているか              | フィールドがオプショナルで定義されている                                              |
| AC-5 型安全性          | `pnpm typecheck` が PASS するか                                                     | TypeScript コンパイルエラーがゼロ                                                     |
| AC-6 テスト影響        | 既存テストへの破壊的変更がないか                                                    | `renderView()` の既存 case に変更なし                                                 |
| 後方互換               | `normalizeSkillLifecycleView` の戻り値型が正しく機能するか                          | `Exclude<ViewType, "skill-center">` に `"skillAnalysis"` / `"skillCreate"` が含まれる |
| 後方互換               | `SKILL_LIFECYCLE_JOB_GUIDES` 定数への影響がないか                                   | `as const` 定義が変更不要                                                             |
| 依存契約               | Task02 が `onAction` を使って遷移を実装できる型定義になっているか                   | `SkillLifecycleJobGuide.onAction` が `() => void` として参照可能                      |
| 依存契約               | Task03 が `setCurrentView("skillAnalysis")` を呼べる型定義になっているか            | `ViewType` に `"skillAnalysis"` が存在する                                            |
| 依存契約               | Task04 が `setCurrentView("skillAnalysis")` を呼べる型定義になっているか            | `ViewType` に `"skillAnalysis"` が存在する                                            |
| コンポーネント呼び出し | `SkillAnalysisView` に渡す props が正しいか                                         | `skillName` と `onClose` が適切な型で渡される                                         |
| コンポーネント呼び出し | `SkillCreateWizard` に渡す props が正しいか                                         | `onClose` が `() => void` 型で渡される                                                |
| セキュリティ           | 新規 case が AuthGuard をバイパスしていないか                                       | `renderView()` は `renderCatchAllElement()` から呼ばれ、`<AuthGuard>` でラップされる  |
| 状態リセット           | `skillAnalysis` case で `currentSkillName` が正しくリセットされるか                 | `onClose` 内で `setCurrentSkillName(null)` が呼ばれる                                 |

## 参照資料

### タスク関連

| 資料名         | パス                                                 | 説明                               |
| -------------- | ---------------------------------------------------- | ---------------------------------- |
| Phase 2 成果物 | `phase-2-design.md`                                  | レビュー対象の設計方針・スニペット |
| パックindex    | `docs/30-workflows/skill-lifecycle-routing/index.md` | Codepath 所有表・依存関係図        |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`                 | P31, P44, P45 などの再発防止策     |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                    | 説明                         |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------- |
| ナビゲーション仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | ViewType 正本仕様との照合    |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                 | AuthGuard バイパス禁止ルール |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                      | TypeScript 型安全ルール      |

## レビュー判定基準

| 判定              | 条件                                   | 対応                              |
| ----------------- | -------------------------------------- | --------------------------------- |
| PASS              | 全レビュー観点が問題なし               | Phase 4 へ進む                    |
| MINOR             | 小さな改善点があるが AC を満たしている | 指摘を記録し対応後 Phase 4 へ進む |
| MAJOR（設計問題） | AC を満たさない設計上の欠陥がある      | Phase 2 へ戻る                    |
| MAJOR（要件問題） | 受入基準そのものが不正確               | Phase 1 へ戻る                    |

### MINOR 判定の例

- `skillAnalysis` case のフォールバック値 `"demo-skill"` の妥当性に疑問がある（Task02 完了後に実際のスキル名が渡される見通しはあるか）
- `onAction` の JSDoc コメントが不十分

### MAJOR 判定の例

- `SkillAnalysisView` の props に `skillName` が存在せず、設計スニペットが正しくない
- `normalizeSkillLifecycleView` の戻り値型が `"skillAnalysis"` を含まず、型エラーが発生する
- `renderView()` の既存 case が設計変更により破壊される

## 実行手順

1. Phase 2 成果物（`phase-2-design.md`）を Read して設計方針・スニペットを確認する
2. レビュー観点テーブルの各項目を順に検証する
3. 各観点の判定結果（PASS / FAIL）を記録する
4. MINOR / MAJOR 指摘がある場合、指摘内容と対応方針を記録する
5. 最終判定を下し、次 Phase への引き継ぎ事項を明文化する

## 統合テスト連携

本 Phase は設計レビューのため、統合テストの直接実施はない。ただし、以下のテスト観点をレビューで確認する:

- Phase 2 設計の testability（テスト可能性）: モック可能な構造か
- 既存テストへの破壊的変更がないか（AC-6）
- Phase 4 で作成すべきテストケースの網羅性

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

| 成果物                         | パス                                                                                                                          | 種別         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 設計レビュー結果（本ファイル） | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-3-design-review.md` | レビュー記録 |
| レビュー観点別判定結果         | 本ファイル内に記録                                                                                                            | 判定記録     |
| MINOR / MAJOR 指摘一覧         | 本ファイル内に記録（該当がある場合）                                                                                          | 指摘記録     |

## 完了条件

- [ ] 全レビュー観点の判定が記録されている（PASS / MINOR / MAJOR）
- [ ] MINOR 指摘がある場合、全て未タスク仕様書または修正指示として記録されている
- [ ] MAJOR 判定がある場合、戻り先 Phase（1 または 2）と理由が明記されている
- [ ] 最終判定（PASS / MINOR / MAJOR）が記録されている
- [ ] Phase 4 への引き継ぎ事項（テスト対象の確定・優先度）が明文化されている
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 3
```

## 次Phase

Phase 4 - テスト作成（`phase-4-test-creation.md`）（PASS / MINOR の場合）
