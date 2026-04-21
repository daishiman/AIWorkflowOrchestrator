# Phase 3 依存リスク台帳

## 依存関係

| 依存元    | 依存先    | 種別                     | リスクレベル                                    |
| --------- | --------- | ------------------------ | ----------------------------------------------- |
| RALLY-010 | RALLY-002 | 直列（RALLY-002 完了後） | なし（RALLY-002 は verify_existing のため軽量） |
| RALLY-011 | RALLY-010 | 直列                     | なし                                            |
| RALLY-012 | RALLY-011 | 直列                     | なし                                            |
| RALLY-013 | RALLY-012 | 直列                     | なし                                            |

## リスク評価

### R-001: RALLY-002 の変更が RALLY-010 以降の実装前提を変える

- **リスクレベル**: 低
- **内容**: コメント追加のみのため、RALLY-010 以降の実装に影響しない
- **軽減策**: コメント内容が downstream の前提として正確であることを Phase 5 でレビュー

### R-002: ConversationalInterview.tsx への同時変更

- **リスクレベル**: 低
- **内容**: Wave 0 内で RALLY-002 のみが ConversationalInterview.tsx を変更するため、マージコンフリクトのリスクはない
- **軽減策**: Wave 0 完了後に Wave 3 (RALLY-010〜013) を開始するルールを遵守

### R-003: targeted test が既存テストと重複する

- **リスクレベル**: 低
- **内容**: 既存の `ConversationalInterview.test.tsx` には `restoredPendingRequest` 専用のテストが存在しない
- **軽減策**: 新規テストファイル `ConversationalInterview.restoredPendingRequest.test.tsx` に分離して作成

## 総合判定

依存リスクは「低」。Phase 4 への進行に問題なし。
