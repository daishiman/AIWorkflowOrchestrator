# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 11              |
| 後続Phase  | Phase 13              |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

実装ガイドを作成し、システム仕様書を更新する。未タスクを検出し記録する。

## 背景

ドキュメントを最新の実装状態に同期させ、他の開発者が参照できるようにする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。（全4タスク - 全て完了必須）

### タスク1: 実装ガイド作成

**目的**: 実装内容を文書化する

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` を作成
2. 以下の2パート構成で記載:

**Part 1: 概念的説明（初学者・非技術者向け）**

```markdown
## 概要

@repo/shared パッケージの services/graph モジュールから、
Community関連の型をエクスポートできるようになりました。

### 何が変わったか

- `services/graph/index.ts` にバレルファイルを作成/更新
- Community, CommunitySummary, StoredEntity などの型を再エクスポート

### なぜ必要だったか

- apps/desktop から型をインポートできなかったビルドエラーを解消
```

**Part 2: 技術的詳細（開発者向け）**

```markdown
## 使用方法

### 型のインポート

\`\`\`typescript
import type {
Community,
CommunitySummary,
StoredEntity,
} from "@repo/shared/services/graph";
\`\`\`

### 値のインポート

\`\`\`typescript
import {
CommunityErrorCode,
CommunityDetectionError,
} from "@repo/shared/services/graph";
\`\`\`

## エクスポート一覧

| カテゴリ         | 項目                           | 形式        |
| ---------------- | ------------------------------ | ----------- |
| インターフェース | Community, CommunitySummary... | export type |
| 列挙型           | CommunityErrorCode...          | export      |
| クラス           | CommunityDetectionError...     | export      |
| 関数             | normalizeEntityName            | export      |
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新【重要】

**目的**: aiworkflow-requirements の仕様書を更新

**実行手順**:

1. 📖 `references/spec-update-workflow.md` を読み込む（スキルディレクトリ内）
2. 以下のチェックリストを実行し、該当項目を更新:
   - [ ] メソッドシグネチャ変更 → 該当なし（本タスクは再エクスポートのみ）
   - [ ] 新規エラークラス追加 → 該当なし
   - [ ] 新規ビジネスルール → 該当なし
   - [ ] 認可/認証ロジック → 該当なし
   - [ ] 新規定数/設定値 → 該当なし
   - [ ] DBスキーマ変更 → 該当なし

3. 本タスクはバレルファイルの更新のみのため、**システム仕様書の実質的な更新は不要**
   - ただし、`architecture-monorepo.md` には既にエクスポートパターンが記載済み
   - `interfaces-rag-community-detection.md` の変更履歴に、タスク完了の記録がある場合は確認

4. 更新が不要な理由を記録

**期待される成果物**:

- システム仕様更新不要の確認記録

---

### タスク3: ドキュメント更新履歴作成

**目的**: 作成・更新したファイルを記録

**実行手順**:

1. `outputs/phase-12/document-changelog.md` を作成
2. 以下を記載:

```markdown
## 作成ファイル

| ファイル                                 | 内容       |
| ---------------------------------------- | ---------- |
| outputs/phase-12/implementation-guide.md | 実装ガイド |

## 更新ファイル

| ファイル                                    | 変更内容           |
| ------------------------------------------- | ------------------ |
| packages/shared/src/services/graph/index.ts | 型エクスポート追加 |

## システム仕様更新

更新不要（理由：バレルファイル追加のみ、インターフェース変更なし）
```

**期待される成果物**:

- `outputs/phase-12/document-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題を検出し記録（0件でも出力必須）

**実行手順**:

1. 以下のソースから未タスクを検出:
   - Phase 11 の手動テスト結果
   - Phase 3/10 のレビュー結果
   - コードベースの TODO/FIXME コメント

2. `outputs/phase-12/unassigned-task-report.md` を作成
3. 以下の形式で記録:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | N/A     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、
未タスクとして記録すべき項目はありません。
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

## 参照資料

| 参照資料               | パス                                                                         | 内容                 |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | エクスポートパターン |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                     | テスト結果           |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                 |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 仕様書更新対象の確認 |

---

## 成果物

| 成果物           | パス                                         | 内容             |
| ---------------- | -------------------------------------------- | ---------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`   | 実装説明文書     |
| 更新履歴         | `outputs/phase-12/document-changelog.md`     | 変更ファイル一覧 |
| 未タスクレポート | `outputs/phase-12/unassigned-task-report.md` | 残課題レポート   |

---

## 完了条件

- [ ] 実装ガイド作成完了（2パート構成）
- [ ] システム仕様書更新確認（更新不要の場合は理由記録）
- [ ] ドキュメント更新履歴作成完了
- [ ] 未タスク検出レポート作成完了（0件でも必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-13-pr-creation.md`
