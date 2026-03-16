# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| Phase名    | 品質検証                               |
| 前提Phase  | Phase 8（リファクタリング）            |
| 後続Phase  | Phase 10（最終レビュー）               |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |

---

## 目的

履歴が過剰記録や誤誘導を生まず、改善と再利用に役立つか確認する。Lint・型チェック・全テストの品質ゲートを一括判定し、Phase 10（最終レビュー）に進む品質基準を満たしていることを保証する。

## 背景

Phase 8 のリファクタリング完了後、コード全体の品質を多角的に検証する。品質検証は以下の4観点で実施する: (1) 仕様書品質（曖昧表現・整合性）、(2) 型整合性（全型定義の一貫性）、(3) リンク有効性（参照パスの存在確認）、(4) 既知の落とし穴（P31/P42/P48）準拠。品質ゲートを通過しない場合、Phase 8 に戻りリファクタリングを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 仕様書品質検証

**目的**: Phase 1-8 で作成した全仕様書・設計書の品質を検証する。

**実行手順**:

1. 曖昧表現の検出:

   ```bash
   node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
     --workflow docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback \
     --json
   ```

   - `quality` カテゴリの warning が 0 件であることを確認し、warning がある場合は検証可能な条件文に置換する

2. 成果物間の整合性確認:
   - Phase 1 の受入基準（AC-1〜AC-4）が Phase 2 以降の設計・実装で全てカバーされているか
   - Phase 2 の型定義（`SkillLifecycleEvent` / `SkillAggregateView` / `SkillFeedback` / `PublishReadinessMetrics`）が Phase 5 の実装と一致しているか
   - Phase 8 の命名統一が Phase 2 の設計書に遡及反映されているか
3. 数値の正確性確認:
   - テスト数、カバレッジ数値が Phase 7 のレポートと一致しているか
   - P37 準拠: 想定値ではなく実測値を記載しているか

**期待される成果物**:

- 仕様書品質検証レポート（曖昧表現修正一覧、整合性確認結果）

---

### タスク2: 型整合性検証

**目的**: 全型定義の一貫性と型安全性を検証する。

**実行手順**:

1. TypeScript コンパイラによる型チェックを実行する:
   ```bash
   cd apps/desktop && pnpm typecheck
   pnpm --filter @repo/shared typecheck
   ```
2. P32 準拠の二箇所同時更新確認:
   - `packages/shared/src/` の型定義と `apps/desktop/src/preload/types.ts` の型定義が一致しているか
   ```bash
   grep -n "SkillLifecycleEvent\|SkillAggregateView\|SkillFeedback\|PublishReadinessMetrics" \
     packages/shared/src/**/*.ts apps/desktop/src/preload/types.ts
   ```
3. P19/P48 準拠の型安全性確認:
   - `as` 型アサーションの使用箇所を検出し、実行時バリデーションに置換されているか確認

   ```bash
   grep -rn " as " apps/desktop/src/main/services/lifecycle-history/ apps/desktop/src/renderer/store/slices/lifecycleHistory
   ```

   - non-null assertion (`!`) の使用箇所を検出し、optional chaining に置換されているか確認

   ```bash
   grep -rn "\w\!" apps/desktop/src/main/services/lifecycle-history/ | grep -v "!=\|!=="
   ```

4. P42 準拠の IPC 引数バリデーション確認:
   - 全 IPC ハンドラで3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）が実装されているか

**期待される成果物**:

- 型整合性検証レポート（型チェック結果、P32/P19/P48/P42 準拠確認結果）

---

### タスク3: リンク有効性検証

**目的**: 仕様書内の参照パスが全て有効であることを確認する。

**実行手順**:

1. 仕様書内のファイルパス参照を抽出する:
   ```bash
   grep -rn "outputs/\|\.claude/skills/" \
     docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/
   ```
2. 各参照パスの存在を確認する:
   - `outputs/phase-1/` 〜 `outputs/phase-8/` の全成果物ファイル
   - `.claude/skills/aiworkflow-requirements/references/` の参照ファイル
   - `.claude/skills/task-specification-creator/references/` の参照ファイル
3. 存在しないパスを修正または削除する
4. Phase 間の前後参照（「Phase N の成果物を入力として使用」等）が正確か確認する

**期待される成果物**:

- リンク有効性検証レポート（検証パス一覧、無効パスの修正記録）

---

### タスク4: 既知の落とし穴（P31/P42/P48）準拠確認と品質ゲート判定

**目的**: 既知の落とし穴パターンへの準拠を確認し、品質ゲートの最終判定を行う。

**実行手順**:

1. P31 準拠確認（Zustand Store Hooks 無限ループ防止）:
   - `lifecycleHistorySlice` が個別セレクタベースで設計されているか
   - 合成 Hook（`useLifecycleHistoryStore()`）が使用されていないか
   - `useEffect` 依存配列にアクション関数を含む場合、個別セレクタ経由か
2. P42 準拠確認（IPC 引数 `.trim()` バリデーション）:
   - 全 IPC ハンドラで `typeof === "string"` + `=== ""` + `.trim() === ""` の3段チェックが実装されているか
3. P48 準拠確認（`useShallow` 適用）:
   - `.filter()` / `.map()` で配列を返す派生セレクタに `useShallow` が適用されているか
   ```bash
   grep -rn "useAppStore\|useLifecycleStore" apps/desktop/src/renderer/ | grep -E "filter|map"
   ```
4. 品質ゲートチェックリストの一括判定:

| ゲート項目        | コマンド                                        | 基準        |
| ----------------- | ----------------------------------------------- | ----------- |
| Lint エラー       | `cd apps/desktop && pnpm lint`                  | エラー 0 件 |
| 型エラー          | `cd apps/desktop && pnpm typecheck`             | エラー 0 件 |
| 全テスト成功      | `cd apps/desktop && pnpm vitest run`            | 全件 PASS   |
| Line Coverage     | `cd apps/desktop && pnpm vitest run --coverage` | >= 80%      |
| Branch Coverage   | 同上                                            | >= 60%      |
| Function Coverage | 同上                                            | >= 80%      |

5. 品質ゲート判定:
   - 全項目 PASS: Phase 10 へ進行
   - いずれかの項目 FAIL: 失敗原因を分析し、Phase 8 に戻りリファクタリングを追加

**期待される成果物**:

- 品質ゲート判定レポート（P31/P42/P48 準拠確認結果、品質ゲートチェックリスト結果）

---

## 参照資料

| 参照資料                        | パス                                                                           | 内容                   |
| ------------------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| Phase 1-8 全成果物              | `outputs/`                                                                     | 全 Phase の成果物      |
| Phase 5 実装仕様                | `outputs/phase-5/`                                                             | 型/契約の実装仕様      |
| Phase 7 カバレッジ              | `outputs/phase-7/`                                                             | カバレッジレポート     |
| Phase 8 リファクタリング        | `outputs/phase-8/`                                                             | リファクタリング成果物 |
| review-gate-criteria            | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | レビューゲート判定基準 |
| known-pitfalls                  | `.claude/rules/06-known-pitfalls.md`                                           | 既知の落とし穴一覧     |
| SkillLifecycleEvent実装仕様書   | `outputs/phase-5/event-model-impl-spec.md`                                     | Phase 5 成果物         |
| lifecycleHistorySlice設計仕様書 | `outputs/phase-5/lifecycle-history-slice-spec.md`                              | Phase 5 成果物         |
| 集約ロジック実装仕様書          | `outputs/phase-5/aggregate-logic-impl-spec.md`                                 | Phase 5 成果物         |
| フィードバックモデル実装仕様書  | `outputs/phase-5/feedback-model-impl-spec.md`                                  | Phase 5 成果物         |
| Task08メトリクスAPI実装仕様書   | `outputs/phase-5/publish-metrics-api-impl-spec.md`                             | Phase 5 成果物         |
| 命名統一レポート                | `outputs/phase-8/naming-unification-report.md`                                 | Phase 8 成果物         |
| 重複除去レポート                | `outputs/phase-8/deduplication-report.md`                                      | Phase 8 成果物         |
| データフロー最適化記録          | `outputs/phase-8/data-flow-optimization-report.md`                             | Phase 8 成果物         |
| テスト再実行レポート            | `outputs/phase-8/test-rerun-report.md`                                         | Phase 8 成果物         |

### システム仕様（aiworkflow-requirements）

> 品質検証時に以下のシステム仕様との整合性を確認してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計         |

---

## 成果物

| 成果物                   | パス                                         | 内容                                      |
| ------------------------ | -------------------------------------------- | ----------------------------------------- |
| 仕様書品質検証レポート   | `outputs/phase-9/spec-quality-report.md`     | 曖昧表現修正、整合性確認結果              |
| 型整合性検証レポート     | `outputs/phase-9/type-consistency-report.md` | 型チェック結果、P32/P19/P48/P42 準拠確認  |
| リンク有効性検証レポート | `outputs/phase-9/link-validity-report.md`    | 参照パス検証結果                          |
| 品質ゲート判定レポート   | `outputs/phase-9/quality-gate-report.md`     | 品質ゲートチェックリスト結果、P31/P42/P48 |

---

## 統合テスト連携

- 品質ゲート PASS の場合、Phase 10（最終レビュー）の入力として品質ゲート判定レポートを使用する
- 品質ゲート FAIL の場合、Phase 8 に戻りリファクタリングを追加実行する
- P31/P42/P48 準拠確認結果は Phase 10 のセキュリティレビュー観点で再確認される

---

## 完了条件

- [ ] `verify-all-specs --json` の `quality` warning が 0 件である
- [ ] Phase 1 の受入基準 AC-1〜AC-4 が Phase 2 以降の全成果物でカバーされている
- [ ] `pnpm typecheck` が `packages/shared` と `apps/desktop` の両方でエラー 0 件
- [ ] P32 準拠: 型定義が `packages/shared` と `apps/desktop/src/preload/types.ts` で同期している
- [ ] P19/P48 準拠: 不正な型アサーション・non-null assertion が除去されている
- [ ] P42 準拠: 全 IPC ハンドラで3段バリデーションが実装されている
- [ ] P31 準拠: 個別セレクタベースの設計が確認されている
- [ ] P48 準拠: 派生セレクタに `useShallow` が適用されている
- [ ] 全参照パスが有効であることが確認されている
- [ ] 品質ゲート（Lint/型/テスト/カバレッジ）が全て PASS している
- [ ] 全成果物が `outputs/phase-9/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: 品質ゲート PASS の場合 Phase 10 へ進む。FAIL の場合 Phase 8 へ戻る

---

## 次のPhase

品質ゲート PASS 後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-10-final-review.md`
