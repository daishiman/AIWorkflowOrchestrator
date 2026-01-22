# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 3                     |
| Phase名    | 設計レビューゲート    |
| 前提Phase  | Phase 2（設計）       |
| 後続Phase  | Phase 4（テスト作成） |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | React Context DI実装  |

---

## 目的

Phase 1〜2の要件・設計の妥当性を検証し、実装に進むかどうかを判定する。

## 背景

設計レビューは、実装前に設計の問題を検出し、手戻りを防ぐ重要なゲートである。Clean Architecture原則との整合性、型安全性、テスタビリティを検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件整合性レビュー

**目的**: Phase 1の要件とPhase 2の設計が整合しているかを検証する。

**実行手順**:

1. `outputs/phase-1/requirements-report.md` を読み込む
2. `outputs/phase-2/design-document.md` を読み込む
3. 以下の観点でレビュー:

   | レビュー観点     | 確認項目                                 |
   | ---------------- | ---------------------------------------- |
   | 機能要件カバー   | FR-001〜FR-006が設計で実現可能か         |
   | 受け入れ基準対応 | AC-001〜AC-004が設計で検証可能か         |
   | スコープ遵守     | スコープ外の機能が設計に含まれていないか |

4. レビュー結果を `outputs/phase-3/requirements-review.md` に記録

**期待される成果物**:

- `outputs/phase-3/requirements-review.md`

---

### タスク2: アーキテクチャレビュー

**目的**: Clean Architecture原則との整合性を検証する。

**実行手順**:

1. システム仕様を参照:
   - `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`

2. 以下の観点でレビュー:

   | レビュー観点       | 確認項目                                       |
   | ------------------ | ---------------------------------------------- |
   | 依存性逆転         | Presentation層がDomain層の抽象に依存しているか |
   | 層間の依存         | 外側から内側への依存のみか                     |
   | Repository Pattern | RepositoryがInterface経由で注入されるか        |
   | Use Case分離       | 各Use Caseが単一責務を持っているか             |

3. レビュー結果を `outputs/phase-3/architecture-review.md` に記録

**期待される成果物**:

- `outputs/phase-3/architecture-review.md`

---

### タスク3: 型安全性レビュー

**目的**: TypeScript型定義の安全性を検証する。

**実行手順**:

1. `outputs/phase-2/context-type-design.md` を読み込む
2. `outputs/phase-2/interface-compatibility.md` を読み込む
3. 以下の観点でレビュー:

   | レビュー観点 | 確認項目                               |
   | ------------ | -------------------------------------- |
   | 型整合性     | packages/sharedの型と一致しているか    |
   | null安全性   | Context null時の型ガードが適切か       |
   | Generic型    | Use Caseの戻り値型が正しく推論されるか |
   | any回避      | any型を使用していないか                |

4. レビュー結果を `outputs/phase-3/type-safety-review.md` に記録

**期待される成果物**:

- `outputs/phase-3/type-safety-review.md`

---

### タスク4: テスタビリティレビュー

**目的**: テスト容易性を検証する。

**実行手順**:

1. `outputs/phase-2/mock-provider-design.md` を読み込む
2. 以下の観点でレビュー:

   | レビュー観点     | 確認項目                                |
   | ---------------- | --------------------------------------- |
   | モック容易性     | MockProviderで全Use Casesをモック可能か |
   | 部分モック       | overridesで一部だけモック上書き可能か   |
   | 独立性           | テスト間で状態が共有されないか          |
   | Provider外テスト | Provider外使用時のエラーテストが可能か  |

3. レビュー結果を `outputs/phase-3/testability-review.md` に記録

**期待される成果物**:

- `outputs/phase-3/testability-review.md`

---

### タスク5: レビュー結果判定

**目的**: レビュー結果を集約し、次Phaseへの進行可否を判定する。

**実行手順**:

1. タスク1〜4のレビュー結果を集約
2. 以下の判定基準に従って判定:

   | 判定     | 条件                     | 次のアクション            |
   | -------- | ------------------------ | ------------------------- |
   | PASS     | 全レビュー観点で問題なし | Phase 4（テスト作成）へ   |
   | MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4へ     |
   | MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
   | CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

3. 判定結果を `outputs/phase-3/review-verdict.md` に記録

**期待される成果物**:

- `outputs/phase-3/review-verdict.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 型定義・Repository IF  |

### 前Phase成果物

| 参照資料         | パス                                     | 内容               |
| ---------------- | ---------------------------------------- | ------------------ |
| 要件定義レポート | `outputs/phase-1/requirements-report.md` | 要件・受け入れ基準 |
| 設計ドキュメント | `outputs/phase-2/design-document.md`     | 詳細設計           |

---

## 成果物

| 成果物                 | パス                                     | 内容             |
| ---------------------- | ---------------------------------------- | ---------------- |
| 要件整合性レビュー     | `outputs/phase-3/requirements-review.md` | 要件との整合確認 |
| アーキテクチャレビュー | `outputs/phase-3/architecture-review.md` | 設計原則との整合 |
| 型安全性レビュー       | `outputs/phase-3/type-safety-review.md`  | 型定義の安全性   |
| テスタビリティレビュー | `outputs/phase-3/testability-review.md`  | テスト容易性     |
| レビュー結果判定       | `outputs/phase-3/review-verdict.md`      | 最終判定         |

---

## 統合テスト連携（Phase 3は必須）

統合テスト観点のレビューゲートを実施する:

- Context/Provider間のデータフローが検証可能か
- Use Cases呼び出しの統合テストが設計されているか
- Repository注入パターンが統合テストで検証可能か

---

## 完了条件

- [ ] タスク1: 要件整合性レビュー完了
- [ ] タスク2: アーキテクチャレビュー完了
- [ ] タスク3: 型安全性レビュー完了
- [ ] タスク4: テスタビリティレビュー完了
- [ ] タスク5: レビュー結果判定完了（PASS or MINOR）
- [ ] 全成果物が `outputs/phase-3/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート（Phase 3）

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

---

## 依存関係

- **前提**: Phase 2（設計）が完了していること
- **後続**: Phase 4（テスト作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-4-test-creation.md`
