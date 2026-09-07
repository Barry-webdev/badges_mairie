import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'RESPONSABLE_GARDE';

export interface IAdminDocument extends Document {
  nom: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'L\'email est obligatoire'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'RESPONSABLE_GARDE'],
      default: 'RESPONSABLE_GARDE',
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ne jamais retourner le hash du mot de passe
AdminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// Vérification du mot de passe
AdminSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const Admin = mongoose.model<IAdminDocument>('Admin', AdminSchema);
