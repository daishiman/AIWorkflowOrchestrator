# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| フェーズ番号 | 1                                    |
| 作成日       | 2026-04-12                           |
| 前フェーズ   | なし（起点）                         |
| 次フェーズ   | [Phase 2: 設計](./phase-2-design.md) |

---

## 目的

W3-seq-04 で実装された `trackEvent` 計装が、実際のブラウザ/Electron 環境における UI 操作を通じて正しく発火することを E2E テストで検証するための要件を明確化する。

具体的には以下を確定する。

1. 検証対象となる trackEvent 計装ポイント（AC-1〜AC-9）
2. E2E テストケース一覧（TC-03、TC-05、TC-06、TC-08、TC-09、TC-11、TC-12 相当）
3. スコープの境界（本タスクで実施すること・しないこと）
4. CI パイプラインへの組み込み要件

---

## 実行タスク

### タスク 1-1: 既存計装ポイントの棚卸し

`apps/desktop/src/renderer/utils/trackEvent.ts` と `SkillCreateWizard.tsx` を参照し、W3-seq-04 で追加された 5 つの計装ポイントを確認する。

```
計装ポイント一覧（W3-seq-04 実装済み）:
1. skill_wizard_started         - ウィザード起動時（useEffect）
2. skill_wizard_step1_completed - Step 1（詳細設定）完了時（handleGenerate）
3. skill_wizard_generation_completed - スキル生成完了時（handleGenerate 内）
4. skill_skeleton_quality_feedback   - 品質フィードバック時（handleQualityFeedback）
5. skill_wizard_next_action          - 次アクション選択時（handleExecuteNow / handleOpenInEditor / handleCreateAnother）
```

### タスク 1-2: E2E 検証対象テストケースの策定

Phase 11 手動テスト証跡で NON_VISUAL として扱われたテストケースのうち、E2E で検証可能なものを確定する。

**E2E テストケース一覧**:

| TC番号 | 対応 AC | 説明                                                 | 対象 trackEvent                                         |
| ------ | ------- | ---------------------------------------------------- | ------------------------------------------------------- |
| TC-03  | AC-1    | InfoStep を完了して ConversationRoundStep に遷移する | `skill_wizard_step1_completed`（前提ステップ）          |
| TC-05  | AC-2    | CompleteStep で「👍（satisfied）」クリック           | `skill_skeleton_quality_feedback { satisfied: true }`   |
| TC-06  | AC-3    | CompleteStep で「👎（unsatisfied）」クリック         | `skill_skeleton_quality_feedback { satisfied: false }`  |
| TC-08  | AC-4    | `complete-step-action-execute` クリック              | `skill_wizard_next_action { action: "execute" }`        |
| TC-09  | AC-5    | `complete-step-action-open-editor` クリック          | `skill_wizard_next_action { action: "open_editor" }`    |
| TC-11  | AC-6    | `complete-step-action-create-another` クリック       | `skill_wizard_next_action { action: "create_another" }` |
| TC-12  | AC-7    | 「もう一度作成」後にウィザードが InfoStep に戻る     | UI 遷移確認（data-testid="wizard-step-info" 表示）      |

### タスク 1-3: trackEvent スタブ要件の確定

本番の `trackEvent.ts` を変更せずに E2E テストで発火を検出するためのスタブ方針を確定する。

**スタブ要件**:

- `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` を E2E ビルド時の差し替え先として用意する
- `window.__trackEventCalls` に `eventName` と `payload` を蓄積し、テスト側から `page.evaluate` で取得可能にする
- スタブは `SkillWizardEvents` 型と整合した型定義を持つこと（AC-8）
- `page.addInitScript` で capture 配列を初期化し、初回描画前から記録できること
- `page.addInitScript` で `window.electronAPI.store.get` も注入し、`onboarding.hasCompleted` などの初期読込を安定化すること

### タスク 1-4: CI 組み込み要件の確定

現在の `.github/workflows/ci.yml` の `e2e-desktop` ジョブは以下の状態である。

```yaml
e2e-desktop:
  name: E2E Test (desktop)
  runs-on: ubuntu-latest
  timeout-minutes: 5
  steps:
    - name: Skip E2E in default CI
      run: |
        echo "E2E tests are skipped in default CI to keep feedback fast."
```

AC-9 の要件を満たすため、以下を確定する。

1. `e2e-desktop` ジョブを実際に Playwright テストを実行するよう改修する
2. 実行対象は `pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts` とし、既存の `chromium` プロジェクトを再利用する
3. `apps/desktop/vite.e2e.config.ts` の alias で `trackEvent.ts` を E2E スタブに差し替える
4. Ubuntu 上のヘッドレス実行では `xvfb-run` を追加しない
5. `build` ジョブの `needs` に `e2e-desktop` が含まれているため、失敗時は PR がブロックされることを確認する

### タスク 1-5: スコープ境界の確定

以下のスコープ境界を文書化する。

**含むもの**:

- `apps/desktop/e2e/skill-wizard-tracking.spec.ts`（新規）
- `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`（新規）
- `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`（新規）
- `.github/workflows/ci.yml`（`e2e-desktop` ジョブ改修）
- `apps/desktop/vite.e2e.config.ts`（trackEvent alias 追加）

**含まないもの**:

- `apps/desktop/src/renderer/utils/trackEvent.ts`（変更禁止）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（変更禁止）
- 既存ユニットテストの変更
- 外部アナリティクスサービスへの実送信

---

## 受入条件（AC）詳細

### AC-1: InfoStep 完了 → ConversationRoundStep 遷移確認

```
前提: ウィザードが表示されており data-testid="wizard-step-info" が visible
操作: スキル名・目的（10文字以上）・カテゴリを入力し「次へ」をクリック
期待: data-testid="wizard-step-conversation-round" が visible になる
```

### AC-2: 👍（satisfied）後に skill_skeleton_quality_feedback 発火

```
前提: ウィザードが CompleteStep（data-testid="wizard-step-complete"）にある
操作: data-testid="complete-step-feedback-satisfied" をクリック
期待: trackEvent スタブに { eventName: "skill_skeleton_quality_feedback", payload: { satisfied: true } } が記録されている
```

### AC-3: 👎（unsatisfied）後に skill_skeleton_quality_feedback 発火

```
前提: ウィザードが CompleteStep にある
操作: data-testid="complete-step-feedback-unsatisfied" をクリック
期待: trackEvent スタブに { eventName: "skill_skeleton_quality_feedback", payload: { satisfied: false } } が記録されている
```

### AC-4: execute アクション後に skill_wizard_next_action(execute) 発火

```
前提: ウィザードが CompleteStep にある
操作: data-testid="complete-step-action-execute" をクリック
期待: trackEvent スタブに { eventName: "skill_wizard_next_action", payload: { action: "execute" } } が記録されている
```

### AC-5: open_editor アクション後に skill_wizard_next_action(open_editor) 発火

```
前提: ウィザードが CompleteStep にある
操作: data-testid="complete-step-action-open-editor" をクリック
期待: trackEvent スタブに { eventName: "skill_wizard_next_action", payload: { action: "open_editor" } } が記録されている
```

### AC-6: create_another アクション後に skill_wizard_next_action(create_another) 発火

```
前提: ウィザードが CompleteStep にある
操作: data-testid="complete-step-action-create-another" をクリック
期待: trackEvent スタブに { eventName: "skill_wizard_next_action", payload: { action: "create_another" } } が記録されている
```

### AC-7: 「もう一度作成」後に InfoStep へ戻る

```
前提: ウィザードが CompleteStep にある
操作: data-testid="complete-step-action-create-another" をクリック
期待: data-testid="wizard-step-info" が visible になる（InfoStep に戻る）
```

### AC-8: trackEvent スタブの型整合

```
要件: wizard-tracking-stub.ts のスタブ型定義が trackEvent.ts の SkillWizardEvents 型と
      一致していること（TypeScript コンパイルエラーが出ないこと）
```

### AC-9: CI での自動実行と PR ブロック

```
要件: .github/workflows/ci.yml の e2e-desktop ジョブが実際に Playwright を実行し、
      テスト失敗時に build ジョブ（PR マージゲート）が失敗してブロックされること
```

---

## 参照資料

| 資料                       | パス                                                                          |
| -------------------------- | ----------------------------------------------------------------------------- |
| trackEvent 実装            | `apps/desktop/src/renderer/utils/trackEvent.ts`                               |
| trackEvent E2E スタブ      | `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`                             |
| SkillCreateWizard 実装     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            |
| CompleteStep 実装          | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`          |
| SkillInfoStep 実装         | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         |
| ConversationRoundStep 実装 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| Vite E2E 設定              | `apps/desktop/vite.e2e.config.ts`                                             |
| CI ワークフロー            | `.github/workflows/ci.yml`                                                    |
| E2E ヘルパー（既存）       | `apps/desktop/e2e/helpers/electron-app.ts`                                    |
| E2E テスト例（既存）       | `apps/desktop/e2e/skill-permission.spec.ts`                                   |

---

## 統合テスト連携

本フェーズで策定したテストケース（TC-03、TC-05、TC-06、TC-08、TC-09、TC-11、TC-12）は Phase 3（設計レビュー）でのゲート判定に使用される。また、AC-9 の CI 組み込み要件は Phase 3 で実装計画として承認される必要がある。

---

## 成果物

```
outputs/phase-1/
  acceptance-criteria.md # AC-1〜AC-9 の詳細一覧
  requirements.md       # 本フェーズの要件定義サマリー（チェックリスト形式）
  test-case-list.md     # TC-03〜TC-12 のテストケース詳細一覧
  scope-boundary.md     # スコープ境界の確定文書
```

---

## 完了条件

- [ ] AC-1〜AC-9 がすべて文書化されている
- [ ] `outputs/phase-1/acceptance-criteria.md` が作成されている
- [ ] E2E テストケース（TC-03、TC-05、TC-06、TC-08、TC-09、TC-11、TC-12）が策定されている
- [ ] trackEvent スタブの注入方針が方針として確定している（実装は Phase 2）
- [ ] CI 組み込み要件が具体的に記述されている（実装は Phase 2）
- [ ] スコープ境界（含む/含まない）が明確に文書化されている
- [ ] 依存タスク（W3-seq-04）が完了済みであることが確認されている

---

## タスク 100% 実行確認【必須】

- [ ] タスク 1-1: 計装ポイント 5 つをすべてリストアップした
- [ ] タスク 1-2: TC-03、TC-05、TC-06、TC-08、TC-09、TC-11、TC-12 の 7 ケースを定義した
- [ ] タスク 1-3: trackEvent スタブの型要件と注入パターン方針を記述した
- [ ] タスク 1-4: CI `e2e-desktop` ジョブの改修要件を記述した
- [ ] タスク 1-5: スコープ境界（含む 4 ファイル / 含まない 4 項目）を確定した
- [ ] AC-1〜AC-9 をすべて個別に詳細化した

---

## 次 Phase

[Phase 2: 設計](./phase-2-design.md) - E2E テスト設計・trackEvent スタブ注入パターン設計・CI ジョブ改修設計
