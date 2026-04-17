import dotenv from 'dotenv';
dotenv.config();
console.log('--- ENV CHECK ---');
console.log('AUTH KEY:', JSON.stringify(process.env.MSG91_AUTH_KEY));
console.log('TEMPLATE ID:', JSON.stringify(process.env.MSG91_TEMPLATE_ID));
