# IPC タイムアウト後のリトライ UI パターン実装

## メタ情報

```yaml
issue_number: 1124
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-IMP-IPC-TIMEOUT-RETRY-UI-001                       |
| タスク名     | IPC タイムアウト後のリトライ UI パターン実装          |
| 分類         | 機能追加                                              |
| 対象機能     | Renderer UI コンポーネント / Store エラーハンドリング |
| 優先度       | 中（P3）                                              |
| 見積もり規模 | 中規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 12 未タスク検出 |
| 発見日       | 2026-03-10                                            |

---

## 目的（Why）

### 背景

TASK-FIX-SAFEINVOKE-TIMEOUT-001 で safeInvoke に 5 秒タイムアウトを追加した。タイムアウト発生時、Promise は reject されるが、ユーザーにはエラーメッセージが表示されるだけでリトライの導線がない。

### 問題点

1. タイムアウトエラー後、ユーザーはアプリを再起動するか、手動で画面遷移して再操作する必要がある
2. 一時的なネットワーク遅延や Main Process の一時的高負荷では、リトライで成功する可能性が高い
3. 現在の Store（Zustand）のエラーハンドリングは `isLoading=false` + エラーメッセージ表示で終了
4. リトライボタンや自動リトライの仕組みがない

### 放置した場合の影響

- ユーザー体験の劣化（タイムアウト＝行き止まり）
- 一時的な問題でもアプリ再起動が必要になる
- サポート問い合わせの増加

---

## 達成目標（What）

### 目的

IPC タイムアウト発生時にユーザーがワンクリックでリトライできる UI パターンを実装する。

### スコープ

#### 含む

- リトライ対応の汎用エラーコンポーネント（`IpcErrorWithRetry`）
- Store のリトライアクション追加（retryLastAction パターン）
- 指数バックオフ付き自動リトライ（最大3回、opt-in）
- リトライ回数表示とキャンセル機能

#### 含まない

- Preload 層の変更（タイムアウト機構自体は変更しない）
- Circuit Breaker パターン（別タスク task-circuit-breaker-pattern.md で対応）
- Main Process 側のリトライロジック

### 成果物

| 成果物                           | パス                                                                              | 種別     |
| -------------------------------- | --------------------------------------------------------------------------------- | -------- |
| リトライ対応エラーコンポーネント | `apps/desktop/src/renderer/components/atoms/IpcErrorWithRetry.tsx`                | 新規作成 |
| リトライ Hook                    | `apps/desktop/src/renderer/hooks/useIpcRetry.ts`                                  | 新規作成 |
| Store Slice リトライパターン     | Store Slice への retryLastAction パターン追加                                     | 修正     |
| コンポーネントテスト             | `apps/desktop/src/renderer/components/atoms/__tests__/IpcErrorWithRetry.test.tsx` | 新規作成 |
| Hook テスト                      | `apps/desktop/src/renderer/hooks/__tests__/useIpcRetry.test.ts`                   | 新規作成 |

### UI 設計（Apple HIG 準拠）

```
+-------------------------------------------+
|  ! 接続がタイムアウトしました             |
|                                           |
|  設定の読み込みに失敗しました。           |
|  ネットワーク接続を確認してください。     |
|                                           |
|  [リトライ]  [設定画面へ]                 |
|                                           |
|  残りリトライ: 2/3                        |
+-------------------------------------------+
```

- Apple systemOrange (#FF9500 / #FF9F0A) を警告色として使用
- 角丸 12px、padding 16px（8px グリッド準拠）
- アニメーション: リトライ中はボタンにスピナー表示（200-300ms transition）

---

## 実装方針（How）

### 前提条件

- TASK-FIX-SAFEINVOKE-TIMEOUT-001 完了済み
- TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 完了済み（AuthGuard のタイムアウトフォールバック参考）

### 依存タスク

| タスクID                                       | 関係             | 説明                                         |
| ---------------------------------------------- | ---------------- | -------------------------------------------- |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001                | 前提（完了済み） | safeInvoke タイムアウト機構                  |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 | 前提（完了済み） | AuthGuard タイムアウトフォールバック UI 参考 |
| UT-IMP-IPC-TIMEOUT-CONFIGURABLE-001            | 推奨             | チャンネル別タイムアウトとの組み合わせ       |

### 推奨アプローチ

1. **`useIpcRetry(action, options?)` Hook 作成**
   - `action`: リトライ対象の async 関数
   - `options`: `{ maxRetries: 3, backoffMs: 1000, backoffMultiplier: 2 }`
   - 状態管理は `useReducer` で状態機械として管理（idle / loading / error / success / retrying）
   - 指数バックオフ: `delay = backoffMs * (backoffMultiplier ^ attempt)`
   - 最大待ち時間キャップ: 10秒

2. **`IpcErrorWithRetry` コンポーネント作成（Atomic Design: atom）**
   - Props: `errorMessage`, `onRetry`, `retryCount`, `maxRetries`, `isRetrying`, `onCancel?`, `fallbackAction?`
   - ライト/ダークモード両対応（CSS 変数ベース）
   - WCAG 2.1 AA コントラスト比準拠

3. **Store Slice への統合**
   - SettingsView / AgentView 等で IPC エラー発生時に `IpcErrorWithRetry` を表示
   - エラーの分類に基づきリトライ UI の表示/非表示を切り替え
     - リトライ可能: IPC タイムアウトエラー（External Service Error: 3000-3999 相当）
     - リトライ不可: チャンネル拒否エラー（Validation Error: 1000-1999 相当）

### 注意すべき Pitfall

| Pitfall | 内容                                                     | 対策                                      |
| ------- | -------------------------------------------------------- | ----------------------------------------- |
| P31     | useIpcRetry 内で Zustand Store を使う場合の無限ループ    | 個別セレクタを使用                        |
| P48     | 派生セレクタ（エラー状態のフィルタリング等）の無限ループ | useShallow を適用                         |
| P39     | happy-dom テスト環境での userEvent 非互換                | fireEvent を使用                          |
| P47     | CSS 変数ベースのスタイルテストアサーション               | variantStyles Record で管理               |
| P46     | HTMLAttributes との Props 型衝突                         | Omit で衝突属性を除外                     |
| P13     | タイマーテストの無限ループ                               | advanceTimersByTime で1ステップずつ進める |

### アーキテクチャ準拠

- `01-architecture.md`: Apple HIG System Colors 準拠（ライト/ダーク両対応）
- `02-code-quality.md`: エラーカテゴリ（リトライ可/不可の判定基準）
- `03-state-management.md`: Zustand 個別セレクタ、useReducer でコンポーネント固有 UI 状態管理

---

## 実装で苦戦した箇所（親タスクの経験から）

### 同種課題の5分解決カード

```
症状: IPC タイムアウト後にユーザーが行き止まりになる
根本原因: タイムアウトエラーのリカバリ UI がない
5手順:
  1. useIpcRetry(action, options?) Hook を作成
  2. IpcErrorWithRetry atom コンポーネントを作成
  3. Store の fetch 系アクションに retry パターンを追加
  4. 指数バックオフ: delay = backoffMs * (backoffMultiplier ^ attempt)
  5. Apple HIG 準拠の警告 UI（systemOrange、角丸12px）
検証ゲート: コンポーネントテスト + 既存テスト全 PASS
```

### TASK-FIX-SAFEINVOKE-TIMEOUT-001 からの教訓

1. **タイムアウトは「検知」だけでは不十分**: 今回の実装でタイムアウトの「検知」は完了したが、「リカバリ」はスコープ外とした。検知とリカバリは別責務であり、正しい判断だった
2. **Promise.reject のエラーメッセージ設計**: `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms` というメッセージはデバッグ用。ユーザー向けには「接続がタイムアウトしました」等の分かりやすいメッセージに変換すべき
3. **エラーの分類が重要**: IPC タイムアウトエラーはリトライ可能（External Service Error: 3000-3999 相当）。チャンネル拒否エラーはリトライ不可（Validation Error: 1000-1999 相当）。エラー種別によってリトライ UI の表示/非表示を切り替えるべき

---

## Phase 構成

Phase 1-13 の標準構成。

| Phase | 名称             | 備考                                                         |
| ----- | ---------------- | ------------------------------------------------------------ |
| 1     | 要件定義         | エラー分類とリトライ可否の基準を明確化                       |
| 2     | 設計             | UI デザイン（Apple HIG 準拠）、Hook API 設計                 |
| 3     | 設計レビュー     | UI/UX とエラーハンドリングの妥当性検証                       |
| 4     | テスト作成       | コンポーネントテスト + Hook テスト                           |
| 5     | 実装             | IpcErrorWithRetry + useIpcRetry                              |
| 6     | テスト拡充       | 指数バックオフ・キャンセル・エッジケース                     |
| 7     | カバレッジ確認   | Line 80%+, Branch 60%+, Function 80%+                        |
| 8     | リファクタリング | 状態機械の整理、型安全の強化                                 |
| 9     | 品質検証         | Lint + TypeCheck + 全テスト                                  |
| 10    | 最終レビュー     | 多角的品質・整合性検証                                       |
| 11    | 手動テスト       | Apple UI/UX エンジニアとしてスクリーンショットによる視覚検証 |
| 12    | ドキュメント     | 実装ガイド・システム仕様更新・未タスク検出                   |
| 13    | 完了             | 成果物最終確認・PR準備                                       |

---

## 完了条件チェックリスト

### 機能要件

- [ ] IpcErrorWithRetry コンポーネントが作成されている
- [ ] useIpcRetry Hook が作成されている
- [ ] リトライボタンクリックで操作が再実行される
- [ ] 指数バックオフ付き自動リトライが動作する（opt-in）
- [ ] リトライ回数の表示とキャンセルが機能する
- [ ] ライト/ダークモード両対応

### 品質要件

- [ ] コンポーネントテストが PASS
- [ ] Hook 単体テストが PASS
- [ ] 既存テストに回帰なし
- [ ] WCAG 2.1 AA コントラスト比準拠
- [ ] pnpm typecheck PASS
- [ ] pnpm lint PASS

### ドキュメント要件

- [ ] コンポーネントの使用方法が JSDoc に記載
- [ ] 変更履歴に追記

---

## リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                   |
| ---------------------------------- | ------ | -------- | -------------------------------------- |
| リトライの無限ループ               | 高     | 低       | maxRetries で上限設定（デフォルト3回） |
| 指数バックオフの待ち時間が長すぎる | 中     | 低       | 最大待ち時間をキャップ（10秒）         |
| リトライ中の状態遷移バグ           | 中     | 中       | useReducer で状態機械として管理        |
| P31 パターンの再発                 | 中     | 中       | 個別セレクタのみ使用                   |

---

## 参照情報

| 参照                         | パス / 説明                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| タイムアウトエラーメッセージ | `apps/desktop/src/preload/ipc-utils.ts`                                  |
| 既存タイムアウト UI 参考     | `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx` |
| Apple HIG カラーパレット     | `.claude/rules/01-architecture.md`                                       |
| エラーカテゴリ定義           | `.claude/rules/02-code-quality.md`                                       |
| 既知の Pitfall               | `.claude/rules/06-known-pitfalls.md`（P13, P31, P39, P46, P47, P48）     |
| 関連 Circuit Breaker タスク  | `docs/30-workflows/unassigned-task/task-circuit-breaker-pattern.md`      |
