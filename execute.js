const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())
require('child_process').execSync('npx tsx check_db.ts', { stdio: 'inherit' })
