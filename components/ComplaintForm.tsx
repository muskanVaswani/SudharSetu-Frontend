import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Page, Complaint, ComplaintType, Impact, Location } from '../types';
import { verifyComplaintImage } from '../services/geminiService';
import { geocodeAddress, reverseGeocode } from '../services/googleMapsService';
import { ArrowLeftIcon, CameraIcon, MapPinIcon, UserGroupIcon, ChevronRightIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon } from './icons/Icons';
import { useNotification } from '../context/NotificationContext';

const formatFullAddress = (loc: Omit<Location, 'lat' | 'lng' | 'fullAddress'>): string => {
    return [loc.houseNo, loc.street, loc.landmark, loc.city, loc.pincode].filter(Boolean).join(', ');
}


const ExistingComplaintCard: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
    const { incrementAffectedCount } = useAppContext();
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        if (!isClicked) {
            incrementAffectedCount(complaint.id);
            setIsClicked(true);
        }
    }

    return (
        <div className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
            <div>
                <h4 className="font-bold">{complaint.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status: {complaint.status}</p>
            </div>
            <button onClick={handleClick} disabled={isClicked}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${isClicked ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>
                <UserGroupIcon className="h-4 w-4" />
                <span>{isClicked ? 'Thanks!' : 'This affects me too!'} ({complaint.affectedCount})</span>
            </button>
        </div>
    );
};

interface ComplaintFormProps {
  setCurrentPage: (page: Page) => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ setCurrentPage }) => {
  const { addComplaint, complaints } = useAppContext();
  const { addNotification } = useNotification();
  
  const [step, setStep] = useState<'location' | 'review' | 'form'>('location');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [type, setType] = useState<ComplaintType>(ComplaintType.Pothole);
  const [impact, setImpact] = useState<Impact>(Impact.AccidentRisk);
  
  const [location, setLocation] = useState<Location | null>(null);
  const [manualLocation, setManualLocation] = useState({ houseNo: '', street: '', landmark: '', city: '', pincode: '' });
  const [isLocating, setIsLocating] = useState(false);
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
  const [nearbyComplaints, setNearbyComplaints] = useState<Complaint[]>([]);
  
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
  const [imageVerificationStatus, setImageVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const [error, setError] = useState('');

  const handleGetLocation = () => {
    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const addressDetails = await reverseGeocode(position.coords.latitude, position.coords.longitude);
        if (!addressDetails) {
            setError('Could not find a valid address for your location. Please enter it manually.');
            setIsLocating(false);
            return;
        }

        const fullAddress = formatFullAddress(addressDetails);
        const newLocation: Location = {
          ...addressDetails,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fullAddress: fullAddress
        };
        setManualLocation({
            houseNo: newLocation.houseNo || '',
            street: newLocation.street,
            landmark: newLocation.landmark || '',
            city: newLocation.city,
            pincode: newLocation.pincode
        });
        handleLocationSet(newLocation);
        setIsLocating(false);
      },
      (error: GeolocationPositionError) => {
        let errorMessage = 'Could not get location. Please enable GPS services or enter manually.';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please allow location access in your browser settings.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable. Please try again or enter your address manually.";
                break;
            case error.TIMEOUT:
                errorMessage = "The request to get your location timed out. Please try again.";
                break;
        }
        setError(errorMessage);
        setIsLocating(false);
      }
    );
  };

  const handleManualLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualLocation(prev => ({ ...prev, [name]: value }));
  }

  const handleManualAddress = async () => {
    const { street, city, pincode } = manualLocation;
    setError('');
    if(!street.trim() || !city.trim() || !pincode.trim()){
        setError('Street, City, and Pincode are required fields.');
        return;
    }
    
    setIsVerifyingAddress(true);
    const verifiedLocation = await geocodeAddress(manualLocation);
    setIsVerifyingAddress(false);
    
    if (!verifiedLocation) {
        setError('We could not verify this address. Please check for typos or enter a valid address.');
        return;
    }
    
    handleLocationSet(verifiedLocation);
  };
  
  const handleLocationSet = (loc: Location) => {
    setLocation(loc);
    // Find nearby complaints more leniently (e.g., by city and pincode)
    const nearby = complaints.filter(c => c.location.pincode === loc.pincode && c.location.city === loc.city).slice(0, 3);
    setNearbyComplaints(nearby);
    setStep('review');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoName(file.name);
      setPhotoFile(file);
      setImageVerificationStatus('pending');
      setIsVerifyingImage(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setPhoto(reader.result as string);
        
        const isValid = await verifyComplaintImage(base64String, file.type, type);
        setImageVerificationStatus(isValid ? 'success' : 'failed');
        setIsVerifyingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !photo || !location || !type || !impact) {
      setError('All fields are required.');
      return;
    }
    if(imageVerificationStatus !== 'success') {
        setError('Please upload a valid photo for the selected issue type.');
        return;
    }
    addComplaint({ title, description, photo, location, type, impact });
    addNotification('Complaint submitted! A confirmation email has been sent to your registered address.', 'success');
    setCurrentPage(Page.User);
  };

  const renderLocationStep = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Report an Issue</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Step 1: Provide the precise location of the problem.</p>
       <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="houseNo" value={manualLocation.houseNo} onChange={handleManualLocationChange} placeholder="House / Building No. (Optional)" className="input-field"/>
                <input name="street" value={manualLocation.street} onChange={handleManualLocationChange} placeholder="Street / Area*" required className="input-field"/>
                <input name="landmark" value={manualLocation.landmark} onChange={handleManualLocationChange} placeholder="Landmark (Optional)" className="input-field"/>
                <input name="city" value={manualLocation.city} onChange={handleManualLocationChange} placeholder="City*" required className="input-field"/>
                <input name="pincode" value={manualLocation.pincode} onChange={handleManualLocationChange} placeholder="Pincode*" required className="input-field md:col-span-2"/>
            </div>
             <button onClick={handleManualAddress} disabled={isVerifyingAddress} className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                {isVerifyingAddress ? 'Setting Address...' : 'Set Address'}
            </button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div><div className="relative flex justify-center"><span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">OR</span></div></div>
             <button type="button" onClick={handleGetLocation} disabled={isLocating} className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                <MapPinIcon className="h-5 w-5" />
                <span>{isLocating ? 'Getting Location...' : 'Use My Current Location'}</span>
            </button>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
       </div>
       <style jsx>{`
            .input-field {
                 background-color: #F9FAFB;
                 border: 1px solid #D1D5DB;
                 border-radius: 0.375rem;
                 padding: 0.5rem 0.75rem;
                 font-size: 0.875rem;
                 width: 100%;
            }
            .dark .input-field {
                background-color: #374151;
                border-color: #4B5563;
            }
       `}</style>
    </div>
  );

  const renderReviewStep = () => (
    <div>
        <button onClick={() => setStep('location')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"><ArrowLeftIcon className="h-5 w-5" /><span>Change Location</span></button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Step 2: Review Existing Reports</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Location: <span className="font-semibold">{location?.fullAddress}</span></p>
        {nearbyComplaints.length > 0 ? (
            <div className="space-y-3 mb-6"><h3 className="font-semibold text-lg">We found these issues already reported nearby:</h3>{nearbyComplaints.map(c => <ExistingComplaintCard key={c.id} complaint={c} />)}</div>
        ) : (<p className="p-4 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md mb-6">No existing reports found here. Proceed with filing a new report.</p>)}
        <div className="flex flex-col sm:flex-row gap-4">
             <button onClick={() => setCurrentPage(Page.Public)} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                Back to Home
            </button>
            <button onClick={() => setStep('form')} className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                <span>Report a New Issue</span><ChevronRightIcon className="h-6 w-6 ml-2"/>
            </button>
        </div>
    </div>
  );
  
  const renderFormStep = () => (
    <div>
        <button onClick={() => setStep('review')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"><ArrowLeftIcon className="h-5 w-5" /><span>Back</span></button>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Step 3: New Issue Details</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">At: {location?.fullAddress}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="type" className="block text-sm font-medium">Type of Issue</label><select id="type" value={type} onChange={(e) => setType(e.target.value as ComplaintType)} className="mt-1 block w-full input-field" required>{Object.values(ComplaintType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label htmlFor="impact" className="block text-sm font-medium">Potential Impact</label><select id="impact" value={impact} onChange={(e) => setImpact(e.target.value as Impact)} className="mt-1 block w-full input-field" required>{Object.values(Impact).map(i => <option key={i} value={i}>{i}</option>)}</select></div>
            </div>
            <div><label htmlFor="title" className="block text-sm font-medium">Title</label><input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full input-field" placeholder="e.g., Deep Pothole on Elm Street" required /></div>
            <div><label htmlFor="description" className="block text-sm font-medium">Description</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full input-field" placeholder="Provide details about the issue." required></textarea></div>
            <div>
                 <div className="p-3 mb-2 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md flex items-start space-x-2"><InformationCircleIcon className="h-5 w-5 flex-shrink-0" /> <p className="text-xs">Please upload a clear, original photo of the issue. Our AI will verify the image to ensure it matches the issue type for faster processing.</p></div>
                <label className="block text-sm font-medium">Photo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md"><div className="space-y-1 text-center"><CameraIcon className="mx-auto h-12 w-12 text-gray-400"/><div className="flex text-sm text-gray-600 dark:text-gray-400"><label htmlFor="photo-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Upload a file</span><input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" required/></label></div><p className="text-xs text-gray-500 dark:text-gray-400">{photoName || 'PNG, JPG, GIF'}</p></div></div>
                {isVerifyingImage && <div className="text-center mt-2">Verifying image with AI...</div>}
                {imageVerificationStatus === 'success' && <div className="flex items-center space-x-2 mt-2 text-green-600"><CheckCircleIcon className="h-5 w-5"/><span>Image verified successfully!</span></div>}
                {imageVerificationStatus === 'failed' && <div className="flex items-center space-x-2 mt-2 text-red-600"><XCircleIcon className="h-5 w-5"/><span>Verification failed. Please upload a photo that clearly shows a {type}.</span></div>}
                {photo && <img src={photo} alt="Preview" className="mt-4 max-h-48 rounded-md mx-auto"/>}
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isVerifyingImage || imageVerificationStatus !== 'success'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">Submit Complaint</button>
        </form>
        <style jsx>{`
            .input-field {
                 background-color: #F9FAFB;
                 border: 1px solid #D1D5DB;
                 border-radius: 0.375rem;
                 padding: 0.5rem 0.75rem;
                 font-size: 0.875rem;
                 width: 100%;
            }
            .dark .input-field {
                background-color: #374151;
                border-color: #4B5563;
                color: #F9FAFB;
            }
        `}</style>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      {step === 'location' && renderLocationStep()}
      {step === 'review' && renderReviewStep()}
      {step === 'form' && renderFormStep()}
    </div>
  );
};

export default ComplaintForm;