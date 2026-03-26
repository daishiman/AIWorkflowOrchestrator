# Refactoring Log

## 実施内容

- `upsertArtifact()` を `appendArtifact()` に置換し、履歴戦略を helper に集約した。
- `ensureReviewReadyState()` を追加し、既存の plan 起点フローを review 起点へ正規化した。
- transition guard を専用 helper へ分離した。

## 効果

- failure lifecycle 契約が code path で読みやすくなった。
- plan 起点の既存テストを壊さずに guard を導入できた。
