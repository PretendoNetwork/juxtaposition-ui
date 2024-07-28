import { Schema, model } from 'mongoose';
import type { HydratedReportDocument, IReport, IReportMethods, ReportModel } from '@/types/mongoose/report';

export const ReportSchema = new Schema<IReport, ReportModel, IReportMethods>({
	pid: Number,
	reported_by: Number,
	post_id: String,
	reason: Number,
	message: String,
	created_at: {
		type: Date,
		default: new Date()
	},
	resolved: {
		type: Boolean,
		default: false
	},
	note: String,
	resolved_by: Number,
	resolved_at: Date,
});

ReportSchema.method<HydratedReportDocument>('resolve', async function(pid, note) {
	this.set('resolved', true);
	this.set('resolved_by', pid);
	this.set('resolved_at', new Date());
	this.set('note', note);
	await this.save();
});

export const REPORT = model('REPORT', ReportSchema);