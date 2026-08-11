import * as vscode from 'vscode';
import { removeWorktree } from '@/core/git/removeWorktree';
import { preRemoveWorktree } from '@/core/hooks/preRemoveWorktree';
import { Alert } from '@/core/ui/message';
import { actionProgressWrapper } from '@/core/ui/progress';

export interface IRemoveWorktreesResult {
    success: string[];
    failed: Array<{ path: string; error: string }>;
}

export async function removeWorktrees(paths: string[], repoPath: string): Promise<IRemoveWorktreesResult> {
    const result: IRemoveWorktreesResult = { success: [], failed: [] };
    for (const worktreePath of paths) {
        try {
            await preRemoveWorktree({ worktreePath, basePath: repoPath });
            await removeWorktree(worktreePath, false, repoPath);
            result.success.push(worktreePath);
        } catch (error) {
            result.failed.push({ path: worktreePath, error: String(error) });
        }
    }

    actionProgressWrapper(
        vscode.l10n.t('Removing selected worktrees from {0}', repoPath),
        async () => Promise.resolve(),
        () => {},
    );

    if (result.failed.length) {
        Alert.showErrorMessage(vscode.l10n.t('Failed to remove worktree(s)'), {
            modal: true,
            detail: result.failed.map((item) => item.error.trim()).join('\n'),
        });
    }

    return result;
}
