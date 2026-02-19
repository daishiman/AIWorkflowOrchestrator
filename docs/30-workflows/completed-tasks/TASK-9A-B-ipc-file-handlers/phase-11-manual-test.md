# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト検証               |
| タスクID   | TASK-9A-B                    |
| 前提Phase  | Phase 10（最終レビュー）     |
| 後続Phase  | Phase 12（ドキュメント更新） |
| ステータス | 完了                         |
| 作成日     | 2026-02-19                   |
| 機能名     | TASK-9A-B-ipc-file-handlers  |

---

## 目的

Electron 実環境およびユニットテスト結果を用いて、6つのファイル編集IPCハンドラーの動作を検証する。
自動テストでは検証できない実環境固有の動作とセキュリティ境界の動作を確認する。

## 背景

IPCハンドラーはMain ProcessとRenderer Processの境界に位置するため、ユニットテストだけでは実際のプロセス間通信の動作を完全には検証できない。
DevToolsコンソールからの直接呼び出しにより、実環境での動作を確認する。

---

## テスト実施方針

### 制限事項

- Preload API のスタブ未解消チャンネルが存在する場合、DevToolsからの直接呼び出しが不可能な場合がある
- その場合はユニットテスト結果をもって手動テストの代替とする
- 代替判断は Phase 11 実施時に決定し、理由を `outputs/phase-11/manual-test-result.md` に記録する

### 検証方法

| 方法                           | 対象                              | 優先度 |
| ------------------------------ | --------------------------------- | ------ |
| DevToolsコンソール直接呼び出し | Preload APIが接続済みのチャンネル | 高     |
| ユニットテスト結果の確認       | 全6チャンネル                     | 高     |
| コードリーディング             | セキュリティ実装の確認            | 中     |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 自動テストの実行確認

**目的**: 手動テスト前に自動テストが全てパスすることを確認する

**実行手順**:

1. skillHandlers のユニットテストを実行する
2. 全テストがパスすることを確認する
3. テスト結果サマリーを記録する

**コマンド**:

```bash
# skillHandlers テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-11/auto-test-result.md`

---

### タスク2: ファイル読み込み・書き込みテスト

**目的**: readFile / writeFile の正常動作を確認する

**テストケーステーブル**:

| TC-ID  | チャンネル | 操作内容                                                                                                                   | 前提条件             | 期待結果                                             |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------- |
| TC-001 | readFile   | DevToolsで `window.electronAPI.skill.readFile({ skillName: "test-skill", filePath: "SKILL.md" })` を実行                   | test-skillが存在する | `{ success: true, data: { content: "..." } }` が返る |
| TC-002 | readFile   | 存在しないファイルを読み込む: `readFile({ skillName: "test-skill", filePath: "nonexistent.md" })`                          | test-skillが存在する | `{ success: false, error: "..." }` が返る            |
| TC-003 | writeFile  | DevToolsで `window.electronAPI.skill.writeFile({ skillName: "test-skill", filePath: "test.md", content: "hello" })` を実行 | test-skillが存在する | `{ success: true }` が返り、ファイルが作成される     |
| TC-004 | writeFile  | 書き込み後にスキル再スキャンが実行されることを確認する                                                                     | writeFile成功後      | スキル一覧が更新される                               |

**実行手順（TC-001）**:

1. Electronアプリを起動する
2. DevTools（Ctrl+Shift+I / Cmd+Option+I）を開く
3. Consoleタブで以下を実行する:
   ```javascript
   await window.electronAPI.skill.readFile({
     skillName: "test-skill",
     filePath: "SKILL.md",
   });
   ```
4. レスポンスが `{ success: true, data: { content: "..." } }` であることを確認する

**期待される成果物**:

- `outputs/phase-11/read-write-test-result.md`

---

### タスク3: ファイル作成・削除テスト

**目的**: createFile / deleteFile の正常動作を確認する

**テストケーステーブル**:

| TC-ID  | チャンネル | 操作内容                                                                                                    | 前提条件             | 期待結果                                         |
| ------ | ---------- | ----------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------ |
| TC-005 | createFile | `window.electronAPI.skill.createFile({ skillName: "test-skill", filePath: "new-file.md", content: "new" })` | test-skillが存在する | `{ success: true }` が返り、ファイルが作成される |
| TC-006 | createFile | 既に存在するファイルパスで createFile を呼び出す                                                            | TC-005完了後         | エラーまたは上書き（設計による）が返る           |
| TC-007 | deleteFile | `window.electronAPI.skill.deleteFile({ skillName: "test-skill", filePath: "new-file.md" })`                 | TC-005完了後         | `{ success: true }` が返り、ファイルが削除される |
| TC-008 | deleteFile | 存在しないファイルのdeleteを呼び出す                                                                        | ファイルが存在しない | `{ success: false, error: "..." }` が返る        |

**期待される成果物**:

- `outputs/phase-11/create-delete-test-result.md`

---

### タスク4: バックアップ操作テスト

**目的**: listBackups / restoreBackup の正常動作を確認する

**テストケーステーブル**:

| TC-ID  | チャンネル    | 操作内容                                                                               | 前提条件               | 期待結果                                             |
| ------ | ------------- | -------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------- |
| TC-009 | listBackups   | `window.electronAPI.skill.listBackups({ skillName: "test-skill" })`                    | test-skillが存在する   | `{ success: true, data: [...] }` が返る              |
| TC-010 | listBackups   | バックアップが存在しないスキルで呼び出す                                               | バックアップなし       | `{ success: true, data: [] }` が返る（空配列）       |
| TC-011 | restoreBackup | `window.electronAPI.skill.restoreBackup({ skillName: "test-skill", backupId: "..." })` | バックアップが存在する | `{ success: true }` が返り、バックアップが復元される |
| TC-012 | restoreBackup | 存在しないbackupIdでrestoreを呼び出す                                                  | 不正なbackupId         | `{ success: false, error: "..." }` が返る            |

**期待される成果物**:

- `outputs/phase-11/backup-test-result.md`

---

### タスク5: セキュリティテスト

**目的**: パストラバーサル攻撃とエラーハンドリングが正しく機能することを確認する

**テストケーステーブル**:

| TC-ID  | チャンネル   | 操作内容                                                                                                   | 期待結果                               |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| TC-013 | readFile     | パストラバーサル攻撃: `readFile({ skillName: "test", filePath: "../../../etc/passwd" })`                   | エラーが返り、ファイルにアクセスしない |
| TC-014 | writeFile    | パストラバーサル攻撃: `writeFile({ skillName: "test", filePath: "../../malicious.txt", content: "hack" })` | エラーが返り、ファイルが作成されない   |
| TC-015 | deleteFile   | パストラバーサル攻撃: `deleteFile({ skillName: "test", filePath: "../../../important.txt" })`              | エラーが返り、ファイルが削除されない   |
| TC-016 | 全チャンネル | エラーレスポンスに内部パス情報が含まれていないことを確認する                                               | エラーメッセージがサニタイズされている |

**期待される成果物**:

- `outputs/phase-11/security-test-result.md`

---

### タスク6: 発見課題の記録

**目的**: テスト中に発見した課題を記録する

**実行手順**:

1. タスク1〜5で発見した問題を記録する
2. 問題の重要度を分類する
3. 対応方針を決定する

**課題分類**:

| 重要度   | 基準                       | 対応             |
| -------- | -------------------------- | ---------------- |
| 致命的   | 機能が使用できない         | 即時修正         |
| 重大     | 一部機能に影響             | 本フェーズで修正 |
| 軽微     | 使用に支障なし             | Phase 12 で記録  |
| 改善提案 | より良くするためのアイデア | Phase 12 で記録  |

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料           | パス                                                         | 内容                   |
| ------------------ | ------------------------------------------------------------ | ---------------------- |
| IPCハンドラー実装  | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | Main Processハンドラー |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                      | Preload API実装        |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | テストコード           |
| Phase 1要件仕様    | `outputs/phase-1/requirements-specification.md`              | 要件                   |
| セキュリティルール | `.claude/rules/04-electron-security.md`                      | セキュリティ基準       |

---

## 成果物

| 成果物                 | パス                                            | 内容                                     |
| ---------------------- | ----------------------------------------------- | ---------------------------------------- |
| 自動テスト結果         | `outputs/phase-11/auto-test-result.md`          | テスト実行結果                           |
| 読み書きテスト結果     | `outputs/phase-11/read-write-test-result.md`    | readFile/writeFileテスト                 |
| 作成・削除テスト結果   | `outputs/phase-11/create-delete-test-result.md` | createFile/deleteFileテスト              |
| バックアップテスト結果 | `outputs/phase-11/backup-test-result.md`        | listBackups/restoreBackupテスト          |
| セキュリティテスト結果 | `outputs/phase-11/security-test-result.md`      | パストラバーサル・エラーサニタイズテスト |
| 発見課題               | `outputs/phase-11/discovered-issues.md`         | 課題一覧                                 |

---

## 統合テスト連携

> Electron環境での手動動作確認

| 確認項目                | 基準                                                                    |
| ----------------------- | ----------------------------------------------------------------------- |
| 全6チャンネル正常動作   | readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup |
| パストラバーサル防止    | 全パス引数チャンネルで攻撃パターンが拒否される                          |
| エラーサニタイズ        | 全エラーレスポンスで内部情報が漏洩しない                                |
| writeFile後の再スキャン | スキル一覧が自動更新される                                              |

---

## 完了条件

- [ ] 自動テストが全てパスしている
- [ ] ファイル読み書きテスト（TC-001〜TC-004）が全てパスしている
- [ ] ファイル作成・削除テスト（TC-005〜TC-008）が全てパスしている
- [ ] バックアップ操作テスト（TC-009〜TC-012）が全てパスしている
- [ ] セキュリティテスト（TC-013〜TC-016）が全てパスしている
- [ ] 発見課題が記録されている（0件でも記録必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（6ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-12-documentation.md`
