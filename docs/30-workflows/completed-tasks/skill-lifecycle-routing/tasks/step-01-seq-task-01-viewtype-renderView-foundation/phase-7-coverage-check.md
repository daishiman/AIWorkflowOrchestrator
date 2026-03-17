# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク ID  | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                                                                                 |
| Phase      | 7                                                                                                                                                                                           |
| 前 Phase   | Phase 6: テスト拡充（phase-6-test-expansion.md）                                                                                                                                            |
| 次 Phase   | Phase 8: リファクタリング（phase-8-refactoring.md）                                                                                                                                         |
| 依存成果物 | `outputs/phase-6/` 配下のテストファイル群、`apps/desktop/src/renderer/store/types.ts`、`apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`、`apps/desktop/src/renderer/App.tsx` |
| 成果物パス | `outputs/phase-7/coverage-report.md`                                                                                                                                                        |
| ステータス | pending                                                                                                                                                                                     |

## 目的

Phase 5 で実装し Phase 6 でテストを拡充した 3 ファイル（`store/types.ts`、`skillLifecycleJourney.ts`、`App.tsx`）が、プロジェクトのカバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）を満たしているか確認する。未達の場合は Phase 6 に戻り不足テストを補完する。

カバレッジ確認の重点箇所:

- `renderView()` の新規追加 2 case（`"skillAnalysis"`、`"skillCreate"`）と `default` case
- `onAction?: () => void` の optional chaining（未実行パスが Branch Coverage に影響）
- P41 対策: インライン arrow function（`onClose={() => {...}}`）が v8 カバレッジプロバイダで独立した Function としてカウントされる問題

## 実行タスク

| No. | タスク名                           | 説明                                                       |
| --- | ---------------------------------- | ---------------------------------------------------------- |
| 1   | カバレッジレポート取得             | 対象3ファイルを絞り込んでカバレッジ計測コマンドを実行      |
| 2   | 対象ファイルのカバレッジ数値確認   | Line/Branch/Function の各指標を記録し基準達成を判定        |
| 3   | P41 対策: インライン関数カバレッジ | arrow function が Function Coverage に与える影響を評価     |
| 4   | 未達時の対応判断                   | 未達箇所を特定し Phase 6 へ戻るか判断する                  |
| 5   | 達成確認と成果物記録               | 全基準達成後に `coverage-report.md` にカバレッジ数値を記録 |

## 参照資料

### タスク関連

| 資料名                   | パス                                                                                                                           | 参照目的                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Phase 6 テスト拡充仕様書 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-6-test-expansion.md` | 追加テストの確認                                    |
| Phase 5 実装仕様書       | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-5-implementation.md` | 実装内容の確認                                      |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                                                             | カバレッジ基準値（Line 80%+/Branch 60%+/Func 80%+） |
| 既知の落とし穴 P41       | `.claude/rules/06-known-pitfalls.md#P41`                                                                                       | v8 カバレッジプロバイダのインライン関数カウント     |

### システム仕様

| 仕様書名                    | パス                                                            | 参照目的                            |
| --------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| アーキテクチャルール        | `.claude/rules/01-architecture.md`                              | レイヤー依存方向の確認              |
| App.tsx renderView 実装     | `apps/desktop/src/renderer/App.tsx` (L269-316)                  | 対象コードの確認                    |
| ViewType union 定義         | `apps/desktop/src/renderer/store/types.ts`                      | 型定義の確認                        |
| SkillLifecycleJobGuide 定義 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | onAction? 追加箇所の確認            |
| ナビゲーションUI設計        | `aiworkflow-requirements: ui-ux-navigation.md`                  | ViewType一覧・Global Navigation設計 |
| 状態管理                    | `aiworkflow-requirements: arch-state-management-core.md`        | Zustand Store・ViewType状態管理     |

## 実行手順

### Task 1: カバレッジレポート取得

対象3ファイルを絞り込んでカバレッジを計測する。

```bash
# ワークツリーのルートに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3

# 対象ファイルのみを包含したカバレッジレポートを生成（v8 プロバイダ使用）
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/store/types.ts" \
  --coverage.include="src/renderer/navigation/skillLifecycleJourney.ts" \
  --coverage.include="src/renderer/App.tsx" \
  2>&1 | tee outputs/phase-7/coverage-raw.log
```

全テストスイートを対象にカバレッジを確認する場合:

```bash
pnpm --filter @repo/desktop exec vitest run --coverage 2>&1 | grep -E "types\.ts|skillLifecycleJourney|App\.tsx"
```

### Task 2: 対象ファイルのカバレッジ数値確認

以下の表にカバレッジ数値を記録し、基準達成を判定する。

| ファイル                                           | Line Coverage | Branch Coverage | Function Coverage | 基準達成 |
| -------------------------------------------------- | ------------- | --------------- | ----------------- | -------- |
| `src/renderer/store/types.ts`                      | -             | -               | -                 | -        |
| `src/renderer/navigation/skillLifecycleJourney.ts` | -             | -               | -                 | -        |
| `src/renderer/App.tsx`                             | -             | -               | -                 | -        |

基準値:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 3: P41 対策 — インライン arrow function のカバレッジ評価

`App.tsx` の `renderView()` 内には以下のようなインライン arrow function が存在する。これらは v8 カバレッジプロバイダでは独立した Function としてカウントされる（P41）。

```typescript
// renderView() 内の onClose コールバック — 各々が Function Coverage に計上される
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={currentSkillName ?? "demo-skill"}
      onClose={() => {
        setCurrentView("skillCenter");  // ← インライン arrow function (1関数分)
        setCurrentSkillName(null);
      }}
    />
  );
case "skillCreate":
  return (
    <SkillCreateWizard
      onClose={() => setCurrentView("skillCenter")}  // ← インライン arrow function (1関数分)
    />
  );
```

**確認手順:**

```bash
# HTML カバレッジレポートで各 case の onClose コールバック実行状況を確認
open apps/desktop/coverage/index.html
# または
cat apps/desktop/coverage/coverage-summary.json | python3 -m json.tool | grep -A 10 "App.tsx"
```

**対処方針:**

- `onClose` コールバックが未実行の場合: テストで各 case をレンダリングし `onClose` prop を呼び出すテストを Phase 6 に追加
- `currentSkillName ?? "demo-skill"` の null 合体演算子: `currentSkillName = null` と `currentSkillName = "some-skill"` の両パターンをテストでカバー

### Task 4: 未達時の対応判断

いずれかのファイルで基準未達の場合、以下のフローに従う。

**判断フロー:**

```
基準未達ファイルを特定
  └─ Line Coverage 未達
       └─ HTML レポートで赤くなっている行を確認
       └─ 未実行の case (default等) にテスト追加 → Phase 6 へ戻る
  └─ Branch Coverage 未達
       └─ onAction?.() の未実行パス確認
            └─ onAction が undefined の場合のテスト追加
            └─ currentSkillName ?? "demo-skill" の null 分岐テスト追加
       └─ Phase 6 へ戻る
  └─ Function Coverage 未達（P41 パターン）
       └─ renderView() 内のインライン arrow function の未実行を確認
       └─ 各 onClose コールバックを実行するテスト追加 → Phase 6 へ戻る
```

**未達箇所の特定コマンド:**

```bash
# カバレッジ HTML レポートを直接確認（未カバー行は赤表示）
open apps/desktop/coverage/src/renderer/App.tsx.html
open apps/desktop/coverage/src/renderer/navigation/skillLifecycleJourney.ts.html
open apps/desktop/coverage/src/renderer/store/types.ts.html
```

**renderView() の典型的な未達パターンと対処:**

| 未達パターン                    | 対処方法                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `default` case が未実行         | 存在しない ViewType 値（例: `"unknown" as ViewType`）を渡してレンダリングするテスト追加 |
| `"skillAnalysis"` case が未実行 | `currentView = "skillAnalysis"` でレンダリングするテスト追加                            |
| `"skillCreate"` case が未実行   | `currentView = "skillCreate"` でレンダリングするテスト追加                              |
| `onAction?.()` 未実行パス       | `onAction` を渡さないケースと渡すケースの両方をテスト追加                               |
| `null ?? "demo-skill"` 未実行   | `currentSkillName = null` と `currentSkillName = "my-skill"` の両パターンをテスト追加   |

### Task 5: 基準達成の最終確認と成果物記録

全ファイルで基準を達成したことを確認し、成果物ファイルにカバレッジ数値を記録する。

```bash
# 最終カバレッジ確認
pnpm --filter @repo/desktop exec vitest run --coverage 2>&1 | grep -E "types\.ts|skillLifecycleJourney|App\.tsx"
```

成果物ディレクトリの作成と記録:

```bash
mkdir -p outputs/phase-7
cat > outputs/phase-7/coverage-report.md << 'EOF'
# Phase 7 カバレッジレポート

## 計測日時
YYYY-MM-DD HH:MM

## カバレッジ数値

| ファイル | Line | Branch | Function | 判定 |
| -------- | ---- | ------ | -------- | ---- |
| store/types.ts | XX% | XX% | XX% | PASS/FAIL |
| skillLifecycleJourney.ts | XX% | XX% | XX% | PASS/FAIL |
| App.tsx | XX% | XX% | XX% | PASS/FAIL |

## P41 対応記録
（インライン arrow function の対応内容を記録）

## Phase 6 戻り有無
（戻った場合: 追加したテスト内容を記録）
EOF
```

## 統合テスト連携

Phase 7 は独立したカバレッジ計測 Phase であるため、他 Phase との統合テストは不要。ただし以下の点に注意する。

- Phase 6 から戻る場合: テスト追加後に `vitest run` でテスト全件 PASS を確認してから再度カバレッジを計測する
- Phase 8 への引き継ぎ: `coverage-report.md` の数値を Phase 8 リファクタリングの前提情報として参照する

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

| 成果物                   | パス                                 | 説明                                       |
| ------------------------ | ------------------------------------ | ------------------------------------------ |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md` | 3ファイルのカバレッジ数値と判定結果を記録  |
| カバレッジ生ログ（任意） | `outputs/phase-7/coverage-raw.log`   | vitest --coverage の標準出力ログ（参考用） |

## 完了条件

- [ ] `store/types.ts` の Line Coverage が 80% 以上
- [ ] `store/types.ts` の Branch Coverage が 60% 以上
- [ ] `store/types.ts` の Function Coverage が 80% 以上
- [ ] `skillLifecycleJourney.ts` の Line Coverage が 80% 以上
- [ ] `skillLifecycleJourney.ts` の Branch Coverage が 60% 以上
- [ ] `skillLifecycleJourney.ts` の Function Coverage が 80% 以上
- [ ] `App.tsx` の Line Coverage が 80% 以上
- [ ] `App.tsx` の Branch Coverage が 60% 以上
- [ ] `App.tsx` の Function Coverage が 80% 以上
- [ ] P41 対策: `renderView()` 内の `onClose` インライン arrow function の実行確認済み
- [ ] `renderView()` の `default` case が Branch Coverage に計上されている
- [ ] `onAction?.()` の未実行パス（undefined の場合）が Branch Coverage に計上されている
- [ ] 未達があった場合は Phase 6 に戻りテスト追加済み（追加なしの場合は「追加不要」と記録）
- [ ] `outputs/phase-7/coverage-report.md` に数値と判定結果が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 7
```

## 次 Phase

Phase 8: リファクタリング（phase-8-refactoring.md）
