import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowList } from './WorkflowList';

describe('WorkflowList', () => {
  const mockWorkflows = [
    {
      id: 'wf-001',
      name: 'Test Workflow 1',
      status: 'active' as const,
      triggerPath: '/path/to/watch',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'wf-002',
      name: 'Test Workflow 2',
      status: 'inactive' as const,
      triggerPath: null,
      createdAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  describe('表示', () => {
    it('ワークフロー一覧を表示する', () => {
      render(<WorkflowList workflows={mockWorkflows} />);

      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
    });

    it('空の場合はメッセージを表示する', () => {
      render(<WorkflowList workflows={[]} />);

      expect(screen.getByText('ワークフローがありません')).toBeInTheDocument();
    });

    it('ローディング状態を表示する', () => {
      render(<WorkflowList workflows={[]} loading={true} />);

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('トリガーパスを表示する', () => {
      render(<WorkflowList workflows={mockWorkflows} />);

      expect(screen.getByText('/path/to/watch')).toBeInTheDocument();
    });
  });

  describe('インタラクション', () => {
    it('ステータス切り替えボタンをクリックできる', () => {
      const onToggleStatus = vi.fn();
      render(
        <WorkflowList
          workflows={mockWorkflows}
          onToggleStatus={onToggleStatus}
        />
      );

      const stopButton = screen.getByRole('button', { name: '停止' });
      fireEvent.click(stopButton);

      expect(onToggleStatus).toHaveBeenCalledWith('wf-001');
    });

    it('削除ボタンをクリックできる', () => {
      const onDelete = vi.fn();
      render(<WorkflowList workflows={mockWorkflows} onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith('wf-001');
    });
  });

  describe('ステータス表示', () => {
    it('アクティブなワークフローは停止ボタンを表示', () => {
      render(
        <WorkflowList
          workflows={[mockWorkflows[0]]}
          onToggleStatus={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '停止' })).toBeInTheDocument();
    });

    it('非アクティブなワークフローは開始ボタンを表示', () => {
      render(
        <WorkflowList
          workflows={[mockWorkflows[1]]}
          onToggleStatus={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '開始' })).toBeInTheDocument();
    });
  });
});
