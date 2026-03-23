# Phase 13: PR準備メモ

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## ステータス: BLOCKED（ユーザー指示待ち）

本設計タスクはPhase 10でPASS判定を受け、Phase 12まで完了している。PRの作成はユーザーからの指示を受けてから実施する。

---

## BLOCKED条件

| 条件                          | ステータス | 詳細                                                                                                                           |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 12 未タスク指示書の作成 | BLOCKED    | UT-TRANSCRIPT-M-1・UT-TRANSCRIPT-M-2の指示書ファイル未作成（P58対策として必要）                                                |
| LOGS.md 2ファイルの更新       | BLOCKED    | `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の更新が必要（P1対策） |
| topic-map.md の再生成         | BLOCKED    | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` の実行が必要（P2対策）                                 |
| ユーザー承認                  | BLOCKED    | PR作成前にユーザーの確認が必要                                                                                                 |

**BLOCKED解除条件**: 上記4条件が全て解除された後にPRを作成する。

---

## PR作成時の情報（future PR用 evidence bundle）

### PRタイトル（70文字以内）

```
docs(transcript-provenance): Transcript to Chat Provenance Linkage 設計 Phase 8-13
```

### PR本文のサマリー（1-3箇条書き）

- `TranscriptProvenance` 型定義（5フィールド）・3操作（OP-1/OP-2/OP-3）・状態遷移（5状態）・コンポーネント設計（4件）・Hook設計（3件）の設計フェーズ完了
- Phase 8（リファクタリング境界）・Phase 9（品質チェックリスト/リスク登録）・Phase 10（最終レビューPASS）・Phase 11（手動テスト計画）・Phase 12（実装ガイド/未タスク検出）・Phase 13（PR準備）の成果物一式を作成
- MINOR指摘M-1（SelectedFile source）・M-2（TranscriptSession型）を未タスクとして管理し、M-3（truncation上限）は10,000文字として実装仕様に確定

### テストプラン（PR本文用）

```markdown
## Test Plan

- [ ] Phase 1-3成果物（requirements/design/design-review）が参照可能であることを確認
- [ ] Phase 8-13成果物がリポジトリに存在することを確認
- [ ] `unassigned-task-detection.md` でMINOR指摘2件が未タスクとして記録されていることを確認
- [ ] `implementation-guide.md` Part 1・Part 2が実装者にとって読みやすい内容であることをレビューで確認
- [ ] `risk-register.md` のR-01~R-07全件に受入条件が定義されていることを確認
```

---

## レビュー担当者へのガイド

### 見るべきドキュメント（優先順）

1. `outputs/phase-10/final-review-report.md` — AC-1~AC-4の充足確認・全体の整合性
2. `outputs/phase-9/risk-register.md` — 残余リスクR-01~R-07と`implementation_ready`判定
3. `outputs/phase-12/implementation-guide.md` — 実装者への伝達内容が適切かどうか
4. `outputs/phase-8/refactor-boundaries.md` — 変更禁止Contractの妥当性

### 確認すべきevidence

| evidence           | パス                                            | 確認ポイント                                          |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------- |
| 型定義Contract     | `outputs/phase-8/refactor-boundaries.md` 2.1節  | 5フィールドが全て変更禁止Contractに含まれているか     |
| 禁止事項           | `outputs/phase-8/refactor-boundaries.md` 2.2節  | auto-send/hidden parsing/自動要約が明文化されているか |
| 品質チェックリスト | `outputs/phase-9/quality-checklist.md`          | 51項目がV-Q1~V-Q7に分類されているか                   |
| 未タスク管理       | `outputs/phase-12/unassigned-task-detection.md` | M-1/M-2が未タスクとして3ステップ管理されているか      |

### レビュー時の注意事項

- 本タスクは**設計タスク**のため、プロダクションコードの変更はない
- Phase 1-3成果物は別ディレクトリに存在する（Phase 1-3成果物サマリーを参照）
- MINOR指摘（M-1/M-2/M-3）は全て未タスク化されており、本PRのスコープ外
- `implementation_ready = true` は Phase 9 で宣言済み（`risk-register.md` 参照）

---

## ブランチ命名規則

```
docs/transcript-provenance-linkage-design-phase-8-13
```

または

```
docs/TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001-phase-8-13
```

---

## マージ条件

- [ ] BLOCKED条件が全て解除されている
- [ ] レビュー担当者のAPPROVALが得られている
- [ ] CI（lint/typecheck/test）がパスしている（設計タスクのためスキップ対象のCIについては確認すること）
- [ ] main ブランチへの直接push禁止（必ずPR経由でマージ）
