# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 7                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

**変更したファイルのみ**を対象にカバレッジを計測し、目標値（Line 80%+ / Branch 60%+ / Function 80%+）を達成していることを確認する。変更対象外のファイルはカバレッジ計測の対象外とする。

---

## 実行タスク

### タスク1: カバレッジ計測対象の明示

**対象範囲（変更ファイルのみ）:**

| ファイルパス                                                             | 変更種別 | カバレッジ計測                   |
| ------------------------------------------------------------------------ | -------- | -------------------------------- |
| `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`                | 新規     | 対象                             |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` | 修正     | 対象                             |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`     | 修正     | 対象                             |
| `packages/shared/src/types/skillCreator.ts`                              | 修正     | 対象外（型定義のみ・実行行なし） |

**対象外（変更していないファイル）:**

- `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` — テストファイル自体
- `apps/desktop/src/main/**` — メインプロセス（変更なし）
- `apps/desktop/src/preload/**` — Preload（変更なし）
- その他すべての変更対象外ファイル

---

### タスク2: カバレッジ計測コマンドの実行

```bash
# 変更ファイル対象のカバレッジ計測
pnpm --filter @repo/desktop test -- --coverage --reporter=verbose \
  apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts \
  apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx \
  apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

**オプション説明:**

| オプション           | 説明                                   |
| -------------------- | -------------------------------------- |
| `--coverage`         | カバレッジレポートを生成する           |
| `--reporter=verbose` | テスト名と結果を詳細表示する           |
| 後続のパス指定       | カバレッジ計測の対象ファイルを限定する |

---

### タスク3: カバレッジ目標値の確認

**目標値（変更ファイル対象）:**

| 指標              | 目標値 | 合格基準              |
| ----------------- | ------ | --------------------- |
| Line Coverage     | 80%+   | 各ファイルで 80% 以上 |
| Branch Coverage   | 60%+   | 各ファイルで 60% 以上 |
| Function Coverage | 80%+   | 各ファイルで 80% 以上 |

**ファイル別期待カバレッジ:**

| ファイル                   | Line | Branch | Function | 備考                                             |
| -------------------------- | ---- | ------ | -------- | ------------------------------------------------ |
| `useAuthKeyManagement.ts`  | 85%+ | 65%+   | 90%+     | TC-01〜TC-28 で主要パスをカバー済み              |
| `AuthKeySection/index.tsx` | 80%+ | 60%+   | 80%+     | TC-06〜TC-10 でフック使用・UI を確認済み         |
| `ApiKeySettingsPanel.tsx`  | 90%+ | 70%+   | 100%     | 委譲ラッパーのため行数が少なく高カバレッジ見込み |

---

### タスク4: カバレッジ不足時の対処方針

カバレッジが目標値を下回っている場合、以下の順で対処する。

**判断フロー:**

```
カバレッジ目標未達
  ├─ 未カバーの行/分岐が何か確認（カバレッジレポートの赤色行）
  ├─ 対応するテストケースが Phase 4〜6 で設計されているか確認
  │   ├─ 設計済み → Phase 5 または Phase 6 でテストを追加する
  │   └─ 未設計  → 本 Phase でテストを追加（TC-29〜 として採番）
  └─ 追加後に再計測
```

**よくある未カバーパターンと対処:**

| 未カバーパターン                         | 対処                                   |
| ---------------------------------------- | -------------------------------------- |
| `catch` ブロックの例外処理               | TC-21（exists 失敗）相当のテストを追加 |
| `onStatusChange` が undefined の場合分岐 | TC-05 に `options` なし variant を追加 |
| `isSubmitting` が true 時の early return | TC-24 で確認済み。未確認なら追加       |
| `keySource` が `null` の UI 分岐         | TC-01 の初期状態テストで確認           |

---

### タスク5: カバレッジレポートの記録

計測結果を成果物として記録する。

```bash
# レポートを outputs/phase-7/ に保存
mkdir -p docs/30-workflows/rt-04-authkey-component-dedup/outputs/phase-7/

# カバレッジサマリーを取得（CI 出力形式）
pnpm --filter @repo/desktop test -- --coverage --reporter=json \
  apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts \
  apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx \
  apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx \
  2>/dev/null | grep -A5 '"lines"\|"branches"\|"functions"'
```

**記録フォーマット（outputs/phase-7/coverage-result.md）:**

```markdown
## カバレッジ計測結果

計測日時: YYYY-MM-DD
対象ファイル: 3件（変更ファイルのみ）

| ファイル                   | Line  | Branch | Function | 判定      |
| -------------------------- | ----- | ------ | -------- | --------- |
| `useAuthKeyManagement.ts`  | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
| `AuthKeySection/index.tsx` | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
| `ApiKeySettingsPanel.tsx`  | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |

総合判定: PASS / FAIL
```

---

### タスク6: 全体テスト実行（回帰確認）

カバレッジ計測後、全体テストを実行して退行がないことを確認する。

```bash
# デスクトップパッケージの全テスト
pnpm --filter @repo/desktop test -- --run

# 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                      | 内容           |
| ---------- | ------------------------------------------------------------------------- | -------------- |
| テスト方針 | `.claude/skills/aiworkflow-requirements/references/testing-guidelines.md` | カバレッジ基準 |

### 実装参照ファイル

**カバレッジ計測対象ファイル:**

| ファイルパス                                                             | 変更種別 |
| ------------------------------------------------------------------------ | -------- |
| `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`                | 新規     |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` | 修正     |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`     | 修正     |

### 設計参照

| ドキュメント   | パス                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| Phase 4 テスト | `docs/30-workflows/rt-04-authkey-component-dedup/phase-4-test-creation.md`  |
| Phase 6 拡充   | `docs/30-workflows/rt-04-authkey-component-dedup/phase-6-test-expansion.md` |

---

## 統合テスト連携【必須】

| 判定項目                           | 基準                             | 実施方針                                     |
| ---------------------------------- | -------------------------------- | -------------------------------------------- |
| `useAuthKeyManagement.ts` Line     | 85%+（目標 80%+）                | TC-01〜TC-28 でカバー                        |
| `useAuthKeyManagement.ts` Branch   | 65%+（目標 60%+）                | 成功/失敗パスをカバー                        |
| `useAuthKeyManagement.ts` Function | 90%+（目標 80%+）                | handleSave / handleDelete / refresh をカバー |
| `AuthKeySection/index.tsx` Line    | 80%+                             | フック使用後の UI パスをカバー               |
| `ApiKeySettingsPanel.tsx` Line     | 90%+（委譲ラッパーのため高水準） | 委譲パスをカバー                             |
| 全体テスト退行なし                 | Phase 6 での Green が維持        | `pnpm --filter @repo/desktop test -- --run`  |

---

## 成果物

| 成果物             | パス                                 | 説明                           |
| ------------------ | ------------------------------------ | ------------------------------ |
| カバレッジ計測結果 | `outputs/phase-7/coverage-result.md` | ファイル別カバレッジ数値・判定 |

---

## 完了条件

- [ ] カバレッジ計測対象ファイルが明示されている（変更ファイルのみ）
- [ ] カバレッジ計測コマンドが実行されている
- [ ] `useAuthKeyManagement.ts`: Line 80%+, Branch 60%+, Function 80%+ を達成
- [ ] `AuthKeySection/index.tsx`: Line 80%+, Branch 60%+, Function 80%+ を達成
- [ ] `ApiKeySettingsPanel.tsx`: Line 80%+, Branch 60%+, Function 80%+ を達成
- [ ] カバレッジ不足があった場合、追加テストを実施して目標達成済み
- [ ] カバレッジ計測結果が `outputs/phase-7/coverage-result.md` に記録されている
- [ ] 全体テスト退行なし
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                              | 完了 |
| ----------------------------------- | ---- |
| タスク1: 計測対象ファイルの明示     | [ ]  |
| タスク2: カバレッジ計測コマンド実行 | [ ]  |
| タスク3: 目標値確認・判定           | [ ]  |
| タスク4: カバレッジ不足時の対処     | [ ]  |
| タスク5: カバレッジレポート記録     | [ ]  |
| タスク6: 全体テスト退行確認         | [ ]  |

## 次のPhase

Phase 8: リファクタリング（[phase-8-refactoring.md](phase-8-refactoring.md)）

**Phase 7 完了・カバレッジ目標達成後にのみ Phase 8 へ進むこと。**
