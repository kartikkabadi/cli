import { describe, expect, it } from 'bun:test';
import { CLIError } from '../../src/errors/base';
import { ExitCode } from '../../src/errors/codes';
import { browserCommand } from '../../src/auth/browser';

describe('OAuth browser launch', () => {
  it('passes a hostile URL as data without a Windows command interpreter', () => {
    const url = 'https://example.com/verify?code=a&echo=owned%25PATH%25';
    expect(browserCommand(url, 'win32')).toEqual([
      'rundll32.exe', ['url.dll,FileProtocolHandler', url],
    ]);
  });

  it('rejects executable and local URL schemes before launching', () => {
    for (const url of ['not a URL', 'javascript:alert(1)', 'file:///C:/Windows/cmd.exe', 'ms-appinstaller:bad', 'http://example.com']) {
      try {
        browserCommand(url, 'win32');
        throw new Error('Expected URL rejection');
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        expect((error as CLIError).exitCode).toBe(ExitCode.AUTH);
      }
    }
  });

  it('keeps macOS and Linux URLs in a single argument', () => {
    const url = 'https://example.com/?a=1&b=2';
    expect(browserCommand(url, 'darwin')).toEqual(['open', [url]]);
    expect(browserCommand(url, 'linux')).toEqual(['xdg-open', [url]]);
  });
});
