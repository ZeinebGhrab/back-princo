import { Inject, Injectable } from '@nestjs/common';
import mongoose, { Model, Types } from 'mongoose';
import { PendingFiles } from './schemas/pending-files';

@Injectable()
export class PendingFilesService {
  constructor(
    @Inject('PENDING_FILES_MODEL')
    private readonly pendingFilesModel: Model<PendingFiles>,
  ) {}

  async getPendingFiles(user: string, skip: string, limit: string) {
    const pendingFilesCountByPrinter = await this.pendingFilesModel
      .aggregate([
        {
          $match: { user: new mongoose.Types.ObjectId(user), isPrinted: false },
        },
        {
          $lookup: {
            from: 'connectors',
            localField: 'connector',
            foreignField: '_id',
            as: 'connectorData',
          },
        },
        {
          $unwind: '$connectorData',
        },
        {
          $group: {
            _id: {
              printerName: '$connectorData.printerName',
              connectorId: '$connectorData._id',
            },
            connectorName: { $first: '$connectorData.connectorName' },
            count: { $sum: 1 },
            pendingFiles: { $push: { pdfBase64: '$pdfBase64', _id: '$_id' } },
          },
        },
        {
          $project: {
            _id: 0,
            printerName: '$_id.printerName',
            connectorId: '$_id.connectorId',
            connectorName: 1,
            count: 1,
            pendingFiles: 1,
          },
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
      ])
      .exec();

    return pendingFilesCountByPrinter;
  }

  async createPendingFiles(
    user: string,
    connector: Types.ObjectId,
    pdfBase64?: string,
  ): Promise<void> {
    if (!pdfBase64) return;

    await this.pendingFilesModel.create({
      user,
      connector,
      pdfBase64,
    });
  }

  async setIsPrinted(id: string) {
    const pendingFile = await this.pendingFilesModel.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { isPrinted: true },
      { new: true },
    );
    return pendingFile;
  }

  async deletePendingFiles() {
    await this.pendingFilesModel.deleteMany({ isPrinted: true }).exec();
  }
}
