# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 12                                 |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

canonical docs と task spec を current facts に同期する。実際に drift がなければ no-op で閉じる。

## タスク

### 1. 実装ガイド

- Part 1: 中学生レベルの説明
- Part 2: 技術詳細
- `packages/shared/src/constants/index.ts` と `MAX_SKILL_NAME_LENGTH = 64` を前提にする
- `packages/shared/src/index.ts` や `SKILL_NAME_MAX_LENGTH` は使わない

### 2. システム仕様の同期

- `docs/00-requirements/18-skills.md` を確認する
- 既に記載済みなら no-op と記録する
- 追記が必要な場合のみ `topic-map` と `LOGS.md` を更新する

### 3. 記録

- 変更履歴
- 未タスク検出
- スキルフィードバック
- 準拠チェック

## ルール

- `MAX_SKILL_NAME_LENGTH` は 64 で統一する
- `SkillScanner.ts` と `init_skill.js` の参照経路は `@repo/shared/constants` に揃える
- docs が current facts と一致していれば、不要な追記はしない

## 完了条件

- [ ] docs sync が必要か no-op か判定されている
- [ ] 変更が必要な場合のみ canonical docs が更新されている
- [ ] task spec に古い前提が残っていない

## 次のPhase

Phase 13: PR 作成
