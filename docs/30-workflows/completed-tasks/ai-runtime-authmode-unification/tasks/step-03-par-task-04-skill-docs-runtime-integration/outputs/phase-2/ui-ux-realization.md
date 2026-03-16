# Phase 2 UI/UX 実体化 - Skill Docs Runtime Integration

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| Phase      | 2                                  |
| 作成日     | 2026-03-16                         |
| ステータス | completed                          |

## デザイン方針

| 方針             | 内容                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| Apple HIG 準拠   | systemBlue アクセント、8px グリッド、systemBackground/secondarySystemBackground |
| Clarity          | 各状態で「何が起きているか」「次に何をすべきか」を一目で把握可能にする          |
| Deference        | UI 装飾を控え、生成結果とガイダンスのコンテンツに主役を譲る                     |
| 破壊的表現の回避 | 「エラー」「失敗」ではなく「応答待ち」「接続待ち」等の中性的表現を使用する      |
| 同一ブロック表示 | 再試行と handoff を同じブロックに表示し、ユーザーの判断を助ける                 |

---

## 1. 状態遷移図

```
                                   ┌───────────────────────────────────────────────┐
                                   │                                               │
                                   ▼                                               │
 [guidance-only] <── (API key 未設定で初期表示)                                    │
       │                                                                           │
       │ (Settings で API key 登録後に画面復帰)                                    │
       ▼                                                                           │
   [ready] ──────(generate click)──────> [generating]                              │
                                            │                                      │
                                            ├──(success)──────> [result]           │
                                            │                                      │
                                            ├──(code: 3001)───> [timeout-guidance] ─┤
                                            │                       │ (再試行) ────┘
                                            │                                      │
                                            ├──(code: 3002)───> [rate-limit-wait] ─┤
                                            │                       │ (待機完了) ──┘
                                            │                                      │
                                            └──(code: 3003/     [error-guidance] ──┤
                                                4001/5001)          │ (再試行) ────┘
                                                                    │ (retryable のみ)
```

---

## 2. 各状態の詳細 UI 仕様

### 2-1. ready 状態

| 項目          | 仕様                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| 表示条件      | capability === "integrated-api" かつ生成未実行                          |
| ヘッダー      | 「Skill ドキュメント生成」（h2, label カラー）                          |
| 本文          | プロバイダ名の表示（例: "Anthropic Claude で生成します"）               |
| Primary CTA   | 「docs を生成」ボタン（systemBlue、角丸 8px、高さ 40px）                |
| Secondary CTA | なし                                                                    |
| アイコン      | ドキュメントアイコン（SF Symbols doc.text 相当、secondaryLabel カラー） |
| レイアウト    | 中央寄せ、padding 24px、8px グリッド準拠                                |

```
┌─────────────────────────────────────────────┐
│                                             │
│    [doc.text icon]                          │
│                                             │
│    Skill ドキュメント生成                    │
│    Anthropic Claude で生成します             │
│                                             │
│    ┌─────────────────────┐                  │
│    │   docs を生成        │  <- systemBlue  │
│    └─────────────────────┘                  │
│                                             │
└─────────────────────────────────────────────┘
```

### 2-2. generating 状態

| 項目           | 仕様                                                             |
| -------------- | ---------------------------------------------------------------- |
| 表示条件       | IPC 呼び出し中                                                   |
| ヘッダー       | 「生成中...」（h2, label カラー）                                |
| 本文           | 経過時間の表示（例: "12 秒経過"）                                |
| Primary CTA    | 「キャンセル」ボタン（secondaryLabel カラー、bordered スタイル） |
| Secondary CTA  | なし                                                             |
| インジケータ   | indeterminate スピナー（systemBlue、直径 24px）                  |
| アニメーション | スピナー回転 1.2 秒/周期、フェードイン 200ms                     |

```
┌─────────────────────────────────────────────┐
│                                             │
│    [spinner]  生成中...                      │
│    12 秒経過                                 │
│                                             │
│    ┌─────────────────────┐                  │
│    │   キャンセル          │  <- bordered   │
│    └─────────────────────┘                  │
│                                             │
└─────────────────────────────────────────────┘
```

### 2-3. result 状態

| 項目             | 仕様                                                  |
| ---------------- | ----------------------------------------------------- |
| 表示条件         | DocOperationResult.success === true                   |
| ヘッダー         | 「生成完了」（h2, label カラー）                      |
| 本文             | 生成結果サマリー（セクション数、文字数）              |
| Primary CTA      | 「エクスポート」ボタン（systemBlue）                  |
| Secondary CTA    | 「プレビュー」ボタン（bordered、systemBlue テキスト） |
| 成功インジケータ | チェックマーク（systemGreen、直径 20px）              |

```
┌─────────────────────────────────────────────┐
│                                             │
│    [checkmark.circle] 生成完了               │
│    3 セクション / 2,450 文字                 │
│                                             │
│    ┌─────────────┐  ┌───────────┐           │
│    │ エクスポート  │  │ プレビュー │           │
│    └─────────────┘  └───────────┘           │
│                                             │
└─────────────────────────────────────────────┘
```

### 2-4. timeout-guidance 状態

| 項目           | 仕様                                                              |
| -------------- | ----------------------------------------------------------------- |
| 表示条件       | error.code === 3001                                               |
| ヘッダー       | 「応答待ちタイムアウト」（h2, label カラー）                      |
| Guidance Block | reason + action を同一ブロックに表示（secondarySystemBackground） |
| Primary CTA    | 「再試行」ボタン（systemBlue）                                    |
| Secondary CTA  | 「terminal で作成」ボタン（bordered、secondaryLabel テキスト）    |
| Handoff Card   | terminal handoff 導線（prompt context コピーボタン含む）          |
| アイコン       | 時計アイコン（clock.badge.exclamationmark 相当、systemOrange）    |

```
┌─────────────────────────────────────────────┐
│                                             │
│    [clock icon]  応答待ちタイムアウト         │
│                                             │
│    ┌─ Guidance Block ─────────────────────┐ │
│    │ LLM からの応答が 30 秒以内に         │ │
│    │ 得られませんでした。                  │ │
│    │                                      │ │
│    │ 再試行するか、terminal で            │ │
│    │ 手動作成してください。               │ │
│    └──────────────────────────────────────┘ │
│                                             │
│    ┌──────────┐  ┌─────────────────┐        │
│    │  再試行   │  │ terminal で作成  │        │
│    └──────────┘  └─────────────────┘        │
│                                             │
│    ┌─ Handoff Card ───────────────────────┐ │
│    │ [copy icon] prompt context をコピー  │ │
│    │ working directory: ~/projects/...    │ │
│    └──────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### 2-5. rate-limit-wait 状態

| 項目          | 仕様                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| 表示条件      | error.code === 3002                                                        |
| ヘッダー      | 「レート制限待機中」（h2, label カラー）                                   |
| 本文          | 待機時間のカウントダウン表示（例: "残り 45 秒"）                           |
| Primary CTA   | 「待機中...」（disabled、systemGray カラー、待機完了後に「再試行」に変化） |
| Secondary CTA | 「terminal で作成」ボタン（bordered、secondaryLabel テキスト）             |
| プログレス    | 待機時間の線形プログレスバー（systemBlue、高さ 4px）                       |
| 自動再試行    | 待機時間経過後に自動で generating 状態に遷移する                           |

```
┌─────────────────────────────────────────────┐
│                                             │
│    [hourglass icon]  レート制限待機中         │
│                                             │
│    ┌─ Guidance Block ─────────────────────┐ │
│    │ API のレート制限に到達しました。       │ │
│    │ しばらく待ってから再試行してください。 │ │
│    └──────────────────────────────────────┘ │
│                                             │
│    残り 45 秒                                │
│    [==============================--------] │
│                                             │
│    ┌──────────┐  ┌─────────────────┐        │
│    │ 待機中... │  │ terminal で作成  │        │
│    └──────────┘  └─────────────────┘        │
│                                             │
└─────────────────────────────────────────────┘
```

### 2-6. error-guidance 状態

| 項目           | 仕様                                                              |
| -------------- | ----------------------------------------------------------------- |
| 表示条件       | error.code が 3003, 4001, 5001 のいずれか                         |
| ヘッダー       | 「接続に問題が発生」（h2, label カラー）                          |
| Guidance Block | error.guidance.reason + action を表示                             |
| Primary CTA    | 「再試行」ボタン（systemBlue、retryable === true の場合のみ表示） |
| Secondary CTA  | 「guidance を確認」ボタン（bordered）                             |
| アイコン       | 警告アイコン（exclamationmark.triangle 相当、systemOrange）       |

```
┌─────────────────────────────────────────────┐
│                                             │
│    [warning icon]  接続に問題が発生          │
│                                             │
│    ┌─ Guidance Block ─────────────────────┐ │
│    │ LLM サービスが一時的に              │ │
│    │ 利用できません。                     │ │
│    │                                      │ │
│    │ 再試行してください。                 │ │
│    └──────────────────────────────────────┘ │
│                                             │
│    ┌──────────┐  ┌──────────────────┐       │
│    │  再試行   │  │ guidance を確認  │       │
│    └──────────┘  └──────────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

### 2-7. guidance-only 状態

| 項目           | 仕様                                                           |
| -------------- | -------------------------------------------------------------- |
| 表示条件       | capability === "guidance-only"（API key 未設定時の初期表示）   |
| ヘッダー       | 「API key が必要です」（h2, label カラー）                     |
| Guidance Block | API key 未設定の理由と Settings 画面への導線                   |
| Primary CTA    | 「Settings へ」ボタン（systemBlue）                            |
| Secondary CTA  | 「terminal で作成」ボタン（bordered、secondaryLabel テキスト） |
| Handoff Card   | terminal handoff 導線（prompt context コピーボタン含む）       |
| アイコン       | 鍵アイコン（key 相当、secondaryLabel カラー）                  |

```
┌─────────────────────────────────────────────┐
│                                             │
│    [key icon]  API key が必要です            │
│                                             │
│    ┌─ Guidance Block ─────────────────────┐ │
│    │ API key が設定されていません。         │ │
│    │                                      │ │
│    │ Settings 画面で API key を           │ │
│    │ 登録してください。                    │ │
│    └──────────────────────────────────────┘ │
│                                             │
│    ┌────────────┐  ┌─────────────────┐      │
│    │ Settings へ │  │ terminal で作成  │      │
│    └────────────┘  └─────────────────┘      │
│                                             │
│    ┌─ Handoff Card ───────────────────────┐ │
│    │ [copy icon] prompt context をコピー  │ │
│    │ suggested command:                   │ │
│    │   claude "Generate docs for ..."     │ │
│    └──────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 3. コンポーネント構成

### Guidance Block

Guidance Block は全エラー状態で共通使用するコンポーネント。

| プロパティ       | 型      | 必須 | 説明                                 |
| ---------------- | ------- | ---- | ------------------------------------ |
| reason           | string  | 必須 | エラーが発生した理由（ユーザー向け） |
| action           | string  | 必須 | ユーザーが取るべきアクション         |
| handoffAvailable | boolean | 必須 | terminal handoff 導線を表示するか    |

スタイル仕様:

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| 背景色     | secondarySystemBackground（ライト: #F2F2F7 / ダーク: #1C1C1E） |
| 角丸       | 8px                                                            |
| パディング | 16px                                                           |
| テキスト色 | label（プライマリテキスト）                                    |
| ボーダー   | なし                                                           |
| マージン   | 上下 16px（8px グリッド x 2）                                  |

### Handoff Card

Handoff Card は terminal handoff が利用可能な状態で表示するコンポーネント。

| プロパティ       | 型     | 必須 | 説明                        |
| ---------------- | ------ | ---- | --------------------------- |
| promptContext    | string | 必須 | コピー対象の prompt context |
| workingDirectory | string | 任意 | working directory パス      |
| suggestedCommand | string | 任意 | 推奨 terminal コマンド      |

スタイル仕様:

| 項目         | 値                                                            |
| ------------ | ------------------------------------------------------------- |
| 背景色       | tertiarySystemBackground（ライト: #E5E5EA / ダーク: #2C2C2E） |
| 角丸         | 8px                                                           |
| パディング   | 12px                                                          |
| ボーダー     | opaqueSeparator（ライト: #C6C6C8 / ダーク: #38383A）、1px     |
| コピーボタン | systemBlue テキスト + copy アイコン                           |
| マージン     | 上 16px                                                       |

### CTA ボタン

| スタイル  | 背景色      | テキスト色     | ボーダー        | 角丸 | 高さ |
| --------- | ----------- | -------------- | --------------- | ---- | ---- |
| Primary   | systemBlue  | white          | なし            | 8px  | 40px |
| Secondary | transparent | systemBlue     | systemBlue, 1px | 8px  | 40px |
| Disabled  | systemGray5 | secondaryLabel | なし            | 8px  | 40px |

---

## 4. マイクロコピーテンプレート

### エラーコード別 guidance テキスト

| エラーコード | 状態             | guidance.reason                                | guidance.action                               |
| ------------ | ---------------- | ---------------------------------------------- | --------------------------------------------- |
| 2001         | guidance-only    | API key が設定されていません                   | Settings 画面で API key を登録してください    |
| 2002         | guidance-only    | API key が無効です                             | Settings 画面で API key を再設定してください  |
| 3001         | timeout-guidance | LLM からの応答が 30 秒以内に得られませんでした | 再試行するか、terminal で手動作成してください |
| 3002         | rate-limit-wait  | API のレート制限に到達しました                 | しばらく待ってから再試行してください          |
| 3003         | error-guidance   | LLM サービスが一時的に利用できません           | 再試行してください                            |
| 4001         | error-guidance   | アプリ内通信でエラーが発生しました             | 再試行してください                            |
| 5001         | error-guidance   | 予期しないエラーが発生しました                 | 問題が続く場合はアプリを再起動してください    |

### 状態別ヘッダーテキスト

| 状態             | ヘッダー               | サブテキスト例                               |
| ---------------- | ---------------------- | -------------------------------------------- |
| ready            | Skill ドキュメント生成 | {providerName} で生成します                  |
| generating       | 生成中...              | {elapsedSeconds} 秒経過                      |
| result           | 生成完了               | {sectionCount} セクション / {charCount} 文字 |
| timeout-guidance | 応答待ちタイムアウト   | -                                            |
| rate-limit-wait  | レート制限待機中       | 残り {remainingSeconds} 秒                   |
| error-guidance   | 接続に問題が発生       | -                                            |
| guidance-only    | API key が必要です     | -                                            |

### Handoff Card テンプレート

| 項目              | テンプレート                                                    |
| ----------------- | --------------------------------------------------------------- |
| コピーボタン      | "prompt context をコピー"                                       |
| working directory | "working directory: {workingDirectory}"                         |
| suggested command | "suggested command:\n claude \"Generate docs for {skillName}\"" |
| コピー完了        | "コピーしました"（1.5 秒後に元に戻る）                          |

---

## 5. インタラクション仕様

### アニメーション

| 要素                     | アニメーション                | 時間   | イージング           |
| ------------------------ | ----------------------------- | ------ | -------------------- |
| 状態遷移                 | フェードイン / フェードアウト | 200ms  | ease-in-out          |
| スピナー                 | 回転                          | 1200ms | linear（無限ループ） |
| プログレスバー           | 線形減少                      | 連続   | linear               |
| コピー完了フィードバック | テキスト切替                  | 150ms  | ease-out             |
| ボタンホバー             | 背景色変化                    | 150ms  | ease-in-out          |
| ボタンアクティブ         | スケール 0.98                 | 100ms  | ease-out             |

### フォーカス管理

| 状態遷移                       | フォーカス先                                            |
| ------------------------------ | ------------------------------------------------------- |
| ready -> generating            | キャンセルボタン                                        |
| generating -> result           | エクスポートボタン                                      |
| generating -> timeout-guidance | 再試行ボタン                                            |
| generating -> rate-limit-wait  | 待機完了後に再試行ボタン                                |
| generating -> error-guidance   | 再試行ボタン（retryable の場合）/ guidance を確認ボタン |
| guidance-only（初期）          | Settings へボタン                                       |

### キーボード操作

| キー   | 操作                                                  |
| ------ | ----------------------------------------------------- |
| Enter  | Primary CTA の実行                                    |
| Escape | generating 状態でキャンセル                           |
| Tab    | CTA 間のフォーカス移動                                |
| Cmd+C  | Handoff Card の prompt context コピー（フォーカス時） |

---

## 6. アクセシビリティ

### ARIA ラベル

| 要素           | role        | aria-label                                    |
| -------------- | ----------- | --------------------------------------------- |
| Guidance Block | alert       | "ガイダンス: {reason}"                        |
| Handoff Card   | region      | "terminal handoff 情報"                       |
| スピナー       | status      | "ドキュメント生成中" (aria-live="polite")     |
| プログレスバー | progressbar | aria-valuenow / aria-valuemin / aria-valuemax |
| コピーボタン   | button      | "prompt context をクリップボードにコピー"     |
| 状態ヘッダー   | heading     | aria-level="2"                                |

### コントラスト比

| 要素                  | 前景色         | 背景色                    | コントラスト比 | WCAG AA |
| --------------------- | -------------- | ------------------------- | -------------- | ------- |
| Primary CTA テキスト  | white          | systemBlue (#007AFF)      | 4.5:1 以上     | PASS    |
| Guidance テキスト     | label          | secondarySystemBackground | 4.5:1 以上     | PASS    |
| Secondary テキスト    | secondaryLabel | systemBackground          | 4.5:1 以上     | PASS    |
| Handoff Card テキスト | label          | tertiarySystemBackground  | 4.5:1 以上     | PASS    |

---

## 7. ダークモード対応

| 要素                | ライトモード          | ダークモード             |
| ------------------- | --------------------- | ------------------------ |
| 背景                | #FFFFFF               | #000000                  |
| Guidance Block 背景 | #F2F2F7               | #1C1C1E                  |
| Handoff Card 背景   | #E5E5EA               | #2C2C2E                  |
| プライマリテキスト  | #000000               | #FFFFFF                  |
| セカンダリテキスト  | rgba(60, 60, 67, 0.6) | rgba(235, 235, 245, 0.6) |
| アクセントカラー    | #007AFF               | #0A84FF                  |
| 成功カラー          | #34C759               | #30D158                  |
| 警告カラー          | #FF9500               | #FF9F0A                  |
| ボーダー            | #C6C6C8               | #38383A                  |

---

## 8. レスポンシブ対応

| ブレークポイント      | レイアウト変更                                               |
| --------------------- | ------------------------------------------------------------ |
| 幅 480px 以上（標準） | CTA ボタンは横並び、Handoff Card は全幅                      |
| 幅 480px 未満         | CTA ボタンは縦積み（各ボタン全幅）、パディングを 16px に縮小 |
| 幅 320px 未満         | ヘッダーフォントサイズを 1 段階縮小                          |
