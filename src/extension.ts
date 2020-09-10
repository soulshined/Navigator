'use strict';

import { isObject } from 'util';
import * as vscode from 'vscode';
import { Navigator } from './controller/navigator';
import { NavigatorCommandValueType } from './model/navigatiorcommand';
import { Commands } from './util/constants';
import { EditorUtil } from './util/editorutil';
import { SequenceConfig, UserConfig } from './util/userconfig';

export function activate(context: vscode.ExtensionContext) {

    console.log('Navigator is now active!');

    function registerCommand(commandId: string, run: (...args: any[]) => void): void {
        context.subscriptions.push(vscode.commands.registerCommand(commandId, run));
    }

    function registerTextEditorCommand(commandId: string, run: (...args: any[]) => void): void {
        context.subscriptions.push(vscode.commands.registerTextEditorCommand(commandId, run));
    }

    const navigator = new Navigator;
    //banned navigator commands for sequences
    const bannedNavigatorCommandsForSequences = [
        "navigator.activate",
        "navigator.cancel",
        "navigator.copy",
        "navigator.backspace",
        "navigator.consume",
        "navigator.pick-history-item",
        "navigator.sequence1",
        "navigator.sequence2",
        "navigator.commandhistory",
        "navigator.accept"
    ]

    context.subscriptions.push(
        vscode.window.onDidChangeVisibleTextEditors(() => {
            if (UserConfig.deactivateNavigatorOnEditorChangeEvent) navigator.clear()
        }),
    );

    //region top-level actions
    registerCommand('navigator.cancel', async () => await navigator.clear());
    registerCommand('navigator.activate', () => navigator.activate());
    registerCommand('navigator.backspace', () => navigator.undo());
    registerCommand('navigator.copy', async () => {
        if (navigator.getCommandValue().length > 0)
            await vscode.env.clipboard.writeText(navigator.getCommandValue());
    });
    registerCommand('navigator.repeat', () => navigator.doHistory(0));
    registerCommand('navigator.consume', () => { });
    registerTextEditorCommand('navigator.accept', async () => {
        if (navigator.isActive)
            await navigator.doCommand();
        else
            await navigator.clear();
    })

    registerTextEditorCommand('navigator.select-accept', async () => {
        if (navigator.isActive)
            await navigator.doCommand({ select: true });
        else
            await navigator.clear();
    })

    registerCommand('type', async function (args) {
        if (navigator.isActive) await navigator.listen(args.text);
        else {
            await navigator.clear();
            await vscode.commands.executeCommand('default:type', {
                text: args.text
            });
        }
    });
    //endregion top-level actions

    //region command palette commands
    registerCommand('navigator.pick-history-item', async () => {
        const historyItems = navigator.getHistory().filter(item => item.command.valueType !== NavigatorCommandValueType.NONE).map(item => `[${item.command}${item.isCaseSensitive ? '' : ' i'}] > ${item.value}`);

        historyItems.splice(20);

        const placeholder = historyItems.length > 0 ? "Navigator History Item" : "No history";

        const result = await vscode.window.showQuickPick(historyItems, {
            placeHolder: placeholder,
            canPickMany: false,
        })

        const index = historyItems.findIndex(value => value === result);
        await navigator.doHistory(index);
    })

    registerCommand('navigator.sequence1', async () => {
        const sequences = UserConfig.getSequenceConfig(1);
        if (!sequences || sequences.length === 0) return;
        executeSequences(sequences);
    })

    registerCommand('navigator.sequence2', async () => {
        const sequences = UserConfig.getSequenceConfig(2);
        if (!sequences || sequences.length === 0) return;
        executeSequences(sequences);
    })

    function executeSequences(sequences: SequenceConfig[]) {
        sequences.forEach(async (seq: SequenceConfig | string) => {
            if (isObject(seq)) {
                seq = seq as SequenceConfig;
                if (!bannedNavigatorCommandsForSequences.includes(seq.commandId.toLowerCase())) {
                    const args = seq.args;
                    args["isSequenceExecuted"] = true;
                    await vscode.commands.executeCommand(seq.commandId, seq.args);
                }
            }
            else {
                if (!bannedNavigatorCommandsForSequences.includes((seq as string).toLowerCase())) {
                    await vscode.commands.executeCommand(seq as string);
                }
            }
        });
    }
    //end region command palette commands

    //region commands
    registerCommand('navigator.commandhistory', (args) => navigator.scrollHistory(args.target));
    registerCommand('navigator.toggle-search-case-sensitivity', () => navigator.toggleCaseSensitivity())
    registerCommand('navigator.search', async (args) => await navigator.setActiveCommand(Commands.SEARCH.DESCRIPTION, args));
    registerCommand('navigator.reverse-search', async (args) => {
        await navigator.setActiveCommand(Commands.REVERSE_SEARCH.DESCRIPTION, args)
    });
    registerCommand('navigator.jumplines', async (args) => await navigator.setActiveCommand(Commands.JUMP_LINES.DESCRIPTION, args));
    registerCommand('navigator.pattern-search', async (args) => await navigator.setActiveCommand(Commands.PATTERN_SEARCH.DESCRIPTION, args));
    registerCommand('navigator.reverse-pattern-search', async (args) => await navigator.setActiveCommand(Commands.REVERSE_PATTERN_SEARCH.DESCRIPTION, args));
    registerCommand('navigator.jump-to-next-cursor-match', async () => {
        navigator.setActiveCommand(Commands.JUMP_TO_NEXT_CURSOR_MATCH.DESCRIPTION);
        await navigator.doCommand();
    })
    registerCommand('navigator.jump-to-reverse-cursor-match', async () => {
        navigator.setActiveCommand(Commands.JUMP_TO_REVERSE_CURSOR_MATCH.DESCRIPTION);
        await navigator.doCommand();
    })
    registerCommand('navigator.end-of-line-char', async (args) => {
        if (args && args.isSequenceExecuted && args.value && args.value.length > 1)
            args.value = args.value.charAt(0);

        await navigator.setActiveCommand(Commands.JUMP_TO_LINE_LAST_CHAR_OCCURRENCE.DESCRIPTION, args)
    });
    registerCommand('navigator.start-of-line-char', async (args) => {
        if (args && args.isSequenceExecuted && args.value && args.value.length > 1)
            args.value = args.value.charAt(0);

        await navigator.setActiveCommand(Commands.JUMP_TO_LINE_FIRST_CHAR_OCCURRENCE.DESCRIPTION, args)
    });
    registerCommand('navigator.nth-line-char', async (args) => await navigator.setActiveCommand(Commands.JUMP_TO_LINE_N_CHAR.DESCRIPTION, args));

    registerCommand('navigator.jump-to-next-symbol', async () => {
        const pos = EditorUtil.getCurrentPosition();
        if (!EditorUtil.activeEditor || pos === undefined) return;

        const symbols: vscode.DocumentSymbol[] = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", EditorUtil.activeEditor.document.uri) || [];
        symbols.push(...symbols.flatMap(symbol => symbol.children));
        symbols.sort((a, b) => a.selectionRange.start.line - b.selectionRange.start.line);

        const next = symbols.filter(symbol => UserConfig.allowableSymbols.includes(symbol.kind)).find(symbol => symbol.selectionRange.start.line > pos.line);

        if (!next) return;

        await EditorUtil.setSelectionAndRevealCenter(next.selectionRange.start);
    })
    registerCommand('navigator.jump-to-previous-symbol', async () => {
        const pos = EditorUtil.getCurrentPosition();
        if (!EditorUtil.activeEditor || pos === undefined) return;

        const symbols: vscode.DocumentSymbol[] = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", EditorUtil.activeEditor.document.uri) || [];
        symbols.push(...symbols.flatMap(symbol => symbol.children));
        symbols.sort((a, b) => a.selectionRange.start.line - b.selectionRange.start.line);

        const prev = symbols.filter(symbol => UserConfig.allowableSymbols.includes(symbol.kind)).reverse().find(symbol => symbol.selectionRange.start.line < pos.line);

        if (!prev) return;

        await EditorUtil.setSelectionAndRevealCenter(prev.selectionRange.start);
    })
    registerCommand('navigator.center-screen-on-cursor', async () => {
        const pos = EditorUtil.getCurrentPosition();
        if (!EditorUtil.activeEditor || pos === undefined) return;

        await EditorUtil.revealLineAtCenter(pos.line);
        await navigator.clear();
    })
    registerCommand('navigator.jump-to-previous-paragraph', async () => {
        await navigator.setActiveCommand(Commands.JUMP_TO_PREVIOUS_PARAGRAPH.DESCRIPTION);
        await navigator.doCommand();
    })
    registerCommand('navigator.select-jump-to-previous-paragraph', async () => {
        await navigator.setActiveCommand(Commands.JUMP_TO_PREVIOUS_PARAGRAPH.DESCRIPTION);
        await navigator.doCommand({ select: true });
    })
    registerCommand('navigator.jump-to-next-paragraph', async () => {
        await navigator.setActiveCommand(Commands.JUMP_TO_NEXT_PARAGRAPH.DESCRIPTION);
        await navigator.doCommand();
    })
    registerCommand('navigator.select-jump-to-next-paragraph', async () => {
        await navigator.setActiveCommand(Commands.JUMP_TO_NEXT_PARAGRAPH.DESCRIPTION);
        await navigator.doCommand({ select: true });
    })
    //endregion commands
}

// this method is called when your extension is deactivated
export function deactivate() { }