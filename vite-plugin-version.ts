import { Plugin } from 'vite';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

interface VersionPluginOptions {
  outputPath?: string;
  version?: string;
}

export default function viteVersionPlugin(options: VersionPluginOptions = {}): Plugin {
  const { outputPath = 'version.json', version = '1.0.0' } = options;

  return {
    name: 'vite-version-plugin',
    generateBundle(outputOptions, bundle) {
      const buildTime = new Date().toISOString();
      
      // Generate a hash based on all bundle files
      const bundleContent = Object.values(bundle)
        .map(chunk => {
          if (chunk.type === 'chunk') {
            return chunk.code;
          } else if (chunk.type === 'asset') {
            return chunk.source.toString();
          }
          return '';
        })
        .join('');
      
      const hash = createHash('md5').update(bundleContent).digest('hex').substring(0, 8);

      const versionInfo = {
        version,
        buildTime,
        hash
      };

      // Emit the version file as part of the bundle
      this.emitFile({
        type: 'asset',
        fileName: outputPath,
        source: JSON.stringify(versionInfo, null, 2)
      });
    },
    
    // Also generate version file during dev mode
    configureServer(server) {
      const generateDevVersionFile = () => {
        const buildTime = new Date().toISOString();
        const hash = createHash('md5').update(buildTime).digest('hex').substring(0, 8);
        
        const versionInfo = {
          version: `${version}-dev`,
          buildTime,
          hash
        };

        const outDir = server.config.publicDir || 'public';
        const filePath = join(outDir, outputPath);
        
        try {
          writeFileSync(filePath, JSON.stringify(versionInfo, null, 2));
          console.log(`Generated dev version file: ${filePath}`);
        } catch (error) {
          console.warn('Failed to generate dev version file:', error);
        }
      };

      // Generate initial version file
      generateDevVersionFile();
      
      // Regenerate on file changes in dev mode
      server.ws.on('vite:beforeUpdate', () => {
        generateDevVersionFile();
      });
    }
  };
}
