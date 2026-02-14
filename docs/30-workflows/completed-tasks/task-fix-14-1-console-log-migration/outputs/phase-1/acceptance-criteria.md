# TASK-FIX-14-1-CONSOLE-LOG-MIGRATION 受入基準書

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスク ID  | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| Phase      | Phase 1 - 要件定義                  |
| 作成日     | 2026-02-14                          |
| ステータス | 完了                                |

## 受入基準

### AC-1: スキル関連サービス4ファイルで console.\* 使用がゼロ

- **検証方法**: grep による自動検証
- **コマンド**:
  ```bash
  grep -n "console\.\(log\|error\|warn\|info\|debug\)" \
    apps/desktop/src/main/services/skill/SkillScanner.ts \
    apps/desktop/src/main/services/skill/PermissionStore.ts \
    apps/desktop/src/main/services/skill/SkillImportManager.ts \
    apps/desktop/src/main/services/skill/SkillAnalyzer.ts
  ```
- **期待結果**: 一致行がゼロ件
- **判定基準**: grep の戻り値が 1（一致なし）であること

### AC-2: 全テストが PASS

- **検証方法**: Vitest による自動テスト実行
- **コマンド**:
  ```bash
  cd apps/desktop && pnpm vitest run src/main/services/skill/
  ```
- **期待結果**: 全テストケースが PASS
- **判定基準**: 失敗テストがゼロ件であること

### AC-3: テストファイルの console スパイが electron-log モックに更新済み

- **検証方法**: コードレビュー + grep
- **確認対象**:
  - `SkillExecutor.auth.test.ts`
  - `SkillExecutor.permission.test.ts`
  - `SkillImportManager.error.test.ts`
- **コマンド**:
  ```bash
  grep -n "vi.spyOn(console" \
    apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts \
    apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts \
    apps/desktop/src/main/services/skill/__tests__/SkillImportManager.error.test.ts
  ```
- **期待結果**: console スパイの使用がゼロ件
- **判定基準**: 全てのテストファイルで `vi.mock("electron-log")` パターンに移行済み

### AC-4: ログレベルが適切に設定されている

- **検証方法**: コードレビュー
- **判定基準**:
  | ログレベル | 使用場面 |
  | ---------- | ------------------------------------ |
  | `error` | 致命的エラー、例外キャッチ時 |
  | `warn` | 非致命的な問題、スキップ処理 |
  | `info` | 正常な状態変化、操作完了通知 |
  | `debug` | 開発用デバッグ情報 |
- **確認事項**: 各 `log.*` 呼び出しが上記の基準に従っていること

### AC-5: ログメッセージに機密情報が含まれていない

- **検証方法**: コードレビュー
- **確認内容**:
  - パスワードがログに出力されていないこと
  - API キーがログに出力されていないこと
  - PII（個人識別情報）がログに出力されていないこと
  - ファイルパスのみ（技術的情報）であること
- **判定基準**: 機密情報を含むログメッセージがゼロ件
