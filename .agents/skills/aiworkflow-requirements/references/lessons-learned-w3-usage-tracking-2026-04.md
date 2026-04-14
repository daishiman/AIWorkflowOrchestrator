# Lessons Learned: W3-seq-04 使用率計装 / trackEvent（2026-04）

> 分離元: [lessons-learned-current-2026-04.md](lessons-learned-current-2026-04.md)
> 関連: [lessons-learned-skill-wizard-redesign.md](lessons-learned-skill-wizard-redesign.md)

---

## UT-SKILL-WIZARD-W3-seq-04 使用率計装 教訓（2026-04-08）

### L-W3-TRACK-001: trackEvent renderer-local 抽象設計パターン

| 項目       | 内容                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | trackEvent を既存の `SkillAnalytics` / `AnalyticsStore` と接続しようとすると、execution-centric 計装と wizard-centric 計装が混在し責務が不明確になる                                                               |
| 原因       | 既存 Store は実行ライフサイクル中心の計装設計であり、ウィザード UI 操作イベントの粒度と一致しない                                                                                                                    |
| 解決策     | `apps/desktop/src/renderer/utils/trackEvent.ts` として renderer-local の薄い抽象を実装し、既存 Store とは独立させる。将来的な IPC 接続を想定した interface 設計にとどめ、現フェーズは console.info ロギングのみとした |
| 解決策     | `apps/desktop/src/renderer/utils/trackEvent.ts` として renderer-local の薄い抽象を実装し、既存 Store とは独立させる。後続の `UT-W3-ANALYTICS-ADAPTER-001` で production sink を analytics adapter / IPC 経由へ差し替えた |
| 標準ルール | UIコンポーネント固有の計装は execution/lifecycle Store に接続せず、renderer-local util として閉じる。Store との接続は計装ポイントが安定した後の別タスクで実施する                                                    |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                         |
| 対象ファイル | `apps/desktop/src/renderer/utils/trackEvent.ts`                                                                                                                                                                  |
| 項目         | 内容                                                                                                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | trackEvent を既存の `SkillAnalytics` / `AnalyticsStore` と接続しようとすると、execution-centric 計装と wizard-centric 計装が混在し責務が不明確になる                                                                  |
| 原因         | 既存 Store は実行ライフサイクル中心の計装設計であり、ウィザード UI 操作イベントの粒度と一致しない                                                                                                                     |
| 解決策       | `apps/desktop/src/renderer/utils/trackEvent.ts` として renderer-local の薄い抽象を実装し、既存 Store とは独立させる。将来的な IPC 接続を想定した interface 設計にとどめ、現フェーズは console.info ロギングのみとした |
| 標準ルール   | UIコンポーネント固有の計装は execution/lifecycle Store に接続せず、renderer-local util として閉じる。Store との接続は計装ポイントが安定した後の別タスクで実施する                                                     |
| 関連タスク   | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                             |
| 対象ファイル | `apps/desktop/src/renderer/utils/trackEvent.ts`                                                                                                                                                                       |

### L-W3-TRACK-002: 計装ポイントとstateフローの設計的分離

| 項目       | 内容                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 5つの計装ポイントが `SkillCreateWizard` と `CompleteStep` に分散しており、どちらが責務を持つか不明確になりやすい                                                                                                                                                                                                                                                                          |
| 原因       | 「何が起きたか」でイベントを分類すると、ウィザード起動・ステップ遷移・生成完了・フィードバックが同一レイヤーに見えてしまう                                                                                                                                                                                                                                                                |
| 解決策     | ウィザード起動系（`skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_abandon`）は `SkillCreateWizard` に、次の行動選択（`skill_wizard_next_action`）は `CompleteStep` に、生成完了系（`skill_wizard_generation_completed`）は `SkillCreateWizard` の `handleGenerate` に、フィードバック系（`skill_skeleton_quality_feedback`）は `ConversationRoundStep` に責務分離 |
| 標準ルール | 計装ポイントは「何が起きたか」ではなく「誰がその状態を知っているか」でコンポーネント配置を決定する。state を直接持つコンポーネントが計装を担う                                                                                                                                                                                                                                            |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                                                                                                                                                                                                 |

### L-WIZARD-LANE-CLEANUP-001: 完了レーン仕様書の移動後の参照更新

| 項目       | 内容                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `docs/30-workflows/skill-wizard-redesign-lane/` 配下の仕様書削除後、`quick-reference.md` の参照パスが旧パスのまま残った                                                               |
| 原因       | タスク仕様書のディレクトリ移動・削除と quick-reference の参照更新が別ターンになっていた                                                                                               |
| 解決策     | `docs/30-workflows/` 直下への canonical 移行を完了したタイミングで quick-reference を同波更新する。`grep -r "skill-wizard-redesign-lane" .claude/` 等で残存参照を検出してから削除する |
| 標準ルール | タスク仕様書のディレクトリ移動はquick-referenceの同行更新を必須とし、Phase 12 close-outの必須チェックリストに「参照パス整合確認（`grep` による残存参照検出）」を追加する              |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                             |

### L-W3-TRACK-003: useRef パターンによる cleanup 計装タイミングの確定

| 項目         | 内容                                                                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | `SkillCreateWizard` の useEffect cleanup で abandon イベントを発火する際、state staleness による二重発火の懸念が発生した                                                     |
| 原因         | React の非同期更新モデルでは、クリーンアップ関数内で `useState` の値を参照すると古いクロージャの値を掴む可能性がある                                                         |
| 解決策       | `currentStepRef` / `wizardCompletedRef` を `useRef` で保持し、cleanup 関数内で ref の最新値を参照する。Phase 8 リファクタリングで確認済み                                    |
| 標準ルール   | React 非同期更新モデルでのクリーンアップは ref パターンが再利用可能な解法。計装が絡む useEffect cleanup では常に `useRef` を用いて最新値を保証し、state を直接参照しないこと |
| 関連タスク   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                                                                                                                        |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                                                           |

### L-PHASE12-001: artifacts.json と outputs/artifacts.json のパリティ維持

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Phase 12 実施時、タスクルートの `artifacts.json` と `outputs/phase-12/artifacts.json` の 2 つを同期更新する必要があったが、片方だけ更新すると root evidence 検証で漏れが出た                                            |
| 原因         | Phase 12 テンプレートに「両ファイルを同一 step で更新する」旨の明示がなく、一方のみ更新して進めてしまいやすい                                                                                                           |
| 解決策       | Phase 12 の実施時は `artifacts.json`（タスクルート）と `outputs/phase-12/artifacts.json` の両方を同一 wave で更新し、`documentation-changelog.md` で両者の更新を個別に記録する                                          |
| 標準ルール   | Phase 12 テンプレートに「artifacts.json parity 確認チェック（タスクルート + outputs/phase-12/ の両方が更新済みか）」を組み込み、完了条件の必須チェック項目として明示する                                                  |
| 関連タスク   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                                                                                                                                                                  |
| 対象ファイル | `docs/30-workflows/*/artifacts.json`, `docs/30-workflows/*/outputs/phase-12/artifacts.json`                                                                                                                           |

---

## UT-W3-ANALYTICS-ADAPTER-001 analytics adapter接続 教訓（2026-04-12）

### L-W3-TRACK-003: opt-out final gate は renderer と main の二重防衛にする

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | renderer 側だけで送信停止しても、Main 側の最終 gate が弱いと store 読み取り失敗時に telemetry が漏れる |
| 原因       | 送信前判定と最終判定が 1 層しかなかった |
| 解決策     | renderer で予備判定、Main で `electron-store` の `analyticsOptOut` を final gate にする。store が無い / 読めない場合は safe-side で skip する |
| 標準ルール | analytics transport は dual gate を必須とし、片側だけの opt-out 判定で完了扱いにしない |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001 |
| 対象ファイル | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` / `apps/desktop/src/main/ipc/analyticsHandler.ts` |

### L-W3-TRACK-004: trackEvent の API を変えず sink だけ差し替える

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | sink 差し替えと同時に `trackEvent` の公開 API を変えると、呼び出し側の回帰が広がる |
| 原因       | 計装ポイントの責務と transport の責務が混ざっていた |
| 解決策     | `trackEvent<K>(eventName, payload): void` のシグネチャは維持し、transport のみ `analyticsAdapter` / `analytics:send` に差し替える |
| 標準ルール | 呼び出し側のイベント契約は固定し、transport は adapter で吸収する |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001 |
| 対象ファイル | `apps/desktop/src/renderer/utils/trackEvent.ts` / `apps/desktop/src/renderer/utils/analyticsAdapter.ts` |

### L-W3-TRACK-005: queue / flush / validation は serial に扱う

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | offline queue と online flush と opt-out 更新が並列に走ると、古い state で二重送信や取りこぼしが起こりやすい |
| 原因       | send / flush / gate check の順序が非同期競合しうる |
| 解決策     | `analyticsAdapter` 内で send / flush の操作を直列化し、queue TTL と max size を固定したうえで safe-side skip を優先する |
| 標準ルール | analytics adapter は state mutation を直列化し、検証失敗時は送信より停止を優先する |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001 |
| 対象ファイル | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` |


---

## UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 E2E trackEvent 確認 教訓（2026-04-12）

### L-W3-E2E-001: skill_wizard_step1_completed の期待値分離パターン（UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001）

| 項目         | 内容                                                                                                                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | E2E テストで `skill_wizard_step1_completed` のイベント発火を確認しようとしたが、現在の UI では Step 1 は「スキップ」フローで完了するため、期待する `method` 値が `"skip"` でないとテストが落ちる                              |
| 原因         | W3-seq-04 のユニットテスト設計時は `method` の具体値を厳密に固定していなかったが、E2E では実際の UI フローに従い `method: "skip"` が渡される。ユニット（mock）と E2E（実 UI）で発火条件が異なる                            |
| 解決策       | 「CompleteStep に到達できたか（UI 到達確認）」と「イベントの `method` 値が正しいか（ペイロード確認）」を別アサーションに分離する。到達確認は `expect(page.getByTestId('complete-step')).toBeVisible()`、ペイロード確認は `events.find(e => e.eventName === 'skill_wizard_step1_completed')?.payload.method === 'skip'` で分離して実施 |
| 標準ルール   | E2E テストで trackEvent を検証する場合、UI 到達確認とイベントペイロード確認を必ず別アサーションに分離する。UI の変更でペイロード値が変わった場合でも、到達確認のテストは独立して残り、回帰検出の精度が上がる                  |
| 関連タスク   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                                                                                                                                                                                     |
| 対象ファイル | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`, `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`                                                                                                                      |

---

## UT-W3-ANALYTICS-HTTP-PROVIDER-001 HTTP Provider 実装 教訓（2026-04-13）

### L-W3-HTTP-001: `vi.stubGlobal("fetch", ...)` + `afterEach(vi.unstubAllGlobals)` によるグローバル fetch モックパターン

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Node.js 組み込みの `fetch` をテストでモックしようとすると、`import` が不要なためモジュール差し替えでは対応できない                                                                                                      |
| 原因         | グローバル `fetch` はモジュールではなく `globalThis.fetch` として提供されており、`vi.mock` の対象にできない                                                                                                              |
| 解決策       | `vi.stubGlobal("fetch", vi.fn().mockResolvedValue(...))` でグローバルを差し替え、`afterEach(() => vi.unstubAllGlobals())` でテスト間汚染を防ぐ。成功・エラー・`AbortError` の各パスを `mockResolvedValue` / `mockRejectedValue` で切り替える |
| 標準ルール   | Node.js 組み込みグローバル（fetch / crypto / navigator）のモックは `vi.stubGlobal` を使う。`afterEach` でのクリーンアップを必須とし、`vi.fn()` の参照をテストブロック先頭で取得して呼び出し回数の確認に使う             |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                                                                         |

### L-W3-HTTP-002: AbortController + `finally clearTimeout` による production-only HTTP POST のタイムアウト設計

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | 外部 analytics サービスが応答しない場合、IPC ハンドラーが無期限にブロックされ Renderer 側の応答が遅延する                                                                                                              |
| 原因         | `fetch` 単体ではタイムアウトを持たない。`setTimeout` だけでは fetch の完了後もタイマーが残存してリソースリークする                                                                                                      |
| 解決策       | `AbortController` + `signal` で fetch を中断し、`const timeoutId = setTimeout(() => controller.abort(), 5000)` を `try` 前に置き、`finally { clearTimeout(timeoutId) }` でタイマーを必ず解放する                       |
| 標準ルール   | production-only な fire-and-forget HTTP 送信は必ず `AbortController` + `finally clearTimeout` の組み合わせで実装する。タイムアウト値は定数（`ANALYTICS_TIMEOUT_MS`）として切り出し、テストでの上書しを容易にする        |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                                                                                                                                        |

### L-W3-HTTP-003: ガード条件の早期識別（空文字 URL エッジケース）

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Phase 6 で「空文字の URL」（TC-E04）を追加したが、Phase 4 のテスト設計時点で識別できた可能性があった                                                                                                                    |
| 原因         | `if (!url)` の条件を設計する際、`undefined` ケースに意識が集中し、`""` （空文字）を falsy として同一視することを明示しなかった                                                                                          |
| 解決策       | ガード節を設計する際は「`undefined`」「`null`」「空文字」「空白のみ文字列」の 4 パターンを同時に列挙し、`if (!url)` が網羅するケースを Phase 4 のテスト表に明記する                                                     |
| 標準ルール   | 早期 return パターンの設計時は falsy 値の全パターンを明示し、Phase 4 テスト仕様に含める。`!url` が `""` を含むことはコメントで明記するか、テストケースとして固定する                                                    |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                        |

---

## UT-W3-ANALYTICS-HTTP-PROVIDER-001 HTTP Provider 実装 教訓（2026-04-13）

### L-W3-HTTP-001: `vi.stubGlobal("fetch", ...)` + `afterEach(vi.unstubAllGlobals)` によるグローバル fetch モックパターン

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Node.js 組み込みの `fetch` をテストでモックしようとすると、`import` が不要なためモジュール差し替えでは対応できない                                                                                                      |
| 原因         | グローバル `fetch` はモジュールではなく `globalThis.fetch` として提供されており、`vi.mock` の対象にできない                                                                                                              |
| 解決策       | `vi.stubGlobal("fetch", vi.fn().mockResolvedValue(...))` でグローバルを差し替え、`afterEach(() => vi.unstubAllGlobals())` でテスト間汚染を防ぐ。成功・エラー・`AbortError` の各パスを `mockResolvedValue` / `mockRejectedValue` で切り替える |
| 標準ルール   | Node.js 組み込みグローバル（fetch / crypto / navigator）のモックは `vi.stubGlobal` を使う。`afterEach` でのクリーンアップを必須とし、`vi.fn()` の参照をテストブロック先頭で取得して呼び出し回数の確認に使う             |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                                                                         |

### L-W3-HTTP-002: AbortController + `finally clearTimeout` による production-only HTTP POST のタイムアウト設計

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | 外部 analytics サービスが応答しない場合、IPC ハンドラーが無期限にブロックされ Renderer 側の応答が遅延する                                                                                                              |
| 原因         | `fetch` 単体ではタイムアウトを持たない。`setTimeout` だけでは fetch の完了後もタイマーが残存してリソースリークする                                                                                                      |
| 解決策       | `AbortController` + `signal` で fetch を中断し、`const timeoutId = setTimeout(() => controller.abort(), 5000)` を `try` 前に置き、`finally { clearTimeout(timeoutId) }` でタイマーを必ず解放する                       |
| 標準ルール   | production-only な fire-and-forget HTTP 送信は必ず `AbortController` + `finally clearTimeout` の組み合わせで実装する。タイムアウト値は定数（`ANALYTICS_TIMEOUT_MS`）として切り出し、テストでの上書しを容易にする        |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                                                                                                                                        |

### L-W3-HTTP-003: ガード条件の早期識別（空文字 URL エッジケース）

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Phase 6 で「空文字の URL」（TC-E04）を追加したが、Phase 4 のテスト設計時点で識別できた可能性があった                                                                                                                    |
| 原因         | `if (!url)` の条件を設計する際、`undefined` ケースに意識が集中し、`""` （空文字）を falsy として同一視することを明示しなかった                                                                                          |
| 解決策       | ガード節を設計する際は「`undefined`」「`null`」「空文字」「空白のみ文字列」の 4 パターンを同時に列挙し、`if (!url)` が網羅するケースを Phase 4 のテスト表に明記する                                                     |
| 標準ルール   | 早期 return パターンの設計時は falsy 値の全パターンを明示し、Phase 4 テスト仕様に含める。`!url` が `""` を含むことはコメントで明記するか、テストケースとして固定する                                                    |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                        |

---

## UT-W3-ANALYTICS-HTTP-PROVIDER-001 HTTP Provider 実装 教訓（2026-04-13）

### L-W3-HTTP-001: `vi.stubGlobal("fetch", ...)` + `afterEach(vi.unstubAllGlobals)` によるグローバル fetch モックパターン

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Node.js 組み込みの `fetch` をテストでモックしようとすると、`import` が不要なためモジュール差し替えでは対応できない                                                                                                      |
| 原因         | グローバル `fetch` はモジュールではなく `globalThis.fetch` として提供されており、`vi.mock` の対象にできない                                                                                                              |
| 解決策       | `vi.stubGlobal("fetch", vi.fn().mockResolvedValue(...))` でグローバルを差し替え、`afterEach(() => vi.unstubAllGlobals())` でテスト間汚染を防ぐ。成功・エラー・`AbortError` の各パスを `mockResolvedValue` / `mockRejectedValue` で切り替える |
| 標準ルール   | Node.js 組み込みグローバル（fetch / crypto / navigator）のモックは `vi.stubGlobal` を使う。`afterEach` でのクリーンアップを必須とし、`vi.fn()` の参照をテストブロック先頭で取得して呼び出し回数の確認に使う             |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                                                                         |

### L-W3-HTTP-002: AbortController + `finally clearTimeout` による production-only HTTP POST のタイムアウト設計

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | 外部 analytics サービスが応答しない場合、IPC ハンドラーが無期限にブロックされ Renderer 側の応答が遅延する                                                                                                              |
| 原因         | `fetch` 単体ではタイムアウトを持たない。`setTimeout` だけでは fetch の完了後もタイマーが残存してリソースリークする                                                                                                      |
| 解決策       | `AbortController` + `signal` で fetch を中断し、`const timeoutId = setTimeout(() => controller.abort(), 5000)` を `try` 前に置き、`finally { clearTimeout(timeoutId) }` でタイマーを必ず解放する                       |
| 標準ルール   | production-only な fire-and-forget HTTP 送信は必ず `AbortController` + `finally clearTimeout` の組み合わせで実装する。タイムアウト値は定数（`ANALYTICS_TIMEOUT_MS`）として切り出し、テストでの上書しを容易にする        |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                                                                                                                                        |

### L-W3-HTTP-003: ガード条件の早期識別（空文字 URL エッジケース）

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Phase 6 で「空文字の URL」（TC-E04）を追加したが、Phase 4 のテスト設計時点で識別できた可能性があった                                                                                                                    |
| 原因         | `if (!url)` の条件を設計する際、`undefined` ケースに意識が集中し、`""` （空文字）を falsy として同一視することを明示しなかった                                                                                          |
| 解決策       | ガード節を設計する際は「`undefined`」「`null`」「空文字」「空白のみ文字列」の 4 パターンを同時に列挙し、`if (!url)` が網羅するケースを Phase 4 のテスト表に明記する                                                     |
| 標準ルール   | 早期 return パターンの設計時は falsy 値の全パターンを明示し、Phase 4 テスト仕様に含める。`!url` が `""` を含むことはコメントで明記するか、テストケースとして固定する                                                    |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                        |
| 項目         | 内容                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状         | Phase 12 実施時、タスクルートの `artifacts.json` と `outputs/phase-12/artifacts.json` の 2 つを同期更新する必要があったが、片方だけ更新すると root evidence 検証で漏れが出た   |
| 原因         | Phase 12 テンプレートに「両ファイルを同一 step で更新する」旨の明示がなく、一方のみ更新して進めてしまいやすい                                                                  |
| 解決策       | Phase 12 の実施時は `artifacts.json`（タスクルート）と `outputs/phase-12/artifacts.json` の両方を同一 wave で更新し、`documentation-changelog.md` で両者の更新を個別に記録する |
| 標準ルール   | Phase 12 テンプレートに「artifacts.json parity 確認チェック（タスクルート + outputs/phase-12/ の両方が更新済みか）」を組み込み、完了条件の必須チェック項目として明示する       |
| 関連タスク   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                                                                                                                          |
| 対象ファイル | `docs/30-workflows/*/artifacts.json`, `docs/30-workflows/*/outputs/phase-12/artifacts.json`                                                                                    |

---

## UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 E2E trackEvent 確認 教訓（2026-04-12）

### L-W3-E2E-001: skill_wizard_step1_completed の期待値分離パターン

| 項目         | 内容                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | E2E テストで `skill_wizard_step1_completed` のイベント発火を確認しようとしたが、現在の UI では Step 1 は「スキップ」フローで完了するため、期待する `method` 値が `"skip"` でないとテストが落ちる                                                                                                                                      |
| 原因         | W3-seq-04 のユニットテスト設計時は `method` の具体値を厳密に固定していなかったが、E2E では実際の UI フローに従い `method: "skip"` が渡される。ユニット（mock）と E2E（実 UI）で発火条件が異なる                                                                                                                                       |
| 解決策       | 「CompleteStep に到達できたか（UI 到達確認）」と「イベントの `method` 値が正しいか（ペイロード確認）」を別アサーションに分離する。到達確認は `expect(page.getByTestId('complete-step')).toBeVisible()`、ペイロード確認は `events.find(e => e.eventName === 'skill_wizard_step1_completed')?.payload.method === 'skip'` で分離して実施 |
| 標準ルール   | E2E テストで trackEvent を検証する場合、UI 到達確認とイベントペイロード確認を必ず別アサーションに分離する。UI の変更でペイロード値が変わった場合でも、到達確認のテストは独立して残り、回帰検出の精度が上がる                                                                                                                          |
| 関連タスク   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                                                                                                                                                                                                                                                                                                |
| 対象ファイル | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`, `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`                                                                                                                                                                                                                                  |

---

## UT-W3-ANALYTICS-HTTP-PROVIDER-001 HTTP Provider 実装 教訓（2026-04-13）

### L-W3-HTTP-001: `vi.stubGlobal("fetch", ...)` + `afterEach(vi.unstubAllGlobals)` によるグローバル fetch モックパターン

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Node.js 組み込みの `fetch` をテストでモックしようとすると、`import` が不要なためモジュール差し替えでは対応できない                                                                                                      |
| 原因         | グローバル `fetch` はモジュールではなく `globalThis.fetch` として提供されており、`vi.mock` の対象にできない                                                                                                              |
| 解決策       | `vi.stubGlobal("fetch", vi.fn().mockResolvedValue(...))` でグローバルを差し替え、`afterEach(() => vi.unstubAllGlobals())` でテスト間汚染を防ぐ。成功・エラー・`AbortError` の各パスを `mockResolvedValue` / `mockRejectedValue` で切り替える |
| 標準ルール   | Node.js 組み込みグローバル（fetch / crypto / navigator）のモックは `vi.stubGlobal` を使う。`afterEach` でのクリーンアップを必須とし、`vi.fn()` の参照をテストブロック先頭で取得して呼び出し回数の確認に使う             |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                                                                         |

### L-W3-HTTP-002: AbortController + `finally clearTimeout` による production-only HTTP POST のタイムアウト設計

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | 外部 analytics サービスが応答しない場合、IPC ハンドラーが無期限にブロックされ Renderer 側の応答が遅延する                                                                                                              |
| 原因         | `fetch` 単体ではタイムアウトを持たない。`setTimeout` だけでは fetch の完了後もタイマーが残存してリソースリークする                                                                                                      |
| 解決策       | `AbortController` + `signal` で fetch を中断し、`const timeoutId = setTimeout(() => controller.abort(), 5000)` を `try` 前に置き、`finally { clearTimeout(timeoutId) }` でタイマーを必ず解放する                       |
| 標準ルール   | production-only な fire-and-forget HTTP 送信は必ず `AbortController` + `finally clearTimeout` の組み合わせで実装する。タイムアウト値は定数（`ANALYTICS_TIMEOUT_MS`）として切り出し、テストでの上書しを容易にする        |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                                                                                                                                        |

### L-W3-HTTP-003: ガード条件の早期識別（空文字 URL エッジケース）

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Phase 6 で「空文字の URL」（TC-E04）を追加したが、Phase 4 のテスト設計時点で識別できた可能性があった                                                                                                                    |
| 原因         | `if (!url)` の条件を設計する際、`undefined` ケースに意識が集中し、`""` （空文字）を falsy として同一視することを明示しなかった                                                                                          |
| 解決策       | ガード節を設計する際は「`undefined`」「`null`」「空文字」「空白のみ文字列」の 4 パターンを同時に列挙し、`if (!url)` が網羅するケースを Phase 4 のテスト表に明記する                                                     |
| 標準ルール   | 早期 return パターンの設計時は falsy 値の全パターンを明示し、Phase 4 テスト仕様に含める。`!url` が `""` を含むことはコメントで明記するか、テストケースとして固定する                                                    |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                        |
| 項目         | 内容                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状         | Phase 12 実施時、タスクルートの `artifacts.json` と `outputs/phase-12/artifacts.json` の 2 つを同期更新する必要があったが、片方だけ更新すると root evidence 検証で漏れが出た   |
| 原因         | Phase 12 テンプレートに「両ファイルを同一 step で更新する」旨の明示がなく、一方のみ更新して進めてしまいやすい                                                                  |
| 解決策       | Phase 12 の実施時は `artifacts.json`（タスクルート）と `outputs/phase-12/artifacts.json` の両方を同一 wave で更新し、`documentation-changelog.md` で両者の更新を個別に記録する |
| 標準ルール   | Phase 12 テンプレートに「artifacts.json parity 確認チェック（タスクルート + outputs/phase-12/ の両方が更新済みか）」を組み込み、完了条件の必須チェック項目として明示する       |
| 関連タスク   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                                                                                                                          |
| 対象ファイル | `docs/30-workflows/*/artifacts.json`, `docs/30-workflows/*/outputs/phase-12/artifacts.json`                                                                                    |

---

## UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 E2E trackEvent 確認 教訓（2026-04-12）

### L-W3-E2E-001: skill_wizard_step1_completed の期待値分離パターン

| 項目         | 内容                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | E2E テストで `skill_wizard_step1_completed` のイベント発火を確認しようとしたが、現在の UI では Step 1 は「スキップ」フローで完了するため、期待する `method` 値が `"skip"` でないとテストが落ちる                                                                                                                                      |
| 原因         | W3-seq-04 のユニットテスト設計時は `method` の具体値を厳密に固定していなかったが、E2E では実際の UI フローに従い `method: "skip"` が渡される。ユニット（mock）と E2E（実 UI）で発火条件が異なる                                                                                                                                       |
| 解決策       | 「CompleteStep に到達できたか（UI 到達確認）」と「イベントの `method` 値が正しいか（ペイロード確認）」を別アサーションに分離する。到達確認は `expect(page.getByTestId('complete-step')).toBeVisible()`、ペイロード確認は `events.find(e => e.eventName === 'skill_wizard_step1_completed')?.payload.method === 'skip'` で分離して実施 |
| 標準ルール   | E2E テストで trackEvent を検証する場合、UI 到達確認とイベントペイロード確認を必ず別アサーションに分離する。UI の変更でペイロード値が変わった場合でも、到達確認のテストは独立して残り、回帰検出の精度が上がる                                                                                                                          |
| 関連タスク   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                                                                                                                                                                                                                                                                                                |
| 対象ファイル | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`, `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`                                                                                                                                                                                                                                  |

---

## UT-W3-ANALYTICS-HTTP-PROVIDER-001 HTTP Provider 実装 教訓（2026-04-13）

### L-W3-HTTP-001: `vi.stubGlobal("fetch", ...)` + `afterEach(vi.unstubAllGlobals)` によるグローバル fetch モックパターン

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Node.js 組み込みの `fetch` をテストでモックしようとすると、`import` が不要なためモジュール差し替えでは対応できない                                                                                                      |
| 原因         | グローバル `fetch` はモジュールではなく `globalThis.fetch` として提供されており、`vi.mock` の対象にできない                                                                                                              |
| 解決策       | `vi.stubGlobal("fetch", vi.fn().mockResolvedValue(...))` でグローバルを差し替え、`afterEach(() => vi.unstubAllGlobals())` でテスト間汚染を防ぐ。成功・エラー・`AbortError` の各パスを `mockResolvedValue` / `mockRejectedValue` で切り替える |
| 標準ルール   | Node.js 組み込みグローバル（fetch / crypto / navigator）のモックは `vi.stubGlobal` を使う。`afterEach` でのクリーンアップを必須とし、`vi.fn()` の参照をテストブロック先頭で取得して呼び出し回数の確認に使う             |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                                                                         |

### L-W3-HTTP-002: AbortController + `finally clearTimeout` による production-only HTTP POST のタイムアウト設計

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | 外部 analytics サービスが応答しない場合、IPC ハンドラーが無期限にブロックされ Renderer 側の応答が遅延する                                                                                                              |
| 原因         | `fetch` 単体ではタイムアウトを持たない。`setTimeout` だけでは fetch の完了後もタイマーが残存してリソースリークする                                                                                                      |
| 解決策       | `AbortController` + `signal` で fetch を中断し、`const timeoutId = setTimeout(() => controller.abort(), 5000)` を `try` 前に置き、`finally { clearTimeout(timeoutId) }` でタイマーを必ず解放する                       |
| 標準ルール   | production-only な fire-and-forget HTTP 送信は必ず `AbortController` + `finally clearTimeout` の組み合わせで実装する。タイムアウト値は定数（`ANALYTICS_TIMEOUT_MS`）として切り出し、テストでの上書しを容易にする        |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                                                                                                                                        |

### L-W3-HTTP-003: ガード条件の早期識別（空文字 URL エッジケース）

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | Phase 6 で「空文字の URL」（TC-E04）を追加したが、Phase 4 のテスト設計時点で識別できた可能性があった                                                                                                                    |
| 原因         | `if (!url)` の条件を設計する際、`undefined` ケースに意識が集中し、`""` （空文字）を falsy として同一視することを明示しなかった                                                                                          |
| 解決策       | ガード節を設計する際は「`undefined`」「`null`」「空文字」「空白のみ文字列」の 4 パターンを同時に列挙し、`if (!url)` が網羅するケースを Phase 4 のテスト表に明記する                                                     |
| 標準ルール   | 早期 return パターンの設計時は falsy 値の全パターンを明示し、Phase 4 テスト仕様に含める。`!url` が `""` を含むことはコメントで明記するか、テストケースとして固定する                                                    |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                        |
