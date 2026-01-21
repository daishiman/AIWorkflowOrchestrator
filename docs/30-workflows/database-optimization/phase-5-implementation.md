# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4               |
| 後続Phase  | Phase 6               |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | database-optimization |

---

## 目的

設計に基づいてスキーマ変更とマイグレーションを実装し、テストをGreenにする。

## 背景

Phase 4で定義したテストを通過させるため、インデックス追加・制約方針・削除挙動の実装が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: マイグレーションの実装

**目的**: インデックスと制約変更をDBに反映する

**実行手順**:

1. Drizzleのマイグレーションファイルを作成する
2. chat_messagesのsession_idインデックスと部分インデックスを追加する
3. CHECK制約をDB側で表現できる場合は追加し、難しい場合はアプリ層の検証を追加する
4. 作成したマイグレーション一覧を `outputs/phase-5/migration-files.md` に記録する

**期待される成果物**:

- `outputs/phase-5/migration-files.md`

---

### タスク2: onDelete方針の実装

**目的**: セッション削除時の整合性を保証する

**実行手順**:

1. onDelete方針に合わせて削除処理の実装を確認する
2. 論理削除運用に沿った削除フローを整備する
3. 実装内容を `outputs/phase-5/implementation-summary.md` に記録する

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

### タスク3: テスト実行とGreen確認

**目的**: 実装によってテストが成功することを確認する

**実行手順**:

1. テストを実行する
   ```bash
   pnpm --filter @repo/shared test -- chat-history-optimization.test.ts
   ```
2. 全テストが成功していることを確認する
3. 結果を `outputs/phase-5/test-green-status.md` に記録する

**期待される成果物**:

- `outputs/phase-5/test-green-status.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                 |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| データベースアーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | マイグレーション運用 |
| データベーススキーマ設計     | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | 既存インデックス定義 |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 削除・更新ルール     |
| データベース実装             | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle実装指針      |

**前Phase成果物**

| 参照資料     | パス                                                                 | 内容        |
| ------------ | -------------------------------------------------------------------- | ----------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                              | テスト方針  |
| テストコード | `packages/shared/src/db/__tests__/chat-history-optimization.test.ts` | テスト実装  |
| Red状態確認  | `outputs/phase-4/test-red-status.md`                                 | Red確認記録 |

---

## 成果物

| 成果物               | パス                                        | 内容             |
| -------------------- | ------------------------------------------- | ---------------- |
| マイグレーション一覧 | `outputs/phase-5/migration-files.md`        | 作成したSQL一覧  |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | 実装内容と変更点 |
| Green状態確認        | `outputs/phase-5/test-green-status.md`      | 成功確認記録     |

---

## 統合テスト連携（Phase 1〜11は必須）

- マイグレーション後の削除・取得フローを統合テストで確認
- CHECK制約の不正入力が拒否されることを確認

---

## 完了条件

- [ ] マイグレーションが実装されている
- [ ] onDelete方針が実装に反映されている
- [ ] テストがGreenになっている
- [ ] 成果物が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## TDD検証

### TDD サイクル確認

```bash
pnpm --filter @repo/shared test -- chat-history-optimization.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## Phase 5 実行記録

### 実行タスク

- タスク1: マイグレーションの実装
- タスク2: onDelete方針の実装
- タスク3: テスト実行とGreen確認

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-6-test-expansion.md`
