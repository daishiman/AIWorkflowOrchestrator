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

### L-W3-TRACK-002: 計装ポイントとstateフローの設計的分離

| 項目       | 内容                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 5つの計装ポイントが `SkillCreateWizard` と `CompleteStep` に分散しており、どちらが責務を持つか不明確になりやすい                                                                                                               |
| 原因       | 「何が起きたか」でイベントを分類すると、ウィザード起動・ステップ遷移・生成完了・フィードバックが同一レイヤーに見えてしまう                                                                                                      |
| 解決策     | ウィザード起動系（`skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_abandon`）は `SkillCreateWizard` に、次の行動選択（`skill_wizard_next_action`）は `CompleteStep` に、生成完了系（`skill_wizard_generation_completed`）は `SkillCreateWizard` の `handleGenerate` に、フィードバック系（`skill_skeleton_quality_feedback`）は `ConversationRoundStep` に責務分離 |
| 標準ルール | 計装ポイントは「何が起きたか」ではなく「誰がその状態を知っているか」でコンポーネント配置を決定する。state を直接持つコンポーネントが計装を担う                                                                                   |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                                    |

### L-WIZARD-LANE-CLEANUP-001: 完了レーン仕様書の移動後の参照更新

| 項目       | 内容                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `docs/30-workflows/skill-wizard-redesign-lane/` 配下の仕様書削除後、`quick-reference.md` の参照パスが旧パスのまま残った                                                                                                       |
| 原因       | タスク仕様書のディレクトリ移動・削除と quick-reference の参照更新が別ターンになっていた                                                                                                                                        |
| 解決策     | `docs/30-workflows/` 直下への canonical 移行を完了したタイミングで quick-reference を同波更新する。`grep -r "skill-wizard-redesign-lane" .claude/` 等で残存参照を検出してから削除する                                          |
| 標準ルール | タスク仕様書のディレクトリ移動はquick-referenceの同行更新を必須とし、Phase 12 close-outの必須チェックリストに「参照パス整合確認（`grep` による残存参照検出）」を追加する                                                         |
| 関連タスク | UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                                                                    |

### L-W3-TRACK-003: useRef パターンによる cleanup 計装タイミングの確定

| 項目         | 内容                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状         | `SkillCreateWizard` の useEffect cleanup で abandon イベントを発火する際、state staleness による二重発火の懸念が発生した                                                                                                              |
| 原因         | React の非同期更新モデルでは、クリーンアップ関数内で `useState` の値を参照すると古いクロージャの値を掴む可能性がある                                                                                                                  |
| 解決策       | `currentStepRef` / `wizardCompletedRef` を `useRef` で保持し、cleanup 関数内で ref の最新値を参照する。Phase 8 リファクタリングで確認済み                                                                                            |
| 標準ルール   | React 非同期更新モデルでのクリーンアップは ref パターンが再利用可能な解法。計装が絡む useEffect cleanup では常に `useRef` を用いて最新値を保証し、state を直接参照しないこと                                                           |
| 関連タスク   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                                                                                                                                                                                                |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                                                                                                                   |

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

## UT-W3-ANALYTICS-HTTP-PROVIDER-001 HTTP Provider 実装 教訓（2026-04-14）

### L-W3-HTTP-001: fetchFn DI を先に置くとテストは素直になる

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | 外部 HTTP 送信をテストしたいのに、グローバル `fetch` を直接触るとテストごとの汚染と設定コストが高くなる                                                                                                                  |
| 原因         | I/O 境界を `globalThis.fetch` に固定すると、モックの切り替えとクリーンアップの責務がテスト側へ押し出される                                                                                                              |
| 解決策       | `AnalyticsHttpProvider` の constructor に `fetchFn` を DI し、テストでは `vi.fn()` を渡す。必要なケースだけ `vi.stubGlobal` を使う |
| 標準ルール   | I/O 境界は constructor DI を優先し、グローバルモックは最後の手段にする。テストは `fetchFn` を差し替えるだけで成功・失敗・timeout を切り替えられるようにする                                                            |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`, `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts`                                                                 |

### L-W3-HTTP-002: AbortController + `finally clearTimeout` は provider 側で閉じる

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | 外部 analytics サービスが応答しない場合、送信処理が長引いて IPC 応答の遅延要因になる                                                                                                                                  |
| 原因         | `fetch` 単体ではタイムアウトを持たず、`setTimeout` だけでは解放漏れが起こりうる                                                                                                                                      |
| 解決策       | `AnalyticsHttpProvider` の `attemptSend()` 内で `AbortController` を生成し、`finally { clearTimeout(timer) }` でタイマーを確実に解放する                                                                               |
| 標準ルール   | timeout と abort は transport 層で閉じ、Main IPC には伝播させない。`ANALYTICS_ENDPOINT_URL` の存在有無とは独立に timeout は一定で扱う                                                                                 |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`                                                                                                                                                    |

### L-W3-HTTP-003: ガード条件は `undefined` だけでなく空文字・空白も同時に見る

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | `ANALYTICS_ENDPOINT_URL` の未設定判定を考えるとき、`undefined` だけを見て空文字や空白文字列のケースを見落としやすい                                                                                                    |
| 原因         | `if (!endpoint)` の falsy 判定が、設計書上で 4 パターンに分解されていなかった                                                                                                                                        |
| 解決策       | `undefined` / `null` / `""` / `"   "` を同時に列挙し、no-op 条件として明文化する                                                                                                                                        |
| 標準ルール   | 早期 return を設計するときは、falsy 値の全パターンをテスト表へ落とす。`AnalyticsHttpProvider` の no-op は「未設定または空文字」の両方を含むと明記する                                                                  |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`                                                                                                                                                    |

### L-W3-HTTP-004: 4xx と 5xx の retryable 判定を分ける

| 項目         | 内容                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | HTTP エラーを一律 retry すると、クライアント入力ミスの 4xx まで再送してしまう                                                                                                                                         |
| 原因         | `response.ok === false` をそのまま retryable と誤解した                                                                                                                                                                 |
| 解決策       | `AnalyticsSendError.retryable` を用い、`4xx` は non-retryable、`5xx` は retryable として分岐する。handler は provider の戻り値をそのまま返し、`skipped` を落とさない                                                |
| 標準ルール   | retry は transport 障害と server 側一時障害に限定する。client error は 1 回で止める。`skipped` は analytics 送信結果の一部として維持する                                                                                |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`, `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                        |
| 症状         | Phase 6 で「空文字の URL」（TC-E04）を追加したが、Phase 4 のテスト設計時点で識別できた可能性があった                                                                                                                    |
| 原因         | `if (!url)` の条件を設計する際、`undefined` ケースに意識が集中し、`""` （空文字）を falsy として同一視することを明示しなかった                                                                                          |
| 解決策       | ガード節を設計する際は「`undefined`」「`null`」「空文字」「空白のみ文字列」の 4 パターンを同時に列挙し、`if (!url)` が網羅するケースを Phase 4 のテスト表に明記する                                                     |
| 標準ルール   | 早期 return パターンの設計時は falsy 値の全パターンを明示し、Phase 4 テスト仕様に含める。`!url` が `""` を含むことはコメントで明記するか、テストケースとして固定する                                                    |
| 関連タスク   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                                                                                                                                                      |
| 対象ファイル | `apps/desktop/src/main/ipc/analyticsHandler.ts`, `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                                                                                        |
