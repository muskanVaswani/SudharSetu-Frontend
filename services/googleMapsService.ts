import { Location } from '../types';

// This file uses the OpenStreetMap Nominatim API for geocoding services.
// It provides functions to convert addresses to coordinates and vice-versa.
// Note: This is a free service with usage policies. For heavy use, consider self-hosting or a commercial provider.
// More info: https://nominatim.org/release-docs/develop/

const USER_AGENT = 'SudharSetu/1.0 (Hackathon Project)';

/**
 * Converts a physical address into geographic coordinates (latitude and longitude).
 * Uses the Nominatim Search API with a free-form query for better flexibility.
 * @param location The partial location object from the form.
 * @returns A full Location object with coordinates if the address is valid, otherwise null.
 */
export const geocodeAddress = async (
    location: Omit<Location, 'lat' | 'lng' | 'fullAddress'>
): Promise<Location | null> => {
    // Combine all address parts into a single query string for a more robust search.
    const addressString = [location.houseNo, location.street, location.landmark, location.city, location.pincode]
        .filter(Boolean)
        .join(', ');

    if (!addressString.trim()) {
        console.error("Geocode error: Address string is empty.");
        return null;
    }

    const queryParams = new URLSearchParams({
        q: addressString,
        format: 'json',
        limit: '1',
        addressdetails: '1'
    });

    const url = `https://nominatim.openstreetmap.org/search?${queryParams.toString()}`;

    try {
        const response = await fetch(url, { 
            headers: { 
                'Accept': 'application/json',
                'User-Agent': USER_AGENT
            }
        });

        if (!response.ok) {
            console.error('Nominatim API error:', response.statusText);
            return null;
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            const addr = result.address;
            
            const verifiedLocation: Location = {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                houseNo: addr.house_number || location.houseNo || '',
                street: addr.road || location.street || '',
                landmark: addr.amenity || location.landmark || '',
                city: addr.city || addr.town || addr.village || location.city || '',
                pincode: addr.postcode || location.pincode || '',
                fullAddress: result.display_name,
            };
            return verifiedLocation;
        }
        return null; // No results found
    } catch (error) {
        console.error("Error geocoding with OpenStreetMap:", error);
        return null;
    }
};


/**
 * Converts geographic coordinates into a human-readable address.
 * Uses the Nominatim Reverse Geocoding API.
 * @param lat Latitude
 * @param lng Longitude
 * @returns A partial location object or null if no address is found.
 */
export const reverseGeocode = async (
    lat: number, 
    lng: number
): Promise<Omit<Location, 'lat' | 'lng' | 'fullAddress'> | null> => {
     const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
            
     try {
        const response = await fetch(url, { 
            headers: { 
                'Accept': 'application/json',
                'User-Agent': USER_AGENT 
            }
        });
         if (!response.ok) {
            console.error('Nominatim API error:', response.statusText);
            return null;
        }
        const data = await response.json();

        if (data && data.address) {
            const addr = data.address;
            return {
                street: addr.road || '',
                city: addr.city || addr.town || addr.village || '',
                pincode: addr.postcode || '',
                houseNo: addr.house_number || '',
                landmark: addr.amenity || '', // Best guess for a landmark
            };
        }
        return null;
     } catch(error) {
         console.error("Error reverse geocoding with OpenStreetMap:", error);
         return null;
     }
};