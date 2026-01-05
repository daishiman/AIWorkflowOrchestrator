# FileSelector アクセシビリティ改善 - タスク指示書

## メタ情報

| 項目             | 内容                               |
| ---------------- | ---------------------------------- |
| タスクID         | TASK-A11Y-001                      |
| タスク名         | FileSelector WCAG 2.1 AA 準拠改善  |
| 分類             | 改善                               |
| 対象機能         | FileSelector コンポーネント        |
| 優先度           | 高                                 |
| 見積もり規模     | 中規模                             |
| ステータス       | 未実施                             |
| 発見元           | Phase 7-2 アクセシビリティレビュー |
| 発見日           | 2024-12-17                         |
| 発見エージェント | .claude/agents/ui-designer.md                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

FileSelectorコンポーネント（FileSelectorTrigger, FileSelectorModal, FileSelectorFileList）のWCAG 2.1 AA準拠レビューを実施した結果、複数のアクセシビリティ違反が発見された。

### 1.2 問題点・課題

| No. | 重要度   | WCAG基準 | ファイル                 | 問題                                   |
| --- | -------- | -------- | ------------------------ | -------------------------------------- |
| 1   | MAJOR    | 2.4.3    | FileSelectorModal.tsx    | モーダル表示時にフォーカスが移動しない |
| 2   | MAJOR    | 2.4.3    | FileSelectorModal.tsx    | モーダル閉じた後にフォーカスが戻らない |
| 3   | MAJOR    | 4.1.2    | FileSelectorTrigger.tsx  | aria-expanded未設定                    |
| 4   | MAJOR    | 4.1.2    | FileSelectorFileList.tsx | aria-selected未設定                    |
| 5   | MODERATE | 1.3.1    | FileSelectorFileList.tsx | role="listbox"と"option"がない         |
| 6   | MODERATE | 4.1.2    | FileSelectorTrigger.tsx  | aria-label未設定                       |
| 7   | MINOR    | 4.1.3    | FileSelectorFileList.tsx | 選択時のaria-live通知がない            |
| 8   | MINOR    | 1.4.11   | 全ファイル               | カスタムカラーのコントラスト比未検証   |

### 1.3 放置した場合の影響

- スクリーンリーダーユーザーがFileSelectorを正しく操作できない
- キーボードユーザーがモーダル操作でフォーカスを見失う
- WCAG 2.1 AA準拠が達成できず、アクセシビリティ要件を満たさない
- 法的リスク（一部の国・地域ではアクセシビリティ対応が法的義務）

---

## 2. 何を達成するか（What）

### 2.1 目的

FileSelectorコンポーネントをWCAG 2.1 AA準拠にすることで、すべてのユーザーが問題なく利用できるようにする。

### 2.2 最終ゴール

- フォーカストラップが正しく機能する
- スクリーンリーダーで適切に読み上げられる
- キーボードのみで完全に操作可能
- WCAG 2.1 AA準拠を達成

### 2.3 スコープ

#### 含むもの

- FileSelectorTrigger.tsx のaria属性追加
- FileSelectorModal.tsx のフォーカストラップ実装
- FileSelectorFileList.tsx のrole/aria属性追加
- aria-live通知の実装

#### 含まないもの

- カラーテーマ全体の変更
- 他コンポーネントのアクセシビリティ対応
- WCAG AAA準拠

### 2.4 成果物

| 種別   | 成果物                           | 配置先                                                                  |
| ------ | -------------------------------- | ----------------------------------------------------------------------- |
| コード | FileSelectorTrigger.tsx（修正）  | apps/desktop/src/renderer/components/organisms/FileSelector/            |
| コード | FileSelectorModal.tsx（修正）    | apps/desktop/src/renderer/components/organisms/FileSelector/            |
| コード | FileSelectorFileList.tsx（修正） | apps/desktop/src/renderer/components/organisms/FileSelector/            |
| テスト | アクセシビリティテスト           | apps/desktop/src/renderer/components/organisms/FileSelector/\*.test.tsx |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- FileSelectorコンポーネントが実装済み
- EditorViewとの統合が完了
- 既存のユニットテストがパスしている

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識・スキル

- WCAG 2.1 AA ガイドライン
- React アクセシビリティパターン
- aria属性の正しい使用法
- フォーカストラップの実装パターン

### 3.4 推奨アプローチ

1. フォーカストラップを最優先で実装（MAJOR問題）
2. aria属性を段階的に追加
3. 各修正後にスクリーンリーダーでテスト
4. 自動化テストを追加

---

## 4. 実行手順

### Phase構成

```
Phase 3: テスト作成 (TDD: Red)
  → T-03-1: アクセシビリティテスト作成
Phase 4: 実装 (TDD: Green)
  → T-04-1: フォーカストラップ実装
  → T-04-2: aria属性追加
  → T-04-3: aria-live通知実装
Phase 5: リファクタリング
  → T-05-1: コード品質改善
Phase 6: 品質保証
  → T-06-1: テスト実行・検証
```

### T-03-1: アクセシビリティテスト作成

#### 目的

WCAG 2.1 AA準拠を検証するテストを作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/renderer/components/organisms/FileSelector/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: アクセシビリティテストの専門知識を持つ
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名           | 活用方法                 |
| ------------------ | ------------------------ |
| .claude/skills/accessibility-wcag/SKILL.md | WCAG準拠テストケース設計 |
| .claude/skills/test-doubles/SKILL.md       | モック作成               |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物         | パス                                                                               | 内容                   |
| -------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| テストファイル | apps/desktop/src/renderer/components/organisms/FileSelector/accessibility.test.tsx | アクセシビリティテスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run -- accessibility.test.tsx
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] フォーカストラップテスト作成
- [ ] aria属性テスト作成
- [ ] キーボードナビゲーションテスト作成
- [ ] テストがRed状態で失敗

---

### T-04-1: フォーカストラップ実装

#### 目的

モーダル表示時のフォーカス管理を実装する。

#### Claude Code スラッシュコマンド

```
/ai:create-custom-hook useFocusTrap
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: アクセシビリティUI実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名              | 活用方法               |
| --------------------- | ---------------------- |
| .claude/skills/accessibility-wcag/SKILL.md    | WCAG 2.4.3準拠実装     |
| .claude/skills/custom-hooks-patterns/SKILL.md | フォーカストラップhook |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                                            | 内容                   |
| ------------ | ----------------------------------------------- | ---------------------- |
| Hook         | apps/desktop/src/renderer/hooks/useFocusTrap.ts | フォーカストラップhook |
| 修正ファイル | FileSelectorModal.tsx                           | hook適用               |

#### 実装内容

```typescript
// useFocusTrap.ts
export function useFocusTrap(
  modalRef: RefObject<HTMLElement>,
  isOpen: boolean,
) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // フォーカスをモーダル内に移動
    } else {
      // フォーカスを元の要素に戻す
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Tabキーでのフォーカス循環処理
}
```

#### 完了条件

- [ ] モーダル表示時にフォーカスがモーダル内に移動
- [ ] Tabキーでフォーカスがモーダル内で循環
- [ ] モーダル閉じた後にフォーカスが元の位置に戻る
- [ ] テストがGreen状態で成功

---

### T-04-2: aria属性追加

#### 目的

適切なaria属性を追加してスクリーンリーダー対応を改善する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/FileSelector/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: aria属性の正しい使用法を熟知
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

| 成果物       | パス                     | 内容                                             |
| ------------ | ------------------------ | ------------------------------------------------ |
| 修正ファイル | FileSelectorTrigger.tsx  | aria-expanded, aria-haspopup, aria-label追加     |
| 修正ファイル | FileSelectorModal.tsx    | role="dialog", aria-modal, aria-labelledby追加   |
| 修正ファイル | FileSelectorFileList.tsx | role="listbox", role="option", aria-selected追加 |

#### 実装内容

**FileSelectorTrigger.tsx**:

```tsx
<button
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  aria-label={selectedFileName
    ? `選択中: ${selectedFileName}。クリックしてファイルを変更`
    : 'ファイルを選択'
  }
  // ...
>
```

**FileSelectorModal.tsx**:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="file-selector-title"
  aria-describedby="file-selector-description"
>
  <h2 id="file-selector-title">ファイルを選択</h2>
  <p id="file-selector-description" className="sr-only">
    上下矢印キーでファイルを選択し、Enterキーで決定します。
  </p>
```

**FileSelectorFileList.tsx**:

```tsx
<ul role="listbox" aria-label="ファイル一覧">
  {files.map((file, index) => (
    <li
      role="option"
      aria-selected={file === selectedFile}
      // ...
    >
```

#### 完了条件

- [ ] FileSelectorTriggerにaria-expanded, aria-haspopup, aria-label追加
- [ ] FileSelectorModalにrole="dialog", aria-modal, aria-labelledby追加
- [ ] FileSelectorFileListにrole="listbox", role="option", aria-selected追加
- [ ] テストがGreen状態で成功

---

### T-04-3: aria-live通知実装

#### 目的

選択時の状態変化をスクリーンリーダーに通知する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorFileList.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: aria-live実装パターンを熟知
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

| 成果物       | パス                     | 内容              |
| ------------ | ------------------------ | ----------------- |
| 修正ファイル | FileSelectorFileList.tsx | aria-live領域追加 |

#### 実装内容

```tsx
const [announcement, setAnnouncement] = useState("");

// 選択時
const handleSelect = (file: string) => {
  setAnnouncement(`${file}を選択しました`);
  onSelectFile(file);
};

return (
  <>
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
    <ul role="listbox">{/* ... */}</ul>
  </>
);
```

#### 完了条件

- [ ] aria-live領域が追加されている
- [ ] 選択時に適切なアナウンスが行われる
- [ ] テストがGreen状態で成功

---

### T-05-1: コード品質改善

#### 目的

実装されたアクセシビリティコードの品質を改善する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/FileSelector/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: コード品質改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 重複コードの排除
- [ ] 命名の一貫性確保
- [ ] コメントの適切な追加
- [ ] テストが継続してGreen状態

---

### T-06-1: テスト実行・検証

#### 目的

すべてのテストが成功し、アクセシビリティ要件を満たすことを確認する。

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md, .claude/agents/e2e-tester.md
- **選定理由**: テスト実行と品質確認の専門エージェント
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 全ユニットテスト成功
- [ ] カバレッジ80%以上維持
- [ ] VoiceOver/NVDAでの手動テスト完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] フォーカストラップが正しく機能する
- [ ] aria属性が正しく設定されている
- [ ] キーボードナビゲーションが完全に機能する
- [ ] スクリーンリーダーで適切に読み上げられる

### 品質要件

- [ ] 全テストがパス
- [ ] カバレッジ80%以上
- [ ] Lintエラーなし
- [ ] 型エラーなし

### ドキュメント要件

- [ ] コンポーネントドキュメント更新
- [ ] アクセシビリティガイドライン追記

---

## 6. 検証方法

### テストケース

1. **フォーカストラップ**: モーダル内でTabキーを繰り返し押し、フォーカスが循環することを確認
2. **フォーカス復帰**: モーダルを閉じた後、元の要素にフォーカスが戻ることを確認
3. **スクリーンリーダー**: VoiceOverでファイル選択操作を行い、適切に読み上げられることを確認

### 検証手順

1. `pnpm --filter @repo/desktop test:run` でユニットテスト実行
2. `pnpm --filter @repo/desktop dev` でアプリ起動
3. VoiceOver（macOS）またはNVDA（Windows）でテスト
4. キーボードのみで全操作を完了できることを確認

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                           |
| -------------------------------------------- | ------ | -------- | ------------------------------ |
| フォーカストラップが他のコンポーネントに影響 | 中     | 低       | hook化して分離、十分なテスト   |
| 既存UIが崩れる                               | 中     | 低       | ビジュアルリグレッションテスト |
| パフォーマンス低下                           | 低     | 低       | useCallbackで最適化            |

---

## 8. 参照情報

### 関連ドキュメント

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- `docs/00-requirements/16-ui-ux-guidelines.md`

### 参考資料

- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Headless UI - Dialog](https://headlessui.com/react/dialog)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
判定: MAJOR

複数のWCAG違反があり、スクリーンリーダーユーザーやキーボードユーザーの
利用に支障をきたす可能性があります。

主な指摘:
1. フォーカストラップ未実装 (WCAG 2.4.3)
2. aria-expanded/aria-selected未設定 (WCAG 4.1.2)
3. role属性不足 (WCAG 1.3.1)
```

### 補足事項

- VoiceOver（macOS）でのテストを推奨
- Kanagawa Dragonテーマでのコントラスト比も検証すること
