# Phase 1 スコープ定義: Skill Docs Runtime Integration

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスク ID  | step-03-par-task-04-skill-docs-runtime-integration |
| Phase      | 1 - スコープ定義                                   |
| 作成日     | 2026-03-16                                         |
| ステータス | COMPLETED                                          |

---

## 1. 対象範囲（IN SCOPE）

### 1.1 stubQueryFn 排除

- `ipc/index.ts` L784-794 の stubQueryFn を削除
- SkillDocGenerator への queryFn 注入経路を CapabilityResolver 判定結果ベースに変更
- 既存 33+ テストの stub 依存部分を識別し、テストダブル戦略を再設計

### 1.2 LLMDocQueryAdapter 導入

- `LLMQueryFn` 型互換のアダプターインターフェース定義
- AuthKeyService 経由の API key 取得・検証ロジック
- fail-fast パターン（consumer subscription 拒否、silent fallback 禁止）

### 1.3 DocOperationResult 型拡張

- 構造化エラー型の定義（7種別エラーコード: 2001-5001）
- `retryable` フラグによるリトライ判定
- `terminalHandoff` フィールドによる handoff 情報格納
- `guidance` フィールドによるユーザーガイダンス提供

### 1.4 SkillDocsCapabilityResolver

- Main Process 完結の 3 経路判定ロジック
- 入力: authMode, API key 有無, Terminal 可用性
- 出力: `CapabilityMode` (`integratedRuntime` / `terminalSurface` / `both` / `none`)
- consumer subscription 制約の適用

### 1.5 Terminal Handoff

- 3 つの失敗経路（timeout / missing credentials / rate limit）での handoff 発動
- prompt context（500文字以内）+ suggested command の生成
- 自動送信禁止の制約適用

### 1.6 リトライ機構

- External Service Error（3001-3003）に対する最大 2 回リトライ
- exponential backoff（1秒 → 2秒）
- Retry-After ヘッダー尊重（上限 60秒）

---

## 2. 除外範囲（OUT OF SCOPE）

### 2.1 テンプレート CRUD（UT-9I-002）

- テンプレートの作成・読み取り・更新・削除操作
- カスタムテンプレートの永続化
- テンプレートのバージョン管理
- 理由: 独立タスクとして分離済み

### 2.2 LLM プロバイダ SDK 実装（UT-9I-001 の実装部分）

- Anthropic Claude SDK の具体的な API 呼び出し実装
- OpenAI GPT SDK の具体的な API 呼び出し実装
- プロバイダ固有のレスポンスパース処理
- 理由: 本タスクはインターフェース定義のみ。SDK 実装は UT-9I-001 が担当

### 2.3 Renderer 側 UI コンポーネント実装

- ドキュメント生成 UI のリデザイン
- エラー表示コンポーネントの実装
- Terminal Handoff UI の実装
- guidance-only 画面の実装
- 理由: Main Process 側のランタイム統合が本タスクのスコープ

### 2.4 既存テスト以外の E2E テスト

- Playwright による E2E テスト
- 理由: Phase 11（手動テスト）で対応

---

## 3. 変更対象ファイル一覧

### 新規作成（3ファイル）

| ファイルパス                                                 | 責務                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| `apps/desktop/src/main/skill/LLMDocQueryAdapter.ts`          | LLM クエリアダプターインターフェース |
| `apps/desktop/src/main/skill/SkillDocsCapabilityResolver.ts` | Access Matrix 3 経路判定             |
| `packages/shared/src/types/doc-operation-result.ts`          | DocOperationResult 構造化エラー型    |

### 変更（3ファイル）

| ファイルパス                                       | 変更内容                                  |
| -------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`               | stubQueryFn 削除、CapabilityResolver 注入 |
| `apps/desktop/src/main/skill/SkillDocGenerator.ts` | DocOperationResult 対応、リトライ機構追加 |
| `packages/shared/src/types/skill-docs.ts`          | DocOperationResult 型の re-export 追加    |

---

## 4. 既存契約保全

### 4.1 IPC チャンネル契約（4チャンネル）

| チャンネル             | 引数型                 | 戻り値型               | 変更 |
| ---------------------- | ---------------------- | ---------------------- | ---- |
| `skill:docs:generate`  | `DocGenerationRequest` | `GeneratedDoc`         | なし |
| `skill:docs:preview`   | `DocGenerationRequest` | `GeneratedDoc`         | なし |
| `skill:docs:export`    | `DocGenerationRequest` | `{ filePath: string }` | なし |
| `skill:docs:templates` | なし                   | `DocTemplate[]`        | なし |

IPC チャンネルの引数型・戻り値型は変更しない。DocOperationResult は IPC ハンドラ内部で処理し、既存の戻り値型にマッピングする。エラー時は既存のエラーハンドリングパターン（throw → エラー境界キャッチ）を維持する。

### 4.2 4層セキュリティ

| レイヤー | 内容                       | 保全方針                |
| -------- | -------------------------- | ----------------------- |
| L1       | sender 検証                | 変更なし                |
| L2       | P42 準拠 3段バリデーション | 変更なし                |
| L3       | enum 許可値検証            | 変更なし                |
| L4       | エラー境界                 | DocOperationResult 対応 |

L4（エラー境界）のみ DocOperationResult のエラー情報を活用するよう拡張する。L1-L3 は一切変更しない。

### 4.3 型定義後方互換

| 型名                   | パッケージ     | 互換性方針                                       |
| ---------------------- | -------------- | ------------------------------------------------ |
| `DocGenerationRequest` | `@repo/shared` | フィールド追加のみ許可（既存フィールド削除禁止） |
| `GeneratedDoc`         | `@repo/shared` | 変更なし                                         |
| `DocSection`           | `@repo/shared` | 変更なし                                         |
| `DocTemplate`          | `@repo/shared` | 変更なし                                         |
| `TemplateSection`      | `@repo/shared` | 変更なし                                         |
| `LLMQueryFn`           | `apps/desktop` | 型シグネチャ変更なし                             |

DocOperationResult は新規型として追加する。既存型の破壊的変更は行わない。

---

## 5. リスクと緩和策

| リスク                                          | 影響度 | 緩和策                                                  |
| ----------------------------------------------- | ------ | ------------------------------------------------------- |
| UT-9I-001 の SDK 実装遅延                       | 中     | LLMDocQueryAdapter のモック実装で本タスクを独立完了可能 |
| 既存テストの stub 依存度が高い                  | 低     | テストダブル（モック）で stub 同等の振る舞いを再現      |
| DocOperationResult 導入による既存エラーパス変更 | 中     | L4 エラー境界で既存戻り値型へのマッピングを保証         |
| CapabilityResolver の判定ロジック複雑化         | 低     | 3 経路のみ、判定条件は明確                              |

---

## 6. 成功基準

- [ ] stubQueryFn が全 IPC チャンネルから排除されていること
- [ ] LLMDocQueryAdapter インターフェースが定義され、UT-9I-001 が実装可能な状態であること
- [ ] SkillDocsCapabilityResolver が 3 経路を正しく判定すること
- [ ] DocOperationResult 型で 7 種別のエラーが構造化されていること
- [ ] Terminal Handoff が 3 つの失敗経路で正しく発動すること
- [ ] 既存 4 IPC チャンネルの契約が維持されていること
- [ ] 既存 4 層セキュリティが維持されていること
- [ ] 既存型定義の後方互換性が維持されていること
- [ ] 既存 33+ テストが全て PASS すること

---

## 7. 次 Phase

Phase 2（設計）へ進む。本スコープ定義に基づき、以下の設計成果物を作成する:

- LLMDocQueryAdapter インターフェース設計
- SkillDocsCapabilityResolver アーキテクチャ設計
- DocOperationResult 型詳細設計
- リトライ機構設計
- Terminal Handoff フロー設計
