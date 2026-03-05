# ナビゲーションUI設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

デスクトップアプリにおけるナビゲーションUI設計を定義する。
AppDockによるメインナビゲーションと、各View内のサブナビゲーションを提供する。

## 変更履歴

| バージョン | 日付 | 変更内容 |
| --- | --- | --- |
| v1.5.1 | 2026-03-05 | TASK-UI-01-D の追補: 実装内容（契約正本化/ショートカット条件/証跡運用）と苦戦箇所（契約二重管理・編集要素誤発火・再撮影運用ギャップ）を同一節へ追加し、5分解決カードを同期 |
| v1.5.0 | 2026-03-05 | TASK-UI-01-D-VIEWTYPE-ROUTING-NAV 反映: `navigation/navContract.ts` を AppDock ナビ契約の正本として明記。ショートカット仕様を `Cmd/Ctrl` 両対応へ更新し、`layout-grid` アイコン・`skill-center` 互換導線・編集要素上のショートカット無効化ルールを追記 |
| v1.4.0 | 2026-03-05 | TASK-UI-01-STORE-IPC-ARCHITECTURE 反映: AppDock の 9 項目ナビ（workspace/skillCenter/historySearch 追加）と `ViewType` 拡張を同期。実装パスを `components/organisms/AppDock` へ修正 |
| v1.3.0 | 2026-02-12 | Agent ナビ導線追加（`agent` ViewType） |
| v1.0.0 | 2026-01-26 | 初版 |

---

## AppDockナビゲーション

### 概要

左サイドバーに配置されたメインナビゲーション。ViewType切り替えによる画面遷移を提供する。

**実装場所**: `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`
**契約正本**: `apps/desktop/src/renderer/navigation/navContract.ts`

### メニュー項目一覧

| 項目 | ViewType | アイコン | ショートカット | 説明 |
| --- | --- | --- | --- | --- |
| Dashboard | `dashboard` | `layout-grid` | Cmd/Ctrl+1 | ダッシュボード |
| Workspace | `workspace` | `folder-tree` | Cmd/Ctrl+2 | ワークスペース導線 |
| Chat | `chat` | `message-circle` | Cmd/Ctrl+3 | AIチャット |
| Agent | `agent` | `bot` | Cmd/Ctrl+4 | エージェント実行 |
| Skills | `skillCenter` | `sparkles` | Cmd/Ctrl+5 | スキルセンター |
| History | `historySearch` | `search` | Cmd/Ctrl+6 | 履歴検索 |
| Graph | `graph` | `network` | Cmd/Ctrl+7 | ナレッジグラフ |
| Editor | `editor` | `file-text` | Cmd/Ctrl+8 | エディタ |
| Settings | `settings` | `settings` | Cmd/Ctrl+, | 設定画面 |

### レイアウトモード

| モード | 仕様 |
| --- | --- |
| Desktop | 左サイド固定（縦並び） |
| Mobile | 下部固定（横並び） |

### ViewType型定義

| ViewType     | 説明                     |
| ------------ | ------------------------ |
| `dashboard`  | ダッシュボード画面       |
| `workspace`  | ワークスペース画面       |
| `editor`     | エディター画面           |
| `chat`       | チャット画面             |
| `graph`      | グラフ画面               |
| `agent`      | エージェント画面         |
| `skillCenter`| スキルセンター画面       |
| `historySearch` | 履歴検索画面          |
| `skill-center` | 互換エイリアス（legacy導線） |
| `settings`   | 設定画面                 |

### navItems配列構造

| プロパティ | 型         | 説明                   |
| ---------- | ---------- | ---------------------- |
| `id`       | `ViewType` | 一意識別子             |
| `icon`     | `IconName` | アイコン識別子         |
| `label`    | `string`   | メニューラベル         |
| `shortcut` | `string`   | キーボードショートカット |

### キーボードショートカット適用条件

| 条件 | 仕様 |
| --- | --- |
| 修飾キー | `metaKey` または `ctrlKey` のいずれか必須 |
| 禁止修飾キー | `altKey` / `shiftKey` が有効な場合は無効 |
| 入力フォーカス | `input` / `textarea` / `select` / `contenteditable` 上では無効 |
| 設定ショートカット | `Cmd/Ctrl + ,` は `event.code === "Comma"` を優先判定 |

### TASK-UI-01-D 実装内容と苦戦箇所（再利用版）

#### 実装内容（要点）

| 観点 | 内容 | 反映先 |
| --- | --- | --- |
| 契約正本化 | AppDockの項目/順序/ショートカットを `navContract.ts` に一元化 | `apps/desktop/src/renderer/navigation/navContract.ts` |
| ショートカット導線 | Cmd/Ctrl 両対応 + `alt/shift` 無効 + 編集要素除外を実装 | `apps/desktop/src/renderer/App.tsx` |
| UI参照統一 | `AppDock` は `APP_DOCK_NAV_ITEMS` の参照のみとし、直書きを排除 | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |
| 画面証跡 | `TC-056D-11-01..05` を workflow 配下 `outputs/phase-11/screenshots` で固定 | `docs/30-workflows/task-056d-viewtype-routing-nav/outputs/phase-11/` |

#### 苦戦箇所（再発条件付き）

| 苦戦箇所 | 再発条件 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| 契約二重管理で導線がドリフト | nav配列とshortcut表を別ファイルで運用 | `navContract.ts` に集約しUIから参照化 | 導線契約は1ファイル正本のみ許可 |
| 編集要素上でショートカット誤発火 | global keydown でターゲット判定を省略 | `isEditableEventTarget` で入力要素を除外 | グローバルショートカットは編集要素除外を必須 |
| 再撮影で保存先/ポート運用が揺れる | workflow固定パス未対応 + strictPort競合未記録 | `Port 5177` preflight を記録し、運用ガードを未タスク化 | 再撮影前に preflight 実施、分岐結果を証跡に残す |

#### 同種課題の5分解決カード（最短手順）

1. `navContract.ts` を導線正本にし、UI側の重複定義を削除する。  
2. `meta/ctrl` 条件 + 編集要素除外 + `alt/shift` 抑止をセットで実装する。  
3. `TC-xx` と `screenshots/*.png` を1対1で管理し、coverage validator を必ず実行する。  
4. Step 2 で `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで同期する。  
5. `lsof -nP -iTCP:5177 -sTCP:LISTEN` の結果と分岐（停止/再利用/別ポート）を成果物へ残し、必要時は未タスク化する。  

---

## ChatViewナビゲーション

ChatViewには履歴ページへの導線として、ヘッダー右上にナビゲーションボタンを配置する。

**実装場所**: `apps/desktop/src/renderer/views/ChatView/index.tsx:136-143`

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
