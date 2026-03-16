# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                  |
| Phase名    | 手動テスト                                                                                                                                                                          |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                                                                                                  |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント）                                                                                                                                                            |
| ステータス | completed                                                                                                                                                                           |
| 作成日     | 2026-03-13                                                                                                                                                                          |
| 更新日     | 2026-03-16                                                                                                                                                                          |
| 機能名     | skill-docs-runtime-integration                                                                                                                                                      |

## 目的

Skill Docs 生成の AI runtime 統合について、5つの代表シナリオ（成功・API key 未設定・timeout・rate limit・terminal handoff）を手動で確認し、UI 状態遷移とエラーガイダンスが仕様どおりに動作することを検証する。

## 実行タスク

- T-11-1: docs 生成成功シナリオを手動で検証する
- T-11-2: API key 未設定から ready へ復帰する導線を手動で検証する
- T-11-3: timeout 時の guidance と handoff 導線を手動で検証する
- T-11-4: rate limit 時の待機と再試行導線を手動で検証する
- T-11-5: terminal handoff card の操作導線を手動で検証する

| タスクID | タスク名                  | 内容                                                                                               |
| -------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| T-11-1   | docs 生成成功シナリオ     | API key 有効状態で generate を実行し、result 表示を確認する                                        |
| T-11-2   | API key 未設定シナリオ    | guidance-only 状態から Settings 導線経由で API key を登録し、ready 状態への遷移を確認する          |
| T-11-3   | timeout シナリオ          | 30秒超過時に timeout-guidance 状態へ遷移し、再試行または terminal handoff が機能することを確認する |
| T-11-4   | rate limit シナリオ       | 429 レスポンス時に rate-limit-wait 状態へ遷移し、自動再試行後の成功/失敗を確認する                 |
| T-11-5   | terminal handoff シナリオ | handoff card 表示、copy context ボタン、terminal 起動の一連フローを確認する                        |

## テストケース

| テストケース | 目的                | 前提条件                                    | 操作手順                                                                                                                   | 期待結果                                                                                                                        |
| ------------ | ------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| TC-11-01     | docs 生成の成功系   | 有効な API key が設定済み                   | 1. Skill Docs 画面を開く 2. 対象スキルを選択 3. Generate ボタンをクリック                                                  | UI 状態: ready -> generating -> result。生成されたドキュメントが画面に表示される。LLMDocQueryAdapter 経由の接続が正常           |
| TC-11-02     | API key 未設定      | API key が未登録                            | 1. Skill Docs 画面を開く 2. guidance-only 状態を確認 3. Settings 導線をクリック 4. API key を登録 5. Skill Docs 画面に戻る | UI 状態: guidance-only -> (Settings) -> ready。CapabilityResolver が guidance-only から integrated-api に遷移する               |
| TC-11-03     | timeout（30秒超過） | 有効な API key が設定済み、LLM が応答遅延   | 1. Skill Docs 画面を開く 2. Generate をクリック 3. 30秒待機                                                                | UI 状態: generating -> timeout-guidance。再試行ボタンと terminal handoff リンクが表示される                                     |
| TC-11-04     | rate limit（429）   | 有効な API key が設定済み、LLM が 429 返却  | 1. Skill Docs 画面を開く 2. Generate をクリック                                                                            | UI 状態: generating -> rate-limit-wait -> (自動再試行) -> result or error-guidance。DocOperationResult の retryable=true が機能 |
| TC-11-05     | terminal handoff    | timeout-guidance または error-guidance 状態 | 1. handoff card を確認 2. copy context ボタンをクリック 3. terminal 起動リンクをクリック                                   | コンテキストがクリップボードにコピーされる。terminal が起動する。handoff card にプロンプト情報が含まれる                        |

## 画面カバレッジマトリクス

| テストケース | 対象画面   | UI 状態                       | 検証対象コンポーネント                    | 証跡計画                                 |
| ------------ | ---------- | ----------------------------- | ----------------------------------------- | ---------------------------------------- |
| TC-11-01     | Skill Docs | ready -> generating -> result | DocGenerator, ResultView                  | TC-11-01-skill-docs-success.png          |
| TC-11-02     | Skill Docs | guidance-only -> ready        | GuidanceCard, SettingsLink, DocGenerator  | TC-11-02-skill-docs-guidance-only.png    |
| TC-11-03     | Skill Docs | timeout-guidance              | TimeoutGuidance, RetryButton, HandoffLink | TC-11-03-skill-docs-timeout.png          |
| TC-11-04     | Skill Docs | rate-limit-wait               | RateLimitWait, AutoRetryIndicator         | TC-11-04-skill-docs-rate-limit.png       |
| TC-11-05     | Skill Docs | terminal handoff              | HandoffCard, CopyContextButton            | TC-11-05-skill-docs-terminal-handoff.png |

## スクリーンショット取得方法（P53 対策）

現在の再監査では、次の capture スクリプトで fallback review board 方式の証跡を生成する。

```bash
node apps/desktop/scripts/capture-skill-docs-runtime-integration-phase11.mjs
```

補助手段として、以下の方式も利用できる。

### 方法1: Playwright（推奨）

```typescript
// playwright-screenshot.ts
import { _electron as electron } from "playwright";

const app = await electron.launch({ args: ["apps/desktop/dist/main.js"] });
const window = await app.firstWindow();
await window.screenshot({ path: "TC-11-01-skill-docs-success.png" });
await app.close();
```

### 方法2: Electron webContents.capturePage()

```typescript
// Main Process 側
const image = await mainWindow.webContents.capturePage();
fs.writeFileSync("screenshot.png", image.toPNG());
```

### 方法3: 自動テスト結果による間接検証

Vitest テスト結果を「間接的な視覚検証」として記録し、状態遷移の正しさを証明する。

## 参照資料

| 参照資料                    | パス                                                                                                              | 内容                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                                                         | 要件と受入基準を確認する                     |
| Phase 2（設計）             | `phase-2-design.md`                                                                                               | LLMDocQueryAdapter / DocOperationResult 設計 |
| Phase 5（実装）             | `phase-5-implementation.md`                                                                                       | 実装コードと IPC ハンドラを確認する          |
| Phase 6（テスト拡充）       | `outputs/phase-6/regression-plan.md`                                                                              | 失敗パス・回帰テストの観点を確認する         |
| Phase 7（カバレッジ確認）   | `outputs/phase-7/coverage-plan.md`                                                                                | coverage gap と優先補完対象を確認する        |
| Phase 8（リファクタリング） | `outputs/phase-8/refactor-plan.md`                                                                                | 責務分離後の設計差分を確認する               |
| Phase 9（品質検証）         | `outputs/phase-9/qa-checklist.md`                                                                                 | lint/typecheck/test 品質基準を確認する       |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                                                        | レビュー指摘事項の対応状況を確認する         |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体（queryFn DI）を確認する        |
| SkillDocsCapabilityResolver | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts`                                             | capability 判定ロジックを確認する            |
| ipc index                   | `apps/desktop/src/main/ipc/index.ts`                                                                              | registerSkillDocsHandlers の登録を確認する   |
| task UT-9I-001              | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクとの関係を確認する       |

### システム仕様（aiworkflow-requirements）

> 手動テスト実行前に以下の正本仕様を確認し、期待動作との整合性を保証する。

| 参照資料                   | パス                                                                                                              | 内容                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | 4チャンネル（generate/preview/export/templates）の IPC 契約 |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の構成正本                        |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | Skill Docs 関連未タスクと public contract 正本              |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | sender 検証、P42 3段バリデーション、error envelope          |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I の完了履歴と未タスク正本                            |

## 実行手順

### ステップ1: テスト環境を準備する

1. 開発ビルドを起動する（`pnpm --filter @repo/desktop dev`）
2. DevTools を開き、コンソールエラーがないことを確認する
3. LLM プロバイダの接続状態を確認する（API key の有無）
4. CapabilityResolver の判定結果を確認する（integrated-api / guidance-only / terminal-handoff）

### ステップ2: 5つのテストケースを順番に実行する

TC-11-01 から TC-11-05 の順に実行する。各テストケースで以下を記録する:

- UI 状態の遷移（期待どおりか）
- DocOperationResult のレスポンス内容（success / error フィールド）
- エラーガイダンスの表示内容（guidance フィールド）
- スクリーンショットまたは間接検証の証跡

### ステップ3: エラー分類の動作を検証する

以下の DocOperationResult エラーコードが正しく処理されることを確認する:

| エラー種別       | コード | retryable | 期待 UI 状態     |
| ---------------- | ------ | --------- | ---------------- |
| API key 未設定   | 2001   | false     | guidance-only    |
| API key 無効     | 2002   | false     | error-guidance   |
| LLM timeout      | 3001   | true      | timeout-guidance |
| LLM rate limit   | 3002   | true      | rate-limit-wait  |
| LLM server error | 3003   | true      | error-guidance   |
| IPC 通信エラー   | 4001   | true      | error-guidance   |
| 内部エラー       | 5001   | false     | error-guidance   |

### ステップ4: 成果物を作成し完了条件を確認する

手動テスト結果を `manual-test-result.md` に記録し、全5シナリオの PASS/FAIL を集計する。

## 統合テスト連携

| 検証対象                | 手動テストでの確認方法                                       |
| ----------------------- | ------------------------------------------------------------ |
| queryFn DI 接続         | TC-11-01 で LLMDocQueryAdapter 経由の LLM 呼び出しが成功する |
| provider adapter        | TC-11-01 で getProviderName() がプロバイダ名を返す           |
| timeout 処理            | TC-11-03 で 30秒後に timeout-guidance 状態へ遷移する         |
| retry 処理              | TC-11-04 で rate limit 後に自動再試行が実行される            |
| guidance 表示           | TC-11-02, TC-11-03 で guidance フィールドが画面に表示される  |
| terminal handoff        | TC-11-05 でコンテキストコピーと terminal 起動が動作する      |
| CapabilityResolver 判定 | TC-11-02 で guidance-only -> integrated-api 遷移を確認する   |

## 成果物

| 成果物             | パス                                     | 内容                                            |
| ------------------ | ---------------------------------------- | ----------------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | TC-11-01 ~ TC-11-05 の PASS/FAIL 結果と詳細記録 |
| スクリーンショット | `outputs/phase-11/screenshots/`          | 各テストケースの画面証跡（P53 対策方法で取得）  |
| 撮影計画           | `outputs/phase-11/screenshot-plan.json`  | 7画面 x TC-ID のマッピングと取得方法の定義      |

## 完了条件

- [ ] TC-11-01（docs 生成成功）が PASS している
- [ ] TC-11-02（API key 未設定 -> guidance-only -> ready 遷移）が PASS している
- [ ] TC-11-03（timeout -> timeout-guidance -> 再試行 or handoff）が PASS している
- [ ] TC-11-04（rate limit -> rate-limit-wait -> 自動再試行）が PASS している
- [ ] TC-11-05（terminal handoff フロー）が PASS している
- [ ] 7つのエラーコードに対応する UI 状態遷移が全て仕様どおりである
- [ ] スクリーンショットまたは間接検証の証跡が全テストケースに存在する

## 既知の落とし穴

| Pitfall | 内容                                   | 対策                                                              |
| ------- | -------------------------------------- | ----------------------------------------------------------------- |
| P53     | CLI 環境でのスクリーンショット取得制約 | Playwright `page.screenshot()` or Electron `capturePage()` で取得 |
| P39     | happy-dom 環境での userEvent 非互換    | 間接検証テストでは fireEvent を使用する                           |
| P40     | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop` から実行する                                    |

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
