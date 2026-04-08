# SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） - タスク指示書

## メタ情報

```yaml
issue_number: 2016
```

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                            |
| タスク名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2）            |
| 分類         | 新機能実装                                                            |
| 対象機能     | スキル作成ウィザード - メインオーケストレーター                       |
| 優先度       | 高                                                                    |
| 見積もり規模 | 大規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | skill-wizard-redesign-lane Wave 1 完了後                              |
| 発見日       | 2026-04-08                                                            |
| タスク種別   | NON_VISUAL                                                            |
| 実行順       | Wave 2（W1-par-02a + W1-par-02b + W1-par-02c 完了後）                 |
| 関連レーン   | `docs/30-workflows/skill-wizard-redesign-lane/index.md`（W2-seq-03a） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル作成ウィザードの全面改善（skill-wizard-redesign-lane）が進行中であり、
Wave 0・Wave 1 で以下の成果物が完成済みである。

| 完了タスク | 成果物                                                                                  |
| ---------- | --------------------------------------------------------------------------------------- |
| W0-seq-01  | 共有型定義（`SkillInfoFormData`、`SmartDefaultResult`、`ConversationAnswers` 等）       |
| W0-seq-02  | 推論サービス（`inferSmartDefaults`、`packages/shared/src/services/skillCreator/` 配下） |
| W1-par-02a | `SkillInfoStep.tsx`（Step 0: スキル情報入力）                                           |
| W1-par-02b | `ConversationRoundStep.tsx`（Step 1: 6問固定会話ラリー）                                |
| W1-par-02c | `CompleteStep.tsx`（完了画面: ネクストアクション3カード + 品質フィードバック）          |
| W1-par-02d | `SkillLifecyclePanel.tsx`（遷移ボタン化）                                               |

これらの個別コンポーネントを統合し、ウィザード全体のオーケストレーションを担う
`SkillCreateWizard.tsx` を再設計・新規実装する本タスクが Wave 2 の中核となる。

### 1.2 問題点・課題

現在の `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` は、
旧設計（テンプレート生成 / LLM プラン生成の 2 モード、4 ステップ構成）に基づいており、
Wave 1 の新設計（3 ステップ: Step 0 情報入力 → Step 1 会話ラリー → Step 2 完了）に対応していない。

具体的な問題点:

1. **ステップ構成の不一致**: 旧設計は `説明入力 / 設定 / 生成 / 完了` の 4 ステップ。新設計は
   `SkillInfoStep / ConversationRoundStep / CompleteStep` の 3 ステップ。
2. **スマートデフォルト未統合**: `inferSmartDefaults` の呼び出し箇所（Step 0→1 遷移時）が未実装。
3. **状態設計の複雑化**: 旧実装で LLM プラン生成のための Store 依存（`useIsSkillGenerating` 等）が
   大量に存在し、新設計の NON_VISUAL 計装ポイント 5 つを追加・整理する余地が少ない。
4. **テストカバレッジの不足**: 旧設計のテストは新コンポーネント群に対応していないため、
   カバレッジ目標（90% 以上）を達成できない。

### 1.3 放置した場合の影響

- Wave 1 で完成した `SkillInfoStep` / `ConversationRoundStep` / `CompleteStep` が
  実際のウィザードに統合されず、ユーザーに提供されない。
- `inferSmartDefaults` が Step 1 に適用されないため、スマートデフォルト推論機能
  （W0-seq-02 の成果物）が無駄になる。
- Wave 3 の `W3-seq-04-usage-tracking`（`trackEvent` 計装）が実施不能となり、
  リリーステーブル全体がブロックされる。

---

## 2. 何を達成するか（What）

### 2.1 目的

Wave 1 の全 Step コンポーネントを統合した新設計の `SkillCreateWizard.tsx` を実装し、
スキル作成ウィザードの新フローをエンドツーエンドで動作させる。

### 2.2 最終ゴール

- 3 ステップのウィザードフロー（Step 0 → Step 1 → Step 2）が正常に動作する。
- Step 0 → Step 1 遷移時に `inferSmartDefaults` が呼び出され、結果が Step 1 に渡る。
- NON_VISUAL 計装ポイント 5 つが実装され、テストカバレッジが 90% 以上となる。
- 既存テスト（旧設計）が全 PASS するか、適切に更新・削除される。

### 2.3 スコープ（含むもの / 含まないもの）

#### 含むもの

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` の再実装
- ウィザードのステップ状態管理設計（`useState` vs Zustand slice の判断・実装）
- `inferSmartDefaults` の呼び出しと `SmartDefaultResult` の Step 間受け渡し設計・実装
- NON_VISUAL 計装ポイント 5 つの実装（`trackEvent` スタブまたは console.log 証跡）
- `SkillCreateWizard` のユニットテスト（カバレッジ 90% 以上）
- `wizard/index.ts` と連携するエクスポート更新（W2-seq-03b との調整）

#### 含まないもの

- `SkillInfoStep.tsx` / `ConversationRoundStep.tsx` / `CompleteStep.tsx` の内部実装変更
  （Wave 1 完了済みのため、バグ修正を除いて変更しない）
- `trackEvent` の本実装（Wave 3 の W3-seq-04 で実施）
- `SkillLifecyclePanel.tsx` への変更（Wave 1 完了済み）
- UI デザイン・スタイリングの変更（NON_VISUAL タスクのため不可）
- E2E テスト（Phase 11 は NON_VISUAL 証跡: REPL / CLI の確認記録で代替）

### 2.4 成果物

| 成果物                                                                                 | 説明                                      |
| -------------------------------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（再実装）           | 新 3 ステップ構成のオーケストレーター本体 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`      | カバレッジ 90% 以上のユニットテスト       |
| Phase 1-12 各 Phase の標準成果物（仕様書・レビュー記録・カバレッジ記録・実装ガイド等） | Phase 完了証跡                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Wave 0・Wave 1 のタスクが全て `completed` ステータスであること。
  - W0-seq-01: 型定義（`SkillInfoFormData`、`SmartDefaultResult` 等）が `packages/shared` に存在する。
  - W0-seq-02: `inferSmartDefaults` が `@repo/shared` から公開済み
    （`packages/shared/src/services/skillCreator/index.ts` で export 済み）。
  - W1-par-02a: `SkillInfoStep.tsx` が存在しテストが全 PASS。
  - W1-par-02b: `ConversationRoundStep.tsx` が存在しテストが全 PASS。
  - W1-par-02c: `CompleteStep.tsx` が存在しテストが全 PASS。
- `pnpm vitest run` が全テスト PASS の状態で実行開始すること。
- TypeScript エラーがないこと（`pnpm --filter @repo/desktop typecheck`）。

### 3.2 依存タスク

| タスクID   | タスク名                         | 依存種別 | 状態               |
| ---------- | -------------------------------- | -------- | ------------------ |
| W0-seq-01  | 共有型定義                       | 必須先行 | completed（#2002） |
| W0-seq-02  | スマートデフォルト推論サービス   | 必須先行 | completed（#1998） |
| W1-par-02a | SkillInfoStep.tsx                | 必須先行 | Wave 1 完了後      |
| W1-par-02b | ConversationRoundStep.tsx        | 必須先行 | Wave 1 完了後      |
| W1-par-02c | CompleteStep.tsx                 | 必須先行 | Wave 1 完了後      |
| W2-seq-03b | wizard/index.ts エクスポート更新 | 並列可   | Wave 2 同時進行    |

### 3.3 必要な知識

- React（`useState`、`useEffect`、`forwardRef`）
- Zustand（Slice 設計、個別セレクタパターン）
- `inferSmartDefaults` の API 仕様
  （`packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`）
- `SkillInfoFormData`・`SmartDefaultResult`・`ConversationAnswers` の型定義
  （`packages/shared/src/types/skillCreator.ts`）
- NON_VISUAL タスクの証跡取得方法（`console.log` / mock / automation evidence）
- S26 パターン（architecture-implementation-patterns.md）: IPC → Store 個別セレクタ移行
- P31（無限ループ防止）、P42（バリデーション漏れ防止）の pitfall 対策

### 3.4 推奨アプローチ

**ステップ状態管理の設計方針（要検討・決定が必要）**:

- `useState` 採用: ウィザード内部のみで完結するローカル状態として扱う。
  依存が少なく、テストも容易。旧実装の複雑な Store 依存を排除できる。
- Zustand slice 採用: 他コンポーネントから参照が必要な場合、または永続化が必要な場合に選択。
  NON_VISUAL 計装ポイントのテストには Store mock が必要になる。
- **推奨**: まず `useState` で実装し、Wave 3 の `trackEvent` 計装で Store 連携が
  必要になった場合に Zustand slice へ移行する（段階的複雑化回避）。

**`SmartDefaultResult` の受け渡し設計**:

- Props 経由: `SkillInfoStep` が `onNext(formData: SkillInfoFormData)` を呼び、
  `SkillCreateWizard` 側で `inferSmartDefaults(formData)` を実行し、
  結果を `ConversationRoundStep` の Props として渡す。最もシンプルで推奨。
- Context 経由: ウィザード全体で共有する場合。Step が深くネストする場合に検討。
- Store 経由: 外部から参照が必要な場合のみ。現時点では不要と判断する。

---

## 4. 実行手順

### Phase 1: 要件定義

#### 目的

新設計の受け入れ基準（AC-01〜AC-07）を確定する。

#### 手順

1. `skill-wizard-redesign-lane/index.md` の設計確定仕様を読み込み、
   3 ステップ構成・スマートデフォルト統合・計装ポイント 5 つを受け入れ基準に落とし込む。
2. `SkillInfoFormData`・`SmartDefaultResult`・`ConversationAnswers` の型定義を確認する。
3. 旧 `SkillCreateWizard.tsx` の実装を確認し、破壊的変更の影響範囲を特定する。
4. 受け入れ基準（AC）を `phase-1-requirements.md` に記録する。

#### 受け入れ基準（案）

| AC番号 | 内容                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------- |
| AC-01  | 3 ステップ（Step 0: SkillInfoStep / Step 1: ConversationRoundStep / Step 2: CompleteStep）が動作する |
| AC-02  | Step 0 → Step 1 遷移時に `inferSmartDefaults` が呼び出される                                         |
| AC-03  | `SmartDefaultResult` が Step 1 の `ConversationRoundStep` に Props 経由で渡される                    |
| AC-04  | NON_VISUAL 計装ポイント 5 つが実装される（`console.log` または `trackEvent` スタブ）                 |
| AC-05  | ユニットテストが全 PASS し、カバレッジが 90% 以上となる                                              |
| AC-06  | `pnpm --filter @repo/desktop typecheck` がエラーなし                                                 |
| AC-07  | `pnpm --filter @repo/desktop lint` がエラー・警告なし                                                |

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-1-requirements.md`

### Phase 2: 設計

#### 目的

`SkillCreateWizard.tsx` の再設計を確定する。

#### 手順

1. コンポーネント Props インターフェース（`SkillCreateWizardProps`）を設計する。
2. ステップ状態管理方式（`useState` vs Zustand）を決定し、State 境界を設計する。
3. `inferSmartDefaults` の呼び出しタイミングと `SmartDefaultResult` の受け渡し方式を確定する。
4. NON_VISUAL 計装ポイント 5 つの定義と実装箇所を特定する。
5. 設計を `phase-2-design.md` に記録する。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-2-design.md`

### Phase 3: 設計レビュー

#### 目的

設計の矛盾・漏れ・依存関係を確認する。

#### 手順

1. 30 種の思考法（少なくとも 5 種）を適用して設計を多角的に検証する。
2. `inferSmartDefaults` の呼び出しエラー時のフォールバック挙動を確認する。
3. 旧設計との互換性破壊が生じる箇所を全て列挙し、対処方針を決める。
4. レビュー結果を `phase-3-design-review.md` に記録する。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-3-design-review.md`

### Phase 4: テスト作成（TDD Red フェーズ）

#### 目的

実装前にテストを作成し、Red 状態を確認する（TDD 起点）。

#### 手順

1. AC-01〜AC-07 に対応するテストケース（TC-01〜TC-15 程度）を設計する。
2. `__tests__/SkillCreateWizard.test.tsx` を作成し、全テストが Red（失敗）であることを確認する。
3. NON_VISUAL 計装ポイント 5 つのテストを含める（mock による証跡取得）。
4. `inferSmartDefaults` の呼び出しを mock してテストを設計する。
5. テスト仕様を `phase-4-test-creation.md` に記録する。

#### テストケース（案）

| TC番号 | テスト内容                                                  | 対応 AC |
| ------ | ----------------------------------------------------------- | ------- |
| TC-01  | Step 0 が初期表示される                                     | AC-01   |
| TC-02  | Step 0 で onNext を呼ぶと inferSmartDefaults が呼ばれる     | AC-02   |
| TC-03  | inferSmartDefaults の結果が Step 1 に渡る                   | AC-03   |
| TC-04  | Step 1 で onNext を呼ぶと Step 2 に遷移する                 | AC-01   |
| TC-05  | Step 2 が表示される                                         | AC-01   |
| TC-06  | 計装ポイント 1: ウィザード開始時のログ出力                  | AC-04   |
| TC-07  | 計装ポイント 2: Step 0 完了時のログ出力                     | AC-04   |
| TC-08  | 計装ポイント 3: inferSmartDefaults 呼び出し結果のログ出力   | AC-04   |
| TC-09  | 計装ポイント 4: Step 1 完了時のログ出力                     | AC-04   |
| TC-10  | 計装ポイント 5: ウィザード完了時のログ出力                  | AC-04   |
| TC-11  | inferSmartDefaults がエラーを投げた場合のフォールバック挙動 | AC-02   |
| TC-12  | onClose Props が Step 2 の CompleteStep に渡る              | AC-01   |
| TC-13  | 戻るボタン: Step 1 → Step 0 に戻れる                        | AC-01   |
| TC-14  | カバレッジ計測（90% 以上を確認）                            | AC-05   |
| TC-15  | TypeScript 型安全性（Props の型検査）                       | AC-06   |

#### 成果物

`apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（Red 状態）
`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-4-test-creation.md`

### Phase 5: 実装（TDD Green フェーズ）

#### 目的

テストを全 PASS させる最小実装を行う。

#### 手順

1. `SkillCreateWizard.tsx` を新設計（3 ステップ）で再実装する。
2. `inferSmartDefaults` のインポートと呼び出しを実装する。
   ```typescript
   import { inferSmartDefaults } from "@repo/shared/services/skillCreator";
   ```
3. NON_VISUAL 計装ポイント 5 つを `console.log`（または `trackEvent` スタブ）として実装する。
4. `SkillInfoFormData` を Step 0 の onNext から受け取り、Step 1 に渡す。
5. 全テストが Green（成功）であることを確認する。

#### ステップ状態管理（実装骨格）

```typescript
// ウィザードのステップ状態（useState で管理）
const [currentStep, setCurrentStep] = useState(0);
const [skillInfoFormData, setSkillInfoFormData] =
  useState<SkillInfoFormData | null>(null);
const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
  null,
);

// Step 0 → Step 1 遷移ハンドラ
const handleSkillInfoNext = async (formData: SkillInfoFormData) => {
  // 計装ポイント 2: Step 0 完了
  // 計装ポイント 3: inferSmartDefaults 呼び出し
  const defaults = inferSmartDefaults(formData);
  setSkillInfoFormData(formData);
  setSmartDefaults(defaults);
  setCurrentStep(1);
};
```

#### 成果物

`apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（Green 状態）
`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-5-implementation.md`

### Phase 6: テスト拡充

#### 目的

エッジケース・境界値テストを追加し、テスト網羅性を高める。

#### 手順

1. `inferSmartDefaults` が全フィールド `null` を返す場合のフォールバックテストを追加する。
2. ウィザードを閉じる（`onClose`）操作のテストを追加する。
3. Step が連続して進む場合・戻る場合の遷移テストを追加する。
4. `SkillInfoFormData` の最小入力（`purpose` のみ）と全入力のテストを追加する。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-6-test-expansion.md`

### Phase 7: カバレッジ確認

#### 目的

テストカバレッジが 90% 以上であることを確認する。

#### 手順

1. `cd apps/desktop && pnpm vitest run --coverage` でカバレッジを計測する。
2. `SkillCreateWizard.tsx` の Line / Branch / Function カバレッジを確認する。
3. 90% 未満の場合、未到達のパスを特定してテストを追加する。
4. カバレッジ結果を `phase-7-coverage.md` に記録する。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-7-coverage.md`

### Phase 8: リファクタリング

#### 目的

コード品質を改善する（テストは全 PASS を維持すること）。

#### 手順

1. 責務分離を確認する（オーケストレーション / 状態管理 / 計装の分離）。
2. 変数名・関数名の一貫性を確認する。
3. 型定義の精度を確認する（`any` 型の排除）。
4. コメント・JSDoc の追加・更新を行う。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-8-refactoring.md`

### Phase 9: 品質保証

#### 目的

静的解析・型チェックを実施し、品質ゲートを通過する。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` でエラーが 0 件であることを確認する。
2. `pnpm --filter @repo/desktop lint` でエラー・警告が 0 件であることを確認する。
3. P31（無限ループ）・P42（バリデーション漏れ）・P48（useShallow 未適用）を確認する。
4. 品質ゲート通過を `phase-9-qa.md` に記録する。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-9-qa.md`

### Phase 10: 最終レビュー

#### 目的

Phase 1-9 の成果物を統合レビューし、Phase 12 の準備をする。

#### 手順

1. AC-01〜AC-07 の全達成を確認する。
2. 設計書（phase-2-design.md）と実装の乖離がないことを確認する。
3. NON_VISUAL 計装ポイント 5 つが実装・テスト済みであることを確認する。
4. 最終レビュー結果を `phase-10-final-review.md` に記録する。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-10-final-review.md`

### Phase 11: 手動テスト（NON_VISUAL）

#### 目的

NON_VISUAL タスクの手動検証を実施し、証跡を記録する。

#### 手順

1. REPL / CLI で `inferSmartDefaults` の呼び出し結果を確認する。
2. `pnpm vitest run` の出力（テスト通過・カバレッジ）を証跡として記録する。
3. `console.log` 計装ポイントの出力を確認する（ブラウザコンソールまたは Node.js）。
4. 手動テスト証跡を `phase-11-manual-test.md` に記録する。

> **注意**: NON_VISUAL タスクのため、スクリーンショットは不要。
> REPL / CLI の出力ログを主証跡とする。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/phase-11-manual-test.md`

### Phase 12: ドキュメント更新（canonical 6 成果物）

#### 目的

仕様書・実装ガイド・フィードバック等の canonical 6 成果物を作成する。

#### 手順

1. `implementation-guide.md`: 実装ガイド（他タスクへの引き継ぎ情報）。
2. `system-spec-update-summary.md`: システム仕様更新サマリー。
3. `documentation-changelog.md`: ドキュメント変更履歴。
4. `unassigned-task-detection.md`: 未タスク検出記録（本タスク実施中に発見した未タスク）。
5. `skill-feedback-report.md`: スキル・フィードバックレポート（skill-wizard-redesign-lane の知見）。
6. `phase12-task-spec-compliance-check.md`: タスク仕様書準拠チェック（本仕様書との乖離確認）。

#### 成果物

`docs/30-workflows/W2-seq-03a-skill-create-wizard/outputs/phase-12/`（6 ファイル）

### Phase 13: PR 作成（ユーザー承認待ち）

#### 目的

PR 提出準備を行い、ユーザー承認を待つ（`blocked` 状態で維持）。

#### 手順

1. PR 準備（ブランチ確認、差分確認）のみ実施する。
2. ユーザーの明示承認があるまで `git push` / `gh pr create` は実行しない。

> **重要**: Phase 13 は常に `blocked` 状態で維持すること。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillCreateWizard.tsx` が 3 ステップ（SkillInfoStep / ConversationRoundStep / CompleteStep）で動作する（AC-01）
- [ ] Step 0 → Step 1 遷移時に `inferSmartDefaults` が呼び出される（AC-02）
- [ ] `SmartDefaultResult` が `ConversationRoundStep` の Props として渡される（AC-03）
- [ ] NON_VISUAL 計装ポイント 5 つが実装される（AC-04）

### 品質要件

- [ ] ユニットテストが全 PASS する（AC-05）
- [ ] Line Coverage >= 90%（AC-05）
- [ ] Branch Coverage >= 80%
- [ ] Function Coverage >= 90%
- [ ] TypeScript 型チェックエラーなし（AC-06）
- [ ] ESLint エラー・警告なし（AC-07）
- [ ] P31（無限ループ）対策が適用されている
- [ ] P42（バリデーション漏れ）対策が適用されている

### ドキュメント要件

- [ ] Phase 1-12 の全成果物（仕様書・レビュー記録・実装ガイド等）が存在する
- [ ] canonical 6 成果物（`outputs/phase-12/` 配下）が揃っている
- [ ] `skill-wizard-redesign-lane/index.md` の W2-seq-03a ステータスが `completed` に更新される

---

## 6. 検証方法

### テスト実行コマンド

```bash
# ユニットテスト実行（SkillCreateWizard のみ）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# カバレッジ計測（SkillCreateWizard のみ）
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# 全テスト実行
cd apps/desktop && pnpm vitest run

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

### NON_VISUAL 証跡取得

```bash
# inferSmartDefaults の動作確認（Node.js REPL）
cd packages/shared
node -e "
const { inferSmartDefaults } = require('./dist/services/skillCreator/index.js');
const result = inferSmartDefaults({ purpose: 'Slackに毎日通知する', category: null });
console.log(JSON.stringify(result, null, 2));
"
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                              |
| ------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------------- |
| Wave 1 の Step コンポーネントの Props 仕様不一致 | 高     | 中       | Phase 1 開始前に W1-par-02a/02b/02c の Props 型を確認し、設計に反映する           |
| `inferSmartDefaults` のインポートパス不一致      | 中     | 低       | `packages/shared/src/services/skillCreator/index.ts` の export を事前確認する     |
| 旧設計テストの大量失敗                           | 中     | 高       | 旧テストを Phase 4 で整理（削除・更新）し、新テストに置き換える                   |
| ステップ状態管理の複雑化（Zustand 採用時）       | 中     | 中       | まず `useState` で実装し、必要に応じて Zustand に移行する段階的アプローチを取る   |
| NON_VISUAL 計装ポイントの定義不明確              | 低     | 中       | Phase 2 の設計段階で 5 つのポイントを具体的に定義し、Phase 3 のレビューで確定する |
| カバレッジ 90% 未達                              | 中     | 中       | Phase 7 でカバレッジを計測し、Phase 6 でエッジケースを十分に追加しておく          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                     | パス                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| skill-wizard-redesign-lane index                 | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                                     |
| W0-seq-02 推論サービス仕様                       | `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/index.md`                      |
| 共有型定義（SkillInfoFormData 等）               | `packages/shared/src/types/skillCreator.ts`（L940〜L1015）                                  |
| 推論サービス本体                                 | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                 |
| 推論サービス export                              | `packages/shared/src/services/skillCreator/index.ts`                                        |
| 旧 SkillCreateWizard 実装（参考）                | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                          |
| wizard/index.ts（エクスポート定義）              | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                                |
| アーキテクチャ実装パターン（S26, P31, P42, P48） | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| lessons-learned                                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      |
| known-pitfalls                                   | `.claude/rules/06-known-pitfalls.md`                                                        |
| Phase 1-13 フォーマット                          | `.claude/skills/task-specification-creator/SKILL.md`                                        |
| System spec 正本                                 | `.claude/skills/aiworkflow-requirements/SKILL.md`                                           |

### 参考実装（Wave 1 完了タスク）

- `SkillInfoStep.tsx`（Wave 1 完了）: Step 0 の Props 仕様を参照する。
- `ConversationRoundStep.tsx`（Wave 1 完了）: Step 1 の Props 仕様（`smartDefaults` 受取口）を参照する。
- `CompleteStep.tsx`（Wave 1 完了）: Step 2 の Props 仕様（`onClose` 等）を参照する。

---

## 9. 備考

### 苦戦箇所【記入必須】

以下は W0 実装から得た知見であり、本タスク実施時の注意点として事前に記録する。

#### 苦戦箇所 1: `SmartDefaultResult` のステップ間受け渡し方式

**問題**: `inferSmartDefaults` の結果（`SmartDefaultResult`）を Step 0 から Step 1 へ渡す際に、
Props / Context / Store のどの方式が最適か判断が難しい。

**推奨対処**:

- 本タスクでは Props 経由（`SkillCreateWizard` が `inferSmartDefaults` を呼び出し、
  `ConversationRoundStep` に `smartDefaults={result}` として渡す）を採用する。
- Context は Step が 3 つより深くネストする場合のみ検討する。
- Store は外部参照が必要になった時点で移行する（YAGNI 原則）。

#### 苦戦箇所 2: ウィザードのステップ状態管理設計

**問題**: `useState` vs Zustand slice のどちらを採用するか。旧実装は Zustand を多用し
（`useIsSkillGenerating`、`useGenerationProgress` 等）、複雑化していた。

**推奨対処**:

- ウィザードの `currentStep`・`skillInfoFormData`・`smartDefaults` は
  `useState` で管理する（ウィザード内部のみで完結するため）。
- Zustand slice は外部コンポーネントから参照・更新が必要な場合にのみ追加する。
- Phase 2 の設計でこの判断を明文化し、Phase 3 のレビューで確定する。

#### 苦戦箇所 3: 5 つの計装ポイントのテスト設計

**問題**: NON_VISUAL タスクの計装ポイントをテストする際、`console.log` では
テストの検証が難しい。`trackEvent` スタブを使う場合、モック設計が必要になる。

**推奨対処**:

- Phase 4 のテスト設計時に計装ポイントを `vi.spyOn(console, 'log')` または
  `trackEvent` モック関数で検証する。
- `trackEvent` が Wave 3 で実装される予定であるため、本タスクではスタブ関数
  `const trackEvent = (event: string, data?: unknown) => { console.log(event, data); }` を
  `SkillCreateWizard` 内部に一時的に定義し、Wave 3 で差し替える設計にする。
- テストでは `vi.spyOn(console, 'log')` を使って 5 箇所の呼び出しを検証する。

### 関連タスクの注意事項

- W2-seq-03b（`wizard/index.ts` エクスポート更新）は本タスクと並列実行可能だが、
  新コンポーネント（`SkillInfoStep`・`ConversationRoundStep`）のエクスポートが
  `wizard/index.ts` に追加されていることを Phase 5 実装前に確認すること。
- 本タスク完了後、W3-seq-04（使用率計装）が unblocked になる。
  Phase 12 の `unassigned-task-detection.md` に W3-seq-04 の状況を記録すること。
