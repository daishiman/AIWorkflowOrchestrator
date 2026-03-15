# シナリオA ウォークスルー記録（作成直後 → 即時利用）

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 11                         |
| 作成日   | 2026-03-15                 |

---

## ステップA-1: EP-1 採点完了時点の設計確認

| #   | 確認項目                                                                 | 確認先                                          | 判定 | 根拠                                                                                                                            |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Skill Creator 完了後に EP-1 採点が実行されることが設計に明記されているか | Phase 2 screen-transition-design.md セクション2 | PASS | シナリオA フロー図で `[Skill Creator 完了] → [EP-1 採点完了画面]` の遷移が明示されている                                        |
| 2   | EP-1 採点完了画面で ScoringGate 結果が表示されることが定義されているか   | Phase 2 screen-transition-design.md セクション2 | PASS | `[ScoringGate 判定]` ノードで4段階分岐が定義され、各分岐に CTA が対応付けられている                                             |
| 3   | ScoringGateBanner + CTA の配置が明確か                                   | Phase 2 quality-display-placement.md 地点3      | PASS | 地点3（作成直後CTA画面）に `ScoringGateBanner` がCTA上部に配置されるレイアウト図があり、バナー + CTA ボタン群の配置が明確に定義 |

**ステップA-1 判定: PASS** -- 3/3 項目が設計で明確に定義されている。

---

## ステップA-2: CTA 分岐の設計確認

### ScoringGate 4値 x CTA 6行テーブル

| ScoringGate 値       | CTA              | 期待スタイル       | 遷移先            | Phase 2 設計の定義 | Phase 4 テスト設計 | 判定 |
| -------------------- | ---------------- | ------------------ | ----------------- | ------------------ | ------------------ | ---- |
| RECOMMENDED (100)    | 今すぐ使う       | Primary+Highlight  | Workspace/Agent   | 7.1節 primary+     | TC-MATRIX-13       | PASS |
| RECOMMENDED (100)    | 保存して後で使う | Secondary          | Skill Center      | 7.1節 secondary    | TC-MATRIX-14       | PASS |
| USE_ALLOWED (80-99)  | 今すぐ使う       | Primary (Blue)     | Workspace/Agent   | 7.1節 primary      | TC-MATRIX-09       | PASS |
| USE_ALLOWED (80-99)  | 保存して後で使う | Secondary (Gray)   | Skill Center      | 7.1節 secondary    | TC-MATRIX-10       | PASS |
| SAVE_ALLOWED (60-79) | 保存して後で使う | Primary (Gray)     | Skill Center      | 7.1節 primary      | TC-MATRIX-06       | PASS |
| SAVE_ALLOWED (60-79) | 改善してから使う | Secondary (Orange) | SkillAnalysisView | 7.1節 secondary    | TC-MATRIX-07       | PASS |
| SAVE_ALLOWED (60-79) | 改善を推奨       | Text link (Gray)   | SkillAnalysisView | 7.1節 visible      | TC-MATRIX-08       | PASS |
| SAVE_ALLOWED (60-79) | 今すぐ使う       | disabled (灰)      | -                 | 7.1節 disabled     | TC-MATRIX-05       | PASS |
| NEEDS_IMPROVEMENT    | 改善してから使う | Primary (Orange)   | SkillAnalysisView | 7.1節 primary      | TC-MATRIX-03       | PASS |
| NEEDS_IMPROVEMENT    | 今すぐ使う       | disabled (灰)      | -                 | 7.1節 disabled     | TC-MATRIX-01       | PASS |
| NEEDS_IMPROVEMENT    | 保存して後で使う | disabled (灰)      | -                 | 7.1節 disabled     | TC-MATRIX-02       | PASS |
| NEEDS_IMPROVEMENT    | 改善を推奨       | hidden             | -                 | 7.1節 hidden       | TC-MATRIX-04       | PASS |

### getCTAVisibility() 関数の設計整合性

Phase 2 セクション7.2 に `getCTAVisibility(gate: ScoringGate): CTAVisibility` が定義されており、上記マトリクスのロジックが TypeScript コードとして表現されている。Phase 4 の TC-GETCTAVIS-01〜05 テストケースと対応が取れている。

### MINOR 指摘: USE_ALLOWED x IMPROVE_RECOMMENDED の不整合

Phase 2 セクション7.1 では `USE_ALLOWED` の `改善を推奨` が **非表示** と定義されているが、Phase 4 TC-MATRIX-12 では **visible**（テキストリンクとして表示）と定義されている。getCTAVisibility() 関数（Phase 2 セクション7.2）では `USE_ALLOWED` の `suggestImprove` が `"hidden"` を返す設計になっている。

- Phase 2 CTA マトリクス（7.1節）: `USE_ALLOWED` / `改善を推奨` = **非表示**
- Phase 2 getCTAVisibility()（7.2節）: `suggestImprove: "hidden"`
- Phase 4 TC-MATRIX-12: 期待状態 = **visible**

Phase 2 の設計意図（関数定義）に基づけば `hidden` が正しく、TC-MATRIX-12 の期待値が誤りである。実装時に TC-MATRIX-12 の期待値を `hidden` に修正する必要がある。

**ステップA-2 判定: MINOR** -- CTA マトリクスの Phase 2 / Phase 4 間で 1件の不整合あり（設計破綻ではない）。

---

## ステップA-3: Workspace → Agent 二段構成の確認

| #   | 確認項目                                                                          | 確認先                                                      | 判定 | 根拠                                                                                                                     |
| --- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | Workspace の役割が「文脈準備」であることが Task01 画面責務と矛盾しないか          | Phase 1 requirements-definition.md セクション4, Task01 参照 | PASS | Phase 1 セクション4 で Workspace=「文脈準備、ファイル接続（Primary）」と明記。Task01 依存契約準拠が Section 9 で確認済み |
| 2   | Workspace からスキルが自動選択された状態で Agent に遷移することが設計されているか | Phase 2 screen-transition-design.md セクション8.3           | PASS | セクション8.3 で自動設定項目テーブルが定義。選択スキル、EP-3バナー、実行ボタンラベルまで明示                             |
| 3   | Agent の役割が「実行本体」であることが Task01 画面責務と矛盾しないか              | Phase 1 requirements-definition.md セクション4              | PASS | Phase 1 セクション4 で Agent=「実行、履歴確認、改善判断（Primary）」と明記。探索一覧を持たないことも禁止責務として定義   |
| 4   | Workspace が「探索一覧」の責務を持っていないことが確認できるか                    | Phase 1 requirements-definition.md セクション4              | PASS | Phase 1 セクション4 の禁止責務で Workspace=「探索一覧、最終実行判断」が明示的に禁止されている                            |

**ステップA-3 判定: PASS** -- 4/4 項目が設計上の整合性を確認。Task01 依存契約との矛盾なし。

---

## ステップA-4: Agent 実行結果の確認

| #   | 確認項目                                                                                        | 確認先                                               | 判定 | 根拠                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | PostExecutionActionBar が「もう一度使う / 改善する / 完了 / terminal で続ける」を提供しているか | Phase 2 component-design.md セクション5              | PASS | セクション5.1 のボタン構成テーブルで4ボタン（RerunButton, ImproveButton, CompleteButton, TerminalButton）が明確に定義されている                  |
| 2   | 実行結果サマリーに ScoreDisplay (compact) が表示されることが設計されているか                    | Phase 2 quality-display-placement.md 地点6           | PASS | 地点6（Agent 実行後）に `ScoreDisplay(compact)` と `ScoreDelta(md)` の配置が定義されている                                                       |
| 3   | ScoreDelta が EP-4 再評価後に表示されることが定義されているか                                   | Phase 2 ipc-integration-design.md セクション4, 地点6 | PASS | IPC 設計セクション4 で EP-4 フロー内に `calculateScoreDelta()` の呼び出しが明示。地点6 のレイアウト図で `[ScoreDelta(md)] +5 (70→75)` 表示例あり |

**ステップA-4 判定: PASS** -- 3/3 項目が設計で明確に定義されている。

---

## ステップA-5: シナリオA ウォークスルー総合記録

| 項目       | 内容               |
| ---------- | ------------------ |
| 実施日     | 2026-03-15         |
| 実施者     | AI Design Reviewer |
| チェック数 | 16                 |
| PASS 数    | 15                 |
| MINOR 数   | 1                  |
| MAJOR 数   | 0                  |
| 総合判定   | **MINOR**          |

### MINOR 指摘一覧

| #   | 指摘内容                                                | 影響範囲              | 対処方針                                             |
| --- | ------------------------------------------------------- | --------------------- | ---------------------------------------------------- |
| 1   | USE_ALLOWED x IMPROVE_RECOMMENDED の Phase 2/4 間不整合 | TC-MATRIX-12 の期待値 | 実装時に TC-MATRIX-12 の期待値を `hidden` に修正する |

### 設計文書の参照箇所

- Phase 2 screen-transition-design.md: セクション2（シナリオA フロー）、セクション7（CTA マトリクス）
- Phase 2 component-design.md: セクション5（PostExecutionActionBar）
- Phase 2 quality-display-placement.md: 地点3, 地点5, 地点6
- Phase 2 ipc-integration-design.md: セクション4（EP-4 フロー）
- Phase 4 scoring-gate-cta-matrix.md: TC-MATRIX-01〜16
