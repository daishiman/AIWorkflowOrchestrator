# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 5                          |
| Phase名    | 実装（TDD: Green）         |
| 前提Phase  | Phase 4 (テスト作成)       |
| 後続Phase  | Phase 6 (テスト拡充)       |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。Leidenアルゴリズムとコミュニティ検出サービスを実装する。

## 背景

TDD（テスト駆動開発）の第2フェーズとして、テストを通すための最小限の実装を行う。過剰な実装は避け、テストが通ることを優先する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**:
可読性が高く保守しやすいコードを書く必要がある場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `packages/shared/src/services/graph/leiden-algorithm.ts`
- `packages/shared/src/services/graph/community-detector.ts`

---

### スキル2: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**Trigger条件**:
Result型を使ったエラーハンドリングの実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. エラーハンドリングパターンを実装に適用

**期待される成果物**:

- Result型によるエラーハンドリングが実装されたコード

---

### スキル3: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**:
TypeScriptの型安全性を確保する実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 型安全性パターンを実装に適用

**期待される成果物**:

- Branded Types（EntityId, CommunityId）を使用した型安全なコード

---

## 参照資料

| 参照資料            | パス                                                                         | 内容               |
| ------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 2成果物       | `outputs/phase-2/architecture-design.md`                                     | アーキテクチャ設計 |
| Phase 4成果物       | `outputs/phase-4/test-specification.md`                                      | テスト仕様         |
| 元タスク指示書      | `docs/30-workflows/unassigned-task/task-08-02-community-detection-leiden.md` | 実装仕様           |
| RAGインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`        | 型定義参照         |

---

## 成果物

| 成果物             | パス                                                       | 内容                         |
| ------------------ | ---------------------------------------------------------- | ---------------------------- |
| Leidenアルゴリズム | `packages/shared/src/services/graph/leiden-algorithm.ts`   | Leidenアルゴリズム実装       |
| コミュニティ検出   | `packages/shared/src/services/graph/community-detector.ts` | コミュニティ検出サービス実装 |
| 型定義（追加）     | `packages/shared/src/services/graph/types.ts`              | Community関連型定義          |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                                  |
| ------------------ | ----------------------------------------------------- |
| GraphStore連携     | IKnowledgeGraphStore経由でノード・エッジを取得        |
| Repository連携     | CommunityRepository経由でコミュニティをDB保存         |
| エラーハンドリング | Result型でエラーを伝播、err時は詳細メッセージを含める |

---

## 実装指針

### ファイル構成

```
packages/shared/src/services/graph/
├── types.ts                 # Community, CommunityStructure 等の型定義（追加）
├── leiden-algorithm.ts      # Leidenアルゴリズム（新規）
├── community-detector.ts    # CommunityDetector（新規）
└── __tests__/
    ├── leiden-algorithm.test.ts
    └── community-detector.test.ts
```

### 実装順序

1. **types.ts に型定義を追加**
   - Community, CommunityStructure, CommunityDetectionOptions, CommunityDetectionResult

2. **LeidenAlgorithm クラスを実装**
   - detect() メソッド
   - localMovePhase() メソッド
   - refinementPhase() メソッド
   - aggregateGraph() メソッド
   - buildHierarchy() メソッド

3. **CommunityDetector クラスを実装**
   - ICommunityDetector インターフェース実装
   - detect(), saveResults(), getCommunitiesForEntity() 等

### コード品質基準

- [ ] 関数は単一責務
- [ ] 関数の行数は30行以内
- [ ] ネストは3レベル以内
- [ ] 変数名は意図が明確
- [ ] JSDocコメントが記述されている

---

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] IKnowledgeGraphStoreとの連携が実装されている
- [ ] CommunityRepositoryとの連携が実装されている
- [ ] Result型によるエラーハンドリングが実装されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル                  | 結果 | 備考 |
| ----------------------- | ---- | ---- |
| clean-code-practices    |      |      |
| error-handling-patterns |      |      |
| type-safety-patterns    |      |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-detection-leiden/phase-6-test-enhancement.md`
