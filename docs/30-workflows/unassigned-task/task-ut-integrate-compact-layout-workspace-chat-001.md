# CompactLayout を WorkspaceChatPanel に統合

## メタ情報

```yaml
issue_number: 1391
```

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-INTEGRATE-COMPACT-LAYOUT-WORKSPACE-CHAT-001                          |
| タスク名     | CompactLayout を WorkspaceChatPanel に統合                              |
| 分類         | 実装                                                                    |
| 対象機能     | WorkspaceView / WorkspaceChatPanel / CompactLayout                      |
| 優先度       | Low                                                                     |
| 見積もり規模 | 小規模                                                                  |
| ステータス   | 未実施                                                                  |
| 発見元       | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 Phase 10 (MINOR-02, FR-08) |
| 発見日       | 2026-03-18                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`CompactLayout.tsx` は TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 Phase 5 C-6 で新規作成されたが、`WorkspaceChatPanel.tsx` への統合がスコープ外として切り出された。ResizeObserver ベースのレスポンシブレイアウト切り替えが未接続の状態にある。

### 1.2 問題点・課題

- `CompactLayout.tsx` が作成済みにもかかわらず `WorkspaceChatPanel.tsx` で使用されていない（デッドコード状態）
- 360px 以下の幅の場合にコンパクトモードへの自動切り替えが機能しない
- guidance テキストのレスポンシブ表示が未実現

### 1.3 放置した場合の影響

- 小幅ウィンドウでの UI が崩れたまま（ユーザー体験の劣化）
- `CompactLayout.tsx` がデッドコードとして残り続ける
- コンパクトモードのテストが存在せず、将来的な変更で回帰が検出できない

---

## 2. 何を達成するか（What）

### 2.1 目的

`CompactLayout.tsx` を `WorkspaceChatPanel.tsx` に統合し、ResizeObserver によるレスポンシブなレイアウト切り替えを実現する。

### 2.2 最終ゴール

- `WorkspaceChatPanel` 内で `CompactLayout` がラップされており、ウィンドウ幅 360px 以下でコンパクトモードに切り替わること
- コンパクトモードで guidance テキストが正しく表示されること
- ResizeObserver のモックを使ったテストで切り替え動作が検証されること

### 2.3 スコープ

**含むもの:**

- `WorkspaceChatPanel.tsx` への `CompactLayout` の統合
- ResizeObserver をトリガーとした breakpoint（360px）でのモード切り替えロジック
- テストケース追加（ResizeObserver モック使用）

**含まないもの:**

- `CompactLayout.tsx` 自体の設計変更
- 360px 以外の breakpoint 追加
- モバイル専用スタイリングの追加

### 2.4 成果物

| 種別   | 成果物                            | 配置先                                                          |
| ------ | --------------------------------- | --------------------------------------------------------------- |
| 実装   | 更新済み `WorkspaceChatPanel.tsx` | `apps/desktop/src/renderer/views/WorkspaceView/`                |
| テスト | レスポンシブ切り替えテスト        | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/` 配下 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `CompactLayout.tsx` が実装済みであること
- vitest 実行環境が利用可能であること（esbuild アーキテクチャ一致環境）

### 3.2 依存タスク

| タスクID                                     | 関係性                         | ステータス |
| -------------------------------------------- | ------------------------------ | ---------- |
| TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 | 親タスク（CompactLayout 作成） | 完了       |

### 3.3 推奨アプローチ

1. `CompactLayout.tsx` の現行インターフェース（Props）を確認する
2. `WorkspaceChatPanel.tsx` に ResizeObserver を設定し、幅を監視する
3. 360px 以下の場合に `CompactLayout` でコンテンツをラップする
4. テストで `ResizeObserver` をモックし、breakpoint 切り替えを検証する

---

## 4. 実行手順

### Phase 構成

| Phase | 名称                           | 内容                                                |
| ----- | ------------------------------ | --------------------------------------------------- |
| 1-3   | 要件・設計・レビュー           | CompactLayout インターフェース確認・統合設計        |
| 4     | テスト作成                     | ResizeObserver モックによる切り替えテストケース設計 |
| 5     | 実装                           | WorkspaceChatPanel への CompactLayout 統合          |
| 6-7   | テスト拡充・カバレッジ         | breakpoint テスト追加・カバレッジ確認               |
| 8-10  | リファクタリング〜最終レビュー | コード品質検証                                      |
| 11-13 | 手動テスト〜完了               | レイアウト目視確認・ドキュメント更新・PR            |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `CompactLayout` が `WorkspaceChatPanel` でラップされていること
- [ ] breakpoint 360px でコンパクトモードに切り替わること
- [ ] コンパクトモードで guidance テキストが正しく表示されること

### 品質要件

- [ ] テストで ResizeObserver のモックによる切り替え検証があること
- [ ] TypeScript 型エラーが 0件
- [ ] ESLint エラーが 0件

---

## 6. 検証方法

### 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/WorkspaceView
```

### 検証手順

1. テストが全 PASS すること
2. 手動で WorkspaceChatPanel を 360px 以下に縮小してコンパクトモードへの切り替えを目視確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                 |
| ---------------------------------- | ------ | -------- | ---------------------------------------------------- |
| ResizeObserver の happy-dom 非対応 | 中     | 中       | P39 準拠で `fireEvent` を使ったモック戦略を採用      |
| 既存テストへの影響                 | 低     | 低       | 独立テストファイルで隔離し、既存テストに影響させない |

---

## 8. 参照情報

### 関連ドキュメント

| 参照資料                  | パス                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| WorkspaceChatPanel 仕様書 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-panel.md`                                       |
| P39 happy-dom 非互換      | `.claude/rules/06-known-pitfalls.md#P39`                                                                              |
| 親タスク成果物            | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment/` |

---

## 10. 実装時の苦戦箇所と教訓（親タスクからの知見）

> 以下は親タスク（TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001）の Phase 5-10 実行時に得られた教訓。同様の課題を回避するために参照すること。

### 10.1 P39 happy-dom 環境での ResizeObserver テスト

- **問題**: happy-dom は `ResizeObserver` API を完全にはサポートしておらず、`userEvent.setup()` も Symbol 操作エラーを起こす
- **影響**: ResizeObserver のコールバック発火テストが `TypeError: Symbol(...)` で失敗する
- **対策**: `ResizeObserver` をモッククラスで差し替え、`fireEvent` を使用する。`userEvent` は happy-dom 環境では使用禁止
- **参照**: `.claude/rules/06-known-pitfalls.md#P39`

```typescript
// ResizeObserver モック例
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {
    /* trigger callback with mock entries */
  }
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;
```

### 10.2 compact 幅での keyboard accessibility 確保

- **問題**: compact モード（<=360px）でアイコンのみ表示になる場合、Tab キーでの到達性が損なわれる
- **影響**: WCAG 2.1 AA 準拠要件を満たせない。chips / composer actions / send の Tab 到達を保証する必要がある
- **対策**: compact 幅でもすべての CTA に `tabIndex` を明示し、`aria-label` を設定する。ラベル非表示時はスクリーンリーダー向けに `sr-only` クラスでテキストを保持する
- **参照**: `.claude/rules/01-architecture.md` のアクセシビリティセクション

### 10.3 P53 worktree 環境制約

- **問題**: esbuild アーキテクチャ不一致により worktree 環境で Electron / vitest が起動しない
- **影響**: Phase 11（手動テスト）でのレスポンシブ動作の目視確認が DEFERRED になった
- **対策**: メインリポジトリで `pnpm install --force` 後に手動確認するか、Playwright の `page.setViewportSize()` でサイズ変更テストを自動化する
- **参照**: `.claude/rules/06-known-pitfalls.md#P53`

### 10.4 guidance block の折りたたみ表示

- **問題**: compact モードで guidance テキストが長い場合、折りたたみの summary 行が画面を圧迫する
- **影響**: error guidance のメッセージが切り詰められ、ユーザーが次のアクションを把握できない
- **対策**: summary 行は最大1行（60文字）に制限し、`<details>` タグまたはカスタム collapse コンポーネントで展開可能にする。展開時の高さ変更は `max-height` + `transition` で滑らかにアニメーション（200-300ms）

---

## 11. システム仕様書参照（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 確認内容                                                         |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | WorkspaceChatPanel の compact UX 仕様を確認する                  |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | workspace 導線と compact 幅での CTA 配置を確認する               |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | ResizeObserver の state 配置（local useState）を確認する         |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | guidance block の折りたたみ表示時の error message 要件を確認する |

### CompactLayout 統合時の仕様整合チェックリスト

- [ ] breakpoint 360px が `ui-ux-feature-components.md` の compact 幅定義と一致する
- [ ] compact 幅での chips 横スクロール + 「+N more」省略が設計通りに実装される
- [ ] composer actions がアイコンのみ表示になる（ラベル非表示）
- [ ] suggestion bubbles が1列縦並びに切り替わる
- [ ] guidance block が折りたたみ summary + expand で表示される
- [ ] terminal button が compact 幅でも非表示にならない（アイコンのみに切り替え）
- [ ] keyboard accessibility（Tab で chips / composer actions / send に到達可能）が保証される

---

## 12. 備考

### 関連タスク

| タスクID                                              | 関係性                                   |
| ----------------------------------------------------- | ---------------------------------------- |
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001        | 並行実施可（フック抽出リファクタリング） |
| UT-INTEGRATE-ACCESS-CAPABILITY-RESOLVER-WORKSPACE-001 | 独立して実施可能                         |
