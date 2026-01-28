# スコープ定義: TASK-3-2-C タイムスタンプ自動更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| タスク | TASK-3-2-C-timestamp-autoupdate |
| Phase  | 1                               |
| 作成日 | 2026-01-28                      |

---

## 1. 実装スコープ

### 1.1 含むもの（In Scope）

| カテゴリ       | 項目                           | 詳細                              |
| -------------- | ------------------------------ | --------------------------------- |
| コンポーネント | MessageTimestampの自動更新機能 | 定期的な再レンダリングによる更新  |
| フック         | useIntervalカスタムフック      | 再利用可能なタイマーフック        |
| コンテキスト   | TimestampContext/Provider      | バッチ更新のためのContext API実装 |
| フック         | useVisibilityフック            | Page Visibility API対応           |
| 最適化         | React.memoによるメモ化         | 不要な再レンダリング防止          |
| テスト         | ユニットテスト追加             | 自動更新・タイマー関連のテスト    |

### 1.2 含まないもの（Out of Scope）

| カテゴリ       | 項目                             | 理由                             |
| -------------- | -------------------------------- | -------------------------------- |
| ユーティリティ | formatRelativeTime関数の変更     | 既存ロジックは十分に機能している |
| UI             | 絶対時刻表示モードの追加         | 別タスクとして検討               |
| バックエンド   | Main Processの変更               | フロントエンドのみで完結         |
| コンポーネント | 他のコンポーネントへの影響       | MessageTimestampに閉じた変更     |
| 機能           | タイムスタンプのフォーマット変更 | 既存形式を維持                   |

---

## 2. アーキテクチャ層別影響範囲

| 層                         | 影響 | 変更内容                         |
| -------------------------- | ---- | -------------------------------- |
| フロントエンド（Renderer） | あり | MessageTimestamp、Context、Hooks |
| バックエンド（Main）       | なし | 変更なし                         |
| IPC通信                    | なし | 変更なし                         |
| Preload                    | なし | 変更なし                         |
| データ層                   | なし | 変更なし                         |

---

## 3. ファイル影響範囲

### 3.1 新規作成ファイル

| ファイル                                                                 | 説明                       |
| ------------------------------------------------------------------------ | -------------------------- |
| `apps/desktop/src/renderer/hooks/useInterval.ts`                         | タイマーフック             |
| `apps/desktop/src/renderer/hooks/useVisibility.ts`                       | 可視状態検知フック         |
| `apps/desktop/src/renderer/contexts/TimestampContext.tsx`                | タイムスタンプコンテキスト |
| `apps/desktop/src/renderer/hooks/__tests__/useInterval.test.ts`          | useIntervalテスト          |
| `apps/desktop/src/renderer/hooks/__tests__/useVisibility.test.ts`        | useVisibilityテスト        |
| `apps/desktop/src/renderer/contexts/__tests__/TimestampContext.test.tsx` | Contextテスト              |

### 3.2 修正ファイル

| ファイル                                                                               | 変更内容              |
| -------------------------------------------------------------------------------------- | --------------------- |
| `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`                | TimestampProvider統合 |
| `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx` | 自動更新テスト追加    |

### 3.3 変更なしファイル

| ファイル                                        | 理由             |
| ----------------------------------------------- | ---------------- |
| `apps/desktop/src/renderer/utils/formatTime.ts` | ロジック変更なし |
| その他のコンポーネント                          | 影響範囲外       |

---

## 4. 依存関係

### 4.1 前提タスク

| タスク     | 状態 | 依存内容                             |
| ---------- | ---- | ------------------------------------ |
| TASK-3-2-A | 完了 | MessageTimestampコンポーネントの存在 |

### 4.2 外部依存

| 依存       | バージョン | 用途                     |
| ---------- | ---------- | ------------------------ |
| React      | 18.x       | hooks, Context API, memo |
| TypeScript | 5.x        | 型定義                   |
| Vitest     | 最新       | テストフレームワーク     |

---

## 5. リスク評価

| リスク             | 影響度 | 発生確率 | 対策                         |
| ------------------ | ------ | -------- | ---------------------------- |
| パフォーマンス低下 | 中     | 中       | バッチ更新、React.memoの活用 |
| メモリリーク       | 中     | 低       | useEffect cleanupの徹底      |
| バッテリー消費増加 | 低     | 中       | 非表示時の更新停止機能       |
| 既存機能の破壊     | 高     | 低       | 既存テスト維持、段階的な実装 |

---

## 6. 実装優先順位

| 順位 | 項目                 | 理由                       |
| ---- | -------------------- | -------------------------- |
| 1    | useIntervalフック    | 他の機能の基盤となる       |
| 2    | useVisibilityフック  | パフォーマンス最適化に必要 |
| 3    | TimestampContext     | バッチ更新の基盤           |
| 4    | MessageTimestamp統合 | 実際の機能実現             |
| 5    | テスト追加           | 品質保証                   |
| 6    | パフォーマンス検証   | 最終品質確認               |

---

## 変更履歴

| 日付       | 変更内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-28 | 初版作成 | AI   |
