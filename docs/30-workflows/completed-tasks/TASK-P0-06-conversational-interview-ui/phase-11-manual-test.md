# Phase 11: 手動テスト - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| Phase名    | 手動テスト                             |
| 前提Phase  | Phase 10（最終レビューゲート）         |
| 後続Phase  | Phase 12（ドキュメント更新）           |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

Phase 10 までの最終レビューでは検証しきれない、UI の視覚的挙動・操作フロー・ユーザー体験を手動で確認する。UI task であるため、スクリーンショットによるエビデンス取得と Apple UI/UX ガイドラインに基づく視覚レビューを必須とする。UT-P0-06-PHASE11-EVIDENCE-001 の成果物として後続タスクへ引き継ぐ。

## 背景

TASK-P0-06 は Reactコンポーネント拡張を中心としたUI taskである。5種の InputKind（single_select, multi_select, free_text, secret, confirm）に対応したインタラクティブなチャット型インタビューUIのため、Phase 10 までの最終レビューだけでは以下の観点をカバーできない：

- 視覚的なレイアウト崩れ・アニメーション挙動
- 実際のユーザー操作フロー（クリック・キーボード入力・遷移）
- Electronアプリ上での描画パフォーマンス
- APIキーガイダンスバナーの表示タイミングと視認性
- 初心者/エンジニアモード切替時のUIテキスト変化

---

## 実行タスク

### タスク1: テスト環境の準備

**目的**: 手動テスト実行に必要な環境を整える。

**実行手順**:

1. 依存タスクの完了を確認する
   - RT-04（APIキー管理UI）が利用可能であること
   - RT-05（multi_select型定義）がマージ済みであること
2. Electronアプリをデバッグモードで起動する

```bash
pnpm --filter @repo/desktop dev
```

3. DevTools を開き、Console にエラーがないことを確認する
4. テスト用のスキル定義（5種InputKindを含むもの）を用意する

---

### タスク2: 手動テストシナリオの実行

**目的**: 全11シナリオを順に実行し、期待される挙動を確認する。

#### シナリオ一覧

| #    | シナリオ                    | 確認内容                                                   | 期待結果                                                                                                                                                                       | InputKind     |
| ---- | --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| S-01 | 初期表示                    | 最初の質問がアシスタントメッセージとして表示される         | チャットバブル（左寄せ）に最初の質問テキストが表示され、入力エリアが対応するウィジェットで表示される                                                                           | -             |
| S-02 | single_select操作           | チップ選択→送信→次の質問が追加される                       | 選択肢チップをクリックすると視覚的にハイライトされ、送信ボタン押下後にユーザーメッセージ（右寄せ）として選択ラベルが表示され、次の質問がアシスタントメッセージとして追加される | single_select |
| S-03 | multi_select操作            | 複数チェック→送信→選択ラベルがユーザーメッセージとして表示 | 複数のチェックボックスを選択でき、送信後に選択したラベルがカンマ区切りでユーザーメッセージとして表示される                                                                     | multi_select  |
| S-04 | free_text操作               | テキスト入力→Enter/送信→次の質問が表示される               | テキストエリアに入力でき、Enter（またはShift+Enter以外）で送信され、入力テキストがユーザーメッセージとして表示される                                                           | free_text     |
| S-05 | secret操作                  | パスワード入力→マスク表示（●●●●）でユーザーメッセージ表示  | パスワード入力フィールドが表示され、送信後にユーザーメッセージが「●●●●」でマスクされて表示される。平文が画面上に一切表示されない                                               | secret        |
| S-06 | confirm操作                 | はい/いいえボタン押下で即時送信される                      | 2つのボタン（はい/いいえ）が表示され、クリック即座にユーザーメッセージとして選択結果が表示され、次の質問に遷移する（明示的な送信ボタン不要）                                   | confirm       |
| S-07 | undo操作                    | 「← 戻る」クリックで前の質問に戻り、以前の回答状態が復元   | 戻るボタンクリック後、最後のユーザーメッセージとそれに続くアシスタントメッセージが削除され、前の入力ウィジェットが以前の回答値で復元される                                     | -             |
| S-08 | APIキー未設定+secret種別    | ガイダンスバナーが表示される                               | apiKeyStatus が未設定の状態で secret 種別の質問に到達した際、ConversationalInterview の上部にガイダンスバナーが表示され、RT-04（APIキー設定UI）への導線が提供される            | secret        |
| S-09 | バリデーション              | 未入力で送信試行するとエラーメッセージが表示される         | free_text で空文字のまま送信ボタンを押すと、エラーメッセージ（赤字）が入力エリア付近に表示され、送信がブロックされる                                                           | free_text     |
| S-10 | 進捗バー                    | 質問が進むごとにプログレスバーが更新される                 | InterviewProgressBar が WorkflowEngine のステップ情報と連動し、質問回答ごとに進捗率が増加する。完了時に100%表示になる                                                          | -             |
| S-11 | 初心者/エンジニアモード切替 | プレースホルダーテキストの表示/非表示が切り替わる          | 初心者モードではプレースホルダーに補足説明テキストが表示され、エンジニアモードでは簡潔な表示に切り替わる                                                                       | free_text     |

#### 実行手順（各シナリオ共通）

1. シナリオの前提条件を設定する（該当するInputKindの質問が表示される状態を作る）
2. 記載された操作を実行する
3. 期待結果と実際の挙動を比較する
4. スクリーンショットを取得する（タスク3参照）
5. 結果を `outputs/phase-11/manual-test-result.md` に記録する（Pass / Fail / 条件付きPass）

---

### タスク3: スクリーンショット取得計画

**目的**: 各シナリオのUIエビデンスをスクリーンショットとして取得・管理する。

#### screenshot-plan.json 形式

この計画は `outputs/phase-11/screenshot-plan.json` に保存する。

```json
{
  "taskId": "TASK-P0-06",
  "phase": 11,
  "createdAt": "2026-04-04",
  "captureTargets": [
    {
      "id": "SC-01",
      "scenario": "S-01",
      "description": "初期表示 - 最初の質問がアシスタントメッセージとして表示",
      "timing": "ページロード完了後",
      "viewport": "1280x800",
      "filename": "s01-initial-display.png"
    },
    {
      "id": "SC-02",
      "scenario": "S-02",
      "description": "single_select - チップ選択状態",
      "timing": "チップクリック後、送信前",
      "viewport": "1280x800",
      "filename": "s02-single-select-selected.png"
    },
    {
      "id": "SC-02b",
      "scenario": "S-02",
      "description": "single_select - 送信後の次の質問表示",
      "timing": "送信後",
      "viewport": "1280x800",
      "filename": "s02-single-select-submitted.png"
    },
    {
      "id": "SC-03",
      "scenario": "S-03",
      "description": "multi_select - 複数選択状態",
      "timing": "2つ以上のチェックボックス選択後",
      "viewport": "1280x800",
      "filename": "s03-multi-select-checked.png"
    },
    {
      "id": "SC-03b",
      "scenario": "S-03",
      "description": "multi_select - 送信後のユーザーメッセージ表示",
      "timing": "送信後",
      "viewport": "1280x800",
      "filename": "s03-multi-select-submitted.png"
    },
    {
      "id": "SC-04",
      "scenario": "S-04",
      "description": "free_text - テキスト入力中",
      "timing": "テキスト入力中",
      "viewport": "1280x800",
      "filename": "s04-free-text-typing.png"
    },
    {
      "id": "SC-05",
      "scenario": "S-05",
      "description": "secret - マスク表示のユーザーメッセージ",
      "timing": "送信後",
      "viewport": "1280x800",
      "filename": "s05-secret-masked.png"
    },
    {
      "id": "SC-06",
      "scenario": "S-06",
      "description": "confirm - はい/いいえボタン表示",
      "timing": "confirm質問表示時",
      "viewport": "1280x800",
      "filename": "s06-confirm-buttons.png"
    },
    {
      "id": "SC-07",
      "scenario": "S-07",
      "description": "undo - 戻る操作後の状態",
      "timing": "戻るボタンクリック後",
      "viewport": "1280x800",
      "filename": "s07-undo-restored.png"
    },
    {
      "id": "SC-08",
      "scenario": "S-08",
      "description": "APIキー未設定ガイダンスバナー",
      "timing": "secret種別質問到達時（APIキー未設定状態）",
      "viewport": "1280x800",
      "filename": "s08-api-key-guidance-banner.png"
    },
    {
      "id": "SC-09",
      "scenario": "S-09",
      "description": "バリデーションエラー表示",
      "timing": "空入力で送信試行後",
      "viewport": "1280x800",
      "filename": "s09-validation-error.png"
    },
    {
      "id": "SC-10",
      "scenario": "S-10",
      "description": "進捗バー更新",
      "timing": "質問2つ回答後",
      "viewport": "1280x800",
      "filename": "s10-progress-bar.png"
    },
    {
      "id": "SC-11a",
      "scenario": "S-11",
      "description": "初心者モード - プレースホルダー表示",
      "timing": "初心者モード選択時",
      "viewport": "1280x800",
      "filename": "s11-beginner-mode.png"
    },
    {
      "id": "SC-11b",
      "scenario": "S-11",
      "description": "エンジニアモード - 簡潔表示",
      "timing": "エンジニアモード選択時",
      "viewport": "1280x800",
      "filename": "s11-engineer-mode.png"
    }
  ],
  "outputDir": "outputs/phase-11/screenshots/",
  "metadataFile": "outputs/phase-11/phase11-capture-metadata.json"
}
```

スクリーンショットは `outputs/phase-11/screenshots/` ディレクトリに保存し、`outputs/phase-11/phase11-capture-metadata.json` でファイル名・取得日時・シナリオIDを紐付ける。

---

### タスク4: Apple UI/UX 視覚レビュー

**目的**: macOS / Apple Human Interface Guidelines に照らしてUIの視覚品質を評価する。

#### レビュー観点

| #    | 観点             | 確認項目                                                                               |
| ---- | ---------------- | -------------------------------------------------------------------------------------- |
| V-01 | 余白・間隔       | チャットバブル間の余白が均一か。入力エリアとメッセージ一覧の間隔が適切か               |
| V-02 | フォント         | システムフォント使用。サイズ・ウェイトが階層的に適切か                                 |
| V-03 | カラー           | アクセントカラーの一貫性。ダーク/ライトモード両対応                                    |
| V-04 | アニメーション   | メッセージ追加時のスクロールアニメーションが自然か。チップ選択のフィードバックが即時か |
| V-05 | フォーカス管理   | Tab順序が論理的か。フォーカスリングが可視か                                            |
| V-06 | アクセシビリティ | コントラスト比 4.5:1 以上。スクリーンリーダー対応のaria属性                            |
| V-07 | レスポンシブ     | ウィンドウリサイズ時にレイアウトが崩れないか                                           |
| V-08 | エラー状態       | エラーメッセージの色・位置が直感的か                                                   |

結果は `outputs/phase-11/ui-sanity-visual-review.md` に記録する。

---

### タスク5: 手動統合テスト（UI/API接続）

**目的**: UIコンポーネントとElectronメインプロセス（IPC）の接続を手動で確認する。

#### 統合テスト項目

| #     | 接続パス                                                           | 確認内容                                                                                      |
| ----- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| IT-01 | ConversationalInterview → useInterviewState → IPC → WorkflowEngine | 質問の送受信がIPC経由で正しく行われること                                                     |
| IT-02 | InterviewProgressBar → WorkflowEngine stepInfo                     | 進捗情報がリアルタイムで反映されること                                                        |
| IT-03 | secret入力 → IPC → APIキー検証                                     | secret値がメインプロセスに安全に送信されること（DevToolsのNetworkタブで平文が露出しないこと） |
| IT-04 | apiKeyStatus → ガイダンスバナー表示                                | メインプロセスからのapiKeyStatus変更がUIに即時反映されること                                  |
| IT-05 | undo → useInterviewState rollback                                  | undo操作後もIPC接続が正常に維持されること                                                     |

---

### タスク6: UT-P0-06-PHASE11-EVIDENCE-001 への引き継ぎ準備

**目的**: Phase 11 の成果物を未タスク UT-P0-06-PHASE11-EVIDENCE-001 として構造化する。

**実行手順**:

1. 全スクリーンショットが `outputs/phase-11/screenshots/` に保存されていることを確認
2. `outputs/phase-11/phase11-capture-metadata.json` にキャプチャのメタデータを記録
3. 発見された問題を `outputs/phase-11/discovered-issues.md` に分類（Critical / Major / Minor）
4. Minor 以下の問題は Phase 12 の「Phase 10/11 MINOR追跡テーブル」に転記

---

## 参照資料

| 資料                      | パス/参照先                                                    | 用途                      |
| ------------------------- | -------------------------------------------------------------- | ------------------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                                      | FR/NFR定義参照            |
| Phase 2 設計              | `phase-2-design.md`                                            | コンポーネント設計参照    |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                      | 最終判定・引き継ぎ確認    |
| RT-04 APIキー管理UI       | 該当タスク仕様書                                               | APIキーガイダンス連携確認 |
| RT-05 multi_select型定義  | 該当タスク仕様書                                               | multi_select型互換性確認  |
| Apple HIG                 | https://developer.apple.com/design/human-interface-guidelines/ | 視覚レビュー基準          |

---

## 統合テスト連携【必須】

本PhaseはUI taskの手動統合テストとして、以下の接続を確認する：

- **Renderer → Main プロセス IPC**: ConversationalInterview から WorkflowEngine への質問回答送信
- **Main → Renderer プロセス IPC**: WorkflowEngine から InterviewProgressBar への進捗更新
- **APIキーステータス連携**: RT-04 の apiKeyStatus が ConversationalInterview のガイダンスバナーに反映
- **セキュリティ確認**: secret 種別の入力値がDevTools上で平文露出しないことをNetworkタブとConsoleで確認

統合テスト結果は `outputs/phase-11/manual-test-report.md` の「統合テスト結果」セクションに記録する。

---

## 成果物

| 成果物                 | ファイル名                                       | 説明                                     |
| ---------------------- | ------------------------------------------------ | ---------------------------------------- |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.json`          | 撮影対象・ファイル名・タイミング定義     |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`         | 各シナリオのPass/Fail記録                |
| 手動テストレポート     | `outputs/phase-11/manual-test-report.md`         | テスト全体のサマリー・統合テスト結果含む |
| 発見問題一覧           | `outputs/phase-11/discovered-issues.md`          | Critical/Major/Minor分類の問題リスト     |
| UI視覚レビュー         | `outputs/phase-11/ui-sanity-visual-review.md`    | Apple HIG準拠レビュー結果                |
| キャプチャメタデータ   | `outputs/phase-11/phase11-capture-metadata.json` | スクリーンショットのメタ情報             |
| スクリーンショット群   | `outputs/phase-11/screenshots/`                  | 各シナリオのUIエビデンス                 |

---

## 完了条件

- [ ] 全11シナリオ（S-01〜S-11）のテストが実行されている
- [ ] 各シナリオのPass/Fail結果が `outputs/phase-11/manual-test-result.md` に記録されている
- [ ] Critical問題が0件であること（Major以下は `outputs/phase-11/discovered-issues.md` に記録して続行可）
- [ ] スクリーンショットが全キャプチャ対象（SC-01〜SC-11b）について取得されている
- [ ] `outputs/phase-11/phase11-capture-metadata.json` にメタデータが記録されている
- [ ] Apple UI/UXレビュー結果が `outputs/phase-11/ui-sanity-visual-review.md` に記録されている
- [ ] 手動統合テスト（IT-01〜IT-05）が全て実行され結果が記録されている
- [ ] secret入力値がDevTools上で平文露出しないことが確認されている
- [ ] UT-P0-06-PHASE11-EVIDENCE-001 の引き継ぎ準備が完了している
- [ ] `outputs/phase-11/manual-test-report.md` にテスト全体のサマリーが記載されている

---

## 次のPhase

Phase 12: ドキュメント更新に進む。Phase 11 で発見された Minor 問題は Phase 12 の Phase 10/11 MINOR追跡テーブルに転記する。
