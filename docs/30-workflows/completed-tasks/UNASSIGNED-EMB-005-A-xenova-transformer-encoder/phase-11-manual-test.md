# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| Phase        | 11                                                       |
| タスクID     | UNASSIGNED-EMB-005-A                                     |
| タスク名     | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス） |
| タスク種別   | NON_VISUAL                                               |
| ステータス   | 完了                                                     |
| 作成日       | 2026-04-20                                               |
| 前Phase      | 10: 最終レビュー                                         |
| 次Phase      | 12: ドキュメント更新                                     |
| GitHub Issue | #2312（CLOSED）                                          |

## 目的

NON_VISUAL タスクとして、UI スクリーンショットではなく再現コマンドの手動実行で
`XenovaTransformerEncoder` の公開契約と実行環境依存の懸念を確認する。
本 Phase は Phase 10 の PASS / MINOR 判定を受けた実装に対し、実行者が
「import/export」「実モデルを使う任意スモーク」「既知リスクの未再発」を確認し、
Phase 12 に引き渡すための一次証跡を作る。

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡として `outputs/phase-10/final-review-result.md`、
`outputs/phase-11/manual-test-result.md`、
`outputs/phase-11/reproduction-verification.md` を参照する。

## 正本ポリシー

- primary evidence: `outputs/phase-11/manual-test-result.md`
- 補助 evidence: `outputs/phase-11/reproduction-verification.md`
- 発見事項: `outputs/phase-11/discovered-issues.md`（問題がある場合のみ）
- screenshot: 不要。`screenshots/.gitkeep` は作成しない

## 実行タスク

### タスク1: 事前条件の確認

**目的**: 手動確認を始める前に、Phase 10 判定と必要成果物が揃っていることを確認する

**実行手順**:

1. `outputs/phase-10/final-review-result.md` を開き、判定が PASS または MINOR であることを確認する
2. `outputs/phase-9/quality-report.md` と `outputs/phase-6/expansion-test-result.md` が存在することを確認する
3. 実モデルスモークを行う場合のみ、ネットワーク・キャッシュ先・ローカル実行権限を確認する
4. 実モデルスモークを行わない場合は、その理由を `manual-test-result.md` に記録する

### タスク2: 再現コマンドの手動実行

**目的**: 自動テストが通った実装について、公開境界と主要経路を人手で追認する

**実行手順**:

1. 以下のコマンドを実行し、結果を `reproduction-verification.md` に
   「コマンド / 前提条件 / 期待結果 / 実結果」の4項目で記録する

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared test -- --run xenova-transformer-encoder
pnpm --filter @repo/shared test -- --run xenova-encoder-integration
pnpm --filter @repo/shared build
```

2. 実モデルでの確認が可能な場合のみ、任意スモークとして実装側が用意した確認コマンドを1本追加する

3. 任意スモークが未実施でも、理由と代替証跡を `manual-test-result.md` に必ず記録する

### タスク3: NON_VISUAL ウォークスルー記録

**目的**: 実行結果を判定可能な形で集約し、Phase 12 で再利用できるようにする

**手動ウォークスルー記録表**:

| ID    | 観点             | 確認内容                                                                       | 結果   | 証跡 |
| ----- | ---------------- | ------------------------------------------------------------------------------ | ------ | ---- |
| MT-01 | export 境界      | `index.ts` から `XenovaTransformerEncoder` を import できる                    | 未確認 |      |
| MT-02 | 契約整合         | `encode()` の戻り値契約が `IEncoder` と矛盾しない                              | 未確認 |      |
| MT-03 | 統合動作         | `LateChunkingService` へ DI した経路が再現コマンドで成功する                   | 未確認 |      |
| MT-04 | エラー分類       | `EmbeddingError` / `OutOfMemoryError` の既知経路が自動テスト結果と一致する     | 未確認 |      |
| MT-05 | 実モデルスモーク | 任意スモークを実施した場合、初回ロードまたはキャッシュ済み経路が記録されている | 未確認 |      |
| MT-06 | scope 外の明示   | renderer/Electron cache path など scope 外事項が未タスク候補として整理済み     | 未確認 |      |

### タスク4: 発見事項のリアルタイム分類

**目的**: 実行中に見つかった事項を blocker / note / info に分類する

| #   | シナリオ  | 発見事項 | 分類                  | 対応方針 |
| --- | --------- | -------- | --------------------- | -------- |
| 1   | MT-01〜06 | -        | Blocker / Note / Info | -        |

**分類基準**:

- Blocker: Phase 12 に進めない契約破綻・リンク切れ・実行不能
- Note: 進行可能だが未タスク化や改善が望ましいもの
- Info: 記録のみでよい参考情報

### タスク5: docs-only 整合ウォークスルー

**目的**: Phase 12 の close-out に必要な整合を先に確認する

**チェック項目**:

- [ ] `outputs/phase-1/acceptance-criteria.md` と Phase 10 の AC 照合結果が一致している
- [ ] `outputs/phase-6/expansion-test-result.md` の AC-6 根拠と本 Phase の MT-03 が一致している
- [ ] `outputs/phase-9/quality-report.md` の品質ゲート結果と本 Phase の再現コマンド結果が矛盾しない
- [ ] `manual-test-result.md` / `reproduction-verification.md` / `discovered-issues.md` の役割分担が崩れていない
- [ ] Phase 12 で参照する成果物名が canonical 名に揃っている

## 成果物

| 成果物                     | パス                                            | 内容                                       |
| -------------------------- | ----------------------------------------------- | ------------------------------------------ |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md`        | 実施概要、判定表、実施しなかった項目の理由 |
| 再現コマンド記録           | `outputs/phase-11/reproduction-verification.md` | コマンド / 前提条件 / 期待結果 / 実結果    |
| 発見事項記録（必要時のみ） | `outputs/phase-11/discovered-issues.md`         | Blocker / Note / Info の分類と対処方針     |

## 完了条件

- [ ] `manual-test-result.md` が作成されている
- [ ] `reproduction-verification.md` に再現コマンドの記録がある
- [ ] MT-01〜MT-06 が判定済みである
- [ ] Blocker がある場合は `discovered-issues.md` に記録されている
- [ ] 実モデルスモークを省略した場合、その理由と代替証跡が記録されている
- [ ] Phase 12 で参照する canonical 成果物名が揃っている

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/phase-12-documentation.md`
