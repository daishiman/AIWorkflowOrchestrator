# Phase 4: テスト設計書 — skill:getFileTree IPC

## テスト概要

| 項目             | 値                        |
| ---------------- | ------------------------- |
| タスクID         | UT-UI-05A-GETFILETREE-001 |
| Phase            | 4（テスト作成）           |
| テストケース数   | 14                        |
| テストファイル数 | 3                         |

## テストファイル一覧

| ファイル                                     | テスト数 | テスト対象                                                      |
| -------------------------------------------- | -------- | --------------------------------------------------------------- |
| skillFileHandlers.test.ts（追加）            | 9        | IPCハンドラ（FT-01, FT-02, FT-06〜FT-12）                       |
| SkillFileManager.getFileTree.test.ts（新規） | 5        | SkillFileManagerサービス（FT-03〜FT-05, FT-13, 空ディレクトリ） |
| skill-api.getFileTree.test.ts（新規）        | 1        | Preload API（FT-14）                                            |

## テスト設計方針

- P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
- P9準拠: テスト間状態リーク防止（beforeEach でリセット）
- P40準拠: テスト実行は `cd apps/desktop` から
- セキュリティテスト: validateIpcSender の検証
- エラーサニタイズ: 内部エラーが "Internal error" に置換されることを検証
