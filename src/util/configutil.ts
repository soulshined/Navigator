import * as vscode from "vscode";

export class ConfigUtil {

    private static _defaults: Map<String, any> = ConfigUtil.getColorCustomizations();

    private static getColorCustomizations(): Map<String, String> {

        const map = new Map;
        const inspect = vscode.workspace.getConfiguration().inspect("workbench.colorCustomizations");

        if (!inspect) return map;

        const colorCustomizations = inspect.workspaceValue;

        if (!colorCustomizations || typeof colorCustomizations !== 'object')
            return map;

        const configs = colorCustomizations as { [key: string]: string };
        if (!configs) return map;

        for (const key in configs) {
            if (Object.prototype.hasOwnProperty.call(configs, key)) {
                map.set(key, configs[key]);
            }
        }

        return map;
    }

    public static async updateColors(kvps: Map<String, String>) {
        const colors = this.getColorCustomizations();

        for await (let [key, value] of kvps)
            colors.set(key, value);

        return await this.updateConfigs(Object.fromEntries(colors));
    }

    public static async resetColors() {
        const colors = this.getColorCustomizations();

        for await (const scope of ['statusBar.background', 'statusBar.foreground']) {
            const _default = this._defaults.get(scope);
            if (!_default) colors.delete(scope);
            else colors.set(scope, _default);
        }

        await this.updateConfigs(Object.fromEntries(colors));
    }

    public static isCurrentFileDirtySettingsFile(): boolean {
        const doc = vscode.window.activeTextEditor?.document;
        if (!doc) return false;

        return doc.uri.scheme === 'file' && doc.uri.path.endsWith('/.vscode/settings.json') && doc.isDirty;
    }

    private static async updateConfigs(configs: object) {
        if (!vscode.workspace.workspaceFolders || this.isCurrentFileDirtySettingsFile()) return;

        return await vscode.workspace.getConfiguration().update("workbench.colorCustomizations", configs, vscode.ConfigurationTarget.Workspace);
    }

}