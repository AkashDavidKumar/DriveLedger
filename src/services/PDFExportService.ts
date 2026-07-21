import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/currency';
import { ReportService } from './ReportService';

export class PDFExportService {
  private static getStyles() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @page { margin: 20px; }
        
        body { 
          font-family: 'Inter', sans-serif; 
          color: #1e293b;
          margin: 0;
          padding: 20px;
          -webkit-print-color-adjust: exact;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
        }

        .header h1 {
          color: #0f172a;
          margin: 0 0 5px 0;
          font-size: 28px;
        }

        .header p {
          color: #64748b;
          margin: 0;
          font-size: 14px;
        }

        .summary-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
        }

        .summary-card {
          flex: 1;
          min-width: 150px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }

        .summary-card h3 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-card p {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }
        
        .summary-card.highlight { background: #ecfdf5; border-color: #a7f3d0; }
        .summary-card.highlight p { color: #059669; }

        .summary-card.warning { background: #fffbeb; border-color: #fde68a; }
        .summary-card.warning p { color: #d97706; }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 30px 0 15px 0;
          padding-bottom: 5px;
          border-bottom: 1px solid #e2e8f0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 12px;
        }

        th {
          background-color: #f1f5f9;
          color: #475569;
          font-weight: 600;
          text-align: left;
          padding: 10px;
          border-bottom: 2px solid #cbd5e1;
        }

        td {
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        tr:nth-child(even) { background-color: #f8fafc; }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 50px 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px dashed #cbd5e1;
          color: #64748b;
        }
      </style>
    `;
  }

  private static buildHeader(title: string, dateRangeText: string) {
    return `
      <div class="header">
        <h1>DriveLedger</h1>
        <p style="font-weight: 600; font-size: 16px; margin: 10px 0;">${title}</p>
        <p>${dateRangeText}</p>
        <p style="margin-top: 5px; font-size: 12px;">Generated on ${dayjs().format('MMM D, YYYY h:mm A')}</p>
      </div>
    `;
  }

  private static buildSummaryCards(summary: any) {
    return `
      <div class="summary-grid">
        <div class="summary-card">
          <h3>Total Days</h3>
          <p>${summary.totalDays}</p>
        </div>
        <div class="summary-card">
          <h3>Total Trips</h3>
          <p>${summary.totalTrips}</p>
        </div>
        <div class="summary-card">
          <h3>Total Hours</h3>
          <p>${summary.totalHours}</p>
        </div>
        <div class="summary-card highlight">
          <h3>Expected</h3>
          <p>${formatCurrency(summary.totalExpected || 0)}</p>
        </div>
        <div class="summary-card highlight">
          <h3>Received</h3>
          <p>${formatCurrency(summary.totalReceived || 0)}</p>
        </div>
        <div class="summary-card warning">
          <h3>Pending</h3>
          <p>${formatCurrency(summary.totalPending || 0)}</p>
        </div>
      </div>
    `;
  }

  private static buildBreakdownTables(ownerUsage: any[], vehicleUsage: any[]) {
    let html = '';

    if (ownerUsage.length > 0) {
      html += `
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <h2 class="section-title">Owner Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Owner</th>
                  <th class="text-right">Hours</th>
                  <th class="text-right">Earnings</th>
                </tr>
              </thead>
              <tbody>
                ${ownerUsage.map(o => `
                  <tr>
                    <td>${o.ownerName}</td>
                    <td class="text-right">${o.hours || 0}</td>
                    <td class="text-right">${formatCurrency(o.earnings || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
      `;
    }

    if (vehicleUsage.length > 0) {
      html += `
          <div style="flex: 1;">
            <h2 class="section-title">Vehicle Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th class="text-right">Hours</th>
                  <th class="text-right">Earnings</th>
                </tr>
              </thead>
              <tbody>
                ${vehicleUsage.map(v => `
                  <tr>
                    <td>${v.vehicleName}</td>
                    <td class="text-right">${v.hours || 0}</td>
                    <td class="text-right">${formatCurrency(v.earnings || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return html;
  }

  private static buildDetailedTable(records: any[]) {
    if (records.length === 0) return '';
    
    return `
      <h2 class="section-title">Detailed Work Records</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Owner</th>
            <th>Vehicle</th>
            <th>Type</th>
            <th class="text-center">Trips</th>
            <th class="text-center">Hours</th>
            <th class="text-right">Expected</th>
            <th class="text-right">Received</th>
            <th class="text-right">Pending</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr>
              <td>${dayjs(r.date).format('MMM D')}</td>
              <td>${r.ownerName}</td>
              <td>${r.vehicleName}</td>
              <td>${r.paymentType.replace('_', ' ')}</td>
              <td class="text-center">${r.tripCount || 0}</td>
              <td class="text-center">${r.hours || 0}</td>
              <td class="text-right">${formatCurrency(r.expectedSalary || 0)}</td>
              <td class="text-right" style="color: #059669">${formatCurrency(r.receivedSalary || 0)}</td>
              <td class="text-right" style="color: #d97706">${formatCurrency(r.pendingSalary || 0)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private static buildFooter(recordCount: number) {
    return `
      <div class="footer">
        <p>Total Records: ${recordCount} • Generated Offline by DriveLedger v1.0.0</p>
      </div>
    `;
  }

  /**
   * Generates and shares a PDF Report
   */
  static async exportReport(title: string, filters: any = {}, includeBreakdowns = false) {
    try {
      // 1. Fetch structured models
      const summary = await ReportService.getSummaryMetrics(filters);
      const records = await ReportService.getDetailedRecords(filters);
      
      let breakdownsHtml = '';
      if (includeBreakdowns) {
        const ownerUsage = await ReportService.getOwnerUsage(filters);
        const vehicleUsage = await ReportService.getVehicleUsage(filters);
        breakdownsHtml = this.buildBreakdownTables(ownerUsage, vehicleUsage);
      }

      let dateRangeText = 'All Time';
      if (filters.dateFrom && filters.dateTo) {
        dateRangeText = `${dayjs(filters.dateFrom).format('MMM D, YYYY')} - ${dayjs(filters.dateTo).format('MMM D, YYYY')}`;
      } else if (filters.dateFrom) {
        dateRangeText = `Since ${dayjs(filters.dateFrom).format('MMM D, YYYY')}`;
      } else if (filters.dateTo) {
        dateRangeText = `Until ${dayjs(filters.dateTo).format('MMM D, YYYY')}`;
      }

      // 2. Compose HTML
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          ${this.getStyles()}
        </head>
        <body>
          ${this.buildHeader(title, dateRangeText)}
      `;

      if (records.length === 0) {
        htmlContent += `
          <div class="empty-state">
            <h2>No Work Records Found</h2>
            <p>There is no data available for the selected filters and date range.</p>
          </div>
        `;
      } else {
        htmlContent += `
          ${this.buildSummaryCards(summary)}
          ${breakdownsHtml}
          ${this.buildDetailedTable(records)}
        `;
      }

      htmlContent += `
          ${this.buildFooter(records.length)}
        </body>
        </html>
      `;

      // 3. Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share ${title}`,
        });
      }

      return true;
    } catch (error) {
      console.error('PDF Export Error:', error);
      throw error;
    }
  }
}
