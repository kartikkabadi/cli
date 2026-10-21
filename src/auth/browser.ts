import { execFile } from 'child_process';
import { CLIError } from '../errors/base';
import { ExitCode } from '../errors/codes';

export function browserCommand(input: string, platform: NodeJS.Platform): [string, string[]] {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new CLIError('Invalid OAuth verification URL.', ExitCode.AUTH);
  }
  if (url.protocol !== 'https:') {
    throw new CLIError('OAuth verification URL must use HTTPS.', ExitCode.AUTH);
  }
  if (platform === 'win32') {
    return ['rundll32.exe', ['url.dll,FileProtocolHandler', url.href]];
  }
  return [platform === 'darwin' ? 'open' : 'xdg-open', [url.href]];
}

export function openBrowser(url: string): void {
  const [command, args] = browserCommand(url, process.platform);
  execFile(command, args, () => {
    // The login flow also prints the verification URL for manual opening.
  });
}
