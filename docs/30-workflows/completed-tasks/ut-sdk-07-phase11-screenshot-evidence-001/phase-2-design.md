# Phase 2: 設計 - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| 前提Phase  | Phase 1（要件定義）                       |
| 後続Phase  | Phase 3                                   |
| ステータス | complete                                  |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001 |

---

## 目的

Phase 11 手動テストで実施する操作シナリオ・capture ID 対応表・環境前提・evidence 保存先を設計し、実施者が迷わず screenshot を取得できる手順を定義する。

---

## 実行タスク

- タスク1: 環境前提と evidence 保存先を固定する
- タスク2: 3シナリオの capture ID 対応表を設計する
- タスク3: manual-test-result.md 追記内容を設計する
- タスク4: Phase 4〜8 の N/A 根拠を記録する

### タスク1: 環境前提の設計

**目的**: 手動テスト実施に必要な環境条件を明確にする。

| 環境項目                  | 条件                                                     |
| ------------------------- | -------------------------------------------------------- |
| 起動モード                | 開発モード（`pnpm --filter @repo/desktop dev`）          |
| API key 状態              | 未設定（または degraded）→ `terminal_handoff` 状態を再現 |
| Skill                     | 任意のスキルが存在すること                               |
| Plan 実行可能             | Skill Creator で Plan 実行できる状態であること           |
| integrated_api 用 API key | 有効な API key が別途設定可能であること（対照用）        |

---

### タスク2: 操作シナリオ設計（capture ID 対応表）

**目的**: TASK-SDK-07 の `screenshot-plan.json` の capture ID と対応する操作手順を設計する。

#### シナリオA: terminal_handoff 状態の HandoffGuidance 表示

| ステップ | 操作内容                                   | 期待表示                                     |
| -------- | ------------------------------------------ | -------------------------------------------- |
| A-1      | API key なし状態でデスクトップアプリを起動 | 起動完了                                     |
| A-2      | Skill Creator を開く                       | SkillLifecyclePanel 表示                     |
| A-3      | 任意のスキルを選択し Plan を実行           | Plan 実行開始                                |
| A-4      | `terminal_handoff` への遷移を確認          | `HandoffGuidance` コンポーネントが表示される |
| A-5      | screenshot 取得                            | `terminal_handoff-handoff-guidance.png`      |

capture ID: `TC-11-01`

#### シナリオB: disclosure summary 表示

| ステップ | 操作内容                                   | 期待表示                                                             |
| -------- | ------------------------------------------ | -------------------------------------------------------------------- |
| B-1      | シナリオA の terminal_handoff 状態から継続 | HandoffGuidance 表示中                                               |
| B-2      | disclosure summary セクションを確認        | `data-testid="skill-lifecycle-disclosure-summary"` が DOM に存在する |
| B-3      | disclosure summary セクションを表示させる  | disclosure summary の内容が展開されている                            |
| B-4      | screenshot 取得                            | `disclosure-summary-display.png`                                     |

capture ID: `TC-11-02`

#### シナリオC: integrated_api 成功後（対照用）

| ステップ | 操作内容                                | 期待表示                                |
| -------- | --------------------------------------- | --------------------------------------- |
| C-1      | 有効な API key を設定してアプリを再起動 | API key 設定済み状態                    |
| C-2      | Skill Creator を開く                    | SkillLifecyclePanel 表示                |
| C-3      | 任意のスキルを選択し Plan を実行        | Plan 実行開始                           |
| C-4      | `integrated_api` での成功状態を確認     | integrated_api パスが表示される         |
| C-5      | screenshot 取得                         | `integrated-api-success-comparison.png` |

capture ID: `TC-11-03`

---

### タスク3: evidence 保存先設計

**目的**: screenshot ファイルと manual-test-result.md の保存先を明確にする。

#### screenshot 保存先

```
docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/
└── outputs/
    └── phase-11/
        └── screenshots/
            ├── terminal_handoff-handoff-guidance.png      ← シナリオA
            ├── disclosure-summary-display.png              ← シナリオB
            └── integrated-api-success-comparison.png       ← シナリオC
```

#### manual-test-result.md 追記内容の設計

`outputs/phase-11/manual-test-result.md` に以下のセクションを追記:

```markdown
## UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001 evidence 追記

### 取得 screenshot

| capture ID | ファイル名                            | 取得日   | 状態   |
| ---------- | ------------------------------------- | -------- | ------ |
| TC-11-01   | terminal_handoff-handoff-guidance.png | {{DATE}} | 取得済 |
| TC-11-02   | disclosure-summary-display.png        | {{DATE}} | 取得済 |
| TC-11-03   | integrated-api-success-comparison.png | {{DATE}} | 取得済 |

### 確認済み AC

- [x] AC-1: terminal_handoff HandoffGuidance screenshot 取得
- [x] AC-2: disclosure summary screenshot 取得
- [x] AC-3: integrated_api 成功後 screenshot 取得（対照）
- [x] AC-4: screenshots/ に配置済み
- [x] AC-5: screenshot-plan.json capture ID と対応
- [x] AC-6: manual-test-result.md に evidence 追記済み
```

#### 追加 evidence bundle

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/ui-sanity-visual-review.md`
- `outputs/phase-11/screenshot-coverage.md`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`

---

### タスク4: Phase 4〜8 N/A 設計記録

**目的**: docs-only タスクの Phase 4〜8 が N/A である設計根拠を記録する。

| Phase | N/A 理由                                                                  |
| ----- | ------------------------------------------------------------------------- |
| 4     | コード変更なし。`SkillLifecyclePanel.tsx` の実装は TASK-SDK-07 で完了済み |
| 5     | コード変更なし。手動操作のみ実施                                          |
| 6     | テスト追加対象コードがない                                                |
| 7     | coverage 計測対象のコード変更がない                                       |
| 8     | リファクタリング対象なし                                                  |

---

## 参照資料

| 参照資料                | パス                                                                                  | 内容               |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| 元未タスク仕様書        | `docs/30-workflows/unassigned-task/task-ut-sdk-07-phase11-screenshot-evidence-001.md` | タスク詳細         |
| TASK-SDK-07 実装ガイド  | `step-05-seq-task-07-*/outputs/phase-12/implementation-guide.md`                      | UI 構造確認        |
| SkillLifecyclePanel.tsx | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                  | 対象コンポーネント |

---

## 成果物

| 成果物         | パス                        | 内容                            |
| -------------- | --------------------------- | ------------------------------- |
| 設計書（本書） | `outputs/phase-2/design.md` | 操作シナリオ・capture ID 対応表 |
| 追加 evidence  | `outputs/phase-11/`         | checklist / report / coverage   |

---

## 統合テスト連携

- Phase 11 の manual-test-result.md に本設計の capture ID / 保存先を反映する
- Phase 12 の documentation-changelog.md で Phase 2 の設計結果を current facts として記録する

## 完了条件

- [ ] 環境前提が定義されている
- [ ] 3シナリオ（A・B・C）の操作手順が capture ID 対応表付きで定義されている
- [ ] evidence 保存先が明確である
- [ ] manual-test-result.md 追記内容が設計されている
- [ ] Phase 4〜8 の N/A 根拠が記録されている

## タスク100%実行確認【必須】

全完了条件を確認し、Phase 2 が完了したことを記録すること。

## 次Phase

Phase 3: 設計レビューゲート
