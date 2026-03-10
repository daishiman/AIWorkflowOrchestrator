# UT-IMP-SAFEON-EVENT-TIMEOUT-001 safeOn イベントリスナーのライフサイクル管理とタイムアウト機構追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1125
```

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-IMP-SAFEON-EVENT-TIMEOUT-001                                   |
| タスク名     | safeOn イベントリスナーのライフサイクル管理とタイムアウト機構追加 |
| 分類         | 改善                                                              |
| 対象機能     | Preload IPC イベントリスナー (safeOn)                             |
| 優先度       | 低（P4）                                                          |
| 見積もり規模 | 中規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 12 未タスク検出             |
| 発見日       | 2026-03-10                                                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SAFEINVOKE-TIMEOUT-001 で `safeInvoke`（request-response パターン）にタイムアウトを追加したが、`safeOn`（event subscription パターン）にはタイムアウト/ライフサイクル管理が未実装である。

### 1.2 問題点・課題

1. `safeOn` で登録したリスナーは明示的に `removeListener` しない限り永続する
2. Renderer コンポーネントのアンマウント時にリスナー解除を忘れるとメモリリーク
3. イベントが長時間来ない場合の検知機構がない
4. P5（リスナー二重登録）のリスクが `safeOn` にも存在する

### 1.3 放置した場合の影響

- メモリリーク（コンポーネント破棄後もリスナーが残存）
- Main Process からのイベント停止を検知できない
- デバッグが困難な状態遷移バグ

## 2. 何を達成するか（What）

### 2.1 目的

`safeOn` に以下の機能を追加する:

1. リスナー解除関数を返す API 設計（`const unsubscribe = safeOn(channel, callback)`）
2. オプショナルな heartbeat タイムアウト（指定時間イベントが来なければ警告/コールバック）
3. React Hook `useIpcEvent(channel, callback, options?)` の提供

### 2.2 最終ゴール

safeOn が unsubscribe 関数を返す API に改善され、useIpcEvent Hook がコンポーネントのライフサイクルに統合され、既存 preload テストが全 PASS する。

### 2.3 スコープ

#### 含むもの

- `safeOn` が unsubscribe 関数を返すよう API 変更
- `apps/desktop/src/preload/ipc-utils.ts` に `onWithLifecycle` 関数追加
- `apps/desktop/src/renderer/hooks/useIpcEvent.ts` 新規作成
- オプショナルな heartbeat timeout パラメータ追加
- P5 準拠のリスナー管理（React StrictMode 二重実行対策）
- テストファイル作成

#### 含まないもの

- safeInvoke の変更（TASK-FIX-SAFEINVOKE-TIMEOUT-001 で完了済み）
- Main Process 側のイベント発火ロジック変更
- 既存コンポーネントの useIpcEvent への一括移行（後続タスクで個別対応）

### 2.4 成果物

- `apps/desktop/src/preload/ipc-utils.ts` に `onWithLifecycle` 追加
- `apps/desktop/src/renderer/hooks/useIpcEvent.ts` 新規作成
- `apps/desktop/src/renderer/hooks/__tests__/useIpcEvent.test.ts` 新規作成
- `apps/desktop/src/preload/__tests__/ipc-utils.safeOn.test.ts` 新規作成

## 3. どのように実行するか（How）

### 3.1 前提条件

TASK-FIX-SAFEINVOKE-TIMEOUT-001 が完了済みであること（ipc-utils.ts が存在する）。

### 3.2 依存タスク

なし（TASK-FIX-SAFEINVOKE-TIMEOUT-001 完了済み）。

### 3.3 必要な知識

- Electron IPC イベントリスナーの登録/解除パターン
- React カスタムHook設計パターン（useEffect cleanup）
- P5: React StrictMode の二重実行でリスナーが二重登録される問題
- P13: タイマーテストで `vi.advanceTimersByTime()` 必須（`vi.runAllTimers()` は無限ループリスク）
- P39: happy-dom 環境では fireEvent を使用（userEvent 禁止）

### 3.4 推奨アプローチ

1. `safeOn` が unsubscribe 関数を返すよう API を変更する
2. `ipc-utils.ts` に `onWithLifecycle` を追加し、heartbeat timeout パラメータをオプショナルに受け取る
3. `useIpcEvent` Hook で useEffect cleanup と組み合わせ、コンポーネントアンマウント時に自動解除する
4. 既存の `safeOn` 利用箇所は後方互換を保つ（戻り値を使わなくても動作する）

## 4. 実行手順

### Phase構成

テスト設計（TDD） → 実装 → リファクタリング → カバレッジ確認。

### Phase 1: 要件定義

#### 目的

safeOn/onWithLifecycle/useIpcEvent の API 設計と受け入れ基準を定義する。

#### 手順

1. 現在の safeOn 実装（`apps/desktop/src/preload/index.ts`）を分析する。
2. onWithLifecycle の引数・戻り値・副作用を定義する。
3. useIpcEvent の引数・戻り値・ライフサイクル管理方針を定義する。
4. 受け入れ基準をチェックリスト形式で明確にする。

#### 成果物

API 仕様: `onWithLifecycle(channel, callback, options?)` / `useIpcEvent(channel, callback, options?)`。

#### 完了条件

API 仕様が明確に定義されている。

### Phase 2: 設計

#### 目的

safeOn の API 改善と useIpcEvent Hook のインターフェース設計を策定する。

#### 手順

1. `onWithLifecycle` の内部設計（unsubscribe 関数、heartbeat タイマー管理）を策定する。
2. `useIpcEvent` の useEffect cleanup パターンを設計する。
3. 後方互換性を保つための safeOn 既存利用箇所への影響を調査する。
4. P5 準拠のリスナー管理パターン（モジュールレベルガード）を設計する。

#### 成果物

API 設計書と後方互換性調査結果。

#### 完了条件

onWithLifecycle と useIpcEvent の責務分離が明確になっている。

### Phase 3: 設計レビュー

### Phase 4: テスト作成（TDD）

#### 目的

onWithLifecycle と useIpcEvent の単体テストを先に作成する。

#### 手順

1. onWithLifecycle テスト:
   - unsubscribe 関数が正しくリスナーを解除する
   - heartbeat タイムアウトでコールバックが呼ばれる
   - イベント受信時に heartbeat タイマーがリセットされる
   - 不正なチャンネル名が拒否される
2. useIpcEvent テスト:
   - コンポーネントマウント時にリスナーが登録される
   - コンポーネントアンマウント時にリスナーが解除される
   - React StrictMode 二重実行でリスナーが二重登録されない（P5 準拠）
   - channel/callback 変更時にリスナーが再登録される
   - heartbeat タイムアウトオプションが動作する

#### 成果物

- `apps/desktop/src/preload/__tests__/ipc-utils.safeOn.test.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useIpcEvent.test.ts`

#### 完了条件

テストファイルが作成され、Red 状態（実装前のため失敗）を確認できる。

### Phase 5: 実装

#### 目的

onWithLifecycle と useIpcEvent を実装する。

#### 手順

1. `apps/desktop/src/preload/ipc-utils.ts` に `onWithLifecycle` を追加する。
2. safeOn が unsubscribe 関数を返すよう変更する（後方互換を保持）。
3. `apps/desktop/src/renderer/hooks/useIpcEvent.ts` を作成する。
4. useEffect cleanup で unsubscribe を返す。
5. 全テストが Green になることを確認する。

#### 成果物

ipc-utils.ts（onWithLifecycle 追加）、useIpcEvent.ts（新規）。

#### 完了条件

onWithLifecycle 単体テストと useIpcEvent 単体テスト、既存 preload テストが全 PASS する。

### Phase 6-7: テスト拡充・カバレッジ確認

#### 目的

カバレッジ基準（Line 80%、Branch 60%、Function 80%）の充足を確認する。

### Phase 8: リファクタリング

### Phase 9: 品質検証

#### 手順

1. `pnpm lint` で Lint チェック。
2. `pnpm typecheck` で型チェック。
3. 関連テスト全 PASS 確認。

### Phase 10-13: 最終レビュー～完了

## 5. 完了条件チェックリスト

### 機能要件

- [ ] safeOn が unsubscribe 関数を返す
- [ ] `onWithLifecycle` が `ipc-utils.ts` に追加されている
- [ ] `useIpcEvent` Hook が作成されている
- [ ] コンポーネントアンマウント時にリスナーが自動解除される
- [ ] React StrictMode でリスナー二重登録が発生しない（P5 準拠）
- [ ] heartbeat タイムアウトがオプショナルで動作する
- [ ] イベント受信時に heartbeat タイマーがリセットされる

### 品質要件

- [ ] onWithLifecycle 単体テストが PASS する
- [ ] useIpcEvent 単体テストが PASS する
- [ ] 既存 preload テストに回帰なし
- [ ] `pnpm typecheck` が PASS する
- [ ] `pnpm lint` が PASS する
- [ ] P5/P13/P39 準拠である

### ドキュメント要件

- [ ] JSDoc/TSDoc が onWithLifecycle と useIpcEvent に記載されている
- [ ] 変更履歴に改善内容を追記している

## 6. 検証方法

### テストケース

- `cd apps/desktop && pnpm vitest run src/preload/__tests__/ipc-utils.safeOn.test.ts`
- `cd apps/desktop && pnpm vitest run src/renderer/hooks/__tests__/useIpcEvent.test.ts`
- `cd apps/desktop && pnpm vitest run src/preload/` （回帰テスト）

### 検証手順

1. onWithLifecycle 単体テストを実行して全 PASS を確認する。
2. useIpcEvent 単体テストを実行して全 PASS を確認する。
3. 既存 preload テストを実行して回帰がないことを確認する。
4. `pnpm typecheck` で型整合性を確認する。
5. タイマーテストは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` で検証する（P13 準拠）。

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                           |
| -------------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| 既存 safeOn 利用箇所の破壊的変更             | 高     | 中       | 後方互換を保ちつつ戻り値を追加する（戻り値を使わなくても動作） |
| heartbeat の誤検知                           | 中     | 低       | デフォルトは heartbeat なし、明示的 opt-in                     |
| P5 二重登録                                  | 高     | 中       | useEffect cleanup + モジュールレベルガード                     |
| useIpcEvent の依存配列でリスナー再登録が頻発 | 中     | 中       | useCallback でコールバックを安定化、channel は文字列で安定     |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/preload/ipc-utils.ts`: invokeWithTimeout 実装（同ファイルに onWithLifecycle を追加予定）
- `apps/desktop/src/preload/index.ts`: 現在の safeOn 実装
- `.claude/rules/06-known-pitfalls.md`: P5, P13, P39
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`: S33（IPC タイムアウトパターン）
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`: safeInvoke タイムアウト契約

### 参考資料

- TASK-FIX-SAFEINVOKE-TIMEOUT-001: safeInvoke タイムアウト実装（同種の改善タスク）
- TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001: AuthGuard タイムアウト実装

## 9. 備考

### TASK-FIX-SAFEINVOKE-TIMEOUT-001 で得た教訓

- **教訓1（Promise.race のシンプルさ）**: safeInvoke のタイムアウトは Promise.race で簡潔に実装できた。safeOn の heartbeat にも同様のシンプルなアプローチ（setTimeout + イベント受信時リセット）を検討すべき
- **教訓2（DRY 統合の効果）**: 3ファイルの重複 safeInvoke を ipc-utils.ts に統合した経験から、safeOn も同じファイルに統合すべき
- **教訓3（clearTimeout の判断）**: safeInvoke では Promise 解決後に clearTimeout する設計にした。safeOn の heartbeat でもイベント受信時にタイマーをリセットする設計が有効
- **教訓4（テスト戦略）**: `vi.useFakeTimers()` + `vi.advanceTimersByTime()` で deterministic なテストが実現できた。safeOn のテストでも同じ戦略を使用すべき

### 同種課題の5分解決カード

```
症状: IPC イベントリスナーがコンポーネント破棄後も残存
根本原因: safeOn が unsubscribe 関数を返さない API 設計
5手順:
  1. safeOn の戻り値を unsubscribe 関数に変更
  2. useIpcEvent(channel, cb) Hook を作成
  3. useEffect cleanup で unsubscribe を返す
  4. オプショナル heartbeat timeout を追加
  5. P5/P13 準拠テスト: StrictMode 二重実行 + advanceTimersByTime
検証ゲート: Hook単体テスト + 既存 preload テスト全 PASS
```
