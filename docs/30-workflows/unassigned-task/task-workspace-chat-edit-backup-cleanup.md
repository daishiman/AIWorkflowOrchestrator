# Workspace Chat Edit Backup Cleanup - タスク指示書

## メタ情報

```yaml
issue_number: 491
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-WCE-BACKUP-001                                      |
| タスク名     | Workspace Chat Edit Backup Auto Cleanup                |
| 分類         | 改善                                                   |
| 対象機能     | workspace-chat-edit（Main Process - FileService）      |
| 優先度       | 低                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | Phase 11（workspace-chat-edit-main-process手動テスト） |
| 発見日       | 2026-01-25                                             |
| 関連Issue    | #469（Main Process完了）                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workspace-chat-edit-main-process実装において、FileServiceはファイル書き込み前に自動バックアップ機能を提供している。バックアップファイルは `{originalPath}.backup.{timestamp}` 形式で作成されるが、現状では古いバックアップファイルの自動削除機能が未実装。

### 1.2 問題点・課題

- バックアップファイルが無限に蓄積される
- ディスク容量を圧迫する可能性
- ユーザーが手動でクリーンアップする必要がある

### 1.3 放置した場合の影響

- 長期使用でディスク容量が圧迫される
- プロジェクトディレクトリにバックアップファイルが散乱
- ただし、即座に深刻な問題にはならない（低優先度）

---

## 2. 何を達成するか（What）

### 2.1 目的

古いバックアップファイルを自動的にクリーンアップし、ディスク容量を適切に管理する。

### 2.2 最終ゴール

- 一定期間（デフォルト7日）を超えたバックアップファイルが自動削除される
- 各ファイルあたり最大N件（デフォルト5件）のバックアップのみ保持
- ユーザーが設定で保持期間・件数をカスタマイズ可能

### 2.3 スコープ

#### 含むもの

- FUT-02: バックアップファイルの自動クリーンアップ機能
  - 保持期間ベースのクリーンアップ（デフォルト7日）
  - 件数ベースのクリーンアップ（デフォルト5件/ファイル）
  - 設定によるカスタマイズ
  - 手動クリーンアップコマンド

#### 含まないもの

- バックアップの圧縮・アーカイブ
- クラウドバックアップ
- バージョン管理システム連携

### 2.4 成果物

| 成果物                 | 配置先                                                    |
| ---------------------- | --------------------------------------------------------- |
| backup-cleaner.ts      | `apps/desktop/src/main/services/chat-edit/utils/`         |
| backup-cleaner.test.ts | `apps/desktop/src/main/services/chat-edit/__tests__/`     |
| FileService更新        | `apps/desktop/src/main/services/chat-edit/FileService.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-edit-main-process タスク完了（✅ 2026-01-25完了）
- Node.js 20.x / pnpm 9.x 環境

### 3.2 依存タスク

| タスク                           | ステータス | 備考                             |
| -------------------------------- | ---------- | -------------------------------- |
| workspace-chat-edit-main-process | ✅ 完了    | FileService.createBackup実装済み |

### 3.3 必要な知識

- Node.js fs API（readdir, unlink, stat）
- Glob パターンマッチング
- Electron設定ストア（electron-store）

### 3.4 推奨アプローチ

1. クリーンアップロジック設計 → 2. TDD実装 → 3. FileService統合 → 4. 設定UI連携（オプション）

---

## 4. 実行手順

### Phase構成

本タスクは小規模のため、簡略化したPhase構成を採用:

| Phase | 名称         | 概要                       |
| ----- | ------------ | -------------------------- |
| 1-3   | 要件〜設計   | クリーンアップポリシー設計 |
| 4-5   | テスト〜実装 | TDD方式で実装              |
| 6-7   | テスト拡充   | エッジケーステスト         |
| 8-10  | 品質保証     | セキュリティ検証           |
| 11-13 | 検証〜PR     | 統合・ドキュメント・PR     |

### Phase 5: 実装

#### 目的

バックアップクリーンアップ機能をTDD方式で実装する。

#### 手順

1. **BackupCleaner クラス設計**

   ```typescript
   interface BackupCleanerOptions {
     maxAge: number; // ミリ秒（デフォルト: 7日）
     maxCount: number; // ファイルあたり最大件数（デフォルト: 5）
   }

   class BackupCleaner {
     constructor(options?: Partial<BackupCleanerOptions>);

     // 指定ディレクトリのバックアップをクリーンアップ
     cleanDirectory(dirPath: string): Promise<CleanupResult>;

     // 特定ファイルの古いバックアップを削除
     cleanFile(filePath: string): Promise<CleanupResult>;

     // バックアップファイルを検出
     findBackups(dirPath: string): Promise<BackupFile[]>;
   }

   interface CleanupResult {
     deletedCount: number;
     freedBytes: number;
     errors: Error[];
   }

   interface BackupFile {
     path: string;
     originalFile: string;
     timestamp: number;
     size: number;
   }
   ```

2. **FileService への統合**
   - createBackup 呼び出し後にクリーンアップ実行（オプション）
   - 定期クリーンアップスケジューラー（オプション）

3. **IPCハンドラ追加（オプション）**
   - `chat-edit:cleanup-backups` - 手動クリーンアップ実行

#### 成果物

- backup-cleaner.ts + テスト
- FileService統合

#### 完了条件

- バックアップファイルが正しく検出される
- 保持期間・件数に基づいて古いファイルが削除される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] バックアップファイルパターン（_.backup._）が正しく検出される
- [ ] 7日以上古いバックアップが削除される
- [ ] 同一ファイルのバックアップが5件を超えた場合、古いものから削除される
- [ ] 削除対象がない場合も正常終了する
- [ ] 設定でmaxAge/maxCountをカスタマイズ可能

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### セキュリティ要件

- [ ] バックアップファイル以外は削除されない
- [ ] パストラバーサル攻撃が防止されている
- [ ] 削除前に対象ファイルの所有権を検証

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] 設定オプションが文書化されている

---

## 6. 検証方法

### テストケース

| TC-ID        | 機能                 | 期待結果                           |
| ------------ | -------------------- | ---------------------------------- |
| TC-BACKUP-01 | バックアップ検出     | *.backup.*パターンが検出される     |
| TC-BACKUP-02 | 期間ベース削除       | 7日超のファイルが削除される        |
| TC-BACKUP-03 | 件数ベース削除       | 6件目以降の古いファイルが削除      |
| TC-BACKUP-04 | 削除対象なし         | エラーなく正常終了                 |
| TC-BACKUP-05 | パストラバーサル防止 | ディレクトリ外のファイルは削除不可 |
| TC-BACKUP-06 | 非バックアップ保護   | *.backup.*以外は削除されない       |

### 検証手順

1. `pnpm --filter @repo/desktop test` でユニットテスト実行
2. テスト用ディレクトリでクリーンアップ動作を手動確認
3. セキュリティテストで不正削除がないことを検証

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                           |
| ------------------------------ | ------ | -------- | ------------------------------ |
| 誤削除（重要ファイル）         | 高     | 低       | バックアップパターン厳密検証   |
| パストラバーサル               | 高     | 低       | パス正規化・ホワイトリスト検証 |
| 大量ファイル時のパフォーマンス | 低     | 低       | バッチ処理・非同期実行         |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Main Process実装ガイド | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md` |
| 手動テスト結果         | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-11/manual-test-result.md`   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                         | 内容                 |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------- |
| インターフェース（LLM）  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | FileService仕様      |
| セキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | パストラバーサル防止 |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ目標 |

### 参考資料

- glob: https://github.com/isaacs/node-glob
- Node.js fs API: https://nodejs.org/api/fs.html

---

## 9. 備考

### Phase 11検出時の記録

```
将来対応項目（優先度: 低〜中）

| ID     | ソース           | 内容                                         | 優先度 | 推奨対応             |
| ------ | ---------------- | -------------------------------------------- | ------ | -------------------- |
| FUT-02 | Phase 11発見課題 | バックアップファイルの自動クリーンアップ機能 | 低     | 将来タスク           |
```

### 補足事項

- 現時点でバックアップファイル蓄積による問題報告はない
- ユーザーからのフィードバック後に優先度を再評価
- 設定UIは別タスクとして分離可能
- electron-store でユーザー設定を永続化予定
