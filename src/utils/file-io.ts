/**
 * File I/O utilities
 * Handles reading input and writing output files
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { VibeSpec, OutputFormat } from '../types';

/**
 * Read input file or return text directly
 */
export function readInput(input: string): string {
  // Check if input is a file path
  if (fs.existsSync(input)) {
    try {
      return fs.readFileSync(input, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${(error as Error).message}`);
    }
  }

  // Otherwise, treat as direct text input
  return input;
}

/**
 * Write spec to file in specified format
 */
export function writeSpec(
  spec: VibeSpec,
  outputPath: string,
  format: OutputFormat = 'json'
): string {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let content: string;

    if (format === 'yaml') {
      content = yaml.dump(spec, { indent: 2 });
    } else {
      content = JSON.stringify(spec, null, 2);
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to write spec: ${(error as Error).message}`);
  }
}

/**
 * Read spec file (JSON or YAML)
 */
export function readSpec(filePath: string): VibeSpec {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    let spec: any;

    if (ext === '.yaml' || ext === '.yml') {
      spec = yaml.load(content);
    } else {
      spec = JSON.parse(content);
    }

    return spec as VibeSpec;
  } catch (error) {
    throw new Error(`Failed to read spec: ${(error as Error).message}`);
  }
}

/**
 * Generate default output filename
 */
export function generateOutputPath(
  outputDir: string = './specs',
  format: OutputFormat = 'json'
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `requirement-${timestamp}.spec.${format}`;
  return path.join(outputDir, filename);
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
