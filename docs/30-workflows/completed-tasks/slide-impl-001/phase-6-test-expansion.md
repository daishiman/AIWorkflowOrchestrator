# Phase 6: テスト拡充

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 6              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

Phase 5 の実装に対して、エッジケース・境界値・異常系のテストを追加し、カバレッジを向上させる。

## 実行タスク

### Task 1: ModifierResponse パースの境界値テスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/modifier-skill.test.ts`

| テストID | テスト内容                                                   |
| -------- | ------------------------------------------------------------ |
| E1-1     | `fallback_reason` が空文字列の場合、空文字列として保持される |
| E1-2     | `suggested_action` が非常に長い文字列（10000文字）の場合     |
| E1-3     | `fallback_reason` が `null` の場合 `undefined` になる        |
| E1-4     | `fallback_reason` が配列の場合 `undefined` になる            |
| E1-5     | JSON に未知のフィールドが追加されている場合（将来拡張耐性）  |

### Task 2: IPC handler のエッジケーステスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`

| テストID | テスト内容                                                          | 期待結果                           |
| -------- | ------------------------------------------------------------------- | ---------------------------------- |
| E2-1     | `sessionId` に特殊文字（`../`, `\0`, `%2F`）が含まれる場合          |                                    |
| E2-2     | `sessionId` が非常に長い文字列（10000文字）の場合                   |                                    |
| E2-3     | `sessionId` の前後にスペースがある場合（trim されて処理される）     |                                    |
| E2-4     | `resolveSlideCapability` が例外をスローした場合のエラーハンドリング |                                    |
| E2-5     | IPC sender 検証が失敗した場合の拒否動作                             |                                    |
| E2-6     | 同時に複数のリクエストが送信された場合の競合テスト                  |                                    |
| E2-7     | `resolveSlideCapability` タイムアウト                               | タイムアウト設定値で応答が返ること |

### Task 3: Agent SDK adapter のエッジケーステスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`

| テストID | テスト内容                                             |
| -------- | ------------------------------------------------------ |
| E3-1     | `authKeyService.getKey()` が例外をスローする場合       |
| E3-2     | `runtimeResolver` が `manual` を返した場合の lane 分岐 |
| E3-3     | adapter 初期化後に API key がローテーションされた場合  |
| E3-4     | `abort()` 呼び出し後の `query()` 呼び出し              |
| E3-5     | `onMessage` コールバックで例外が発生した場合           |

### Task 4: 状態遷移契約の検証テスト

対象ファイル: `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`（または新規ファイル）

| テストID | テスト内容                                 |
| -------- | ------------------------------------------ |
| E4-1     | synced → running 遷移が許可される          |
| E4-2     | running → degraded 遷移が許可される        |
| E4-3     | synced → degraded 遷移が **禁止** される   |
| E4-4     | guidance → degraded 遷移が **禁止** される |
| E4-5     | degraded → running 遷移が **禁止** される  |

## 参照資料

| 資料名       | パス                        | 内容         |
| ------------ | --------------------------- | ------------ |
| Phase 2 設計 | `phase-2-design.md`         | 状態遷移契約 |
| Phase 5 実装 | `phase-5-implementation.md` | 実装詳細     |

## 統合テスト連携

- Phase 6 で追加したテストを含む全テストが PASS することを確認。

```bash
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/ --reporter verbose
```

## 成果物

| 成果物       | パス                                                           | 説明                   |
| ------------ | -------------------------------------------------------------- | ---------------------- |
| テストコード | `apps/desktop/src/main/slide/__tests__/modifier-skill.test.ts` | エッジケーステスト追加 |
| テストコード | `apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts`   | 境界値・競合テスト追加 |
| テストコード | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`   | 異常系テスト追加       |

## 完了条件

- [x] ModifierResponse パース境界値テスト（5ケース）が追加されている
- [x] IPC handler エッジケーステスト（7ケース）が追加されている
- [x] Agent SDK adapter エッジケーステスト（5ケース）が追加されている
- [x] 状態遷移契約テスト（5ケース）が追加されている
- [x] 全テストが PASS
- [x] 統合テスト（IPC end-to-end）の継続成功を確認した
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 7: カバレッジ確認
