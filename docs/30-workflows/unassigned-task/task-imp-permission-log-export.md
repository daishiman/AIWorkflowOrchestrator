# 外部ログサービス連携・Main Processログ出力 - タスク指示書

## メタ情報

```yaml
issue_number: 634
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | task-imp-permission-log-export             |
| タスク名     | 外部ログサービス連携・Main Processログ出力 |
| 分類         | 改善                                       |
| 対象機能     | PermissionHistory, Main Process            |
| 優先度       | 低                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 1（スコープ外項目）                  |
| 発見日       | 2026-02-01                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-permission-history-001では権限履歴がRenderer Process（localStorage）にのみ保存される。企業利用やセキュリティ監査の観点から、Main Processでのファイルログ出力や外部ログサービスとの連携が求められる可能性がある。

### 1.2 問題点・課題

- localStorageのみの保存では監査ログとしての信頼性が不十分
- Main Processログがないため、アプリクラッシュ時にデータが失われる可能性
- 外部のログ分析ツールとの連携ができない

### 1.3 放置した場合の影響

- 企業環境でのコンプライアンス要件を満たせない可能性
- アプリ障害時の履歴データ損失リスク

---

## 2. 何を達成するか（What）

### 2.1 目的

権限判断履歴をMain Processでファイル出力し、オプションで外部サービスに送信する。

### 2.2 最終ゴール

- Main Processでpermission-history.logファイルに追記
- 設定画面でログ出力のオン/オフを制御

### 2.3 スコープ

#### 含むもの

- IPC経由でMain Processにログイベント送信
- Main Processでのファイルログ出力
- ログローテーション（サイズ制限）

#### 含まないもの

- 特定の外部サービス（Datadog, Splunk等）との統合（将来のプラグイン対応）
- ログのリアルタイムストリーミング

### 2.4 成果物

- IPCハンドラー追加（permission:logEntry）
- Main Processログライター
- 設定UI追加
- テストコード

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-history-001が完了していること

### 3.2 依存タスク

- task-imp-permission-history-001（完了済み）

### 3.3 必要な知識

- Electron Main Process, IPC通信
- Node.js fs API, ログローテーション

### 3.4 推奨アプローチ

1. skillSlice.respondToSkillPermissionからIPC経由でMain Processにログ送信
2. Main Processで日付ベースのログファイルに追記
3. electron-storeで設定管理（有効/無効、保存先パス）

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルのPhase 1-13に従って実行。主要ステップは以下の通り。

### Phase 1-2: 要件定義・設計

#### 目的

IPC通信設計とMain Processログ出力設計を確定する。

#### 手順

1. IPCチャネル設計: `permission:logEntry`チャネルでRenderer→Main方向にログイベント送信
2. Preload API設計: `electronAPI.permission.logEntry(entry: PermissionLogPayload)`を公開
3. Main Processログフォーマット設計: JSON Lines形式（1行1エントリ、タイムスタンプ・ツール名・判断結果・安全化済みargs）
4. ログローテーション設計: 10MB上限、5世代保持（permission-history.log → permission-history.1.log ...）
5. 仕様書参照: `arch-state-management.md` L385-L395（safeArgsSnapshot セキュリティ仕様）、`security-api-electron.md`（Preload/IPC通信セキュリティ）

#### 成果物

- 要件定義書（Phase 1）
- 設計書（Phase 2）

### Phase 4-5: テスト作成・実装

#### 目的

TDDでIPC通信・ログ出力・設定機能を実装する。

#### 手順

1. `skillSlice.respondToSkillPermission`内でIPC送信コードを追加（`window.electronAPI.permission.logEntry()`呼び出し）
2. Main Processに`permission-log-handler.ts`を作成（IPCハンドラー + ファイル書き込み）
3. ログローテーションロジック実装（`fs.stat`でサイズ確認 → リネーム → 新規作成）
4. Preload bridgeに`permission:logEntry`チャネルを追加（contextBridge経由の安全な公開）
5. 設定UI: PermissionSettingsに「ログファイル出力」トグルスイッチ追加
6. テスト: ログファイル出力確認、ローテーション動作確認、設定オフ時の非出力確認、safeArgsSnapshot経由データのみ記録されることの検証

#### 成果物

- `permission-log-handler.ts`（Main Process）
- Preload bridge拡張
- skillSlice IPC送信追加
- 設定UI追加
- 対応テストファイル

### Phase 8-9: リファクタリング・品質保証

#### 手順

1. ログ書き込みの非同期処理が正しくエラーハンドリングされていることを確認
2. safeArgsSnapshot()経由のデータのみがログに記録されることをセキュリティテストで確認
3. ESLint / TypeScript strict / カバレッジ基準の確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 権限判断時にMain Processにログが出力される
- [ ] ログファイルにタイムスタンプ・ツール名・判断結果が記録される
- [ ] ログ出力のオン/オフ設定が動作する

### 品質要件

- [ ] Line Coverage 80%以上
- [ ] TypeScript strict PASS
- [ ] ESLint PASS
- [ ] セキュリティ: ログファイルにargsSnapshotが安全化済みであること

### ドキュメント要件

- [ ] 実装ガイド作成
- [ ] システム仕様書更新

---

## 6. 検証方法

### テストケース

- 権限許可後にログファイルにエントリが追記されること
- 設定オフ時にログが出力されないこと
- ログファイルサイズが制限を超えた場合にローテーションされること

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                                         |
| ------------------ | ------ | -------- | -------------------------------------------- |
| ディスク容量消費   | 中     | 中       | ログローテーション（10MB上限、5世代保持）    |
| パフォーマンス影響 | 低     | 低       | 非同期書き込み                               |
| 機密情報漏洩       | 高     | 低       | safeArgsSnapshot()で安全化済みデータのみ記録 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-IMP-permission-history-001/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`（スキル実行セキュリティ）
- `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`（Preload/IPC通信セキュリティ）
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`（L385-L395: safeArgsSnapshotセキュリティ仕様）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`（L251-L309: Permission History Panel仕様）

### 参考資料

- Electron IPC Best Practices（contextBridge / contextIsolation）
- Node.js fs.createWriteStream（非同期ログ書き込み）

---

## 9. 備考

### 補足事項

- Phase 1スコープ外項目#3「外部ログサービスとの連携」および#4「Main Processでのログファイル出力」を統合
