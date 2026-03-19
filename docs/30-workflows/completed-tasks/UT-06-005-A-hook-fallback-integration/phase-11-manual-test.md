# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## タスク種別判定

| タスク種別                             | 判定条件                                                             | 判定結果 |
| -------------------------------------- | -------------------------------------------------------------------- | -------- |
| 設計タスク                             | タスク種別が「設計・仕様策定」、UI実装なし                           | 非該当   |
| docs-only タスク                       | UI変更なし、ドキュメント・設定変更のみ                               | 非該当   |
| **UI タスク以外（Main Process 実装）** | Renderer コンポーネントの追加・変更なし、Main Process サービス層のみ | **該当** |

本タスクは UI 変更を含まない Main Process のサービス層実装のため、**docs-only task テンプレート**を適用する。

### docs-only task チェック項目

| チェック項目                                    | 確認内容                                                                         |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| SKILL.md から family file へ辿れるか            | `.claude/skills/aiworkflow-requirements/SKILL.md` から関連ファイルへのリンク確認 |
| LOGS.md から archive へ辿れるか                 | `.claude/skills/aiworkflow-requirements/LOGS.md` からアーカイブへのリンク確認    |
| `.claude` と `.agents` の file set が一致するか | 両ディレクトリのファイルセット整合性確認                                         |
| validator command を再実行できるか              | `validate-phase-output.js` コマンドの実行確認                                    |

## 目的

PreToolUse Hook フォールバック統合の最終動作を手動で検証する。Phase 4-10 で作成・検証されたコードが実際のスキル実行フローで正しく動作することを確認する。このタスクは UI 変更を含まない Main Process のサービス層のみの実装のため、DevTools Console ログと自動テスト結果を検証エビデンスとして活用する（P53対策）。

## 実行タスク

- 機能テスト: Permission 拒否時のフォールバック動作（abort/skip/retry）をテストで確認する
- 統合テスト: PreToolUse Hook の統合フローを確認する（FR-001〜FR-003 への非影響確認を含む）
- リグレッションテスト: 既存の FR-001〜FR-003（危険コマンドチェック・保護パスチェック・通知）が正常動作することを確認する
- タイムアウトテスト: Permission タイムアウト時の abort 自動遷移を確認する
- fail-closed テスト: フォールバック処理の例外時に abort に遷移することを確認する

## 参照資料

| 資料名                    | パス                                                                                         | 説明                                    |
| ------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 1 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`                                                     | AC-001〜AC-007 の検証条件               |
| Phase 2 設計書            | `outputs/phase-2/architecture-design.md`                                                     | 統合設計とシーケンス図                  |
| Phase 9 品質検証結果      | `outputs/phase-9/quality-gate-result.md`                                                     | Lint・型チェック・テスト PASS 確認      |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                    | 判定結果（PASS/MINOR/MAJOR）            |
| Phase 5 実装成果物        | `outputs/phase-5/implementation-summary.md`                                                  | 実装内容の確認                          |
| Phase 6 テスト拡充        | `outputs/phase-6/coverage-report.md`                                                         | 追加テストの網羅状況                    |
| Phase 7 カバレッジ確認    | `outputs/phase-7/coverage-report.md`                                                         | カバレッジ継続基準                      |
| Phase 8 リファクタリング  | `outputs/phase-8/refactoring-log.md`                                                         | 最終実装改善履歴                        |
| Permission フォールバック | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| セキュリティ要件          | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed セキュリティ要件            |

## 依存フェーズ

- Phase 9: `outputs/phase-9/quality-gate-result.md`（品質ゲート結果）
- Phase 10: `outputs/phase-10/final-review-result.md`（最終レビュー結果）
- Phase 8: `outputs/phase-8/refactoring-log.md`（実装観点の追跡）
- Phase 1: `outputs/phase-1/requirements-definition.md`（要件定義）
- Phase 2: `outputs/phase-2/architecture-design.md`（設計図）
- Phase 5: `outputs/phase-5/implementation-summary.md`（実装内容）
- Phase 6: `outputs/phase-6/coverage-report.md`（テスト拡充）
- Phase 7: `outputs/phase-7/coverage-report.md`（カバレッジ維持）

## テストケース

| TC-ID  | 内容                                                           | 依存フェーズ/観点 |
| ------ | -------------------------------------------------------------- | ----------------- |
| TC-001 | Permission 拒否時に abort フォールバックが実行されることを確認 | Phase 9/10        |
| TC-002 | Permission 拒否時に skip フォールバックが実行されることを確認  | Phase 9/10        |
| TC-003 | Permission 拒否時に retry フォールバックが実行されることを確認 | Phase 9/10        |
| TC-004 | タイムアウト時に abort フォールバックが実行されることを確認    | Phase 9/10        |
| TC-005 | フォールバック例外時に fail-closed が適用されることを確認      | Phase 9/10        |
| TC-006 | 既存 FR-001〜FR-003 が regress しないことを確認                | Phase 4/5         |
| TC-007 | 既存テスト全件が PASS であることを確認                         | Phase 4/6         |

## 画面カバレッジマトリクス

| TC-ID  | 検証内容                     | 証跡                     |
| ------ | ---------------------------- | ------------------------ |
| TC-001 | abort フォールバック         | `screenshots/tc-001.png` |
| TC-002 | skip フォールバック          | `screenshots/tc-002.png` |
| TC-003 | retry フォールバック         | `screenshots/tc-003.png` |
| TC-004 | timeout フォールバック       | `screenshots/tc-004.png` |
| TC-005 | fail-closed フロー           | `screenshots/tc-005.png` |
| TC-006 | 既存 FR-001〜FR-003 回帰確認 | `screenshots/tc-006.png` |
| TC-007 | 全テスト PASS 確認           | `screenshots/tc-007.png` |

## 実行手順

### ステップ0: CLI 環境での制約確認（P53対策）

このタスクは UI 変更を含まない Main Process のサービス層実装のため、以下の代替検証方式を採用する。

| 検証方式           | 内容                                                       |
| ------------------ | ---------------------------------------------------------- |
| 自動テスト結果     | `pnpm --filter @repo/desktop exec vitest run` の PASS 確認 |
| カバレッジレポート | 行カバレッジ・分岐カバレッジの数値確認                     |
| DevTools ログ確認  | Electron 起動後の DevTools Console でのログ確認手順を記載  |
| テストログ出力     | 各シナリオのテスト実行ログを検証エビデンスとして記録       |

### ステップ1: テスト環境の準備

```bash
# テスト実行ディレクトリの確認（P40対策）
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-072414-wt-2

# 関連テストのみ実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/

# 全体のリグレッションテスト確認
pnpm --filter @repo/desktop exec vitest run
```

### ステップ2: 機能テスト - フォールバック動作確認

#### テスト2-A: abort フォールバック（AC-005）

```bash
# abort フォールバックのテスト実行とログ確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/ \
  --reporter=verbose 2>&1 | grep -A 5 "abort"
```

| 確認項目                                                    | 期待結果                  | 確認状態               |
| ----------------------------------------------------------- | ------------------------- | ---------------------- |
| Permission 拒否時に processPermissionFallback が1回呼ばれる | モック検証で PASS         | 確認済み（2026-03-17） |
| abort 時にスキル実行が停止する                              | エラーがスローされる      | 確認済み（2026-03-17） |
| abort フローが冪等である                                    | 二重 abort でエラー非発生 | 確認済み（2026-03-17） |

#### テスト2-B: skip フォールバック（AC-004）

| 確認項目                                                  | 期待結果                         | 確認状態               |
| --------------------------------------------------------- | -------------------------------- | ---------------------- |
| skip 時に `{ proceed: false, message: "..." }` が返される | 戻り値検証で PASS                | 確認済み（2026-03-17） |
| 後続処理が継続する                                        | スキル実行フローが継続状態で返る | 確認済み（2026-03-17） |

#### テスト2-C: retry フォールバック（AC-003）

| 確認項目                                           | 期待結果                          | 確認状態               |
| -------------------------------------------------- | --------------------------------- | ---------------------- |
| retry 時に sendPermissionRequest が再度呼ばれる    | 呼び出し回数が最大3回以内         | 確認済み（2026-03-17） |
| retry 上限到達後に適切なフォールバックが実行される | maxRetries 超過後の動作が仕様通り | 確認済み（2026-03-17） |

### ステップ3: タイムアウトテスト（AC-002）

```bash
# タイムアウトテストの実行（P13対策: advanceTimersByTime 使用）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/ \
  --reporter=verbose 2>&1 | grep -A 5 "timeout"
```

| 確認項目                                                   | 期待結果                           | 確認状態               |
| ---------------------------------------------------------- | ---------------------------------- | ---------------------- |
| タイムアウト発生時に PermissionTimeoutError がスローされる | catch ブロックで検知               | 確認済み（2026-03-17） |
| タイムアウト時に executeAbortFlow("timeout") が呼ばれる    | abort フローに遷移                 | 確認済み（2026-03-17） |
| タイマーのリーク（clearTimeout 未実行）がない              | AbortSignal クリーンアップ動作確認 | 確認済み（2026-03-17） |

### ステップ4: fail-closed テスト（AC-006、NFR-101）

| 確認項目                                                     | 期待結果               | 確認状態               |
| ------------------------------------------------------------ | ---------------------- | ---------------------- |
| フォールバック処理自体が例外を出した場合に abort に遷移する  | fail-closed が動作する | 確認済み（2026-03-17） |
| catch (fallbackError) ブロックで executeAbortFlow が呼ばれる | テストで PASS          | 確認済み（2026-03-17） |

### ステップ5: リグレッションテスト - 既存 FR-001〜FR-003 の確認（NFR-105）

```bash
# 既存テストが全 PASS であることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/ \
  --reporter=verbose 2>&1 | tail -20
```

| 確認項目                                         | 期待結果                   | 確認状態               |
| ------------------------------------------------ | -------------------------- | ---------------------- |
| FR-001: 危険コマンドチェックが正常動作する       | 既存テストが全 PASS        | 確認済み（2026-03-17） |
| FR-002: 保護パスチェックが正常動作する           | 既存テストが全 PASS        | 確認済み（2026-03-17） |
| FR-003: ツール実行開始通知が正常動作する         | 既存テストが全 PASS        | 確認済み（2026-03-17） |
| 既存 275+ テストケースが全 PASS である（AC-007） | テスト件数と PASS 数が一致 | 確認済み（2026-03-17） |

### ステップ6: DevTools による動作確認（補足）

CLI 環境では以下の手順で Electron アプリの DevTools を確認できる場合に実施する。

```bash
# Electron アプリの起動（開発モード）
pnpm --filter @repo/desktop dev
```

DevTools Console で以下を確認:

1. `[SkillExecutor] handlePermissionCheck` ログが Permission チェック時に出力されること
2. `[SkillExecutor] executeAbortFlow` ログが abort 時に出力されること
3. `[SkillExecutor] executeSkipFlow` ログが skip 時に出力されること
4. 既存の FR-001〜FR-003 のログが Permission チェック前に出力されること（挿入順序確認）

### ステップ7: ウォークスルーシナリオ発見事項の分類記録

テスト実行中に発見した事項を以下のリアルタイム分類テーブルに記録する:

| #   | シナリオ                  | 発見事項     | 分類                  | 対応方針 |
| --- | ------------------------- | ------------ | --------------------- | -------- |
| 1   | A（abort フォールバック） | 特記事項なし | Blocker / Note / Info | 対応不要 |
| 2   | B（skip フォールバック）  | 特記事項なし | Blocker / Note / Info | 対応不要 |
| 3   | C（retry フォールバック） | 特記事項なし | Blocker / Note / Info | 対応不要 |
| 4   | タイムアウト              | 特記事項なし | Blocker / Note / Info | 対応不要 |
| 5   | fail-closed               | 特記事項なし | Blocker / Note / Info | 対応不要 |
| 6   | リグレッション            | 特記事項なし | Blocker / Note / Info | 対応不要 |

**分類基準:**

- **Blocker**: Phase 12 完了前に修正必須
- **Note**: 改善推奨だが Phase 12 完了をブロックしない
- **Info**: 記録のみ

### ステップ8: 検証エビデンスの記録

以下の内容を `outputs/phase-11/manual-test-result.md` に記録する:

- テスト実行コマンドと日時
- テスト件数と PASS/FAIL の結果
- AC-001〜AC-007 の各受け入れ基準の検証結果
- 発見した問題点のシナリオ分類テーブル（ステップ7のコピー）

Blocker または Note に分類された事項を `outputs/phase-11/discovered-issues.md` に記録する:

- Blocker: Phase 12 完了前に対応する修正内容と対応結果
- Note: 改善推奨の内容と未タスク候補としての記録

## 統合テスト連携（Phase 11 は必須）

| 統合テストシナリオ                        | 対応する受け入れ基準 | 実行方法                          |
| ----------------------------------------- | -------------------- | --------------------------------- |
| Permission 拒否 → abort フォールバック    | AC-001, AC-005       | vitest run（自動テスト）          |
| Permission 拒否 → skip フォールバック     | AC-001, AC-004       | vitest run（自動テスト）          |
| Permission 拒否 → retry → 最終 abort      | AC-001, AC-003       | vitest run（自動テスト）          |
| Permission タイムアウト → abort           | AC-002               | vitest run（advanceTimersByTime） |
| フォールバック例外 → fail-closed（abort） | AC-006               | vitest run（例外注入テスト）      |
| 既存 FR-001〜FR-003 のリグレッション      | AC-007               | vitest run（全件）                |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                  |
| ------------------ | -------- | --------------------------------------------------------- |
| セキュリティ       | 適用     | fail-closed 原則が全パスで動作すること                    |
| パフォーマンス     | 適用     | タイムアウト値（30000ms）が正常に機能すること             |
| 後方互換性         | 適用     | 既存 FR-001〜FR-003 への影響がないこと（NFR-105）         |
| エラーハンドリング | 適用     | 例外発生時の abort 遷移が確実に動作すること               |
| 冪等性             | 適用     | abort フローの二重実行でエラーが発生しないこと（NFR-103） |

## 成果物

| 成果物           | パス                                      | 説明                                                             |
| ---------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`  | walkthrough 結果（AC-001〜007 の検証結果・シナリオ分類テーブル） |
| 発見事項レポート | `outputs/phase-11/discovered-issues.md`   | Blocker と Note の一覧（0件でも必須）                            |
| テスト実行ログ   | `outputs/phase-11/test-execution-log.txt` | vitest 実行ログ（PASS/FAIL 件数含む）                            |

## 完了条件

- [ ] AC-001〜AC-007 の全受け入れ基準が検証されている
- [ ] abort/skip/retry の各フォールバックパスが確認されている
- [ ] タイムアウト（FR-102）の動作が確認されている
- [ ] fail-closed（NFR-101）の動作が確認されている
- [ ] 既存 FR-001〜FR-003 のリグレッションテストが全 PASS である
- [ ] 既存 275+ テストケースが全 PASS である（AC-007）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている（walkthrough 結果）
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている（0件でも必須）
- [ ] ウォークスルーシナリオ発見事項リアルタイム分類テーブルが記録されている
- [ ] docs-only task チェック項目が確認されている
- [ ] Phase 10 で指摘された MINOR 対応が全て完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. テスト環境の準備とコマンド確認
2. 機能テスト: abort フォールバック確認
3. 機能テスト: skip フォールバック確認
4. 機能テスト: retry フォールバック確認
5. タイムアウトテスト確認
6. fail-closed テスト確認
7. リグレッションテスト（FR-001〜FR-003）確認
8. DevTools 補足確認（環境に応じて）
9. 検証エビデンスの記録・成果物作成
10. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
