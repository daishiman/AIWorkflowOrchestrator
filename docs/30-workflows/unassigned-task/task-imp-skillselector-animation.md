# SkillSelector アニメーション実装 - タスク指示書

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | task-imp-skillselector-animation-001 |
| タスク名     | SkillSelector アニメーション実装     |
| 分類         | 改善                                 |
| 対象機能     | SkillSelector コンポーネント         |
| 優先度       | 低                                   |
| 見積もり規模 | 小規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 10（最終レビュー）             |
| 発見日       | 2026-01-30                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-7AでSkillSelectorコンポーネントを実装した際、仕様書（specification.md 4.6H）で定義されている200msのease-outアニメーションが未実装となった。Apple Human Interface Guidelines（HIG）では、適切なアニメーションがユーザー体験向上に重要とされている。

### 1.2 問題点・課題

- ドロップダウン開閉時のアニメーションがない
- 仕様書の定義（4.6H: 200ms ease-out）が満たされていない
- 他のUI要素と比較して動きが硬い印象

### 1.3 放置した場合の影響

- ユーザー体験の一貫性が損なわれる
- 仕様書との乖離が残る
- Apple HIGへの準拠度が低下

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillSelectorのドロップダウン開閉に200ms ease-outのアニメーションを実装し、仕様書の要件を満たす。

### 2.2 最終ゴール

- ドロップダウン開閉時に滑らかなアニメーションが適用されている
- アニメーション時間は200ms、イージングはease-out
- prefers-reduced-motion設定を尊重している

### 2.3 スコープ

#### 含むもの

- ドロップダウン開閉アニメーション（フェードイン/アウト + スライド）
- Tailwind CSSのtransitionクラス適用
- prefers-reduced-motion対応

#### 含まないもの

- 複雑なアニメーションライブラリの導入
- 他コンポーネントへのアニメーション適用
- パフォーマンス計測・最適化

### 2.4 成果物

| 成果物            | 説明                                 |
| ----------------- | ------------------------------------ |
| SkillSelector.tsx | アニメーション追加済みコンポーネント |
| テストケース追加  | アニメーション関連テスト（任意）     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-7A（SkillSelector実装）が完了していること
- Tailwind CSSのtransitionユーティリティが利用可能

### 3.2 依存タスク

| タスクID | 状態 | 説明                  |
| -------- | ---- | --------------------- |
| TASK-7A  | 完了 | SkillSelector基本実装 |

### 3.3 必要な知識

- Tailwind CSS transition / animation ユーティリティ
- CSS transform / opacity プロパティ
- prefers-reduced-motion メディアクエリ

### 3.4 推奨アプローチ

1. Tailwind CSSのtransitionクラスで実装（シンプル）
2. ドロップダウンコンテナに適用
3. motion-reduce対応を追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称           | 説明                       |
| ----- | -------------- | -------------------------- |
| 1     | 要件定義       | アニメーション仕様確認     |
| 2-5   | 設計〜実装     | アニメーション実装         |
| 6-9   | テスト〜品質   | 動作確認・品質検証         |
| 10-13 | レビュー〜完了 | レビュー・ドキュメント・PR |

### Phase 5: 実装

#### 目的

200ms ease-outアニメーションを実装する

#### 手順

1. ドロップダウンコンテナのJSXを特定
2. transitionクラスを追加
3. 開閉状態に応じたクラス切り替え
4. motion-reduce対応を追加

#### 実装例

```tsx
// ドロップダウンコンテナ
<div
  className={`
    absolute top-full left-0 right-0 mt-1
    bg-white dark:bg-gray-800 rounded-lg shadow-lg
    border border-gray-200 dark:border-gray-700
    transition-all duration-200 ease-out
    motion-reduce:transition-none
    ${isOpen
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 -translate-y-2 pointer-events-none'}
  `}
>
```

#### 成果物

アニメーション実装済みSkillSelector.tsx

#### 完了条件

- [ ] 開閉時にアニメーションが動作する
- [ ] アニメーション時間が200ms
- [ ] イージングがease-out

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ドロップダウン展開時にフェードイン+スライドダウンする
- [ ] ドロップダウン収納時にフェードアウト+スライドアップする
- [ ] アニメーション時間が200ms
- [ ] イージングがease-out

### 品質要件

- [ ] 既存テスト28件が全てパス
- [ ] prefers-reduced-motion時はアニメーションが無効化される
- [ ] ESLintエラー0件
- [ ] TypeScriptエラー0件

### ドキュメント要件

- [ ] アニメーション仕様がコード内コメントで説明されている

---

## 6. 検証方法

### テストケース

| TC-ID | テスト内容                       | 期待結果                     |
| ----- | -------------------------------- | ---------------------------- |
| TC-1  | ドロップダウン展開アニメーション | 滑らかにフェードイン         |
| TC-2  | ドロップダウン収納アニメーション | 滑らかにフェードアウト       |
| TC-3  | 連続開閉時の動作                 | アニメーションが正しく動作   |
| TC-4  | motion-reduce設定時              | アニメーションなしで即座切替 |

### 検証手順

1. 開発サーバー起動 `pnpm --filter @repo/desktop dev`
2. SkillSelectorを操作してアニメーション確認
3. DevToolsでprefers-reduced-motionをエミュレートして確認
4. 既存テスト実行 `pnpm --filter @repo/desktop test -- --run`

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                        |
| ------------------------------ | ------ | -------- | --------------------------- |
| アニメーション中のクリック競合 | 中     | 低       | pointer-eventsで制御        |
| 低スペック端末でのカクツキ     | 低     | 低       | GPUアクセラレーション使用   |
| テストでのアニメーション待ち   | 低     | 中       | waitForを使用または即時切替 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント          | パス                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| specification.md 4.6H | (元タスク仕様のアニメーション定義)                                           |
| UI/UXデザイン原則     | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md |
| Apple HIG             | https://developer.apple.com/design/human-interface-guidelines/               |

### 参考資料

- [Tailwind CSS Transition](https://tailwindcss.com/docs/transition-property)
- [prefers-reduced-motion MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 10 MINOR指摘:
アニメーション未実装（specification.md 4.6H 200ms ease-out）
```

### 補足事項

- 本タスクはTASK-7Aのスコープ外として明示された項目
- 優先度が低いため、他の重要タスク完了後に実施を推奨
