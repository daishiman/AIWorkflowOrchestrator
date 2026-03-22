# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 7                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 4〜6 で作成したテストが、`main/slide/` 配下の実装ファイルに対してカバレッジ基準を満たしているかを確認する。基準未達のファイルを特定し、Phase 6 へ戻って補完テストを追加する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

出典: `.claude/rules/02-code-quality.md`

## 実行タスク

1. カバレッジを計測する
2. 基準未達ファイルを特定する
3. 判定を行い、次の Phase を決定する

## 参照資料

| 資料名              | パス                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| テスト作成 (Phase4) | `docs/30-workflows/slide-runtime-alignment-impl/phase-04-test-creation.md`  |
| テスト拡充 (Phase6) | `docs/30-workflows/slide-runtime-alignment-impl/phase-06-test-expansion.md` |
| コード品質ルール    | `.claude/rules/02-code-quality.md`                                          |

## 実行手順

---

### ステップ 1: カバレッジ計測

以下のコマンドを実行する。必ず `apps/desktop` ディレクトリから実行すること（P40 対策: カレントディレクトリの `vitest.config.ts` を読み込むため）。

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/slide/
```

カバレッジレポートは `apps/desktop/coverage/` に出力される。

---

### ステップ 2: 計測対象ファイル一覧

カバレッジ計測の対象ファイルは以下の通り。

| ファイル                                             | Wave   | 主なテストファイル                           |
| ---------------------------------------------------- | ------ | -------------------------------------------- |
| `apps/desktop/src/main/slide/ipc-handlers.ts`        | Wave A | `__tests__/ipc-handlers.test.ts`             |
| `apps/desktop/src/preload/channels.ts`（SLIDE 部分） | Wave A | `__tests__/channel-sync.test.ts`             |
| `apps/desktop/src/main/slide/skill-executor.ts`      | Wave B | `__tests__/skill-executor.test.ts`           |
| `apps/desktop/src/main/slide/modifier-skill.ts`      | Wave B | `__tests__/skill-executor.test.ts`（統合後） |
| Renderer slideSlice ファイル                         | Wave C | `__tests__/slide-slice.test.ts`              |

`agent-client.ts` は Wave C で廃止されるため計測対象外。

---

### ステップ 3: カバレッジ結果の読み取り

計測後、以下の形式で結果を記録する:

```
計測日時: YYYY-MM-DD HH:MM
実行コマンド: cd apps/desktop && pnpm vitest run --coverage src/main/slide/

| ファイル                | Line   | Branch | Function | 判定    |
| ----------------------- | ------ | ------ | -------- | ------- |
| ipc-handlers.ts         | XX%    | XX%    | XX%      | PASS/NG |
| skill-executor.ts       | XX%    | XX%    | XX%      | PASS/NG |
| modifier-skill.ts       | XX%    | XX%    | XX%      | PASS/NG |
| slideSlice（該当パス）  | XX%    | XX%    | XX%      | PASS/NG |
```

---

### ステップ 4: 判定と次 Phase の決定

#### 全ファイル PASS の場合

Phase 8（リファクタリング）へ進む。

#### 一部ファイルが基準未達の場合

Phase 6（テスト拡充）へ戻り、不足ファイルを補完する。

未達ファイルと不足観点を以下の形式で記録する:

```
未達ファイル: apps/desktop/src/main/slide/skill-executor.ts
  Branch: 55%（基準: 60%）
  不足観点:
    - executeIntegrated() の phase !== "modifier" 分岐がテストされていない
    - RuntimeResolver が例外を投げた場合のエラーパスが未テスト
```

---

### ステップ 5: v8 カバレッジの特性確認（P41 対策）

Vitest の v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントするため、以下の点に注意する。

特に `validateIpcSender` の呼び出しオプションに含まれる `getAllowedWindows: () => [mainWindow]` が実行されないと Function Coverage が大幅に低下する（P41 事例: 44.44% まで低下した記録あり）。

確認方法:

```bash
# getAllowedWindows callback が実際に呼ばれているかを確認
grep -n "getAllowedWindows" apps/desktop/src/main/slide/__tests__/ipc-handlers.test.ts
```

Phase 4 のテスト（A-3 validateIpcSender テスト）で `getAllowedWindows()` の戻り値検証が含まれていることを確認する。

---

### ステップ 6: カバレッジ未達の典型的な原因と対処

| 典型的な未達パターン                                  | 対処                                                   |
| ----------------------------------------------------- | ------------------------------------------------------ |
| push チャネルの `webContents.send()` 呼び出し未テスト | Phase 6 の push イベントテストを補完する               |
| `sanitizeError()` の分岐（パスマスク条件）未テスト    | Phase 6 のエラーサニタイズテストを強化する             |
| `detectPathTraversal()` の正常系パス未テスト          | Phase 4 の A-5 テストに正常系を追加する                |
| `modifier-skill.ts` の utility 関数が未実行           | Phase 6 に modifier utility 関数の単体テストを追加する |
| `unregisterSlideIpcHandlers()` が未テスト             | Phase 6 の IPC 登録テストに登録解除テストを追加する    |

---

## 統合テスト連携

| フェーズ | 依存関係                                         |
| -------- | ------------------------------------------------ |
| Phase 4  | 基本テストケースを提供（前提）                   |
| Phase 6  | カバレッジ不足時の補完テスト（フォールバック先） |
| Phase 8  | カバレッジ基準達成後に進む                       |

## 成果物

| 成果物             | パス                     | 説明                          |
| ------------------ | ------------------------ | ----------------------------- |
| カバレッジレポート | `apps/desktop/coverage/` | v8 カバレッジレポート         |
| カバレッジ検証結果 | Phase 7 完了判定記録     | Line/Branch/Function の達成値 |

## 完了条件

- [ ] `cd apps/desktop && pnpm vitest run --coverage src/main/slide/` が実行されている
- [ ] 全対象ファイルの Line Coverage が 80% 以上である
- [ ] 全対象ファイルの Branch Coverage が 60% 以上である
- [ ] 全対象ファイルの Function Coverage が 80% 以上である
- [ ] カバレッジ結果をこのファイル（または別途 `coverage-report.md`）に記録している
- [ ] v8 カバレッジの `getAllowedWindows` callback 実行確認が済んでいる（P41 対策）

## 次のPhase

全基準達成 → Phase 8（リファクタリング）へ進む。

いずれかの基準未達 → Phase 6（テスト拡充）へ戻り、不足観点のテストを補完してから再計測する。
