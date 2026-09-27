import { Option, program } from 'commander';
import { readFile } from 'fs/promises';
import open from 'open';
import { basename, extname } from 'path';
import { readPackageUp } from 'read-package-up';
import updateNotifier from 'update-notifier';
import { fileURLToPath } from 'url';
import { createMarkmap } from '.';
import { develop } from './util/dev-server';

const MERMAID_EXTENSIONS = new Set(['.mmd', '.mermaid']);

async function main() {
  const pkg = (
    await readPackageUp({
      cwd: fileURLToPath(import.meta.url),
    })
  )?.packageJson;
  if (!pkg) throw new Error('Invalid package');

  const notifier = updateNotifier({ pkg });
  notifier.notify();

  program
    .version(pkg.version)
    .description('Create a markmap from a Markdown input file')
    .arguments('<input>')
    .option('--no-open', 'Do not open the output file after generation')
    .option('--no-toolbar', 'Do not show toolbar')
    .option('-o, --output <output>', 'Specify the filename of the output HTML')
    .option(
      '--offline',
      'Inline all assets to allow the generated HTML to work offline',
    )
    .option(
      '-w, --watch',
      'Watch the input file and update output on the fly, note that this feature is for development only',
    )
    .option('--port <port>', 'Set the port for the devServer to listen')
    .option(
      '--mermaid [file]',
      'Also generate a Mermaid syntax file (defaults to <input>.mmd)',
    )
    .addOption(
      new Option(
        '--mermaid-type <type>',
        'Mermaid syntax to generate with --mermaid',
      )
        .choices(['mindmap', 'graph'])
        .default('mindmap'),
    )
    .action(async (input: string, cmd) => {
      let { offline } = cmd;
      if (cmd.watch) offline = true;
      const mermaidInput = MERMAID_EXTENSIONS.has(extname(input).toLowerCase());
      if (cmd.watch && mermaidInput) {
        throw new Error(
          '--watch is not yet supported for Mermaid (.mmd) input files.',
        );
      }
      const content = await readFile(input, 'utf8');
      const output = cmd.output || `${input.replace(/\.\w*$/, '')}.html`;
      const mermaidOutput = cmd.mermaid
        ? typeof cmd.mermaid === 'string'
          ? cmd.mermaid
          : `${input.replace(/\.\w*$/, '')}.mmd`
        : undefined;
      if (cmd.watch) {
        const devServer = await develop({
          toolbar: cmd.toolbar,
          offline,
          port: +cmd.port || undefined,
        });
        const address = devServer.serverInfo!.address;
        const provider = devServer.addProvider({ filePath: input });
        const filename = basename(input);
        const url = `http://localhost:${address.port}/?key=${provider.key}&filename=${encodeURIComponent(filename)}`;
        console.log(`Listening at ${url}`);
        if (cmd.open) open(url);
      } else {
        await createMarkmap({
          content,
          output,
          open: cmd.open,
          toolbar: cmd.toolbar,
          offline,
          mermaid: mermaidOutput,
          mermaidType: cmd.mermaidType,
          mermaidInput,
        });
      }
    });
  program.parse();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
