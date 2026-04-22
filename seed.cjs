const fs = require('fs');
const dbFile = 'e:/WebDevlopment/React/Project/ShopWave/db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const subcategories = ['Running', 'Formal', 'Boots', 'Sandals', 'Kids'];
const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Bata', 'Clarks', 'Skechers', 'Under Armour'];

const adjectives = ['Premium', 'Ultra', 'Cloud', 'Aero', 'Classic', 'Urban', 'Tech', 'Swift', 'Pro', 'Elite', 'Max', 'Elevate', 'Prime', 'Dynamic', 'Essential', 'Vintage', 'Modern', 'Supreme', 'Core', 'Vanguard'];
const nouns = ['Stride', 'Glide', 'Runner', 'Walker', 'Trek', 'Sprint', 'Force', 'Flex', 'Pulse', 'Motion', 'Shift', 'Edge', 'Impact', 'Boost', 'React', 'Zoom', 'Drive', 'Pace', 'Strike'];

let newProducts = [];
let idCounter = 1;

subcategories.forEach((sub, subIdx) => {
  for(let i = 1; i <= 20; i++) {
    const originalPrice = 1500 + Math.floor(Math.random() * 3000);
    const discount = Math.random() > 0.4 ? Math.floor(Math.random() * 800) + 200 : 0;
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const productName = randomAdj + ' ' + randomNoun + ' ' + (Math.floor(Math.random() * 99) + 1);
    
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    
    // Using loremflickr with a unique lock per item to guarantee distinct images
    const imgKeyword = sub.toLowerCase() + ',shoes';
    const uniqueLock = subIdx * 50 + i;
    const imageUrl = `https://loremflickr.com/400/400/${imgKeyword}?lock=${uniqueLock}`;
    
    newProducts.push({
      id: idCounter.toString(),
      name: productName,
      brand: randomBrand,
      originalPrice: originalPrice,
      price: originalPrice - discount,
      category: 'Footwear',
      subCategory: sub,
      size: (Math.floor(Math.random() * 6) + 6).toString(),
      color: ['Black', 'White', 'Brown', 'Blue', 'Grey', 'Red', 'Navy'][Math.floor(Math.random() * 7)],
      gender: sub === 'Kids' ? 'Kids' : (Math.random() > 0.5 ? 'Men' : 'Women'),
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 400) + 12,
      description: `Experience the ${randomAdj.toLowerCase()} comfort with ${randomBrand}'s newest ${sub.toLowerCase()} collection. Engineered for durability and style.`,
      images: [
         imageUrl,
         `https://loremflickr.com/400/400/${imgKeyword}?lock=${uniqueLock + 500}`
      ],
      stock: Math.floor(Math.random() * 60) + 5,
      tags: discount > 0 ? ['sale'] : ['new']
    });
    idCounter++;
  }
});

db.products = newProducts;
fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully generated ' + newProducts.length + ' completely distinct Footwear products!');
