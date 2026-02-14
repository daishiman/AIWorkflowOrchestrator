# Phase 7: カバレッジ確認 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 7                                 |
| Phase名      | カバレッジ確認                    |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 前提Phase    | Phase 6（テスト拡充）             |
| 後続Phase    | Phase 8（リファクタリング）       |
| ステータス   | 未実施                            |
| 作成日       | 2026-02-14                        |

---

## 目的

Phase 6 で拡充したテストによるカバレッジが基準値を達成しているかを確認する。未達の場合は Phase 6 に戻り、不足箇所のテストを追加する。

## 背景

修正対象ファイルは `apps/desktop/src/main/ipc/index.ts` と `apps/desktop/src/main/index.ts` の2ファイルである。これらのファイルに対するテストカバレッジを計測し、プロジェクトで定められた品質基準を満たすことを確認する。

---

## 実行タスク

### タスク 1: カバレッジレポートの生成

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/ipc-double-registration.test.ts
```

**カバレッジ対象ファイル**:

| ファイル                             | 修正内容                          |
| ------------------------------------ | --------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` | unregisterAllIpcHandlers 関数追加 |
| `apps/desktop/src/main/index.ts`     | activate イベントハンドラ修正     |

### タスク 2: カバレッジ基準との照合

以下の基準値と実測値を比較する。

**カバレッジ基準テーブル**:

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                         |
| ----------------- | -------- | -------- | ------------------------------------ |
| Line Coverage     | 80%      | 90%      | `apps/desktop/src/main/ipc/index.ts` |
| Branch Coverage   | 60%      | 70%      | `apps/desktop/src/main/ipc/index.ts` |
| Function Coverage | 80%      | 90%      | `apps/desktop/src/main/ipc/index.ts` |

**計測結果記録テーブル（Phase 実行時に記入）**:

| 指標              | 最低基準 | 推奨基準 | 実測値 | 判定   |
| ----------------- | -------- | -------- | ------ | ------ |
| Line Coverage     | 80%      | 90%      | -      | 未計測 |
| Branch Coverage   | 60%      | 70%      | -      | 未計測 |
| Function Coverage | 80%      | 90%      | -      | 未計測 |

### タスク 3: カバレッジ不足箇所の特定

カバレッジレポートを分析し、未カバーの行・分岐・関数を特定する。

**想定される未カバー箇所**:

| 箇所                                           | 理由                                                 | 対応方針                |
| ---------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| `registerAllIpcHandlers` 内の Supabase 分岐    | getSupabaseClient の戻り値による条件分岐             | TC-13, TC-14 で対応済み |
| `registerAuthFallbackHandlers` 関数            | Supabase 未設定時のみ実行されるパス                  | TC-14, TC-20 で対応済み |
| 各ハンドラ登録関数の内部処理                   | 個別のハンドラテストでカバー（本テストのスコープ外） | スコープ外として除外    |
| `main/index.ts` の activate 以外のイベント処理 | createWindow, CSP 設定等は本バグ修正のスコープ外     | スコープ外として除外    |

### タスク 4: ゲート判定

**判定基準**:

| 判定 | 条件                                                               | アクション     |
| ---- | ------------------------------------------------------------------ | -------------- |
| PASS | 全カバレッジ指標が最低基準（Line 80%, Branch 60%, Func 80%）を達成 | Phase 8 へ進む |
| 未達 | いずれかの指標が最低基準を下回る                                   | Phase 6 に戻る |

**Phase 6 への差し戻し条件**:

- Line Coverage が 80% 未満の場合: 未カバーの行を特定し、該当パスを通るテストケースを追加
- Branch Coverage が 60% 未満の場合: 未カバーの分岐条件を特定し、条件の真偽両方をテスト
- Function Coverage が 80% 未満の場合: 未呼び出しの関数を特定し、該当関数を呼び出すテストを追加

---

## 参照資料

| 資料名                  | パス                                                                            | 説明                     |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 実装            | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-5-implementation.md` | カバレッジ対象の実装基準 |
| Phase 6 テストファイル  | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`           | 23ケースの拡充済みテスト |
| IPC 登録集約（修正済）  | `apps/desktop/src/main/ipc/index.ts`                                            | カバレッジ計測対象       |
| Main エントリ（修正済） | `apps/desktop/src/main/index.ts`                                                | カバレッジ計測対象       |
| コード品質ルール        | `.claude/rules/02-code-quality.md`                                              | カバレッジ基準定義       |

---

## 実行手順

1. カバレッジレポートを生成する:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/ipc-double-registration.test.ts
   ```
2. カバレッジレポートの Line / Branch / Function Coverage を確認する
3. 計測結果記録テーブルに実測値を記入する
4. 各指標を最低基準と比較する
5. 全指標が最低基準を達成している場合: PASS 判定 → Phase 8 へ進む
6. いずれかの指標が未達の場合: 未カバー箇所を特定し、Phase 6 に差し戻す
7. カバレッジレポートを `outputs/phase-7/coverage-report.md` に保存する

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物             | パス                                 | 説明                         |
| ------------------ | ------------------------------------ | ---------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ計測結果と判定記録 |

---

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] `apps/desktop/src/main/ipc/index.ts` の Line Coverage が 80% 以上
- [ ] `apps/desktop/src/main/ipc/index.ts` の Branch Coverage が 60% 以上
- [ ] `apps/desktop/src/main/ipc/index.ts` の Function Coverage が 80% 以上
- [ ] 未達の場合は未カバー箇所が特定され、Phase 6 への差し戻しが判断されている
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に保存されている
- [ ] ゲート判定（PASS / 未達）が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

- **PASS の場合**: Phase 8（リファクタリング）
- **未達の場合**: Phase 6（テスト拡充）に戻る
