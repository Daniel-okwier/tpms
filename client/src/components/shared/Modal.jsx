import React, { useEffect } from 'react';
import ReactDOM from 'react-dom'; // <-- NEW: Import ReactDOM for Portals
import { X } from 'lucide-react';

/**
 * A reusable Modal component using React Portals for robust layering.
 * * @param {object} props
 * @param {string} props.title - The title to display in the modal header.
 * @param {function} props.onClose - Function to call when the modal should close.
 * @param {React.ReactNode} props.children - The content to be rendered inside the modal body.
 */
const Modal = ({ title, onClose, children }) => {
    // Senior-level UX: Allow closing with the Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);
    
    // Stop click events on the modal content from bubbling up to the background overlay
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    // Use a Portal to render the modal directly into the document body
    return ReactDOM.createPortal(
        // Modal Overlay (Handles closing when clicking outside)
        <div 
            // The z-50 is already good, but the Portal ensures it wins the stacking context
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" // <-- Added backdrop-blur for modern feel
            onClick={onClose} 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Modal Content */}
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 md:mx-0 transform transition-all duration-300 scale-100 opacity-100 overflow-hidden" // <-- Minor UI/UX improvements (rounded-xl, shadow-2xl)
                onClick={handleContentClick}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 id="modal-title" className="text-xl font-bold text-gray-800">
                        {title}
                    </h3>
                    <button
                        type="button"
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body 
    );
};

export default Modal;