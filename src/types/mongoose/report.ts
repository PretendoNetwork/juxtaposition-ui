import { Model, HydratedDocument } from 'mongoose';

export interface IReport {
    pid: number;
    reported_by: number;
    post_id: string;
    reason: number;
    message: string;
    created_at: Date;
    resolved: boolean;
    note: string;
    resolved_by: number;
    resolved_at: Date;
}

export interface IReportMethods {
    resolve(pid: number, note: string): Promise<void>;
}

export type ReportModel = Model<IReport, object, IReportMethods>;

export type HydratedReportDocument = HydratedDocument<IReport, IReportMethods>;