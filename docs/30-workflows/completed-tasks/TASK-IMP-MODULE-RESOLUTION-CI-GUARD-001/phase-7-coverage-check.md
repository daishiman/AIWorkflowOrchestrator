# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase      | 7                                       |
| 名称       | カバレッジ確認                          |
| 前提Phase  | Phase 6（テスト拡充完了）               |
| 次Phase    | Phase 8（リファクタリング）             |
| ステータス | completed                               |

## 目的

Phase 6 までに作成した全テストのカバレッジを計測し、プロジェクト品質基準（02-code-quality.md）を満たしているか確認する。基準未達の場合は Phase 6 に戻りテストを追加する。

## 参照資料

| 資料                                              | パス / リンク                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充                                | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-6-test-expansion.md`                 |
| Phase 6 テスト結果                                | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-6/test-expansion-results.md` |
| Phase 5 実装                                      | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-5-implementation.md`                 |
| Phase 5 テスト結果                                | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-5/test-results-green.md`     |
| コード品質ルール（カバレッジ基準）                | `.claude/rules/02-code-quality.md#カバレッジ基準`                                                     |
| 既知の落とし穴（P41: v8カバレッジインライン関数） | `.claude/rules/06-known-pitfalls.md#P41`                                                              |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: カバレッジ計測

`scripts/check-shared-module-sync.ts` に対するカバレッジを計測する。

### Task 2: カバレッジ基準判定

計測結果がプロジェクト品質基準を満たしているか判定する。

### Task 3: （未達時のみ）Phase 6 差戻し

基準未達の場合、不足箇所を特定し Phase 6 に戻ってテストを追加する。

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定                          |
| ----------------- | -------- | -------- | ----------------------------- |
| Line Coverage     | 80%      | 90%      | 最低基準未達 → Phase 6 に戻る |
| Branch Coverage   | 60%      | 70%      | 最低基準未達 → Phase 6 に戻る |
| Function Coverage | 80%      | 90%      | 最低基準未達 → Phase 6 に戻る |

---

## カバレッジ計測コマンド

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts --coverage --coverage.provider=v8 --coverage.include='scripts/check-shared-module-sync.ts'
```

### コマンドオプション解説

| オプション                                                 | 説明                                               |
| ---------------------------------------------------------- | -------------------------------------------------- |
| `--coverage`                                               | カバレッジ計測を有効化                             |
| `--coverage.provider=v8`                                   | v8 カバレッジプロバイダを使用（Vitest デフォルト） |
| `--coverage.include='scripts/check-shared-module-sync.ts'` | 計測対象を本スクリプトのみに限定                   |

### 代替コマンド（vitest.config.ts にカバレッジ設定がある場合）

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts --coverage
```

---

## P41 対策: v8 カバレッジプロバイダのインライン関数カウント

### 問題

Vitest の v8 カバレッジプロバイダは、インライン arrow function（`Array.filter()`, `Array.map()`, `Array.reduce()` のコールバック）を独立した関数としてカウントする。テストで実行されないコールバックがあると Function Coverage が大幅に低下する。

### 対策

1. **全インライン関数の実行確認**: テストケースが全てのコールバック関数を少なくとも1回実行することを確認する
2. **カバレッジレポートの精査**: Function Coverage が低い場合、カバレッジレポートの詳細で未実行関数を特定する
3. **該当箇所の例**:
   - `parseExports` 内の `Object.entries().filter()` コールバック
   - `checkExportsVsPaths` 内の `Array.map()` コールバック（サブパスキー変換）
   - `checkExportsVsTypesVersions` 内の `Array.filter()` コールバック（`"."` エントリスキップ）

### 確認方法

```bash
# カバレッジレポートの HTML 出力で詳細確認
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts --coverage --coverage.reporter=html
# coverage/ ディレクトリに HTML レポートが生成される
```

---

## カバレッジ不足時のアクション

### 判定フロー

```
カバレッジ計測
  ↓
全指標が最低基準以上?
  ├─ YES → Phase 8 へ進む
  └─ NO  → 不足箇所を特定
           ↓
         Phase 6 に戻りテスト追加
           ↓
         Phase 7 を再実行
```

### 不足箇所の特定手順

1. カバレッジレポート（text / html）で未カバー行・分岐・関数を確認する
2. 未カバー箇所に対応するテストケースを設計する
3. Phase 6 テスト拡充に追加テストケースを記録する
4. テストを追加し、全テストが PASS することを確認する
5. Phase 7 を再実行してカバレッジ基準を再確認する

### 特に注意すべき未カバー候補

| 箇所                                                | 理由                                                   | 対策テスト                              |
| --------------------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `parseExports` の string 形式正規化パス             | オブジェクト形式のみテストしている可能性               | string 形式 export エントリのテスト追加 |
| `parsePaths` のワイルドカードスキップ分岐           | ワイルドカードが含まれない入力のみテストしている可能性 | ワイルドカード入力のテスト追加          |
| `checkExportsVsTypesVersions` の `"."` スキップ分岐 | `"."` を含まない exports でのみテストしている可能性    | `"."` を含む exports でのテスト追加     |
| `main()` のエラーハンドリング分岐                   | 正常系のみテストしている可能性                         | ファイル不在時の main() テスト追加      |
| `formatReport` の全 PASS パス                       | 不整合ありパスのみテストしている可能性                 | 全チェック PASS 時の出力テスト追加      |

---

## 実行手順

1. Phase 6 の全テストが PASS していることを確認する
2. カバレッジ計測コマンドを実行する:
   ```bash
   pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts --coverage --coverage.provider=v8 --coverage.include='scripts/check-shared-module-sync.ts'
   ```
3. カバレッジ結果を確認する:
   - Line Coverage: 80%以上か？
   - Branch Coverage: 60%以上か？
   - Function Coverage: 80%以上か？
4. 全指標が最低基準を満たしている場合:
   - カバレッジ結果を `outputs/phase-7/` に記録する
   - Phase 8 へ進む
5. いずれかの指標が最低基準未満の場合:
   - 未カバー箇所を特定する
   - Phase 6 に戻りテストを追加する
   - Phase 7 を再実行する

---

## 統合テスト連携

| 連携項目          | 内容                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要スイート      | `packages/shared/src/__tests__/module-resolution.test.ts` / `apps/desktop/src/__tests__/shared-module-resolution.test.ts` / `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |
| このPhaseでの扱い | 本Phaseの成果を3スイートと `scripts/check-shared-module-sync.ts` の期待値に反映し、差分が出た場合は仕様に戻って整合を取る                                                                 |
| 失敗時の戻り先    | 要件不整合はPhase 1、設計不整合はPhase 2、実装不整合はPhase 5/6に戻す                                                                                                                     |

## 成果物

| #   | 成果物             | パス                                                                                           |
| --- | ------------------ | ---------------------------------------------------------------------------------------------- |
| 1   | カバレッジレポート | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-7/coverage-report.md` |

### カバレッジレポートの記載フォーマット

```markdown
## カバレッジ結果

| 指標              | 結果   | 最低基準 | 推奨基準 | 判定  |
| ----------------- | ------ | -------- | -------- | ----- |
| Line Coverage     | XX.XX% | 80%      | 90%      | ✅/❌ |
| Branch Coverage   | XX.XX% | 60%      | 70%      | ✅/❌ |
| Function Coverage | XX.XX% | 80%      | 90%      | ✅/❌ |

## テスト実行結果

- 総テスト数: XX 件
- PASS: XX 件
- FAIL: 0 件

## 判定

[PASS: Phase 8 へ進む / FAIL: Phase 6 に差戻し（不足箇所: ...）]
```

---

## 完了条件

- [ ] カバレッジ計測コマンドが正常に実行されている
- [ ] Line Coverage が 80% 以上（最低基準）を満たしている
- [ ] Branch Coverage が 60% 以上（最低基準）を満たしている
- [ ] Function Coverage が 80% 以上（最低基準）を満たしている
- [ ] P41 対策（インライン関数のカバレッジ）が確認されている
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に記録されている
- [ ] 基準未達の場合は Phase 6 に戻りテスト追加後に再計測で基準を満たしている

## 次Phase

Phase 8（リファクタリング）へ進む。
