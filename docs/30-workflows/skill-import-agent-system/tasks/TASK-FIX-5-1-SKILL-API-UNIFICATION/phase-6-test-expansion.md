# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 6                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

Phase 5の実装に対してテストカバレッジを拡充し、品質基準を満たす。

## 参照資料

| 資料名                 | パス                                     | 説明                                  |
| ---------------------- | ---------------------------------------- | ------------------------------------- |
| テスト結果（Green）    | `outputs/phase-5/test-green-result.md`   | Phase 5成果物                         |
| 統一API設計書          | `outputs/phase-2/unified-api-design.md`  | Phase 2成果物                         |
| Zustandモックパターン  | `testing-component-patterns.md` 行18-79  | ストアモック3パターン（テスト拡充用） |
| テストデータファクトリ | `testing-component-patterns.md` 行83-149 | SkillMetadata/StreamMessageファクトリ |

## 実行タスク

### Task 1: 境界値・異常系テスト追加

#### テストケース

| テストケース                                | 入力                | 期待結果                   |
| ------------------------------------------- | ------------------- | -------------------------- |
| `list()` がIPCエラー時                      | IPC通信失敗         | エラーthrow                |
| `execute()` に空のskillNameを渡す           | `{ skillName: "" }` | バリデーションエラー       |
| `import()` に空配列を渡す                   | `[]`                | 正常完了（no-op）          |
| `abort()` に空文字列executionIdを渡す       | `""`                | `false` 返却               |
| `onStream()` のコールバックがnull           | 不正引数            | エラーthrow or 無視        |
| `sendPermissionResponse()` に不正レスポンス | 型不一致            | TypeScriptコンパイルエラー |

### Task 2: イベントリスナーのライフサイクルテスト

#### テストケース

| テストケース                                     | 期待結果               |
| ------------------------------------------------ | ---------------------- |
| `onStream()` で登録→unsubscribe→再度イベント発生 | コールバック呼ばれない |
| `onComplete()` 複数登録→unsubscribe 1つ          | 残りのみ呼ばれる       |
| `onError()` 登録なし状態でエラー発生             | クラッシュしない       |
| `onPermissionRequest()` 登録→unsubscribe         | クリーンアップ完了     |

### Task 3: 統合テスト（Preload→IPC呼び出し）

#### テストケース

| テストケース                            | 検証内容                        |
| --------------------------------------- | ------------------------------- |
| `list()` が正しいIPCチャンネルを呼ぶ    | `SKILL_CHANNELS.LIST_AVAILABLE` |
| `execute()` が正しいIPCチャンネルを呼ぶ | `SKILL_CHANNELS.EXECUTE`        |
| `import()` が正しいIPCチャンネルを呼ぶ  | `SKILL_CHANNELS.IMPORT`         |
| `remove()` が正しいIPCチャンネルを呼ぶ  | `SKILL_CHANNELS.REMOVE`         |
| `abort()` が正しいIPCチャンネルを呼ぶ   | `SKILL_CHANNELS.ABORT`          |

## Electronデスクトップアプリ観点

| 層       | テスト拡充の考慮事項                                  |
| -------- | ----------------------------------------------------- |
| Preload  | `safeInvoke`/`safeOn`のチャンネル検証テスト追加       |
| Renderer | `window.electronAPI.skill` モックの正確性検証         |
| IPC通信  | `SKILL_CHANNELS` 定数との一致を全メソッドで網羅テスト |

## 統合テスト連携【必須】

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

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

- [ ] 境界値・異常系テスト（6ケース以上）が追加されている
- [ ] イベントリスナーライフサイクルテスト（4ケース以上）が追加されている
- [ ] IPCチャンネル統合テスト（5ケース以上）が追加されている
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たしている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
