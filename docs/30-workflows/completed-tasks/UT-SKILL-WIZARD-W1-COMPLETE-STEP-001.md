# UT-SKILL-WIZARD-W1-COMPLETE-STEP-001 CompleteStep.tsx 実装（Step 2/3: 完了画面再設計） - タスク指示書

## メタ情報

```yaml
issue_number: 2014
```

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001              |
| タスク名     | CompleteStep.tsx 実装（Step 2/3: 完了画面再設計） |
| 分類         | 新機能実装                                        |
| 対象機能     | スキル作成ウィザード - 完了画面                   |
| 優先度       | 高                                                |
| 見積もり規模 | 中規模                                            |
| ステータス   | 未実施                                            |
| 発見元       | skill-wizard-redesign-lane Wave 0 完了後          |
| 発見日       | 2026-04-08                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル作成ウィザードの現行完了画面（`CompleteStep.tsx`）は「スキルが作成されました」テキストと「閉じる」ボタン1つのみというシンプルな構成になっている。skill-wizard-redesign-lane の設計確定仕様（Wave 0 完了後）では、完了画面（Step 3）を「スキル作成の起点画面」へと大幅に再設計することが確定した。

Wave 0（`W0-seq-01` 共有型定義、`W0-seq-02` スマートデフォルト推論サービス）は Phase 12 close-out まで完了済みであり、Wave 1 の並列タスクとして本実装（`W1-par-02c-complete-step`）が定義されている。

### 1.2 問題点・課題

現行の `CompleteStep.tsx` には以下の問題がある。

| 問題点                  | 影響                                                       |
| ----------------------- | ---------------------------------------------------------- |
| 「閉じる」ボタン1つのみ | ユーザーの次のアクションが不明確で離脱率が高まる           |
| スキルパス表示のみ      | 生成品質のフィードバック収集ができず品質改善につながらない |
| リカバリーフロー未実装  | 生成結果が期待と違った場合に再試行手順が明示されない       |
| 外部連携の設定誘導なし  | 外部ツール連携スキル作成時の設定漏れが発生しやすい         |
| `trackEvent` 未計装     | `skill_wizard_next_action` イベントが発火されずUX分析不可  |

### 1.3 放置した場合の影響

- ユーザーがスキル作成直後に何をすべきか分からず、作成したスキルが活用されないまま放置される。
- 生成品質のフィードバックデータが蓄積されず、LLM生成品質の改善サイクルが回らない。
- Wave 2（`W2-seq-03a-skill-create-wizard`）のオーケストレーション統合時に、完了画面のインターフェース未整備によるブロッカーが発生する。

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` を全面再設計し、品質フィードバック・ネクストアクション3カード・リカバリーフローを備えた「スキル作成の起点画面」を実装する。

### 2.2 最終ゴール

- 完了ヘッダー「✓ スキルの骨格を生成しました」が表示される
- 👍/👎ボタンによる品質フィードバックが機能する
- ネクストアクション3カード（今すぐ実行・エディタで開く・別スキルを作る）がそれぞれ正しく動作する
- 👎クリック時にリカバリーフロー（`onRetry` 呼び出し）が発動する
- `trackEvent` を使用して `skill_wizard_next_action` イベントが発火する
- テストカバレッジ 90% 以上を達成する

### 2.3 スコープ（含む/含まない）

#### 含むもの

- `CompleteStep.tsx` の全面改修（現行の `skillPath` + 「閉じる」ボタン構成を廃止）
- `CompleteStepProps` インターフェース更新（`generatedSkill`、`hasExternalIntegration`、各コールバック）
- 品質フィードバック UI（👍/👎ボタン）と二重送信防止ロジック
- ネクストアクション3カード（今すぐ実行・エディタで開く・別スキルを作る）
- 外部連携チェックリスト（`hasExternalIntegration=true` 時のみ表示）
- リカバリーフロー（👎クリックで `onRetry` 呼び出し）
- `trackEvent` を使用した `skill_wizard_next_action` イベント計装
- data-testid / aria-label の付与（NFR準拠）
- Phase 1〜13 の仕様書（phase-\*.md）を既存レーンの `W1-par-02c-complete-step/` に従い実行

#### 含まないもの

- `SkillCreateWizard.tsx` の状態管理変更（W2-seq-03a のスコープ）
- Step 0（`SkillInfoStep.tsx`）の前回入力プリフィル受け取りロジック（W2-seq-03a のスコープ）
- `trackEvent` 関数自体の実装・配置変更（W3-seq-04 のスコープ）
- SkillCreateWizard.tsx 以外のコンポーネントへの影響

### 2.4 成果物

| 成果物                      | パス                                                                                      | 説明                                           |
| --------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 再設計済み CompleteStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                      | 完了画面を起点画面化した本体コンポーネント     |
| テストファイル              | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`       | TDD テストスイート（カバレッジ 90% 以上）      |
| Phase 1〜13 仕様書成果物    | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02c-complete-step/outputs/phase-*/`  | 各フェーズの標準出力ドキュメント               |
| Phase 12 canonical 6 成果物 | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02c-complete-step/outputs/phase-12/` | 実装ガイド・仕様更新・変更履歴・未タスク・FB等 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `W0-seq-01-types-skill-info-form` が Phase 12 close-out まで完了済みであること（`GeneratedSkill` 等の共有型定義が `@repo/shared/types/skillCreator` に存在する）
- `W0-seq-02-smart-default-reasoning-service` が Phase 12 close-out まで完了済みであること
- `W1-par-02a-skill-info-step`（SkillInfoStep.tsx）が完了済みであること（ウィザードフロー構造の確立のため）
- `W1-par-02b-conversation-round-step`（ConversationRoundStep.tsx）が完了済みであること（ウィザードフロー確立のため）
- Node.js / pnpm がインストール済みであること
- `apps/desktop` パッケージ内で `pnpm vitest run --coverage` が実行可能なこと

### 3.2 依存タスク

| タスクID                           | 関係 | 状態   | 説明                                        |
| ---------------------------------- | ---- | ------ | ------------------------------------------- |
| W0-seq-01-types-skill-info-form    | 前提 | 完了   | `GeneratedSkill` 等の共有型定義が必要       |
| W0-seq-02-smart-default-reasoning  | 前提 | 完了   | スマートデフォルト推論サービスが必要        |
| W1-par-02a-skill-info-step         | 前提 | 要完了 | ウィザードフロー確立（W2統合のため）        |
| W1-par-02b-conversation-round-step | 前提 | 要完了 | ウィザードフロー確立（W2統合のため）        |
| W2-seq-03a-skill-create-wizard     | 後続 | 未実施 | Step 0 プリフィル・全体オーケストレーション |
| W3-seq-04-usage-tracking           | 後続 | 未実施 | `trackEvent` 実装・全計装ポイント確認       |

### 3.3 必要な知識

- React（FC / forwardRef / useState / useCallback）
- TypeScript strict mode（null 安全性・型ガード）
- Tailwind CSS デザイントークン（CSS 変数 `--text-primary` 等）
- Vitest / Testing Library（`render`、`userEvent`、`vi.fn()`）
- NON_VISUAL タスクの Phase 11 証跡取得方法（console ログ・mock 実行記録）
- `trackEvent` のスタブ/モック化パターン（Phase 4 テスト設計）
- Electron Renderer 環境での IPC 不使用コンポーネント実装

### 3.4 推奨アプローチ

1. `W1-par-02c-complete-step/` レーン下の既存 Phase 仕様書（phase-1〜phase-13）をそのまま実行フレームとして使用する
2. TDD で進める（Phase 4 でテストを先に書き、Phase 5 で実装する）
3. `trackEvent` は Phase 5 実装時にスタブとして注入し、Phase 4 のテストでは `vi.fn()` モックを用いる
4. フィードバックの二重送信防止は `useState` による送信済みフラグで管理する
5. NON_VISUAL 判定のため Phase 11 は console ログ・mock 実行記録を主証跡とする
6. Phase 12 では canonical 6 成果物（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check）を同一 wave で揃える

---

## 4. 実行手順（Phase 1〜13 の概要）

既存レーン仕様書 `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02c-complete-step/` の各 `phase-*.md` に従い実行する。

### Phase 1: 要件定義

- 現行 `CompleteStep.tsx` の問題点を洗い出す
- 機能要件（FR-01〜FR-09）・非機能要件（NFR-01〜NFR-04）を確定する
- スコープ境界（W2-seq-03a との責務分担）を明確化する
- 成果物: `outputs/phase-1/requirements.md`

### Phase 2: 設計

- `CompleteStepProps` インターフェースを確定する
- UIコンポーネント構成（完了ヘッダー・フィードバック・3カード・外部連携チェックリスト）を設計する
- `trackEvent` 計装ポイント（`skill_wizard_next_action`）を設計に組み込む
- 成果物: `outputs/phase-2/design.md`

### Phase 3: 設計レビュー

- `task-specification-creator` / `aiworkflow-requirements` スキル準拠差分を抽出する
- 30 種の思考法による多角的分析を実施する
- Phase 4 進行可否を判定する
- 成果物: `outputs/phase-3/design-review.md`

### Phase 4: テスト作成（TDD Red フェーズ）

- `CompleteStep.test.tsx` を作成する（Red 状態）
- テストケース: 基本レンダリング・品質フィードバック・3カード動作・外部連携チェックリスト・リカバリーフロー
- `trackEvent` を `vi.fn()` でモック化するパターンを確立する
- `skill_wizard_next_action` イベント発火テストを含める
- 成果物: `CompleteStep.test.tsx`（Red）、`outputs/phase-4/test-matrix.md`

### Phase 5: 実装（TDD Green フェーズ）

- `CompleteStep.tsx` を全面再実装する
- Props インターフェース更新・フィードバックボタン・3カード・外部連携チェックリスト・リカバリーフロー
- `trackEvent` を呼び出し、`skill_wizard_next_action` イベントを発火する
- テストが全件 Green になることを確認する
- 成果物: 再実装済み `CompleteStep.tsx`

### Phase 6: テスト拡充

- フィードバック二重送信防止の edge case テストを追加する
- `generatedSkill=null` / `onExecuteNow=undefined` 等の境界値テストを追加する
- 成果物: 拡充済み `CompleteStep.test.tsx`

### Phase 7: カバレッジ確認

- `cd apps/desktop && pnpm vitest run --coverage` でカバレッジを計測する
- `CompleteStep.tsx` のカバレッジが 90% 以上であることを確認する
- 成果物: `outputs/phase-7/coverage-report.md`

### Phase 8: リファクタリング

- 重複コードの削除・コンポーネント分割判断を実施する
- 変更内容を `対象/Before/After/理由` テーブル形式で記録する
- 成果物: `outputs/phase-8/refactoring-log.md`

### Phase 9: 品質保証

- TypeScript 型チェック（`pnpm typecheck`）をパスさせる
- ESLint チェック（`pnpm lint`）をパスさせる
- 成果物: `outputs/phase-9/qa-report.md`

### Phase 10: 最終レビュー

- 受入条件（FR-01〜FR-09、NFR-01〜NFR-04）を全件確認する
- ブロッカーがないことを確認する
- 成果物: `outputs/phase-10/final-review-result.md`

### Phase 11: 手動テスト（NON_VISUAL 計装のみ）

- NON_VISUAL 分類のため、console ログ・mock 実行記録を主証跡とする
- `skill_wizard_next_action` イベントが正しく発火することをコンソールで確認する
- 成果物: `outputs/phase-11/manual-test-evidence.md`（console ログ・mock 記録を含む）

### Phase 12: ドキュメント更新

- canonical 6 成果物を同一 wave で作成する
  1. `implementation-guide.md`（Part 1: 中学生レベル概念説明 / Part 2: 開発者向け技術詳細）
  2. `system-spec-update-summary.md`
  3. `documentation-changelog.md`
  4. `unassigned-task-detection.md`（0 件でも出力必須）
  5. `skill-feedback-report.md`（改善点なしでも出力必須）
  6. `phase12-task-spec-compliance-check.md`
- `artifacts.json` と `outputs/artifacts.json` の整合を確認する
- 成果物: 上記 6 ファイル

### Phase 13: PR 作成（ユーザー承認後のみ・blocked 維持）

- ユーザーの明示承認があるまで blocked のまま維持する
- PR readiness のみ保持する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] FR-01: 完了ヘッダー「✓ スキルの骨格を生成しました」が表示される
- [ ] FR-02: 「この骨格は期待通りでしたか？」の 👍/👎 フィードバックが機能する
- [ ] FR-03: ネクストアクション 3 カード（今すぐ実行・エディタで開く・別スキルを作る）が全て表示される
- [ ] FR-04: 👎 クリックで `onRetry` が呼ばれる（リカバリーフロー発動）
- [ ] FR-05: `onRetry` は Step 0 への復帰トリガーのみ担い、プリフィル責務は W2-seq-03a に委譲している
- [ ] FR-06: `hasExternalIntegration=true` 時のみ動作確認チェックリストが表示される
- [ ] FR-07: 「▶ 今すぐ実行する」カードクリックで `onExecuteNow` が呼ばれる
- [ ] FR-08: 「✏ エディタで開く」カードクリックで `onOpenInEditor` が呼ばれる
- [ ] FR-09: 「＋ 別のスキルを作る」カードクリックで `onCreateAnother` が呼ばれる

### 非機能要件

- [ ] NFR-01: 全インタラクティブ要素に `aria-label` が付与されている
- [ ] NFR-02: 全インタラクティブ要素に `data-testid` が付与されている
- [ ] NFR-03: Tailwind CSS デザイントークン（CSS 変数）を使用している
- [ ] NFR-04: TypeScript strict mode に対応している（`any` 型不使用）

### 計装要件

- [ ] `skill_wizard_next_action` イベントが各カードクリック時に発火する
- [ ] フィードバックボタン（👍/👎）クリック時に `trackEvent` が呼ばれる
- [ ] 二重送信防止ロジックが実装されている

### 品質要件

- [ ] `CompleteStep.tsx` のテストカバレッジが 90% 以上
- [ ] 全テストが PASS している
- [ ] TypeScript 型チェックエラーなし（`pnpm typecheck`）
- [ ] ESLint エラー / 警告なし（`pnpm lint`）

### ドキュメント要件

- [ ] Phase 12 canonical 6 成果物が全て作成されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が整合している
- [ ] Phase 13 が blocked 状態で維持されている

---

## 6. 検証方法

### テスト実行

```bash
# CompleteStep 単体テストのみ実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx

# カバレッジ計測
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx

# 全テスト実行（回帰確認）
cd apps/desktop && pnpm vitest run
```

### trackEvent 発火確認（NON_VISUAL 証跡）

```bash
# テスト内で trackEvent モックの呼び出しを確認
# vi.fn() で差し替えた trackEvent が
# skill_wizard_next_action イベントで呼ばれていることを検証

# 例: テストケース内の確認
expect(mockTrackEvent).toHaveBeenCalledWith(
  'skill_wizard_next_action',
  expect.objectContaining({ action: 'execute_now' })
);
```

### 品質チェック

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint チェック
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                                                                   |
| ------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| NON_VISUAL 判定時の Phase 11 証跡不足      | 中     | 高       | console ログ + mock 実行記録を evidence として `outputs/phase-11/` に明示的に保存する                  |
| `trackEvent` のスタブ化パターン不統一      | 中     | 中       | Phase 4 で `vi.fn()` モックパターンを確立し、Phase 6 拡充時も同パターンを踏襲する                      |
| W2-seq-03a との Props インターフェース齟齬 | 高     | 中       | `onRetry` は「復帰トリガーのみ」と仕様書に明記し、プリフィル実装は W2-seq-03a に委譲する境界を固定する |
| フィードバック二重送信                     | 低     | 中       | `useState` による送信済みフラグを実装し、Phase 6 で edge case テストを必ず追加する                     |
| カバレッジ 90% 未達                        | 中     | 低       | Phase 4 でテストケース一覧を事前に確定し、Phase 7 でカバレッジ計測後に不足分を Phase 6 で補う          |
| Phase 12 canonical 6 成果物の抜け          | 低     | 中       | Phase 12 開始時に 6 成果物のチェックリストを先に展開し、same-wave で全件作成する                       |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                     | パス                                                                                             | 説明                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| レーン index                     | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                                          | 設計根拠・全体方針・Wave 構成                              |
| W1-par-02c index                 | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02c-complete-step/index.md`                 | CompleteStep タスク概要・Phase 一覧                        |
| Phase 1: 要件定義                | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02c-complete-step/phase-1-requirements.md`  | FR-01〜FR-09 / NFR-01〜NFR-04                              |
| Phase 4: テスト作成              | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02c-complete-step/phase-4-test-creation.md` | テストケース一覧・ヘルパー関数                             |
| W3-seq-04 index                  | `docs/30-workflows/skill-wizard-redesign-lane/W3-seq-04-usage-tracking/index.md`                 | `trackEvent` / `skill_wizard_next_action` イベント全体仕様 |
| task-specification-creator SKILL | `.claude/skills/task-specification-creator/SKILL.md`                                             | Phase 1-13 フォーマット・完了基準                          |
| aiworkflow-requirements SKILL    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                | システム仕様正本                                           |
| lessons-learned.md               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                           | 実装時の苦戦箇所と対処法                                   |

### 参考実装

| ファイル                 | パス                                                                      | 参照用途                           |
| ------------------------ | ------------------------------------------------------------------------- | ---------------------------------- |
| 現行 CompleteStep.tsx    | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`      | 改修前の実装（削除対象要素の確認） |
| SkillCreateWizard.tsx    | `apps/desktop/src/renderer/components/skill/wizard/SkillCreateWizard.tsx` | 親コンポーネント（Props 接続確認） |
| W1-par-02a SkillInfoStep | `apps/desktop/src/renderer/components/skill/wizard/` 配下                 | Wave 1 並列タスクの実装参考        |

---

## 9. 備考

### 苦戦箇所【記入必須】

以下は W0 実装から得た知見と本タスク固有の苦戦が予想される箇所。実装担当者は事前に把握し、対処方針を用意してから Phase 5 に進むこと。

#### 1. NON_VISUAL 判定時の Phase 11 証跡取得方法

本タスクはタスク分類 NON_VISUAL（Renderer 内部の計装のみ・視覚差分なし）。Phase 11（手動テスト）でのスクリーンショット証跡は N/A となるが、代わりに以下を証跡として記録する必要がある。

- `trackEvent` モックの呼び出しログ（console に出力されるか、テスト結果で確認）
- `CompleteStep.test.tsx` の実行結果（全件 PASS のスクリーンショットまたはターミナルログ）
- カバレッジレポートのサマリー出力

対処: `outputs/phase-11/manual-test-evidence.md` に mock 実行記録 + カバレッジサマリーを貼り付ける形式で証跡とする。

#### 2. `trackEvent` のスタブ/モック化パターン（Phase 4 テスト設計）

`trackEvent` が現時点で実装済みかどうかを Phase 1 Step 0 で必ず確認すること（`W3-seq-04-usage-tracking` の完了状況に依存する）。

- `trackEvent` が未実装の場合: Phase 4 / 5 では `vi.fn()` で差し替えた `mockTrackEvent` をコンポーネントに注入する形（props 経由またはモジュールモック）でテストを設計する
- `trackEvent` が実装済みの場合: `vi.mock('../../utils/trackEvent')` 等でモジュールを差し替えてスタブ化する
- いずれの場合も Phase 6 でモックパターンの統一を確認すること

対処: Phase 4 でパターンを確立し、`outputs/phase-4/test-matrix.md` に mock 方針を明記する。

#### 3. Phase 12 canonical 6 成果物の統合

Phase 12 では以下 6 成果物を「same-wave」で揃える必要があり、順番に作成すると最後の成果物で前のものとの整合ミスが発生しやすい。

| #   | 成果物ファイル名                        | 注意点                                                             |
| --- | --------------------------------------- | ------------------------------------------------------------------ |
| 1   | `implementation-guide.md`               | Part 1（中学生レベル）と Part 2（技術者レベル）の 2 パート構成必須 |
| 2   | `system-spec-update-summary.md`         | 新規インターフェース追加がある場合のみ Step 2 実施                 |
| 3   | `documentation-changelog.md`            | `scripts/generate-documentation-changelog.js` 参照                 |
| 4   | `unassigned-task-detection.md`          | 0 件でも出力必須。本タスク実装で発生した未タスクを記録             |
| 5   | `skill-feedback-report.md`              | 改善点なしでも出力必須                                             |
| 6   | `phase12-task-spec-compliance-check.md` | task-specification-creator SKILL.md 準拠チェック結果               |

対処: Phase 12 開始時にチェックリストを先に展開し、6 成果物全ての空テンプレートを作成してから内容を埋める。

### 補足事項

- `onRetry` の責務は「Step 0 への復帰トリガーのみ」。前回入力のプリフィル表示は W2-seq-03a のオーケストレーション責務であるため、本タスクでは実装しない。
- W1-par-02a（SkillInfoStep）/ W1-par-02b（ConversationRoundStep）が完了していない場合、Wave 2 でのオーケストレーション統合時にブロッカーが発生する。依存タスクの完了状況を Phase 1 開始前に確認すること。
- Phase 13 はユーザーの明示承認があるまで blocked のまま維持する。PR readiness のみ保持し、`git commit` / `git push` / PR 作成は実施しない。
