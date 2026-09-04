import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';
import { DecimalMath } from '../utils/decimalMath';

export class StatementService {
  /**
   * Generates a branded SpendWise PDF statement stream for the requested user and date range.
   */
  static async generatePdfStatement(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PDFKit.PDFDocument> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalIncome = DecimalMath.add(totalIncome, tx.amount);
      } else {
        totalExpense = DecimalMath.add(totalExpense, tx.amount);
      }
    });

    const netSavings = DecimalMath.subtract(totalIncome, totalExpense);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // --- Header Section ---
    doc
      .rect(0, 0, doc.page.width, 90)
      .fill('#1E1611'); // Dark Espresso

    doc
      .fillColor('#E09A55') // Warm Copper
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SpendWise', 40, 25);

    doc
      .fillColor('#FBF8F3')
      .fontSize(10)
      .font('Helvetica')
      .text('Personal Finance & Spending Statement', 40, 52);

    doc
      .fillColor('#A39082')
      .fontSize(9)
      .text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 400, 32, { align: 'right' });

    // --- User & Period Meta ---
    doc.moveDown(3);
    doc
      .fillColor('#1E1611')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('ACCOUNT SUMMARY', 40, 110);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#4B3F35')
      .text(`Account Holder: ${user.firstName} ${user.lastName}`, 40, 128)
      .text(`Email: ${user.email}`, 40, 142)
      .text(`Base Currency: ${user.currency}`, 40, 156);

    const rangeText = startDate && endDate
      ? `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
      : 'All-Time Records';

    doc
      .text(`Statement Period: ${rangeText}`, 320, 128)
      .text(`Total Transactions: ${transactions.length}`, 320, 142);

    // --- Financial Metric Cards ---
    const cardY = 180;
    const cardWidth = 160;
    const cardHeight = 60;

    // Income Box
    doc.roundedRect(40, cardY, cardWidth, cardHeight, 6).fill('#F4EDE4');
    doc.fillColor('#16A34A').fontSize(9).font('Helvetica-Bold').text('TOTAL INFLOW', 50, cardY + 12);
    doc.fillColor('#1E1611').fontSize(14).text(`+${DecimalMath.formatMoney(totalIncome, user.currency)}`, 50, cardY + 28);

    // Expense Box
    doc.roundedRect(210, cardY, cardWidth, cardHeight, 6).fill('#F4EDE4');
    doc.fillColor('#DC2626').fontSize(9).font('Helvetica-Bold').text('TOTAL OUTFLOW', 220, cardY + 12);
    doc.fillColor('#1E1611').fontSize(14).text(`-${DecimalMath.formatMoney(totalExpense, user.currency)}`, 220, cardY + 28);

    // Net Savings Box
    doc.roundedRect(380, cardY, cardWidth, cardHeight, 6).fill('#F4EDE4');
    doc.fillColor(netSavings >= 0 ? '#C27B38' : '#DC2626').fontSize(9).font('Helvetica-Bold').text('NET SURPLUS / DEFICIT', 390, cardY + 12);
    doc.fillColor('#1E1611').fontSize(14).text(DecimalMath.formatMoney(netSavings, user.currency), 390, cardY + 28);

    // --- Transactions Table ---
    let tableY = 260;
    doc
      .fillColor('#1E1611')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('ITEMIZED TRANSACTION HISTORY', 40, tableY);

    tableY += 20;
    // Table Header
    doc.rect(40, tableY, 515, 20).fill('#2A1F18');
    doc
      .fillColor('#FBF8F3')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('DATE', 48, tableY + 6)
      .text('DESCRIPTION', 120, tableY + 6)
      .text('CATEGORY', 260, tableY + 6)
      .text('ACCOUNT', 360, tableY + 6)
      .text('AMOUNT', 460, tableY + 6, { align: 'right' });

    tableY += 20;
    let isOdd = false;

    for (const tx of transactions.slice(0, 100)) { // up to 100 items per pdf or page overflow
      if (tableY > doc.page.height - 60) {
        doc.addPage();
        tableY = 40;
        // Reprint header on new page
        doc.rect(40, tableY, 515, 20).fill('#2A1F18');
        doc
          .fillColor('#FBF8F3')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('DATE', 48, tableY + 6)
          .text('DESCRIPTION', 120, tableY + 6)
          .text('CATEGORY', 260, tableY + 6)
          .text('ACCOUNT', 360, tableY + 6)
          .text('AMOUNT', 460, tableY + 6, { align: 'right' });
        tableY += 20;
      }

      if (isOdd) {
        doc.rect(40, tableY, 515, 18).fill('#FAF6F0');
      }
      isOdd = !isOdd;

      const dateText = new Date(tx.date).toISOString().split('T')[0];
      const descText = tx.description.length > 28 ? tx.description.substring(0, 25) + '...' : tx.description;
      const catText = tx.category?.name || 'General';
      const accText = tx.account?.name || 'Main';
      const amountPrefix = tx.type === 'INCOME' ? '+' : '-';
      const amountColor = tx.type === 'INCOME' ? '#16A34A' : '#DC2626';

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4B3F35')
        .text(dateText, 48, tableY + 5)
        .text(descText, 120, tableY + 5)
        .text(catText, 260, tableY + 5)
        .text(accText, 360, tableY + 5);

      doc
        .fillColor(amountColor)
        .font('Helvetica-Bold')
        .text(`${amountPrefix}${DecimalMath.formatMoney(tx.amount, user.currency)}`, 460, tableY + 5, { align: 'right' });

      tableY += 18;
    }

    // --- Footer ---
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#8C7D73')
      .text('SpendWise Financial Platform — Verified Personal Ledger Statement', 40, doc.page.height - 30, {
        align: 'center',
      });

    return doc;
  }
}
