# ナビゲーションUI設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

デスクトップアプリにおけるナビゲーションUI設計を定義する。
AppDockによるメインナビゲーションと、各View内のサブナビゲーションを提供する。

---

## AppDockナビゲーション

### 概要

左サイドバーに配置されたメインナビゲーション。ViewType切り替えによる画面遷移を提供する。

**実装場所**: `apps/desktop/src/renderer/components/AppDock/index.tsx`

### メニュー項目一覧

| 項目       | ViewType     | アイコン       | 説明                     |
| ---------- | ------------ | -------------- | ------------------------ |
| Dashboard  | `dashboard`  | `LayoutDashboard` | ダッシュボード        |
| Editor     | `editor`     | `FileText`     | ファイルエディター       |
| Chat       | `chat`       | `MessageSquare`| AIチャット               |
| Graph      | `graph`      | `Network`      | ナレッジグラフ           |
| Agent      | `agent`      | `Bot`          | スキル管理・エージェント実行 |
| Settings   | `settings`   | `Settings`     | 設定画面                 |

### Agent メニュー仕様

| 要素             | 仕様                        |
| ---------------- | --------------------------- |
| 配置             | AppDock メインメニュー      |
| アイコン         | Lucide Icons `Bot`          |
| ラベル           | "Agent"                     |
| ViewType         | `agent`                     |
| 遷移先コンポーネント | `AgentView`             |
| 実装ファイル     | `views/AgentView/index.tsx` |

**実装箇所**:

| ファイル                      | 変更内容                         |
| ----------------------------- | -------------------------------- |
| `components/AppDock/index.tsx`| navItemsにAgent項目追加          |
| `store/slices/uiSlice.ts`     | ViewTypeに"agent"追加            |
| `App.tsx`                     | renderViewにAgentViewケース追加  |
| `views/AgentView/index.tsx`   | AgentViewコンポーネント実装      |

### ViewType型定義

| ViewType     | 説明                     |
| ------------ | ------------------------ |
| `dashboard`  | ダッシュボード画面       |
| `editor`     | エディター画面           |
| `chat`       | チャット画面             |
| `graph`      | グラフ画面               |
| `agent`      | エージェント画面         |
| `settings`   | 設定画面                 |

### navItems配列構造

| プロパティ | 型         | 説明                   |
| ---------- | ---------- | ---------------------- |
| `id`       | `ViewType` | 一意識別子             |
| `icon`     | `LucideIcon` | Lucideアイコン       |
| `label`    | `string`   | メニューラベル         |
| `onClick`  | `function` | クリック時のsetView呼び出し |

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
