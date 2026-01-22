# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| Phase名    | ドキュメント更新                  |
| 前提Phase  | Phase 11                          |
| 後続Phase  | Phase 13                          |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

実装完了に伴うドキュメント更新、システム仕様書の反映、未タスク検出を行う。

## 背景

Drizzle Repository実装が完了したことで、システム仕様書（aiworkflow-requirements）の更新が必要である。また、実装中に発見された追加タスクを未タスクとして記録する。

---

## 必須タスク（4タスク - 全て完了必須）

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: Drizzle Repositoryの使用方法を説明する実装ガイドを作成する

**実行手順**:

#### Part 1: 概念的説明（初学者・非技術者向け）

1. Drizzle Repositoryとは何か
2. なぜDrizzle Repositoryが必要か
3. InMemoryRepositoryとの違い
4. Clean Architectureでの位置づけ

#### Part 2: 技術的詳細（開発者向け）

1. クラス構成と責務:
   ```typescript
   // DrizzleChatSessionRepository の使用例
   const sessionRepo = new DrizzleChatSessionRepository(db);
   const session = await sessionRepo.findById(sessionId);
   ```
2. 各メソッドの使用例
3. エラーハンドリング方法
4. テスト時のモック方法
5. DI（依存性注入）での使用方法

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`: 実装ガイド

---

### タスク2: システム仕様書更新（aiworkflow-requirements）【重要】

**目的**: 実装に伴うシステム仕様書の更新を行う

**実行手順**:

> 📖 **必須**: `references/spec-update-workflow.md` を読み込み、更新判断基準を確認

1. 更新が必要な箇所のチェック:

   ```
   □ 新規クラス追加 → architecture-chat-history.md を更新
   □ 新規インターフェース実装 → interfaces-chat-history.md を更新
   □ エラーハンドリング追加 → error-handling.md を確認（変更不要の可能性）
   □ DBアクセスパターン追加 → database-implementation.md を確認
   ```

2. `architecture-chat-history.md` の更新:
   - Infrastructure Layer に Drizzle Repository を追記
   - ディレクトリ構成を更新

3. `interfaces-chat-history.md` の確認:
   - Drizzle Repository 実装の追記（必要に応じて）

4. 変更履歴セクションにバージョン追記:
   ```markdown
   | Version | Date       | Changes                      |
   | ------- | ---------- | ---------------------------- |
   | x.x.x   | 2026-01-XX | Drizzle Repository実装を追加 |
   ```

**期待される成果物**:

- システム仕様書の更新（該当ファイル）
- 更新内容のサマリー

---

### タスク3: ドキュメント更新履歴作成

**目的**: 作成・更新したドキュメントの一覧を記録する

**実行手順**:

1. 本タスク全体で作成・更新したファイルを一覧化:

   | ファイル                          | 操作     | 内容                     |
   | --------------------------------- | -------- | ------------------------ |
   | `DrizzleChatSessionRepository.ts` | 新規作成 | セッションリポジトリ実装 |
   | `DrizzleChatMessageRepository.ts` | 新規作成 | メッセージリポジトリ実装 |
   | `*.test.ts`                       | 新規作成 | テストコード             |
   | `architecture-chat-history.md`    | 更新     | Drizzle Repository追記   |
   | ...                               |          |                          |

2. システム仕様書更新も含めてリストに記載

**期待される成果物**:

- `outputs/phase-12/document-changelog.md`: ドキュメント更新履歴

---

### タスク4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 実装中に発見された追加タスクを記録する

**実行手順**:

1. 以下のソースから未タスクを検出:
   - Phase 11の発見課題（重要度「高」以外）
   - TODO/FIXMEコメント検索
   - テストで発見された改善点
   - ドキュメント不足箇所

2. 検出結果をレポートとして出力:

   **検出タスクがある場合**:

   ```markdown
   ## 検出結果サマリー

   | ソース       | 検出数  |
   | ------------ | ------- |
   | Phase 11課題 | X件     |
   | TODO/FIXME   | X件     |
   | その他       | X件     |
   | **合計**     | **X件** |

   ## 検出タスク一覧

   | ID     | タスク名  | 優先度 | 対応期限 |
   | ------ | --------- | ------ | -------- |
   | UT-XXX | XXXの実装 | 中     | 未定     |
   ```

   **検出タスクがない場合（0件）**:

   ```markdown
   ## 検出結果サマリー

   | ソース       | 検出数  |
   | ------------ | ------- |
   | Phase 11課題 | 0件     |
   | TODO/FIXME   | 0件     |
   | その他       | 0件     |
   | **合計**     | **0件** |

   ## 検出タスク一覧

   **検出タスクなし**

   すべてのテストがPASSし、発見課題もないため、
   未タスクとして記録すべき項目はありません。
   ```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`: 未タスク検出レポート

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容         |
| -------------------- | -------------------------------------------------------------------------------- | ------------ |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | 更新対象     |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 更新対象     |
| 仕様更新フロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | 更新判断基準 |

### Phase 11成果物

| 参照資料         | パス                                    | 内容     |
| ---------------- | --------------------------------------- | -------- |
| 発見課題レポート | `outputs/phase-11/discovered-issues.md` | 課題一覧 |

---

## 成果物

| 成果物               | パス                                         | 内容             |
| -------------------- | -------------------------------------------- | ---------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`   | 使用方法説明     |
| ドキュメント更新履歴 | `outputs/phase-12/document-changelog.md`     | 変更ファイル一覧 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md` | 追加タスク一覧   |
| システム仕様書更新   | （aiworkflow-requirements内の該当ファイル）  | 仕様反映         |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明、Part 2: 技術的詳細）が作成されている
- [ ] システム仕様書（aiworkflow-requirements）が更新されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成・CI確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-13-pr-creation.md`
