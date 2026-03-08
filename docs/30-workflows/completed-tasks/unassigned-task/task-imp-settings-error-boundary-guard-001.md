# Settings画面 ErrorBoundary 導入 - タスク指示書

## メタ情報

```yaml
issue_number: 1045
```

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | UT-FIX-SETTINGS-ERROR-BOUNDARY-001   |
| タスク名     | Settings画面 ErrorBoundary 導入      |
| 分類         | 改善                                 |
| 対象機能     | Settings画面全体の例外フォールバック |
| 優先度       | 中                                   |
| 見積もり規模 | 中規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 12                             |
| 発見日       | 2026-03-07                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 で ApiKeysSection に5層防御（L1: namespace確認 → L2: shape正規化 → L3: 配列保証 → L4: 要素フィルタ → L5: 例外キャッチ）を実装した。しかし、これは個別コンポーネント単位の防御であり、Settings画面全体に対する最終防御層（ErrorBoundary）が存在しない。

React のレンダリングフェーズのエラー（JSX内の例外）は try-catch では捕捉できず、ErrorBoundary（componentDidCatch）が唯一の防御手段である。設定画面は API キー管理・認証情報を扱うため、中断時の UX 劣化が深刻。

### 1.2 問題点・課題

- S27（Renderer境界5層防御パターン）は個別コンポーネントの防御であり、React レンダリングエラーには無力
- 5層防御はデータフェッチ時のエラーをカバーするが、JSX内の例外（例: `providers.map(...)` 内で型不一致が発生した場合）は捕捉できない
- 現状 Settings画面には ErrorBoundary がなく、レンダリングエラーでアプリ全体が白画面になる

### 1.3 放置した場合の影響

- 障害発生時にユーザーが設定画面から復帰できず、アプリ再起動が必要になる
- API キー登録中のクラッシュで入力データが失われる
- 障害解析に必要なエラー情報（componentDidCatch のスタックトレース）が記録されない

---

## 2. 何を達成するか（What）

### 2.1 目的

Settings画面に ErrorBoundary を導入し、致命的例外時も復帰可能UIを維持する。S27（Renderer境界5層防御パターン）の「6層目」として、React レンダリングエラーを捕捉する最終防御層を構築する。

### 2.2 最終ゴール

- 例外発生時にフォールバックUIと再試行導線が表示される
- Settings画面のどのセクションで例外が発生しても、画面全体が白画面にならない
- エラー情報が `componentDidCatch` 経由でログに記録される

### 2.3 スコープ

#### 含むもの

- Settings画面ルートへの ErrorBoundary コンポーネント配置
- Apple HIG 準拠のフォールバックUI実装（リトライボタン付き）
- `componentDidCatch` による例外ログの最小記録
- WCAG 2.1 AA 準拠のアクセシビリティ対応（`aria-live="assertive"`）
- ダークモード対応（CSS変数ベース、Apple HIG System Colors 準拠）
- ErrorBoundary のユニットテスト

#### 含まないもの

- 全画面共通 ErrorBoundary 化（Settings画面に限定）
- Sentry 等の外部エラートラッキングサービス連携
- セクション単位の個別 ErrorBoundary 配置（本タスクではSettings画面ルートに1つのみ）

---

## 3. どう実装するか（How）

### 3.1 実装方針

最小スコープで Settings画面に限定導入する。ErrorBoundary はクラスコンポーネントとして実装し、`componentDidCatch` でエラー情報をログに記録する。フォールバックUIは Apple HIG の Clarity 原則に従い、「問題が発生しました」メッセージとリトライボタンの最小構成とする。

粒度設計の判断として、Settings画面全体を1つの ErrorBoundary でラップする方式を採用する（セクション単位配置は保守コスト増大のため本タスクでは対象外）。

### 3.2 修正対象ファイル

| ファイル                                                                                 | 変更内容                                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/settings/SettingsErrorBoundary.tsx`      | 新規作成: ErrorBoundary クラスコンポーネント + フォールバックUI |
| `apps/desktop/src/renderer/components/organisms/settings/SettingsErrorBoundary.test.tsx` | 新規作成: ErrorBoundary のユニットテスト                        |
| Settings画面のルートコンポーネント（既存）                                               | ErrorBoundary でラップ                                          |

### 3.3 実装手順

#### Phase 1: ErrorBoundary コンポーネント実装

1. `SettingsErrorBoundary` クラスコンポーネントを作成
   - `componentDidCatch` でエラー情報をコンソールログに記録
   - `getDerivedStateFromError` で `hasError` 状態を管理
   - リセット（リトライ）メソッドで `hasError` を `false` に戻す
2. フォールバックUI実装
   - 「問題が発生しました」メッセージ表示
   - 「再試行」ボタン配置
   - `aria-live="assertive"` でスクリーンリーダーに通知
   - Apple HIG System Colors 準拠のスタイリング（CSS変数ベース）
   - ダークモード対応

#### Phase 2: Settings画面への適用

1. Settings画面のルートコンポーネントを特定
2. `SettingsErrorBoundary` で既存コンテンツをラップ
3. 既存の動作に影響がないことを確認

#### Phase 3: テスト・画面検証

1. 例外スロー用テストコンポーネントを作成してフォールバック表示を確認
2. リトライボタンによる復帰動作を確認
3. アクセシビリティ属性の検証
4. スクリーンショット証跡を取得

---

## 4. 受入基準

### 機能要件

- [ ] Settings画面内で例外発生時にフォールバックUIが表示され、画面が白画面にならない
- [ ] フォールバックUIに「再試行」ボタンがあり、クリックでSettings画面が復帰する
- [ ] `componentDidCatch` でエラー情報（message, componentStack）がログに記録される

### 品質要件

- [ ] `aria-live="assertive"` がフォールバックUIに設定されている
- [ ] `role="alert"` がエラーメッセージ領域に設定されている
- [ ] ライトモード・ダークモード両方でフォールバックUIが正しく表示される
- [ ] コントラスト比 4.5:1 以上（WCAG 2.1 AA）
- [ ] 全テスト PASS

### ドキュメント要件

- [ ] システム仕様書（`ui-ux-settings.md` 等）に ErrorBoundary 導入を記録
- [ ] `lessons-learned.md` に教訓を追記

---

## 5. テスト計画

### ユニットテスト

| テストケース                                         | 期待結果                                                             |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| 子コンポーネントが例外をスローした場合               | フォールバックUIが表示される                                         |
| フォールバックUIの「再試行」ボタンをクリックした場合 | 子コンポーネントが再レンダリングされる                               |
| 子コンポーネントが正常にレンダリングされた場合       | ErrorBoundary が透過的に動作し、子コンポーネントがそのまま表示される |
| `componentDidCatch` が呼ばれた場合                   | エラー情報とコンポーネントスタックがログに記録される                 |
| フォールバックUIのアクセシビリティ属性               | `aria-live="assertive"` と `role="alert"` が存在する                 |

### 手動テスト

| 確認項目             | 手順                                                               |
| -------------------- | ------------------------------------------------------------------ |
| フォールバックUI表示 | 意図的に例外を発生させ、フォールバックUIが表示されることを確認     |
| リトライ復帰         | 「再試行」ボタンクリック後にSettings画面が正常表示されることを確認 |
| ダークモード表示     | ダークモードでフォールバックUIのスタイルが正しいことを確認         |

### テスト環境の注意事項

- happy-dom 環境では `userEvent` は使用不可（P39準拠）。`fireEvent` を使用する
- ErrorBoundary のテストでは `console.error` のモック化が必要（React が内部的に `console.error` を呼ぶため）

---

## 6. リスク・注意事項

| リスク                                       | 影響度 | 発生確率 | 対策                                                                                                                     |
| -------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| 例外を過剰に握り潰し、根本原因の発見が遅れる | 中     | 中       | `componentDidCatch` でエラー詳細をログに記録。フォールバックUIにはユーザー向けメッセージのみ表示し、内部情報は漏洩しない |
| フォールバックUI のUX劣化                    | 低     | 中       | Apple HIG Clarity 原則に従った最小UI + 明確な再試行導線                                                                  |
| リトライしても同じエラーが再発する           | 中     | 低       | コンポーネントバグの場合はリトライでも再発する。連続エラー時はエラーメッセージを維持し、無限リトライループを防止する     |
| happy-dom 環境でのテスト制限                 | 低     | 高       | P39準拠で `fireEvent` を使用。`componentDidCatch` のモック化で対応                                                       |

---

## 7. 関連タスク・参照資料

### 依存タスク

| タスクID                                    | 関係                      | ステータス |
| ------------------------------------------- | ------------------------- | ---------- |
| TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 | 前提タスク（5層防御実装） | 完了       |

### 参照資料（aiworkflow-requirements）

| 仕様書                                        | 参照内容                                                          |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `architecture-implementation-patterns.md` S27 | Renderer境界5層防御パターン（6層目としてErrorBoundary追加を推奨） |
| `architecture-implementation-patterns.md` S29 | Renderer 境界 providers 正規化パターン（防御の限界を示す）        |
| `ui-ux-settings.md`                           | ApiKeysSection 防御レイヤーとフォールバック UI 仕様               |
| `arch-ui-components.md`                       | Atomic Design 構成とコンポーネント階層                            |
| `security-electron-ipc.md`                    | v1.14.0: Renderer側防御層の仕様                                   |
| `lessons-learned.md`                          | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の教訓                |

### 参照ルール

| ルールファイル                                | 参照内容                                         |
| --------------------------------------------- | ------------------------------------------------ |
| `.claude/rules/01-architecture.md`            | Apple HIG準拠のUI/UXデザイン哲学、WCAG 2.1 AA    |
| `.claude/rules/06-known-pitfalls.md` P52      | 防御ガード実装時の同ファイル内残存パターン       |
| `.claude/rules/06-known-pitfalls.md` P39      | happy-dom環境での userEvent 非互換               |
| `.claude/rules/06-known-pitfalls.md` P48, P49 | non-null assertion / type predicate の実行時検証 |

### 発見元ドキュメント

- `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-12/unassigned-task-report.md`
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

---

## 8. 備考

### 苦戦箇所（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 からの教訓）

1. **多層防御の限界（P52関連）**: 個別のフィルタ・バリデーション（GAP-01〜06）で主要なクラッシュ経路はカバーできたが、React レンダリングエラー（例: JSX内での undefined プロパティアクセス）は try-catch では捕捉できない。ErrorBoundary は React のライフサイクルエラーを捕捉する最終防御層

2. **ErrorBoundary の粒度設計**: Settings画面全体に1つ配置するか、各セクション（ApiKeys, Profile, General等）ごとに配置するかのトレードオフがある。全体配置は実装が簡単だが、1セクションのエラーで全設定画面が使えなくなる。セクション単位配置は影響範囲を限定できるが、ErrorBoundary コンポーネントの重複が発生する

3. **フォールバック UI の設計**: ErrorBoundary のフォールバックは「リトライボタン」を含めるべきか、単純なエラーメッセージのみにするかの判断が必要。IPC 通信の一時的な障害の場合はリトライが有効だが、コンポーネント自体のバグの場合はリトライしても同じエラーが発生する

4. **テスト環境での ErrorBoundary 検証**: happy-dom 環境では React の Error Boundary のテストが制限される（P39関連）。`componentDidCatch` のモック化やエラー投入テストには、テスト環境固有の工夫が必要

### レビュー指摘の原文

```text
UT-2: ErrorBoundary の導入検討 -- 現在の防御は個別のフィルタ・バリデーションで実現しているが、
予期しない例外に対する最終防御として Settings画面に ErrorBoundary を配置することで、
画面全体が真っ白になるリスクを軽減できる。
```

### 補足事項

- 中優先度。設定画面改修タイミングで同時実施推奨
- フォールバックUIは `aria-live="assertive"` でスクリーンリーダーに通知（WCAG 2.1 AA）
- ダークモード対応は CSS変数ベースのスタイリングで実現（Apple HIG System Colors 準拠）
