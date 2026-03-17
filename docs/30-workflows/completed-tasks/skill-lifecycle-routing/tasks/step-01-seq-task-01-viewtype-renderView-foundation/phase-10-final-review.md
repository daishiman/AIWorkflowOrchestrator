# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001           |
| Phase      | 10 - 最終レビュー                                     |
| 機能名     | viewtype-renderView-foundation                        |
| 前 Phase   | Phase 9: 品質検証（`phase-9-quality-assurance.md`）   |
| 次 Phase   | Phase 11: 手動テスト（`phase-11-manual-test.md`）     |
| 依存成果物 | `outputs/phase-9/qa-results.md`、Phase 1-9 の全成果物 |
| 成果物パス | `outputs/phase-10/final-review-report.md`             |
| ステータス | not_started                                           |
| 作成日     | 2026-03-17                                            |

## 目的

AC-1〜AC-6 を多角的に照合し、実装の品質・整合性を検証する。判定結果（PASS/MINOR/MAJOR/CRITICAL）に応じて次のアクションを決定する。MINOR 指摘は全て未タスク仕様書に変換する（省略不可）。

## 実行タスク

| No. | タスク名                 | 説明                                                                          |
| --- | ------------------------ | ----------------------------------------------------------------------------- |
| 1   | AC-1〜AC-6 受入基準照合  | 各受入基準を確認方法に従って照合し、達成/未達成を記録する                     |
| 2   | 追加品質確認             | セキュリティ・アーキテクチャ・コード品質の観点から追加チェックを実施する      |
| 3   | 判定結果の決定           | PASS/MINOR/MAJOR/CRITICAL の判定を下し、根拠を記録する                        |
| 4   | MINOR 指摘の未タスク変換 | MINOR 指摘がある場合、全て未タスク仕様書に変換する（0件の場合は0件と記録）    |
| 5   | 最終レビューレポート作成 | `outputs/phase-10/final-review-report.md` に AC照合結果・判定・指摘一覧を記録 |

## 参照資料

### タスク関連

| 資料名                 | パス                                 | 説明                                 |
| ---------------------- | ------------------------------------ | ------------------------------------ |
| Phase 9 品質検証結果   | `outputs/phase-9/qa-results.md`      | Lint・型チェック・テスト結果サマリー |
| タスク仕様書の受入基準 | Phase 1 仕様書内 AC-1〜AC-6          | 受入基準定義                         |
| Phase 10 ゲート判定    | `.claude/rules/05-task-execution.md` | PASS/MINOR/MAJOR/CRITICAL 判定基準   |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md` | P19/P48 等の品質チェック項目         |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                     | 説明                                |
| -------------------- | -------------------------------------------------------- | ----------------------------------- |
| ナビゲーションUI設計 | `aiworkflow-requirements: ui-ux-navigation.md`           | ViewType一覧・Global Navigation設計 |
| 状態管理             | `aiworkflow-requirements: arch-state-management-core.md` | Zustand Store・ViewType状態管理     |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                       | カバレッジ基準・TDD設計             |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                       | レイヤー依存方向・設計原則          |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                  | IPC セキュリティ原則                |

## 実行手順

### Task 1: AC-1〜AC-6 受入基準照合

以下の「受入基準 照合チェックリスト」に従い、各ACの確認方法を実施して結果を記録する。

### Task 2: 追加品質確認

セキュリティ・アーキテクチャ・コード品質の各観点から追加チェックを実施する（後述の「追加品質確認」セクション参照）。

### Task 3: 判定結果の決定

AC照合結果と追加品質確認の結果を総合し、PASS/MINOR/MAJOR/CRITICAL の判定を下す。判定基準は `.claude/rules/05-task-execution.md` の Phase 10 ゲート判定に従う。

### Task 4: MINOR 指摘の未タスク変換

MINOR 指摘がある場合、全て未タスク仕様書に変換する。0件の場合は「0件」と記録する。指示書は `docs/30-workflows/unassigned-task/` に作成する。

### Task 5: 最終レビューレポート作成

```bash
mkdir -p outputs/phase-10
```

`outputs/phase-10/final-review-report.md` に AC照合結果・判定・MINOR指摘一覧を記録する。

---

## 受入基準 照合チェックリスト

### AC-1: ViewType に "skillAnalysis" が追加されている

| 確認観点                                      | 確認方法                                                           | 結果 |
| --------------------------------------------- | ------------------------------------------------------------------ | ---- |
| 型定義に `"skillAnalysis"` メンバーが存在する | `grep -n "skillAnalysis" apps/desktop/src/renderer/store/types.ts` | -    |
| TypeScript コンパイルでエラーなし             | Phase 9 typecheck 結果参照                                         | -    |
| テストで `"skillAnalysis"` が検証されている   | Phase 6/7 成果物参照                                               | -    |

結果: [ ] AC-1 達成

### AC-2: ViewType に "skillCreate" が追加されている

| 確認観点                                    | 確認方法                                                         | 結果 |
| ------------------------------------------- | ---------------------------------------------------------------- | ---- |
| 型定義に `"skillCreate"` メンバーが存在する | `grep -n "skillCreate" apps/desktop/src/renderer/store/types.ts` | -    |
| TypeScript コンパイルでエラーなし           | Phase 9 typecheck 結果参照                                       | -    |
| テストで `"skillCreate"` が検証されている   | Phase 6/7 成果物参照                                             | -    |

結果: [ ] AC-2 達成

### AC-3: App.tsx renderView() に "skillAnalysis" case が追加されている

| 確認観点                                              | 確認方法                                                    | 結果 |
| ----------------------------------------------------- | ----------------------------------------------------------- | ---- |
| `renderView()` 内に `"skillAnalysis"` case が存在する | `grep -n "skillAnalysis" apps/desktop/src/renderer/App.tsx` | -    |
| 対応するコンポーネントが正しく返される                | Phase 4/6 テスト結果参照                                    | -    |

結果: [ ] AC-3 達成

### AC-4: App.tsx renderView() に "skillCreate" case が追加されている

| 確認観点                                            | 確認方法                                                  | 結果 |
| --------------------------------------------------- | --------------------------------------------------------- | ---- |
| `renderView()` 内に `"skillCreate"` case が存在する | `grep -n "skillCreate" apps/desktop/src/renderer/App.tsx` | -    |
| 対応するコンポーネントが正しく返される              | Phase 4/6 テスト結果参照                                  | -    |

結果: [ ] AC-4 達成

### AC-5: skillLifecycleJourney.ts に onAction?: () => void が追加されている

| 確認観点                                          | 確認方法                                                                  | 結果 |
| ------------------------------------------------- | ------------------------------------------------------------------------- | ---- |
| `onAction?: () => void` フィールドが存在する      | `grep -n "onAction" apps/desktop/src/renderer/skillLifecycleJourney.ts`   | -    |
| undefined 安全な呼び出しになっている              | `grep -n "onAction?." apps/desktop/src/renderer/skillLifecycleJourney.ts` | -    |
| テストで undefined / 関数パターンが検証されている | Phase 6 成果物参照                                                        | -    |

結果: [ ] AC-5 達成

### AC-6: 既存の ViewType・機能への影響がない（後方互換性）

| 確認観点                                   | 確認方法                   | 結果 |
| ------------------------------------------ | -------------------------- | ---- |
| 既存 ViewType のテストが全件 PASS している | Phase 9 テスト結果参照     | -    |
| `pnpm lint` でエラーなし                   | Phase 9 lint 結果参照      | -    |
| `pnpm typecheck` でエラーなし              | Phase 9 typecheck 結果参照 | -    |

結果: [ ] AC-6 達成

## 追加品質確認

### セキュリティ確認

- [ ] `store/types.ts` の変更が IPC セキュリティ原則に影響しないこと（`04-electron-security.md` 参照）
- [ ] 新しい ViewType が不正なナビゲーションを引き起こさないこと

### アーキテクチャ確認

- [ ] レイヤー依存方向が `Renderer → Preload → Main` を守っている（`01-architecture.md` 参照）
- [ ] `Record<ViewType, Config>` パターンを使用しているファイルで新メンバーが網羅されている

### コード品質確認

- [ ] `any` 型が存在しない
- [ ] non-null assertion (`!`) が新規追加されていない
- [ ] 未使用 import が存在しない

## 判定

| 判定              | 次のアクション                                           |
| ----------------- | -------------------------------------------------------- |
| PASS              | Phase 11 へ進む                                          |
| MINOR             | 指摘を全て未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR（要件問題） | Phase 1 へ戻る                                           |
| MAJOR（設計問題） | Phase 2 へ戻る                                           |
| CRITICAL          | Phase 1 へ戻り要件再確認                                 |

**判定結果**: （ここに記入）

## MINOR 指摘の未タスク変換記録

MINOR 指摘がある場合、以下に記録し `docs/30-workflows/unassigned-task/` に指示書を作成する。

| 指摘 | 未タスクID | 指示書パス |
| ---- | ---------- | ---------- |
| -    | -          | -          |

## 成果物

| 成果物               | パス                                      | 説明                            |
| -------------------- | ----------------------------------------- | ------------------------------- |
| 最終レビューレポート | `outputs/phase-10/final-review-report.md` | AC照合結果・判定・MINOR指摘一覧 |

## 完了条件

- [ ] AC-1 達成確認済み
- [ ] AC-2 達成確認済み
- [ ] AC-3 達成確認済み
- [ ] AC-4 達成確認済み
- [ ] AC-5 達成確認済み
- [ ] AC-6 達成確認済み
- [ ] セキュリティ・アーキテクチャ・コード品質の追加確認が完了している
- [ ] 判定結果が記録されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換済み（0件の場合は0件と記録）
- [ ] `outputs/phase-10/final-review-report.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

Phase 10 最終レビュー完了後、Phase 11（手動テスト）で以下の検証が行われる。

- UI上での ViewType 遷移動作確認（skillAnalysis / skillCreate 画面への遷移）
- 既存画面への影響がないことの目視確認
- E2E シナリオの実行

Phase 10 では Phase 9 の品質検証結果を前提として判定を行うため、Phase 9 の全チェックが PASS していることを再確認する。

```bash
# Phase 9 結果の存在確認
cat outputs/phase-9/qa-results.md 2>/dev/null | head -20
```

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 10
```

## 次Phase

Phase 11: 手動テスト（phase-11-manual-test.md）
