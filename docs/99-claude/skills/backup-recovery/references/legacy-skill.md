---
name: .claude/skills/backup-recovery/SKILL.md
description: |
  旧版のbackup-recoveryスキル概要。バックアップ戦略、RPO/RTO、復旧手順の整理を中心に構成。

  旧リソース:
  - `.claude/skills/backup-recovery/references/backup-strategy-layers.md`
  - `.claude/skills/backup-recovery/references/rpo-rto-design.md`
  - `.claude/skills/backup-recovery/assets/backup-policy-template.md`
  - `.claude/skills/backup-recovery/assets/recovery-runbook-template.md`

  Use only for compatibility checks with legacy outputs.
---

# 旧スキルメモ

## 概要

旧版はPhase 1〜3の構成で、要件整理→戦略/ランブック→検証の流れを重視していた。
新構成ではPhase 4に運用改善を追加している。

## 旧ワークフロー要約

1. 要件整理とRPO/RTO設計
2. バックアップ戦略とランブック作成
3. 検証と記録

## 参照メモ

- 旧版の詳細は `references/backup-strategy-layers.md` と `references/rpo-rto-design.md` に反映済み。
