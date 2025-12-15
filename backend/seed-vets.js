import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vet Schema (same as in server.js)
const vetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    location: { type: String },
    address: { type: String },
    phone: { type: String },
    image: { type: String },
    website: { type: String },
    directionsUrl: { type: String },
    emergencyService: { type: Boolean, default: false },
    availableDays: [{ type: String }],
    availableTime: { type: String },
    yearsInBusiness: { type: String },
    onSiteServices: { type: Boolean, default: false },
    review: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Vet = mongoose.model('Vet', vetSchema);

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

// Map specialty from type string
function mapSpecialty(typeStr) {
    if (!typeStr) return ['General Practice'];

    const type = typeStr.replace('· ', '').trim().toLowerCase();
    const specialties = [];

    if (type.includes('animal hospital')) specialties.push('General Practice', 'Surgery');
    if (type.includes('veterinarian')) specialties.push('General Practice');
    if (type.includes('emergency')) specialties.push('Emergency Care');
    if (type.includes('pharmacy')) specialties.push('Pharmacy');
    if (type.includes('pet supply')) specialties.push('Pet Supplies');
    if (type.includes('surgical')) specialties.push('Surgery');
    if (type.includes('hospital')) specialties.push('General Practice');
    if (type.includes('veterinary care')) specialties.push('General Practice');

    return specialties.length > 0 ? specialties : ['General Practice'];
}

// Parse rating string like "4.5" or ""
function parseRating(ratingStr) {
    if (!ratingStr) return 0;
    const rating = parseFloat(ratingStr);
    return isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
}

// Parse review count like "(1K)" or "(176)"
function parseReviewCount(reviewStr) {
    if (!reviewStr) return 0;
    const cleaned = reviewStr.replace(/[()]/g, '').trim().toUpperCase();
    if (cleaned.includes('K')) {
        return Math.round(parseFloat(cleaned.replace('K', '')) * 1000);
    }
    return parseInt(cleaned) || 0;
}

// Check if emergency service based on hours string
function isEmergencyService(hoursStr, nameStr) {
    if (!hoursStr && !nameStr) return false;
    const combined = `${hoursStr || ''} ${nameStr || ''}`.toLowerCase();
    return combined.includes('24') || combined.includes('emergency');
}

// Extract phone number from address/details string
function extractPhone(detailsStr) {
    if (!detailsStr) return '';
    // Match Indian phone patterns
    const phoneMatch = detailsStr.match(/(\d{5}\s?\d{5}|\d{4}\s?\d{3}\s?\d{4}|\d{3}\s?\d{4}\s?\d{4}|0\d{3}\s?\d{3}\s?\d{4})/);
    return phoneMatch ? phoneMatch[0].replace(/\s/g, '') : '';
}

// Extract years in business
function extractYearsInBusiness(detailsStr) {
    if (!detailsStr) return '';
    const match = detailsStr.match(/(\d+\+?\s*years?\s*in\s*business)/i);
    return match ? match[1] : '';
}

// Extract address (remove phone and years in business)
function extractAddress(detailsStr) {
    if (!detailsStr) return '';
    let address = detailsStr
        .replace(/\d{5}\s?\d{5}/g, '')
        .replace(/\d{4}\s?\d{3}\s?\d{4}/g, '')
        .replace(/0\d{3}\s?\d{3}\s?\d{4}/g, '')
        .replace(/\d+\+?\s*years?\s*in\s*business/gi, '')
        .replace(/·/g, '')
        .trim();

    // Remove trailing separators
    address = address.replace(/\s*,\s*$/, '').replace(/\s*·\s*$/, '').trim();
    return address;
}

async function seedVets() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read CSV file
        const csvPath = path.join(__dirname, '..', 'Vets.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());

        // Skip header row
        const dataLines = lines.slice(1);

        console.log(`Found ${dataLines.length} vet entries in CSV`);

        // Clear existing vets (optional - comment out if you want to append)
        await Vet.deleteMany({});
        console.log('Cleared existing vets');

        const vets = [];
        const seenNames = new Set();

        for (const line of dataLines) {
            const fields = parseCSVLine(line);

            // CSV columns:
            // 0: Name, 1: Type, 2: Rating, 3: Review Count, 4: Details (address, phone, years)
            // 5: Hours, 6: Services, 7: Website URL, 8: Website Label, 9: Directions URL
            // 10: Directions Label, 11: Hours 2, 12: Review Text

            const name = fields[0]?.trim();
            if (!name || seenNames.has(name)) continue; // Skip empty or duplicate names
            seenNames.add(name);

            const typeStr = fields[1] || '';
            const rating = parseRating(fields[2]);
            const reviewCount = parseReviewCount(fields[3]);
            const details = fields[4] || '';
            const hours = fields[5] || '';
            const services = fields[6] || '';
            const websiteUrl = fields[7] || '';
            const directionsUrl = fields[9] || '';
            const hours2 = fields[11] || '';
            const reviewText = fields[12]?.replace(/^"|"$/g, '') || '';

            const phone = extractPhone(details);
            const yearsInBusiness = extractYearsInBusiness(details);
            const address = extractAddress(details);

            // Determine location from address or name
            let location = '';
            const locationPatterns = [
                'Coimbatore', 'Chennai', 'Bangalore', 'Bengaluru', 'Tiruppur', 'Ooty',
                'Pollachi', 'Mettupalayam', 'Palakkad', 'Kerala', 'Tamil Nadu', 'Karnataka',
                'Hyderabad', 'Telangana', 'Mumbai', 'Maharashtra'
            ];
            for (const loc of locationPatterns) {
                if (address.toLowerCase().includes(loc.toLowerCase()) ||
                    name.toLowerCase().includes(loc.toLowerCase())) {
                    location = loc;
                    break;
                }
            }

            const vetData = {
                name,
                specialty: mapSpecialty(typeStr),
                rating,
                reviewCount,
                location,
                address,
                phone,
                website: websiteUrl,
                directionsUrl,
                emergencyService: isEmergencyService(hours, name),
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                availableTime: hours || hours2 || '',
                yearsInBusiness,
                onSiteServices: services.toLowerCase().includes('on-site'),
                review: reviewText,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=200`
            };

            vets.push(vetData);
        }

        console.log(`Parsed ${vets.length} unique vets`);

        // Insert vets
        const result = await Vet.insertMany(vets);
        console.log(`Successfully inserted ${result.length} vets`);

        // Show sample
        console.log('\nSample entries:');
        result.slice(0, 3).forEach(vet => {
            console.log(`- ${vet.name} (${vet.rating}★, ${vet.reviewCount} reviews, Emergency: ${vet.emergencyService})`);
        });

    } catch (error) {
        console.error('Error seeding vets:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

seedVets();
