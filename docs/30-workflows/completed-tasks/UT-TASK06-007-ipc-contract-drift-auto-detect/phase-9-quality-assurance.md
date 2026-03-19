# Phase 9: 品質保証 - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 9                                            |
| 機能名 | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日 | 2026-03-18                                   |

## 目的

定義された品質基準（Lint・型チェック・テスト・セキュリティ）を全て満たすことを検証する。作成したIPC契約ドリフト検出スクリプト自身を既存コードベースに対して実行し、自己検証を行う。

## 実行タスク

- Lint検証: ESLintによるコード品質チェック
- 型チェック: TypeScriptコンパイラによる型安全性検証
- 全テスト実行: Vitestによるユニットテスト・統合テスト全件実行
- セキュリティチェック: IPCチャンネルホワイトリストとの整合確認
- IPC契約ドリフト自己検証: 作成したスクリプト自身を実行し既存コードベースのドリフトを検出

## 参照資料

| 資料名        | パス                                                         | 説明                 |
| ------------- | ------------------------------------------------------------ | -------------------- |
| Phase 8成果物 | `outputs/phase-8/refactoring-report.md`                      | リファクタリング報告 |
| Phase 5実装   | `apps/desktop/scripts/check-ipc-contracts.ts`                | 検証対象スクリプト   |
| Phase 5テスト | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | テストファイル       |

### システム仕様（aiworkflow-requirements）

> 品質ゲート基準は以下の仕様に準拠します。

| 参照資料                   | パス                                                                                        | 内容                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | Phase 9品質ゲート基準  |
| セキュリティ-Electron IPC  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ設計    |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 既存の手動チェック手順 |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターンの正本  |

## 実行手順

### ステップ1: Lint検証

```bash
# ESLint実行
pnpm lint

# スクリプトファイル単体のLint（詳細確認）
pnpm eslint apps/desktop/scripts/check-ipc-contracts.ts
```

| 確認項目     | 基準         | 結果       |
| ------------ | ------------ | ---------- |
| ESLint PASS  | エラー0件    | {{RESULT}} |
| any型不使用  | any型が0箇所 | {{RESULT}} |
| 未使用import | 0件          | {{RESULT}} |

### ステップ2: 型チェック

```bash
# TypeScript型チェック（全体）
pnpm typecheck

# スクリプト関連の型エラー確認
pnpm tsc --noEmit --project apps/desktop/tsconfig.json 2>&1 | grep -i "check-ipc"
```

| 確認項目           | 基準                              | 結果       |
| ------------------ | --------------------------------- | ---------- |
| TypeCheck PASS     | エラー0件                         | {{RESULT}} |
| @ts-ignore不使用   | @ts-ignore / @ts-expect-error 0件 | {{RESULT}} |
| 型アサーション確認 | `as` による安易なバイパスなし     | {{RESULT}} |

### ステップ3: 全テスト実行

```bash
# スクリプトのユニットテスト
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts

# デスクトップアプリ全テスト（既存テストへの影響確認）
cd apps/desktop && pnpm vitest run
```

| 確認項目               | 基準                         | 結果       |
| ---------------------- | ---------------------------- | ---------- |
| スクリプトテスト全PASS | AC-06準拠のテストが全てPASS  | {{RESULT}} |
| 既存テスト影響なし     | 既存テストの失敗が0件        | {{RESULT}} |
| カバレッジ基準         | Line 80%以上、Branch 60%以上 | {{RESULT}} |

### ステップ4: セキュリティチェック

IPCチャンネルのホワイトリスト管理との整合を確認する。

```bash
# スクリプトがIPCチャンネル定数を正しく参照しているか確認
grep -n "IPC_CHANNELS" apps/desktop/scripts/check-ipc-contracts.ts

# ハードコード文字列チャンネル名の検出（R-03ルールの自己適用）
grep -n "ipcMain\.handle\|safeInvoke" apps/desktop/scripts/check-ipc-contracts.ts | grep -v "IPC_CHANNELS\|regex\|pattern\|RegExp"
```

| 確認項目                 | 基準                                                      | 結果       |
| ------------------------ | --------------------------------------------------------- | ---------- |
| チャンネル定数参照       | スクリプト内でIPCチャンネル名をハードコードしていないこと | {{RESULT}} |
| パストラバーサル防止     | `__dirname` ベースの絶対パスを使用（NFR-04）              | {{RESULT}} |
| 外部コマンド実行の安全性 | grep/rgの引数にユーザー入力が含まれないこと               | {{RESULT}} |

### ステップ4-B: IPC契約整合性チェック（P27/P42/チャネル定義数）

既存コードベースに対してIPC契約の整合性を確認する。

```bash
# P27: ハードコード文字列チャンネル名の検出（Preload側）
rg -n 'safeInvoke\("|safeOn\("' apps/desktop/src/preload/*.ts | rg -v IPC_CHANNELS

# P42: .trim()バリデーション漏れの検出（IPCハンドラ側）
rg -n 'typeof.*string.*===' apps/desktop/src/main/ipc/ | rg -v 'trim'

# チャネル定義数の整合性確認
echo "=== IPC_CHANNELS定義数 ==="
grep "^  [A-Z_]*:" apps/desktop/src/preload/channels.ts | wc -l
echo "=== Mainハンドラ登録数 ==="
rg "ipcMain\.handle" apps/desktop/src/main/ --type ts | wc -l
echo "=== Preload safeInvoke呼び出し数 ==="
rg -c 'safeInvoke\(' apps/desktop/src/preload/ 2>/dev/null | awk -F: '{s+=$2}END{print s}'
```

| 確認項目                       | 基準                                                                        | 結果       |
| ------------------------------ | --------------------------------------------------------------------------- | ---------- |
| P27: ハードコード文字列検出    | `safeInvoke`/`safeOn` で `IPC_CHANNELS` 定数を使用していない箇所が0件       | {{RESULT}} |
| P42: .trim()バリデーション漏れ | IPCハンドラで `typeof === "string"` チェック後に `.trim()` が適用されている | {{RESULT}} |
| チャネル定義数整合性           | `channels.ts` のIPC_CHANNELS定義数とMainハンドラ登録数の差が5以内であること | {{RESULT}} |

### ステップ5: IPC契約ドリフト自己検証

作成したスクリプト自身を既存コードベースに対して実行し、検出結果を確認する。

```bash
# レポートモードで実行（常にexit 0）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only

# 厳格モードで実行（ドリフトがあればexit 1）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict

# JSON形式で結果を保存
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json > outputs/phase-9/drift-report.json
```

| 確認項目                     | 基準                                                 | 結果       |
| ---------------------------- | ---------------------------------------------------- | ---------- |
| `--report-only` 正常実行     | exit 0で完了し、レポートが出力される                 | {{RESULT}} |
| ドリフト検出結果の妥当性     | 検出されたドリフトが実際の不整合と一致する           | {{RESULT}} |
| 既知P44/P45パターンの検出    | 過去に修正済みのパターンと未修正のパターンを区別可能 | {{RESULT}} |
| チャンネル孤児（R-01）の確認 | 検出された孤児が正当な理由を持つか、または未タスク化 | {{RESULT}} |
| 実行時間                     | 10秒以内（NFR-01）                                   | {{RESULT}} |

#### 検出ドリフトの処理判断

| 検出内容                  | 対応                                                   |
| ------------------------- | ------------------------------------------------------ |
| 既知の修正済みドリフト    | レポートに「修正済み」と記録                           |
| 新規検出ドリフト（error） | 未タスク化を検討し、Phase 10で報告                     |
| チャンネル孤児（warning） | 正当な理由があれば許容リストに追加、なければ未タスク化 |

### ステップ6: Phase 9統合確認

Phase 9品質ゲートテンプレートにIPC契約ドリフト検証チェック項目が追加されているか確認する。

```bash
# phase-templates.md（またはphase-template-execution.md）にチェック項目が追加されているか確認
grep -n "check-ipc-contracts\|IPC契約ドリフト" .claude/skills/task-specification-creator/references/phase-templates.md .claude/skills/task-specification-creator/references/phase-template-execution.md 2>/dev/null
```

| 確認項目                       | 基準                                                 | 結果       |
| ------------------------------ | ---------------------------------------------------- | ---------- |
| テンプレートにチェック項目追加 | AC-05準拠: Phase 9チェックリストに統合されている     | {{RESULT}} |
| チェック項目の内容             | `pnpm tsx ... check-ipc-contracts.ts` 実行が含まれる | {{RESULT}} |

### 品質ゲートテーブル

| ゲート項目      | 基準                                               | コマンド                                                             | 結果       |
| --------------- | -------------------------------------------------- | -------------------------------------------------------------------- | ---------- |
| 機能検証        | スクリプトが正常実行される                         | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` | {{RESULT}} |
| コード品質      | Lint + TypeCheck がPASS                            | `pnpm lint && pnpm typecheck`                                        | {{RESULT}} |
| テスト網羅性    | テスト全PASS + カバレッジ基準充足                  | `cd apps/desktop && pnpm vitest run scripts/__tests__/`              | {{RESULT}} |
| セキュリティ    | IPCセキュリティ原則準拠                            | 手動確認（ステップ4）                                                | {{RESULT}} |
| IPC契約ドリフト | P27/P42/チャネル定義数の整合性チェックが全てクリア | 手動確認（ステップ4-B）                                              | {{RESULT}} |
| 自己検証        | スクリプト自身が既存コードベースで正常動作         | `pnpm tsx ... --report-only --format json`                           | {{RESULT}} |
| Phase 9統合     | テンプレートにチェック項目が追加されている         | ステップ6の確認                                                      | {{RESULT}} |

## 統合テスト連携

| テスト観点          | 確認内容                                                                                           | 結果       |
| ------------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| ユニットテスト      | `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts` がPASS | {{RESULT}} |
| 全体テスト          | `pnpm --filter @repo/desktop exec vitest run` がPASS（既存テスト影響なし）                         | {{RESULT}} |
| 自己検証実行        | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が正常完了                    | {{RESULT}} |
| 実行時間            | スクリプト実行が10秒以内（NFR-01）                                                                 | {{RESULT}} |
| Phase 9テンプレート | チェック項目が追加されている（AC-05）                                                              | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                        | 仕様参照先                                                         |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| 機能網羅性     | FR-01〜FR-08の全機能要件が動作するか            | Phase 1: 要件定義                                                  |
| セキュリティ   | IPCチャンネルホワイトリスト管理の整合性         | `aiworkflow-requirements: security-electron-ipc.md`                |
| パフォーマンス | 10秒以内の実行時間制約（NFR-01）                | Phase 1: NFR-01                                                    |
| 自己整合性     | スクリプト自身がIPC契約原則に違反していないこと | `aiworkflow-requirements: architecture-implementation-patterns.md` |

## 成果物

| 成果物           | パス                                | 説明                           |
| ---------------- | ----------------------------------- | ------------------------------ |
| 品質レポート     | `outputs/phase-9/quality-report.md` | 全品質ゲートの検証結果         |
| ドリフトレポート | `outputs/phase-9/drift-report.json` | 自己検証の検出結果（JSON形式） |

## 完了条件

- [ ] `pnpm lint` がPASSしている
- [ ] `pnpm typecheck` がPASSしている
- [ ] `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts` が全PASSしている
- [ ] `pnpm --filter @repo/desktop exec vitest run` が全PASS（既存テスト影響なし）
- [ ] セキュリティチェック（ハードコード文字列・パストラバーサル・外部コマンド安全性）が完了
- [ ] IPC契約整合性チェック（P27ハードコード文字列検出、P42 .trim()バリデーション、チャネル定義数整合性）が完了
- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が正常実行され、結果が妥当
- [ ] 検出されたドリフトの対応方針（修正済み/未タスク化/許容）が決定されている
- [ ] Phase 9テンプレートにIPC契約ドリフト検証チェック項目が追加されている（AC-05）
- [ ] 全品質ゲート（機能検証/コード品質/テスト網羅性/セキュリティ/自己検証/Phase 9統合）がクリア
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. Lint検証の実施
2. 型チェックの実施
3. 全テスト実行と結果確認
4. セキュリティチェックの実施
   4-B. IPC契約整合性チェック（P27/P42/チャネル定義数）の実施
5. IPC契約ドリフト自己検証の実行と結果分析
6. Phase 9テンプレート統合の確認
7. 品質ゲートテーブルの記入
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
