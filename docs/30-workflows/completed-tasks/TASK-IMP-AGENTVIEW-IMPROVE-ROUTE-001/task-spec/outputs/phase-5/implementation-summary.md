# Phase 5: 実装サマリー

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## 変更ファイル

### 1. SkillAnalysisView.tsx

- `ArrowLeft` import 追加
- Props に `onNavigateBack?` / `onNavigateToAgent?` 追加
- ヘッダー左に戻りリンク（`onNavigateBack` 存在時のみ）
- フッター右端に再実行ボタン（`onNavigateToAgent` 存在時のみ）
- 既存 `onClose` 契約は不変

### 2. AgentView/index.tsx

- `Sparkles` import 追加
- `useSetCurrentView` / `useSetCurrentSkillName` import 追加
- `canOfferAnalysis` を `useMemo` で導出（3条件）
- `handleNavigateToAnalysis` を `useCallback` で定義（P42 trim 付き）
- CTA バナー JSX を `RecentExecutionList` の直前に配置

### 3. App.tsx

- `viewHistory` の取得を追加（L78）
- `skillAnalysis` case をブロックスコープ化
- `previousView` / `isFromAgent` で Agent 起点判定
- `onNavigateBack` / `onNavigateToAgent` を条件付き注入

### 4. store/index.ts

- `useSetCurrentView` 個別セレクタ追加
- `useSetCurrentSkillName` 個別セレクタ追加

### 5. テストモック更新

- `AgentView.test.tsx`: `useSetCurrentView` / `useSetCurrentSkillName` モック追加
- `AgentView.layout.test.tsx`: 同上

## 設計判断

| 判断                                | 理由                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| store に個別セレクタ新設            | AgentView は全て個別セレクタで取得するパターン。インラインセレクタ混在を避ける |
| `viewHistory` の直接取得            | App.tsx では既に `canGoBack` で間接参照あり。直接取得は自然な拡張              |
| CTA は `RecentExecutionList` の直前 | 実行完了直後のユーザー導線として最適な位置                                     |

## テスト結果

- 6ファイル、129テスト全PASS
- 既存テスト回帰なし
