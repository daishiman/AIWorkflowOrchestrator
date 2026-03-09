# agentSlice 既存テストファイルの環境依存エラー修復 - タスク指示書

## メタ情報

```yaml
issue_number: 1104
```

## メタ情報

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-FIX-AGENTSLICE-EXISTING-TEST-ENV-DEPENDENCY-001                        |
| タスク名     | agentSlice 既存テストファイルの環境依存エラー修復                         |
| 分類         | 修正（テスト品質）                                                        |
| 対象機能     | agentSlice テストスイート（18ファイル中13ファイル）                       |
| 優先度       | 中                                                                        |
| 見積もり規模 | 中規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 Phase 7 カバレッジ確認 |
| 発見日       | 2026-03-09                                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 の Phase 7（カバレッジ確認）で、agentSlice の18テストファイルのうち13ファイルが環境依存エラーで失敗することが判明した。正常に実行できるのは5ファイルのみ（concurrency-guard, executeSkill.preflight, selectors, boundary, p31-regression）。

### 1.2 問題点・課題

失敗パターンは2種類に分類される：

#### パターン1: `window is not defined`（7ファイル）

- `agentSlice.test.ts`
- `agentSlice.executeSkill.test.ts`
- `agentSlice.error-cases.test.ts`
- `agentSlice.edge-cases.test.ts`
- `agentSlice.combination.test.ts`
- `agentSlice.extension.test.ts`
- `agentSlice.import-lifecycle.test.ts`

これらは `window.electronAPI` を直接参照しているが、happy-dom 環境での `Object.defineProperty(window, ...)` によるモック設定が不足している。

#### パターン2: `Failed to load @repo/shared/types/auth-mode`（6ファイル）

- `agentSlice.executeSkill.auth.test.ts`
- `agentSlice.executeSkill.retry.test.ts`
- `agentSlice.executeSkill.integration.test.ts`
- `agentSlice.executeSkill.permission.test.ts`
- `agentSlice.executeSkill.stream.test.ts`
- `agentSlice.executeSkill.complete.test.ts`

これらは `@repo/shared` パッケージのビルド成果物に依存しており、shared パッケージが未ビルドの状態で実行すると失敗する。

### 1.3 放置した場合の影響

- agentSlice の真のテストカバレッジが不明確（正常動作する5ファイルのみでカバレッジ計測）
- 13ファイル分のテストが事実上のデッドコード化
- 新しい agentSlice 変更時の回帰テスト信頼性が低下
- CI でこれらのテストが実行されない場合、リグレッションを見逃すリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

agentSlice の全18テストファイルが `cd apps/desktop && pnpm vitest run` で正常に実行されるようにする。

### 2.2 最終ゴール

- 18テストファイル全てが PASS（またはスキップ理由が明示）
- 環境依存を最小化した統一的なモックパターンの適用
- shared パッケージ依存の解消または明示的な前提条件化

### 2.3 スコープ

#### 含むもの

- パターン1（window 未定義）の7ファイル修復
- パターン2（shared 依存）の6ファイル修復または前提条件明示
- テスト間の状態リーク確認（P9準拠）
- 共通ヘルパー（UT-IMP-AGENTSLICE-TEST-CREATESTORE-PATTERN-STANDARDIZATION-001）との連携

#### 含まないもの

- agentSlice 実装コードの変更
- 他の Slice のテスト修復
- E2E テストの追加
- shared パッケージのアーキテクチャ変更

### 2.4 成果物

- 修復された13テストファイル
- 環境依存の根本原因分析レポート
- テスト前提条件の明示（README またはコメント）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- agentSlice の実装を理解していること
- happy-dom 環境での `window` オブジェクトモック方法を理解していること
- モノレポの shared パッケージビルドフローを理解していること

### 3.2 依存タスク

- UT-IMP-AGENTSLICE-TEST-CREATESTORE-PATTERN-STANDARDIZATION-001（推奨: 共通ヘルパーを先に作成）

### 3.3 必要な知識

- Vitest の happy-dom 環境設定
- `@repo/shared` パッケージのビルドとエクスポート
- Zustand Store テストのモックパターン
- P9（テスト間状態リーク防止）/ P40（テスト実行ディレクトリ）

### 3.4 推奨アプローチ

1. パターン1（window 未定義）から修復開始（影響範囲が限定的）
2. `mockElectronAPI()` パターンを適用し、各テストの `beforeEach` でモック設定
3. パターン2（shared 依存）は shared パッケージのモック化または vitest alias 設定で対応
4. 修復後に全18ファイルの一括実行で回帰確認

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                          | 発見経緯                 | 解決策                                                          | この未タスクでの適用       |
| ----------------------------- | ------------------------ | --------------------------------------------------------------- | -------------------------- |
| window is not defined         | Phase 7 カバレッジ確認時 | `Object.defineProperty(window, "electronAPI", ...)` でモック    | パターン1の7ファイルに適用 |
| @repo/shared ビルド依存       | Phase 7 カバレッジ確認時 | vitest.config.ts の alias 設定またはモック化                    | パターン2の6ファイルに適用 |
| テスト間状態リーク（P9）      | 既知の落とし穴           | `beforeEach` で `vi.restoreAllMocks()` + `cleanupElectronAPI()` | 全修復ファイルに適用       |
| テスト実行ディレクトリ（P40） | Phase 6 テスト実行時     | `cd apps/desktop && pnpm vitest run`                            | 修復確認時に P40 準拠      |

---

## 4. 実行手順

### Phase A: 現状調査

1. 18テストファイル全てを個別実行し、失敗パターンを分類
2. 各ファイルの依存関係（import先）をリストアップ
3. shared パッケージの未ビルド時の挙動を確認

### Phase B: パターン1 修復（window 未定義）

1. `mockElectronAPI()` パターンを各テストに追加
2. `cleanupElectronAPI()` を `beforeEach` / `afterEach` に追加
3. 各ファイル単体で PASS を確認

### Phase C: パターン2 修復（shared 依存）

1. `@repo/shared/types/auth-mode` のモック方法を検討
2. vitest.config.ts の alias 設定またはモジュールモックを適用
3. 各ファイル単体で PASS を確認

### Phase D: 統合検証と仕様同期

1. 全18ファイルの一括実行で PASS 確認
2. カバレッジレポートの再計測
3. `arch-state-management.md` にテスト修復結果を追記
4. `lessons-learned.md` に苦戦箇所を追記（必要なら）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] パターン1の7ファイルが全て PASS
- [ ] パターン2の6ファイルが全て PASS（またはスキップ理由が明示）
- [ ] 全18テストファイルの一括実行が成功

### 品質要件

- [ ] テスト間の状態リークがない（P9準拠）
- [ ] テスト実行が `cd apps/desktop` から可能（P40準拠）
- [ ] カバレッジが Line 80% 以上

### ドキュメント要件

- [ ] 環境依存の根本原因分析が記録されている
- [ ] `arch-state-management.md` にテスト修復結果が記載されている
- [ ] 本未タスク指示書のステータスが更新されている

---

## 6. 検証方法

### テストケース

- TC-01: `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice` で18ファイル全 PASS
- TC-02: カバレッジレポートで agentSlice.ts の Line Coverage ≥ 80%
- TC-03: 個別テストファイル実行で各ファイルが独立して PASS

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice`
2. `cd apps/desktop && pnpm vitest run --coverage src/renderer/store/slices/__tests__/agentSlice`
3. 個別ファイル実行: `cd apps/desktop && pnpm vitest run <各テストファイル>`

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                            |
| --------------------------------------- | ------ | -------- | ----------------------------------------------- |
| shared パッケージモック化で型安全性低下 | 中     | 中       | vitest alias で実型を維持しつつパス解決を修正   |
| 修復時に既存テストのアサーション破壊    | 高     | 低       | 各ファイル修復後に個別 PASS 確認                |
| happy-dom と jsdom の挙動差異           | 中     | 低       | P39 準拠で fireEvent を使用、userEvent を避ける |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/06-known-pitfalls.md` — P9, P39, P40
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — テストヘルパー標準
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-CONCURRENCY-GUARD 教訓
- `docs/30-workflows/unassigned-task/task-imp-agentslice-test-createstore-pattern-standardization-001.md` — 依存タスク

### 参考資料

- `apps/desktop/vitest.config.ts` — テスト環境設定
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts` — 正常動作するテストの参考例
- `packages/shared/src/types/auth-mode.ts` — 依存型定義

---

## 9. 備考

### 補足事項

- UT-IMP-AGENTSLICE-TEST-CREATESTORE-PATTERN-STANDARDIZATION-001 と連携して進めると効率的
- 共通ヘルパーが先に作成されていれば、修復作業でそのヘルパーを直接利用可能
- パターン2 の修復は shared パッケージのアーキテクチャに依存するため、vitest alias が最小影響のアプローチ
