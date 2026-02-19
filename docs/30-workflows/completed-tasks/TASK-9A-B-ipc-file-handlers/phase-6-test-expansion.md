# Phase 6: テスト拡充 — TASK-9A-B ファイル編集IPCハンドラー

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| 機能名     | TASK-9A-B-ipc-file-handlers            |
| 作成日     | 2026-02-19                             |
| 前提Phase  | Phase 5（実装・Green状態確認）         |
| 依存タスク | TASK-9A-A（SkillFileManager 実装済み） |

## 目的

Phase 5 の実装に対して、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすために**不足しているテストを追加**する。境界値・エッジケース・組合せテストにより、実装の堅牢性を検証する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                     |
| ----------------- | -------- | -------- | ------------------------------------------------ |
| Line Coverage     | 80%      | 90%      | `apps/desktop/src/main/ipc/skillFileHandlers.ts` |
| Branch Coverage   | 60%      | 70%      | 同上                                             |
| Function Coverage | 80%      | 90%      | 同上                                             |

## 実行タスク

### Task 1: 境界値テスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`（既存ファイルに追加）

#### 1.1 テストケース一覧

| No   | チャンネル          | テスト項目                                           | 期待結果                                                               |
| ---- | ------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| B-01 | `skill:readFile`    | skillName がスペースのみ `"   "`                     | `{ success: false, error: "skillName must be a non-empty string" }`    |
| B-02 | `skill:readFile`    | relativePath がスペースのみ `"  "`                   | `{ success: false, error: "relativePath must be a non-empty string" }` |
| B-03 | `skill:writeFile`   | content が空文字列 `""` （有効な入力として許可）     | `{ success: true }` — 空コンテンツの書き込みは許可                     |
| B-04 | `skill:createFile`  | relativePath に深いネスト `"a/b/c/d/e/f/g/file.md"`  | 正常に作成される（SkillFileManager が親ディレクトリを作成）            |
| B-05 | `skill:listBackups` | バックアップが0件のスキル                            | `{ success: true, data: [] }`                                          |
| B-06 | `skill:readFile`    | relativePath に日本語パス `"参照/ファイル.md"`       | 正常に読み込める（SkillFileManager が UTF-8 対応）                     |
| B-07 | `skill:writeFile`   | skillName にハイフン・アンダースコア `"my-skill_v2"` | 正常に書き込める                                                       |

### Task 2: エッジケーステスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`（既存ファイルに追加）

#### 2.1 テストケース一覧

| No   | チャンネル            | テスト項目                                      | 期待結果                                                            |
| ---- | --------------------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| E-01 | `skill:writeFile`     | 大容量コンテンツ（1MB以上の文字列）             | 正常に書き込める                                                    |
| E-02 | `skill:readFile`      | 引数が null                                     | `{ success: false, error: "skillName must be a non-empty string" }` |
| E-03 | `skill:writeFile`     | 引数オブジェクトが undefined                    | `{ success: false, error: "skillName must be a non-empty string" }` |
| E-04 | `skill:restoreBackup` | backupPath に `.backup.` 接尾辞を含む正常パス   | 正常に復元される                                                    |
| E-05 | 全チャンネル          | SkillFileManager メソッドが reject する Promise | `{ success: false, error: ... }` が返される                         |

### Task 3: 統合テスト拡充

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts`（既存ファイルに追加）

#### 3.1 テストケース一覧

| No    | テスト項目                                                       | 期待結果                              |
| ----- | ---------------------------------------------------------------- | ------------------------------------- |
| IE-01 | writeFile 後に scanAvailableSkills が正しく呼び出される          | scanAvailableSkills が1回呼び出される |
| IE-02 | createFile → writeFile → readFile: 新規作成後に上書き → 読み込み | 最後の書き込み内容が読み込める        |
| IE-03 | 複数ファイルの連続バックアップ → listBackups のソート順検証      | タイムスタンプ降順（最新が先頭）      |
| IE-04 | deleteFile → restoreBackup → deleteFile: 復元後の再削除          | 各操作が正常に完了する                |

### Task 4: セキュリティテスト拡充

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.security.test.ts`（既存ファイルに追加）

#### 4.1 テストケース一覧

| No    | テスト項目                                                        | 期待結果                                                                                                        |
| ----- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| SE-01 | skillName にパストラバーサル `"../malicious-skill"` を含む        | `{ success: false, error: "Skill not found: ..." }` （SkillFileManager が findSkillDir でスキルを検出できない） |
| SE-02 | 全6ハンドラーで mainWindow が destroyed 後に呼び出し              | validateIpcSender が `{ valid: false }` を返し、ハンドラーが `toIPCValidationError` で例外を送出する            |
| SE-03 | content に `<script>alert('xss')</script>` を含むファイル書き込み | そのまま保存される（ファイルシステムへの保存はサニタイズ不要）                                                  |

---

## 実行手順

### Step 1: 現在のカバレッジ計測

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --coverage
```

カバレッジレポートを確認し、不足箇所を特定する。

### Step 2: テスト追加

Task 1-4 のテストケースのうち、カバレッジ向上に寄与するものから優先的に追加する。

### Step 3: カバレッジ再計測

テスト追加後に再度カバレッジを計測し、基準を満たしているか確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --coverage
```

### Step 4: 基準未達の場合

カバレッジ基準を満たさない場合は、レポートの未カバー行・分岐を確認し、追加テストを作成する。

---

## 参照資料

| 資料                                                                           | 用途                       |
| ------------------------------------------------------------------------------ | -------------------------- |
| Phase 4-5 成果物                                                               | 既存テスト・実装コード     |
| `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.edge.test.ts` | エッジケーステストパターン |
| `.claude/rules/02-code-quality.md`                                             | カバレッジ基準定義         |

## 統合テスト連携

| 連携先                    | 内容                                                                   |
| ------------------------- | ---------------------------------------------------------------------- |
| Phase 5（実装）           | 実装済みハンドラーに対する境界値・エッジケース・統合シナリオを追加する |
| Phase 7（カバレッジ確認） | 拡充後テストを用いて coverage gate 判定を実施する                      |

## 成果物

| 成果物                                                                      | 説明                           |
| --------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`             | 境界値・エッジケーステスト追加 |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.security.test.ts`    | セキュリティテスト拡充         |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts` | 統合テスト拡充                 |

## 完了条件

- [ ] Task 1-4 の全テストケース（19テスト）が追加されている
- [ ] 追加した全テストが Green 状態（成功）である
- [ ] カバレッジ計測コマンドが実行可能である
- [ ] 既存テスト（Phase 4 の46テスト）が引き続き全てPASSしている

## 次のPhase

Phase 7（カバレッジ確認）へ進む。カバレッジ基準の充足を最終確認する。
