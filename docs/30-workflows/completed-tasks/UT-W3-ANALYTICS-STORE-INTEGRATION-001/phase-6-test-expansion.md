# Phase 6: テスト拡充

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| フェーズ | Phase 6                                        |
| 機能名   | renderer analytics slice / SkillAnalytics 連携 |
| 作成日   | 2026-04-13                                     |
| 担当     | 実装担当者                                     |

---

## 目的

Phase 5 で Green にした基本テストに加え、以下の観点からテストを拡充する。

- **fail path テスト**: 異常入力・境界値に対する動作を保証する
- **回帰 guard テスト**: 既存 `trackEvent` API のシグネチャ変更を検知する
- **並列実行テスト**: 複数スキルが同時実行された場合の正確なイベント記録を保証する

テスト拡充後、全件 PASS することを確認する。

---

## 重要注意事項

- Phase 4 で作成したテストケース（TC-04-01〜TC-04-13）は変更しないこと
- 本フェーズで追加するテストは Phase 5 の実装が Green であることを前提とする
- 追加テストが Red になる場合は、実装側（`analyticsSlice.ts`）を修正すること
- Phase 7 のカバレッジ目標（line 90% / branch 85%）を意識してテストケースを設計すること

---

## 実行タスク

### T-06-1: fail path テストの追加

異常入力・境界値に対する動作を検証するテストを追加する。

追加先ファイル: `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`

#### 追加テストケース設計（fail path）

**グループ 6: 異常入力テスト**

| テストID | テスト内容                                                   | 入力                       | 期待結果                                               |
| -------- | ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------ |
| TC-06-01 | `trackSkillStart` に空文字 `skillId` を渡した場合            | `skillId: ""`              | エラーをスローせず、`analyticsAdapter.send` が呼ばれる |
| TC-06-02 | `trackSkillComplete` に `duration` として負の値を渡した場合  | `duration: -1`             | エラーをスローせず、`duration` をそのまま送信する      |
| TC-06-03 | `trackSkillError` に `Error` オブジェクトを渡した場合        | `error: new Error("test")` | `error.message` が payload に含まれること              |
| TC-06-04 | `trackSkillError` に文字列エラーを渡した場合                 | `error: "string error"`    | 文字列がそのまま payload に含まれること                |
| TC-06-05 | `trackSkillStart` の前に `trackSkillComplete` が呼ばれた場合 | 順序が逆                   | エラーをスローせず、両方の送信が独立して完了すること   |

**グループ 7: store の再生成動作**

| テストID | テスト内容                                                                     | 期待結果                               |
| -------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| TC-06-06 | store を再生成後に `trackSkillStart` を呼んだ場合、正常に動作すること          | `analyticsAdapter.send` が呼び出される |
| TC-06-07 | 各テストケースの前後で hidden state が存在しないこと（テスト間の状態汚染なし） | 前のテストの挙動が引き継がれない       |

---

### T-06-2: 回帰 guard テストの追加

既存の `trackEvent` 公開 API シグネチャが変更されていないことを確認する回帰テストを追加する。

追加先ファイル: `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`

#### 追加テストケース設計（回帰 guard）

**グループ 8: trackEvent API シグネチャ回帰確認**

| テストID | テスト内容                                                                      | 期待結果                                              |
| -------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| TC-06-08 | `trackEvent` が呼び出し可能なシグネチャを保持していること                       | TypeScript 型エラーが発生しない                       |
| TC-06-09 | `trackEvent` の第1引数の型が変更されていないこと                                | 既存の呼び出しコードとの互換性が保たれる              |
| TC-06-10 | `analyticsSlice` が `trackEvent` に依存していないこと（逆方向の依存がないこと） | `analyticsSlice` が `trackEvent` を import していない |

**グループ 9: `analyticsAdapter.send` が例外を投げた場合の安全な処理**

| テストID | テスト内容                                                                                                      | 期待結果                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| TC-06-11 | `analyticsAdapter.send` が例外をスローした場合、`analyticsSlice` のアクションが例外を外に伝播しないこと         | `trackSkillStart` / `trackSkillComplete` / `trackSkillError` がエラーをスローしない |
| TC-06-12 | `analyticsAdapter.send` が例外をスローした場合でも、後続の `analyticsAdapter.send` 呼び出しが正常に動作すること | 次の送信が成功する                                                                  |

---

### T-06-3: 並列実行テストの追加

複数スキルが同時に実行された場合のイベント記録の正確性を検証するテストを追加する。

追加先ファイル: `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`

#### 追加テストケース設計（並列実行）

**グループ 10: 並列スキル実行**

| テストID | テスト内容                                                                                     | 期待結果                                                                      |
| -------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| TC-06-13 | 3つのスキルが同時に `trackSkillStart` を呼び出した場合                                         | `analyticsAdapter.send` が3回呼ばれ、各 payload に正しい `skillId` が含まれる |
| TC-06-14 | `trackSkillStart` → `trackSkillComplete` → `trackSkillError` が異なる `skillId` で混在した場合 | 各イベント名と `skillId` が正しく対応している                                 |
| TC-06-15 | 同一 `skillId` で `trackSkillStart` が2回連続で呼ばれた場合                                    | `analyticsAdapter.send` が2回呼ばれること（重複防止は行わない設計の場合）     |

---

### T-06-4: テスト実行と全 PASS 確認

追加テストを含む全テストケースを実行し、全件 PASS することを確認する。

```bash
# 拡充後のテスト全件実行
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts

# lint チェック
pnpm --filter @repo/desktop lint

# 型チェック
pnpm typecheck
```

**期待される結果**:

- Phase 4 のテスト（TC-04-01〜TC-04-13）が引き続き PASS すること
- Phase 6 の追加テスト（TC-06-01〜TC-06-15）が全件 PASS すること
- `pnpm lint` がエラーなく完了すること
- `pnpm typecheck` がエラーなく完了すること

PASS しない場合の対処:

1. テストエラーを確認する
2. `analyticsSlice.ts` の実装を修正する（テストの変更は禁止）
3. 再度 T-06-4 を実行する

---

## 参照資料

| 資料名                 | パス                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Phase 4 テストファイル | `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`                       |
| Phase 5 実装ファイル   | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                                      |
| Phase 5 Green 確認記録 | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-5/green-confirmation.md` |
| Phase 7 カバレッジ目標 | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/phase-7-coverage-check.md`             |

---

## 成果物

| 成果物                 | パス                                                                                               | 説明                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 拡充済みテストファイル | `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts`                          | fail path / 回帰 guard / 並列実行テストを追加済み |
| テスト拡充結果記録     | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-6/test-expansion-result.md` | 追加テストケース一覧と全 PASS ログ                |

---

## 完了条件

- [ ] T-06-1: fail path テスト（TC-06-01〜TC-06-07）が追加された
- [ ] T-06-2: 回帰 guard テスト（TC-06-08〜TC-06-12）が追加された
- [ ] T-06-3: 並列実行テスト（TC-06-13〜TC-06-15）が追加された
- [ ] T-06-4: Phase 4 + Phase 6 の全テストケース（計28件）が PASS した
- [ ] T-06-4: `pnpm lint` がエラーなく完了した
- [ ] T-06-4: `pnpm typecheck` がエラーなく完了した
- [ ] テスト拡充結果記録が `outputs/phase-6/test-expansion-result.md` に保存された

---

## 次のフェーズへの移行条件

全ての完了条件を満たした上で、全テストが PASS していることを確認した後、Phase 7（テストカバレッジ確認）へ進む。
