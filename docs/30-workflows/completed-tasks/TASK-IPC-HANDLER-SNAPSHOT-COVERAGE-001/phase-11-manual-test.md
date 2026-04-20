# Phase 11: 手動テスト

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| Phase        | 11                                              |
| タスクID     | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001          |
| タスク名     | IPC handler registration snapshot coverage 拡張 |
| タスク種別   | NON_VISUAL                                      |
| ステータス   | 未実施                                          |
| 作成日       | 2026-04-19                                      |
| GitHub Issue | #2287（CLOSED）, #2269（CLOSED）                |

## 目的

NON_VISUALタスクのため、UIスクリーンショットは不要。
テスト実行ログとCIログを証跡として使用する。

IPC handlerのスナップショットカバレッジ拡張に伴い追加されたテストが、
すべてPASSすることを確認する。また、CI実行時間への影響が許容範囲内であることを確認する。

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`（テスト実行ログ）を参照。

## NON_VISUAL 正本ポリシー

`outputs/phase-11/manual-test-result.md` を Phase 11 の正本とし、以下を1ファイルに集約する:

- テスト件数サマリー（PASS/FAIL/SKIP、実施情報）
- edge case 一覧表（EC-NNN ID・観点・入力値・期待動作・結果）
- 実行コマンドと判定
- 仕様判断根拠（SD-NNN ID・`handle/on/mixed` の扱い、対象外理由）
- NON_VISUAL チェック観点

NON_VISUAL チェック観点:

- `SKILL.md` から参照した family file / reference へ辿れるか
- `.claude` と `.agents` の file set・参照先が一致しているか
- validator / verify コマンドを再実行できるか
- `artifacts.json` と phase 本文の成果物定義が一致しているか

## 実行タスク

### Step 1: スナップショットテストの実行

```bash
# 対象スナップショットテストのみを実行
pnpm vitest run --reporter=verbose --testNamePattern="REG-SNAP|REG-DEDUP|REG-COUNT"
```

実行対象テストID:

- REG-SNAP-XX: handler登録スナップショット検証
- REG-DEDUP-XX: 重複登録検出テスト
- REG-COUNT-XX: 登録数カウント検証

### Step 2: 全テストPASS確認

```bash
# 全テストスイートを実行して回帰がないことを確認
pnpm vitest run
```

確認項目:

- [ ] 新規追加スナップショットテストが全てPASS
- [ ] 既存テストへの回帰がない
- [ ] テスト失敗件数: 0件

### Step 3: CI実行時間の記録

CI実行ログから以下を計測・記録する:

| 計測項目                       | 目標値     | 実測値 |
| ------------------------------ | ---------- | ------ |
| 追加テストの実行時間           | < 30秒     | 未計測 |
| 全テストスイートの実行時間差分 | < 30秒増加 | 未計測 |
| CIパイプライン合計時間         | 許容範囲内 | 未計測 |

### Step 4: NON_VISUAL 整合ウォークスルー

以下を `manual-test-result.md` に記録する:

- `SKILL.md` / reference / phase 仕様のリンク整合
- `.claude` と `.agents` の正本・mirror 関係の確認結果
- `outputs/artifacts.json` と phase 本文の成果物一致確認
- 仕様判断根拠 ID または短い理由

## 成果物

- `outputs/phase-11/manual-test-result.md`（テスト実行ログ）

## 完了条件

- [ ] 全スナップショットテストがPASSしている
- [ ] 既存テストへの回帰がない（テスト失敗: 0件）
- [ ] CI実行時間への影響が許容範囲内（追加分 < 30秒）
- [ ] `outputs/phase-11/manual-test-result.md` にテスト実行ログが記録されている
- [ ] NON_VISUAL 整合ウォークスルー結果が `manual-test-result.md` に記録されている

## タスク100%実行確認【必須】

Phase 11完了時に以下をすべてチェックすること:

- [ ] Step 1: pnpm vitest run（対象スナップショットテストのみ）を実行した
- [ ] Step 2: 全テストPASSを確認した
- [ ] Step 3: CI実行時間を記録した
- [ ] Step 4: NON_VISUAL 整合ウォークスルーを記録した
- [ ] `outputs/phase-11/manual-test-result.md` を作成した
- [ ] 完了条件を全て満たしている

## 参照資料

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-9/quality-check-result.md`
- `artifacts.json`
- `outputs/artifacts.json`

## 統合テスト連携

- Phase 9 の品質結果と Phase 10 の最終レビュー結果を一次証跡として再確認する
- Wave 1/2 の PASS 状態と Wave 3 の後続計画記録が manual test でも追跡可能であることを確認する
- NON_VISUAL task として視覚証跡を要求しない代わりに、実行ログ・判断根拠・整合ウォークスルーを集約する

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/phase-12-documentation.md`
