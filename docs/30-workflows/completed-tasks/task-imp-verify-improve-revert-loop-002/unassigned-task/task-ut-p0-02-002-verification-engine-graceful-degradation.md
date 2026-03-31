# task-ut-p0-02-002-verification-engine-graceful-degradation - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | task-ut-p0-02-002-verification-engine-graceful-degradation   |
| タスク名     | verificationEngine 未DI時のヘルスチェック検出機能追加        |
| 分類         | 改善                                                         |
| 対象機能     | RuntimeSkillCreatorFacade.verifyAndImproveLoop() / DI設定    |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| GitHub Issue | #1774                                                        |
| 発見元       | TASK-P0-02 Phase 3 MR-02（Phase 5 で console.warn 追加済み） |
| 発見日       | 2026-03-30                                                   |

---

## Section 1: なぜこのタスクが必要か（Why）

### 背景

`RuntimeSkillCreatorFacade.verifyAndImproveLoop()` において、`verificationEngine` が DI（依存性注入）されていない場合、現状では `console.warn` によって設定ミスを通知するのみである。しかし、この通知はランタイムエラーが発生した後に初めてログに現れるため、**事前に設定ミスを検出する手段がない**。

### 問題点

- ランタイムエラー（`verifySkill()` 呼び出し時のエラー）が発生して初めて設定ミスに気づく構造になっている
- ヘルスチェック機能がないため、アプリ起動時や統合テスト時に DI 設定の正当性を能動的に確認できない
- 開発時のデバッグコストが高く、問題の根本原因特定に時間がかかる

### 放置した場合の影響

- 開発環境での DI 設定ミスが、生産コードのランタイムエラーとしてのみ表面化する
- `console.warn` が出力される状況（ログ確認不足・ターミナル非表示時）では設定ミスに全く気づけない
- 将来的に依存エンジンが増加した際、同様の問題が再発するリスクが高まる

---

## Section 2: 何を達成するか（What）

### 目的

`RuntimeSkillCreatorFacade` にヘルスチェックメソッドを追加し、`verificationEngine` の DI 状態をプログラムから事前検出できるようにする。

### 最終ゴール

- `checkHealth()` または同等のメソッドが `verificationEngine` の DI 状態（注入済み / 未注入）を返す
- 呼び出し元（アプリ起動処理・テスト・診断ツールなど）が DI 状態を検査できるようになる

### スコープ

**含むもの:**

- `checkHealth()` または `getDiStatus()` メソッドの定義・実装
- DI ステータスを表す型定義（例: `DiStatus`、`HealthStatus`）
- ユニットテストの追加（DI あり / DI なし の両ケース）

**含まないもの:**

- UI への DI ステータス反映（別タスクとして扱う）
- アプリランタイム起動時の自動ヘルスチェック実行（将来改善候補）
- 既存の `console.warn` の削除（後方互換性のため維持する）

---

## Section 3: どのように実行するか（How）

### 前提条件

- TASK-P0-02 Phase 1〜12 が完了済みであること
- `RuntimeSkillCreatorFacade.verifyAndImproveLoop()` の `console.warn` 実装（Phase 5 対応分）が存在すること

### 推奨アプローチ

1. **ステータス型の定義**
   - `DiStatus` または `HealthStatus` 型を設計する
   - 値例: `"ok"` / `"not-injected"` / `"degraded"` など

2. **`checkHealth()` メソッドの追加**
   - `RuntimeSkillCreatorFacade` クラスに `checkHealth()` メソッドを追加
   - `verificationEngine` が注入済みであれば `"ok"`、未注入であれば `"not-injected"` を含むステータスを返す
   - 他の依存エンジンの DI 状態も将来的に追加できるよう、拡張性を考慮した設計にする

3. **テストの追加**
   - DI あり（`verificationEngine` が設定済み）のケース: `healthStatus` に `"ok"` が含まれることを確認
   - DI なし（`verificationEngine` が `undefined`）のケース: `healthStatus` に `"not-injected"` が含まれることを確認

---

## Section 4: 実行手順

### Phase 1: 設計

- `checkHealth()` のメソッドシグネチャを決定する
  - 例: `checkHealth(): HealthCheckResult`
- `HealthCheckResult` / `DiStatus` 型を設計する
  - 例:

    ```typescript
    type DiStatus = "ok" | "not-injected";

    interface HealthCheckResult {
      verificationEngine: DiStatus;
      // 将来的な拡張例: improveEngine?: DiStatus;
    }
    ```

- 型定義ファイルの配置先を決定する（`RuntimeSkillCreatorFacade.ts` に同居 or 別ファイル）

### Phase 2: 実装

- `RuntimeSkillCreatorFacade` クラスに `checkHealth()` メソッドを追加する
- `verificationEngine` の DI 状態を検査し、`HealthCheckResult` を返す実装を行う
- 既存の `console.warn` はそのまま維持し、`checkHealth()` は独立したメソッドとして提供する

### Phase 3: テスト追加

- テストファイル（既存の `RuntimeSkillCreatorFacade.test.ts` または新規テストファイル）に以下を追加する:
  - `verificationEngine = undefined` 時: `checkHealth().verificationEngine === "not-injected"` を検証
  - `verificationEngine = 設定済みモック` 時: `checkHealth().verificationEngine === "ok"` を検証

---

## Section 5: 完了条件チェックリスト

### 機能要件

- [ ] `checkHealth()` または同等メソッドが `verificationEngine` の DI 状態を返す
- [ ] DI なし時に `DiStatus` に `"not-injected"` または同等の値が含まれる
- [ ] DI あり時に `DiStatus` に `"ok"` または同等の値が含まれる
- [ ] 既存の `console.warn` は維持されている（後方互換性確保）

### 品質要件

- [ ] 既存テスト 449件 全 PASS
- [ ] `verificationEngine` DI あり / なし の両ケースのテストが追加されている
- [ ] TypeScript 型チェック (`pnpm typecheck`) が通過する
- [ ] ESLint チェック (`pnpm lint`) が通過する

### ドキュメント要件

- [ ] `docs/30-workflows/task-imp-verify-improve-revert-loop-002/` の `implementation-guide.md` の API 一覧を更新（`checkHealth()` の追記）

---

## Section 6: 検証方法

### テストケース

| #   | テスト内容                                                              | 期待結果                                             |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| T-1 | `verificationEngine = undefined` で `checkHealth()` を呼び出す          | `healthStatus.verificationEngine === "not-injected"` |
| T-2 | `verificationEngine = モックオブジェクト` で `checkHealth()` を呼び出す | `healthStatus.verificationEngine === "ok"`           |

### 手動検証手順

1. `RuntimeSkillCreatorFacade` のインスタンスを `verificationEngine` なしで生成
2. `checkHealth()` を呼び出し、返り値を確認
3. `verificationEngine` を後から注入し、再度 `checkHealth()` を呼び出して結果が変化することを確認

---

## Section 7: リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                           |
| --------------------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| `console.warn` を削除することで後方互換性が失われる | 低     | 低       | `console.warn` は残し、`checkHealth()` を追加で提供する        |
| `HealthCheckResult` 型の設計が将来の拡張と競合する  | 低     | 中       | 拡張しやすいオブジェクト構造（フィールド追加で対応）を採用する |
| 既存テストの DI 設定と干渉する                      | 低     | 低       | `checkHealth()` は読み取り専用メソッドのため、副作用なし       |

---

## Section 8: 参照情報

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（`verifyAndImproveLoop` の `console.warn` 箇所）
- `docs/30-workflows/task-imp-verify-improve-revert-loop-002/outputs/phase-12/unassigned-task-detection.md`（MR-02 原文）
- `docs/30-workflows/task-imp-verify-improve-revert-loop-002/outputs/phase-3/design-review.md`（MR-02 発見元）

### 現在の実装（Phase 5 対応済み部分）

```typescript
// apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
async verifyAndImproveLoop(...) {
  if (!this.verificationEngine) {
    console.warn(
      "[RuntimeSkillCreatorFacade] verificationEngine が未設定のため、verify→improve ループをスキップします",
    );
  }
  // ループ処理...
}
```

---

## Section 9: 備考

### 苦戦箇所記録

| ID          | 苦戦箇所                                                                                                                             | 将来の解決指針                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| L-P0-02-002 | `verificationEngine` 未DI時、`console.warn` のみでは開発中のデバッグコストが高い。ランタイムエラーが発生するまで設定ミスに気づけない | `checkHealth()` を追加しアプリ起動時に DI 状態を事前検出できる設計が理想的 |

### 補足

- 本タスクは TASK-P0-02（`task-imp-verify-improve-revert-loop-002`）の Phase 3 MR-02 で発見された課題に基づく
- Phase 5 にて `console.warn` の追加対応が行われたが、ヘルスチェック機能の追加は将来改善候補として残存していた
- 優先度は低（`console.warn` で設定ミスを通知済み）であるが、開発体験・デバッグ効率の改善として価値がある
