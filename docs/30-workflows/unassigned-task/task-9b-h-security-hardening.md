# SkillCreator IPCセキュリティ強化 - タスク指示書

## メタ情報

```yaml
issue_number: 796
```

## メタ情報

| 項目         | 内容                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| タスクID     | UT-9B-H-003                                                                                       |
| タスク名     | SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト） |
| 分類         | セキュリティ                                                                                      |
| 対象機能     | Skill Creator IPC                                                                                 |
| 優先度       | 高                                                                                                |
| 見積もり規模 | 小規模                                                                                            |
| ステータス   | 未実施                                                                                            |
| 発見元       | TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー（2026-02-12）                                        |
| 発見日       | 2026-02-12                                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-H-SKILL-CREATOR-IPCの最終品質レビューにおいて、skillCreatorHandlers.tsのセキュリティ要件の一部が未実装であることが発見された。

### 1.2 問題点・課題

skillCreatorHandlers.tsの以下のセキュリティ要件が未実装:

1. **パストラバーサル対策**: `tasksDir`、`skillDir` パラメータに対するパス検証がない。`../../etc/passwd` 等の攻撃パスが未検証でサービス層に到達する
2. **エラーサニタイズ**: `error.message` をそのまま返却しており、内部情報（ファイルパス、スタックトレース）がRendererに漏洩する可能性がある
3. **schemaNameホワイトリスト**: 任意の文字列がスキーマ名として受け入れられる

### 1.3 放置した場合の影響

- パストラバーサル攻撃により、SkillCreatorServiceが意図しないディレクトリにアクセスするリスク
- エラーメッセージ経由での内部情報漏洩（ファイルパス、スタックトレース）
- 04-electron-security.md の IPC セキュリティ原則（引数は Main 側でバリデーション）に非準拠

---

## 2. 何を達成するか（What）

### 2.1 目的

skillCreatorHandlers.tsに3つのセキュリティ対策を実装し、04-electron-security.mdのIPCセキュリティ原則に準拠させる。

### 2.2 最終ゴール

- パストラバーサル攻撃パスがIPCハンドラーレベルで拒否される
- エラーメッセージが安全にサニタイズされてからRendererに返却される
- schemaNameがホワイトリストで検証される
- 対応するセキュリティテストが全てPASS

### 2.3 スコープ

#### 含むもの

- パストラバーサル検証関数の実装（path.resolve + startsWith で許可ディレクトリ内か確認）
- sanitizeError関数の実装（error.messageからファイルパス・スタックトレースを除去）
- schemaNameのホワイトリスト検証（許可されたスキーマ名のみ受け入れ）
- 対応するセキュリティテストの追加

#### 含まないもの

- 他のIPCハンドラーのセキュリティ強化（別タスク）
- Preload層のセキュリティ変更

### 2.4 成果物

| 成果物                 | パス                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| ハンドラー更新         | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                         |
| セキュリティテスト追加 | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-H-SKILL-CREATOR-IPCが完了していること（完了済み）
- 04-electron-security.mdのIPCセキュリティ原則を理解していること

### 3.2 依存タスク

| タスクID                    | 関係   | 説明                                 |
| --------------------------- | ------ | ------------------------------------ |
| TASK-9B-H-SKILL-CREATOR-IPC | 完了済 | セキュリティ課題が発見された元タスク |

### 3.3 必要な知識

- Node.js `path.resolve()` / `path.normalize()` によるパス正規化
- パストラバーサル攻撃の手法（`../`、`..\`、NULLバイト、UNCパス）
- Electron IPCハンドラーのエラーサニタイズパターン

### 3.4 推奨アプローチ

- パストラバーサル検証: 既存の `SkillFileManager.validatePath()` の実装を参考に、IPCハンドラーレベルでも検証を追加
- sanitizeError: 既存の `authModeHandlers.ts` の `sanitizeErrorMessage()` を参考に実装
- schemaNameホワイトリスト: `ALLOWED_SCHEMA_NAMES` 定数配列を定義し、`includes()` で検証

### 3.5 実装課題と解決策（TASK-9B-Hからの学び）

#### 課題1: セキュリティレイヤーの段階的実装

- **問題**: 3層セキュリティ（L1ホワイトリスト、L2 sender検証、L3引数バリデーション）のうち、L3の引数バリデーションでパストラバーサル検証が不足していた。Phase 10最終レビューで初めて検出された
- **根本原因**: L1/L2は既存パターン（authHandlers等）を踏襲して実装できたが、L3のドメイン固有バリデーション（パス検証等）は既存パターンにない新規要件だった
- **解決策**: IPCハンドラー実装時のセキュリティチェックリスト:
  1. L1: `channels.ts`のホワイトリスト登録
  2. L2: `validateIpcSender`呼び出し
  3. L3-a: 型チェック（typeof/Zod）
  4. L3-b: **ドメイン固有バリデーション**（パストラバーサル、ホワイトリスト、サニタイズ） -- これが漏れやすい
  5. エラーサニタイズ: `sanitizeError`関数の使用
- **参照**: [security-electron-ipc.md](../../.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md) skillCreatorAPIセキュリティ実装例

#### 課題2: エラーサニタイズの範囲

- **問題**: `error instanceof Error ? error.message : "デフォルトメッセージ"` パターンでスタックトレースは防いだが、error.message自体に内部パス情報が含まれる可能性を考慮していなかった
- **解決策**: 専用の`sanitizeErrorMessage()`関数を使用し、既知の安全なメッセージのみ通す。未知のエラーは汎用メッセージに置換。参考実装: `authModeHandlers.ts`の`sanitizeErrorMessage()`
- **参照**: [error-handling.md](../../.claude/skills/aiworkflow-requirements/references/error-handling.md) エラーサニタイズ仕様

#### 課題3: Preload統合の4点チェックリスト

- **問題**: `skill-creator-api.ts`でAPIオブジェクトを実装したが、`preload/index.ts`でのcontextBridge公開が漏れていた（Phase 8-9で修正）
- **解決策**: Preload API追加時の必須4点チェックリスト:
  1. `import { xxxAPI } from "./xxx-api"` の追加
  2. `electronAPI`オブジェクト内に `xxx: xxxAPI` を追加
  3. `contextBridge.exposeInMainWorld("xxxAPI", xxxAPI)` の追加
  4. non-isolatedフォールバック `window.xxxAPI = xxxAPI` の追加
- **参照**: [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) Lesson 1: Preload統合見落とし

---

## 4. 実行手順

### Phase構成

Phase 4-9（テスト作成→実装→品質検証）の構成で実施。セキュリティタスクのため、テストファーストを厳守する。

### Phase 4: テスト作成

#### 目的

セキュリティ要件を検証するテストケースを先行作成

#### 手順

1. パストラバーサル攻撃テスト: `../`, `..\`, NULLバイト, UNCパスを含むtasksDir/skillDirが拒否されること
2. エラーサニタイズテスト: ファイルパスを含むerror.messageがサニタイズされること
3. schemaNameホワイトリストテスト: 未許可のschemaNameが拒否されること

### Phase 5: 実装

#### 目的

セキュリティ対策を実装

#### 手順

1. `skillCreatorHandlers.ts` にパストラバーサル検証ロジックを追加（execute-tasks, validate ハンドラー）
2. sanitizeError関数を実装（既存のauthModeHandlers.tsのsanitizeErrorMessageを参照）
3. schemaNameのホワイトリスト定義と検証を追加
4. 対応するテストケースを追加（SCIT-SEC-05〜08の実装層テスト化）

### Phase 9: 品質検証

#### 手順

1. `pnpm typecheck` がPASS
2. `pnpm lint` がPASS
3. 全テストPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] パストラバーサル攻撃パス（../、..\、NULLバイト、UNCパス）がIPCハンドラーレベルで拒否される
- [ ] error.messageにファイルパスが含まれる場合にサニタイズされてからRendererに返却される
- [ ] 未許可のschemaNameが拒否される（ホワイトリスト以外は `{ success: false, error: "..." }` を返却）

### 品質要件

- [ ] `pnpm typecheck` がPASS
- [ ] `pnpm lint` がPASS
- [ ] 全テストPASS

### ドキュメント要件

- [ ] 実装したセキュリティ対策がコード内コメントで説明されている

---

## 6. 検証方法

### テストケース

| テストID | 入力値                     | 期待結果                                      |
| -------- | -------------------------- | --------------------------------------------- |
| SEC-01   | tasksDir: `../../etc`      | `{ success: false, error: "Invalid path" }`   |
| SEC-02   | skillDir: `..\\windows`    | `{ success: false, error: "Invalid path" }`   |
| SEC-03   | tasksDir: `path\x00evil`   | `{ success: false, error: "Invalid path" }`   |
| SEC-04   | schemaName: `evil-schema`  | `{ success: false, error: "..." }`            |
| SEC-05   | throw Error with file path | error.messageからファイルパスが除去されている |

### 検証手順

1. `pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security` で全テストPASS
2. `pnpm typecheck` で型整合性確認
3. 手動で `../../etc/passwd` 等の攻撃パスを試行し、拒否されることを確認

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                                 |
| ------------------------------------------ | ------ | -------- | -------------------------------------------------------------------- |
| パス正規化の不完全性（OSごとの差異）       | 高     | 低       | `path.resolve()` + `startsWith()` の組み合わせでOS非依存の検証を実施 |
| sanitizeErrorの過剰除去によるデバッグ困難  | 中     | 中       | 開発環境ではログに詳細エラーを出力し、Rendererへの返却のみサニタイズ |
| ホワイトリスト更新漏れ（新スキーマ追加時） | 中     | 中       | スキーマ追加時はホワイトリストも更新するルールをコメントに明記       |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| 設計書セキュリティセクション | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/architecture-design.md` セクション5.2 |
| Electronセキュリティルール   | `.claude/rules/04-electron-security.md`                                                    |
| 既存sanitizeError参考        | `apps/desktop/src/main/ipc/authModeHandlers.ts`                                            |
| SkillFileManagerパス検証参考 | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                                 |

### システム仕様書参照

| 仕様書                                    | 関連セクション                    |
| ----------------------------------------- | --------------------------------- |
| `security-electron-ipc.md`                | skillCreatorAPIセキュリティ実装例 |
| `architecture-implementation-patterns.md` | IPC 3層セキュリティパターン       |
| `error-handling.md`                       | エラーサニタイズ仕様              |
| `lessons-learned.md`                      | Lesson 1, 7                       |
| `api-ipc-agent.md`                        | Skill Creator IPCチャンネル定義   |

### 関連タスク

| タスクID                    | 関係   | 説明                              |
| --------------------------- | ------ | --------------------------------- |
| TASK-9B-H-SKILL-CREATOR-IPC | 発見元 | SkillCreatorService IPC実装タスク |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
最終品質レビュー: skillCreatorHandlers.tsのセキュリティ要件（パストラバーサル対策、エラーサニタイズ、schemaNameホワイトリスト）が未実装。04-electron-security.mdのIPCセキュリティ原則「引数はMain側でバリデーション」に非準拠。
```

### 補足事項

- 優先度「高」: セキュリティ関連のため早期対応を推奨
- 既存の `SkillFileManager` にはパストラバーサル防止が実装済み（`PathTraversalError`）だが、IPCハンドラーレベルでは未検証のまま到達する
- `authModeHandlers.ts` の `sanitizeErrorMessage()` は既に同様のパターンを実装しており、横展開で対応可能
