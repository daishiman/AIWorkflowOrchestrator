# Lessons Learned（current）2026-04 — Schedule / Feedback

> 分割元: lessons-learned-current-2026-04.md
> 範囲: TASK-UI-SCHEDULE-VISUAL-PICKER-001 教訓（2026-04-09） 〜 TASK-SW-FIX-FEEDBACK-001: SkillWizard フィードバックループ修正 教訓（2026-04-13）

## TASK-UI-SCHEDULE-VISUAL-PICKER-001 教訓（2026-04-09）

### L-VSCPKR-001: JSDoc コメント内 `*/` は esbuild パースエラーの原因になる

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `cronParser.ts` の JSDoc コメント内に `*/` を含む説明（例: `ステップ値 */n`）があると esbuild がコメント終端と誤認識しパースエラーになる |
| 原因       | esbuild は `/*` 〜 `*/` をコメントとして解析するため、JSDoc 内に `*/` が含まれると誤って終端と判定される |
| 解決策     | `*/` を `* /` とスペースで分割するか、コードブロック（\`\`\`）形式でサンプルを記述する。cron 式（例: `*/5`）は JSDoc の `@example` 内でも `* /5` と書く |
| 再発防止   | cron 式や数式を JSDoc コメントで説明する際は `*/` を避けるルールを周知する。Phase 5 実装後に `npx tsc --noEmit` を早期実行してパースエラーを検出する |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / SK-01 |

### L-VSCPKR-002: happy-dom 環境での `vi.stubGlobal("window", ...)` は React を破壊する

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | 統合テストで `vi.stubGlobal("window", { api: mockApi })` を使うと React 内部の `instanceof HTMLElement` チェックが常に `false` になり、コンポーネントのレンダリングが壊れる |
| 原因       | `vi.stubGlobal` でウィンドウ全体を差し替えると、happy-dom の `HTMLElement` プロトタイプチェーンが切断され、React の DOM 検証ロジックが正常に動作しなくなる |
| 解決策     | `window.api` などの Electron Preload API のモックには `Object.defineProperty(window, "api", { value: mockApi, writable: true, configurable: true })` を使用する |
| 再発防止   | テスト設定ガイドに「window.api のモックは Object.defineProperty を使うこと / vi.stubGlobal("window", ...) は禁止」を明記する |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / SK-02 |

### L-VSCPKR-003: 変換ユーティリティを純粋関数として設計すると Vitest テストが単純化される

| 項目       | 内容 |
| ---------- | ---- |
| 知見       | `visualConfigToCron()` / `cronToVisualConfig()` をすべて副作用のない純粋関数として実装したことで、Vitest でモックが不要になりテストが単純化された |
| 効果       | React コンポーネント外でも利用可能なユーティリティになり、CLI / API での再利用が容易になる |
| 適用範囲   | UI とデータ変換を分離する際、変換ユーティリティは必ず純粋関数として実装し、`useXxx` hook 内には変換ロジックを書かない |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / DP-02 |

### L-VSCPKR-004: カバレッジ確認は Phase 7 先送りせず Phase 5-6 でインクリメンタルに行う

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | Phase 7 でまとめてカバレッジを確認した結果、`cronHumanizer` の英語 locale ブランチが未カバーと判明し Phase 6 へ手戻りが発生した |
| 原因       | 実装・テスト追加を Phase 5-6 で行い、カバレッジ確認を Phase 7 に先送りしていた |
| 解決策     | 各ファイルを実装するたびに `npx vitest run --coverage` を実行し、branch coverage を都度確認する |
| 再発防止   | Phase 5-6 の完了条件チェックリストに「変更ファイルのブランチカバレッジ確認」を追加する |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / WF-01 |


## UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001: SkillCategory ラベルマッピング集約

### L-CLM-001: `satisfies` パターンでコンパイル時ラベルドリフト防止

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `SkillCategory` の union 型に新値を追加した際、各コンポーネントの日本語ラベル文字列が漏れなく更新されているかを実行時まで確認できなかった |
| 原因       | 各コンポーネントが独自に `CATEGORY_VALUES` 定数を保持し、shared contract に依存していなかった |
| 解決策     | `SKILL_CATEGORY_LABELS satisfies Record<SkillCategory, string>` を shared 型として定義し、新規 `SkillCategory` 追加時にラベル漏れをコンパイルエラーで検出する |
| 再発防止   | enum/union に表示ラベルが必要な場合は `satisfies Record<union, string>` を標準パターンとして採用する。`as const` だけでは型検査が働かない点に注意 |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |

### L-CLM-002: deprecated コンポーネントも canonical contract に依存させる

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `DescribeStep`（deprecated）が旧ラベル文字列（例: `コード支援`）をハードコードしており、canonical の `SKILL_CATEGORY_LABELS` から乖離していた |
| 原因       | deprecated 扱いのため「どうせ削除するから修正不要」と判断し、shared contract 切り替えを後回しにした |
| 解決策     | deprecated コンポーネントであっても canonical contract のラベル定数を参照させ、drift を防ぐ。`DescribeStep.test.tsx` に canonical option 表示テストを追加 |
| 再発防止   | deprecated マークが付いていても、型/定数依存の修正は同波で実施する。「削除前提」は drift 放置の理由にならない |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |

### L-CLM-003: Phase 12 台帳3点同期チェックリスト化

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | Phase 12 compliance check が台帳 parity チェックで FAIL し、全体が BLOCKED になるまで artifacts.json の不一致が検出されなかった |
| 原因       | Phase 12 標準フローに「repo root `artifacts.json` ↔ `outputs/artifacts.json` ↔ phase spec artifact 名」の3点同期チェックが含まれていなかった |
| 解決策     | Phase 12 着手時の **初手チェック** として台帳3点（workflow spec / `artifacts.json` / `outputs/artifacts.json`）の parity 確認を必須化した（SKILL.md v10.09.41 に反映） |
| 再発防止   | `complete-phase.js` 実行前に `jq '.artifacts | keys' artifacts.json` と `outputs/artifacts.json` を diff して0件を確認する |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |


## TASK-UI-SCHEDULE-CRON-SEMANTIC-001 意味論的 cron バリデーション（2026-04-12）

### L-CRON-SEM-001: cron-parser@5.5.0 の DOM strict 判定（DOW 救済なし）

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `"0 0 31 2 *"` に対して `cron-parser` が例外を投げるか `interval.next()` が無限ループするかを事前確認していなかった。Phase 2 の仕様ではまだ挙動が未確定だった                              |
| 原因       | `cron-parser@5.5.0` は DOM（day-of-month）と DOW（day-of-week）を独立して評価し、DOW が wildcard でも DOM の不達は救済しない。この strict 判定を Phase 2 の P50 チェックに含めていなかった |
| 解決策     | `options.semantic: true` 時は「到達不能なスケジュールは全て拒否する安全側判定」として使う方針に確定。DOM strict を前提として `safe-side` として採用した |
| 再発防止   | Phase 2 library P50 チェックに「DOM × DOW 組み合わせの実測確認（`"0 0 31 2 *"` 等）」を追加する |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 解決策     | `options.semantic: true` 時は「到達不能なスケジュールは全て拒否する安全側判定」として使う方針に確定。DOM strict を前提として `safe-side` として採用した                                    |
| 再発防止   | Phase 2 library P50 チェックに「DOM × DOW 組み合わせの実測確認（`"0 0 31 2 *"` 等）」を追加する                                                                                            |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                         |
| 項目       | 内容                                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------                              |
| 症状       | `SkillCategory` の union 型に新値を追加した際、各コンポーネントの日本語ラベル文字列が漏れなく更新されているかを実行時まで確認できなかった                                                  |
| 原因       | 各コンポーネントが独自に `CATEGORY_VALUES` 定数を保持し、shared contract に依存していなかった                                                                                              |
| 解決策     | `SKILL_CATEGORY_LABELS satisfies Record<SkillCategory, string>` を shared 型として定義し、新規 `SkillCategory` 追加時にラベル漏れをコンパイルエラーで検出する                              |
| 再発防止   | enum/union に表示ラベルが必要な場合は `satisfies Record<union, string>` を標準パターンとして採用する。`as const` だけでは型検査が働かない点に注意                                          |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                                              |

### L-CRON-SEM-002: `semantic: true` は opt-in safe-side として設計する

| 項目       | 内容                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `semantic: true` で DOW wildcard（例: `* * 29 2 *` は4年に1度有効）まで拒否されるかという懸念が生じた                                                                                    |
| 原因       | `semantic` フラグの意味論が「厳密な到達可能性チェック」か「緩やかなヒント」かが設計当初に明文化されていなかった                                                                          |
| 解決策     | `semantic: true` = 「次回実行時刻が計算できない場合は全て拒否する安全側判定」と明文化。呼び出し側が意図的に `options` を渡す opt-in 設計を維持し、既存 UI 呼び出しは non-semantic のまま |
| 再発防止   | `ValidateCronOptions` の JSDoc に safe-side 判定である旨を明示する。新しい呼び出し経路を追加する場合は別タスクで semantic 有効化の意図を明示する |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 再発防止   | `ValidateCronOptions` の JSDoc に safe-side 判定である旨を明示する。新しい呼び出し経路を追加する場合は別タスクで semantic 有効化の意図を明示する                                         |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                       |
| 項目       | 内容                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------                                |
| 症状       | `DescribeStep`（deprecated）が旧ラベル文字列（例: `コード支援`）をハードコードしており、canonical の `SKILL_CATEGORY_LABELS` から乖離していた                                            |
| 原因       | deprecated 扱いのため「どうせ削除するから修正不要」と判断し、shared contract 切り替えを後回しにした                                                                                      |
| 解決策     | deprecated コンポーネントであっても canonical contract のラベル定数を参照させ、drift を防ぐ。`DescribeStep.test.tsx` に canonical option 表示テストを追加                                |
| 再発防止   | deprecated マークが付いていても、型/定数依存の修正は同波で実施する。「削除前提」は drift 放置の理由にならない                                                                            |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                                            |

### L-CRON-SEM-003: Phase 12 サマリーに外部同期一覧を必ず含める

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | Phase 12 compliance check が台帳 parity チェックで FAIL し、全体が BLOCKED になるまで artifacts.json の不一致が検出されなかった |
| 原因       | Phase 12 標準フローに「repo root `artifacts.json` ↔ `outputs/artifacts.json` ↔ phase spec artifact 名」の3点同期チェックが含まれていなかった |
| 解決策     | Phase 12 着手時の **初手チェック** として台帳3点（workflow spec / `artifacts.json` / `outputs/artifacts.json`）の parity 確認を必須化した（SKILL.md v10.09.41 に反映） |
| 再発防止   | `complete-phase.js` 実行前に `jq '.artifacts                                                                                                                           | keys' artifacts.json`と`outputs/artifacts.json` を diff して0件を確認する |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                          |


## TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 VisualCronPicker UI validation（2026-04-13）

### L-CRON-UI-001: visual validation の証跡は初期値注入で固定する

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | monthly invalid の screenshot を live input の操作だけで再現しようとすると、visual mode の状態がぶれやすく、証跡が安定しなかった |
| 原因       | screenshot harness の state 固定がなく、direct input / custom cron と visual validation の境界が曖昧だった |
| 解決策     | `value=` 初期値注入で visual mode を固定し、monthly invalid / valid を同じハーネスで再現する |
| 再発防止   | 画面証跡は入力経路と初期 state を capture metadata へ固定する |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |

### L-CRON-UI-002: 設計文言・実装文言・証跡文言を一致させる

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `1〜31` の月間エラー文言が design / implementation / evidence で微妙に揺れると、レビュー時に「どれが正か」が分かりにくくなる |
| 原因       | UI ガイド、コンポーネント契約、手動テスト記録を別々に更新していた |
| 解決策     | 月間エラー文言を 1 つの正本として扱い、UI ガイド・コンポーネント契約・Phase 11/12 証跡を完全一致させる |
| 再発防止   | validation copy は paraphrase せず、同一文言を正本から転記する |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |

### L-CRON-UI-003: 見た目差分だけの改善は別タスクに分離する

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | weekly / monthly の alert で `text-xs` / `text-sm` のような細かな差分が、機能完了の主題と混ざりやすい |
| 原因       | 行動差分とスタイル差分を同じ完了記録に閉じ込めたため、レビューの論点が広がった |
| 解決策     | style-only の統一は `TASK-CRON-ERROR-STYLE-UNIFICATION-001`、direct input 側は `TASK-CRON-CUSTOM-VALIDATION-001` として別タスク化する |
| 再発防止   | micro-style の調整は main task から切り出し、優先度と影響を分けて管理する |
| 関連タスク | TASK-CRON-ERROR-STYLE-UNIFICATION-001 / TASK-CRON-CUSTOM-VALIDATION-001 |


## L-WEEKGRD-001: weekly空weekdaysガードは例外でなく空文字返却で設計する

- タスク: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 / AC-1
- 症状: weekdays: []時に例外を投げると、呼び出し元のバリデーション制御が複雑化する
- 解決策: ガード処理で空文字""を返し、呼び出し元の既存バリデーションに委ねる
- 再発防止: 純粋関数ガードのデフォルト戦略は「例外なし・無効値返却」を採用する

## L-WEEKGRD-002: NON_VISUAL純粋関数タスクのPhase 11は source-level PASSと環境ブロッカーを分離して記録する

- タスク: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
- 症状: vitestがesbuild host/binary mismatch（0.21.5 vs 0.25.12）で停止した場合、製品FAILと環境FAILが混在しがち
- 解決策: discovered-issues.md でproduct_blockerとenvironment_issueを別カテゴリで記録し、product blocker 0件を明記
- 再発防止: 環境要因は製品バックログに入れない

## L-WEEKGRD-003: Phase 11 NON_VISUALタスクではui-sanity-visual-review.mdにNON_VISUAL宣言を明示する

- タスク: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
- 症状: visual reviewファイルが空だとreviewerが証跡漏れと誤解する
- 解決策: ui-sanity-visual-review.mdの冒頭に「本タスクはpure function変更のため画面変更なし（NON_VISUAL）」と明記


## UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 レガシーコード整理 教訓（2026-04-12）

### L-DESCRIBE-STEP-001: 2ファイル同時削除 + barrel contract guard 標準フロー

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `DescribeStep.tsx` / `DescribeStep.test.tsx` の2ファイル同時削除時、barrel export の回帰を防ぐ guard がないと type-only export の再導入を見逃す                                            |
| 解決策     | Phase 4 で guard test 2種類（runtime: `wizard-exports.test.ts` / compile-time: `wizard-exports.typecheck.ts`）を削除前に作成し、`pnpm typecheck` + `pnpm test` PASS を削除の前提条件とする |
| 標準フロー | (1) barrel contract guard 作成 → (2) 残留参照全量 `grep` → (3) 物理削除実行 → (4) typecheck + test 全通過確認                                                                              |
| 再発防止   | ファイル削除タスクの Phase 4 では barrel contract guard の新規作成を標準タスクとして含める                                                                                                 |
| 関連タスク | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001                                                                                                                                                 |

### L-DESCRIBE-STEP-002: runtime guard と compile-time guard を別 surface で持つ理由

| 項目       | 内容                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景       | `DescribeStepProps` は型定義のみの export（type-only export）であり、`value export` と異なり runtime では検出できない                                                                                    |
| 解決策     | `wizard-exports.test.ts`（runtime: `expect(wizardExports).not.toHaveProperty('DescribeStep')`）に加えて `wizard-exports.typecheck.ts`（compile-time: `@ts-expect-error` ガード）を別ファイルで管理する   |
| 設計理由   | value export は runtime test で検出可能。type-only export は JavaScript に出力されないため runtime test では検出不可。compile-time guard（`@ts-expect-error`）により TypeScript 型レベルで再導入を封じる |
| 適用条件   | barrel export から削除した型が型定義のみ（`type` キーワード付き export）である場合                                                                                                                       |
| 関連タスク | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001                                                                                                                                                               |
| 症状       | `system-spec-update-summary.md` に LOGS.md × 2 / topic-map.md / resource-map.md の更新記録を含めていなかったため、外部同期が完了しているかの判断が Phase 12 証跡だけでは不明瞭になった                   |
| 原因       | Phase 12 の `system-spec-update-summary.md` テンプレートに「外部同期先一覧」の項目がなかった                                                                                                             |
| 解決策     | Phase 12 closing 時に `system-spec-update-summary.md` の Step 1-A に「LOGS.md × 2 + topic-map.md + resource-map.md」の更新記録を必ず含めるよう明文化した                                                 |
| 再発防止   | Phase 12 spec（`docs/30-workflows/*/phase-12-documentation.md`）の Task 12-2 Step 1-A に「外部同期先一覧」列を追加する                                                                                   |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                                       |
| 適用条件   | barrel export から削除した型が型定義のみ（`type` キーワード付き export）である場合 |
| 関連タスク | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 |


## UT-W3-ANALYTICS-STORE-INTEGRATION-001 analyticsSlice + agentSlice wiring 教訓（2026-04-13）

### L-ANALYTICS-001: 共有型追加は definition → types/index → package index → consumer wiring を 1 wave で閉じる

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `packages/shared/src/types/skill-analytics.ts` を追加しても、`types/index.ts` と `packages/shared/index.ts` の barrel 再公開を忘れると consumer（agentSlice 等）でインポートできない |
| 原因       | barrel export チェーンの各層が独立しており、どこか 1 段を抜かすと型が解決されない |
| 解決策     | 型ファイル作成と同時に `types/index.ts` / `packages/shared/index.ts` / consumer wiring を同じ wave（同一コミット前）で完結させる |
| 標準ルール | shared 型追加タスクの Phase 2 チェックリストに「barrel 再公開 3 点確認」を必須項目として含める |
| 関連タスク | UT-W3-ANALYTICS-STORE-INTEGRATION-001 |

### L-ANALYTICS-002: helper-based payload conversion は `as unknown as` 依存より追跡しやすい

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `analyticsSlice.ts` で直接 `as unknown as AnalyticsPayload` とキャストすると、型が変わった際に追跡箇所が散在する |
| 原因       | 型変換ロジックが呼び出しサイトに埋め込まれている |
| 解決策     | `toAnalyticsPayload(event: SkillAnalyticsEvent)` のような helper を 1 箇所に集約し、型変換の責務を分離する |
| 標準ルール | analytics transport 用 payload 変換は必ず named helper に集約し、呼び出しサイトでの inline キャストを禁止する |
| 関連タスク | UT-W3-ANALYTICS-STORE-INTEGRATION-001 |

### L-ANALYTICS-003: analytics adapter の silent error 設計は意図的 — ただしログ戦略を先に決める

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `analyticsSlice.ts` の try-catch が空だと adapter 送信失敗を検出できず、テレメトリ喪失が無音で起きる |
| 原因       | UI を壊さないため adapter エラーをサイレントにするが、デバッグ可視性を犠牲にしている |
| 解決策     | silent catch は維持しつつ、開発環境（`process.env.NODE_ENV === "development"`）では `console.warn` を出す方針を仕様で明記する |
| 標準ルール | analytics adapter の catch 節には「本番: silent / 開発: console.warn」ポリシーをコメントで記載し、意図的な設計であることを明示する |
| 関連タスク | UT-W3-ANALYTICS-STORE-INTEGRATION-001 |
| 症状       | `system-spec-update-summary.md` に LOGS.md × 2 / topic-map.md / resource-map.md の更新記録を含めていなかったため、外部同期が完了しているかの判断が Phase 12 証跡だけでは不明瞭になった |
| 原因       | Phase 12 の `system-spec-update-summary.md` テンプレートに「外部同期先一覧」の項目がなかった |
| 解決策     | Phase 12 closing 時に `system-spec-update-summary.md` の Step 1-A に「LOGS.md × 2 + topic-map.md + resource-map.md」の更新記録を必ず含めるよう明文化した |
| 再発防止   | Phase 12 spec（`docs/30-workflows/*/phase-12-documentation.md`）の Task 12-2 Step 1-A に「外部同期先一覧」列を追加する |


## TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 VisualCronPicker UIバリデーション 教訓（2026-04-13）

### L-VALCROP-001: UI層とバリデーション責務分離

| 項目       | 内容 |
| ---------- | ---- |
| 課題       | `cronConverter` 純粋関数と UI層のバリデーション責務が混在すると、UI固有のエラーフィードバックを純粋関数側に持ち込んでしまい、関数の副作用が増える |
| 解決策     | `cronConverter` は純粋関数ガード（例: weekdays=[]時にInvalidConfigErrorをスロー）に専念し、UI層でのエラーメッセージ表示・`onValidationChange` コールバック通知は `VisualCronPicker` コンポーネントが担当する |
| 標準ルール | 純粋関数は入力→出力の変換のみ。ユーザーへの UX フィードバックは UI コンポーネント側で完結させる |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |

### L-VALCROP-002: weekly/monthly モード別バリデーション

| 項目       | 内容 |
| ---------- | ---- |
| 課題       | `weekly` モードと `monthly` モードでバリデーションルールが異なるため、汎用バリデーションでは誤検知・見落としが起きる |
| 解決策     | `weekly` モードは weekdays=[] を無効とし、`monthly` モードは dayOfMonth が 1〜31 範囲外を無効とするモード別チェックを実装した |
| 標準ルール | スケジュールモードごとに独立したバリデーションロジックを定義し、それぞれ独立したテストケースで検証する |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |

### L-VALCROP-003: onValidationChange コールバック設計（省略可能プロップ・useEffect 安定化）

| 項目       | 内容 |
| ---------- | ---- |
| 課題       | `onValidationChange` が必須プロップだと呼び出し側の変更コストが大きく、`useEffect` 依存配列に含めると親がインライン関数を渡した際に無限ループが発生する |
| 解決策     | `onValidationChange?: (isValid: boolean) => void` として省略可能にし、`useEffect` の依存配列から除外するか `useCallback` で安定参照を保証することで無限レンダリングを防ぐ |
| 標準ルール | コールバック系プロップは省略可能にし、Effect 安定性を設計時に考慮する |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |

### L-VALCROP-004: monthly dayOfMonth のUI責務

| 項目       | 内容 |
| ---------- | ---- |
| 課題       | `dayOfMonth` の範囲バリデーション（1〜31）をどちらが担うか曖昧だと、純粋関数側に UI 依存ロジックが混入する |
| 解決策     | 現状は UI 側（`VisualCronPicker`）のみで 1〜31 範囲チェックを行い、純粋関数ガードとしての `cronConverter` 側ガードは別タスクに切り出した |
| 標準ルール | UI 即時フィードバック用バリデーションは UI コンポーネント、純粋関数の防御的ガードは別タスクで段階的に追加する |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 / TASK-CRON-ERROR-STYLE-UNIFICATION-001 |

### L-VALCROP-005: Phase 11 smoke test 必須（UI表示確認→スクリーンショット順序）

| 項目       | 内容 |
| ---------- | ---- |
| 課題       | Phase 11 でスクリーンショットを先に撮ろうとすると、コンポーネントが初期値なしでレンダリングされエラー表示が再現できないケースがある |
| 解決策     | `value=` 初期値注入で各シナリオ（weekly empty weekdays / valid weekdays / monthly invalid date / valid date）を固定してから、smoke test でUI表示を確認し、その後スクリーンショットを撮る順序を徹底する |
| 標準ルール | Phase 11 は「UI表示確認 → スクリーンショット」の順序を必須とし、初期値注入によるシナリオ再現を前提とする |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |


## TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 月次ガード処理 教訓（2026-04-13）

### L-MTHGRD-001: `Number.isInteger` で NaN/小数/Infinity を一度に排除する

- タスク: TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 / AC-3
- 症状: `dayOfMonth < 1 || dayOfMonth > 31` の範囲比較だけでは NaN が素通りする（`NaN < 1` は `false`、`NaN > 31` も `false`）
- 解決策: 範囲比較の前に `Number.isInteger(dayOfMonth)` を置く。これにより NaN・小数・Infinity を単一条件で排除できる
- 再発防止: cron フィールドの境界バリデーションは `Number.isInteger` チェックを先頭に置くパターンを標準化する

### L-MTHGRD-002: 生成側と解析側の双方向ガードをセットで実装する

- タスク: TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001
- 症状: `cronConverter.ts`（生成側）にガードを追加しても、`cronParser.ts`（解析側）が不正 monthly を custom にフォールバックしないと、UI 初期化時に不正な monthly 値が表示される
- 解決策: 生成側のガード追加と同時に、`cronParser.ts` でも monthly の `dayOfMonth` が 1〜31 外なら `custom` にフォールバックさせた
- 再発防止: converter/parser の双方向性を持つ関数を変更するときは、反対方向の関数も同時に回帰テストに含める

### L-MTHGRD-003: switch-case ガードはブロック構文 + 早期リターンの対称パターンで統一する

- タスク: TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001
- 症状: `weekly` ガードと `monthly` ガードで構文スタイルが異なると、コードレビュー時に意図の差があるように見える
- 解決策: `case "weekly": { if (...) return ""; }` の対称パターンで `monthly` ブロックも実装した
- 再発防止: switch-case 内の各周期タイプには `{}` ブロック + 早期リターンパターンを一貫して適用する


## TASK-SW-FIX-DATAFLOW-001: SkillCreateWizard コンテキストブリッジ実装 教訓（2026-04-13）

### L-DATAFLOW-001: NON_VISUAL タスクの Phase 11 代替証跡パターン

| 項目       | 内容                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Phase 11 を VISUAL（スクリーンショット必須）のまま設計すると、UIを介さないデータフロー修正でも screenshot 前提が残り、証跡が作れずブロックされる                                                                 |
| 原因       | Phase 1 の `taskType: implementation` 分類時に `NON_VISUAL` 判定を行っていなかったため、Phase 11 テンプレートがデフォルトの VISUAL フローになった                                                                |
| 解決策     | `NON_VISUAL` 再分類で `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` の代替証跡へ切り替え、スクリーンショット要求を削除した                                                       |
| 再発防止   | Phase 1 の要件定義で「UI画面キャプチャが不要なタスク（ユーティリティ・型定義・データフロー修正）」は `visualType: NON_VISUAL` を明示する。Phase 11 spec 先頭に `NON_VISUAL` フラグを記載しておくことで混乱を防ぐ |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                                         |

### L-DATAFLOW-002: artifacts.json / outputs/artifacts.json の 2点 parity 確保

| 項目       | 内容                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `docs/30-workflows/*/artifacts.json`（root）と `docs/30-workflows/*/outputs/artifacts.json`（outputs）が異なる phase status を持っていたため、Phase 12 compliance check の parity 条件を満たせなかった |
| 原因       | Phase 11 完了時に root `artifacts.json` のみ更新し、`outputs/artifacts.json` を同波更新していなかった                                                                                                  |
| 解決策     | Phase 12 着手前チェックとして「root `artifacts.json` と `outputs/artifacts.json` の2点 diff が0件か確認する」ステップを追加し、同一内容で再生成した                                                    |
| 再発防止   | Phase 12 spec の事前チェックリストに「root ↔ outputs `artifacts.json` 同一性確認」を必須項目として明記する（L-CLM-003 の台帳3点同期パターンと組み合わせる）                                            |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                               |

### L-DATAFLOW-003: IPC 経路を通じた context bridge の後方互換設計

| 項目       | 内容                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 背景       | `SkillCreateWizard.tsx` → `agentSlice.ts` → `skill-api.ts` → `skillHandlers.ts` の 4 層を通じて `SkillCreationContext` を伝播させる際、既存呼び出し（context なし）を壊さない必要があった |
| 解決策     | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続                      |
| 設計原則   | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない                                                              |
| 適用条件   | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル）                                                                                                          |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                  |
| 再発防止   | `complete-phase.js` 実行前に `jq '.artifacts                                                                                                                                              | keys' artifacts.json`と`outputs/artifacts.json` を diff して0件を確認する |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                                             |


## TASK-SW-FIX-FEEDBACK-001: SkillWizard フィードバックループ修正 教訓（2026-04-13）

### L-FEEDBACK-001: LLM モードと template モードで fetchSkills 責務が異なる

| 項目       | 内容                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | LLM モード（`handleExecutePlan`）の成功後にスキル一覧が更新されず、新規作成スキルが一覧に表示されない                                           |
| 原因       | template モードは `createSkill`（agentSlice）内部で `fetchSkills` を呼ぶが、LLM モードは独立した実行パスのため `fetchSkills` 明示呼び出しが必要 |
| 解決策     | `handleExecutePlan` の成功パス末尾に `await fetchSkills()` を追加。失敗時は遷移阻害を防ぐため独立した try/catch でswallow する                  |
| 再発防止   | LLM モード専用の regression test case（TC-FEEDBACK-001）を設けて `fetchSkills` が1回呼ばれることを固定する                                      |
| 関連タスク | TASK-SW-FIX-FEEDBACK-001                                                                                                                        |

### L-FEEDBACK-002: skillPath null ガードと成功ヘッダーはセットで設計する

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `skillPath === null` のままでも `CompleteStep` が成功ヘッダーを表示し、ユーザーが作成失敗を認識できなかった                        |
| 原因       | `skillPath !== null` の条件チェックが成功ヘッダーと early return（エラーUI）で分離されておらず、null 時の表示制御が不完全だった    |
| 解決策     | early return でエラーUI を返し（`skillPath === null` 時）、成功ヘッダーは `skillPath !== null` の場合のみ表示する2層ガードを設ける |
| 設計原則   | 成功表示と失敗ガードは同一コンポーネント内で同時に設計する。片方だけ修正すると UI 矛盾が生じる                                     |
| 関連タスク | TASK-SW-FIX-FEEDBACK-001                                                                                                           |

### L-FEEDBACK-003: Electron では runtime より Vite build キャプチャが安定

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Electron 実行環境での画面キャプチャが不安定で Phase 11 証跡取得が困難だった                                                                                            |
| 解決策     | Vite build 後に Playwright で `current_build` を固定した capture script（`capture-task-skill-fix-feedback-phase11.mjs`）を追加することで安定した証跡取得が可能になった |
| 適用条件   | VISUAL タスクの Phase 11 証跡取得時（Electron renderer コンポーネントのスクリーンショット）                                                                            |
| 再発防止   | Phase 11 capture script には `try { ... } finally { browser.close(); server.close(); }` パターンでポート解放を確実にする（既存フィードバック FB-MSO-003 と同方針）     |
| 関連タスク | TASK-SW-FIX-FEEDBACK-001                                                                                                                                               |
