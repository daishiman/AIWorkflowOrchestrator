# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 6                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-08                         |

## 目的

Phase 5の実装に対してテストカバレッジを拡充し、品質基準（Line 80%+, Branch 60%+, Function 80%+）を満たす。

## 参照資料

| 資料名                 | パス                                     | 説明                                  |
| ---------------------- | ---------------------------------------- | ------------------------------------- |
| テスト結果（Green）    | `outputs/phase-5/test-green-result.md`   | Phase 5成果物                         |
| 統一API設計書          | `outputs/phase-2/unified-api-design.md`  | Phase 2成果物                         |
| Zustandモックパターン  | `testing-component-patterns.md` 行18-79  | ストアモック3パターン（テスト拡充用） |
| テストデータファクトリ | `testing-component-patterns.md` 行83-149 | SkillMetadata/StreamMessageファクトリ |

## カバレッジ目標

| 指標     | 最低基準 | 推奨基準 |
| -------- | -------- | -------- |
| Line     | 80%      | 90%      |
| Branch   | 60%      | 70%      |
| Function | 80%      | 90%      |

## 実行タスク

### Task 1: 境界値・異常系テスト追加

#### 目的

APIメソッドの境界値と異常系を網羅的にテストする。

#### テストケース

| テストケース                                | 入力                | 期待結果                   |
| ------------------------------------------- | ------------------- | -------------------------- |
| `list()` がIPCエラー時                      | IPC通信失敗         | エラーthrow                |
| `execute()` に空のskillNameを渡す           | `{ skillName: "" }` | バリデーションエラー       |
| `execute()` にundefinedを渡す               | undefined           | TypeScriptコンパイルエラー |
| `import()` に空配列を渡す                   | `[]`                | 正常完了（no-op）          |
| `import()` に重複IDを渡す                   | `["id1", "id1"]`    | 重複無視または警告         |
| `abort()` に空文字列executionIdを渡す       | `""`                | `false` 返却               |
| `abort()` に存在しないexecutionIdを渡す     | `"invalid-id"`      | `false` 返却               |
| `onStream()` のコールバックがnull           | 不正引数            | エラーthrow or 無視        |
| `sendPermissionResponse()` に不正レスポンス | 型不一致            | TypeScriptコンパイルエラー |
| `getExecutionStatus()` に空文字列を渡す     | `""`                | `null` 返却                |

### Task 2: イベントリスナーのライフサイクルテスト

#### 目的

イベントリスナーの登録・解除・再登録が正しく動作することをテストする。

#### テストケース

| テストケース                                     | 期待結果               |
| ------------------------------------------------ | ---------------------- |
| `onStream()` で登録→unsubscribe→再度イベント発生 | コールバック呼ばれない |
| `onComplete()` 複数登録→unsubscribe 1つ          | 残りのみ呼ばれる       |
| `onError()` 登録なし状態でエラー発生             | クラッシュしない       |
| `onPermissionRequest()` 登録→unsubscribe         | クリーンアップ完了     |
| 同一コールバック関数の二重登録防止               | 1回のみ呼ばれる        |
| unsubscribe関数の二重呼び出し                    | エラーなし（冪等性）   |

### Task 3: 統合テスト（Preload→IPC呼び出し）

#### 目的

全APIメソッドが正しいIPCチャンネルを呼び出すことをテストする。

#### テストケース

| テストケース                                        | 検証内容                             |
| --------------------------------------------------- | ------------------------------------ |
| `list()` が正しいIPCチャンネルを呼ぶ                | `SKILL_CHANNELS.LIST_AVAILABLE`      |
| `getImported()` が正しいIPCチャンネルを呼ぶ         | `SKILL_CHANNELS.GET_IMPORTED`        |
| `execute()` が正しいIPCチャンネルを呼ぶ             | `SKILL_CHANNELS.EXECUTE`             |
| `import()` が正しいIPCチャンネルを呼ぶ              | `SKILL_CHANNELS.IMPORT`              |
| `remove()` が正しいIPCチャンネルを呼ぶ              | `SKILL_CHANNELS.REMOVE`              |
| `abort()` が正しいIPCチャンネルを呼ぶ               | `SKILL_CHANNELS.ABORT`               |
| `rescan()` が正しいIPCチャンネルを呼ぶ              | `SKILL_CHANNELS.RESCAN`              |
| `getExecutionStatus()` が正しいIPCチャンネルを呼ぶ  | `SKILL_CHANNELS.GET_STATUS`          |
| `sendPermissionResponse()` が正しいチャンネルを呼ぶ | `SKILL_CHANNELS.PERMISSION_RESPONSE` |

### Task 4: 呼び出し元コンポーネントのテスト

#### 目的

移行後の呼び出し元コンポーネントが正しく新APIを使用することをテストする。

#### 対象コンポーネント

| コンポーネント     | テスト観点                                        |
| ------------------ | ------------------------------------------------- |
| AgentView          | `window.electronAPI.skill` 経由での実行           |
| ChatPanel          | スキル実行・ストリーミング表示                    |
| useSkillExecution  | execute→onStream→onComplete フロー                |
| useSkillPermission | onPermissionRequest→sendPermissionResponse フロー |
| skillSlice         | 状態更新の整合性                                  |

### Task 5: エラーハンドリングテスト

#### 目的

各エラーケースで適切なエラーがthrowまたは返却されることをテストする。

#### テストケース

| エラー種別           | 発生条件                 | 期待動作                      |
| -------------------- | ------------------------ | ----------------------------- |
| IPC通信エラー        | Main Processが応答しない | Errorがthrowされる            |
| スキル実行エラー     | スキル内部でエラー発生   | onErrorコールバックが呼ばれる |
| 権限拒否エラー       | ユーザーが権限を拒否     | 適切なエラーコードで通知      |
| タイムアウトエラー   | 実行が制限時間を超過     | abort処理が実行される         |
| バリデーションエラー | 不正な引数を渡す         | Errorがthrowされる            |

## Electronデスクトップアプリ観点

| 層       | テスト拡充の考慮事項                                  |
| -------- | ----------------------------------------------------- |
| Preload  | `safeInvoke`/`safeOn`のチャンネル検証テスト追加       |
| Renderer | `window.electronAPI.skill` モックの正確性検証         |
| IPC通信  | `SKILL_CHANNELS` 定数との一致を全メソッドで網羅テスト |

## 統合テスト連携【必須】

```bash
# テスト実行
pnpm --filter @repo/desktop test

# カバレッジ計測
pnpm --filter @repo/desktop test:coverage
```

### カバレッジ判定

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | カバレッジ分析結果 |
| 追加テストファイル | `apps/desktop/src/preload/__tests__/` | 拡充テストコード   |

## 完了条件

- [ ] 境界値・異常系テスト（10ケース以上）が追加されている
- [ ] イベントリスナーライフサイクルテスト（6ケース以上）が追加されている
- [ ] IPCチャンネル統合テスト（9ケース以上）が追加されている
- [ ] 呼び出し元コンポーネントテスト（5コンポーネント以上）が更新されている
- [ ] エラーハンドリングテスト（5ケース以上）が追加されている
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たしている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
