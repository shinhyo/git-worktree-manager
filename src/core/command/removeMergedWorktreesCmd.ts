import * as vscode from 'vscode';
import { pickGitFolder } from '@/core/ui/pickGitFolder';
import { pickMergedWorktree } from '@/core/quickPick/pickMergedWorktree';
import { removeWorktrees } from '@/core/git/removeWorktrees';
import { IWorktreeLess } from '@/types';
import { Commands } from '@/constants';

export const removeMergedWorktreesCmd = async (item?: IWorktreeLess): Promise<void> => {
    const repoPath =
        item?.fsPath || (await pickGitFolder(vscode.l10n.t('Select Git repository to remove merged worktrees from')));
    if (!repoPath) return;

    const selectedCandidates = await pickMergedWorktree(repoPath, true);
    if (!selectedCandidates || !selectedCandidates.length) return;

    const worktreePaths = selectedCandidates.map((candidate) => candidate.fsPath);
    await removeWorktrees(worktreePaths, repoPath);
    await vscode.commands.executeCommand(Commands.refreshWorktree);
};

export const removeWorktreesCmd = async (item?: IWorktreeLess): Promise<void> => {
    const repoPath =
        item?.fsPath || (await pickGitFolder(vscode.l10n.t('Select Git repository to remove worktrees from')));
    if (!repoPath) return;

    const selectedCandidates = await pickMergedWorktree(repoPath, false);
    if (!selectedCandidates || !selectedCandidates.length) return;

    const worktreePaths = selectedCandidates.map((candidate) => candidate.fsPath);
    await removeWorktrees(worktreePaths, repoPath);
    await vscode.commands.executeCommand(Commands.refreshWorktree);
};
