import { FaTimes, FaPrint, FaMapMarkerAlt, FaClock, FaTicketAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { type Zone, type Ticket } from "../../services/api";
import { useState, useRef } from "react";



type TicketModalProps = {
  ticket: Ticket;
  zone: Zone | null;
  isOpen: boolean;
  onClose: () => void;
};


function GateAnimation({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-gray-800 to-gray-600 border-r-4 border-yellow-500"
        initial={{ x: 0 }}
        animate={{ x: isOpen ? "-100%" : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformOrigin: "left center" }}
      >
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-yellow-400 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-yellow-500"></div>
        <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-yellow-500"></div>
      </motion.div>

      
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-800 to-gray-600 border-l-4 border-yellow-500"
        initial={{ x: 0 }}
        animate={{ x: isOpen ? "100%" : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformOrigin: "right center" }}
      >
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-yellow-400 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-yellow-500"></div>
        <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-yellow-500"></div>
      </motion.div>

      
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-full bg-gradient-to-b from-yellow-300 via-yellow-200 to-transparent opacity-0"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ 
          opacity: isOpen ? 0.6 : 0, 
          scaleY: isOpen ? 1 : 0 
        }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </div>
  );
}

export default function TicketModal({ ticket, zone, isOpen, onClose }: TicketModalProps) {
  const [isShaking, setIsShaking] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handlePrint = () => {
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    
    const ticketContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Parking Ticket - ${ticket.id}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .ticket {
              max-width: 400px;
              margin: 0 auto;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .header {
              background: #f3f4f6;
              padding: 16px;
              text-align: center;
              border-bottom: 1px solid #e5e7eb;
            }
            .header h2 {
              margin: 0;
              font-size: 20px;
              font-weight: 600;
              color: #111827;
            }
            .content {
              padding: 24px;
            }
            .ticket-id {
              text-align: center;
              margin-bottom: 16px;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: #dbeafe;
              color: #1e40af;
              padding: 8px 12px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 500;
            }
            .ticket-type {
              text-align: center;
              margin-bottom: 16px;
            }
            .type-badge {
              display: inline-block;
              padding: 8px 12px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 500;
            }
            .visitor {
              background: #dcfce7;
              color: #166534;
            }
            .subscriber {
              background: #f3e8ff;
              color: #7c3aed;
            }
            .section {
              background: #f9fafb;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 16px;
            }
            .section h3 {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 14px;
            }
            .info-row:last-child {
              margin-bottom: 0;
            }
            .label {
              color: #6b7280;
            }
            .value {
              font-weight: 500;
              color: #111827;
            }
            .instructions {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
            }
            .instructions h3 {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: #92400e;
            }
            .instructions ul {
              margin: 0;
              padding-left: 16px;
              font-size: 14px;
              color: #b45309;
            }
            .instructions li {
              margin-bottom: 4px;
            }
            .instructions li:last-child {
              margin-bottom: 0;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .ticket { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h2>Parking Ticket</h2>
            </div>
            <div class="content">
              <div class="ticket-id">
                <div class="badge">🎫 ${ticket.id}</div>
              </div>
              
              <div class="ticket-type">
                <span class="type-badge ${ticket.type}">
                  ${ticket.type === "visitor" ? "Visitor" : "Subscriber"}
                </span>
              </div>
              
              ${zone ? `
                <div class="section">
                  <h3> Zone Information</h3>
                  <div class="info-row">
                    <span class="label">Zone:</span>
                    <span class="value">${zone.name}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Category:</span>
                    <span class="value">${zone.categoryId}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Rate:</span>
                    <span class="value">$${zone.rateNormal}/hr</span>
                  </div>
                </div>
              ` : ''}
              
              <div class="section">
                <h3> Check-in Details</h3>
                <div class="info-row">
                  <span class="label">Date & Time:</span>
                  <span class="value">${formatDateTime(ticket.checkinAt)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Gate:</span>
                  <span class="value">${ticket.gateId}</span>
                </div>
              </div>
              
              <div class="instructions">
                <h3>Important Instructions</h3>
                <ul>
                  <li>Keep this ticket safe</li>
                  <li>Present at exit for checkout</li>
                  <li>Do not lose this ticket</li>
                  ${ticket.type === "subscriber" ? '<li>Subscriber benefits apply</li>' : ''}
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(ticketContent);
    printWindow.document.close();
    
   
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
         
          <GateAnimation isOpen={isOpen} />
          
          <motion.div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-10"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              x: isShaking ? [-10, 10, -10, 10, -5, 5, 0] : 0
            }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.4, 
              ease: "easeOut",
              x: isShaking ? { duration: 0.5, ease: "easeInOut" } : undefined
            }}
          >
       
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Parking Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

    
        <div className="p-6 space-y-4">
       
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <FaTicketAlt className="w-4 h-4" />
              {ticket.id}
            </div>
          </div>

     
          <div className="text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              ticket.type === "visitor" 
                ? "bg-green-100 text-green-800" 
                : "bg-purple-100 text-purple-800"
            }`}>
              {ticket.type === "visitor" ? "Visitor" : "Subscriber"}
            </span>
          </div>

        
          {zone && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4" />
                Zone Information
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Zone:</span>
                  <span className="font-medium">{zone.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{zone.categoryId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">${zone.rateNormal}/hr</span>
                </div>
              </div>
            </div>
          )}

          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              Check-in Details
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{formatDateTime(ticket.checkinAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gate:</span>
                <span className="font-medium">{ticket.gateId}</span>
              </div>
            </div>
          </div>

         
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Important Instructions</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Keep this ticket safe</li>
              <li>• Present at exit for checkout</li>
              <li>• Do not lose this ticket</li>
              {ticket.type === "subscriber" && (
                <li>• Subscriber benefits apply</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPrint className="w-4 h-4" />
            Print Ticket
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
