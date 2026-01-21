# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 8                     |
| Phase名    | リファクタリング      |
| 前提Phase  | Phase 7               |
| 後続Phase  | Phase 9               |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | database-optimization |

---

## 目的

実装の重複や不整合を整理し、保守性を高める。

## 背景

インデックス追加や制約追加によって実装やマイグレーションが増えたため、構成の整理が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装の整理

**目的**: 重複や不要な定義を整理する

**実行手順**:

1. スキーマ定義とマイグレーションの重複を確認する
2. 不要なインデックスや冗長定義がないかを確認する
3. 変更点を `outputs/phase-8/refactoring-log.md` に記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### タスク2: コード品質の確認

**目的**: リファクタリング後の挙動が変わらないことを確認する

**実行手順**:

1. テストがGreenのままであることを確認する
2. 変更点が要件から逸脱していないことを確認する
3. 結果を `outputs/phase-8/code-analysis.md` に記録する

**期待される成果物**:

- `outputs/phase-8/code-analysis.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容             |
| ---------------------------- | ------------------------------------------------------------------------------ | ---------------- |
| データベーススキーマ設計     | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | インデックス設計 |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 削除/取得ルール  |

**前Phase成果物**

| 参照資料           | パス                                 | 内容           |
| ------------------ | ------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ結果 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`     | 判定結果       |

---

**依存Phase成果物**

| 参照資料       | パス                                            | 内容                 |
| -------------- | ----------------------------------------------- | -------------------- |
| Phase 1 成果物 | `outputs/phase-1/requirements-definition.md`    | Phase 1 の主要成果物 |
| Phase 2 成果物 | `outputs/phase-2/schema-optimization-design.md` | Phase 2 の主要成果物 |
| Phase 5 成果物 | `outputs/phase-5/migration-files.md`            | Phase 5 の主要成果物 |
| Phase 6 成果物 | `outputs/phase-6/integrity-tests.md`            | Phase 6 の主要成果物 |

---

## 成果物

| 成果物               | パス                                 | 内容     |
| -------------------- | ------------------------------------ | -------- |
| コード品質分析       | `outputs/phase-8/code-analysis.md`   | 影響確認 |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

- リファクタ後の統合テストが継続して成功することを確認
- ベンチマーク結果に変化がないことを確認

---

## 完了条件

- [ ] 実装の整理が完了している
- [ ] リファクタリングログが作成されている
- [ ] テストがGreenである

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm --filter @repo/shared test -- chat-history-optimization.test.ts
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）の完了
- **後続**: Phase 9（品質保証）へ進む

---

## Phase 8 実行記録

### 実行タスク

- タスク1: 実装の整理
- タスク2: コード品質の確認

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-9-quality.md`
