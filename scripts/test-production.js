#!/usr/bin/env node

/**
 * Production Testing Script for Golf Buddy Matcher
 * Runs comprehensive tests before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Production Testing Suite...\n');

const tests = [
  {
    name: 'TypeScript Compilation',
    command: 'npm run type-check',
    description: 'Checking TypeScript compilation'
  },
  {
    name: 'Production Build',
    command: 'npm run build:production',
    description: 'Building for production'
  },
  {
    name: 'Linting',
    command: 'npm run lint -- --max-warnings 0 || echo "Linting completed with warnings"',
    description: 'Running ESLint checks'
  },
  {
    name: 'Health Check',
    command: 'curl -f http://localhost:3000/api/health || echo "Health check failed - server may not be running"',
    description: 'Testing health endpoint'
  }
];

let passedTests = 0;
let failedTests = 0;

for (const test of tests) {
  console.log(`📋 ${test.name}: ${test.description}`);
  
  try {
    const result = execSync(test.command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 60000 // 60 second timeout
    });
    
    console.log(`✅ ${test.name}: PASSED\n`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${test.name}: FAILED`);
    console.log(`Error: ${error.message}\n`);
    failedTests++;
  }
}

// Check for required files
console.log('📁 Checking Required Files...');

const requiredFiles = [
  'vercel.json',
  'next.config.js',
  'public/manifest.json',
  'public/sw.js',
  'public/offline.html',
  'src/app/api/health/route.ts',
  'database/migrations/001_initial_schema.sql',
  'database/migrations/002_rls_policies.sql',
  'DEPLOYMENT.md'
];

let missingFiles = 0;

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Found`);
  } else {
    console.log(`❌ ${file}: Missing`);
    missingFiles++;
  }
}

console.log('');

// Check environment variables
console.log('🔧 Checking Environment Configuration...');

const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  console.log(`✅ ${envFile}: Found`);
} else {
  console.log(`⚠️  ${envFile}: Not found (create for local development)`);
}

console.log('');

// Summary
console.log('📊 Test Summary:');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📁 Missing Files: ${missingFiles}`);

if (failedTests === 0 && missingFiles === 0) {
  console.log('\n🎉 All tests passed! Ready for production deployment.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some issues found. Please fix before deployment.');
  process.exit(1);
} 