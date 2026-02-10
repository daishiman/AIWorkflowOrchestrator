# 要件定義書

## メタ情報

| 項目         | 値                                               |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING            |
| 機能名       | SKILL_EXECUTEハンドラーのSkillExecutor委譲       |
| 作成日       | 2026-02-09                                       |
| 分類         | バグ修正（構造的断絶）                           |
| 規模         | 小規模                                           |
| 前提         | TASK-FIX-16-1-SDK-APIKEY-INFRASTRUCTURE 完了済み |
| 仕様書参照先 | phase-01-requirements.md                         |

---

## 1. 背景・現状

### 1.1 問題の概要

`skill:execute` IPCハンドラーの呼び出しチェーンに構造的な断絶が存在する。

| コンポーネント              | 状態                                 | 問題点               |
| --------------------------- | ------------------------------------ | -------------------- |
| SKILL_EXECUTE ハンドラー    | SkillService.executeSkill() 呼び出し | 正しくない委譲先     |
| SkillService.executeSkill() | スタブ実装                           | 固定文字列を返すだけ |
| SkillExecutor.execute()     | SDK統合済み                          | 完全に孤立している   |

### 1.2 現在の呼び出しチェーン（問題あり）

```
SKILL_EXECUTE handler
  → skillService.executeSkill()
  → 固定文字列 "Skill executed successfully" を返す
```

### 1.3 期待される呼び出しチェーン

```
SKILL_EXECUTE handler
  → バリデーション
  → スキル取得 (skillService.getSkillById)
  → SkillExecutionRequest 構築
  → _skillExecutorInstance.execute(request, skill)
  → SDK query() API
  → ストリーミングレスポンス
```

---

## 2. 機能要件（FR）

| FR-ID | 要件                                                                 | 優先度 | 備考                             |
| ----- | -------------------------------------------------------------------- | ------ | -------------------------------- |
| FR-01 | SKILL_EXECUTE ハンドラーから SkillExecutor.execute() を呼び出す      | 高     | スタブ実装からの切り替え         |
| FR-02 | ハンドラー引数から SkillExecutionRequest を構築する                  | 高     | 型変換ロジック                   |
| FR-03 | SkillExecutionResponse をハンドラーレスポンスに変換する              | 高     | 成功/エラーの両ケース対応        |
| FR-04 | スキル取得時にインポート状態を確認する                               | 高     | 未インポートスキルの実行防止     |
| FR-05 | 既存のバリデーションロジック（送信元・引数）を保持する               | 高     | セキュリティ要件の維持           |
| FR-06 | エラー発生時に適切なエラーレスポンスを返す                           | 高     | ユーザーフレンドリーなメッセージ |
| FR-07 | \_skillExecutorInstance が初期化されていない場合のエラーハンドリング | 中     | アプリ起動順序の考慮             |

---

## 3. 非機能要件（NFR）

| NFR-ID | 要件                                                  | 優先度 | 備考                      |
| ------ | ----------------------------------------------------- | ------ | ------------------------- |
| NFR-01 | 既存テストが全て通過する                              | 高     | リグレッション防止        |
| NFR-02 | 型チェックが通る（TypeScript strict）                 | 高     | 型安全性の維持            |
| NFR-03 | 既存のセキュリティチェック（validateIpcSender）を維持 | 高     | IPCセキュリティ原則の準拠 |
| NFR-04 | SkillService との依存関係を最小化                     | 中     | 責務分離の維持            |
| NFR-05 | エラーメッセージをサニタイズ（内部情報を漏洩しない）  | 高     | セキュリティ要件          |

---

## 4. 型変換要件

### 4.1 入力変換: ハンドラー引数 → SkillExecutionRequest

| ハンドラー引数          | SkillExecutionRequest フィールド | 必須/任意 |
| ----------------------- | -------------------------------- | --------- |
| args.skillId            | skillId                          | 必須      |
| args.params.prompt      | prompt                           | 必須      |
| args.params.timeout     | timeout                          | 任意      |
| args.params.sessionId   | sessionId                        | 任意      |
| args.params.retryConfig | retryConfig                      | 任意      |

### 4.2 出力変換: SkillExecutionResponse → ハンドラーレスポンス

| SkillExecutionResponse | ハンドラーレスポンス                     |
| ---------------------- | ---------------------------------------- |
| success: true          | { success: true, data: { executionId } } |
| success: false + error | { success: false, error: string }        |

### 4.3 Skill → SkillMetadata 変換

- `lastModified` フィールドを除外してそのまま渡す
- `Omit<Skill, "lastModified">` 型を使用

---

## 5. エラーコード体系

### 5.1 SkillExecutionErrorCode（SE-01〜SE-07, PR-02）

| エラーコード            | コードID | カテゴリ       | 説明                                    | リトライ |
| ----------------------- | -------- | -------------- | --------------------------------------- | -------- |
| MAX_CONCURRENT_EXCEEDED | SE-01    | リソース制限   | 同時実行数が上限（5件）に到達           | 待機後可 |
| INVALID_SKILL_METADATA  | SE-02    | バリデーション | SkillMetadata必須フィールド不足         | 不可     |
| ABORT                   | SE-03    | キャンセル     | ユーザーまたはシステムによる実行中断    | 不可     |
| EXECUTION_FAILED        | SE-06    | 実行エラー     | SDK query()呼び出し中の例外発生         | 不可     |
| PERMISSION_DENIED       | SE-07    | 権限エラー     | PreToolUseフックでツール使用が拒否      | 不可     |
| TIMEOUT                 | PR-02    | タイムアウト   | PermissionResolver応答待機が5分を超過   | 不可     |
| AUTHENTICATION_ERROR    | ※新規    | 認証エラー     | APIキー未設定/無効（TASK-FIX-16-1依存） | 不可     |

---

## 6. 関連ファイル

| 役割               | パス                                                  |
| ------------------ | ----------------------------------------------------- |
| 修正対象ファイル   | apps/desktop/src/main/ipc/skillHandlers.ts            |
| 参照（スタブ実装） | apps/desktop/src/main/services/skill/SkillService.ts  |
| 委譲先             | apps/desktop/src/main/services/skill/SkillExecutor.ts |
| 型定義             | packages/shared/src/types/skill.ts                    |

---

## 7. 成果物チェックリスト

- [x] 背景・現状が明確に記述されている
- [x] 機能要件（FR）が網羅的に定義されている
- [x] 非機能要件（NFR）が定義されている
- [x] 型変換要件が定義されている
- [x] エラーコード体系が整理されている
- [x] 関連ファイルが特定されている
