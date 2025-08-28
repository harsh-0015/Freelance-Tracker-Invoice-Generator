// components/InvoicePDFGenerator.js
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoicePDFGenerator = ({ invoice }) => {
  const invoiceRef = useRef();

  const handleDownload = async () => {
    try {
      const element = invoiceRef.current;
      
      // Make element capturable but keep it invisible to user
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '-9999px';
      element.style.visibility = 'hidden';
      element.style.display = 'block';
      element.style.backgroundColor = '#ffffff';

      // Wait a moment for styles to apply
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: function(element) {
          return false;
        }
      });

      // Hide element again
      element.style.display = 'none';
      element.style.position = 'static';
      element.style.visibility = 'visible';
      element.style.top = 'auto';
      element.style.left = 'auto';

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
      
      const scaledWidth = imgWidth * 0.264583 * ratio;
      const scaledHeight = imgHeight * 0.264583 * ratio;
      
      const x = (pdfWidth - scaledWidth) / 2;
      const y = 10;

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      pdf.save(`Invoice_${invoice._id || Date.now()}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div>
      <button 
        onClick={handleDownload} 
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
      >
        📄 Download PDF
      </button>

      {/* Invoice template - initially hidden */}
      <div 
        ref={invoiceRef} 
        style={{ 
          display: 'none',
          width: '800px',
          minHeight: '1000px',
          padding: '40px',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#000000',
          border: '1px solid #000'
        }}
      >
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          borderBottom: '3px solid #2563eb',
          paddingBottom: '20px'
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            margin: '0',
            color: '#2563eb',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>
            INVOICE
          </h1>
        </div>
        
        {/* Invoice Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          <div>
            <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#000' }}>
              Invoice #: {invoice._id?.slice(-8) || Math.random().toString(36).substr(2, 8)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#000' }}>
              Date: {new Date(invoice.generatedAt || invoice.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* From/To Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '40px'
        }}>
          <div style={{ width: '45%' }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#2563eb',
              fontSize: '18px',
              fontWeight: 'bold',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '5px'
            }}>
              FROM
            </h3>
            <div style={{ 
              backgroundColor: '#f8fafc',
              padding: '15px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{ 
                margin: '0', 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#000'
              }}>
                {invoice.freelancerName || invoice.freelancerId || 'Freelancer Name'}
              </p>
            </div>
          </div>

          <div style={{ width: '45%' }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#2563eb',
              fontSize: '18px',
              fontWeight: 'bold',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '5px'
            }}>
              TO
            </h3>
            <div style={{ 
              backgroundColor: '#f8fafc',
              padding: '15px',
              borderLeft: '4px solid #2563eb'
            }}>
              <p style={{ 
                margin: '0', 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#000'
              }}>
                {invoice.clientName || 'Client Name'}
              </p>
            </div>
          </div>
        </div>

        {/* Project Details Table */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#2563eb',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            PROJECT DETAILS
          </h3>
          
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '2px solid #2563eb',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                <th style={{ 
                  padding: '15px', 
                  textAlign: 'left',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Description
                </th>
                <th style={{ 
                  padding: '15px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Hours
                </th>
                <th style={{ 
                  padding: '15px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Rate/Hour
                </th>
                <th style={{ 
                  padding: '15px', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: '#ffffff' }}>
                <td style={{ 
                  padding: '15px', 
                  border: '1px solid #d1d5db',
                  color: '#000',
                  fontWeight: 'bold'
                }}>
                  {invoice.project || 'Project Work'}
                </td>
                <td style={{ 
                  padding: '15px', 
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                  color: '#000',
                  fontWeight: 'bold'
                }}>
                  {invoice.totalHours || invoice.hoursWorked || '0'}
                </td>
                <td style={{ 
                  padding: '15px', 
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                  color: '#000',
                  fontWeight: 'bold'
                }}>
                  ₹{invoice.ratePerHour || invoice.hourlyRate || '0'}
                </td>
                <td style={{ 
                  padding: '15px', 
                  border: '1px solid #d1d5db',
                  textAlign: 'right',
                  color: '#000',
                  fontWeight: 'bold'
                }}>
                  ₹{invoice.totalAmount || '0'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div style={{ 
          textAlign: 'right', 
          marginBottom: '40px'
        }}>
          <div style={{ 
            display: 'inline-block',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '20px 30px',
            fontSize: '24px',
            fontWeight: 'bold',
            borderRadius: '5px'
          }}>
            TOTAL: ₹{invoice.totalAmount || '0'}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '2px solid #e5e7eb',
          paddingTop: '20px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p style={{ margin: '0', fontStyle: 'italic' }}>
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDFGenerator;