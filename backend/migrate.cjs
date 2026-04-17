const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://myAtlasDBUser:deva@myatlasclusteredu.hjsgp.mongodb.net/PetPair';

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.connection.collection('users');
        
        const result = await User.updateMany(
            { userType: { $in: ['kennel', 'store'] } },
            { $set: { isApproved: true } }
        );
        
        console.log(`Migration Complete. Updated ${result.modifiedCount} kennel users to isApproved=true.`);
    } catch (err) {
        console.error('Migration failed', err);
    } finally {
        process.exit();
    }
};

migrate();
