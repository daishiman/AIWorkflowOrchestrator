# 実装ガイド: スキルウィザード trackEvent E2E UI 到達確認テスト

## Part 1: 初学者向け説明（中学生レベル）

### E2E テストとは？

E2E テストは「End-to-End テスト」の略で、実際にアプリを操作して動作を確認するテストです。
学校の授業に例えると、「先生が実際に黒板に書いた文字を生徒が読んで確認する」ようなものです。

### trackEvent とは？

trackEvent は、アプリが「ユーザーがこの操作をした！」と記録するしくみです。
遠足の出席確認で例えると：

> - **先生（E2E テスト）**: 「バスに乗った」「現地に着いた」「帰りのバスに乗った」という各チェックポイントで生徒の名前を呼ぶ
> - **出席票（trackEvent）**: 「このタイミングでこの生徒がここにいた」という記録
> - **仮の生徒カード（スタブ）**: テスト用に作った「架空の生徒情報」で本番の仕組みを壊さずにテストできる

### スタブ（stub）とは？

スタブとは、本番の仕組みを模倣してテスト専用に用意した「代役」です。
スキルウィザードのテストでは、本番の `trackEvent` の代わりに「記録専用のスタブ」を使います。

### UI 到達確認とは？

テストが「画面のここまで到達した」ことを確認することです。
今回のテストでは、「ウィザードのボタンをクリックすると、trackEvent が正しく呼ばれた」ことを確認します。

### CI パイプラインとは？

CI パイプラインは、コードが変更されたとき自動でテストを実行して、
問題があれば PR（プルリクエスト = コードの変更申請）をブロックするしくみです。

---

## Part 2: 技術者向け詳細説明

### 新規作成ファイル

| ファイル                                           | 内容                                                                                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | Playwright E2E テストファイル本体（TC-03/05/06/08/09/11/12）                                                                                                                                |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | `window.__trackEventCalls` capture ヘルパー + onboarding store mock（`initTrackingCapture` / `injectOnboardingStoreMock` / `getTrackedEvents` / `clearTrackedEvents` / `assertEventFired`） |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | Vite alias で差し替える renderer 側の trackEvent スタブ                                                                                                                                     |

### 変更ファイル

| ファイル                          | 変更内容                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`        | `e2e-desktop` ジョブを実際の Playwright 実行に改修（AC-9 対応）              |
| `apps/desktop/vite.e2e.config.ts` | `resolve.alias` に `trackEvent.ts → trackEvent.e2e-stub.ts` の差し替えを追加 |

### テストケース対応表

| TC番号 | AC番号 | 対象 trackEvent                                         |
| ------ | ------ | ------------------------------------------------------- |
| TC-03  | AC-1   | `skill_wizard_step1_completed`                          |
| TC-05  | AC-2   | `skill_skeleton_quality_feedback { satisfied: true }`   |
| TC-06  | AC-3   | `skill_skeleton_quality_feedback { satisfied: false }`  |
| TC-08  | AC-4   | `skill_wizard_next_action { action: "execute" }`        |
| TC-09  | AC-5   | `skill_wizard_next_action { action: "open_editor" }`    |
| TC-11  | AC-6   | `skill_wizard_next_action { action: "create_another" }` |
| TC-12  | AC-7   | UI 遷移確認（wizard-step-info 表示）                    |

### スタブ設計方針

- 本番型定義との型整合: `import type { SkillWizardEvents }` による type-only import で循環回避
- 配置先: `e2e/helpers/` ディレクトリ内にのみ（本番コード `src/` には混入しない）
- 差し替え: Vite の `resolve.alias` で `trackEvent.ts` を `trackEvent.e2e-stub.ts` に差し替え
- onboarding overlay の回避: `page.addInitScript` で `window.electronAPI.store.get` を注入し、`onboarding.hasCompleted` を `true` として扱う

### 実行コマンド

```bash
# E2E テスト（tracking スペックのみ）
pnpm --filter @repo/desktop exec playwright test e2e/skill-wizard-tracking.spec.ts --project=chromium

# 型チェック（AC-8 確認）
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# スタブ混入確認
grep -r "wizard-tracking-stub|trackEvent.e2e-stub" apps/desktop/src/
```

### CI 統合方針

`.github/workflows/ci.yml` の `e2e-desktop` ジョブ:

- Playwright Chromium のみインストール（最小限）
- `e2e/skill-wizard-tracking.spec.ts` を対象に実行
- 失敗時にレポートをアップロード
- `build` ジョブが `needs: [e2e-desktop, ...]` を持つため、失敗時に PR がブロックされる（AC-9 充足）

### Phase 11 証跡参照

本タスクは NON_VISUAL であり、UI コンポーネントの見た目変更はない。
そのため、Phase 11 の参照先は以下の通り整理する。

- `outputs/phase-11/manual-test-result.md`: NON_VISUAL 判定と代替証跡の記録
- `outputs/phase-11/manual-test-checklist.md`: 手動確認チェックリスト
- `outputs/phase-11/screenshots/`: 原則空。UI 変更がある場合のみ補助証跡を保存する
