# agentSlice テスト createStore パターン標準化 - タスク指示書

## メタ情報

```yaml
issue_number: 1105
```

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-IMP-AGENTSLICE-TEST-CREATESTORE-PATTERN-STANDARDIZATION-001        |
| タスク名     | agentSlice テスト createStore パターン標準化                          |
| 分類         | 改善（テスト基盤）                                                    |
| 対象機能     | agentSlice テストヘルパー                                             |
| 優先度       | 中                                                                    |
| 見積もり規模 | 中規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 Phase 6 テスト拡充 |
| 発見日       | 2026-03-09                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 の実装時、agentSlice のテストで `createStore()` + `mockElectronAPI()` + `flushMicrotasks()` パターンが汎用的に使えることが判明した。しかし、このパターンは既存の18テストファイルには適用されておらず、テストファイル間でモックパターンが統一されていない。このパターンを共通ヘルパーとして抽出し、テスト品質を標準化する必要がある。

### 1.2 問題点・課題

- テストファイル間でモックパターンが統一されていない
- `createStore()` + `mockElectronAPI()` + `flushMicrotasks()` が各テストファイルにコピペされている
- 18テストファイル中13ファイルが環境依存で失敗する

### 1.3 放置した場合の影響

- 新しい agentSlice テストを書く度にモックのボイラープレートが必要
- テスト間で異なるモックパターンが混在し保守コストが増大
- 共有ヘルパー修正時の影響範囲が不明確

---

## 2. 何を達成するか（What）

### 2.1 目的

agentSlice テストの共通ヘルパーを抽出し、テストパターンを標準化する。

### 2.2 最終ゴール

- `createStore()` / `mockElectronAPI()` / `flushMicrotasks()` が共通ヘルパーファイルに集約されている
- 既存テストファイルが共通ヘルパーを参照するよう段階的にリファクタリングされている
- テスト実行ガイド（P40準拠）が README またはコメントで明示されている

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/store/slices/__tests__/helpers/agentSlice-test-helpers.ts` の新規作成
- `agentSlice-concurrency-guard.test.ts` のヘルパー抽出
- 既存テストファイルの段階的移行計画

#### 含まないもの

- 他の Slice（authModeSlice, llmSlice 等）のテストヘルパー統一
- テストフレームワークの変更
- E2E テストの追加

### 2.4 成果物

- 共通ヘルパーファイル
- 既存テストのリファクタリング（段階的）
- テスト実行ガイド（P40準拠ディレクトリ注意書き付き）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 の実装を理解していること
- agentSlice のテストパターン（createStore / mockElectronAPI / flushMicrotasks）を理解していること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Zustand slice の set/get パターン
- Vitest のモック管理（vi.fn, vi.restoreAllMocks）
- モノレポ環境でのテスト実行（P40）

### 3.4 推奨アプローチ

1. `agentSlice-concurrency-guard.test.ts` から `createStore` / `mockElectronAPI` / `flushMicrotasks` / `cleanupElectronAPI` を抽出
2. 共通ヘルパーファイルを作成
3. concurrency guard テストを共通ヘルパー参照に切り替え、全テスト PASS を確認
4. 他のテストファイルを段階的に移行

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                            | 発見経緯                                           | 解決策                                         | この未タスクでの適用                                      |
| ------------------------------- | -------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| P40: テスト実行ディレクトリ依存 | プロジェクトルートから vitest 実行で全テスト失敗   | `cd apps/desktop && pnpm vitest run` で実行    | ヘルパーファイルの冒頭コメントに P40 準拠の実行方法を明記 |
| createStore の set/get 再現     | Zustand の set が関数/オブジェクト両方を受け付ける | `Object.assign + spread` で shallow merge 再現 | 共通ヘルパーに型安全な createStore を実装                 |
| flushMicrotasks タイミング      | async アクション内の await 通過が必要              | `setTimeout(resolve, 0)` ヘルパー              | 共通ヘルパーに `flushMicrotasks` を含める                 |
| 既存テスト環境依存              | 13/18 ファイルが window/shared 依存で失敗          | mockElectronAPI パターンで環境依存を最小化     | 共通ヘルパーの mockElectronAPI を使って段階的に修正       |

---

## 4. 実行手順

### Phase A: ヘルパー抽出

1. `agentSlice-concurrency-guard.test.ts` から共通関数を抽出
2. `__tests__/helpers/agentSlice-test-helpers.ts` を作成
3. concurrency guard テストを共通ヘルパー参照に切り替え
4. 全テスト PASS を確認

### Phase B: 段階的移行

1. 既存テストファイルのモックパターンを調査
2. 互換性のあるファイルから順次共通ヘルパーに移行
3. 各移行後にテスト PASS を確認

### Phase C: 仕様同期

1. `arch-state-management.md` にテストヘルパー標準を追記
2. `lessons-learned.md` に移行時の苦戦箇所を追記（必要な場合）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 共通ヘルパーファイルが作成されている
- [ ] `createStore` / `mockElectronAPI` / `flushMicrotasks` / `cleanupElectronAPI` が共通化されている
- [ ] concurrency guard テストが共通ヘルパーを使用している

### 品質要件

- [ ] 全テスト PASS（`cd apps/desktop && pnpm vitest run`）
- [ ] 共通ヘルパーに型定義が付いている
- [ ] P40 準拠の実行ガイドがある

### ドキュメント要件

- [ ] `arch-state-management.md` にテストヘルパー標準が記載されている
- [ ] 本未タスク指示書のステータスが更新されている

---

## 6. 検証方法

### テストケース

- TC-01: 共通ヘルパーを使った concurrency guard テスト 9件が全 PASS
- TC-02: 移行済みの既存テストが全 PASS
- TC-03: 共通ヘルパーの型定義が TypeCheck を通過

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`
2. `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/`
3. `cd apps/desktop && pnpm typecheck`

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                 |
| ------------------------------------ | ------ | -------- | ---------------------------------------------------- |
| 共通ヘルパー変更で既存テスト破壊     | 高     | 中       | 段階的移行 + 各段階で全テスト PASS 確認              |
| 既存テストが共通ヘルパーと互換性なし | 中     | 高       | 互換性のあるファイルから順次移行、非互換は個別対応   |
| flushMicrotasks の汎用化困難         | 低     | 低       | async アクションごとにフラッシュ回数を調整可能にする |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — 並行実行ガードパターン（v3.13.0）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-CONCURRENCY-GUARD 教訓
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S31 パターン

### 参考資料

- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts` — 抽出元
- `apps/desktop/src/renderer/store/slices/agentSlice.ts` — テスト対象

---

## 9. 備考

### 補足事項

- S31（並行実行ガードパターン）のテストテンプレートとして、共通ヘルパーが再利用される想定
- 将来の agentSlice テスト追加時のボイラープレート削減が主目的
