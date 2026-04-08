# Phase 7: カバレッジ確認

## メタ情報

| 項目         | 値                                      |
| ------------ | --------------------------------------- |
| タスクID     | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 |
| フェーズ     | Phase 7                                 |
| フェーズ名   | カバレッジ確認                          |
| 前提フェーズ | Phase 6（テスト拡充完了）               |
| 担当         | 実装担当者                              |
| 成果物       | `outputs/phase-7/coverage-report.md`    |

---

## 目的

リファクタリング後の `useMainlineExecutionAccess.ts` に対して、テストカバレッジを計測・記録する。カバレッジ計測は変更したファイルのみに限定し、広域指定による計測コストの増大を避ける。

line カバレッジ・branch カバレッジの実測値を記録し、目標値との比較を行う。目標未達の場合は Phase 6 に差し戻して追加テストを実装する。

---

## カバレッジ計測対象

| 区分             | 詳細                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| 計測対象ファイル | `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` のみ |
| 計測除外         | その他のファイル（広域指定は行わない）                               |
| 計測ツール       | Vitest + v8 coverage provider                                        |

> **注意**: `--coverage` オプションで広域指定（例: `apps/desktop/src/**`）を行うと計測コストが大幅に増加する。必ず変更ファイル単体を指定すること。

---

## 実行コマンド

```bash
# カバレッジ計測（変更ファイル単体指定）
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts
```

### オプション説明

| オプション                                                      | 説明                            |
| --------------------------------------------------------------- | ------------------------------- |
| `--filter @repo/desktop`                                        | desktopパッケージのVitestを使用 |
| `vitest run`                                                    | ウォッチなし単発実行モード      |
| `--coverage`                                                    | カバレッジレポートを出力        |
| `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` | 計測対象ファイルを単体指定      |

---

## カバレッジ目標値

| カバレッジ種別    | 目標値       | 理由                                                                     |
| ----------------- | ------------ | ------------------------------------------------------------------------ |
| line カバレッジ   | **80% 以上** | 主要実行パスを網羅するための基準値                                       |
| branch カバレッジ | **60% 以上** | 条件分岐（`connectionStatus` / `healthPolicy` 種別）の主要パターンを網羅 |

> **補足**: branch カバレッジの目標を line より低く設定する理由は、`resolveHealthPolicy()` 内部の全条件分岐パターン（将来追加分を含む）を現時点で網羅しきれないためである。

---

## 実測値記録要件

計測実行後、以下のフォーマットで `outputs/phase-7/coverage-report.md` に実測値を記録すること。

### 記録フォーマット

```markdown
## カバレッジ実測結果

| カバレッジ種別 | 目標値  | 実測値 | 判定        |
| -------------- | ------- | ------ | ----------- |
| line           | 80%以上 | XX.X%  | PASS / FAIL |
| branch         | 60%以上 | XX.X%  | PASS / FAIL |

## 実行コマンド

\`\`\`
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts
\`\`\`

## Vitestカバレッジ出力（抜粋）

\`\`\`
（ここにカバレッジ出力をペースト）
\`\`\`

## 未カバーの行・分岐（FAIL の場合）

| 行番号 / 分岐 | 未カバーの理由 | 対応方針                   |
| ------------- | -------------- | -------------------------- |
| L00           | ...            | Phase 6差し戻し / 対応不要 |

## 総合判定

- [ ] PASS（全目標値達成）→ Phase 8 へ進む
- [ ] FAIL（目標値未達） → Phase 6 に差し戻してテスト追加
```

---

## 判定フロー

```
カバレッジ計測実行
        ↓
  line >= 80% AND branch >= 60%?
        ↓ Yes                ↓ No
  PASS → Phase 8 へ    FAIL → Phase 6 差し戻し
                              (追加テスト実装後に再計測)
```

---

## 完了条件（フェーズゲート）

| 条件                                                         | 確認方法                    |
| ------------------------------------------------------------ | --------------------------- |
| カバレッジ計測が正常完了している                             | コマンド終了コードが 0      |
| line カバレッジが 80% 以上                                   | coverage-report.md の実測値 |
| branch カバレッジが 60% 以上                                 | coverage-report.md の実測値 |
| 実測値が outputs/phase-7/coverage-report.md に記録されている | ファイル存在確認            |

---

## 成果物

- **レポートファイル**: `outputs/phase-7/coverage-report.md`
  - カバレッジ実測値（line / branch）
  - Vitest カバレッジ出力の抜粋
  - 未カバー箇所の一覧（FAIL の場合）
  - 総合判定と次フェーズへの引き継ぎ事項
