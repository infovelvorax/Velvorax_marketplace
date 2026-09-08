const fs = require('fs');
const postPath = 'frontend/src/pages/listings/PostListing.jsx';
let code = fs.readFileSync(postPath, 'utf8');

if (!code.includes('listingsService')) {
  code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState } from 'react';\nimport { listingsService } from '../../services';\nimport { useNavigate } from 'react-router-dom';");
  code = code.replace(/import \{ Container, Button \} from '\.\.\/\.\.\/components';/, "import { Container, Button, useToast } from '../../components';");
  
  const stateLogic = `
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '',
    listingType: '',
    title: '',
    description: '',
    price: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.category || !formData.listingType)) {
      toast.showToast('Please select category and type', 'error');
      return;
    }
    if (step === 2 && (!formData.title || !formData.description || !formData.price)) {
      toast.showToast('Please fill all details', 'error');
      return;
    }
    if (step === 3 && !formData.location) {
      toast.showToast('Please provide a location', 'error');
      return;
    }
    setStep(s => Math.min(s + 1, totalSteps));
  };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await listingsService.createListing(formData);
      toast.showToast('Listing published successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast.showToast('Failed to publish listing', 'error');
    }
    setLoading(false);
  };
  `;
  
  code = code.replace(/const \[step.*?handlePrev.*?;/s, stateLogic);
  
  // Replace inputs with state-bound inputs
  code = code.replace(/<select className="(.*?)"/g, `<select name="category" value={formData.category} onChange={handleChange} className="$1"`);
  code = code.replace(/<input type="radio" name="listing_type"/g, `<input type="radio" name="listingType" onChange={handleChange} checked={formData.listingType === "SELL"}`);
  
  // Step 2 Title
  code = code.replace(/<input type="text" className="(.*?)" placeholder="e.g. iPhone 15 Pro Max 256GB" \/>/, `<input type="text" name="title" value={formData.title} onChange={handleChange} className="$1" placeholder="e.g. iPhone 15 Pro Max 256GB" />`);
  // Step 2 Description
  code = code.replace(/<textarea rows="4" className="(.*?)" placeholder="Describe your item..."><\/textarea>/, `<textarea rows="4" name="description" value={formData.description} onChange={handleChange} className="$1" placeholder="Describe your item..."></textarea>`);
  // Step 2 Price
  code = code.replace(/<input type="number" className="(.*?)" placeholder="0.00" \/>/, `<input type="number" name="price" value={formData.price} onChange={handleChange} className="$1" placeholder="0.00" />`);
  // Step 3 Location
  code = code.replace(/<input type="text" className="(.*?)" placeholder="City, Area, or Pincode" \/>/, `<input type="text" name="location" value={formData.location} onChange={handleChange} className="$1" placeholder="City, Area, or Pincode" />`);

  // Step 4 Publish button
  code = code.replace(/<Button variant="primary" className="bg-green-500 text-black border-none hover:bg-green-400">.*?<\/Button>/s, `<Button variant="primary" disabled={loading} className="bg-green-500 text-black border-none hover:bg-green-400" onClick={handleSubmit}>{loading ? 'Publishing...' : 'Publish Listing'}</Button>`);

  fs.writeFileSync(postPath, code);
  console.log('PostListing.jsx updated');
} else {
  console.log('Already updated');
}
