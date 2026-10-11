#!/usr/bin/env node
// Node won't strip types from files under node_modules, so load the TypeScript CLI through tsx.
import { register } from 'tsx/esm/api';

register();
await import('./sync.ts');
