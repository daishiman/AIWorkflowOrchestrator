# スキル使用記録

## 目的

`project-architecture-integration` スキルの使用履歴を記録し、改善のためのフィードバックを蓄積する。

## フォーマット

```
### [YYYY-MM-DD HH:MM]
- **Phase**: [analysis | compliance | integration]
- **Result**: [success | failure]
- **Context**: [適用したシナリオの説明]
- **Outcome**: [結果の詳細]
- **Notes**: [追加メモ、改善点など]
```

## 記録

### 2026-01-02 12:00

- **Phase**: スキル構造マイグレーション
- **Result**: success
- **Context**: 18-skills.md仕様への完全準拠のため、SKILL.mdを簡潔化し、詳細知識をreferences/に外部化
- **Outcome**:
  - SKILL.mdを193行に削減（元305行）
  - references/に3つの新規ファイル追加（basics.md, patterns.md, requirements-index.md）
  - frontmatterにallowed-toolsを追加
  - Task仕様ナビを表形式に変更
  - リソース参照を表形式に統一
- **Notes**:
  - 既存のLevel1-4は保持
  - agents/は既存の3つで十分
  - scripts/は既存の3つで十分
  - assets/は既存のchecklist.mdで十分

---

_このファイルは自動更新されます。手動編集も可能ですが、スクリプト実行時に上書きされる場合があります。_

**自動記録コマンド**:

```bash
node scripts/log_usage.mjs --result success --phase integration --context "your context"
```
