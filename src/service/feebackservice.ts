import * as vscode from "vscode";
import { CommandResult } from "../model/navigatiorcommand";
import { ConfigUtil } from "../util/configutil";
import { wait } from "../util/frequent";
import { UserConfig } from "../util/userconfig";
import { StatusBarService } from "./statusbar";

export enum FeedBackType {
    INFO = "INFO",
    WARN = "WARN",
    NEUTRAL = "NEUTRAL",
    ERROR = "ERROR",
    SUCCESS = "SUCCESS"
}

const FeedbackTypeImpl: { [key: string]: any } = {
    INFO: {
        statusBar: {
            foreground: "#FFFFFF"
        },
        colorCustomizations: [
            ["statusBar.foreground", '#000000'],
            ["statusBar.background", '#A682FF']
        ]
    },
    WARN: {
        statusBar: {
            foreground: "#000000"
        },
        colorCustomizations: [
            ["statusBar.foreground", '#FFFFFF'],
            ["statusBar.background", '#FBAF00']
        ]
    },
    ERROR: {
        statusBar: {
            foreground: "#FFFFFF"
        },
        colorCustomizations: [
            ["statusBar.foreground", '#000000'],
            ["statusBar.background", '#E71D36']
        ]
    },
    SUCCESS: {
        statusBar: {
            foreground: "#FFFFFF"
        },
        colorCustomizations: [
            ["statusBar.foreground", '#000000'],
            ["statusBar.background", '#00AF54']
        ]
    },
}

export class FeedbackService {
    private statusBarService: StatusBarService;
    private isAnimating: boolean = false;

    constructor(statusBarService: StatusBarService) {
        this.statusBarService = statusBarService;
    }

    public async initiateFeedbackFromResult(result: CommandResult | undefined, ignoreSticky: boolean = false) {
        if (result === undefined)
            return;

        if (result.isError)
            return await this.initiateFeedback(result.message, FeedBackType.ERROR, result, ignoreSticky);

        if (result.message === 'Success')
            return await this.initiateFeedback(result.message, FeedBackType.SUCCESS, result, ignoreSticky);

        return await this.initiateFeedback(result.message, FeedBackType.INFO, result, ignoreSticky);
    }

    public async initiateFeedback(msg: string, type: FeedBackType, result: CommandResult, ignoreSticky: boolean = false) {
        const fbType = FeedbackTypeImpl[type];

        if (UserConfig.feedbackOnErrorOnly && type !== FeedBackType.ERROR) return;

        switch (UserConfig.feedbackStyle) {
            case 'statusbar':
                if (this.isAnimating) return;

                const colorCustomizations = new Map<String, String>(fbType.colorCustomizations)

                this.isAnimating = true;
                await ConfigUtil.updateColors(colorCustomizations);
                if (!ConfigUtil.isCurrentFileDirtySettingsFile())
                    this.statusBarService.setColor(fbType.statusBar.foreground);
                else this.statusBarService.setColor('#FF0000')

                this.statusBarService.setTooltip(msg);

                if (result?.isError && UserConfig.stickyErrors && !ignoreSticky) return;

                await wait(350);

                await ConfigUtil.resetColors();
                this.statusBarService.setColor(undefined);
                this.isAnimating = false;
                return;
            case 'notification':
                return await vscode.window.showInformationMessage(`Navigator > ${msg ?? "Error"}`);
            default:
                return;
        }
    }

    public async clear() {
        if (!vscode.workspace.workspaceFolders) return;

        await ConfigUtil.resetColors();
        this.statusBarService.setColor(undefined);
    }

}