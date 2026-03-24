# Phase 6: テスト拡充 - Edge Case マトリクス

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase      | 6                                              |
| 作成日     | 2026-03-24                                     |
| 依存Phase  | Phase 4-5                                      |
| 成果物種別 | edge-case-matrix                               |

## Edge Case 一覧

| ID    | ケース名                                 | 前提条件                                                               | 操作                                                                                | 期待結果                                                                                           | 優先度 |
| ----- | ---------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| EC-01 | 同一 view での二重クリック               | `currentView` が `dashboard`                                           | CTA を 100ms 以内に 2 回クリック                                                    | `setCurrentView("executionConsole")` は 2 回呼ばれるが、viewHistory に連続重複エントリが入らない   | 高     |
| EC-02 | 既に executionConsole 表示中の再クリック | `currentView` が `executionConsole`                                    | いずれかの surface の CTA をクリック                                                | viewHistory に `executionConsole` が連続追加されない。View が再マウントされない                    | 高     |
| EC-03 | unavailable 状態での CTA disabled        | executionConsole が利用不可状態（後続タスク依存サービス未起動）        | CTA ボタンをクリック                                                                | ボタンが `disabled` 状態。`openExecutionConsole()` が呼ばれない。tooltip で理由が表示される        | 高     |
| EC-04 | unavailable から available への復帰      | 一度 unavailable 状態を経由                                            | 依存サービスが起動した後に CTA をクリック                                           | CTA が enabled に復帰し、クリックで `executionConsole` に正常遷移する                              | 中     |
| EC-05 | narrow width でのラベル省略              | viewport width が 768px 未満（mobile breakpoint）                      | App Shell nav item を確認                                                           | ラベルが `実行` に省略される。`aria-label` に `実行コンソール` が設定されている                    | 中     |
| EC-06 | narrow width での CTA 機能維持           | viewport width が 768px 未満                                           | 省略ラベルの nav item をクリック                                                    | `openExecutionConsole()` が呼ばれ、`executionConsole` に遷移する                                   | 高     |
| EC-07 | StrictMode リスナー二重登録防御          | React.StrictMode 有効（開発モード）                                    | ChatPanel の CTA をクリック                                                         | `openExecutionConsole()` が 1 回だけ呼ばれる（P5 準拠）                                            | 高     |
| EC-08 | unmount 後の stale handler 防御          | ChatPanel を表示後、別 view に遷移（unmount）して再度 ChatPanel を表示 | ChatPanel の CTA をクリック                                                         | stale handler が残存せず、新しい handler のみが発火する。`openExecutionConsole()` が 1 回呼ばれる  | 高     |
| EC-09 | label regression: `terminal` UI 露出     | Phase 5 実装完了後のコードベース                                       | `grep -rn "ターミナルを開く" apps/desktop/src/renderer`                             | 結果が 0 件。CTA / heading / nav label に `terminal` / `ターミナル` が主導線ラベルとして存在しない | 高     |
| EC-10 | label regression: `terminal を開く` 露出 | Phase 5 実装完了後のコードベース                                       | `grep -rn "terminal を開く" apps/desktop/src/renderer`                              | 結果が 0 件                                                                                        | 高     |
| EC-11 | agent 代替遷移の完全除去                 | Phase 5 実装完了後のコードベース                                       | `grep -rn 'setCurrentView.*agent' apps/desktop/src/renderer` で terminal 文脈を検索 | terminal 代替としての `setCurrentView("agent")` が 0 件。agent view 自体の正当な遷移は許可         | 高     |
| EC-12 | no-op CTA の不在                         | 全 4 surface のコードベース                                            | 全 CTA の handler を静的解析で検証                                                  | handler が `undefined` / `() => {}` / `console.warn` のみの no-op パターンが 0 件                  | 高     |
| EC-13 | viewHistory 上限時の遷移                 | viewHistory が最大長（実装依存）に達している状態                       | CTA をクリックして executionConsole に遷移                                          | viewHistory の overflow が発生せず、正常に遷移する。古いエントリが適切に破棄される                 | 低     |
| EC-14 | 複数 surface から同時トリガー            | ChatPanel と App Shell が同時に表示されている                          | 両方の CTA をほぼ同時にクリック（race condition）                                   | 最終的に `currentView` が `executionConsole` になる。viewHistory が壊れない                        | 中     |
| EC-15 | dispatcher 未接続時の fallback           | `createGuidanceActionDispatcher` に `openExecutionConsole` を渡し忘れ  | LLMGuidanceBanner の secondary CTA をクリック                                       | silent fail（no-op）ではなく、明示的なエラーまたは warning が発生する                              | 中     |
| EC-16 | icon-only 表示のアクセシビリティ         | ラベル非表示の icon-only モード（将来的な compact sidebar）            | スクリーンリーダーで nav item をフォーカス                                          | `aria-label="実行コンソール"` が読み上げられる                                                     | 中     |

## 優先度別サマリー

| 優先度 | ケース数 | ケース ID                                                            |
| ------ | -------- | -------------------------------------------------------------------- |
| 高     | 10       | EC-01, EC-02, EC-03, EC-06, EC-07, EC-08, EC-09, EC-10, EC-11, EC-12 |
| 中     | 5        | EC-04, EC-05, EC-14, EC-15, EC-16                                    |
| 低     | 1        | EC-13                                                                |

## カテゴリ別分類

| カテゴリ               | ケース ID           | Phase 4 テスト群との対応 |
| ---------------------- | ------------------- | ------------------------ |
| Repeated Open          | EC-01, EC-02, EC-14 | R群の境界値拡張          |
| Unavailable State      | EC-03, EC-04        | C群の状態拡張            |
| Compact / Narrow Width | EC-05, EC-06, EC-16 | C群のレスポンシブ拡張    |
| Stale Handler Guard    | EC-07, EC-08        | R群の P5 準拠ガード      |
| Label Regression Guard | EC-09, EC-10        | L群の回帰防止拡張        |
| Negative Path          | EC-11, EC-12, EC-15 | N群の網羅性拡張          |
| History / State        | EC-13               | R群の上限境界値          |

## Phase 7 への引継ぎ

- 高優先度 10 ケースは Phase 7 の coverage gate 必須要件に含める
- 中優先度 5 ケースは coverage 推奨要件に含める
- 低優先度 1 ケースは Phase 7 gate には含めず、Phase 8 リファクタリング後に判断する
