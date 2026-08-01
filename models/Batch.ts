import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  shift: 'Day' | 'Evening';
  roomNo: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true, trim: true },
    shift: { type: String, enum: ['Day', 'Evening'], required: true },
    roomNo: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// Composite unique key for name + shift
BatchSchema.index({ name: 1, shift: 1 }, { unique: true });

const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);
export default Batch;
