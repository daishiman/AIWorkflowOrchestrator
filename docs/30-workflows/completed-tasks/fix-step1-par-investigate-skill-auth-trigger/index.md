# TASK-TRACE-SKILL-AUTH-001 - タスク実行仕様書

## メタ情報

| 項目       | 値                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-TRACE-SKILL-AUTH-001                                               |
| 機能名     | スキル生成→auth:login呼び出し経路の調査・修正                           |
| 作成日     | 2026-04-01                                                              |
| 優先度     | high                                                                    |
| 複雑度     | medium                                                                  |
| ステータス | spec_created（Phase 1-12 complete / Phase 13 blocked）                  |
| 総Phase数  | 13                                                                      |
| 依存タスク | なし（TASK-FIX-AUTH-IPC-001 / TASK-FIX-IPC-TIMEOUT-001 と並列実行可能） |

---

## 背景

スキル生成ボタン押下時に `auth:login` IPC タイムアウトが発生している。
30種の思考法による調査で以下が判明している:

- スキル生成フロー（`SkillLifecyclePanel.handlePrepare` → `detectMode` → `planSkill`）は `login()` を直接呼ばない
- `auth:login` の呼び出し元は `AccountSection` と `AuthView` のみと確認されているが、スキル生成時にも発生している
- 4つの仮説（SkillLifecyclePanel / agentSlice / authModeSlice / 未発見コンポーネント）を全て検証済み
- 未発見の呼び出し経路が存在する可能性が高い

このタスクは実際のスタックトレースを取得して呼び出し経路を特定し、不要な `auth:login` 呼び出しを除去することを目的とする。

## 要件レビュー一次結論

| 観点                 | 結論                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| 真の論点             | スキル生成導線で発火する `auth:login` の実行時経路を特定し、最小変更で止血できるか    |
| 依存関係・責務境界   | renderer の呼び出し境界、auth slice、IPC 境界、親 workflow の参照導線を混ぜない       |
| 価値とコストの不均衡 | 最小の trace 計測と canonical link 修正で、調査・修正・再発防止の価値を同時に得られる |
| 改善優先順位         | 1. 呼び出し元特定 2. 参照整合性修正 3. 回帰防止 4. ドキュメント同期                   |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 高                                     |

## 検証対象 skill

| skill                      | 主な確認観点                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| task-specification-creator | Phase 1-13 の単一責務性、Phase 12 の完了要件、SubAgent 分割、コミット/PR 禁止、実行可能な粒度     |
| aiworkflow-requirements    | canonical root、依存関係、関連タスク表、current facts、path drift、index 再生成、仕様同期の完全性 |

## SubAgent 編成

| SubAgent | 担当                                                         | 並列可否               |
| -------- | ------------------------------------------------------------ | ---------------------- |
| A        | 2つの skill 定義から必須項目を抽出し、漏れと衝突を一覧化する | B と並列               |
| B        | 本ブランチ差分と参照リンクの drift を洗い出す                | A と並列               |
| C        | 30種の思考法を適用して改善案を比較し、最小複雑性の案に絞る   | A/B の初期結果後に直列 |
| Lead     | A/B/C の結果を統合し、patch か再構成かを確定する             | 直列                   |

## スコープ

### 含む

- 変更分の skill 準拠検証
- 30種の思考法による多角的分析
- 参照パスと依存関係の整合化
- エレガントな最小変更の反映

### 含まない

- コミット、PR 作成、push
- auth フロー全体の再設計
- ユーザー承認なしの破棄再構成の即時実行

---

## 特記事項

このタスクは**調査フェーズ（Phase 1-3）**と**修正フェーズ（Phase 4-10）**に明確に分かれる。
調査結果によっては修正内容が変わる可能性があるため、**Phase 3 でユーザー承認を得ること**。
既存実装の破棄が最小複雑性になる場合は、Phase 3 か Phase 5 の時点で別途ユーザー承認を取り直す。

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 調査要件定義       | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 調査設計           | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト仕様作成     | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 調査実行+修正      | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング   | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証           | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証     | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新   | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成             | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 実行フロー

```
Phase 1 (調査要件) → Phase 2 (調査設計) → Phase 3 (Gate: ユーザー承認) → Phase 4 (テスト仕様)
                                                    ↓
                                           (MAJOR→戻り / 承認待ち)
                                                    ↓
Phase 5 (調査実行+修正) → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 (Gate)
                                                                         ↓
                                                                    (MAJOR→戻り)
                                                                         ↓
                                                    Phase 11 → Phase 12 → Phase 13 → 完了
```

---

## 調査対象候補

| 候補                                                             | 概要                              |
| ---------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`           | 完全実装確認（login呼び出し検索） |
| `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | auth preflight ロジック           |
| スキル生成 → terminal_handoff 受信後の Renderer 側処理           | useEffect 連鎖トリガー            |
| `authModeSlice` 内の副作用                                       | dispatch パターンの検索           |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: Phase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                            |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | requirements-definition.md, investigation-scope.md                                                                                                                                                    |
| 2     | debug-procedure.md, stacktrace-method.md                                                                                                                                                              |
| 3     | gate-decision.md, design-review-result.md                                                                                                                                                             |
| 4     | test-specification.md                                                                                                                                                                                 |
| 5     | stacktrace-evidence.md, changed-files.md, fix-summary.md                                                                                                                                              |
| 6     | expanded-test-cases.md, regression-test-result.md                                                                                                                                                     |
| 7     | coverage-plan.md                                                                                                                                                                                      |
| 8     | refactoring-plan.md                                                                                                                                                                                   |
| 9     | quality-report.md, risk-register.md                                                                                                                                                                   |
| 10    | final-review-result.md, gate-decision.md                                                                                                                                                              |
| 11    | manual-test-result.md                                                                                                                                                                                 |
| 12    | implementation-guide.md, system-spec-update-summary.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md, phase12-task-spec-compliance-check.md, lessons-learned.md |
| 13    | -                                                                                                                                                                                                     |

---

_このファイルは手動作成されました。_
_最終更新: 2026-04-01_
