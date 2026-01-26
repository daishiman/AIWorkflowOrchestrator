# TASK-4-1: IPCチャネル定義 - 要件定義書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-4-1   |
| Phase      | 1          |
| 作成日     | 2026-01-25 |
| ステータス | 完了       |

---

## 1. 機能要件

### 1.1 概要

スキルインポート機能で使用する全てのIPCチャネル名を定義する。
既存の`apps/desktop/src/preload/channels.ts`に新しいチャネル定数を追加し、
ホワイトリストに登録する。

### 1.2 チャネル定義要件

#### 1.2.1 新規追加チャネル（8チャネル）

| ID    | チャネル名                | チャネル値                  | 通信方向 | 用途                     |
| ----- | ------------------------- | --------------------------- | -------- | ------------------------ |
| CH-01 | SKILL_LIST                | `skill:list`                | R→M      | 全スキル一覧取得         |
| CH-02 | SKILL_SCAN                | `skill:scan`                | R→M      | スキル再スキャン         |
| CH-03 | SKILL_GET_IMPORTED        | `skill:getImported`         | R→M      | インポート済みスキル取得 |
| CH-04 | SKILL_UPDATE              | `skill:update`              | R→M      | スキル情報更新           |
| CH-05 | SKILL_COMPLETE            | `skill:complete`            | M→R      | 実行完了通知             |
| CH-06 | SKILL_ERROR               | `skill:error`               | M→R      | エラー通知               |
| CH-07 | SKILL_PERMISSION_REQUEST  | `skill:permission:request`  | M→R      | 権限確認リクエスト       |
| CH-08 | SKILL_PERMISSION_RESPONSE | `skill:permission:response` | R→M      | 権限確認応答             |

※ R→M: Renderer → Main, M→R: Main → Renderer

#### 1.2.2 既存チャネル再利用（5チャネル）

| 既存チャネル名 | チャネル値      | 通信方向 | 備考       |
| -------------- | --------------- | -------- | ---------- |
| SKILL_IMPORT   | `skill:import`  | R→M      | 既存定義済 |
| SKILL_REMOVE   | `skill:remove`  | R→M      | 既存定義済 |
| SKILL_EXECUTE  | `skill:execute` | R→M      | 既存定義済 |
| SKILL_ABORT    | `skill:abort`   | R→M      | 既存定義済 |
| SKILL_STREAM   | `skill:stream`  | M→R      | 既存定義済 |

### 1.3 ホワイトリスト登録要件

#### 1.3.1 ALLOWED_INVOKE_CHANNELS

以下のチャネルを`ALLOWED_INVOKE_CHANNELS`配列に追加する:

- `SKILL_LIST`
- `SKILL_SCAN`
- `SKILL_GET_IMPORTED`
- `SKILL_UPDATE`
- `SKILL_PERMISSION_RESPONSE`

#### 1.3.2 ALLOWED_ON_CHANNELS

以下のチャネルを`ALLOWED_ON_CHANNELS`配列に追加する:

- `SKILL_COMPLETE`
- `SKILL_ERROR`
- `SKILL_PERMISSION_REQUEST`

### 1.4 型定義要件

- 新規チャネルは既存の`IpcChannel`型に自動的に含まれること
- `as const`アサーションを維持すること

---

## 2. 非機能要件

### 2.1 セキュリティ要件（NFR-SEC）

| ID        | 要件                                                       | 優先度 |
| --------- | ---------------------------------------------------------- | ------ |
| NFR-SEC-1 | 全チャネルはホワイトリスト方式で管理されること             | 必須   |
| NFR-SEC-2 | invoke用チャネルとon用チャネルは明確に分離されること       | 必須   |
| NFR-SEC-3 | 許可されていないチャネルへのアクセスは拒否されること       | 必須   |
| NFR-SEC-4 | チャネル名は予測困難な形式（プレフィックス付き）とすること | 推奨   |

### 2.2 型安全性要件（NFR-TYPE）

| ID         | 要件                                             | 優先度 |
| ---------- | ------------------------------------------------ | ------ |
| NFR-TYPE-1 | TypeScriptコンパイルエラーがないこと             | 必須   |
| NFR-TYPE-2 | `as const`による型推論が正しく機能すること       | 必須   |
| NFR-TYPE-3 | `IpcChannel`型が全チャネルのユニオン型となること | 必須   |

### 2.3 保守性要件（NFR-MAINT）

| ID          | 要件                                           | 優先度 |
| ----------- | ---------------------------------------------- | ------ |
| NFR-MAINT-1 | 既存のコーディングパターンに準拠すること       | 必須   |
| NFR-MAINT-2 | チャネルはカテゴリ別にコメントで区分けすること | 推奨   |
| NFR-MAINT-3 | 命名規則は既存チャネルと一貫性を保つこと       | 必須   |

---

## 3. 制約条件

### 3.1 技術的制約

| ID   | 制約                                                 |
| ---- | ---------------------------------------------------- |
| TC-1 | 既存の`IPC_CHANNELS`オブジェクトに追加する方式とする |
| TC-2 | 独立した`SKILL_CHANNELS`オブジェクトは作成しない     |
| TC-3 | 既存チャネルの値を変更してはならない                 |
| TC-4 | `readonly`配列への追加は既存パターンに従う           |

### 3.2 スコープ制約

| ID   | 制約                                                  |
| ---- | ----------------------------------------------------- |
| SC-1 | IPCハンドラーの実装は本タスクのスコープ外（TASK-4-2） |
| SC-2 | Preload APIの実装は本タスクのスコープ外（TASK-5-1）   |
| SC-3 | 実際の通信ロジックは本タスクのスコープ外              |

---

## 4. 受け入れ基準

### 4.1 必須基準

| ID    | 基準                                                   | 検証方法         |
| ----- | ------------------------------------------------------ | ---------------- |
| AC-01 | 8つの新規チャネル定数が定義されていること              | コードレビュー   |
| AC-02 | 全チャネル値に重複がないこと                           | 静的解析         |
| AC-03 | ALLOWED_INVOKE_CHANNELSに5チャネルが追加されていること | コードレビュー   |
| AC-04 | ALLOWED_ON_CHANNELSに3チャネルが追加されていること     | コードレビュー   |
| AC-05 | TypeScriptコンパイルエラーがないこと                   | `pnpm typecheck` |
| AC-06 | ESLintエラーがないこと                                 | `pnpm lint`      |
| AC-07 | 既存のチャネル定義が変更されていないこと               | git diff         |

### 4.2 推奨基準

| ID    | 基準                                       | 検証方法         |
| ----- | ------------------------------------------ | ---------------- |
| AC-08 | チャネル定義にコメントが付与されていること | コードレビュー   |
| AC-09 | テストファイルが作成されていること         | ファイル存在確認 |

---

## 5. 成果物一覧

| 成果物               | パス                                   | 説明               |
| -------------------- | -------------------------------------- | ------------------ |
| 要件定義書           | `outputs/phase-1/requirements.md`      | 本ドキュメント     |
| チャネル分析レポート | `outputs/phase-1/channel-analysis.md`  | 重複分析、実装方針 |
| 修正対象ファイル     | `apps/desktop/src/preload/channels.ts` | チャネル定義追加   |

---

## 6. 参照資料

| 資料                            | パス                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------- |
| 既存チャネル定義                | `apps/desktop/src/preload/channels.ts`                                       |
| スキルインポート仕様書（5.3節） | `docs/30-workflows/skill-import-agent-system/specification.md`               |
| IPC通信セキュリティガイドライン | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |

---

## 7. Phase完了確認

### タスク実行状況

- [x] タスク1: 既存IPCチャネル構造の確認 - 完了
- [x] タスク2: 仕様書からの要件抽出 - 完了
- [x] タスク3: 既存チャネルとの重複分析 - 完了
- [x] タスク4: 要件定義書の作成 - 完了

### 成果物生成状況

- [x] `outputs/phase-1/requirements.md` - 生成完了
- [x] `outputs/phase-1/channel-analysis.md` - 生成完了

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
