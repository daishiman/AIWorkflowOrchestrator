# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

ManifestLoader 関連テストのカバレッジを確認し、本タスクで配置した `workflow-manifest.json` に対するテストが十分な網羅性を持つことを検証する。本タスクは JSON ファイル配置が主であるため、コードカバレッジの対象範囲は `ManifestLoader.ts` に限定する。

## 実行タスク

### タスク 7-1: ManifestLoader.production-manifest テスト結果の確認

- `pnpm --filter @repo/desktop test ManifestLoader.production-manifest` を実行し、全 17 ケース（TC-01〜RC-03）が PASS することを確認する
- FAIL がある場合は原因を特定し、Phase 5（実装）または Phase 6（テスト拡充）へのフィードバック要否を判断する

### タスク 7-2: ManifestLoader.test.ts 全テスト結果の確認

- `pnpm --filter @repo/desktop test ManifestLoader` を実行し、ManifestLoader 関連の全テストが PASS することを確認する
- production-manifest テスト以外のテスト（単体テスト・フィクスチャテスト）も含めてリグレッションがないことを検証する

### タスク 7-3: カバレッジ計測

- カバレッジ計測コマンドを実行し、`ManifestLoader.ts` のカバレッジを取得する

```bash
pnpm --filter @repo/desktop test ManifestLoader --coverage
```

- 対象ファイル: `apps/desktop/src/main/services/runtime/ManifestLoader.ts`
- 計測メトリクス: Line / Branch / Function

### タスク 7-4: 変更関数・ブロックのカバレッジ実測値記録 [Feedback 5]

- 本タスクはコード変更なし（JSON 配置のみ）のため、ManifestLoader.ts の既存関数全体のカバレッジを記録する
- 特に以下の関数・ブロックの line/branch カバレッジ実測値を証跡として残す:
  - `loadManifest()` — manifest 読み込みのエントリポイント
  - `assertTopLevelFields()` — トップレベルフィールド検証
  - `assertPhaseReferences()` — phase 参照・dependsOn 検証
  - `assertResourcePhaseReferences()` — phase ↔ resource 双方向参照検証
  - `assertEntryExitHooks()` — entry/exit hook 参照検証
  - `assertResourcePaths()` — resource path 実在検証

### カバレッジ記録テンプレート

| 関数/ブロック                   | Line (%) | Branch (%) | Function (%) | 備考 |
| ------------------------------- | -------- | ---------- | ------------ | ---- |
| loadManifest()                  | -        | -          | -            | -    |
| assertTopLevelFields()          | -        | -          | -            | -    |
| assertPhaseReferences()         | -        | -          | -            | -    |
| assertResourcePhaseReferences() | -        | -          | -            | -    |
| assertEntryExitHooks()          | -        | -          | -            | -    |
| assertResourcePaths()           | -        | -          | -            | -    |
| **ManifestLoader.ts 全体**      | -        | -          | -            | -    |

## 統合テスト連携

### ユニットテスト基準

| メトリクス | 目標値 | 備考                                 |
| ---------- | ------ | ------------------------------------ |
| Line       | 80%+   | ManifestLoader.ts のみ対象           |
| Branch     | 70%+   | 条件分岐（検証ステップ 12 個）の網羅 |
| Function   | 90%+   | 全 public メソッドのカバー           |

### テストケース対応表

| テストケース | 検証内容                     | カバーする検証ステップ |
| ------------ | ---------------------------- | ---------------------- |
| TC-01        | loadManifest() 成功          | 1-12                   |
| TC-02        | schemaVersion === 1          | 2                      |
| TC-03        | resource absolutePath 実在   | 12                     |
| TC-04        | phases 5 件・正しい順序      | 7, 11                  |
| TC-05        | entry/exit hooks 定義あり    | 4, 5                   |
| TC-06        | entryHookId → entry[] 参照   | 8                      |
| TC-07        | exitHookId → exit[] 参照     | 8                      |
| AC-2         | canonical/mirror 同一性      | -（ファイル比較）      |
| EC-01〜EC-04 | エッジケース（不正入力）     | 各検証ステップの異常系 |
| RC-01〜RC-03 | リグレッション（破壊的変更） | 2, 3, 12               |

### 注意事項

本タスクは JSON ファイル配置が主目的であり、`ManifestLoader.ts` 自体のコード変更は行っていない。カバレッジ計測は既存テストの実行確認が主目的であり、新たなカバレッジ向上は本タスクのスコープ外である。カバレッジが基準未達の場合は、後続タスク（P0-04 等）でのテスト追加を推奨事項として記録する。

## 参照資料

| 資料名                     | パス                                                                                          | 説明                     |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | カバレッジ計測対象       |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | TC-01〜RC-03（17ケース） |
| ManifestLoader テスト      | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts`                     | 単体テスト               |
| Phase 6                    | `phase-6-test-expansion.md`                                                                   | テスト拡充結果           |
| index.md                   | `index.md`                                                                                    | タスク全体概要           |
| テスト拡充結果書           | `outputs/phase-6/test-expansion.md`                                                           | Phase 6 成果物           |

## 成果物

| 成果物             | パス                                 | 説明                                   |
| ------------------ | ------------------------------------ | -------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | テスト結果・カバレッジ実測値・推奨事項 |

## 完了条件

- [ ] `ManifestLoader.production-manifest` テスト全 17 ケースが PASS している
- [ ] `ManifestLoader` 関連テスト全体が PASS している（リグレッションなし）
- [ ] `ManifestLoader.ts` の Line/Branch/Function カバレッジ実測値が記録されている
- [ ] 変更した関数/ブロックの line/branch カバレッジ実測値が証跡に残されている [Feedback 5]
- [ ] カバレッジが基準未達の場合は推奨事項が記録されている
- [ ] 成果物 `outputs/phase-7/coverage-report.md` が生成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点

- カバレッジ計測対象が `ManifestLoader.ts` に正しく限定されているか
- production-manifest テストとフィクスチャテストの両方がカバレッジに含まれているか
- Branch カバレッジで未到達の条件分岐がある場合、それが本タスクのスコープ外（エラー系等）であることが説明されているか
- カバレッジ数値が Phase 6 のテスト拡充結果と整合しているか
- 後続タスク（P0-04/P0-07/P0-09）で追加すべきテストが識別されているか

## サブタスク管理

| SubAgent   | 責務                         |
| ---------- | ---------------------------- |
| SubAgent-A | テスト実行・結果収集         |
| SubAgent-B | カバレッジ計測・実測値記録   |
| SubAgent-C | カバレッジ分析・推奨事項作成 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 8: リファクタリング
