import React from 'react';
import { Link } from 'react-router-dom';
import { formatListingPrice } from '../../utils/formatters';

/**
 * Compact Marketplace Search Result Card for Buyer AI Chat
 * 
 * @param {Object} props
 * @param {Object} props.item - Listing object
 * @param {function} [props.onSelect] - Optional click handler
 * @param {function} [props.onSave] - Optional save/favorite handler
 */
export const BuyerAIResultCard = ({ item, onSelect, onSave }) => {
  if (!item) return null;

  const listingId = item.id || item._id;
  const targetUrl = item.url || (item.categorySlug === 'properties' ? `/properties/${listingId}` : `/listing/${listingId}`);
  const city = item.location?.city || '';
  const region = item.location?.region || '';
  const locationText = city ? (region ? `${city}, ${region}` : city) : 'India';
  const formattedPrice = formatListingPrice(item.price, item.currency || 'INR', null, { listingType: item.listingType });

  // Dynamic details highlight
  const detailsList = [];
  if (item.details?.bedrooms) detailsList.push(item.details.bedrooms);
  if (item.details?.propertyType) detailsList.push(item.details.propertyType);
  if (item.details?.vehicleType) detailsList.push(item.details.vehicleType === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler');
  if (item.details?.brand) detailsList.push(item.details.brand);
  if (item.details?.year) detailsList.push(item.details.year);
  if (item.details?.jobType) detailsList.push(item.details.jobType.replace('_', ' '));
  if (item.details?.serviceType) detailsList.push(item.details.serviceType.replace('_', ' '));

  return (
    <div className="buyer-listing-card">
      {/* Listing Image or Themed Placeholder */}
      {item.image ? (
        <div className="buyer-listing-img-box">
          <img
            src={item.image}
            alt={item.title || 'Marketplace listing'}
            className="buyer-listing-img"
            loading="lazy"
          />
          {item.condition && (
            <span className="buyer-condition-tag">{item.condition}</span>
          )}
        </div>
      ) : (
        <div className="buyer-listing-img-placeholder">
          <span className="placeholder-category">{item.categoryName || 'Marketplace'}</span>
          {item.condition && (
            <span className="buyer-condition-tag">{item.condition}</span>
          )}
        </div>
      )}

      {/* Listing Details */}
      <div className="buyer-listing-content">
        <h5 className="buyer-listing-title" title={item.title}>
          {item.title}
        </h5>

        <div className="buyer-listing-price">{formattedPrice}</div>

        <div className="buyer-listing-location" title={locationText}>
          📍 {locationText}
        </div>

        {detailsList.length > 0 && (
          <div className="buyer-listing-badges-row">
            {detailsList.slice(0, 2).map((d, i) => (
              <span key={i} className="buyer-listing-badge">{d}</span>
            ))}
          </div>
        )}

        {item.seller && (
          <div className="buyer-listing-seller">
            <span className="seller-name">{item.seller.name}</span>
            {item.seller.verified && (
              <span className="buyer-verified-badge" title="Verified Seller">✓ Verified</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="buyer-listing-actions">
          <Link
            to={targetUrl}
            className="buyer-listing-link"
            onClick={onSelect}
          >
            View Listing →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerAIResultCard;
