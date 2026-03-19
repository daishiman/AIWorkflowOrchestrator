# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                            |
| Phase      | 2 - 設計                                                                                                               |
| 前 Phase   | Phase 1 - 要件定義                                                                                                     |
| 次 Phase   | Phase 3 - 設計レビュー                                                                                                 |
| 依存成果物 | `phase-1-requirements.md`（調査結果）                                                                                  |
| 成果物パス | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-2-design.md` |
| ステータス | not_started                                                                                                            |

## 目的

Phase 1 の調査結果を踏まえ、3つのファイルへの具体的な変更内容を設計する。変更が最小限かつ後方互換を保つことを検証し、Phase 3 レビューが判断できる粒度の設計ドキュメントを作成する。

## 実行タスク

1. **ViewType 変更設計**（`apps/desktop/src/renderer/store/types.ts`）
   - `"skillAnalysis"` と `"skillCreate"` を union type に追加する位置を決定する
   - 既存の `"skill-center"` / `"skillCenter"` / `"skill-editor"` との共存方針を明記する
   - 追加後の完全な union type 定義を設計成果物として記録する

2. **renderView() case 設計**（`apps/desktop/src/renderer/App.tsx`）
   - `case "skillAnalysis"` の実装方針を設計する
     - `skillName` には `currentSkillName ?? "demo-skill"` を渡す
     - `onClose` は `() => setCurrentView("skillCenter")` とし、`currentSkillName` をリセットする
   - `case "skillCreate"` の実装方針を設計する
     - `onClose` は `() => setCurrentView("skillCenter")` とする
   - 追加する case の完全なコードスニペットを設計成果物として記録する
   - `normalizeSkillLifecycleView` の戻り値型（`Exclude<ViewType, "skill-center">`）が新 ViewType 追加後も正しく機能するか確認する

3. **SkillLifecycleJobGuide 型設計**（`apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`）
   - `SkillLifecycleJobGuide` インターフェースに `onAction?: () => void` フィールドを追加する設計を行う
   - `SKILL_LIFECYCLE_JOB_GUIDES` 定数（`as const` オブジェクト）への影響を検討する
     - `as const` では省略可能フィールドの値を指定しないことが可能か確認する
   - `normalizeSkillLifecycleView` の戻り値型更新が必要かどうか判断する

4. **変更影響範囲の特定**
   - `ViewType` を import しているファイルのうち、新 member 追加で exhaustive check が壊れるものを特定する
   - `SkillLifecycleJobGuide` 型を参照しているファイルを特定し、`onAction` 追加による破壊的変更がないか確認する

## 参照資料

### タスク関連

| 資料名         | パス                                                            | 説明               |
| -------------- | --------------------------------------------------------------- | ------------------ |
| Phase 1 成果物 | `phase-1-requirements.md`                                       | 調査結果・現状定義 |
| パックindex    | `docs/30-workflows/skill-lifecycle-routing/index.md`            | Codepath 所有表    |
| 導線契約正本   | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | 変更対象           |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                                        | 説明                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ViewType の正本定義仕様          |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 影響がある場合に参照         |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand / ナビゲーションパターン |

## 設計方針

### 1. ViewType 変更方針

既存の `"skill-center"` と `"skill-editor"` は後方互換のために残す。新 member は camelCase で統一する。

**変更後の ViewType（追加分のみ抜粋）:**

```typescript
export type ViewType =
  | "dashboard"
  | "workspace"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent"
  | "skillCenter"
  | "historySearch"
  | "chainBuilder"
  | "scheduleManager"
  | "debugPanel"
  | "analyticsDashboard"
  | "skill-editor"
  | "skill-center"
  | "skillAnalysis" // 追加
  | "skillCreate"; // 追加
```

### 2. renderView() case 追加方針

既存の `case "skill-editor":` の直後に追加する。`setCurrentSkillName(null)` のリセットを忘れない。

**追加する case（設計スニペット）:**

```typescript
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={currentSkillName ?? "demo-skill"}
      onClose={() => {
        setCurrentView("skillCenter");
        setCurrentSkillName(null);
      }}
    />
  );
case "skillCreate":
  return (
    <SkillCreateWizard
      onClose={() => setCurrentView("skillCenter")}
    />
  );
```

**設計根拠:**

- `skillAnalysis` は編集対象スキル名が必要なため `currentSkillName` を参照する。未設定時は `"demo-skill"` をフォールバックとする
- `skillCreate` は新規作成フローのため `currentSkillName` は不要
- 両 case とも閉じる先は `"skillCenter"`（スキルライフサイクルの入口）とする

### 3. SkillLifecycleJobGuide 型変更方針

`onAction` はオプショナルフィールドとして追加する。`SKILL_LIFECYCLE_JOB_GUIDES` 定数は `as const` で宣言されているため、省略可能フィールドを値に含めなくても型エラーは発生しない。

**変更後の型定義:**

```typescript
export interface SkillLifecycleJobGuide {
  id: SkillLifecycleJob;
  title: string;
  entryLabel: string;
  handoffLabel: string;
  summary: string;
  completion: string;
  onAction?: () => void; // 追加: Job Guide の CTA クリック時コールバック
}
```

**設計根拠:**

- `onAction` は Task02（SkillCenterView の JourneyPanel CTA 実装）が使用する
- 本タスクでは型定義の追加のみを行い、呼び出し側の実装は Task02 に委譲する
- オプショナルにすることで `SKILL_LIFECYCLE_JOB_GUIDES` 定数の既存定義を変更せずに済む

### 4. 変更の影響範囲

| 変更                                         | 影響ファイル                             | 影響内容                                                                                            |
| -------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ViewType` に 2 member 追加                  | `navigationSlice.ts`                     | `setCurrentView` の引数型が自動拡張される（変更不要）                                               |
| `ViewType` に 2 member 追加                  | `normalizeSkillLifecycleView` の戻り値型 | `Exclude<ViewType, "skill-center">` の結果は `"skillAnalysis"` / `"skillCreate"` を含むため変更不要 |
| `ViewType` に 2 member 追加                  | `shouldResetUnauthenticatedView.ts`      | ViewType を受け取るが exhaustive check なし。変更不要                                               |
| `SkillLifecycleJobGuide` に `onAction?` 追加 | `SKILL_LIFECYCLE_JOB_GUIDES` 定数        | オプショナルフィールドのため変更不要                                                                |
| `SkillLifecycleJobGuide` に `onAction?` 追加 | `getSkillLifecycleSurfaceResponsibility` | `SkillLifecycleJobGuide` を使用していない。変更不要                                                 |

## 実行手順

1. Phase 1 の成果物（調査結果・受入基準）を確認する
2. 実行タスク 1（ViewType 変更設計）: union type への追加位置と完全な型定義を記録する
3. 実行タスク 2（renderView() case 設計）: 2 case の完全なコードスニペットを作成する
4. 実行タスク 3（SkillLifecycleJobGuide 型設計）: `onAction?` フィールド追加の設計を行う
5. 実行タスク 4（変更影響範囲の特定）: exhaustive check への影響と破壊的変更の有無を確認する
6. 完了条件の全項目を検証する

## 統合テスト連携

本 Phase は設計のため、統合テストの直接実施はない。ただし、以下の観点を Phase 4（テスト作成）に引き継ぐ:

- `ViewType` union の網羅性検証（既存 15 member + 新規 2 member = 17 member）
- `renderView()` の新 case が正しいコンポーネントを返すことの検証
- `normalizeSkillLifecycleView` が新 ViewType を変換せず返すことの検証
- `SkillLifecycleJobGuide` 型の `onAction` オプショナル互換性検証

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物                                    | パス                                                                                                                   | 種別       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| 設計書（本ファイル）                      | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-2-design.md` | 設計書     |
| ViewType 変更後の完全な型定義             | 本ファイル内に記録                                                                                                     | 設計成果物 |
| renderView() 追加 case のコードスニペット | 本ファイル内に記録                                                                                                     | 設計成果物 |
| SkillLifecycleJobGuide 型の変更後の定義   | 本ファイル内に記録                                                                                                     | 設計成果物 |
| 変更影響範囲テーブル                      | 本ファイル内に記録                                                                                                     | 影響分析   |

## 完了条件

- [ ] ViewType 変更後の完全な型定義が記録されている
- [ ] `renderView()` に追加する 2 case の完全なコードスニペットが記録されている
- [ ] `SkillLifecycleJobGuide` 型の変更後の完全なインターフェース定義が記録されている
- [ ] 変更影響範囲テーブルが作成されており、破壊的変更がないことが確認されている
- [ ] `normalizeSkillLifecycleView` の戻り値型への影響が評価されている
- [ ] `SKILL_LIFECYCLE_JOB_GUIDES` 定数への影響が評価されている
- [ ] Phase 3 レビューへの引き継ぎ事項が明文化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 2
```

## 次Phase

Phase 3 - 設計レビュー（`phase-3-design-review.md`）
