// Dairy Images
import amulMilkRed from '../DairyProduct/img/amulmilkred.webp';
import amulMilkBrown from '../DairyProduct/img/amulmilkbrown.jpg';
import amulCurd from '../DairyProduct/img/amulcurd.jpg';
import amulMilk1kg from '../DairyProduct/img/amulmilk1kg.jpg';
import amulCurdBlue from '../DairyProduct/img/amulcurdblue.webp';
import amulLassiWhite from '../DairyProduct/img/amullasiwhite.jpg';
import amulLassiYellow from '../DairyProduct/img/amullasiyello.jpg';

// Snacks Images
import comboSnacks from '../Snakes/imgs/combo of snakes.jpg';
import devSnacks from '../Snakes/imgs/dev sankes.jpg';
import kurkure from '../Snakes/imgs/kurkure.jpg';
import nuts from '../Snakes/imgs/nuts.jpg';
import partySnacks from '../Snakes/imgs/party snacks.jpg';
import popcorn from '../Snakes/imgs/popcorn.jpg';
import superCheesy from '../Snakes/imgs/super cheesy.jpg';
import tasty from '../Snakes/imgs/tasty.jpg';

// Cold Drinks Images
import cocaCola from '../ColdDrinks/imgs/coca cola.jpg';
import dietCoke from '../ColdDrinks/imgs/diet coke.jpg';
import fanta from '../ColdDrinks/imgs/fanta.jpg';
import lemonWater from '../ColdDrinks/imgs/lemon water.jpg';
import marinda from '../ColdDrinks/imgs/marinda.avif';
import mojito from '../ColdDrinks/imgs/mojito.webp';
import pepsi from '../ColdDrinks/imgs/pepsi.jpg';
import spriteCane from '../ColdDrinks/imgs/sprite cane.jpg';
import sprite from '../ColdDrinks/imgs/sprite.jpg';
import thumsUp from '../ColdDrinks/imgs/thums Up.webp';

// Wine Images
import carlsberg from '../Wine/img/Carlsberg beer.jpg';
import fratelli from '../Wine/img/Fratelli wine.jpg';
import haywards from '../Wine/img/Haywards 5000 beer.jpg';
import kingfisher from '../Wine/img/Kingfisher  beer.jpg';
import york from '../Wine/img/York wine.jpg';
import budweiser from '../Wine/img/budweiser bear.avif';
import indri from '../Wine/img/indri wine.jpg';
import moli from '../Wine/img/moli wine.jpg';
import pitbull from '../Wine/img/pitbull wine.jpg';
import turbo from '../Wine/img/turbo beer.jpg';

// Smoking Images
import bidi from '../Smoking/img/Bidi.jpg';
import chhotiAdvance from '../Smoking/img/Chhoti Advance.jpg';
import mallBoro from '../Smoking/img/Mall boro.avif';
import mentholWomen from '../Smoking/img/Menthol Women.jpg';
import pallMall from '../Smoking/img/Pall Mall.jpg';
import royalSwag from '../Smoking/img/Royal Swag Ayurvedic and Herbal.jpg';
import smokyWomen from '../Smoking/img/Smoky for women.jpg';
import stellarMint from '../Smoking/img/Stellar mint.jpg';
import goldFlake from '../Smoking/img/gold Flake.jpg';

export const allProducts = [
    // Dairy Products
    { id: 1, name: 'Amul Milk', price: 60, imgUrl: amulMilkRed, category: 'Dairy' },
    { id: 2, name: 'Amul Milk (Brown)', price: 250, imgUrl: amulMilkBrown, category: 'Dairy' },
    { id: 3, name: 'Amul Curd', price: 90, imgUrl: amulCurd, category: 'Dairy' },
    { id: 4, name: 'Amul Milk (1kg)', price: 40, imgUrl: amulMilk1kg, category: 'Dairy' },
    { id: 5, name: 'Amul Curd (Blue)', price: 30, imgUrl: amulCurdBlue, category: 'Dairy' },
    { id: 6, name: 'Amul Lassi (White)', price: 20, imgUrl: amulLassiWhite, category: 'Dairy' },
    { id: 7, name: 'Amul Lassi (Yellow)', price: 25, imgUrl: amulLassiYellow, category: 'Dairy' },

    // Snacks
    { id: 8, name: 'Combo of Snacks', price: 150, imgUrl: comboSnacks, category: 'Snacks' },
    { id: 9, name: 'Dev Snacks', price: 40, imgUrl: devSnacks, category: 'Snacks' },
    { id: 10, name: 'Kurkure', price: 20, imgUrl: kurkure, category: 'Snacks' },
    { id: 11, name: 'Nuts', price: 200, imgUrl: nuts, category: 'Snacks' },
    { id: 12, name: 'Party Snacks', price: 100, imgUrl: partySnacks, category: 'Snacks' },
    { id: 13, name: 'Popcorn', price: 30, imgUrl: popcorn, category: 'Snacks' },
    { id: 14, name: 'Super Cheesy', price: 50, imgUrl: superCheesy, category: 'Snacks' },
    { id: 15, name: 'Tasty', price: 60, imgUrl: tasty, category: 'Snacks' },

    // Cold Drinks
    { id: 16, name: 'Coca Cola', price: 40, imgUrl: cocaCola, category: 'ColdDrinks' },
    { id: 17, name: 'Diet Coke', price: 50, imgUrl: dietCoke, category: 'ColdDrinks' },
    { id: 18, name: 'Fanta', price: 45, imgUrl: fanta, category: 'ColdDrinks' },
    { id: 19, name: 'Lemon Water', price: 20, imgUrl: lemonWater, category: 'ColdDrinks' },
    { id: 20, name: 'Marinda', price: 45, imgUrl: marinda, category: 'ColdDrinks' },
    { id: 21, name: 'Mojito', price: 80, imgUrl: mojito, category: 'ColdDrinks' },
    { id: 22, name: 'Pepsi', price: 40, imgUrl: pepsi, category: 'ColdDrinks' },
    { id: 23, name: 'Sprite Cane', price: 50, imgUrl: spriteCane, category: 'ColdDrinks' },
    { id: 24, name: 'Sprite', price: 40, imgUrl: sprite, category: 'ColdDrinks' },
    { id: 25, name: 'Thums Up', price: 45, imgUrl: thumsUp, category: 'ColdDrinks' },

    // Wine
    { id: 26, name: 'Carlsberg Beer', price: 250, imgUrl: carlsberg, category: 'Wine' },
    { id: 27, name: 'Fratelli Wine', price: 600, imgUrl: fratelli, category: 'Wine' },
    { id: 28, name: 'Haywards 5000', price: 180, imgUrl: haywards, category: 'Wine' },
    { id: 29, name: 'Kingfisher Beer', price: 150, imgUrl: kingfisher, category: 'Wine' },
    { id: 30, name: 'York Wine', price: 700, imgUrl: york, category: 'Wine' },
    { id: 31, name: 'Budweiser', price: 220, imgUrl: budweiser, category: 'Wine' },
    { id: 32, name: 'Indri Wine', price: 800, imgUrl: indri, category: 'Wine' },
    { id: 33, name: 'Moli Wine', price: 450, imgUrl: moli, category: 'Wine' },
    { id: 34, name: 'Pitbull Wine', price: 300, imgUrl: pitbull, category: 'Wine' },
    { id: 35, name: 'Turbo Beer', price: 130, imgUrl: turbo, category: 'Wine' },

    // Smoking
    { id: 36, name: 'Bidi', price: 50, imgUrl: bidi, category: 'Smoking' },
    { id: 37, name: 'Chhoti Advance', price: 120, imgUrl: chhotiAdvance, category: 'Smoking' },
    { id: 38, name: 'Marlboro', price: 350, imgUrl: mallBoro, category: 'Smoking' },
    { id: 39, name: 'Menthol for Women', price: 200, imgUrl: mentholWomen, category: 'Smoking' },
    { id: 40, name: 'Pall Mall', price: 280, imgUrl: pallMall, category: 'Smoking' },
    { id: 41, name: 'Royal Swag (Herbal)', price: 150, imgUrl: royalSwag, category: 'Smoking' },
    { id: 42, name: 'Smoky for Women', price: 220, imgUrl: smokyWomen, category: 'Smoking' },
    { id: 43, name: 'Stellar Mint', price: 180, imgUrl: stellarMint, category: 'Smoking' },
    { id: 44, name: 'Gold Flake', price: 160, imgUrl: goldFlake, category: 'Smoking' },
];
