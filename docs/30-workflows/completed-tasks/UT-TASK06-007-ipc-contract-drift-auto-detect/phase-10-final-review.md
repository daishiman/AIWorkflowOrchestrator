# Phase 10: 最終レビューゲート - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 10                                           |
| 機能名 | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日 | 2026-03-18                                   |

## 目的

実装完了後、Phase 1（要件定義）で定義した全受け入れ基準（AC-01〜AC-06）の充足、コード品質、セキュリティ、Phase 9統合を含む全体的な品質・整合性を多角的に検証する。MINOR判定の場合は全て未タスク仕様書に変換する（省略不可）。

## 実行タスク

- 要件充足確認: Phase 1のAC-01〜AC-06が全て満たされているか検証
- コード品質確認: 200行以内、any型不使用、適切なエラーハンドリング
- セキュリティ確認: IPCチャンネル名のハードコード検出（R-03）が動作しているか検証
- P44/P45再発防止確認: 既知パターンが検出されることを実データで検証
- Phase 9統合確認: `phase-template-execution.md` にチェック項目が追加されているか確認
- 設計-実装整合性確認: Phase 2設計書と最終実装の乖離がないか検証

## 参照資料

| 資料名                  | パス                                                         | 説明                       |
| ----------------------- | ------------------------------------------------------------ | -------------------------- |
| Phase 1要件定義         | `phase-1-requirements.md`                                    | FR/NFR/AC定義              |
| Phase 2設計書           | `phase-2-design.md`                                          | アーキテクチャ・ルール設計 |
| Phase 9品質レポート     | `outputs/phase-9/quality-report.md`                          | 品質ゲート検証結果         |
| Phase 9ドリフトレポート | `outputs/phase-9/drift-report.json`                          | 自己検証の検出結果         |
| 実装ファイル            | `apps/desktop/scripts/check-ipc-contracts.ts`                | レビュー対象               |
| テストファイル          | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | レビュー対象               |

### システム仕様（aiworkflow-requirements）

> 最終レビューは以下の仕様を基準に判定します。

| 参照資料                   | パス                                                                                        | 内容                         |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPCハンドラの契約検証手順    |
| セキュリティ-Electron IPC  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPCセキュリティ設計 |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターンの正本        |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | Phase 9品質ゲート基準        |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P44/P45/P60パターンの詳細    |

## 実行手順

### ステップ1: 受け入れ基準（AC）充足確認

| AC-ID | 基準                                                              | 検証方法                                             | 結果       |
| ----- | ----------------------------------------------------------------- | ---------------------------------------------------- | ---------- |
| AC-01 | `scripts/check-ipc-contracts.ts` が作成されている                 | `ls apps/desktop/scripts/check-ipc-contracts.ts`     | {{RESULT}} |
| AC-02 | P44パターン（オブジェクト vs プリミティブ不一致）が検出される     | テストケースでR-02ルールの動作を確認                 | {{RESULT}} |
| AC-03 | P45パターン（引数命名のセマンティクス乖離）が検出できる設計である | コード内にセマンティクス検証ポイントが設計されている | {{RESULT}} |
| AC-04 | 不一致がなければ exit 0、あれば exit 1 を返す                     | `--strict` / `--report-only` の動作をテストで確認    | {{RESULT}} |
| AC-05 | `phase-templates.md` のPhase 9チェックリストに統合されている      | テンプレートファイルの内容確認                       | {{RESULT}} |
| AC-06 | 既知のP44/P45パターンが検出されることを確認するテストが存在する   | テストファイル内のテストケース一覧で確認             | {{RESULT}} |

### ステップ2: コード品質確認

```bash
# 行数確認
wc -l apps/desktop/scripts/check-ipc-contracts.ts

# any型の使用確認
grep -n ": any\|as any\|<any>" apps/desktop/scripts/check-ipc-contracts.ts

# @ts-ignore / @ts-expect-error の使用確認
grep -n "@ts-ignore\|@ts-expect-error" apps/desktop/scripts/check-ipc-contracts.ts

# エラーハンドリングの確認
grep -n "try\|catch\|throw\|process\.exit" apps/desktop/scripts/check-ipc-contracts.ts
```

| 確認項目           | 基準                                    | 結果       |
| ------------------ | --------------------------------------- | ---------- |
| 行数制約           | 200行以内（NFR-05）                     | {{RESULT}} |
| any型不使用        | `any` が0箇所                           | {{RESULT}} |
| @ts-ignore不使用   | 0箇所（使用する場合は理由コメント必須） | {{RESULT}} |
| エラーハンドリング | grep/rg実行失敗時の適切なエラー処理     | {{RESULT}} |
| 未使用import/変数  | 0件                                     | {{RESULT}} |

### ステップ3: セキュリティ確認

| 確認項目                 | 基準                                                      | 結果       |
| ------------------------ | --------------------------------------------------------- | ---------- |
| R-03ルール動作確認       | IPCチャンネル名のハードコード文字列を検出できるか         | {{RESULT}} |
| 外部コマンド実行の安全性 | `execSync` / `spawnSync` の引数にユーザー入力が含まれない | {{RESULT}} |
| パス操作の安全性         | `__dirname` ベースの絶対パス使用（NFR-04）                | {{RESULT}} |
| 出力情報のサニタイズ     | エラーレポートに機密情報（トークン等）が含まれないこと    | {{RESULT}} |

### ステップ4: P44/P45再発防止確認

既知パターンが実際に検出されることを検証する。

```bash
# テストケースでP44パターン検出を確認
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts --reporter=verbose 2>&1 | grep -i "P44\|P45\|R-02\|引数形式"

# 実データでの検出確認（--report-only で安全に実行）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

| 確認項目             | 基準                                             | 結果       |
| -------------------- | ------------------------------------------------ | ---------- |
| P44テストケース存在  | R-02ルールのテストケースが存在する               | {{RESULT}} |
| P45設計ポイント存在  | セマンティクス乖離の検出設計が記録されている     | {{RESULT}} |
| 実データでの検出結果 | 既存コードベースで期待どおりの検出結果が得られる | {{RESULT}} |

### ステップ5: Phase 9統合確認

```bash
# phase-template-execution.md にIPC契約チェックが含まれるか
grep -A5 "check-ipc-contracts\|IPC契約ドリフト" .claude/skills/task-specification-creator/references/phase-template-execution.md .claude/skills/task-specification-creator/references/phase-templates.md 2>/dev/null
```

| 確認項目                 | 基準                                                          | 結果       |
| ------------------------ | ------------------------------------------------------------- | ---------- |
| チェック項目追加         | Phase 9テンプレートに `check-ipc-contracts.ts` 実行が含まれる | {{RESULT}} |
| チェック項目の実行可能性 | 記載されたコマンドがそのまま実行可能であること                | {{RESULT}} |

### ステップ6: 設計-実装整合性確認

Phase 2設計書と最終実装の乖離を確認する。

| 確認項目                 | Phase 2設計                           | 実装                 | 整合性     |
| ------------------------ | ------------------------------------- | -------------------- | ---------- |
| 型定義（HandlerEntry等） | Phase 2 ステップ2で定義               | 実装ファイル内で確認 | {{RESULT}} |
| 検出ルール（R-01〜R-04） | Phase 2 ステップ4で定義               | 実装ファイル内で確認 | {{RESULT}} |
| CLIオプション            | Phase 2 ステップ5で定義               | 実装ファイル内で確認 | {{RESULT}} |
| レポート出力形式         | Phase 2 ステップ6で定義               | 実装ファイル内で確認 | {{RESULT}} |
| 処理フロー               | Extract→Match→Validate→Report の4段階 | 実装ファイル内で確認 | {{RESULT}} |

### ステップ7: ゲート判定

#### 判定基準

| 判定     | 条件                                                     | 対応                                             |
| -------- | -------------------------------------------------------- | ------------------------------------------------ |
| PASS     | 全AC充足、コード品質基準クリア、セキュリティ問題なし     | Phase 11へ                                       |
| MINOR    | 軽微な改善点あり（機能に影響なし）                       | 全て未タスク仕様書に変換後Phase 11へ（省略不可） |
| MAJOR    | AC未充足、セキュリティ問題、または設計と実装の重大な乖離 | 影響範囲に応じてPhase 1-5へ戻る                  |
| CRITICAL | IPC契約の根本的な設計問題、セキュリティ脆弱性            | Phase 1へ戻り要件再確認                          |

#### MINOR追跡テーブル

MINOR判定時は**全ての指摘**を未タスク仕様書に変換する。「機能影響なし」を理由に省略しない。

| MINOR ID           | 指摘内容 | 未タスク仕様書パス | task-workflow登録 | 関連仕様書リンク | 解決確認Phase |
| ------------------ | -------- | ------------------ | ----------------- | ---------------- | ------------- |
| (レビュー時に記入) |          |                    |                   |                  |               |

#### 判定結果

| レビュー日 | 判定 | 判定理由 | 次のPhase |
| ---------- | ---- | -------- | --------- |
| {{DATE}}   |      |          |           |

### レビュー観点テーブル

| 観点         | 確認内容                                            | 基準                        | 結果       |
| ------------ | --------------------------------------------------- | --------------------------- | ---------- |
| 機能網羅性   | FR-01〜FR-08の全機能要件が実装され動作する          | AC-01〜AC-06で検証          | {{RESULT}} |
| コード品質   | Lint/TypeCheck/テスト全PASS、200行以内              | Phase 9品質ゲート結果を参照 | {{RESULT}} |
| セキュリティ | IPCセキュリティ原則準拠、R-03ルール動作確認         | 04-electron-security.md準拠 | {{RESULT}} |
| ドキュメント | 設計書と実装の整合、Phase 9統合確認                 | ステップ5-6で検証           | {{RESULT}} |
| 再発防止     | P44/P45パターンの検出テストが存在し動作する         | ステップ4で検証             | {{RESULT}} |
| 保守性       | 新規ルール追加が容易な構造（Phase 8リファクタ結果） | Phase 8成果物を参照         | {{RESULT}} |

## 統合テスト連携

| テスト観点        | 確認内容                                                                                         | 結果       |
| ----------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| AC-01ファイル存在 | `ls apps/desktop/scripts/check-ipc-contracts.ts` で確認                                          | {{RESULT}} |
| AC-02 P44検出     | テストでR-02ルール動作を確認                                                                     | {{RESULT}} |
| AC-04 exit code   | `--strict` / `--report-only` のexit code動作をテストで確認                                       | {{RESULT}} |
| AC-05 Phase 9統合 | テンプレートファイルにチェック項目が存在する                                                     | {{RESULT}} |
| AC-06テスト存在   | `grep -c "it\|test" apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` でテスト数を確認 | {{RESULT}} |
| 全体テストPASS    | `pnpm --filter @repo/desktop exec vitest run` が全PASS                                           | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点                 | 適用判断                                                     | 仕様参照先                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| 要件トレーサビリティ | FR/NFR/ACの全項目が実装・テストされているか                  | Phase 1: 要件定義                                                  |
| セキュリティ         | IPCセキュリティ原則に違反するコードがないか                  | `aiworkflow-requirements: security-electron-ipc.md`                |
| 保守性               | 新規ルール追加の容易性（OCP準拠）                            | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| 設計整合性           | Phase 2設計の型定義・処理フロー・CLIが実装に反映されているか | Phase 2: 設計                                                      |
| テスト品質           | テストがP44/P45の具体的シナリオをカバーしているか            | `.claude/rules/06-known-pitfalls.md`                               |

## 成果物

| 成果物           | パス                                      | 説明                         |
| ---------------- | ----------------------------------------- | ---------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果・レビュー観点の記録 |

## 完了条件

- [ ] AC-01〜AC-06の全受け入れ基準の充足を確認
- [ ] コード品質確認（200行以内、any型不使用、エラーハンドリング）が完了
- [ ] セキュリティ確認（R-03動作、外部コマンド安全性、パス安全性）が完了
- [ ] P44/P45再発防止確認（テストケース存在、実データ検出結果の妥当性）が完了
- [ ] Phase 9統合確認（テンプレートにチェック項目追加済み）が完了
- [ ] 設計-実装整合性確認（型定義・ルール・CLI・レポート・処理フロー）が完了
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR判定の場合、全指摘が未タスク仕様書に変換されている（省略不可）
- [ ] レビュー観点テーブルの全項目が記入されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 受け入れ基準（AC-01〜AC-06）充足確認
2. コード品質確認（行数・型安全・エラーハンドリング）
3. セキュリティ確認（R-03動作・コマンド安全性・パス安全性）
4. P44/P45再発防止確認（テスト・実データ検出）
5. Phase 9統合確認（テンプレートチェック項目）
6. 設計-実装整合性確認
7. ゲート判定の実施
8. MINOR指摘の未タスク化（該当する場合）
9. 成果物の作成・配置
10. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect --phase 10
```

## 次のPhase

Phase 11: 手動テスト

**Phase 11 開始条件**: Phase 10のゲート判定がPASSまたはMINOR（全指摘を未タスク仕様書に変換後）であること。
