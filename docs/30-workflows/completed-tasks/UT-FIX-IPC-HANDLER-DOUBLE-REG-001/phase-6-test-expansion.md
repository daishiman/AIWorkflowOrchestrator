# Phase 6: テスト拡充 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 6                                 |
| Phase名      | テスト拡充                        |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 前提Phase    | Phase 5（実装 / TDD Green）       |
| 後続Phase    | Phase 7（カバレッジ確認）         |
| ステータス   | 未実施                            |
| 作成日       | 2026-02-14                        |

---

## 目的

Phase 5 の実装で Green になったテストに加え、カバレッジ不足箇所・エッジケース・境界値のテストを追加し、カバレッジ基準（Line 80% 以上、Branch 60% 以上、Function 80% 以上）の達成を目指す。

## 背景

Phase 4 で作成した8件のコアテスト（TC-01 ~ TC-08）はバグの核心部分のみをカバーしている。以下の観点が不足しているため、テストを拡充する:

- ウィンドウ不在時の activate イベント処理
- unregister → re-register の連続実行（3回以上の繰り返し）
- Supabase 設定の有無による条件分岐パス
- 各ハンドラカテゴリごとの個別解除検証
- mainWindow 参照の更新が全ハンドラに正しく伝搬されることの検証

---

## 実行タスク

- タスク実行: 本Phaseで定義したタスクを上から順に実行し、結果を成果物に記録する。

### タスク 1: エッジケーステスト追加

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`（既存ファイルに追加）

| TC-ID | テストケース名                                              | テスト内容                                                                                               |
| ----- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| TC-09 | ウィンドウが1つ以上ある状態で activate が発火しても影響なし | `BrowserWindow.getAllWindows().length > 0` の場合、unregister/re-register が実行されないこと             |
| TC-10 | unregisterAllIpcHandlers を登録前に呼び出しても例外なし     | ハンドラ未登録状態で `unregisterAllIpcHandlers()` を呼んでも `removeHandler` が例外を送出しないこと      |
| TC-11 | 3回連続の register → unregister → register サイクル         | 3回以上の繰り返しでも正常動作すること（蓄積的な副作用がないこと）                                        |
| TC-12 | window-all-closed 後に activate が発火するシナリオ          | macOS 以外（`process.platform !== 'darwin'`）では `app.quit()` が呼ばれ、activate は発火しないことを検証 |

### タスク 2: Supabase 条件分岐テスト追加

`registerAllIpcHandlers` 内で `getSupabaseClient()` の戻り値により分岐するパスを検証する。

| TC-ID | テストケース名                                              | テスト内容                                                                                     |
| ----- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| TC-13 | Supabase 設定済みパスの登録・解除                           | `getSupabaseClient()` が truthy を返す場合、auth/profile/avatar ハンドラが登録・解除されること |
| TC-14 | Supabase 未設定パスの登録・解除                             | `getSupabaseClient()` が null を返す場合、fallback ハンドラが登録・解除されること              |
| TC-15 | Supabase 設定状態変更時の再登録でハンドラが正しく切り替わる | unregister → Supabase 状態変更 → re-register でハンドラが正しく更新されること                  |

### タスク 3: ハンドラカテゴリ別の個別解除検証

各ハンドラカテゴリが `unregisterAllIpcHandlers()` で確実に解除されることを個別に検証する。

| TC-ID | テストケース名                                | テスト内容                                                                |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------- |
| TC-16 | File/Store/Dashboard/Graph ハンドラの解除確認 | ウィンドウ参照不要グループの全チャンネルが removeHandler で解除されること |
| TC-17 | Window/Dialog/Auth ハンドラの解除確認         | ウィンドウ参照必要グループの全チャンネルが removeHandler で解除されること |
| TC-18 | Skill/Agent/Permission ハンドラの解除確認     | 既存 unregister 関数を持つモジュールの解除が呼ばれること                  |
| TC-19 | themeWatcher リスナーの解除確認               | `nativeTheme` の `updated` リスナーが解除されること                       |
| TC-20 | Auth fallback ハンドラの解除確認              | Supabase 未設定時の fallback ハンドラ（5チャンネル）が解除されること      |

### タスク 4: mainWindow 参照更新検証

再登録後のハンドラが新しい `mainWindow` 参照を正しく受け取っていることを検証する。

| TC-ID | テストケース名                                             | テスト内容                                                                                |
| ----- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| TC-21 | 全 mainWindow 依存ハンドラが新ウィンドウ参照で再登録される | registerWindowHandlers, registerDialogHandlers 等が新しい mainWindow を引数に受け取ること |
| TC-22 | 古い mainWindow 参照が解放される                           | unregister 後、旧ウィンドウへの参照を保持するクロージャが存在しないこと                   |
| TC-23 | mainWindow が null の状態で unregister を呼んでも安全      | mainWindowRef が null の状態で unregisterAllIpcHandlers() を呼んでも例外が発生しないこと  |

### タスク 5: 既存テストとの統合確認

Phase 5 で修正した `ipc/index.ts` と `main/index.ts` が既存テストに影響を与えていないことを確認する。

**実行コマンド**:

```bash
# IPC ハンドラテスト全体
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/

# Main Process 関連テスト
cd apps/desktop && pnpm vitest run src/main/
```

---

## 参照資料

| 資料名                 | パス                                                                            | 説明                            |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件定義       | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-1-requirements.md`   | 受入基準 AC-1 ~ AC-5            |
| Phase 5 実装           | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-5-implementation.md` | 修正済み実装の検証対象          |
| Phase 4 テストファイル | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`           | 既存テストケース TC-01 ~ TC-08  |
| IPC 登録集約（修正済） | `apps/desktop/src/main/ipc/index.ts`                                            | unregisterAllIpcHandlers 関数   |
| IPC チャネル定義       | `apps/desktop/src/preload/channels.ts`                                          | 全チャンネル定数定義（171箇所） |
| 既知の落とし穴 P9      | `.claude/rules/06-known-pitfalls.md#P9`                                         | テスト間の状態リーク防止        |
| 既知の落とし穴 P40     | `.claude/rules/06-known-pitfalls.md#P40`                                        | テスト実行ディレクトリ依存      |

---

## 実行手順

1. Phase 5 のテストが全て Green であることを確認する
2. `ipc-double-registration.test.ts` にタスク 1（TC-09 ~ TC-12）のエッジケーステストを追加する
3. タスク 2（TC-13 ~ TC-15）の Supabase 条件分岐テストを追加する
4. タスク 3（TC-16 ~ TC-20）のハンドラカテゴリ別解除テストを追加する
5. タスク 4（TC-21 ~ TC-23）の mainWindow 参照更新テストを追加する
6. 追加したテストを実行し、全て Green であることを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
   ```
7. タスク 5: 既存テスト全体に影響がないことを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/
   ```
8. カバレッジレポートを生成し、基準達成状況を確認する:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/main/ipc/index.ts
   ```
9. カバレッジ基準未達の場合、不足箇所を特定し追加テストを作成する

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物                     | パス                                                                  | 説明                      |
| -------------------------- | --------------------------------------------------------------------- | ------------------------- |
| テストファイル（拡充済み） | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | 23ケース（TC-01 ~ TC-23） |

---

## 完了条件

- [ ] TC-09 ~ TC-23 の全テストケースが実装されている
- [ ] エッジケース（ウィンドウ不在、未登録状態での unregister、3回以上の繰り返し）がカバーされている
- [ ] Supabase 設定有無の両パスがテストされている
- [ ] 各ハンドラカテゴリの個別解除が検証されている
- [ ] mainWindow 参照更新が全依存ハンドラで検証されている
- [ ] テスト間で状態がリークしていない（P9 対策: `beforeEach` で全モックがリセットされている）
- [ ] 全テスト（TC-01 ~ TC-23）が Green（成功）状態である
- [ ] 既存テスト（`apps/desktop/src/main/ipc/__tests__/` 配下の全テスト）が PASS する
- [ ] テスト実行が `cd apps/desktop && pnpm vitest run` で行われている（P40 対策）
- [ ] カバレッジレポートが生成され、以下の基準を確認済み:
  - Line Coverage: 80% 以上
  - Branch Coverage: 60% 以上
  - Function Coverage: 80% 以上
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 7: カバレッジ確認
