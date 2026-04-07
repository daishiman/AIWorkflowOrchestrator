# Phase 2 成果物: 設計 - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## 実行日時

2026-04-06

## 環境前提

| 環境項目                  | 条件                                                     |
| ------------------------- | -------------------------------------------------------- |
| 起動モード                | 開発モード（`pnpm --filter @repo/desktop dev`）          |
| API key 状態              | 未設定（または degraded）→ `terminal_handoff` 状態を再現 |
| Skill                     | 任意のスキルが存在すること                               |
| Plan 実行可能             | Skill Creator で Plan 実行できる状態であること           |
| integrated_api 用 API key | 有効な API key が別途設定可能であること（対照用）        |

## 操作シナリオ設計（capture ID 対応表）

### シナリオA: terminal_handoff 状態の HandoffGuidance 表示

capture ID: `SCREENSHOT-TASK07-HANDOFF-01`

| ステップ | 操作内容                                   | 期待表示                                     |
| -------- | ------------------------------------------ | -------------------------------------------- |
| A-1      | API key なし状態でデスクトップアプリを起動 | 起動完了                                     |
| A-2      | Skill Creator を開く                       | SkillLifecyclePanel 表示                     |
| A-3      | 任意のスキルを選択し Plan を実行           | Plan 実行開始                                |
| A-4      | `terminal_handoff` への遷移を確認          | `HandoffGuidance` コンポーネントが表示される |
| A-5      | screenshot 取得                            | `terminal_handoff-handoff-guidance.png`      |

### シナリオB: disclosure summary 表示

capture ID: `SCREENSHOT-TASK07-DISCLOSURE-01`

| ステップ | 操作内容                                   | 期待表示                                                             |
| -------- | ------------------------------------------ | -------------------------------------------------------------------- |
| B-1      | シナリオA の terminal_handoff 状態から継続 | HandoffGuidance 表示中                                               |
| B-2      | disclosure summary セクションを確認        | `data-testid="skill-lifecycle-disclosure-summary"` が DOM に存在する |
| B-3      | disclosure summary セクションを表示させる  | disclosure summary の内容が展開されている                            |
| B-4      | screenshot 取得                            | `disclosure-summary-display.png`                                     |

### シナリオC: integrated_api 成功後（対照用）

capture ID: `SCREENSHOT-TASK07-INTEGRATED-01`

| ステップ | 操作内容                                | 期待表示                                |
| -------- | --------------------------------------- | --------------------------------------- |
| C-1      | 有効な API key を設定してアプリを再起動 | API key 設定済み状態                    |
| C-2      | Skill Creator を開く                    | SkillLifecyclePanel 表示                |
| C-3      | 任意のスキルを選択し Plan を実行        | Plan 実行開始                           |
| C-4      | `integrated_api` での成功状態を確認     | integrated_api パスが表示される         |
| C-5      | screenshot 取得                         | `integrated-api-success-comparison.png` |

## evidence 保存先

```
docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/
└── outputs/
    └── phase-11/
        ├── manual-test-checklist.md
        ├── manual-test-result.md
        ├── manual-test-report.md
        ├── discovered-issues.md
        ├── ui-sanity-visual-review.md
        ├── screenshot-plan.json
        ├── screenshot-coverage.md
        └── screenshots/
            ├── terminal_handoff-handoff-guidance.png      ← シナリオA
            ├── disclosure-summary-display.png              ← シナリオB
            ├── integrated-api-success-comparison.png       ← シナリオC
            └── phase11-capture-metadata.json
```

## Phase 4〜8 N/A 設計根拠

| Phase | N/A 理由                                                                  |
| ----- | ------------------------------------------------------------------------- |
| 4     | コード変更なし。`SkillLifecyclePanel.tsx` の実装は TASK-SDK-07 で完了済み |
| 5     | コード変更なし。手動操作のみ実施                                          |
| 6     | テスト追加対象コードがない                                                |
| 7     | coverage 計測対象のコード変更がない                                       |
| 8     | リファクタリング対象なし                                                  |

## 完了確認

- [x] 環境前提が定義されている
- [x] 3シナリオ（A・B・C）の操作手順が capture ID 対応表付きで定義されている
- [x] evidence 保存先が明確である
- [x] manual-test-result.md 追記内容が設計されている
- [x] Phase 4〜8 の N/A 根拠が記録されている
