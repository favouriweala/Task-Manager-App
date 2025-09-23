#!/usr/bin/env node

/**
 * AI Model Validation Script
 * Validates that AI models and API keys are properly configured
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const REQUIRED_ENV_VARS = [
  'GOOGLE_AI_API_KEY',
  'NEXT_PUBLIC_GOOGLE_AI_API_KEY'
];

const OPTIONAL_ENV_VARS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY'
];

function validateEnvironmentVariables() {
  console.log('🔍 Validating AI model environment variables...');
  
  const missing = [];
  const present = [];
  
  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (process.env[envVar]) {
      present.push(envVar);
      console.log(`✅ ${envVar}: Present`);
    } else {
      missing.push(envVar);
      console.log(`❌ ${envVar}: Missing`);
    }
  }
  
  // Check optional variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (process.env[envVar]) {
      present.push(envVar);
      console.log(`✅ ${envVar}: Present (optional)`);
    } else {
      console.log(`⚠️  ${envVar}: Missing (optional)`);
    }
  }
  
  return { missing, present };
}

function validateAIConfiguration() {
  console.log('🔍 Validating AI configuration files...');
  
  const aiConfigPath = path.join(__dirname, '..', 'src', 'lib', 'ai.ts');
  
  if (!fs.existsSync(aiConfigPath)) {
    console.log('❌ AI configuration file not found');
    return false;
  }
  
  const aiConfig = fs.readFileSync(aiConfigPath, 'utf8');
  
  // Check for basic AI service setup
  const hasGoogleAI = aiConfig.includes('google') || aiConfig.includes('GoogleGenerativeAI');
  
  if (hasGoogleAI) {
    console.log('✅ Google AI configuration found');
  } else {
    console.log('⚠️  Google AI configuration not detected');
  }
  
  return true;
}

function validatePackageJson() {
  console.log('🔍 Validating AI-related dependencies...');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const aiDependencies = [
    '@ai-sdk/google',
    '@google/generative-ai',
    'ai'
  ];
  
  let foundDependencies = 0;
  
  for (const dep of aiDependencies) {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
      foundDependencies++;
    } else {
      console.log(`⚠️  ${dep}: Not found`);
    }
  }
  
  return foundDependencies > 0;
}

async function main() {
  console.log('🤖 Starting AI Model Validation...\n');
  
  const envValidation = validateEnvironmentVariables();
  console.log('');
  
  const configValidation = validateAIConfiguration();
  console.log('');
  
  const packageValidation = validatePackageJson();
  console.log('');
  
  // Summary
  console.log('📊 Validation Summary:');
  console.log(`Environment Variables: ${envValidation.present.length} present, ${envValidation.missing.length} missing`);
  console.log(`Configuration: ${configValidation ? 'Valid' : 'Invalid'}`);
  console.log(`Dependencies: ${packageValidation ? 'Valid' : 'Invalid'}`);
  
  // Determine exit code
  const hasRequiredEnvVars = envValidation.missing.length === 0;
  const isValid = hasRequiredEnvVars && configValidation && packageValidation;
  
  if (isValid) {
    console.log('\n✅ All AI model validations passed!');
    process.exit(0);
  } else {
    console.log('\n❌ AI model validation failed!');
    
    if (!hasRequiredEnvVars) {
      console.log('Missing required environment variables. Please check your .env file.');
    }
    
    process.exit(1);
  }
}

// Run the validation
main().catch((error) => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});