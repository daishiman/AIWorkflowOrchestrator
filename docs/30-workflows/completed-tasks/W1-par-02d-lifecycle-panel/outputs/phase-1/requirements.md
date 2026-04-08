# Phase 1: 要件定義 — 成果物

## タスクID: UT-SKILL-WIZARD-W1-par-02d

## 現行実装の確認結果

### 現行 SkillLifecyclePanelProps インターフェース

```typescript
export interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenWizard?: () => void; // 任意
  skillName?: string; // 任意
}
```

### 削除対象（確認済み）

| 削除対象                        | コード行   | 識別子                                                                            |
| ------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `request` state                 | L493       | `const [request, setRequest] = useState("");`                                     |
| `isPreparing` state             | L514       | `const [isPreparing, setIsPreparing] = useState(false);`                          |
| `isCreating` state              | L515       | `const [isCreating, setIsCreating] = useState(false);`                            |
| `createdSkillPath` state        | L504       | `const [createdSkillPath, setCreatedSkillPath] = useState<string \| null>(null);` |
| `isPrepareFlowActiveRef`        | L568       | `const isPrepareFlowActiveRef = useRef(false);`                                   |
| `handleCreate()` 関数           | L1332-1377 | 旧スキル生成ロジック                                                              |
| `handlePrepare()` 関数          | L1111-1233 | 旧方針決定ロジック                                                                |
| 「1. 依頼をまとめる」セクション | L1992-2048 | textarea・create/prepare ボタン含む                                               |

### 追加対象（確認済み）

| 追加対象                               | data-testid                          | 説明                       |
| -------------------------------------- | ------------------------------------ | -------------------------- |
| 「1. スキルを作成する」セクション      | -                                    | 旧セクションの置換         |
| 「スキル作成ウィザードを開く →」ボタン | `skill-lifecycle-open-wizard-button` | `onOpenSkillWizard` 呼出し |

### 呼び出し元（影響範囲）

| ファイル                                                                           | 現在の Props                           | 対応                       |
| ---------------------------------------------------------------------------------- | -------------------------------------- | -------------------------- |
| `apps/desktop/src/renderer/App.tsx` (L346, L389)                                   | `onClose`, `onOpenWizard`              | `onOpenSkillWizard` 追加要 |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` (L472)       | `onClose`, `onOpenWizard`              | `onOpenSkillWizard` 追加要 |
| `apps/desktop/src/renderer/phase11-task-skill-lifecycle-severity-filter.tsx` (L34) | `onClose`, `onOpenWizard`, `skillName` | `onOpenSkillWizard` 追加要 |
| `apps/desktop/src/renderer/phase11-task-rt-04-skill-authkey.tsx` (L23)             | `onClose`, `onOpenWizard`, `skillName` | `onOpenSkillWizard` 追加要 |

## 機能要件

| ID    | 要件                                                          | 優先度 | 確認 |
| ----- | ------------------------------------------------------------- | ------ | ---- |
| FR-01 | `onOpenSkillWizard: () => void` を Props に追加する           | 必須   | ✓    |
| FR-02 | ウィザードボタンクリックで `onOpenSkillWizard` を呼び出す     | 必須   | ✓    |
| FR-03 | 旧テキストエリアが DOM に存在しなくなる                       | 必須   | ✓    |
| FR-04 | 旧「スキルを生成する」ボタンが DOM に存在しなくなる           | 必須   | ✓    |
| FR-05 | 旧「方針を決める」ボタンが DOM に存在しなくなる               | 必須   | ✓    |
| FR-06 | `data-testid="skill-lifecycle-open-wizard-button"` を付与する | 必須   | ✓    |

## 非機能要件

| ID     | 要件                                                                    | 優先度 | 確認 |
| ------ | ----------------------------------------------------------------------- | ------ | ---- |
| NFR-01 | 既存の他セクション（「2. 生成したスキルを実行する」等）に影響を与えない | 必須   | ✓    |
| NFR-02 | TypeScript strict mode に対応する                                       | 必須   | ✓    |
| NFR-03 | Tailwind CSS デザイントークンを使用する                                 | 必須   | ✓    |

## スコープ境界

- **含む**: SkillLifecyclePanel.tsx の最小変更、関連テストの更新、呼び出し元への `onOpenSkillWizard` 追加
- **含まない**: SkillCreateWizard.tsx の実装（W2-seq-03a のスコープ）、`onOpenSkillWizard` の実装先ロジック

## タスク分類

- **UI task**: Phase 11 では screenshot / visual review を必須化する
- **成果物レジストリ**: Phase 12 では canonical 6 outputs を同一 wave で揃える

## 完了確認

- [x] 現行実装の削除対象が全て特定されている
- [x] 追加対象が確定している
- [x] Props変更要件が確定している
- [x] 機能要件FR-01〜FR-06が全て記載されている
- [x] スコープ境界（含む/含まない）が明確である
- [x] タスク分類（UI task）が明記されている
