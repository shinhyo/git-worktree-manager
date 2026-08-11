import * as vscode from 'vscode';
import { getMergedWorktreeCandidates, IMergedWorktreeCandidate } from '@/core/git/getMergedWorktreeCandidates';
import { withResolvers } from '@/core/util/promise';

interface IMergedWorktreePick extends vscode.QuickPickItem {
    fsPath: string;
    branch: string;
    isMerged: boolean;
    isMain: boolean;
    uriPath: string;
}

const createQuickPickItem = (candidate: IMergedWorktreeCandidate): IMergedWorktreePick => ({
    label: candidate.branch || vscode.l10n.t('Detached worktree'),
    detail: candidate.fsPath,
    description: candidate.isMerged ? vscode.l10n.t('Merged') : vscode.l10n.t('Not merged'),
    fsPath: candidate.fsPath,
    branch: candidate.branch,
    isMerged: candidate.isMerged,
    isMain: candidate.isMain,
    uriPath: candidate.uriPath,
    alwaysShow: true,
});

const selectAllMergedButton: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('check-all'),
    tooltip: vscode.l10n.t('Select all merged worktrees'),
};

export const pickMergedWorktree = async (
    repoPath: string,
    preselectMerged: boolean,
): Promise<IMergedWorktreeCandidate[] | void> => {
    const candidates = await getMergedWorktreeCandidates(repoPath);
    const items = candidates.map(createQuickPickItem).filter((item) => !item.isMain);
    const { resolve, promise } = withResolvers<IMergedWorktreeCandidate[] | void>();

    const quickPick = vscode.window.createQuickPick<IMergedWorktreePick>();
    quickPick.title = vscode.l10n.t('Select worktrees to remove');
    quickPick.canSelectMany = true;
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;
    quickPick.buttons = [selectAllMergedButton];
    quickPick.items = items;
    quickPick.selectedItems = preselectMerged ? items.filter((item) => item.isMerged) : [];

    const handleAccept = () => {
        const result = quickPick.selectedItems.map((item) => {
            const candidate = candidates.find((candidate) => candidate.fsPath === item.fsPath);
            return candidate as IMergedWorktreeCandidate;
        });
        resolve(result);
        quickPick.hide();
    };

    const handleHide = () => {
        resolve();
        quickPick.dispose();
    };

    const handleSelectAllMerged = (event: vscode.QuickInputButton) => {
        if (event === selectAllMergedButton) {
            quickPick.selectedItems = items.filter((item) => item.isMerged);
        }
    };

    quickPick.onDidAccept(handleAccept);
    quickPick.onDidHide(handleHide);
    quickPick.onDidTriggerButton(handleSelectAllMerged);
    quickPick.show();

    return promise;
};
