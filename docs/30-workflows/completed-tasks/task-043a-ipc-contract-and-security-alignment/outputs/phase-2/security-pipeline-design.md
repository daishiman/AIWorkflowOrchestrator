# Phase 2 セキュリティパイプライン設計

## 検証順序（固定）

1. sender 検証（`validateIpcSender`）
2. P42 入力検証（型/空文字/trim空文字）
3. 契約境界検証（import と importFromSource 分離）
4. 業務処理実行（SkillShareManager）
5. 例外サニタイズとエラー正規化

## セキュリティ設計詳細

| 観点             | 設計                                             |
| ---------------- | ------------------------------------------------ |
| sender           | 失敗時は `VALIDATION_ERROR` + `ERR_2004`         |
| P42              | 全文字列引数に trim空文字判定を適用              |
| contextIsolation | preload 側 whitelist チャネルのみ公開            |
| サニタイズ       | 予期しない例外メッセージは `Internal error` 固定 |

## 監査観点

- sender 検証を bypass できる経路がないこと
- raw エラーを renderer へ漏らさないこと
