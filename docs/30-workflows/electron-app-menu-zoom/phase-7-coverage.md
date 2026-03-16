# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                            |
| Phase      | 7 / 13                                                         |
| 作成日     | 2026-03-16                                                     |
| 担当       | implementer                                                    |
| 依存 Phase | Phase 6（テスト拡充）— 完了済み（TC-1〜TC-20 が Green 状態）   |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-7-coverage.md` |

---

## 目的

`vitest --coverage` を実行し、`apps/desktop/src/main/index.ts` 内のメニュー関連関数（`buildMacTemplate` / `buildDefaultTemplate` / `createApplicationMenu`）のカバレッジが基準値（Line 80% / Branch 60% / Function 80%）を満たしていることを確認する。基準未達の場合は Phase 6 に戻り追加テストを作成する。

---

## 実行タスク

| No. | タスク名                           | 目的                                                                      |
| --- | ---------------------------------- | ------------------------------------------------------------------------- |
| 1   | カバレッジ計測コマンドの実行       | `vitest --coverage` でカバレッジレポートを生成する                        |
| 2   | カバレッジ数値の読み取り           | `index.ts` のメニュー関連関数の Line / Branch / Function の数値を読み取る |
| 3   | 基準値との比較                     | Line 80% / Branch 60% / Function 80% の基準値と比較する                   |
| 4   | 判定（PASS / Phase 6 へ戻る）      | 基準達成なら Phase 8 へ進み、未達なら Phase 6 へ戻る                      |
| 5   | カバレッジレポートの成果物への記録 | 実際の数値を本仕様書の「カバレッジ計測結果」セクションに記入する          |

---

## 参照資料

| 資料                                                                 | 参照理由                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-6-test-expansion.md` | TC-1〜TC-20 の一覧（カバレッジの根拠となるテスト）   |
| `apps/desktop/src/main/__tests__/menu.test.ts`                       | 計測対象のテストファイル                             |
| `apps/desktop/src/main/index.ts`                                     | カバレッジ計測対象のソースファイル                   |
| `apps/desktop/vitest.config.ts`                                      | coverage プロバイダーと設定の確認                    |
| `.claude/rules/02-code-quality.md#カバレッジ基準`                    | 基準値（Line 80% / Branch 60% / Function 80%）の出典 |

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 基準未達時の対応 |
| ----------------- | -------- | -------- | ---------------- |
| Line Coverage     | 80%      | 90%      | Phase 6 へ戻る   |
| Branch Coverage   | 60%      | 70%      | Phase 6 へ戻る   |
| Function Coverage | 80%      | 90%      | Phase 6 へ戻る   |

---

## 実行手順

### Step 1: カバレッジ計測コマンドの実行

以下のコマンドを実行する。

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/__tests__/menu.test.ts
```

`vitest.config.ts` に `coverage.provider` が設定されていない場合、以下のコマンドで `@vitest/coverage-v8` プロバイダーを明示的に指定する。

```bash
cd apps/desktop && pnpm vitest run --coverage --coverage.provider=v8 src/main/__tests__/menu.test.ts
```

`@vitest/coverage-v8` が devDependencies に存在しない場合はインストールする。

```bash
pnpm --filter @repo/desktop add -D @vitest/coverage-v8
```

### Step 2: カバレッジ数値の読み取り

コマンド実行後にターミナルに出力されるカバレッジテーブルを確認する。以下の形式で出力される。

```
 % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
---------|----------|----------|----------|------------------
  100.00 |    75.00 |   100.00 |   100.00 |
```

確認対象は `apps/desktop/src/main/index.ts`（または `index.ts`）の行。

**v8 カバレッジプロバイダーの注意点（P41）**: v8 プロバイダーはインライン arrow function をそれぞれ独立した関数としてカウントする。`buildMacTemplate` / `buildDefaultTemplate` / `createApplicationMenu` の3関数が全てテストから呼ばれていれば Function Coverage は 80% 以上になる。

### Step 3: 基準値との比較

読み取った数値を以下のテーブルに記入し、基準値との比較を行う。

| 指標              | 基準値 | 実測値（記入欄） | 判定      |
| ----------------- | ------ | ---------------- | --------- |
| Line Coverage     | 80%    | \_\_%            | PASS / NG |
| Branch Coverage   | 60%    | \_\_%            | PASS / NG |
| Function Coverage | 80%    | \_\_%            | PASS / NG |

### Step 4: 判定

**全指標が基準値以上の場合（PASS）**:

- Phase 8（リファクタリング）へ進む。
- 本仕様書の「カバレッジ計測結果」セクションに実測値を記入して完了とする。

**1つ以上の指標が基準値未満の場合（未達）**:

- Phase 6（テスト拡充）へ戻る。
- 未達の指標を引き起こしているコードパスを特定する手順:
  1. `coverage/index.html` をブラウザで開き、カバーされていない行（赤ハイライト）を確認する。
  2. 未カバー行に対応するテストケースを `menu.test.ts` に追加する。
  3. 追加後に再度 Step 1〜Step 3 を実行する。

**Branch Coverage が 60% 未満の典型的な原因と対処**:

| 原因                                                      | 対処                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `process.platform === "darwin"` の false ブランチ未テスト | TC-2 / TC-3 で win32 / linux をテスト済みのため、このケースは非該当                   |
| `Array.isArray(item.submenu)` の false ブランチ未テスト   | TC-16 で全 submenu が配列であることを確認しているため、false ブランチは意図的に未到達 |
| `findSubmenuByLabel` ヘルパーの null 返却パス             | ヘルパーはテストコード内のみ存在するため、カバレッジ計測対象外                        |

### Step 5: カバレッジ計測結果の記録

本仕様書を Edit ツールで更新し、以下のセクションに実測値を記入する。

```markdown
## カバレッジ計測結果（実測値）

| 指標              | 基準値 | 実測値 | 判定 |
| ----------------- | ------ | ------ | ---- |
| Line Coverage     | 80%    | \_\_%  | PASS |
| Branch Coverage   | 60%    | \_\_%  | PASS |
| Function Coverage | 80%    | \_\_%  | PASS |

**計測コマンド**: `cd apps/desktop && pnpm vitest run --coverage src/main/__tests__/menu.test.ts`
**計測日**: YYYY-MM-DD
**テスト件数**: TC-1〜TC-20（20 件）
```

---

## カバレッジ計測結果（実測値）

<!-- Phase 7 実行後にここを記入する -->

| 指標              | 基準値 | 実測値 | 判定   |
| ----------------- | ------ | ------ | ------ |
| Line Coverage     | 80%    | 未計測 | 未実施 |
| Branch Coverage   | 60%    | 未計測 | 未実施 |
| Function Coverage | 80%    | 未計測 | 未実施 |

---

## コード成果物パス

| 成果物                                                         | 種別                           |
| -------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/coverage/` （vitest --coverage の出力先）        | カバレッジレポート（自動生成） |
| `docs/30-workflows/electron-app-menu-zoom/phase-7-coverage.md` | 本仕様書（実測値記入後）       |

---

## 完了条件

- [ ] `vitest --coverage` コマンドが PASS で完了している（テスト失敗なし）
- [ ] Line Coverage が 80% 以上であることを確認済み
- [ ] Branch Coverage が 60% 以上であることを確認済み
- [ ] Function Coverage が 80% 以上であることを確認済み
- [ ] 「カバレッジ計測結果（実測値）」セクションに実測値が記入されている
- [ ] 基準未達の場合、Phase 6 に戻って追加テストを作成済み（PASS の場合は不要）
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が含まれていない

---

## 次 Phase

カバレッジ基準（Line 80% / Branch 60% / Function 80%）を全指標で達成した場合: Phase 8（リファクタリング）へ進む。
1つ以上の指標が基準値未満の場合: Phase 6（テスト拡充）へ戻り追加テストを作成する。
