# UIナビゲーション（ChatView・ボタン仕様・パターン） / chat-patterns specification
> 親ファイル: [ui-ux-navigation.md](ui-ux-navigation.md)

## ChatViewナビゲーション

ChatViewには履歴ページへの導線として、ヘッダーにナビゲーション要素を配置する。

### ヘッダー構造

ChatView ヘッダーは左右2ブロックで構成する。

| 位置 | 要素 | 説明 |
|------|------|------|
| 左側 | タイトル | チャットビューのタイトルテキスト |
| 左側 | RAGステータス | RAG機能の有効/無効表示 |
| 左側 | InlineModelSelector | 選択中のProvider/Modelをインライン表示し、クリックでモデル切替可能 |
| 右側 | スキル管理ボタン | スキル一覧・管理画面への導線 |
| 右側 | 履歴ボタン | `/chat/history` への遷移（Lucide `History` アイコン） |

**InlineModelSelector**: `apps/desktop/src/renderer/components/organisms/InlineModelSelector` で実装。選択中のProvider名・Model名をコンパクトに表示し、クリックでドロップダウンを開いてモデルを切り替える。

### LLMGuidanceBanner との共存

| 条件 | LLMGuidanceBanner | InlineModelSelector |
|------|-------------------|---------------------|
| Provider/Model 未選択 | 表示（設定誘導） | 表示（プレースホルダー「モデルを選択」） |
| Provider/Model 選択済み | 非表示 | 表示（選択中モデル名） |
| ストリーミング中 | 非表示（選択済み前提） | 表示（disabled） |

InlineModelSelector は常に表示される。LLMGuidanceBanner は Provider/Model 両方が選択済みの場合に自動で非表示になる（Store 更新による React reactivity）。

**実装場所**: `apps/desktop/src/renderer/views/ChatView/index.tsx`

## ナビゲーションボタン仕様

| 要素 | 仕様 |
|------|------|
| 配置 | ChatViewヘッダー右上 |
| アイコン | Lucide Icons `History`（20px×20px） |
| ラベル | なし（アイコンのみ、`aria-label`で補完） |
| type属性 | `type="button"`（フォーム誤送信防止） |
| aria-label | `"チャット履歴"`（スクリーンリーダー対応） |
| 遷移先 | `/chat/history`（React Router） |
| 色 | `text-gray-400`（通常時）、`text-white`（ホバー時） |
| 背景 | 透明（通常時）、`bg-white/10`（ホバー時） |
| パディング | `p-2`（8px） |
| 角丸 | `rounded-lg`（8px） |
| トランジション | `transition-colors`（200ms ease） |

## ボタンスタイルガイドライン（アイコンのみボタン）

アイコンのみのボタン（テキストラベルなし）は以下の原則に従う：

| 原則 | 説明 |
|------|------|
| aria-labelは必須 | スクリーンリーダーが読み上げるラベルを提供 |
| type="button"を明示 | フォーム内で誤ってsubmitされることを防止 |
| タッチターゲット44px | モバイル対応（最小タッチサイズ） |
| ホバーフィードバック | 色変化と背景色変化の両方を提供 |
| アイコンサイズ20px | 視認性を確保しつつコンパクトに |
| フォーカス表示 | キーボードフォーカス時に明確なリング表示 |
| 色のコントラスト比 | gray-400（通常）→ white（ホバー）で4.5:1以上を確保 |

## テスト検証済み項目

| テスト項目 | 結果 | 詳細 |
|------------|------|------|
| ボタン表示 | ✅ | ヘッダー右上に正しく配置 |
| クリックナビゲーション | ✅ | `/chat/history`に遷移 |
| キーボード操作 | ✅ | Tab→Enterで操作可能 |
| ブラウザ履歴 | ✅ | ブラウザバック・フォワードで正常動作 |
| aria-label | ✅ | `aria-label="チャット履歴"`が設定済み |
| type属性 | ✅ | `type="button"`が設定済み |
| レスポンシブ | ✅ | 375px（モバイル）〜1920px（デスクトップ）対応 |
| ホバー状態 | ✅ | `hover:text-white hover:bg-white/10`動作確認 |

**参考**: Phase 8 (T-08-1) 手動テスト結果 - 2025-12-25実施

## アクセシビリティ対応事例

### 事例1: アイコンのみボタンのラベリング

**問題**: アイコンのみのボタンは視覚的には理解できるが、スクリーンリーダーユーザーには機能が伝わらない。

**解決策**: `aria-label`属性で機能を明示する。

### 事例2: type属性の明示

**問題**: フォーム内のボタンで`type`属性を省略すると、デフォルトで`type="submit"`となり誤送信が発生する。

**解決策**: `type="button"`を明示する。

### 事例3: キーボードナビゲーション対応

**問題**: クリックイベントのみでは、キーボードユーザーが操作できない。

**解決策**: `<button>`要素を使用する（自動的にEnter/Spaceキーで動作）。`<div onClick>`パターンは避ける。

### 事例4: フォーカス表示の確保

**問題**: `:focus { outline: none }`でフォーカスリングを消すと、キーボードユーザーがフォーカス位置を見失う。

**解決策**: `:focus-visible`でキーボードフォーカスのみ表示する。

### 事例5: レスポンシブデザインとタッチターゲット

**問題**: 小さいボタンはモバイルで押しにくい。

**解決策**: パディングを確保して44px以上のタッチターゲットを確保。`p-2`（8px）+ アイコン20px = 36px（最小）、`p-3`で44px（推奨）。

## ナビゲーションパターンのベストプラクティス

| 原則 | 説明 |
|------|------|
| 一貫性のある配置 | ナビゲーションボタンは常にヘッダー右上に配置 |
| 視覚的フィードバック | ホバー・フォーカス・アクティブ状態を明確に表現 |
| ブラウザ履歴との統合 | React Routerでブラウザバック・フォワードに対応 |
| プログレッシブ・エンハンスメント | JavaScriptなしでもアクセス可能な設計 |
| エラーハンドリング | ナビゲーション失敗時のフォールバックを提供 |

---

## 関連ドキュメント

- [Portal実装パターン](./ui-ux-portal-patterns.md)
- [システムプロンプト設定UI](./ui-ux-system-prompt.md)
- [LLM選択機能](./ui-ux-llm-selector.md)
- [UI/UXパネル設計](./ui-ux-panels.md)

---

## Onboarding overlay / rerun 契約（TASK-UI-09-ONBOARDING-WIZARD）

### 実装内容（要点）

| 観点 | 内容 |
| --- | --- |
| 初回起動 | `isOnboardingReady && !isOnboardingCompleted && !isOnboardingDismissed` の場合、通常画面の上に wizard overlay を表示する |
| 完了後導線 | completion persist 成功後に `setCurrentView("dashboard")` で通常画面へ戻し、以後の自動再表示を抑止する |
| rerun 導線 | Settings header の `はじめてガイドを再表示` button は `handleOpenOnboarding()` を呼び、`isOnboardingForcedOpen=true` / `isOnboardingDismissed=false` の local reopen で overlay を再表示する |
| non-visual close | ESC / 閉じるボタン / focus trap は automated test と code review で担保し、visual TC と ID を分離して扱う |

### 画面証跡

| TC | 証跡 | 観点 |
| --- | --- | --- |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-onboarding-step1-light-desktop.png` | 初回起動時の overlay |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-onboarding-step2-dark-desktop.png` | step2 の AI おためし |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-onboarding-step3-dark-tablet.png` | tablet 幅での starter card |
| TC-11-04 | `outputs/phase-11/screenshots/TC-11-04-onboarding-step4-light-desktop.png` | `system` preview readability を含む step4 |
| TC-11-05 | `outputs/phase-11/screenshots/TC-11-05-onboarding-step3-dark-mobile.png` | mobile first fold の可視性 |
| TC-11-06 | `outputs/phase-11/screenshots/TC-11-06-onboarding-complete-kanagawa-desktop.png` | completion hierarchy |

### 苦戦箇所（再発条件付き）

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| overlay と通常ナビゲーションの責務が混ざる | wizard を単なる modal として扱い、戻り先を曖昧にする | 「初回 overlay」「完了後通常画面」「Settings rerun」の3状態に分けて記録した |
| coverage validator に必要な台帳形式が崩れる | `phase-11-manual-test.md` に matrix を置かずに screenshot だけ残す | `## 画面カバレッジマトリクス` を正本にした |
| split-theme preview の可読性 | `system` preview の dark half に black text を載せると primary text が沈む | split 表現は outer card に残し、inner card は readable surface に寄せた |
| visual / non-visual TC の ID が衝突する | keyboard spot check を screenshot TC と同じ ID 空間で管理する | non-visual close は automated test / code review へ分離し、visual matrix は `TC-11-01..06` へ固定した |
| rerun card が埋もれる | overlay 再表示動作だけで navigation UX を完了扱いにする | discoverability は follow-up task に切り出した |
| selected card の理解しやすさが first fold 評価に埋もれる | `TC-11-05` で主コンテンツ可視性だけ見て、選択済み card の位置を別評価しない | mobile selected-card order は follow-up task に切り出し、first fold と selected-state prominence を別管理にした |

### 同種課題の5分解決カード

1. overlay UI は「表示条件」「完了後導線」「rerun callback」を別行で書く。
2. split-theme preview は outer/inner surface を分け、text を dark half に沈めない。
3. Phase 11 では visual TC と非視覚確認を別 ID 空間で管理する。
4. rerun 動作確認と発見性評価を別の判断軸にする。
5. navigation の変更は `ui-ux-settings` / `task-workflow` / `lessons-learned` と同時に同期する。

### 関連未タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001 | mobile Step 3 で selected starter card を最優先に理解しやすくする改善 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md` |
| UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001 | screenshot / test hardening と warning 解消 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md` |
| UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001 | rerun 入口の情報設計改善 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md` |
