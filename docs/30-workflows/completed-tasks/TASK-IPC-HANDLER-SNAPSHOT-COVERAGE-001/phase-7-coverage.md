# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-19                             |
| 前Phase    | 6: テスト拡充                          |
| 次Phase    | 8: リファクタリング                    |

---

## 目的

対象 handler 群の registration snapshot coverage 状況を可視化し、
Wave 1 の完了率と Wave 2/3 の残課題を整理する。
CI実行時間への影響も計測し、wave分割方針の妥当性を検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Wave 1完了率の確認

**目的**: スナップショットテストが導入済みのhandler数をWave 1全対象数と照合し、完了率を算出する

**実行手順**:

1. `outputs/phase-1/handler-inventory.md` を開き、Wave 1対象として記録された全 registration unit を列挙する（index.md・wave-plan.md との整合を確認）
2. `apps/desktop/src/main/ipc/__tests__/` 配下のスナップショットテストファイルを列挙する
3. Wave 1対象handler（`outputs/phase-2/wave-plan.md` が正本）とテスト導入済みhandlerを照合する
4. 完了率（テスト導入済み数 / Wave 1全対象数 × 100）を算出する

**完了率集計表（記入例）**:

| Wave | 対象handler数 | テスト導入済み数 | 完了率 |
| ---- | ------------- | ---------------- | ------ |
| 1    |               |                  |        |
| 2    |               |                  |        |
| 3    |               |                  |        |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の Wave 1完了率セクション

---

### タスク2: handler別テスト導入状況の可視化

**目的**: `handler-inventory.md` を正本とした全対象のテスト導入状況を一覧表にまとめ、残課題を明確にする

**実行手順**:

1. 以下の形式でhandler別テスト導入状況表を作成する

```markdown
| handler名                    | Wave | テストファイル                               | 状態     |
| ---------------------------- | ---- | -------------------------------------------- | -------- |
| registerSkillCreatorHandlers | 1    | creatorHandlers.registrationSnapshot.test.ts | 導入済み |
| registerSkillHandlers        | 1    | skillHandlers.registrationSnapshot.test.ts   | 導入済み |
| registerLLMHandlers          | 1    | llmHandlers.registrationSnapshot.test.ts     | 導入済み |
| registerWindowHandlers       | 2    | windowHandlers.registrationSnapshot.test.ts  | 未導入   |
| registerAuthHandlers         | 2    | authHandlers.registrationSnapshot.test.ts    | 未導入   |
| ...                          | ...  | ...                                          | ...      |
```

2. 「導入済み」「未導入」「例外ルール適用」の3分類でステータスを記録する
3. `on only` / mixed の対象は「除外」で終わらせず、例外理由と代替検証を併記する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の handler別状況表セクション

---

### タスク3: Wave 2/3の残課題整理

**目的**: Wave 2/3で対応すべきhandlerと作業ボリュームを明確にする

**実行手順**:

1. タスク2の状況表をもとに、Wave 2/3の未導入handlerを抽出する
2. 各handlerについて以下の情報を整理する
   - 登録チャンネル数（おおよその見積もり）
   - `handle` / `on` の混在有無
   - 依存関係（他のhandlerや初期化順序）
3. Wave 2/3の実施優先度（チャンネル数が多い・重要度が高い順）を記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の残課題セクション

---

### タスク4: CI実行時間の計測

**目的**: スナップショットテスト追加によるCI実行時間への影響を計測し、wave分割コストが許容範囲内かを評価する

**実行手順**:

1. 以下のコマンドを実行して実行時間を計測する

```bash
pnpm vitest run --reporter=verbose apps/desktop/src/main/ipc/__tests__/
```

2. 実行時間（全体・handler別）を記録する
3. 以下の基準で評価する

| 評価基準             | 判定基準       |
| -------------------- | -------------- |
| Wave当たりの追加時間 | 30秒以内で許容 |
| 全Waveの合計時間     | 90秒以内で許容 |

4. 許容範囲を超える場合はwave分割の再検討を推奨事項として記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` のCI時間評価セクション

---

## 参照資料

| 参照資料                    | パス                                                                | 内容                                         |
| --------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| handler棚卸し全件一覧       | `outputs/phase-1/handler-inventory.md`                              | handle/on/mixed分類・全registration unit正本 |
| Wave分割計画正本            | `outputs/phase-2/wave-plan.md`                                      | Wave 1/2/3の対象handler・想定チャンネル数    |
| Wave分割方針概要            | `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/index.md` | Wave 1/2/3の対象handler定義（要約）          |
| Phase 6成果物               | `outputs/phase-6/`                                                  | テスト拡充結果・Wave 3事前調査メモ           |
| IPCハンドラー登録ファイル群 | `apps/desktop/src/main/ipc/`                                        | 全 register\*Handlers                        |
| テストファイル群            | `apps/desktop/src/main/ipc/__tests__/`                              | 既存・新規スナップショット                   |

### システム仕様（aiworkflow-requirements）

> カバレッジ確認時に必ず以下のシステム仕様を参照し、仕様に定義された機能が網羅されているか確認してください。

| 参照資料            | パス                                                                         | 内容                      |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| IPC Handler Pattern | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCハンドラー登録パターン |

---

## 成果物

| 成果物             | パス                                 | 内容                                          |
| ------------------ | ------------------------------------ | --------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | handler別テスト導入状況表・残課題・CI時間評価 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 7の統合テスト連携アクション**:

- handler別テスト導入状況表により、統合テストカバレッジの可視化を実現する
- CI実行時間計測により、wave分割がCIパイプラインに与える影響を定量的に把握する
- Wave 2/3の残課題整理により、後続Phaseへの作業引き継ぎを明確にする
- カバレッジが未達の場合は本Phaseから Phase 6 へ戻る（ゲート判定）

---

## 多角的チェック観点（AIが判断）

| 観点               | チェック内容                                                               |
| ------------------ | -------------------------------------------------------------------------- |
| 完了率算出の正確性 | Wave 1対象handler数とテスト導入済み数の照合に漏れがないか                  |
| handle/on 区別     | `ipcMain.handle` と `ipcMain.on` を使用するhandlerが正しく分類されているか |
| 残課題の網羅性     | Wave 2/3の未導入handler全てがリストアップされているか                      |
| CI時間の客観性     | 計測値は1回ではなく複数回実行の平均値か（外れ値を除外）                    |
| ゲート判定の適切さ | 許容範囲を超えるCI時間の場合に、波分割再検討が推奨されているか             |

---

## サブタスク管理

| サブタスクID | 内容                          | ステータス |
| ------------ | ----------------------------- | ---------- |
| ST-7-01      | Wave 1完了率算出              | 未実施     |
| ST-7-02      | handler別テスト導入状況表作成 | 未実施     |
| ST-7-03      | Wave 2/3残課題整理            | 未実施     |
| ST-7-04      | CI実行時間計測と評価          | 未実施     |

---

## ゲート判定

| 判定基準                                     | 条件               | 次のアクション                  |
| -------------------------------------------- | ------------------ | ------------------------------- |
| Wave 1完了率が100%                           | 全対象がテスト済み | Phase 8へ進む                   |
| Wave 1完了率が100%未満                       | 未導入handlerあり  | Phase 6へ戻り追加実装           |
| CI実行時間が許容範囲内（Wave当たり30秒以内） | 時間内             | Phase 8へ進む                   |
| CI実行時間が許容範囲超                       | 時間超過           | wave分割再設計を推奨しPhase 8へ |

---

## 完了条件

- [ ] Wave 1の完了率が算出されている
- [ ] handler別テスト導入状況表（`outputs/phase-7/coverage-report.md`）が生成されている
- [ ] Wave 2/3の残課題（未導入handler一覧と例外理由）が整理されている
- [ ] CI実行時間が計測され、許容範囲内であることが確認されている
- [ ] ゲート判定が実施され、Phase 8への進行可否が決定されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/phase-8-refactoring.md`
