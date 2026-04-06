# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 10                             |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

実装完了後、全体的な品質・整合性を検証し、Phase 11（手動テスト）へ進める判定を行う。

## 実行タスク

- 受け入れ条件の全項目確認: AC-1〜AC-8の達成を検証
- 設計との整合性確認: Phase 2設計どおりに実装されているか
- 後方互換性確認: Layer1/2の既存表示が壊れていないか
- MINOR指摘の記録: 軽微な問題は未タスク候補として記録

## 参照資料

| 資料名        | パス                                        | 説明                   |
| ------------- | ------------------------------------------- | ---------------------- |
| Phase 1成果物 | `outputs/phase-1/requirements.md`           | 受け入れ条件（AC）一覧 |
| Phase 2成果物 | `outputs/phase-2/design.md`                 | 設計書                 |
| Phase 9成果物 | `outputs/phase-9/quality-report.md`         | 品質ゲート結果         |
| Phase 5成果物 | `outputs/phase-5/implementation-summary.md` | 実装の最終確認         |

## 実行手順

### Step 1: 受け入れ条件の全項目確認

| AC-ID | 受け入れ条件                                         | 確認方法   | 結果       |
| ----- | ---------------------------------------------------- | ---------- | ---------- |
| AC-1  | Layer1/2/3/4の各グループがアコーディオンで表示される | テスト確認 | {{RESULT}} |
| AC-2  | layer3のcheckがLayer 3グループ内に表示される         | テスト確認 | {{RESULT}} |
| AC-3  | severity=errorに`✗`アイコン、warningに`⚠`、infoに`✓` | テスト確認 | {{RESULT}} |
| AC-4  | Layerヘッダーに集計バッジが表示される                | テスト確認 | {{RESULT}} |
| AC-5  | checksが空のLayerグループは表示されない              | テスト確認 | {{RESULT}} |
| AC-6  | `pnpm typecheck`がエラー0件で完了する                | CLI実行    | {{RESULT}} |
| AC-7  | Layerヘッダークリックで開閉動作する                  | テスト確認 | {{RESULT}} |
| AC-8  | `pnpm test`が全テストPASSで完了する                  | CLI実行    | {{RESULT}} |

### Step 2: 設計整合性確認

| チェック項目                                  | 判定 | 備考 |
| --------------------------------------------- | ---- | ---- |
| `LAYER_ORDER`定数が定義されている             | -    |      |
| `layerLabels`定数が4Layer分定義されている     | -    |      |
| `verifyCheckSeverityIcon`定数が定義されている | -    |      |
| `checksByLayer` useMemoが実装されている       | -    |      |
| `expandedLayers` useStateが実装されている     | -    |      |
| `toggleLayer`関数が実装されている             | -    |      |
| 空Layerフィルタリングが実装されている         | -    |      |
| IPC型・バックエンドに変更なし                 | -    |      |

### Step 3: 判定

| 判定     | 条件             | 対応                                   |
| -------- | ---------------- | -------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                         |
| MINOR    | 軽微な指摘あり   | 未完了タスクとして記録後Phase 11へ進行 |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定           |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認    |

## 統合テスト連携【必須】

| レビュー項目 | 確認内容                     |
| ------------ | ---------------------------- |
| 全テスト結果 | TC-01〜TC-19が全PASS         |
| カバレッジ   | Line/Branch/Function基準達成 |
| 型チェック   | TypeScriptエラー0件          |

## 成果物

| 成果物       | パス                                      | 説明         |
| ------------ | ----------------------------------------- | ------------ |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果記録 |

## 完了条件

- [ ] AC-1〜AC-8の全項目が確認されている
- [ ] 設計整合性チェックが完了している
- [ ] PASS/MINOR/MAJOR/CRITICALの判定が記録されている
- [ ] MINOR指摘がある場合は未タスク候補として記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証
