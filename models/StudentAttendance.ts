import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentAttendance extends Document {
  student: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  date: Date;
  status: 'Present' | 'Absent' | 'Late';
  createdAt: Date;
  updatedAt: Date;
}

const StudentAttendanceSchema = new Schema<IStudentAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
  },
  { timestamps: true }
);

// Index to avoid duplicate attendance entry for same student, batch, and date
StudentAttendanceSchema.index({ student: 1, batch: 1, date: 1 }, { unique: true });

const StudentAttendance =
  mongoose.models.StudentAttendance ||
  mongoose.model<IStudentAttendance>('StudentAttendance', StudentAttendanceSchema);

export default StudentAttendance;
