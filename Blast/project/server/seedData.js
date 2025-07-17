require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const sampleProducts = [
  // Cars
  {
    name: "Honda City 2024",
    description: "The all-new Honda City with advanced features and superior comfort. Perfect for city driving with excellent fuel efficiency.",
    price: 1200000,
    originalPrice: 1300000,
    discount: 8,
    category: "car",
    brand: "Honda",
    model: "City",
    year: 2024,
    images: [
      {
        url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800",
        alt: "Honda City 2024",
        isPrimary: true
      }
    ],
    specifications: {
      engine: "1.5L i-VTEC",
      fuelType: "petrol",
      transmission: "manual",
      mileage: "17.8 kmpl",
      topSpeed: "180 km/h",
      seatingCapacity: 5,
      colors: ["Pearl White", "Metallic Silver", "Crystal Black"]
    },
    features: ["ABS", "Airbags", "Power Steering", "AC", "Music System"],
    inStock: true,
    stockQuantity: 15,
    isFeatured: true,
    tags: ["sedan", "fuel-efficient", "family-car"]
  },
  {
    name: "Maruti Swift 2024",
    description: "Compact and stylish hatchback with great performance and fuel economy. Ideal for urban commuting.",
    price: 650000,
    originalPrice: 700000,
    discount: 7,
    category: "car",
    brand: "Maruti",
    model: "Swift",
    year: 2024,
    images: [
      {
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        alt: "Maruti Swift 2024",
        isPrimary: true
      }
    ],
    specifications: {
      engine: "1.2L K-Series",
      fuelType: "petrol",
      transmission: "manual",
      mileage: "23.2 kmpl",
      topSpeed: "165 km/h",
      seatingCapacity: 5,
      colors: ["Fire Red", "Arctic White", "Granite Grey"]
    },
    features: ["ABS", "Dual Airbags", "Power Windows", "Central Locking"],
    inStock: true,
    stockQuantity: 25,
    isFeatured: true,
    tags: ["hatchback", "compact", "economical"]
  },
  // Bikes
  {
    name: "Royal Enfield Classic 350",
    description: "Iconic motorcycle with vintage styling and modern engineering. Perfect for long rides and city cruising.",
    price: 185000,
    originalPrice: 195000,
    discount: 5,
    category: "bike",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2024,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        alt: "Royal Enfield Classic 350",
        isPrimary: true
      }
    ],
    specifications: {
      engine: "349cc Single Cylinder",
      fuelType: "petrol",
      transmission: "manual",
      mileage: "35 kmpl",
      topSpeed: "104 km/h",
      weight: "195 kg",
      colors: ["Stealth Black", "Halcyon Green", "Signals Airborne Blue"]
    },
    features: ["Electric Start", "LED Headlight", "Dual Channel ABS", "USB Charging"],
    inStock: true,
    stockQuantity: 12,
    isFeatured: true,
    tags: ["cruiser", "vintage", "touring"]
  },
  {
    name: "Honda CB Shine SP",
    description: "Reliable and fuel-efficient motorcycle for daily commuting. Known for its smooth performance and low maintenance.",
    price: 75000,
    originalPrice: 78000,
    discount: 4,
    category: "bike",
    brand: "Honda",
    model: "CB Shine SP",
    year: 2024,
    images: [
      {
        url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
        alt: "Honda CB Shine SP",
        isPrimary: true
      }
    ],
    specifications: {
      engine: "124cc Single Cylinder",
      fuelType: "petrol",
      transmission: "manual",
      mileage: "65 kmpl",
      topSpeed: "101 km/h",
      weight: "123 kg",
      colors: ["Imperial Red Metallic", "Geny Grey Metallic", "Black"]
    },
    features: ["Electric Start", "Tubeless Tyres", "LED Position Lamp", "Side Stand Engine Cut-off"],
    inStock: true,
    stockQuantity: 30,
    isFeatured: false,
    tags: ["commuter", "fuel-efficient", "reliable"]
  },
  // Electric Vehicles
  {
    name: "Tata Nexon EV",
    description: "India's most loved electric SUV with impressive range and advanced features. Zero emission, maximum performance.",
    price: 1450000,
    originalPrice: 1500000,
    discount: 3,
    category: "electric-car",
    brand: "Tata",
    model: "Nexon EV",
    year: 2024,
    images: [
      {
        url: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800",
        alt: "Tata Nexon EV",
        isPrimary: true
      }
    ],
    specifications: {
      engine: "Electric Motor",
      fuelType: "electric",
      transmission: "automatic",
      mileage: "312 km range",
      topSpeed: "120 km/h",
      seatingCapacity: 5,
      colors: ["Intensi-Teal", "Daytona Grey", "Calgary White"]
    },
    features: ["Fast Charging", "Regenerative Braking", "Connected Car Tech", "Air Purifier"],
    inStock: true,
    stockQuantity: 8,
    isFeatured: true,
    tags: ["electric", "suv", "eco-friendly", "zero-emission"]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blast-podilato';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    console.log('🧹 Clearing existing products...');
    await Product.deleteMany({});
    
    // Insert sample products
    console.log('📦 Inserting sample products...');
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${insertedProducts.length} products`);
    
    // Create admin user if not exists
    console.log('👤 Creating admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@blast.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@blast.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      });
      await adminUser.save();
      console.log('✅ Admin user created (email: admin@blast.com, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Products: ${insertedProducts.length}`);
    console.log('- Admin user: admin@blast.com');
    console.log('\n🚀 You can now start using the application!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };
