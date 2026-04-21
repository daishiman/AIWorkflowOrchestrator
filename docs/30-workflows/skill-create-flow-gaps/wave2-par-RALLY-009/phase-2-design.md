# Phase 2: 設計

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| 機能名     | TASK-RALLY-009                   |
| タスク名   | getSkillCreatorApi()型ガード強化 |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| 作成日     | 2026-04-21                       |
| ステータス | pending                          |

## 目的

`isSkillCreatorRuntimeApi`・`isSessionResumeApi`型ガード関数の設計を確定し、
`asキャスト`をruntime検証に置き換える実装方針を固める。

## 実行タスク（直列）

- Phase 1のコード調査結果をもとに型ガード関数の設計を定義する
- `isSkillCreatorRuntimeApi(obj): obj is SkillCreatorRuntimeApi`の設計を確定する
- `isSessionResumeApi(obj): obj is SessionResumeApi`の設計を確定する
- `getSkillCreatorApi()`・`getSessionResumeApi()`の書き換えパターンを設計する
- RALLY-004で整理された型定義との整合を確認する
- 設計判断の根拠を文書化する

## 設計内容

### 問題

`getSkillCreatorApi()`と`getSessionResumeApi()`が同一オブジェクトを異なる型（`as`キャスト）で参照しており、実行時型保証なし。

### 変更前（型ガードなし）

```typescript
function getSkillCreatorApi(): SkillCreatorRuntimeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    skillCreatorAPI?: SkillCreatorRuntimeApi;
  };
  // asキャストのみ。メソッド存在チェックなし
  return (
    runtimeWindow.skillCreatorAPI ??
    runtimeWindow.electronAPI?.skillCreator ??
    null
  );
}
```

### 変更後（型ガード関数で runtime 検証）

```typescript
function isSkillCreatorRuntimeApi(obj: unknown): obj is SkillCreatorRuntimeApi {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).submitWorkflowInput ===
      "function" &&
    typeof (obj as Record<string, unknown>).getWorkflowState === "function" &&
    typeof (obj as Record<string, unknown>).onWorkflowStateChanged ===
      "function"
  );
}

function isSessionResumeApi(obj: unknown): obj is SessionResumeApi {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).resumeSession === "function"
    // SessionResumeApiの必須メソッドを実際の型定義に合わせて列挙する
  );
}

function getSkillCreatorApi(): SkillCreatorRuntimeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: unknown };
    skillCreatorAPI?: unknown;
  };
  const candidate =
    runtimeWindow.skillCreatorAPI ?? runtimeWindow.electronAPI?.skillCreator;
  if (isSkillCreatorRuntimeApi(candidate)) {
    return candidate;
  }
  return null;
}

function getSessionResumeApi(): SessionResumeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: unknown };
    skillCreatorAPI?: unknown;
  };
  const candidate =
    runtimeWindow.skillCreatorAPI ?? runtimeWindow.electronAPI?.skillCreator;
  if (isSessionResumeApi(candidate)) {
    return candidate;
  }
  return null;
}
```

### 設計判断の根拠

- 型ガード関数（`is` predicate）を使うことでTypeScriptの型システムとランタイム検証が一致する
- `as`キャストを`unknown`経由の候補取得 + 型ガードに変えることで「型が合わないオブジェクトが渡された場合はnullを返す」という安全な挙動になる
- 呼び出し側のコード（`if (!skillCreatorApi?.submitWorkflowInput)`等）は変更不要
- 過剰な検証（全プロパティを検証する）は避け、「呼び出し側が実際に使う必須メソッド」のみを検証する

## 参照資料

| 資料名           | パス                                                                   | 用途              |
| ---------------- | ---------------------------------------------------------------------- | ----------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                           | Phase 1成果物     |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`                               | Phase 1成果物     |
| コード調査結果   | `outputs/phase-1/code-investigation.md`                                | Phase 1成果物     |
| 設計ドキュメント | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-009設計方針 |

## 成果物

| 成果物             | パス                                   | 説明                         |
| ------------------ | -------------------------------------- | ---------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/design-spec.md`       | 型ガード関数の詳細設計       |
| 型ガード設計       | `outputs/phase-2/type-guard-design.md` | 必須メソッド検証ロジック設計 |

## 完了条件

- [ ] `isSkillCreatorRuntimeApi`型ガード関数の設計が確定していること
- [ ] `isSessionResumeApi`型ガード関数の設計が確定していること
- [ ] 検証する必須メソッド一覧が実際の型定義に基づいていること
- [ ] RALLY-004の型定義との整合が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート
