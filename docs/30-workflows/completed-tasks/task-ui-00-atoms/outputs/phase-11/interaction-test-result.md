# インタラクション + キーボードテスト結果 -- TASK-UI-00-ATOMS Phase 11

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| タスクID | TASK-UI-00-ATOMS                    |
| Phase    | 11 -- 手動テスト Task 3 + Task 4    |
| 検証日   | 2026-02-23                          |
| 検証方法 | コード分析ベース + 実機確認要否判定 |

## Task 3: インタラクションテスト結果

| #   | テスト項目                                        | 期待結果                                            | 判定        | 備考                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------- | --------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18  | FilterChip クリックで選択/非選択切替              | `isSelected` 状態が反転、視覚的フィードバックあり   | PASS        | `onClick` コールバックがクリック時に呼び出されることをテストコードで検証済み（FilterChip.test.tsx インタラクション describe）。`disabled` ガードも実装・テスト済み。選択/非選択の視覚的フィードバックは CSS クラスの切替（`bg-[var(--status-primary)]` / `bg-[var(--bg-tertiary)]`）で実装。`transition-all duration-[var(--duration-fast)]` による遷移アニメーション付き。 |
| 19  | FilterChip ホバーで背景色変化                     | ホバー状態が明確に視認できる                        | CONDITIONAL | FilterChip の実装コードにはホバー専用のスタイル（`hover:` プレフィックス）が明示的に定義されていない。`transition-all` でスムーズな遷移は設定されているが、ホバー時の背景色変化は CSS / テーマ側の設定に依存する。実機でのホバー状態確認が必要。                                                                                                                            |
| 20  | SuggestionBubble ホバーで scale 拡大              | `scale(1.02)` 〜 `scale(1.05)` の控えめな拡大       | PASS        | `hover:scale-[1.02]` クラスが実装コードに存在。テストコードで `hover:scale-[1.02]` クラスの適用を検証済み（SuggestionBubble.test.tsx MI-01）。合わせて `hover:bg-[var(--bg-elevated)]` と `hover:shadow-sm` も適用される。                                                                                                                                                  |
| 21  | SuggestionBubble クリックで success-bounce        | バウンスアニメーション後に onClick コールバック発火 | CONDITIONAL | `onClick` コールバックの発火はテストコードで検証済み。ただし SuggestionBubble 自体には success-bounce アニメーション（`animate-bounce`）は実装されていない。Phase 10 MINOR M-3 で指摘の通り、バウンスアニメーションは EmptyState の `mood="celebrating"` でアイコンラッパーに適用される。SuggestionBubble 単体でのバウンスは実機確認が必要。                                |
| 22  | SuggestionBubble アクティブ状態（押下中）         | 押下中は scale がわずかに縮小                       | PASS        | `active:scale-[0.98]` クラスが実装コードに存在。テストコードで `active:scale-[0.98]` クラスの適用を検証済み（SuggestionBubble.test.tsx MI-02）。                                                                                                                                                                                                                            |
| 23  | StatusIndicator running 時の pulse アニメーション | 脈動が自然で目障りでない、1-2秒の間隔               | CONDITIONAL | `status="running"` でデフォルトの `animate-pulse` クラスが適用される。テストコードで検証済み。`animate-pulse` は Tailwind CSS のデフォルトアニメーション（2秒間隔、opacity 0 → 1 → 0）。脈動の「自然さ」と「目障りでないか」は主観的評価のため実機確認が必要。                                                                                                              |
| 24  | StatusIndicator pulse={false} で停止              | running でも pulse アニメーションが停止             | PASS        | `pulse={false}` で `animate-pulse` クラスが付与されないことをテストコードで検証済み（StatusIndicator.test.tsx パルスアニメーション describe）。実装コードの `const isPulse = pulse ?? status === "running"` で `pulse=false` が明示指定時に false になる。                                                                                                                  |
| 25  | SkeletonCard パルスアニメーション                 | 明滅が自然、速すぎず遅すぎない（1-2秒間隔）         | CONDITIONAL | `animate-pulse` クラス適用をテストコードで検証済み。`animate=true`（デフォルト）と `animate=false` の両パターンをテスト済み。Tailwind の `animate-pulse` は2秒間隔の opacity アニメーション。「自然さ」は主観評価のため実機確認が必要。                                                                                                                                     |
| 26  | RelativeTime 時間経過での表示更新                 | 「3秒前」→「1分前」のように自動更新される           | PASS        | `setInterval` による定期更新が実装されている。テストコードで `vi.advanceTimersByTime(60000)` による表示更新（「たった今」→「1分前」）を検証済み。カスタム `refreshInterval` 対応もテスト済み。`clearInterval` によるクリーンアップもテスト済み。                                                                                                                            |
| 27  | EmptyState suggestions クリック                   | suggestions 内のアクション要素がクリック可能        | PASS        | `suggestions` 配列内の各要素が `SuggestionBubble` としてレンダリングされ、各 `onClick` がクリック時に呼ばれることをテストコードで検証済み（EmptyState.test.tsx suggestions describe）。`role="button"` 要素の個数検証と個別クリックコールバック検証が存在。                                                                                                                 |

## Task 4: キーボード操作テスト結果

| #   | テスト項目                                        | 期待結果                                            | 判定        | 備考                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------- | --------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 28  | SuggestionBubble: Tab でフォーカス移動            | フォーカスリングが明確に表示される                  | CONDITIONAL | `tabIndex={0}` が設定されテストコードで検証済み。フォーカス可能であることをテストで確認（SuggestionBubble.test.tsx F-01）。ただしフォーカスリングの視覚的な「明確さ」（色、太さ、コントラスト）はブラウザデフォルトまたは CSS のフォーカススタイルに依存するため実機確認が必要。                                                     |
| 29  | SuggestionBubble: Enter で onClick 発火           | クリックと同じ動作（success-bounce + コールバック） | PASS        | `handleKeyDown` で `e.key === "Enter"` を処理し `onClick()` を呼び出す実装あり。テストコードで Enter キーによる `onClick` 発火を検証済み（SuggestionBubble.test.tsx キーボード操作 describe）。                                                                                                                                      |
| 30  | SuggestionBubble: Space で onClick 発火           | Enter と同じ動作                                    | PASS        | `handleKeyDown` で `e.key === " "` を処理し、`e.preventDefault()` 後に `onClick()` を呼び出す実装あり。テストコードで Space キーによる `onClick` 発火を検証済み。`disabled` 時の Space キー無効化もテスト済み（UE-02）。                                                                                                             |
| 31  | FilterChip: Tab でフォーカス移動                  | フォーカスリングが明確に表示される                  | CONDITIONAL | `<button>` 要素として実装されているためネイティブでフォーカス可能。テストコードでフォーカス可能性を検証済み（FilterChip.test.tsx F-02）。フォーカスリングの視覚的な品質はブラウザデフォルトまたは CSS に依存するため実機確認が必要。                                                                                                 |
| 32  | FilterChip: Enter で選択切替                      | クリックと同じ動作                                  | PASS        | `<button>` 要素のため、ネイティブの Enter キー処理で `onClick` が発火する。テストコードでクリック時の `onClick` 発火を検証済み。`<button>` のネイティブキーボード操作として Enter は標準動作。                                                                                                                                       |
| 33  | FilterChip: Space で選択切替                      | Enter と同じ動作                                    | PASS        | `<button>` 要素のため、ネイティブの Space キー処理で `onClick` が発火する。`<button>` のネイティブキーボード操作として Space は標準動作。                                                                                                                                                                                            |
| 34  | EmptyState action: Tab でフォーカス、Enter で実行 | アクションボタンがキーボード操作可能                | PASS        | `action` が `ActionObject` 形式の場合は `<Button>` コンポーネント（`<button>` 要素）としてレンダリングされる。テストコードで `action` オブジェクトのクリック発火を検証済み。`<button>` 要素のためネイティブのキーボード操作（Tab / Enter / Space）が利用可能。ReactNode 形式の場合は渡された要素のキーボードアクセシビリティに依存。 |

## テスト結果サマリー

### Task 3: インタラクション

| 判定        | 件数 |
| ----------- | ---- |
| PASS        | 5    |
| CONDITIONAL | 5    |
| FAIL        | 0    |

### Task 4: キーボード操作

| 判定        | 件数 |
| ----------- | ---- |
| PASS        | 5    |
| CONDITIONAL | 2    |
| FAIL        | 0    |

### Task 3 + Task 4 合計

| 判定        | 件数 |
| ----------- | ---- |
| PASS        | 10   |
| CONDITIONAL | 7    |
| FAIL        | 0    |

## 要実機確認項目

### インタラクション（Task 3）

1. **#19 FilterChip ホバー背景色変化**: 明示的な `hover:` スタイルが未定義。ホバー時の視覚的フィードバックの有無と品質
2. **#21 SuggestionBubble success-bounce**: SuggestionBubble 単体でのバウンスアニメーション。Phase 10 MINOR M-3 で EmptyState 側の責務と確認済みだが、仕様との対応を確認
3. **#23 StatusIndicator pulse の自然さ**: `animate-pulse` の2秒間隔 opacity アニメーションが「目障りでない」品質か
4. **#25 SkeletonCard pulse の自然さ**: `animate-pulse` の明滅が「速すぎず遅すぎない」品質か

### キーボード操作（Task 4）

5. **#28 SuggestionBubble フォーカスリング**: フォーカスリングの視覚的品質（色、太さ、背景とのコントラスト）
6. **#31 FilterChip フォーカスリング**: フォーカスリングの視覚的品質（色、太さ、背景とのコントラスト）

## Phase 10 MINOR 指摘関連の確認

### M-3: SuggestionBubble success-bounce の責務

テスト #21 に関連。SuggestionBubble コンポーネント自体には `animate-bounce` は実装されていない。バウンスアニメーションは EmptyState コンポーネントの `mood="celebrating"` でアイコンラッパー（`data-testid="icon-wrapper"`）に `animate-bounce` が適用される。

この責務分離は Phase 10 で確認済みであり、SuggestionBubble 単体でのバウンスは仕様から除外されている。EmptyState 経由での使用時に celebrating mood のアニメーションとして機能する。
