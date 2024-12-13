import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    XschemEditorProvider.register(context);
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export class XschemEditorProvider implements vscode.CustomReadonlyEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new XschemEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(XschemEditorProvider.viewType, 
			provider, {
				supportsMultipleEditorsPerDocument: true,
				webviewOptions: {
					retainContextWhenHidden: true
				}
			});
		const runCmd = vscode.commands.registerCommand('xschem.runSimulation', () => {
			console.log(provider.activeSchematic);
			if (provider.activeSchematic) {
				exec(`xschem -x -n -S -q ${provider.activeSchematic.uri.fsPath}`, (error, stdout, stderr) => {});
			}
			});
		const editCmd = vscode.commands.registerCommand('xschem.editSchematic', () => {
			console.log(provider.activeSchematic);
			if (provider.activeSchematic) {
				exec(`xschem ${provider.activeSchematic.uri.fsPath}`, (error, stdout, stderr) => {});
			}
			});			
		context.subscriptions.push(providerRegistration);
		context.subscriptions.push(runCmd);
		context.subscriptions.push(editCmd);
		return providerRegistration;
	}

	private static readonly viewType = 'xschem.viewXschem';
	private activeSchematic: vscode.CustomDocument | undefined;

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	public async openCustomDocument(uri: vscode.Uri) {
		return { uri, dispose: () => { } };
	}


	public async resolveCustomEditor(
		document: vscode.CustomDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'assets'), vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'xschem_lib'),
			vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tcl'), vscode.Uri.joinPath(document.uri, '..')]
		};
		this.activeSchematic = document;
		webviewPanel.onDidChangeViewState((e) => {
			if (e.webviewPanel.active) {
			this.activeSchematic = document;
			}
		});

		webviewPanel.onDidDispose(() => {
			if (this.activeSchematic?.uri.toString() === document.uri.toString()) {
				this.activeSchematic = undefined;
			}
		});		
		webviewPanel.webview.html = await this.getHtmlForWebview(document, webviewPanel.webview);
	}

	private async getHtmlForWebview(document: vscode.CustomDocument, webview: vscode.Webview): Promise<string> {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'dist', 'assets', 'index.js'));

		const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'dist', 'assets', 'index.css'));

		const nonce = getNonce();

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src ${webview.cspSource}; 
				img-src ${webview.cspSource} blob:; style-src ${webview.cspSource}; script-src ${webview.cspSource} 'nonce-${nonce}' 'unsafe-eval';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
    			<title>Xschem Viewer Online</title>
				<base href="${webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist'))}/">
				<script nonce="${nonce}">
				const targetUrl = new URL(window.location.href);
    			targetUrl.searchParams.set('file', "${webview.asWebviewUri(document.uri)}");
    			window.history.pushState(null, '', targetUrl.toString());
				</script>
				<script type="module" crossorigin src="${scriptUri}"></script>
    			<link rel="stylesheet" crossorigin href="${cssUri}">
			</head>
			<body>
			<div id="root"></div>
			<footer hidden></footer>
			</body>
			</html>`;
	}

}