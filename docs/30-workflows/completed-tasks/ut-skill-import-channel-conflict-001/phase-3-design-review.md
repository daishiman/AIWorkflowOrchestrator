# Phase 3: 設計レビュー - UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                      |
| Phase              | 3（設計レビュー）                                                                         |
| 機能名             | ut-skill-import-channel-conflict-001                                                      |
| 作成日             | 2026-02-24                                                                                |
| 前提Phase          | Phase 1（要件定義）、Phase 2（設計）                                                      |
| 目的               | Phase 2 で設計した修正方針の妥当性を検証する                                              |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-3/` |

## 目的

Phase 2 の修正方針設計が以下の3観点で妥当であることをレビューする:

1. **要件充足性**: Phase 1 の全要件（FR-001〜FR-006, NFR-001〜NFR-003）が設計でカバーされているか
2. **技術的妥当性**: 修正内容がプロジェクトの設計原則・セキュリティルールに適合するか
3. **整合性**: 修正箇所間で矛盾がないか

## 背景

- 本タスクは仕様書修正のみタスクであり、コード変更は含まない
- 設計レビューは仕様書修正の方針・内容に対して行う
- P5（`ipcMain.handle()` 二重登録例外）および P44（IPCハンドラとPreloadのインターフェース不整合）の再発防止が主要な目的

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 3-1: 要件充足性レビュー

**目的**: Phase 1 で定義した全要件が Phase 2 の設計でカバーされていることを検証する

**レビューマトリクス**:

| 要件ID  | 要件内容                                                         | 設計タスク  | カバー状況 | 備考 |
| ------- | ---------------------------------------------------------------- | ----------- | ---------- | ---- |
| FR-001  | TASK-9F 外部インポートチャネルを `skill:importFromSource` に改名 | Task 2-1 #1 | カバー対象 |      |
| FR-002  | task-022 の Step 3 チャネル名修正                                | Task 2-1 #1 | カバー対象 |      |
| FR-003  | task-030 セクション15B.2 IPC テーブル修正                        | Task 2-2 #4 | カバー対象 |      |
| FR-004  | task-030 セクション11 に3チャネル追加                            | Task 2-2 #6 | カバー対象 |      |
| FR-005  | task-022 artifacts.modifies に `channels.ts` 追加                | Task 2-1 #2 | カバー対象 |      |
| FR-006  | 既存 `skill:import` の仕様に変更を加えない                       | Task 2-4    | カバー対象 |      |
| NFR-001 | `skill:import` と `skill:importFromSource` の用途が明確に区別    | Task 2-5    | カバー対象 |      |
| NFR-002 | 全仕様書でチャネル名の一貫性が保たれていること                   | Task 2-4    | カバー対象 |      |
| NFR-003 | TASK-9F 実装時に参照する注記が追加されていること                 | Task 2-1 #3 | カバー対象 |      |

**判定基準**:

| 判定 | 条件                                       |
| ---- | ------------------------------------------ |
| PASS | 全要件が設計でカバーされており、漏れがない |
| FAIL | 1つ以上の要件が設計でカバーされていない    |

---

### Task 3-2: 技術的妥当性レビュー

**目的**: 修正内容がプロジェクトの設計原則・セキュリティルールに適合するかを検証する

**レビュー観点**:

#### 3-2a: IPC セキュリティ原則との適合

| 確認項目                                                 | 適合状況 | 根拠                                                          |
| -------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| チャネル名はホワイトリストで管理される設計になっているか | 対象     | `channels.ts` への追加が artifacts.modifies に含まれている    |
| チャネル名に定数を使用する設計になっているか             | 対象     | `channels.ts` で定数定義し、ハンドラ・Preload から参照する    |
| 引数バリデーションの設計が含まれているか                 | 対象外   | 本タスクは仕様書修正のみ。バリデーション実装は TASK-9F で行う |
| P42 準拠の3段バリデーション設計があるか                  | 対象外   | 本タスクは仕様書修正のみ。TASK-9F 仕様書内に記載済み          |

#### 3-2b: チャネル命名規則との適合

| 確認項目                                          | 適合状況 | 根拠                                                  |
| ------------------------------------------------- | -------- | ----------------------------------------------------- |
| `skill:` プレフィックスを使用しているか           | ✅       | `skill:importFromSource` は `skill:` プレフィックス   |
| 動作名が明確であるか                              | ✅       | `importFromSource` で外部ソースからのインポートが明確 |
| 既存チャネル名との衝突がないか                    | ✅       | `skill:importFromSource` は未使用の新規チャネル名     |
| `skill:validateSource` は命名規則に準拠しているか | ✅       | `skill:` + 動作名パターンに準拠                       |
| `skill:export` は命名規則に準拠しているか         | ✅       | `skill:` + 動作名パターンに準拠                       |

#### 3-2c: P5/P44 パターン再発防止の検証

| 確認項目                                               | 検証結果 | 根拠                                                          |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------- |
| 同一チャネル名の二重定義が解消されているか（P5対策）   | ✅       | `skill:import`(既存) と `skill:importFromSource`(新規) で分離 |
| 引数型の不整合が解消されているか（P44対策）            | ✅       | 各チャネルが独自の引数型を持ち、混同リスクなし                |
| Preload側の型定義更新が計画に含まれているか（P32対策） | ✅       | artifacts.modifies に `preload/types.ts` を追加済み           |
| `channels.ts` への追加が計画に含まれているか           | ✅       | artifacts.modifies に `channels.ts` を追加済み                |

**判定基準**:

| 判定 | 条件                                             |
| ---- | ------------------------------------------------ |
| PASS | 全ての技術的チェック項目が適合（✅または対象外） |
| FAIL | 1つ以上の技術的チェック項目が不適合              |

---

### Task 3-3: 整合性レビュー

**目的**: 修正箇所間で矛盾がないことを検証する

**整合性チェック**:

| #   | チェック項目                                                                  | 期待結果                                                                      | 検証方法                           |
| --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| 1   | task-022 と task-030 で同一のチャネル名 `skill:importFromSource` を使用       | 一致している                                                                  | 修正内容の文字列比較               |
| 2   | task-022 の引数型 `ShareTarget` と task-030 セクション15B.2 の引数型が一致    | 一致している                                                                  | 修正内容の文字列比較               |
| 3   | task-030 セクション11 の新規3チャネルと task-022 の Step 3 チャネル一覧が整合 | `skill:importFromSource`, `skill:validateSource`, `skill:export` が両方に存在 | 修正内容のクロスチェック           |
| 4   | 既存 `skill:import` の引数型（`string`）が修正されていない                    | 変更なし                                                                      | 修正対象に含まれていないことを確認 |
| 5   | 修正順序（Task 2-3）が依存関係に矛盾しない                                    | 矛盾なし                                                                      | 依存関係の論理検証                 |

**判定基準**:

| 判定 | 条件                                    |
| ---- | --------------------------------------- |
| PASS | 全整合性チェック項目が「一致/矛盾なし」 |
| FAIL | 1つ以上の項目で不整合が検出された       |

---

### Task 3-4: レビュー総合判定

**目的**: Task 3-1〜3-3 の結果を総合し、Phase 3 の判定を行う

**判定基準**:

| 総合判定          | 条件                                                              | 次Phase               |
| ----------------- | ----------------------------------------------------------------- | --------------------- |
| PASS              | Task 3-1〜3-3 全てが PASS                                         | Phase 4 へ進む        |
| MINOR             | Task 3-1〜3-3 で軽微な改善点が検出された（要件充足に影響なし）    | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | Task 3-1 で要件の漏れやカバー不足が検出された                     | Phase 1 へ戻る        |
| MAJOR（設計問題） | Task 3-2 で技術的不適合または Task 3-3 で重大な不整合が検出された | Phase 2 へ戻る        |

## 参照資料

> 依存Phase成果物: Phase 1, Phase 2

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                                        |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| API IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存 `skill:import` 契約の正本確認          |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer/Preload/Main の契約整合確認        |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | チャネルホワイトリストと契約ドリフト防止    |
| Skill IPC詳細         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `skill:import` 系チャネル検証要件の詳細確認 |
| 型/チャネル調査手順   | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | チャネル名衝突時の横断確認手順              |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 3層同時更新チェック（P23/P32/P42/P44）      |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC不整合再発防止パターン参照               |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 類似タスクの再発防止知見                    |

| 資料名             | パス                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Phase 1 要件定義   | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-1-requirements.md` |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-2-design.md`       |
| レビューゲート基準 | `review-gate-criteria.md`（task-specification-creator references）                               |
| P5（二重登録）     | `.claude/rules/06-known-pitfalls.md#P5`                                                          |
| P44（IPC不整合）   | `.claude/rules/06-known-pitfalls.md#P44`                                                         |

## 統合テスト連携

本タスクは仕様書修正中心のため、統合テストは仕様間整合の確認を対象とする。

- Phase 10 の最終レビュー結果との整合を確認する。
- Phase 11 の目視確認結果を `outputs/phase-11/manual-test-result.md` に集約する。
- Phase 12 の未タスク検出・仕様更新判断へ引き継ぐ。

## 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` |

## 完了条件

- [ ] Task 3-1: 要件充足性レビューが完了し、全要件（FR-001〜FR-006, NFR-001〜NFR-003）のカバー状況が確認されている
- [ ] Task 3-2: 技術的妥当性レビューが完了し、IPC セキュリティ原則・命名規則・P5/P44 対策の適合が確認されている
- [ ] Task 3-3: 整合性レビューが完了し、修正箇所間の矛盾がないことが確認されている
- [ ] Task 3-4: レビュー総合判定が記録されている
- [ ] 成果物ファイルが `outputs/phase-3/` に出力されている
- [ ] 判定が PASS または MINOR の場合のみ Phase 4 へ進む

## 次Phase

Phase 4（テスト作成）へ進む。Phase 3 で PASS 判定の場合、Phase 4 で grep による整合性検証コマンドを設計する。
