import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const STATE_FILE = path.join(os.tmpdir(), 'mcp-starter-template-state.json');

// Helper to run inspector CLI commands
function runInspector(args: string) {
    const projectRoot = process.cwd();
    const serverPath = path.join(projectRoot, 'dist', 'index.js');

    // Ensure the server is built
    const command = `npx @modelcontextprotocol/inspector --cli node ${serverPath} ${args}`;

    try {
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        // Find the start of the JSON output if there's any noise
        const jsonMatch = output.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return jsonMatch ? jsonMatch[0] : output;
    } catch (error: any) {
        if (error.stdout) return error.stdout;
        if (error.stderr) return error.stderr;
        throw error;
    }
}

describe('MCP Starter Template Integration (via Inspector CLI)', () => {
    beforeAll(() => {
        // Reset the dynamic state file to ensure deterministic tests
        if (fs.existsSync(STATE_FILE)) {
            fs.unlinkSync(STATE_FILE);
        }
    });

    afterAll(() => {
        // Clean up state file
        if (fs.existsSync(STATE_FILE)) {
            fs.unlinkSync(STATE_FILE);
        }
    });

    describe('Discovery', () => {
        it('should list available tools', () => {
            const output = runInspector('--method tools/list');
            const tools = JSON.parse(output).tools;
            const names = tools.map((t: any) => t.name);

            expect(names).toContain('echo');
            expect(names).toContain('fetch_url');
            expect(names).toContain('research_and_summarize');
            expect(names).toContain('long_running_task');
            expect(names).toContain('toggle_secret_tool');
        });

        it('should list available resources', () => {
            const output = runInspector('--method resources/list');
            const resources = JSON.parse(output).resources;
            const uris = resources.map((r: any) => r.uri);

            expect(uris).toContain('info://server');
            expect(uris).toContain('greeting://world');
            expect(uris).toContain('images://sample');
        });

        it('should list available prompts', () => {
            const output = runInspector('--method prompts/list');
            const prompts = JSON.parse(output).prompts;
            const names = prompts.map((p: any) => p.name);

            expect(names).toContain('architecture-consultant');
            expect(names).toContain('code-stylist');
            expect(names).toContain('logical-reasoner');
            expect(names).toContain('simple-summary');
        });
    });

    describe('Tool Execution', () => {
        it('should successfully call the echo tool', () => {
            const output = runInspector('--method tools/call --tool-name echo --tool-arg message="Testing 123"');
            expect(output).toContain('Testing 123');
        });

        it('should apply transformations in the echo tool', () => {
            const output = runInspector('--method tools/call --tool-name echo --tool-arg message="test" --tool-arg transform="uppercase"');
            expect(output).toContain('TEST');
        });

        it('should handle the long_running_task tool', () => {
            const output = runInspector('--method tools/call --tool-name long_running_task --tool-arg steps=1');
            expect(output).toContain('Successfully completed 1 steps');
        });

        it('should dynamically enable and disable the secret tool', () => {
            // 1. Initially disabled, tool/list should not contain it
            let listOutput = runInspector('--method tools/list');
            let tools = JSON.parse(listOutput).tools;
            expect(tools.map((t: any) => t.name)).not.toContain('secret_access');

            // 2. Enable it
            runInspector('--method tools/call --tool-name toggle_secret_tool --tool-arg enabled=true');

            // 3. Should now be listed
            listOutput = runInspector('--method tools/list');
            tools = JSON.parse(listOutput).tools;
            expect(tools.map((t: any) => t.name)).toContain('secret_access');

            // 4. Call it
            const callOutput = runInspector('--method tools/call --tool-name secret_access');
            expect(callOutput).toContain('secret chamber');

            // 5. Disable it again
            runInspector('--method tools/call --tool-name toggle_secret_tool --tool-arg enabled=false');
            listOutput = runInspector('--method tools/list');
            tools = JSON.parse(listOutput).tools;
            expect(tools.map((t: any) => t.name)).not.toContain('secret_access');
        }, 15000); // Increased timeout for multiple CLI calls

        it('should correctly return multi-message prompts (few-shotting)', () => {
            const output = runInspector('--method prompts/get --prompt-name code-stylist --prompt-arg code="let y = 1;" --prompt-arg language="typescript"');
            const response = JSON.parse(output);
            const messages = response.messages;

            expect(messages).toHaveLength(3);
            expect(messages[0].role).toBe('user');
            expect(messages[1].role).toBe('assistant');
            expect(messages[2].role).toBe('user');
            expect(messages[2].content.text).toContain('let y = 1;');
        });
    });

    describe('Resource Templates', () => {
        it('should be able to resolve the greeting template', () => {
            const output = runInspector('--method resources/list');
            expect(output).toContain('greeting://');
        });
    });
});
