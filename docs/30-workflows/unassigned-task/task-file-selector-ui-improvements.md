# FileSelector UI品質改善 - タスク指示書

## メタ情報

| 項目             | 内容                                      |
| ---------------- | ----------------------------------------- |
| タスクID         | TASK-UI-001                               |
| タスク名         | FileSelector UI品質・デザイントークン改善 |
| 分類             | 改善                                      |
| 対象機能         | FileSelector コンポーネント               |
| 優先度           | 中                                        |
| 見積もり規模     | 小規模                                    |
| ステータス       | 未実施                                    |
| 発見元           | Phase 7-1 UI/UXレビュー                   |
| 発見日           | 2024-12-17                                |
| 発見エージェント | @ui-designer                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

FileSelectorコンポーネントのUI品質レビューを実施した結果、デザイントークンの統一性やアニメーション設定、レスポンシブ対応に関するMINOR判定の改善点が発見された。

### 1.2 問題点・課題

| No. | 優先度 | カテゴリ       | 問題                                                        | 対象ファイル          |
| --- | ------ | -------------- | ----------------------------------------------------------- | --------------------- |
| 1   | 中     | トークン       | CSS変数参照の記述が不統一（`text-[var(--text-muted)]`形式） | 全ファイル            |
| 2   | 中     | アニメーション | duration値が不統一（150ms/200ms混在）                       | 全ファイル            |
| 3   | 低     | レスポンシブ   | モーダル幅が固定（`w-96`）で小画面未対応                    | FileSelectorModal.tsx |
| 4   | 低     | レスポンシブ   | EditorViewグリッドに固定幅（`280px`）あり                   | EditorView/index.tsx  |

### 1.3 放置した場合の影響

- デザイントークン変更時のメンテナンスコスト増加
- アニメーションの一貫性がなくUX品質低下
- 小画面デバイスでのUIが崩れる可能性
- 将来的な技術的負債の蓄積

---

## 2. 何を達成するか（What）

### 2.1 目的

FileSelectorコンポーネントのUI品質を向上させ、デザインシステムとの整合性を確保する。

### 2.2 最終ゴール

- CSS変数参照がカスタムクラスで統一されている
- アニメーションduration値が3段階（150ms/200ms/300ms）でトークン化されている
- モーダルがレスポンシブ対応している
- すべてのコンポーネントがデザインシステムに準拠している

### 2.3 スコープ

#### 含むもの

- CSS変数参照のカスタムクラス化
- アニメーションduration値のトークン化
- モーダル幅のレスポンシブ対応
- EditorViewグリッドのレスポンシブ対応

#### 含まないもの

- デザインシステム全体の刷新
- 新規コンポーネントの追加
- カラーテーマの変更

### 2.4 成果物

| 種別   | 成果物                          | 配置先                                                       |
| ------ | ------------------------------- | ------------------------------------------------------------ |
| コード | FileSelectorTrigger.tsx（修正） | apps/desktop/src/renderer/components/organisms/FileSelector/ |
| コード | FileSelectorModal.tsx（修正）   | apps/desktop/src/renderer/components/organisms/FileSelector/ |
| CSS    | カスタムユーティリティクラス    | apps/desktop/src/renderer/styles/                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- FileSelectorコンポーネントが実装済み
- Tailwind CSS設定ファイルへのアクセス権限

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識・スキル

- Tailwind CSS カスタマイズ
- CSS変数とデザイントークン
- レスポンシブデザイン

### 3.4 推奨アプローチ

1. Tailwind設定でカスタムユーティリティを定義
2. 既存のCSS変数参照をカスタムクラスに置換
3. アニメーションdurationをトークン化
4. レスポンシブブレークポイントを追加

---

## 4. 実行手順

### Phase構成

```
Phase 4: 実装
  → T-04-1: デザイントークンのカスタムクラス化
  → T-04-2: アニメーションdurationトークン化
  → T-04-3: レスポンシブ対応
Phase 5: リファクタリング
  → T-05-1: コード品質改善
Phase 6: 品質保証
  → T-06-1: ビジュアルテスト
```

### T-04-1: デザイントークンのカスタムクラス化

#### 目的

CSS変数参照をTailwindカスタムクラスに統一する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/renderer/components/organisms/FileSelector/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @ui-designer
- **選定理由**: デザインシステム整合性の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

**tailwind.config.ts への追加**:

```typescript
// extend.colors に追加
colors: {
  // 既存のKanagawaカラー...

  // セマンティックカラー（CSS変数参照）
  'text-primary': 'var(--text-primary)',
  'text-muted': 'var(--text-muted)',
  'text-subtle': 'var(--text-subtle)',
  'bg-glass': 'var(--bg-glass)',
  'border-subtle': 'var(--border-subtle)',
}
```

**置換例**:

```tsx
// Before
<span className="text-[var(--text-muted)]">...</span>

// After
<span className="text-text-muted">...</span>
```

#### 完了条件

- [ ] Tailwind設定にセマンティックカラーを追加
- [ ] `text-[var(--xxx)]` 形式をすべて置換
- [ ] ビルドエラーなし
- [ ] 見た目が変わっていないことを確認

---

### T-04-2: アニメーションdurationトークン化

#### 目的

アニメーションduration値を統一されたトークンに変換する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/FileSelector/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @ui-designer
- **選定理由**: アニメーション設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

**tailwind.config.ts への追加**:

```typescript
// extend.transitionDuration に追加
transitionDuration: {
  'fast': '150ms',    // マイクロインタラクション
  'normal': '200ms',  // 標準トランジション
  'slow': '300ms',    // 強調トランジション
}
```

**置換例**:

```tsx
// Before
<button className="transition-colors duration-150">...</button>
<div className="transition-all duration-200">...</div>

// After
<button className="transition-colors duration-fast">...</button>
<div className="transition-all duration-normal">...</div>
```

#### 完了条件

- [ ] duration-fast/normal/slow が定義されている
- [ ] 既存のduration-150/200/300がトークンに置換されている
- [ ] アニメーションが滑らかに動作する

---

### T-04-3: レスポンシブ対応

#### 目的

小画面でもUIが崩れないようにレスポンシブ対応する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorModal.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @ui-designer
- **選定理由**: レスポンシブデザインの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

**FileSelectorModal.tsx**:

```tsx
// Before
<div className="w-96">...</div>

// After
<div className="w-full max-w-96">...</div>
// または
<div className="w-[min(384px,90vw)]">...</div>
```

**EditorView/index.tsx**:

```tsx
// Before
<div className="grid grid-cols-[280px_1fr]">...</div>

// After
<div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
  {/* サイドバー - モバイルでは非表示または折りたたみ */}
</div>
```

#### 完了条件

- [ ] モーダルが小画面で正しく表示される
- [ ] EditorViewグリッドがモバイルで適切に動作する
- [ ] ブレークポイントが一貫している

---

### T-05-1: コード品質改善

#### 目的

リファクタリング後のコード品質を確保する。

#### Claude Code スラッシュコマンド

```
/ai:lint --fix
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @code-quality
- **選定理由**: コード品質改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] 不要なクラスの削除

---

### T-06-1: ビジュアルテスト

#### 目的

UIの見た目が意図通りであることを確認する。

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @frontend-tester
- **選定理由**: フロントエンドテストの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 全テストがパス
- [ ] 各画面サイズでの表示確認（手動）
- [ ] アニメーションの動作確認（手動）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] CSS変数参照がカスタムクラスに統一されている
- [ ] アニメーションduration値がトークン化されている
- [ ] モーダルがレスポンシブ対応している
- [ ] EditorViewグリッドがレスポンシブ対応している

### 品質要件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] ビルド成功

### ドキュメント要件

- [ ] デザイントークン一覧を更新（該当する場合）

---

## 6. 検証方法

### テストケース

1. **デスクトップ表示**: 1920x1080でモーダルが正しく表示される
2. **タブレット表示**: 768x1024でモーダルが正しく表示される
3. **モバイル表示**: 375x667でモーダルが画面内に収まる
4. **アニメーション**: ホバー時のトランジションが滑らか

### 検証手順

1. `pnpm --filter @repo/desktop dev` でアプリ起動
2. DevToolsでレスポンシブモードを有効化
3. 各画面サイズでモーダルを開閉
4. アニメーションの動作を目視確認

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                           |
| ------------------ | ------ | -------- | ------------------------------ |
| Tailwind設定の破損 | 高     | 低       | 設定変更前にバックアップ       |
| 既存UIの崩れ       | 中     | 低       | 段階的に置換、各ステップで確認 |
| パフォーマンス影響 | 低     | 低       | CSSサイズの変化を監視          |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/16-ui-ux-guidelines.md`
- `apps/desktop/tailwind.config.ts`
- `apps/desktop/src/renderer/styles/themes/kanagawa-dragon.css`

### 参考資料

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
判定: MINOR

改善点:
1. CSS変数参照を統一クラスに変換（`text-[var(--text-muted)]` -> カスタムクラス）
2. duration値を150ms/200ms/300msの3段階トークンに統一
3. モーダル幅を`w-full max-w-96`に変更
4. EditorViewグリッドにレスポンシブブレークポイント追加
```

### 補足事項

- 既存のKanagawa Dragonテーマとの整合性を維持すること
- Tailwind設定の変更は他のコンポーネントにも影響するため慎重に
