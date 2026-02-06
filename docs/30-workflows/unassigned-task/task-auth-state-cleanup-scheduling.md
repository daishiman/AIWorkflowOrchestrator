# State Map定期クリーンアップ実装 - タスク指示書

## メタ情報

```yaml
issue_number: 723
task_id: task-sec-auth-state-cleanup-001
task_name: State Map定期クリーンアップ実装
category: セキュリティ
target_feature: OAuth認証（Desktop） - StateManager
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12（DEBT-SEC-001完了時の既知制約として検出）
created_date: 2026-02-06
```

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | task-sec-auth-state-cleanup-001                    |
| タスク名     | State Map定期クリーンアップ実装                    |
| 分類         | セキュリティ                                       |
| 対象機能     | OAuth認証（Desktop） - StateManager                |
| 優先度       | 低                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 未実施                                             |
| 発見元       | Phase 12（DEBT-SEC-001完了時の既知制約として検出） |
| 発見日       | 2026-02-06                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

DEBT-SEC-001（State Parameter CSRF防御）の実装で、`stateManager.ts`のStateEntryをインメモリ`Map<string, StateEntry>`で管理している。`cleanup()`メソッドは期限切れエントリの削除機能として実装済みだが、**定期的な呼び出しスケジューリングは未実装**である。

この制約は `csrf-state-parameter.md`（システム仕様書）の「既知の制約」セクションに以下のとおり記録されている：

| 制約        | 影響                   | 将来の解決策                |
| ----------- | ---------------------- | --------------------------- |
| Map上限なし | 理論上メモリリーク可能 | cleanup()定期呼び出しで緩和 |

### 1.2 問題点・課題

**現状の実装**:

- ✅ `stateManager.cleanup()` は期限切れエントリを一括削除可能
- ✅ StateEntryは10分の有効期限（STATE_EXPIRY_MS = 600,000ms）
- ❌ cleanup()の定期呼び出しスケジューリングが未実装
- ❌ Map最大エントリ数の上限が未設定

**メモリ蓄積シナリオ**:

1. ユーザーがOAuth認証を開始（`generate(provider)` でStateEntry生成）
2. 外部ブラウザでの認証を**キャンセル**（コールバック未到達）
3. StateEntryは期限切れ後もMapに残留（consumeState/validateが呼ばれないため）
4. これを繰り返すとMapが無制限に肥大化

### 1.3 放置した場合の影響

| 影響領域     | 影響度 | 説明                                                           |
| ------------ | ------ | -------------------------------------------------------------- |
| メモリ使用量 | Low    | StateEntryは軽量（約200bytes/entry）。実用上は問題になりにくい |
| 安定性       | Low    | 極端な頻度でログインをキャンセルしない限り影響なし             |
| コード品質   | Medium | cleanup()の定期呼び出しがないと防御的コーディングとして不完全  |
| 将来の拡張   | Medium | DEBT-SEC-002（PKCE）でPKCEManagerにも同様のMapが追加される予定 |

---

## 2. 何を達成するか（What）

### 2.1 目的

StateManager（および将来のPKCEManager）のインメモリMapに対する定期クリーンアップ機構を実装し、メモリリークを防止する。

### 2.2 最終ゴール

- ✅ `stateManager.cleanup()`の定期呼び出し（5分間隔）
- ✅ Map上限設定（100エントリ）と上限超過時の最古エントリ自動削除
- ✅ アプリ終了時のタイマークリーンアップ（`clearInterval`）
- ✅ `startCleanupScheduler()` / `stopCleanupScheduler()` API追加
- ✅ ユニットテスト追加（既存21テスト + 新規5テスト以上）
- ✅ テストカバレッジ100%維持

### 2.3 スコープ

#### 含むもの

- `stateManager.ts`への定期cleanup `setInterval`追加
- Map上限チェックロジック（`generate()`内）
- `startCleanupScheduler()` / `stopCleanupScheduler()` API
- アプリ終了時の`clearInterval`処理
- ユニットテスト追加

#### 含まないもの

- PKCEManager実装（DEBT-SEC-002として別タスク）
- StateManagerのアーキテクチャ変更（インメモリ→永続化等）
- マルチプロセス対応（現時点で不要。シングルプロセス前提）
- cleanup()のロジック変更（期限切れ判定は既存実装を流用）

### 2.4 成果物

| 種別   | 成果物                       | 配置先                                                                      |
| ------ | ---------------------------- | --------------------------------------------------------------------------- |
| 実装   | stateManager.ts修正          | `apps/desktop/src/main/infrastructure/stateManager.ts`                      |
| テスト | stateManager.test.ts追加分   | `apps/desktop/src/main/infrastructure/__tests__/stateManager.test.ts`       |
| 文書   | セキュリティガイドライン更新 | `docs/00-requirements/17-security-guidelines.md`                            |
| 文書   | csrf-state-parameter.md更新  | `.claude/skills/aiworkflow-requirements/references/csrf-state-parameter.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [x] DEBT-SEC-001（State Parameter CSRF防御）完了済み（2026-02-06）
- [ ] stateManager.tsとそのテストファイルが存在すること（✅ 確認済み）
- [ ] 開発環境が正しくセットアップされていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- DEBT-SEC-001: State Parameter CSRF防御（✅ 完了済み 2026-02-06）

**同時実施可能なタスク**:

- DEBT-SEC-002（PKCE実装）
- DEBT-SEC-003（URL詳細検証）

### 3.3 必要な知識

- Node.js `setInterval` / `clearInterval` API
- Vitest `vi.useFakeTimers()` / `vi.advanceTimersByTime()` によるタイマーテスト
- StateManager API仕様（参照: `csrf-state-parameter.md`）
- Electronアプリのライフサイクルイベント（`app.on('before-quit')`）

### 3.4 推奨アプローチ

1. **定数定義**: `CLEANUP_INTERVAL_MS = 300_000`（5分）、`MAX_STATE_ENTRIES = 100`
2. **startCleanupScheduler()**: アプリ起動時に呼び出し、`setInterval`でcleanup()を定期実行
3. **stopCleanupScheduler()**: アプリ終了時（`app.on('before-quit')`）に`clearInterval`
4. **generate()内の上限チェック**: `Map.size >= MAX_STATE_ENTRIES`時に最古エントリ（`createdAt`が最小）を削除
5. **\_reset()拡張**: テスト用リセットでタイマーもクリア

### 3.5 DEBT-SEC-001実装時の苦戦箇所と教訓

DEBT-SEC-001（State Parameter CSRF防御）実装時に発見された課題と解決策。本タスク実装時の参考にすること。

| 課題                         | 原因                                                             | 解決策                                                 | 教訓                                                       |
| ---------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| consumeState()設計の乖離     | Implicit FlowのコールバックURLにプロバイダー情報が含まれない     | consumeState()をプロバイダー検証なしの簡易版として追加 | 外部API依存の設計は設計Phaseで実際のレスポンスを確認すべき |
| Phase 12ドキュメント更新漏れ | references/（正本）とdocs/（派生）の2階層に同じ情報が存在        | `grep -rn "KEYWORD" references/ docs/`で両階層を検索   | 正本更新時は必ず派生ドキュメントの同期を確認               |
| Vitest fakeTimers精度問題    | `advanceTimersByTime()`で期限切れテスト時にタイマー精度のズレ    | `Date.now()`モックで正確な時刻制御                     | 有効期限テストはfakeTimersより`Date.now()`モックが確実     |
| Implicit Flowフラグメント    | パラメータがURLフラグメント(#)に含まれ、`url.search`では取得不可 | `url.hash.slice(1)`でパース                            | PKCE実装時に`url.search(?)`への切り替えが必要              |

**参照先システム仕様書**:

- `.claude/skills/aiworkflow-requirements/references/csrf-state-parameter.md` - StateManager API仕様・型定義・セキュリティ設計根拠
- `.claude/skills/aiworkflow-requirements/references/patterns.md` - 成功パターン・失敗パターン集
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` - 認証セキュリティアーキテクチャ全体

---

## 4. 実行手順

### Phase構成

```
Phase 1-3: 要件定義・設計・レビュー
  ↓
Phase 4: テスト作成（TDD Red）
  ↓
Phase 5: 実装（TDD Green）
  ↓
Phase 6-7: テスト拡充・カバレッジ確認
  ↓
Phase 8-10: リファクタリング・品質検証・最終レビュー
  ↓
Phase 11: 手動テスト
  ↓
Phase 12-13: ドキュメント・完了
```

### Phase 4: テスト作成（TDD Red）

#### 目的

定期クリーンアップとMap上限チェックのテストを先に作成する。

#### 手順

1. `stateManager.test.ts`に以下のテストケースを追加:
   - `startCleanupScheduler()`後に`CLEANUP_INTERVAL_MS`間隔で`cleanup()`が呼ばれること
   - `stopCleanupScheduler()`後に`cleanup()`が呼ばれなくなること
   - `Map.size >= MAX_STATE_ENTRIES`時に`generate()`で最古エントリが削除されること
   - 期限内のStateEntryは`cleanup()`で削除されないこと
   - `_reset()`でタイマーもクリアされること
2. `vi.useFakeTimers()`でタイマーをモック

#### 成果物

| 成果物     | パス                   | 内容              |
| ---------- | ---------------------- | ----------------- |
| テスト追加 | `stateManager.test.ts` | 5テストケース以上 |

#### 完了条件

- [ ] テストケース作成完了
- [ ] テスト実行でRed状態確認
- [ ] ESLint/TypeScriptエラーなし

### Phase 5: 実装（TDD Green）

#### 目的

定期クリーンアップスケジューラとMap上限チェックを実装する。

#### 手順

1. 定数追加: `CLEANUP_INTERVAL_MS = 300_000`, `MAX_STATE_ENTRIES = 100`
2. `startCleanupScheduler()` 実装（setIntervalでcleanup()を定期実行）
3. `stopCleanupScheduler()` 実装（clearInterval）
4. `generate()`内のMap上限チェック追加（超過時は最古エントリ削除）
5. `_reset()`にタイマークリア処理を追加

#### 成果物

| 成果物              | パス                                                   | 内容                        |
| ------------------- | ------------------------------------------------------ | --------------------------- |
| stateManager.ts修正 | `apps/desktop/src/main/infrastructure/stateManager.ts` | スケジューラ + 上限チェック |

#### 完了条件

- [ ] 全テスト成功（Green状態）
- [ ] テストカバレッジ100%維持
- [ ] ESLint/TypeScriptエラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `cleanup()`定期呼び出し実装完了（5分間隔）
- [ ] Map上限チェック実装完了（100エントリ）
- [ ] アプリ終了時のタイマークリーンアップ実装完了
- [ ] `startCleanupScheduler()` / `stopCleanupScheduler()` API追加

### 品質要件

- [ ] 全ユニットテスト成功（既存21テスト + 新規5テスト以上）
- [ ] テストカバレッジ100%維持（Line/Branch/Function）
- [ ] ESLint/TypeScriptエラーゼロ
- [ ] メモリリークがないことを確認（長時間テスト）

### ドキュメント要件

- [ ] `csrf-state-parameter.md`更新（スケジューラAPI追記）
- [ ] セキュリティガイドライン更新
- [ ] Phase 12チェックリスト全項目完了（05-task-execution.md準拠）

---

## 6. 検証方法

### テストケース

#### ユニットテスト（stateManager - 新規追加分）

| No  | テスト項目                                       | 期待結果                              |
| --- | ------------------------------------------------ | ------------------------------------- |
| 1   | startCleanupScheduler()後に定期的にcleanup()実行 | CLEANUP_INTERVAL_MS間隔で呼び出される |
| 2   | stopCleanupScheduler()でタイマー停止             | 停止後はcleanup()が呼ばれない         |
| 3   | Map.size >= MAX時にgenerate()で最古エントリ削除  | 最古のStateEntryが1件削除される       |
| 4   | 期限内StateEntryはcleanup()で削除されない        | 有効なエントリは保持される            |
| 5   | \_reset()でタイマーもクリア                      | スケジューラが完全に停止する          |

### 検証手順

#### 自動テスト検証

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop vitest run stateManager.test.ts

# カバレッジ確認
pnpm --filter @repo/desktop vitest run --coverage stateManager
```

#### 手動テスト検証

```bash
# アプリ起動
pnpm --filter @repo/desktop preview

# DevToolsのConsoleで確認:
# 1. ログインを開始→キャンセルを5回繰り返す
# 2. 5分後にConsoleで「Cleanup: removed X expired entries」ログを確認
# 3. stateManager._getMapSize() で残りエントリ数を確認
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                             |
| -------------------------------- | ------ | -------- | ---------------------------------------------------------------- |
| setInterval精度問題              | Low    | Low      | Electronメインプロセスでは十分な精度が得られる                   |
| テスト不安定化（タイマーモック） | Medium | Medium   | `vi.useFakeTimers()`でタイマーをモック、`Date.now()`ベースで検証 |
| PKCEManager統合時の設計衝突      | Low    | Medium   | 共通インターフェース（`Cleanable`）を検討                        |
| 既存テストへの影響               | Low    | Low      | 新規テストは既存テストと独立した`describe`ブロックで分離         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/csrf-state-parameter.md` - StateManager API仕様・型定義・セキュリティ設計根拠
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` - 認証セキュリティアーキテクチャ全体
- `.claude/skills/aiworkflow-requirements/references/patterns.md` - 実行パターン集（成功/失敗パターン）
- `docs/30-workflows/unassigned-task/task-auth-pkce-implementation.md` - DEBT-SEC-002（PKCEManager実装時に同様のcleanupが必要）
- `apps/desktop/src/main/infrastructure/stateManager.ts` - 正本ソースコード
- `apps/desktop/src/main/infrastructure/__tests__/stateManager.test.ts` - 既存テスト（21件）

### 参考資料

- [RFC 6749 Section 10.12](https://datatracker.ietf.org/doc/html/rfc6749#section-10.12) - State Parameter CSRF Prevention
- [Node.js Timers API](https://nodejs.org/api/timers.html) - setInterval / clearInterval

---

## 9. 備考

### DEBT-SEC-001実装の苦戦箇所（詳細）

以下は DEBT-SEC-001（State Parameter CSRF防御）実装時に発見された課題の詳細記録。同じパターンの課題を回避するために参照すること。

#### 1. consumeState設計の乖離

| 項目     | 内容                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| 問題     | 設計書では`validate(state, provider)`を想定していたが、Implicit FlowのコールバックURLにプロバイダー情報が含まれない |
| 根本原因 | Implicit Flow APIの境界条件を設計段階で検証不足                                                                     |
| 解決     | `consumeState(state)`をプロバイダー検証なしの簡易版として追加実装                                                   |
| 教訓     | OAuth仕様の制約は**設計Phase（Phase 2）でコールバックURLのサンプルを実際に確認すべき**                              |

#### 2. Phase 12ドキュメント更新漏れ

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| 問題     | 初回Phase 12実行で9ファイルの更新漏れが発生                                               |
| 根本原因 | 正本（references/）と派生（docs/）の2階層に同じ情報が存在することの認識不足               |
| 解決     | 多角的品質レビュー（コード・ドキュメント・仕様対照の3エージェント並列）で検出・修正       |
| 教訓     | `grep -rn "KEYWORD" references/ docs/` で両階層を検索。06-known-pitfalls.mdを開始前に確認 |

#### 3. Implicit Flow固有の制約

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 問題     | パラメータがURLフラグメント(#)に含まれ、`url.search`では取得不可 |
| 根本原因 | OAuth Implicit Flowの仕様動作（`url.hash`にトークンを含む）      |
| 解決     | `url.hash.slice(1)`でパース                                      |
| 教訓     | PKCE実装（DEBT-SEC-002）時に`url.search(?)`への切り替えが必要    |

### 補足事項

- 本タスクは小規模であり、DEBT-SEC-002（PKCE実装）と同時に実施可能
- PKCEManager実装時にも同様のcleanupが必要になるため、共通インターフェース（`Cleanable`）の検討を推奨
- StateEntryは約200bytes/entryと軽量なため、実用上のメモリ影響は極めて小さいが、防御的コーディングとして実装する価値がある
- DEBT-SEC-002実装時に本タスクを統合して実施することも選択肢の一つ
