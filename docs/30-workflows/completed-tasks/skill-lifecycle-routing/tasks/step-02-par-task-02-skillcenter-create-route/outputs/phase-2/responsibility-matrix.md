# Phase 2 責務マトリクス: SkillCenter Create Route

## 1. CTA handoff 責務マトリクス

| CTA                      | 表示場所                                 | 呼び出し先                        | 責務境界                                      |
| ------------------------ | ---------------------------------------- | --------------------------------- | --------------------------------------------- |
| 「+ 新しいツールを作る」 | SkillCenterView ヘッダー右端             | `setCurrentView("skillCreate")`   | handoffのみ。スキル作成ロジック本体は持たない |
| 「作成を始める」         | JourneyPanel: スキル作成ガイドカード     | `setCurrentView("skillCreate")`   | handoffのみ。スキル作成ロジック本体は持たない |
| 「使ってみる」           | JourneyPanel: ワークスペースガイドカード | `setCurrentView("workspace")`     | handoffのみ。ツール実行ロジック本体は持たない |
| 「改善する」             | JourneyPanel: スキル改善ガイドカード     | `setCurrentView("skillAnalysis")` | handoffのみ。分析・改善ロジック本体は持たない |

### 責務境界の定義

全CTAは `setCurrentView` の呼び出しのみを実行する。以下の処理は SkillCenterView の責務範囲外である。

- スキルファイルの作成・編集・保存
- スキルの実行・テスト
- スキルの分析・評価・フィードバック収集
- ナビゲーション後の状態初期化

---

## 2. AC-6準拠確認

**AC-6**: 「SkillCenterViewのCTAボタンは、setCurrentView呼び出しのみを行い、スキル作成・分析・実行のビジネスロジックを含まない」

### 準拠検証

| CTA                              | setCurrentView呼び出し          | ビジネスロジック含有 | AC-6準拠 |
| -------------------------------- | ------------------------------- | -------------------- | -------- |
| ヘッダー「+ 新しいツールを作る」 | setCurrentView("skillCreate")   | なし                 | 準拠     |
| 「作成を始める」                 | setCurrentView("skillCreate")   | なし                 | 準拠     |
| 「使ってみる」                   | setCurrentView("workspace")     | なし                 | 準拠     |
| 「改善する」                     | setCurrentView("skillAnalysis") | なし                 | 準拠     |

### 設計上の注意事項

- `useSkillCenter`フック内の `navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` は、それぞれ `setCurrentView` の単純なラッパーである
- フック内でスキルのロード・バリデーション・前処理を行わない
- ナビゲーション先のView（skillCreate, workspace, skillAnalysis）が独自の初期化ロジックを持つ場合、それは遷移先Viewの責務である

---

## 3. forbiddenResponsibility（skillCenter）

**禁則**: SkillCenterViewは「直接実行や詳細分析の本体を背負わない」

### 禁則根拠

SkillCenterViewは「スキルの概要把握」と「適切なViewへの案内」を担うハブViewである。
スキル操作の本体を持つと、以下の問題が発生する。

- ビジネスロジックが複数のViewに分散し、変更影響範囲が広がる
- SkillCenterView自体のテスト複雑度が増大する
- 将来的なView構成変更時の影響範囲が制御不能になる

### 禁則事項の具体例

```typescript
// 禁止: SkillCenterView内でスキル実行ロジックを呼び出す
const handleRunSkill = async () => {
  const result = await skillAPI.executeSkill(skillName); // 禁止
  setCurrentView("workspace");
};

// 禁止: SkillCenterView内で分析データを事前ロードする
const handleAnalyzeSkill = async () => {
  await analysisStore.loadAnalysisData(skillName); // 禁止
  setCurrentView("skillAnalysis");
};

// 正しい実装: handoffのみ
const handleNavigateToSkillCreate = () => {
  setCurrentView("skillCreate"); // これのみ
};
```

---

## 4. Task03/Task04との責務境界

### タスク構成と責務分担

| タスク             | 責務                                      | SkillCenterとの境界                                        |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------- |
| Task02（本タスク） | SkillCenterViewのCTAボタン実装（handoff） | CTA押下でsetCurrentViewを呼び出すまでが責務範囲            |
| Task03             | SkillDetailView アクションボタン実装      | スキル詳細画面内のアクション（編集・削除・実行起動）を担当 |
| Task04             | AgentViewの改善・ルーティング             | workspace/skillAnalysisへのナビゲーション後の表示を担当    |

### 境界の詳細

#### SkillCenterView（Task02） → SkillCreateView

```
SkillCenterView: setCurrentView("skillCreate") を呼ぶ
                                    |
                                    v（責務境界: この矢印の先は別タスクの管轄）
SkillCreateView: スキル作成フォームの表示・保存処理を担当
```

#### SkillCenterView（Task02） → workspace

```
SkillCenterView: setCurrentView("workspace") を呼ぶ
                                    |
                                    v（責務境界: この矢印の先はTask04の管轄）
WorkspaceView: ツールの選択・実行UIを担当（Task04スコープ）
```

#### SkillCenterView（Task02） → skillAnalysis

```
SkillCenterView: setCurrentView("skillAnalysis") を呼ぶ
                                    |
                                    v（責務境界: この矢印の先はTask04の管轄）
SkillAnalysisView: スキル分析・フィードバックUIを担当（Task04スコープ）
```

### 依存関係

Task02の実装は以下に依存する。

- `ViewType`型に `skillCreate`, `workspace`, `skillAnalysis` が定義済みであること（既確認）
- `useAppStore` の `setCurrentView` アクションが実装済みであること（既確認）
- Task01（viewtype-renderView-foundation）が完了済みであること（依存: step-01）

Task02は以下から依存されない（他タスクがTask02の完了を待つ必要はない）。

- Task03（skilldetail-action-buttons）: 独立して並列実行可能
- Task05（ipc-layer-integrity-fix）: 独立して並列実行可能
