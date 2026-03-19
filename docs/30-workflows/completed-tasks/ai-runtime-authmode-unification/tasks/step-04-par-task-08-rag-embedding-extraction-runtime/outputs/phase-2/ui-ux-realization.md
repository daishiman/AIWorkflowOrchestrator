# Phase 2 UI/UX 実体化: RAG / Embedding / Extraction Backend Job

## メタ情報

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| タスクID | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                         |
| Phase    | 2 設計                                                                   |
| 対象     | RAG / Embedding / Extraction backend job の共通 UI 部品仕様              |
| 上位正本 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md` |
| 作成日   | 2026-03-19                                                               |

---

## 1. 画面構成

backend job（RAG / Embedding / Extraction）は専用チャット UI を持たない。以下の 4 共通部品で全状態を表示する。

| 部品               | 用途                                                  | 配置位置                         |
| ------------------ | ----------------------------------------------------- | -------------------------------- |
| Status Row         | ジョブの現在状態をインラインで示す                    | ジョブ一覧行、ジョブ詳細ヘッダー |
| Fail-Fast Notice   | unsupported capability / provider failure 時の通知    | Status Row の直下に差し込む      |
| Guidance Block     | guidance-only surface での代替アクション説明          | ジョブ詳細領域またはモーダル内   |
| Progress Indicator | long-running job（AI_INDEX / embedding pipeline）向け | Status Row 内のサブ領域          |

### 配置ルール

- Status Row は常に表示する。blank state（理由のない空欄）は禁止する。
- Fail-Fast Notice は unsupported capability または provider failure が確定した時点で即座に差し込む。成功を見せかけてから後で失敗を通知しない。
- Guidance Block は production mock 状態の surface でのみ表示する。実行可能な surface では表示しない。
- Progress Indicator は running 状態の time > 2 秒で表示を開始する。即時完了（< 2 秒）では表示しない。

---

## 2. Status Row 仕様

### 状態テーブル

| 状態      | アイコン     | テキスト例        | CTA 1（Primary） | CTA 2（Secondary） | 色トークン |
| --------- | ------------ | ----------------- | ---------------- | ------------------ | ---------- |
| queued    | clock        | "待機中..."       | キャンセル       | -                  | neutral    |
| running   | spinner      | "実行中... (XX%)" | キャンセル       | -                  | primary    |
| completed | check-circle | "完了"            | 詳細を見る       | -                  | success    |
| failed    | x-circle     | "失敗しました"    | 再試行           | 詳細を見る         | error      |
| blocked   | lock         | "実行できません"  | 設定を開く       | -                  | warning    |

### Status Row 構造

```
[ アイコン ] [ テキスト / 進捗バー ]                [ CTA 1 ] [ CTA 2 ]
```

- アイコンと色だけで状態を区別しない。テキストラベルを必ず併記する（アクセシビリティ要件）。
- queued / running では「キャンセル」を必ず表示する。中断手段のない running 状態を放置しない。
- failed では「再試行」と「詳細を見る」を両方提供する。どちらか 1 つに絞らない。
- blocked では「設定を開く」のみを表示する。retry は表示しない（retry 操作でも blocked が解消しないため）。

### 色トークン定義

| トークン名 | ライトモード値 | ダークモード値 | 用途                      |
| ---------- | -------------- | -------------- | ------------------------- |
| neutral    | `#6B6B6B`      | `#8E8E93`      | queued 状態の文字色       |
| primary    | `#007AFF`      | `#0A84FF`      | running アイコン・バー    |
| success    | `#34C759`      | `#30D158`      | completed アイコン        |
| error      | `#FF3B30`      | `#FF453A`      | failed アイコン・テキスト |
| warning    | `#FF9500`      | `#FF9F0A`      | blocked アイコン          |

---

## 3. Fail-Fast Notice 仕様

unsupported capability または provider failure が確定した場合に表示するブロック。

### 構造

```
[ エラータイトル（Header） ]
[ 原因説明（Body）          ]
[ CTA ボタン群              ]
```

### 必須要素

| 要素   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| Header | エラーの種別を一文で示す。「できない」事実を前に出す。                           |
| Body   | 原因を 1〜2 文で説明する。API key / provider / capability のどれが問題かを示す。 |
| CTA    | `設定を開く` または `詳細を見る` のいずれか（または両方）。                      |

### 禁止事項

- terminal での代替実行を提案しない。（例: "terminal でコマンドを実行してください" → 禁止）
- API key の実値を Body に表示しない。
- 原因を省いた "エラーが発生しました" 単体の通知は禁止する。

### fail-fast トリガー条件

| トリガー                          | 表示タイミング                                  |
| --------------------------------- | ----------------------------------------------- |
| capability = `guidance-only`      | ジョブ開始操作前（preflight で検出）            |
| API key 未設定                    | ジョブ開始操作前（preflight で検出）            |
| provider failure（非 rate limit） | ジョブ開始後の最初のエラーレスポンス受信時      |
| capability = `not-in-scope`       | ジョブ開始操作前（UI 上で実行ボタンを非活性化） |

---

## 4. Guidance Block 仕様

production mock 状態の surface（guidance-only）で表示するブロック。実行は行わず、次アクションの導線のみ提供する。

### 構造

```
[ "この機能は現在利用できません"（Header） ]
[ 理由説明（Body）                          ]
[ CTA ボタン群                              ]
```

### 必須要素

| 要素   | 内容                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| Header | `"この機能は現在利用できません"` を固定ラベルとして使用する。                      |
| Body   | 理由を明示する。"coming soon" のみの説明は禁止。provider / capability 名を含める。 |
| CTA    | `設定を開く` / 代替導線のいずれか。                                                |

### 禁止事項

- blank state（理由なしの空画面）は禁止する。
- Body なしの Header 単体表示は禁止する。
- 代替として terminal での実行を提案しない。

---

## 5. Error Message テンプレート

各エラーパターンのマイクロコピー定義。

| エラー種別          | Header                                         | Body                                                               | CTA                   |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------ | --------------------- |
| API key 未設定      | "API キーが設定されていません"                 | "{機能名}を使用するには API キーの設定が必要です"                  | "設定を開く"          |
| capability 未対応   | "このプロバイダーは{機能名}に対応していません" | "{機能名}に対応したプロバイダーに切り替えてください"               | "設定を開く"          |
| provider failure    | "接続に失敗しました"                           | "プロバイダーとの通信中にエラーが発生しました"                     | "再試行"              |
| rate limit          | "レート制限に達しました"                       | "{XX}秒後に自動で再試行します"                                     | （自動 / キャンセル） |
| timeout             | "タイムアウトしました"                         | "処理に時間がかかりすぎました"                                     | "再試行"              |
| job failure（一般） | "処理に失敗しました"                           | "{機能名}の処理中にエラーが発生しました。詳細: {エラーメッセージ}" | "再試行" / "詳細"     |

### マイクロコピー原則

- `{機能名}` プレースホルダーには embedding / entity extraction / community summary など具体名を入れる。"機能" 単体では使用しない。
- `{エラーメッセージ}` には API key の実値を含めない。provider のエラーコード・コード番号までに留める。
- rate limit の Body には必ず残り秒数または "自動で再試行" の旨を含める。「しばらくお待ちください」は禁止。

---

## 6. Long-Running Job Progress 仕様

AI_INDEX / embedding pipeline 向けの詳細進捗表示。

### 表示要素

| 要素                | 表示内容                        | 表示条件                           |
| ------------------- | ------------------------------- | ---------------------------------- |
| 進捗バー            | 0〜100% の帯グラフ              | running 状態かつ percentage 取得可 |
| percentage テキスト | "XX% 完了"                      | 進捗バーと同位置に併記             |
| 経過時間            | "経過: X 分 X 秒"               | running 開始後 2 秒以降            |
| 推定残り時間        | "残り約 X 分"                   | percentage > 10% の場合のみ表示    |
| キャンセルボタン    | "キャンセル"（danger スタイル） | running 状態で常に表示             |
| partial failure     | "XX 件中 YY 件成功、ZZ 件失敗"  | job 完了後にエラー件数 > 0 の場合  |

### Progress Indicator 詳細ルール

- percentage が取得できない場合は indeterminate spinner（帯の流れアニメーション）を使用する。数値なしの空白スペースを表示しない。
- キャンセルボタンは running 状態では必ず活性化する。「キャンセル不可」の状態を UI 上で放置しない。
- partial failure は completed 扱いだが、Status Row の色を success ではなく warning で表示する。

---

## 7. Primary / Secondary CTA 定義

| CTA 種別  | ラベル       | 用途                                              | 非活性条件                          |
| --------- | ------------ | ------------------------------------------------- | ----------------------------------- |
| Primary   | "実行する"   | ジョブ開始                                        | capability が `not-in-scope` の場合 |
| Secondary | "詳細を見る" | エラー詳細・ログの展開                            | エラー情報がない場合                |
| Secondary | "設定を開く" | プロバイダー / API key 設定画面へのナビゲーション | -                                   |
| Danger    | "キャンセル" | running ジョブの停止                              | running 状態以外                    |

### CTA 配置ルール

- Primary CTA は Status Row の右端に配置する。
- Primary CTA が非活性の場合は Guidance Block または Fail-Fast Notice の CTA に置き換える。
- 同一 Status Row に Primary と Danger が共存する場合、Danger（キャンセル）を左に配置する。
- `"設定を開く"` は常に Settings 画面の API key セクションへ遷移する。別の設定画面へ誘導しない。

---

## 8. アクセシビリティ要件

| 観点           | 要件                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| キーボード操作 | Tab 移動だけで Status Row の CTA 全てに到達できる                       |
| フォーカス     | Fail-Fast Notice / Guidance Block は表示時に heading へフォーカスを移す |
| 色と文言       | status badge は色だけでなく文言でも状態を区別する（色盲ユーザー対応）   |
| aria-live      | Status Row の状態変化は `aria-live="polite"` で通知する                 |
| spinner        | indeterminate spinner には `aria-label="処理中"` を付与する             |

---

## 9. 禁止事項サマリー

| 禁止事項                                                 | 理由                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| blank state（理由なしの空画面）                          | ユーザーが次のアクションを判断できない                         |
| terminal での代替実行を提案する                          | terminal は backend job の fallback ではなくユーザーの作業場所 |
| API key の実値を UI に表示する                           | セキュリティリスク                                             |
| running 状態でキャンセル手段を提供しない                 | ユーザーが処理を止める手段を失う                               |
| progress 不明のまま spinner のみで放置する               | ユーザーが進捗を把握できず不安になる                           |
| capability 不明のまま実行ボタンを活性化する              | silent fallback または予期しない失敗が発生する                 |
| 原因を省いた "エラーが発生しました" 単体の通知           | ユーザーが次のアクションを取れない                             |
| completed と partial failure を同じ success 色で表示する | ユーザーが部分失敗を見落とす                                   |

---

## 10. 上位 UI/UX 正本との対応

| 本書セクション      | 上位正本（ui-ux-realization.md）該当箇所                   |
| ------------------- | ---------------------------------------------------------- |
| 1. 画面構成         | Surface 別 UI/UX 定義 > RAG / Embedding / Extraction       |
| 2. Status Row       | 共通 UI パターン > Access Capability Card / Runtime Banner |
| 3. Fail-Fast Notice | 共通 UI パターン > Guidance Block                          |
| 4. Guidance Block   | 画面状態マトリクス > unavailable / blocked                 |
| 5. Error Message    | マイクロコピー原則                                         |
| 6. Progress 仕様    | 画面状態マトリクス > running / streaming                   |
| 7. CTA 定義         | Surface 別 UI/UX 定義 > Primary CTA / Secondary CTA        |
| 8. アクセシビリティ | アクセシビリティ / 操作性                                  |
