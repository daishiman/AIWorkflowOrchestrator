# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase番号  | 7                                                 |
| Phase名    | カバレッジ確認                                    |
| 前提Phase  | Phase 6                                           |
| 後続Phase  | Phase 8                                           |
| ステータス | 未実施                                            |
| 作成日     | 2026-04-08                                        |
| 機能名     | skill-wizard-runtime-validation                   |
| Issue      | #1999 (UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001) |

---

## 目的

変更したファイル（`skillInfoFormValidation.ts`）のカバレッジを確認する。

カバレッジ目標を満たすことで、テストが実装コードの主要なパスとブランチを十分に検証していることを保証する。目標未達の場合はテストを追加して目標を達成する。

本Phaseでも関数名は `validateSkillInfoForm` を正式名称として扱い、
`validateSkillInfoFormValues` は使用しない。

`SkillInfoFormData` の `category` は本タスクのランタイムバリデーション対象外であり、
カバレッジ評価対象は `skillName` / `purpose` に関わる分岐のみとする。

---

## カバレッジ目標

| 計測種別          | 目標値   | 対象ファイル                                           |
| ----------------- | -------- | ------------------------------------------------------ |
| Line カバレッジ   | 95% 以上 | `packages/shared/src/types/skillInfoFormValidation.ts` |
| Branch カバレッジ | 90% 以上 | `packages/shared/src/types/skillInfoFormValidation.ts` |

---

## 実行タスク

### タスク1: カバレッジ計測（対象ファイル指定）

**目的**: `skillInfoFormValidation.ts` に対するカバレッジレポートを生成する。

**実行手順**:

1. 以下のコマンドを実行してカバレッジを計測する:
   ```bash
   pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts --coverage
   ```
2. コマンド実行後、ターミナルに出力されるカバレッジサマリーを確認する
3. 必要に応じて HTML レポートも確認する（`coverage/index.html`）

**カバレッジ計測コマンド**:

```bash
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts --coverage
```

※ このコマンドはワークスペース全体の coverage 閾値の影響で non-zero 終了になる場合がある。
判定は `skillInfoFormValidation.ts` の coverage table を確認し、`outputs/phase-7/coverage-report.md` に記録する。

**期待される出力例**:

```
 % Coverage report from v8
-------------------------------------|---------|----------|---------|---------|
File                                 | % Stmts | % Branch | % Funcs | % Lines |
-------------------------------------|---------|----------|---------|---------|
All files                            |         |          |         |         |
 types                               |         |          |         |         |
  skillInfoFormValidation.ts         |   97.5  |    92.3  |   100   |   97.5  |
-------------------------------------|---------|----------|---------|---------|
```

**期待成果物**: カバレッジ出力ログ（`outputs/phase-7/coverage-report.md` に記録）

---

### タスク2: カバレッジ結果確認

**目的**: 計測結果が目標値を満たしているかを確認し、不足している場合は対処する。

**実行手順**:

1. タスク1の出力から `skillInfoFormValidation.ts` の行を抽出する
2. 以下の目標値と比較する:
   - Line カバレッジ: 95% 以上
   - Branch カバレッジ: 90% 以上
3. 目標を達成している場合:
   - 結果を `outputs/phase-7/coverage-report.md` に記録して完了
4. 目標を達成していない場合:
   - カバーされていないブランチ・行を特定する
   - 対応するテストケースを Phase 6 のテストファイルに追加する
   - 再度カバレッジを計測して目標達成を確認する

**カバレッジ確認チェックリスト**:

| 確認項目             | 目標値   | 実測値         | 合否           |
| -------------------- | -------- | -------------- | -------------- |
| Line カバレッジ      | 95% 以上 | （実測後記入） | （実測後記入） |
| Branch カバレッジ    | 90% 以上 | （実測後記入） | （実測後記入） |
| Function カバレッジ  | 参考値   | （実測後記入） | —              |
| Statement カバレッジ | 参考値   | （実測後記入） | —              |

**カバレッジ不足時の対処フロー**:

```
カバレッジ目標未達
  ↓
未カバーのブランチ・行を特定
  ↓
対応するテストケースを設計
  ↓
Phase 6 のテストファイルに追加
  ↓
カバレッジ再計測
  ↓
目標達成 → outputs/phase-7/coverage-report.md に記録
```

**よくある未カバーパターン**:

| パターン                             | 対処方法                                                  |
| ------------------------------------ | --------------------------------------------------------- |
| `validateSkillInfoForm` 内の条件分岐 | 各フィールドの有効・無効を個別に組み合わせたテストを追加  |
| エラーメッセージの `else` ブランチ   | 境界値テスト（ちょうど最大・最小）を追加                  |
| `undefined`/`null` の型ガード        | `null`・`undefined` それぞれのテストケースを確認          |
| `category` の扱いの誤解              | `category` は対象外である旨を Phase 6 の EC-11 で確認する |

**期待成果物**: `outputs/phase-7/coverage-report.md`

---

## 参照資料

| 資料名                           | パス / URL                                                            | 参照目的                     |
| -------------------------------- | --------------------------------------------------------------------- | ---------------------------- |
| 実装ファイル                     | `packages/shared/src/types/skillInfoFormValidation.ts`                | カバレッジ計測対象           |
| テストファイル                   | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | カバレッジ計測ソース         |
| Vitest Coverage 公式ドキュメント | https://vitest.dev/guide/coverage                                     | カバレッジ設定・コマンド確認 |
| Phase 6 テスト拡充結果           | `outputs/phase-6/test-expansion-result.md`                            | 現在のテスト一覧確認         |

---

## 成果物テーブル

| 成果物                                 | パス                                                                  | 種別                   |
| -------------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| カバレッジレポート記録                 | `outputs/phase-7/coverage-report.md`                                  | ドキュメント           |
| テストファイル（追加がある場合は更新） | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | コード（条件付き更新） |

---

## 完了条件チェックリスト

- [ ] `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts --coverage` を実行した
- [ ] `skillInfoFormValidation.ts` の Line カバレッジが 95% 以上である
- [ ] `skillInfoFormValidation.ts` の Branch カバレッジが 90% 以上である
- [ ] カバレッジ結果を `outputs/phase-7/coverage-report.md` に記録した
- [ ] 目標未達の場合はテスト追加・再計測を行い目標を達成した

---

## Phase末端アクション【必須】チェックリスト

- [ ] 成果物ファイルを `outputs/phase-7/` に保存した
- [ ] カバレッジレポートのスクリーンショットまたはテキスト出力を `outputs/phase-7/coverage-report.md` に貼り付けた
- [ ] Line・Branch の両方が目標値を達成していることを確認した
- [ ] 次のPhase（Phase 8）の前提条件を満たしていることを確認した
- [ ] Phase 7 のステータスを「完了」に更新した

---

## 依存関係

| 種別 | Phase番号 | Phase名          | 依存内容                                                     |
| ---- | --------- | ---------------- | ------------------------------------------------------------ |
| 前提 | Phase 6   | テスト拡充       | エッジケーステスト追加済み・全テスト PASS                    |
| 後続 | Phase 8   | リファクタリング | カバレッジ目標達成済み（リファクタリング後の回帰確認に使用） |

---

## 統合テスト連携

- `coverage-report.md` の分岐・行カバレッジ結果を Phase 8 のリファクタリング判断へ引き継ぐ
- 未達分岐がないことは Phase 9 の品質保証で再確認する
- カバレッジが十分であることを Phase 10 の最終レビュー前提として保持する

## 次のPhase

**Phase 8: リファクタリング**

Phase 7 でカバレッジ目標を達成した後、実装コードの重複・命名ドリフトを是正するリファクタリングを行う。リファクタリング後も全テストが PASS していることをカバレッジとともに確認する。
