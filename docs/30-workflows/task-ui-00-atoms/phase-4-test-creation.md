# Phase 4: テスト作成（TDD: Red） - TASK-UI-00-ATOMS

## メタ情報

| 項目               | 値                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| タスクID           | TASK-UI-00-ATOMS                                                                                  |
| Phase              | 4（テスト作成）                                                                                   |
| 前提Phase          | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー PASS）                                |
| 目的               | 7コンポーネント分のテストコードを TDD Red フェーズとして作成し、全テストが FAIL する状態にする    |
| 成果物ディレクトリ | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-4/` |

## 目的

Phase 5（実装）に先立ち、7コンポーネント（StatusIndicator・FilterChip・Badge拡張・SkeletonCard・SuggestionBubble・EmptyState拡張・RelativeTime）のテストコードを作成する。TDD Red フェーズとして、全ての新規テストがコンパイルエラーまたは FAIL となる状態を確認する。既存テスト（Badge 17件・EmptyState 7件）は PASS を維持する。

## 背景

- Atomic Design の基盤コンポーネントであり、Molecules / Organisms の前提条件
- TDD（Red → Green → Refactor）サイクルの Red フェーズに該当
- テストファーストにより、実装前にインターフェース契約と期待動作を確定させる
- 既存コンポーネント（Badge・EmptyState）のテストは後方互換性の検証も兼ねる

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 4-1: StatusIndicator テスト作成

**目的**: StatusIndicator の6ステータス・3サイズ・pulseアニメーション・ARIA属性を検証するテストを作成する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/StatusIndicator/` ディレクトリを作成する
2. `StatusIndicator.test.tsx` を作成する
3. 以下のテストケースを実装する:

| #   | テストケース                                                          | 検証内容                                          |
| --- | --------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | `status="running"` でステータスカラークラスが適用される               | `--status-primary` に対応するクラスの存在         |
| 2   | `status="success"` でステータスカラークラスが適用される               | `--status-success` に対応するクラスの存在         |
| 3   | `status="error"` でステータスカラークラスが適用される                 | `--status-error` に対応するクラスの存在           |
| 4   | `status="warning"` でステータスカラークラスが適用される               | `--status-warning` に対応するクラスの存在         |
| 5   | `status="idle"` でステータスカラークラスが適用される                  | `--text-muted` に対応するクラスの存在             |
| 6   | `status="offline"` でステータスカラークラスが適用される               | `--text-muted` に対応するクラスの存在             |
| 7   | `status="offline"` で破線ボーダーが適用される                         | `border-dashed` クラスの存在                      |
| 8   | `status="running"` でデフォルト pulse アニメーションが適用される      | `animate-pulse` 系クラスの存在                    |
| 9   | `pulse=false` でアニメーションが無効化される                          | `animate-pulse` 系クラスの不在                    |
| 10  | `status="idle"` + `pulse=true` でアニメーションが有効化される         | `animate-pulse` 系クラスの存在                    |
| 11  | `size="sm"` で幅・高さ 8px が適用される                               | `w-2 h-2` または `w-[8px] h-[8px]` 系クラスの存在 |
| 12  | `size="md"`（デフォルト）で幅・高さ 10px が適用される                 | `w-[10px] h-[10px]` 系クラスの存在                |
| 13  | `size="lg"` で幅・高さ 14px が適用される                              | `w-[14px] h-[14px]` 系クラスの存在                |
| 14  | `role="status"` 属性が設定される                                      | `screen.getByRole("status")` の存在               |
| 15  | デフォルトで `aria-label="ステータス: {status}"` が設定される         | `aria-label` 属性値の一致                         |
| 16  | `label` props で `aria-label` が上書きされる                          | カスタム `label` 値の一致                         |
| 17  | 3テーマ（kanagawa-dragon/light/dark）でレンダリングエラーが発生しない | `renderWithAllThemes` でエラーなし                |

**成果物パス**: `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`

---

### Task 4-2: FilterChip テスト作成

**目的**: FilterChip の選択/非選択スタイル・onClick・disabled・count/icon・ARIA属性を検証するテストを作成する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/FilterChip/` ディレクトリを作成する
2. `FilterChip.test.tsx` を作成する
3. 以下のテストケースを実装する:

| #   | テストケース                                              | 検証内容                                                        |
| --- | --------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | ラベルテキストが表示される                                | `screen.getByText(label)` の存在                                |
| 2   | `isSelected=false` で非選択スタイルが適用される           | `--bg-tertiary` / `--text-secondary` 系クラスの存在             |
| 3   | `isSelected=true` で選択スタイルが適用される              | `--status-primary` / `--text-inverse` 系クラスの存在            |
| 4   | クリック時に `onClick` が呼ばれる                         | `fireEvent.click` 後に `onClick` mock が1回呼ばれる             |
| 5   | `disabled=true` 時にクリックしても `onClick` が呼ばれない | `fireEvent.click` 後に `onClick` mock が0回                     |
| 6   | `count` が指定された場合にカウント表示される              | `(count)` テキストの存在                                        |
| 7   | `icon` が指定された場合にアイコンが表示される             | アイコン要素の存在                                              |
| 8   | `role="checkbox"` 属性が設定される                        | `screen.getByRole("checkbox")` の存在                           |
| 9   | `isSelected=true` で `aria-checked="true"` が設定される   | `aria-checked` 属性値                                           |
| 10  | `isSelected=false` で `aria-checked="false"` が設定される | `aria-checked` 属性値                                           |
| 11  | `disabled=true` で `aria-disabled="true"` が設定される    | `aria-disabled` 属性値                                          |
| 12  | 最小タッチターゲット 36×36px が確保される                 | `min-height`/`min-width` 系クラスまたはインラインスタイルの存在 |
| 13  | 3テーマでレンダリングエラーが発生しない                   | `renderWithAllThemes` でエラーなし                              |

**成果物パス**: `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`

---

### Task 4-3: Badge テスト拡張

**目的**: 既存 Badge テスト 17件の PASS を維持しつつ、`primary` variant・`content` props・数値 `aria-label` 自動付与の拡張テストを追加する

**実行手順**:

1. 既存テスト17件が PASS することを確認する（`cd apps/desktop && pnpm vitest run src/renderer/components/atoms/Badge/Badge.test.tsx`）
2. 既存テストファイルの末尾に新規 `describe` ブロックを追加する
3. 以下の新規テストケースを追加する:

| #   | テストケース                                                           | 検証内容                                                          |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 18  | `variant="primary"` でプライマリスタイルが適用される                   | `--status-primary` 背景 + `--text-inverse` テキスト系クラスの存在 |
| 19  | `content="テスト"` で文字列コンテンツが表示される                      | `screen.getByText("テスト")` の存在                               |
| 20  | `content={42}` で数値コンテンツが表示される                            | `screen.getByText("42")` の存在                                   |
| 21  | `content` が `number` 型で `aria-label="{content}件"` が自動設定される | `aria-label="42件"` 属性値                                        |
| 22  | 明示的な `aria-label` が指定された場合に自動付与より優先される         | 明示値の一致                                                      |
| 23  | `content` と `children` の両方指定時に `children` が優先される         | `children` テキストの存在、`content` テキストの不在               |
| 24  | `content` のみ指定（`children` なし）で `content` が表示される         | `content` テキストの存在                                          |
| 25  | 3テーマでレンダリングエラーが発生しない                                | `renderWithAllThemes` でエラーなし                                |

**後方互換性の検証方法**: テスト実行前に既存17件が全て PASS することを確認する。既存テストのアサーション（`bg-gray-600`, `bg-green-500` 等のクラス名チェック）は、デザイントークン移行後にクラス名が変わるため、Phase 5 実装後に更新する必要がある。Phase 4 時点では既存テストを変更しない。

**成果物パス**: `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`（既存ファイル末尾に追加）

---

### Task 4-4: SkeletonCard テスト作成

**目的**: SkeletonCard の3バリエーション内部構造・animate制御・カスタムプロパティ・ARIA属性を検証するテストを作成する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/SkeletonCard/` ディレクトリを作成する
2. `SkeletonCard.test.tsx` を作成する
3. 以下のテストケースを実装する:

| #   | テストケース                                                                                     | 検証内容                                    |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| 1   | `variant="default"` でヘッダーライン（幅60%）とボディライン2本（幅80%/100%）がレンダリングされる | 内部要素のスタイル/クラス確認               |
| 2   | `variant="stat"` で数値プレースホルダー（幅40%）とラベルライン（幅60%）がレンダリングされる      | 内部要素のスタイル/クラス確認               |
| 3   | `variant="list-item"` でアイコン円（32px）とテキストライン2本（幅70%/50%）がレンダリングされる   | 内部要素のスタイル/クラス確認               |
| 4   | デフォルトで `variant="default"` が使用される                                                    | default バリエーション構造の確認            |
| 5   | `animate=true`（デフォルト）でパルスアニメーションクラスが適用される                             | `animate-pulse` 系クラスの存在              |
| 6   | `animate=false` でパルスアニメーションが無効化される                                             | `animate-pulse` 系クラスの不在              |
| 7   | `height` プロパティでカスタム高さが適用される                                                    | `style.height` または対応クラスの存在       |
| 8   | `borderRadius` プロパティでカスタム角丸が適用される                                              | `style.borderRadius` または対応クラスの存在 |
| 9   | `role="status"` が設定される                                                                     | `screen.getByRole("status")` の存在         |
| 10  | `aria-label="読み込み中"` が設定される                                                           | `aria-label` 属性値の一致                   |
| 11  | `aria-busy="true"` が設定される                                                                  | `aria-busy` 属性値の一致                    |
| 12  | 背景色に `--bg-tertiary` トークンが使用される                                                    | 対応するクラスまたはスタイルの存在          |
| 13  | 3テーマでレンダリングエラーが発生しない                                                          | `renderWithAllThemes` でエラーなし          |

**成果物パス**: `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`

---

### Task 4-5: SuggestionBubble テスト作成

**目的**: SuggestionBubble の3サイズ・onClick・disabled・icon・キーボード操作・ARIA属性を検証するテストを作成する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/SuggestionBubble/` ディレクトリを作成する
2. `SuggestionBubble.test.tsx` を作成する
3. 以下のテストケースを実装する:

| #   | テストケース                                              | 検証内容                                                  |
| --- | --------------------------------------------------------- | --------------------------------------------------------- |
| 1   | ラベルテキストが表示される                                | `screen.getByText(label)` の存在                          |
| 2   | `size="sm"` で高さ 36px が適用される                      | 高さ対応クラス/スタイルの存在                             |
| 3   | `size="md"`（デフォルト）で高さ 44px が適用される         | 高さ対応クラス/スタイルの存在                             |
| 4   | `size="lg"` で高さ 56px が適用される                      | 高さ対応クラス/スタイルの存在                             |
| 5   | クリック時に `onClick` が呼ばれる                         | `fireEvent.click` 後に `onClick` mock が1回呼ばれる       |
| 6   | `disabled=true` 時にクリックしても `onClick` が呼ばれない | `fireEvent.click` 後に `onClick` mock が0回               |
| 7   | `disabled=true` で `opacity` 低下クラスが適用される       | `opacity-50` 系クラスの存在                               |
| 8   | `disabled=true` で `cursor-not-allowed` が適用される      | `cursor-not-allowed` クラスの存在                         |
| 9   | `icon` が指定された場合にアイコンが表示される             | アイコン要素の存在                                        |
| 10  | `icon` が未指定の場合にアイコン要素が存在しない           | アイコン要素の不在                                        |
| 11  | Enter キーで `onClick` が呼ばれる                         | `fireEvent.keyDown(el, { key: "Enter" })` 後に mock が1回 |
| 12  | Space キーで `onClick` が呼ばれる                         | `fireEvent.keyDown(el, { key: " " })` 後に mock が1回     |
| 13  | `disabled=true` 時に Enter キーで `onClick` が呼ばれない  | `fireEvent.keyDown` 後に mock が0回                       |
| 14  | `role="button"` が設定される                              | `screen.getByRole("button")` の存在                       |
| 15  | `tabIndex={0}` が設定される                               | `tabIndex` 属性値の確認                                   |
| 16  | `disabled=true` で `aria-disabled="true"` が設定される    | `aria-disabled` 属性値                                    |
| 17  | 背景に `--bg-tertiary` トークンが使用される               | 対応クラス/スタイルの存在                                 |
| 18  | ボーダーに `--border-subtle` トークンが使用される         | 対応クラス/スタイルの存在                                 |
| 19  | 3テーマでレンダリングエラーが発生しない                   | `renderWithAllThemes` でエラーなし                        |

**成果物パス**: `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx`

---

### Task 4-6: EmptyState テスト拡張

**目的**: 既存 EmptyState テスト 7件の PASS を維持しつつ、suggestions・compact・mood・action オブジェクト形式の拡張テストを追加する

**実行手順**:

1. 既存テスト7件が PASS することを確認する（`cd apps/desktop && pnpm vitest run src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`）
2. 既存テストファイルの末尾に新規 `describe` ブロックを追加する
3. 以下の新規テストケースを追加する:

| #   | テストケース                                                                       | 検証内容                                             |
| --- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 8   | `suggestions` 配列が渡された場合に SuggestionBubble が正しい個数レンダリングされる | `role="button"` 要素数の一致                         |
| 9   | `suggestions` の各 `onClick` がクリック時に呼ばれる                                | `fireEvent.click` 後に対応 mock が1回                |
| 10  | `suggestions` が flex-wrap レイアウトで中央揃えされる                              | flex-wrap + justify-center 系クラスの存在            |
| 11  | `compact=true` でアイコンサイズが 32px になる                                      | アイコン要素のサイズクラス/スタイル                  |
| 12  | `compact=true` で見出しフォントが `--text-base` になる                             | 見出し要素のフォントクラス                           |
| 13  | `compact=true` でパディングが縮小される                                            | パディング縮小クラス/スタイルの確認                  |
| 14  | `compact=false`（デフォルト）でアイコンサイズが 48px になる                        | アイコン要素のサイズクラス/スタイル                  |
| 15  | `mood="welcoming"` でアイコンカラーに `--status-primary` が適用される              | アイコンカラークラス/スタイルの確認                  |
| 16  | `mood="encouraging"` でアイコンカラーに `--status-info` が適用される               | アイコンカラークラス/スタイルの確認                  |
| 17  | `mood="celebrating"` でアイコンカラーに `--status-success` が適用される            | アイコンカラークラス/スタイルの確認                  |
| 18  | `mood` 未指定時にアイコンカラーが `--text-muted` になる                            | アイコンカラークラス/スタイルの確認                  |
| 19  | `action` にオブジェクト `{ label, onClick }` を渡すとボタンがレンダリングされる    | `screen.getByRole("button", { name: label })` の存在 |
| 20  | `action` オブジェクトの `onClick` がクリック時に呼ばれる                           | `fireEvent.click` 後に mock が1回                    |
| 21  | `action` オブジェクトの `variant="primary"` が Button に反映される                 | Button 要素のバリアントクラス確認                    |
| 22  | `action` に ReactNode を渡す既存動作が維持される                                   | ReactNode 要素の存在（後方互換性）                   |
| 23  | 3テーマでレンダリングエラーが発生しない                                            | `renderWithAllThemes` でエラーなし                   |

**後方互換性の検証方法**: テスト実行前に既存7件（レンダリング3件、アイコン1件、アクション1件、className1件、displayName1件）が全て PASS することを確認する。

**成果物パス**: `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`（既存ファイル末尾に追加）

---

### Task 4-7: RelativeTime テスト作成

**目的**: RelativeTime の3フォーマット×5閾値・setInterval自動更新・clearInterval クリーンアップ・`<time>` 要素を検証するテストを作成する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/RelativeTime/` ディレクトリを作成する
2. `RelativeTime.test.tsx` を作成する
3. タイマーテストは `vi.useFakeTimers()` を `beforeEach` で呼び、`afterEach` で `vi.useRealTimers()` を呼ぶ（P13対策: `vi.runAllTimers()` 使用禁止）
4. 以下のテストケースを実装する:

**auto フォーマット（デフォルト）テスト**:

| #   | テストケース                                                     | 検証内容                              |
| --- | ---------------------------------------------------------------- | ------------------------------------- |
| 1   | 1分未満のタイムスタンプで「たった今」と表示される                | `screen.getByText("たった今")` の存在 |
| 2   | 5分前のタイムスタンプで「5分前」と表示される                     | `screen.getByText("5分前")` の存在    |
| 3   | 3時間前のタイムスタンプで「3時間前」と表示される                 | `screen.getByText("3時間前")` の存在  |
| 4   | 3日前のタイムスタンプで「3日前」と表示される                     | `screen.getByText("3日前")` の存在    |
| 5   | 10日前のタイムスタンプで「YYYY/MM/DD」形式の絶対日付が表示される | 日付文字列の存在                      |

**short フォーマットテスト**:

| #   | テストケース                      | 検証内容                        |
| --- | --------------------------------- | ------------------------------- |
| 6   | 1分未満で「今」と表示される       | `screen.getByText("今")` の存在 |
| 7   | 5分前で「5m」と表示される         | `screen.getByText("5m")` の存在 |
| 8   | 3時間前で「3h」と表示される       | `screen.getByText("3h")` の存在 |
| 9   | 3日前で「3d」と表示される         | `screen.getByText("3d")` の存在 |
| 10  | 10日前で「MM/DD」形式が表示される | 日付文字列の存在                |

**long フォーマットテスト**:

| #   | テストケース                               | 検証内容                              |
| --- | ------------------------------------------ | ------------------------------------- |
| 11  | 1分未満で「たった今」と表示される          | `screen.getByText("たった今")` の存在 |
| 12  | 5分前で「5分前」と表示される               | `screen.getByText("5分前")` の存在    |
| 13  | 3時間前で「3時間前」と表示される           | `screen.getByText("3時間前")` の存在  |
| 14  | 30時間前で「昨日」と表示される             | `screen.getByText("昨日")` の存在     |
| 15  | 3日前で「3日前」と表示される               | `screen.getByText("3日前")` の存在    |
| 16  | 10日前で「YYYY年MM月DD日」形式が表示される | 日付文字列の存在                      |

**自動更新・クリーンアップテスト**:

| #   | テストケース                                   | 検証内容                                                  |
| --- | ---------------------------------------------- | --------------------------------------------------------- |
| 17  | デフォルト（60000ms）間隔で表示が更新される    | `vi.advanceTimersByTime(60000)` 後にテキスト変化          |
| 18  | `refreshInterval` カスタム値で表示が更新される | `vi.advanceTimersByTime(customInterval)` 後にテキスト変化 |
| 19  | アンマウント時に `clearInterval` が呼ばれる    | `unmount()` 後に `clearInterval` spy の呼び出し確認       |

**HTML要素・属性テスト**:

| #   | テストケース                                                                             | 検証内容                     |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| 20  | `<time>` 要素としてレンダリングされる                                                    | 要素の `tagName === "TIME"`  |
| 21  | `datetime` 属性に ISO 8601 形式のタイムスタンプが設定される                              | `datetime` 属性値の一致      |
| 22  | `showAbsoluteOnHover=true`（デフォルト）で `title` に「YYYY/MM/DD HH:mm:ss」が設定される | `title` 属性値のフォーマット |
| 23  | `showAbsoluteOnHover=false` で `title` 属性が設定されない                                | `title` 属性の不在           |

**エラーハンドリングテスト**:

| #   | テストケース                                               | 検証内容                            |
| --- | ---------------------------------------------------------- | ----------------------------------- |
| 24  | 無効なタイムスタンプ（空文字列）でフォールバック表示される | エラーなし + フォールバックテキスト |
| 25  | 無効なタイムスタンプ（不正形式）でフォールバック表示される | エラーなし + フォールバックテキスト |

**テーマテスト**:

| #   | テストケース                            | 検証内容                           |
| --- | --------------------------------------- | ---------------------------------- |
| 26  | 3テーマでレンダリングエラーが発生しない | `renderWithAllThemes` でエラーなし |

**タイマーテスト実装上の注意**:

```typescript
// P13対策: vi.runAllTimers() は使用禁止
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-22T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

// ✅ 正しい方法
vi.advanceTimersByTime(60000);

// ❌ 禁止（無限ループリスク）
// vi.runAllTimers();
```

**成果物パス**: `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`

---

### Task 4-8: テーマ横断テスト

**目的**: `renderWithAllThemes` ヘルパーを使用して、全7コンポーネントが3テーマでエラーなくレンダリングされることを検証する

**実行手順**:

1. 各コンポーネントテストファイルのテーマテスト（各 Task の最後のテストケース）で `renderWithAllThemes` を使用する
2. `renderWithAllThemes` は `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx` からインポートする
3. 3テーマ（`kanagawa-dragon`, `light`, `dark`）でレンダリング結果が取得できることを検証する

**テスト実装パターン**:

```typescript
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("テーマ", () => {
  it("3テーマでレンダリングエラーが発生しない", () => {
    const results = renderWithAllThemes(<ComponentUnderTest {...requiredProps} />);
    expect(results["kanagawa-dragon"].container).toBeTruthy();
    expect(results["light"].container).toBeTruthy();
    expect(results["dark"].container).toBeTruthy();
  });
});
```

**成果物**: 各テストファイル内のテーマテストセクション（個別の成果物ファイルなし）

## 参照資料

| 参照                         | パス                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | -------------- |
| Atoms仕様書                  | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md`                  |
| Phase 1 要件定義             | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-1-requirements.md`  |
| Phase 2 設計                 | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-2-design.md`        |
| Phase 3 設計レビュー         | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-3-design-review.md` |
| デザイントークン             | `apps/desktop/src/renderer/styles/tokens.css`                                                             |
| 既存Badge実装                | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`                                              |
| 既存Badgeテスト（17件）      | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                                         |
| 既存EmptyState実装           | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`                                         |
| 既存EmptyStateテスト（7件）  | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`                               |
| テストヘルパー               | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`                                             |
| UIコンポーネント仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                   |
| UIデザイン原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                            |
| コンポーネントテストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                         |
| a11yテスト基準               | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                              |
| 既存コンポーネント分析       | `outputs/phase-1/existing-component-analysis.md`                                                          | Phase 1 成果物 |
| コンポーネント要件定義       | `outputs/phase-1/component-requirements.md`                                                               | Phase 1 成果物 |
| アクセシビリティ要件         | `outputs/phase-1/accessibility-requirements.md`                                                           | Phase 1 成果物 |
| テーマ要件                   | `outputs/phase-1/theme-requirements.md`                                                                   | Phase 1 成果物 |
| 後方互換性要件               | `outputs/phase-1/backward-compatibility-requirements.md`                                                  | Phase 1 成果物 |
| インターフェース設計         | `outputs/phase-2/interface-design.md`                                                                     | Phase 2 成果物 |
| レビュー総括レポート         | `outputs/phase-3/review-summary.md`                                                                       | Phase 3 成果物 |

## 統合テスト連携

- Phase 4 で作成するテストは全て **単体テスト** であり、コンポーネント間の統合テストは Phase 6（テスト拡充）で追加する
- EmptyState → SuggestionBubble の依存関係テストは、Phase 5 で両コンポーネントが実装された後にのみ PASS する
- テーマ横断テストは `renderWithAllThemes` ヘルパーに依存する（既存ヘルパーを変更しない）

## 成果物

| #   | 成果物                    | パス                                                                                    | 種別           |
| --- | ------------------------- | --------------------------------------------------------------------------------------- | -------------- |
| 1   | StatusIndicator テスト    | `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`   | コード         |
| 2   | FilterChip テスト         | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`             | コード         |
| 3   | Badge テスト（拡張）      | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                       | コード（追記） |
| 4   | SkeletonCard テスト       | `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`         | コード         |
| 5   | SuggestionBubble テスト   | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` | コード         |
| 6   | EmptyState テスト（拡張） | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`             | コード（追記） |
| 7   | RelativeTime テスト       | `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`         | コード         |
| 8   | テスト仕様書              | `outputs/phase-4/test-specification.md`                                                 | ドキュメント   |

## 完了条件

- [ ] StatusIndicator テスト（17件）が作成されている
- [ ] FilterChip テスト（13件）が作成されている
- [ ] Badge 既存テスト17件が PASS を維持している
- [ ] Badge 拡張テスト（8件）が作成されている
- [ ] SkeletonCard テスト（13件）が作成されている
- [ ] SuggestionBubble テスト（19件）が作成されている
- [ ] EmptyState 既存テスト7件が PASS を維持している
- [ ] EmptyState 拡張テスト（16件）が作成されている
- [ ] RelativeTime テスト（26件）が作成されている
- [ ] 全テストが `vi.useFakeTimers()` / `vi.useRealTimers()` を正しく使用している（RelativeTime）
- [ ] `fireEvent` のみ使用し `userEvent` を使用していない（P39対策）
- [ ] `vi.runAllTimers()` を使用していない（P13対策）
- [ ] `beforeEach` で状態をリセットしている（P9対策）
- [ ] `renderWithAllThemes` を使用したテーマ横断テストが全コンポーネントに含まれている
- [ ] 新規テストは全て FAIL する（TDD Red フェーズ）
- [ ] 既存テスト（Badge 17件 + EmptyState 7件 = 24件）は全て PASS する
- [ ] テスト実行コマンドが `cd apps/desktop && pnpm vitest run` で動作する（P40対策）
- [ ] `outputs/phase-4/test-specification.md` が作成されている

## Phase末端アクション【必須】

1. `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/Badge/Badge.test.tsx` で既存テスト17件 PASS を確認
2. `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/EmptyState/EmptyState.test.tsx` で既存テスト7件 PASS を確認
3. 新規テストのコンパイルエラーまたは FAIL を確認（`import` 先のコンポーネントが未実装のため）
4. `outputs/phase-4/test-specification.md` を作成し、全テストケースの一覧と想定 FAIL 理由を記録

## 依存関係

| 方向       | Phase/タスク      | 内容                                                       |
| ---------- | ----------------- | ---------------------------------------------------------- |
| 依存元     | Phase 1-3         | 要件定義・設計・設計レビュー完了                           |
| 依存元     | TASK-UI-00-TOKENS | デザイントークン（CSS変数）が定義済みであること            |
| ブロック先 | Phase 5           | テストが作成されていないと実装（Green フェーズ）に進めない |

## 次のPhase

Phase 5（実装 TDD: Green）へ進む。Phase 5 では本 Phase で作成した全テストを PASS させるための実装コードを作成する。
