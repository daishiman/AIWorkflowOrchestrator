# チャット履歴ナビゲーション導線実装 - タスク指示書

## メタ情報

| 項目             | 内容                                               |
| ---------------- | -------------------------------------------------- |
| タスクID         | UI-NAV-001                                         |
| タスク名         | ChatViewからチャット履歴へのナビゲーション導線実装 |
| 分類             | 改善                                               |
| 対象機能         | チャット履歴永続化機能（chat-history-persistence） |
| 優先度           | 高                                                 |
| 見積もり規模     | 中規模                                             |
| ステータス       | 未実施                                             |
| 発見元           | Phase 8（手動テスト検証）                          |
| 発見日           | 2025-12-23                                         |
| 発見エージェント | 手動検証                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

チャット履歴永続化機能（chat-history-persistence）のPhase 4実装において、以下のコンポーネントとルーティングが実装された：

**実装済み:**

- `ChatHistoryView` コンポーネント (`apps/desktop/src/renderer/views/ChatHistoryView/index.tsx`)
- `ChatHistoryList`, `ChatHistorySearch`, `ChatHistoryExport` 等のコンポーネント
- URLルーティング (`/chat/history/:sessionId`, `/chat/history`)
- App.tsxへのRoute追加

**未実装:**

- メインのChatViewからチャット履歴へアクセスする導線（ボタン/リンク）
- サイドバーによる履歴一覧表示（UI/UX設計書Section 3.1の設計）

### 1.2 問題点・課題

1. **ユーザーがチャット履歴機能にアクセスできない**
   - URLを直接入力しない限り、チャット履歴ページに到達できない
   - 実装済みの機能がUIから完全に隠れている状態

2. **UI/UX設計書との乖離**
   - 設計書Section 3.1では、ChatView内にサイドバー（280px）でセッション一覧を表示する設計
   - 現在の実装はサイドバーなし、ナビゲーションボタンもなし

3. **AppDockにもナビゲーションなし**
   - 現在のAppDock: dashboard, editor, chat, graph, settings
   - "history" や "chat-history" のエントリなし

### 1.3 放置した場合の影響

- **ユーザー体験の著しい低下**: チャット履歴機能が事実上使用不能
- **実装工数の無駄**: 実装済みの機能が活用されない
- **Phase 8の受け入れ基準未達成**: 手動テストで「機能にアクセスできない」と判定される

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーがメインのChatViewから直感的にチャット履歴機能にアクセスできる導線を実装する。

### 2.2 最終ゴール

以下のいずれかの方法でチャット履歴にアクセスできる状態：

**オプションA: 最小限の修正（推奨）**

- ChatViewヘッダーに「履歴」ボタンを追加
- クリックで `/chat/history` へ遷移

**オプションB: 設計書準拠**

- ChatView内にサイドバー（280px）を追加
- ChatHistoryListコンポーネントを統合
- セッション選択で詳細表示

### 2.3 スコープ

#### 含むもの

- ChatViewへのナビゲーション要素追加
- ルーティング連携の実装
- レスポンシブ対応（モバイル時の考慮）

#### 含まないもの

- 新しいコンポーネントの作成（既存のChatHistoryList等を活用）
- バックエンドAPI変更
- データベーススキーマ変更

### 2.4 成果物

| 種別   | 成果物                         | 配置先                                                       |
| ------ | ------------------------------ | ------------------------------------------------------------ |
| コード | ChatViewへのナビゲーション追加 | `apps/desktop/src/renderer/views/ChatView/index.tsx`         |
| テスト | ナビゲーションのユニットテスト | `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx` |
| テスト | E2Eテスト追加                  | `apps/desktop/e2e/chat-history-navigation.spec.ts`           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- チャット履歴永続化機能のPhase 4実装が完了していること
- `/chat/history` および `/chat/history/:sessionId` ルートが動作すること
- ChatHistoryListコンポーネントが動作すること

### 3.2 依存タスク

- chat-history-persistence Phase 4 実装完了（完了済み）

### 3.3 必要な知識・スキル

- React Router v6 のuseNavigate
- Tailwind CSS
- Apple HIG準拠デザイン
- Lucide Iconsの使用

### 3.4 推奨アプローチ

**オプションA（最小限・推奨）の実装手順:**

1. ChatViewのヘッダーに「履歴」ボタンを追加
2. react-router-domのuseNavigateで `/chat/history` へ遷移
3. アイコンは `lucide-react` の `History` または `Clock` を使用
4. ホバー状態、フォーカス状態のスタイリング

**実装例:**

```tsx
import { useNavigate } from "react-router-dom";
import { History } from "lucide-react";

// ChatViewヘッダー内
<button
  type="button"
  onClick={() => navigate("/chat/history")}
  aria-label="チャット履歴"
  className="p-2 rounded-hig-sm text-hig-text-secondary hover:bg-hig-bg-secondary transition-colors"
>
  <History className="h-5 w-5" />
</button>;
```

---

## 4. 実行手順

### Phase構成

```
Phase 1: 設計確認・方針決定
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング
Phase 6: 品質保証
```

### Phase 1: 設計確認・方針決定

#### 目的

オプションA（最小限）とオプションB（設計書準拠）のどちらを採用するか確定する。

#### Claude Code スラッシュコマンド

> 以下はClaude Code内で実行するスラッシュコマンドです

```
/ai:design-review --scope=ui --target=chat-history-navigation
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UIナビゲーション設計の専門家であり、Apple HIG準拠の判断ができる
- **代替候補**: .claude/agents/product-manager.md（ユーザー体験の観点からの判断）
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

- 設計方針の確定（オプションA or B）

#### 完了条件

- [ ] 採用するオプションが決定されている
- [ ] 決定理由が文書化されている

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

ナビゲーション機能のテストを実装より先に作成する。

#### Claude Code スラッシュコマンド

> 以下はClaude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests --target=ChatView --focus=navigation
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/frontend-tester.md
- **選定理由**: Reactコンポーネントのテスト、特にルーティング関連のテストに精通
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                | 活用方法                         | 選定理由                                       |
| ----------------------- | -------------------------------- | ---------------------------------------------- |
| .claude/skills/test-doubles/SKILL.md            | react-router-domのモック作成     | ナビゲーションテストにはルーターのモックが必要 |
| .claude/skills/boundary-value-analysis/SKILL.md | ナビゲーション状態の境界値テスト | 正常系・異常系の網羅                           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx` への追加テスト

#### 完了条件

- [ ] 「履歴ボタンが表示される」テストが存在
- [ ] 「履歴ボタンクリックで/chat/historyへ遷移する」テストが存在
- [ ] テストがRed状態（失敗）であることを確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための最小限の実装を行う。

#### Claude Code スラッシュコマンド

> 以下はClaude Code内で実行するスラッシュコマンドです

```
/ai:implement --target=ChatView --feature=history-navigation
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UIコンポーネントの実装、特にApple HIG準拠のボタン実装に精通
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名             | 活用方法                   | 選定理由                  |
| -------------------- | -------------------------- | ------------------------- |
| .claude/skills/apple-hig-guidelines/SKILL.md | ボタンのスタイリング・配置 | macOSネイティブ体験の実現 |
| .claude/skills/accessibility-wcag/SKILL.md   | aria-label、フォーカス管理 | WCAG 2.1 AA準拠           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- `apps/desktop/src/renderer/views/ChatView/index.tsx` の修正

#### 完了条件

- [ ] 履歴ボタンがヘッダーに表示される
- [ ] クリックで `/chat/history` へ遷移する
- [ ] テストがGreen状態（成功）であることを確認

---

### Phase 5: リファクタリング

#### 目的

動作を変えずにコード品質を改善する。

#### Claude Code スラッシュコマンド

> 以下はClaude Code内で実行するスラッシュコマンドです

```
/ai:refactor --target=ChatView --focus=readability
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: コード品質改善、可読性向上の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] コードが適切に構造化されている
- [ ] 不要な重複がない
- [ ] テストが継続してGreen状態

---

### Phase 6: 品質保証

#### 目的

定義された品質基準をすべて満たすことを検証する。

#### Claude Code スラッシュコマンド

> 以下はClaude Code内で実行するスラッシュコマンドです

```
/ai:quality-check --scope=frontend --target=ChatView
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/frontend-tester.md, .claude/agents/sec-auditor.md
- **選定理由**: フロントエンド品質検証とセキュリティ観点の両方が必要
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] 全テスト成功
- [ ] アクセシビリティ要件充足

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ChatViewヘッダーに「履歴」ボタンが表示される
- [ ] ボタンクリックで `/chat/history` へ遷移する
- [ ] `/chat/history` ページが正常に表示される
- [ ] 戻るボタンでChatViewに戻れる

### 品質要件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] ユニットテスト成功
- [ ] E2Eテスト成功（該当テスト追加の場合）

### ドキュメント要件

- [ ] 変更内容がUI/UX設計書と整合している（または設計書を更新）

---

## 6. 検証方法

### テストケース

| No  | テスト項目     | 操作                   | 期待結果                                 |
| --- | -------------- | ---------------------- | ---------------------------------------- |
| 1   | 履歴ボタン表示 | ChatViewを開く         | ヘッダーに履歴アイコンボタンが表示される |
| 2   | ナビゲーション | 履歴ボタンをクリック   | `/chat/history` に遷移する               |
| 3   | キーボード操作 | Tabでフォーカス後Enter | `/chat/history` に遷移する               |
| 4   | 戻る操作       | ブラウザの戻るボタン   | ChatViewに戻る                           |

### 検証手順

1. デスクトップアプリを起動
2. AppDockから「Chat」を選択
3. ChatViewのヘッダーに履歴アイコンが表示されることを確認
4. アイコンをクリックし、チャット履歴ページに遷移することを確認
5. 戻るボタンでChatViewに戻ることを確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                             |
| ------------------------ | ------ | -------- | -------------------------------- |
| ヘッダーのレイアウト崩れ | 中     | 低       | レスポンシブテストを実施         |
| ルーティング競合         | 高     | 低       | App.tsxのRoute順序を確認         |
| モバイル時の表示問題     | 中     | 中       | responsiveModeでの条件分岐を検討 |

---

## 8. 参照情報

### 関連ドキュメント

- [UI/UX設計書](../chat-history-persistence/ui-ux-design.md) - Section 3.1 全体レイアウト
- [UI統合設計書](../chat-history-persistence/ui-integration-design.md)
- [コンポーネント設計書](../chat-history-persistence/component-design.md)

### 関連ファイル

- `apps/desktop/src/renderer/views/ChatView/index.tsx` - 修正対象
- `apps/desktop/src/renderer/views/ChatHistoryView/index.tsx` - 遷移先
- `apps/desktop/src/renderer/App.tsx` - ルーティング定義

### 参考資料

- [React Router v6 Documentation](https://reactrouter.com/en/main)
- [Lucide Icons](https://lucide.dev/icons/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## 9. 備考

### 発見時の状況

Phase 8手動テスト検証において、チャット履歴機能のUIアクセス確認時に発見。

```
問題: ChatViewからチャット履歴へのナビゲーション導線がない
状況: URLルーティングは実装済み（/chat/history/:sessionId）だが、
      メインUIからのアクセス手段がない
影響: ユーザーはURL直接入力以外でチャット履歴機能を使用できない
```

### 補足事項

- **オプションA（最小限）** を推奨: 現時点では最小限の修正で機能を有効化し、フルサイドバー実装は別タスクとして管理することを推奨
- **設計書更新**: オプションA採用の場合、UI/UX設計書Section 3.1との乖離を注記する必要あり
- **将来的な拡張**: オプションBのフルサイドバー実装は、ユーザーフィードバックを得てから検討

---

## 変更履歴

| バージョン | 日付       | 変更内容 | 変更者      |
| ---------- | ---------- | -------- | ----------- |
| 1.0.0      | 2025-12-23 | 初版作成 | Phase 8検証 |
