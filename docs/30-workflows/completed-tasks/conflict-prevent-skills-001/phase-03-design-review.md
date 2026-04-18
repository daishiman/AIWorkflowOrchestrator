# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 3                           |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18                  |

## 目的

Phase 2 設計が `skill 準拠` と `エレガントさ` を両立しているかを検証し、Phase 4 へ進める設計だけを残す。

## 実行タスク

1. task-specification-creator 準拠監査を反映する
2. aiworkflow-requirements 抽出監査を反映する
3. 30種思考法で過剰設計、前提誤認、依存漏れを評価する
4. PASS / MINOR / MAJOR の戻り先を定義する
5. Phase 4 着手条件を確定する

## 参照資料

| 資料名           | パス                                                                                   | 用途                    |
| ---------------- | -------------------------------------------------------------------------------------- | ----------------------- |
| task-spec skill  | `.agents/skills/task-specification-creator/SKILL.md`                                   | phase gate 根拠         |
| aiworkflow skill | `.agents/skills/aiworkflow-requirements/SKILL.md`                                      | canonical / mirror 根拠 |
| phase 12 guide   | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | close-out 先行確認      |
| 監査成果物       | `outputs/phase-3/*.md`                                                                 | 本 phase の証跡         |

## 実行手順

### ステップ1: 重大な初期 gap の確定

- 必須セクション欠落は Phase 1-13 全体で解消済みであること
- `merge=ours` を built-in と誤記しないこと
- `spec_created` workflow に「実装済み」口調を混ぜないこと
- `NON_VISUAL` と `setup script 必須` を無批判に結びつけないこと

### ステップ2: 30種思考法レビュー

| カテゴリ     | 主な結論                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| 論理分析系   | Git 仕様誤認を是正しない限り設計全体が崩れる                               |
| 構造分解系   | 4分類で整理すると EVALS を本 wave から外せる                               |
| メタ・抽象系 | 問題は「競合」だけでなく「競合対策の副作用」でもある                       |
| 発想・拡張系 | `all union` / `all keep-ours` より category 別設計が簡潔                   |
| システム系   | Phase 12 same-wave sync を先に設計しないと drift が残る                    |
| 戦略・価値系 | generated / mirror を先に、consumer audit 必須変更を後に置くのが最小コスト |
| 問題解決系   | 真因は「共有状態の混在」であり、症状ごとの場当たり対策ではない             |

### ステップ3: ゲート判定

| 判定  | 条件                                                     | 戻り先           |
| ----- | -------------------------------------------------------- | ---------------- |
| PASS  | custom driver、regenerate、close-out 同期の3本柱が揃う   | Phase 4          |
| MINOR | wording や artifact 名の微修正だけが残る                 | Phase 3 内で修正 |
| MAJOR | EVALS のような高リスク変更を無監査で本 wave に入れている | Phase 2          |

## 統合テスト連携

- Phase 4 では設計レビューで残した MAJOR 候補が test case 化されていることを確認する

## 多角的チェック観点（AIが判断）

- 批判的思考: custom driver の前提は根拠付きか
- アブダクション: なぜ `spec_created` 文書が実装済み風になったのかを説明できるか
- 逆説思考: もっとも簡単な設計が、実はもっとも drift を防ぐか
- 因果ループ: Phase 12 sync を怠ると次 wave で同じ drift を再生産しないか
- KJ法: 指摘を `骨格`, `Git仕様`, `scope`, `close-out` に束ねられるか

## サブタスク管理

| SubTask | 内容                    | 担当   |
| ------- | ----------------------- | ------ |
| ST-7    | compliance audit 反映   | Lane A |
| ST-8    | requirements audit 反映 | Lane B |
| ST-9    | elegance review 反映    | Lane C |

## 成果物

- `outputs/phase-3/task-specification-creator-compliance-audit.md`
- `outputs/phase-3/aiworkflow-requirements-extraction-audit.md`
- `outputs/phase-3/solution-elegance-review.md`

## 完了条件

- [ ] 30種思考法の適用結果が記録されている
- [ ] PASS / MINOR / MAJOR の戻り先が定義されている
- [ ] Phase 4 着手条件が明文化されている

## タスク100%実行確認【必須】

- [ ] 2つの監査結果を統合した
- [ ] 30種思考法の結論を残した
- [ ] ゲート判定基準を記載した

## 次Phase

Phase 4 では、merge / regenerate / parity を deterministic に検証するテスト仕様を作成する。
