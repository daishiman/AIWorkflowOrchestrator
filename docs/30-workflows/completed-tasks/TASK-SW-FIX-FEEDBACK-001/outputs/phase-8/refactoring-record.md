# Phase 8: リファクタリング記録（terminology / current contract / follow-up 分離）

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 8                        |
| Phase名    | リファクタリング         |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 作成日     | 2026-04-14               |
| ステータス | completed                |

---

## 1. 用語統一（Task 1 実行結果）

### canonical / legacy 対応表

| 用語                  | 分類                              | 説明                                                                                        |
| --------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| `SkillLifecyclePanel` | **canonical**                     | current facts の正本コンポーネント。`handleExecutePlan` / `isExecuteTerminalHandoff` を含む |
| `SkillCreateWizard`   | **legacy / historical reference** | 旧称。コードベースには残存しているが、仕様書での主役は `SkillLifecyclePanel`                |
| `terminal_handoff`    | **canonical**                     | executePlan の特定レスポンス種別。early return を発動するキー種別                           |
| `current contract`    | **canonical**                     | コンポーネントが期待する Props / 戻り値の定義。実装により保証される契約                     |
| `follow-up 候補`      | **canonical**                     | current task の AC に含めない改善案。別タスクで対応する予定の変更                           |

### docs 内 legacy reference の扱い

- `SkillCreateWizard` への言及は "旧称 / historical reference" として扱う
- Phase 1〜7 の成果物内で `SkillCreateWizard` が登場する場合は文脈上の言及に留め、current facts として使用しない
- 新規ドキュメントでは `SkillLifecyclePanel` を canonical 名として使用する

---

## 2. current contract の表現整理（Task 2 実行結果）

### CompleteStep current contract

```typescript
// CompleteStep.tsx L117-164
// Props contract
interface CompleteStepProps {
  skillPath?: string | null; // null のみがエラー UI、undefined / "" は正常パス
  onRetry?: () => void; // オプショナル、エラー UI に retry ボタンを表示
  // (その他のPropsは今回の scope 外)
}
```

#### null ガードの明文化

| `skillPath` の値   | 扱い           | 表示される UI                                  |
| ------------------ | -------------- | ---------------------------------------------- |
| `null`             | **失敗ケース** | エラーUI（「スキルの生成に失敗しました」）のみ |
| `undefined`        | 正常パス       | 成功ヘッダー表示（skillPath 値の表示なし）     |
| `""` (空文字)      | 正常パス       | 成功ヘッダー表示（skillPath 値の表示なし）     |
| `"/path/to/skill"` | 正常パス       | 成功ヘッダー + スキルパス表示                  |

**根拠**: `skillPath === null`（厳密等値）のみが L117 の if 分岐に入る。

#### 成功ヘッダーの条件

- `skillPath !== null` の通常パスで `data-testid="complete-step-header"` が描画される
- エラー UI の場合（`skillPath === null`）、L117 でアーリーリターンするため成功ヘッダーの描画コードに未到達

### SkillLifecyclePanel current flow

```
handleExecutePlan (L1036-L1124)
  ├── executePlan IPC 呼び出し
  │     ├── isExecuteTerminalHandoff() = true
  │     │   └── setHandoffGuidance → early return（fetchSkills は呼ばれない）
  │     ├── errorResponse あり
  │     │   └── setGenerationError → return（fetchSkills は呼ばれない）
  │     └── 成功
  │         ├── loadVerifyDetail()
  │         ├── await fetchSkills()         ← AC-1 の核心
  │         └── selectSkillByName(name)     ← AC-1 の核心
```

**明文化事項**:

- `terminal_handoff` 時は `fetchSkills` / `selectSkillByName` が**呼ばれない**（AC-2）
- 成功時のみ `fetchSkills` が呼ばれ、その後 `selectSkillByName` が続く（AC-1）

---

## 3. follow-up 候補の分離表記（Task 3 実行結果）

### issue 8: fetchSkills() 非ブロッキング化

| 項目                  | 内容                                                                       |
| --------------------- | -------------------------------------------------------------------------- |
| issue番号             | 8                                                                          |
| タイトル              | `fetchSkills()` の非ブロッキング化                                         |
| 問題                  | `await fetchSkills()` が失敗すると `selectSkillByName` も実行されない      |
| 現行動作              | `fetchSkills` 失敗 → `generationError` セット → return で早期終了          |
| 改善案                | `fetchSkills` 失敗を non-blocking 化し、`selectSkillByName` は継続実行する |
| **current task 境界** | **本 AC (AC-1〜AC-5) の範囲外。current task は docs-only / no-op で完了**  |
| follow-up 変更対象    | `SkillLifecyclePanel.tsx` の `handleExecutePlan` とその既存テスト          |
| follow-up 対象外      | `CompleteStep.tsx`（issue 8 の影響を受けない）                             |

### current task と follow-up の責務境界

```
本タスク (TASK-SW-FIX-FEEDBACK-001) — docs-only / no-op
  └── current facts を固定・文書化（AC-1〜AC-5）
  └── code delta なし
  └── SkillLifecyclePanel / CompleteStep のコードは変更しない

follow-up 候補 (別タスク — 未発番)
  └── fetchSkills() non-blocking 化
  └── 変更対象: SkillLifecyclePanel.tsx + そのテスト
  └── CompleteStep.tsx は変更しない
  └── 本タスクの AC には含めない
```

---

## 4. evidence 再確認（Task 4 実行結果）

### Phase 4〜7 evidence と current facts の整合確認

| 確認対象                                                 | Phase 4 evidence     | Phase 7 カバレッジ   | 整合   |
| -------------------------------------------------------- | -------------------- | -------------------- | ------ |
| AC-1: success path → `fetchSkills` / `selectSkillByName` | U-8 PASS             | COVERED              | **OK** |
| AC-2: terminal_handoff → early return                    | U-13 PASS            | COVERED              | **OK** |
| AC-3: `skillPath=null` → error UI                        | TC-FEEDBACK-004 PASS | COVERED (L77-branch) | **OK** |
| AC-4: `skillPath=null` → success header 非表示           | TC-FEEDBACK-005 PASS | COVERED              | **OK** |
| AC-5: `skillPath` normal → success UI                    | TC-FEEDBACK-006 PASS | COVERED              | **OK** |

### SkillLifecyclePanel / CompleteStep の current contract 矛盾確認

| 確認項目                                                       | 結果         |
| -------------------------------------------------------------- | ------------ |
| `CompleteStepProps.skillPath` が `string \| null \| undefined` | **矛盾なし** |
| `onRetry?: () => void` がオプショナル                          | **矛盾なし** |
| `skillPath === null` のみがエラー UI                           | **矛盾なし** |
| `isExecuteTerminalHandoff()` が terminal_handoff を判定        | **矛盾なし** |
| Phase 6 境界ケースが current contract と整合                   | **矛盾なし** |

---

## 統合テスト連携判定

| 判定項目                    | 基準    | 結果     |
| --------------------------- | ------- | -------- |
| current contract の表現整合 | PASS    | **PASS** |
| TC-FEEDBACK-001〜005 の整合 | 5件PASS | **PASS** |
| follow-up 分離の明確さ      | PASS    | **PASS** |
| legacy reference の扱い     | PASS    | **PASS** |

---

## 完了確認

- [x] `SkillCreateWizard` が legacy / historical reference として明確化されている
- [x] `CompleteStepProps` の current contract が明確化されている
- [x] issue 8 の follow-up 分離が明文化されている
- [x] Phase 5〜7 の evidence と矛盾がない
- [x] 本Phase内の全タスクを100%実行完了
