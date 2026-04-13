# Phase 3: 設計レビュー

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| フェーズ番号 | 3                                                         |
| 作成日       | 2026-04-12                                                |
| 前フェーズ   | [Phase 2: 設計](./phase-2-design.md)                      |
| 次フェーズ   | Phase 4: 実装（`skill-wizard-tracking.spec.ts` 新規作成） |

---

## 目的

Phase 2 で策定した設計内容を多角的にレビューし、Phase 4（実装）への進行可否を判定する。

具体的には以下を検証する。

1. trackEvent スタブ注入パターン（Vite エイリアス方式）の技術的妥当性
2. `wizard-tracking-stub.ts` の型整合性（AC-8）
3. ウィザードマルチステップフロー再現ヘルパーの実現可能性
4. CI `e2e-desktop` ジョブ改修設計の安全性（既存ジョブへの影響）
5. セレクター設計の完全性（未確認事項の解消状況）
6. Phase 4 進行可否のゲート判定

---

## 実行タスク

### タスク 3-1: スタブ注入パターンの技術的妥当性レビュー

#### 検証項目

**V-1: Vite エイリアス方式でモジュール差し替えが成立するか**

- `vite.e2e.config.ts` に `resolve.alias` を追加することで、`SkillCreateWizard.tsx` が `import { trackEvent } from "../../utils/trackEvent"` とした際に `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` に解決されることを確認する
- alias は `path.resolve(__dirname, "src/renderer/utils/trackEvent.ts")` を左辺にした絶対パス指定とする

**判定基準**: 相対パスではなく絶対パスに正規化した alias を使うことで、`trackEvent.ts` の import 置換を安定させる。

**推奨修正**: `vite.e2e.config.ts` の alias 設定を以下に変更する。

```typescript
resolve: {
  alias: {
    // trackEvent モジュールの絶対パスでエイリアスを設定
    [path.resolve(__dirname, "src/renderer/utils/trackEvent.ts")]:
      path.resolve(__dirname, "e2e/helpers/trackEvent.e2e-stub.ts"),
  },
},
```

**V-2: `trackEvent.e2e-stub.ts` の `window.__trackEventCalls` がテスト実行中に参照可能か**

- `page.evaluate(() => window.__trackEventCalls)` でスタブが記録した配列を取得できることを確認する
- SSR/サーバーサイド実行ではなくブラウザコンテキストで動作することを確認する（Vite dev サーバーで Renderer のみ起動するため問題なし）

**V-3: `page.addInitScript` との組み合わせが必要か**

- `page.addInitScript(() => { window.__trackEventCalls = []; })` を必須として、初回描画前に capture 配列を初期化する
- 追加の window monkey patch は行わない

---

### タスク 3-2: 型整合性レビュー（AC-8）

#### 検証項目

**V-4: `trackEvent.e2e-stub.ts` が `SkillWizardEvents` を型パラメータとして使用しているか**

```typescript
// 正しいパターン
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void { ... }

// NG パターン（型安全性がない）
export function trackEvent(eventName: string, payload: unknown): void { ... }
```

`SkillWizardEvents` は `trackEvent.ts` から `import type` で参照する。`import type` は実行時に消えるため、Vite alias と衝突しない。

```typescript
// trackEvent.e2e-stub.ts での型インポート
import type { SkillWizardEvents } from "./trackEvent"; // type import のみ → 循環しない
```

**V-5: `wizard-tracking-stub.ts` の `TrackEventEntry` 型が `SkillWizardEvents` と整合しているか**

- `assertEventFired` の第 2 引数 `payload` が `SkillWizardEvents[K]` の `Partial` として型付けられているか
- `getTrackedEvents` の戻り値型が `TrackEventEntry[]` として正しく型付けられているか

---

### タスク 3-3: ヘルパー関数の実現可能性レビュー

#### 検証項目

**V-6: `navigateToCompleteStep` の前提条件が満たせるか**

Phase 2 で「未確認事項」として挙げた以下の項目を確認する。

| 未確認事項                                                     | 確認方法                                                                                           | 解決策                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| スキルセンターページへの遷移方法                               | `page.goto` で直接 URL 指定（`/skills/new` 等）または既存 E2E テストのナビゲーションパターンを参照 | Phase 4 実装時に `page.goto` で適切な URL を確認する |
| 「新しいスキルを作成」ボタンのセレクター                       | 実際のレンダリングを確認（`data-testid` または `aria-label` を使用）                               | Phase 4 実装時に DOM 確認                            |
| ConversationRoundStep の「スキップして生成」ボタンのセレクター | `ConversationRoundStep.tsx` を確認                                                                 | Phase 4 実装時に `ConversationRoundStep.tsx` を読む  |

**判定**: 未確認事項はあるが、実装時に確認可能なレベルであり Phase 4 の進行を妨げない。Phase 4 で実装を開始する際にこれらを最初に確認することを必須とする。

**V-7: Step 2（GenerateStep）の完了待機が安定するか**

`trackEvent.e2e-stub.ts` は同期で `window.__trackEventCalls` に記録するため、追加の API モックは不要である。`waitForCompleteStep` は `data-testid="wizard-step-complete"` の可視化のみを待機し、イベント捕捉は `window.__trackEventCalls` の確認に限定する。

---

### タスク 3-4: CI 設計の安全性レビュー

#### 検証項目

**V-8: 既存 CI ジョブへの影響がないか**

- 現在の `e2e-desktop` ジョブは `echo` のみ実行しており、`build` ジョブの `needs` に含まれている
- 改修後は実際に Playwright を実行するため、テスト失敗時に `build` ジョブがブロックされる（AC-9 の要件通り）
- 既存の `lint`・`typecheck`・`test-desktop` ジョブには影響しない

**V-9: Ubuntu CI 環境で Playwright が動作するか**

- `playwright install --with-deps chromium` で Chromium の依存ライブラリが正しくインストールされるか
- `xvfb-run` なしでヘッドレス Chromium が動作するか（`--headless` が Playwright のデフォルト設定であるため問題なし）
- Vite dev サーバーの起動は `apps/desktop/vite.e2e.config.ts` の `webServer` 設定で担保されるか

**V-10: `timeout-minutes: 15` が十分か**

- Playwright ブラウザインストール: 約 2〜3 分
- Vite dev サーバー起動 + テスト実行（7 ケース）: 約 3〜5 分
- 合計約 8 分 → `timeout-minutes: 15` は十分

---

### タスク 3-5: セレクター設計の完全性レビュー

Phase 2 タスク 2-6 で「確認済み」とした 10 個のセレクターについて、ファイルパスと行番号レベルで再確認する。

| セレクター                                            | ソースファイル          | 行番号（概算） | 状態     |
| ----------------------------------------------------- | ----------------------- | -------------- | -------- |
| `[data-testid="skill-create-wizard"]`                 | `SkillCreateWizard.tsx` | L859           | 確認済み |
| `[data-testid="wizard-step-info"]`                    | `SkillCreateWizard.tsx` | L871           | 確認済み |
| `[data-testid="wizard-step-conversation-round"]`      | `SkillCreateWizard.tsx` | L943           | 確認済み |
| `[data-testid="wizard-step-generate"]`                | `SkillCreateWizard.tsx` | L957           | 確認済み |
| `[data-testid="wizard-step-complete"]`                | `SkillCreateWizard.tsx` | L993           | 確認済み |
| `[data-testid="complete-step-feedback-satisfied"]`    | `CompleteStep.tsx`      | L147           | 確認済み |
| `[data-testid="complete-step-feedback-unsatisfied"]`  | `CompleteStep.tsx`      | L155           | 確認済み |
| `[data-testid="complete-step-action-execute"]`        | `CompleteStep.tsx`      | L89            | 確認済み |
| `[data-testid="complete-step-action-open-editor"]`    | `CompleteStep.tsx`      | L96            | 確認済み |
| `[data-testid="complete-step-action-create-another"]` | `CompleteStep.tsx`      | L103           | 確認済み |

**判定**: 10 個すべて確認済み。未確認事項（ウィザード起動 UI、スキップボタン）は Phase 4 実装時の最初のタスクとして確認を義務付ける。

---

### タスク 3-6: Phase 4 進行可否ゲート判定

#### ゲート判定チェックリスト

以下の全項目が「承認」状態になることで Phase 4 への進行を許可する。

| 判定項目                              | 判定基準                                                                                             | 状態                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| G-1: スタブ注入パターンの技術的妥当性 | Vite エイリアス方式が機能すること（絶対パス指定の修正案あり）                                        | 承認（修正案適用条件付き）                         |
| G-2: 型整合性（AC-8）                 | `import type` による循環回避が機能すること                                                           | 承認                                               |
| G-3: ヘルパー関数の実現可能性         | 未確認事項が Phase 4 初日に解消可能なレベルであること                                                | 承認（Phase 4 最初のタスクとして確認義務）         |
| G-4: CI 設計の安全性                  | 既存ジョブへの悪影響がないこと                                                                       | 承認                                               |
| G-5: セレクター設計の完全性           | テストケース実行に必要な全セレクターが確認済みであること                                             | 条件付き承認（未確認 2 項目を Phase 4 初日に確認） |
| G-6: スコープ逸脱がないこと           | `trackEvent.ts` / `SkillCreateWizard.tsx` を変更せず、test-only files を `e2e/helpers/` に閉じること | 承認                                               |

#### 総合判定

**Phase 4 進行: 承認**

条件付き承認事項:

1. **G-1 修正適用**: `vite.e2e.config.ts` の alias 設定を `path.resolve` 絶対パス指定に変更する
2. **G-3・G-5 Phase 4 初日確認**: ウィザード起動 UI のセレクター・ConversationRoundStep スキップボタンを Phase 4 実装開始前に確認する

---

## 参照資料

| 資料                                | パス                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Phase 1: 要件定義                   | `docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-1-requirements.md`                          |
| Phase 2: 設計                       | `docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-2-design.md`                                |
| trackEvent 実装                     | `apps/desktop/src/renderer/utils/trackEvent.ts`                                                             |
| SkillCreateWizard 実装              | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                          |
| CompleteStep 実装                   | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                                        |
| Vite E2E 設定                       | `apps/desktop/vite.e2e.config.ts`                                                                           |
| Vite E2E 設定                       | `apps/desktop/vite.e2e.config.ts`                                                                           |
| CI ワークフロー                     | `.github/workflows/ci.yml`                                                                                  |
| Vite resolve.alias ドキュメント     | https://vitejs.dev/config/shared-options.html#resolve-alias                                                 |
| TypeScript import type ドキュメント | https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export |

---

## 統合テスト連携

本フェーズのゲート判定（G-1〜G-6）がすべて承認されることで Phase 4 実装に移行する。特に G-2（型整合性 AC-8）の承認は、Phase 4 で作成する `trackEvent.e2e-stub.ts` が TypeScript の型チェックをパスすることの根拠となる。

---

## 成果物

```
outputs/phase-3/
  review-checklist.md     # G-1〜G-6 ゲート判定チェックリスト（レビュー結果記入済み）
  design-issues.md        # 設計上の問題点と解決策一覧
  phase4-prerequisites.md # Phase 4 実装開始前に解消すべき前提条件一覧
```

---

## 完了条件

- [ ] V-1〜V-10 の検証項目がすべて評価されている
- [ ] G-1〜G-6 のゲート判定がすべて「承認」または「条件付き承認」になっている
- [ ] 条件付き承認の条件が具体的に記述されている
- [ ] Phase 4 実装開始前に解消すべき前提条件が明示されている
- [ ] 総合判定（承認/否認）が明示されている

---

## タスク 100% 実行確認【必須】

- [ ] タスク 3-1: V-1（Vite エイリアス方式の技術的妥当性）・V-2（window 参照可能性）・V-3（addInitScript 必要性）を評価した
- [ ] タスク 3-2: V-4（型パラメータの使用）・V-5（TrackEventEntry 型整合）を評価した
- [ ] タスク 3-3: V-6（未確認事項の解決策）・V-7（GenerateStep 完了待機安定性）を評価した
- [ ] タスク 3-4: V-8（既存ジョブへの影響）・V-9（Ubuntu 環境での動作）・V-10（タイムアウト充足）を評価した
- [ ] タスク 3-5: 10 個のセレクターの完全性を再確認した
- [ ] タスク 3-6: G-1〜G-6 のゲート判定を実施し、総合判定を「Phase 4 進行: 承認（条件付き）」として記録した

---

## 次 Phase

Phase 4: 実装

- `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` 新規作成
- `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` 新規作成
- `apps/desktop/vite.e2e.config.ts` の alias 設定追加（G-1 修正適用）
- `apps/desktop/e2e/skill-wizard-tracking.spec.ts` 新規作成（TC-03、TC-05、TC-06、TC-08、TC-09、TC-11、TC-12）
- `.github/workflows/ci.yml` の `e2e-desktop` ジョブ改修
- Phase 4 実装開始前に未確認セレクター 2 項目を確認する（G-3・G-5 条件）
