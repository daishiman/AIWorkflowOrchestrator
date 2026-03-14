# Phase 2 UI/UX Realization - Workspace Chat Edit

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| Phase      | 2                                           |
| 成果物種別 | UI/UX 実体化ドキュメント                    |
| 作成日     | 2026-03-14                                  |
| 前提       | design-summary.md / contract-matrix.md      |
| 前提       | ui-ux-realization.md（共通方針）            |
| 後続       | Phase 3（設計レビュー）                     |

---

## 1. 画面構成（4 領域）

Workspace Chat Edit の画面は以下の 4 領域で構成される。各領域は状態に応じて表示内容が変化する。

```
+------------------------------------------------------------------+
| Editor Selection Action Bar                        [Terminal]    |
| [ファイル名 / 選択範囲バッジ] [編集コマンドセレクター]             |
+------------------------------------------------------------------+
| Context Summary Panel                                            |
| [ファイル chip 一覧] [合計サイズ] [コンテキスト操作]              |
+------------------------------------------------------------------+
| Diff Preview / Inline Guidance Block                             |
| [diff ビューアー / CTA グループ / エラー・handoff card]           |
+------------------------------------------------------------------+
| Inline Guidance Block（handoff card）                            |
| [capability / error reason] [next action CTA]                   |
+------------------------------------------------------------------+
```

### 1-A. Editor Selection Action Bar（領域 1）

| 要素                   | 内容                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| ファイル名バッジ       | 現在アクティブなファイルのパス（末尾 2 セグメントを表示）                      |
| 選択範囲バッジ         | `L{startLine}〜L{endLine}` 形式（selection がない場合は非表示）                |
| 編集コマンドセレクター | `続きを書く` / `リファクタリング` / `テスト生成` / `コメント追加` / `カスタム` |
| [Terminal] ボタン      | アプリ全体のターミナル常設ボタン（右上固定、全状態で表示）                     |

### 1-B. Context Summary Panel（領域 2）

| 要素             | 内容                                                           |
| ---------------- | -------------------------------------------------------------- |
| ファイル chip    | 添付ファイルを chip で表示（最大 10 件、超過時は警告表示）     |
| 合計サイズ表示   | 「N ファイル、合計 X KB / 100 KB」形式のプログレスバー付き表示 |
| コンテキスト操作 | chip 個別削除（×ボタン）/ 全クリア（一括削除）ボタン           |
| ドラッグ可能     | ファイルをドラッグで追加できる drop zone                       |

### 1-C. Diff Preview（領域 3）

| 要素             | 内容                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| diff ビューアー  | 変更前（赤）/ 変更後（緑）の並列表示、行番号付き                     |
| ファイル名ラベル | diff の対象ファイルパスを表示                                        |
| CTA グループ     | 状態ごとの Primary CTA + Secondary CTA（下記「状態ごとの CTA」参照） |
| キャンセルボタン | `generating` 状態でのみ表示。LLM 実行を中止する                      |

### 1-D. Inline Guidance Block / Handoff Card（領域 4）

| 要素                | 内容                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| capability 状態説明 | なぜ integrated runtime が使えないか / terminal handoff になるかを一文で説明する |
| context summary     | handoff 時：「N ファイル（X KB）」形式のサマリー                                 |
| suggestedCommand    | handoff 時：`claude --context "..."` 形式のコマンド（コピーボタン付き）          |
| next action CTA     | `terminal を開く` ボタン または `設定を確認する` ボタン                          |

---

## 2. 状態ごとの CTA

### 2-A. selection-ready（選択あり・capability 解決済み）

| 要素             | 内容                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| Primary CTA      | `編集案を生成`（`integratedRuntime` または `both` capability が有効な場合）        |
| Secondary CTA    | `terminal で続ける`（`both` または `terminalSurface` capability が有効な場合）     |
| Primary CTA 状態 | `enabled`（ファイルコンテキストあり + selection あり + capability 解決済みの場合） |
| Runtime Banner   | `Integrated API Runtime` バッジを表示（`integratedRuntime` 時）                    |
| Runtime Banner   | `Terminal Handoff` バッジを表示（`terminalSurface` のみの時）                      |

### 2-B. generating（LLM 実行中）

| 要素           | 内容                                                                  |
| -------------- | --------------------------------------------------------------------- |
| Primary CTA    | `生成中...`（disabled、スピナーアイコン付き）                         |
| Secondary CTA  | `キャンセル`（`enabled`、クリックで LLM 実行を中止する）              |
| 進捗バナー     | `Integrated API Runtime で生成中` のバナーを表示する                  |
| インジケーター | パルスアニメーション付きのドット（200ms インターバル）を表示する      |
| 操作制限       | `generating` 中はファイルの追加・削除・コマンド変更を disabled にする |

### 2-C. diff-ready（生成完了・差分プレビュー表示中）

| 要素             | 内容                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| Primary CTA      | `差分を適用`（ファイルに書き込む）                                       |
| Secondary CTA    | `差分を確認`（diff ビューアーをフォーカスする / スクロールを先頭に戻す） |
| Tertiary CTA     | `やり直す`（結果を reject して selection-ready に戻る）                  |
| diff サマリー    | `+N 行追加 / -N 行削除 / N 行変更` を表示する                            |
| ファイル名ラベル | 対象ファイルのパスを表示する                                             |

### 2-D. handoff（terminal handoff 案内）

| 要素                  | 内容                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| Primary CTA           | `terminal を開く`（Terminal Dock を開く）                                   |
| Secondary CTA         | `コマンドをコピー`（suggestedCommand をクリップボードにコピーする）         |
| Handoff Card タイトル | `この画面では自動実行しません。terminal で手動実行してください。`           |
| context summary       | 「N ファイル（X KB）を引き継ぎます」形式のサマリー                          |
| ファイル一覧          | handoff に含まれるファイルパス一覧（最大 5 件 + 「他 N 件」表示）           |
| 選択範囲              | selection がある場合、「選択範囲: src/App.tsx L10〜L25」を表示する          |
| suggestedCommand      | `claude --context "..."` 形式のコマンド（コードフォント、コピーボタン付き） |
| auto-send 禁止        | Handoff Card 内にコマンド実行ボタンは置かない。コピーと terminal 起動のみ   |

### 2-E. blocked（capability なし / 選択範囲未決定）

| 要素              | 内容                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| blocked 理由（1） | ファイルコンテキストが 0 件または選択範囲が未決定の場合                      |
| メッセージ（1）   | `選択範囲を決めてから続ける`（選択方法のヒントを付与する）                   |
| CTA（1）          | なし（操作の促しのみ。ボタンは Primary CTA が disabled のまま）              |
| blocked 理由（2） | capability = `none`（API key 不在 + terminal 不可）の場合                    |
| メッセージ（2）   | `この画面では AI 実行ができません。Settings で API key を設定してください。` |
| CTA（2）          | `設定を確認する`（Settings 画面へ遷移）                                      |
| blocked 理由（3） | `CREDENTIAL_MISSING` エラー                                                  |
| メッセージ（3）   | `[ProviderName] の API key が設定されていません。`                           |
| CTA（3）          | `Settings > API Key を確認する`（Settings 画面の API Key セクションへ遷移）  |

---

## 3. マイクロコピー一覧

### 3-A. 状態ごとのコピー

| 状態                | 場所                  | マイクロコピー                                                                   |
| ------------------- | --------------------- | -------------------------------------------------------------------------------- |
| `selection-ready`   | Primary CTA           | `編集案を生成`                                                                   |
| `selection-ready`   | Secondary CTA         | `terminal で続ける`                                                              |
| `selection-ready`   | Runtime Banner        | `Integrated API Runtime`（integrated 時）                                        |
| `selection-ready`   | Runtime Banner        | `terminal へ handoff`（terminal のみ時）                                         |
| `generating`        | Primary CTA           | `生成中...`                                                                      |
| `generating`        | Secondary CTA         | `キャンセル`                                                                     |
| `generating`        | 進捗バナー            | `Integrated API Runtime で生成中`                                                |
| `diff-ready`        | Primary CTA           | `差分を適用`                                                                     |
| `diff-ready`        | Secondary CTA         | `差分を確認`                                                                     |
| `diff-ready`        | Tertiary CTA          | `やり直す`                                                                       |
| `diff-ready`        | diff サマリー         | `+{added} 行追加 / -{removed} 行削除 / {modified} 行変更`                        |
| `handoff`           | Handoff Card タイトル | `この画面では自動実行しません。terminal で手動実行してください。`                |
| `handoff`           | context summary       | `{N} ファイル（{X} KB）を引き継ぎます`                                           |
| `handoff`           | Primary CTA           | `terminal を開く`                                                                |
| `handoff`           | Secondary CTA         | `コマンドをコピー`                                                               |
| `handoff`           | コマンドラベル        | `実行候補のコマンド:`                                                            |
| `blocked`（未選択） | メインメッセージ      | `選択範囲を決めてから続ける`                                                     |
| `blocked`（未選択） | ヒントテキスト        | `Monaco Editor でコードを選択するか、ファイルをコンテキストに追加してください。` |
| `blocked`（no cap） | メインメッセージ      | `この画面では AI 実行ができません。`                                             |
| `blocked`（no cap） | サブテキスト          | `Settings で API key を設定するか、Claude Code terminal を使用してください。`    |
| `blocked`（no cap） | CTA                   | `設定を確認する`                                                                 |
| `blocked`（no key） | メインメッセージ      | `{ProviderName} の API key が設定されていません。`                               |
| `blocked`（no key） | サブテキスト          | `Settings > API Key で {ProviderName} のキーを設定してください。`                |
| `blocked`（no key） | CTA                   | `Settings > API Key を確認する`                                                  |

### 3-B. エラーコード別マイクロコピー

| エラーコード              | ユーザー向けメッセージ                                       | guidance                                                        |
| ------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `CONTEXT_TOO_LARGE`       | `コンテキストサイズが 100KB を超えています。`                | `ファイルを減らすか、選択範囲を絞ってください。`                |
| `CAPABILITY_UNAVAILABLE`  | `この画面では Integrated AI Runtime を利用できません。`      | `Settings で API key を設定するか、terminal で続けてください。` |
| `CREDENTIAL_MISSING`      | `{ProviderName} の API key が設定されていません。`           | `Settings > API Key で設定してください。`                       |
| `PROVIDER_UNKNOWN`        | `AI プロバイダーの設定が正しくありません。`                  | `Settings で LLM プロバイダーを確認してください。`              |
| `LLM_ERROR`（retryable）  | `AI の応答に失敗しました。もう一度お試しください。`          | `{retry 残り回数} 回再試行できます。`                           |
| `TIMEOUT`                 | `AI の応答がタイムアウトしました。`                          | `しばらく待ってから再試行してください。`                        |
| `RATE_LIMIT`（retryable） | `リクエスト制限に達しました。`                               | `{N} 秒後に再試行できます。`                                    |
| `RATE_LIMIT`（終了）      | `リクエスト制限を超えました。しばらく時間をおいてください。` | `しばらく時間をおいてから再試行してください。`                  |
| `PERMISSION_DENIED`       | `ファイルへのアクセスが拒否されました。`                     | `ファイルパスとワークスペース設定を確認してください。`          |

---

## 4. アクセシビリティ要件

### 4-A. キーボード操作フロー

| 操作                          | キーバインド                             | 動作                                          |
| ----------------------------- | ---------------------------------------- | --------------------------------------------- |
| Primary CTA にフォーカス      | `Tab`（論理的な Tab 順序の先頭）         | `編集案を生成` ボタンにフォーカス移動         |
| Primary CTA を実行            | `Enter` または `Space`                   | LLM 実行を開始する                            |
| Secondary CTA にフォーカス    | `Tab`（Primary CTA の次）                | `terminal で続ける` / `差分を確認` へ移動     |
| キャンセルボタンにフォーカス  | `Tab`（generating 時に出現）             | `キャンセル` ボタンにフォーカス移動           |
| diff ビューアーにフォーカス   | `Tab`（diff-ready 時）                   | diff ビューアーのキーボード操作を有効化       |
| handoff CTA にフォーカス      | `Tab`（handoff 時）                      | `terminal を開く` / `コマンドをコピー` へ移動 |
| guidance ブロックにフォーカス | handoff / blocked 出現時に自動フォーカス | heading（h2/h3）にフォーカスを移す            |
| `[Terminal]` ボタン           | `Tab`（常にアクセス可能）                | Terminal Dock を開く                          |

**Tab 順序の設計原則**:

1. `[Terminal]` ボタン（App Shell Header 右上）
2. 編集コマンドセレクター
3. コンテキスト chip 一覧（ファイル chip と削除ボタン）
4. Primary CTA
5. Secondary CTA（表示されている場合）
6. Tertiary CTA（diff-ready 時のみ）
7. handoff CTA（handoff 時のみ）
8. guidance / blocked メッセージ内の CTA

### 4-B. ARIA 要件

| 要素                         | ARIA 属性                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| Primary CTA（disabled 時）   | `aria-disabled="true"` + `disabled`（フォーカスは受け取らない）         |
| スピナー（generating 中）    | `aria-live="polite"` で `生成中...` を読み上げる                        |
| diff ビューアー              | `role="region" aria-label="差分プレビュー"` を設定する                  |
| Handoff Card                 | `role="alertdialog" aria-labelledby="handoff-title"` を設定する         |
| Handoff Card（出現時）       | 出現時に `handoff-title` heading にフォーカスを移す                     |
| Guidance Block（blocked 時） | `role="alert"` を設定し、出現時に内容を即座に読み上げる                 |
| コマンドコピーボタン         | `aria-label="提案コマンドをコピー"` を設定する                          |
| ファイル chip の削除ボタン   | `aria-label="{ファイル名} を削除"` を設定する                           |
| 選択範囲バッジ               | `aria-label="選択範囲: {startLine} 行目から {endLine} 行目"` を設定する |
| Runtime Banner               | `role="status" aria-live="polite"` で capability 変更を読み上げる       |

### 4-C. コントラスト要件（WCAG 2.1 AA 準拠）

| 要素                    | 対応するカラー                                       | 最低コントラスト比 |
| ----------------------- | ---------------------------------------------------- | ------------------ |
| Primary CTA（通常）     | `systemBlue` 背景 / `#FFFFFF` テキスト               | 4.5:1 以上         |
| Primary CTA（disabled） | `systemGray5`(ライト) / `tertiaryBackground`(ダーク) | 3:1 以上（UI部品） |
| エラーメッセージ        | `systemRed` / `label`（プライマリテキスト）          | 4.5:1 以上         |
| 成功メッセージ          | `systemGreen` / `label`（プライマリテキスト）        | 4.5:1 以上         |
| ヒントテキスト          | `secondaryLabel` / 背景                              | 4.5:1 以上         |
| Handoff Card 背景       | `secondarySystemBackground` / テキスト               | 4.5:1 以上         |

---

## 5. Apple HIG 準拠事項

### 5-A. Clarity（明確性）

| 原則                 | 適用内容                                                                      |
| -------------------- | ----------------------------------------------------------------------------- |
| テキストの読みやすさ | システムフォント（`-apple-system`）を使用し、サイズは最低 13px を維持する     |
| アイコンの明確さ     | `generating` 状態のスピナーはシステム提供の SF Symbol を使用する              |
| 階層の一目理解       | 4 領域は上から下へ「操作→コンテキスト→結果→guidance」の論理的な流れを保持する |

### 5-B. Deference（コンテンツへの敬意）

| 原則             | 適用内容                                                               |
| ---------------- | ---------------------------------------------------------------------- |
| UI の控え目さ    | diff ビューアーを全幅表示し、周囲の UI 要素はコンパクトに収める        |
| コンテンツ優先   | ファイルの内容（diff）が主役。CTA は diff の下に配置する               |
| 不要な装飾の排除 | ステータスバッジは文言と色のみで表現し、余分なアニメーションを付けない |

### 5-C. Depth（奥行き）

| 原則               | 適用内容                                                                             |
| ------------------ | ------------------------------------------------------------------------------------ |
| 影とレイヤー       | Handoff Card は `0 1px 3px rgba(0,0,0,0.04)` のカードシャドウで浮き上がりを表現する  |
| モーションの目的性 | Handoff Card の出現は `200ms ease-in-out` のフェードイン。ループアニメーションは禁止 |
| 空間的な奥行き     | Diff Preview は内側にパディングを設け、エディタ領域との分離感を出す                  |

### 5-D. カラーパレット

| 用途                     | ライトモード（Apple HIG）             | ダークモード（Apple HIG）             |
| ------------------------ | ------------------------------------- | ------------------------------------- |
| Primary CTA 背景         | `systemBlue` (#007AFF)                | `systemBlue` (#0A84FF)                |
| エラー表示               | `systemRed` (#FF3B30)                 | `systemRed` (#FF453A)                 |
| 成功表示（適用完了）     | `systemGreen` (#34C759)               | `systemGreen` (#30D158)               |
| 警告（コンテキスト上限） | `systemOrange` (#FF9500)              | `systemOrange` (#FF9F0A)              |
| Handoff Card 背景        | `secondarySystemBackground` (#F2F2F7) | `secondarySystemBackground` (#1C1C1E) |
| diff 追加行              | `systemGreen` + 10% alpha 背景        | `systemGreen` + 10% alpha 背景        |
| diff 削除行              | `systemRed` + 10% alpha 背景          | `systemRed` + 10% alpha 背景          |

### 5-E. スペーシングとレイアウト

| 要素                      | 値                                 |
| ------------------------- | ---------------------------------- |
| 8px グリッドの遵守        | padding / margin はすべて 8 の倍数 |
| 角丸                      | カード: `8px`、ボタン: `8px`       |
| Context chip の高さ       | `28px`（8px グリッドに合わせる）   |
| Primary CTA の高さ        | `40px`（8px グリッドに合わせる）   |
| セクション間の余白        | `16px`（最小）/ `24px`（推奨）     |
| Handoff Card のパディング | `16px`                             |

---

## 6. 状態遷移フロー図

```
[Workspace Chat Edit 状態遷移]

初期状態（fileContexts = 0 && currentSelection = null）
  |
  v
blocked（「選択範囲を決めてから続ける」メッセージ表示）
  |
  | ファイルをドラッグまたは Monaco で選択
  v
selection-ready
  |── chatEditCapability = integratedRuntime/both → Primary CTA 有効
  |── chatEditCapability = terminalSurface のみ → handoff CTA を Primary に
  |── chatEditCapability = none → blocked（「設定を確認する」）
  |
  | 「編集案を生成」をクリック（integratedRuntime 経路）
  v
generating（isLoading = true）
  |
  +──[success]──→ diff-ready
  |                 |── isDiffPreviewOpen = true
  |                 |
  |                 +──[「差分を適用」]──→ applied（ファイル書き込み完了）
  |                 |                        |── status = 'approved'
  |                 |
  |                 +──[「やり直す」]──→ selection-ready（status = 'rejected'）
  |
  +──[CAPABILITY_UNAVAILABLE + handoff]──→ handoff
  |     |── setHandoffContext を呼び出す
  |     |── Handoff Card を表示する
  |     |── Primary CTA: 「terminal を開く」
  |     |── Secondary CTA: 「コマンドをコピー」
  |
  +──[CAPABILITY_UNAVAILABLE + none]──→ blocked
  |     |── Guidance Block を表示する
  |     |── Primary CTA: 「設定を確認する」
  |
  +──[CREDENTIAL_MISSING]──→ blocked
  |     |── Guidance Block を表示する
  |     |── Primary CTA: 「Settings > API Key を確認する」
  |
  +──[CONTEXT_TOO_LARGE]──→ selection-ready（エラーバナー表示）
  |
  +──[LLM_ERROR retryable、残 N 回]──→ selection-ready（retry 可能メッセージ表示）
  |
  +──[TIMEOUT]──→ selection-ready（timeout メッセージ表示）
  |
  +──[RATE_LIMIT retryable]──→ selection-ready（「N 秒後に再試行」メッセージ表示）
  |
  +──[RATE_LIMIT 上限超過]──→ blocked（「しばらく時間をおいてください」）

  | 「キャンセル」をクリック（generating 中）
  +──────→ selection-ready（isLoading = false）
```

---

## 7. コンポーネント一覧

### 7-A. 新規追加コンポーネント

| コンポーネント名       | 責務                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `SelectionBadge`       | Monaco の選択範囲（L{start}〜L{end}）を表示するバッジ         |
| `HandoffCard`          | terminal handoff 案内カード（summary / command / CTA）        |
| `RuntimeBanner`        | `Integrated API Runtime` / `terminal へ handoff` のバッジ表示 |
| `GuidanceBlock`        | blocked / エラー時の理由説明と次アクション CTA                |
| `ContextSizeIndicator` | 「N ファイル / X KB / 100 KB」形式のプログレスバー            |

### 7-B. 変更が必要な既存コンポーネント

| コンポーネント名        | 変更内容                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `ChatEditPanel`         | `chatEditCapability` / `handoffContext` を store から購読し、HandoffCard / GuidanceBlock を条件付き表示 |
| `SendWithContextButton` | `isLoading` と `chatEditCapability` に基づき `disabled` / ラベルを切り替える                            |
| `DiffPreviewPanel`      | `approveResult` の `writeFile` 呼び出しをフック層に移動する。`HandoffCard` を条件表示する               |
| `FileContextChip`       | 既存実装を維持。chip 削除ボタンの `aria-label` を追加する                                               |

---

## 8. 仕様同期先

本ドキュメントの変更に伴い、以下の仕様書と同期が必要である。

| 仕様書                                                                         | 同期が必要な箇所                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | IPCチャンネル / 状態フィールド / エラーコードの更新 |
| `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`       | Workspace Chat Edit の Surface 別 UI/UX 定義を更新  |
| `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`          | Workspace Chat Edit の状態遷移図を更新              |
