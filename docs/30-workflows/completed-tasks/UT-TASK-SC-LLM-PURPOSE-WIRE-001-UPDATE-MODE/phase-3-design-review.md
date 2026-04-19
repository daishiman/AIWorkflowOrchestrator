# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| PhaseID    | 3                                                    |
| Phase 名   | 設計レビューゲート                                   |
| タスクID   | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE          |
| タスク名   | SkillCreatorService update/improve-prompt モード実装 |
| 前 Phase   | Phase 2（設計）完了                                  |
| 次 Phase   | Phase 4（テスト作成）— PASS / MINOR の場合のみ       |
| 作成日     | 2026-04-19                                           |
| ステータス | 未実施                                               |

---

## 目的

Phase 1〜2 の成果物を審査し、Phase 4 以降の実装・テスト作成へ進めるかを判定する。設計の整合性・型安全性・既存コードとの整合性・テスト可能性の4観点からレビューを行い、PASS / MINOR / MAJOR / CRITICAL のいずれかを判定する。

---

## 実行タスク

### T-3-1: Phase 1〜2 成果物の前提確認

- `outputs/phase-1/requirements.md` と `outputs/phase-1/acceptance-criteria.md` が揃っていることを確認する
- `outputs/phase-2/design.md` と `outputs/phase-2/method-signatures.md` が揃っていることを確認する
- 欠落がある場合はレビューを開始せず、Phase 1 または Phase 2 に差し戻す

### T-3-2: レビュー観点テーブルの全12項目を評価

- 下記テーブルの各項目を PASS / FAIL 観点で確認する
- FAIL がある場合は、影響範囲と戻り先を併記する

### T-3-3: 総合判定を記録

- PASS / MINOR / MAJOR / CRITICAL のいずれかを選択する
- MINOR がある場合は追跡テーブルに、MAJOR / CRITICAL がある場合は戻り先決定基準に従って記録する

### T-3-4: ゲート結果成果物を出力

- `outputs/phase-3/gate-decision.md` に判定結果、理由、差戻し条件を記録する
- 判定が PASS または MINOR の場合のみ Phase 4 に進む

---

## レビュー観点テーブル

| 観点                 | チェック内容                                                                                                 | 確認 |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ---- |
| 設計の整合性         | `runUpdateWorkflow` / `runImprovePromptWorkflow` のシグネチャが AC-1〜AC-2 の期待動作を充足できるか          | [ ]  |
| 設計の整合性         | progress emit フェーズ順序（`loading-skill` → `analyzing` → `updating/improving`）が AC-1〜AC-2 と一致するか | [ ]  |
| 設計の整合性         | `init_skill.js` スキップ制御の方式（A または B）が AC-5 の条件を満たすか                                     | [ ]  |
| 型安全性             | 両メソッドの引数型 `CreateSkillOptions` が既存型定義と一致しているか                                         | [ ]  |
| 型安全性             | 戻り値型 `Promise<void>` が switch 文の呼び出し箇所（`await` あり）と整合しているか                          | [ ]  |
| 型安全性             | `AbortSignal` の受け渡しパターンが `runCreateWorkflow` と同じ方式か                                          | [ ]  |
| 既存コードとの整合性 | `runCreateWorkflow`（参考実装）のエラーハンドリングパターンと設計が一致しているか                            | [ ]  |
| 既存コードとの整合性 | `collaborative` / `orchestrate` モードの既存実装パターンを踏襲しているか                                     | [ ]  |
| 既存コードとの整合性 | 修正箇所が `case "create":` / `case "collaborative":` / `case "orchestrate":` に影響を与えないか             | [ ]  |
| テスト可能性         | `runUpdateWorkflow` がモック注入なしで単体テスト可能か（AbortError ケースを含む）                            | [ ]  |
| テスト可能性         | `runImprovePromptWorkflow` がモック注入なしで単体テスト可能か                                                | [ ]  |
| テスト可能性         | `init_skill.js` の非呼び出しをスパイ/モックで検証できるか                                                    | [ ]  |

---

## レビュー結果判定テーブル

| 判定     | 条件                                                             | 後続アクション           |
| -------- | ---------------------------------------------------------------- | ------------------------ |
| PASS     | 全チェック項目が ✅、MAJOR / CRITICAL 指摘なし                   | Phase 4 へ進む           |
| MINOR    | 軽微な改善点あり（実装で解決可能）、機能要件を満たしている       | Phase 4 へ進む（要追跡） |
| MAJOR    | 設計の根本的な問題あり、要件を充足できないリスクがある           | Phase 2 へ戻り再設計     |
| CRITICAL | 既存機能を破壊するリスクがある、または型安全性に重大な欠陥がある | Phase 1 へ戻り要件再定義 |

---

## MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定 Phase | 解決確認 Phase | 備考 |
| ---------------- | -------- | -------------- | -------------- | ---- |
| （判定時に記入） |          |                |                |      |

---

## 戻り先決定基準テーブル

| 判定     | 戻り先  | 戻り理由の例                                                      |
| -------- | ------- | ----------------------------------------------------------------- |
| MAJOR    | Phase 2 | メソッドシグネチャが AC-1〜AC-2 を充足できない設計になっている    |
| MAJOR    | Phase 2 | `init_skill.js` スキップ方式が既存テストを破壊するリスクがある    |
| CRITICAL | Phase 1 | `CreateSkillOptions` 型が想定と異なり、要件定義からやり直しが必要 |
| CRITICAL | Phase 1 | progress フェーズ名が型定義に存在せず、要件の再定義が必要         |

---

## 参照資料

| 資料名                     | パス                                                                                    | 用途                         |
| -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義書         | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-1-requirements.md` | AC-1〜AC-5 の前提確認        |
| Phase 2 設計書             | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-2-design.md`       | メソッド設計・制御フロー確認 |
| SkillCreatorService        | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | 既存実装との整合確認         |
| SkillCreatorService テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`            | テスト可能性確認             |

---

## 成果物

| 成果物         | パス                               | 内容                                         |
| -------------- | ---------------------------------- | -------------------------------------------- |
| ゲート判定結果 | `outputs/phase-3/gate-decision.md` | PASS / MINOR / MAJOR / CRITICAL の判定と理由 |

---

## 総合判定記録

```
判定結果: [ PASS / MINOR / MAJOR / CRITICAL ]
判定日: YYYY-MM-DD
判定者: （実行エージェント）
判定理由: （詳細記述）
MINOR 件数: 0
MAJOR 件数: 0
CRITICAL 件数: 0
```

---

## Phase 4 開始条件

以下を全て満たした場合のみ Phase 4 へ進む：

- [ ] 判定が PASS または MINOR であること
- [ ] MAJOR 指摘がゼロであること
- [ ] CRITICAL 指摘がゼロであること
- [ ] Phase 1・Phase 2 の全成果物が `outputs/phase-1/` と `outputs/phase-2/` に出力済みであること

---

## 完了条件チェックボックス

- [ ] 全レビュー観点チェックが完了している（12 項目）
- [ ] 総合判定（PASS / MINOR / MAJOR / CRITICAL）が記録されている
- [ ] MINOR がある場合、MINOR 追跡テーブルに記録されている
- [ ] MAJOR / CRITICAL がある場合、戻り先と理由が明記されている
- [ ] `outputs/phase-3/gate-decision.md` が出力されている

---

## Phase 末端アクション

### PASS / MINOR の場合

```bash
# artifacts.json の Phase 3 ステータスを更新する
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE --phase 3 \
  --artifacts "outputs/phase-3/gate-decision.md:設計レビューゲート判定結果"
```

Phase 3 完了後、**Phase 4（テスト作成）へ進む。**

### MAJOR の場合

Phase 2（設計）へ戻り、指摘された問題を修正してから Phase 3 を再実施する。

### CRITICAL の場合

Phase 1（要件定義）へ戻り、要件の根本から見直してから Phase 2・Phase 3 を再実施する。
