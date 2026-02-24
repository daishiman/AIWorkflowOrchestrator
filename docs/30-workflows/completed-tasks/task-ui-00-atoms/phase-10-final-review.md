# Phase 10: 最終レビュー — TASK-UI-00-ATOMS

## メタ情報

| 項目               | 値                                                                     |
| ------------------ | ---------------------------------------------------------------------- |
| タスクID           | TASK-UI-00-ATOMS                                                       |
| Phase              | 10 — 最終レビュー                                                      |
| 前提Phase          | Phase 9（品質検証）完了                                                |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-10/` |
| 判定基準           | PASS / MINOR / MAJOR / CRITICAL                                        |

## 目的

Phase 1〜9 の全成果物を多角的に検証し、要件-実装の整合性・テストカバレッジ・デザイントークン準拠・Apple HIG準拠を総括的に評価する。判定結果に応じて次Phase移行またはフェーズ差し戻しを決定する。

## 背景

TASK-UI-00-ATOMS は Molecules/Organisms の前提となる Atoms 層の実装タスクであり、ここでの品質不備は上位コンポーネント全体に波及する。最終レビューでは、00-2-atoms-components.md に定義された全18完了条件を1つずつ照合し、漏れを検出する。

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: 要件-実装整合性検証

00-2-atoms-components.md の全仕様を実装コードと1対1で照合する。

#### 1-1. コンポーネント別インターフェース検証

| #   | コンポーネント   | 検証項目                                                                                                            |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | StatusIndicator  | `status` 6種（running/success/error/warning/idle/offline）、`size` 3種（sm/md/lg）、`pulse` boolean、`label` string |
| 2   | FilterChip       | `label` string、`isSelected` boolean、`count` number任意、`icon` string任意、`onClick` コールバック                 |
| 3   | Badge            | `variant` に `primary` 追加、`content` props追加、number時 `aria-label` 付与                                        |
| 4   | SkeletonCard     | `variant` 3種（default/stat/list-item）、パルスアニメーション                                                       |
| 5   | SuggestionBubble | `size` 3種（sm/md/lg）、`onClick` コールバック、ホバー/アクティブ/success-bounce                                    |
| 6   | EmptyState       | `suggestions` 配列、`compact` boolean、`mood` 3種（welcoming/encouraging/celebrating）、`action` 拡張               |
| 7   | RelativeTime     | `date` Date/number、`format` 3種（auto/short/long）、`updateInterval` number、`<time>` 要素出力                     |

#### 1-2. ARIA属性検証

| #   | コンポーネント   | 必須ARIA属性                                                 |
| --- | ---------------- | ------------------------------------------------------------ |
| 1   | StatusIndicator  | `role="status"`, `aria-label="ステータス: {status}"`         |
| 2   | FilterChip       | `role="checkbox"`, `aria-checked={isSelected}`, `aria-label` |
| 3   | Badge            | number時 `aria-label="通知 {count}件"`                       |
| 4   | SkeletonCard     | `role="status"`, `aria-label="読み込み中"`                   |
| 5   | SuggestionBubble | `role="button"`, `aria-label`、Enter/Space キーハンドラ      |
| 6   | EmptyState       | `role="status"`（既存維持）                                  |
| 7   | RelativeTime     | `<time datetime="{ISO8601}">` 要素、`aria-label`             |

#### 1-3. エクスポート検証

- [ ] `apps/desktop/src/renderer/components/atoms/index.ts` に7コンポーネント全てが named export されている
- [ ] 各コンポーネントの `index.ts` から Props型も export されている

### Task 2: テストカバレッジ総括

#### 2-1. カバレッジ基準照合

Phase 7 で確認したカバレッジ値を再確認する。

| 指標              | 最低基準 | 推奨基準 | 達成要件     |
| ----------------- | -------- | -------- | ------------ |
| Line Coverage     | 80%      | 90%      | 最低基準必達 |
| Branch Coverage   | 60%      | 70%      | 最低基準必達 |
| Function Coverage | 80%      | 90%      | 最低基準必達 |

#### 2-2. 既存テスト後方互換確認

- [ ] Badge 既存17テストが全て PASS（テスト名・件数変化なし）
- [ ] EmptyState 既存6テストが全て PASS（テスト名・件数変化なし）
- [ ] 既存テストの `describe` / `it` ブロック名が変更されていない

#### 2-3. 新規テスト網羅性

各コンポーネントについて以下のテストカテゴリが存在することを確認する:

| カテゴリ         | 対象                                                  |
| ---------------- | ----------------------------------------------------- |
| レンダリング     | デフォルトpropsでの正常レンダリング                   |
| Props反映        | 各props値が DOM に反映される                          |
| インタラクション | クリック・キーボード操作のコールバック発火            |
| アクセシビリティ | ARIA属性の存在・値検証                                |
| テーマ           | 3テーマ（kanagawa-dragon/light/dark）でのレンダリング |
| エッジケース     | 空値・境界値・未定義propsでのエラー非発生             |

### Task 3: デザイントークン使用検証

#### 3-1. ハードコードカラー検出

以下のコマンドで Tailwind ハードコードカラーの残存を検出する:

```bash
grep -rn "text-gray-\|bg-gray-\|border-gray-\|text-green-\|bg-green-\|text-red-\|bg-red-\|text-blue-\|bg-blue-\|text-yellow-\|bg-yellow-\|text-orange-\|bg-orange-" \
  apps/desktop/src/renderer/components/atoms/StatusIndicator/ \
  apps/desktop/src/renderer/components/atoms/FilterChip/ \
  apps/desktop/src/renderer/components/atoms/Badge/ \
  apps/desktop/src/renderer/components/atoms/SkeletonCard/ \
  apps/desktop/src/renderer/components/atoms/SuggestionBubble/ \
  apps/desktop/src/renderer/components/atoms/EmptyState/ \
  apps/desktop/src/renderer/components/atoms/RelativeTime/
```

- [ ] 上記コマンドの出力が0件である（テストファイルは除外）
- [ ] 検出された場合は全箇所をリストアップし、対応するCSS変数への置換を指示

#### 3-2. CSS変数使用確認

7コンポーネント全てで以下のデザイントークンが使用されていることを確認する:

| トークン種類 | CSS変数プレフィックス例                           |
| ------------ | ------------------------------------------------- |
| カラー       | `var(--status-*)`, `var(--bg-*)`, `var(--text-*)` |
| スペーシング | 8pxグリッド準拠（4px/8px/12px/16px/24px/32px）    |
| 角丸         | `var(--radius-*)` または 8px〜12px統一            |
| フォント     | システムフォント（`-apple-system`系）準拠         |

### Task 4: Apple HIG 準拠検証

#### 4-1. カラーパレット準拠

01-architecture.md に定義された Apple System Colors と実装カラーを照合する:

- [ ] ライトモード: systemBlue `#007AFF`、systemGreen `#34C759`、systemRed `#FF3B30`、systemOrange `#FF9500`
- [ ] ダークモード: systemBlue `#0A84FF`、systemGreen `#30D158`、systemRed `#FF453A`、systemOrange `#FF9F0A`
- [ ] 背景色: ライト `#FFFFFF` / `#F2F2F7`、ダーク `#000000` / `#1C1C1E`
- [ ] Tailwind Slate（青みがかった灰色）が使用されていない

#### 4-2. タッチターゲットサイズ

- [ ] FilterChip: 最小44px x 44px のタッチ領域（paddingを含む）
- [ ] SuggestionBubble: 最小44px x 44px のタッチ領域
- [ ] Badge: タッチ操作不要のため対象外

#### 4-3. 角丸・スペーシング一貫性

- [ ] 全コンポーネントの角丸が 8px〜12px 範囲内で統一
- [ ] スペーシングが 8px グリッドに準拠

#### 4-4. アニメーション

- [ ] StatusIndicator pulse: 200-300ms の適切なduration
- [ ] SuggestionBubble ホバー: `scale(1.02)`〜`scale(1.05)` の控えめな拡大
- [ ] SuggestionBubble success-bounce: 目的を持ったフィードバック
- [ ] SkeletonCard パルス: 控えめで目障りでないアニメーション

### Task 5: レビュー総括

#### 5-1. 判定基準

| 判定     | 条件                                                         | 対応                                               |
| -------- | ------------------------------------------------------------ | -------------------------------------------------- |
| PASS     | Task 1-4 の全項目が合格                                      | Phase 11 へ進む                                    |
| MINOR    | 機能に影響しない軽微な問題（命名・コメント・軽微なスタイル） | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 要件未充足・ARIA属性欠損・カバレッジ基準未達                 | 影響範囲に応じて Phase 1-5 へ差し戻し              |
| CRITICAL | セキュリティ問題・アクセシビリティ重大違反・後方互換性破壊   | Phase 1 へ戻り要件再確認                           |

#### 5-2. MINOR判定時の必須アクション

MINOR指摘は**全て**未タスク仕様書に変換する（「機能影響なし」でも省略不可）:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

## 参照資料

| 参照                                                                 | パス                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Atoms仕様書                                                          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |
| Phase 1 要件定義                                                     | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-1-requirements.md`                |
| Phase 2 設計                                                         | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-2-design.md`                      |
| Phase 5 実装成果物                                                   | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-5-implementation.md`              |
| UIコンポーネント仕様                                                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     |
| UIアーキテクチャ                                                     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   |
| 品質要件                                                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |
| アーキテクチャルール                                                 | `.claude/rules/01-architecture.md`                                                          |
| コード品質ルール                                                     | `.claude/rules/02-code-quality.md`                                                          |
| 既知の落とし穴                                                       | `.claude/rules/06-known-pitfalls.md`                                                        |
| Phase 9 品質検証結果                                                 | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-9/`                       |
| 既存コンポーネント分析                                               | `outputs/phase-1/existing-component-analysis.md`                                            | Phase 1 成果物 |
| コンポーネント要件定義                                               | `outputs/phase-1/component-requirements.md`                                                 | Phase 1 成果物 |
| アクセシビリティ要件                                                 | `outputs/phase-1/accessibility-requirements.md`                                             | Phase 1 成果物 |
| テーマ要件                                                           | `outputs/phase-1/theme-requirements.md`                                                     | Phase 1 成果物 |
| 後方互換性要件                                                       | `outputs/phase-1/backward-compatibility-requirements.md`                                    | Phase 1 成果物 |
| インターフェース設計                                                 | `outputs/phase-2/interface-design.md`                                                       | Phase 2 成果物 |
| 実装サマリー（7コンポーネント実装・R-1〜R-6対応・barrel export更新） | `outputs/phase-5/implementation-summary.md`                                                 | Phase 5 成果物 |
| カバレッジ確認レポート                                               | `outputs/phase-7/coverage-report.md`                                                        | Phase 7 成果物 |
| コード品質分析結果                                                   | `outputs/phase-8/code-quality-analysis.md`                                                  | Phase 8 成果物 |
| リファクタリングログ                                                 | `outputs/phase-8/refactoring-log.md`                                                        | Phase 8 成果物 |
| ESLintレポート                                                       | `outputs/phase-9/lint-report.md`                                                            | Phase 9 成果物 |
| 型チェックレポート                                                   | `outputs/phase-9/typecheck-report.md`                                                       | Phase 9 成果物 |
| テストレポート                                                       | `outputs/phase-9/test-report.md`                                                            | Phase 9 成果物 |
| 品質ゲート判定結果                                                   | `outputs/phase-9/quality-gate-result.md`                                                    | Phase 9 成果物 |

## 統合テスト連携

- Phase 7 カバレッジ確認結果（`outputs/phase-7/`）を参照してカバレッジ数値を照合
- Phase 9 品質検証結果（`outputs/phase-9/`）を参照して Lint・型チェック結果を確認
- Phase 3 設計レビュー結果（`outputs/phase-3/`）の MINOR 指摘が対応済みか確認

## 成果物

| #   | 成果物                       | パス                                                        |
| --- | ---------------------------- | ----------------------------------------------------------- |
| 1   | 要件-実装整合性検証レポート  | `outputs/phase-10/requirements-implementation-alignment.md` |
| 2   | テストカバレッジ総括レポート | `outputs/phase-10/test-coverage-summary.md`                 |
| 3   | デザイントークン監査レポート | `outputs/phase-10/design-token-audit.md`                    |
| 4   | 最終レビュー判定結果         | `outputs/phase-10/final-review-result.md`                   |

## 完了条件

- [ ] Task 1: 7コンポーネント全てのインターフェース定義が 00-2-atoms-components.md と一致
- [ ] Task 1: 7コンポーネント全てのARIA属性が仕様通り実装されている
- [ ] Task 1: atoms/index.ts に7コンポーネント全てが export されている
- [ ] Task 2: Line Coverage ≥ 80%、Branch Coverage ≥ 60%、Function Coverage ≥ 80%
- [ ] Task 2: Badge 既存17テスト全 PASS
- [ ] Task 2: EmptyState 既存6テスト全 PASS
- [ ] Task 2: 新規5コンポーネントの全テストカテゴリ（レンダリング/Props/インタラクション/a11y/テーマ/エッジケース）が存在
- [ ] Task 3: Tailwind ハードコードカラー 0件
- [ ] Task 3: CSS変数ベースのデザイントークン使用を確認
- [ ] Task 4: Apple HIG System Colors 準拠
- [ ] Task 4: タッチターゲット 44px 以上（FilterChip, SuggestionBubble）
- [ ] Task 4: アニメーション duration 200-300ms
- [ ] Task 5: 判定結果（PASS/MINOR/MAJOR/CRITICAL）を `final-review-result.md` に記録
- [ ] Task 5: MINOR 判定の場合、全指摘を未タスク仕様書に変換済み

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 10 ステータスを `completed` に更新
- [ ] 判定結果に応じて次Phase（Phase 11 or 差し戻し先）を決定

## 依存関係

| 方向     | Phase / タスク         | 内容                            |
| -------- | ---------------------- | ------------------------------- |
| 前提     | Phase 9（品質検証）    | Lint・型チェック・全テスト PASS |
| 後続     | Phase 11（手動テスト） | PASS または MINOR 判定時に進行  |
| 差し戻し | Phase 1-5              | MAJOR/CRITICAL 判定時           |

## 次のPhase

- **PASS / MINOR**: → Phase 11（手動テスト）`phase-11-manual-test.md`
- **MAJOR**: → 影響範囲に応じて Phase 1-5 へ差し戻し
- **CRITICAL**: → Phase 1（要件定義）へ差し戻し
