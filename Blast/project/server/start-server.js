#!/usr/bin/env node

/**
 * Server Startup Script with Error Handling
 * This script helps diagnose and fix common server startup issues
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 BLAST Podilato Server Startup Script');
console.log('=====================================\n');

// Check if we're in the correct directory
const currentDir = process.cwd();
const serverDir = path.join(__dirname);
const packageJsonPath = path.join(serverDir, 'package.json');

console.log('📁 Current directory:', currentDir);
console.log('📁 Server directory:', serverDir);

// Check if package.json exists
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found in server directory');
  console.error('   Make sure you are running this script from the server directory');
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(serverDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  Warning: node_modules not found. Installing dependencies...');
  console.log('   Running: npm install\n');
  
  const npmInstall = spawn('npm', ['install'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
  });
  
  npmInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed successfully');
      startServer();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('\n🔍 Pre-flight checks:');
  
  // Check if MongoDB is accessible (optional)
  console.log('✅ Package.json found');
  console.log('✅ Node modules found');
  
  // Check for required files
  const requiredFiles = [
    'server.js',
    'models/Order.js',
    'routes/orders.js',
    'routes/auth.js',
    'middleware/auth.js',
    'middleware/validation.js',
    'services/emailService.js'
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(serverDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} found`);
    } else {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  });
  
  if (!allFilesExist) {
    console.error('\n❌ Some required files are missing. Please check your project structure.');
    process.exit(1);
  }
  
  console.log('\n🚀 Starting server...\n');
  
  // Start the server
  const serverProcess = spawn('node', ['server.js'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
}
