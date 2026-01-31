# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 3                              |
| Phase名   | 設計レビューゲート             |
| カテゴリ  | ゲート                         |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 2                        |
| 後続Phase | Phase 4                        |

## 目的

Phase 2 の設計成果物をレビューし、実装に進むための品質ゲートを通過させる。ChatPanel 統合設計と SkillStreamingView 設計が要件を満たしているか、既存コンポーネントとの整合性があるかを検証する。

## 実行タスク

### タスク1: 設計レビュー実施

**目的**: Phase 2 の全設計成果物に対して多角的なレビューを実施する。

**手順**:

1. Phase 2 の全成果物を読み込む:
   - `outputs/phase-2/chatpanel-layout-design.md`
   - `outputs/phase-2/skill-streaming-view-design.md`
   - `outputs/phase-2/data-flow-design.md`
   - `outputs/phase-2/accessibility-design.md`

2. 以下の観点でレビューする:

   **構造整合性**:
   - ChatPanel のレイアウト構成が specification.md 4.1 のワイヤーフレームと一致するか
   - SkillStreamingView のサブコンポーネント構成が仕様 4.4.1/4.7 に準拠するか

   **既存コンポーネントとの一貫性**:
   - useAppStore の使用パターンが SkillSelector/PermissionDialog と一貫しているか
   - Tailwind CSS クラスの命名が既存コンポーネント（StreamingMessage.tsx）と一貫しているか
   - SkillImportDialog の Props パターンが設計通りか（skill, isOpen, onClose）

   **データフロー**:
   - Store → Component → SubComponent のデータフローに漏れがないか
   - イベントハンドラの連鎖（onImportRequest → setImportDialogSkill）が正しいか
   - useEffect の依存配列が正しく設計されているか（fetchSkills の依存）

   **型安全性**:
   - SkillStreamMessage の discriminated union が StreamMessageItem で正しくハンドリングされるか
   - SkillExecutionStatus の全値が StatusBadge でカバーされているか（idle は非表示）

   **アクセシビリティ**:
   - WCAG 2.1 AA の要件が全て反映されているか
   - aria-live/aria-busy/role 属性が適切に設計されているか

3. レビュー結果を判定する

**期待される成果物**:

- 設計レビューレポート（`outputs/phase-3/design-review-report.md`）

### タスク2: レビュー判定

**目的**: レビュー結果に基づき、ゲート判定を行う。

**手順**:

1. 以下の判定基準に従い判定する:

| 判定     | 条件                                 | 次のアクション    |
| -------- | ------------------------------------ | ----------------- |
| PASS     | 設計に問題なし                       | Phase 4 へ進む    |
| MINOR    | 軽微な修正で解決可能（命名変更等）   | 修正後 Phase 4 へ |
| MAJOR    | 設計上の問題あり（レイアウト変更等） | Phase 2 に戻る    |
| CRITICAL | 要件の問題あり                       | Phase 1 に戻る    |

2. MINOR 判定の場合、指摘事項と修正方法を具体的に記載する
3. MAJOR/CRITICAL の場合、戻り先 Phase と修正すべき内容を明記する

**期待される成果物**:

- ゲート判定結果（`outputs/phase-3/gate-decision.md`）

## 参照資料

| 参照資料           | パス                                                           |
| ------------------ | -------------------------------------------------------------- |
| Phase 2 成果物     | `outputs/phase-2/` ディレクトリ全体                            |
| Phase 1 要件定義書 | `outputs/phase-1/requirements-definition.md`                   |
| 機能仕様書         | `docs/30-workflows/skill-import-agent-system/specification.md` |

## 統合テスト連携

### このフェーズで確認すべき統合テスト観点

| カテゴリ         | 確認項目                                                         |
| ---------------- | ---------------------------------------------------------------- |
| テスト設計妥当性 | Phase 2 で特定された統合テストシナリオが網羅的か                 |
| テスタビリティ   | 設計がテスト可能な構造になっているか（モック可能、状態注入可能） |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点           | 確認項目                                                                    |
| -------------- | --------------------------------------------------------------------------- |
| 設計品質       | Phase 2 の設計が specification.md の仕様を過不足なくカバーしているか        |
| 一貫性         | 既存コンポーネント（SkillSelector、PermissionDialog）のパターンと一致するか |
| テスタビリティ | 設計がテスト可能な構造（モック可能、Props 注入可能）になっているか          |

## 成果物

| 成果物               | パス                                      | 種別     |
| -------------------- | ----------------------------------------- | -------- |
| 設計レビューレポート | `outputs/phase-3/design-review-report.md` | document |
| ゲート判定結果       | `outputs/phase-3/gate-decision.md`        | document |

## 完了条件

- [ ] Phase 2 の全設計成果物がレビューされている
- [ ] 構造整合性・一貫性・データフロー・型安全性・アクセシビリティの全観点が確認されている
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が下されている
- [ ] MINOR 指摘がある場合、修正方法が具体的に記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 設計レビュー実施
3. タスク2: レビュー判定
4. 統合テスト連携の実施
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 3
```

## 次のPhase

Phase 4: テスト作成 → [phase-4-test-creation.md](phase-4-test-creation.md)
