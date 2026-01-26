# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| Phase名    | 最終レビューゲート              |
| 前提Phase  | Phase 9                         |
| 後続Phase  | Phase 11                        |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

Phase 1〜9の成果物を総合的にレビューし、本番リリースに向けた最終確認を行う。

## 背景

Phase 9までで品質保証が完了した。マージ前の最終確認として、実装が要件を満たしているかを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件充足確認

**目的**: Phase 1で定義した要件が全て満たされているか確認する

**実行手順**:

1. 機能要件チェック:

   | 要件ID | 要件内容                           | 充足 |
   | ------ | ---------------------------------- | ---- |
   | FR-1   | skillAPI onPermissionメソッド実装  | ?    |
   | FR-2   | skillAPI respondPermissionメソッド | ?    |
   | FR-3   | SkillStreamDisplay統合             | ?    |
   | FR-4   | PermissionDialog再利用             | ?    |
   | FR-5   | IPCチャネル定義                    | ?    |

2. 非機能要件チェック:

   | 要件ID | 要件内容             | 充足 |
   | ------ | -------------------- | ---- |
   | NFR-1  | 応答時間 < 100ms     | ?    |
   | NFR-2  | メモリリーク無し     | ?    |
   | NFR-3  | WCAG 2.1 AA準拠      | ?    |
   | NFR-4  | Line Coverage 80%+   | ?    |
   | NFR-5  | Branch Coverage 60%+ | ?    |

**期待される成果物**:

- `outputs/phase-10/requirements-check.md`: 要件充足確認結果

---

### タスク2: 設計適合確認

**目的**: Phase 2の設計に適合しているか確認する

**実行手順**:

1. API設計適合確認:
   - skillAPI拡張が設計通りか
   - 型定義が設計通りか

2. IPC設計適合確認:
   - チャネル名が設計通りか
   - データフロー（シーケンス）が設計通りか

3. コンポーネント設計適合確認:
   - SkillStreamDisplayの構造が設計通りか
   - PermissionDialogの再利用が適切か

**期待される成果物**:

- `outputs/phase-10/design-compliance.md`: 設計適合確認結果

---

### タスク3: TASK-3-1-C統合確認

**目的**: Main Process側（TASK-3-1-C）との統合が正しいか確認する

**実行手順**:

1. IPC通信確認:
   - SKILL_PERMISSION_REQUESTがMain → Rendererに正しく送信されるか
   - SKILL_PERMISSION_RESPONDがRenderer → Mainに正しく送信されるか

2. データフォーマット確認:
   - SkillPermissionRequestの構造がMain Processと一致しているか
   - SkillPermissionResponseの構造がMain Processと一致しているか

3. エラーハンドリング確認:
   - IPC通信エラー時の挙動が適切か

**期待される成果物**:

- `outputs/phase-10/integration-check.md`: TASK-3-1-C統合確認結果

---

### タスク4: 最終判定

**目的**: 本番リリース可否を最終判定する

**実行手順**:

1. チェックリスト確認:
   - [ ] 全機能要件が充足
   - [ ] 全非機能要件が充足
   - [ ] 設計に適合
   - [ ] TASK-3-1-Cと統合可能
   - [ ] 全テストPASS
   - [ ] 品質基準達成

2. 判定:
   - 全項目OK → Phase 11へ進行
   - いずれかNG → 該当Phaseへ戻る

**期待される成果物**:

- `outputs/phase-10/final-judgment.md`: 最終判定結果

---

## 参照資料

| 参照資料      | パス               | 内容             |
| ------------- | ------------------ | ---------------- |
| Phase 1要件   | `outputs/phase-1/` | 要件定義         |
| Phase 2設計   | `outputs/phase-2/` | 設計ドキュメント |
| Phase 9品質   | `outputs/phase-9/` | 品質検証結果     |
| TASK-3-1-C PR | GitHub PR          | Main Process実装 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容            |
| ------------------------- | --------------------------------------------------------------------------- | --------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | IPC統合パターン |

---

## 成果物

| 成果物       | パス                                     | 内容           |
| ------------ | ---------------------------------------- | -------------- |
| 要件充足確認 | `outputs/phase-10/requirements-check.md` | 要件チェック   |
| 設計適合確認 | `outputs/phase-10/design-compliance.md`  | 設計チェック   |
| 統合確認     | `outputs/phase-10/integration-check.md`  | TASK-3-1-C連携 |
| 最終判定     | `outputs/phase-10/final-judgment.md`     | リリース判定   |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 10での統合テスト連携アクション:**

- TASK-3-1-Cとの統合テスト結果を確認する
- 全ての統合テストがPASSしていることを確認する

---

## 完了条件

- [ ] 全機能要件が充足している
- [ ] 全非機能要件が充足している
- [ ] 設計に適合している
- [ ] TASK-3-1-Cとの統合が確認されている
- [ ] 最終判定がPASS

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## ゲート判定

| 判定 | 条件               | 次のアクション  |
| ---- | ------------------ | --------------- |
| PASS | 全チェック項目OK   | Phase 11へ進行  |
| NG   | いずれかの項目がNG | 該当Phaseへ戻る |

---

## 依存関係

- **前提**: Phase 9（品質保証）が完了していること
- **後続**: Phase 11（手動テスト）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-11-manual-test.md`
