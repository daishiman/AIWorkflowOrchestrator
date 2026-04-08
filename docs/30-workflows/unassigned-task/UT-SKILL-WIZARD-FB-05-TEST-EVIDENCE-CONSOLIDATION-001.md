# UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001: Phase 11 テスト証跡の一本化テンプレート整備

## メタ情報

| 項目         | 値                                                                     |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                  |
| issue_number | 2033                                                                   |
| 検出元       | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 12 フィードバック |
| 優先度       | LOW                                                                    |
| 影響         | 証跡が分散→後続レビューでfalse greenを見逃すリスク                     |
| 検出日       | 2026-04-07                                                             |

## 概要

`purpose` が空白のみのケースを空文字と同一視する実装判断が、implementation-guide.md / manual-test-result.md / unassigned-task-detection.md の3箇所に分散して記録されている。また「テスト33件」という件数と各edgeケースの証跡が一本化されていない。後続のレビュアーが証跡を追いにくく、false greenを見逃すリスクがある。

## 現状

```
現状の証跡分散:
- implementation-guide.md: 「空白のみはtrim()で空文字扱い」を記述
- manual-test-result.md: 「33件PASS」と記録
- unassigned-task-detection.md: edge caseの処理方針を記述
← これら3ファイルを横断しないと全体像が把握できない
```

Phase 11 manual-test-result.md に標準的なテンプレートがなく、テスト件数・内訳・重要な実装判断（edge case の処理方針）がそれぞれ別ファイルに散在している。

## 期待される修正

```markdown
## Phase 11 証跡の標準構造（改善後）

### 検証サマリー

| テスト種別  | 件数     | 結果     |
| ----------- | -------- | -------- |
| 正常系      | 20件     | PASS     |
| 異常系/edge | 13件     | PASS     |
| **合計**    | **33件** | **PASS** |

### edge case 証跡（重要判断を一覧化）

| ケース         | 仕様判断         | テストID |
| -------------- | ---------------- | -------- |
| purpose = " "  | 空文字として扱う | #27      |
| purpose = null | nullとして扱う   | #28      |
```

task-specification-creator スキルのPhase 11テンプレートにこの標準構造を組み込み、証跡の一本化を図る。

## 完了条件

- [ ] Phase 11 manual-test-result.md テンプレートに「edge case 一覧表」が含まれている
- [ ] 「テスト件数と内訳」が1箇所に集約されるテンプレートが整備されている
- [ ] 仕様判断（空白→空文字扱い等）の根拠が証跡ファイルに明示されている
- [ ] task-specification-creator スキルのPhase 11テンプレートにこの構造が反映されている

## 苦戦箇所記録

purpose空白ケースの扱いについて、実装・テスト・ドキュメントで3回同じ判断を記録していたが、最後の証跡確認時まで全体像が把握しにくかった。証跡の一本化が早い段階でできていれば、Phase 12のレビューで確認時間が大幅に短縮できた。

## 関連

- 検出タスク: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001
- 関連フィードバック: FB-05（Phase 12 skill-feedback-report.md）
