# Phase 2 IPC契約設計

## 対象チャネル

- `auth-key:set`
- `auth-key:exists`
- `auth-key:validate`
- `auth-key:delete`

## I/O契約

| Channel           | Request           | Response                               | エラー契約                                                 |
| ----------------- | ----------------- | -------------------------------------- | ---------------------------------------------------------- |
| auth-key:set      | `{ key: string }` | `{ success: boolean; error?: string }` | バリデーション失敗/保存失敗                                |
| auth-key:exists   | なし              | `{ exists: boolean }`                  | sender不正時は共通エラー、内部失敗時は `{ exists: false }` |
| auth-key:validate | `{ key: string }` | `{ valid: boolean; error?: string }`   | バリデーション失敗/検証失敗                                |
| auth-key:delete   | なし              | `{ success: boolean; error?: string }` | 削除失敗                                                   |

## 契約整合ルール

- Rule-01: Preload公開チャネルはMain登録済みであること。
- Rule-02: `auth-key:exists` はキー値を返さず、存在有無のみ返却。
- Rule-03: sender検証は全チャネルで維持。
- Rule-04: エラー時レスポンス形状を既存互換で維持。

## 破壊的変更判定

- なし（全て非破壊）。
