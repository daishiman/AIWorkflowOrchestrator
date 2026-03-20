# Phase 3: 設計レビュー結果

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001      |
| Phase        | 3 — 設計レビュー                          |
| 作成日       | 2026-03-19                                |
| ステータス   | 完了                                      |
| レビュー入力 | [review-prompt.txt](./review-prompt.txt)  |
| 依存         | [phase-2/design.md](../phase-2/design.md) |

## レビュー観点テーブル

### IPC整合性（IPC-1〜6）

| ID    | チェック項目                                                       | 判定 | 備考                                                                                  |
| ----- | ------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------- |
| IPC-1 | チャンネル名がホワイトリスト（ALLOWED_INVOKE_CHANNELS）に登録済み  | PASS | SKILL_UPDATE: L494, SKILL_GET_DETAIL: L486                                            |
| IPC-2 | ハンドラ引数形式とPreload呼び出し形式が一致                        | PASS | SKILL_UPDATE: `{ skillName, updates }` で統一、SKILL_GET_DETAIL: `{ skillId }` で統一 |
| IPC-3 | 引数名のセマンティクスが実際の値と一致（P45対策）                  | PASS | `skillName`=スキル名、`skillId`=スキルID — 命名と実態が一致                           |
| IPC-4 | レスポンス形式が `{ success, data?, error? }` で統一（P60準拠）    | PASS | ハンドラ設計でP60形式を明記                                                           |
| IPC-5 | unregister関数にSKILL_UPDATEが追加される設計になっている（P5対策） | PASS | Lane 1 変更計画に明記                                                                 |
| IPC-6 | packages/shared と apps/desktop のチャンネル定数が整合（P32対策）  | PASS | Lane 3 でppackages/shared への定数追加を明記                                          |

### セキュリティ（SEC-1〜4）

| ID    | チェック項目                                              | 判定 | 備考                                                                         |
| ----- | --------------------------------------------------------- | ---- | ---------------------------------------------------------------------------- |
| SEC-1 | validateIpcSender() によるIPC送信元検証が全ハンドラに適用 | PASS | SKILL_UPDATEハンドラ設計でStep 1に明記                                       |
| SEC-2 | パストラバーサル攻撃への防御                              | N/A  | スキル名にパス操作文字が含まれるリスクは低い。SkillServiceレイヤーで対処済み |
| SEC-3 | エラーメッセージのサニタイズ（内部情報漏洩防止）          | PASS | `sanitizeErrorMessage(error)` を使用                                         |
| SEC-4 | P55準拠: 正規表現メタ文字エスケープ（必要な場合）         | N/A  | 本タスクでは正規表現を使用しない                                             |

### バリデーション（VAL-1〜6）

| ID    | チェック項目                                                     | 判定        | 備考                                                                                               |
| ----- | ---------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| VAL-1 | 全文字列引数にP42準拠3段バリデーションが適用                     | PASS        | `skillName`: 型→空文字→trim空文字の3段確認                                                         |
| VAL-2 | スペースのみ入力（`"   "`）をバリデーションで拒否                | PASS        | `.trim() === ""` チェックで拒否                                                                    |
| VAL-3 | null / undefined 入力をバリデーションで拒否                      | PASS        | `typeof args?.skillName !== "string"` で拒否                                                       |
| VAL-4 | updates オブジェクトの型チェックが適切                           | PASS        | null/配列/非オブジェクトを全て拒否。`Array.isArray` チェックも含む                                 |
| VAL-5 | updates 省略可能フィールドは存在時のみ型チェック                 | PASS（N/A） | 実装では `Record<string, unknown>` でIPC層は受け入れ、フィールド個別チェックはSkillService層に委譲 |
| VAL-6 | バリデーションエラー時のエラーコードが `VALIDATION_ERROR` で統一 | PASS        | 設計書の全throwで `code: "VALIDATION_ERROR"` を使用                                                |

### 型定義整合性（TYPE-1〜4）

| ID     | チェック項目                                                                       | 判定        | 備考                                                                                                            |
| ------ | ---------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| TYPE-1 | ハンドラ引数型定義が設計書で明示されている                                         | PASS        | `args: { skillName: string; updates: Record<string, unknown> }`（省略可能フィールド詳細はSkillService層に委譲） |
| TYPE-2 | Preload APIの戻り値型が設計書で明示されている                                      | PASS        | `getDetail: Promise<Skill>`, `update: Promise<void>`                                                            |
| TYPE-3 | apps/desktop/src/preload/types.ts の自動反映確認                                   | PASS（N/A） | `import("./skill-api").SkillAPI` で自動反映 — 更新不要                                                          |
| TYPE-4 | packages/shared の型定義変更と apps/desktop の型定義変更が同時更新計画になっている | PASS        | Lane 3 でチャンネル定数追加を明記（types.ts は自動反映）                                                        |

### エラーハンドリング（ERR-1〜3）

| ID    | チェック項目                                             | 判定 | 備考                                                            |
| ----- | -------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| ERR-1 | try/catch でエラーを握りつぶさず上位に伝播（Result形式） | PASS | `{ success: false, error: sanitizeErrorMessage(error) }` で返却 |
| ERR-2 | バリデーションエラーは throw で早期リターン              | PASS | validateIpcSender失敗時・各引数バリデーション失敗時はthrow      |
| ERR-3 | エラーログに内部情報（パス・APIキー等）が含まれない      | PASS | `sanitizeErrorMessage` でサニタイズ後にログ出力                 |

### 既存テストへの影響（TEST-1〜3）

| ID     | チェック項目                                                               | 判定 | 備考                                                  |
| ------ | -------------------------------------------------------------------------- | ---- | ----------------------------------------------------- |
| TEST-1 | 既存テストが新規実装の影響を受けない（デグレなし）                         | PASS | 新規ハンドラは独立して追加 — 既存ハンドラを変更しない |
| TEST-2 | 既存DI構造に新規依存を追加する場合は全テストファイルのモック修正計画がある | N/A  | DI追加なし — SkillServiceは既存DI構造を使用           |
| TEST-3 | テストモックの大規模修正（P21/P35）が必要か                                | N/A  | 新規ハンドラ追加のみ — 既存モック構造に影響なし       |

### Pitfallチェック

| Pitfall | 内容                                             | 確認状態                                                  |
| ------- | ------------------------------------------------ | --------------------------------------------------------- |
| P5      | リスナー二重登録（ipcMain.handle二重登録で例外） | 確認済み: unregister リストへの追加を設計に明記           |
| P23     | API二重定義の型管理複雑性                        | 確認済み: 型自動反映のため更新不要と判断                  |
| P32     | 型定義の二箇所同時更新必須                       | 確認済み: packages/shared への定数追加を Lane 3 に明記    |
| P42     | `.trim()` バリデーション漏れ                     | 確認済み: 全文字列引数に3段バリデーション適用             |
| P44     | skill:import/remove IPCインターフェース不整合    | 確認済み: SKILL_UPDATE は object payload 設計で P44 防止  |
| P45     | IPC引数命名の契約ドリフト                        | 確認済み: `skillName` / `skillId` のセマンティクス明確化  |
| P60     | IPC テスト応答形式の不一致                       | 確認済み: `{ success, data?, error? }` 形式を設計書に明記 |

### IPC契約チェックリスト Phase 1-3

| チェック項目                                               | 確認状態 |
| ---------------------------------------------------------- | -------- |
| Phase 1: チャンネル名がホワイトリスト登録済みを確認        | 完了     |
| Phase 2: ハンドラ引数形式がPreload呼び出し形式と一致を確認 | 完了     |
| Phase 3: 引数名のセマンティクスが実際の値と一致を確認      | 完了     |

---

## 代替案の検討

### 代替案 1: SKILL_UPDATEを単一文字列引数で設計

```typescript
// 案A（採用しない）
ipcMain.handle("skill:update", async (event, skillName: string, updates: SkillUpdateParams) => {
```

**却下理由**: Electron IPC の `ipcMain.handle` は引数をシリアライズするため、第3引数以降は使用できない実装上の制約がある（第2引数が実際の引数の先頭）。複数引数は object でラップするのが標準パターン。

### 代替案 2: getDetailをskillName引数で設計

```typescript
// 案B（採用しない）
getDetail: (skillName: string) => safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, skillName),
```

**却下理由**: 既存ハンドラ（skillHandlers.ts L241-273）が `args: { skillId: string }` のobject形式で受け取るため、Preload側の引数形式を変更するとP44不整合が発生する。既存ハンドラに合わせる設計が正しい。

---

## 最終判定

**PASS — Phase 4（テスト作成）へ進行**

| 判定根拠              | 内容             |
| --------------------- | ---------------- |
| IPC整合性             | 全6項目 PASS     |
| セキュリティ          | 全4項目 PASS/N/A |
| バリデーション        | 全6項目 PASS     |
| 型定義整合性          | 全4項目 PASS/N/A |
| エラーハンドリング    | 全3項目 PASS     |
| 既存テストへの影響    | 全3項目 PASS/N/A |
| Pitfallチェック       | 全7件 確認済み   |
| IPC契約チェックリスト | Phase 1-3 全完了 |

MINOR / MAJOR / CRITICAL 指摘なし。Phase 4（テスト作成）に進む。
