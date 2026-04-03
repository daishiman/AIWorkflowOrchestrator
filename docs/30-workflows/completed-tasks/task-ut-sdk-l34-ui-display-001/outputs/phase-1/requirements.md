# Phase 1 Requirements

## Meta

| 項目    | 内容                      |
| ------- | ------------------------- |
| Task ID | UT-SDK-L34-UI-DISPLAY-001 |
| Phase   | 1                         |
| 日付    | 2026-04-03                |
| 種別    | UI task                   |

## Goal

`SkillLifecyclePanel.tsx` の verify detail 表示を、Layer 別グルーピング UI に拡張する。

## Scope

### 含む

- `verifyDetail.checks` の Layer1 / Layer2 / Layer3 / Layer4 グルーピング
- Layer ごとのアコーディオン表示
- severity アイコンと件数バッジの表示
- `SkillLifecyclePanel.test.tsx` の更新
- `SkillLifecyclePanel.llm-generation.test.tsx` の fixture 整合

### 含まない

- `apps/backend/` の変更
- `packages/shared/` の型変更
- PR 作成と commit

## Functional Requirements

| ID    | 要件                                                                     |
| ----- | ------------------------------------------------------------------------ |
| FR-01 | `verifyDetail.checks` を `layer1` 〜 `layer4` でグルーピングして表示する |
| FR-02 | 各 Layer グループを折りたたみ可能にする                                  |
| FR-03 | `info` / `warning` / `error` の severity アイコンを表示する              |
| FR-04 | Layer ヘッダーに severity 件数バッジを表示する                           |
| FR-05 | checks が 0 件の Layer は表示しない                                      |
| FR-06 | 既存 Layer1 / Layer2 の表示を壊さない                                    |
| FR-07 | reverify 後も Layer 別表示を更新する                                     |
| FR-08 | reverify 後も折りたたみ状態を保持する                                    |

## Non-Functional Requirements

| ID     | 要件                                    |
| ------ | --------------------------------------- |
| NFR-01 | TypeScript エラーなし                   |
| NFR-02 | ESLint エラーなし                       |
| NFR-03 | light / dark 両テーマで視認性が崩れない |
| NFR-04 | Vitest のコンポーネントテストが通る     |
| NFR-05 | 新しい SVG アイコン依存を追加しない     |
| NFR-06 | 派生状態は `useMemo` で扱う             |

## Acceptance Criteria

| AC   | 判定条件                                            |
| ---- | --------------------------------------------------- |
| AC-1 | 4 つの Layer が独立したセクションとして表示される   |
| AC-2 | `layer3` の check が Layer 3 内に表示される         |
| AC-3 | `error` / `warning` / `info` のアイコンが表示される |
| AC-4 | Layer ヘッダーに件数バッジが表示される              |
| AC-5 | 空の Layer は表示されない                           |
| AC-6 | Layer1 / Layer2 の既存表示が維持される              |
| AC-7 | Layer ヘッダーで開閉できる                          |
| AC-8 | 再検証後も表示と状態が崩れない                      |

## Notes

- 実装は renderer ローカルで完結する。
- backend / shared contract の変更は不要である。
