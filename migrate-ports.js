import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = './src';
const target = 'http://localhost:5000';
const replacement = 'http://localhost:5050';

walkDir(srcDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(target)) {
            console.log(`Updating ${filePath}`);
            const newContent = content.split(target).join(replacement);
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    }
});
