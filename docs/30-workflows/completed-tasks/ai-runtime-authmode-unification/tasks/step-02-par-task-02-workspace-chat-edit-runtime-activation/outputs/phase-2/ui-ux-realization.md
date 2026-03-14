# UI/UX 実体化文書 — Workspace Chat Edit AI Runtime 活性化

## メタ情報

| 項目           | 値                                          |
| -------------- | ------------------------------------------- |
| Phase          | 2（設計）                                   |
| タスク ID      | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日         | 2026-03-14                                  |
| デザイン基準   | Apple HIG / WCAG 2.1 AA                     |
| 対象サーフェス | Workspace — Chat Edit モード                |

---

## 1. 画面構成（4 領域）

画面全体は Monaco Editor と連携した 4 つの機能領域で構成される。各領域は状態に応じて表示・非表示を切り替え、不要な認知負荷を与えない。

### 1-A. Editor Selection Action Bar

| 属性       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| 配置       | Monaco Editor 上部のインライン固定バー（editor-top-overlay） |
| 基準サイズ | 高さ 40px、エディタ幅に追従                                  |
| 角丸       | 上辺 8px（editor 角丸に合わせる）                            |
| z-index    | editor の selection ハイライトより上位                       |

#### 状態別表示

**selection-ready（テキスト選択あり）**

- 「編集案を生成」ボタン
  - 背景色: `#007AFF`（systemBlue）
  - テキスト色: `#FFFFFF`、フォントサイズ 14px、font-weight 600
  - 高さ 32px、水平パディング 16px、角丸 8px
  - 影: `0 1px 3px rgba(0,0,0,0.12)`
- 選択行数バッジ
  - 背景: `rgba(0, 122, 255, 0.12)`、テキスト `#007AFF`
  - 例: `3 行選択中`
  - フォントサイズ 12px、角丸 6px、パディング 2px 8px

**idle / selection なし**

- ボタンをグレーアウト表示（`opacity: 0.38`、`cursor: not-allowed`、`pointer-events: none`）
- インラインメッセージ: 「選択範囲を決めてから続ける」
  - テキスト色: `rgba(60, 60, 67, 0.6)`（secondaryLabel）
  - フォントサイズ 13px

#### キーボード操作

| キー              | 動作                                             |
| ----------------- | ------------------------------------------------ |
| `Tab`             | フォーカスを Action Bar 内の次要素へ移動         |
| `Shift+Tab`       | フォーカスを前要素へ移動                         |
| `Enter` / `Space` | フォーカス中ボタンを実行                         |
| `Cmd+Enter`       | selection-ready 状態で「編集案を生成」をトリガー |

---

### 1-B. Context Summary Panel

| 属性       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| 配置       | サイドバー下部パネル（bottom-panel 優先、サイドバー不在時は editor 下部） |
| 基準サイズ | 高さ 80px（generating 中は 88px でスピナー行が追加）                      |
| 背景       | `#F2F2F7`（secondarySystemBackground）                                    |
| ボーダー   | 上辺 1px solid `#C6C6C8`（opaqueSeparator）                               |
| 角丸       | 8px                                                                       |

#### 表示内容

| 項目           | 表示形式                                                               |
| -------------- | ---------------------------------------------------------------------- |
| ファイル名     | アイコン + パス末尾ファイル名（最大 40文字、超過時は `...` 省略）      |
| 選択行範囲     | `L12–L24`（行数が 1 の場合は `L12`）                                   |
| コマンドタイプ | タグバッジ（例: `chat-edit`、`refactor`）、背景 `rgba(0,122,255,0.10)` |

#### generating 状態

- アニメーションスピナー（直径 16px、回転 1s linear infinite）をファイル名右に表示
- スピナー色: `#007AFF`
- テキスト「編集案を生成中...」を追加表示（色: `rgba(60,60,67,0.6)`）

---

### 1-C. Diff Preview Panel

| 属性     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 配置     | editor の右側または下部スプリットビュー（Monaco diff editor として埋め込み） |
| 表示条件 | `diff-ready` 状態のみ                                                        |
| 背景     | `#FFFFFF`                                                                    |
| ボーダー | 1px solid `#C6C6C8`                                                          |
| 角丸     | 8px                                                                          |

#### Diff 表示スタイル

| 種別         | 背景色                    | テキスト色           |
| ------------ | ------------------------- | -------------------- |
| 削除行（旧） | `rgba(255, 59, 48, 0.08)` | `#1D1D1F`            |
| 削除差分文字 | `rgba(255, 59, 48, 0.30)` | `#FF3B30`            |
| 追加行（新） | `rgba(52, 199, 89, 0.08)` | `#1D1D1F`            |
| 追加差分文字 | `rgba(52, 199, 89, 0.30)` | `#34C759`            |
| 変更なし行   | `#FFFFFF`                 | `rgba(60,60,67,0.6)` |

#### Diff Panel アクションバー

Diff Panel 上部に固定表示するアクションバー（高さ 44px）。

- 「差分を確認」ボタン（`Cmd+D`）→ クリックでパネルを前面展開
- パネル展開後に「変更を適用」「キャンセル」のサブアクションを表示

| ボタン     | スタイル                                                        | ショートカット    |
| ---------- | --------------------------------------------------------------- | ----------------- |
| 変更を適用 | 背景 `#34C759`（systemGreen）、テキスト `#FFFFFF`               | `Cmd+Shift+Enter` |
| キャンセル | 背景なし、テキスト `rgba(60,60,67,0.6)`、ボーダー 1px `#C6C6C8` | `Escape`          |

---

### 1-D. Inline Guidance Block（Handoff Card）

| 属性       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| 配置       | editor 下部インライン（Context Summary Panel の下に連続配置） |
| 表示条件   | `handoff` または `blocked` 状態                               |
| 背景       | `#FFF9E6`（systemOrange 薄め: `rgba(255, 149, 0, 0.06)`）     |
| ボーダー   | 左辺 4px solid `#FF9500`（systemOrange）                      |
| 角丸       | 8px                                                           |
| パディング | 16px                                                          |

#### handoff 状態（API key 未設定）

- 理由テキスト: 「この画面では自動実行せず terminal で続ける」
  - フォントサイズ 14px、テキスト色 `#1D1D1F`
- 補足テキスト: 「API キーが設定されていないため、以下のコマンドを terminal で実行してください」
  - フォントサイズ 13px、テキスト色 `rgba(60,60,67,0.6)`
- コマンドブロック

  ```
  claude --edit <ファイルパス>
  ```

  - 背景: `#1D1D1F`、テキスト色: `#E5E5EA`（コードハイライト）
  - 角丸 6px、パディング 12px 16px
  - コピーボタン（右上角、16px アイコン）

- 「terminal で続ける」ボタン
  - スタイル: Outline（背景なし、ボーダー 1px `#007AFF`、テキスト `#007AFF`）
  - 高さ 32px、角丸 8px

#### blocked 状態（PERMISSION_DENIED 等）

- 理由テキスト: 「この操作は現在のモードでは実行できません」
  - テキスト色 `#FF3B30`（systemRed）
- 理由コード表示: `PERMISSION_DENIED` などをバッジ表示
  - 背景 `rgba(255,59,48,0.10)`、テキスト `#FF3B30`
- 補足テキスト: `rgba(60,60,67,0.6)` で詳細説明

---

## 2. 状態遷移マトリクス

| 現在の状態        | 遷移先            | トリガー                                   | 表示変化                                                           |
| ----------------- | ----------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `idle`            | `selection-ready` | Monaco Editor でテキストを選択確定         | Action Bar のボタンが有効化、バッジに行数表示                      |
| `selection-ready` | `idle`            | 選択解除                                   | ボタングレーアウト、「選択範囲を決めてから続ける」メッセージ表示   |
| `selection-ready` | `generating`      | 「編集案を生成」クリック / `Cmd+Enter`     | スピナー表示、Context Summary Panel にプログレス追加、ボタン無効化 |
| `generating`      | `diff-ready`      | LLM 成功応答受信                           | Diff Preview Panel を表示、Action Bar に「差分を確認」ボタン出現   |
| `generating`      | `handoff`         | `ACCESS_NOT_CONFIGURED` エラー受信         | Inline Guidance Block（handoff）表示、terminal コマンド提示        |
| `generating`      | `blocked`         | `PERMISSION_DENIED` 等の永続エラー受信     | Inline Guidance Block（blocked）表示、エラーコードとメッセージ提示 |
| `generating`      | `selection-ready` | `TIMEOUT` / `RATE_LIMIT`（retryable）      | スピナー消去、エラートースト表示（bottom-right）、ボタン再有効化   |
| `diff-ready`      | `idle`            | 「変更を適用」クリック / `Cmd+Shift+Enter` | Diff Panel 非表示、Context Summary Panel をリセット、editor 更新   |
| `diff-ready`      | `selection-ready` | 「キャンセル」クリック / `Escape`          | Diff Panel 非表示、直前の selection 状態に戻る                     |
| `handoff`         | `idle`            | 「terminal で続ける」クリック              | Guidance Block 非表示、terminal へフォーカス移動                   |
| `blocked`         | `selection-ready` | ユーザーが手動でモード変更後に再試行       | Guidance Block 非表示、ボタン再有効化                              |

---

## 3. CTA 定義

| CTA               | スタイル                                                                 | 有効状態                          | ショートカット    | aria-label                          |
| ----------------- | ------------------------------------------------------------------------ | --------------------------------- | ----------------- | ----------------------------------- |
| 編集案を生成      | Primary（背景 `#007AFF`、テキスト `#FFFFFF`）                            | `selection-ready` のみ            | `Cmd+Enter`       | `選択した（N）行の編集案を生成する` |
| 差分を確認        | Secondary（背景 `#F2F2F7`、テキスト `#007AFF`、ボーダー 1px `#007AFF`）  | `diff-ready` のみ                 | `Cmd+D`           | `生成された差分を確認する`          |
| 変更を適用        | Confirm（背景 `#34C759`、テキスト `#FFFFFF`）                            | `diff-ready`（Diff Panel 展開後） | `Cmd+Shift+Enter` | `差分を適用してファイルを更新する`  |
| キャンセル        | Ghost（背景なし、テキスト `rgba(60,60,67,0.6)`、ボーダー 1px `#C6C6C8`） | `diff-ready`（Diff Panel 展開後） | `Escape`          | `差分を破棄して選択状態に戻る`      |
| terminal で続ける | Outline（背景なし、ボーダー 1px `#007AFF`、テキスト `#007AFF`）          | `handoff`                         | なし              | `terminal で編集コマンドを続ける`   |

### ボタン寸法共通仕様

| 項目           | 値                                                |
| -------------- | ------------------------------------------------- |
| 高さ           | 32px（コンパクト） / 40px（標準）                 |
| 水平パディング | 16px                                              |
| 角丸           | 8px                                               |
| フォントサイズ | 14px、font-weight 600                             |
| トランジション | `background-color 200ms ease, opacity 200ms ease` |

---

## 4. マイクロコピー一覧

| 状況                         | 表示箇所                           | メッセージ                                         |
| ---------------------------- | ---------------------------------- | -------------------------------------------------- |
| selection なし（idle）       | Action Bar インライン              | 「選択範囲を決めてから続ける」                     |
| 生成中（generating）         | Context Summary Panel              | 「編集案を生成中...」                              |
| API key 未設定（handoff）    | Inline Guidance Block 見出し       | 「この画面では自動実行せず terminal で続ける」     |
| handoff コマンド説明         | Inline Guidance Block サブテキスト | 「以下のコマンドを terminal で実行してください」   |
| Rate Limit（retryable）      | エラートースト                     | 「しばらくしてから再試行してください」             |
| Timeout（retryable）         | エラートースト                     | 「応答がタイムアウトしました。再試行できます」     |
| PERMISSION_DENIED（blocked） | Inline Guidance Block 見出し       | 「この操作は現在のモードでは実行できません」       |
| 変更を適用 完了              | 成功トースト（bottom-right）       | 「変更を適用しました」                             |
| diff-ready 初回表示          | Diff Panel ヘッダー                | 「編集案が生成されました。差分を確認してください」 |

### トーストの共通スタイル

- 配置: 画面右下（`bottom: 24px; right: 24px`）
- 幅: 280px（最大）
- 背景: `#1D1D1F`（success/info）/ `#FF3B30`（error）
- テキスト色: `#FFFFFF`
- 角丸: 10px
- パディング: 12px 16px
- 自動消去: 4000ms（エラーは 6000ms）
- アニメーション: 下から 8px スライドイン 250ms ease-out

---

## 5. アクセシビリティ仕様

### ARIA ロール割り当て

| 要素                                  | ARIA ロール          | 備考                                                              |
| ------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| Editor Selection Action Bar           | `role="region"`      | `aria-label="エディタ選択アクション"`                             |
| Context Summary Panel                 | `role="region"`      | `aria-label="編集コンテキスト概要"`                               |
| Diff Preview Panel                    | `role="region"`      | `aria-label="差分プレビュー"`                                     |
| Inline Guidance Block                 | `role="region"`      | `aria-label="次のステップ案内"`                                   |
| 全 CTA ボタン                         | `role="button"`      | ネイティブ `<button>` 推奨                                        |
| generating 状態インジケーター         | `role="status"`      | `aria-live="polite"`                                              |
| エラー / handoff / blocked メッセージ | `role="alert"`       | `aria-live="assertive"`                                           |
| スピナー                              | `role="progressbar"` | `aria-label="生成中"` / `aria-valuetext="編集案を生成しています"` |

### キーボードナビゲーション

| 操作                           | キー                   |
| ------------------------------ | ---------------------- |
| 次のフォーカス可能要素へ移動   | `Tab`                  |
| 前のフォーカス可能要素へ移動   | `Shift+Tab`            |
| ボタン実行                     | `Enter` または `Space` |
| 「編集案を生成」ショートカット | `Cmd+Enter`            |
| 「差分を確認」ショートカット   | `Cmd+D`                |
| 「変更を適用」ショートカット   | `Cmd+Shift+Enter`      |
| Diff Panel / モーダルを閉じる  | `Escape`               |

フォーカス順序（Tab インデックス）は DOM 出現順に準拠し、`tabindex` 属性による明示的な順序変更は行わない。

### フォーカスインジケーター

```css
:focus-visible {
  outline: 2px solid #007aff;
  outline-offset: 2px;
  border-radius: 4px;
}
```

- `:focus` ではなく `:focus-visible` を使用し、マウス操作時の不要なアウトライン表示を抑制する。

### スクリーンリーダー対応

- **状態変化の通知**: `aria-live="polite"` を付与した `<div>` を DOM に常設し、状態遷移時にテキストを注入して読み上げさせる。
- **generating → diff-ready**: 「編集案の生成が完了しました。差分を確認してください。」
- **generating → handoff**: 「API キーが設定されていないため、terminal での実行が必要です。」
- **generating → blocked**: 「エラーが発生しました。現在のモードではこの操作を実行できません。」
- **変更を適用 完了**: 「ファイルへの変更を適用しました。」

### コントラスト比（WCAG 2.1 AA 準拠確認）

| 前景色               | 背景色    | コントラスト比 | 判定                                     |
| -------------------- | --------- | -------------- | ---------------------------------------- |
| `#FFFFFF`            | `#007AFF` | 3.00:1         | AA（大テキスト・UI部品）                 |
| `#007AFF`            | `#FFFFFF` | 3.00:1         | AA（大テキスト・UI部品）                 |
| `#1D1D1F`            | `#FFFFFF` | 16.10:1        | AAA                                      |
| `rgba(60,60,67,0.6)` | `#FFFFFF` | 4.54:1         | AA                                       |
| `#FFFFFF`            | `#34C759` | 1.63:1         | 注意: 大テキスト前提、アイコン併用で補完 |
| `#FFFFFF`            | `#FF3B30` | 3.33:1         | AA（大テキスト・UI部品）                 |
| `#FFFFFF`            | `#1D1D1F` | 16.10:1        | AAA（トースト）                          |

> 注意: `#FFFFFF` on `#34C759`（3.17:1）は通常テキストの 4.5:1 基準を下回るため、「変更を適用」ボタンのラベルには font-weight 700 かつ fontSize 15px 以上を使用するか、アイコン（チェックマーク）を必ず併用する。

---

## 6. アニメーション仕様

| 要素                       | アニメーション                     | 値                                               |
| -------------------------- | ---------------------------------- | ------------------------------------------------ |
| Action Bar 表示            | フェードイン + 上から 4px スライド | `opacity 0→1, translateY -4px→0, 200ms ease-out` |
| Diff Panel 展開            | 高さアニメーション                 | `max-height 0→auto, 250ms ease-out`              |
| Inline Guidance Block 表示 | フェードイン + 上から 8px スライド | `opacity 0→1, translateY -8px→0, 250ms ease-out` |
| トースト出現               | 下から 8px スライド                | `opacity 0→1, translateY 8px→0, 250ms ease-out`  |
| スピナー回転               | 連続回転                           | `rotate 0→360deg, 1s linear infinite`            |
| ボタン ホバー              | 背景色変化                         | `200ms ease`                                     |
| ボタン アクティブ          | スケールダウン                     | `scale(0.97), 100ms ease`                        |

- `prefers-reduced-motion: reduce` が設定されている場合は全アニメーションを無効化し、即時表示切り替えに降格する。

---

## 7. レスポンシブ・レイアウト考慮

| パネル幅        | レイアウト変化                            |
| --------------- | ----------------------------------------- |
| 1200px 以上     | Diff Preview を editor 右側スプリット表示 |
| 900px 〜 1200px | Diff Preview を editor 下部スプリット表示 |
| 900px 未満      | Diff Preview をモーダルオーバーレイで表示 |

Context Summary Panel と Inline Guidance Block は常に editor 下部の固定領域に表示し、パネル幅に関わらずレイアウト変化させない。

---

## 8. 設計根拠サマリー

| 設計決定                                         | 根拠                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Action Bar を editor 上部インライン配置          | selection との空間的近接性（Gestalt 近接の法則）でユーザーの操作意図を強化        |
| handoff 状態で terminal コマンドをコピー可能表示 | API key 未設定ユーザーが最小操作でリカバリーできるよう Error Recovery UX を優先   |
| diff 表示に Monaco diff editor 使用              | 既存エディタコンテキストを維持し、学習コスト・認知切り替えコストをゼロに抑える    |
| `aria-live="polite"` で状態変化通知              | 即時割り込み（assertive）を避け、スクリーンリーダーユーザーの現在タスクを妨げない |
| Outline スタイルの「terminal で続ける」ボタン    | Primary CTA との視覚的階層を明確化し、handoff が補助的アクションであることを表現  |
| `prefers-reduced-motion` 対応                    | 前庭障害を持つユーザーへの配慮（WCAG 2.3.3 成功基準）                             |
