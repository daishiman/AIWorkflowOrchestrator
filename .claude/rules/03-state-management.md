# 状態管理ルール

> 正本: `aiworkflow-requirements/references/arch-state-management.md`

## 状態の配置原則

| 状態の種類            | 配置先                    | 判断基準                   |
| --------------------- | ------------------------- | -------------------------- |
| アプリ全体で共有      | Zustand Store (Slice)     | 認証, ナビゲーション, 設定 |
| 機能独立の永続状態    | 専用 Zustand Store        | 機能固有の同期データ       |
| 軽量な全体共有        | React Context             | タイマー等の高頻度更新     |
| コンポーネント固有 UI | `useState` / `useReducer` | フォーム入力, モーダル開閉 |
| サーバーサイド永続化  | SQLite + ORM              | 永続データ                 |

## Zustand 設計原則

- DO: ドメインごとに独立した Slice を作成し、Store で合成
- DO: ミドルウェア（`devtools`, `persist`）を活用
- DO: 個別セレクタで必要なフィールドだけ取得（再レンダー最適化）
  → 失敗事例: [06-known-pitfalls.md#P31](./06-known-pitfalls.md)（合成Hook無限ループ）
- DO: アクション関数はuseEffectの依存配列に含める場合、個別セレクタ（`useLLMFetchProviders()`等）で取得（P31対策）
- DON'T: 1つの Slice に複数ドメインの状態を混在させない
- DON'T: Store 全体を一括分割代入しない
- DON'T: 合成Store Hook（useXxxStore()）の戻り値関数を`useEffect`依存配列に含めない
  → 個別セレクタ（`useXxx()`）を使用する

## React Context の使い分け

- DO: 高頻度更新で共有が必要な場合のみ使用
- DON'T: 複雑なビジネスロジックを Context に入れない（Zustand を使う）
- DON'T: 深いネストの Provider ツリーを作らない

## リスナー管理

- DO: IPC リスナーやイベント購読は一度だけ登録されるようガード
- DON'T: `useEffect` 内で直接リスナー登録しない（StrictMode の二重実行に注意）
  → 失敗事例: [06-known-pitfalls.md#P5](./06-known-pitfalls.md)

## データフェッチ

- DO: 外部通信は Main Process 経由（Renderer から直接 HTTP しない）
- DO: ローディング・エラー状態を呼び出し側で管理
