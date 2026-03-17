# apiKey.validate() デバウンス完全実装 - タスク指示書

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-TASK06-002                                                                   |
| タスク名     | apiKey.validate() デバウンス完全実装                                            |
| 分類         | UX改善                                                                          |
| 対象機能     | Settings API Key 検証                                                           |
| 優先度       | 低                                                                              |
| 見積もり規模 | 小規模                                                                          |
| ステータス   | 未実施                                                                          |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 10 MINOR-02 / Phase 11 DI-0003 |
| 発見日       | 2026-03-17                                                                      |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Renderer 側 300ms デバウンスは導入済みだが、Main 側の呼び出し頻度制御と UI の検証中状態契約が未固定。

### 1.2 問題点・課題

- 高頻度入力時のバックエンド負荷が読めない。
- UI の「検証中」表示が統一されていない。

### 1.3 放置した場合の影響

- 不要な validation 呼び出し増加。
- ユーザーが現在状態を誤認する。

## 2. 何を達成するか（What）

### 2.1 目的

debounce + throttle + loading 表示を一体化し、契約を明文化する。

### 2.2 最終ゴール

- Renderer: 300ms debounce。
- Main: provider 単位で最小間隔制御。
- 仕様書: 状態遷移（idle/loading/ok/error）を固定。

### 2.3 スコープ

#### 含むもの

- `apiKey.validate` 呼び出し制御。
- テスト追加（Fake Timer を含む）。

#### 含まないもの

- API key 保存ロジック変更。
- provider 別バリデータの刷新。

### 2.4 成果物

- 追加テスト。
- 仕様書の状態遷移表。

## 3. どのように実行するか（How）

### 3.1 前提条件

Task06 runtime-sync テストが GREEN であること。

### 3.2 依存タスク

- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001（完了）

### 3.3 必要な知識

- Fake Timer テスト
- P42 バリデーション

### 3.4 推奨アプローチ

1. 呼び出し回数の計測テストを先行作成。
2. Main 側最小間隔制御を実装。
3. UI の loading 状態を仕様化しテスト固定。

## 4. 実行手順

1. `apiKey.validate` 呼び出し箇所を `rg` で棚卸し。
2. debounce/throttle 契約を決定。
3. テストを Red→Green で追加。

## 5. 完了条件チェックリスト

- [ ] 連続入力で不要呼び出しが抑制される
- [ ] loading 表示が明示される
- [ ] 契約が仕様書に反映される

## 6. 検証方法

- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/apiKeyHandlers.runtime-sync.test.ts`
- `pnpm --filter @repo/desktop exec vitest run src/renderer/**/ApiKeysSection*.test.tsx`

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                   |
| ------------------------------- | ------ | -------- | ---------------------- |
| debounce と throttle の二重遅延 | 中     | 中       | 仕様書に優先順位を明記 |
| Fake Timer 依存で flaky 化      | 中     | 低       | テスト境界を分離       |

## 8. 参照情報

- `apps/desktop/src/main/ipc/__tests__/apiKeyHandlers.runtime-sync.test.ts`
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/phase-4/test-matrix.md`

## 9. 備考

Task06 の DI-0003 から formalize。Phase 12 で登録済み。
