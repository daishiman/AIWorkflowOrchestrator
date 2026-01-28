# TASK-3-2-D 実装ガイド

## タスク情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| タスクID | TASK-3-2-D                        |
| タスク名 | SkillStreamDisplay コピー履歴機能 |
| 作成日   | 2026-01-28                        |
| 実装者   | Claude Code                       |

---

# Part 1: 概念的説明（中学生でもわかる版）

## 1. コピー履歴機能って何？

### 日常生活での例え話

スマホでLINEのメッセージをコピーしたとき、「あ、さっきコピーしたやつ、もう一度使いたい！」と思ったことはありませんか？

普通は、最後にコピーしたものしか貼り付けられません。でも、この機能があれば、**過去にコピーしたものを一覧で見て、好きなものを選んで貼り付けられる**ようになります。

イメージとしては、**履歴付きクリップボード**です。

### 具体例

1. AIがメッセージ①を返す → コピーする → 履歴に追加
2. AIがメッセージ②を返す → コピーする → 履歴に追加
3. AIがメッセージ③を返す → コピーする → 履歴に追加
4. 「やっぱりメッセージ①が欲しい！」
5. 履歴パネルを開く → メッセージ①を選ぶ → コピー完了！

## 2. なぜこの機能が必要？

### 問題

AIとの会話では、たくさんの有用な情報が生成されます。

- コード snippets
- 説明文
- コマンド例
- 設定値

これらを**何度もコピーしたい**のに、毎回同じメッセージまでスクロールして探すのは面倒です。

### 解決

コピー履歴機能を使えば：

- 過去にコピーした内容を**一覧表示**
- ワンクリックで**再コピー**
- 複数選択して**一括コピー**

## 3. どうやって使う？

### 基本操作

1. **コピーする**: メッセージ横のコピーボタンをクリック
2. **履歴を見る**: 履歴アイコン（📋マーク）をクリック
3. **再コピーする**: 履歴の項目をクリック
4. **複数選択する**: チェックボックスをクリック
5. **一括コピーする**: 「選択をコピー」ボタンをクリック
6. **履歴を消す**: 「クリア」ボタンをクリック

### キーボード操作

- **Tab**: 項目間を移動
- **Enter**: コピーを実行
- **Space**: チェックを切り替え
- **Escape**: パネルを閉じる

## 4. 裏側で何が起きている？（簡易版）

```
[メッセージをコピー]
        ↓
[履歴リストに追加]（最大50件まで保持）
        ↓
[履歴パネルで表示]
        ↓
[選択してコピー] → クリップボードへ
```

**ポイント**:

- 履歴は50件まで保持（それ以上は古いものから消える）
- アプリを閉じると履歴は消える（メモリ上のみ）

---

# Part 2: 技術的詳細（開発者向け）

## 1. アーキテクチャ概要

### コンポーネント構成図

```
SkillStreamDisplay
├── CopyHistoryProvider (Context)
│   ├── history: CopyHistoryEntry[]
│   ├── selectedIds: Set<string>
│   └── methods: add/copy/clear/toggle...
├── StreamHeader
│   └── CopyHistoryToggle (履歴パネル開閉ボタン)
└── StreamContent
    └── MessageItem
        └── CopyButton (onCopySuccess → addToHistory)

CopyHistoryPanel (ポップオーバー)
├── Header (件数表示, 閉じるボタン)
├── List (履歴項目一覧)
│   └── CopyHistoryItem[] (React.memo)
└── ActionBar (選択コピー, クリア)
```

### データフロー

```
1. CopyButton クリック
   ↓
2. onCopySuccess(content, messageId) 発火
   ↓
3. addToHistory(content, messageId) 呼び出し
   ↓
4. CopyHistoryContext の history 更新
   ↓
5. CopyHistoryPanel が再レンダリング
```

## 2. コンポーネント仕様

### CopyHistoryContext

| 項目     | 値                                                          |
| -------- | ----------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx` |
| 責務     | コピー履歴の状態管理とContext提供                           |
| 定数     | `MAX_HISTORY_SIZE = 50`                                     |

### useCopyHistory Hook

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/hooks/useCopyHistory.ts` |
| 責務     | CopyHistoryContext へのアクセスを提供               |
| 使用条件 | CopyHistoryProvider 内で使用必須                    |

### CopyHistoryPanel

| 項目     | 値                                                                    |
| -------- | --------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` |
| 責務     | 履歴パネルUI、ユーザー操作処理                                        |
| 定数     | `PREVIEW_LENGTH = 100`, `COPY_FEEDBACK_MS = 2000`                     |

## 3. 型定義

### CopyHistoryEntry

```typescript
interface CopyHistoryEntry {
  id: string; // 一意識別子（uuid）
  content: string; // コピー内容
  messageId: string; // 元メッセージID
  timestamp: number; // コピー日時（UNIXミリ秒）
}
```

### CopyHistoryContextValue

```typescript
interface CopyHistoryContextValue {
  // 状態
  history: CopyHistoryEntry[]; // 履歴配列
  selectedIds: Set<string>; // 選択中のID
  historyCount: number; // 履歴件数
  selectedCount: number; // 選択件数

  // メソッド
  addToHistory: (content: string, messageId: string) => void;
  copyFromHistory: (id: string) => Promise<void>;
  copySelectedItems: () => Promise<void>;
  clearHistory: () => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}
```

### CopyHistoryPanelProps

```typescript
interface CopyHistoryPanelProps {
  isOpen: boolean; // パネル開閉状態
  onClose: () => void; // 閉じるコールバック
  className?: string; // カスタムクラス
}
```

## 4. 定数・設定値

| 定数名           | 値   | 説明                   | ファイル               |
| ---------------- | ---- | ---------------------- | ---------------------- |
| MAX_HISTORY_SIZE | 50   | 履歴保持上限           | CopyHistoryContext.tsx |
| PREVIEW_LENGTH   | 100  | プレビュー表示文字数   | CopyHistoryPanel.tsx   |
| COPY_FEEDBACK_MS | 2000 | フィードバック表示時間 | CopyHistoryPanel.tsx   |

## 5. 使用例

### 基本的な使用

```tsx
// SkillStreamDisplay.tsx 内
import { useCopyHistory } from "../../hooks/useCopyHistory";
import { CopyHistoryPanel, CopyHistoryToggle } from "./CopyHistoryPanel";

function SkillStreamDisplay() {
  const { addToHistory, historyCount } = useCopyHistory();
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const handleCopySuccess = (content: string, messageId: string) => {
    addToHistory(content, messageId);
  };

  return (
    <div>
      <CopyHistoryToggle
        isOpen={isHistoryPanelOpen}
        onToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
        historyCount={historyCount}
      />
      <CopyHistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
      />
      {/* ... */}
    </div>
  );
}
```

### CopyButton への onCopySuccess 追加

```tsx
interface CopyButtonProps {
  content: string;
  messageId: string;
  onCopySuccess?: (content: string, messageId: string) => void;
}

function CopyButton({ content, messageId, onCopySuccess }: CopyButtonProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    onCopySuccess?.(content, messageId);
  };
  // ...
}
```

## 6. テスト方法

### ユニットテスト実行

```bash
pnpm --filter @repo/desktop vitest run src/renderer/contexts/__tests__/CopyHistoryContext.test.tsx
pnpm --filter @repo/desktop vitest run src/renderer/hooks/__tests__/useCopyHistory.test.tsx
pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/CopyHistoryPanel.test.tsx
```

### テストカバレッジ確認

```bash
pnpm --filter @repo/desktop vitest run --coverage
```

### テスト結果サマリー

| テストファイル              | テスト数 | 結果       |
| --------------------------- | -------- | ---------- |
| CopyHistoryContext.test.tsx | 18       | 全PASS     |
| useCopyHistory.test.tsx     | 8        | 全PASS     |
| CopyHistoryPanel.test.tsx   | 20       | 全PASS     |
| **合計**                    | **46**   | **全PASS** |

## 7. トラブルシューティング

### エラー: "useCopyHistory must be used within CopyHistoryProvider"

**原因**: CopyHistoryProvider の外で useCopyHistory を使用している

**解決策**:

```tsx
// App.tsx や SkillStreamDisplay の親コンポーネントで
<CopyHistoryProvider>
  <SkillStreamDisplay />
</CopyHistoryProvider>
```

### エラー: クリップボードAPIが使えない

**原因**: ブラウザがClipboard APIをサポートしていない、またはHTTPS環境ではない

**解決策**:

- Electronアプリ内であれば通常は利用可能
- 失敗時は console.error でログ出力（UIは継続動作）

### 履歴が保存されない

**原因**: 履歴はReact stateのみで管理（永続化なし）

**仕様**: アプリ再起動で履歴はクリアされる（設計通り）

---

## 関連ドキュメント

| ドキュメント             | パス                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- |
| タスク仕様書             | `docs/30-workflows/TASK-3-2-D-skill-stream-copy-history/`                       |
| 品質レポート             | `outputs/phase-9/quality-report.md`                                             |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                                       |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                        |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` |
