# Phase 1: 要件定義サマリー

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 1                                                                            |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| ステータス | 完了                                                                         |
| 作成日     | 2026-02-21                                                                   |

## 概要

skill:import IPCハンドラが`ImportResult`型（成功/件数/エラー）を返しているが、Renderer側は`ImportedSkill`型（スキル詳細情報）を期待している。この戻り値型不整合により、UIのスキル一覧が正しく表示されない。

### 現在の不整合フロー

```
skillHandlers.ts:136
  ↓ return ImportResult { success, importedCount, errors }
skill-api.ts:261
  ↓ 型宣言: Promise<ImportedSkill> だが実際はImportResult
agentSlice.ts:606
  ↓ ImportResult を ImportedSkill として配列に混入
UI表示失敗
```

## 要件サマリー

### 機能要件（3個）

| FR   | 要件内容                                                     | 優先度 |
| ---- | ------------------------------------------------------------ | ------ |
| FR-1 | ハンドラが`ImportedSkill`型オブジェクトを返す                | 高     |
| FR-2 | importSkills()[成功] → getSkillByName()[取得]の2ステップ処理 | 高     |
| FR-3 | インポート失敗時/スキル未検出時の適切なエラーthrow           | 高     |

### 非機能要件（4個）

| NFR   | 要件内容                                                  | 優先度 |
| ----- | --------------------------------------------------------- | ------ |
| NFR-1 | 型安全性：as型アサーション不使用、TypeScript型チェック    | 高     |
| NFR-2 | IPCセキュリティ：P42準拠3段バリデーション、内部情報非漏洩 | 高     |
| NFR-3 | テスト互換性：既存テスト修正計画の明確化                  | 高     |
| NFR-4 | Date型：IPC通信でのシリアライズ/デシリアライズ対応        | 中     |

### 受け入れ基準（4個）

| AC   | 検証内容                                                      |
| ---- | ------------------------------------------------------------- |
| AC-1 | 戻り値に`name`, `description`, `path`, `importedAt`, `status` |
| AC-2 | エラーメッセージが具体的かつ内部情報非漏洩                    |
| AC-3 | テスト修正計画：SH-IMP-01/agentSlice統合テスト対応            |
| AC-4 | E2E動作：importedSkills配列への正しい格納、UI表示正常化       |

## 修正対象ファイル（3個）

| ファイル                             | 修正内容                      |
| ------------------------------------ | ----------------------------- |
| skillHandlers.ts                     | 2ステップ呼び出しロジック実装 |
| skillHandlers.test.ts                | 既存テスト修正                |
| agentSlice.skill-integration.test.ts | モック戻り値修正              |

## 完了条件

- [x] 3つのFRが定義されている
- [x] 4つのNFRが定義されている
- [x] 4つのACが検証可能な形式で定義されている
- [x] 修正対象ファイルが特定されている
- [x] 参照資料テーブルが完備されている

## 次フェーズ

→ Phase 2: 設計（phase-2-design.md）
