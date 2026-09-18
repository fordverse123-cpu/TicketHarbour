import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Generate PDF Ticket with Embedded QR Code
 * @param {Object} booking Document with listing, schedule, user details
 * @returns {Promise<Buffer>} PDF Buffer
 */
export const generatePDFTicket = async (booking) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // 1. Generate QR Code Base64
      const qrData = booking.qrCodeData || `TICKETHARBOR:${booking.bookingReference}:${booking._id}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 160,
        color: {
          dark: '#0d9488',
          light: '#ffffff',
        },
      });

      // 2. Ticket Brand Header
      doc.rect(0, 0, doc.page.width, 100).fill('#0f172a');
      
      doc
        .fillColor('#14b8a6')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('TicketHarbor', 40, 30);

      doc
        .fillColor('#94a3b8')
        .fontSize(12)
        .font('Helvetica')
        .text('E-Ticket & Entry Pass', 40, 65);

      doc
        .fillColor('#ffffff')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Ref: ${booking.bookingReference}`, doc.page.width - 220, 40, { align: 'right' });

      // 3. Main Ticket Body Box
      const listingTitle = booking.listing?.title || 'TicketHarbor Booking';
      const categoryType = (booking.categoryType || 'booking').toUpperCase();
      const userName = booking.user?.name || 'Valued Guest';
      const userEmail = booking.user?.email || '';

      doc.moveDown(4);

      // Section Card
      doc
        .roundedRect(40, 120, doc.page.width - 80, 420, 12)
        .lineWidth(1)
        .strokeColor('#cbd5e1')
        .stroke();

      // Listing Info
      doc
        .fillColor('#0d9488')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`CATEGORY: ${categoryType}`, 60, 140);

      doc
        .fillColor('#0f172a')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(listingTitle, 60, 160, { width: 320 });

      // Event / Schedule Details
      const scheduleDate = booking.schedule?.date
        ? new Date(booking.schedule.date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Confirmed Date';

      const startTime = booking.schedule?.startTime || 'Scheduled Time';

      doc
        .fillColor('#475569')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Date & Time:', 60, 220);

      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .font('Helvetica')
        .text(`${scheduleDate} at ${startTime}`, 160, 220);

      // Venue / Transit info
      let locationText = booking.listing?.location?.city || 'TicketHarbor Partner Location';
      if (booking.listing?.venue?.name) {
        locationText = `${booking.listing.venue.name}, ${booking.listing.venue.city}`;
      } else if (booking.listing?.transitInfo?.source && booking.listing?.transitInfo?.destination) {
        locationText = `${booking.listing.transitInfo.source} → ${booking.listing.transitInfo.destination}`;
      }

      doc
        .fillColor('#475569')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Location / Route:', 60, 245);

      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .font('Helvetica')
        .text(locationText, 160, 245, { width: 220 });

      // Guest Details
      doc
        .fillColor('#475569')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Passenger / Guest:', 60, 285);

      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .font('Helvetica')
        .text(`${userName} (${userEmail})`, 160, 285);

      // Seats & Tier Info
      const seatsText = booking.seats && booking.seats.length > 0
        ? booking.seats.map((s) => `${s.seatId} (${s.tierName})`).join(', ')
        : `${booking.quantity} Ticket(s)`;

      doc
        .fillColor('#475569')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Seats / Tier:', 60, 310);

      doc
        .fillColor('#0d9488')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(seatsText, 160, 310, { width: 220 });

      // Pricing Breakdown
      doc
        .fillColor('#475569')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total Amount Paid:', 60, 350);

      doc
        .fillColor('#0f172a')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`₹${booking.totalAmount}`, 180, 348);

      doc
        .fillColor('#16a34a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('✓ PAYMENT CONFIRMED', 60, 380);

      // Embed QR Code Image
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      doc.image(qrBuffer, doc.page.width - 200, 140, { width: 140 });

      doc
        .fillColor('#64748b')
        .fontSize(9)
        .font('Helvetica')
        .text('Scan QR code at entry gate', doc.page.width - 200, 290, { width: 140, align: 'center' });

      // Instructions Footer
      doc
        .fillColor('#64748b')
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text(
          'Please present this PDF ticket or QR code on your mobile device at the venue/boarding gate. Ticket is non-transferable.',
          60,
          450,
          { width: doc.page.width - 120, align: 'center' }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
