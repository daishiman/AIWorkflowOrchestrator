# console → electron-log 移行 - タスク指示書

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION         |
| タスク名     | 本番コードのconsole使用をelectron-logに移行 |
| 分類         | リファクタリング                            |
| 対象機能     | ログ出力（スキル関連サービス）              |
| 優先度       | 低                                          |
| 見積もり規模 | 中規模                                      |
| ステータス   | 完了                                        |
| 実行順序     | 06c（並列可能 — 05b完了後）                 |
| 発見元       | skill-system-conflict-report #14            |
| 発見日       | 2026-02-05                                  |
| 関連Phase    | Phase 4（品質向上）                         |
| 関連Issue    | -                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル関連の本番コードで `console.error` / `console.warn` が20箇所以上使用されている。`.claude/rules/02-code-quality.md` で「`console.log` を本番コードに残さない（構造化ログを使用）」と規定。

### 1.2 問題点・課題

| ファイル                | 箇所数 | 主な用途          |
| ----------------------- | ------ | ----------------- |
| `SkillService.ts`       | 6      | エラーログ、警告  |
| `SkillScanner.ts`       | 5      | スキャンエラー    |
| `PermissionStore.ts`    | 4      | 永続化エラー      |
| `SkillExecutor.ts`      | 2      | SDK呼び出しエラー |
| `SkillImportManager.ts` | 2      | インポートエラー  |
| `SkillAnalyzer.ts`      | 1      | 分析エラー        |

### 1.3 放置した場合の影響

- ログが構造化されず、本番でのデバッグが困難
- ログレベル制御ができない（console は常に出力）
- ログファイルへの永続化ができない
- `.claude/rules/02-code-quality.md` ルール違反

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル関連サービスの `console.error` / `console.warn` を `electron-log` に移行し、構造化ログを実現する。

### 2.2 最終ゴール

1. 20箇所以上の `console.error/warn` が `electron-log` に置き換え
2. ログレベルが適切に設定されている
3. スキル関連サービスに `console.` 使用がない

### 2.3 スコープ

#### 含むもの

- 6ファイル・20箇所以上の console → electron-log 移行
- ログレベルの適切な設定

#### 含まないもの

- スキル関連以外のファイルの移行
- electron-log の設定変更
- 新規ログの追加

### 2.4 成果物

| 成果物                     | 説明              |
| -------------------------- | ----------------- |
| 修正された6ファイル        | electron-log 使用 |
| テスト修正（必要に応じて） | ログモックの更新  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- なし（独立して着手可能）

### 3.2 依存タスク

- なし

### 3.3 推奨アプローチ

1. 各ファイルで `import log from "electron-log"` を追加
2. `console.error` → `log.error`、`console.warn` → `log.warn` に置き換え
3. ログメッセージのフォーマットを統一

---

## 4. 実行手順

### Step 1: 対象箇所の棚卸し

#### 手順

1. `grep -rn "console\.\(error\|warn\|log\)" apps/desktop/src/main/services/skill/` で全箇所を特定
2. 各箇所のログレベル（error/warn/info/debug）を判定

### Step 2: 移行

#### ファイルごとの作業

1. **SkillService.ts（6箇所）**: error 系はそのまま `log.error`、状態通知は `log.info`
2. **SkillScanner.ts（5箇所）**: スキャンエラーは `log.error`、スキップは `log.warn`
3. **PermissionStore.ts（4箇所）**: 永続化エラーは `log.error`
4. **SkillExecutor.ts（2箇所）**: SDK エラーは `log.error`
5. **SkillImportManager.ts（2箇所）**: インポートエラーは `log.error`
6. **SkillAnalyzer.ts（1箇所）**: 分析エラーは `log.warn`

### Step 3: テスト・検証

#### 手順

1. テスト内の `console.error` スパイを `log.error` モックに更新（該当する場合）
2. 全テスト PASS 確認

---

## 5. 完了条件チェックリスト

- [ ] スキル関連サービス6ファイルで `console.error/warn` が全て除去
- [ ] `electron-log` に移行されている
- [ ] ログレベルが適切に設定
- [ ] 全テストが PASS

---

## 6. 検証方法

1. `grep -rn "console\." apps/desktop/src/main/services/skill/` で該当なし（テストファイル除外）
2. テストスイート PASS

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                             |
| ----------------------------- | ------ | -------- | -------------------------------- |
| テスト内の console スパイ破壊 | 低     | 中       | テスト修正を同時に実施           |
| electron-log 未導入の環境     | 低     | 低       | 既にプロジェクトに導入済みを確認 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/02-code-quality.md`（ログ機密情報除外、console.log 禁止）
- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/SkillScanner.ts`
- `apps/desktop/src/main/services/skill/PermissionStore.ts`
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- `apps/desktop/src/main/services/skill/SkillImportManager.ts`
- `apps/desktop/src/main/services/skill/SkillAnalyzer.ts`

---

## 9. 備考

### ログ機密情報の注意

`.claude/rules/02-code-quality.md` に「パスワード・APIキー・PII をログに含めない」と規定。移行時にログメッセージの内容も確認し、機密情報が含まれていないことを確認する。

### skillHandlers.ts の DEBUG ログ

`skillHandlers.ts` L73-100 にある6箇所のDEBUGログは、#4（永続化修正）の調査用として残されたもの。#4 完了後に本タスクで整理する。
