# Server Troubleshooting Guide

## Common Server Startup Issues and Solutions

### 1. "Missing script: start" Error

**Problem**: You see `npm error Missing script: "start"`

**Solution**: 
- Make sure you're in the correct directory: `cd Blast/project/server`
- Or use the startup script: `node start-server.js`

### 2. "Port already in use" Error

**Problem**: `Error: listen EADDRINUSE: address already in use :::5001`

**Solutions**:
- Kill existing server: `taskkill /f /im node.exe` (Windows) or `pkill node` (Mac/Linux)
- Use a different port: Set `PORT=5002` in environment variables
- Check what's using the port: `netstat -ano | findstr :5001` (Windows)

### 3. MongoDB Connection Issues

**Problem**: MongoDB connection errors or warnings

**Solutions**:
- Make sure MongoDB is running locally
- Check connection string in `server.js`
- The server will continue with mock data if MongoDB is unavailable

### 4. Module Not Found Errors

**Problem**: `Cannot find module` errors

**Solutions**:
- Install dependencies: `npm install`
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check if all required files exist

### 5. JWT/Authentication Errors

**Problem**: JWT verification errors or authentication issues

**Solutions**:
- Check if JWT_SECRET is set in environment variables
- Clear browser localStorage/cookies
- Re-login to get a fresh token

## Quick Start Commands

### Option 1: Manual Start
```bash
cd Blast/project/server
npm install
npm start
```

### Option 2: Using Startup Script
```bash
cd Blast/project/server
node start-server.js
```

### Option 3: PowerShell (Windows)
```powershell
cd Blast/project/server; npm start
```

## Environment Variables

Create a `.env` file in the server directory with:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/blast-podilato
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Health Check

Once the server is running, test it:
- Health endpoint: http://localhost:5001/api/health
- Should return: `{"message": "Server is running!", "mongodb": "Connected"}`

## File Structure Check

Ensure these files exist in the server directory:
```
server/
├── server.js
├── package.json
├── models/
│   └── Order.js
├── routes/
│   ├── auth.js
│   └── orders.js
├── middleware/
│   ├── auth.js
│   └── validation.js
└── services/
    └── emailService.js
```

## Common Error Messages and Fixes

### "Cannot read property of undefined"
- Usually indicates missing data validation
- Check request body structure
- Ensure all required fields are present

### "ValidationError: Order validation failed"
- Check Order model schema
- Ensure all required fields are provided
- Verify data types match schema

### "Access denied. No token provided"
- User not authenticated
- Check Authorization header format: `Bearer <token>`
- Re-login to get fresh token

## Debug Mode

To run with detailed logging:
```bash
NODE_ENV=development npm start
```

## Getting Help

If you're still experiencing issues:
1. Check the console output for specific error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running (if using database)
4. Check network connectivity
5. Verify file permissions

## Success Indicators

When the server starts successfully, you should see:
```
Server running on port 5001
Health check: http://localhost:5001/api/health
MongoDB Connected: localhost
```
