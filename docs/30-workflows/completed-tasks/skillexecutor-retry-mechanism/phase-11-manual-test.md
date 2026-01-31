# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 11                             |
| Phase名   | 手動テスト検証                 |
| カテゴリ  | 検証                           |
| 機能名    | skillexecutor-retry-mechanism  |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 10（最終レビューゲート） |
| 後続Phase | Phase 12（ドキュメント更新）   |

## 目的

開発環境でリトライ機構の動作を手動で検証し、自動テストでは確認困難な挙動を確認する。

---

## 実行タスク

### Task 1: リトライ動作の基本検証

**目的**: リトライ機構が開発環境で正しく動作することを確認する。

**手順**:

1. 開発環境でElectronアプリを起動する:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. スキル実行を行い、正常完了を確認する
3. ネットワーク障害をシミュレートする方法を検討する:
   - query() APIのモックによるエラー注入
   - 開発用の`forceRetryError`フラグの一時追加
4. リトライ動作が発生することを確認する:
   - コンソールログでリトライ試行が記録されること
   - リトライ後に正常完了すること

**期待される成果物**:

- 手動テスト結果レポート（`outputs/phase-11/manual-test-results.md`）

### Task 2: abort()連携の手動検証

**目的**: リトライ中のabort()が正しく動作することを手動で確認する。

**手順**:

1. リトライが発生する状況を作成する
2. リトライ待機中にabort()を呼び出す
3. 以下を確認する:
   - リトライが即座に中止されること
   - 実行状態が'aborted'になること
   - UIにエラーが表示されること（表示がある場合）

**期待される成果物**:

- abort連携テスト結果（手動テスト結果レポートに含む）

### Task 3: ストリーミングイベントの受信確認

**目的**: retryストリーミングイベントがRenderer側で受信されることを確認する。

**手順**:

1. Renderer Process側のコンソールログを確認する
2. skill:streamチャネルでretryイベントが受信されることを確認する
3. イベントの内容（attempt, maxRetries, delayMs, errorType）が正しいことを確認する

**期待される成果物**:

- ストリーミング確認結果（手動テスト結果レポートに含む）

### Task 4: 手動テスト結果の記録

**目的**: 手動テストの結果を記録し、発見事項を整理する。

**手順**:

1. テスト結果を以下の形式で記録する:
   | テスト項目 | 結果 | 備考 |
   | ---------- | ---- | ---- |
   | 基本リトライ動作 | PASS/FAIL | |
   | abort連携 | PASS/FAIL | |
   | ストリーミングイベント | PASS/FAIL | |
2. 発見事項（スコープ外の改善提案を含む）を記録する
3. スコープ外の発見事項はPhase 12の未タスク検出に引き継ぐ

**期待される成果物**:

- 手動テスト結果レポート（`outputs/phase-11/manual-test-results.md`）

---

## 参照資料

| 参照資料          | パス                                                                | 用途     |
| ----------------- | ------------------------------------------------------------------- | -------- |
| Phase 10判定結果  | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-10/` | 判定参照 |
| SkillExecutor実装 | `apps/desktop/src/main/services/skill/SkillExecutor.ts`             | 動作確認 |

---

## 統合テスト連携

開発環境でネットワーク障害シミュレーション実行:

- モックによるエラー注入でリトライ動作を確認
- 実際のIPC通信経由でのストリーミングイベント受信確認

---

## 成果物

| 成果物                 | パス                                      | 種別     |
| ---------------------- | ----------------------------------------- | -------- |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-results.md` | document |

---

## 完了条件

- [ ] 基本リトライ動作が開発環境で確認されている
- [ ] abort()連携が手動で確認されている
- [ ] ストリーミングイベントの受信が確認されている
- [ ] テスト結果が記録されている
- [ ] 発見事項（スコープ外含む）が記録されている
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 11 \
  --artifacts "outputs/phase-11/manual-test-results.md:手動テスト結果レポート"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 11
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
