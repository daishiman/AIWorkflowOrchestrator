# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| タスクID | UT-9B-H-003                                       |
| Phase    | 7                                                 |
| タスク名 | SkillCreator IPCセキュリティ強化 - カバレッジ確認 |
| Issue    | #796                                              |
| 作成日   | 2026-02-12                                        |
| 優先度   | 高 (security)                                     |
| 前Phase  | Phase 6: テスト拡充                               |

## 目的

Phase 5 で実装したセキュリティ関数および Phase 4/6 で作成したテストのカバレッジを計測し、セキュリティコードに求められる高カバレッジ基準（推奨 90%+）を満たしていることを確認する。未達の場合は Phase 6 に戻りテストを追加する。

## 実行タスク

- Task 1: カバレッジ計測: セキュリティ関連テストを coverage 付きで実行する。
- Task 2: 分岐分析: 関数ごとの未カバー条件を特定する。
- Task 3: ゲート判定: 基準達成 여부を判定し、必要な場合は Phase 6 に戻す。

### Task 1: カバレッジ計測の実行

**実行コマンド**:

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers --coverage
```

**代替コマンド**（セキュリティテストのみ）:

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts --coverage
```

### Task 2: カバレッジ対象と基準確認

**カバレッジ対象ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

**関数別カバレッジ基準**:

| 関数                      | Line Coverage | Branch Coverage | Function Coverage |
| ------------------------- | ------------- | --------------- | ----------------- |
| validatePath()            | 90%以上       | 70%以上         | 90%以上           |
| sanitizeErrorMessage()    | 90%以上       | 70%以上         | 90%以上           |
| ALLOWED_SCHEMA_NAMES 検証 | 90%以上       | 70%以上         | 90%以上           |
| 全体（ハンドラー含む）    | 80%以上       | 60%以上         | 80%以上           |

**セキュリティコードの基準が通常より高い理由**:

- セキュリティ関数は攻撃ベクトルの網羅が必須
- 未カバーの分岐がそのまま脆弱性になるリスクがある
- 特に Branch Coverage はパス検証の条件分岐を全てカバーする必要がある

### Task 3: カバレッジ結果の分析

**確認すべき分岐パターン（validatePath）**:

| 分岐                          | 期待するカバレッジ |
| ----------------------------- | ------------------ |
| NULLバイト検出 → 拒否         | カバー済み         |
| UNCパス検出 → 拒否            | カバー済み         |
| `../` パストラバーサル → 拒否 | カバー済み         |
| 許可ディレクトリ外 → 拒否     | カバー済み         |
| 許可ディレクトリ内 → 通過     | カバー済み         |
| basePath 自体 → 通過/拒否     | カバー済み         |

**確認すべき分岐パターン（sanitizeErrorMessage）**:

| 分岐                            | 期待するカバレッジ |
| ------------------------------- | ------------------ |
| Error instance → メッセージ処理 | カバー済み         |
| 非 Error → デフォルトメッセージ | カバー済み         |
| パスパターン除去（Unix）        | カバー済み         |
| パスパターン除去（Windows）     | カバー済み         |
| スタックトレース除去            | カバー済み         |
| トークン/キーマスキング         | カバー済み         |
| 空メッセージ → デフォルト       | カバー済み         |

**確認すべき分岐パターン（ALLOWED_SCHEMA_NAMES）**:

| 分岐                | 期待するカバレッジ |
| ------------------- | ------------------ |
| 許可リスト内 → 通過 | カバー済み         |
| 許可リスト外 → 拒否 | カバー済み         |

### Task 4: ゲート判定

| 結果     | 対応                                   |
| -------- | -------------------------------------- |
| 基準達成 | Phase 8 へ進む                         |
| 未達成   | Phase 6 に戻り、不足分岐のテストを追加 |

**未達成時の対応手順**:

1. カバレッジレポートで未カバー行/分岐を特定
2. 対応するテストケースを Phase 6 のテストファイルに追加
3. テスト実行で PASS を確認
4. 再度カバレッジ計測を実行
5. 基準を満たすまで繰り返す

## 参照資料

| 資料                      | パス / 場所                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Phase 5 実装              | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-5-implementation.md` |
| Phase 6 テスト拡充        | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-6-test-expansion.md` |
| IPC セキュリティ仕様      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                 |
| API/Electron セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                 |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        |
| カバレッジ基準            | `.claude/rules/02-code-quality.md` のカバレッジ基準セクション                                |
| Vitest カバレッジ設定     | `vitest.config.ts` / `vite.config.ts`                                                        |

## 統合テスト連携

| 層         | テスト内容                                                                  |
| ---------- | --------------------------------------------------------------------------- |
| カバレッジ | セキュリティ関数の全分岐がテストでカバーされていること                      |
| 既存テスト | 既存の `skillCreatorIpc.integration.test.ts` のカバレッジに悪影響がないこと |

## 多角的チェック観点

| 観点           | 仕様参照先               | 確認項目                                                |
| -------------- | ------------------------ | ------------------------------------------------------- |
| カバレッジ     | 02-code-quality.md       | セキュリティ関数: Line 90%+, Branch 70%+, Function 90%+ |
| 全体カバレッジ | 02-code-quality.md       | ハンドラー全体: Line 80%+, Branch 60%+, Function 80%+   |
| セキュリティ   | security-electron-ipc.md | 全攻撃パターンがテストでカバーされていること            |

## 既知の Pitfall 対策

| Pitfall                             | 対策                                             |
| ----------------------------------- | ------------------------------------------------ |
| P22: Vitest Worker の予期しない終了 | テストファイルを限定して実行し、メモリ消費を抑制 |

## 成果物

| 成果物             | パス / 出力先                                    |
| ------------------ | ------------------------------------------------ |
| カバレッジレポート | `coverage/` ディレクトリ（コンソール出力も確認） |
| カバレッジ結果記録 | 本フェーズの実行ログに記録                       |

## 完了条件

- [ ] カバレッジ計測コマンドが正常に実行された
- [ ] validatePath() の Line/Branch/Function Coverage が全て推奨基準（90%/70%/90%）以上
- [ ] sanitizeErrorMessage() の Line/Branch/Function Coverage が全て推奨基準以上
- [ ] ALLOWED_SCHEMA_NAMES 検証の Line/Branch/Function Coverage が全て推奨基準以上
- [ ] ハンドラー全体の Line/Branch/Function Coverage が最低基準（80%/60%/80%）以上
- [ ] 既存テスト（skillCreatorIpc.integration.test.ts）が引き続き PASS
- [ ] 未達成の場合、Phase 6 に戻りテスト追加を完了した

## 次Phase

Phase 8: リファクタリング → `phase-8-refactoring.md`
