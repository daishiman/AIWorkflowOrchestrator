# Phase 8 リファクタログ

## 実施内容

- 対象: `SkillImportDialog`
- 変更:
  - `importedSkillIds.includes(...)` を複数箇所で実行していた処理を `importedSkillIdSet`（`useMemo`）に集約。
  - 判定を `Set.has(...)` に統一。

## 変更理由

- ID判定ロジックの重複削減。
- 変換責務（ID文脈）を単一点に寄せ、再発防止性を高める。
- 振る舞いは不変（判定結果は同一）。

## 影響範囲

- UIコンポーネント内部のみ。
- IPC/Main/Storeの契約変更なし。
