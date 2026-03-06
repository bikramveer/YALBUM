import { useState, useEffect } from "react";
import { InfoIcon, X } from "lucide-react";
import './FloatingInfo.css';

function FloatingInfo() {
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const toggleInfoPopup = () => {
    setShowInfoPopup(!showInfoPopup);
  };

  const closeInfoPopup = () => {
    setShowInfoPopup(false);
  };

  useEffect(() => {
    if (showInfoPopup) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.floating-info-container')) {
          closeInfoPopup();
        }
      };

      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showInfoPopup]);

  return (
    <div className='floating-info-container'>
        <button
            className="floating-info-button"
            onClick={toggleInfoPopup}
            aria-label="Demo Information"
        >
            <InfoIcon size={24} />
        </button>

        {showInfoPopup && (
            <div className='floating-info-popup'>
                <button
                    type="button"
                    className='floating-info-close'
                    onClick={closeInfoPopup}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
                <h3 className="floating-info-title">Use the site as a demo user!</h3>
                <p className="floating-info-text">
                    If you'd like to see what YALBUM can offer without creating an account, feel free to visit the <a href="https://github.com/bikramveer/yalbum-README" target="_blank" rel="noreferrer"><span style={{ color: 'blue', textDecoration: 'underline'}}>README</span></a> page and use the demo user login and password to poke around!
                </p>
                <p className="floating-info-tip">
                    Note: The demo user is meant to act as a read-only account, and therefore has limited functionality. Please make an account to access all the features.
                </p>
            </div>
        )}
    </div>
  );
}

export default FloatingInfo;