# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認） |
| ステータス | 未実施                    |
| 作成日     | 2026-01-24                |
| 機能名     | workspace-chat-edit-ui    |

---

## 目的

カバレッジ目標（Line 80%以上）達成に向けて、追加のテストケースを作成する。

## 背景

Phase 5で基本実装が完了し、テストが通過している。
カバレッジ向上のためにエッジケース、異常系、境界値テストを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加

**目的**: 各コンポーネントのエッジケースをテストする

**実行手順**:

1. FileContextBadge:
   - 非常に長いファイル名（100文字以上）の表示
   - 特殊文字を含むファイル名の表示
   - onRemoveがundefinedの場合

2. ApplyControls:
   - applyResult失敗時のエラーハンドリング
   - 連続クリック時の動作

3. FileContextDropZone:
   - 空ファイルのドロップ
   - 0バイトファイルのバリデーション
   - 境界値（10MB丁度）のファイル

4. DiffEditor:
   - 空文字列の差分表示
   - 非常に大きなファイル（10000行）

**期待される成果物**:

- 各コンポーネントのテストファイルに追加

---

### タスク2: 異常系テスト追加

**目的**: エラーハンドリングのテストを追加する

**実行手順**:

1. ApplyControls:
   - ファイル書き込み失敗時のエラー表示
   - ネットワークエラー時の動作

2. FileContextDropZone:
   - ファイル読み取り失敗時のエラー表示
   - パーミッションエラー時の動作

3. DiffPreview:
   - 無効なresultIdの場合

**期待される成果物**:

- 各コンポーネントのテストファイルに追加

---

### タスク3: アクセシビリティテスト追加

**目的**: WCAG 2.1 AA準拠のアクセシビリティテストを追加する

**実行手順**:

1. jest-axeを使用した自動アクセシビリティチェック
2. キーボード操作テスト:
   - FileContextBadge: Delete/Backspaceで削除
   - ApplyControls: Enter/Escapeで適用/却下
   - EditCommandInput: Enter で送信
3. フォーカス管理テスト

**テスト例**:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('アクセシビリティ違反がないこと', async () => {
  const { container } = render(<FileContextBadge context={mockContext} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it('キーボードで削除できること', () => {
  render(<FileContextBadge context={mockContext} onRemove={onRemove} />);
  const button = screen.getByRole('button');
  button.focus();
  fireEvent.keyDown(button, { key: 'Delete' });
  expect(onRemove).toHaveBeenCalled();
});
```

**期待される成果物**:

- 各コンポーネントのテストファイルに追加

---

### タスク4: 統合テスト拡充

**目的**: コンポーネント間連携の統合テストを拡充する

**実行手順**:

1. ドラッグ&ドロップ → バッジ表示 → 削除 のフロー
2. コマンド入力 → 生成結果表示 → 適用/却下 のフロー
3. 複数ファイルコンテキストの操作

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/integration.test.tsx` に追加

---

### タスク5: スナップショットテスト作成

**目的**: UIの意図しない変更を検出するためのスナップショットテストを作成する

**実行手順**:

1. 各コンポーネントの基本表示のスナップショット
2. 各コンポーネントの状態別スナップショット（ローディング、エラー等）

**期待される成果物**:

- 各コンポーネントのスナップショットファイル

---

## 参照資料

| 参照資料           | パス                                                                        | 内容                 |
| ------------------ | --------------------------------------------------------------------------- | -------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ目標       |
| 既存テストヘルパー | `apps/desktop/src/test/`                                                    | テストユーティリティ |

---

## 成果物

| 成果物           | パス                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- |
| 拡充テスト       | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/`               |
| スナップショット | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/__snapshots__/` |

---

## 統合テスト連携（Phase 1〜11は必須）

統合テストの拡充。

具体的なアクション:

- [ ] 全カテゴリ（機能テスト、異常系、アクセシビリティ、統合）のカバレッジ向上
- [ ] コンポーネント→Hooks連携のエッジケーステスト追加

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] アクセシビリティテストが追加されている
- [ ] 統合テストが拡充されている
- [ ] スナップショットテストが作成されている
- [ ] 全テストが成功する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/workspace-chat-edit-ui/phase-7-coverage-check.md`
