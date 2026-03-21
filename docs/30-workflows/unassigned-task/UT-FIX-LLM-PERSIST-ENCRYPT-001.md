# UT-FIX-LLM-PERSIST-ENCRYPT-001: persist storage暗号化の検討

## 概要

現在のpersist storageはlocalStorageに平文で保存されている。将来的にpersist対象フィールドが増えた場合のセキュリティ強化として暗号化の検討が必要。

## 背景

TASK-FIX-LLM-CONFIG-PERSISTENCE で `selectedProviderId` / `selectedModelId` をpersist対象に追加した。これらは機密情報ではないが、persist対象フィールドの増加に伴い、暗号化の必要性を評価すべき。

## 受入基準

- [ ] persist storageの暗号化要否を評価する
- [ ] 暗号化が必要な場合、electron-storeの暗号化オプションまたはカスタム暗号化の設計を行う

## 優先度

LOW

## 関連

- TASK-FIX-LLM-CONFIG-PERSISTENCE
- arch-state-management.md
