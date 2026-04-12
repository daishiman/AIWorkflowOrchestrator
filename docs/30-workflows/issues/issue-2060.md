# [#2060] "[UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001] スキルウィザード trackEvent の E2E UI 到達確認テスト追加"

## メタ情報

```yaml
task_id: UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
task_name: スキルウィザード trackEvent の E2E UI 到達確認テスト追加
category: テスト
target_feature: スキル作成ウィザード - 使用率トラッキング E2E 検証
priority: 中
scale: 中規模
status: 未実施
source_phase: W3-seq-04（usage tracking）Phase 12 unassigned-task-detection.md の将来潜在タスク
created_date: 2026-04-08
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

W3-seq-04 ではスキル作成ウィザードへの `trackEvent` 計装を実装し、Phase 11 の手動テスト証跡は
**NON_VISUAL** として Vitest のカバレッジレポートと mock 呼び出し確認（console 出力）で代替した。

この NON_VISUAL 証跡はユニットテストレベルでの「モック関数が呼ばれたか」を確認するに留まり、
実際のブラウザ/Electron ウィンドウ上で UI 操作が完了し `trackEvent` が発火するかどうかは
**検証されていない**。

TC-03/TC-05/TC-06/TC-08/TC-09/TC-11/TC-12 は、現時点で UI 到達確認（実際のレンダリング・
ボタン操作・ステップ遷移）を E2E レベルでは保証していない。

### 1.2 問題点・課題

- ユニットテストは `@testing-library/react` の JSDOM 環境で動作しており、実際の Electron
  Renderer プロセスとは異なる
- `trackEvent` が Electron の IPC や OS API に依存している場合、JSDOM 環境での mock では
  本番コードパスを十分に網羅できない
- マルチステップウィザードの UI フロー（InfoStep → ConversationRoundStep → CompleteStep）を
  実際のブラウザで操作したときの動作は E2E でしか確認できない
- CI でリグレッションを検出するための E2E テストが存在しない

### 1.3 NON_VISUAL 証跡の限界

W3-seq-04 の Phase 11 では以下の代替証跡を使用した。

| 代替証跡                          | 限界                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| Vitest カバレッジレポート（100%） | JSDOM 環境での行カバレッジであり、実 UI 操作パスを保証しない        |
| mock 呼び出しログ（verbose）      | `vi.spyOn` による mock 確認のため、実際の `trackEvent` 実行ではない |
| console intercept                 | DOM 変化がないイベント（NON_VISUAL）のため視覚証跡が取得できない    |

これらは Phase 7 のカバレッジ要件（90%+）は満たすが、E2E レベルでの UI 到達保証にはならない。

### 1.4 放置した場合の影響

- 将来の UI 変更や Electron バージョンアップ時に `trackEvent` の発火が壊れてもリグレッションを
  検出できない
- NON_VISUAL 証跡に依存した品質保証が常態化し、E2E テストの空白領域が拡大する
- `trackEvent` スタブが本番コードに混入したまま CI で検証されないリスクが残る

---

## 2. 何を達成するか（What）

### 2.1 目的

Playwright E2E テストを追加し、実際の Electron Renderer（または Chromium ベースブラウザ）で
スキル作成ウィザードを操作したときに `trackEvent` が期待どおり発火することを確認する。

### 2.2 受入条件（AC）

| AC   | 内容                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | E2E テストで InfoStep を完了してウィザードが ConversationRoundStep に遷移することを確認できる（TC-03 相当）                         |
| AC-2 | E2E テストで CompleteStep の「👍（satisfied）」ボタン操作後に `skill_skeleton_quality_feedback` が発火する（TC-05 相当）            |
| AC-3 | E2E テストで CompleteStep の「👎（unsatisfied）」ボタン操作後に `skill_skeleton_quality_feedback` が発火する（TC-06 相当）          |
| AC-4 | E2E テストで `complete-step-action-execute` クリック後に `skill_wizard_next_action(execute)` が発火する（TC-08 相当）               |
| AC-5 | E2E テストで `complete-step-action-open-editor` クリック後に `skill_wizard_next_action(open_editor)` が発火する（TC-09 相当）       |
| AC-6 | E2E テストで `complete-step-action-create-another` クリック後に `skill_wizard_next_action(create_another)` が発火する（TC-11 相当） |
| AC-7 | E2E テストで「もう一度作成」後にウィザードが InfoStep に戻ることを確認できる（TC-12 相当）                                          |
| AC-8 | `trackEvent` の E2E スタブが本番の `trackEvent.ts` と型整合していること                                                             |
| AC-9 | CI パイプラインで E2E テストが自動実行され、失敗時に PR がブロックされること                                                        |

### 2.3 スコープ

含むもの:

- Playwright E2E テストファイルの新規追加（`apps/desktop/e2e/` 配下）
- Electron Renderer への `trackEvent` スタブ設定（`page.evaluate` / `window` expose パターン）
- ウィザードのマルチステップフロー再現用ヘルパー関数
- CI ワークフローへの E2E テスト実行ステップ追加

含まないもの:

- `trackEvent.ts` 本体の変更
- `SkillCreateWizard.tsx` の変更
- 既存ユニットテストの変更
- 外部アナリティクスサービスへの実送信

### 2.4 対象テストケース（NON_VISUAL から E2E へ昇格）

| テストケース | 内容                                                         | 発火イベント                      |
| ------------ | ------------------------------------------------------------ | --------------------------------- |
| TC-03 相当   | skip 方式で `skill_wizard_step1_completed` が発火する        | `skill_wizard_step1_completed`    |
| TC-05 相当   | 👍 押下で `skill_skeleton_quality_feedback(satisfied=true)`  | `skill_skeleton_quality_feedback` |
| TC-06 相当   | 👎 押下で `skill_skeleton_quality_feedback(satisfied=false)` | `skill_skeleton_quality_feedback` |
| TC-08 相当   | execute 押下で `skill_wizard_next_action(execute)`           | `skill_wizard_next_action`        |
| TC-09 相当   | open_editor 押下で `skill_wizard_next_action(open_editor)`   | `skill_wizard_next_action`        |
| TC-11 相当   | open_editor 押下後にウィザードが閉じる                       | （UI 状態確認）                   |
| TC-12 相当   | create_another 押下でウィザードが InfoStep に戻る            | `skill_wizard_next_action`        |

### 2.5 成果物

| 種別 | ファイルパス                                                                    |
| ---- | ------------------------------------------------------------------------------- |
| 新規 | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`                                |
| 新規 | `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`（trackEvent スタブヘルパー） |
| 修正 | `.github/workflows/ci.yml`（E2E テスト実行ステップ追加）                        |
| 修正 | `apps/desktop/playwright.config.ts`（必要に応じて設定追加）                     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **ブロッカー**: W3-seq-04（`SkillCreateWizard.tsx` の計装実装）が完了していること
- Playwright が `apps/desktop` に設定済みであること（`playwright.config.ts` が存在すること）
- Electron E2E テスト環境が構築済みであること（`pnpm --filter @repo/desktop test:e2e` が実行可能）

### 3.2 依存タスク

| タスク ID | 状態 | 内容                                           |
| --------- | ---- | ---------------------------------------------- |
| W3-seq-04 | 前提 | `SkillCreateWizard.tsx` の trackEvent 計装実装 |

依存グラフ:

```
W3-seq-04（完了済み）→ UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001（本タスク）
```

### 3.3 推奨アプローチ

1. 既存 E2E テストのパターン（`apps/desktop/e2e/` 配下）を調査し、Electron Renderer への
   `page.evaluate` / `window` expose パターンを把握する
2. `trackEvent` を E2E 環境でスタブ化するヘルパーを `wizard-tracking-stub.ts` として作成する
   - `page.exposeFunction` を用いて `window.__trackEvent` をスタブとして注入
   - または `page.evaluate` で `trackEvent` モジュールの参照を差し替える
3. ウィザードのマルチステップフロー（InfoStep → ConversationRoundStep → CompleteStep）を
   再現するテストヘルパー関数を作成する
4. TC-03/TC-05/TC-06/TC-08/TC-09/TC-11/TC-12 に対応する E2E テストケースを実装する
5. NON_VISUAL イベント（DOM 変化なし）の証跡取得には console intercept または IPC mock を使用する
6. CI ワークフローに E2E テスト実行ステップを追加し、PR ブロック条件として設定する

---

## 4. 実行手順（Phase 1-13 の概要）

| Phase | 名称             | 主な作業（要点）                                                                                                                                                                                   |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義         | 既存 E2E テスト環境調査（`apps/desktop/e2e/` 構成確認）、Playwright + Electron 統合パターン確認、AC-1〜AC-9 固定                                                                                   |
| 2     | 設計             | `trackEvent` E2E スタブ注入パターン設計、ウィザードフロー再現ヘルパー設計、NON_VISUAL イベント証跡取得方法設計                                                                                     |
| 3     | 設計レビュー     | 既存 E2E テストとのパターン整合性確認、スタブ注入方式の Electron Renderer との互換性検証、Phase 4 進行可否判定                                                                                     |
| 4     | テスト作成       | TDD Red: TC-03/05/06/08/09/11/12 相当の E2E テストケース作成（全件失敗状態）                                                                                                                       |
| 5     | 実装             | `wizard-tracking-stub.ts` ヘルパー実装、E2E セットアップ（`beforeEach` でスタブ注入）、各テストケースのフロー再現実装                                                                              |
| 6     | テスト拡充       | エッジケース追加（ネットワークエラー時・生成失敗時のイベント未発火確認）、ウィザード途中離脱時の `skill_wizard_abandon` E2E 確認                                                                   |
| 7     | カバレッジ確認   | E2E テストの全 AC 充足確認、Playwright のトレースレポートで各テストケースのスクリーンショット取得                                                                                                  |
| 8     | リファクタリング | テストヘルパー関数の重複除去、`wizard-tracking-stub.ts` の型安全性向上、命名揺れ修正                                                                                                               |
| 9     | 品質保証         | `pnpm --filter @repo/desktop test:e2e` の全通過確認、既存 E2E テストへの影響がないこと確認                                                                                                         |
| 10    | 最終レビュー     | AC-1〜AC-9 の充足確認、スタブが本番コードに混入していないことの確認                                                                                                                                |
| 11    | 手動テスト       | Electron アプリを実際に起動し、ウィザード操作時のイベント発火を DevTools コンソールで目視確認。Playwright トレース・スクリーンショットを証跡として取得                                             |
| 12    | ドキュメント更新 | `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` |
| 13    | PR 作成          | ユーザー明示承認後のみ実施（blocked 維持）                                                                                                                                                         |

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: TC-03 相当の E2E テスト（skip 方式での step1_completed 発火確認）が PASS
- [ ] AC-2: TC-05 相当の E2E テスト（👍 → quality_feedback(satisfied=true) 発火確認）が PASS
- [ ] AC-3: TC-06 相当の E2E テスト（👎 → quality_feedback(satisfied=false) 発火確認）が PASS
- [ ] AC-4: TC-08 相当の E2E テスト（execute → next_action(execute) 発火確認）が PASS
- [ ] AC-5: TC-09 相当の E2E テスト（open_editor → next_action(open_editor) 発火確認）が PASS
- [ ] AC-6: TC-11 相当の E2E テスト（open_editor 後ウィザード閉鎖確認）が PASS
- [ ] AC-7: TC-12 相当の E2E テスト（create_another → InfoStep 戻り確認）が PASS
- [ ] AC-8: `trackEvent` E2E スタブが本番型定義（`SkillWizardEvents`）と型整合していること
- [ ] AC-9: CI ワークフローに E2E テスト実行ステップが追加され PR ブロック条件として機能すること

### テスト品質要件

- [ ] E2E テストが Playwright のトレース（スクリーンショット + タイムライン）を生成すること
- [ ] 既存 E2E テスト（`apps/desktop/e2e/` 配下）がリグレッションしないこと
- [ ] `wizard-tracking-stub.ts` のスタブ注入が本番コードに影響しないこと

### 品質要件

- [ ] `pnpm --filter @repo/desktop test:e2e` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0 件でも必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 6. 検証方法

### E2E テスト実行

```bash
# 全 E2E テスト実行（ヘッドレス）
pnpm --filter @repo/desktop test:e2e

# 特定テストファイルのみ実行
pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts

# デバッグ実行（ブラウザを開いて操作を確認）
pnpm --filter @repo/desktop test:e2e -- --headed e2e/skill-wizard-tracking.spec.ts

# Playwright トレース付き実行（失敗時に trace.zip を出力）
pnpm --filter @repo/desktop test:e2e -- --trace on
```

### NON_VISUAL イベントの証跡取得

```bash
# console intercept でイベント発火を確認する場合
# playwright.config.ts の use.trace オプションを 'on' に設定し
# テスト内で page.on('console', ...) で trackEvent 呼び出しをキャプチャする

# IPC mock パターン（Electron Main プロセスの IPC をインターセプト）
# apps/desktop/e2e/helpers/wizard-tracking-stub.ts に実装する
```

### スタブ注入パターン例

```typescript
// wizard-tracking-stub.ts（実装ガイド）
// page.exposeFunction を使用して window.trackEvent をスタブ化
await page.exposeFunction(
  "__trackEventStub",
  (eventName: string, payload: unknown) => {
    capturedEvents.push({ eventName, payload });
  },
);

// page.evaluate でモジュールの trackEvent 参照を差し替え
await page.evaluate(() => {
  (window as unknown as Record<string, unknown>).__trackEventCalls = [];
});
```

---

## 7. リスクと対策

| リスク                                                             | 影響度 | 発生確率 | 対策                                                                                                                          |
| ------------------------------------------------------------------ | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Playwright と Electron Renderer の統合が複雑で設定コストが高い     | 高     | 高       | Phase 1 で既存 E2E テストの設定（`playwright.config.ts`）を調査し、Electron 向けパターンを流用する                            |
| `page.evaluate` による `trackEvent` モジュール差し替えが動作しない | 高     | 中       | `window` への expose パターン（`page.exposeFunction`）を代替として試す。Electron preload スクリプトから注入する方法も検討する |
| NON_VISUAL イベントの E2E 証跡取得方法が未確立                     | 中     | 高       | `page.on('console', ...)` で console intercept する。IPC mock が必要な場合は Electron Main 側のモックを検討する               |
| ウィザードのマルチステップフローを E2E で再現するコストが高い      | 中     | 中       | 既存の Vitest テストの `advanceToStep1()` / `generateWith()` パターンを参考に E2E ヘルパーを設計する                          |
| trackEvent スタブが本番ビルドに混入する                            | 高     | 低       | スタブ注入は E2E テストの `beforeEach` 内でのみ行い、`test.only` や `teardown` で確実にクリーンアップする                     |
| CI での E2E テスト実行時間が長くなる                               | 中     | 中       | ウィザードトラッキング E2E は別ジョブとして分離し、メイン CI とは並列実行にする                                               |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                       | パス                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| W3-seq-04 未タスク検出レポート（本タスクの発見元） | `docs/30-workflows/W3-seq-04-usage-tracking/outputs/phase-12/unassigned-task-detection.md` |
| W3-seq-04 タスク仕様書（実装済み）                 | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001.md`               |
| E2E テスト拡張タスク                               | `docs/30-workflows/unassigned-task/task-e2e-test-expansion.md`                             |
| E2E Playwright 導入タスク                          | `docs/30-workflows/unassigned-task/task-imp-settings-e2e-playwright-introduction-001.md`   |
| task-specification-creator スキル                  | `.claude/skills/task-specification-creator/SKILL.md`                                       |

### 関連ソースコード

| 対象                         | パス                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| 既存 tracking ユニットテスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx` |
| trackEvent 実装              | `apps/desktop/src/renderer/utils/trackEvent.ts`                                            |
| SkillCreateWizard 実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                         |
| E2E テストディレクトリ       | `apps/desktop/e2e/`                                                                        |
| Playwright 設定ファイル      | `apps/desktop/playwright.config.ts`                                                        |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                        | 原因・背景                                                                                                                                                             | 推奨アプローチ                                                                                                                                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playwright E2E での Electron Renderer trackEvent スタブ設定     | Electron Renderer プロセスは Chromium ベースだが、通常の Web ページとは異なり preload スクリプト経由での API 注入が必要。`page.evaluate` の実行タイミングに注意が必要  | `page.exposeFunction` を使用して `window.__trackEvent` を登録し、テスト前に preload スクリプトで差し替える。または `contextBridge.exposeInMainWorld` パターンを参照する      |
| NON_VISUAL イベントの E2E 証跡取得（DOM 変化なし）              | `trackEvent` は DOM を変更しない NON_VISUAL イベントのため、Playwright の `waitForSelector` 等の DOM ベース待機が使用できない                                          | `page.on('console', msg => ...)` で console 出力をキャプチャするか、`page.exposeFunction` で発火時に外部（Node.js 側）にコールバックを返す IPC mock を設計する               |
| ウィザードのマルチステップフロー E2E 再現セットアップコスト     | ウィザードは InfoStep → ConversationRoundStep → CompleteStep の 3 ステップを経る。E2E では各ステップの入力・ボタン操作を順次実行する必要があり、フロー全体の再現が複雑 | 既存 Vitest テストの `advanceToStep1()` / `generateWith()` ヘルパーを参考に、Playwright 版の `advanceWizardToCompleteStep()` ヘルパーを `wizard-tracking-stub.ts` に実装する |
| trackEvent スタブが本番コードに混在しないよう CI で検証する方法 | E2E テスト実行時に注入したスタブが本番ビルドに残留していないか、CI では確認が困難                                                                                      | E2E テストの `afterEach` / `afterAll` でスタブの除去を確認する。また `pnpm build` 後のバンドルに `__trackEventStub` が含まれていないことをビルドスクリプトで検証する         |

### W3-seq-04 の NON_VISUAL 証跡との対応関係

本タスクは W3-seq-04 Phase 11 で「console 証跡で代替」とされた以下のテストケースを
E2E レベルに昇格させることを目的とする。

| W3-seq-04 の TC ID | NON_VISUAL 代替理由                                       | 本タスクの E2E 昇格 AC |
| ------------------ | --------------------------------------------------------- | ---------------------- |
| TC-03              | skip 時の `skippedAtQuestion` 計算は JSDOM で検証済み     | AC-1                   |
| TC-05              | 👍 クリックは JSDOM でシミュレート済み                    | AC-2                   |
| TC-06              | 👎 クリックは JSDOM でシミュレート済み                    | AC-3                   |
| TC-08              | execute クリックは JSDOM でシミュレート済み               | AC-4                   |
| TC-09              | open_editor クリックは JSDOM でシミュレート済み           | AC-5                   |
| TC-11              | open_editor 後の onClose は JSDOM で mock で確認済み      | AC-6                   |
| TC-12              | create_another 後の InfoStep 戻りは JSDOM で DOM 確認済み | AC-7                   |

### 実行時の注意事項

- Phase 13（PR 作成）はユーザーの明示的な承認があるまで blocked 状態を維持する
- コミット・push は禁止（承認後のみ）
- E2E スタブ注入コードは `apps/desktop/e2e/` 配下にのみ配置し、`src/` 配下には含めない
- Playwright の `test.use({ viewport: null })` 等 Electron 向けオプションを適切に設定すること
