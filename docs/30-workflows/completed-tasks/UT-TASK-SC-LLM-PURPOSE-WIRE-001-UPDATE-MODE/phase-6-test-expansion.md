# Phase 6: テスト拡充

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 6                                           |
| Phase名 | テスト拡充                                  |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 5                                           |
| 次Phase | 7                                           |
| 作成日  | 2026-04-19                                  |

## 目的

Phase 5 の Green 状態を維持しつつ、fail path・エラーハンドリング・回帰 guard を追加する。`update` / `improve-prompt` モードの異常系テストおよび progress emit 順序テストを追加し、実装の堅牢性を高める。

## 実行タスク

### T-6-1: AbortError 処理のテスト追加

`update` / `improve-prompt` モードそれぞれについて以下のテストケースを追加する。

- **テスト内容**: AbortController を用いて signal を abort した場合に、処理が中断されること
- **検証方法**:
  - `controller.abort()` を呼び出した後に `runCreateSkill` を呼ぶ、または処理途中で abort する
  - abort 後に後続の処理（スクリプト呼び出し、ファイル書き込み、次フェーズ進行）が実行されないことをアサートする
  - `AbortError` または処理の早期終了が発生することを確認する
- **対象モード**: `update` / `improve-prompt` の2モード分追加する

### T-6-2: progress emit 順序のテスト追加

`update` / `improve-prompt` モードで `emitProgress` が期待する順序で呼ばれることを検証するテストを追加する。

- **検証方法**:
  - `emitProgress` をスパイして呼び出し引数の順序を記録する
  - `expect(calls[0]).toMatchObject({ phase: "start" })` のように順序を検証する
- **対象モード**: `update` / `improve-prompt` の2モード分追加する

### T-6-3: create モード回帰テストの完全実行確認

- Phase 5 の実装変更後、`create` モードの既存テストが引き続き全件 Green であることを確認する
- `create` モードが `runUpdateWorkflow` / `runImprovePromptWorkflow` を誤って呼ばないことをアサートする

### T-6-4: テスト全件実行確認

```bash
pnpm --filter @repo/desktop test -- SkillCreatorService
```

- T-6-1 〜 T-6-3 で追加・確認したすべてのテストが Green であることを確認する
- 失敗がある場合は実装またはテストを修正する

## 参照資料

| 資料名             | パス                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| 対象サービス       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                             |
| 対象テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`              |
| Phase 5 仕様書     | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-5-implementation.md` |

## 成果物

| 成果物                        | 種別         | 説明                                                        |
| ----------------------------- | ------------ | ----------------------------------------------------------- |
| `SkillCreatorService.test.ts` | ファイル変更 | AbortError テスト・progress emit 順序テスト・回帰テスト追加 |

## 完了条件

- [ ] T-6-1: update / improve-prompt モードの AbortError 処理テストを追加した
- [ ] T-6-2: update / improve-prompt モードの progress emit 順序テストを追加した
- [ ] T-6-3: create モード回帰テストが全件 Green であることを確認した
- [ ] T-6-4: 全テストが Green であることを確認した

## Phase 末端アクション

- Phase 7（カバレッジ確認）へ移行する
- T-6-4 のテスト実行結果を成果物欄に記録する
