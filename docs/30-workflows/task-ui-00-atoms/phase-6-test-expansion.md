# Phase 6: テスト拡充 — TASK-UI-00-ATOMS Atoms共通コンポーネント

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| Phase      | 6                                                   |
| Phase名    | テスト拡充（TDD: 境界値・エッジケース・テーマ横断） |
| タスクID   | TASK-UI-00-ATOMS                                    |
| 作成日     | 2026-02-22                                          |
| 前提Phase  | Phase 5（実装完了・全テストGreen状態）              |
| 後続Phase  | Phase 7（カバレッジ確認）                           |
| ステータス | 未着手                                              |
| 依存タスク | TASK-UI-00-TOKENS（デザイントークン実装済み）       |

## 目的

Phase 5 で実装した7コンポーネント（StatusIndicator, FilterChip, Badge拡張, SkeletonCard, SuggestionBubble, EmptyState拡張, RelativeTime）に対して、エッジケース・テーマ横断・アクセシビリティ・マイクロインタラクションの4カテゴリでテストを追加する。カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成に必要な不足テストを網羅的に補完する。

## 背景

Phase 4-5 では各コンポーネントの基本テスト（正常系・主要パス）を作成・実装した。Phase 6 では以下の観点で未カバーのテストケースを追加する:

1. **エッジケース**: 未定義値、空値、境界値、型境界での動作確認
2. **テーマ横断**: kanagawa-dragon / light / dark の3テーマでの描画検証
3. **アクセシビリティ**: ARIA属性、キーボード操作、フォーカス管理の検証
4. **マイクロインタラクション**: ホバー/アクティブ状態のスタイル変更、アニメーションクラスの有無

## テスト環境ルール

| ルール                          | 根拠                                     | 対策                                                                        |
| ------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| `fireEvent` を使用              | P39: happy-dom 環境で `userEvent` 非互換 | `fireEvent.click()` / `await act(async () => { fireEvent.click(el) })`      |
| `apps/desktop/` から実行        | P40: テスト実行ディレクトリ依存          | `cd apps/desktop && pnpm vitest run`                                        |
| `beforeEach` で状態リセット     | P9: モジュールスコープ変数リーク         | DOM クリーンアップ + store リセット                                         |
| `vi.useFakeTimers()` で時刻制御 | RelativeTime のタイマーテスト            | `vi.advanceTimersByTime()` で進行（P13: `runAllTimers` は無限ループリスク） |

---

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: エッジケーステスト追加

**対象**: 各コンポーネントの既存テストファイルに追加

#### 1.1 StatusIndicator エッジケース

| No    | テスト項目                                         | 期待結果                                      |
| ----- | -------------------------------------------------- | --------------------------------------------- |
| SE-01 | `status` に未定義の値をキャスト（型安全性検証用）  | TypeScriptコンパイルエラーで防御される        |
| SE-02 | `size` 省略時にデフォルト `md`（10px）が適用される | ドット直径が10pxのクラスが付与される          |
| SE-03 | `pulse={true}` + `status="success"` の組み合わせ   | pulseアニメーションクラスが付与される         |
| SE-04 | `pulse={false}` + `status="running"` の組み合わせ  | pulseアニメーションクラスが付与されない       |
| SE-05 | `label` 省略時の `aria-label` デフォルト値         | `"ステータス: {status}"` 形式の値が設定される |

#### 1.2 FilterChip エッジケース

| No    | テスト項目                             | 期待結果                                         |
| ----- | -------------------------------------- | ------------------------------------------------ |
| FE-01 | `disabled={true}` + `onClick` 同時指定 | クリックしても `onClick` が呼ばれない            |
| FE-02 | `label=""` （空文字列）                | レンダリングされるがラベルテキストが空           |
| FE-03 | `count={0}`                            | `(0)` が表示される                               |
| FE-04 | 100文字超の長い `label`                | テキストが省略表示またはオーバーフロー制御される |
| FE-05 | `icon` と `count` の同時指定           | アイコンがラベル左、countがラベル右に配置される  |

#### 1.3 Badge エッジケース

| No    | テスト項目                                         | 期待結果                                          |
| ----- | -------------------------------------------------- | ------------------------------------------------- |
| BE-01 | `content={0}`                                      | `"0"` が表示され、`aria-label="0件"` が設定される |
| BE-02 | `content=""`（空文字列）                           | 空の Badge が表示される                           |
| BE-03 | `children` と `content` の両方指定                 | `children` が優先表示される                       |
| BE-04 | `content={99999}`（巨大数値）                      | 数値がそのまま表示される（省略表示はしない）      |
| BE-05 | 明示的 `aria-label` と `content` number の同時指定 | 明示的な `aria-label` が優先される                |

#### 1.4 SkeletonCard エッジケース

| No    | テスト項目                                          | 期待結果                                    |
| ----- | --------------------------------------------------- | ------------------------------------------- |
| KE-01 | `animate={false}`                                   | パルスアニメーションクラスが付与されない    |
| KE-02 | `height="200px"` カスタム値                         | `style.height` が `200px` に設定される      |
| KE-03 | `borderRadius="20px"` カスタム値                    | `style.borderRadius` が `20px` に設定される |
| KE-04 | `variant` 省略時にデフォルト `default` が適用される | ヘッダーライン + ボディライン2本の構造      |

#### 1.5 SuggestionBubble エッジケース

| No    | テスト項目                                             | 期待結果                      |
| ----- | ------------------------------------------------------ | ----------------------------- |
| UE-01 | `disabled={true}` + キーボード Enter                   | `onClick` が呼ばれない        |
| UE-02 | `disabled={true}` + キーボード Space                   | `onClick` が呼ばれない        |
| UE-03 | `icon` 省略時                                          | アイコン要素がDOMに存在しない |
| UE-04 | `size` 省略時にデフォルト `md`（44px高さ）が適用される | 高さ44pxのクラスが付与される  |

#### 1.6 EmptyState エッジケース

| No    | テスト項目                                            | 期待結果                                                  |
| ----- | ----------------------------------------------------- | --------------------------------------------------------- |
| EE-01 | `suggestions={[]}`（空配列）                          | SuggestionBubble が1つも描画されない                      |
| EE-02 | `mood` 未指定時のデフォルトスタイル                   | `--text-muted` カラー、アニメーションなし                 |
| EE-03 | `action` がオブジェクト形式 + ReactNode形式の両テスト | オブジェクト形式: Button描画、ReactNode形式: そのまま描画 |
| EE-04 | `compact={true}` + `mood="welcoming"` の組み合わせ    | コンパクトサイズ + welcoming カラーが両方適用される       |
| EE-05 | `suggestions` 配列の各 `onClick` が個別に呼ばれる     | 各SuggestionBubbleクリックで対応するcallbackが発火        |

#### 1.7 RelativeTime エッジケース

| No    | テスト項目                                              | 期待結果                                   |
| ----- | ------------------------------------------------------- | ------------------------------------------ |
| RE-01 | `timestamp="invalid-date"`（無効値）                    | フォールバック表示（`"—"` または空文字列） |
| RE-02 | 未来日時の `timestamp`                                  | `"たった今"` またはフォールバック表示      |
| RE-03 | `refreshInterval={0}`                                   | setInterval が呼ばれない（自動更新無効）   |
| RE-04 | `showAbsoluteOnHover={false}`                           | `title` 属性が設定されない                 |
| RE-05 | コンポーネントアンマウント時の `clearInterval` 呼び出し | メモリリークが発生しない                   |

---

### Task 2: テーマ横断テスト拡充

**対象**: 各コンポーネントの既存テストファイルに `describe("テーマ横断")` ブロックを追加

#### 2.1 テーマテストヘルパー

```typescript
// テスト共通ヘルパー（既存の renderWithTheme を使用または新規作成）
const THEMES = ["kanagawa-dragon", "light", "dark"] as const;

function renderWithTheme(ui: React.ReactElement, theme: string) {
  // document.documentElement に data-theme 属性を設定してレンダリング
  document.documentElement.setAttribute("data-theme", theme);
  return render(ui);
}
```

#### 2.2 テーマ横断テストケース

| No    | コンポーネント   | テスト項目                                   | 検証内容                              |
| ----- | ---------------- | -------------------------------------------- | ------------------------------------- |
| TH-01 | StatusIndicator  | 3テーマ × `status="running"` のレンダリング  | エラーなくレンダリング、DOM構造が一貫 |
| TH-02 | FilterChip       | 3テーマ × `isSelected={true}` のレンダリング | エラーなくレンダリング、DOM構造が一貫 |
| TH-03 | Badge            | 3テーマ × `variant="primary"` のレンダリング | エラーなくレンダリング、DOM構造が一貫 |
| TH-04 | SkeletonCard     | 3テーマ × `variant="stat"` のレンダリング    | エラーなくレンダリング、DOM構造が一貫 |
| TH-05 | SuggestionBubble | 3テーマ × `size="lg"` のレンダリング         | エラーなくレンダリング、DOM構造が一貫 |
| TH-06 | EmptyState       | 3テーマ × `mood="welcoming"` のレンダリング  | エラーなくレンダリング、DOM構造が一貫 |
| TH-07 | RelativeTime     | 3テーマ × `format="short"` のレンダリング    | エラーなくレンダリング、DOM構造が一貫 |

---

### Task 3: アクセシビリティテスト拡充

**対象**: 各コンポーネントの既存テストファイルに `describe("アクセシビリティ")` ブロックを追加

#### 3.1 ARIA属性検証

| No   | コンポーネント   | テスト項目                                                 | 期待結果                                      |
| ---- | ---------------- | ---------------------------------------------------------- | --------------------------------------------- |
| A-01 | StatusIndicator  | `role="status"` の存在確認                                 | `getByRole("status")` で取得可能              |
| A-02 | StatusIndicator  | `aria-label` に `label` props が反映される                 | `label="カスタム"` → `aria-label="カスタム"`  |
| A-03 | FilterChip       | `role="checkbox"` の存在確認                               | `getByRole("checkbox")` で取得可能            |
| A-04 | FilterChip       | `aria-checked` が `isSelected` と連動する                  | `isSelected={true}` → `aria-checked="true"`   |
| A-05 | FilterChip       | `disabled` 時に `aria-disabled="true"` が設定される        | `disabled={true}` → `aria-disabled="true"`    |
| A-06 | SkeletonCard     | `role="status"` + `aria-label="読み込み中"` の存在確認     | `getByRole("status")` + `aria-label` 属性一致 |
| A-07 | SkeletonCard     | `aria-busy="true"` の存在確認                              | `getAttribute("aria-busy")` が `"true"`       |
| A-08 | SuggestionBubble | `role="button"` の存在確認                                 | `getByRole("button")` で取得可能              |
| A-09 | SuggestionBubble | `tabIndex={0}` の存在確認                                  | `getAttribute("tabIndex")` が `"0"`           |
| A-10 | SuggestionBubble | `disabled` 時に `aria-disabled="true"` が設定される        | `disabled={true}` → `aria-disabled="true"`    |
| A-11 | RelativeTime     | `<time>` 要素の使用確認                                    | `container.querySelector("time")` が非null    |
| A-12 | RelativeTime     | `datetime` 属性に ISO 8601 形式が設定される                | `getAttribute("datetime")` が ISO 8601 形式   |
| A-13 | Badge            | `content` が `number` 時に `aria-label="{N}件"` が自動設定 | `content={5}` → `aria-label="5件"`            |

#### 3.2 キーボード操作テスト

| No   | コンポーネント   | テスト項目                        | 期待結果                                                     |
| ---- | ---------------- | --------------------------------- | ------------------------------------------------------------ |
| K-01 | SuggestionBubble | Enter キー押下で `onClick` が発火 | `fireEvent.keyDown(el, { key: "Enter" })` → callback呼び出し |
| K-02 | SuggestionBubble | Space キー押下で `onClick` が発火 | `fireEvent.keyDown(el, { key: " " })` → callback呼び出し     |
| K-03 | FilterChip       | クリックで `onClick` が発火       | `fireEvent.click(el)` → callback呼び出し                     |
| K-04 | FilterChip       | `disabled` 時にクリック無効       | `fireEvent.click(el)` → callback呼び出しなし                 |

#### 3.3 フォーカス管理テスト

| No   | コンポーネント   | テスト項目               | 期待結果                                       |
| ---- | ---------------- | ------------------------ | ---------------------------------------------- |
| F-01 | SuggestionBubble | フォーカス可能であること | `el.focus()` → `document.activeElement === el` |
| F-02 | FilterChip       | フォーカス可能であること | `el.focus()` → `document.activeElement === el` |

---

### Task 4: マイクロインタラクションテスト

**対象**: 各コンポーネントの既存テストファイルに `describe("マイクロインタラクション")` ブロックを追加

#### 4.1 テストケース

| No    | コンポーネント   | テスト項目                                                            | 検証方法                                                    |
| ----- | ---------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| MI-01 | SuggestionBubble | ホバー時に `scale` 変更クラスが適用される                             | `fireEvent.mouseEnter(el)` → ホバー用CSSクラスの存在確認    |
| MI-02 | SuggestionBubble | アクティブ時に `scale` 変更クラスが適用される                         | `fireEvent.mouseDown(el)` → アクティブ用CSSクラスの存在確認 |
| MI-03 | StatusIndicator  | `status="running"` + `pulse` デフォルト時にアニメーションクラスが存在 | `el.classList.contains("animate-pulse")` が true            |
| MI-04 | StatusIndicator  | `status="idle"` 時にアニメーションクラスが存在しない                  | `el.classList.contains("animate-pulse")` が false           |
| MI-05 | SkeletonCard     | `animate={true}` 時にパルスアニメーションクラスが存在                 | `el.classList.contains("animate-skeleton-pulse")` が true   |
| MI-06 | SkeletonCard     | `animate={false}` 時にパルスアニメーションクラスが存在しない          | `el.classList.contains("animate-skeleton-pulse")` が false  |
| MI-07 | FilterChip       | 選択/非選択切替時のトランジションクラスが設定されている               | CSSトランジション関連クラスの存在確認                       |

---

## 参照資料

| 参照                                                                 | パス                                                                                                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| Atoms仕様書                                                          | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md`                   |
| Phase 5 実装成果物                                                   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-5-implementation.md` |
| テストパターン                                                       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                          |
| アクセシビリティテスト基準                                           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                               |
| 品質要件                                                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                |
| P39: happy-dom userEvent非互換                                       | `.claude/rules/06-known-pitfalls.md#P39`                                                                   |
| P9: テスト間リーク                                                   | `.claude/rules/06-known-pitfalls.md#P9`                                                                    |
| P13: タイマー無限ループ                                              | `.claude/rules/06-known-pitfalls.md#P13`                                                                   |
| テスト仕様書（7コンポーネント139テスト）                             | `outputs/phase-4/test-specification.md`                                                                    | Phase 4 成果物 |
| 実装サマリー（7コンポーネント実装・R-1〜R-6対応・barrel export更新） | `outputs/phase-5/implementation-summary.md`                                                                | Phase 5 成果物 |

## 統合テスト連携

Phase 6 のテストは Phase 5 で作成した基本テストの上に追加する形で実装する。既存テストファイルの `describe` ブロック構造を維持し、新規テストケースを適切な位置に挿入する。

**テスト実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/{StatusIndicator,FilterChip,Badge,SkeletonCard,SuggestionBubble,EmptyState,RelativeTime}
```

## 成果物

| #   | 成果物                         | パス                                     |
| --- | ------------------------------ | ---------------------------------------- |
| 1   | エッジケーステスト追加結果     | `outputs/phase-6/edge-case-tests.md`     |
| 2   | テーマ横断テスト追加結果       | `outputs/phase-6/theme-tests.md`         |
| 3   | アクセシビリティテスト追加結果 | `outputs/phase-6/accessibility-tests.md` |

## 完了条件

- [ ] StatusIndicator: SE-01〜SE-05 の5テストケースが全てPASS
- [ ] FilterChip: FE-01〜FE-05 の5テストケースが全てPASS
- [ ] Badge: BE-01〜BE-05 の5テストケースが全てPASS
- [ ] SkeletonCard: KE-01〜KE-04 の4テストケースが全てPASS
- [ ] SuggestionBubble: UE-01〜UE-04 の4テストケースが全てPASS
- [ ] EmptyState: EE-01〜EE-05 の5テストケースが全てPASS
- [ ] RelativeTime: RE-01〜RE-05 の5テストケースが全てPASS
- [ ] テーマ横断テスト: TH-01〜TH-07 の7テストケースが全てPASS
- [ ] ARIA属性テスト: A-01〜A-13 の13テストケースが全てPASS
- [ ] キーボード操作テスト: K-01〜K-04 の4テストケースが全てPASS
- [ ] フォーカス管理テスト: F-01〜F-02 の2テストケースが全てPASS
- [ ] マイクロインタラクションテスト: MI-01〜MI-07 の7テストケースが全てPASS
- [ ] Phase 5 で作成した既存テストが1件も壊れていない
- [ ] Badge 既存17テスト + EmptyState 既存6テスト の維持確認
- [ ] `cd apps/desktop && pnpm vitest run` で全テストがPASS

## Phase末端アクション【必須】

- [ ] 成果物ファイル（`outputs/phase-6/` 配下3ファイル）を作成
- [ ] `artifacts.json` の Phase 6 ステータスを `completed` に更新

## 依存関係

- **前提**: Phase 5（実装完了・全テストGreen状態）
- **入力**: Phase 4-5 で作成したテストファイル7個 + コンポーネント実装7個
- **出力**: テスト拡充済みテストファイル7個

## 次のPhase

Phase 7（カバレッジ確認）へ進む。Phase 7 で各コンポーネントのカバレッジを測定し、基準未達の場合は Phase 6 に戻ってテストを追加する。
