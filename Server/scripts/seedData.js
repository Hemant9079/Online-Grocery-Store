import fs from 'fs';
import path from 'path';
// import fetch from 'node-fetch'; // Built-in in Node 18+

const productsFilePath = path.join('../frontend/src/data/products.ts');
const rawContent = fs.readFileSync(productsFilePath, 'utf-8');

// 1. Extract imports to map variable -> filename
const importRegex = /import\s+(\w+)\s+from\s+'(.+)';/g;
const imageMap = {};
let match;
while ((match = importRegex.exec(rawContent)) !== null) {
    const [_, variableName, importPath] = match;
    // content uses relative paths like '../DairyProduct/img/amulmilkred.webp'
    // We'll clean it to be just the filename or a cleaner path
    // For now, let's store the filename for simplicity, or the full relative path
    imageMap[variableName] = importPath;
}

// 2. Extract product objects
// Matches: { id: 1, name: 'Amul Milk', price: 60, imgUrl: amulMilkRed, category: 'Dairy' },
const objectRegex = /{\s*id:\s*(\d+),\s*name:\s*'([^']+)',\s*price:\s*(\d+),\s*imgUrl:\s*(\w+),\s*category:\s*'([^']+)'\s*}/g;
const products = [];

while ((match = objectRegex.exec(rawContent)) !== null) {
    const [_, id, name, price, imgVar, category] = match;
    products.push({
        id: parseInt(id),
        name: name,
        price: parseInt(price),
        imgUrl: imageMap[imgVar] || imgVar, // Use mapped path or fallback to variable name
        category: category
    });
}

console.log(`Parsed ${products.length} products.`);

// 3. Seed data
const seedData = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/products/seed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products)
        });
        const data = await response.json();
        console.log('Seed response:', data);
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

seedData();
