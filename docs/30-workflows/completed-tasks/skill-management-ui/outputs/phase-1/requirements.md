# 要件定義書 - スキル管理UI（AGENT-002）

## メタ情報

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| タスクID   | AGENT-002                                                                                       |
| 機能名     | skill-management-ui                                                                             |
| Phase      | 1（要件定義）                                                                                   |
| 作成日     | 2026-01-11                                                                                      |
| 依存タスク | AGENT-001（エージェントダッシュボード基盤）                                                     |
| 概要       | AgentView内にスキルインポート・一覧・検索・詳細表示機能を実装し、スキルの管理・実行を可能にする |

---

## 1. 概要

本機能は、AIWorkflowOrchestratorのAgentView内にスキル管理UIを提供する。ユーザーは`.claude/skills/`配下に配置されたスキルファイルをインポートし、一覧表示・検索・フィルタリング・詳細確認・実行準備を行うことができる。

### 1.1 目的

- ユーザーがプロジェクト固有のスキルを選択的にインポートできるようにする
- インポート済みスキルを視覚的に管理できるUIを提供する
- スキルの検索・フィルタリングによる素早いアクセスを実現する
- スキル詳細の確認から実行への円滑な遷移を可能にする

### 1.2 スコープ

**含まれるもの**:

- スキルインポートダイアログ
- スキル一覧表示（カード形式）
- スキル検索・フィルタリング機能
- スキル詳細パネル
- スキル削除機能
- インポート設定の永続化

**含まれないもの**:

- スキルの実行機能（AGENT-004で実装）
- スキルの編集・作成機能
- スキルファイルの物理削除

---

## 2. 機能要件サマリー

詳細は `functional-requirements.md` を参照。

| ID     | 機能名                     | 優先度 | 概要                                              |
| ------ | -------------------------- | ------ | ------------------------------------------------- |
| FR-001 | スキルインポートダイアログ | 高     | `.claude/skills/`配下のスキルを選択してインポート |
| FR-002 | スキル一覧表示             | 高     | インポート済みスキルをカード形式でグリッド表示    |
| FR-003 | スキル検索                 | 高     | 名前・Triggerキーワード・説明文でリアルタイム検索 |
| FR-004 | カテゴリフィルター         | 中     | スキルをカテゴリで絞り込み                        |
| FR-005 | スキル詳細パネル           | 高     | 選択スキルの詳細情報をサイドパネルに表示          |
| FR-006 | スキル削除                 | 中     | インポート済みスキルをインポート解除              |
| FR-007 | インポート設定永続化       | 高     | electron-storeを使用してインポート情報を永続化    |

---

## 3. 非機能要件サマリー

詳細は `non-functional-requirements.md` を参照。

### 3.1 パフォーマンス

| ID       | 要件名         | 基準値              |
| -------- | -------------- | ------------------- |
| NFR-P001 | 初期表示速度   | 200ms以下           |
| NFR-P002 | 検索レスポンス | 100ms以下           |
| NFR-P003 | 大量スキル表示 | 100件で500ms以下    |
| NFR-P004 | メモリ使用量   | 100件で追加50MB以下 |

### 3.2 アクセシビリティ（WCAG 2.1 AA準拠）

| ID       | 要件名                   | 基準                                 |
| -------- | ------------------------ | ------------------------------------ |
| NFR-A001 | キーボードナビゲーション | 全機能がキーボードのみで操作可能     |
| NFR-A002 | フォーカス管理           | フォーカストラップ・復帰が正しく機能 |
| NFR-A003 | スクリーンリーダー対応   | VoiceOver/NVDAで全情報にアクセス可能 |
| NFR-A004 | コントラスト比           | テキスト 4.5:1以上                   |
| NFR-A005 | フォーカスインジケータ   | 2px以上、背景との3:1コントラスト     |
| NFR-A006 | 色だけに頼らない情報伝達 | アイコン・テキストを併用             |

### 3.3 レスポンシブデザイン

| ウィンドウ幅   | グリッド列数 | 詳細パネル表示 |
| -------------- | ------------ | -------------- |
| 1920px以上     | 4列          | 右サイド固定   |
| 1280px〜1919px | 3列          | 右サイド固定   |
| 1024px〜1279px | 2列          | オーバーレイ   |
| 800px〜1023px  | 1-2列        | オーバーレイ   |

### 3.4 セキュリティ

| ID       | 要件名                 | 内容                                  |
| -------- | ---------------------- | ------------------------------------- |
| NFR-S001 | IPC入力検証            | 全IPCリクエストをZodでバリデーション  |
| NFR-S002 | ファイルパスサニタイズ | `.claude/skills/`配下のみアクセス許可 |
| NFR-S003 | XSS対策                | Reactの自動エスケープを維持           |

---

## 4. 受け入れ基準サマリー

詳細は `acceptance-criteria.md` を参照。

全22件の受け入れ基準がGiven-When-Then形式で定義されている。

### 主要シナリオ

| ID     | シナリオ                         | 優先度 |
| ------ | -------------------------------- | ------ |
| AC-001 | スキルインポートダイアログを開く | 高     |
| AC-002 | スキルを選択してインポートする   | 高     |
| AC-005 | インポート済みスキル一覧表示     | 高     |
| AC-007 | スキルを名前で検索               | 高     |
| AC-014 | スキル詳細を表示                 | 高     |
| AC-015 | 詳細パネルから実行画面へ遷移     | 高     |
| AC-018 | キーボードでスキルを選択         | 中     |
| AC-022 | 設定が永続化される               | 高     |

---

## 5. UIレイアウト

詳細は `wireframes.md` を参照。

### 5.1 メインレイアウト

```
┌──────────────────────────────────────────────────────────────┐
│ Agent Dashboard                     [+ スキルをインポート]   │
├──────────────────────────────────────────────────────────────┤
│ [🔍 スキルを検索...        ] [カテゴリ ▼]                    │
├────────────────────────────────────┬─────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────┐│ スキル詳細               │
│ │ Skill 1  │ │ Skill 2  │ │ ...  ││                         │
│ │ desc...  │ │ desc...  │ │      ││ 名前: tdd-principles     │
│ │ [Test]   │ │ [Code]   │ │      ││ 説明: ...                │
│ └──────────┘ └──────────┘ └──────┘│ Triggers: tdd, test...   │
│ ┌──────────┐ ┌──────────┐         │ Anchors:                 │
│ │ Skill 4  │ │ Skill 5  │         │  - Clean Code            │
│ │ desc...  │ │ desc...  │         │  - TDD by Example        │
│ │ [Test]   │ │ [Design] │         │                          │
│ └──────────┘ └──────────┘         │ [🚀 実行] [🗑️ 削除]      │
└────────────────────────────────────┴─────────────────────────┘
```

### 5.2 インポートダイアログ

```
┌───────────────────────────────────────────┐
│ スキルをインポート                    [×] │
├───────────────────────────────────────────┤
│ [🔍 スキルを検索...]                      │
├───────────────────────────────────────────┤
│ ☐ tdd-principles - TDD原則に従った開発   │
│ ☑ code-review - コードレビューガイド     │
│ ☐ domain-modeling - ドメインモデリング   │
│ ☑ responsive-design - レスポンシブ設計   │
├───────────────────────────────────────────┤
│                    [キャンセル] [インポート] │
└───────────────────────────────────────────┘
```

---

## 6. システム統合要件

### 6.1 IPC通信要件

| チャネル          | 方向            | 用途               | リクエスト                             | レスポンス             |
| ----------------- | --------------- | ------------------ | -------------------------------------- | ---------------------- |
| `skill:list`      | Renderer → Main | インポート済み一覧 | なし                                   | `Skill[]`              |
| `skill:available` | Renderer → Main | 利用可能スキル一覧 | なし                                   | `Skill[]`              |
| `skill:import`    | Renderer → Main | スキルインポート   | `{ skillIds: string[] }`               | `{ success: boolean }` |
| `skill:remove`    | Renderer → Main | スキル削除         | `{ skillId: string }`                  | `{ success: boolean }` |
| `skill:search`    | Renderer → Main | スキル検索         | `{ query: string, category?: string }` | `Skill[]`              |

### 6.2 Zustand Store連携

agentSliceとの接続ポイント:

```typescript
interface SkillState {
  skills: Skill[]; // インポート済みスキル一覧
  selectedSkill: Skill | null; // 選択中スキル
  skillFilter: string; // 検索文字列
  skillCategory: string; // カテゴリフィルター
  isLoading: boolean; // ローディング状態
  error: string | null; // エラー状態
}

interface SkillActions {
  setSkills: (skills: Skill[]) => void;
  selectSkill: (skill: Skill | null) => void;
  setSkillFilter: (filter: string) => void;
  setSkillCategory: (category: string) => void;
  importSkills: (skillIds: string[]) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
}
```

### 6.3 スキルパーサー連携

SKILL.mdファイルからの情報抽出:

| フィールド  | 抽出方法                          |
| ----------- | --------------------------------- |
| name        | ファイル名またはfrontmatterから   |
| description | YAML frontmatterの`description`   |
| triggers    | YAML frontmatterの`triggers`      |
| category    | ディレクトリ構造またはfrontmatter |
| anchors     | `Anchors:`セクションをパース      |

### 6.4 データ型定義

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  triggers: string[];
  category: string;
}

interface SkillDetail extends Skill {
  anchors: Anchor[];
  bestPractices?: string[];
  fullContent: string;
}

interface Anchor {
  name: string;
  application: string;
  purpose: string;
}
```

---

## 7. コンポーネント構成

Atomic Design原則に従った構成:

### 7.1 Organisms

| コンポーネント    | パス                                               | 責務                       |
| ----------------- | -------------------------------------------------- | -------------------------- |
| SkillImportDialog | `components/organisms/SkillImportDialog/index.tsx` | スキルインポートダイアログ |
| SkillList         | `components/organisms/SkillList/index.tsx`         | スキル一覧グリッド表示     |
| SkillDetailPanel  | `components/organisms/SkillDetailPanel/index.tsx`  | スキル詳細パネル           |

### 7.2 Molecules

| コンポーネント      | パス                                                 | 責務               |
| ------------------- | ---------------------------------------------------- | ------------------ |
| SkillCard           | `components/molecules/SkillCard/index.tsx`           | スキルカード表示   |
| SkillSearchBar      | `components/molecules/SkillSearchBar/index.tsx`      | スキル検索バー     |
| SkillCategoryFilter | `components/molecules/SkillCategoryFilter/index.tsx` | カテゴリフィルター |

---

## 8. 依存関係

### 8.1 前提タスク

| タスクID  | 名称                           | 必要な成果物                  |
| --------- | ------------------------------ | ----------------------------- |
| AGENT-001 | エージェントダッシュボード基盤 | AgentView、基盤コンポーネント |

### 8.2 並行実装可能タスク

| タスクID  | 名称           | 連携ポイント |
| --------- | -------------- | ------------ |
| AGENT-003 | （並行タスク） | -            |

### 8.3 後続タスク

| タスクID  | 名称           | 依存内容                     |
| --------- | -------------- | ---------------------------- |
| AGENT-004 | スキル実行機能 | 本機能のスキル選択・詳細表示 |

---

## 9. Phase 1 成果物一覧

| 成果物             | ファイル                         | ステータス |
| ------------------ | -------------------------------- | ---------- |
| 機能要件リスト     | `functional-requirements.md`     | 完了       |
| 非機能要件リスト   | `non-functional-requirements.md` | 完了       |
| 受け入れ基準       | `acceptance-criteria.md`         | 完了       |
| UIワイヤーフレーム | `wireframes.md`                  | 完了       |
| 要件定義書（本書） | `requirements.md`                | 完了       |

---

## 10. Phase 1 完了チェックリスト

- [x] 機能要件が一覧化されている
- [x] 非機能要件（パフォーマンス、アクセシビリティ）が定義されている
- [x] 受け入れ基準がGiven-When-Then形式で作成されている
- [x] UIワイヤーフレームが作成されている
- [x] 要件定義書が完成している
- [x] IPC接続要件が明記されている
- [x] Zustand接続要件が明記されている
- [x] スキルパーサー連携要件が明記されている

---

## 11. 次のPhase

Phase 2: 設計

`docs/30-workflows/skill-management-ui/phase-2-design.md` を実行してください。
