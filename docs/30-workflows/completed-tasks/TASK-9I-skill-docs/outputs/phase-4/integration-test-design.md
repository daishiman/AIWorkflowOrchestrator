# TASK-9I 結合テスト設計 (Phase 4)

## メタ情報

| 項目      | 値                 |
| --------- | ------------------ |
| タスク ID | TASK-9I-SKILL-DOCS |
| Phase     | 4 (テスト作成)     |
| 作成日    | 2026-02-28         |

## 目的

スキルドキュメント生成機能の結合テスト設計を定義する。Phase 4 では結合テストの設計のみを行い、実装は Phase 6（テスト拡充）で実施する。

## 結合テスト対象フロー

### フロー 1: SkillDocGenerator + IPC ハンドラ結合

```
Renderer → Preload API → IPC Channel → skillHandlers → SkillDocGenerator → LLM
                                                        ↓
                                                   SkillFileManager → ファイルシステム
```

#### テストシナリオ

| ID     | シナリオ                                              | 検証ポイント                                                                                           |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| INT-01 | generate リクエスト → IPC → サービス → 生成結果返却   | IPC バリデーション通過後、SkillDocGenerator.generate() が正しく呼ばれ、結果が IPC レスポンスとして返る |
| INT-02 | preview リクエスト → IPC → サービス → プレビュー返却  | preview() が markdown 固定で呼ばれ、テンプレート引数が正しく渡される                                   |
| INT-03 | export リクエスト → IPC → サービス → ファイル書き込み | exportToFile() が正しいパスとコンテンツで呼ばれ、成功レスポンスが返る                                  |
| INT-04 | templates リクエスト → IPC → テンプレート一覧返却     | DEFAULT_DOC_TEMPLATE が配列として返される                                                              |

### フロー 2: Preload API → IPC チャンネル → ハンドラ → サービス

#### テスト対象チャンネル

| チャンネル             | Preload API メソッド | IPC ハンドラ関数            | サービスメソッド                 |
| ---------------------- | -------------------- | --------------------------- | -------------------------------- |
| `skill:docs:generate`  | `docsGenerate`       | `registerSkillDocsHandlers` | `SkillDocGenerator.generate`     |
| `skill:docs:preview`   | `docsPreview`        | 同上                        | `SkillDocGenerator.preview`      |
| `skill:docs:export`    | `docsExport`         | 同上                        | `SkillDocGenerator.exportToFile` |
| `skill:docs:templates` | `docsTemplates`      | 同上                        | 定数返却                         |

#### バリデーション伝播テスト

| ID     | テスト                                                     | 入力               | 期待されるエラー伝播パス                                                                 |
| ------ | ---------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| INT-05 | IPC 層バリデーションエラー → Renderer エラーレスポンス     | 空文字列 skillName | IPC validate → { success: false }                                                        |
| INT-06 | サービス層エラー → IPC エラーハンドリング → Renderer       | 存在しないスキル名 | Service throw → IPC catch → { success: false, error: "Skill not found: ..." }            |
| INT-07 | LLM タイムアウト → サービス層エラー → IPC エラーレスポンス | 30秒超 LLM 応答    | timeout reject → Service throw → IPC catch → { success: false, error: "Internal error" } |

### フロー 3: エラー伝播パス

```
LLM Timeout Error ──→ SkillDocGenerator.generateSection()
                        ↓
                   Promise.race reject
                        ↓
                   SkillDocGenerator.generate() throw
                        ↓
                   IPC handler try/catch
                        ↓
                   sanitized error response → Renderer
```

#### エラー伝播テスト

| ID     | エラー発生元          | エラー種別                | 期待される最終レスポンス                          |
| ------ | --------------------- | ------------------------- | ------------------------------------------------- |
| ERR-01 | SkillFileManager      | SkillNotFoundError        | { success: false, error: "Skill not found: ..." } |
| ERR-02 | LLM queryFn           | Timeout Error             | { success: false, error: "Internal error" }       |
| ERR-03 | fs.writeFile          | ENOENT / Permission Error | { success: false, error: "Internal error" }       |
| ERR-04 | validateOutputPath    | Path Traversal Error      | { success: false, error: "Invalid output path" }  |
| ERR-05 | IPC sender validation | Unauthorized sender       | toIPCValidationError の戻り値                     |

## モック構成（結合テスト用）

### 最小モックセット

結合テストでは以下のみモック化し、残りは実装を使用する:

1. **LLMQueryFn**: LLM 呼び出しをモック（外部依存）
2. **SkillFileManager**: ファイルシステムアクセスをモック（インフラ依存）
3. **fs/promises**: ファイル書き込みをモック（exportToFile 用）
4. **electron**: `ipcMain.handle` / `BrowserWindow` をモック
5. **ipc-validator**: sender 検証をモック

### 実装を使用するコンポーネント

- **SkillDocGenerator**: 実インスタンスを使用
- **IPC ハンドラ内バリデーション**: 実ロジックを通過させる

## IPC 契約検証チェックリスト（P44/P45 対策）

| #   | 検証項目                                                      | 状態   |
| --- | ------------------------------------------------------------- | ------ |
| 1   | ハンドラ引数形式と Preload 側の呼び出し形式が一致している     | 要確認 |
| 2   | 引数名のセマンティクスが実際の値と一致（P45 対策）            | 要確認 |
| 3   | P42 準拠 3 段バリデーション（型 → 空文字列 → トリム空文字列） | 実装済 |
| 4   | IPC_CHANNELS 定数を使用（ハードコード文字列なし、P27 対策）   | 実装済 |
| 5   | エラーレスポンスのサニタイズ（内部情報漏洩防止）              | 実装済 |

## Phase 6 での実装計画

Phase 6（テスト拡充）で以下の結合テストファイルを作成予定:

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.docs.integration.test.ts`
  - INT-01 ～ INT-07 のシナリオ
  - ERR-01 ～ ERR-05 のエラー伝播パス
  - IPC 契約検証チェックリストの自動検証
