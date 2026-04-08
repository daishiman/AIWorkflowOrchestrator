# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 3                                              |
| Phase名    | 設計レビューゲート                             |
| 前提Phase  | Phase 2                                        |
| 後続Phase  | Phase 4                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

Phase 2 の設計が AC を満たし、Phase 4 のテスト作成に進められるかを判定する。
CRITICAL 問題があれば Phase 2 へ差し戻し、MINOR 問題は未タスク候補として記録して Phase 4 へ進む。

---

## レビュー判定基準

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行             |
| MINOR    | 軽微な指摘あり           | 未タスク化後、Phase 4 へ   |
| MAJOR    | 重大な問題あり           | Phase 2 へ差し戻し         |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

---

## 実行オーケストレーション

| Lane | SubAgent   | 主担当                                | 並列性             |
| ---- | ---------- | ------------------------------------- | ------------------ |
| A    | SubAgent-A | `task-specification-creator` 準拠監査 | B と並列           |
| B    | SubAgent-B | `aiworkflow-requirements` 整合監査    | A と並列           |
| C    | SubAgent-C | 30思考法監査と改善仮説の収束          | A/B と並列         |
| Lead | Lead       | 4条件の統合判定                       | A/B/C 完了後に直列 |

---

## 実行タスク

### タスク1: 設計レビューチェックリスト評価

**目的**: Phase 2 の設計成果物を多角的に検証する

**レビューチェックリスト**:

| #   | チェック項目                                                                                         | 判定                                 |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | `SmartDefaultResult` のすべてのフィールドが `ConversationAnswers` の各質問に対応しているか           | 要確認                               |
| 2   | `null` フィールドのフォールバックが UI 上で明確に処理されているか（`selectedOption: null` 統一）     | 要確認                               |
| 3   | ページング状態が `useState<1 \| 2>` で正しく管理できるか                                             | 要確認                               |
| 4   | `QUESTIONS` 定数配列の型が TypeScript で type-safe に定義されているか                                | 要確認                               |
| 5   | `buildInitialAnswers()` が純粋関数（副作用なし）として実装できるか                                   | 要確認                               |
| 6   | `onComplete` コールバックに正しい型の `ConversationAnswers` が渡されるか                             | 要確認                               |
| 7   | AC-1〜AC-13 を全て満たす設計になっているか                                                           | 要確認（AC-13 は W2-seq-03a へ委譲） |
| 8   | テスト可能な設計（純粋関数 + コンポーネント分離）になっているか                                      | 要確認                               |
| 9   | Wave 2（`SkillCreateWizard.tsx`）との Props 整合が確認済みか                                         | 要確認                               |
| 10  | `inferenceLog` フィールドの無視方針が明文化されているか                                              | 要確認                               |
| 11  | 既存の `InterviewProgressBar.tsx` を再利用し、進捗表示の重複実装を避けているか                       | 要確認                               |
| 12  | `ConfigureStep.tsx` / `WizardOptions` の削除・参照置換は W2-seq-03a の担当として切り分けられているか | MINOR                                |

---

### タスク2: aiworkflow-requirements 整合確認

**目的**: システム仕様書との矛盾がないかを確認する

**検索コマンド（最小セット）**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ConversationRoundStep" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillCreateWizard" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SmartDefaultResult" -C 3
```

**確認事項**:

- `ConversationRoundStep` に関する既存仕様記述がある場合、整合を確認する
- `SkillCreateWizard` の Props 期待値が本タスクの `onComplete` 型と一致するか

---

### 30思考法 適用マップ

| カテゴリ     | 思考法                                                               | この Phase で見る論点                          |
| ------------ | -------------------------------------------------------------------- | ---------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 仕様・設計・テストの矛盾と妥当性               |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | 画面要素・状態・依存の漏れと重複               |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | ルールや前提の妥当性、テンプレ側へ返すべき修正 |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | 代替案・やらない案・初見ユーザー視点の検証     |
| システム系   | システム思考、因果関係分析、因果ループ                               | Step 0/1/2 と後続 wave への波及確認            |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | UX と実装容易性の両立と優先順位                |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 根本原因、改善仮説、論点収束、クラスタ化       |

### タスク3: MINOR 指摘の未タスク化

**目的**: Phase 4 で対応しない軽微な問題を未タスクとして記録する

**未タスク候補検討事項**:

- Q3 スケジュール設定 UI の詳細実装（`scheduleConfig` フィールド）
- ページ 2 → ページ 1 への「戻る」ボタンの実装（Phase 2 スコープ外）
- アニメーション・トランジション効果
- `ConfigureStep.tsx` / `WizardOptions` の削除と参照除去は W2-seq-03a へ委譲済み

**実行手順**:

1. Phase 2 の設計資料を精読し、上記チェックリストを評価する
2. CRITICAL 問題があれば Phase 2 へ差し戻す
3. MINOR 問題は `outputs/phase-3/minor-tracking.md` に記録し、Phase 4 へ進む

---

## 参照資料

| 資料名                     | パス                                                 | 説明                 |
| -------------------------- | ---------------------------------------------------- | -------------------- |
| Phase 2 設計成果物         | `outputs/phase-2/`                                   | レビュー対象         |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` | Phase 3 ゲート基準   |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/`            | システム仕様整合確認 |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | Markdown |
| MINOR 指摘リスト | `outputs/phase-3/minor-tracking.md`       | Markdown |

---

## 完了条件

- [ ] チェックリスト全 10 項目が PASS または MINOR として記録されている
- [ ] MAJOR / CRITICAL 問題がないこと、または差し戻しが完了していること
- [ ] Phase 4 進行可否が明確に判定されていること
- [ ] MINOR 指摘が `outputs/phase-3/minor-tracking.md` に記録されていること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

**Phase 4: テスト作成（TDD Red）** — `ConversationRoundStep.test.tsx` を新規作成し、TC-01〜TC-14 を Red 状態で用意する。
