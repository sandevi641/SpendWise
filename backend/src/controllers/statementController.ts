import { Response } from 'express';
import { StatementService } from '../services/statementService';
import { AuthenticatedRequest } from '../types';

export class StatementController {
  static async exportPdf(req: AuthenticatedRequest, res: Response) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const doc = await StatementService.generatePdfStatement(req.user!.id, startDate, endDate);

      const filename = `SpendWise_Statement_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);
      doc.end();
    } catch (error: any) {
      console.error('PDF export error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to generate PDF statement' });
    }
  }
}
