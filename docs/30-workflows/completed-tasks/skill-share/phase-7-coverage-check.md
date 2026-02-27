# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase 番号 | 7                                                       |
| Phase 名   | カバレッジ確認                                          |
| 目的       | カバレッジ基準の達成を検証し、未達の場合 Phase 6 に戻す |
| 前提 Phase | Phase 6（テスト拡充）                                   |
| 後続 Phase | Phase 8（リファクタリング）                             |
| ステータス | 未実施                                                  |
| 作成日     | 2026-02-27                                              |
| 機能名     | skill-share                                             |

## 目的

Phase 6 で拡充したテストにより、SkillShareManager および関連 IPC ハンドラのカバレッジが基準値を満たしているかを最終確認する。未達の場合は Phase 6 に差し戻してテストを追加する。達成の場合は Phase 8（リファクタリング）に進む。

## 実行タスク

- カバレッジ最終計測: 全テストファイルのカバレッジを v8 プロバイダで計測する
- 基準達成判定: 3 指標（Line / Branch / Function）の達成・未達を判定する
- 未達時の差し戻し判断: 未達箇所を特定し Phase 6 への差し戻し要否を決定する
- 最終カバレッジレポートの文書化: outputs/phase-7/ 配下に最終レポートを作成する

## 参照資料

| 参照資料                   | パス                                                      | 内容                            |
| -------------------------- | --------------------------------------------------------- | ------------------------------- |
| Phase 5 実装仕様           | `docs/30-workflows/skill-share/phase-5-implementation.md` | カバレッジ計測対象の実装範囲    |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                        | カバレッジ基準値（最低 / 推奨） |
| Phase 6 カバレッジレポート | `outputs/phase-6/coverage-report.md`                      | Phase 6 時点のカバレッジ値      |
| 06-known-pitfalls.md       | `.claude/rules/06-known-pitfalls.md`                      | P41（v8 カバレッジ注意点）      |

## システム仕様（aiworkflow-requirements）

| 仕様書                    | 参照目的                                   |
| ------------------------- | ------------------------------------------ |
| `error-handling.md`       | エラーパスのカバレッジ確認用（全分岐網羅） |
| `quality-requirements.md` | Line/Branch/Function の品質判定基準        |

## 実行手順

### T7-1: カバレッジ最終計測

1. SkillShareManager 関連テストのカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run \
  src/main/services/skill/__tests__/SkillShareManager.test.ts \
  src/main/services/skill/__tests__/SkillShareManager.integration.test.ts \
  --coverage
```

2. IPC ハンドラテストのカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.share.test.ts \
  --coverage
```

3. カバレッジ結果を以下のファイル単位で記録する:

| 対象ファイル                                                     | 計測対象                   |
| ---------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillShareManager.ts`      | Line / Branch / Function   |
| `apps/desktop/src/main/ipc/skillHandlers.share.ts`（share 部分） | Line / Branch / Function   |
| `packages/shared/src/types/skill-share.ts`                       | 型定義のみのため計測対象外 |

### T7-2: 基準達成判定

以下の基準テーブルに基づき、各指標の達成・未達を判定する:

| 指標              | 最低基準 | 推奨基準 | 判定ルール                              |
| ----------------- | -------- | -------- | --------------------------------------- |
| Line Coverage     | 80%      | 90%      | 80% 未満 → **未達**（Phase 6 差し戻し） |
| Branch Coverage   | 60%      | 70%      | 60% 未満 → **未達**（Phase 6 差し戻し） |
| Function Coverage | 80%      | 90%      | 80% 未満 → **未達**（Phase 6 差し戻し） |

判定結果のパターン:

| パターン | 全指標が最低基準以上 | 全指標が推奨基準以上 | アクション                                   |
| -------- | -------------------- | -------------------- | -------------------------------------------- |
| A        | Yes                  | Yes                  | Phase 8 へ進む                               |
| B        | Yes                  | No                   | Phase 8 へ進む（推奨未達の指標を備考に記録） |
| C        | No                   | -                    | Phase 6 へ差し戻し                           |

### T7-3: 未達時の差し戻し判断

パターン C（最低基準未達）の場合:

1. 未達の指標とファイルを特定する
2. カバレッジレポートから未カバー行・分岐・関数を抽出する
3. 以下の分類で追加テストの優先度を決定する:

| 未カバーの種類                        | 優先度 | 追加テストの方針                             |
| ------------------------------------- | ------ | -------------------------------------------- |
| エラーハンドリングの分岐              | 高     | 異常系テストケースの追加                     |
| private メソッドの未呼び出し          | 高     | パブリック API 経由で間接的に呼び出すテスト  |
| インライン arrow function（P41）      | 中     | コールバックの戻り値を明示的に検証するテスト |
| catch ブロックの未到達                | 中     | モックでエラーをスローさせるテスト           |
| デフォルトケース（switch の default） | 低     | 不正値を渡すテスト                           |

4. 差し戻し時は `outputs/phase-7/coverage-final-report.md` に未達箇所と追加方針を記録し、Phase 6 に戻る

### T7-4: 最終カバレッジレポートの文書化

`outputs/phase-7/coverage-final-report.md` に以下を記録する:

```markdown
# Phase 7: 最終カバレッジレポート

## 計測日時

YYYY-MM-DD HH:MM

## カバレッジ結果

### SkillShareManager.ts

| 指標     | 値    | 最低基準 | 推奨基準 | 判定  |
| -------- | ----- | -------- | -------- | ----- |
| Line     | XX.X% | 80%      | 90%      | ✅/❌ |
| Branch   | XX.X% | 60%      | 70%      | ✅/❌ |
| Function | XX.X% | 80%      | 90%      | ✅/❌ |

### skillHandlers.ts（share 関連ハンドラ）

| 指標     | 値    | 最低基準 | 推奨基準 | 判定  |
| -------- | ----- | -------- | -------- | ----- |
| Line     | XX.X% | 80%      | 90%      | ✅/❌ |
| Branch   | XX.X% | 60%      | 70%      | ✅/❌ |
| Function | XX.X% | 80%      | 90%      | ✅/❌ |

## 総合判定

- [ ] パターン A / B / C

## 未達箇所（パターン C の場合）

| ファイル | 行番号 | 種類 | 追加方針 |
| -------- | ------ | ---- | -------- |

## Phase 6 との差分

- Phase 6 時点の Line Coverage: XX.X% → Phase 7 時点: XX.X%
- Phase 6 時点の Branch Coverage: XX.X% → Phase 7 時点: XX.X%
- Phase 6 時点の Function Coverage: XX.X% → Phase 7 時点: XX.X%
```

## 成果物

| 成果物                 | パス                                       | 種別 |
| ---------------------- | ------------------------------------------ | ---- |
| 最終カバレッジレポート | `outputs/phase-7/coverage-final-report.md` | 文書 |

## 統合テスト連携

- カバレッジ計測にはユニットテスト（`SkillShareManager.test.ts`）と統合テスト（`SkillShareManager.integration.test.ts`）の両方を含める
- IPC ハンドラテスト（`skillHandlers.share.test.ts`）のカバレッジは、skillHandlers.ts 全体ではなく share 関連ハンドラ部分のみを対象とする
- 既存テスト（`skillHandlers.test.ts` 等）のカバレッジには影響を与えない

## 完了条件

- [ ] SkillShareManager.ts の Line Coverage が 80% 以上である
- [ ] SkillShareManager.ts の Branch Coverage が 60% 以上である
- [ ] SkillShareManager.ts の Function Coverage が 80% 以上である
- [ ] skillHandlers.ts（share 関連）の Line Coverage が 80% 以上である
- [ ] skillHandlers.ts（share 関連）の Branch Coverage が 60% 以上である
- [ ] skillHandlers.ts（share 関連）の Function Coverage が 80% 以上である
- [ ] 全テスト（ユニット + 統合）がパスしている
- [ ] `outputs/phase-7/coverage-final-report.md` が作成されている
- [ ] 判定結果（パターン A / B / C）が記録されている
- [ ] パターン C の場合: 未達箇所と追加方針が記録され、Phase 6 に差し戻されている
- [ ] パターン A / B の場合: Phase 8 への移行が承認されている

## スキル 100%実行確認【必須】

- [ ] カバレッジ計測コマンドが正常に実行できることを確認
- [ ] カバレッジ結果がファイル単位で確認できることを確認
- [ ] 最終カバレッジレポートの全項目が埋まっていることを確認
- [ ] パターン C の場合、Phase 6 への差し戻し理由が明確に記録されていることを確認

## 次の Phase

- **基準達成時（パターン A / B）**: Phase 8: リファクタリング — `phase-8-refactoring.md`
- **基準未達時（パターン C）**: Phase 6: テスト拡充 — `phase-6-test-expansion.md`（差し戻し）

## 備考

- カバレッジ計測は `--coverage` フラグ付きで Vitest を実行する。カバレッジプロバイダは `vitest.config.ts` の設定に従う（v8 がデフォルト）
- P41 対策: Function Coverage が 80% を下回る場合、インライン arrow function が原因かどうかを確認する。validateIpcSender のオプションオブジェクト内コールバックが未カバーの場合は、セキュリティテストでそのコールバックを明示的に呼び出すテストを Phase 6 で追加する
- 推奨基準（Line 90%, Branch 70%, Function 90%）は必須ではないが、達成した場合はレポートに記録する。未達の推奨基準は Phase 12 の未タスクレポートに記載候補とする
- 差し戻しは最大 2 回まで許容する。3 回目の差し戻しが発生した場合、カバレッジ基準の緩和を検討する（ただし最低基準は維持）
